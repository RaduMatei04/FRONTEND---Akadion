import { useEffect, useRef, useState } from "react"

import { COURSE_THEME_KEYS, DEFAULT_COURSE_THEME, getCourseTheme } from "@/lib/courseThemes"

import type { CourseTheme } from "@/types/theme"
import type { AuthUser } from "@/types/user"

import { getAkyThemeStorageKey } from "../aky-chat.utils"

export function useAkyThemePreference(user: AuthUser | null | undefined) {
  const [selectedThemeKey, setSelectedThemeKey] = useState(DEFAULT_COURSE_THEME)
  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const themePickerRef = useRef<HTMLDivElement | null>(null)
  const selectedTheme: CourseTheme = getCourseTheme(selectedThemeKey)

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem(getAkyThemeStorageKey(user))
      if (COURSE_THEME_KEYS.has(savedTheme)) {
        setSelectedThemeKey(savedTheme)
      } else {
        setSelectedThemeKey(DEFAULT_COURSE_THEME)
      }
    } catch {
      setSelectedThemeKey(DEFAULT_COURSE_THEME)
    }
  }, [user])

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

  function handleThemeChange(themeKey: string) {
    if (!COURSE_THEME_KEYS.has(themeKey)) {
      return
    }

    setSelectedThemeKey(themeKey)
    setThemePickerOpen(false)
    try {
      window.localStorage.setItem(getAkyThemeStorageKey(user), themeKey)
    } catch {
      // Theme still applies in memory even if persistence is blocked.
    }
  }

  return {
    selectedTheme,
    themePickerOpen,
    setThemePickerOpen,
    themePickerRef,
    handleThemeChange,
  }
}
