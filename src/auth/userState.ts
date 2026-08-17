import type { UserState } from "@/auth/auth.types"
import type { AdminManagedUser } from "@/features/admin/users/admin-users.types"

export const USER_STATES: UserState[] = ["ALL", "PENDING", "ACTIV", "INACTIV", "RESPINS", "INCOMPLET"]

export const stateLabels: Record<UserState, string> = {
  ALL: "Toți",
  PENDING: "În așteptare",
  ACTIV: "Activi",
  RESPINS: "Respinși",
  INACTIV: "Inactivi",
  INCOMPLET: "Profil incomplet",
}

export const stateBadgeClasses = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  ACTIV: "border-emerald-200 bg-emerald-50 text-emerald-700",
  RESPINS: "border-rose-200 bg-rose-50 text-rose-700",
  INACTIV: "border-slate-200 bg-slate-100 text-slate-600",
  INCOMPLET: "border-indigo-200 bg-indigo-50 text-indigo-700",
}

export const routeByState: Record<Exclude<UserState, "ALL">, string> = {
  INCOMPLET: "/complete-profile",
  PENDING: "/asteptare-aprobare",
  RESPINS: "/cerere-respinsa",
  INACTIV: "/cont-dezactivat",
  ACTIV: "/",
}

export function getActiveHomeRoute() {
  return "/"
}

export function getAdminUserState(user: AdminManagedUser | null | undefined) {
  return user?.stare ?? user?.stareCont ?? "NECUNOSCUT"
}

export function normalizeAdminFilter(value: string | null) {
  const normalizedValue = String(value || "").toUpperCase()
  return USER_STATES.includes(normalizedValue as UserState) ? normalizedValue as UserState : "ALL"
}
