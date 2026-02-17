import { config as loadEnv } from 'dotenv'
import fs from 'node:fs/promises'
import dns from 'node:dns'
import path from 'node:path'
import process from 'node:process'
import { nanoid } from 'nanoid'
import { chromium } from 'playwright'
import { Pool } from 'pg'

loadEnv({ path: '.env.umc' })
loadEnv({ path: '.env.server' })
loadEnv()
dns.setServers(['8.8.8.8', '1.1.1.1'])

const resolver = new dns.Resolver()
resolver.setServers(['8.8.8.8', '1.1.1.1'])

function dnsLookup(hostname, _options, callback) {
  resolver.resolve4(hostname, (err4, addresses4) => {
    if (!err4 && addresses4.length) {
      callback(null, addresses4[0], 4)
      return
    }
    resolver.resolve6(hostname, (err6, addresses6) => {
      if (!err6 && addresses6.length) {
        callback(null, addresses6[0], 6)
        return
      }
      callback(err4 || err6 || new Error(`Unable to resolve host: ${hostname}`))
    })
  })
}

function required(name) {
  const value = process.env[name]
  if (!value || !value.trim()) throw new Error(`Missing required env var: ${name}`)
  return value.trim()
}

function optionalInt(name, fallback) {
  const value = process.env[name]
  if (!value) return fallback
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function textByIndex(cells, index) {
  if (index < 0 || index >= cells.length) return ''
  return cells[index]
}

function toIsoDate(input) {
  if (!input) return ''
  const match = input.match(/(\d{4})[-/](\d{2})[-/](\d{2})/)
  if (match) return `${match[1]}-${match[2]}-${match[3]}`

  const matchDmy = input.match(/(\d{1,2})-([A-Za-z]{3})-(\d{4})/)
  if (!matchDmy) return ''
  const months = {
    Jan: '01',
    Feb: '02',
    Mar: '03',
    Apr: '04',
    May: '05',
    Jun: '06',
    Jul: '07',
    Aug: '08',
    Sep: '09',
    Oct: '10',
    Nov: '11',
    Dec: '12',
  }
  const month = months[matchDmy[2]]
  if (!month) return ''
  return `${matchDmy[3]}-${month}-${String(matchDmy[1]).padStart(2, '0')}`
}

async function run() {
  const portalUrl = required('UMC_PORTAL_URL')
  const phone = required('UMC_PHONE')
  const password = required('UMC_PASSWORD')
  const phoneSelector = required('UMC_PHONE_SELECTOR')
  const passwordSelector = required('UMC_PASSWORD_SELECTOR')
  const submitSelector = required('UMC_SUBMIT_SELECTOR')
  const complaintsPageUrl = process.env.UMC_COMPLAINTS_URL?.trim() || portalUrl
  const rowSelector = process.env.UMC_ROW_SELECTOR?.trim() || 'table tbody tr'
  const outputFile = process.env.UMC_OUTPUT_FILE?.trim() || 'public/data/umc-complaints.json'

  const complaintIdCol = optionalInt('UMC_COL_COMPLAINT_ID', 0)
  const complaintNameCol = optionalInt('UMC_COL_COMPLAINT_NAME', 1)
  const dateCol = optionalInt('UMC_COL_DATE_LODGED', 2)
  const statusCol = optionalInt('UMC_COL_STATUS', 3)
  const deptCol = optionalInt('UMC_COL_DEPARTMENT', 4)
  const descriptionCol = optionalInt('UMC_COL_DESCRIPTION', 5)
  const dueDateCol = optionalInt('UMC_COL_DUE_DATE', 6)

  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    await page.goto(portalUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await page.fill(phoneSelector, phone)
    await page.fill(passwordSelector, password)
    await page.click(submitSelector)
    await page.waitForLoadState('networkidle')

    if (complaintsPageUrl !== portalUrl) {
      await page.goto(complaintsPageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 })
      await page.waitForLoadState('networkidle')
    }

    let rows = []
    try {
      await page.waitForSelector(rowSelector, { timeout: 15000 })
      rows = await page.$$eval(rowSelector, (elements) =>
      elements.map((row) => {
        const cols = Array.from(row.querySelectorAll('td,th')).map((cell) =>
          (cell.textContent || '').replace(/\s+/g, ' ').trim(),
        )
        return cols
      }),
      )
    } catch {}

    let complaints = rows
    .map((cols) => {
      const complaintId = textByIndex(cols, complaintIdCol)
      if (!complaintId) return null
      const dateLodgedRaw = textByIndex(cols, dateCol)
      const dueDateRaw = textByIndex(cols, dueDateCol)

      return {
        complaintId,
        complaintName: textByIndex(cols, complaintNameCol) || textByIndex(cols, descriptionCol) || complaintId,
        description: textByIndex(cols, descriptionCol),
        dateLodged: toIsoDate(dateLodgedRaw),
        status: textByIndex(cols, statusCol),
        department: textByIndex(cols, deptCol),
        expectedResponseDate: toIsoDate(dueDateRaw),
        notes: 'Ulhasnagar',
      }
    })
    .filter(Boolean)

    if (complaints.length === 0) {
      const cards = await page.$$eval('a[href*="/complaints/details/"]', (links) =>
        links.map((link) => {
          let node = link
          let best = ''
          for (let i = 0; i < 6 && node; i += 1) {
            const text = (node.textContent || '').replace(/\s+/g, ' ').trim()
            if (text.includes('#UMC') && text.length > best.length) best = text
            node = node.parentElement
          }
          return {
            href: link.getAttribute('href') || '',
            text: best || (link.parentElement?.textContent || '').replace(/\s+/g, ' ').trim(),
          }
        }),
      )

      complaints = cards
        .map((card) => {
          const text = card.text || ''
          const idMatch = text.match(/#\s*(UMC\d+)/i) || text.match(/#\s*([A-Za-z]+[0-9]{3,})/i)
          if (!idMatch) return null

          const dateMatch = text.match(/Date:\s*([0-9]{1,2}-[A-Za-z]{3}-[0-9]{4})/i)
          const deptMatch = text.match(/Department:\s*(.+?)(?:Category:|Date:|$)/i)

          const afterId = text.split(idMatch[0])[1] || ''
          const statusMatch = afterId.match(
            /^\s*(Pending|Rejected|Resolved|Closed|Submitted|In Progress|Assigned|Transfered|Filed)/i,
          )
          const beforeDept = afterId.split(/Department:/i)[0] || ''
          const description = beforeDept
            .replace(
              /^\s*(Pending|Rejected|Resolved|Closed|Submitted|In Progress|Assigned|Transfered|Filed)/i,
              '',
            )
            .trim()

          return {
            complaintId: idMatch[1],
            complaintName: description || idMatch[1],
            description,
            dateLodged: toIsoDate(dateMatch?.[1] || ''),
            status: statusMatch?.[1] || 'Pending',
            department: (deptMatch?.[1] || '').trim(),
            expectedResponseDate: '',
            notes: 'Ulhasnagar',
          }
        })
        .filter(Boolean)
    }

    const payload = {
      syncedAt: new Date().toISOString(),
      complaints,
    }

    const connectionString = process.env.DATABASE_URL
    if (connectionString) {
      const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        lookup: dnsLookup,
      })
      try {
        await pool.query(
          `
            create table if not exists complaints (
              id text primary key,
              complaint_id text not null,
              complaint_name text,
              portal_name text not null,
              category text not null,
              description text not null default '',
              date_lodged date not null,
              status text not null,
              department text not null default '',
              office_email text,
              office_phone text,
              expected_response_date date,
              documents jsonb not null default '[]'::jsonb,
              notes text not null default '',
              section_data jsonb,
              last_updated timestamptz not null,
              resolved_at timestamptz,
              created_at timestamptz not null default now(),
              unique (portal_name, complaint_id)
            );
          `,
        )

        for (const complaint of complaints) {
          const status = complaint.status || 'Pending'
          const now = new Date().toISOString()
          const resolvedAt = /resolved|closed/i.test(status) ? now : null
          await pool.query(
            `
              insert into complaints (
                id, complaint_id, complaint_name, portal_name, category, description, date_lodged, status,
                department, office_email, office_phone, expected_response_date, documents, notes, section_data,
                last_updated, resolved_at
              )
              values (
                $1, $2, $3, $4, $5, $6, $7::date, $8, $9, $10, $11, nullif($12, '')::date, $13::jsonb, $14, $15::jsonb, $16::timestamptz, $17::timestamptz
              )
              on conflict (portal_name, complaint_id)
              do update set
                complaint_name = excluded.complaint_name,
                category = excluded.category,
                description = excluded.description,
                date_lodged = excluded.date_lodged,
                status = excluded.status,
                department = excluded.department,
                office_email = excluded.office_email,
                office_phone = excluded.office_phone,
                expected_response_date = excluded.expected_response_date,
                notes = excluded.notes,
                section_data = excluded.section_data,
                last_updated = excluded.last_updated,
                resolved_at = excluded.resolved_at
            `,
            [
              nanoid(),
              complaint.complaintId,
              complaint.complaintName || complaint.complaintId,
              'Smart_UMC_Grievances',
              'Grievance',
              complaint.description || '',
              complaint.dateLodged || new Date().toISOString().slice(0, 10),
              status,
              complaint.department || '',
              '',
              '',
              complaint.expectedResponseDate || '',
              '[]',
              complaint.notes || 'Ulhasnagar',
              'null',
              now,
              resolvedAt,
            ],
          )
        }
      } finally {
        await pool.end()
      }
      console.log('Upserted UMC complaints to Neon database.')
    } else {
      console.log('DATABASE_URL not set. Skipped Neon DB upsert.')
    }

    const outputPath = path.resolve(outputFile)
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf8')

    console.log(`UMC sync complete. Complaints imported: ${complaints.length}`)
    console.log(`Output: ${outputPath}`)
  } finally {
    await browser.close()
  }
}

run().catch((error) => {
  console.error('UMC sync failed:', error.message)
  process.exitCode = 1
})
