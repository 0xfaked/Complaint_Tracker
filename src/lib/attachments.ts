import { createStore, del, get, set } from 'idb-keyval'
import { nanoid } from 'nanoid'

import type { AttachmentRef } from '@/types/complaint'

type StoredAttachment = {
  blob: Blob
  name: string
  type: string
  size: number
  addedAt: string
}

const attachmentStore = createStore('complaint-tracker', 'attachments')

export async function putAttachment(file: File): Promise<AttachmentRef> {
  const id = nanoid()
  const addedAt = new Date().toISOString()
  const stored: StoredAttachment = {
    blob: file,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    addedAt,
  }

  await set(id, stored, attachmentStore)
  return { id, name: stored.name, type: stored.type, size: stored.size, addedAt: stored.addedAt }
}

export async function getAttachment(id: string): Promise<StoredAttachment | undefined> {
  return (await get(id, attachmentStore)) as StoredAttachment | undefined
}

export async function deleteAttachment(id: string): Promise<void> {
  await del(id, attachmentStore)
}

export async function downloadAttachment(ref: AttachmentRef): Promise<void> {
  const stored = await getAttachment(ref.id)
  if (!stored) return

  const url = URL.createObjectURL(stored.blob)
  const a = document.createElement('a')
  a.href = url
  a.download = stored.name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

