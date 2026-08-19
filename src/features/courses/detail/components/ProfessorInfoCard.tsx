import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { CourseTheme } from "@/types/theme"

interface ProfessorInfoCardProps {
  theme: CourseTheme
  professorName: string
  professorEmail: string
  professorFaculty: string
  getInitials: (value: unknown, fallback?: string) => string
  isStudent?: boolean
}

export default function ProfessorInfoCard({ theme, professorName, professorEmail, professorFaculty, getInitials, isStudent = false }: ProfessorInfoCardProps) {
  return (
    <Card className={cn("mx-auto w-full max-w-[25rem] overflow-hidden rounded-[1.65rem] border bg-white shadow-sm", theme.heroBorder)}>
      <CardContent className="flex flex-col p-0">
        <div className={cn("relative flex overflow-hidden border-b px-5 py-4.5 text-left sm:px-6", theme.heroStatBg)}>
          <div className="relative flex items-center gap-3.5 min-w-0">
            <div className={cn("flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.15rem] border text-lg font-bold shadow-xs", theme.heroBorder, theme.weekNumBg, theme.weekNumText)}>
              {getInitials(professorName)}
            </div>
            <div className="min-w-0">
              <p className={cn("text-[10px] font-bold tracking-[0.22em] uppercase", theme.heroStatLabel)}>Titular curs</p>
              <h3 className={cn("mt-0.5 truncate text-lg font-bold tracking-tight", theme.heroStatText)}>{professorName}</h3>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 bg-white px-5 py-5 text-left sm:px-6 sm:py-6">
          <div className={cn("flex items-center gap-3", isStudent ? "" : "rounded-[1.25rem] border border-[#e4d8cd] bg-[#fcf8f3] px-3.5 py-3")}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#f5eee5] text-xl" aria-hidden="true">📧</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">Email</p>
              <p className="truncate text-sm font-semibold text-slate-800 sm:text-base">{professorEmail}</p>
            </div>
          </div>

          <div className={cn("flex items-center gap-3", isStudent ? "" : "rounded-[1.25rem] border border-[#e4d8cd] bg-[#fcf8f3] px-3.5 py-3")}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#f5eee5] text-xl" aria-hidden="true">🎓</span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold tracking-[0.16em] uppercase text-slate-400">Facultate</p>
              <p className="truncate text-sm font-semibold text-slate-800 sm:text-base">{professorFaculty}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
