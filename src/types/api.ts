export type FieldErrors = Record<string, string>

export type EntityId = string | number

export interface ApiErrorBody {
  message?: string
  eroare?: string
  campuri?: FieldErrors
  [key: string]: unknown
}

export interface PaginatedResponse<T> {
  content?: T[]
  continut?: T[]
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
  [key: string]: unknown
}

interface ApiErrorResponse {
  status: number
  data?: ApiErrorBody
}

interface ApiErrorOptions {
  message?: string
  response?: ApiErrorResponse
  requestUrl?: string
}

export class ApiError extends Error {
  response?: ApiErrorResponse
  requestUrl?: string

  constructor({ message, response, requestUrl }: ApiErrorOptions) {
    super(message ?? response?.data?.message ?? response?.data?.eroare ?? "Cererea nu a putut fi procesată.")
    this.name = "ApiError"
    this.response = response
    this.requestUrl = requestUrl
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}
