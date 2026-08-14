import { CheckCircle2, KeyRound, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

import type { FieldErrors } from "@/types/api"
import type { EmailForm } from "@/features/profile/profile.types"

interface SecurityCardProps {
  emailForm: EmailForm
  emailErrors: FieldErrors
  emailError: string
  emailChanged: boolean
  updateEmailMutationPending: boolean
  clearEmailError: () => void
  passwordResetNotice: string
  passwordResetError: string
  sendingPasswordReset: boolean
  handlePasswordReset: () => Promise<void>
}

export default function SecurityCard({
  emailForm,
  emailErrors,
  emailError,
  emailChanged,
  updateEmailMutationPending,
  clearEmailError,
  passwordResetNotice,
  passwordResetError,
  sendingPasswordReset,
  handlePasswordReset,
}: SecurityCardProps) {
  return (
    <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
      <CardHeader className="px-6 pb-2 pt-6">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900"><ShieldCheck className="h-5 w-5 text-[#24385b]" />Securitate cont</CardTitle>
        <CardDescription>Modifică adresa de email sau cere resetarea parolei.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-6 pt-3">
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void emailForm.handleSubmit() }}>
          <div className="space-y-2">
            <Label htmlFor="profile-email" className="text-xs font-bold uppercase tracking-wider text-slate-600">Adresă email</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <emailForm.Field name="email">
                {(field) => (
                  <Input
                    id="profile-email"
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      field.handleChange(event.target.value)
                      clearEmailError()
                    }}
                    className="h-12 rounded-2xl border-[#e4d8cd] bg-[#fcf8f3] px-4 text-base focus-visible:border-[#24385b] focus-visible:ring-[#24385b]/10"
                  />
                )}
              </emailForm.Field>
              <Button type="submit" variant={emailChanged ? "default" : "outline"} disabled={updateEmailMutationPending || !emailChanged} className={cn("h-12 shrink-0 rounded-2xl px-6 font-semibold", emailChanged ? "bg-[#24385b] text-white hover:bg-[#1a2b47]" : "border-[#d9ccbe] bg-white text-slate-400")}>
                {updateEmailMutationPending ? "Se actualizează..." : "Schimbă emailul"}
              </Button>
            </div>
            {emailErrors.email ? <p className="text-sm text-rose-600">{emailErrors.email}</p> : null}
          </div>
          {emailError ? (
            <Alert variant="destructive" className="rounded-3xl border-rose-200 bg-white/90 px-5 py-4">
              <AlertTitle>Eroare</AlertTitle>
              <AlertDescription>{emailError}</AlertDescription>
            </Alert>
          ) : null}
        </form>

        <hr className="border-[#e4d8cd]/60" />

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h4 className="text-base font-semibold text-slate-900">Resetare parolă</h4>
            <p className="text-sm text-slate-500">Trimite un link securizat pe email pentru schimbarea parolei.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => void handlePasswordReset()} disabled={sendingPasswordReset} className="shrink-0 rounded-2xl border-[#d9ccbe] bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-[#f7efe6]">
            <KeyRound className="mr-2 h-4 w-4 text-[#24385b]" />
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
