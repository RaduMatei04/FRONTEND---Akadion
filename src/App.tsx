import { useEffect } from "react"
import { Route, Routes, useLocation } from "react-router-dom"
import { LegacyUsersRedirect, RequireActiveProfessor, RequireAdmin, RequireAuthenticatedState } from "@/auth/guards"
import LogoutPage from "@/pages/LogoutPage"
import NotFoundPage from "@/pages/NotFoundPage"
import AdminAuditLogPage from "@/features/admin/audit-log/AdminAuditLogPage"
import AdminUsersPage from "@/features/admin/users/AdminUsersPage"
import CompleteProfilePage from "@/features/auth/complete-profile/CompleteProfilePage"
import DeactivatedAccountPage from "@/features/auth/status/DeactivatedAccountPage"
import PendingApprovalPage from "@/features/auth/status/PendingApprovalPage"
import RejectedRequestPage from "@/features/auth/status/RejectedRequestPage"
import CourseDetailPage from "@/features/courses/detail/CourseDetailPage"
import CoursesPage from "@/features/courses/list/CoursesPage"
import NewCoursePage from "@/features/courses/new/NewCoursePage"
import DashboardPage from "@/features/dashboard/DashboardPage"
import DiscoverAkyPage from "@/features/discover-aky/DiscoverAkyPage"
import OwlHall from "@/features/owl-hall/OwlHallPage"
import ProfilePage from "@/features/profile/ProfilePage"
import FlashcardsPage from "@/features/study-tools/flashcards/FlashcardsPage"
import QuizPage from "@/features/study-tools/quiz/QuizPage"

function RootRoute() {
  if (window.sessionStorage.getItem("akadion:logout-success-pending") === "1") {
    return <LogoutPage />
  }

  return (
    <RequireAuthenticatedState allowedStates={["ACTIV"]}>
      <DashboardPage />
    </RequireAuthenticatedState>
  )
}

export default function App() {
  const location = useLocation()

  useEffect(() => {
    const routeTitles: Record<string, string> = {
      "/": "Acasă",
      "/complete-profile": "Finalizare Profil",
      "/asteptare-aprobare": "Așteptare Aprobare",
      "/cerere-respinsa": "Cerere Respinsă",
      "/cont-dezactivat": "Cont Dezactivat",
      "/logout-success": "Logout Finalizat",
      "/courses": "Cursuri",
      "/courses/new": "Adaugă Curs",
      "/quiz": "Quiz",
      "/flashcards": "Flashcards",
      "/profile": "Profilul Meu",
      "/discover-aky": "Descoperă Aky",
      "/owl-hall": "Galeria Bufnițelor Legendare",
      "/users": "Utilizatori",
      "/admin/users": "Administrare Utilizatori",
      "/admin/audit-log": "Istoric modificări",
    }

    let title = "AKADION - Platformă Academică"
    if (routeTitles[location.pathname]) {
      title = `${routeTitles[location.pathname]} - AKADION`
    } else if (location.pathname.startsWith("/courses/")) {
      title = "Detalii Curs - AKADION"
    }

    document.title = title
  }, [location])

  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route
        path="/complete-profile"
        element={
          <RequireAuthenticatedState allowedStates={["INCOMPLET", "RESPINS"]}>
            <CompleteProfilePage />
          </RequireAuthenticatedState>
        }
      />
      <Route
        path="/asteptare-aprobare"
        element={
          <RequireAuthenticatedState allowedStates={["PENDING"]}>
            <PendingApprovalPage />
          </RequireAuthenticatedState>
        }
      />
      <Route
        path="/cerere-respinsa"
        element={
          <RequireAuthenticatedState allowedStates={["RESPINS"]}>
            <RejectedRequestPage />
          </RequireAuthenticatedState>
        }
      />
      <Route
        path="/cont-dezactivat"
        element={
          <RequireAuthenticatedState allowedStates={["INACTIV"]}>
            <DeactivatedAccountPage />
          </RequireAuthenticatedState>
        }
      />
      <Route path="/logout-success" element={<LogoutPage />} />
      <Route
        path="/courses"
        element={
          <RequireAuthenticatedState allowedStates={["ACTIV"]}>
            <CoursesPage />
          </RequireAuthenticatedState>
        }
      />
      <Route
        path="/courses/new"
        element={
          <RequireActiveProfessor>
            <NewCoursePage />
          </RequireActiveProfessor>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <RequireAuthenticatedState allowedStates={["ACTIV"]}>
            <CourseDetailPage />
          </RequireAuthenticatedState>
        }
      />
      <Route
        path="/quiz"
        element={
          <RequireAuthenticatedState allowedStates={["ACTIV"]}>
            <QuizPage />
          </RequireAuthenticatedState>
        }
      />
      <Route
        path="/flashcards"
        element={
          <RequireAuthenticatedState allowedStates={["ACTIV"]}>
            <FlashcardsPage />
          </RequireAuthenticatedState>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuthenticatedState allowedStates={["ACTIV"]}>
            <ProfilePage />
          </RequireAuthenticatedState>
        }
      />
      <Route
        path="/discover-aky"
        element={
          <RequireAuthenticatedState allowedStates={["ACTIV"]}>
            <DiscoverAkyPage />
          </RequireAuthenticatedState>
        }
      />
      <Route
        path="/owl-hall"
        element={
          <RequireAuthenticatedState allowedStates={["ACTIV"]}>
            <OwlHall />
          </RequireAuthenticatedState>
        }
      />
      <Route path="/users" element={<LegacyUsersRedirect />} />
      <Route
        path="/admin/users"
        element={
          <RequireAdmin>
            <AdminUsersPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/audit-log"
        element={
          <RequireAdmin>
            <AdminAuditLogPage />
          </RequireAdmin>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
