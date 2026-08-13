import { ChevronDown, FileText, X } from "lucide-react"
import { cn, formatWeeks } from "@/lib/utils"

import type { CourseTheme } from "@/types/theme"

type EntityId = string | number

interface WeekRecord {
  id: EntityId
  nrSaptamana?: number
}

interface DocumentRecord {
  id: EntityId
  titlu?: string
  urlDescarcare?: string
  urlVizualizare?: string
}

interface CourseIndexPanelProps {
  weeks: WeekRecord[]
  documentsByWeek: Record<string, DocumentRecord[]>
  indexExpandedWeekIds: Record<string, boolean>
  onClose: () => void
  onToggleWeek: (weekId: EntityId) => void
  onScrollToWeek: (weekId: EntityId) => void
  theme: CourseTheme
  formatDocumentsCount: (count: number) => string
  getDocumentHref: (document: DocumentRecord | null | undefined) => string
  extractFilename: (url: unknown) => string
}

export default function CourseIndexPanel({
  weeks,
  documentsByWeek,
  indexExpandedWeekIds,
  onClose,
  onToggleWeek,
  onScrollToWeek,
  theme,
  formatDocumentsCount,
  getDocumentHref,
  extractFilename,
}: CourseIndexPanelProps) {
  const totalCourseDocuments = weeks.reduce((total, week) => total + (documentsByWeek[String(week.id)]?.length ?? 0), 0)

  return (
    <aside
      className="relative z-20 flex max-h-[70vh] w-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-[#e4d8cd] bg-linear-to-b from-[#f8fafc] via-[#fffdfa] to-[#fbf6f0] shadow-[18px_22px_54px_rgba(32,46,84,0.12)] lg:h-[calc(100vh-9rem)] lg:max-h-none lg:rounded-l-none lg:rounded-r-[2rem] lg:border-l-0"
      aria-label="Cuprins curs"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#e4d8cd] px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Cuprins curs</h2>
          <p className="mt-1 text-sm text-slate-500">
            {formatWeeks(weeks.length)} · {formatDocumentsCount(totalCourseDocuments)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-[#e4d8cd] bg-white text-slate-500 transition hover:bg-[#f7efe6] hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24385b]/20"
          aria-label="Închide cuprins curs"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {weeks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d8ccbf] bg-white/80 px-4 py-8 text-center text-sm text-slate-500">
            Nu există săptămâni pentru acest curs.
          </div>
        ) : null}

        <div className="space-y-3">
          {weeks.map((week) => {
            const weekId = String(week.id)
            const documents = documentsByWeek[weekId] ?? []
            const isIndexExpanded = indexExpandedWeekIds[weekId] ?? false

            return (
              <article key={week.id} className="overflow-hidden rounded-3xl border border-[#e4d8cd] bg-white shadow-[0_12px_30px_rgba(32,46,84,0.07)]">
                <div className="flex items-center gap-2 px-3 py-3">
                  <button
                    type="button"
                    onClick={() => onToggleWeek(week.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-[#f7efe6] hover:text-slate-900"
                    aria-expanded={isIndexExpanded}
                    aria-label={`${isIndexExpanded ? "Închide" : "Deschide"} documentele săptămânii ${week.nrSaptamana}`}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${isIndexExpanded ? "rotate-180" : "-rotate-90"}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onScrollToWeek(week.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-[#f7efe6]"
                  >
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-bold", theme.weekNumBg, theme.weekNumText)}>
                      S{week.nrSaptamana}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900">Săptămâna {week.nrSaptamana}</span>
                      <span className="block truncate text-xs font-medium text-slate-500">{formatDocumentsCount(documents.length)}</span>
                    </span>
                  </button>
                </div>

                {isIndexExpanded ? (
                  <div className="border-t border-[#eee4da] bg-[#fbf7f1]/78 px-3 py-3">
                    {documents.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-[#d8ccbf] bg-white/70 px-3 py-3 text-sm text-slate-500">
                        Nu există documente în această săptămână.
                      </p>
                    ) : null}

                    <div className="space-y-2">
                      {documents.map((document) => {
                        const documentHref = getDocumentHref(document)
                        const filename = extractFilename(document.urlDescarcare)

                        if (!documentHref) {
                          return (
                            <div key={document.id} className="flex items-start gap-2 rounded-2xl border border-[#e4d8cd] bg-white/70 px-3 py-3 text-sm text-slate-400">
                              <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                              <span className="min-w-0 truncate">{document.titlu || filename || "Document indisponibil"}</span>
                            </div>
                          )
                        }

                        return (
                          <a
                            key={document.id}
                            href={documentHref}
                            target="_blank"
                            rel="noreferrer"
                            onClick={onClose}
                            className="flex items-start gap-2 rounded-2xl border border-[#e4d8cd] bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#cdbca9] hover:bg-white hover:text-slate-950"
                            title={filename || document.titlu}
                          >
                            <FileText className={cn("mt-0.5 h-4 w-4 shrink-0", theme.fileIconText)} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate">{document.titlu || filename || "Document"}</span>
                              {filename ? <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">{filename}</span> : null}
                            </span>
                          </a>
                        )
                      })}
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
