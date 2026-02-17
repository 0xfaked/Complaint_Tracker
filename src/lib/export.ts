import { format } from 'date-fns'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

import { daysPending, daysUntilDue, displayStatus, getDueDate } from '@/lib/dates'
import type { Complaint } from '@/types/complaint'

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`
  return s
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function exportComplaintsCSV(complaints: Complaint[], filename?: string) {
  const stamp = format(new Date(), 'yyyyMMdd-HHmm')
  const outName = filename ?? `complaints-${stamp}.csv`

  const header = [
    'Complaint ID',
    'Portal Name',
    'Category',
    'Department',
    'Date Lodged',
    'Expected Response Date',
    'Computed Due Date',
    'Status',
    'Days Pending',
    'Days Until Next Action',
    'Description',
    'Notes',
    'Last Updated',
  ]

  const rows = complaints.map((c) => {
    const due = getDueDate(c)
    const until = daysUntilDue(c)
    return [
      c.complaintId,
      c.portalName,
      c.category,
      c.department,
      c.dateLodged,
      c.expectedResponseDate ?? '',
      due ? format(due, 'yyyy-MM-dd') : '',
      displayStatus(c),
      daysPending(c),
      typeof until === 'number' ? until : '',
      c.description,
      c.notes,
      c.lastUpdated,
    ].map(csvEscape)
  })

  const csv = [header.map(csvEscape).join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), outName)
}

export function exportComplaintsPDF(complaints: Complaint[], filename?: string) {
  const stamp = format(new Date(), 'yyyyMMdd-HHmm')
  const outName = filename ?? `complaints-${stamp}.pdf`

  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt' })
  doc.setFontSize(16)
  doc.text('Complaint Tracking Export', 40, 40)
  doc.setFontSize(10)
  doc.text(`Generated: ${format(new Date(), 'PPpp')}`, 40, 58)

  const head = [
    [
      'Complaint ID',
      'Portal',
      'Category',
      'Dept',
      'Lodged',
      'Due',
      'Status',
      'Pending (d)',
      'Until (d)',
    ],
  ]

  const body = complaints.map((c) => {
    const due = getDueDate(c)
    const until = daysUntilDue(c)
    return [
      c.complaintId,
      c.portalName,
      c.category,
      c.department,
      c.dateLodged,
      due ? format(due, 'yyyy-MM-dd') : '',
      String(displayStatus(c)),
      String(daysPending(c)),
      typeof until === 'number' ? String(until) : '',
    ]
  })

  autoTable(doc, {
    head,
    body,
    startY: 80,
    styles: { fontSize: 9, cellPadding: 6 },
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: { 0: { cellWidth: 140 }, 1: { cellWidth: 160 }, 8: { halign: 'right' } },
  })

  downloadBlob(doc.output('blob'), outName)
}

