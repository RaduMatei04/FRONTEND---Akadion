export const QUIZ_COURSES_QUERY_KEY = ["quiz", "courses"] as const

export const QUIZ_QUESTION_COUNT_OPTIONS = [3, 5, 10, 15]

export const QUIZ_DIFFICULTY_OPTIONS = [
  { value: "USOR", label: "Ușor" },
  { value: "MEDIU", label: "Mediu" },
  { value: "AVANSAT", label: "Avansat" },
]

export const QUIZ_MODE_OPTIONS = [
  { value: "EXERSARE", label: "Exersare" },
  { value: "EXAMEN", label: "Examen cu timer" },
]
