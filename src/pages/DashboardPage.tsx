import { useMemo } from 'react'
import { format, parseISO, startOfWeek, subWeeks } from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { displayStatus, daysPending, daysUntilDue, getDueDate } from '@/lib/dates'
import { useComplaintsStore } from '@/store/complaintsStore'

const statusColors: Record<string, string> = {
  Filed: '#2563eb',
  Pending: '#64748b',
  'In Progress': '#f59e0b',
  'First Appeal': '#0ea5e9',
  'Second Appeal': '#06b6d4',
  Resolved: '#22c55e',
  Overdue: '#ef4444',
}

function formatShortDate(d: Date) {
  return format(d, 'MMM d')
}

function platformLabel(portalName?: string) {
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

function overdueBadgeClass(daysLate: number) {
  if (daysLate >= 90) return 'border-red-700 bg-red-950 text-red-100'
  if (daysLate >= 30) return 'border-rose-700 bg-rose-950 text-rose-100'
  return 'border-orange-700 bg-orange-950 text-orange-100'
}

function upcomingBadge(until: number) {
  if (until === 0) return { label: 'Today', className: 'border-red-700 bg-red-950 text-red-100' }
  if (until === 1) return { label: 'Tomorrow', className: 'border-amber-700 bg-amber-950 text-amber-100' }
  if (until <= 3) return { label: `${until}d left`, className: 'border-yellow-700 bg-yellow-900 text-yellow-100' }
  return { label: `${until}d left`, className: 'border-blue-700 bg-blue-950 text-blue-100' }
}

export function DashboardPage() {
  const complaints = useComplaintsStore((s) => s.complaints)
  const smartUmcTotal = useMemo(
    () =>
      complaints.filter(
        (c) => c.portalName === 'Smart_UMC_Grievances' || c.portalName === 'UMC_Grievances',
      ).length,
    [complaints],
  )

  const overview = useMemo(() => {
    const total = complaints.length
    let resolved = 0
    let overdue = 0
    let pending = 0

    for (const c of complaints) {
      const st = displayStatus(c)
      if (st === 'Resolved') resolved += 1
      else if (st === 'Overdue') overdue += 1
      else pending += 1
    }

    return { total, resolved, overdue, pending }
  }, [complaints])

  const statusDistribution = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of complaints) {
      const st = displayStatus(c)
      map.set(st, (map.get(st) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [complaints])

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of complaints) map.set(c.category, (map.get(c.category) ?? 0) + 1)
    return Array.from(map.entries()).map(([category, count]) => ({ category, count }))
  }, [complaints])

  const portalData = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of complaints) map.set(c.portalName, (map.get(c.portalName) ?? 0) + 1)
    const sorted = Array.from(map.entries())
      .map(([portal, count]) => ({ portal, count }))
      .sort((a, b) => b.count - a.count)

    if (sorted.length <= 6) return sorted
    const top = sorted.slice(0, 6)
    const rest = sorted.slice(6).reduce((acc, x) => acc + x.count, 0)
    return rest ? [...top, { portal: 'Other', count: rest }] : top
  }, [complaints])

  const timelineData = useMemo(() => {
    const weeks = 12
    const buckets = new Map<string, number>()
    for (let i = 0; i < weeks; i += 1) {
      const weekStart = startOfWeek(subWeeks(new Date(), weeks - 1 - i), { weekStartsOn: 1 })
      const key = format(weekStart, 'yyyy-MM-dd')
      buckets.set(key, 0)
    }

    for (const c of complaints) {
      const lodged = parseISO(c.dateLodged)
      const weekStart = startOfWeek(lodged, { weekStartsOn: 1 })
      const key = format(weekStart, 'yyyy-MM-dd')
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }

    return Array.from(buckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([weekStart, count]) => ({ weekStart, label: formatShortDate(parseISO(weekStart)), count }))
  }, [complaints])

  const alertItems = useMemo(() => {
    const items = complaints
      .filter((c) => c.status !== 'Resolved')
      .map((c) => {
        const until = daysUntilDue(c)
        const due = getDueDate(c)
        return { c, until, due }
      })
      .filter((x) => typeof x.until === 'number' && x.due)
      .sort((a, b) => (a.until as number) - (b.until as number))

    const overdue = items.filter((x) => (x.until as number) < 0).slice(0, 5)
    const upcoming = items.filter((x) => (x.until as number) >= 0 && (x.until as number) <= 7).slice(0, 5)
    const dueIn48h = items.filter((x) => (x.until as number) >= 0 && (x.until as number) <= 2).length
    const dueIn7d = items.filter((x) => (x.until as number) >= 0 && (x.until as number) <= 7).length
    return { overdue, upcoming, dueIn48h, dueIn7d }
  }, [complaints])

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-6">
      <Card className="overflow-hidden border-white/45 bg-gradient-to-r from-sky-100/85 via-cyan-50/80 to-amber-100/70">
        <CardContent className="flex flex-col gap-3 p-5 md:p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Overview</div>
          <div className="font-display text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Complaint Operations Dashboard
          </div>
          <p className="max-w-3xl text-sm text-slate-700 md:text-base">
            Real-time monitoring of status distribution, weekly trends, and due-date risk across all registered complaints.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5 md:gap-6">
        <Card className="bg-card/75">
          <CardHeader className="pb-2">
            <CardDescription>Total Complaints</CardDescription>
            <CardTitle className="text-3xl">{overview.total}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Across all portals and categories.</CardContent>
        </Card>
        <Card className="bg-card/75">
          <CardHeader className="pb-2">
            <CardDescription>Pending</CardDescription>
            <CardTitle className="text-3xl">{overview.pending}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Not resolved, not overdue.</CardContent>
        </Card>
        <Card className="bg-card/75">
          <CardHeader className="pb-2">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-3xl">{overview.resolved}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Closed and completed items.</CardContent>
        </Card>
        <Card className="bg-card/75">
          <CardHeader className="pb-2">
            <CardDescription>Overdue</CardDescription>
            <CardTitle className="text-3xl text-destructive">{overview.overdue}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Past due date (computed).</CardContent>
        </Card>
        <Card className="bg-card/75">
          <CardHeader className="pb-2">
            <CardDescription>UMC Grievances</CardDescription>
            <CardTitle className="text-3xl">{smartUmcTotal}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Includes Smart UMC and legacy UMC entries.
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <Card className="bg-card/75">
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Donut chart includes computed Overdue.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/75">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>Complaints lodged per week (last 12 weeks).</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} width={26} tickLine={false} axisLine={false} />
                <RechartsTooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        <Card className="bg-card/75 md:col-span-1">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>RTI vs Grievance vs Other.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} width={26} tickLine={false} axisLine={false} />
                <RechartsTooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/75 md:col-span-2">
          <CardHeader>
            <CardTitle>Portal Statistics</CardTitle>
            <CardDescription>Top portals by volume.</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portalData} margin={{ left: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                <XAxis dataKey="portal" tickLine={false} axisLine={false} interval={0} height={60} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} width={26} tickLine={false} axisLine={false} />
                <RechartsTooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <Card className="bg-card/75">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Deadlines & Alerts</CardTitle>
              <CardDescription>Priority queue for overdue and next 7-day deadlines.</CardDescription>
            </div>
            <Button variant="outline" asChild>
              <a href="/complaints">Open list</a>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded-xl border border-red-800/60 bg-red-950/50 p-3">
                <div className="text-[11px] uppercase tracking-wide text-red-200/90">Overdue</div>
                <div className="text-xl font-semibold text-red-100">{alertItems.overdue.length}</div>
              </div>
              <div className="rounded-xl border border-amber-800/60 bg-amber-950/45 p-3">
                <div className="text-[11px] uppercase tracking-wide text-amber-200/90">Due in 48h</div>
                <div className="text-xl font-semibold text-amber-100">{alertItems.dueIn48h}</div>
              </div>
              <div className="rounded-xl border border-blue-800/60 bg-blue-950/45 p-3">
                <div className="text-[11px] uppercase tracking-wide text-blue-200/90">Due in 7d</div>
                <div className="text-xl font-semibold text-blue-100">{alertItems.dueIn7d}</div>
              </div>
            </div>

            {alertItems.overdue.length === 0 && alertItems.upcoming.length === 0 ? (
              <div className="text-sm text-muted-foreground">No upcoming deadlines.</div>
            ) : null}

            {alertItems.overdue.length ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Overdue
                </div>
                {alertItems.overdue.map(({ c, until, due }) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-3 rounded-xl border bg-background/60 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{c.complaintId}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {platformLabel(c.portalName)} • {c.complaintName || 'No title'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due {due ? format(due, 'yyyy-MM-dd') : 'N/A'}
                      </div>
                    </div>
                    <Badge className={overdueBadgeClass(Math.abs(until as number))}>
                      {Math.abs(until as number)}d late
                    </Badge>
                  </div>
                ))}
              </div>
            ) : null}

            {alertItems.upcoming.length ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Upcoming
                </div>
                {alertItems.upcoming.map(({ c, until, due }) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-3 rounded-xl border bg-background/60 p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{c.complaintId}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {platformLabel(c.portalName)} • {c.complaintName || 'No title'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Due {due ? format(due, 'yyyy-MM-dd') : 'N/A'}
                      </div>
                    </div>
                    <Badge className={upcomingBadge(until as number).className}>
                      {upcomingBadge(until as number).label}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="bg-card/75">
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>Live calculations from your stored data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border bg-background/60 p-3">
              <div className="text-muted-foreground">Oldest open complaint</div>
              <div className="font-medium">
                {(() => {
                  const open = complaints.filter((c) => displayStatus(c) !== 'Resolved')
                  if (!open.length) return 'N/A'
                  const oldest = [...open].sort((a, b) => a.dateLodged.localeCompare(b.dateLodged))[0]
                  return `${daysPending(oldest)} days`
                })()}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border bg-background/60 p-3">
              <div className="text-muted-foreground">Next deadline</div>
              <div className="font-medium">
                {(() => {
                  const open = complaints
                    .filter((c) => c.status !== 'Resolved')
                    .map((c) => ({ c, until: daysUntilDue(c), due: getDueDate(c) }))
                    .filter((x) => typeof x.until === 'number' && x.due)
                    .sort((a, b) => (a.until as number) - (b.until as number))
                  if (!open.length) return 'N/A'
                  const next = open[0]
                  return `${format(next.due as Date, 'yyyy-MM-dd')} (${next.until}d)`
                })()}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border bg-background/60 p-3">
              <div className="text-muted-foreground">Most common status</div>
              <div className="font-medium">
                {statusDistribution[0] ? statusDistribution[0].name : 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

