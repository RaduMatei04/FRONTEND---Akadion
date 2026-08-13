import { ArrowRight, CalendarDays, Check, Palette } from "lucide-react"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { COURSE_THEMES, getCourseTheme } from "@/lib/courseThemes"
import { getCourseProgress, getProfessorName } from "@/features/courses/lib/courseView"
import { formatWeeks, formatStudents } from "@/lib/utils"

import type { Course } from "@/types/course"
import type { CourseTheme } from "@/types/theme"

export interface CourseCardProps {
  course: Course
  mode: "professor" | "admin" | "student"
  selectedThemeKey: string
  onThemeChange: (courseId: string | number, themeKey: string) => void
  onEnroll: (course: Course) => void
  actionDisabled: boolean
}

export interface EmptyCoursesStateProps {
  message: ReactNode
}

export interface AdminCourseListProps {
  courses: Course[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

function formatCourseDate(value: unknown) {
  const dateValue = typeof value === "string" || typeof value === "number" || value instanceof Date ? value : ""
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "short",
  }).format(date)
}

export default function CourseCard({ course, mode, selectedThemeKey, onThemeChange, onEnroll, actionDisabled }: CourseCardProps) {
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const themePickerRef = useRef<HTMLDivElement | null>(null)
  const selectedTheme: CourseTheme = getCourseTheme(selectedThemeKey)
  const accent = selectedTheme.accent
  const isProfessorMode = mode === "professor"
  const isAdminMode = mode === "admin"
  const isStudentMode = mode === "student"
  const isEnrolledStudentCourse = isStudentMode && course.inscris
  const progress = getCourseProgress(course)

  useEffect(() => {
    if (!themePickerOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node)) {
        return
      }

      if (!themePickerRef.current?.contains(event.target)) {
        setThemePickerOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setThemePickerOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [themePickerOpen])

  return (
    <Card className={`relative overflow-visible rounded-[1.8rem] border-[#e4d8cd] bg-white/96 shadow-[0_18px_52px_rgba(32,46,84,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(32,46,84,0.12)] ${themePickerOpen ? "z-20" : "z-0"}`}>
      <div className={`relative h-44 overflow-hidden rounded-t-[1.8rem] bg-linear-to-br ${accent}`}>
        <div className={`absolute left-4 top-4 inline-flex items-center rounded-full px-3.5 py-1 text-xs font-bold shadow-xs border ${selectedTheme.badge || "bg-white/80 text-slate-800 border-white/60"}`}>
          {isStudentMode ? (course.inscris ? "Înscris" : "Disponibil") : course.activ ? "Activ" : "Inactiv"}
        </div>
      </div>
      <CardContent className="space-y-3 px-5 py-5">
        {(isProfessorMode || isAdminMode || isEnrolledStudentCourse) ? (
          <Link to={`/courses/${course.id}`} state={{ course }} className="block">
            <h3 className="text-[1.35rem] font-semibold tracking-tight text-[#24385b] transition hover:font-extrabold">{course.denumire}</h3>
          </Link>
        ) : (
          <h3 className="text-[1.35rem] font-semibold tracking-tight text-[#24385b]">{course.denumire}</h3>
        )}
        {(isStudentMode || isAdminMode) ? (
          isEnrolledStudentCourse ? (
            <Link to={`/courses/${course.id}#profesor`} state={{ course, initialTab: "profesor" }} className="inline-flex w-fit text-sm font-semibold text-[#5d7094] transition hover:font-extrabold hover:text-[#24385b]">
              {course.profesorDisplayName || getProfessorName(course)}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-[#5d7094]">{course.profesorDisplayName || getProfessorName(course)}</p>
          )
        ) : null}
        {course.descriere ? <p className="line-clamp-2 text-sm leading-6 text-slate-600">{course.descriere}</p> : null}
        {isStudentMode && course.inscris ? (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between gap-3 text-sm font-semibold text-[#5d7094]">
              <span>{progress.completedWeeks}/{progress.totalWeeks} saptamani</span>
              <span className={selectedTheme.text}>{progress.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#eee7df]">
              <div className={`h-full rounded-full bg-linear-to-r ${accent} transition-all`} style={{ width: `${progress.percent}%` }} />
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-4 text-sm text-[#5d7094]">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            {formatCourseDate(course.dataInceput)}
          </span>
          <span>{formatWeeks(course.nrSaptamaniCurente ?? course.nrSaptamani ?? 0)}</span>
        </div>
        {isProfessorMode ? (
          <Button asChild variant="outline" className="mt-2 rounded-2xl border-[#d9ccbe] bg-white text-[#3f698a]">
            <Link to={`/courses/${course.id}`}>Administrează cursul</Link>
          </Button>
        ) : null}
        {isAdminMode ? (
          <Button asChild variant="outline" className="mt-2 rounded-2xl border-[#d9ccbe] bg-white text-[#3f698a]">
            <Link to={`/courses/${course.id}`}>Vezi detalii</Link>
          </Button>
        ) : null}
        {isStudentMode ? (
          course.inscris ? (
            <Button asChild variant="outline" className="mt-2 rounded-2xl border-[#d9ccbe] bg-white text-[#3f698a]">
              <Link to={`/courses/${course.id}`} state={{ course }}>Vezi cursul</Link>
            </Button>
          ) : (
            <Button type="button" onClick={() => onEnroll(course)} disabled={actionDisabled} className="mt-2 rounded-2xl bg-[#3f698a] text-white hover:bg-[#355b79]">
              Înscriere
            </Button>
          )
        ) : null}
      </CardContent>
      <div ref={themePickerRef} className="absolute right-4 bottom-4 z-30">
        {themePickerOpen ? (
          <div className="absolute right-0 bottom-14 w-56 rounded-[1.35rem] border border-[#d9c9ff] bg-[#fbf8ff]/98 p-2.5 text-[#3a2e66] shadow-[0_18px_48px_rgba(62,42,120,0.2)] backdrop-blur-md">
            <p className="px-2 pb-2 text-[0.68rem] font-semibold tracking-[0.14em] text-[#6c5c9a] uppercase">Tema</p>
            <div className="space-y-1">
              {COURSE_THEMES.map((theme) => {
                const isSelected = theme.key === selectedTheme.key

                return (
                  <button key={theme.key} type="button" onClick={() => { onThemeChange(course.id, theme.key); setThemePickerOpen(false) }} className={`flex w-full items-center justify-between gap-2 rounded-2xl border px-2 py-2 text-left text-sm font-medium transition ${isSelected ? "border-[#7650d8] bg-[#f3edff] text-[#6840c5]" : "border-transparent hover:bg-white/80"}`}>
                    <span className="flex min-w-0 items-center gap-2">
                      <span className={`h-5 w-5 shrink-0 rounded-full ${theme.swatch}`} />
                      <span className="whitespace-nowrap">{theme.label}</span>
                    </span>
                    {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
        <button type="button" aria-label={`Schimba tema pentru ${course.denumire}`} onClick={() => setThemePickerOpen((currentValue) => !currentValue)} className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e0d4ff] bg-white text-[#6840c5] shadow-[0_10px_28px_rgba(62,42,120,0.22)] transition hover:-translate-y-0.5 hover:border-[#bda8ff] hover:bg-[#faf7ff]">
          <span className={`flex h-7 w-7 items-center justify-center rounded-full ${selectedTheme.swatch}`}>
            <Palette className="h-3.5 w-3.5 text-white drop-shadow" />
          </span>
        </button>
      </div>
    </Card>
  )
}

export function EmptyCoursesState({ message }: EmptyCoursesStateProps) {
  return (
    <Card className="w-full max-w-2xl rounded-[2rem] border-[#e4d8cd] bg-white/96 shadow-[0_24px_70px_rgba(32,46,84,0.08)]">
      <CardContent className="px-6 py-10 text-center text-slate-600 sm:px-10">{message}</CardContent>
    </Card>
  )
}

export function AdminCourseList({ courses, currentPage, totalPages, onPageChange }: AdminCourseListProps) {
  return (
    <div className="space-y-3">
      {courses.map((course) => {
        const isActive = Boolean(course.activ)

        return (
          <Card key={course.id} className="rounded-[1.35rem] border-[#e4d8cd] bg-white/96 shadow-[0_10px_30px_rgba(32,46,84,0.06)] transition hover:border-[#cbbbaa] hover:shadow-[0_16px_38px_rgba(32,46,84,0.1)]">
            <CardContent className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-[#24385b]">{course.denumire}</h3>
                <p className="mt-1 text-sm text-[#5d7094]">{formatStudents(course.nrStudentiInscrisi ?? 0)} · {formatWeeks(course.nrSaptamaniCurente ?? course.nrSaptamani ?? 0)}</p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className={`inline-flex min-w-18 justify-center rounded-full px-3 py-1 text-sm font-semibold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{isActive ? "Activ" : "Inactiv"}</span>
                <Button asChild variant="ghost" className="h-10 w-10 rounded-2xl p-0 text-[#4A5681] hover:bg-[#eef1fb] hover:text-[#24385b]" aria-label={`Vezi detalii pentru ${course.denumire}`}>
                  <Link to={`/courses/${course.id}`} state={{ course }}>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}

      <div className="flex justify-end pt-2">
        <div className="flex flex-wrap justify-end gap-2">
          {Array.from({ length: totalPages }, (_, index) => {
            const pageNumber = index + 1
            const isCurrent = pageNumber === currentPage

            return (
              <button key={pageNumber} type="button" onClick={() => onPageChange(pageNumber)} className={`flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${isCurrent ? "border-[#24385b] bg-[#24385b] text-white shadow-sm" : "border-[#d8ccbf] bg-white text-slate-700 hover:bg-[#f7efe6] hover:text-[#24385b]"}`} aria-current={isCurrent ? "page" : undefined}>
                {pageNumber}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
