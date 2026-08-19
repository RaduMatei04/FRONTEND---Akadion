import { type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardStatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: ReactNode
  note?: ReactNode
  tone?: "blue" | "turquoise" | "indigo"
  action?: ReactNode
}

export default function DashboardStatCard({ icon: Icon, label, value, note, tone = "blue", action }: DashboardStatCardProps) {
  const toneClass = tone === "indigo"
    ? "border border-[#a094cc] bg-linear-to-br from-[#e9e5f7] via-[#d3cbf0] to-[#b1a4dc] text-[#43397a] shadow-[0_12px_28px_rgba(98,85,154,0.12)]"
    : tone === "turquoise"
      ? "border border-[#6fc9a8] bg-linear-to-br from-[#e6f7ef] via-[#c5edda] to-[#94dbbd] text-[#1d7a66] shadow-[0_12px_28px_rgba(47,158,122,0.12)]"
      : "border border-[#8b98c8] bg-linear-to-br from-[#e2e8f8] via-[#c6cff0] to-[#96a5d6] text-[#39436b] shadow-[0_12px_28px_rgba(74,86,129,0.12)]"

  return (
    <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
      <CardContent className="flex items-start justify-between gap-4 px-5 py-5">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {note ? <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p> : null}
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  )
}
