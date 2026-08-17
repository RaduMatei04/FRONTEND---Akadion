import { useQuery } from "@tanstack/react-query"

import { useAuth } from "@/auth/useAuth"
import { listProfessorCourses, listStudentCourses } from "@/features/courses/api/courses"
import { isAdminUser, isProfessorUser, isStudentUser } from "@/auth/user.utils"

export const MY_COURSES_QUERY_KEY = ["courses", "mine"] as const

export function useMyCoursesQuery(enabled = true) {
  const { user } = useAuth()
  const isAdmin = isAdminUser(user)
  const isProfessor = isProfessorUser(user)
  const isStudent = isStudentUser(user)
  const shouldFetch = enabled && !isAdmin && (isProfessor || isStudent)

  return useQuery({
    queryKey: [...MY_COURSES_QUERY_KEY, isProfessor ? "professor" : "student"],
    enabled: shouldFetch,
    queryFn: () => (isProfessor ? listProfessorCourses() : listStudentCourses()),
  })
}
