import type { Dispatch, ReactNode, SetStateAction } from "react"

import type { AuthUser } from "@/types/user"

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
