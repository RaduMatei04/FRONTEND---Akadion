import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { AuthErrorPage, LoadingPage, LoginRedirect } from "@/auth/route-shells"
import { useAuth } from "@/auth/useAuth"
import { routeByState, getActiveHomeRoute } from "@/auth/userState"
import { isAdminUser, isProfessorUser } from "@/lib/user"

import type { RequireAuthenticatedStateProps } from "@/types/app"
import { AccessDeniedPage } from "@/pages/AccessDeniedPage"

export function RequireAuthenticatedState({ allowedStates, children }: RequireAuthenticatedStateProps) {
  const { loading, authenticated, user, error } = useAuth()

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    return <AuthErrorPage />
  }

  if (!authenticated) {
    return <LoginRedirect />
  }

  const currentState = user?.stareCont

  if (allowedStates && !allowedStates.includes((user?.stareCont as never) ?? "ALL")) {
    return <Navigate to={routeByState[currentState ?? "ACTIV"] ?? "/"} replace />
  }

  return children
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { loading, authenticated, user, error } = useAuth()

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    return <AuthErrorPage />
  }

  if (!authenticated) {
    return <LoginRedirect />
  }

  if (user?.stareCont !== "ACTIV") {
    return <Navigate to={routeByState[user?.stareCont ?? "ACTIV"] ?? "/"} replace />
  }

  if (!isAdminUser(user)) {
    return <AccessDeniedPage />
  }

  return children
}

export function LegacyUsersRedirect() {
  const { loading, authenticated, user, error } = useAuth()

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    return <AuthErrorPage />
  }

  if (!authenticated) {
    return <LoginRedirect />
  }

  if (user?.stareCont !== "ACTIV") {
    return <Navigate to={routeByState[user?.stareCont] ?? "/"} replace />
  }

  return <Navigate to={getActiveHomeRoute()} replace />
}

export function RequireActiveProfessor({ children }: { children: ReactNode }) {
  const { loading, authenticated, user, error } = useAuth()

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    return <AuthErrorPage />
  }

  if (!authenticated) {
    return <LoginRedirect />
  }

  if (user?.stareCont !== "ACTIV") {
    return <Navigate to={routeByState[user?.stareCont] ?? "/"} replace />
  }

  if (!isProfessorUser(user)) {
    return <Navigate to="/" replace />
  }

  return children
}
