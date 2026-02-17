export type ComplaintCategory = 'RTI' | 'Grievance' | 'Other';
export type ComplaintStatus = 'Filed' | 'Pending' | 'In Progress' | 'Resolved' | 'Overdue';

export interface Complaint {
  id: string;
  complaintId: string;
  portalName: string;
  category: ComplaintCategory;
  description: string;
  dateLodged: string;
  status: ComplaintStatus;
  department: string;
  expectedResponseDate: string;
  documents: string[];
  notes: string;
  lastUpdated: string;
  appealLevel?: number;
}

export interface FilterOptions {
  status: ComplaintStatus | 'All';
  category: ComplaintCategory | 'All';
  portal: string;
  dateFrom: string;
  dateTo: string;
  searchQuery: string;
}

export type SortField = 'dateLodged' | 'lastUpdated' | 'status' | 'expectedResponseDate';
export type SortOrder = 'asc' | 'desc';

export interface TimelineAlert {
  type: 'info' | 'warning' | 'danger';
  days: number;
  message: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  resolved: number;
  overdue: number;
  byCategory: Record<ComplaintCategory, number>;
  byPortal: Record<string, number>;
  byStatus: Record<ComplaintStatus, number>;
}
