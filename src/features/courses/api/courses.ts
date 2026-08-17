import apiClient from "@/api/client"

import type { ApiError, FieldErrors } from "@/types/api"
import type { Course, CourseDocument, CourseWeek, ProfessorDetails } from "@/types/course"
import type { AuthUser } from "@/types/user"

const PROFESSOR_COURSES_PATH = "/api/profesor/cursuri"
const ADMIN_COURSES_PATH = "/api/admin/cursuri"
const STUDENT_COURSES_PATH = "/api/student/cursuri"

interface CourseRequestPayload {
  denumire: string
  descriere: string
  dataInceput: string
}

interface WeekPayload {
  descriere: string
}

interface WeekDocumentPayload {
  file?: File | null
  titlu: string
}

type StatsResponse = Record<string, unknown>

function normalizeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : []
}

export function getCourseFieldErrors(error: unknown): FieldErrors {
  const fieldErrors = (error as ApiError).response?.data?.campuri
  return fieldErrors && typeof fieldErrors === "object" ? fieldErrors : {}
}

export function getCourseErrorMessage(error: unknown, fallbackMessage: string): string {
  const typedError = error as ApiError
  const status = typedError.response?.status
  const backendMessage = typedError.response?.data?.eroare ?? typedError.response?.data?.message

  if (backendMessage) {
    return backendMessage
  }

  if (status === 401) {
    return "Sesiunea a expirat. Autentifică-te din nou."
  }

  if (status === 403) {
    return "Nu ai permisiunea necesară pentru această acțiune."
  }

  if (status === 400) {
    return "Cererea trimisă nu este validă."
  }

  if (status === 404) {
    return "Resursa cerută nu a fost găsită."
  }

  if (typeof status === "number" && status >= 500) {
    return "Serverul a răspuns cu o eroare. Încearcă din nou."
  }

  return fallbackMessage
}

function toCourseRequest(payload: CourseRequestPayload): CourseRequestPayload {
  return {
    denumire: payload.denumire.trim(),
    descriere: payload.descriere.trim(),
    dataInceput: payload.dataInceput,
  }
}

export async function listProfessorCourses(): Promise<Course[]> {
  const response = await apiClient.get<Course[]>(PROFESSOR_COURSES_PATH)
  return normalizeArray<Course>(response.data)
}

export async function listAdminCourses(): Promise<Course[]> {
  const response = await apiClient.get<Course[]>(ADMIN_COURSES_PATH)
  return normalizeArray<Course>(response.data)
}

export async function listStudentCourses(): Promise<Course[]> {
  const response = await apiClient.get<Course[]>(`${STUDENT_COURSES_PATH}/mele`)
  return normalizeArray<Course>(response.data)
}

export async function listStudentAvailableCourses(): Promise<Course[]> {
  const response = await apiClient.get<Course[]>(`${STUDENT_COURSES_PATH}/disponibile`)
  return normalizeArray<Course>(response.data)
}

export async function getProfessorCourse(courseId: string | number): Promise<Course> {
  const response = await apiClient.get<Course>(`${PROFESSOR_COURSES_PATH}/${courseId}`)
  return response.data as Course
}

export async function getAdminCourse(courseId: string | number): Promise<Course> {
  const response = await apiClient.get<Course>(`${ADMIN_COURSES_PATH}/${courseId}`)
  return response.data as Course
}

export async function enrollStudentCourse(courseId: string | number): Promise<void> {
  await apiClient.post(`${STUDENT_COURSES_PATH}/${courseId}/inscriere`)
}

export async function withdrawStudentCourse(courseId: string | number): Promise<void> {
  await apiClient.post(`${STUDENT_COURSES_PATH}/${courseId}/retragere`)
}

export async function createProfessorCourse(payload: CourseRequestPayload): Promise<Course> {
  const response = await apiClient.post<Course>(PROFESSOR_COURSES_PATH, toCourseRequest(payload))
  return response.data as Course
}

export async function updateProfessorCourse(courseId: string | number, payload: CourseRequestPayload): Promise<Course> {
  const response = await apiClient.put<Course>(`${PROFESSOR_COURSES_PATH}/${courseId}`, toCourseRequest(payload))
  return response.data as Course
}

export async function setProfessorCourseActive(courseId: string | number, active: boolean): Promise<Course> {
  const action = active ? "activeaza" : "dezactiveaza"
  const response = await apiClient.patch<Course>(`${PROFESSOR_COURSES_PATH}/${courseId}/${action}`)
  return response.data as Course
}

export async function listCourseWeeks(courseId: string | number): Promise<CourseWeek[]> {
  const response = await apiClient.get<CourseWeek[]>(`${PROFESSOR_COURSES_PATH}/${courseId}/saptamani`)
  return normalizeArray<CourseWeek>(response.data)
}

export async function listAdminCourseWeeks(courseId: string | number): Promise<CourseWeek[]> {
  const response = await apiClient.get<CourseWeek[]>(`${ADMIN_COURSES_PATH}/${courseId}/saptamani`)
  return normalizeArray<CourseWeek>(response.data)
}

export async function listStudentCourseWeeks(courseId: string | number): Promise<CourseWeek[]> {
  const response = await apiClient.get<CourseWeek[]>(`${STUDENT_COURSES_PATH}/${courseId}/saptamani`)
  return normalizeArray<CourseWeek>(response.data)
}

export async function createCourseWeek(courseId: string | number, payload: WeekPayload): Promise<CourseWeek> {
  const response = await apiClient.post<CourseWeek>(`${PROFESSOR_COURSES_PATH}/${courseId}/saptamani`, {
    descriere: payload.descriere.trim(),
  })
  return response.data as CourseWeek
}

export async function updateCourseWeek(weekId: string | number, payload: WeekPayload): Promise<CourseWeek> {
  const response = await apiClient.put<CourseWeek>(`/api/profesor/saptamani/${weekId}`, {
    descriere: payload.descriere.trim(),
  })
  return response.data as CourseWeek
}

export async function deleteCourseWeek(weekId: string | number): Promise<void> {
  await apiClient.delete(`/api/profesor/saptamani/${weekId}`)
}

export async function listWeekDocuments(weekId: string | number): Promise<CourseDocument[]> {
  const response = await apiClient.get<CourseDocument[]>(`/api/profesor/saptamani/${weekId}/documente`)
  return normalizeArray<CourseDocument>(response.data)
}

export async function listAdminWeekDocuments(weekId: string | number): Promise<CourseDocument[]> {
  const response = await apiClient.get<CourseDocument[]>(`/api/admin/saptamani/${weekId}/documente`)
  return normalizeArray<CourseDocument>(response.data)
}

export async function listStudentWeekDocuments(weekId: string | number): Promise<CourseDocument[]> {
  const response = await apiClient.get<CourseDocument[]>(`/api/student/saptamani/${weekId}/documente`)
  return normalizeArray<CourseDocument>(response.data)
}

export async function completeStudentWeek(weekId: string | number): Promise<void> {
  await apiClient.post(`/api/student/saptamani/${weekId}/complete`)
}

export async function uncompleteStudentWeek(weekId: string | number): Promise<void> {
  await apiClient.delete(`/api/student/saptamani/${weekId}/complete`)
}

export async function getStudentCourseProfessor(courseId: string | number): Promise<ProfessorDetails> {
  const response = await apiClient.get<ProfessorDetails>(`${STUDENT_COURSES_PATH}/${courseId}/profesor`)
  return response.data as ProfessorDetails
}

export async function listProfessorCourseStudents(courseId: string | number): Promise<AuthUser[]> {
  const response = await apiClient.get<AuthUser[]>(`${PROFESSOR_COURSES_PATH}/${courseId}/studenti`)
  return normalizeArray<AuthUser>(response.data)
}

export async function listAdminCourseStudents(courseId: string | number): Promise<AuthUser[]> {
  const response = await apiClient.get<AuthUser[]>(`${ADMIN_COURSES_PATH}/${courseId}/studenti`)
  return normalizeArray<AuthUser>(response.data)
}

export async function getAdminCourseProfessor(courseId: string | number): Promise<ProfessorDetails> {
  const response = await apiClient.get<ProfessorDetails>(`${ADMIN_COURSES_PATH}/${courseId}/profesor`)
  return response.data as ProfessorDetails
}

export async function getAdminStats(): Promise<StatsResponse> {
  const response = await apiClient.get<StatsResponse>("/api/admin/stats")
  return response.data as StatsResponse
}

export async function uploadWeekDocument(weekId: string | number, payload: WeekDocumentPayload): Promise<CourseDocument> {
  const formData = new FormData()
  formData.append("file", payload.file)
  formData.append("titlu", payload.titlu.trim())

  const response = await apiClient.post<CourseDocument>(`/api/profesor/saptamani/${weekId}/documente`, formData)
  return response.data as CourseDocument
}

export async function updateWeekDocument(documentId: string | number, payload: WeekDocumentPayload): Promise<CourseDocument> {
  const formData = new FormData()

  if (payload.file) {
    formData.append("file", payload.file)
  }

  if (payload.titlu.trim()) {
    formData.append("titlu", payload.titlu.trim())
  }

  const response = await apiClient.put<CourseDocument>(`/api/profesor/documente/${documentId}`, formData)
  return response.data as CourseDocument
}

export async function deleteWeekDocument(documentId: string | number): Promise<void> {
  await apiClient.delete(`/api/profesor/documente/${documentId}`)
}

export async function retryDocumentIngest(documentId: string | number): Promise<CourseDocument> {
  const response = await apiClient.post<CourseDocument>(`/api/profesor/documente/${documentId}/retry-ingest`)
  return response.data as CourseDocument
}
