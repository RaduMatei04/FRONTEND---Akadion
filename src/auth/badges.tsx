import { getRoleLabel } from "@/auth/user.utils"
import { stateBadgeClasses, stateLabels } from "@/auth/userState"

import type { UserState, UserStateBadgeProps } from "@/auth/auth.types"
import type { UserRole } from "@/types/user"

interface UserRoleBadgeProps {
  role?: UserRole | null
}

export function UserStateBadge({ state, label, className = "" }: UserStateBadgeProps) {
  const typedState = state as UserState

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] uppercase ${stateBadgeClasses[typedState] ?? "border-slate-200 bg-slate-50 text-slate-600"} ${className}`}
    >
      {label ?? stateLabels[typedState] ?? state}
    </span>
  )
}

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#d9ccbe] bg-white px-3 py-1 text-xs font-semibold tracking-[0.12em] text-[#4A5681] uppercase">
      {role ? getRoleLabel(role) : "-"}
    </span>
  )
}
