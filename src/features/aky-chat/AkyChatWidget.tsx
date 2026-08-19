import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { useCallback, useEffect, useState, type MouseEvent, type UIEvent } from "react"

import { isAdminUser } from "@/auth/user.utils"
import { useAuth } from "@/auth/useAuth"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { getConversatii, getConversatiiGlobale, stergeConversatie } from "@/features/aky-chat/api/chat"
import { useMyCoursesQuery } from "@/features/courses/hooks/useMyCoursesQuery"
import { cn } from "@/lib/utils"
import type { PaginatedResponse } from "@/types/api"

import AkyChatHeader from "./components/AkyChatHeader"
import AkyChatPanel from "./components/AkyChatPanel"
import AkyConversationListPane from "./components/AkyConversationListPane"
import AkyResizeHandle from "./components/AkyResizeHandle"
import { useAkyMessages } from "./hooks/useAkyMessages"
import { useAkyResizableLayout } from "./hooks/useAkyResizableLayout"
import { useAkyThemePreference } from "./hooks/useAkyThemePreference"
import { AKY_CONVERSATIONS_QUERY_KEY, AKY_PANEL_MIN_WIDTH, ragLogo } from "./aky-chat.constants"
import { formatDate } from "./aky-chat.utils"
import type { AkyChatWidgetProps, ChatView, ConversationRecord, ConversationsPage, EntityId, FilterMode } from "./aky-chat.types"

interface NormalizedConversationsPage {
  items: ConversationRecord[]
  hasMore: boolean
  page: number
}

function normalizeConversationsPage(response: PaginatedResponse<ConversationRecord> | ConversationRecord[], page: number): NormalizedConversationsPage {
  if (Array.isArray(response)) return { items: response, hasMore: false, page }
  return { items: response.continut ?? [], hasMore: (response as ConversationsPage).areUrmatoarea ?? false, page }
}

function getConversationsQueryKey(courseId: EntityId | null, filterMode: FilterMode) {
  return [...AKY_CONVERSATIONS_QUERY_KEY, courseId ?? "global", filterMode]
}

export default function AkyChatWidget({ courseId = null, courseTitle = null, enabled = true }: AkyChatWidgetProps) {
  const { user } = useAuth()
  const isAdmin = isAdminUser(user)

  const [open, setOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<EntityId | null>(courseId)
  const [selectedConversationId, setSelectedConversationId] = useState<EntityId | null>(null)
  const [view, setView] = useState<ChatView>("list")
  const [filterMode, setFilterMode] = useState<FilterMode>("course")

  const { selectedTheme } = useAkyThemePreference(user)
  const { setPanelWidth, historyVisible, setHistoryVisible, isResizing, handlePanelResizePointerDown, handleHistoryResizePointerDown, panelStyle } =
    useAkyResizableLayout(open)

  const queryClient = useQueryClient()

  const coursesQuery = useMyCoursesQuery(open && !courseId)
  const courses = coursesQuery.data ?? []
  const activeCourseTitle = courseTitle || courses.find((course) => String(course.id) === String(selectedCourseId))?.denumire

  const conversationsQuery = useInfiniteQuery({
    queryKey: getConversationsQueryKey(courseId, filterMode),
    enabled: open && !isAdmin,
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const response = filterMode === "course" && courseId ? await getConversatii(courseId, pageParam) : await getConversatiiGlobale(pageParam)
      return normalizeConversationsPage(response, pageParam)
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  })

  const conversatii = conversationsQuery.data?.pages.flatMap((page) => page.items) ?? []
  const hasMoreConversations = conversationsQuery.hasNextPage ?? false
  const isLoadingConversations = conversationsQuery.isPending
  const isLoadingMoreConversations = conversationsQuery.isFetchingNextPage

  const handleNewConversationId = useCallback(
    (conversationId: EntityId) => {
      setSelectedConversationId(conversationId)
      void queryClient.invalidateQueries({ queryKey: AKY_CONVERSATIONS_QUERY_KEY })
    },
    [queryClient],
  )

  const akyMessages = useAkyMessages({
    selectedCourseId,
    selectedConversationId,
    enabled,
    onNewConversationId: handleNewConversationId,
  })
  const { resetMessages } = akyMessages

  const deleteConversationMutation = useMutation({
    mutationFn: stergeConversatie,
  })

  useEffect(() => {
    if (!open) return

    resetMessages()
    setSelectedConversationId(null)
    setView("list")
    setSelectedCourseId(courseId)
    void queryClient.invalidateQueries({ queryKey: AKY_CONVERSATIONS_QUERY_KEY })
  }, [open, courseId, queryClient, resetMessages])

  useEffect(() => {
    if (!open || !courseId || filterMode !== "course") return

    const firstPage = conversationsQuery.data?.pages[0]
    if (!firstPage || firstPage.items.length > 0) return

    let cancelled = false

    void (async () => {
      try {
        const globalResponse = await getConversatiiGlobale(0)
        const globalItems = Array.isArray(globalResponse) ? globalResponse : (globalResponse.continut ?? [])
        if (!cancelled && globalItems.length > 0) {
          setFilterMode("all")
        }
      } catch (err) {
        console.error("Failed to load global conversations", err)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [open, courseId, filterMode, conversationsQuery.data])

  if (isAdmin) {
    return null
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setPanelWidth(AKY_PANEL_MIN_WIDTH)
    }
    setOpen(nextOpen)
  }

  function handleScrollConversations(event: UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
    if (hasMoreConversations && !isLoadingMoreConversations && scrollHeight - scrollTop - clientHeight < 60) {
      void conversationsQuery.fetchNextPage()
    }
  }

  async function handleOpenConversation(conversationId: EntityId | null | undefined, cursId?: EntityId | null) {
    if (conversationId == null) return
    setSelectedConversationId(conversationId)
    if (cursId) setSelectedCourseId(cursId)
    setView("chat")
    await akyMessages.loadHistory(conversationId)
  }

  function handleNewConversation() {
    setSelectedConversationId(null)
    if (!courseId) {
      setSelectedCourseId(null)
    }
    akyMessages.resetMessages()
    setView("chat")
  }

  async function handleDeleteConversation(conversationId: EntityId | null | undefined, event: MouseEvent<HTMLButtonElement>) {
    if (conversationId == null) return
    event.stopPropagation()

    try {
      await deleteConversationMutation.mutateAsync(conversationId)
      queryClient.setQueryData<InfiniteData<NormalizedConversationsPage>>(getConversationsQueryKey(courseId, filterMode), (currentData) => {
        if (!currentData) return currentData
        return { ...currentData, pages: currentData.pages.map((page) => ({ ...page, items: page.items.filter((conversatie) => conversatie.id !== conversationId) })) }
      })
      void queryClient.invalidateQueries({ queryKey: AKY_CONVERSATIONS_QUERY_KEY, refetchType: "none" })
      if (selectedConversationId === conversationId) {
        setView("list")
      }
    } catch (err) {
      console.error("Nu s-a putut sterge conversatia", err)
    }
  }

  function handleQuickQuestionClick(questionText: string) {
    if (!enabled || !selectedCourseId || akyMessages.isSending) return
    akyMessages.setDraft(questionText)
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => handleOpenChange(true)}
        aria-label="Deschide Aky"
        className="fixed right-7 bottom-7 z-40 h-[5.8rem] w-[5.8rem] overflow-hidden rounded-[2rem] border border-[#b8d2eb] bg-linear-to-br from-[#edf4fc] via-[#e2eefb] to-[#d3e4f7] p-0 shadow-[0_24px_58px_rgba(32,46,84,0.28)] transition hover:-translate-y-1 hover:shadow-[0_30px_68px_rgba(32,46,84,0.32)]"
      >
        <div className="flex h-full w-full items-center justify-center p-1.5">
          <img src={ragLogo} alt="Aky" className="scale-[1.18] h-full w-full object-contain" />
        </div>
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          onOpenChange={handleOpenChange}
          style={panelStyle}
          className={cn(
            "flex w-full max-w-none flex-col bg-linear-to-b from-[#fffdfa] via-[#fffdfb] to-[#f8fbff] p-0 sm:max-w-[58rem]",
            !isResizing && "transition-all duration-300",
            "lg:w-[var(--aky-panel-width)] lg:max-w-[min(84rem,calc(100vw-2rem))]",
          )}
        >
          <AkyResizeHandle
            ariaLabel="Redimensionează Aky"
            onPointerDown={handlePanelResizePointerDown}
            className="absolute top-1/2 left-[-0.5rem] z-50 hidden h-16 w-4 -translate-y-1/2 cursor-ew-resize items-center justify-center lg:flex"
          />
          <div className="flex h-full min-w-[350px] flex-1 flex-col">
            <AkyChatHeader
              selectedTheme={selectedTheme}
              view={view}
              activeCourseTitle={activeCourseTitle}
              onBackToList={() => {
                if (!courseId) {
                  setSelectedCourseId(null)
                }
                setView("list")
                void queryClient.invalidateQueries({ queryKey: AKY_CONVERSATIONS_QUERY_KEY })
              }}
            />
            <div className={cn("grid min-h-0 flex-1 bg-slate-50/50", historyVisible ? "lg:grid-cols-[var(--aky-history-width)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)]")}>
              <div className={cn("relative flex min-h-0 flex-col border-r border-slate-100 bg-white/42", view === "chat" ? "hidden lg:flex" : "flex", !historyVisible && "lg:hidden")}>
                <AkyResizeHandle
                  ariaLabel="Redimensionează istoricul conversațiilor"
                  onPointerDown={handleHistoryResizePointerDown}
                  className="absolute top-[calc(50%-3.5rem)] right-[-0.5rem] z-30 hidden h-16 w-4 -translate-y-1/2 cursor-ew-resize items-center justify-center lg:flex"
                />
                <AkyConversationListPane
                  historyVisible={historyVisible}
                  setHistoryVisible={setHistoryVisible}
                  selectedTheme={selectedTheme}
                  handleNewConversation={handleNewConversation}
                  handleScrollConversations={handleScrollConversations}
                  courseId={courseId}
                  filterMode={filterMode}
                  onFilterChange={setFilterMode}
                  isLoadingConversations={isLoadingConversations}
                  conversatii={conversatii}
                  courses={courses}
                  formatDate={formatDate}
                  handleOpenConversation={handleOpenConversation}
                  handleDeleteConversation={handleDeleteConversation}
                  hasMoreConversations={hasMoreConversations}
                  isLoadingMoreConversations={isLoadingMoreConversations}
                  fetchNextPage={() => void conversationsQuery.fetchNextPage()}
                />
              </div>

              <AkyChatPanel
                historyVisible={historyVisible}
                setHistoryVisible={setHistoryVisible}
                selectedTheme={selectedTheme}
                courses={courses}
                selectedCourseId={selectedCourseId}
                setSelectedCourseId={setSelectedCourseId}
                view={view}
                open={open}
                activeCourseTitle={activeCourseTitle}
                enabled={enabled}
                akyMessages={akyMessages}
                onQuickQuestion={handleQuickQuestionClick}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
