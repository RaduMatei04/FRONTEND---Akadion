import { AlertCircle, FileText, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { CourseTheme } from "@/types/theme"

interface CourseOption {
  id?: string | number
  denumire?: string
}

interface AccessibleDocument {
  documentId?: string | number
  numeFisier?: string
}

interface FlashcardsConfigurationCardProps {
  theme: CourseTheme
  selectedCourseId: string
  setSelectedCourseId: (value: string) => void
  courses: CourseOption[]
  selectedFlashcardDocId: string
  setSelectedFlashcardDocId: (value: string) => void
  accessibleDocuments: AccessibleDocument[]
  flashcardNumQuestions: number
  setFlashcardNumQuestions: (value: number) => void
  isLoadingDocs: boolean
  isPending: boolean
  onStart: () => Promise<void>
  flashcardError: string
}

export default function FlashcardsConfigurationCard(props: FlashcardsConfigurationCardProps) {
  const {
    theme,
    selectedCourseId,
    setSelectedCourseId,
    courses,
    selectedFlashcardDocId,
    setSelectedFlashcardDocId,
    accessibleDocuments,
    flashcardNumQuestions,
    setFlashcardNumQuestions,
    isLoadingDocs,
    isPending,
    onStart,
    flashcardError,
  } = props

  return (
    <Card className="relative w-full overflow-visible rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
      <CardContent className="space-y-7 px-6 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
        <div className="flex items-start gap-4">
          <div className="flex items-start gap-4">
            <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.6rem] bg-linear-to-br text-white shadow-[0_14px_32px_rgba(32,46,84,0.16)]", theme.accent)}>
              <FileText className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <p className={cn("text-sm font-semibold uppercase tracking-[0.22em]", theme.sectionLabel)}>Configurare Flashcards</p>
              <h2 className={cn("mt-1 text-[2rem] font-semibold leading-tight", theme.sectionTitle)}>Flashcards Aky</h2>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_12rem]">
          <div className="space-y-2">
            <label htmlFor="flashcards-course" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Curs</label>
            <select id="flashcards-course" value={selectedCourseId} onChange={(event) => setSelectedCourseId(event.target.value)} disabled={isPending} className="h-12 w-full rounded-2xl border border-[#d9e4f4] bg-white px-4 text-sm text-[#1e3a5f] shadow-sm outline-hidden transition-all focus:border-emerald-500 focus:outline-none">
              <option value="">Selectează cursul...</option>
              {courses.map((course) => <option key={course.id} value={course.id}>{course.denumire}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="flashcards-doc" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Document</label>
            <select id="flashcards-doc" value={selectedFlashcardDocId} onChange={(event) => setSelectedFlashcardDocId(event.target.value)} disabled={isPending || isLoadingDocs || !selectedCourseId} className="h-12 w-full rounded-2xl border border-[#d9e4f4] bg-white px-4 text-sm text-[#1e3a5f] shadow-sm outline-hidden transition-all focus:border-emerald-500 focus:outline-none disabled:opacity-60">
              <option value="">Toate documentele accesibile</option>
              {accessibleDocuments.map((document) => <option key={document.documentId} value={document.documentId}>{document.numeFisier}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="flashcards-count" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Număr fișe</label>
            <select id="flashcards-count" value={flashcardNumQuestions} onChange={(event) => setFlashcardNumQuestions(Number(event.target.value))} disabled={isPending} className="h-12 w-full rounded-2xl border border-[#d9e4f4] bg-white px-4 text-sm text-[#1e3a5f] shadow-sm outline-hidden transition-all focus:outline-none">
              {[3, 5, 8, 12].map((count) => <option key={count} value={count}>{count}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <Button type="button" onClick={() => void onStart()} disabled={isPending || !selectedCourseId} className={cn("min-w-[14rem] rounded-2xl px-6 text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Generează flashcards
          </Button>
        </div>

        {flashcardError ? (
          <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50/90">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <AlertTitle>Flashcards indisponibile</AlertTitle>
            <AlertDescription>{flashcardError}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}
