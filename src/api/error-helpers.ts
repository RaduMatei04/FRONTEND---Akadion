import type { ApiError, FieldErrors } from "@/types/api"

export function getApiErrorMessage(error: unknown, fallbackMessage: string) {
  const typedError = error as ApiError
  const status = typedError.response?.status
  const backendMessage = typedError.response?.data?.message ?? typedError.response?.data?.eroare

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

export function getApiFieldErrors(error: unknown): FieldErrors {
  const fieldErrors = (error as ApiError).response?.data?.campuri
  return fieldErrors && typeof fieldErrors === "object" ? fieldErrors : {}
}
