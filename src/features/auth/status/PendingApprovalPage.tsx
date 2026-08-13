import { Button } from "@/components/ui/button"
import { startLogout } from "@/auth/logout"
import StatusPage from "@/pages/StatusPage"

export default function PendingApprovalPage() {
  return (
    <StatusPage
      description="Profilul a fost trimis cu succes. Un administrator va verifica datele, iar după aprobare vei putea intra în aplicație."
      accentState="PENDING"
      accentLabel="Cererea este în așteptare"
      primaryAction={<Button onClick={startLogout} variant="outline" size="lg" className="px-8 text-base">Logout</Button>}
    />
  )
}
