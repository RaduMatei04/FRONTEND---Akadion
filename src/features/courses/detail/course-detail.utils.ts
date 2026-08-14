import type { DocumentRecord, WeekRecord } from "./course-detail.types"
import type { Course } from "@/types/course"
import type { AuthUser } from "@/types/user"

export function toDateInput(value: unknown) {
  if (typeof value === "string" || typeof value === "number" || value instanceof Date) {
    return value
  }

  return ""
}

export function toUrlInput(value: unknown) {
  return typeof value === "string" ? value : ""
}

export function toWeekRecordArray(value: unknown): WeekRecord[] {
  return Array.isArray(value) ? (value as WeekRecord[]) : []
}

export function toDocumentRecordArray(value: unknown): DocumentRecord[] {
  return Array.isArray(value) ? (value as DocumentRecord[]) : []
}

export function formatDisplayDate(value: unknown) {
  if (!value) {
    return "-"
  }

  const date = new Date(toDateInput(value))
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("ro-RO", { dateStyle: "medium" }).format(date)
}

export function formatInputDate(value: unknown) {
  return value ? String(value).slice(0, 10) : ""
}

export function getStudentName(student: AuthUser | null | undefined) {
  return [student?.prenume, student?.nume].filter(Boolean).join(" ") || student?.mail || "Student"
}

export function extractFilename(url: unknown) {
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

export function getDocumentHref(document: DocumentRecord | null | undefined) {
  return document?.urlVizualizare || document?.urlDescarcare || ""
}

export function getDocumentStatusClasses(document: DocumentRecord) {
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

export function canRetryDocumentIngest(document: DocumentRecord) {
  return document.retryable === true || String(document.statusIndex || "").toUpperCase() === "ERONAT"
}

export function getDocumentStatusLabel(document: DocumentRecord) {
  if (document && !("statusIndex" in document) && !("activ" in document)) {
    return "Disponibil"
  }

  return document.statusIndex || (document.activ ? "Activ" : "Inactiv")
}

export function normalizeStudentEnrolledCourse(course: Course): Course {
  return {
    ...course,
    inscris: true,
    activ: true,
  }
}

export function normalizeStudentAvailableCourse(course: Course): Course {
  return {
    ...course,
    inscris: false,
    activ: true,
    nrSaptamaniCurente: course.nrSaptamani,
  }
}

export function formatDocumentsCount(count: number) {
  return `${count} document${count === 1 ? "" : "e"}`
}
