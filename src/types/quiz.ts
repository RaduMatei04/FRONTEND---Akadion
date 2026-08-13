export interface QuizQuestion {
  id?: string | number
  intrebare?: string
  raspunsCorect?: string
  variante?: string[]
  [key: string]: unknown
}

export interface QuizAttempt {
  id?: string | number
  scor?: number
  createdAt?: string
  [key: string]: unknown
}

export interface QuizResult {
  scor?: number
  total?: number
  [key: string]: unknown
}

export interface Flashcard {
  id?: string | number
  intrebare?: string
  raspuns?: string
  [key: string]: unknown
}
