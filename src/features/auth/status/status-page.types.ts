import type { ReactNode } from "react"

export interface StatusPageProps {
  title?: string
  description: ReactNode
  accentState: string
  accentLabel?: string
  accentClassName?: string
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
}
