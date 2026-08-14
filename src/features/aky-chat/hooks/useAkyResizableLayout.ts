import { useCallback, useEffect, useRef, useState } from "react"

import type { PointerEvent as ReactPointerEvent } from "react"

import { AKY_HISTORY_DEFAULT_WIDTH, AKY_PANEL_DEFAULT_WIDTH } from "../aky-chat.constants"
import { clampHistoryWidth, clampPanelWidth } from "../aky-chat.utils"
import type { AkyPanelStyle } from "../aky-chat.types"

export function useAkyResizableLayout(open: boolean) {
  const [panelWidth, setPanelWidth] = useState(AKY_PANEL_DEFAULT_WIDTH)
  const [historyWidth, setHistoryWidth] = useState(AKY_HISTORY_DEFAULT_WIDTH)
  const [historyVisible, setHistoryVisible] = useState(true)
  const [isResizing, setIsResizing] = useState(false)
  const isResizingPanelRef = useRef(false)
  const isResizingHistoryRef = useRef(false)

  const clampPanel = useCallback((nextWidth: number) => clampPanelWidth(nextWidth), [])
  const clampHistory = useCallback((nextWidth: number) => clampHistoryWidth(nextWidth, panelWidth), [panelWidth])

  useEffect(() => {
    if (!open) return undefined

    function handleWindowResize() {
      setPanelWidth((currentWidth) => clampPanel(currentWidth))
      setHistoryWidth((currentWidth) => clampHistory(currentWidth))
    }

    handleWindowResize()
    window.addEventListener("resize", handleWindowResize)

    return () => {
      window.removeEventListener("resize", handleWindowResize)
    }
  }, [clampHistory, clampPanel, open])

  useEffect(() => {
    if (!open) return

    setHistoryWidth((currentWidth) => clampHistory(currentWidth))
  }, [clampHistory, open])

  function handlePanelResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault()
    isResizingPanelRef.current = true
    setIsResizing(true)

    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect
    document.body.style.cursor = "ew-resize"
    document.body.style.userSelect = "none"

    function handlePointerMove(moveEvent: PointerEvent) {
      if (!isResizingPanelRef.current) return
      setPanelWidth(clampPanel(window.innerWidth - moveEvent.clientX))
    }

    function handlePointerUp() {
      isResizingPanelRef.current = false
      setIsResizing(false)
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)
  }

  function handleHistoryResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()
    isResizingHistoryRef.current = true
    setIsResizing(true)

    const startX = event.clientX
    const startWidth = historyWidth
    const previousCursor = document.body.style.cursor
    const previousUserSelect = document.body.style.userSelect
    document.body.style.cursor = "ew-resize"
    document.body.style.userSelect = "none"

    function handlePointerMove(moveEvent: PointerEvent) {
      if (!isResizingHistoryRef.current) return
      setHistoryWidth(clampHistory(startWidth + moveEvent.clientX - startX))
    }

    function handlePointerUp() {
      isResizingHistoryRef.current = false
      setIsResizing(false)
      document.body.style.cursor = previousCursor
      document.body.style.userSelect = previousUserSelect
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
      window.removeEventListener("pointercancel", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp)
    window.addEventListener("pointercancel", handlePointerUp)
  }

  const panelStyle: AkyPanelStyle = {
    "--aky-panel-width": `${panelWidth}px`,
    "--aky-history-width": `${historyWidth}px`,
    width: (typeof window !== "undefined" && window.innerWidth >= 1024) ? `${panelWidth}px` : undefined,
  }

  return {
    panelWidth,
    setPanelWidth,
    historyWidth,
    setHistoryWidth,
    historyVisible,
    setHistoryVisible,
    isResizing,
    handlePanelResizePointerDown,
    handleHistoryResizePointerDown,
    panelStyle,
  }
}
