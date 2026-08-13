import { useEffect, useState } from "react"
import { COURSE_THEME_KEYS, DEFAULT_COURSE_THEME } from "@/lib/courseThemes"
import { getThemeUserKey } from "@/lib/courseThemes"

import type { AuthUser } from "@/types/user"

export function useStoredPageTheme(user: AuthUser | null | undefined, storagePrefix: string) {
  const [selectedThemeKey, setSelectedThemeKey] = useState(DEFAULT_COURSE_THEME)

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(`${storagePrefix}:${getThemeUserKey(user)}`)
      if (COURSE_THEME_KEYS.has(savedTheme)) {
        setSelectedThemeKey(savedTheme)
      } else {
        setSelectedThemeKey(DEFAULT_COURSE_THEME)
      }
    } catch {
      setSelectedThemeKey(DEFAULT_COURSE_THEME)
    }
  }, [storagePrefix, user])

  function updateTheme(themeKey: string) {
    if (!COURSE_THEME_KEYS.has(themeKey)) {
      return
    }

    setSelectedThemeKey(themeKey)

    try {
      window.localStorage.setItem(`${storagePrefix}:${getThemeUserKey(user)}`, themeKey)
    } catch {
      // ignore localStorage failures
    }
  }

  return {
    selectedThemeKey,
    setSelectedThemeKey: updateTheme,
  }
}
