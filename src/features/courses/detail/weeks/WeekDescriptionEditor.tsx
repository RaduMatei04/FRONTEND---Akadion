import { useForm } from "@tanstack/react-form"
import { AlertCircle, CheckCircle2, Save } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { weekDescriptionSchema } from "@/features/courses/course.schemas"

import type { WeekFeedback, WeekRecord } from "../course-detail.types"

interface WeekDescriptionEditorProps {
  week: WeekRecord
  initialDescription: string
  feedback: WeekFeedback
  activeAction: string
  onEdit: () => void
  onSave: (week: WeekRecord, descriere: string) => Promise<void>
}

export default function WeekDescriptionEditor({
  week,
  initialDescription,
  feedback,
  activeAction,
  onEdit,
  onSave,
}: WeekDescriptionEditorProps) {
  const form = useForm({
    defaultValues: {
      descriere: initialDescription,
    },
    validators: {
      onChange: weekDescriptionSchema,
    },
    onSubmit: async ({ value }) => {
      await onSave(week, value.descriere)
    },
  })

  return (
    <div className="space-y-3 rounded-3xl border border-[#e4d8cd] bg-[#fbf6f0] p-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Descriere săptămână</p>
        <p className="mt-1 text-sm text-slate-500">Actualizează pe scurt ce acoperă această etapă.</p>
      </div>
      <form.Field name="descriere">
        {(field) => (
          <>
            <textarea
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => {
                field.handleChange(event.target.value)
                onEdit()
              }}
              className="min-h-24 w-full rounded-2xl border border-[#e4d8cd] bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-[#24385b] focus:ring-2 focus:ring-[#24385b]/10"
            />
            {field.state.meta.errors[0] ? <p className="text-sm text-rose-600">{String(field.state.meta.errors[0])}</p> : null}
          </>
        )}
      </form.Field>
      <Button type="button" variant="outline" onClick={() => void form.handleSubmit()} disabled={Boolean(activeAction)} className="rounded-2xl border-[#d9ccbe] bg-white">
        <Save className="h-4 w-4" />
        {activeAction === `update-week-${week.id}` ? "Se salvează..." : "Salvează săptămâna"}
      </Button>
      {feedback?.type === "success" ? (
        <Alert className="rounded-2xl border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
          <AlertTitle>Actualizare reușită</AlertTitle>
          <AlertDescription className="text-emerald-800">{feedback.message}</AlertDescription>
        </Alert>
      ) : null}
      {feedback?.type === "error" ? (
        <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50/90">
          <AlertCircle className="h-4 w-4 text-rose-600" />
          <AlertTitle>Nu am putut actualiza săptămâna</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
