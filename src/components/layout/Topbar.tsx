import { useState } from 'react'
import { Menu, Moon, Sun } from 'lucide-react'

import { AlertsDropdown } from '@/components/layout/AlertsDropdown'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sidebar } from '@/components/layout/Sidebar'
import { useUIStore } from '@/store/uiStore'

export function Topbar({ title }: { title: string }) {
  const theme = useUIStore((s) => s.theme)
  const toggleTheme = useUIStore((s) => s.toggleTheme)
  const [menuOpen, setMenuOpen] = useState(false)
  const today = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="flex items-center gap-3">
      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent
          className="left-0 top-0 h-dvh w-[22rem] translate-x-0 translate-y-0 rounded-none border-r bg-card/80 p-4 backdrop-blur-md sm:rounded-none"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-xl font-semibold tracking-tight">{title}</div>
        <div className="truncate text-xs text-muted-foreground md:text-sm">
          Track RTI requests and grievances across portals with a single live view.
        </div>
      </div>

      <div className="hidden rounded-xl border border-white/50 bg-white/60 px-3 py-1.5 text-xs font-medium text-muted-foreground md:block">
        {today}
      </div>

      <AlertsDropdown />

      <Button variant="outline" size="icon" className="border-white/50 bg-white/60" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  )
}
