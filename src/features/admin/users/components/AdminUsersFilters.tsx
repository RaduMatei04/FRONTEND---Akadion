import { stateLabels } from "@/auth/userState"

import type { UserState } from "@/auth/auth.types"

interface AdminUsersFiltersProps {
  tabs: UserState[]
  selectedState: UserState
  allUsersLength: number
  stateCounts: Record<string, number>
  usersLoading: boolean
  onFilterChange: (state: UserState) => void
}

export default function AdminUsersFilters({ tabs, selectedState, allUsersLength, stateCounts, usersLoading, onFilterChange }: AdminUsersFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((state) => {
        const isSelected = selectedState === state
        const count = state === "ALL" ? allUsersLength : stateCounts[state] ?? 0

        return (
          <button key={state} type="button" onClick={() => onFilterChange(state)} className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${isSelected ? "border-[#24385b] bg-[#24385b] text-white shadow-sm" : "border-[#d8ccbf] bg-white text-slate-700 hover:bg-[#f7efe6] hover:text-[#24385b]"}`}>
            {stateLabels[state] ?? state}
            <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">{usersLoading ? "..." : count}</span>
          </button>
        )
      })}
    </div>
  )
}
