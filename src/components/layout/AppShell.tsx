import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'

function usePageTitle(): string {
  const { pathname } = useLocation()
  if (pathname.startsWith('/complaints')) return 'Complaints'
  if (pathname.startsWith('/settings')) return 'Settings'
  return 'Dashboard'
}

export function AppShell({ children }: { children: ReactNode }) {
  const title = usePageTitle()

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-20 h-[460px] w-[460px] rounded-full bg-gradient-to-br from-sky-400/35 to-cyan-500/0 blur-3xl" />
        <div className="absolute right-[-160px] top-16 h-[540px] w-[540px] rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/0 blur-3xl" />
        <div className="absolute bottom-[-240px] left-1/3 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-500/0 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.08)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_85%)]" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-screen-2xl gap-4 p-4 md:gap-6 md:p-6">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex min-w-0 flex-1 flex-col gap-4 md:gap-6">
          <div className="rounded-3xl border border-white/40 bg-card/70 p-4 shadow-lg shadow-sky-900/10 backdrop-blur-xl md:p-5">
            <Topbar title={title} />
          </div>

          <div className="min-w-0 flex-1">{children}</div>
        </main>
      </div>
    </div>
  )
}
