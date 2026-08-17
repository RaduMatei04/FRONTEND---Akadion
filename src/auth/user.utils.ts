import type { AuthUser, UserRole } from "@/types/user"

export function normalizeRole(role: UserRole | null | undefined) {
  return String(role || "")
    .replace(/^ROLE_/i, "")
    .toUpperCase()
}

export function isAdminUser(user: AuthUser | null | undefined) {
  return normalizeRole(user?.rol) === "ADMIN"
}

export function isProfessorUser(user: AuthUser | null | undefined) {
  return normalizeRole(user?.rol) === "PROFESOR"
}

export function isStudentUser(user: AuthUser | null | undefined) {
  return normalizeRole(user?.rol) === "STUDENT"
}

export function getRoleLabel(role: UserRole | null | undefined) {
  const normalizedRole = normalizeRole(role)

  if (normalizedRole === "ADMIN") {
    return "Administrator"
  }

  if (normalizedRole === "PROFESOR") {
    return "Profesor"
  }

  if (normalizedRole === "STUDENT") {
    return "Student"
  }

  return "Utilizator"
}

export function getUserInitials(user: AuthUser | null | undefined) {
  const nameInitials = [user?.prenume, user?.nume]
    .filter(Boolean)
    .map((namePart) => namePart.trim().charAt(0))
    .join("")

  if (nameInitials) {
    return nameInitials.slice(0, 2).toUpperCase()
  }

  return (String(user?.mail || "").trim().charAt(0) || "U").toUpperCase()
}

export function getUserDisplayName(user: AuthUser | null | undefined) {
  return [user?.prenume, user?.nume].filter(Boolean).join(" ") || user?.mail || "Utilizator"
}

export function getInitials(value: unknown, fallback = "A") {
  const initials = String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")

  return initials || fallback
}

export function getUserGreetingName(user: AuthUser | null | undefined) {
  return [user?.prenume, user?.nume].filter(Boolean).join(" ") || user?.displayName || user?.mail || "Utilizator"
}
