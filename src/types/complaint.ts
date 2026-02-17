export const complaintCategories = ['RTI', 'Grievance', 'Other'] as const
export type ComplaintCategory = (typeof complaintCategories)[number]

export const complaintStatuses = [
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
] as const
export type ComplaintStatus = (typeof complaintStatuses)[number]

export type AttachmentRef = {
  id: string
  name: string
  type: string
  size: number
  addedAt: string
}

export type ComplaintSectionDetails = {
  tokenId: string
  district: string
  portalStatus: string
  complaintDateTime: string
  cpgramsStatusCheck: string
  cpgramsRegistrationNo: string
  cpgramsRegToken: string
  officeDepartment: string
  officeName: string
  officerDesk: string
  officeContact: string
  officeEmail: string
  reminder: string
  grievanceCategoryPath: string
  ministryOrganisation: string
  stateName: string
  highwayNumber: string
  stretchDetails: string
  grievanceNarrative: string
}

export type Complaint = {
  id: string
  complaintId: string
  complaintName?: string
  portalName: string
  category: ComplaintCategory
  description: string
  dateLodged: string // YYYY-MM-DD
  status: ComplaintStatus
  department: string
  officeEmail?: string
  officePhone?: string
  expectedResponseDate?: string // YYYY-MM-DD
  documents: AttachmentRef[]
  notes: string
  sectionData?: ComplaintSectionDetails
  lastUpdated: string // ISO timestamp
  resolvedAt?: string // ISO timestamp
}
