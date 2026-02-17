import cors from 'cors'
import { config as loadEnv } from 'dotenv'
import express from 'express'
import { nanoid } from 'nanoid'

import { query, rowToComplaint } from './db.mjs'

loadEnv({ path: '.env.server' })
loadEnv()

const app = express()
const port = Number(process.env.PORT || 4000)

app.use(cors())
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', async (_req, res) => {
  try {
    await query('select 1')
    res.json({ ok: true })
  } catch (error) {
    res.status(500).json({ ok: false, error: String(error) })
  }
})

app.get('/api/complaints', async (_req, res) => {
  const result = await query(
    `
      select *
      from complaints
      order by date_lodged desc, last_updated desc
    `,
  )
  res.json(result.rows.map(rowToComplaint))
})

app.post('/api/complaints', async (req, res) => {
  const body = req.body || {}
  const now = new Date().toISOString()
  const status = String(body.status || 'Submitted')
  const resolvedAt =
    status === 'Resolved' || status === 'Closed' ? body.resolvedAt || now : null

  const result = await query(
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
      returning *
    `,
    [
      body.id || nanoid(),
      body.complaintId,
      body.complaintName || '',
      body.portalName,
      body.category || 'Other',
      body.description || '',
      body.dateLodged || now.slice(0, 10),
      status,
      body.department || '',
      body.officeEmail || '',
      body.officePhone || '',
      body.expectedResponseDate || '',
      JSON.stringify(Array.isArray(body.documents) ? body.documents : []),
      body.notes || '',
      JSON.stringify(body.sectionData || null),
      now,
      resolvedAt,
    ],
  )

  res.status(201).json(rowToComplaint(result.rows[0]))
})

app.patch('/api/complaints/:id', async (req, res) => {
  const { id } = req.params
  const currentResult = await query('select * from complaints where id = $1', [id])
  if (!currentResult.rowCount) {
    res.status(404).json({ error: 'Complaint not found' })
    return
  }

  const current = rowToComplaint(currentResult.rows[0])
  const patch = req.body || {}
  const nextStatus = patch.status ?? current.status
  const now = new Date().toISOString()

  const merged = {
    ...current,
    ...patch,
    id,
    status: nextStatus,
    lastUpdated: now,
    resolvedAt:
      nextStatus === 'Resolved' || nextStatus === 'Closed'
        ? patch.resolvedAt || current.resolvedAt || now
        : undefined,
  }

  const saved = await query(
    `
      update complaints set
        complaint_id = $2,
        complaint_name = $3,
        portal_name = $4,
        category = $5,
        description = $6,
        date_lodged = $7::date,
        status = $8,
        department = $9,
        office_email = $10,
        office_phone = $11,
        expected_response_date = nullif($12, '')::date,
        documents = $13::jsonb,
        notes = $14,
        section_data = $15::jsonb,
        last_updated = $16::timestamptz,
        resolved_at = $17::timestamptz
      where id = $1
      returning *
    `,
    [
      id,
      merged.complaintId,
      merged.complaintName || '',
      merged.portalName,
      merged.category,
      merged.description || '',
      merged.dateLodged,
      merged.status,
      merged.department || '',
      merged.officeEmail || '',
      merged.officePhone || '',
      merged.expectedResponseDate || '',
      JSON.stringify(Array.isArray(merged.documents) ? merged.documents : []),
      merged.notes || '',
      JSON.stringify(merged.sectionData || null),
      merged.lastUpdated,
      merged.resolvedAt || null,
    ],
  )

  res.json(rowToComplaint(saved.rows[0]))
})

app.delete('/api/complaints/:id', async (req, res) => {
  const { id } = req.params
  const result = await query('delete from complaints where id = $1', [id])
  if (!result.rowCount) {
    res.status(404).json({ error: 'Complaint not found' })
    return
  }
  res.status(204).send()
})

app.post('/api/complaints/bulk-upsert', async (req, res) => {
  const complaints = Array.isArray(req.body?.complaints) ? req.body.complaints : []
  let upserted = 0
  for (const complaint of complaints) {
    await query(
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
        complaint.id || nanoid(),
        complaint.complaintId,
        complaint.complaintName || '',
        complaint.portalName,
        complaint.category || 'Other',
        complaint.description || '',
        complaint.dateLodged || new Date().toISOString().slice(0, 10),
        complaint.status || 'Submitted',
        complaint.department || '',
        complaint.officeEmail || '',
        complaint.officePhone || '',
        complaint.expectedResponseDate || '',
        JSON.stringify(Array.isArray(complaint.documents) ? complaint.documents : []),
        complaint.notes || '',
        JSON.stringify(complaint.sectionData || null),
        complaint.lastUpdated || new Date().toISOString(),
        complaint.resolvedAt || null,
      ],
    )
    upserted += 1
  }
  res.json({ upserted })
})

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`)
})
