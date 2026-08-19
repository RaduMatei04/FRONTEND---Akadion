import { useEffect, useState } from "react"
import { COURSE_THEME_KEYS } from "@/lib/courseThemes"
import { getCourseThemeStorageKey } from "@/features/courses/lib/courseView"

import type { AuthUser } from "@/types/user"

function readCourseThemes(user: AuthUser | null | undefined, courseIds: Array<string | number>) {
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

  return nextCourseThemes
}

function areSameCourseThemes(currentThemes: Record<string, string>, nextThemes: Record<string, string>) {
  const currentEntries = Object.entries(currentThemes)
  const nextEntries = Object.entries(nextThemes)

  if (currentEntries.length !== nextEntries.length) {
    return false
  }

  return currentEntries.every(([courseId, themeKey]) => nextThemes[courseId] === themeKey)
}

export function useCourseThemePreferences(user: AuthUser | null | undefined, courseIds: Array<string | number>) {
  const [courseThemes, setCourseThemes] = useState<Record<string, string>>({})
  const courseIdsSignature = courseIds.join("|")

  useEffect(() => {
    const normalizedCourseIds = courseIdsSignature ? courseIdsSignature.split("|") : []
    const nextCourseThemes = readCourseThemes(user, normalizedCourseIds)

    setCourseThemes((currentThemes) => {
      if (areSameCourseThemes(currentThemes, nextCourseThemes)) {
        return currentThemes
      }

      return nextCourseThemes
    })
  }, [courseIdsSignature, user])

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
