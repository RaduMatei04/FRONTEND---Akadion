import {
  completeStudentWeek,
  createCourseWeek,
  deleteCourseWeek,
  deleteWeekDocument,
  getCourseErrorMessage,
  retryDocumentIngest,
  uncompleteStudentWeek,
  updateCourseWeek,
  updateWeekDocument,
  uploadWeekDocument,
} from "@/features/courses/api/courses"
import type { ApiError } from "@/types/api"
import { canRetryDocumentIngest } from "../../course-detail.utils"
import type { DocumentRecord, WeekDocumentForm, WeekFeedbackType, WeekRecord } from "../../course-detail.types"
import type { CourseDetailState } from "../../hooks/useCourseDetailState"

export function useWeekActions(state: CourseDetailState) {
  const {
    courseId,
    refetchWorkflow,
    refreshAuth,
    runCourseRequest,
    setActiveAction,
    setActiveTab,
    setCourseIndexOpen,
    setExpandedWeekIds,
    setIndexExpandedWeekIds,
    setPageError,
    setPageNotice,
    setUploadErrors,
    setWeeks,
    setWeekUpdateFeedback,
    uploadFileInputRefs,
    documentFileInputRefs,
  } = state

  async function handleToggleWeekCompletion(week: WeekRecord) {
    setActiveAction(`toggle-week-${week.id}`)

    try {
      await runCourseRequest(
        () => week.finalizata ? uncompleteStudentWeek(week.id) : completeStudentWeek(week.id),
        week.finalizata ? "Nu am putut demarca săptămâna." : "Nu am putut marca săptămâna ca finalizată.",
      )
      await refetchWorkflow()
      setPageNotice(week.finalizata ? "Săptămâna a fost demarcată." : "Săptămâna a fost marcată ca finalizată.")
    } catch {
      // Error message is already mapped by runCourseRequest.
    } finally {
      setActiveAction("")
    }
  }
  async function handleCreateWeek(descriere: string): Promise<boolean> {
    setActiveAction("create-week")

    try {
      await runCourseRequest(
        () => createCourseWeek(courseId, { descriere }),
        "Nu am putut adăuga săptămâna.",
      )
      setPageNotice("Săptămâna a fost adăugată.")
      await refetchWorkflow()
      return true
    } catch {
      return false
    } finally {
      setActiveAction("")
    }
  }

  async function handleUpdateWeek(week: WeekRecord, descriere: string) {
    setActiveAction(`update-week-${week.id}`)
    setWeekUpdateFeedback((current) => ({
      ...current,
      [week.id]: null,
    }))

    try {
      setPageError("")
      setPageNotice("")
      await updateCourseWeek(week.id, { descriere })
      setWeeks((current) => current.map((currentWeek) => currentWeek.id === week.id ? { ...currentWeek, descriere } : currentWeek))
      setWeekUpdateFeedback((current) => ({
        ...current,
        [week.id]: {
          type: "success" as WeekFeedbackType,
          message: "Săptămâna a fost actualizată.",
        },
      }))
    } catch (error: unknown) {
      const typedError = error as ApiError
      if (typedError.response?.status === 401) {
        await refreshAuth()
      }
      setWeekUpdateFeedback((current) => ({
        ...current,
        [week.id]: {
          type: "error" as WeekFeedbackType,
          message: getCourseErrorMessage(error, "Nu am putut actualiza săptămâna."),
        },
      }))
    } finally {
      setActiveAction("")
    }
  }
  async function handleDeleteWeek(week: WeekRecord) {
    if (!window.confirm(`Ștergi săptămâna ${week.nrSaptamana}? Documentele asociate pot fi eliminate.`)) {
      return
    }

    setActiveAction(`delete-week-${week.id}`)

    try {
      await runCourseRequest(() => deleteCourseWeek(week.id), "Nu am putut șterge săptămâna.")
      setPageNotice("Săptămâna a fost ștearsă.")
      await refetchWorkflow()
    } catch {
      // Error message is already mapped by runCourseRequest.
    } finally {
      setActiveAction("")
    }
  }
  async function handleUploadDocument(week: WeekRecord, values: WeekDocumentForm): Promise<boolean> {
    setUploadErrors((current) => ({ ...current, [week.id]: "" }))
    setActiveAction(`upload-document-${week.id}`)

    try {
      await runCourseRequest(
        () => uploadWeekDocument(week.id, { titlu: values.titlu, file: values.file }),
        "Nu am putut încărca documentul.",
      )
      setUploadErrors((current) => ({ ...current, [week.id]: "" }))
      if (uploadFileInputRefs.current[week.id]) {
        uploadFileInputRefs.current[week.id].value = ""
      }
      await refetchWorkflow()
      setPageNotice("Documentul a fost încărcat.")
      return true
    } catch (error: unknown) {
      const typedError = error as ApiError
      setUploadErrors((current) => ({ ...current, [week.id]: typedError.response?.data?.eroare || typedError.message || "Nu am putut încărca documentul." }))
      return false
    } finally {
      setActiveAction("")
    }
  }
  async function handleUpdateDocument(document: DocumentRecord, _week: WeekRecord, values: WeekDocumentForm) {
    setActiveAction(`update-document-${document.id}`)

    try {
      await runCourseRequest(
        () => updateWeekDocument(document.id, { titlu: values.titlu, file: values.file }),
        "Nu am putut actualiza documentul.",
      )
      if (documentFileInputRefs.current[document.id]) {
        documentFileInputRefs.current[document.id].value = ""
      }
      await refetchWorkflow()
      setPageNotice("Documentul a fost actualizat.")
    } catch {
      // Error message is already mapped by runCourseRequest.
    } finally {
      setActiveAction("")
    }
  }

  async function handleDeleteDocument(document: DocumentRecord, _week: WeekRecord) {
    if (!window.confirm(`Ștergi documentul "${document.titlu}"?`)) {
      return
    }

    setActiveAction(`delete-document-${document.id}`)

    try {
      await runCourseRequest(() => deleteWeekDocument(document.id), "Nu am putut șterge documentul.")
      await refetchWorkflow()
      setPageNotice("Documentul a fost șters.")
    } catch {
      // Error message is already mapped by runCourseRequest.
    } finally {
      setActiveAction("")
    }
  }
  async function handleRetryDocument(document: DocumentRecord, _week: WeekRecord) {
    if (!canRetryDocumentIngest(document)) {
      setPageError("Indexarea poate fi repornită doar pentru documente eronate.")
      return
    }

    setActiveAction(`retry-document-${document.id}`)

    try {
      await runCourseRequest(() => retryDocumentIngest(document.id), "Nu am putut reporni indexarea documentului.")
      await refetchWorkflow()
      setPageNotice("Indexarea documentului a fost repornită.")
    } catch {
      // Error message is already mapped by runCourseRequest.
    } finally {
      setActiveAction("")
    }
  }

  function toggleWeekExpanded(weekId: WeekRecord["id"]) {
    setExpandedWeekIds((current) => ({
      ...current,
      [weekId]: !current[weekId],
    }))
  }

  function toggleIndexWeekExpanded(weekId: WeekRecord["id"]) {
    setIndexExpandedWeekIds((current) => ({
      ...current,
      [weekId]: !current[weekId],
    }))
  }

  function handleOpenCourseIndex() {
    setIndexExpandedWeekIds({})
    window.scrollTo({ top: 0, behavior: "smooth" })
    window.setTimeout(() => {
      setCourseIndexOpen(true)
    }, 120)
  }

  function scrollToWeek(weekId: WeekRecord["id"]) {
    setActiveTab("saptamani")
    setExpandedWeekIds((current) => ({ ...current, [weekId]: true }))
    setCourseIndexOpen(false)

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" })
      window.setTimeout(() => {
        document.getElementById(`course-week-${weekId}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 220)
    })
  }

  return {
    handleToggleWeekCompletion,
    handleCreateWeek,
    handleUpdateWeek,
    handleDeleteWeek,
    handleUploadDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    handleRetryDocument,
    toggleWeekExpanded,
    toggleIndexWeekExpanded,
    handleOpenCourseIndex,
    scrollToWeek,
  }
}
