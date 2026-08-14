import type { EntityId } from "@/types/api"

export type { EntityId }

export interface WeekRecord {
  id: EntityId
  nrSaptamana?: number
  descriere?: string
  finalizata?: boolean
  [key: string]: unknown
}

export interface DocumentRecord {
  id: EntityId
  titlu?: string
  urlDescarcare?: string
  urlVizualizare?: string
  activ?: boolean
  statusIndex?: string
  retryable?: boolean
  [key: string]: unknown
}

export interface ProfessorDetails {
  mail?: string
  facultate?: string
  [key: string]: unknown
}

export interface CourseForm {
  denumire: string
  descriere: string
  dataInceput: string
}

export type DocumentsByWeekMap = Record<string, DocumentRecord[]>
export type ExpandedStateMap = Record<string, boolean>
export type WeekDocumentForm = { titlu: string; file: File | null }
export type UploadErrorsMap = Record<string, string>
export type EditingDocumentMap = Record<string, boolean>
export type WeekFeedbackType = "success" | "error"
export type WeekFeedback = { type: WeekFeedbackType; message: string } | null
export type WeekFeedbackMap = Record<string, WeekFeedback>
export type CourseTab = "saptamani" | "studenti" | "profesor"
export type CourseThemeKey = string
