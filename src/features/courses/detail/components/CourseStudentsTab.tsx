import { Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { getStudentName } from "../course-detail.utils"
import type { CourseTheme } from "@/types/theme"
import type { AuthUser } from "@/types/user"

interface CourseStudentsTabProps {
  students: AuthUser[]
  theme: CourseTheme
}

export default function CourseStudentsTab({ students, theme }: CourseStudentsTabProps) {
  return (
    <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
      <CardHeader className="border-b border-[#eadfd4] px-6 py-6">
        <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
          <Users className={cn("h-5 w-5", theme.iconText)} />
          Studenți înscriși
        </CardTitle>
        <CardDescription>Total: {students.length} studenți.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 px-6 py-6">
        {students.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d8ccbf] bg-[#fbf6f0] px-5 py-8 text-center text-sm text-slate-500">
            Nu există studenți înscriși la acest curs.
          </div>
        ) : null}
        {students.map((student) => (
          <article key={student.id ?? student.mail} className="flex flex-col gap-2 rounded-3xl border border-[#e4d8cd] bg-[#fbf6f0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold", theme.studentInitialBg, theme.studentInitialText)}>
                {String(student.prenume || student.mail || "S").charAt(0).toUpperCase()}{String(student.nume || "").charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{getStudentName(student)}</h3>
                <p className="text-sm text-slate-500">{student.mail || "-"}</p>
                {student.facultate ? <p className="text-sm text-slate-500">{student.facultate}</p> : null}
              </div>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  )
}
