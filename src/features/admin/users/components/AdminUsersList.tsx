import { Check, CheckCheck, UserCog, UserMinus, UserPlus, X } from "lucide-react"
import { UserRoleBadge, UserStateBadge } from "@/auth/badges"
import { getAdminUserState } from "@/auth/userState"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserDisplayName, getUserInitials } from "@/lib/user"

import type { AdminManagedUser } from "@/types/app"

interface AdminUsersListProps {
  allUsersLength: number
  usersLoading: boolean
  visibleUsers: AdminManagedUser[]
  paginatedUsers: AdminManagedUser[]
  activeAction: string
  pageNotice: string
  onUserAction: (userId: string | number | undefined, action: "approve" | "reject" | "deactivate" | "activate") => void
  formatDateTime: (value: unknown) => string
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
}

export default function AdminUsersList({ usersLoading, visibleUsers, paginatedUsers, activeAction, pageNotice, onUserAction, formatDateTime, currentPage, totalPages, setCurrentPage }: AdminUsersListProps) {
  return (
    <Card className="admin-users-surface rounded-[1.75rem] border-0 py-0 shadow-[0_22px_60px_rgba(32,46,84,0.12)]">
      <CardHeader className="border-b border-[#e4d8cd] px-6 py-6 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900"><UserCog className="h-5 w-5 text-[#4A5681]" />Lista utilizatori</CardTitle>
            <CardDescription className="mt-1 text-sm leading-6 text-slate-500">Gestionează utilizatorii și filtrează lista după stare.</CardDescription>
          </div>
          <div className="rounded-2xl border border-[#e4d8cd] bg-white px-4 py-3">
            <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Afișați</p>
            <p className="text-2xl font-semibold text-slate-900">{usersLoading ? "..." : visibleUsers.length}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 px-6 py-6 sm:px-7">
        {pageNotice ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
            <div className="flex items-center gap-2"><CheckCheck className="h-4 w-4 text-emerald-700" /><span className="font-semibold">Actualizare reușită</span></div>
            <p className="mt-1 text-sm text-emerald-800">{pageNotice}</p>
          </div>
        ) : null}

        {usersLoading ? <p className="text-sm text-slate-500">Se încarcă utilizatorii...</p> : null}
        {!usersLoading && visibleUsers.length === 0 ? <div className="rounded-3xl border border-dashed border-[#d8ccbf] bg-[#fbf6f0] px-5 py-8 text-center text-sm text-slate-500">Nu există utilizatori pentru filtrul selectat.</div> : null}

        {paginatedUsers.map((user) => {
          const state = getAdminUserState(user)
          const role = user.rolDorit || user.rol
          const isAccepting = activeAction === `approve-${user.id}`
          const isRejecting = activeAction === `reject-${user.id}`
          const isActivating = activeAction === `activate-${user.id}`
          const isDeactivating = activeAction === `deactivate-${user.id}`
          const canReview = state === "PENDING"
          const canActivate = state === "INACTIV"
          const canDeactivate = state === "ACTIV"

          return (
            <article key={`${state}-${user.id ?? user.mail}`} className="admin-user-entry">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 flex-1 gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eef1fb] text-base font-semibold text-[#4A5681]">{getUserInitials(user)}</div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-900">{getUserDisplayName(user)}</h2>
                      <UserRoleBadge role={role} />
                      <UserStateBadge state={state} />
                    </div>
                    <p className="truncate text-sm font-medium text-slate-600">{user.mail || "-"}</p>
                    <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-3">
                      <p><span className="font-semibold text-slate-900">Facultate:</span> {user.facultate || "-"}</p>
                      <p><span className="font-semibold text-slate-900">Creat la:</span> {formatDateTime(user.createdAt)}</p>
                      <p><span className="font-semibold text-slate-900">Respingeri anterioare:</span> {user.nrRespingeriAnterioare ?? 0}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {canReview ? (
                    <>
                      <Button type="button" onClick={() => onUserAction(user.id, "approve")} disabled={Boolean(activeAction)} className="rounded-xl bg-[#4A5681] px-4 text-white hover:bg-[#3f4a72]"><Check className="h-4 w-4" />{isAccepting ? "Se aprobă..." : "Aprobă"}</Button>
                      <Button type="button" variant="outline" onClick={() => onUserAction(user.id, "reject")} disabled={Boolean(activeAction)} className="rounded-xl border-rose-200 bg-rose-50 px-4 text-rose-700 hover:bg-rose-100"><X className="h-4 w-4" />{isRejecting ? "Se respinge..." : "Respinge"}</Button>
                    </>
                  ) : null}
                  {canDeactivate ? <Button type="button" variant="outline" onClick={() => onUserAction(user.id, "deactivate")} disabled={Boolean(activeAction)} className="rounded-xl border-amber-200 bg-amber-50 px-4 text-amber-700 hover:bg-amber-100"><UserMinus className="h-4 w-4" />{isDeactivating ? "Se dezactivează..." : "Dezactivează"}</Button> : null}
                  {canActivate ? <Button type="button" onClick={() => onUserAction(user.id, "activate")} disabled={Boolean(activeAction)} className="rounded-xl bg-[#4A5681] px-4 text-white hover:bg-[#3f4a72]"><UserPlus className="h-4 w-4" />{isActivating ? "Se reactivează..." : "Reactivează"}</Button> : null}
                  {!canReview && !canActivate && !canDeactivate ? <span className="inline-flex items-center rounded-xl border border-[#ddd3c7] bg-[#f8f2eb] px-3 py-2 text-sm text-slate-500">Nicio acțiune disponibilă pentru această stare.</span> : null}
                </div>
              </div>
            </article>
          )
        })}

        {!usersLoading && visibleUsers.length > 5 ? (
          <div className="flex justify-end pt-2">
            <div className="flex flex-wrap justify-end gap-2">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1
                const isCurrent = pageNumber === currentPage
                return <button key={pageNumber} type="button" onClick={() => setCurrentPage(pageNumber)} className={`flex h-9 min-w-9 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${isCurrent ? "border-[#24385b] bg-[#24385b] text-white shadow-sm" : "border-[#d8ccbf] bg-white text-slate-700 hover:bg-[#f7efe6] hover:text-[#24385b]"}`} aria-current={isCurrent ? "page" : undefined}>{pageNumber}</button>
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
