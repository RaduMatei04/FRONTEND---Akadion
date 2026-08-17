import apiClient from "@/api/client"

import type { AdminManagedUser } from "@/features/admin/users/admin-users.types"

export const ADMIN_USERS_QUERY_KEY = ["admin", "users", "all"] as const

export const adminUserActionSuccessMessages = {
  approve: "Cererea a fost acceptată.",
  reject: "Cererea a fost respinsă.",
  deactivate: "Utilizatorul a fost dezactivat.",
  activate: "Utilizatorul a fost reactivat.",
}

export type AdminUserAction = keyof typeof adminUserActionSuccessMessages

export async function listAdminUsers() {
  const response = await apiClient.get<AdminManagedUser[]>("/api/admin/users", {
    params: { stare: "ALL" },
  })

  return Array.isArray(response.data) ? response.data : []
}

export async function runAdminUserAction({ userId, action }: { userId: string | number; action: AdminUserAction }) {
  if (action === "approve" || action === "reject") {
    await apiClient.patch(`/api/admin/users/${userId}/${action}`)
    return
  }

  await apiClient.post(`/api/admin/users/${userId}/${action}`)
}
