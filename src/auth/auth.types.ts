import type { Dispatch, ReactNode, SetStateAction } from "react"

import type { AuthUser } from "@/types/user"

export type UserState = "ALL" | "PENDING" | "ACTIV" | "INACTIV" | "RESPINS" | "INCOMPLET"

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

export interface AuthProviderProps {
  children: ReactNode
}

export interface AuthContextValue {
  loading: boolean
  authenticated: boolean
  user: AuthUser | null
  error: string
  refreshAuth: () => Promise<void>
  setUser: Dispatch<SetStateAction<AuthUser | null>>
  setAuthenticated: Dispatch<SetStateAction<boolean>>
  setError: Dispatch<SetStateAction<string>>
  startLogout: () => void
}
