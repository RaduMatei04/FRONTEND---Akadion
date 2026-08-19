import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { CourseTheme } from "@/types/theme"

interface FlashcardRecord {
  fata?: string
  verso?: string
}

interface FlashcardsDeckViewProps {
  theme: CourseTheme
  isPending: boolean
  flashcardQuestions: FlashcardRecord[]
  flashcardError: string
  currentFlashcardIndex: number
  isFlashcardFlipped: boolean
  setIsFlashcardFlipped: (value: boolean | ((currentValue: boolean) => boolean)) => void
  setCurrentFlashcardIndex: (value: number | ((currentValue: number) => number)) => void
  onReset: () => void
}

export default function FlashcardsDeckView(props: FlashcardsDeckViewProps) {
  const {
    theme,
    isPending,
    flashcardQuestions,
    flashcardError,
    currentFlashcardIndex,
    isFlashcardFlipped,
    setIsFlashcardFlipped,
    setCurrentFlashcardIndex,
    onReset,
  } = props

  return (
    <Card className="w-full rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
      <CardContent className="space-y-7 px-6 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
        {isPending ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <Loader2 className={cn("h-10 w-10 animate-spin", theme.iconText)} />
          </div>
        ) : null}

        {!isPending && flashcardQuestions.length === 0 && !flashcardError ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <h3 className="text-2xl font-semibold text-slate-900">Pregătește un set de fișe</h3>
          </div>
        ) : null}

        {!isPending && flashcardQuestions.length > 0 ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <span>Fișa {currentFlashcardIndex + 1} din {flashcardQuestions.length}</span>
              <span className={theme.sectionLabel}>Memorare activă</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className={cn("h-full bg-linear-to-r transition-all duration-300", theme.accent)} style={{ width: `${((currentFlashcardIndex + 1) / flashcardQuestions.length) * 100}%` }} />
            </div>

            <div className="h-[22rem] w-full cursor-pointer sm:h-[24rem]" style={{ perspective: "1000px" }} onClick={() => setIsFlashcardFlipped((currentValue) => !currentValue)}>
              <div className="relative h-full w-full rounded-[2rem]" style={{ transformStyle: "preserve-3d", transform: isFlashcardFlipped ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                <div className={cn("absolute inset-0 flex h-full w-full flex-col items-center justify-between rounded-[2rem] border p-7 text-center shadow-xs sm:p-8", theme.heroBorder, theme.heroBg)} style={{ backfaceVisibility: "hidden" }}>
                  <span className={cn("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]", theme.badge)}>Concept</span>
                  <p className={cn("flex flex-1 items-center justify-center text-xl font-semibold leading-8 sm:text-2xl sm:leading-9", theme.sectionTitle)}>{flashcardQuestions[currentFlashcardIndex].fata}</p>
                  <span className="text-xs text-slate-500">Apasă pentru răspuns</span>
                </div>
                <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-between rounded-[2rem] border border-[#d9e4f4] bg-white p-7 text-center shadow-xs sm:p-8" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  <span className={cn("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]", theme.badge)}>Explicație</span>
                  <p className="flex max-h-[12rem] flex-1 items-center justify-center overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-[0.95rem]">{flashcardQuestions[currentFlashcardIndex].verso}</p>
                  <span className="text-xs text-slate-500">Apasă pentru întoarcere</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="button" variant="outline" disabled={currentFlashcardIndex === 0} onClick={() => { setIsFlashcardFlipped(false); window.setTimeout(() => { setCurrentFlashcardIndex((currentValue) => currentValue - 1) }, 150) }} className="rounded-2xl border-[#d9ccbe] bg-white px-5">Înapoi</Button>
              {currentFlashcardIndex < flashcardQuestions.length - 1 ? (
                <Button type="button" onClick={() => { setIsFlashcardFlipped(false); window.setTimeout(() => { setCurrentFlashcardIndex((currentValue) => currentValue + 1) }, 150) }} className={cn("rounded-2xl px-5 text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}>Următoarea</Button>
              ) : (
                <Button type="button" onClick={onReset} className={cn("rounded-2xl px-5 text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}>Finalizează și reset</Button>
              )}
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
