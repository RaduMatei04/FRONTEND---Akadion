import { ChevronDown, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import type { FieldErrors } from "@/types/api"
import type { CourseTheme } from "@/types/theme"

interface CourseRecord {
  activ?: boolean
}

interface CourseForm {
  denumire: string
  descriere: string
  dataInceput: string
}

interface CourseEditorCardProps {
  course: CourseRecord
  courseEditorOpen: boolean
  setCourseEditorOpen: (value: boolean | ((currentValue: boolean) => boolean)) => void
  courseForm: CourseForm
  fieldErrors: FieldErrors
  activeAction: string
  theme: CourseTheme
  updateCourseField: (field: keyof CourseForm, value: string) => void
  handleSaveCourse: (event: React.FormEvent<HTMLFormElement>) => void
}

export default function CourseEditorCard({
  course,
  courseEditorOpen,
  setCourseEditorOpen,
  courseForm,
  fieldErrors,
  activeAction,
  theme,
  updateCourseField,
  handleSaveCourse,
}: CourseEditorCardProps) {
  return (
    <Card className="gap-0 overflow-hidden rounded-[1.75rem] border-[#e4d8cd] bg-white/92 py-0 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
      <button
        type="button"
        onClick={() => setCourseEditorOpen((currentValue) => !currentValue)}
        className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-[#fbf6f0] sm:flex-row sm:items-center sm:justify-between sm:px-6"
        aria-expanded={courseEditorOpen}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-lg text-slate-900">Editare curs</CardTitle>
            <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase ${course.activ ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"}`}>
              {course.activ ? "Activ" : "Inactiv"}
            </span>
          </div>
          <CardDescription className="mt-1">Doar profesorul proprietar poate modifica datele cursului.</CardDescription>
        </div>
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", theme.btnIconBg, theme.btnIconBorder, theme.btnIconText)}>
          <ChevronDown className={`h-5 w-5 transition-transform ${courseEditorOpen ? "rotate-180" : ""}`} />
        </span>
      </button>

      {courseEditorOpen ? (
        <CardContent className="border-t border-[#eadfd4] px-5 py-5 sm:px-6 sm:py-6">
          <form className="grid gap-5 lg:grid-cols-[1fr_220px]" onSubmit={handleSaveCourse}>
            <div className="space-y-2.5">
              <Label htmlFor="course-name" className="text-[0.8rem] font-semibold tracking-[0.16em] text-slate-600">DENUMIRE *</Label>
              <Input id="course-name" value={courseForm.denumire} onChange={(event) => updateCourseField("denumire", event.target.value)} className="h-13 rounded-2xl border-[#e4d8cd] bg-[#f7efe6] px-4 text-base shadow-none focus-visible:border-[#24385b] focus-visible:ring-[#24385b]/10" />
              {fieldErrors.denumire ? <p className="text-sm text-rose-600">{fieldErrors.denumire}</p> : null}
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="course-start" className="text-[0.8rem] font-semibold tracking-[0.16em] text-slate-600">DATA ÎNCEPUT *</Label>
              <Input id="course-start" type="date" value={courseForm.dataInceput} onChange={(event) => updateCourseField("dataInceput", event.target.value)} className="h-13 rounded-2xl border-[#e4d8cd] bg-[#f7efe6] px-4 text-base shadow-none focus-visible:border-[#24385b] focus-visible:ring-[#24385b]/10" />
              {fieldErrors.dataInceput ? <p className="text-sm text-rose-600">{fieldErrors.dataInceput}</p> : null}
            </div>

            <div className="space-y-2.5 lg:col-span-2">
              <Label htmlFor="course-description" className="text-[0.8rem] font-semibold tracking-[0.16em] text-slate-600">DESCRIERE</Label>
              <textarea id="course-description" value={courseForm.descriere} onChange={(event) => updateCourseField("descriere", event.target.value)} className="min-h-28 w-full rounded-2xl border border-[#e4d8cd] bg-[#f7efe6] px-4 py-3 text-base text-slate-900 outline-none focus:border-[#24385b] focus:ring-2 focus:ring-[#24385b]/10" />
              {fieldErrors.descriere ? <p className="text-sm text-rose-600">{fieldErrors.descriere}</p> : null}
            </div>

            <div className="flex flex-wrap gap-2 lg:col-span-2">
              <Button type="submit" disabled={Boolean(activeAction)} className={cn("rounded-2xl px-5 text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}>
                <Save className="h-4 w-4" />
                {activeAction === "save-course" ? "Se salvează..." : "Salvează"}
              </Button>
            </div>
          </form>
        </CardContent>
      ) : null}
    </Card>
  )
}
