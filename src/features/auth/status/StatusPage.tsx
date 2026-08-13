import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserStateBadge } from "@/auth/badges"

import type { StatusPageProps } from "@/types/app"

const completeProfileLogo = "/assets/logo_bufnita.png"

export default function StatusPage({ title, description, accentState, accentLabel, accentClassName, primaryAction, secondaryAction }: StatusPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-2xl border-border/60 bg-card/95 shadow-sm">
        <CardHeader className="space-y-4 text-center">
          <img src={completeProfileLogo} alt="Akadion" className="mx-auto h-20 w-auto object-contain" />
          <div className="space-y-3">
            <div className="flex justify-center">
              <UserStateBadge state={accentState} label={accentLabel} className={accentClassName} />
            </div>
            {title ? <CardTitle className="text-3xl tracking-tight">{title}</CardTitle> : null}
            <CardDescription className="mx-auto max-w-xl text-base leading-7">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap justify-center gap-3">
          {primaryAction}
          {secondaryAction}
        </CardContent>
      </Card>
    </main>
  )
}
