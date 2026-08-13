import { Button } from "@/components/ui/button"
import { startLogout } from "@/auth/logout"
import StatusPage from "@/pages/StatusPage"

export default function DeactivatedAccountPage() {
  return (
    <StatusPage
      description="Contul tău a fost dezactivat de un administrator. Pentru clarificări, contactează echipa Akadion."
      accentState="INACTIV"
      accentLabel="CONT DEZACTIVAT"
      accentClassName="border-slate-200 bg-slate-50 px-5 py-1.5 text-sm text-slate-700"
      primaryAction={<Button onClick={startLogout} variant="outline" size="lg" className="bg-white px-8 text-base text-black hover:bg-white hover:text-black">Logout</Button>}
    />
  )
}
