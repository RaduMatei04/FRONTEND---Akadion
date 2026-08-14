import { useEffect, useRef, useState } from "react"

import type { QuizQuestionRecord, QuizResultRecord } from "@/features/study-tools/quiz/quiz.types"

interface UseQuizExamTimerParams {
  quizMode: string
  quizQuestions: QuizQuestionRecord[]
  quizResult: QuizResultRecord | null
  autoFinalize: () => Promise<void>
}

export function useQuizExamTimer({ quizMode, quizQuestions, quizResult, autoFinalize }: UseQuizExamTimerParams) {
  const [timeLeft, setTimeLeft] = useState(0)
  const autoFinalizeRef = useRef<null | (() => Promise<void>)>(null)

  useEffect(() => {
    autoFinalizeRef.current = autoFinalize
  }, [autoFinalize])

  useEffect(() => {
    if (quizQuestions.length === 0 || quizResult || quizMode !== "EXAMEN") {
      return undefined
    }

    setTimeLeft(quizQuestions.length * 15)
    const intervalId = window.setInterval(() => {
      setTimeLeft((currentValue) => {
        if (currentValue <= 1) {
          window.clearInterval(intervalId)
          autoFinalizeRef.current?.()
          return 0
        }
        return currentValue - 1
      })
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [quizMode, quizQuestions, quizResult])

  return { timeLeft, setTimeLeft }
}
