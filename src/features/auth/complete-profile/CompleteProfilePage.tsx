import { Fragment, useEffect, useState } from "react"
import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { z } from "zod"
import { AlertCircle, Check } from "lucide-react"
import { useNavigate } from "react-router-dom"
import apiClient from "@/api/client"
import { getApiErrorMessage, getApiFieldErrors } from "@/api/error-helpers"
import { useAuth } from "@/auth/useAuth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import type { FieldErrors } from "@/types/api"
import type { CompleteProfileForm } from "@/types/app"

const completeProfileLogo = "/assets/logo_bufnita.png"
const akyRagLogo = "/assets/logo_RAG-removebg-preview.png"

const completeProfileSchema = z.object({
  nume: z.string().trim().min(1, "Numele este obligatoriu."),
  prenume: z.string().trim().min(1, "Prenumele este obligatoriu."),
  facultate: z.string(),
  rolDorit: z.enum(["STUDENT", "PROFESOR"], { error: "Alege rolul dorit." }),
})

async function submitCompleteProfile(payload: CompleteProfileForm) {
  await apiClient.post("/api/auth/complete-profile", {
    nume: payload.nume.trim(),
    prenume: payload.prenume.trim(),
    facultate: payload.facultate.trim(),
    rolDorit: payload.rolDorit,
  })
}

export default function CompleteProfilePage() {
  const navigate = useNavigate()
  const { user, refreshAuth } = useAuth()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState("")

  const completeProfileMutation = useMutation({
    mutationFn: submitCompleteProfile,
    onSuccess: async () => {
      await refreshAuth()
      navigate("/asteptare-aprobare", { replace: true })
    },
    onError: (error: unknown) => {
      setFieldErrors(getApiFieldErrors(error))
      setSubmitError(getApiErrorMessage(error, "Nu am putut salva profilul."))
    },
  })

  const form = useForm({
    defaultValues: {
      nume: user?.nume ?? "",
      prenume: user?.prenume ?? "",
      facultate: user?.facultate ?? "",
      rolDorit: "",
    },
    validators: {
      onChange: completeProfileSchema,
    },
    onSubmit: async ({ value }) => {
      setFieldErrors({})
      setSubmitError("")
      await completeProfileMutation.mutateAsync(value)
    },
  })

  const profileSteps = [
    { id: 1, label: "Cont", stateText: "Pasul 1 finalizat", state: "completed" },
    { id: 2, label: "Profil", stateText: "Pasul 2 curent", state: "current" },
  ]

  useEffect(() => {
    if (user) {
      if (!form.state.values.nume && user.nume) {
        form.setFieldValue("nume", user.nume)
      }

      if (!form.state.values.prenume && user.prenume) {
        form.setFieldValue("prenume", user.prenume)
      }

      if (!form.state.values.facultate && user.facultate) {
        form.setFieldValue("facultate", user.facultate)
      }
    }
  }, [form, user])

  return (
    <main className="complete-profile-page min-h-screen text-slate-900">
      <div className="complete-profile-layout">
        <section className="complete-profile-brand-panel">
          <div className="complete-profile-brand-content">
            <div className="brand-header">
              <div className="brand-header__left">
                <img src={completeProfileLogo} alt="Akadion" className="brand-logo" />
                <div className="brand-header__copy">
                  <span className="brand-caption">Curiozitate fără limite</span>
                </div>
              </div>
            </div>

            <div className="brand-copy brand-copy--single">
              <h1 className="brand-title">Înveți ce iubești, în ritmul tău.</h1>
              <p className="brand-description">
                Aici nu ești legat de programa fixă a specializării tale — alegi
                cursurile care te interesează, fie din domeniul tău, fie din altele.
                Urmărești materialele, îți vezi progresul săptămânal și înveți din
                curiozitate și dorința de a descoperi lucruri noi.
              </p>

              <div className="brand-benefits">
                <div className="brand-benefit-card">
                  <span className="brand-benefit-card__icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                  </span>
                  <span className="brand-benefit-card__copy"><span>Cursuri alese de tine</span></span>
                </div>
                <div className="brand-benefit-card">
                  <span className="brand-benefit-card__icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                      <polyline points="16 7 22 7 22 13"/>
                    </svg>
                  </span>
                  <span className="brand-benefit-card__copy"><span>Progres urmărit săptămânal</span></span>
                </div>
                <div className="brand-benefit-card">
                  <span className="brand-benefit-card__icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </span>
                  <span className="brand-benefit-card__copy"><span>Acces pentru studenți și profesori</span></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="complete-profile-form-panel">
          <div className="mx-auto w-full max-w-xl">
            <div className="flex w-full justify-end">
              <div className="auth-aky-badge" aria-label="Aky AI Assistant">
                <div className="auth-aky-badge__logo-shell">
                  <img src={akyRagLogo} alt="Aky AI" className="auth-aky-badge__logo" />
                </div>
                <div className="auth-aky-badge__copy">
                  <span className="auth-aky-badge__eyebrow">Powered by</span>
                  <span className="auth-aky-badge__title">Aky RAG</span>
                  <span className="auth-aky-badge__subtitle">Asistent pentru materiale academice</span>
                </div>
              </div>
            </div>

            <div className="complete-profile-stepper">
              {profileSteps.map(({ id, label, stateText, state }, index) => {
                const isCurrent = state === "current"
                const isCompleted = state === "completed"

                return (
                  <Fragment key={id}>
                    <div className={`complete-profile-stepper-item ${isCurrent ? "is-current" : "is-completed"}`}>
                      <div className="complete-profile-stepper-badge">
                        {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : id}
                      </div>
                      <div className="flex flex-col">
                        <span className="block">{label}</span>
                        <span className="complete-profile-stepper-state">{stateText}</span>
                      </div>
                    </div>
                    {index < profileSteps.length - 1 ? <div className="complete-profile-stepper-connector" /> : null}
                  </Fragment>
                )
              })}
            </div>

            <div className="complete-profile-card">
              <div className="space-y-2 pb-5">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Completează profilul</h1>
                <p className="text-sm text-slate-500">Pasul final. Introdu datele necesare pentru continuare.</p>
              </div>

              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  void form.handleSubmit()
                }}
              >
                {submitError ? (
                  <Alert variant="destructive" className="rounded-2xl">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Nu am putut salva profilul</AlertTitle>
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-sm font-medium text-slate-700">Nume <span className="text-rose-500">*</span></Label>
                    <form.Field name="nume">
                      {(field) => (
                        <>
                          <Input id="last-name" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => { field.handleChange(event.target.value); setFieldErrors((current) => ({ ...current, nume: "" })); setSubmitError("") }} placeholder="Ex: Popescu" className="h-12 rounded-xl border-[#d8dcef] bg-[#fef9f3] px-4 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#595f8f] focus-visible:ring-[#595f8f]/10" />
                          {field.state.meta.errors[0] ? <p className="text-sm text-rose-600">{String(field.state.meta.errors[0])}</p> : null}
                          {fieldErrors.nume ? <p className="text-sm text-rose-600">{fieldErrors.nume}</p> : null}
                        </>
                      )}
                    </form.Field>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-sm font-medium text-slate-700">Prenume <span className="text-rose-500">*</span></Label>
                    <form.Field name="prenume">
                      {(field) => (
                        <>
                          <Input id="first-name" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => { field.handleChange(event.target.value); setFieldErrors((current) => ({ ...current, prenume: "" })); setSubmitError("") }} placeholder="Ex: Andrei" className="h-12 rounded-xl border-[#d8dcef] bg-[#fef9f3] px-4 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#595f8f] focus-visible:ring-[#595f8f]/10" />
                          {field.state.meta.errors[0] ? <p className="text-sm text-rose-600">{String(field.state.meta.errors[0])}</p> : null}
                          {fieldErrors.prenume ? <p className="text-sm text-rose-600">{fieldErrors.prenume}</p> : null}
                        </>
                      )}
                    </form.Field>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faculty" className="text-sm font-medium text-slate-700">Facultatea</Label>
                  <form.Field name="facultate">
                    {(field) => (
                      <>
                        <Input id="faculty" value={field.state.value} onBlur={field.handleBlur} onChange={(event) => { field.handleChange(event.target.value); setFieldErrors((current) => ({ ...current, facultate: "" })); setSubmitError("") }} placeholder="Ex: Facultatea de Informatică" className="h-12 rounded-xl border-[#d8dcef] bg-[#fef9f3] px-4 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#595f8f] focus-visible:ring-[#595f8f]/10" />
                        {fieldErrors.facultate ? <p className="text-sm text-rose-600">{fieldErrors.facultate}</p> : null}
                      </>
                    )}
                  </form.Field>
                </div>

                <fieldset className="space-y-2">
                  <legend className="text-sm font-medium text-slate-700">Rol <span className="text-rose-500">*</span></legend>
                  <div className="grid grid-cols-2 gap-3">
                    <form.Field name="rolDorit">
                      {(field) => (
                        <>
                          {[
                            { value: "STUDENT", label: "Student" },
                            { value: "PROFESOR", label: "Profesor" },
                          ].map(({ value, label }) => {
                            const isSelected = field.state.value === value

                            return (
                              <label key={value} className={`flex h-12 cursor-pointer items-center justify-center rounded-xl border px-4 text-sm font-semibold transition focus-within:border-[#24385b] focus-within:ring-2 focus-within:ring-[#24385b]/15 ${isSelected ? "border-[#24385b] bg-[#24385b] text-white shadow-[0_8px_20px_rgba(36,56,91,0.18)]" : "border-[#d8dcef] bg-[#fef9f3] text-slate-600 hover:border-[#24385b]/45"}`}>
                                <input type="radio" name="role" value={value} checked={isSelected} onChange={() => { field.handleChange(value as CompleteProfileForm["rolDorit"]); setFieldErrors((current) => ({ ...current, rolDorit: "" })); setSubmitError("") }} className="sr-only" />
                                {label}
                              </label>
                            )
                          })}
                          {field.state.meta.errors[0] ? <p className="text-sm text-rose-600">{String(field.state.meta.errors[0])}</p> : null}
                          {fieldErrors.rolDorit ? <p className="text-sm text-rose-600">{fieldErrors.rolDorit}</p> : null}
                        </>
                      )}
                    </form.Field>
                  </div>
                </fieldset>

                <Alert className="rounded-2xl border-[#d8dcef] bg-[#fbf6f0] px-4 py-3 text-slate-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-[#24385b]" />
                  <AlertTitle className="mb-0.5 text-sm font-semibold text-slate-900">Aprobare manuală</AlertTitle>
                  <AlertDescription className="text-xs leading-5 text-slate-600">Contul necesită aprobare din partea echipei Akadion.</AlertDescription>
                </Alert>

                <div className="pt-1">
                  <Button type="submit" disabled={completeProfileMutation.isPending} className="btn btn-primary btn-block btn-lg text-sm font-semibold">
                    {completeProfileMutation.isPending ? "Se trimite..." : "Trimite cererea"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
