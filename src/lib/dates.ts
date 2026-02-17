import { addDays, differenceInCalendarDays, format, isValid, parseISO } from 'date-fns'

import type { Complaint, ComplaintCategory, ComplaintStatus } from '@/types/complaint'

export function todayISODate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function parseISODate(value: string | undefined): Date | undefined {
  if (!value) return undefined
  const d = parseISO(value)
  return isValid(d) ? d : undefined
}

export function legalTimelineDays(category: ComplaintCategory, status: ComplaintStatus): number | null {
  if (status === 'Resolved' || status === 'Closed') return null

  if (category === 'RTI') {
    if (status === 'Second Appeal') return 90
    return 30
  }

  if (category === 'Grievance') return 30
  return 15
}

export function getDueDate(complaint: Complaint): Date | undefined {
  const explicit = parseISODate(complaint.expectedResponseDate)
  if (explicit) return explicit

  const timeline = legalTimelineDays(complaint.category, complaint.status)
  if (!timeline) return undefined

  const base =
    complaint.status === 'First Appeal' || complaint.status === 'Second Appeal'
      ? parseISO(complaint.lastUpdated)
      : parseISO(complaint.dateLodged)

  return addDays(base, timeline)
}

export function daysUntilDue(complaint: Complaint): number | undefined {
  const due = getDueDate(complaint)
  if (!due) return undefined
  return differenceInCalendarDays(due, new Date())
}

export function isOverdue(complaint: Complaint): boolean {
  if (complaint.status === 'Resolved' || complaint.status === 'Closed') return false
  const days = daysUntilDue(complaint)
  return typeof days === 'number' ? days < 0 : false
}

export function displayStatus(complaint: Complaint): ComplaintStatus | 'Overdue' {
  if (complaint.status === 'Resolved' || complaint.status === 'Closed') return complaint.status
  if (isOverdue(complaint)) return 'Overdue'
  return complaint.status
}

export function daysPending(complaint: Complaint): number {
  const start = parseISO(complaint.dateLodged)
  const end =
    complaint.status === 'Resolved' || complaint.status === 'Closed'
      ? parseISO(complaint.resolvedAt ?? complaint.lastUpdated)
      : new Date()

  const diff = differenceInCalendarDays(end, start)
  return Math.max(0, diff)
}
