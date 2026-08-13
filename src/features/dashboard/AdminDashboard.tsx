import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { AlertCircle, BookOpenText, Clock3, Users } from "lucide-react"
import AppShell from "@/app/layout/AppShell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AkyChatWidget from "@/features/aky-chat/AkyChatWidget"
import DashboardStatCard from "@/features/dashboard/DashboardStatCard"
import { useAuth } from "@/auth/useAuth"
import { getAdminStats } from "@/features/courses/api/courses"
import { getUserGreetingName } from "@/lib/user"

import type { AppAxiosError } from "@/types/api"
import { AdminStats, ADMIN_DASHBOARD_QUERY_KEY, adminDashboardLogo } from "@/features/dashboard/dashboardConstants"

export default function AdminDashboard() {
  const { user, refreshAuth } = useAuth()
  const {
    data: stats,
    isLoading: loading,
    error: queryError,
  } = useQuery<AdminStats>({
    queryKey: ADMIN_DASHBOARD_QUERY_KEY,
    queryFn: getAdminStats,
  })

  const typedError = queryError as AppAxiosError | null
  if (typedError?.response?.status === 401) {
    void refreshAuth()
  }

  const error = typedError?.response?.data?.message ?? typedError?.response?.data?.eroare ?? ""

  return (
    <AppShell
      title={`Salut, ${getUserGreetingName(user)}!`}
      eyebrow="Dashboard ADMINISTRATOR"
      heroClassName="relative min-h-[11rem] overflow-hidden border-0 bg-linear-to-r from-[#434f9f] via-[#5869bd] to-[#7c89dc] text-white shadow-[0_24px_60px_rgba(67,79,159,0.26)] lg:items-start before:absolute before:-top-12 before:right-[-3.5rem] before:h-56 before:w-56 before:rounded-full before:bg-white/14 before:content-[''] after:absolute after:-bottom-20 after:left-[-4.5rem] after:h-64 after:w-64 after:rounded-full after:bg-white/10 after:content-['']"
      heroEyebrowClassName="text-white/72"
      heroTitleClassName="text-white"
      heroDescriptionClassName="text-white/84"
      heroVisual={<img src={adminDashboardLogo} alt="Dashboard administrator" className="pointer-events-auto h-full max-h-full w-auto origin-bottom translate-y-[11%] cursor-pointer object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.22)] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:brightness-105 hover:drop-shadow-[0_35px_65px_rgba(0,0,0,0.38)] active:scale-[1.03] active:brightness-105 active:drop-shadow-[0_35px_65px_rgba(0,0,0,0.38)]" />}
      heroVisualClassName="right-2 bottom-0 top-auto h-full items-end justify-center lg:right-5"
    >
      <div className="space-y-6">
        {error ? (
          <Alert variant="destructive" className="rounded-3xl border-rose-200 bg-white/90 px-5 py-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Eroare dashboard admin</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <DashboardStatCard
            icon={Clock3}
            label="Cereri PENDING"
            value={loading ? "..." : (stats?.utilizatoriPending ?? 0)}
            tone="amber"
            action={<Button asChild variant="outline" size="sm" className="rounded-xl border-[#f2bd68] bg-[#fff8eb] text-[#9a4d13] hover:bg-[#ffefd0]"><Link to="/admin/users?stare=PENDING">Vezi detalii</Link></Button>}
          />
          <DashboardStatCard icon={BookOpenText} label="Cursuri active" value={loading ? "..." : (stats?.cursuriActive ?? 0)} />
          <DashboardStatCard icon={Users} label="Utilizatori activi" value={loading ? "..." : (stats?.utilizatoriActivi ?? 0)} tone="emerald" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-[#fcf8f3] shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
            <CardHeader className="px-6 pt-6">
              <CardTitle className="text-xl text-slate-900">Cursuri</CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600">Situația curentă a cursurilor din platformă.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl border border-[#89abe2] bg-linear-to-r from-[#cfe0fb] via-[#b8d3fa] to-[#91bff4] px-4 py-3 text-[#173b72] shadow-[0_14px_32px_rgba(47,95,159,0.12)]"><span className="text-sm font-semibold">ACTIVE</span><span className="text-lg font-semibold">{loading ? "..." : (stats?.cursuriActive ?? 0)}</span></div>
                <div className="flex items-center justify-between rounded-2xl border border-[#ff8fa3] bg-linear-to-r from-[#ffd4dd] via-[#ffb8c7] to-[#ff8fa3] px-4 py-3 text-[#881337] shadow-[0_14px_32px_rgba(159,18,57,0.12)]"><span className="text-sm font-semibold">INACTIVE</span><span className="text-lg font-semibold">{loading ? "..." : (stats?.cursuriInactive ?? 0)}</span></div>
              </div>
              <div className="pt-2"><Button asChild className="rounded-2xl bg-[#4A5681] text-white hover:bg-[#3f4a72]"><Link to="/courses">Vezi toate cursurile</Link></Button></div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-[#fcf8f3] shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
            <CardHeader className="px-6 pt-6">
              <CardTitle className="text-xl text-slate-900">Utilizatori</CardTitle>
              <CardDescription className="text-sm leading-6 text-slate-600">Situația curentă a utilizatorilor din platformă.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 pb-6">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-2xl border border-[#7fd69f] bg-linear-to-r from-[#c8efd7] via-[#aee6c4] to-[#88dca8] px-4 py-3 text-[#14532d] shadow-[0_14px_32px_rgba(31,107,63,0.12)]"><span className="text-sm font-semibold">ACTIVI</span><span className="text-lg font-semibold">{loading ? "..." : (stats?.utilizatoriActivi ?? 0)}</span></div>
                <div className="flex items-center justify-between rounded-2xl border border-[#f2bd68] bg-linear-to-r from-[#ffdda3] via-[#ffcc82] to-[#ffb95c] px-4 py-3 text-[#7c2d12] shadow-[0_14px_32px_rgba(168,93,21,0.12)]"><span className="text-sm font-semibold">PENDING</span><span className="text-lg font-semibold">{loading ? "..." : (stats?.utilizatoriPending ?? 0)}</span></div>
              </div>
              <div className="flex flex-wrap gap-2"><Button asChild className="rounded-2xl bg-[#4A5681] text-white hover:bg-[#3f4a72]"><Link to="/admin/users?stare=PENDING">Vezi detalii</Link></Button></div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AkyChatWidget />
    </AppShell>
  )
}
