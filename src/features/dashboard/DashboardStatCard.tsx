import { type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardStatCardProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: ReactNode
  note?: ReactNode
  tone?: "blue" | "amber" | "emerald"
  action?: ReactNode
}

export default function DashboardStatCard({ icon: Icon, label, value, note, tone = "blue", action }: DashboardStatCardProps) {
  const toneClass = tone === "amber"
    ? "border border-[#f0c16f] bg-linear-to-br from-[#fff3df] via-[#ffdea8] to-[#ffc36b] text-[#8a3f0f] shadow-[0_12px_28px_rgba(168,93,21,0.10)]"
    : tone === "emerald"
      ? "border border-[#8fdcae] bg-linear-to-br from-[#e6f9ed] via-[#c8efd7] to-[#91dfaf] text-[#175c34] shadow-[0_12px_28px_rgba(31,107,63,0.10)]"
      : "border border-[#9fc2f4] bg-linear-to-br from-[#edf4ff] via-[#d6e7fb] to-[#a9cdf7] text-[#1f4f86] shadow-[0_12px_28px_rgba(47,95,159,0.10)]"

  return (
    <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
      <CardContent className="flex items-center justify-between gap-4 px-5 py-5">
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
