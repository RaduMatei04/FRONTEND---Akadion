import { getThemeUserKey } from "@/lib/courseThemes"

import type { AuthUser } from "@/types/user"

import { AKY_CHAT_MIN_WIDTH, AKY_HISTORY_MAX_WIDTH, AKY_HISTORY_MIN_WIDTH, AKY_PANEL_MAX_WIDTH, AKY_PANEL_MIN_WIDTH, AKY_PANEL_VIEWPORT_GAP, AKY_THEME_STORAGE_PREFIX } from "./aky-chat.constants"
import type { HistoryPage, MessageRecord } from "./aky-chat.types"

export function getAkyThemeStorageKey(user: AuthUser | null | undefined) {
  return `${AKY_THEME_STORAGE_PREFIX}:${getThemeUserKey(user)}`
}

export function normalizeHistoryResponse(response: MessageRecord[] | HistoryPage) {
  if (Array.isArray(response)) {
    return {
      items: response,
      hasMore: false,
      oldestLoadedMessageId: null,
    }
  }

  return {
    items: response?.mesaje || response?.continut || [],
    hasMore: response?.areMaiMulte ?? false,
    oldestLoadedMessageId: response?.celMaiVechiIdIncarcat ?? null,
  }
}

export function clampPanelWidth(nextWidth: number) {
  const maxWidth = Math.min(AKY_PANEL_MAX_WIDTH, window.innerWidth - AKY_PANEL_VIEWPORT_GAP)
  const minWidth = Math.min(AKY_PANEL_MIN_WIDTH, maxWidth)
  return Math.max(minWidth, Math.min(nextWidth, maxWidth))
}

export function clampHistoryWidth(nextWidth: number, panelWidth: number) {
  const maxWidth = Math.min(AKY_HISTORY_MAX_WIDTH, panelWidth - AKY_CHAT_MIN_WIDTH)
  const minWidth = Math.min(AKY_HISTORY_MIN_WIDTH, maxWidth)
  return Math.max(minWidth, Math.min(nextWidth, maxWidth))
}

export function formatTime(isoString: string | null | undefined) {
  if (!isoString) return ""
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function formatDate(isoString: string | null | undefined) {
  if (!isoString) return ""
  return new Date(isoString).toLocaleDateString("ro-RO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
}

export function buildUserMessage(questionText: string, now: Date): MessageRecord {
  return {
    id: `user-${Date.now()}`,
    rol: "UTILIZATOR",
    continut: questionText,
    createdAt: now.toISOString(),
  }
}
