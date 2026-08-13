import { useMutation, useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/auth/useAuth"
import AppShell from "@/app/layout/AppShell"
import AkyChatWidget from "@/features/aky-chat/AkyChatWidget"
import StudyToolsThemePicker from "@/features/study-tools/components/StudyToolsThemePicker"
import FlashcardsConfigurationCard from "@/features/study-tools/flashcards/components/FlashcardsConfigurationCard"
import FlashcardsDeckView from "@/features/study-tools/flashcards/components/FlashcardsDeckView"
import { Card, CardContent } from "@/components/ui/card"
import { genereazaFlashcards, getDocumenteAccesibile } from "@/features/study-tools/api/studyTools"
import { getCourseTheme } from "@/lib/courseThemes"
import { listStudentCourses } from "@/features/courses/api/courses"
import { useStoredPageTheme } from "@/features/study-tools/lib/pageThemeStorage"
import { isStudentUser } from "@/lib/user"
import { cn } from "@/lib/utils"

import type { AppAxiosError } from "@/types/api"
import type { Flashcard } from "@/types/quiz"
const FLASHCARDS_COURSES_QUERY_KEY = ["flashcards", "courses"] as const

interface CourseOption {
  id?: string | number
  denumire?: string
}

interface AccessibleDocument {
  documentId?: string | number
  numeFisier?: string
  [key: string]: unknown
}

interface FlashcardRecord extends Flashcard {
  fata?: string
  verso?: string
}

export default function FlashcardsPage() {
  const { user } = useAuth()
  const isStudent = isStudentUser(user)

  const [selectedCourseId, setSelectedCourseId] = useState("")

  const [selectedFlashcardDocId, setSelectedFlashcardDocId] = useState("")
  const [flashcardNumQuestions, setFlashcardNumQuestions] = useState(5)

  const [flashcardQuestions, setFlashcardQuestions] = useState<FlashcardRecord[]>([])
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0)
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false)
  const [flashcardError, setFlashcardError] = useState("")

  const [themePickerOpen, setThemePickerOpen] = useState(false)
  const themePickerRef = useRef<HTMLDivElement | null>(null)
  const { selectedThemeKey, setSelectedThemeKey } = useStoredPageTheme(user, "akadion:flashcards-page-theme")
  const theme = getCourseTheme(selectedThemeKey)

  const { data: courses = [] } = useQuery<CourseOption[]>({
    queryKey: FLASHCARDS_COURSES_QUERY_KEY,
    queryFn: listStudentCourses,
    enabled: isStudent,
  })

  const {
    data: accessibleDocuments = [],
    isLoading: isLoadingDocs,
  } = useQuery<AccessibleDocument[]>({
    queryKey: ["flashcards", "documents", selectedCourseId],
    queryFn: () => getDocumenteAccesibile(selectedCourseId),
    enabled: Boolean(selectedCourseId),
  })

  const generateFlashcardsMutation = useMutation({
    mutationFn: ({ courseId, documentId, count }: { courseId: string; documentId: string; count: number }) =>
      genereazaFlashcards(courseId, documentId ? Number(documentId) : null, count),
  })

  useEffect(() => {
    if (!themePickerOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node)) {
        return
      }

      if (!themePickerRef.current?.contains(event.target)) {
        setThemePickerOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setThemePickerOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [themePickerOpen])

  useEffect(() => {
    setSelectedFlashcardDocId("")
    setFlashcardQuestions([])
    setCurrentFlashcardIndex(0)
    setIsFlashcardFlipped(false)
    setFlashcardError("")
  }, [selectedCourseId])

  function handleThemeChange(themeKey: string) {
    setSelectedThemeKey(themeKey)
    setThemePickerOpen(false)
  }

  async function handleStartFlashcards() {
    if (!selectedCourseId) {
      return
    }

    setFlashcardError("")
    setFlashcardQuestions([])
    setCurrentFlashcardIndex(0)
    setIsFlashcardFlipped(false)

    try {
      const response = await generateFlashcardsMutation.mutateAsync({
        courseId: selectedCourseId,
        documentId: selectedFlashcardDocId,
        count: flashcardNumQuestions,
      })
      if (Array.isArray(response) && response.length > 0) {
        setFlashcardQuestions(response)
        return
      }

      setFlashcardError("Aky nu a putut genera flashcard-uri structurate corect. Încearcă din nou.")
    } catch (error: unknown) {
      const typedError = error as AppAxiosError
      setFlashcardError(typedError.response?.data?.eroare || String(typedError.response?.data?.detail || "") || "Nu am putut genera flashcard-urile.")
    }
  }

  function handleResetFlashcards() {
    setFlashcardQuestions([])
    setCurrentFlashcardIndex(0)
    setIsFlashcardFlipped(false)
    setFlashcardError("")
  }

  if (!isStudent) {
    return (
      <AppShell title="Flashcards" description="Funcționalitatea este disponibilă doar pentru studenți.">
        <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
          <CardContent className="px-6 py-6 text-sm text-slate-600">
            Pagina de flashcards este disponibilă doar utilizatorilor cu rol de student.
          </CardContent>
        </Card>
      </AppShell>
    )
  }

  return (
    <AppShell
      title="Flashcards Aky"
      description="Generează fișe de recapitulare din documentele pe care le poți accesa la cursurile tale."
      heroClassName={cn("relative overflow-visible border", theme.heroBg, theme.heroBorder)}
      heroEyebrowClassName={theme.heroStatLabel}
      heroTitleClassName={theme.sectionTitle}
      heroDescriptionClassName="text-slate-600"
      actions={(
        <div ref={themePickerRef} className="relative z-30 self-end">
          <StudyToolsThemePicker
            currentTheme={theme}
            isOpen={themePickerOpen}
            setIsOpen={setThemePickerOpen}
            onSelectTheme={handleThemeChange}
            buttonLabel="Schimbă tema paginii de flashcards"
          />
        </div>
      )}
    >
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-2 lg:space-y-8">
        <FlashcardsConfigurationCard
          theme={theme}
          selectedCourseId={selectedCourseId}
          setSelectedCourseId={setSelectedCourseId}
          courses={courses}
          selectedFlashcardDocId={selectedFlashcardDocId}
          setSelectedFlashcardDocId={setSelectedFlashcardDocId}
          accessibleDocuments={accessibleDocuments}
          flashcardNumQuestions={flashcardNumQuestions}
          setFlashcardNumQuestions={setFlashcardNumQuestions}
          isLoadingDocs={isLoadingDocs}
          isPending={generateFlashcardsMutation.isPending}
          onStart={handleStartFlashcards}
          flashcardError={flashcardError}
        />

        <FlashcardsDeckView
          theme={theme}
          isPending={generateFlashcardsMutation.isPending}
          flashcardQuestions={flashcardQuestions}
          flashcardError={flashcardError}
          currentFlashcardIndex={currentFlashcardIndex}
          isFlashcardFlipped={isFlashcardFlipped}
          setIsFlashcardFlipped={setIsFlashcardFlipped}
          setCurrentFlashcardIndex={setCurrentFlashcardIndex}
          onReset={handleResetFlashcards}
        />
      </div>

      <AkyChatWidget enabled />
    </AppShell>
  )
}
