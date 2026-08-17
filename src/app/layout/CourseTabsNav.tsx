import { BookOpenText, ChevronDown, FileText, History, Home, Sparkles, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { useMyCoursesQuery } from "@/features/courses/hooks/useMyCoursesQuery"
import { isAdminUser, isStudentUser } from "@/auth/user.utils"
import { cn } from "@/lib/utils"

interface CourseTabsNavProps {
  onNavClick?: () => void
}

export default function CourseTabsNav({ onNavClick }: CourseTabsNavProps) {
  const { user } = useAuth()
  const { data: courses = [] } = useMyCoursesQuery()
  const [coursesOpen, setCoursesOpen] = useState(false)
  const coursesMenuRef = useRef<HTMLDivElement | null>(null)
  const location = useLocation()
  const isAdmin = isAdminUser(user)
  const isStudent = isStudentUser(user)

  useEffect(() => {
    if (!coursesOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node)) {
        return
      }

      if (!coursesMenuRef.current?.contains(event.target)) {
        setCoursesOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCoursesOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [coursesOpen])

  const hasCoursesDropdown = !isAdmin && courses.length > 0
  const activeCourseSelected = hasCoursesDropdown && courses.some((course) => location.pathname === `/courses/${course.id}`)
  const showHomeLink = isAdmin || location.pathname !== "/"
  const activeNavClass = "scale-[1.02] border-[#c8cdf0] bg-white text-[#24385b] shadow-[0_10px_28px_rgba(67,79,159,0.18)] ring-2 ring-[#5869bd]/18"
  const inactiveNavClass = "border-[#e7d9c8] bg-white/80 text-slate-700 hover:bg-[#f4eadf]"

  function handleCourseClick() {
    setCoursesOpen(false)
    onNavClick?.()
  }

  return (
    <div className="flex min-w-0 max-w-full items-center gap-1.5 lg:max-w-xl xl:max-w-2xl">
      <div className="flex min-w-0 items-center gap-1.5 py-1 px-0.5">
        {showHomeLink ? (
          <NavLink to="/" end onClick={onNavClick} className={({ isActive }) => `inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? activeNavClass : inactiveNavClass}`}>
            <Home className="h-4 w-4" />
            <span>Acasă</span>
          </NavLink>
        ) : null}

        {isAdmin && (
          <>
            <NavLink to="/admin/users" onClick={onNavClick} className={({ isActive }) => `inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? activeNavClass : inactiveNavClass}`}>
              <Users className="h-4 w-4" />
              <span>Utilizatori</span>
            </NavLink>
            <NavLink to="/courses" onClick={onNavClick} className={({ isActive }) => `inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? activeNavClass : inactiveNavClass}`}>
              <BookOpenText className="h-4 w-4" />
              <span>Cursuri</span>
            </NavLink>
            <NavLink to="/admin/audit-log" onClick={onNavClick} className={({ isActive }) => `inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? activeNavClass : inactiveNavClass}`}>
              <History className="h-4 w-4" />
              <span>Istoric modificări</span>
            </NavLink>
          </>
        )}

        {hasCoursesDropdown ? (
          <div ref={coursesMenuRef} className="relative shrink-0">
            <button type="button" onClick={() => setCoursesOpen((open) => !open)} className={cn("inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-sm font-semibold transition", activeCourseSelected || coursesOpen ? "border-[#d9ccbe] bg-white text-slate-900 shadow-sm" : "border-[#e7d9c8] bg-white/80 text-slate-700 hover:bg-[#f4eadf]")} aria-expanded={coursesOpen}>
              <BookOpenText className="h-4 w-4" />
              <span>Cursuri</span>
              <ChevronDown className={cn("h-4 w-4 transition", coursesOpen && "rotate-180")} />
            </button>

            {coursesOpen ? (
              <div className="absolute left-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-3xl border border-[#e4d8cd] bg-white p-2 shadow-[0_20px_50px_rgba(32,46,84,0.16)]">
                <div className="max-h-80 overflow-y-auto pr-1">
                  {courses.map((course) => (
                    <NavLink key={course.id} to={`/courses/${course.id}`} state={{ course }} onClick={handleCourseClick} className={({ isActive }) => cn("flex min-w-0 items-center gap-2 rounded-2xl px-3 py-2.5 text-sm font-semibold transition", isActive ? "bg-[#eef1fb] text-[#24385b]" : "text-slate-700 hover:bg-[#f7efe6] hover:text-[#24385b]")}>
                      <BookOpenText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{course.denumire}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {isStudent ? (
          <>
            <NavLink to="/quiz" onClick={onNavClick} className={({ isActive }) => `inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? activeNavClass : inactiveNavClass}`}>
              <Sparkles className="h-4 w-4" />
              <span>Quiz</span>
            </NavLink>
            <NavLink to="/flashcards" onClick={onNavClick} className={({ isActive }) => `inline-flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-semibold transition ${isActive ? activeNavClass : inactiveNavClass}`}>
              <FileText className="h-4 w-4" />
              <span>Flashcards</span>
            </NavLink>
          </>
        ) : null}
      </div>
    </div>
  )
}
