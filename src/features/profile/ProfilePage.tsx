import { useEffect, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { CheckCircle2 } from "lucide-react"
import AppShell from "@/app/layout/AppShell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/auth/useAuth"
import { getRoleLabel, getUserDisplayName, isAdminUser, requestMyPasswordReset, updateMyEmail, updateMyProfile } from "@/lib/user"
import PersonalInfoCard from "@/features/profile/components/PersonalInfoCard"
import ProfileSidebar from "@/features/profile/components/ProfileSidebar"
import SecurityCard from "@/features/profile/components/SecurityCard"
import { adminHeroClassName, profileLogo, userHeroClassName } from "@/features/profile/profile.constants"
import { emailSchema, profileSchema } from "@/features/profile/profile.schemas"
import { getInitials, getProfileErrorMessage, getProfileFieldErrors } from "@/features/profile/profile.utils"

import type { FieldErrors } from "@/types/api"

export default function ProfilePage() {
  const { user, setUser, refreshAuth } = useAuth()
  const isAdmin = isAdminUser(user)
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({})
  const [emailErrors, setEmailErrors] = useState<FieldErrors>({})
  const [emailError, setEmailError] = useState("")
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")
  const [passwordResetNotice, setPasswordResetNotice] = useState("")
  const [passwordResetError, setPasswordResetError] = useState("")
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false)

  const updateProfileMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      setNotice("Datele personale au fost actualizate cu succes.")
    },
    onError: (submitError: unknown) => {
      setProfileErrors(getProfileFieldErrors(submitError))
      setError(getProfileErrorMessage(submitError, "Nu am putut actualiza datele personale."))
    },
  })

  const updateEmailMutation = useMutation({
    mutationFn: updateMyEmail,
    onSuccess: async (updatedUser) => {
      if (updatedUser) {
        setUser(updatedUser)
      } else {
        await refreshAuth()
      }
      setNotice("Adresa de email a fost actualizată cu succes.")
    },
    onError: (submitError: unknown) => {
      setEmailErrors(getProfileFieldErrors(submitError))
      setEmailError(getProfileErrorMessage(submitError, "Nu am putut schimba adresa de email."))
    },
  })

  const profileForm = useForm({
    defaultValues: {
      nume: user?.nume ?? "",
      prenume: user?.prenume ?? "",
      facultate: user?.facultate ?? "",
    },
    validators: {
      onChange: profileSchema,
    },
    onSubmit: async ({ value }) => {
      setNotice("")
      setError("")
      setPasswordResetNotice("")
      setPasswordResetError("")
      setProfileErrors({})
      await updateProfileMutation.mutateAsync({
        nume: value.nume.trim(),
        prenume: value.prenume.trim(),
        facultate: value.facultate.trim(),
      })
    },
  })

  const emailForm = useForm({
    defaultValues: {
      email: user?.mail ?? "",
    },
    validators: {
      onChange: emailSchema,
    },
    onSubmit: async ({ value }) => {
      setNotice("")
      setError("")
      setPasswordResetNotice("")
      setPasswordResetError("")
      setEmailErrors({})
      setEmailError("")
      await updateEmailMutation.mutateAsync(value.email.trim())
    },
  })

  useEffect(() => {
    profileForm.setFieldValue("nume", user?.nume ?? "")
    profileForm.setFieldValue("prenume", user?.prenume ?? "")
    profileForm.setFieldValue("facultate", user?.facultate ?? "")
    emailForm.setFieldValue("email", user?.mail ?? "")
  }, [emailForm, profileForm, user])

  async function handlePasswordReset() {
    setSendingPasswordReset(true)
    setPasswordResetNotice("")
    setPasswordResetError("")

    try {
      await requestMyPasswordReset()
      setPasswordResetNotice("Un link pentru resetarea parolei a fost trimis pe adresa ta de email.")
    } catch (resetError: unknown) {
      setPasswordResetError(getProfileErrorMessage(resetError, "Nu am putut trimite linkul pentru resetarea parolei."))
    } finally {
      setSendingPasswordReset(false)
    }
  }

  const emailChanged = emailForm.state.values.email.trim() !== (user?.mail ?? "")
  const displayName = getUserDisplayName(user)
  const roleLabel = getRoleLabel(user?.rol)
  const initials = getInitials(displayName)

  const heroClassName = isAdmin ? adminHeroClassName : userHeroClassName

  function clearProfileError(field: string) {
    setProfileErrors((currentErrors) => ({ ...currentErrors, [field]: "" }))
  }

  function clearEmailError() {
    setEmailErrors((currentErrors) => ({ ...currentErrors, email: "" }))
    setEmailError("")
  }

  return (
    <AppShell
      title="Profilul meu"
      description="Gestionează-ți informațiile personale și setările de securitate ale contului."
      eyebrow="Cont"
      heroClassName={heroClassName}
      heroEyebrowClassName="text-white/72"
      heroTitleClassName="text-white font-bold"
      heroDescriptionClassName="text-white/84"
    >
      <div className="w-full space-y-6">
        {notice ? (
          <Alert className="rounded-3xl border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <AlertTitle>Succes</AlertTitle>
            <AlertDescription className="text-emerald-800">{notice}</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive" className="rounded-3xl border-rose-200 bg-white/90 px-5 py-4">
            <AlertTitle>Eroare</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[minmax(260px,280px)_minmax(0,1fr)] lg:items-stretch">
          <ProfileSidebar initials={initials} displayName={displayName} roleLabel={roleLabel} email={user?.mail || "-"} faculty={user?.facultate} profileLogo={profileLogo} />

          <div className="space-y-6">
            <PersonalInfoCard profileForm={profileForm} profileErrors={profileErrors} updateProfileMutationPending={updateProfileMutation.isPending} clearProfileError={clearProfileError} />
            <SecurityCard emailForm={emailForm} emailErrors={emailErrors} emailError={emailError} emailChanged={emailChanged} updateEmailMutationPending={updateEmailMutation.isPending} clearEmailError={clearEmailError} passwordResetNotice={passwordResetNotice} passwordResetError={passwordResetError} sendingPasswordReset={sendingPasswordReset} handlePasswordReset={handlePasswordReset} />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
