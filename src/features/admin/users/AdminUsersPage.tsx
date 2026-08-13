import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import apiClient from "@/api/client"
import { getApiErrorMessage } from "@/api/error-helpers"
import { USER_STATES, getAdminUserState, normalizeAdminFilter } from "@/auth/userState"
import { useAuth } from "@/auth/useAuth"
import AppShell from "@/app/layout/AppShell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import AdminUsersFilters from "@/features/admin/users/components/AdminUsersFilters"
import AdminUsersList from "@/features/admin/users/components/AdminUsersList"

import type { AppAxiosError } from "@/types/api"
import type { AdminManagedUser, UserState } from "@/types/app"

const ADMIN_USERS_PER_PAGE = 5
const ADMIN_USERS_QUERY_KEY = ["admin", "users", "all"] as const

const successMessages = {
  approve: "Cererea a fost acceptată.",
  reject: "Cererea a fost respinsă.",
  deactivate: "Utilizatorul a fost dezactivat.",
  activate: "Utilizatorul a fost reactivat.",
}

async function listAdminUsers() {
  const response = await apiClient.get<AdminManagedUser[]>("/api/admin/users", {
    params: { stare: "ALL" },
  })

  return Array.isArray(response.data) ? response.data : []
}

async function runAdminUserAction({ userId, action }: { userId: string | number; action: keyof typeof successMessages }) {
  if (action === "approve" || action === "reject") {
    await apiClient.patch(`/api/admin/users/${userId}/${action}`)
    return
  }

  await apiClient.post(`/api/admin/users/${userId}/${action}`)
}

function formatDateTime(value: unknown) {
  if (!value) {
    return "-"
  }

  const dateValue = typeof value === "string" || typeof value === "number" || value instanceof Date ? value : ""
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("ro-RO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export default function AdminUsersPage() {
  const { refreshAuth } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedState = normalizeAdminFilter(searchParams.get("stare"))
  const [pageError, setPageError] = useState("")
  const [pageNotice, setPageNotice] = useState("")
  const [activeAction, setActiveAction] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data: allUsers = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: listAdminUsers,
  })

  const adminUserActionMutation = useMutation({
    mutationFn: runAdminUserAction,
    onSuccess: async (_, variables) => {
      setPageNotice(successMessages[variables.action] ?? "Acțiunea a fost aplicată.")
      await queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY })
    },
    onError: async (error: unknown) => {
      const typedError = error as AppAxiosError
      if (typedError.response?.status === 401) {
        await refreshAuth()
      }
      setPageError(getApiErrorMessage(error, "Acțiunea nu a putut fi finalizată."))
    },
    onSettled: () => {
      setActiveAction("")
    },
  })

  const stateCounts = allUsers.reduce<Record<string, number>>(
    (accumulator, user) => {
      const state = getAdminUserState(user)
      accumulator[state] = (accumulator[state] ?? 0) + 1
      return accumulator
    },
    { PENDING: 0, ACTIV: 0, INACTIV: 0, RESPINS: 0, INCOMPLET: 0 },
  )

  const tabs = USER_STATES.filter((state) => state !== "INCOMPLET" || stateCounts.INCOMPLET > 0 || selectedState === "INCOMPLET")
  const visibleUsers = selectedState === "ALL"
    ? allUsers
    : allUsers.filter((user) => getAdminUserState(user) === selectedState)
  const totalPages = Math.max(1, Math.ceil(visibleUsers.length / ADMIN_USERS_PER_PAGE))
  const pageStart = (currentPage - 1) * ADMIN_USERS_PER_PAGE
  const paginatedUsers = visibleUsers.slice(pageStart, pageStart + ADMIN_USERS_PER_PAGE)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    if (!usersError) {
      return
    }

    const typedError = usersError as AppAxiosError
    if (typedError.response?.status === 401) {
      void refreshAuth()
    }

    setPageError(getApiErrorMessage(usersError, "Nu am putut încărca utilizatorii."))
  }, [refreshAuth, usersError])

  function handleFilterChange(state: UserState) {
    setCurrentPage(1)
    setSearchParams(state === "ALL" ? {} : { stare: state })
  }

  function handleUserAction(userId: string | number | undefined, action: keyof typeof successMessages) {
    if (!userId) {
      return
    }

    if (action === "reject" && !window.confirm("Confirmi respingerea acestei cereri?")) {
      return
    }

    if (action === "deactivate" && !window.confirm("Confirmi dezactivarea acestui cont?")) {
      return
    }

    setActiveAction(`${action}-${userId}`)
    setPageError("")
    setPageNotice("")
    adminUserActionMutation.mutate({ userId, action })
  }

  return (
    <AppShell
      title="Utilizatori"
      description={`Total: ${usersLoading ? "..." : allUsers.length}. Cereri pending: ${usersLoading ? "..." : stateCounts.PENDING}.`}
      eyebrow="Akadion Admin"
      heroClassName="relative min-h-[11rem] overflow-hidden border-0 bg-linear-to-r from-[#434f9f] via-[#5869bd] to-[#7c89dc] text-white shadow-[0_24px_60px_rgba(67,79,159,0.26)] lg:items-start before:absolute before:-top-12 before:right-[-3.5rem] before:h-56 before:w-56 before:rounded-full before:bg-white/14 before:content-[''] after:absolute after:-bottom-20 after:left-[-4.5rem] after:h-64 after:w-64 after:rounded-full after:bg-white/10 after:content-['']"
      heroEyebrowClassName="text-white/72"
      heroTitleClassName="text-white"
      heroDescriptionClassName="text-white/84"
    >
      <div className="space-y-5">
        {pageError ? (
          <Alert variant="destructive" className="rounded-3xl border-rose-200 bg-white/90 px-5 py-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Eroare la încărcare</AlertTitle>
            <AlertDescription>{pageError}</AlertDescription>
          </Alert>
        ) : null}

        <AdminUsersFilters tabs={tabs} selectedState={selectedState} allUsersLength={allUsers.length} stateCounts={stateCounts} usersLoading={usersLoading} onFilterChange={handleFilterChange} />
        <AdminUsersList allUsersLength={allUsers.length} usersLoading={usersLoading} visibleUsers={visibleUsers} paginatedUsers={paginatedUsers} activeAction={activeAction} pageNotice={pageNotice} onUserAction={handleUserAction} formatDateTime={formatDateTime} currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </AppShell>
  )
}
