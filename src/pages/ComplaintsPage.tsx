import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { todayISODate } from '@/lib/dates'
import { useComplaintsStore } from '@/store/complaintsStore'
import type { ComplaintStatus } from '@/types/complaint'

const platformOptions = ['RTI', 'PGPortal', 'Maha_Grievances', 'Smart_UMC_Grievances', 'UMC_Grievances'] as const
const statusOptions: ComplaintStatus[] = ['Submitted', 'Transfered', 'Assigned', 'In Progress', 'Closed', 'Resolved']

const platformColorMap: Array<{ match: string; className: string }> = [
  { match: 'RTI', className: 'border-cyan-700 bg-cyan-950 text-cyan-100' },
  { match: 'PGPortal', className: 'border-blue-700 bg-blue-950 text-blue-100' },
  { match: 'Maha_Grievances', className: 'border-violet-700 bg-violet-950 text-violet-100' },
  { match: 'Smart_UMC_Grievances', className: 'border-amber-700 bg-amber-950 text-amber-100' },
  { match: 'UMC_Grievances', className: 'border-orange-700 bg-orange-950 text-orange-100' },
]

const statusColorMap: Record<ComplaintStatus, string> = {
  Filed: 'border-blue-700 bg-blue-950 text-blue-100',
  Submitted: 'border-sky-700 bg-sky-950 text-sky-100',
  Pending: 'border-yellow-700 bg-yellow-900 text-yellow-100',
  Transfered: 'border-indigo-700 bg-indigo-950 text-indigo-100',
  Assigned: 'border-orange-700 bg-orange-950 text-orange-100',
  'In Progress': 'border-amber-700 bg-amber-950 text-amber-100',
  'First Appeal': 'border-fuchsia-700 bg-fuchsia-950 text-fuchsia-100',
  'Second Appeal': 'border-purple-700 bg-purple-950 text-purple-100',
  Closed: 'border-red-700 bg-red-950 text-red-100',
  Resolved: 'border-emerald-700 bg-emerald-950 text-emerald-100',
}

function getPlatformBadgeClass(portalName?: string): string {
  const source = portalName?.trim() ?? ''
  if (!source) return 'border-slate-700 bg-slate-900 text-slate-100'
  const hit = platformColorMap.find((item) => source === item.match || source.includes(item.match))
  return hit?.className ?? 'border-slate-700 bg-slate-900 text-slate-100'
}

function getPlatformDisplayName(portalName?: string): string {
  const source = portalName?.trim() ?? ''
  if (!source) return '-'
  const normalized = source.toLowerCase()
  if (
    normalized.includes('smart_umc_grievances') ||
    normalized.includes('umc_smartgrievance') ||
    normalized.includes('umc_grievances')
  ) {
    return 'UMC'
  }
  return source
}
const pgPortalSeedData = [
  {
    complaintId: 'MORTH/E/2025/0027899',
    complaintName: 'Road damage on Shahad Bridge',
    portalName: 'PGPortal',
    category: 'Grievance' as const,
    description:
      'Road damage on Shahad Bridge due to NH-61 expansion work. Existing bridge road deteriorated badly with broken sections creating safety hazards.',
    dateLodged: '2025-10-30',
    status: 'Submitted' as ComplaintStatus,
    department: 'Public Works Department',
    notes: 'Kalyan, Thane',
  },
  {
    complaintId: 'MORTH/E/2026/0003447',
    complaintName: 'Dust Pollution (Shahad to Pachva Mail)',
    portalName: 'PGPortal',
    category: 'Grievance' as const,
    description:
      'Severe air and dust pollution on road stretch from Pachva Mail to Shahad Railway Station. Large amount of dust accumulated along both sides causing breathing difficulties, eye irritation, and health problems.',
    dateLodged: '2026-02-11',
    status: 'Submitted' as ComplaintStatus,
    department: 'National Highways Authority of India (NHAI)',
    notes: 'Shahad Bridge to Pachva Mail, Kalyan, Thane',
  },
  {
    complaintId: 'MORTH/E/2026/0005551',
    complaintName: 'Rayte Village Bridge Road Repair',
    portalName: 'PGPortal',
    category: 'Grievance' as const,
    description:
      'Extremely poor condition of existing bridge road in Rayte Village due to NH-61 expansion work (2-lane to 4-lane). Existing road dug up by NHAI creating serious safety hazards.',
    dateLodged: '2026-02-11',
    status: 'Submitted' as ComplaintStatus,
    department: 'National Highways Authority of India (NHAI)',
    notes: 'Pachva Mail to Rayte Village, Kalyan, Thane',
  },
  {
    complaintId: 'MOPRJ/E/2025/0011358',
    complaintName: 'Garbage Dumping in Gavki Talav',
    portalName: 'PGPortal',
    category: 'Grievance' as const,
    description:
      'Garbage dumping in Gavki Talav (village lake). Polluted water causing mosquito breeding and public health risk.',
    dateLodged: '2025-11-09',
    status: 'Submitted' as ComplaintStatus,
    department: 'Ministry of Panchayati Raj',
    notes: 'Kamba Village, Kalyan Taluka, Thane',
  },
  {
    complaintId: 'MORTH/E/2025/0030123',
    complaintName: 'Vehicle Parking on Highway',
    portalName: 'PGPortal',
    category: 'Grievance' as const,
    description:
      'Vehicles parked on highway lanes between Murbad and Kalyan causing traffic congestion and accident risk.',
    dateLodged: '2025-11-09',
    status: 'Closed' as ComplaintStatus,
    department: 'Ministry of Road Transport and Highways',
    notes: 'Kalyan-Murbad Road, Maharashtra',
  },
  {
    complaintId: 'MORTH/E/2025/0027900',
    complaintName: 'Highway Dust & Maintenance (Shahad to Murbad)',
    portalName: 'PGPortal',
    category: 'Grievance' as const,
    description:
      'Poor maintenance and unhygienic condition of NH-61. Thick layer of dust and sand causing severe air pollution and visibility hazards.',
    dateLodged: '2025-10-22',
    status: 'Submitted' as ComplaintStatus,
    department: 'National Highways Authority of India (NHAI)',
    notes: 'Kalyan-Shahad-Murbad stretch, Maharashtra',
  },
  {
    complaintId: 'MORTH/E/2025/0017450',
    complaintName: 'MSRCTC Bus Congestion',
    portalName: 'PGPortal',
    category: 'Grievance' as const,
    description:
      'Severe bus congestion during peak hours and unpredictable bus timings on MSRCTC buses.',
    dateLodged: '2025-08-13',
    status: 'Closed' as ComplaintStatus,
    department: 'Ministry of Road Transport and Highways',
    notes: 'Kalyan-Murbad, Maharashtra',
  },
  {
    complaintId: 'MORTH/E/2025/0001589',
    complaintName: 'Service Lane Damage by Mahanagar Gas',
    portalName: 'PGPortal',
    category: 'Grievance' as const,
    description:
      'Mahanagar Gas dug up service lane, installed pipelines, and filled with sand only. Causing traffic and air pollution in 8 km stretch.',
    dateLodged: '2025-01-27',
    status: 'Closed' as ComplaintStatus,
    department: 'National Highways Authority of India (NHAI)',
    notes: 'Shahad Station to Varap Village, Kalyan, Thane',
  },
]

const rtiSeedData = [
  {
    complaintId: 'AHZPO/R/2025/80348',
    complaintName: 'Gram Panchayat budget, grants and infrastructure records',
    portalName: 'RTI Online',
    category: 'RTI' as const,
    description:
      'TO PIO Punewadi, Tal - Parner: Requesting certified copies of annual budgets and audited financial statements (2022-23, 2023-24, 2024-25), grants and expenditure details, development works status with contractor/cost details, implementation details of MGNREGA/Swachh Bharat/PM Awas Yojana, complete asset register, staff structure, Gram Sabha and Gram Panchayat meeting minutes (last two years), and infrastructure status (water, sanitation, roads, street lights).',
    dateLodged: '2025-12-30',
    status: 'Submitted' as ComplaintStatus,
    department: 'Zilla Parishad, Ahmednagar',
    notes: 'Room no 302 Maitree Park Rayte, Kalyan-Murbad Road, Tal Kalyan, Thane',
    officeEmail: 'girishchede2005@gmail.com',
    officePhone: '+91-9324277597',
  },
  {
    complaintId: 'AHZPO/R/2026/60093',
    complaintName: 'Road, street-light and toilet works details (2022-2025)',
    portalName: 'RTI Online',
    category: 'RTI' as const,
    description:
      'Gram Panchayat Punevadi, Taluka Parner, District Ahilyanagar: कृपया 2022-2025 या कालावधीत हाती घेतलेल्या सर्व रस्ते बांधकाम, रस्त्यावरील दिवाबत्ती आणि सार्वजनिक शौचालय कामांचा संपूर्ण तपशील द्यावा, ज्यामध्ये मंजूर रक्कम, खर्च, कंत्राटदार तपशील, काम आदेश, पूर्णता स्थिती, योजना स्रोत, तपासणी अहवाल आणि संबंधित कागदपत्रांच्या प्रतींचा समावेश आहे.',
    dateLodged: '2026-02-14',
    status: 'Submitted' as ComplaintStatus,
    department: 'Zilla Parishad, Ahmednagar',
    notes: 'Room no 302 Maitree Park Rayte, Kalyan-Murbad Road, Tal Kalyan, Thane',
    officeEmail: 'girishchede2005@gmail.com',
    officePhone: '+91-9324277597',
  },
  {
    complaintId: 'AHZPO/R/2026/60083',
    complaintName: 'Development works details for FY 2023-24 to 2025-26',
    portalName: 'RTI Online',
    category: 'RTI' as const,
    description:
      'TO Gram Panchayat Punevadi, Parner Taluka, Ahilyanagar: आर्थिक वर्ष 2023-24, 2024-25 आणि 2025-26 मधील सर्व विकास कामांचा सविस्तर तपशील द्यावा, ज्यामध्ये कामाचे नाव/ठिकाण/श्रेणी, मंजूर आणि प्रत्यक्ष खर्च, कंत्राटदार किंवा विक्रेत्यांची नावे, सुरुवात तारीख, पूर्णता तारीख (किंवा अपेक्षित पूर्णता तारीख) आणि सध्याची स्थिती यांचा समावेश आहे.',
    dateLodged: '2026-02-10',
    status: 'Submitted' as ComplaintStatus,
    department: 'Zilla Parishad, Ahmednagar',
    notes: 'Room no 302 Maitree Park Rayte, Kalyan-Murbad Road, Tal Kalyan, Thane',
    officeEmail: 'girishchede2005@gmail.com',
    officePhone: '+91-9324277597',
  },
]

const emptyForm = {
  complaintName: '',
  registrationNo: '',
  platform: '',
  status: '',
  registeredDate: '',
  place: '',
  department: '',
  dueDate: '',
  officeEmail: '',
  officePhone: '',
  description: '',
}

function plus30Days(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00`)
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

export function ComplaintsPage() {
  const [showForm, setShowForm] = useState(false)
  const [openComplaintId, setOpenComplaintId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [importPayload, setImportPayload] = useState('')
  const [importMessage, setImportMessage] = useState('')
  const [importError, setImportError] = useState('')
  const [editStatusById, setEditStatusById] = useState<Record<string, string>>({})
  const [editDueDateById, setEditDueDateById] = useState<Record<string, string>>({})
  const complaints = useComplaintsStore((s) => s.complaints)
  const createComplaint = useComplaintsStore((s) => s.createComplaint)
  const updateComplaint = useComplaintsStore((s) => s.updateComplaint)
  const deleteComplaint = useComplaintsStore((s) => s.deleteComplaint)

  function importSeedData() {
    const existing = new Set(complaints.map((c) => c.complaintId))
    for (const row of [...pgPortalSeedData, ...rtiSeedData]) {
      if (existing.has(row.complaintId)) continue
      createComplaint({
        ...row,
        expectedResponseDate: plus30Days(row.dateLodged),
        officeEmail: 'officeEmail' in row ? row.officeEmail ?? '' : '',
        officePhone: 'officePhone' in row ? row.officePhone ?? '' : '',
        documents: [],
      }).catch(() => {})
    }
  }

  useEffect(() => {
    importSeedData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function insertComplaint() {
    if (!form.complaintName.trim() || !form.registrationNo.trim() || !form.status.trim()) return

    void createComplaint({
      complaintId: form.registrationNo.trim(),
      complaintName: form.complaintName.trim(),
      portalName: form.platform.trim(),
      category: form.platform === 'RTI' ? 'RTI' : 'Grievance',
      description: form.description.trim(),
      dateLodged: form.registeredDate || todayISODate(),
      status: form.status as ComplaintStatus,
      expectedResponseDate: form.dueDate || plus30Days(form.registeredDate || todayISODate()),
      department: form.department.trim(),
      officeEmail: form.officeEmail.trim(),
      officePhone: form.officePhone.trim(),
      documents: [],
      notes: form.place.trim(),
    })

    setForm(emptyForm)
    setShowForm(false)
  }

  function normalizeISODate(value: unknown): string {
    const asText = typeof value === 'string' ? value.trim() : ''
    if (!asText) return ''
    const dateOnly = asText.match(/^(\d{4}-\d{2}-\d{2})$/)
    if (dateOnly) return dateOnly[1]
    const parsed = new Date(asText)
    if (Number.isNaN(parsed.getTime())) return ''
    return parsed.toISOString().slice(0, 10)
  }

  function readString(source: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
      const value = source[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
    return ''
  }

  function fillFormFromPayload() {
    setImportError('')
    setImportMessage('')
    try {
      const parsed: unknown = JSON.parse(importPayload)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setImportError('JSON must be a single object.')
        return
      }
      const source = parsed as Record<string, unknown>

      const nextPlatform = readString(source, ['platform', 'portalName', 'portal', 'source'])
      const nextStatus = readString(source, ['status'])
      const registeredDate = normalizeISODate(
        readString(source, ['registeredDate', 'dateLodged', 'complaintDate', 'createdAt', 'date']),
      )
      const dueDate = normalizeISODate(
        readString(source, ['dueDate', 'expectedResponseDate', 'deadline', 'expectedDate']),
      )

      setForm((prev) => ({
        ...prev,
        complaintName: readString(source, ['complaintName', 'name', 'title', 'subject']) || prev.complaintName,
        registrationNo:
          readString(source, ['registrationNo', 'complaintId', 'referenceNo', 'ticketId']) || prev.registrationNo,
        platform: platformOptions.includes(nextPlatform as (typeof platformOptions)[number]) ? nextPlatform : prev.platform,
        status: statusOptions.includes(nextStatus as ComplaintStatus) ? nextStatus : prev.status,
        registeredDate: registeredDate || prev.registeredDate,
        place: readString(source, ['place', 'location', 'notes', 'address']) || prev.place,
        department: readString(source, ['department', 'departmentName', 'office']) || prev.department,
        dueDate: dueDate || prev.dueDate,
        officeEmail: readString(source, ['officeEmail', 'email', 'contactEmail']) || prev.officeEmail,
        officePhone: readString(source, ['officePhone', 'phone', 'contactPhone']) || prev.officePhone,
        description: readString(source, ['description', 'details', 'body', 'message']) || prev.description,
      }))

      setImportMessage('Form fields updated from JSON.')
    } catch {
      setImportError('Invalid JSON. Please paste a valid JSON object.')
    }
  }

  function saveEdits(id: string) {
    const nextStatus = editStatusById[id]
    const nextDue = editDueDateById[id]
    const patch: Partial<{ status: ComplaintStatus; expectedResponseDate: string | undefined }> = {}
    if (nextStatus) patch.status = nextStatus as ComplaintStatus
    patch.expectedResponseDate = nextDue?.trim() ? nextDue : undefined
    void updateComplaint(id, patch)
  }

  async function removeComplaint(id: string) {
    await deleteComplaint(id)
    setOpenComplaintId((prev) => (prev === id ? null : prev))
  }

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-6">
      <Card className="overflow-hidden border-white/45 bg-gradient-to-r from-amber-100/85 via-orange-50/70 to-sky-100/70">
        <CardContent className="flex flex-col gap-3 p-5 md:p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Intake</div>
          <div className="font-display text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Complaint Registry
          </div>
          <p className="max-w-3xl text-sm text-slate-700 md:text-base">
            Capture new submissions, update due dates and statuses, and keep all records in one searchable timeline.
          </p>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => setShowForm((v) => !v)}>{showForm ? 'Hide Form' : 'Add Complaint'}</Button>
      </div>

      {showForm ? (
        <Card className="bg-card/75">
          <CardHeader>
            <CardTitle>Complaint Form</CardTitle>
            <CardDescription>Enter complaint details.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="form-json-input">Paste Complaint JSON</Label>
              <div className="flex flex-col gap-2 md:flex-row">
                <Textarea
                  id="form-json-input"
                  className="min-h-[130px] md:flex-1"
                  placeholder='{"complaintName":"Road damage","registrationNo":"MORTH/E/2026/001","platform":"PGPortal","status":"Submitted","registeredDate":"2026-02-18","department":"PWD","place":"Kalyan, Thane","dueDate":"2026-03-20","officeEmail":"office@example.com","officePhone":"+91-9000000000","description":"Road is damaged near bridge."}'
                  value={importPayload}
                  onChange={(e) => setImportPayload(e.target.value)}
                />
                <Button type="button" className="md:self-start" onClick={fillFormFromPayload}>
                  Auto Fill
                </Button>
              </div>
              {importError ? <p className="text-sm text-red-600">{importError}</p> : null}
              {!importError && importMessage ? <p className="text-sm text-emerald-700">{importMessage}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="complaint-name">Complaint Name</Label>
              <Input
                id="complaint-name"
                placeholder="Road damage on Shahad Bridge"
                value={form.complaintName}
                onChange={(e) => setForm((prev) => ({ ...prev, complaintName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration-no">Registration No.</Label>
              <Input
                id="registration-no"
                placeholder="MORTH/E/2025/0027899"
                value={form.registrationNo}
                onChange={(e) => setForm((prev) => ({ ...prev, registrationNo: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select
                value={form.platform}
                onValueChange={(value) => setForm((prev) => ({ ...prev, platform: value }))}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platformOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="registered-date">Registered Date</Label>
              <Input
                id="registered-date"
                type="date"
                value={form.registeredDate}
                onChange={(e) => setForm((prev) => ({ ...prev, registeredDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                placeholder="Public Works Department"
                value={form.department}
                onChange={(e) => setForm((prev) => ({ ...prev, department: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="place">Place</Label>
              <Input
                id="place"
                placeholder="Kalyan, Thane"
                value={form.place}
                onChange={(e) => setForm((prev) => ({ ...prev, place: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="office-email">Office Contact</Label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  id="office-email"
                  type="email"
                  placeholder="Email"
                  value={form.officeEmail}
                  onChange={(e) => setForm((prev) => ({ ...prev, officeEmail: e.target.value }))}
                />
                <Input
                  id="office-phone"
                  type="tel"
                  placeholder="Phone No."
                  value={form.officePhone}
                  onChange={(e) => setForm((prev) => ({ ...prev, officePhone: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                className="min-h-[160px]"
                placeholder="Describe the complaint in detail..."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={insertComplaint}>Insert</Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="bg-card/75">
        <CardHeader>
          <CardTitle>Complaints</CardTitle>
          <CardDescription>Inserted complaint records appear below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {complaints.length === 0 ? <p className="text-sm text-muted-foreground">No complaints added yet.</p> : null}

          <div className="space-y-3">
            {complaints.map((item, index) => (
              <div key={item.id} className="rounded-xl border border-white/40 bg-background/50 shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenComplaintId((prev) => (prev === item.id ? null : item.id))}
                  className="w-full rounded-xl text-left transition-colors hover:bg-accent/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <div className="grid grid-cols-1 gap-2 p-4 text-[15px] font-semibold text-foreground md:grid-cols-[1fr_2fr_1.2fr_1.2fr_2fr_auto] md:items-center">
                    <p>{index + 1}</p>
                    <p>{item.complaintName || item.description || '-'}</p>
                    <Badge className={`w-fit ${getPlatformBadgeClass(item.portalName)}`}>{getPlatformDisplayName(item.portalName)}</Badge>
                    <Badge className={`w-fit ${statusColorMap[item.status] ?? 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                      {item.status || '-'}
                    </Badge>
                    <p className="truncate">{item.notes || '-'}</p>
                    <p className="text-xl leading-none">{openComplaintId === item.id ? '-' : '+'}</p>
                  </div>
                </button>

                {openComplaintId === item.id ? (
                  <div className="grid grid-cols-1 gap-2 border-t px-4 py-3 text-sm md:grid-cols-2">
                    <p><strong>Complaint Name:</strong> {item.complaintName || '-'}</p>
                    <p><strong>Registration No.:</strong> {item.complaintId || '-'}</p>
                    <p>
                      <strong>Platform:</strong>{' '}
                      <Badge className={`ml-1 inline-flex ${getPlatformBadgeClass(item.portalName)}`}>{getPlatformDisplayName(item.portalName)}</Badge>
                    </p>
                    <div className="space-y-1">
                      <p>
                        <strong>Status:</strong>{' '}
                        <Badge className={`ml-1 inline-flex ${statusColorMap[item.status] ?? 'border-slate-200 bg-slate-100 text-slate-700'}`}>
                          {item.status || '-'}
                        </Badge>
                      </p>
                      <Select
                        value={editStatusById[item.id] ?? item.status}
                        onValueChange={(value) =>
                          setEditStatusById((prev) => ({ ...prev, [item.id]: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p><strong>Registered Date:</strong> {item.dateLodged || '-'}</p>
                    <p><strong>Department:</strong> {item.department || '-'}</p>
                    <p><strong>Place:</strong> {item.notes || '-'}</p>
                    <div className="space-y-1">
                      <p><strong>Due Date:</strong></p>
                      <Input
                        type="date"
                        value={editDueDateById[item.id] ?? item.expectedResponseDate ?? ''}
                        onChange={(e) =>
                          setEditDueDateById((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                      />
                    </div>
                    <p><strong>Office Email:</strong> {item.officeEmail || '-'}</p>
                    <p><strong>Office Phone:</strong> {item.officePhone || '-'}</p>
                    <p className="md:col-span-2"><strong>Description:</strong> {item.description || '-'}</p>
                    <div className="md:col-span-2 flex gap-2">
                      <Button type="button" onClick={() => saveEdits(item.id)}>
                        Save
                      </Button>
                      <Button type="button" variant="destructive" onClick={() => void removeComplaint(item.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


