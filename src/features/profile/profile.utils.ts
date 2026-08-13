import type { AppAxiosError, FieldErrors } from "@/types/api"

export function getInitials(displayName: string) {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "A"
}

export function getProfileErrorMessage(error: unknown, fallback: string) {
  const data = (error as AppAxiosError).response?.data
  if (data?.detalii && data?.eroare && data.detalii !== data.eroare) {
    return `${data.eroare} (${data.detalii})`
  }
  return data?.message ?? data?.eroare ?? fallback
}

export function getProfileFieldErrors(error: unknown): FieldErrors {
  return ((error as AppAxiosError).response?.data?.campuri as FieldErrors | undefined) ?? {}
}
