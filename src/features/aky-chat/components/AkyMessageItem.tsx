import { AlertCircle, FileText, RotateCcw } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { cn } from "@/lib/utils"

import type { CourseTheme } from "@/types/theme"

import { formatTime } from "../aky-chat.utils"
import type { EntityId, MessageRecord } from "../aky-chat.types"

interface AkyMessageItemProps {
  message: MessageRecord
  theme: CourseTheme
  onRetry: (mesajId: EntityId | null | undefined) => void
}

export default function AkyMessageItem({ message, theme, onRetry }: AkyMessageItemProps) {
  const isUser = message.rol === "UTILIZATOR"

  return (
    <div className={cn("flex flex-col gap-1.5", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-[1.35rem] px-4 py-3 text-sm leading-relaxed shadow-xs",
          isUser
            ? `rounded-br-xs bg-linear-to-r ${theme.accent} text-white`
            : "rounded-bl-xs border border-[#e4d8cd] bg-white text-slate-800"
        )}
      >
        <div className="whitespace-pre-wrap font-sans text-sm markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.continut ?? ""}
          </ReactMarkdown>
        </div>

        {!isUser && typeof message.surseFolosite === "string" && message.surseFolosite ? (
          <div className="mt-2.5 space-y-1 border-t border-slate-100 pt-2">
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Surse folosite:</p>
            <div className="flex flex-wrap gap-1.5">
              {message.surseFolosite.split(",").filter(Boolean).map((sourceItem, index) => {
                const parts = sourceItem.split("|")
                const sourceId = parts[0]
                const sourceName = parts.length > 1 ? parts[1] : `Document ${sourceId}`
                return (
                  <span key={index} className="inline-flex items-center gap-1 rounded-xl border border-[#d9e4f4] bg-[#f4f8fd] px-2.5 py-1 text-[11px] font-semibold text-[#24385b]">
                    <FileText className="h-3 w-3 text-[#3b6ea8]" />
                    <span className="max-w-[140px] truncate">{sourceName}</span>
                  </span>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2 px-1">
        {isUser && message.areRaspuns === false && (
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
            <span className="text-[10px] font-medium text-rose-500">Nu s-a putut răspunde</span>
            <button
              onClick={() => onRetry(message.id)}
              className="flex items-center gap-1 text-[10px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Retry
            </button>
          </div>
        )}
        <span className="text-[10px] font-medium text-slate-400">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  )
}
