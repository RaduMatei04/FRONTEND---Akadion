import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { AlertCircle, Plus } from "lucide-react"
import AppShell from "@/app/layout/AppShell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import AkyChatWidget from "@/features/aky-chat/AkyChatWidget"
import CourseCard, { EmptyCoursesState } from "@/features/courses/components/CourseCard"
import { useCourseThemePreferences } from "@/features/courses/lib/courseThemeStorage"
import { useAuth } from "@/auth/useAuth"
import { listProfessorCourses, getCourseErrorMessage } from "@/features/courses/api/courses"
import { getUserGreetingName } from "@/auth/user.utils"
import { DEFAULT_COURSE_THEME } from "@/lib/courseThemes"

import type { ApiError } from "@/types/api"
import type { Course } from "@/types/course"
import { getActiveCourseCounts, heroStatsBadgeClassName, heroStatsLabelClassName, heroStatsSecondaryDotClassName, heroStatsValueClassName, PROFESSOR_DASHBOARD_QUERY_KEY, professorDashboardLogo } from "@/features/dashboard/dashboardConstants"

export default function ProfessorDashboard() {
  const { user, refreshAuth } = useAuth()
  const {
    data: courses = [],
    isLoading: loading,
    error: queryError,
  } = useQuery<Course[]>({
    queryKey: PROFESSOR_DASHBOARD_QUERY_KEY,
    queryFn: listProfessorCourses,
  })

  const { courseThemes, setCourseTheme } = useCourseThemePreferences(user, courses.map((course) => course.id))

  const typedError = queryError as ApiError | null
  const hasSessionExpired = typedError?.response?.status === 401

  useEffect(() => {
    if (hasSessionExpired) {
      void refreshAuth()
    }
  }, [hasSessionExpired, refreshAuth])

  const error = queryError ? getCourseErrorMessage(queryError, "Nu am putut încărca cursurile tale.") : ""

  const courseCounts = getActiveCourseCounts(courses)
  const activeCourses = courses.filter((course) => course.activ)
  const inactiveCourses = courses.filter((course) => !course.activ)

  return (
    <AppShell
      title={`Salut, ${getUserGreetingName(user)}!`}
      eyebrow="Dashboard PROFESOR"
      heroClassName="relative min-h-[11rem] overflow-hidden border-0 bg-linear-to-r from-[#0f9fbd] via-[#17b7d3] to-[#56d5ea] text-white shadow-[0_24px_60px_rgba(23,133,161,0.24)] lg:items-start before:absolute before:-top-12 before:right-[-3.5rem] before:h-56 before:w-56 before:rounded-full before:bg-white/16 before:content-[''] after:absolute after:-bottom-20 after:left-[-4.5rem] after:h-64 after:w-64 after:rounded-full after:bg-white/10 after:content-['']"
      heroEyebrowClassName="text-white/72"
      heroTitleClassName="text-white"
      heroDescriptionClassName="text-white/84"
      heroContent={<div className="mt-3.5 flex flex-wrap items-center gap-2.5"><div className={heroStatsBadgeClassName}><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" /><span className={heroStatsLabelClassName}>Cursuri active:</span><span className={heroStatsValueClassName}>{loading ? "..." : `${courseCounts.active}/${courseCounts.total}`}</span></div><div className={heroStatsBadgeClassName}><span className={`h-2 w-2 rounded-full ${heroStatsSecondaryDotClassName}`} /><span className={heroStatsLabelClassName}>Cursuri inactive:</span><span className={heroStatsValueClassName}>{loading ? "..." : `${courseCounts.inactive}/${courseCounts.total}`}</span></div></div>}
      heroVisual={<img src={professorDashboardLogo} alt="Dashboard profesor" className="pointer-events-auto h-full max-h-full w-auto origin-bottom translate-y-[7.5%] cursor-pointer object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.22)] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:brightness-105 hover:drop-shadow-[0_35px_65px_rgba(0,0,0,0.38)] active:scale-[1.03] active:brightness-105 active:drop-shadow-[0_35px_65px_rgba(0,0,0,0.38)]" />}
      heroVisualClassName="right-2 bottom-0 top-auto h-full items-end justify-center lg:right-5"
    >
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive" className="rounded-3xl border-rose-200 bg-white/90 px-5 py-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Eroare cursuri</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-4 pt-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-[#24385b]">Cursurile mele</h2>
            <Button asChild variant="outline" className="rounded-2xl border border-[#d9ccbe] bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-all hover:bg-[#f7efe6] hover:text-slate-900 hover:border-[#bcae9e]"><Link to="/courses/new" className="inline-flex items-center gap-2"><Plus className="h-4 w-4 text-slate-900" /><span>Curs nou</span></Link></Button>
          </div>

          {loading ? <p className="text-sm text-slate-500">Se încarcă lista de cursuri...</p> : null}

          {!loading && courses.length > 0 ? (
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-3"><h3 className="text-xl font-semibold tracking-tight text-[#24385b]">Active</h3><span className="inline-flex items-center rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">{activeCourses.length}</span></div>
                {activeCourses.length > 0 ? (
                  <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                    {activeCourses.map((course) => (
                      <CourseCard key={course.id} course={course} mode="professor" selectedThemeKey={courseThemes[course.id] ?? DEFAULT_COURSE_THEME} onThemeChange={setCourseTheme} actionDisabled={false} />
                    ))}
                  </div>
                ) : (
                  <Card className="rounded-[1.5rem] border-dashed border-[#d8ccbf] bg-[#fbf6f0] shadow-none"><CardContent className="px-5 py-6 text-sm text-slate-500">Nu ai niciun curs activ momentan.</CardContent></Card>
                )}
              </section>

              <section className="space-y-4">
                <div className="flex flex-wrap items-center gap-3"><h3 className="text-xl font-semibold tracking-tight text-[#24385b]">Inactive</h3><span className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{inactiveCourses.length}</span></div>
                {inactiveCourses.length > 0 ? (
                  <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                    {inactiveCourses.map((course) => (
                      <CourseCard key={course.id} course={course} mode="professor" selectedThemeKey={courseThemes[course.id] ?? DEFAULT_COURSE_THEME} onThemeChange={setCourseTheme} actionDisabled={false} />
                    ))}
                  </div>
                ) : (
                  <Card className="rounded-[1.5rem] border-dashed border-[#d8ccbf] bg-[#fbf6f0] shadow-none"><CardContent className="px-5 py-6 text-sm text-slate-500">Nu ai cursuri inactive.</CardContent></Card>
                )}
              </section>
            </div>
          ) : null}

          {!loading && courses.length === 0 ? <EmptyCoursesState message="Nu ai adăugat încă niciun curs. Creează unul din butonul `Curs nou` și va apărea aici." /> : null}
        </div>
      </div>
      <AkyChatWidget />
    </AppShell>
  )
}
