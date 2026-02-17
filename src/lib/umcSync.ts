import { nanoid } from 'nanoid'

import { useComplaintsStore } from '@/store/complaintsStore'
import type { Complaint, ComplaintStatus } from '@/types/complaint'

const UMC_FEED_PATH = '/data/umc-complaints.json'
const UMC_SYNCED_AT_KEY = 'umc-sync:last-synced-at'
const UMC_PORTAL_NAMES = new Set(['Smart_UMC_Grievances', 'UMC_Grievances'])

type UmcFeedComplaint = {
  complaintId: string
  complaintName?: string
  description?: string
  dateLodged?: string
  status?: string
  department?: string
  officeEmail?: string
  officePhone?: string
  expectedResponseDate?: string
  notes?: string
}

type UmcFeed = {
  syncedAt?: string
  complaints?: UmcFeedComplaint[]
}

const statusSet = new Set<ComplaintStatus>([
  'Filed',
  'Submitted',
  'Pending',
  'In Progress',
  'Transfered',
  'Assigned',
  'First Appeal',
  'Second Appeal',
  'Closed',
  'Resolved',
])

function normalizeStatus(value: string | undefined): ComplaintStatus {
  if (!value) return 'Submitted'
  const cleaned = value.trim()
  if (statusSet.has(cleaned as ComplaintStatus)) return cleaned as ComplaintStatus
  if (/resolve|closed/i.test(cleaned)) return 'Resolved'
  if (/progress/i.test(cleaned)) return 'In Progress'
  if (/assign/i.test(cleaned)) return 'Assigned'
  if (/pend/i.test(cleaned)) return 'Pending'
  return 'Submitted'
}

function isIsoDate(input: string | undefined): input is string {
  return !!input && /^\d{4}-\d{2}-\d{2}$/.test(input)
}

function toComplaint(input: UmcFeedComplaint): Complaint | null {
  if (!input.complaintId?.trim()) return null
  const now = new Date().toISOString()
  const status = normalizeStatus(input.status)

  return {
    id: nanoid(),
    complaintId: input.complaintId.trim(),
    complaintName: input.complaintName?.trim() || 'UMC Grievance',
    portalName: 'Smart_UMC_Grievances',
    category: 'Grievance',
    description: input.description?.trim() || '',
    dateLodged: isIsoDate(input.dateLodged) ? input.dateLodged : now.slice(0, 10),
    status,
    department: input.department?.trim() || '',
    officeEmail: input.officeEmail?.trim() || '',
    officePhone: input.officePhone?.trim() || '',
    expectedResponseDate: isIsoDate(input.expectedResponseDate) ? input.expectedResponseDate : undefined,
    documents: [],
    notes: input.notes?.trim() || '',
    lastUpdated: now,
    resolvedAt: status === 'Resolved' || status === 'Closed' ? now : undefined,
  }
}

export async function syncUmcComplaintsFromFeed(force = false): Promise<{ imported: number }> {
  try {
    const response = await fetch(`${UMC_FEED_PATH}?t=${Date.now()}`, { cache: 'no-store' })
    if (!response.ok) {
      return { imported: 0 }
    }

    const data = (await response.json()) as UmcFeed
    const remoteSyncedAt = (data.syncedAt ?? '').trim()
    const lastSyncedAt = localStorage.getItem(UMC_SYNCED_AT_KEY) ?? ''
    const hasExistingUmc = useComplaintsStore
      .getState()
      .complaints.some((c) => UMC_PORTAL_NAMES.has(c.portalName))
    if (!force && remoteSyncedAt && remoteSyncedAt === lastSyncedAt && hasExistingUmc) {
      return { imported: 0 }
    }

    const source = Array.isArray(data.complaints) ? data.complaints : []
    const incoming = source.map(toComplaint).filter((c): c is Complaint => !!c)

    if (incoming.length === 0) {
      if (remoteSyncedAt) localStorage.setItem(UMC_SYNCED_AT_KEY, remoteSyncedAt)
      return { imported: 0 }
    }

    const store = useComplaintsStore.getState()
    const existing = store.complaints
    const byKey = new Map<string, Complaint>(
      existing.map((c) => [`${c.portalName}::${c.complaintId}`, c] as const),
    )

    let imported = 0
    for (const next of incoming) {
      const key = `${next.portalName}::${next.complaintId}`
      const prev = byKey.get(key)
      if (!prev) {
        byKey.set(key, next)
        imported += 1
        continue
      }

      byKey.set(key, {
        ...prev,
        ...next,
        id: prev.id,
        documents: prev.documents,
        lastUpdated: next.lastUpdated,
        resolvedAt:
          next.status === 'Resolved' || next.status === 'Closed'
            ? prev.resolvedAt ?? next.lastUpdated
            : undefined,
      })
    }

    store.setComplaints(Array.from(byKey.values()))
    if (remoteSyncedAt) localStorage.setItem(UMC_SYNCED_AT_KEY, remoteSyncedAt)
    return { imported }
  } catch {
    return { imported: 0 }
  }
}
