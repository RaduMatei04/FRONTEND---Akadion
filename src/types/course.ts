import type { EntityId } from "@/types/api"
import type { AuthUser } from "@/types/user"

export interface Course {
  id?: string | number
  denumire?: string
  titlu?: string
  descriere?: string
  activ?: boolean
  inscris?: boolean
  profesorNume?: string
  profesorPrenume?: string
  profesorMail?: string
  profesorDisplayName?: string
  nrSaptamani?: number
  nrSaptamaniCurente?: number
  nrSaptamaniFinalizate?: number
  procentajProgres?: number
  [key: string]: unknown
}

export interface CourseOption {
  id?: EntityId
  denumire?: string
  [key: string]: unknown
}

export interface CourseWeek {
  id?: string | number
  numarSaptamana?: number
  descriere?: string
  [key: string]: unknown
}

export interface CourseDocument {
  id?: string | number
  numeFisier?: string
  fileName?: string
  [key: string]: unknown
}

export interface ProfessorDetails {
  id?: string | number
  mail?: string
  nume?: string
  prenume?: string
  facultate?: string
  [key: string]: unknown
}

export interface StudentCourse extends Course {
  inscris?: boolean
}

export interface CourseProgress {
  completedWeeks: number
  percent: number
  totalWeeks: number
}

export type ThemeUser = AuthUser | null | undefined
