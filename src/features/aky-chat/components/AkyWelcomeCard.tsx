import { Sparkles } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

import type { CourseTheme } from "@/types/theme"

import { QUICK_QUESTIONS } from "../aky-chat.constants"

interface AkyWelcomeCardProps {
  theme: CourseTheme
  activeCourseTitle: string | null | undefined
  onQuickQuestion: (questionText: string) => void
}

export default function AkyWelcomeCard({ theme, activeCourseTitle, onQuickQuestion }: AkyWelcomeCardProps) {
  return (
    <>
      <Card className="border-[#d9e4f4] bg-linear-to-br from-[#edf7ff] via-[#f8fbff] to-white shadow-[0_18px_40px_rgba(32,46,84,0.08)] mb-6">
        <CardContent className="space-y-4 px-5 py-5">
          <div className="flex items-start gap-3">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border bg-linear-to-br ${theme.accent} ${theme.heroBorder} ${theme.heroStatText} shadow-[0_12px_24px_rgba(24,49,83,0.14)]`}>
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#24385b]">Salut! Sunt Aky.</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Sunt pregătit să-ți răspund la întrebări pe baza materialelor de la <span className="font-semibold text-slate-800">{activeCourseTitle}</span>. Adresează-mi o întrebare mai jos!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Întrebări rapide</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onQuickQuestion(question)}
              className="rounded-2xl border border-[#d9e4f4] bg-white px-3.5 py-2.5 text-left text-sm text-[#3f698a] shadow-xs transition hover:border-[#bfd5eb] hover:bg-[#f4f8fd]"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
