import { useForm } from "@tanstack/react-form"
import { ChevronDown, FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { cn, formatWeeks } from "@/lib/utils"
import { weekDescriptionSchema } from "@/features/courses/course.schemas"

import WeekCard from "./WeekCard"
import type {
  DocumentsByWeekMap,
  DocumentRecord,
  EditingDocumentMap,
  EntityId,
  ExpandedStateMap,
  UploadErrorsMap,
  WeekDocumentForm,
  WeekFeedbackMap,
  WeekRecord,
} from "../course-detail.types"
import type { CourseTheme } from "@/types/theme"

interface CourseWeeksTabProps {
  weeks: WeekRecord[]
  documentsByWeek: DocumentsByWeekMap
  expandedWeekIds: ExpandedStateMap
  canEdit: boolean
  isStudent: boolean
  isProfessor: boolean
  courseInscris: boolean
  activeAction: string
  theme: CourseTheme
  lastWeekNumber: number
  newWeekOpen: boolean
  setNewWeekOpen: React.Dispatch<React.SetStateAction<boolean>>
  onCreateWeek: (descriere: string) => Promise<boolean>
  onToggleExpand: (weekId: EntityId) => void
  onToggleCompletion: (week: WeekRecord) => void
  onDeleteWeek: (week: WeekRecord) => void
  onUpdateWeek: (week: WeekRecord, descriere: string) => Promise<void>
  onUploadDocument: (week: WeekRecord, values: WeekDocumentForm) => Promise<boolean>
  onUpdateDocument: (document: DocumentRecord, week: WeekRecord, values: WeekDocumentForm) => Promise<void>
  onDeleteDocument: (document: DocumentRecord, week: WeekRecord) => Promise<void>
  onRetryDocument: (document: DocumentRecord, week: WeekRecord) => Promise<void>
  weekUpdateFeedback: WeekFeedbackMap
  setWeekUpdateFeedback: React.Dispatch<React.SetStateAction<WeekFeedbackMap>>
  uploadErrors: UploadErrorsMap
  editingDocumentIds: EditingDocumentMap
  setEditingDocumentIds: React.Dispatch<React.SetStateAction<EditingDocumentMap>>
  uploadFileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
  documentFileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
}

export default function CourseWeeksTab({
  weeks,
  documentsByWeek,
  expandedWeekIds,
  canEdit,
  isStudent,
  isProfessor,
  courseInscris,
  activeAction,
  theme,
  lastWeekNumber,
  newWeekOpen,
  setNewWeekOpen,
  onCreateWeek,
  onToggleExpand,
  onToggleCompletion,
  onDeleteWeek,
  onUpdateWeek,
  onUploadDocument,
  onUpdateDocument,
  onDeleteDocument,
  onRetryDocument,
  weekUpdateFeedback,
  setWeekUpdateFeedback,
  uploadErrors,
  editingDocumentIds,
  setEditingDocumentIds,
  uploadFileInputRefs,
  documentFileInputRefs,
}: CourseWeeksTabProps) {
  const newWeekForm = useForm({
    defaultValues: {
      descriere: "",
    },
    validators: {
      onChange: weekDescriptionSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const created = await onCreateWeek(value.descriere)
      if (created) {
        formApi.reset()
      }
    },
  })

  return (
    <div className="space-y-6">
      {canEdit ? (
        <Card className="gap-0 overflow-hidden rounded-[1.75rem] border-[#e4d8cd] bg-white/92 py-0 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
          <button
            type="button"
            onClick={() => setNewWeekOpen((currentValue) => !currentValue)}
            className="flex w-full flex-col gap-3 px-5 py-4 text-left transition hover:bg-[#fbf6f0] sm:flex-row sm:items-center sm:justify-between sm:px-6"
            aria-expanded={newWeekOpen}
          >
            <div className="min-w-0">
              <CardTitle className="text-lg text-slate-900">Săptămână nouă</CardTitle>
              <CardDescription className="mt-1">Adaugă conținutul pentru următoarea săptămână a cursului.</CardDescription>
            </div>
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border", theme.btnIconBg, theme.btnIconBorder, theme.btnIconText)}>
              <ChevronDown className={`h-5 w-5 transition-transform ${newWeekOpen ? "rotate-180" : ""}`} />
            </span>
          </button>
          {newWeekOpen ? (
            <CardContent className="border-t border-[#eadfd4] px-5 py-5 sm:px-6 sm:py-6">
              <form
                className="space-y-4"
                onSubmit={(event) => {
                  event.preventDefault()
                  void newWeekForm.handleSubmit()
                }}
              >
                <newWeekForm.Field name="descriere">
                  {(field) => (
                    <>
                      <textarea
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.value)}
                        placeholder="Descrierea săptămânii"
                        className="min-h-24 w-full rounded-2xl border border-[#e4d8cd] bg-[#f7efe6] px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#24385b] focus:ring-2 focus:ring-[#24385b]/10"
                      />
                      {field.state.meta.errors[0] ? <p className="text-sm text-rose-600">{String(field.state.meta.errors[0])}</p> : null}
                    </>
                  )}
                </newWeekForm.Field>
                <Button type="submit" disabled={Boolean(activeAction)} className={cn("rounded-2xl text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}>
                  <Plus className="h-4 w-4" />
                  {activeAction === "create-week" ? "Se adaugă..." : "Adaugă săptămâna"}
                </Button>
              </form>
            </CardContent>
          ) : null}
        </Card>
      ) : null}

      <div className={cn("rounded-[1.75rem] border px-5 py-5 shadow-[0_14px_34px_rgba(32,46,84,0.04)] sm:px-6", theme.heroBg, theme.heroBorder)}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={cn("text-xs font-semibold tracking-[0.18em] uppercase", theme.sectionLabel)}>Conținut curs</p>
            <h2 className={cn("mt-1 text-2xl font-semibold tracking-tight", theme.sectionTitle)}>Săptămâni și documente</h2>
          </div>
          <p className="text-sm font-medium text-slate-500">Total: {formatWeeks(weeks.length)}</p>
        </div>
      </div>

      {weeks.length === 0 ? (
        <Card className="rounded-[1.75rem] border-dashed border-[#d8ccbf] bg-[#fbf6f0]">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center text-slate-500">
            <FileText className={cn("h-8 w-8", theme.iconText)} />
            <div>
              <p className="font-semibold text-slate-800">Nu există săptămâni pentru acest curs.</p>
              <p className="mt-1 text-sm">Conținutul va apărea aici după ce este adăugat.</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-5">
        {weeks.map((week) => {
          const documents = documentsByWeek[week.id] ?? []
          const isExpanded = isStudent ? true : (expandedWeekIds[week.id] ?? false)

          return (
            <WeekCard
              key={week.id}
              week={week}
              documents={documents}
              isExpanded={isExpanded}
              canEdit={canEdit}
              isStudent={isStudent}
              isProfessor={isProfessor}
              courseInscris={courseInscris}
              isLastWeek={week.nrSaptamana === lastWeekNumber}
              activeAction={activeAction}
              theme={theme}
              weekUpdateFeedback={weekUpdateFeedback}
              setWeekUpdateFeedback={setWeekUpdateFeedback}
              uploadErrors={uploadErrors}
              editingDocumentIds={editingDocumentIds}
              setEditingDocumentIds={setEditingDocumentIds}
              uploadFileInputRefs={uploadFileInputRefs}
              documentFileInputRefs={documentFileInputRefs}
              onToggleExpand={onToggleExpand}
              onToggleCompletion={onToggleCompletion}
              onDeleteWeek={onDeleteWeek}
              onUpdateWeek={onUpdateWeek}
              onUploadDocument={onUploadDocument}
              onUpdateDocument={onUpdateDocument}
              onDeleteDocument={onDeleteDocument}
              onRetryDocument={onRetryDocument}
            />
          )
        })}
      </div>
    </div>
  )
}
