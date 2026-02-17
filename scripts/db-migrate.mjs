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
  throw new Error('Missing DATABASE_URL in .env.server')
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  lookup: dnsLookup,
})

const sql = `
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

create table if not exists sync_runs (
  id bigserial primary key,
  source text not null,
  status text not null,
  count_imported integer not null default 0,
  message text,
  created_at timestamptz not null default now()
);
`

try {
  await pool.query(sql)
  console.log('Migration complete.')
} finally {
  await pool.end()
}
