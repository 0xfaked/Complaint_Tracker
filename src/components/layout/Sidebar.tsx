import { NavLink } from 'react-router-dom'
import { BarChart3, FileText } from 'lucide-react'

import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/complaints', label: 'Complaints', icon: FileText },
] as const

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-72 flex-col rounded-3xl border border-white/45 bg-card/75 p-4 shadow-lg shadow-slate-900/10 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-2 pb-4">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-primary-foreground shadow-md">
          <span className="font-display text-sm font-semibold tracking-tight">CT</span>
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-semibold tracking-tight text-foreground">Complaint Tracker</div>
          <div className="text-xs text-muted-foreground">RTI and grievance command center</div>
        </div>
      </div>

      <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/90">
        Navigation
      </div>
      <nav className="mt-2 flex flex-1 flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-foreground/85 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/60 hover:text-foreground hover:shadow-sm',
                isActive &&
                  'border-white/45 bg-gradient-to-r from-sky-100 to-cyan-50 text-slate-900 shadow-md shadow-sky-900/10',
              )
            }
          >
            <Icon className="h-4 w-4 opacity-80 transition-opacity group-hover:opacity-100" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-4 rounded-2xl border border-white/45 bg-background/60 p-3 text-xs text-muted-foreground">
        Local-first dashboard. Data is stored in your browser (LocalStorage + IndexedDB).
      </div>
    </aside>
  )
}
