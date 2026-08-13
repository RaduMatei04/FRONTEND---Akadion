import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import AppShell from "@/app/layout/AppShell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import AkyChatWidget from "@/features/aky-chat/AkyChatWidget"
import CourseCard, { EmptyCoursesState } from "@/features/courses/components/CourseCard"
import { useCourseThemePreferences } from "@/features/courses/lib/courseThemeStorage"
import { useAuth } from "@/auth/useAuth"
import { enrollStudentCourse, getCourseErrorMessage, listStudentAvailableCourses, listStudentCourses } from "@/features/courses/api/courses"
import { normalizeAvailableCourse, normalizeEnrolledCourse } from "@/features/courses/lib/courseView"
import { getStudentHomepageOwlId, getStudentHomepageOwlImage, getStudentHomepageOwlRole, hasDiscoveredOwlHall } from "@/features/owl-hall/lib/legendaryOwls"
import { getUserGreetingName } from "@/lib/user"
import { DEFAULT_COURSE_THEME } from "@/lib/courseThemes"

import type { AppAxiosError } from "@/types/api"
import type { Course } from "@/types/course"
import { heroStatsBadgeClassName, heroStatsLabelClassName, heroStatsSecondaryDotClassName, heroStatsValueClassName, STUDENT_DASHBOARD_QUERY_KEY, studentDashboardLogo } from "@/features/dashboard/dashboardConstants"

export default function StudentDashboard() {
  const { user, refreshAuth } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [activeAction, setActiveAction] = useState("")
  const [homepageOwlImage, setHomepageOwlImage] = useState(studentDashboardLogo)
  const [homepageOwlRole, setHomepageOwlRole] = useState("Dashboard STUDENT")
  const [hasUnlockedOwlHall, setHasUnlockedOwlHall] = useState(false)

  const {
    data: dashboardCourses,
    isLoading: loading,
    error: queryError,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: STUDENT_DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const [enrolled, available] = await Promise.all([
        listStudentCourses(),
        listStudentAvailableCourses(),
      ])

      return {
        studentCourses: (Array.isArray(enrolled) ? enrolled : []).map(normalizeEnrolledCourse),
        availableCourses: (Array.isArray(available) ? available : []).map(normalizeAvailableCourse),
      }
    },
  })

  const courses = dashboardCourses?.studentCourses ?? []
  const availableCourses = dashboardCourses?.availableCourses ?? []
  const { courseThemes, setCourseTheme } = useCourseThemePreferences(user, [...courses, ...availableCourses].map((course) => course.id))
  const enrollMutation = useMutation({ mutationFn: enrollStudentCourse })

  useEffect(() => {
    const typedError = queryError as AppAxiosError | null
    if (typedError?.response?.status === 401) {
      void refreshAuth()
    }

    setError(queryError ? getCourseErrorMessage(queryError, "Nu am putut încărca lista de cursuri.") : "")
  }, [queryError, refreshAuth])

  useEffect(() => {
    const homepageOwlId = getStudentHomepageOwlId(user)
    setHomepageOwlImage(getStudentHomepageOwlImage(homepageOwlId))
    setHomepageOwlRole(getStudentHomepageOwlRole(homepageOwlId))
    setHasUnlockedOwlHall(hasDiscoveredOwlHall(user))
  }, [user])

  async function handleEnroll(course: Course) {
    setActiveAction(`enroll-${course.id}`)
    setError("")
    setNotice("")

    try {
      await enrollMutation.mutateAsync(course.id)
      const reloaded = await refetchCourses()
      const enrolledCourse = reloaded.data?.studentCourses?.find((currentCourse) => currentCourse.id === course.id)
      setNotice("Înscrierea a fost finalizată cu succes.")
      navigate(`/courses/${course.id}`, { state: { course: enrolledCourse ?? normalizeEnrolledCourse({ ...course, procentajProgres: 0 }) } })
    } catch (enrollError: unknown) {
      const typedError = enrollError as AppAxiosError
      if (typedError.response?.status === 401) {
        await refreshAuth()
      }
      setError(getCourseErrorMessage(enrollError, "Nu am putut finaliza înscrierea."))
    } finally {
      setActiveAction("")
    }
  }

  return (
    <AppShell
      title={`Salut, ${getUserGreetingName(user)}!`}
      eyebrow={homepageOwlRole}
      heroClassName="relative min-h-[11rem] overflow-visible border-0 bg-linear-to-r from-[#0f9fbd] via-[#17b7d3] to-[#56d5ea] text-white shadow-[0_24px_60px_rgba(23,133,161,0.24)] lg:items-start before:absolute before:-top-12 before:right-[-3.5rem] before:h-56 before:w-56 before:rounded-full before:bg-white/16 before:content-[''] after:absolute after:-bottom-20 after:left-[-4.5rem] after:h-64 after:w-64 after:rounded-full after:bg-white/10 after:content-['']"
      heroEyebrowClassName="text-white/72"
      heroTitleClassName="text-white"
      heroDescriptionClassName="text-white/84"
      heroContent={<div className="mt-3.5 flex flex-wrap items-center gap-2.5"><div className={heroStatsBadgeClassName}><span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.8)]" /><span className={heroStatsLabelClassName}>Cursurile mele:</span><span className={heroStatsValueClassName}>{loading ? "..." : courses.length}</span></div><div className={heroStatsBadgeClassName}><span className={`h-2 w-2 rounded-full ${heroStatsSecondaryDotClassName}`} /><span className={heroStatsLabelClassName}>Cursuri disponibile:</span><span className={heroStatsValueClassName}>{loading ? "..." : availableCourses.length}</span></div></div>}
      heroVisual={<div className="pointer-events-auto relative flex h-full w-full flex-col items-end justify-end"><img src={homepageOwlImage} alt="Dashboard student" className="h-full max-h-full w-auto origin-bottom translate-y-[8%] cursor-pointer object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.22)] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:brightness-105 hover:drop-shadow-[0_35px_65px_rgba(0,0,0,0.38)] active:scale-[1.03] active:brightness-105 active:drop-shadow-[0_35px_65px_rgba(0,0,0,0.38)]" />{hasUnlockedOwlHall ? <Button asChild variant="outline" className="absolute right-2 -bottom-12 rounded-2xl border-white/28 bg-white px-5 py-2.5 text-sm font-semibold text-[#24385b] shadow-[0_14px_34px_rgba(8,18,38,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-white/90 hover:text-[#24385b] hover:shadow-[0_20px_42px_rgba(8,18,38,0.24)] active:scale-[0.98]"><Link to="/owl-hall">Schimbă Avatar</Link></Button> : null}</div>}
      heroVisualClassName="right-2 bottom-0 top-auto h-full items-end justify-center lg:right-5"
    >
      <div className="space-y-6">
        {error ? <Alert variant="destructive" className="rounded-3xl border-rose-200 bg-white/90 px-5 py-4"><AlertCircle className="h-4 w-4" /><AlertTitle>Eroare cursuri</AlertTitle><AlertDescription>{error}</AlertDescription></Alert> : null}
        {notice ? <Alert className="rounded-3xl border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900"><CheckCircle2 className="h-4 w-4 text-emerald-700" /><AlertTitle>Succes</AlertTitle><AlertDescription className="text-emerald-800">{notice}</AlertDescription></Alert> : null}
        {loading ? <p className="text-sm text-slate-500">Se încarcă lista de cursuri...</p> : null}
        {!loading ? (
          <div className="space-y-8 pt-2">
            <section className="space-y-4">
              <div className="flex flex-col gap-1"><h3 className="text-2xl font-semibold tracking-tight text-[#24385b]">Cursurile mele</h3><p className="text-sm text-slate-500">Cursurile la care ești înscris în acest moment.</p></div>
              {courses.length > 0 ? (
                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                  {courses.map((course) => <CourseCard key={course.id} course={course} mode="student" selectedThemeKey={courseThemes[course.id] ?? DEFAULT_COURSE_THEME} onThemeChange={setCourseTheme} onEnroll={handleEnroll} actionDisabled={Boolean(activeAction)} />)}
                </div>
              ) : <EmptyCoursesState message="Nu ești înscris momentan la niciun curs activ." />}
            </section>
            <section className="space-y-4">
              <div className="flex flex-col gap-1"><h3 className="text-2xl font-semibold tracking-tight text-[#24385b]">Cursuri disponibile</h3><p className="text-sm text-slate-500">Cursurile disponibile pentru înscriere.</p></div>
              {availableCourses.length > 0 ? (
                <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                  {availableCourses.map((course) => <CourseCard key={course.id} course={course} mode="student" selectedThemeKey={courseThemes[course.id] ?? DEFAULT_COURSE_THEME} onThemeChange={setCourseTheme} onEnroll={handleEnroll} actionDisabled={Boolean(activeAction)} />)}
                </div>
              ) : <EmptyCoursesState message="Nu există cursuri disponibile pentru înscriere momentan." />}
            </section>
          </div>
        ) : null}
      </div>
      <AkyChatWidget />
    </AppShell>
  )
}
