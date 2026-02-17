import { config as loadEnv } from 'dotenv'
import fs from 'node:fs/promises'
import dns from 'node:dns'
import path from 'node:path'
import process from 'node:process'
import { nanoid } from 'nanoid'
import { Pool } from 'pg'

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

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('Missing DATABASE_URL in .env.server')
}

const inputArg = process.argv[2]
if (!inputArg) {
  throw new Error('Usage: npm run import:complaints -- <path-to-json>')
}

const inputPath = path.resolve(inputArg)
const raw = await fs.readFile(inputPath, 'utf8')
const parsed = JSON.parse(raw)
const complaints = Array.isArray(parsed) ? parsed : parsed?.complaints
if (!Array.isArray(complaints)) {
  throw new Error('Input file must be an array or an object with "complaints" array')
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  lookup: dnsLookup,
})

try {
  let upserted = 0
  for (const complaint of complaints) {
    const status = complaint.status || 'Submitted'
    const now = new Date().toISOString()
    const resolvedAt = status === 'Resolved' || status === 'Closed' ? complaint.resolvedAt || now : null

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
          documents = excluded.documents,
          notes = excluded.notes,
          section_data = excluded.section_data,
          last_updated = excluded.last_updated,
          resolved_at = excluded.resolved_at
      `,
      [
        complaint.id || nanoid(),
        complaint.complaintId,
        complaint.complaintName || '',
        complaint.portalName || 'Unknown',
        complaint.category || 'Other',
        complaint.description || '',
        complaint.dateLodged || now.slice(0, 10),
        status,
        complaint.department || '',
        complaint.officeEmail || '',
        complaint.officePhone || '',
        complaint.expectedResponseDate || '',
        JSON.stringify(Array.isArray(complaint.documents) ? complaint.documents : []),
        complaint.notes || '',
        JSON.stringify(complaint.sectionData || null),
        complaint.lastUpdated || now,
        resolvedAt,
      ],
    )
    upserted += 1
  }
  console.log(`Imported/upserted ${upserted} complaints into Neon.`)
} finally {
  await pool.end()
}
