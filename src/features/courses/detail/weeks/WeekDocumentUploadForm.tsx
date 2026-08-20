import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { AlertCircle, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { weekDocumentUploadSchema } from "@/features/courses/course.schemas"

import type { WeekDocumentForm, WeekRecord } from "../course-detail.types"
import type { CourseTheme } from "@/types/theme"

interface WeekDocumentUploadFormProps {
  week: WeekRecord
  error: string
  activeAction: string
  theme: CourseTheme
  fileInputRef: ((el: HTMLInputElement | null) => void) | React.RefObject<HTMLInputElement | null>
  onUpload: (week: WeekRecord, values: WeekDocumentForm) => Promise<boolean>
}

export default function WeekDocumentUploadForm({
  week,
  error,
  activeAction,
  theme,
  fileInputRef,
  onUpload,
}: WeekDocumentUploadFormProps) {
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const form = useForm({
    defaultValues: {
      titlu: "",
      file: null as File | null,
    },
    validators: {
      onChange: weekDocumentUploadSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const uploaded = await onUpload(week, { titlu: value.titlu, file: value.file })
      if (uploaded) {
        setSubmitAttempted(false)
        formApi.reset()
      }
    },
  })

  const isUploadFormIncomplete = !form.state.values.titlu.trim() || !form.state.values.file
  const showIncompleteFormError = submitAttempted && isUploadFormIncomplete

  return (
    <form
      className="space-y-4 rounded-3xl border border-[#e4d8cd] bg-[#fbf6f0] p-4"
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitAttempted(true)
        if (isUploadFormIncomplete) {
          return
        }
        void form.handleSubmit()
      }}
    >
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Document nou</p>
        <p className="mt-1 text-sm text-slate-500">Încarcă materiale pentru această săptămână.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-start">
        <div className="space-y-2">
          <Label htmlFor={`upload-title-${week.id}`} className="text-xs font-semibold tracking-[0.16em] text-slate-600">TITLU DOCUMENT</Label>
          <form.Field name="titlu">
            {(field) => (
              <>
                <Input
                  id={`upload-title-${week.id}`}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  className="h-14 rounded-2xl border-[#e4d8cd] bg-white px-4 shadow-none focus-visible:border-[#24385b] focus-visible:ring-[#24385b]/10"
                />
              </>
            )}
          </form.Field>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`upload-file-${week.id}`} className="text-xs font-semibold tracking-[0.16em] text-slate-600">FIȘIER</Label>
          <form.Field name="file">
            {(field) => (
              <>
                <Label
                  htmlFor={`upload-file-${week.id}`}
                  title={field.state.value?.name || undefined}
                  className={cn(
                    "flex h-14 min-w-0 cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-dashed bg-white px-4 text-sm shadow-none transition hover:border-[#24385b] hover:bg-[#fffaf4] focus-within:border-[#24385b] focus-within:ring-2 focus-within:ring-[#24385b]/10",
                    field.state.value ? "border-emerald-300 text-emerald-800" : "border-[#d9ccbe] text-slate-600"
                  )}
                >
                  <Upload className={cn("h-4 w-4 shrink-0", field.state.value ? "text-emerald-700" : theme.fileIconText)} />
                  <span className="min-w-0 flex-1 overflow-hidden">
                    <span className="block truncate font-semibold whitespace-nowrap">
                      {field.state.value?.name ?? "Apasă aici pentru a selecta documentul"}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-[#24385b]/10 px-4 py-2 text-sm font-bold text-[#24385b]">Alege fișier</span>
                  <Input
                    id={`upload-file-${week.id}`}
                    type="file"
                    ref={fileInputRef}
                    onChange={(event) => field.handleChange(event.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                </Label>
              </>
            )}
          </form.Field>
        </div>
        <Button type="submit" disabled={Boolean(activeAction)} className={cn("h-14 rounded-2xl px-5 text-white lg:mt-5", theme.btnPrimaryBg, theme.btnPrimaryHover)}>
          <Upload className="h-4 w-4" />
          {activeAction === `upload-document-${week.id}` ? "Se încarcă..." : "Încarcă documentul"}
        </Button>
      </div>
      {showIncompleteFormError ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-white/80 px-4 py-3 text-amber-900 shadow-[0_12px_30px_rgba(148,101,42,0.08)]">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <p className="text-sm font-semibold leading-6 text-amber-800">Completați toate câmpurile obligatorii.</p>
        </div>
      ) : null}
      {!showIncompleteFormError && error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-rose-700 shadow-[0_12px_30px_rgba(225,29,72,0.08)]">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <p className="text-sm font-bold text-rose-700">Nu putem încărca documentul încă</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-rose-600">{error}</p>
          </div>
        </div>
      ) : null}
    </form>
  )
}
