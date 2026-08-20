import { useForm } from "@tanstack/react-form"
import { FileText, Pencil, RefreshCcw, Save, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { weekDocumentSchema } from "@/features/courses/course.schemas"

import { StatusBadge } from "../components/CourseDetailTabs"
import {
  canRetryDocumentIngest,
  extractFilename,
  formatDocumentsCount,
  getDocumentHref,
  getDocumentStatusClasses,
  getDocumentStatusLabel,
} from "../course-detail.utils"
import type { DocumentRecord, EditingDocumentMap, WeekDocumentForm, WeekRecord } from "../course-detail.types"
import type { CourseTheme } from "@/types/theme"

interface WeekDocumentListProps {
  week: WeekRecord
  documents: DocumentRecord[]
  canEdit: boolean
  isProfessor: boolean
  activeAction: string
  theme: CourseTheme
  editingDocumentIds: EditingDocumentMap
  setEditingDocumentIds: React.Dispatch<React.SetStateAction<EditingDocumentMap>>
  documentFileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
  onUpdateDocument: (document: DocumentRecord, week: WeekRecord, values: WeekDocumentForm) => Promise<void>
  onDeleteDocument: (document: DocumentRecord, week: WeekRecord) => Promise<void>
  onRetryDocument: (document: DocumentRecord, week: WeekRecord) => Promise<void>
}

interface DocumentEditFormProps {
  document: DocumentRecord
  week: WeekRecord
  activeAction: string
  theme: CourseTheme
  documentFileInputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>
  onSave: (document: DocumentRecord, week: WeekRecord, values: WeekDocumentForm) => Promise<void>
  onCancelEdit: () => void
}

function DocumentEditForm({
  document,
  week,
  activeAction,
  theme,
  documentFileInputRefs,
  onSave,
  onCancelEdit,
}: DocumentEditFormProps) {
  const form = useForm({
    defaultValues: {
      titlu: document.titlu ?? "",
      file: null as File | null,
    },
    validators: {
      onChange: weekDocumentSchema,
    },
    onSubmit: async ({ value }) => {
      await onSave(document, week, { titlu: value.titlu, file: value.file })
      onCancelEdit()
    },
  })

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
      <div className="space-y-1.5">
        <Label htmlFor={`document-title-${document.id}`} className="text-xs font-semibold tracking-[0.14em] text-slate-600">TITLU</Label>
        <form.Field name="titlu">
          {(field) => (
            <>
              <Input
                id={`document-title-${document.id}`}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                className="h-11 rounded-2xl border-[#e4d8cd] bg-white px-4 shadow-none focus-visible:border-[#24385b] focus-visible:ring-[#24385b]/10"
              />
              {field.state.meta.errors[0] ? <p className="text-sm text-rose-600">{String(field.state.meta.errors[0])}</p> : null}
            </>
          )}
        </form.Field>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`document-file-${document.id}`} className="text-xs font-semibold tracking-[0.14em] text-slate-600">ÎNLOCUIEȘTE FIȘIERUL (OPȚIONAL)</Label>
        <form.Field name="file">
          {(field) => (
            <Input
              id={`document-file-${document.id}`}
              type="file"
              ref={(element) => {
                documentFileInputRefs.current[document.id] = element
              }}
              onChange={(event) => field.handleChange(event.target.files?.[0] ?? null)}
              className={cn("h-11 rounded-2xl border-[#e4d8cd] bg-white px-4 shadow-none file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-semibold focus-visible:ring-[#24385b]/10", theme.fileIconText)}
            />
          )}
        </form.Field>
      </div>
      <Button
        type="button"
        onClick={() => void form.handleSubmit()}
        disabled={Boolean(activeAction)}
        className={cn("rounded-2xl text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}
      >
        <Save className="h-4 w-4" />
        {activeAction === `update-document-${document.id}` ? "Se salvează..." : "Salvează"}
      </Button>
    </div>
  )
}

export default function WeekDocumentList({
  week,
  documents,
  canEdit,
  isProfessor,
  activeAction,
  theme,
  editingDocumentIds,
  setEditingDocumentIds,
  documentFileInputRefs,
  onUpdateDocument,
  onDeleteDocument,
  onRetryDocument,
}: WeekDocumentListProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">Documente</p>
          <p className="text-sm text-slate-500">Materialele disponibile pentru săptămâna {week.nrSaptamana}.</p>
        </div>
        <span className="text-sm font-medium text-slate-500">{formatDocumentsCount(documents.length)}</span>
      </div>

      {documents.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#d8ccbf] bg-[#fbf6f0] px-5 py-7 text-center text-sm text-slate-500">
          Nu există documente în această săptămână.
        </div>
      ) : null}

      {documents.map((document) => {
        const canRetryIngest = canEdit && !isProfessor && canRetryDocumentIngest(document)
        const isEditing = Boolean(editingDocumentIds[document.id])
        const currentFilename = extractFilename(document.urlDescarcare)
        const previewUrl = getDocumentHref(document)
        const rawStatusLabel = getDocumentStatusLabel(document)
        const displayStatusLabel = isProfessor && rawStatusLabel === "ERONAT" ? "NEPROCESAT" : rawStatusLabel

        return (
          <article key={document.id} className="rounded-3xl border border-[#e4d8cd] bg-white overflow-hidden">
            {/* View mode */}
            <div className="flex flex-col gap-0">
              <div className="flex items-start gap-3 p-4">
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", theme.fileIconBg, theme.fileIconText)}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-slate-900">{document.titlu}</h3>
                    <StatusBadge className={getDocumentStatusClasses(document)}>{displayStatusLabel}</StatusBadge>
                  </div>
                  {currentFilename ? (
                    <div className="mt-1 flex items-center gap-1.5">
                      {previewUrl ? (
                        <a
                          href={previewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={cn("text-sm font-medium truncate underline-offset-4 hover:underline", theme.linkColor)}
                          title={currentFilename}
                        >
                          📎 {currentFilename}
                        </a>
                      ) : (
                        <span className="text-sm text-slate-500 truncate" title={currentFilename}>📎 {currentFilename}</span>
                      )}
                    </div>
                  ) : null}
                  {!isProfessor && document.statusIndex === "ERONAT" && (
                    <p className="mt-1 text-xs text-amber-600 font-medium">⚠ Fișier stocat, dar neindexat în AI. Apasă "Reîncearcă indexarea" pentru conectarea cu serviciul RAG.</p>
                  )}
                </div>
                {canEdit ? (
                  <div className="flex shrink-0 items-center gap-2">
                    {canRetryIngest ? (
                      <Button type="button" variant="outline" size="sm" onClick={() => onRetryDocument(document, week)} disabled={Boolean(activeAction)} className="rounded-xl border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs gap-1.5">
                        <RefreshCcw className="h-3.5 w-3.5" />
                        Reîncearcă indexarea
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingDocumentIds((c) => ({ ...c, [document.id]: !c[document.id] }))}
                      disabled={Boolean(activeAction)}
                      className={cn("rounded-xl text-xs gap-1.5", isEditing ? "border-slate-300 bg-slate-100 text-slate-700" : cn("bg-white hover:bg-white/80", theme.btnIconBorder, theme.iconText))}
                    >
                      {isEditing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
                      {isEditing ? "Anulează" : "Editează"}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => onDeleteDocument(document, week)} disabled={Boolean(activeAction)} className="rounded-xl border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" />
                      Șterge
                    </Button>
                  </div>
                ) : (
                  document.urlDescarcare ? (
                    <a href={document.urlDescarcare} rel="noreferrer" className={cn("shrink-0 text-sm font-semibold underline-offset-4 hover:underline", theme.linkColor)}>
                      Descarcă
                    </a>
                  ) : null
                )}
              </div>

              {/* Download link visible when can edit */}
              {canEdit && document.urlDescarcare ? (
                <div className="border-t border-[#f0eae3] px-4 py-2.5">
                  <a href={document.urlDescarcare} download={currentFilename || true} rel="noreferrer" className={cn("text-sm font-medium underline-offset-4 hover:underline", theme.linkColor)}>
                    ↓ Descarcă documentul
                  </a>
                </div>
              ) : null}

              {/* Edit form — revealed only when editing */}
              {canEdit && isEditing ? (
                <div className="border-t border-[#e4d8cd] bg-[#faf6f1] p-4">
                  <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-slate-500 uppercase">Editare document</p>
                  <DocumentEditForm
                    document={document}
                    week={week}
                    activeAction={activeAction}
                    theme={theme}
                    documentFileInputRefs={documentFileInputRefs}
                    onSave={onUpdateDocument}
                    onCancelEdit={() => setEditingDocumentIds((current) => ({ ...current, [document.id]: false }))}
                  />
                </div>
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}
