import { AlertCircle, Loader2 } from "lucide-react"
import { useEffect, useRef } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

import type { UIEvent } from "react"
import type { CourseTheme } from "@/types/theme"

import AkyMessageItem from "./AkyMessageItem"
import AkyWelcomeCard from "./AkyWelcomeCard"
import type { EntityId, MessageRecord } from "../aky-chat.types"

interface AkyMessageListProps {
  messages: MessageRecord[]
  isLoadingMessages: boolean
  hasMoreMessages: boolean
  isLoadingOlderMessages: boolean
  isSending: boolean
  error: string | null
  autoScroll: boolean
  theme: CourseTheme
  activeCourseTitle: string | null | undefined
  onLoadOlderMessages: () => void
  onQuickQuestion: (questionText: string) => void
  onRetry: (mesajId: EntityId | null | undefined) => void
}

export default function AkyMessageList({
  messages,
  isLoadingMessages,
  hasMoreMessages,
  isLoadingOlderMessages,
  isSending,
  error,
  autoScroll,
  theme,
  activeCourseTitle,
  onLoadOlderMessages,
  onQuickQuestion,
  onRetry,
}: AkyMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [autoScroll, isSending, messages])

  function handleScrollMessages(event: UIEvent<HTMLDivElement>) {
    const { scrollTop } = event.currentTarget
    if (hasMoreMessages && !isLoadingOlderMessages && scrollTop < 40) {
      onLoadOlderMessages()
    }
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5" onScroll={handleScrollMessages}>
      {messages.length === 0 && !isLoadingMessages ? (
        <AkyWelcomeCard activeCourseTitle={activeCourseTitle} onQuickQuestion={onQuickQuestion} />
      ) : null}

      {isLoadingMessages ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      ) : (
        <div className="flex-1 space-y-4">
          {hasMoreMessages ? (
            <div className="pb-2 text-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onLoadOlderMessages}
                disabled={isLoadingOlderMessages}
                className="rounded-xl text-xs font-semibold text-[#3b6ea8] hover:bg-[#f4f8fd]"
              >
                {isLoadingOlderMessages ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Se încarcă mesajele mai vechi...
                  </>
                ) : (
                  "Încărcare mesaje mai vechi"
                )}
              </Button>
            </div>
          ) : messages.length > 0 ? (
            <p className="pb-2 text-center text-[11px] font-medium text-slate-400">
              — Începutul conversației —
            </p>
          ) : null}
          {messages.map((message, index) => (
            <AkyMessageItem
              key={`message-${message.id ?? index}`}
              message={message}
              theme={theme}
              onRetry={onRetry}
            />
          ))}

          {isSending ? (
            <div className="flex flex-col items-start gap-1.5">
              <div className="flex items-center gap-2 rounded-[1.35rem] rounded-bl-xs border border-[#e4d8cd] bg-white px-4 py-3 text-xs text-slate-600 shadow-xs">
                <Loader2 className="h-4 w-4 animate-spin text-[#24385b]" />
                <span>Aky analizează materialele cursului...</span>
              </div>
            </div>
          ) : null}

          {error ? (
            <Alert variant="destructive" className="rounded-2xl border-rose-200 bg-rose-50/90 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-rose-600" />
              <AlertDescription className="text-xs font-medium text-rose-800">{error}</AlertDescription>
            </Alert>
          ) : null}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}
