import { getThemeUserKey } from "@/lib/courseThemes"

import type { Course, CourseProgress, ThemeUser } from "@/types/course"

const COURSE_THEME_STORAGE_PREFIX = "akadion:course-theme"

export function getCourseThemeStorageKey(user: ThemeUser, courseId: string | number | null | undefined) {
  return `${COURSE_THEME_STORAGE_PREFIX}:${getThemeUserKey(user)}:${courseId}`
}

export function getProfessorName(course: Course) {
  return [course.profesorPrenume, course.profesorNume].filter(Boolean).join(" ") || course.profesorMail || "Profesor nealocat"
}

export function normalizeEnrolledCourse(course: Course): Course {
  return {
    ...course,
    inscris: true,
    activ: true,
    profesorDisplayName: [course.profesorPrenume, course.profesorNume].filter(Boolean).join(" "),
  }
}

export function normalizeAvailableCourse(course: Course): Course {
  return {
    ...course,
    inscris: false,
    activ: true,
    nrSaptamaniCurente: course.nrSaptamani,
    profesorDisplayName: [course.profesorPrenume, course.profesorNume].filter(Boolean).join(" "),
  }
}

export function getCourseProgress(course: Course): CourseProgress {
  const totalWeeks = course.nrSaptamaniCurente ?? course.nrSaptamani ?? 0
  const percent = Math.max(0, Math.min(100, Math.round(course.procentajProgres ?? 0)))
  const completedWeeks = course.nrSaptamaniFinalizate ?? Math.round((percent / 100) * totalWeeks)

  return { completedWeeks, percent, totalWeeks }
}
