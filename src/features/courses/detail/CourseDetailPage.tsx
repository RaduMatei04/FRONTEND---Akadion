import { AlertCircle, CheckCircle2, Loader2, Menu, Trash2 } from "lucide-react"
import AppShell from "@/app/layout/AppShell"
import AkyChatWidget from "@/features/aky-chat/AkyChatWidget"
import CourseEditorCard from "@/features/courses/detail/components/CourseEditorCard"
import CourseIndexPanel from "@/features/courses/detail/components/CourseIndexPanel"
import ProfessorInfoCard from "@/features/courses/detail/components/ProfessorInfoCard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getInitials } from "@/auth/user.utils"
import { cn } from "@/lib/utils"
import { getProfessorName } from "@/features/courses/lib/courseView"
import CourseStudentsTab from "./students/CourseStudentsTab"
import CourseWeeksTab from "./weeks/CourseWeeksTab"

import CourseDetailTabs from "./components/CourseDetailTabs"
import { extractFilename, formatDisplayDate, formatDocumentsCount, getDocumentHref } from "./course-detail.utils"
import { useCourseDetailController } from "./hooks/useCourseDetailController"

export default function CourseDetailPage() {
  const {
    navigate,
    course,
    courseForm,
    fieldErrors,
    students,
    professorName,
    professorEmail,
    professorFaculty,
    weeks,
    documentsByWeek,
    weekUpdateFeedback,
    setWeekUpdateFeedback,
    uploadErrors,
    editingDocumentIds,
    setEditingDocumentIds,
    expandedWeekIds,
    indexExpandedWeekIds,
    pageError,
    pageNotice,
    pageLoading,
    activeAction,
    activeTab,
    setActiveTab,
    tabs,
    courseIndexOpen,
    setCourseIndexOpen,
    courseEditorOpen,
    setCourseEditorOpen,
    newWeekOpen,
    setNewWeekOpen,
    uploadFileInputRefs,
    documentFileInputRefs,
    theme,
    canEdit,
    isStudent,
    isAdmin,
    isProfessor,
    lastWeekNumber,
    courseInscris,
    clearCourseFieldError,
    handleSaveCourse,
    handleToggleActive,
    handleWithdrawCourse,
    handleToggleWeekCompletion,
    handleCreateWeek,
    handleUpdateWeek,
    handleDeleteWeek,
    handleUploadDocument,
    handleUpdateDocument,
    handleDeleteDocument,
    handleRetryDocument,
    toggleWeekExpanded,
    toggleIndexWeekExpanded,
    handleOpenCourseIndex,
    scrollToWeek,
  } = useCourseDetailController()

  return (
    <AppShell
      title={course?.denumire || "Detalii curs"}
      description={course ? course.descriere || `Începe la ${formatDisplayDate(course.dataInceput)}.` : "Se încarcă datele cursului."}
      eyebrow={isAdmin ? "Admin" : isStudent ? "Student" : "Profesor"}
      heroClassName={cn("relative overflow-hidden border", theme.heroBg, theme.heroBorder)}
      heroEyebrowClassName={cn("font-bold tracking-[0.22em]", theme.heroStatLabel)}
      heroTitleClassName="text-slate-900 font-bold tracking-tight"
      heroDescriptionClassName="text-slate-600"
      heroContent={course ? (
        <div className="mt-1">
          {/* Accent bar */}
          <div
            className="mb-5 h-1 w-12 rounded-full opacity-80"
            style={{ backgroundColor: theme.heroAccent }}
          />
          {/* Stat chips */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              !isStudent ? { label: "Status", value: course.activ ? "Activ" : "Inactiv", icon: course.activ ? "●" : "○" } : null,
              { label: "Perioadă", value: `${formatDisplayDate(course.dataInceput)} — ${formatDisplayDate(course.dataSfarsit)}`, small: true },
              { label: "Săptămâni", value: weeks.length },
              { label: "Profesor", value: getProfessorName(course), small: true },
            ].filter(Boolean).map(({ label, value, small, icon }) => (
              <div key={label} className={cn("rounded-2xl px-4 py-3", theme.heroStatBg)}>
                <p className={cn("text-[10px] font-bold tracking-[0.18em] uppercase", theme.heroStatLabel)}>{label}</p>
                <p className={cn("mt-1.5 font-semibold leading-tight", theme.heroStatText, small ? "text-sm" : "text-base")}>
                  {icon ? <span className="mr-1.5 text-xs opacity-70">{icon}</span> : null}{value}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      actions={isStudent && course?.inscris ? (
        <Button type="button" variant="outline" onClick={handleWithdrawCourse} disabled={Boolean(activeAction)} className="rounded-2xl border-rose-200 bg-white text-rose-700 hover:bg-rose-50 shadow-xs">
          <Trash2 className="h-4 w-4" />
          Retragere
        </Button>
      ) : canEdit && course ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleToggleActive}
          disabled={Boolean(activeAction)}
          className={cn(
            "rounded-2xl shadow-sm transition-all",
            course.activ
              ? "border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100"
              : "border-[#d9ccbe] bg-white text-slate-900 hover:border-[#bcae9e] hover:bg-[#f7efe6]",
          )}
        >
          {activeAction === "toggle-course" ? "Se actualizează..." : course.activ ? "Dezactivează" : "Reactivează"}
        </Button>
      ) : null}
      sideContent={!pageLoading && course && courseIndexOpen && !isProfessor ? (
        <CourseIndexPanel
          weeks={weeks}
          documentsByWeek={documentsByWeek}
          indexExpandedWeekIds={indexExpandedWeekIds}
          onClose={() => setCourseIndexOpen(false)}
          onToggleWeek={toggleIndexWeekExpanded}
          onScrollToWeek={scrollToWeek}
          theme={theme}
          formatDocumentsCount={formatDocumentsCount}
          getDocumentHref={getDocumentHref}
          extractFilename={extractFilename}
        />
      ) : null}
    >
      <div className="space-y-6">
        {!pageLoading && course ? (
          <>
            {!courseIndexOpen && !isProfessor ? (
              <button
                type="button"
                onClick={handleOpenCourseIndex}
                className={cn(
                  "group fixed left-0 top-28 z-20 flex h-14 w-14 items-center justify-center rounded-r-[1.75rem] border border-l-0 bg-white/95 text-slate-700 shadow-[12px_14px_34px_rgba(32,46,84,0.14)] transition hover:w-16 hover:bg-white hover:text-slate-950 focus-visible:w-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#24385b]/20",
                  theme.heroBorder,
                )}
                aria-label="Deschide cuprins curs"
              >
                <Menu className="h-5 w-5" />
                <span className="pointer-events-none absolute left-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  Deschide cuprins curs
                </span>
              </button>
            ) : null}
          </>
        ) : null}

        {pageError ? (
          <Alert variant="destructive" className="rounded-3xl border-rose-200 bg-white/90 px-5 py-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Eroare</AlertTitle>
            <AlertDescription>{pageError}</AlertDescription>
          </Alert>
        ) : null}

        {pageNotice ? (
          <Alert className="rounded-3xl border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            <AlertTitle>Actualizare reușită</AlertTitle>
            <AlertDescription className="text-emerald-800">{pageNotice}</AlertDescription>
          </Alert>
        ) : null}

        {pageLoading ? (
          <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
            <CardContent className="flex items-center gap-3 px-6 py-8 text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              Se încarcă fluxul cursului...
            </CardContent>
          </Card>
        ) : null}

        {!pageLoading && course ? (
          <>
            {canEdit ? (
              <CourseEditorCard
                course={course}
                courseEditorOpen={courseEditorOpen}
                setCourseEditorOpen={setCourseEditorOpen}
                courseForm={courseForm}
                fieldErrors={fieldErrors}
                activeAction={activeAction}
                theme={theme}
                clearFieldError={clearCourseFieldError}
                onSaveCourse={handleSaveCourse}
              />
            ) : null}

            <CourseDetailTabs tabs={tabs} activeTab={activeTab} theme={theme} onTabChange={setActiveTab} />

            {activeTab === "saptamani" ? (
              <CourseWeeksTab
                weeks={weeks}
                documentsByWeek={documentsByWeek}
                expandedWeekIds={expandedWeekIds}
                 canEdit={canEdit}
                 isStudent={isStudent}
                 isProfessor={isProfessor}
                 courseInscris={courseInscris}
                 activeAction={activeAction}
                theme={theme}
                lastWeekNumber={lastWeekNumber}
                newWeekOpen={newWeekOpen}
                setNewWeekOpen={setNewWeekOpen}
                onCreateWeek={handleCreateWeek}
                onToggleExpand={toggleWeekExpanded}
                onToggleCompletion={handleToggleWeekCompletion}
                onDeleteWeek={handleDeleteWeek}
                onUpdateWeek={handleUpdateWeek}
                onUploadDocument={handleUploadDocument}
                onUpdateDocument={handleUpdateDocument}
                onDeleteDocument={handleDeleteDocument}
                onRetryDocument={handleRetryDocument}
                weekUpdateFeedback={weekUpdateFeedback}
                setWeekUpdateFeedback={setWeekUpdateFeedback}
                uploadErrors={uploadErrors}
                editingDocumentIds={editingDocumentIds}
                setEditingDocumentIds={setEditingDocumentIds}
                uploadFileInputRefs={uploadFileInputRefs}
                documentFileInputRefs={documentFileInputRefs}
              />
            ) : null}

            {activeTab === "studenti" ? (
              <CourseStudentsTab students={students} theme={theme} />
            ) : null}

            {activeTab === "profesor" ? (
              <ProfessorInfoCard
                theme={theme}
                professorName={professorName}
                professorEmail={professorEmail}
                professorFaculty={professorFaculty}
                getInitials={getInitials}
                isStudent={isStudent}
              />
            ) : null}

            <AkyChatWidget
              courseId={course?.id}
              courseTitle={course?.titlu || course?.denumire}
              enabled={isStudent || isProfessor}
            />
          </>
        ) : null}

        {!pageLoading && !course ? (
          <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white/92 shadow-[0_18px_48px_rgba(32,46,84,0.08)]">
            <CardContent className="space-y-4 px-6 py-8 text-center text-slate-600">
              <p>Cursul cerut nu a putut fi găsit sau nu ai acces la el.</p>
              <Button type="button" onClick={() => navigate("/courses")} className={cn("rounded-2xl text-white", theme.btnPrimaryBg, theme.btnPrimaryHover)}>
                Înapoi la cursuri
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  )
}
