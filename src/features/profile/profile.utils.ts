import type { ApiError, FieldErrors } from "@/types/api"

export function getProfileErrorMessage(error: unknown, fallback: string) {
  const data = (error as ApiError).response?.data
  if (data?.detalii && data?.eroare && data.detalii !== data.eroare) {
    return `${data.eroare} (${data.detalii})`
  }
  return data?.message ?? data?.eroare ?? fallback
}

export function getProfileFieldErrors(error: unknown): FieldErrors {
  return ((error as ApiError).response?.data?.campuri as FieldErrors | undefined) ?? {}
}
