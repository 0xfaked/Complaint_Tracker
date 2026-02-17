import type { Complaint } from '@/types/complaint'

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) || '/api'

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed: ${response.status}`)
  }
  return (await response.json()) as T
}

export async function fetchComplaints(): Promise<Complaint[]> {
  const response = await fetch(`${API_BASE}/complaints`, { cache: 'no-store' })
  return parseJson<Complaint[]>(response)
}

export async function createComplaintApi(complaint: Omit<Complaint, 'id' | 'lastUpdated' | 'resolvedAt'>) {
  const response = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(complaint),
  })
  return parseJson<Complaint>(response)
}

export async function updateComplaintApi(id: string, patch: Partial<Omit<Complaint, 'id'>>) {
  const response = await fetch(`${API_BASE}/complaints/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  return parseJson<Complaint>(response)
}

export async function deleteComplaintApi(id: string) {
  const response = await fetch(`${API_BASE}/complaints/${id}`, { method: 'DELETE' })
  if (!response.ok && response.status !== 204) {
    const message = await response.text()
    throw new Error(message || `Delete failed: ${response.status}`)
  }
}
