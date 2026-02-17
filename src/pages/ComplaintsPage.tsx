import { useEffect, useState } from 'react'

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
      'Gram Panchayat Punevadi, Taluka Parner, District Ahilyanagar: à¤•à¥ƒà¤ªà¤¯à¤¾ 2022-2025 à¤¯à¤¾ à¤•à¤¾à¤²à¤¾à¤µà¤§à¥€à¤¤ à¤¹à¤¾à¤¤à¥€ à¤˜à¥‡à¤¤à¤²à¥‡à¤²à¥à¤¯à¤¾ à¤¸à¤°à¥à¤µ à¤°à¤¸à¥à¤¤à¥‡ à¤¬à¤¾à¤‚à¤§à¤•à¤¾à¤®, à¤°à¤¸à¥à¤¤à¥à¤¯à¤¾à¤µà¤°à¥€à¤² à¤¦à¤¿à¤µà¤¾à¤¬à¤¤à¥à¤¤à¥€ à¤†à¤£à¤¿ à¤¸à¤¾à¤°à¥à¤µà¤œà¤¨à¤¿à¤• à¤¶à¥Œà¤šà¤¾à¤²à¤¯ à¤•à¤¾à¤®à¤¾à¤‚à¤šà¤¾ à¤¸à¤‚à¤ªà¥‚à¤°à¥à¤£ à¤¤à¤ªà¤¶à¥€à¤² à¤¦à¥à¤¯à¤¾à¤µà¤¾, à¤œà¥à¤¯à¤¾à¤®à¤§à¥à¤¯à¥‡ à¤®à¤‚à¤œà¥‚à¤° à¤°à¤•à¥à¤•à¤®, à¤–à¤°à¥à¤š, à¤•à¤‚à¤¤à¥à¤°à¤¾à¤Ÿà¤¦à¤¾à¤° à¤¤à¤ªà¤¶à¥€à¤², à¤•à¤¾à¤® à¤†à¤¦à¥‡à¤¶, à¤ªà¥‚à¤°à¥à¤£à¤¤à¤¾ à¤¸à¥à¤¥à¤¿à¤¤à¥€, à¤¯à¥‹à¤œà¤¨à¤¾ à¤¸à¥à¤°à¥‹à¤¤, à¤¤à¤ªà¤¾à¤¸à¤£à¥€ à¤…à¤¹à¤µà¤¾à¤² à¤†à¤£à¤¿ à¤¸à¤‚à¤¬à¤‚à¤§à¤¿à¤¤ à¤•à¤¾à¤—à¤¦à¤ªà¤¤à¥à¤°à¤¾à¤‚à¤šà¥à¤¯à¤¾ à¤ªà¥à¤°à¤¤à¥€à¤‚à¤šà¤¾ à¤¸à¤®à¤¾à¤µà¥‡à¤¶ à¤†à¤¹à¥‡.',
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
      'TO Gram Panchayat Punevadi, Parner Taluka, Ahilyanagar: à¤†à¤°à¥à¤¥à¤¿à¤• à¤µà¤°à¥à¤· 2023-24, 2024-25 à¤†à¤£à¤¿ 2025-26 à¤®à¤§à¥€à¤² à¤¸à¤°à¥à¤µ à¤µà¤¿à¤•à¤¾à¤¸ à¤•à¤¾à¤®à¤¾à¤‚à¤šà¤¾ à¤¸à¤µà¤¿à¤¸à¥à¤¤à¤° à¤¤à¤ªà¤¶à¥€à¤² à¤¦à¥à¤¯à¤¾à¤µà¤¾, à¤œà¥à¤¯à¤¾à¤®à¤§à¥à¤¯à¥‡ à¤•à¤¾à¤®à¤¾à¤šà¥‡ à¤¨à¤¾à¤µ/à¤ à¤¿à¤•à¤¾à¤£/à¤¶à¥à¤°à¥‡à¤£à¥€, à¤®à¤‚à¤œà¥‚à¤° à¤†à¤£à¤¿ à¤ªà¥à¤°à¤¤à¥à¤¯à¤•à¥à¤· à¤–à¤°à¥à¤š, à¤•à¤‚à¤¤à¥à¤°à¤¾à¤Ÿà¤¦à¤¾à¤° à¤•à¤¿à¤‚à¤µà¤¾ à¤µà¤¿à¤•à¥à¤°à¥‡à¤¤à¥à¤¯à¤¾à¤‚à¤šà¥€ à¤¨à¤¾à¤µà¥‡, à¤¸à¥à¤°à¥à¤µà¤¾à¤¤ à¤¤à¤¾à¤°à¥€à¤–, à¤ªà¥‚à¤°à¥à¤£à¤¤à¤¾ à¤¤à¤¾à¤°à¥€à¤– (à¤•à¤¿à¤‚à¤µà¤¾ à¤…à¤ªà¥‡à¤•à¥à¤·à¤¿à¤¤ à¤ªà¥‚à¤°à¥à¤£à¤¤à¤¾ à¤¤à¤¾à¤°à¥€à¤–) à¤†à¤£à¤¿ à¤¸à¤§à¥à¤¯à¤¾à¤šà¥€ à¤¸à¥à¤¥à¤¿à¤¤à¥€ à¤¯à¤¾à¤‚à¤šà¤¾ à¤¸à¤®à¤¾à¤µà¥‡à¤¶ à¤†à¤¹à¥‡.',
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
                    <p>{item.portalName || '-'}</p>
                    <p>{item.status || '-'}</p>
                    <p className="truncate">{item.notes || '-'}</p>
                    <p className="text-xl leading-none">{openComplaintId === item.id ? '-' : '+'}</p>
                  </div>
                </button>

                {openComplaintId === item.id ? (
                  <div className="grid grid-cols-1 gap-2 border-t px-4 py-3 text-sm md:grid-cols-2">
                    <p><strong>Complaint Name:</strong> {item.complaintName || '-'}</p>
                    <p><strong>Registration No.:</strong> {item.complaintId || '-'}</p>
                    <p><strong>Platform:</strong> {item.portalName || '-'}</p>
                    <div className="space-y-1">
                      <p><strong>Status:</strong></p>
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

