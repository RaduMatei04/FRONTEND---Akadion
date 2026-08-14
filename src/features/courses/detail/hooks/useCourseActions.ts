import { getCourseFieldErrors, setProfessorCourseActive, updateProfessorCourse, withdrawStudentCourse } from "@/features/courses/api/courses"
import type { CourseForm } from "../course-detail.types"
import type { CourseDetailState } from "./useCourseDetailState"

export function useCourseActions(state: CourseDetailState) {
  const {
    course,
    courseId,
    navigate,
    runCourseRequest,
    setActiveAction,
    setCourse,
    setFieldErrors,
    setPageError,
    setPageNotice,
  } = state

  function clearCourseFieldError(field: keyof CourseForm) {
    setFieldErrors((current) => ({ ...current, [field]: "" }))
    setPageError("")
    setPageNotice("")
  }

  async function handleSaveCourse(values: CourseForm) {
    setActiveAction("save-course")

    try {
      const updatedCourse = await runCourseRequest(
        () => updateProfessorCourse(courseId, values),
        "Nu am putut actualiza cursul.",
      )
      setCourse((current) => ({ ...current, ...updatedCourse }))
      setPageNotice("Cursul a fost actualizat.")
    } catch (error: unknown) {
      setFieldErrors((current) => ({ ...current, ...getCourseFieldErrors(error) }))
    } finally {
      setActiveAction("")
    }
  }

  async function handleToggleActive() {
    const nextActive = !course?.activ
    setActiveAction("toggle-course")

    try {
      await runCourseRequest(
        () => setProfessorCourseActive(courseId, nextActive),
        nextActive ? "Nu am putut reactiva cursul." : "Nu am putut dezactiva cursul.",
      )
      setCourse((current) => ({ ...current, activ: nextActive }))
      setPageNotice(nextActive ? "Cursul a fost reactivat." : "Cursul a fost dezactivat.")
    } catch {
      // Error message is already mapped by runCourseRequest.
    } finally {
      setActiveAction("")
    }
  }

  async function handleWithdrawCourse() {
    if (!window.confirm("Confirmi retragerea din acest curs?")) {
      return
    }

    setActiveAction("withdraw-course")

    try {
      await runCourseRequest(
        () => withdrawStudentCourse(courseId),
        "Nu am putut finaliza retragerea din curs.",
      )
      navigate("/courses")
    } catch {
      // Error message is already mapped by runCourseRequest.
    } finally {
      setActiveAction("")
    }
  }

  return { clearCourseFieldError, handleSaveCourse, handleToggleActive, handleWithdrawCourse }
}
