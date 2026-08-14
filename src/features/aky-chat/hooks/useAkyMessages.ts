import { keepPreviousData, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useState } from "react"

import { adaugaMesaj, creareConversatieSiMesaj, getIstoric, retryMesaj } from "@/features/study-tools/api/studyTools"

import type { FormEvent } from "react"
import type { AppAxiosError } from "@/types/api"

import { buildUserMessage, normalizeHistoryResponse } from "../aky-chat.utils"
import type { EntityId, MessageRecord, NewConversationResponse } from "../aky-chat.types"

interface UseAkyMessagesParams {
  selectedCourseId: EntityId | null
  selectedConversationId: EntityId | null
  enabled: boolean
  onNewConversationId: (conversationId: EntityId) => void
}

const HISTORY_QUERY_KEY = ["aky", "history"] as const

const HISTORY_LOAD_ERROR = "Nu s-a putut încărca istoricul conversației."

interface NormalizedHistory {
  items: MessageRecord[]
  hasMore: boolean
  oldestLoadedMessageId: EntityId | null
}

function getHistoryQueryKey(conversationId: EntityId | null): readonly ["aky", "history", EntityId | null] {
  return [...HISTORY_QUERY_KEY, conversationId]
}

export function useAkyMessages({ selectedCourseId, selectedConversationId, enabled, onNewConversationId }: UseAkyMessagesParams) {
  const queryClient = useQueryClient()

  const [optimisticPendingMessages, setOptimisticPendingMessages] = useState<MessageRecord[]>([])
  const [draft, setDraft] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const historyQuery = useInfiniteQuery({
    queryKey: getHistoryQueryKey(selectedConversationId),
    enabled: enabled && Boolean(selectedConversationId),
    initialPageParam: null as EntityId | null,
    queryFn: async ({ pageParam }): Promise<NormalizedHistory> => {
      const conversationId = selectedConversationId
      if (conversationId == null) {
        throw new Error("Nicio conversație selectată pentru istoric.")
      }
      const response = await getIstoric(conversationId, pageParam ?? undefined)
      return normalizeHistoryResponse(response)
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.oldestLoadedMessageId : undefined),
    placeholderData: selectedConversationId != null ? keepPreviousData : undefined,
  })

  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, activeCourseId, questionText }: { conversationId: EntityId | null; activeCourseId: EntityId; questionText: string }) => {
      if (!conversationId) {
        return creareConversatieSiMesaj(activeCourseId, questionText)
      }

      return adaugaMesaj(conversationId, questionText)
    },
  })

  const retryMessageMutation = useMutation({
    mutationFn: retryMesaj,
  })

  const historyMessages = useMemo(
    () => historyQuery.data?.pages.slice().reverse().flatMap((page) => page.items) ?? [],
    [historyQuery.data],
  )

  const messages = useMemo(() => {
    const historyMessageIds = new Set(historyMessages.map((message) => message.id))
    const pendingMessages = optimisticPendingMessages.filter((message) => !historyMessageIds.has(message.id))
    return [...historyMessages, ...pendingMessages]
  }, [historyMessages, optimisticPendingMessages])

  useEffect(() => {
    setOptimisticPendingMessages([])
  }, [historyQuery.dataUpdatedAt])

  useEffect(() => {
    setError(null)
  }, [selectedCourseId])

  useEffect(() => {
    setError(null)
  }, [selectedConversationId])

  useEffect(() => {
    if (historyQuery.isLoadingError) {
      setError(HISTORY_LOAD_ERROR)
    }
  }, [historyQuery.isLoadingError])

  const isLoadingMessages = historyQuery.isLoading && optimisticPendingMessages.length === 0
  const hasMoreMessages = historyQuery.hasNextPage ?? false
  const isLoadingOlderMessages = historyQuery.isFetchingNextPage

  const resetMessages = useCallback(() => {
    setOptimisticPendingMessages([])
    setError(null)
    queryClient.removeQueries({ queryKey: HISTORY_QUERY_KEY })
  }, [queryClient])

  async function loadHistory(convId: EntityId) {
    setError(null)
    setOptimisticPendingMessages([])
    if (convId === selectedConversationId) {
      const refetchResult = await historyQuery.refetch()
      if (refetchResult.isRefetchError) {
        setError(HISTORY_LOAD_ERROR)
      }
    }
  }

  const loadOlderMessages = useCallback(async () => {
    if (!selectedConversationId || !historyQuery.hasNextPage || historyQuery.isFetchingNextPage) return
    await historyQuery.fetchNextPage()
  }, [selectedConversationId, historyQuery])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const questionText = draft.trim()

    if (!questionText || isSending || !enabled || !selectedCourseId) {
      return
    }

    const now = new Date()
    const userMessage = buildUserMessage(questionText, now)

    setOptimisticPendingMessages((current) => [...current, userMessage])
    setDraft("")
    setIsSending(true)
    setError(null)

    try {
      if (!selectedConversationId) {
        const response = await sendMessageMutation.mutateAsync({
          conversationId: null,
          activeCourseId: selectedCourseId,
          questionText,
        })
        const newConvId = (response as NewConversationResponse).conversatieId
        if (newConvId != null) {
          onNewConversationId(newConvId)
        }
      } else {
        await sendMessageMutation.mutateAsync({
          conversationId: selectedConversationId,
          activeCourseId: selectedCourseId,
          questionText,
        })
        void queryClient.invalidateQueries({ queryKey: getHistoryQueryKey(selectedConversationId) })
      }
    } catch (err: unknown) {
      const typedError = err as AppAxiosError
      console.error("Nu s-a putut trimite mesajul:", err)

      if (typedError.response?.status === 429) {
        setError("Ai depășit limita de întrebări pe minut. Te rugăm să aștepți puțin înainte de a încerca din nou.")
      } else if (typedError.response?.status === 502 || typedError.response?.status === 503) {
        setError("Serviciul Aky este temporar indisponibil. Te rugăm să încerci din nou mai târziu.")
      } else if (typedError.response?.status === 404) {
        setError("Modulul Aky de chat pentru acest curs este în pregătire (API 404). Răspunsul va fi disponibil când backend-ul RAG este activat.")
      } else {
        setError(typedError.response?.data?.eroare || "Nu am putut primi un răspuns de la Aky. Te rugăm să reîncerci.")
      }

      if (selectedConversationId) {
        void queryClient.invalidateQueries({ queryKey: getHistoryQueryKey(selectedConversationId) })
      } else {
        setOptimisticPendingMessages((current) => current.filter((message) => message.id !== userMessage.id))
      }
    } finally {
      setIsSending(false)
    }
  }

  async function handleRetry(mesajId: EntityId | null | undefined) {
    if (!enabled || isSending || mesajId == null) return
    setIsSending(true)
    setError(null)

    try {
      await retryMessageMutation.mutateAsync(mesajId)
      await historyQuery.refetch()
    } catch (err) {
      console.error("Eroare la retry:", err)
      setError("Aky nu a putut răspunde nici de această dată. Te rog încearcă mai târziu.")
    } finally {
      setIsSending(false)
    }
  }

  return {
    messages,
    hasMoreMessages,
    isLoadingOlderMessages,
    draft,
    setDraft,
    isSending,
    error,
    isLoadingMessages,
    loadHistory,
    loadOlderMessages,
    resetMessages,
    handleSubmit,
    handleRetry,
  }
}
