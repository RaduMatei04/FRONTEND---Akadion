import type { ReactNode } from "react"

import type { FieldErrors } from "@/types/api"
import type { AuthUser, UserRole } from "@/types/user"

export type UserState = "ALL" | "PENDING" | "ACTIV" | "INACTIV" | "RESPINS" | "INCOMPLET"

export interface CompleteProfileForm {
  nume: string
  prenume: string
  facultate: string
  rolDorit: UserRole | ""
}

export interface AdminManagedUser extends AuthUser {
  id?: string | number
  rolDorit?: UserRole | null
  createdAt?: string
  nrRespingeriAnterioare?: number
}

export interface GuardProps {
  children: ReactNode
}

export interface RequireAuthenticatedStateProps extends GuardProps {
  allowedStates?: UserState[]
}

export interface UserStateBadgeProps {
  state: string
  label?: string
  className?: string
}

export interface UserRoleBadgeProps {
  role?: UserRole | null
}

export interface StatusPageProps {
  title?: string
  description: ReactNode
  accentState: string
  accentLabel?: string
  accentClassName?: string
  primaryAction?: ReactNode
  secondaryAction?: ReactNode
}

export type AdminUserFieldErrors = FieldErrors
