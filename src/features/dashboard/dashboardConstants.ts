export const adminDashboardLogo = "/logo_dasboard_admin.png"
export const professorDashboardLogo = "/logo_dasboard_profesor.png"
export const studentDashboardLogo = "/logo_dashboard_student.png"
export const heroStatsBadgeClassName = "inline-flex items-center gap-2 rounded-2xl border border-white/28 bg-white/20 px-3.5 py-1.5 text-white backdrop-blur-md shadow-xs transition hover:bg-white/25"
export const heroStatsLabelClassName = "text-xs font-medium text-white/90"
export const heroStatsValueClassName = "text-sm font-bold tracking-tight text-white"
export const heroStatsSecondaryDotClassName = "bg-[#718FAE] shadow-[0_0_8px_rgba(113,143,174,0.78)]"
export const ADMIN_DASHBOARD_QUERY_KEY = ["dashboard", "admin-stats"] as const
export const PROFESSOR_DASHBOARD_QUERY_KEY = ["dashboard", "professor-courses"] as const
export const STUDENT_DASHBOARD_QUERY_KEY = ["dashboard", "student-courses"] as const

export interface AdminStats {
  utilizatoriPending?: number
  cursuriActive?: number
  utilizatoriActivi?: number
  cursuriInactive?: number
}

export function getActiveCourseCounts(courses: { activ?: boolean }[]) {
  const active = courses.filter((course) => course.activ).length
  return { active, inactive: courses.length - active, total: courses.length }
}
