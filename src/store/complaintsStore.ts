import { nanoid } from 'nanoid'
import { create } from 'zustand'

import { deleteAttachment } from '@/lib/attachments'
import {
  createComplaintApi,
  deleteComplaintApi,
  fetchComplaints,
  updateComplaintApi,
} from '@/lib/complaintsApi'
import type { Complaint } from '@/types/complaint'

type ComplaintCreateInput = Omit<Complaint, 'id' | 'lastUpdated' | 'resolvedAt'>
const LOCAL_FALLBACK_KEY = 'complaint-tracker:fallback'

function complaintKey(complaint: Pick<Complaint, 'portalName' | 'complaintId'>): string {
  return `${complaint.portalName}::${complaint.complaintId}`.trim().toLowerCase()
}

function dedupeComplaints(items: Complaint[]): Complaint[] {
  const map = new Map<string, Complaint>()
  for (const item of items) {
    map.set(complaintKey(item), item)
  }
  return Array.from(map.values())
}

function readLocalComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(LOCAL_FALLBACK_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? dedupeComplaints(parsed) : []
  } catch {
    return []
  }
}

function writeLocalComplaints(complaints: Complaint[]) {
  try {
    localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(dedupeComplaints(complaints)))
  } catch {
    // no-op
  }
}

type ComplaintStore = {
  complaints: Complaint[]
  loading: boolean
  createComplaint: (input: ComplaintCreateInput) => Promise<void>
  updateComplaint: (id: string, patch: Partial<Omit<Complaint, 'id'>>) => Promise<void>
  deleteComplaint: (id: string) => Promise<void>
  loadComplaints: () => Promise<void>
  setComplaints: (complaints: Complaint[]) => void
  clearAll: () => void
}

function upsertByComplaintKey(items: Complaint[], next: Complaint): Complaint[] {
  const key = complaintKey(next)
  const index = items.findIndex((c) => complaintKey(c) === key)
  if (index === -1) return dedupeComplaints([next, ...items])
  const copy = [...items]
  copy[index] = next
  return dedupeComplaints(copy)
}

export const useComplaintsStore = create<ComplaintStore>()((set, get) => ({
  complaints: readLocalComplaints(),
  loading: false,
  loadComplaints: async () => {
    set({ loading: true })
    try {
      const complaints = await fetchComplaints()
      const deduped = dedupeComplaints(complaints)
      writeLocalComplaints(deduped)
      set({ complaints: deduped, loading: false })
    } catch {
      const local = readLocalComplaints()
      set({ complaints: local, loading: false })
    }
  },
  createComplaint: async (input) => {
    try {
      const saved = await createComplaintApi(input)
      const next = upsertByComplaintKey(get().complaints, saved)
      writeLocalComplaints(next)
      set({ complaints: next })
    } catch {
      const now = new Date().toISOString()
      const local: Complaint = {
        ...input,
        id: nanoid(),
        lastUpdated: now,
        resolvedAt: input.status === 'Resolved' || input.status === 'Closed' ? now : undefined,
      }
      const next = upsertByComplaintKey(get().complaints, local)
      writeLocalComplaints(next)
      set({ complaints: next })
    }
  },
  updateComplaint: async (id, patch) => {
    try {
      const saved = await updateComplaintApi(id, patch)
      const next = upsertByComplaintKey(get().complaints, saved)
      writeLocalComplaints(next)
      set({ complaints: next })
    } catch {
      const now = new Date().toISOString()
      const next = get().complaints.map((c) => {
        if (c.id !== id) return c
        const merged: Complaint = { ...c, ...patch, lastUpdated: now }
        if ((merged.status === 'Resolved' || merged.status === 'Closed') && !merged.resolvedAt) {
          merged.resolvedAt = now
        }
        if (merged.status !== 'Resolved' && merged.status !== 'Closed') merged.resolvedAt = undefined
        return merged
      })
      writeLocalComplaints(next)
      set({ complaints: next })
    }
  },
  deleteComplaint: async (id) => {
    const current = get().complaints
    const target = current.find((c) => c.id === id)
    try {
      await deleteComplaintApi(id)
    } catch {
      // fallback mode
    }
      const next = dedupeComplaints(current.filter((c) => c.id !== id))
      writeLocalComplaints(next)
      set({ complaints: next })
    if (target?.documents?.length) {
      await Promise.all(target.documents.map((d) => deleteAttachment(d.id)))
    }
  },
  setComplaints: (complaints) => {
    const deduped = dedupeComplaints(complaints)
    writeLocalComplaints(deduped)
    set({ complaints: deduped })
  },
  clearAll: () => {
    writeLocalComplaints([])
    set({ complaints: [] })
  },
}))
