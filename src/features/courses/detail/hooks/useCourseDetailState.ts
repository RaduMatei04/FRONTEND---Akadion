import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import {
  getAdminCourse,
  getAdminCourseProfessor,
  getCourseErrorMessage,
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
} from "@/features/courses/api/courses"
import { isAdminUser, isProfessorUser, isStudentUser } from "@/lib/user"
import {
  formatInputDate,
  normalizeStudentAvailableCourse,
  normalizeStudentEnrolledCourse,
  toDocumentRecordArray,
  toWeekRecordArray,
} from "../course-detail.utils"
import type {
  CourseForm,
  CourseTab,
  DocumentsByWeekMap,
  EditingDocumentMap,
  ExpandedStateMap,
  ProfessorDetails,
  UploadErrorsMap,
  WeekFeedbackMap,
  WeekRecord,
} from "../course-detail.types"
import type { AppAxiosError, FieldErrors } from "@/types/api"
import type { Course } from "@/types/course"
import type { AuthUser } from "@/types/user"

export function useCourseDetailState() {
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
  const [documentsByWeek, setDocumentsByWeek] = useState<DocumentsByWeekMap>({})
  const [weekUpdateFeedback, setWeekUpdateFeedback] = useState<WeekFeedbackMap>({})
  const [uploadErrors, setUploadErrors] = useState<UploadErrorsMap>({})
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

  function getCourseApi() {
    return isAdmin ? getAdminCourse : getProfessorCourse
  }

  function getWeeksApi() {
    if (isAdmin) {
      return listAdminCourseWeeks
    }
    return isStudent ? listStudentCourseWeeks : listCourseWeeks
  }

  function getDocumentsApi() {
    if (isAdmin) {
      return listAdminWeekDocuments
    }
    return isStudent ? listStudentWeekDocuments : listWeekDocuments
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

  return {
    courseId,
    navigate,
    refreshAuth,
    isProfessor,
    isAdmin,
    isStudent,
    canEdit,
    canViewStudents,
    course,
    setCourse,
    professorDetails,
    setProfessorDetails,
    students,
    setStudents,
    courseForm,
    setCourseForm,
    fieldErrors,
    setFieldErrors,
    weeks,
    setWeeks,
    documentsByWeek,
    setDocumentsByWeek,
    weekUpdateFeedback,
    setWeekUpdateFeedback,
    uploadErrors,
    setUploadErrors,
    editingDocumentIds,
    setEditingDocumentIds,
    expandedWeekIds,
    setExpandedWeekIds,
    indexExpandedWeekIds,
    setIndexExpandedWeekIds,
    pageError,
    setPageError,
    pageNotice,
    setPageNotice,
    activeAction,
    setActiveAction,
    activeTab,
    setActiveTab,
    courseIndexOpen,
    setCourseIndexOpen,
    courseEditorOpen,
    setCourseEditorOpen,
    newWeekOpen,
    setNewWeekOpen,
    uploadFileInputRefs,
    documentFileInputRefs,
    pageLoading,
    refetchWorkflow,
    runCourseRequest,
  }
}

export type CourseDetailState = ReturnType<typeof useCourseDetailState>
