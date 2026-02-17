import { differenceInDays, parseISO, format, addDays } from 'date-fns';
import type { Complaint, ComplaintStatus, TimelineAlert } from '../types';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getStatusColor = (status: ComplaintStatus): string => {
  const colors: Record<ComplaintStatus, string> = {
    'Filed': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'In Progress': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    'Resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Overdue': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return colors[status];
};

export const getStatusIconColor = (status: ComplaintStatus): string => {
  const colors: Record<ComplaintStatus, string> = {
    'Filed': 'text-blue-500',
    'Pending': 'text-yellow-500',
    'In Progress': 'text-amber-500',
    'Resolved': 'text-green-500',
    'Overdue': 'text-red-500',
  };
  return colors[status];
};

export const calculateDaysPending = (dateLodged: string): number => {
  return differenceInDays(new Date(), parseISO(dateLodged));
};

export const calculateDaysUntilDeadline = (expectedDate: string): number => {
  return differenceInDays(parseISO(expectedDate), new Date());
};

export const getTimelineAlerts = (complaint: Complaint): TimelineAlert[] => {
  const alerts: TimelineAlert[] = [];
  const daysPending = calculateDaysPending(complaint.dateLodged);
  const daysUntilDeadline = calculateDaysUntilDeadline(complaint.expectedResponseDate);

  if (complaint.status === 'Resolved') {
    return alerts;
  }

  if (daysUntilDeadline < 0) {
    alerts.push({
      type: 'danger',
      days: Math.abs(daysUntilDeadline),
      message: `Overdue by ${Math.abs(daysUntilDeadline)} days`
    });
  } else if (daysUntilDeadline <= 1) {
    alerts.push({
      type: 'danger',
      days: daysUntilDeadline,
      message: 'Due today or tomorrow!'
    });
  } else if (daysUntilDeadline <= 3) {
    alerts.push({
      type: 'warning',
      days: daysUntilDeadline,
      message: `${daysUntilDeadline} days until deadline`
    });
  } else if (daysUntilDeadline <= 7) {
    alerts.push({
      type: 'info',
      days: daysUntilDeadline,
      message: `${daysUntilDeadline} days remaining`
    });
  }

  return alerts;
};

export const calculateExpectedResponseDate = (
  category: string,
  dateLodged: string,
  appealLevel: number = 0
): string => {
  const baseDate = parseISO(dateLodged);
  let days = 30;

  if (category === 'RTI') {
    days = appealLevel === 0 ? 30 : appealLevel === 1 ? 30 : 60;
  } else if (category === 'Grievance') {
    days = 30;
  }

  return format(addDays(baseDate, days), 'yyyy-MM-dd');
};

export const exportToCSV = (complaints: Complaint[]): string => {
  const headers = [
    'ID',
    'Complaint ID',
    'Portal Name',
    'Category',
    'Description',
    'Date Lodged',
    'Status',
    'Department',
    'Expected Response Date',
    'Days Pending',
    'Notes',
    'Last Updated'
  ];

  const rows = complaints.map(c => [
    c.id,
    c.complaintId,
    c.portalName,
    c.category,
    c.description,
    c.dateLodged,
    c.status,
    c.department,
    c.expectedResponseDate,
    calculateDaysPending(c.dateLodged),
    c.notes,
    c.lastUpdated
  ]);

  return [headers.join(','), ...rows.map(r => r.map(field => 
    `"${String(field).replace(/"/g, '""')}"`
  ).join(','))].join('\n');
};

export const downloadCSV = (complaints: Complaint[], filename: string = 'complaints.csv') => {
  const csv = exportToCSV(complaints);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
