import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import WeekDescriptionEditor from "./WeekDescriptionEditor"
import WeekDocumentList from "./WeekDocumentList"
import WeekDocumentUploadForm from "./WeekDocumentUploadForm"
import { StatusBadge } from "../components/CourseDetailTabs"
import { formatDocumentsCount } from "../course-detail.utils"
import type {
  DocumentRecord,
  EditingDocumentMap,
  EntityId,
  UploadErrorsMap,
  WeekFeedbackMap,
  WeekRecord,
} from "../course-detail.types"
import type { CourseTheme } from "@/types/theme"

interface WeekCardProps {
  week: WeekRecord
  documents: DocumentRecord[]
  isExpanded: boolean
  canEdit: boolean
  isStudent: boolean
  isProfessor: boolean
  courseInscris: boolean
  isLastWeek: boolean
  activeAction: string
  theme: CourseTheme
  weekUpdateFeedback: WeekFeedbackMap
  setWeekUpdateFeedback: React.Dispatch<React.SetStateAction<WeekFeedbackMap>>
  uploadErrors: UploadErrorsMap
  editingDocumentIds: EditingDocumentMap
  setEditingDocumentIds: React.Dispatch<React.SetStateAction<EditingDocumentMap>>
  uploadFileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
  documentFileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
  onToggleExpand: (weekId: EntityId) => void
  onToggleCompletion: (week: WeekRecord) => void
  onDeleteWeek: (week: WeekRecord) => void
  onUpdateWeek: (week: WeekRecord, descriere: string) => Promise<void>
  onUploadDocument: (week: WeekRecord, values: { titlu: string; file: File | null }) => Promise<boolean>
  onUpdateDocument: (document: DocumentRecord, week: WeekRecord, values: { titlu: string; file: File | null }) => Promise<void>
  onDeleteDocument: (document: DocumentRecord, week: WeekRecord) => Promise<void>
  onRetryDocument: (document: DocumentRecord, week: WeekRecord) => Promise<void>
}

export default function WeekCard({
  week,
  documents,
  isExpanded,
  canEdit,
  isStudent,
  isProfessor,
  courseInscris,
  isLastWeek,
  activeAction,
  theme,
  weekUpdateFeedback,
  setWeekUpdateFeedback,
  uploadErrors,
  editingDocumentIds,
  setEditingDocumentIds,
  uploadFileInputRefs,
  documentFileInputRefs,
  onToggleExpand,
  onToggleCompletion,
  onDeleteWeek,
  onUpdateWeek,
  onUploadDocument,
  onUpdateDocument,
  onDeleteDocument,
  onRetryDocument,
}: WeekCardProps) {
  const showStudentExpandedContent = isStudent

  return (
    <Card id={`course-week-${week.id}`} className={`scroll-mt-28 overflow-hidden rounded-[1.75rem] bg-white/94 shadow-[0_18px_48px_rgba(32,46,84,0.08)] ${isStudent && week.finalizata ? "border-[#9fd0d8]" : "border-[#e4d8cd]"}`}>
      <div className="flex flex-col gap-4 border-b border-[#eadfd4] bg-[#fffdfa] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-4 text-left">
              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold", theme.weekNumBg, theme.weekNumText)}>
                S{week.nrSaptamana}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold text-slate-900">Săptămâna {week.nrSaptamana}</h3>
                  {canEdit && isLastWeek ? (
                    <Button type="button" variant="outline" onClick={() => onDeleteWeek(week)} disabled={Boolean(activeAction)} className="h-9 rounded-2xl border-rose-200 bg-rose-50 px-3 text-rose-700 hover:bg-rose-100">
                      <Trash2 className="h-4 w-4" />
                      Șterge
                    </Button>
                  ) : null}
                  {isStudent && week.finalizata ? (
                    <StatusBadge className="border-[#2F9E7A] bg-[#DDF5EC] text-[#2F9E7A]">FINALIZATĂ</StatusBadge>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                  {week.descriere || "Fără descriere pentru această săptămână."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:pl-4">
            <div className="text-right text-sm text-slate-500">
              <p>{formatDocumentsCount(documents.length)}{isStudent ? ` • ${week.finalizata ? "Finalizată" : "În progres"}` : ""}</p>
            </div>
            {isStudent ? (
              <Button type="button" variant="outline" onClick={() => onToggleCompletion(week)} disabled={Boolean(activeAction) || !courseInscris} className={cn("rounded-2xl border bg-white", theme.btnIconBorder, theme.sectionTitle)}>
                {activeAction === `toggle-week-${week.id}` ? "Se actualizează..." : week.finalizata ? "Marchează neparcursă" : "Marchează finalizată"}
              </Button>
            ) : null}
            {!showStudentExpandedContent ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onToggleExpand(week.id)}
                className={cn("h-11 w-11 rounded-2xl border p-0", theme.btnIconBg, theme.btnIconBorder, theme.btnIconText)}
              >
                <svg className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {isExpanded ? (
        <CardContent className="space-y-6 px-5 py-5 sm:px-6 sm:py-6">
          {canEdit ? (
            <WeekDescriptionEditor
              week={week}
              initialDescription={week.descriere ?? ""}
              feedback={weekUpdateFeedback[week.id]}
              activeAction={activeAction}
              onEdit={() => setWeekUpdateFeedback((current) => ({ ...current, [week.id]: null }))}
              onSave={onUpdateWeek}
            />
          ) : null}

          {canEdit ? (
            <WeekDocumentUploadForm
              week={week}
              error={uploadErrors[week.id] ?? ""}
              activeAction={activeAction}
              theme={theme}
              fileInputRef={(element) => {
                uploadFileInputRefs.current[week.id] = element
              }}
              onUpload={onUploadDocument}
            />
          ) : null}

            <WeekDocumentList
              week={week}
              documents={documents}
              canEdit={canEdit}
              isProfessor={isProfessor}
              activeAction={activeAction}
              theme={theme}
            editingDocumentIds={editingDocumentIds}
            setEditingDocumentIds={setEditingDocumentIds}
            documentFileInputRefs={documentFileInputRefs}
            onUpdateDocument={onUpdateDocument}
            onDeleteDocument={onDeleteDocument}
            onRetryDocument={onRetryDocument}
          />
        </CardContent>
      ) : null}
    </Card>
  )
}
