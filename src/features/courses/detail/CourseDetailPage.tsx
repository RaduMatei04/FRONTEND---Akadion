import {
  AlertCircle,
  ChevronDown,
  CheckCircle2,
  FileText,
  Loader2,
  Menu,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import AppShell from "@/app/layout/AppShell"
import AkyChatWidget from "@/features/aky-chat/AkyChatWidget"
import CourseEditorCard from "@/features/courses/detail/components/CourseEditorCard"
import CourseIndexPanel from "@/features/courses/detail/components/CourseIndexPanel"
import ProfessorInfoCard from "@/features/courses/detail/components/ProfessorInfoCard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/auth/useAuth"
import {
  createCourseWeek,
  completeStudentWeek,
  deleteCourseWeek,
  deleteWeekDocument,
  getAdminCourse,
  getAdminCourseProfessor,
  getCourseErrorMessage,
  getCourseFieldErrors,
  getProfessorCourse,
  getStudentCourseProfessor,
  listAdminCourseStudents,
  listAdminCourseWeeks,
  listAdminWeekDocuments,
  listCourseWeeks,
  listProfessorCourseStudents,
  listStudentAvailableCourses,
  listStudentCourseWeeks,
  listStudentCourses,
  listStudentWeekDocuments,
  listWeekDocuments,
  retryDocumentIngest,
  setProfessorCourseActive,
  uncompleteStudentWeek,
  updateCourseWeek,
  updateProfessorCourse,
  updateWeekDocument,
  uploadWeekDocument,
  withdrawStudentCourse,
} from "@/features/courses/api/courses"
import { COURSE_THEME_KEYS, getCourseTheme, getThemeUserKey } from "@/lib/courseThemes"
import { isAdminUser, isProfessorUser, isStudentUser } from "@/lib/user"
import { cn, formatWeeks } from "@/lib/utils"

import type { AppAxiosError, FieldErrors } from "@/types/api"
import type { Course } from "@/types/course"
import type { CourseTheme } from "@/types/theme"
import type { AuthUser } from "@/types/user"

type EntityId = string | number

interface WeekRecord {
  id: EntityId
  nrSaptamana?: number
  descriere?: string
  finalizata?: boolean
  [key: string]: unknown
}

interface DocumentRecord {
  id: EntityId
  titlu?: string
  urlDescarcare?: string
  urlVizualizare?: string
  activ?: boolean
  statusIndex?: string
  retryable?: boolean
  [key: string]: unknown
}

interface ProfessorDetails {
  mail?: string
  facultate?: string
  [key: string]: unknown
}

interface CourseForm {
  denumire: string
  descriere: string
  dataInceput: string
}

type WeekDraftMap = Record<string, string>
type DocumentsByWeekMap = Record<string, DocumentRecord[]>
type ExpandedStateMap = Record<string, boolean>
type UploadDraft = { titlu?: string; file?: File | null }
type UploadDraftMap = Record<string, UploadDraft>
type UploadErrorsMap = Record<string, string>
type DocumentDraft = { titlu?: string; file?: File | null }
type DocumentDraftMap = Record<string, DocumentDraft>
type EditingDocumentMap = Record<string, boolean>
type WeekFeedbackType = "success" | "error"
type WeekFeedback = { type: WeekFeedbackType; message: string } | null
type WeekFeedbackMap = Record<string, WeekFeedback>
type CourseTab = "saptamani" | "studenti" | "profesor"
type CourseThemeKey = string

function toDateInput(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
    return value
  }

  return ""
}

function toUrlInput(value: unknown) {
  return typeof value === "string" ? value : ""
}

function toWeekRecordArray(value: unknown): WeekRecord[] {
  return Array.isArray(value) ? (value as WeekRecord[]) : []
}

function toDocumentRecordArray(value: unknown): DocumentRecord[] {
  return Array.isArray(value) ? (value as DocumentRecord[]) : []
}

function formatDisplayDate(value: unknown) {
  if (!value) {
    return "-"
  }

  const date = new Date(toDateInput(value))
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("ro-RO", { dateStyle: "medium" }).format(date)
}

function formatInputDate(value: unknown) {
  return value ? String(value).slice(0, 10) : ""
}

function getProfessorName(course: Course | null | undefined) {
  return [course?.profesorPrenume, course?.profesorNume].filter(Boolean).join(" ") || course?.profesorMail || "Profesor nealocat"
}

function getInitials(value: unknown, fallback = "P") {
  const initials = String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return initials || fallback
}

function getStudentName(student: AuthUser | null | undefined) {
  return [student?.prenume, student?.nume].filter(Boolean).join(" ") || student?.mail || "Student"
}

function extractFilename(url: unknown) {
  if (!url) return ""
  try {
    const urlObj = new URL(toUrlInput(url), window.location.origin)
    const pathParts = urlObj.pathname.split('/')
    let lastPart = pathParts[pathParts.length - 1] || ""
    if (lastPart.length > 37 && lastPart[8] === '-' && lastPart[13] === '-') {
      return decodeURIComponent(lastPart.substring(37))
    }
    return decodeURIComponent(lastPart)
  } catch {
    return ""
  }
}

function getDocumentHref(document: DocumentRecord | null | undefined) {
  return document?.urlVizualizare || document?.urlDescarcare || ""
}

function getDocumentStatusClasses(document: DocumentRecord) {
  if (document && !("statusIndex" in document) && !("activ" in document)) {
    return "border-sky-200 bg-sky-50 text-sky-700"
  }

  if (!document.activ) {
    return "border-slate-200 bg-slate-100 text-slate-600"
  }

  switch (String(document.statusIndex || "").toUpperCase()) {
    case "PRELUAT":
      return "border-amber-200 bg-amber-50 text-amber-700"
    case "TRIMIS":
      return "border-emerald-200 bg-emerald-50 text-emerald-700"
    case "ERONAT":
      return "border-rose-200 bg-rose-50 text-rose-700"
    default:
      return "border-amber-200 bg-amber-50 text-amber-700"
  }
}

function canRetryDocumentIngest(document: DocumentRecord) {
  return document.retryable === true || String(document.statusIndex || "").toUpperCase() === "ERONAT"
}

function getDocumentStatusLabel(document: DocumentRecord) {
  if (document && !("statusIndex" in document) && !("activ" in document)) {
    return "Disponibil"
  }

  return document.statusIndex || (document.activ ? "Activ" : "Inactiv")
}

function normalizeStudentEnrolledCourse(course: Course): Course {
  return {
    ...course,
    inscris: true,
    activ: true,
  }
}

function normalizeStudentAvailableCourse(course: Course): Course {
  return {
    ...course,
    inscris: false,
    activ: true,
    nrSaptamaniCurente: course.nrSaptamani,
  }
}

function StatusBadge({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase ${className}`}>
      {children}
    </span>
  )
}

function DetailTab({ active, theme, children, onClick }: { active: boolean; theme: CourseTheme; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-5 py-2.5 text-sm font-semibold transition",
        active
          ? cn("text-white shadow-sm border-transparent", theme?.btnPrimaryBg || "bg-[#24385b]")
          : "border-[#d8ccbf] bg-white text-slate-700 hover:bg-[#f7efe6] hover:text-slate-900"
      )}
    >
      {children}
    </button>
  )
}

function formatDocumentsCount(count: number) {
  return `${count} document${count === 1 ? "" : "e"}`
}

export default function CourseDetailPage() {
  const { courseId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, refreshAuth } = useAuth()
  const isProfessor = isProfessorUser(user)
  const isAdmin = isAdminUser(user)
  const isStudent = isStudentUser(user)
  const canEdit = isProfessor
  const canViewStudents = isProfessor || isAdmin
  const [course, setCourse] = useState<Course | null>((location.state?.course as Course | undefined) ?? null)
  const [professorDetails, setProfessorDetails] = useState<ProfessorDetails | null>(null)
  const [students, setStudents] = useState<AuthUser[]>([])
  const [courseForm, setCourseForm] = useState<CourseForm>({ denumire: "", descriere: "", dataInceput: "" })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [weeks, setWeeks] = useState<WeekRecord[]>([])
  const [weekDrafts, setWeekDrafts] = useState<WeekDraftMap>({})
  const [newWeekDescription, setNewWeekDescription] = useState("")
  const [documentsByWeek, setDocumentsByWeek] = useState<DocumentsByWeekMap>({})
  const [weekUpdateFeedback, setWeekUpdateFeedback] = useState<WeekFeedbackMap>({})
  const [uploadDrafts, setUploadDrafts] = useState<UploadDraftMap>({})
  const [uploadErrors, setUploadErrors] = useState<UploadErrorsMap>({})
  const [documentDrafts, setDocumentDrafts] = useState<DocumentDraftMap>({})
  const [expandedWeekIds, setExpandedWeekIds] = useState<ExpandedStateMap>({})
  const [indexExpandedWeekIds, setIndexExpandedWeekIds] = useState<ExpandedStateMap>({})
  const [pageError, setPageError] = useState("")
  const [pageNotice, setPageNotice] = useState("")
  const [activeAction, setActiveAction] = useState("")
  const [activeTab, setActiveTab] = useState<CourseTab>(() => (location.state?.initialTab === "profesor" || location.hash === "#profesor" ? "profesor" : "saptamani"))
  const [courseIndexOpen, setCourseIndexOpen] = useState(false)
  const [courseEditorOpen, setCourseEditorOpen] = useState(false)
  const [newWeekOpen, setNewWeekOpen] = useState(false)
  const [editingDocumentIds, setEditingDocumentIds] = useState<EditingDocumentMap>({})
  const uploadFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const documentFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    setExpandedWeekIds((current) => {
      if (weeks.length === 0) {
        return {}
      }

      const next = {}
      weeks.forEach((week) => {
        next[week.id] = current[week.id] ?? false
      })

      return next
    })
  }, [weeks])

  useEffect(() => {
    setIndexExpandedWeekIds((current) => {
      if (weeks.length === 0) {
        return {}
      }

      return Object.fromEntries(weeks.map((week, index) => [week.id, current[week.id] ?? index === 0]))
    })
  }, [weeks])

  function getCourseApi() {
    if (isAdmin) {
      return getAdminCourse
    }
    return getProfessorCourse
  }

  function getWeeksApi() {
    if (isAdmin) {
      return listAdminCourseWeeks
    }
    if (isStudent) {
      return listStudentCourseWeeks
    }
    return listCourseWeeks
  }

  function getDocumentsApi() {
    if (isAdmin) {
      return listAdminWeekDocuments
    }
    if (isStudent) {
      return listStudentWeekDocuments
    }
    return listWeekDocuments
  }

  function getStudentsApi() {
    return isAdmin ? listAdminCourseStudents : listProfessorCourseStudents
  }

  const {
    data: workflowData,
    isLoading: pageLoading,
    error: workflowError,
    refetch: refetchWorkflow,
  } = useQuery({
    queryKey: ["course-detail", courseId, isAdmin ? "admin" : isStudent ? "student" : "professor"],
    enabled: Boolean(courseId),
    queryFn: async () => {
      if (isStudent) {
        const [enrolledCourses, availableCourses] = await Promise.all([
          listStudentCourses(),
          listStudentAvailableCourses(),
        ])
        const normalizedEnrolledCourses = enrolledCourses.map(normalizeStudentEnrolledCourse)
        const normalizedAvailableCourses = availableCourses.map(normalizeStudentAvailableCourse)
        const loadedCourse = normalizedEnrolledCourses.find((item) => String(item.id) === String(courseId))
          ?? normalizedAvailableCourses.find((item) => String(item.id) === String(courseId))

        if (!loadedCourse) {
          throw new Error("Cursul cerut nu a putut fi găsit.")
        }

        const loadedProfessor = await getStudentCourseProfessor(courseId)
        const loadedWeeks = loadedCourse.inscris ? await listStudentCourseWeeks(courseId) : []
        const sortedWeeks = [...toWeekRecordArray(loadedWeeks)].sort((first, second) => Number(first.nrSaptamana ?? 0) - Number(second.nrSaptamana ?? 0))
        const documentsEntries = await Promise.all(
          sortedWeeks.map(async (week) => [week.id, toDocumentRecordArray(await listStudentWeekDocuments(week.id))] as const),
        )

        return {
          course: loadedCourse,
          professorDetails: loadedProfessor,
          courseForm: {
            denumire: loadedCourse?.denumire ?? "",
            descriere: loadedCourse?.descriere ?? "",
            dataInceput: formatInputDate(loadedCourse?.dataInceput),
          },
          weeks: sortedWeeks,
          students: [] as AuthUser[],
          weekDrafts: Object.fromEntries(sortedWeeks.map((week) => [week.id, week.descriere ?? ""])),
          documentsByWeek: Object.fromEntries(documentsEntries),
        }
      }

      const [loadedCourse, loadedWeeks, loadedStudents, loadedProfessor] = await Promise.all([
        getCourseApi()(courseId),
        getWeeksApi()(courseId),
        canViewStudents ? getStudentsApi()(courseId) : Promise.resolve([]),
        isAdmin ? getAdminCourseProfessor(courseId) : Promise.resolve(null),
      ])
      const sortedWeeks = [...toWeekRecordArray(loadedWeeks)].sort((first, second) => Number(first.nrSaptamana ?? 0) - Number(second.nrSaptamana ?? 0))
      const documentsEntries = await Promise.all(
        sortedWeeks.map(async (week) => [week.id, toDocumentRecordArray(await getDocumentsApi()(week.id))] as const),
      )

      return {
        course: loadedCourse,
        professorDetails: loadedProfessor,
        courseForm: {
          denumire: loadedCourse?.denumire ?? "",
          descriere: loadedCourse?.descriere ?? "",
          dataInceput: formatInputDate(loadedCourse?.dataInceput),
        },
        weeks: sortedWeeks,
        students: (Array.isArray(loadedStudents) ? loadedStudents : []) as AuthUser[],
        weekDrafts: Object.fromEntries(sortedWeeks.map((week) => [week.id, week.descriere ?? ""])),
        documentsByWeek: Object.fromEntries(documentsEntries),
      }
    },
  })

  async function runCourseRequest<T>(request: () => Promise<T>, fallbackMessage: string): Promise<T> {
    setPageError("")
    setPageNotice("")

    try {
      return await request()
    } catch (error: unknown) {
      const typedError = error as AppAxiosError
      if (typedError.response?.status === 401) {
        await refreshAuth()
      }
      setPageError(getCourseErrorMessage(error, fallbackMessage))
      throw error
    }
  }

  useEffect(() => {
    if (!workflowData) {
      return
    }

    setCourse(workflowData.course)
    setProfessorDetails(workflowData.professorDetails)
    setCourseForm(workflowData.courseForm)
    setWeeks(workflowData.weeks)
    setStudents(workflowData.students)
    setWeekDrafts(workflowData.weekDrafts)
    setDocumentsByWeek(workflowData.documentsByWeek)
  }, [workflowData])

  useEffect(() => {
    if (!workflowError) {
      return
    }

    const typedError = workflowError as AppAxiosError
    if (typedError.response?.status === 401) {
      void refreshAuth()
    }
    setPageError(getCourseErrorMessage(workflowError, "Nu am putut încărca detaliile cursului."))
  }, [refreshAuth, workflowError])

  useEffect(() => {
    if (location.state?.initialTab === "profesor" || location.hash === "#profesor") {
      setActiveTab("profesor")
    }
  }, [location.state, location.hash])

  useEffect(() => {
    if (canEdit) {
      setCourseEditorOpen(false)
      setNewWeekOpen(false)
      setExpandedWeekIds({})
      setIndexExpandedWeekIds({})
    }
  }, [canEdit, courseId])

  function updateCourseField(field: keyof CourseForm, value: string) {
    setCourseForm((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: "" }))
    setPageError("")
    setPageNotice("")
  }

  async function handleSaveCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: FieldErrors = {}

    if (!courseForm.denumire.trim()) {
      nextErrors.denumire = "Denumirea cursului este obligatorie."
    }

    if (!courseForm.dataInceput) {
      nextErrors.dataInceput = "Data de început este obligatorie."
    }

    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setActiveAction("save-course")

    try {
      const updatedCourse = await runCourseRequest(
        () => updateProfessorCourse(courseId, courseForm),
        "Nu am putut actualiza cursul.",
      )
      setCourse((current) => ({ ...current, ...updatedCourse }))
      setPageNotice("Cursul a fost actualizat.")
    } catch (error: unknown) {
      setFieldErrors((current) => ({ ...current, ...getCourseFieldErrors(error) }))
    } finally {
      setActiveAction("")
    }
  }

  async function handleToggleActive() {
    const nextActive = !course?.activ
    setActiveAction("toggle-course")

    try {
      await runCourseRequest(
        () => setProfessorCourseActive(courseId, nextActive),
        nextActive ? "Nu am putut reactiva cursul." : "Nu am putut dezactiva cursul.",
      )
      setCourse((current) => ({ ...current, activ: nextActive }))
      setPageNotice(nextActive ? "Cursul a fost reactivat." : "Cursul a fost dezactivat.")
    } catch {
      // Error message is already mapped by runCourseRequest.
    } finally {
      setActiveAction("")
    }
  }

  async function handleWithdrawCourse() {
    if (!window.confirm("Confirmi retragerea din acest curs?")) {
      return
    }

    setActiveAction("withdraw-course")

    try {
      await runCourseRequest(
        () => withdrawStudentCourse(courseId),
        "Nu am putut finaliza retragerea din curs.",
      )
      navigate("/courses")
    } catch {
      // Error message is already mapped by runCourseRequest.
    } finally {
      setActiveAction("")
    }
  }

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

  async function handleCreateWeek(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (newWeekDescription.length > 500) {
      setPageError("Descrierea săptămânii poate avea maximum 500 de caractere.")
      return
    }

    setActiveAction("create-week")

    try {
      await runCourseRequest(
        () => createCourseWeek(courseId, { descriere: newWeekDescription }),
        "Nu am putut adăuga săptămâna.",
      )
      setNewWeekDescription("")
      setPageNotice("Săptămâna a fost adăugată.")
      await refetchWorkflow()
    } catch {
      // Error message is already mapped by runCourseRequest.
    } finally {
      setActiveAction("")
    }
  }

  async function handleUpdateWeek(week: WeekRecord) {
    const descriere = weekDrafts[week.id] ?? ""

    if (descriere.length > 500) {
      setWeekUpdateFeedback((current) => ({
        ...current,
        [week.id]: {
          type: "error" as WeekFeedbackType,
          message: "Descrierea săptămânii poate avea maximum 500 de caractere.",
        },
      }))
      return
    }

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
      const typedError = error as AppAxiosError
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

  async function handleUploadDocument(event: React.FormEvent<HTMLFormElement>, week: WeekRecord) {
    event.preventDefault()
    const draft = uploadDrafts[week.id] ?? {}

    if (!draft.titlu?.trim() || !draft.file) {
      setUploadErrors((current) => ({
        ...current,
        [week.id]: "Titlul documentului și fișierul sunt obligatorii pentru upload.",
      }))
      return
    }

    setUploadErrors((current) => ({ ...current, [week.id]: "" }))
    setActiveAction(`upload-document-${week.id}`)

    try {
      await runCourseRequest(
        () => uploadWeekDocument(week.id, { titlu: draft.titlu, file: draft.file }),
        "Nu am putut încărca documentul.",
      )
      setUploadDrafts((current) => ({ ...current, [week.id]: { titlu: "", file: null } }))
      setUploadErrors((current) => ({ ...current, [week.id]: "" }))
      if (uploadFileInputRefs.current[week.id]) {
        uploadFileInputRefs.current[week.id].value = ""
      }
      await refetchWorkflow()
      setPageNotice("Documentul a fost încărcat.")
    } catch (error: unknown) {
      const typedError = error as AppAxiosError
      setUploadErrors((current) => ({ ...current, [week.id]: typedError.response?.data?.eroare || typedError.message || "Nu am putut încărca documentul." }))
    } finally {
      setActiveAction("")
    }
  }

  async function handleUpdateDocument(document: DocumentRecord, _week: WeekRecord) {
    const draft = documentDrafts[document.id] ?? {}
    const titlu = draft.titlu ?? document.titlu ?? ""

    if (!titlu.trim() && !draft.file) {
      setPageError("Adaugă un titlu sau alege un fișier nou pentru document.")
      return
    }

    setActiveAction(`update-document-${document.id}`)

    try {
      await runCourseRequest(
        () => updateWeekDocument(document.id, { titlu, file: draft.file }),
        "Nu am putut actualiza documentul.",
      )
      setDocumentDrafts((current) => ({ ...current, [document.id]: { titlu, file: null } }))
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

  function toggleWeekExpanded(weekId: EntityId) {
    setExpandedWeekIds((current) => ({
      ...current,
      [weekId]: !current[weekId],
    }))
  }

  function toggleIndexWeekExpanded(weekId: EntityId) {
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

  function scrollToWeek(weekId: EntityId) {
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

  const [selectedThemeKey, setSelectedThemeKey] = useState<CourseThemeKey>(() => {
    try {
      const key = window.localStorage.getItem(`akadion:course-theme:${getThemeUserKey(user)}:${courseId}`)
      if (COURSE_THEME_KEYS.has(key)) return key
    } catch {}
    return "akadion"
  })

  useEffect(() => {
    try {
      const key = window.localStorage.getItem(`akadion:course-theme:${getThemeUserKey(user)}:${courseId}`)
      setSelectedThemeKey(COURSE_THEME_KEYS.has(key) ? key : "akadion")
    } catch {
      setSelectedThemeKey("akadion")
    }
  }, [user, courseId])

  const theme: CourseTheme = getCourseTheme(selectedThemeKey)

  const lastWeekNumber = weeks.reduce((highest, week) => Math.max(highest, week.nrSaptamana ?? 0), 0)
  const tabs: CourseTab[] = ["saptamani"]
  if (canViewStudents) {
    tabs.push("studenti")
  }
  if (isAdmin || isStudent) {
    tabs.push("profesor")
  }
  const professorName = getProfessorName(course)
  const professorEmail = professorDetails?.mail || course?.profesorMail || "Email indisponibil"
  const professorFaculty = professorDetails?.facultate || "Facultate indisponibilă"
  return (
    <AppShell
      title={course?.denumire || "Detalii curs"}
      description={course ? course.descriere || `Începe la ${formatDisplayDate(course.dataInceput)}.` : "Se încarcă datele cursului."}
      eyebrow={isAdmin ? "Admin" : isStudent ? "Student" : "Profesor"}
      heroClassName={cn(
        "relative overflow-hidden border",
        theme.heroBg,
        theme.heroBorder
      )}
      heroEyebrowClassName={cn("font-bold tracking-[0.22em]", theme.heroStatLabel)}
      heroTitleClassName="text-slate-900 font-bold tracking-tight"
      heroDescriptionClassName="text-slate-600"
      heroContent={course ? (
        <div className="mt-1">
          {/* Accent bar */}
          <div
            className="mb-5 h-1 w-12 rounded-full opacity-80"
            style={{ backgroundColor: theme.heroAccent }}
          />
          {/* Stat chips */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              !isStudent ? { label: "Status", value: course.activ ? "Activ" : "Inactiv", icon: course.activ ? "●" : "○" } : null,
              { label: "Perioadă", value: `${formatDisplayDate(course.dataInceput)} — ${formatDisplayDate(course.dataSfarsit)}`, small: true },
              { label: "Săptămâni", value: weeks.length },
              { label: "Profesor", value: getProfessorName(course), small: true },
            ].filter(Boolean).map(({ label, value, small, icon }) => (
              <div key={label} className={cn("rounded-2xl px-4 py-3", theme.heroStatBg)}>
                <p className={cn("text-[10px] font-bold tracking-[0.18em] uppercase", theme.heroStatLabel)}>{label}</p>
                <p className={cn("mt-1.5 font-semibold leading-tight", theme.heroStatText, small ? "text-sm" : "text-base")}>
                  {icon ? <span className="mr-1.5 text-xs opacity-70">{icon}</span> : null}{value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      actions={isStudent && course?.inscris ? (
        <Button type="button" variant="outline" onClick={handleWithdrawCourse} disabled={Boolean(activeAction)} className="rounded-2xl border-rose-200 bg-white text-rose-700 hover:bg-rose-50 shadow-xs">
          <Trash2 className="h-4 w-4" />
          Retragere
        </Button>
      ) : canEdit && course ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleToggleActive}
          disabled={Boolean(activeAction)}
          className={cn(
            "rounded-2xl shadow-sm transition-all",
            course.activ
              ? "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100"
              : "border-[#d9ccbe] bg-white text-slate-900 hover:border-[#bcae9e] hover:bg-[#f7efe6]",
          )}
        >
          {activeAction === "toggle-course" ? "Se actualizează..." : course.activ ? "Dezactivează" : "Reactivează"}
        </Button>
      ) : null}
      sideContent={!pageLoading && course && courseIndexOpen ? (
        <CourseIndexPanel
          weeks={weeks}
          documentsByWeek={documentsByWeek}
          indexExpandedWeekIds={indexExpandedWeekIds}
          onClose={() => setCourseIndexOpen(false)}
          onToggleWeek={toggleIndexWeekExpanded}
          onScrollToWeek={scrollToWeek}
          theme={theme}
          formatDocumentsCount={formatDocumentsCount}
          getDocumentHref={getDocumentHref}
          extractFilename={extractFilename}
        />
      ) : null}
    >
      <div className="space-y-6">
        {!pageLoading && course ? (
          <>
            {!courseIndexOpen ? (
              <button
                type="button"
                onClick={handleOpenCourseIndex}
                className={cn(
                  "group fixed left-0 top-28 z-20 flex h-14 w-14 items-center justify-center rounded-r-[1.75rem] border border-l-0 bg-white/95 text-slate-700 shadow-[12px_14px_34px_rgba(32,46,84,0.14)] transition hover:w-16 hover:bg-white hover:text-slate-950 focus-visible:w-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24385b]/20",
                  theme.heroBorder,
                )}
                aria-label="Deschide cuprins curs"
              >
                <Menu className="h-5 w-5" />
                <span className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  Deschide cuprins curs
                </span>
              </button>
            ) : null}
          </>
        ) : null}

        {pageError ? (
          <Alert variant="destructive" className="rounded-3xl border-rose-200 bg-white/90 px-5 py-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Eroare</AlertTitle>
            <AlertDescription>{pageError}</AlertDescription>
          </Alert>
        ) : null}

        {pageNotice ? (
          <Alert className="rounded-3xl border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <AlertTitle>Actualizare reușită</AlertTitle>
            <AlertDescription className="text-emerald-800">{pageNotice}</AlertDescription>
          </Alert>
        ) : null}

        {pageLoading ? (
          <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
            <CardContent className="flex items-center gap-3 px-6 py-8 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Se încarcă fluxul cursului...
            </CardContent>
          </Card>
        ) : null}

        {!pageLoading && course ? (
          <>
            {canEdit ? (
              <CourseEditorCard
                course={course}
                courseEditorOpen={courseEditorOpen}
                setCourseEditorOpen={setCourseEditorOpen}
                courseForm={courseForm}
                fieldErrors={fieldErrors}
                activeAction={activeAction}
                theme={theme}
                updateCourseField={updateCourseField}
                handleSaveCourse={handleSaveCourse}
              />
            ) : null}

            <div className="flex w-fit max-w-full flex-wrap gap-2 rounded-[1.6rem] border border-[#e4d8cd] bg-white/74 p-2 shadow-[0_14px_34px_rgba(32,46,84,0.06)]">
              {tabs.map((tab) => (
                <DetailTab key={tab} active={activeTab === tab} theme={theme} onClick={() => setActiveTab(tab)}>
                  {tab === "saptamani" ? "Săptămâni" : tab === "studenti" ? "Studenți" : "Profesor"}
                </DetailTab>
              ))}
            </div>

            {activeTab === "saptamani" ? (
              <div className="space-y-6">
                {canEdit ? (
                  <Card className="gap-0 overflow-hidden rounded-[1.75rem] border-[#e4d8cd] bg-white/92 py-0 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
                    <button
                      type="button"
                      onClick={() => setNewWeekOpen((currentValue) => !currentValue)}
                      className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-[#fbf6f0] sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      aria-expanded={newWeekOpen}
                    >
                      <div className="min-w-0">
                        <CardTitle className="text-lg text-slate-900">Săptămână nouă</CardTitle>
                        <CardDescription className="mt-1">Adaugă conținutul pentru următoarea săptămână a cursului.</CardDescription>
                      </div>
                      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", theme.btnIconBg, theme.btnIconBorder, theme.btnIconText)}>
                        <ChevronDown className={`h-5 w-5 transition-transform ${newWeekOpen ? "rotate-180" : ""}`} />
                      </span>
                    </button>
                    {newWeekOpen ? (
                      <CardContent className="border-t border-[#eadfd4] px-5 py-5 sm:px-6 sm:py-6">
                        <form className="space-y-4" onSubmit={handleCreateWeek}>
                          <textarea
                            value={newWeekDescription}
                            onChange={(event) => setNewWeekDescription(event.target.value)}
                            placeholder="Descrierea săptămânii"
                            className="min-h-24 w-full rounded-2xl border border-[#e4d8cd] bg-[#f7efe6] px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#24385b] focus:ring-2 focus:ring-[#24385b]/10"
                          />
                          <Button type="submit" disabled={Boolean(activeAction)} className={cn("rounded-2xl text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}>
                            <Plus className="h-4 w-4" />
                            {activeAction === "create-week" ? "Se adaugă..." : "Adaugă săptămâna"}
                          </Button>
                        </form>
                      </CardContent>
                    ) : null}
                  </Card>
                ) : null}

                <div className={cn("rounded-[1.75rem] border px-5 py-5 shadow-[0_14px_34px_rgba(32,46,84,0.04)] sm:px-6", theme.heroBg, theme.heroBorder)}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className={cn("text-xs font-semibold tracking-[0.18em] uppercase", theme.sectionLabel)}>Conținut curs</p>
                      <h2 className={cn("mt-1 text-2xl font-semibold tracking-tight", theme.sectionTitle)}>Săptămâni și documente</h2>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Total: {formatWeeks(weeks.length)}</p>
                  </div>
                </div>

                {weeks.length === 0 ? (
                  <Card className="rounded-[1.75rem] border-dashed border-[#d8ccbf] bg-[#fbf6f0]">
                    <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center text-slate-500">
                      <FileText className={cn("h-8 w-8", theme.iconText)} />
                      <div>
                        <p className="font-semibold text-slate-800">Nu există săptămâni pentru acest curs.</p>
                        <p className="mt-1 text-sm">Conținutul va apărea aici după ce este adăugat.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

                <div className="space-y-5">
                  {weeks.map((week) => {
                    const documents = documentsByWeek[week.id] ?? []
                    const isExpanded = expandedWeekIds[week.id] ?? false

                    return (
                      <Card id={`course-week-${week.id}`} key={week.id} className={`scroll-mt-28 overflow-hidden rounded-[1.75rem] bg-white/94 shadow-[0_18px_48px_rgba(32,46,84,0.08)] ${isStudent && week.finalizata ? "border-emerald-200" : "border-[#e4d8cd]"}`}>
                        <div className="flex flex-col gap-4 border-b border-[#eadfd4] bg-[#fffdfa] px-5 py-5 sm:px-6">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                              <button
                                type="button"
                                onClick={() => toggleWeekExpanded(week.id)}
                                className="flex min-w-0 flex-1 items-start gap-4 text-left"
                              >
                                <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold", isStudent && week.finalizata ? "bg-emerald-100 text-emerald-700" : cn(theme.weekNumBg, theme.weekNumText))}>
                                  S{week.nrSaptamana}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-xl font-semibold text-slate-900">Săptămâna {week.nrSaptamana}</h3>
                                    {canEdit && week.nrSaptamana === lastWeekNumber ? (
                                      <Button type="button" variant="outline" onClick={() => handleDeleteWeek(week)} disabled={Boolean(activeAction)} className="h-9 rounded-2xl border-rose-200 bg-rose-50 px-3 text-rose-700 hover:bg-rose-100">
                                        <Trash2 className="h-4 w-4" />
                                        Șterge
                                      </Button>
                                    ) : null}
                                    {isStudent && week.finalizata ? (
                                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                        Finalizată
                                      </span>
                                    ) : null}
                                  </div>
                                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                                    {week.descriere || "Fără descriere pentru această săptămână."}
                                  </p>
                                </div>
                              </button>
                            </div>

                            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:pl-4">
                              <div className="text-right text-sm text-slate-500">
                                <p>{formatDocumentsCount(documents.length)}{isStudent ? ` • ${week.finalizata ? "Finalizată" : "În progres"}` : ""}</p>
                              </div>
                              {isStudent ? (
                                <Button type="button" variant="outline" onClick={() => handleToggleWeekCompletion(week)} disabled={Boolean(activeAction) || !course?.inscris} className={cn("rounded-2xl border bg-white", theme.btnIconBorder, theme.sectionTitle)}>
                                  <CheckCircle2 className="h-4 w-4" />
                                  {activeAction === `toggle-week-${week.id}` ? "Se actualizează..." : week.finalizata ? "Marchează neparcursă" : "Marchează finalizată"}
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => toggleWeekExpanded(week.id)}
                                className={cn("h-11 w-11 rounded-2xl border p-0", theme.btnIconBg, theme.btnIconBorder, theme.btnIconText)}
                              >
                                <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {isExpanded ? (
                          <CardContent className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
                            {canEdit ? (
                              <div className="space-y-3 rounded-3xl border border-[#e4d8cd] bg-[#fbf6f0] p-4">
                                <div>
                                  <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Descriere săptămână</p>
                                  <p className="mt-1 text-sm text-slate-500">Actualizează pe scurt ce acoperă această etapă.</p>
                                </div>
                                <textarea
                                  value={weekDrafts[week.id] ?? ""}
                                  onChange={(event) => {
                                    setWeekDrafts((current) => ({ ...current, [week.id]: event.target.value }))
                                    setWeekUpdateFeedback((current) => ({ ...current, [week.id]: null }))
                                  }}
                                  className="min-h-24 w-full rounded-2xl border border-[#e4d8cd] bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-[#24385b] focus:ring-2 focus:ring-[#24385b]/10"
                                />
                                <Button type="button" variant="outline" onClick={() => handleUpdateWeek(week)} disabled={Boolean(activeAction)} className="rounded-2xl border-[#d9ccbe] bg-white">
                                  <Save className="h-4 w-4" />
                                  {activeAction === `update-week-${week.id}` ? "Se salvează..." : "Salvează săptămâna"}
                                </Button>
                                {weekUpdateFeedback[week.id]?.type === "success" ? (
                                  <Alert className="rounded-2xl border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                                    <AlertTitle>Actualizare reușită</AlertTitle>
                                    <AlertDescription className="text-emerald-800">{weekUpdateFeedback[week.id].message}</AlertDescription>
                                  </Alert>
                                ) : null}
                                {weekUpdateFeedback[week.id]?.type === "error" ? (
                                  <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50/90">
                                    <AlertCircle className="h-4 w-4 text-rose-600" />
                                    <AlertTitle>Nu am putut actualiza săptămâna</AlertTitle>
                                    <AlertDescription>{weekUpdateFeedback[week.id].message}</AlertDescription>
                                  </Alert>
                                ) : null}
                              </div>
                            ) : null}

                            {canEdit ? (
                              <form className="space-y-4 rounded-3xl border border-[#e4d8cd] bg-[#fbf6f0] p-4" onSubmit={(event) => handleUploadDocument(event, week)}>
                                <div>
                                  <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Document nou</p>
                                  <p className="mt-1 text-sm text-slate-500">Încarcă materiale pentru această săptămână.</p>
                                </div>
                                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-start">
                                  <div className="space-y-2">
                                    <Label htmlFor={`upload-title-${week.id}`} className="text-xs font-semibold tracking-[0.16em] text-slate-600">TITLU DOCUMENT</Label>
                                    <Input
                                      id={`upload-title-${week.id}`}
                                      value={uploadDrafts[week.id]?.titlu ?? ""}
                                      onChange={(event) => setUploadDrafts((current) => ({ ...current, [week.id]: { ...current[week.id], titlu: event.target.value } }))}
                                      className="h-14 rounded-2xl border-[#e4d8cd] bg-white px-4 shadow-none focus-visible:border-[#24385b] focus-visible:ring-[#24385b]/10"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`upload-file-${week.id}`} className="text-xs font-semibold tracking-[0.16em] text-slate-600">FIȘIER</Label>
                                    <Label
                                      htmlFor={`upload-file-${week.id}`}
                                      className={cn(
                                        "flex h-14 cursor-pointer items-center gap-3 rounded-2xl border border-dashed bg-white px-4 text-sm shadow-none transition hover:border-[#24385b] hover:bg-[#fffaf4] focus-within:border-[#24385b] focus-within:ring-2 focus-within:ring-[#24385b]/10",
                                        uploadDrafts[week.id]?.file ? "border-emerald-300 text-emerald-800" : "border-[#d9ccbe] text-slate-600"
                                      )}
                                    >
                                      <Upload className={cn("h-4 w-4 shrink-0", uploadDrafts[week.id]?.file ? "text-emerald-700" : theme.fileIconText)} />
                                      <span className="min-w-0 flex-1">
                                        <span className="block font-semibold">
                                          {uploadDrafts[week.id]?.file?.name ?? "Apasă aici pentru a selecta documentul"}
                                        </span>
                                      </span>
                                      <span className="shrink-0 rounded-full bg-[#24385b]/10 px-4 py-2 text-sm font-bold text-[#24385b]">Alege fișier</span>
                                      <Input
                                        id={`upload-file-${week.id}`}
                                        type="file"
                                        ref={(element) => {
                                          uploadFileInputRefs.current[week.id] = element
                                        }}
                                        onChange={(event) => setUploadDrafts((current) => ({ ...current, [week.id]: { ...current[week.id], file: event.target.files?.[0] ?? null } }))}
                                        className="sr-only"
                                      />
                                    </Label>
                                  </div>
                                  <Button type="submit" disabled={Boolean(activeAction)} className={cn("h-14 rounded-2xl px-5 text-white lg:mt-5", theme.btnPrimaryBg, theme.btnPrimaryHover)}>
                                    <Upload className="h-4 w-4" />
                                    {activeAction === `upload-document-${week.id}` ? "Se încarcă..." : "Încarcă documentul"}
                                  </Button>
                                </div>
                                {uploadErrors[week.id] ? (
                                  <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-rose-700 shadow-[0_12px_30px_rgba(225,29,72,0.08)]">
                                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                                    <div>
                                      <p className="text-sm font-bold text-rose-700">Nu putem încărca documentul încă</p>
                                      <p className="mt-1 text-sm font-semibold leading-6 text-rose-600">{uploadErrors[week.id]}</p>
                                    </div>
                                  </div>
                                ) : null}
                              </form>
                            ) : null}

                            <div className="space-y-3">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                  <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Documente</p>
                                  <p className="text-sm text-slate-500">Materialele disponibile pentru săptămâna {week.nrSaptamana}.</p>
                                </div>
                                <span className="text-sm font-medium text-slate-500">{formatDocumentsCount(documents.length)}</span>
                              </div>

                              {documents.length === 0 ? (
                                <div className="rounded-3xl border border-dashed border-[#d8ccbf] bg-[#fbf6f0] px-5 py-7 text-center text-sm text-slate-500">
                                  Nu există documente în această săptămână.
                                </div>
                              ) : null}

                              {documents.map((document) => {
                                const draft = documentDrafts[document.id] ?? {}
                                const canRetryIngest = canEdit && canRetryDocumentIngest(document)
                                const isEditing = Boolean(editingDocumentIds[document.id])
                                const currentFilename = extractFilename(document.urlDescarcare)
                                const previewUrl = document.urlVizualizare || document.urlDescarcare

                                return (
                                  <article key={document.id} className="rounded-3xl border border-[#e4d8cd] bg-white overflow-hidden">
                                    {/* View mode */}
                                    <div className="flex flex-col gap-0">
                                      <div className="flex items-start gap-3 p-4">
                                        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", theme.fileIconBg, theme.fileIconText)}>
                                          <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-base font-semibold text-slate-900">{document.titlu}</h3>
                                            <StatusBadge className={getDocumentStatusClasses(document)}>{getDocumentStatusLabel(document)}</StatusBadge>
                                          </div>
                                          {currentFilename ? (
                                            <div className="mt-1 flex items-center gap-1.5">
                                              {previewUrl ? (
                                                <a
                                                  href={previewUrl}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className={cn("text-sm font-medium truncate underline-offset-4 hover:underline", theme.linkColor)}
                                                  title={currentFilename}
                                                >
                                                  📎 {currentFilename}
                                                </a>
                                              ) : (
                                                <span className="text-sm text-slate-500 truncate" title={currentFilename}>📎 {currentFilename}</span>
                                              )}
                                            </div>
                                          ) : null}
                                          {document.statusIndex === "ERONAT" && (
                                            <p className="mt-1 text-xs text-amber-600 font-medium">⚠ Fișier stocat, dar neindexat în AI. Apasă "Reîncearcă indexarea" pentru conectarea cu serviciul RAG.</p>
                                          )}
                                        </div>
                                        {canEdit ? (
                                          <div className="flex shrink-0 items-center gap-2">
                                            {canRetryIngest ? (
                                              <Button type="button" variant="outline" size="sm" onClick={() => handleRetryDocument(document, week)} disabled={Boolean(activeAction)} className="rounded-xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs gap-1.5">
                                                <RefreshCcw className="h-3.5 w-3.5" />
                                                Reîncearcă indexarea
                                              </Button>
                                            ) : null}
                                            <Button
                                              type="button"
                                              variant="outline"
                                              size="sm"
                                              onClick={() => setEditingDocumentIds((c) => ({ ...c, [document.id]: !c[document.id] }))}
                                              disabled={Boolean(activeAction)}
                                              className={cn("rounded-xl text-xs gap-1.5", isEditing ? "border-slate-300 bg-slate-100 text-slate-700" : cn("bg-white hover:bg-white/80", theme.btnIconBorder, theme.iconText))}
                                            >
                                              {isEditing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                                              {isEditing ? "Anulează" : "Editează"}
                                            </Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => handleDeleteDocument(document, week)} disabled={Boolean(activeAction)} className="rounded-xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs gap-1.5">
                                              <Trash2 className="h-3.5 w-3.5" />
                                              Șterge
                                            </Button>
                                          </div>
                                        ) : (
                                          document.urlDescarcare ? (
                                            <a href={document.urlDescarcare} rel="noreferrer" className={cn("shrink-0 text-sm font-semibold underline-offset-4 hover:underline", theme.linkColor)}>
                                              Descarcă
                                            </a>
                                          ) : null
                                        )}
                                      </div>

                                      {/* Download link visible when can edit */}
                                      {canEdit && document.urlDescarcare ? (
                                        <div className="border-t border-[#f0eae3] px-4 py-2.5">
                                          <a href={document.urlDescarcare} download={currentFilename || true} rel="noreferrer" className={cn("text-sm font-medium underline-offset-4 hover:underline", theme.linkColor)}>
                                            ↓ Descarcă documentul
                                          </a>
                                        </div>
                                      ) : null}

                                      {/* Edit form — revealed only when editing */}
                                      {canEdit && isEditing ? (
                                        <div className="border-t border-[#e4d8cd] bg-[#faf6f1] p-4">
                                          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">Editare document</p>
                                          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                                            <div className="space-y-1.5">
                                              <Label htmlFor={`document-title-${document.id}`} className="text-xs font-semibold tracking-[0.14em] text-slate-600">TITLU</Label>
                                              <Input
                                                id={`document-title-${document.id}`}
                                                value={draft.titlu ?? document.titlu ?? ""}
                                                onChange={(event) => setDocumentDrafts((current) => ({ ...current, [document.id]: { ...current[document.id], titlu: event.target.value } }))}
                                                className="h-11 rounded-2xl border-[#e4d8cd] bg-white px-4 shadow-none focus-visible:border-[#24385b] focus-visible:ring-[#24385b]/10"
                                              />
                                            </div>
                                            <div className="space-y-1.5">
                                              <Label htmlFor={`document-file-${document.id}`} className="text-xs font-semibold tracking-[0.14em] text-slate-600">ÎNLOCUIEȘTE FIȘIERUL (OPȚIONAL)</Label>
                                              <Input
                                                id={`document-file-${document.id}`}
                                                type="file"
                                                ref={(element) => {
                                                  documentFileInputRefs.current[document.id] = element
                                                }}
                                                onChange={(event) => setDocumentDrafts((current) => ({ ...current, [document.id]: { ...current[document.id], file: event.target.files?.[0] ?? null } }))}
                                                className={cn("h-11 rounded-2xl border-[#e4d8cd] bg-white px-4 shadow-none file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-semibold focus-visible:ring-[#24385b]/10", theme.fileIconText)}
                                              />
                                            </div>
                                            <Button
                                              type="button"
                                              onClick={async () => {
                                                await handleUpdateDocument(document, week)
                                                setEditingDocumentIds((c) => ({ ...c, [document.id]: false }))
                                              }}
                                              disabled={Boolean(activeAction)}
                                              className={cn("rounded-2xl text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}
                                            >
                                              <Save className="h-4 w-4" />
                                              {activeAction === `update-document-${document.id}` ? "Se salvează..." : "Salvează"}
                                            </Button>
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  </article>
                                )
                              })}
                            </div>
                          </CardContent>
                        ) : null}
                      </Card>
                    )
                  })}
                </div>
              </div>
            ) : null}

            {activeTab === "studenti" ? (
              <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
                <CardHeader className="border-b border-[#eadfd4] px-6 py-6">
                  <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
                    <Users className={cn("h-5 w-5", theme.iconText)} />
                    Studenți înscriși
                  </CardTitle>
                  <CardDescription>Total: {students.length} studenți.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 px-6 py-6">
                  {students.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#d8ccbf] bg-[#fbf6f0] px-5 py-8 text-center text-sm text-slate-500">
                      Nu există studenți înscriși la acest curs.
                    </div>
                  ) : null}
                  {students.map((student) => (
                    <article key={student.id ?? student.mail} className="flex flex-col gap-2 rounded-3xl border border-[#e4d8cd] bg-[#fbf6f0] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold", theme.studentInitialBg, theme.studentInitialText)}>
                          {String(student.prenume || student.mail || "S").charAt(0).toUpperCase()}{String(student.nume || "").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{getStudentName(student)}</h3>
                          <p className="text-sm text-slate-500">{student.mail || "-"}</p>
                          {student.facultate ? <p className="text-sm text-slate-500">{student.facultate}</p> : null}
                        </div>
                      </div>
                    </article>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {activeTab === "profesor" ? (
              <ProfessorInfoCard
                theme={theme}
                professorName={professorName}
                professorEmail={professorEmail}
                professorFaculty={professorFaculty}
                getInitials={getInitials}
              />
            ) : null}
            <AkyChatWidget
              courseId={course?.id}
              courseTitle={course?.titlu || course?.denumire}
              enabled={isStudent || isProfessor}
            />
          </>
        ) : null}

        {!pageLoading && !course ? (
          <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
            <CardContent className="space-y-4 px-6 py-8 text-center text-slate-600">
              <p>Cursul cerut nu a putut fi găsit sau nu ai acces la el.</p>
              <Button type="button" onClick={() => navigate("/courses")} className={cn("rounded-2xl text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}>
                Înapoi la cursuri
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  )
}
