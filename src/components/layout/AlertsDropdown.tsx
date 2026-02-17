import { Bell, CircleAlert, CircleCheck, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { daysUntilDue, displayStatus, getDueDate } from '@/lib/dates'
import { useComplaintsStore } from '@/store/complaintsStore'

type AlertItem = {
  id: string
  complaintId: string
  portalName: string
  daysUntil: number
  dueISO: string
  kind: 'overdue' | 'upcoming'
}

function buildAlerts(): { overdue: AlertItem[]; upcoming: AlertItem[] } {
  const complaints = useComplaintsStore.getState().complaints
  const items: AlertItem[] = []

  for (const c of complaints) {
    if (c.status === 'Resolved' || c.status === 'Closed') continue
    const until = daysUntilDue(c)
    const due = getDueDate(c)
    if (typeof until !== 'number' || !due) continue

    if (until < 0) {
      items.push({
        id: c.id,
        complaintId: c.complaintId,
        portalName: c.portalName,
        daysUntil: until,
        dueISO: due.toISOString(),
        kind: 'overdue',
      })
      continue
    }

    if (until <= 7) {
      items.push({
        id: c.id,
        complaintId: c.complaintId,
        portalName: c.portalName,
        daysUntil: until,
        dueISO: due.toISOString(),
        kind: 'upcoming',
      })
    }
  }

  const overdue = items
    .filter((i) => i.kind === 'overdue')
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 6)

  const upcoming = items
    .filter((i) => i.kind === 'upcoming')
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 6)

  return { overdue, upcoming }
}

export function AlertsDropdown() {
  const complaints = useComplaintsStore((s) => s.complaints)

  const counts = complaints.reduce(
    (acc, c) => {
      const st = displayStatus(c)
      if (st === 'Overdue') acc.overdue += 1
      else if (c.status !== 'Resolved' && c.status !== 'Closed') {
        const until = daysUntilDue(c)
        if (typeof until === 'number' && until >= 0 && until <= 7) acc.upcoming += 1
      }
      return acc
    },
    { overdue: 0, upcoming: 0 },
  )

  const total = counts.overdue + counts.upcoming
  const alerts = buildAlerts()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 bg-card text-foreground shadow-sm backdrop-blur transition-all hover:border-primary/40 hover:bg-accent/70 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Alerts"
        >
          <Bell className="h-4 w-4" />
          {total > 0 ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-destructive-foreground">
              {Math.min(99, total)}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[360px]" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="font-display">Alerts</span>
          <span className="text-xs text-muted-foreground">Next 7 days + overdue</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {total === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">No deadlines approaching.</div>
        ) : (
          <>
            {alerts.overdue.length ? (
              <>
                <div className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Overdue
                </div>
                {alerts.overdue.map((a) => (
                  <DropdownMenuItem key={a.id} className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 h-4 w-4 text-destructive" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{a.complaintId}</div>
                      <div className="truncate text-xs text-muted-foreground">{a.portalName}</div>
                    </div>
                    <Badge className="shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {Math.abs(a.daysUntil)}d late
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </>
            ) : null}

            {alerts.upcoming.length ? (
              <>
                <div className={cn('px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground', alerts.overdue.length ? 'border-t' : '')}>
                  Upcoming
                </div>
                {alerts.upcoming.map((a) => (
                  <DropdownMenuItem key={a.id} className="flex items-start gap-3">
                    <Clock3 className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{a.complaintId}</div>
                      <div className="truncate text-xs text-muted-foreground">{a.portalName}</div>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {a.daysUntil}d
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </>
            ) : null}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/complaints?status=Overdue" className="flex items-center gap-2">
            <CircleCheck className="h-4 w-4" />
            View complaint list
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
