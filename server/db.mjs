import { config as loadEnv } from 'dotenv'
import dns from 'node:dns'
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
  throw new Error('Missing DATABASE_URL. Set it in .env.server or environment variables.')
}

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  lookup: dnsLookup,
})

export async function query(text, params = []) {
  return pool.query(text, params)
}

function toIsoDate(value) {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

export function rowToComplaint(row) {
  return {
    id: row.id,
    complaintId: row.complaint_id,
    complaintName: row.complaint_name ?? '',
    portalName: row.portal_name,
    category: row.category,
    description: row.description ?? '',
    dateLodged: toIsoDate(row.date_lodged),
    status: row.status,
    department: row.department ?? '',
    officeEmail: row.office_email ?? '',
    officePhone: row.office_phone ?? '',
    expectedResponseDate: row.expected_response_date ? toIsoDate(row.expected_response_date) : undefined,
    documents: Array.isArray(row.documents) ? row.documents : [],
    notes: row.notes ?? '',
    sectionData: row.section_data ?? undefined,
    lastUpdated:
      row.last_updated instanceof Date ? row.last_updated.toISOString() : String(row.last_updated),
    resolvedAt: row.resolved_at
      ? row.resolved_at instanceof Date
        ? row.resolved_at.toISOString()
        : String(row.resolved_at)
      : undefined,
  }
}
