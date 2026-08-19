import { Card, CardContent } from "@/components/ui/card"

interface ProfileSidebarProps {
  initials: string
  displayName: string
  roleLabel: string
  email: string
  faculty?: string
  profileLogo: string
}

export default function ProfileSidebar({ initials, displayName, roleLabel, email, faculty, profileLogo }: ProfileSidebarProps) {
  return (
    <div className="space-y-6 lg:flex lg:h-full lg:flex-col lg:space-y-0">
      <Card className="overflow-hidden rounded-[1.75rem] border-[#e4d8cd] bg-white shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
        <div className="border-b border-[#e4d8cd] bg-[#fcf8f3] px-5 py-5 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#4A5681] text-xl font-bold text-white shadow-xs">{initials}</div>
          <h2 className="mt-3 truncate text-lg font-bold text-slate-900">{displayName}</h2>
          <span className="mt-1.5 inline-flex items-center rounded-full bg-[#4A5681]/10 px-3 py-0.5 text-xs font-bold tracking-wide uppercase text-[#4A5681]">{roleLabel}</span>
        </div>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-3 px-1 py-1">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#f5eee5] text-xl" aria-hidden="true">📧</span>
            <p className="truncate text-sm font-semibold text-slate-800">{email}</p>
          </div>
          {faculty ? (
            <div className="flex items-center gap-3 px-1 py-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#f5eee5] text-xl" aria-hidden="true">🎓</span>
              <p className="truncate text-sm font-semibold text-slate-800">{faculty}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-1 items-center justify-center pt-6">
        <img src={profileLogo} alt="Profil Akadion" className="mx-auto max-h-[26rem] w-full origin-bottom cursor-pointer object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.22)] transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] hover:brightness-105 hover:drop-shadow-[0_35px_65px_rgba(0,0,0,0.38)] active:scale-[1.03] active:brightness-105 active:drop-shadow-[0_35px_65px_rgba(0,0,0,0.38)]" />
      </div>
    </div>
  )
}
