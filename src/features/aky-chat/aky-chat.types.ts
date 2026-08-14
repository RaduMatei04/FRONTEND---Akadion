import type { CSSProperties } from "react"

import type { EntityId, PaginatedResponse } from "@/types/api"
import type { AkyMessage, Conversatie } from "@/types/chat"
import type { CourseOption } from "@/types/course"

export type ChatView = "list" | "chat"
export type FilterMode = "course" | "all"
export type AkyPanelStyle = CSSProperties & Record<"--aky-panel-width" | "--aky-history-width", string>

export type { CourseOption }
export type { EntityId }

export interface AkyChatWidgetProps {
  courseId?: EntityId | null
  courseTitle?: string | null
  enabled?: boolean
}

export interface ConversationRecord extends Conversatie {
  id?: EntityId
  cursId?: EntityId | null
  titlu?: string
  createdAt?: string
}

export interface MessageRecord extends AkyMessage {
  id?: EntityId
  rol?: string
  continut?: string
  createdAt?: string
  surseFolosite?: string
  areRaspuns?: boolean
}

export interface ConversationsPage extends PaginatedResponse<ConversationRecord> {
  areUrmatoarea?: boolean
}

export interface HistoryPage extends PaginatedResponse<MessageRecord> {
  mesaje?: MessageRecord[]
  areMaiMulte?: boolean
  celMaiVechiIdIncarcat?: EntityId | null
}

export interface NewConversationResponse {
  conversatieId?: EntityId
  [key: string]: unknown
}
