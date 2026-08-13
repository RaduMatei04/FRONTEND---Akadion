import { useCallback, useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import apiClient from "@/api/client"
import { AuthContext } from "@/auth/AuthContext"
import { startLogout } from "@/auth/logout"

import type { AppAxiosError } from "@/types/api"
import type { AuthProviderProps } from "@/types/auth"
import type { AuthUser } from "@/types/user"

const AUTH_ME_QUERY_KEY = ["auth", "me"] as const

function getErrorMessage(error: unknown) {
  const authError = error as AppAxiosError
  return authError.response?.data?.message ?? authError.response?.data?.eroare ?? "Nu am putut verifica sesiunea curentă."
}

// Dacă Spring Security returnează 403 pe un endpoint de business (nu /api/auth/me),
// iar utilizatorul are stareCont ACTIV conform DB-ului, înseamnă că sesiunea
// a fost stabilită înainte de aprobarea contului (autoritățile sunt goale în sesiune).
// Soluția: forțăm un re-login pentru a reîmprospăta sesiunea cu noile autorități.
function forceRelogin() {
  window.location.assign("/oauth2/authorization/keycloak")
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [error, setError] = useState("")

  // Păstrăm o referință la user pentru a putea fi accesată în interceptorul Axios
  // fără a re-crea interceptorul la fiecare schimbare a stării.
  const userRef = useRef<AuthUser | null>(null)
  useEffect(() => {
    userRef.current = user
  }, [user])

  const refreshAuth = useCallback(async (): Promise<void> => {
    setLoading(true)

    try {
      const response = await apiClient.get<AuthUser>("/api/auth/me")
      setUser(response.data as AuthUser)
      setAuthenticated(true)
      setError("")
      queryClient.setQueryData(AUTH_ME_QUERY_KEY, response.data)
    } catch (authError: unknown) {
      const typedError = authError as AppAxiosError

      if (typedError.response?.status === 401) {
        setUser(null)
        setAuthenticated(false)
        setError("")
        queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY, exact: true })
      } else {
        setUser(null)
        setAuthenticated(false)
        setError(getErrorMessage(authError))
        queryClient.removeQueries({ queryKey: AUTH_ME_QUERY_KEY, exact: true })
      }
    } finally {
      setLoading(false)
    }
  }, [queryClient])

  useEffect(() => {
    void refreshAuth()
  }, [refreshAuth])

  // Interceptor: detectează 403 pe endpoint-uri de business când utilizatorul
  // este ACTIV în DB — semn că sesiunea nu conține autoritățile actualizate.
  useEffect(() => {
    apiClient.setBusinessForbiddenHandler(({ error, requestUrl }) => {
      const is403 = error.response?.status === 403
      const isBusinessEndpoint = !requestUrl.includes("/api/auth/me")
      const currentUser = userRef.current
      const isUserActive = currentUser?.stareCont === "ACTIV"

      if (is403 && isBusinessEndpoint && isUserActive) {
        // Sesiunea Spring Security nu are autorități, deși DB-ul spune ACTIV.
        // Forțăm re-autentificarea pentru a reîmprospăta sesiunea.
        forceRelogin()
      }
    })

    return () => {
      apiClient.setBusinessForbiddenHandler(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ loading, authenticated, user, error, refreshAuth, setUser, setAuthenticated, setError, startLogout }}>
      {children}
    </AuthContext.Provider>
  )
}
