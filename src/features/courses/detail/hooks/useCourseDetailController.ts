import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { COURSE_THEME_KEYS, getCourseTheme, getThemeUserKey } from "@/lib/courseThemes"
import { getProfessorName } from "@/features/courses/lib/courseView"
import type { CourseTab, CourseThemeKey } from "../course-detail.types"
import type { CourseTheme } from "@/types/theme"
import { useWeekActions } from "../weeks/hooks/useWeekActions"
import { useCourseActions } from "./useCourseActions"
import { useCourseDetailState } from "./useCourseDetailState"

export function useCourseDetailController() {
  const { courseId } = useParams()
  const { user } = useAuth()

  const state = useCourseDetailState()
  const courseActions = useCourseActions(state)
  const weekActions = useWeekActions(state)

  const { weeks, setExpandedWeekIds, setIndexExpandedWeekIds } = state

  useEffect(() => {
    setExpandedWeekIds((current) => {
      if (weeks.length === 0) {
        return {}
      }

      const next = {}
      weeks.forEach((week) => {
        next[week.id] = current[week.id] ?? false
      })

      return next
    })
  }, [weeks, setExpandedWeekIds])

  useEffect(() => {
    setIndexExpandedWeekIds((current) => {
      if (weeks.length === 0) {
        return {}
      }

      return Object.fromEntries(weeks.map((week, index) => [week.id, current[week.id] ?? index === 0]))
    })
  }, [weeks, setIndexExpandedWeekIds])

  const [selectedThemeKey, setSelectedThemeKey] = useState<CourseThemeKey>(() => {
    try {
      const key = window.localStorage.getItem(`akadion:course-theme:${getThemeUserKey(user)}:${courseId}`)
      if (COURSE_THEME_KEYS.has(key)) return key
    } catch (storageError: unknown) {
      // localStorage poate fi indisponibil (ex: mod privat); nu blocăm randarea temei.
      console.error("Nu am putut citi preferința de temă din localStorage.", storageError)
    }
    return "akadion"
  })

  useEffect(() => {
    try {
      const key = window.localStorage.getItem(`akadion:course-theme:${getThemeUserKey(user)}:${courseId}`)
      setSelectedThemeKey(COURSE_THEME_KEYS.has(key) ? key : "akadion")
    } catch {
      setSelectedThemeKey("akadion")
    }
  }, [user, courseId])

  const theme: CourseTheme = getCourseTheme(selectedThemeKey)

  const lastWeekNumber = weeks.reduce((highest, week) => Math.max(highest, week.nrSaptamana ?? 0), 0)
  const tabs: CourseTab[] = ["saptamani"]
  if (state.canViewStudents) {
    tabs.push("studenti")
  }
  if (state.isAdmin || state.isStudent) {
    tabs.push("profesor")
  }
  const professorName = getProfessorName(state.course)
  const professorEmail = state.professorDetails?.mail || state.course?.profesorMail || "Email indisponibil"
  const professorFaculty = state.professorDetails?.facultate || "Facultate indisponibilă"
  const courseInscris = Boolean(state.course?.inscris)

  return {
    ...state,
    ...courseActions,
    ...weekActions,
    theme,
    lastWeekNumber,
    tabs,
    professorName,
    professorEmail,
    professorFaculty,
    courseInscris,
  }
}
