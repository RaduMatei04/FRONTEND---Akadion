import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

import type { CourseTab } from "../course-detail.types"
import type { CourseTheme } from "@/types/theme"

export function StatusBadge({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase ${className}`}>
      {children}
    </span>
  )
}

export function DetailTab({ active, theme, children, onClick }: { active: boolean; theme: CourseTheme; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-5 py-2.5 text-sm font-semibold transition",
        active
          ? cn("text-white shadow-sm border-transparent", theme?.btnPrimaryBg || "bg-[#24385b]")
          : "border-[#d8ccbf] bg-white text-slate-700 hover:bg-[#f7efe6] hover:text-slate-900"
      )}
    >
      {children}
    </button>
  )
}

interface CourseDetailTabsProps {
  tabs: CourseTab[]
  activeTab: CourseTab
  theme: CourseTheme
  onTabChange: (tab: CourseTab) => void
}

export default function CourseDetailTabs({ tabs, activeTab, theme, onTabChange }: CourseDetailTabsProps) {
  return (
    <div className="flex w-fit max-w-full flex-wrap gap-2 rounded-[1.6rem] border border-[#e4d8cd] bg-white/74 p-2 shadow-[0_14px_34px_rgba(32,46,84,0.06)]">
      {tabs.map((tab) => (
        <DetailTab key={tab} active={activeTab === tab} theme={theme} onClick={() => onTabChange(tab)}>
          {tab === "saptamani" ? "Săptămâni" : tab === "studenti" ? "Studenți" : "Profesor"}
        </DetailTab>
      ))}
    </div>
  )
}
