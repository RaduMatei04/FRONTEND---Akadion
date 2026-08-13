import { useEffect, useState } from "react"
import { COURSE_THEME_KEYS } from "@/lib/courseThemes"
import { getCourseThemeStorageKey } from "@/features/courses/lib/courseView"

import type { AuthUser } from "@/types/user"

export function useCourseThemePreferences(user: AuthUser | null | undefined, courseIds: Array<string | number>) {
  const [courseThemes, setCourseThemes] = useState<Record<string, string>>({})

  useEffect(() => {
    const nextCourseThemes: Record<string, string> = {}

    for (const courseId of courseIds) {
      try {
        const savedTheme = window.localStorage.getItem(getCourseThemeStorageKey(user, courseId))
        if (COURSE_THEME_KEYS.has(savedTheme)) {
          nextCourseThemes[courseId] = savedTheme
        }
      } catch {
        // LocalStorage fallback
      }
    }

    setCourseThemes(nextCourseThemes)
  }, [courseIds, user])

  function setCourseTheme(courseId: string | number, themeKey: string) {
    if (!COURSE_THEME_KEYS.has(themeKey)) {
      return
    }

    setCourseThemes((current) => ({ ...current, [courseId]: themeKey }))

    try {
      window.localStorage.setItem(getCourseThemeStorageKey(user, courseId), themeKey)
    } catch {
      // LocalStorage fallback
    }
  }

  return {
    courseThemes,
    setCourseTheme,
  }
}
