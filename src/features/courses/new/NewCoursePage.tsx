import { useForm } from "@tanstack/react-form"
import { useMutation } from "@tanstack/react-query"
import { useState } from "react"
import { AlertCircle, BookPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import AppShell from "@/app/layout/AppShell"
import { useAuth } from "@/auth/useAuth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProfessorCourse, getCourseErrorMessage, getCourseFieldErrors } from "@/features/courses/api/courses"
import { newCourseSchema } from "@/features/courses/course.schemas"

import type { AppAxiosError, FieldErrors } from "@/types/api"

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export default function NewCoursePage() {
  const navigate = useNavigate()
  const { refreshAuth } = useAuth()
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState("")

  const createCourseMutation = useMutation({
    mutationFn: createProfessorCourse,
    onSuccess: (createdCourse) => {
      navigate(createdCourse?.id ? `/courses/${createdCourse.id}` : "/courses")
    },
    onError: async (error: unknown) => {
      const typedError = error as AppAxiosError

      if (typedError.response?.status === 401) {
        await refreshAuth()
      }

      setFieldErrors(getCourseFieldErrors(error))
      setSubmitError(getCourseErrorMessage(error, "Nu am putut salva cursul."))
    },
  })

  const form = useForm({
    defaultValues: {
      denumire: "",
      descriere: "",
      dataInceput: getTodayInputValue(),
    },
    validators: {
      onChange: newCourseSchema,
    },
    onSubmit: async ({ value }) => {
      setFieldErrors({})
      setSubmitError("")
      await createCourseMutation.mutateAsync(value)
    },
  })

  return (
    <AppShell
      title="Curs nou"
      description="Creează un curs nou și completează informațiile principale pentru început."
      eyebrow="Profesor"
    >
      <Card className="mx-auto max-w-3xl rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
        <CardHeader className="items-center px-6 pt-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#f5eee5] text-[#4A5681]">
            <BookPlus className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl text-slate-900">Adaugă un curs nou</CardTitle>
          <CardDescription className="max-w-xl text-base leading-7">
            Completează denumirea, descrierea și data de început pentru curs.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault()
              void form.handleSubmit()
            }}
          >
            {submitError ? (
              <Alert variant="destructive" className="rounded-3xl border-rose-200 bg-white/90 px-5 py-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Nu am putut salva cursul</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2.5">
              <Label htmlFor="course-name" className="text-[0.8rem] font-semibold tracking-[0.16em] text-slate-600">
                DENUMIRE CURS *
              </Label>
              <form.Field name="denumire">
                {(field) => (
                  <>
                    <Input
                      id="course-name"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value)
                        setFieldErrors((current) => ({ ...current, denumire: "" }))
                        setSubmitError("")
                      }}
                      placeholder="Ex: Programare Web"
                      className="h-13 rounded-2xl border-[#e4d8cd] bg-[#f7efe6] px-4 text-base shadow-none placeholder:text-slate-400 focus-visible:border-[#24385b] focus-visible:ring-[#24385b]/10"
                    />
                    {field.state.meta.errors[0] ? <p className="text-sm text-rose-600">{String(field.state.meta.errors[0])}</p> : null}
                    {fieldErrors.denumire ? <p className="text-sm text-rose-600">{fieldErrors.denumire}</p> : null}
                  </>
                )}
              </form.Field>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="course-start-date" className="text-[0.8rem] font-semibold tracking-[0.16em] text-slate-600">
                DATA ÎNCEPUT *
              </Label>
              <form.Field name="dataInceput">
                {(field) => (
                  <>
                    <Input
                      id="course-start-date"
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value)
                        setFieldErrors((current) => ({ ...current, dataInceput: "" }))
                        setSubmitError("")
                      }}
                      className="h-13 rounded-2xl border-[#e4d8cd] bg-[#f7efe6] px-4 text-base shadow-none focus-visible:border-[#24385b] focus-visible:ring-[#24385b]/10"
                    />
                    {field.state.meta.errors[0] ? <p className="text-sm text-rose-600">{String(field.state.meta.errors[0])}</p> : null}
                    {fieldErrors.dataInceput ? <p className="text-sm text-rose-600">{fieldErrors.dataInceput}</p> : null}
                  </>
                )}
              </form.Field>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="course-description" className="text-[0.8rem] font-semibold tracking-[0.16em] text-slate-600">
                DESCRIERE
              </Label>
              <form.Field name="descriere">
                {(field) => (
                  <>
                    <textarea
                      id="course-description"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        field.handleChange(event.target.value)
                        setFieldErrors((current) => ({ ...current, descriere: "" }))
                        setSubmitError("")
                      }}
                      placeholder="Descriere scurtă a cursului"
                      className="min-h-32 w-full rounded-2xl border border-[#e4d8cd] bg-[#f7efe6] px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#24385b] focus:ring-2 focus:ring-[#24385b]/10"
                    />
                    {fieldErrors.descriere ? <p className="text-sm text-rose-600">{fieldErrors.descriere}</p> : null}
                  </>
                )}
              </form.Field>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={createCourseMutation.isPending} className="rounded-2xl bg-[#4A5681] px-5 text-white hover:bg-[#3f4a72]">
                {createCourseMutation.isPending ? "Se salvează..." : "Salvează cursul"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AppShell>
  )
}
