import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

import type { CourseTheme } from "@/types/theme"
import type { CourseOption } from "@/types/course"

interface AkyCourseSelectViewProps {
  selectedTheme: CourseTheme
  courses: CourseOption[]
  selectedCourseId: string | number | null
  setSelectedCourseId: (value: string) => void
}

export default function AkyCourseSelectView({ selectedTheme, courses, selectedCourseId, setSelectedCourseId }: AkyCourseSelectViewProps) {
  return (
    <div className="p-6">
      <Card className="border-[#d9e4f4] bg-linear-to-br from-[#edf7ff] via-[#f8fbff] to-white shadow-[0_18px_40px_rgba(32,46,84,0.08)]">
        <CardContent className="space-y-4 px-5 py-5">
          <div className="flex items-start gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border bg-linear-to-br ${selectedTheme.accent} ${selectedTheme.heroBorder} ${selectedTheme.heroStatText} shadow-[0_12px_24px_rgba(24,49,83,0.14)]`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-[#24385b]">Salut! Sunt Aky.</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Te pot ajuta cu informații din cursurile tale. Te rog să selectezi un curs pentru a începe conversația.
              </p>
            </div>
          </div>

          {courses.length > 0 ? (
            <div className="pt-2">
              <label className="mb-2 block text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">Alege cursul:</label>
              <select
                className="h-11 w-full rounded-xl border border-[#d9e4f4] bg-white px-3 text-sm text-[#1e3a5f] shadow-sm outline-hidden transition-all focus:border-[#8bc8f1] focus:ring-2 focus:ring-[#8bc8f1]/20"
                value={selectedCourseId || ""}
                onChange={(event) => setSelectedCourseId(event.target.value)}
              >
                <option value="" disabled>Selectează un curs...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.denumire}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-xs italic text-slate-500">Nu ești înrolat la niciun curs momentan.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
