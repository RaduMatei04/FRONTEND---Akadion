import { useCallback, useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/api/client"
import { AUTH_ME_QUERY_KEY, getAuthenticatedUser } from "@/auth/api/auth"
import { AuthContext } from "@/auth/AuthContext"
import type { AuthProviderProps } from "@/auth/auth.types"
import { startLogout } from "@/auth/logout"

import type { ApiError } from "@/types/api"
import type { AuthUser } from "@/types/user"

function getErrorMessage(error: unknown) {
  const authError = error as ApiError
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

  const authMeQuery = useQuery<AuthUser | null>({
    queryKey: AUTH_ME_QUERY_KEY,
    queryFn: getAuthenticatedUser,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Păstrăm o referință la user pentru handlerul de business 403
  // fără a-l reatașa la fiecare schimbare a stării.
  const user = authMeQuery.data ?? null
  const loading = authMeQuery.isPending || authMeQuery.isFetching
  const authenticated = Boolean(user)
  const error = authMeQuery.isError && (authMeQuery.error as ApiError).response?.status !== 401
    ? getErrorMessage(authMeQuery.error)
    : ""

  const userRef = useRef<AuthUser | null>(null)
  useEffect(() => {
    userRef.current = user
  }, [user])

  const refreshAuth = useCallback(async (): Promise<void> => {
    await authMeQuery.refetch()
  }, [authMeQuery])

  const setUserState = useCallback((value: ((currentValue: AuthUser | null) => AuthUser | null) | AuthUser | null) => {
    const nextValue = typeof value === "function" ? value(user) : value
    queryClient.setQueryData(AUTH_ME_QUERY_KEY, nextValue)
  }, [queryClient, user])

  const setAuthenticatedState = useCallback((value: ((currentValue: boolean) => boolean) | boolean) => {
    const nextValue = typeof value === "function" ? value(authenticated) : value

    if (nextValue) {
      void refreshAuth()
      return
    }

    queryClient.setQueryData(AUTH_ME_QUERY_KEY, null)
  }, [authenticated, queryClient, refreshAuth])

  const setErrorState = useCallback((_value: ((currentValue: string) => string) | string) => {
    // Auth server-fetch error este derivată din query-ul /api/auth/me.
  }, [])

  // Handler: detectează 403 pe endpoint-uri de business când utilizatorul
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
    <AuthContext.Provider value={{ loading, authenticated, user, error, refreshAuth, setUser: setUserState, setAuthenticated: setAuthenticatedState, setError: setErrorState, startLogout }}>
      {children}
    </AuthContext.Provider>
  )
}
