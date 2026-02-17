import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function NotFoundPage() {
  return (
    <div className="grid min-h-[70dvh] place-items-center px-4">
      <Card className="w-full max-w-xl overflow-hidden border-white/45 bg-gradient-to-br from-slate-900 via-sky-900 to-cyan-800 text-white shadow-2xl">
        <CardContent className="flex flex-col items-center gap-5 p-8 text-center md:p-10">
          <div className="font-display text-7xl font-semibold tracking-tight text-cyan-100">404</div>
          <div className="space-y-1">
            <p className="font-display text-2xl font-semibold tracking-tight">Page not found</p>
            <p className="text-sm text-cyan-100/85">The route does not exist or may have been moved.</p>
          </div>
          <Button asChild className="border-white/20 bg-white/90 text-slate-900 hover:bg-white">
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
