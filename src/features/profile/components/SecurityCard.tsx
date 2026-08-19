import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface SecurityCardProps {
  email: string
  passwordResetNotice: string
  passwordResetError: string
  sendingPasswordReset: boolean
  handlePasswordReset: () => Promise<void>
}

export default function SecurityCard({
  email,
  passwordResetNotice,
  passwordResetError,
  sendingPasswordReset,
  handlePasswordReset,
}: SecurityCardProps) {
  return (
    <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
      <CardHeader className="px-6 pb-2 pt-6">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900"><ShieldCheck className="h-5 w-5 text-[#4A5681]" />Securitate cont</CardTitle>
        <CardDescription>Vezi adresa de email și cere resetarea parolei.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6 pt-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-600">Adresă email</Label>
          <p className="text-base font-medium text-slate-900">{email}</p>
        </div>

        <hr className="border-[#e4d8cd]/60" />

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h4 className="text-base font-semibold text-slate-900">Resetare parolă</h4>
            <p className="text-sm text-slate-500">Trimite un link securizat pe email pentru schimbarea parolei.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => void handlePasswordReset()} disabled={sendingPasswordReset} className="shrink-0 rounded-2xl border-[#d9ccbe] bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-[#f7efe6]">
            <KeyRound className="mr-2 h-4 w-4 text-[#4A5681]" />
            {sendingPasswordReset ? "Se trimite..." : "Schimbă parola"}
          </Button>
        </div>
        {passwordResetNotice ? (
          <Alert className="rounded-3xl border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <AlertTitle>Succes</AlertTitle>
            <AlertDescription className="text-emerald-800">{passwordResetNotice}</AlertDescription>
          </Alert>
        ) : null}
        {passwordResetError ? (
          <Alert variant="destructive" className="rounded-3xl border-rose-200 bg-white/90 px-5 py-4">
            <AlertTitle>Eroare</AlertTitle>
            <AlertDescription>{passwordResetError}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  )
}
