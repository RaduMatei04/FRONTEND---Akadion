import { useAuth } from "@/auth/useAuth"
import { isAdminUser, isProfessorUser } from "@/auth/user.utils"
import AdminDashboard from "@/features/dashboard/AdminDashboard"
import ProfessorDashboard from "@/features/dashboard/ProfessorDashboard"
import StudentDashboard from "@/features/dashboard/StudentDashboard"

export default function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = isAdminUser(user)
  const isProfessor = isProfessorUser(user)

  if (isAdmin) return <AdminDashboard />
  if (isProfessor) return <ProfessorDashboard />
  return <StudentDashboard />
}
