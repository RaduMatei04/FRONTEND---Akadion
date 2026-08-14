export type { CourseOption } from "@/types/course"

export interface AccessibleDocument {
  documentId?: string | number
  numeFisier?: string
  [key: string]: unknown
}

export interface QuizQuestionRecord {
  index?: number
  intrebare?: string
  optiuni?: string[] | Record<string, string>
  raspunsCorect?: string
  raspunsStudent?: string
  explicatie?: string
}

export interface QuizResultDetail extends QuizQuestionRecord {
}

export interface QuizResultRecord {
  scor?: number
  nrIntrebari?: number
  procentaj?: number
  detalii?: QuizResultDetail[]
}

export interface QuizAttemptHistoryItem {
  incercareId?: string | number
  id?: string | number
  createdAt?: string
  documentTitlu?: string
  cursDenumire?: string
  scor?: number
  nrIntrebari?: number
  procentaj?: number
}

export interface QuizAttemptDetail extends QuizResultRecord {
  incercareId?: string | number
  cursDenumire?: string
  documentTitlu?: string
}

export interface QuizGenerationResponse {
  incercareId?: string | number
  intrebari?: QuizQuestionRecord[]
}
