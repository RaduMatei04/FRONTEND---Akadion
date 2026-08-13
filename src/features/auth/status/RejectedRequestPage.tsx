import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { startLogout } from "@/auth/logout"
import StatusPage from "@/pages/StatusPage"

export default function RejectedRequestPage() {
  return (
    <StatusPage
      description="Cererea ta a fost respinsă. Editează profilul pentru a retrimite datele corectate. Dacă te deconectezi, revino folosind opțiunea Login."
      accentState="RESPINS"
      accentLabel="Cerere respinsă"
      primaryAction={<Button asChild size="lg" className="px-8 text-base"><Link to="/complete-profile">Editează profilul</Link></Button>}
      secondaryAction={<Button onClick={startLogout} variant="outline" size="lg" className="px-8 text-base">Logout</Button>}
    />
  )
}
