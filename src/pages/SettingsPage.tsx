import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SettingsPage() {
  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-6">
      <Card className="overflow-hidden border-white/45 bg-gradient-to-r from-emerald-100/80 via-cyan-50/70 to-sky-100/80">
        <CardContent className="flex flex-col gap-3 p-5 md:p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Preferences</div>
          <div className="font-display text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Workspace Settings
          </div>
          <p className="max-w-3xl text-sm text-slate-700 md:text-base">
            Configure defaults and account-level controls for your complaint operations workspace.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <Card className="bg-card/75">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>User profile and contact preferences.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This section is planned and will include user identity and notification controls.
          </CardContent>
        </Card>

        <Card className="bg-card/75">
          <CardHeader>
            <CardTitle>Data</CardTitle>
            <CardDescription>Storage and sync behavior.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Data management options will appear here in an upcoming update.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
