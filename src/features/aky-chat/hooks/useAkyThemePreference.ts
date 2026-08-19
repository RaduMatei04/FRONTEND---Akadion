import { COURSE_THEME_KEYS, DEFAULT_COURSE_THEME, getCourseTheme } from "@/lib/courseThemes"

import type { CourseTheme } from "@/types/theme"
import type { AuthUser } from "@/types/user"

export function useAkyThemePreference(_user: AuthUser | null | undefined) {
  const selectedTheme: CourseTheme = getCourseTheme(COURSE_THEME_KEYS.has(DEFAULT_COURSE_THEME) ? DEFAULT_COURSE_THEME : undefined)

  return {
    selectedTheme,
    themePickerOpen: false,
  }
}
