import { UserRound } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { FieldErrors } from "@/types/api"
import type { PersonalInfoForm } from "@/features/profile/profile.types"

interface PersonalInfoCardProps {
  profileForm: PersonalInfoForm
  profileErrors: FieldErrors
  updateProfileMutationPending: boolean
  clearProfileError: (field: string) => void
}

export default function PersonalInfoCard({ profileForm, profileErrors, updateProfileMutationPending, clearProfileError }: PersonalInfoCardProps) {
  return (
    <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
      <CardHeader className="px-6 pb-2 pt-6">
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900"><UserRound className="h-5 w-5 text-[#4A5681]" />Informații personale</CardTitle>
        <CardDescription>Actualizează-ți numele, prenumele și facultatea.</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-3">
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void profileForm.handleSubmit() }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-nume" className="text-xs font-bold uppercase tracking-wider text-slate-600">Nume</Label>
              <profileForm.Field name="nume">
                {(field) => (
                  <>
                     <Input id="profile-nume" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => { field.handleChange(event.target.value); clearProfileError("nume") }} className="h-12 rounded-2xl border-[#e4d8cd] bg-[#fcf8f3] px-4 text-base focus-visible:border-[#4A5681] focus-visible:ring-[#4A5681]/10" />
                    {field.state.meta.errors[0] ? <p className="text-sm text-rose-600">{String(field.state.meta.errors[0])}</p> : null}
                    {profileErrors.nume ? <p className="text-sm text-rose-600">{profileErrors.nume}</p> : null}
                  </>
                )}
              </profileForm.Field>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-prenume" className="text-xs font-bold uppercase tracking-wider text-slate-600">Prenume</Label>
              <profileForm.Field name="prenume">
                {(field) => (
                  <>
                     <Input id="profile-prenume" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => { field.handleChange(event.target.value); clearProfileError("prenume") }} className="h-12 rounded-2xl border-[#e4d8cd] bg-[#fcf8f3] px-4 text-base focus-visible:border-[#4A5681] focus-visible:ring-[#4A5681]/10" />
                    {field.state.meta.errors[0] ? <p className="text-sm text-rose-600">{String(field.state.meta.errors[0])}</p> : null}
                    {profileErrors.prenume ? <p className="text-sm text-rose-600">{profileErrors.prenume}</p> : null}
                  </>
                )}
              </profileForm.Field>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-facultate" className="text-xs font-bold uppercase tracking-wider text-slate-600">Facultate</Label>
            <profileForm.Field name="facultate">
              {(field) => (
                <>
                   <Input id="profile-facultate" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => { field.handleChange(event.target.value); clearProfileError("facultate") }} className="h-12 rounded-2xl border-[#e4d8cd] bg-[#fcf8f3] px-4 text-base focus-visible:border-[#4A5681] focus-visible:ring-[#4A5681]/10" />
                  {profileErrors.facultate ? <p className="text-sm text-rose-600">{profileErrors.facultate}</p> : null}
                </>
              )}
            </profileForm.Field>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={updateProfileMutationPending} className="rounded-2xl bg-[#4A5681] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#424D73]">
              {updateProfileMutationPending ? "Se salvează..." : "Salvează modificările"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
