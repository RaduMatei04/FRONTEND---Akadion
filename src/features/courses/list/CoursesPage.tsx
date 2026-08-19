import { useQuery } from "@tanstack/react-query"
import { AlertCircle, ExternalLink, Feather } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import AppShell from "@/app/layout/AppShell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getApiErrorMessage } from "@/api/error-helpers"
import { isAdminUser } from "@/auth/user.utils"
import { AdminCourseList, EmptyCoursesState } from "@/features/courses/components/CourseCard"
import { useAuth } from "@/auth/useAuth"
import { listAdminCourses } from "@/features/courses/api/courses"

import type { ApiError } from "@/types/api"
import type { Course } from "@/types/course"

const ragHeroOwl = "/img1.png"

const SECRET_LINKS = [
  { label: "secret 1", title: "Camera Mopsului Rugător", description: "O pagină experimentală rămasă ascunsă în Akadion.", href: "https://puginarug.com/" },
  { label: "secret 2", title: "Laboratorul Pisicii-Gogoașă", description: "Un experiment vizual neobișnuit, păstrat în afara traseelor obișnuite.", href: "https://doughnutkitten.com/" },
  { label: "secret 3", title: "Coridorul Câinelui Infinit", description: "Un exercițiu de interacțiune construit în jurul unei idei aparent fără sfârșit.", href: "https://longdogechallenge.com/" },
  { label: "secret 4", title: "Turnul QR-ului Plutitor", description: "O secțiune ascunsă construită în jurul unui experiment vizual și interactiv.", href: "https://floatingqrcode.com/" },
  { label: "secret 5", title: "Dojo-ul Ninja Invizibil", description: "Un experiment minimalist care pune accent pe reacție și mișcare controlată.", href: "https://imaninja.com/" },
  { label: "secret 6", title: "Atelierul Cursorului Fermecat", description: "O pagină secundară dedicată efectelor vizuale aplicate interacțiunii de bază.", href: "https://cursoreffects.com/" },
  { label: "secret 7", title: "Terminalul Hackerului Dramatic", description: "O interfață ascunsă care simulează ritmul și tensiunea unui terminal spectaculos.", href: "https://hackertyper.com/" },
  { label: "secret 8", title: "Galeria Haosului Pollock", description: "O secțiune experimentală în care mișcarea utilizatorului generează compoziții vizuale abstracte.", href: "https://jacksonpollock.org/" },
  { label: "secret 9", title: "Tunelul Viermișorului Dansator", description: "Un experiment de mișcare continuă construit pentru a explora percepția și ritmul vizual.", href: "https://wigglyme.com/" },
  { label: "secret 10", title: "Labirintul Memoriei Ușoare", description: "O pagină ascunsă bazată pe orientare, memorie vizuală și decizii rapide.", href: "https://memory.toys/maze/easy/" },
  { label: "secret 11", title: "Marele Muzeu al Nimicului", description: "Un experiment de contrast și absență, construit în jurul ideii de spațiu gol.", href: "https://greatbignothing.com/" },
  { label: "secret 12", title: "Cutia Muzicală Nebună", description: "O secțiune ascunsă care explorează relația dintre sunet, ritm și reacția utilizatorului.", href: "https://musical.toys/" },
  { label: "secret 13", title: "Tapiseria Infinită ZoomQuilt", description: "Un experiment vizual continuu, bazat pe profunzime și tranziție fără întrerupere.", href: "https://zoomquilt.org/" },
  { label: "secret 14", title: "Arena Dezbaterilor Coapte", description: "O pagină specială centrată pe idei, poziționări și expresie argumentativă.", href: "https://www.ripefordebate.com/" },
  { label: "secret 15", title: "Atelierul Emoji-urilor Rebelate", description: "Un experiment de expresivitate vizuală construit în afara zonelor principale ale platformei.", href: "https://remoji.com/" },
]

const SECRET_LINKS_PER_PAGE = 3
const ADMIN_COURSES_QUERY_KEY = ["courses", "admin"] as const

function CoursesEasterEggPage() {
  const [secretLinksPage, setSecretLinksPage] = useState(1)
  const secretLinksTotalPages = Math.ceil(SECRET_LINKS.length / SECRET_LINKS_PER_PAGE)
  const secretLinksPageStart = (secretLinksPage - 1) * SECRET_LINKS_PER_PAGE
  const visibleSecretLinks = SECRET_LINKS.slice(secretLinksPageStart, secretLinksPageStart + SECRET_LINKS_PER_PAGE)

  return (
    <AppShell
      title="Ai găsit camera secretă Akadion"
      description="O colecție de pagini ascunse, experimente și detalii rare din universul Akadion."
      eyebrow="Easter egg"
      heroClassName="relative min-h-[15rem] overflow-hidden border-0 bg-linear-to-br from-[#4A5681] via-[#5869bd] to-[#8ca1bd] text-white shadow-[0_28px_80px_rgba(67,79,159,0.28)] lg:items-center before:absolute before:-top-20 before:right-[-4rem] before:h-72 before:w-72 before:rounded-full before:bg-white/14 before:content-[''] after:absolute after:-bottom-24 after:left-[-5rem] after:h-72 after:w-72 after:rounded-full after:bg-white/10 after:content-['']"
      heroEyebrowClassName="text-white/72"
      heroTitleClassName="text-white"
      heroDescriptionClassName="text-white/84"
     heroVisual={<div className="relative h-full w-full"><img src={ragHeroOwl} alt="Bufniță Akadion RAG" className="absolute left-[88%] top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 object-contain drop-shadow-[0_24px_38px_rgba(15,23,42,0.24)] lg:h-60 lg:w-60" /></div>}
      heroVisualClassName="top-0 right-auto bottom-auto left-0 h-full w-full items-center justify-center"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] border border-[#e7d9c8] bg-[#fffdfa]/88 p-5 shadow-[0_24px_70px_rgba(32,46,84,0.08)] sm:p-7">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.25fr)] lg:items-stretch">
          <section className="flex h-full min-h-56 flex-col gap-12 rounded-[2rem] border border-[#eadfd4] bg-white/76 p-5 shadow-[0_16px_44px_rgba(32,46,84,0.07)]">
            <h2 className="text-3xl font-semibold tracking-tight text-[#24385b] sm:text-4xl">Ai găsit easter egg-ul aplicației.</h2>
            <p className="text-base leading-7 text-slate-600">Unele pagini Akadion nu fac parte din traseele obișnuite. Aici sunt reunite experimentele și secțiunile ascunse ale platformei.</p>
          </section>

          <section className="space-y-5">
            <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleSecretLinks.map((link) => (
                <a key={link.label} href={link.href} className="group relative flex h-full min-h-56 flex-col overflow-hidden rounded-[1.8rem] border border-[#e7d9c8] bg-white p-5 shadow-[0_18px_52px_rgba(32,46,84,0.08)] transition hover:-translate-y-1 hover:border-[#c8cdf0] hover:shadow-[0_24px_64px_rgba(67,79,159,0.14)]">
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <span className="rounded-full border border-[#d9ccbe] bg-[#fbf7f1] px-3 py-1 text-[0.68rem] font-bold tracking-[0.16em] text-[#7a6b5a] uppercase">{link.label}</span>
                  </div>

                  <div className="relative z-10 flex-1 pt-8">
                    <h3 className="text-xl font-semibold tracking-tight text-[#24385b]">{link.title}</h3>
                  </div>

                  <span className="relative z-10 mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#3f698a] transition group-hover:text-[#24385b]">
                    Explorează
                    <ExternalLink className="h-4 w-4" />
                  </span>
                </a>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              {Array.from({ length: secretLinksTotalPages }, (_, index) => {
                const pageNumber = index + 1
                const isCurrentPage = pageNumber === secretLinksPage

                 return (
                   <button key={pageNumber} type="button" onClick={() => setSecretLinksPage(pageNumber)} className={`flex h-11 min-w-11 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition ${isCurrentPage ? "border-[#4A5681] bg-[#4A5681] text-white shadow-[0_10px_26px_rgba(74,86,129,0.22)]" : "border-[#d8ccbf] bg-white text-[#24385b] hover:bg-[#f7efe6]"}`} aria-current={isCurrentPage ? "page" : undefined}>
                     {pageNumber}
                   </button>
                 )
               })}
             </div>
           </section>
         </div>
       </div>

      <Card className="mt-8 overflow-hidden rounded-[2.25rem] border-[#b8c7df] bg-linear-to-br from-[#4A5681] via-[#5869bd] to-[#8ca1bd] text-white shadow-[0_28px_80px_rgba(67,79,159,0.26)]">
        <CardContent className="flex flex-col gap-5 px-6 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/24 bg-white/12 px-3 py-1 text-xs font-bold tracking-[0.16em] text-white/78 uppercase"><Feather className="h-3.5 w-3.5" />Galerie legendară</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Galeria Bufnițelor Legendare</h2>
            <p className="mt-3 text-sm leading-7 text-white/82 sm:text-base">Descoperă avatarurile speciale și poveștile asociate universului Akadion.</p>
          </div>
          <Button asChild variant="outline" className="w-fit rounded-2xl border-white/28 bg-white px-5 py-2.5 text-sm font-semibold text-[#24385b] shadow-[0_14px_34px_rgba(8,18,38,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] hover:bg-white/90 hover:text-[#24385b] hover:shadow-[0_20px_42px_rgba(8,18,38,0.24)] active:scale-[0.98]">
            <Link to="/owl-hall">Deschide galeria</Link>
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  )
}

export default function CoursesPage() {
  const { user, refreshAuth } = useAuth()
  const isAdmin = isAdminUser(user)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const ADMIN_COURSES_PER_PAGE = 6

  const {
    data: courses = [],
    isLoading: loading,
    error: queryError,
  } = useQuery<Course[]>({
    queryKey: ADMIN_COURSES_QUERY_KEY,
    queryFn: listAdminCourses,
    enabled: isAdmin,
  })

  useEffect(() => {
    if (!queryError) {
      setError("")
      return
    }

    const typedError = queryError as ApiError
    if (typedError.response?.status === 401) {
      void refreshAuth()
    }

    setError(getApiErrorMessage(queryError, "Nu am putut încărca cursurile."))
  }, [queryError, refreshAuth])

  const totalPages = Math.max(1, Math.ceil(courses.length / ADMIN_COURSES_PER_PAGE))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pageStart = (currentPage - 1) * ADMIN_COURSES_PER_PAGE
  const paginatedCourses = courses.slice(pageStart, pageStart + ADMIN_COURSES_PER_PAGE)

  const heroClassName = isAdmin
    ? "relative min-h-[11rem] overflow-hidden border-0 bg-linear-to-r from-[#434f9f] via-[#5869bd] to-[#7c89dc] text-white shadow-[0_24px_60px_rgba(67,79,159,0.26)] lg:items-start before:absolute before:-top-12 before:right-[-3.5rem] before:h-56 before:w-56 before:rounded-full before:bg-white/14 before:content-[''] after:absolute after:-bottom-20 after:left-[-4.5rem] after:h-64 after:w-64 after:rounded-full after:bg-white/10 after:content-['']"
    : "relative min-h-[11rem] overflow-hidden border-0 bg-linear-to-r from-[#0f9fbd] via-[#17b7d3] to-[#56d5ea] text-white shadow-[0_24px_60px_rgba(23,133,161,0.24)] lg:items-start before:absolute before:-top-12 before:right-[-3.5rem] before:h-56 before:w-56 before:rounded-full before:bg-white/16 before:content-[''] after:absolute after:-bottom-20 after:left-[-4.5rem] after:h-64 after:w-64 after:rounded-full after:bg-white/10 after:content-['']"

  if (!isAdmin) {
    return <CoursesEasterEggPage />
  }

  return (
    <AppShell
      title="Cursuri Akadion"
      description="Toate cursurile create de profesori în platformă."
      eyebrow="Cursuri"
      heroClassName={heroClassName}
      heroEyebrowClassName="text-white/72"
      heroTitleClassName="text-white"
      heroDescriptionClassName="text-white/84"
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold tracking-tight text-[#24385b]">Toate cursurile</h2>
        </div>

        {error ? (
          <Alert variant="destructive" className="rounded-3xl border-rose-200 bg-white/90 px-5 py-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Eroare la încărcare</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {loading ? <p className="text-sm text-slate-500">Se încarcă lista de cursuri...</p> : null}

        {!loading && isAdmin && courses.length > 0 ? (
          <AdminCourseList courses={paginatedCourses} currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        ) : null}

        {!loading && isAdmin && courses.length === 0 ? (
          <EmptyCoursesState message="Nu există încă niciun curs creat de profesori." />
        ) : null}
      </div>
    </AppShell>
  )
}
