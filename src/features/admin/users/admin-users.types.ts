import type { AuthUser } from "@/types/user"
import type { UserState } from "@/auth/auth.types"

export interface AdminManagedUser extends AuthUser {
  id?: string | number
  rolDorit?: AuthUser["rol"] | null
  createdAt?: string
  nrRespingeriAnterioare?: number
}

export type AdminUsersFilter = UserState
