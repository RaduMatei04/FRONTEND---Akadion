import { BookOpenCheck, BookOpenText, Bot, BrainCircuit, Files, MessageSquareText, Puzzle, Wand2 } from "lucide-react"
import AppShell from "@/app/layout/AppShell"
import { isAdminUser, isProfessorUser } from "@/auth/user.utils"
import { useAuth } from "@/auth/useAuth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const akyRagLogo = "/assets/logo_RAG-removebg-preview.png"

type DiscoverRole = "student" | "professor" | "admin"

interface DiscoverItem {
  icon: typeof MessageSquareText
  title: string
  description: string
  accent?: boolean
}

interface DiscoverContent {
  heroDescription: string
  aboutDescription: string
  capabilityDescription: string
  aboutItems: DiscoverItem[]
  capabilityItems: DiscoverItem[]
}

const DISCOVER_AKY_CONTENT: Record<DiscoverRole, DiscoverContent> = {
  student: {
    heroDescription: "Aky este asistentul AI al Akadion, creat pentru a te ajuta să înțelegi, organizezi și recapitulezi mai eficient materialele academice.",
    aboutDescription: "Aky este asistentul AI integrat în Akadion. Poate utiliza materialele academice disponibile pentru a oferi explicații, clarificări și suport pentru recapitulare.",
    capabilityDescription: "Funcționalități construite pentru a face studiul mai clar, mai rapid și mai bine organizat.",
    aboutItems: [
      {
        icon: MessageSquareText,
        title: "Răspunsuri contextualizate",
        description: "Folosește informația relevantă din materialele disponibile.",
      },
      {
        icon: BookOpenText,
        title: "Claritate în învățare",
        description: "Transformă informațiile complexe în explicații mai ușor de urmărit.",
      },
      {
        icon: BrainCircuit,
        title: "Bazat pe materialele tale",
        description: "Folosește sursele academice disponibile pentru răspunsuri relevante și contextualizate.",
        accent: true,
      },
    ],
    capabilityItems: [
      {
        icon: MessageSquareText,
        title: "Clarifică",
        description: "Explică rapid concepte și idei dificile.",
      },
      {
        icon: Files,
        title: "Rezumă",
        description: "Extrage informația esențială din materialele disponibile.",
      },
      {
        icon: Wand2,
        title: "Generează",
        description: "Transformă conținutul în întrebări, quiz-uri și flashcards.",
      },
      {
        icon: BookOpenCheck,
        title: "Recapitulează",
        description: "Te ajută să revii rapid asupra ideilor importante înainte de curs sau examen.",
      },
    ],
  },
  professor: {
    heroDescription: "Aky este asistentul AI al Akadion, creat pentru a te ajuta să consulți, clarifici și rezumi mai eficient materialele cursurilor tale.",
    aboutDescription: "Aky este asistentul AI integrat în Akadion. Poate utiliza materialele cursurilor disponibile pentru a oferi explicații, clarificări și suport contextual.",
    capabilityDescription: "Funcționalități construite pentru a face consultarea materialelor mai clară, mai rapidă și mai bine organizată.",
    aboutItems: [
      {
        icon: MessageSquareText,
        title: "Răspunsuri contextualizate",
        description: "Folosește informația relevantă din materialele cursurilor disponibile.",
      },
      {
        icon: BookOpenText,
        title: "Claritate în conținut",
        description: "Transformă informațiile complexe în explicații mai clare și mai ușor de urmărit.",
      },
      {
        icon: BrainCircuit,
        title: "Bazat pe materialele cursului",
        description: "Folosește documentele academice disponibile pentru răspunsuri relevante și contextualizate.",
        accent: true,
      },
    ],
    capabilityItems: [
      {
        icon: MessageSquareText,
        title: "Clarifică",
        description: "Explică rapid concepte și informații din materialele cursului.",
      },
      {
        icon: Files,
        title: "Rezumă",
        description: "Extrage ideile principale din documentele disponibile.",
      },
      {
        icon: Bot,
        title: "Consultă materialele",
        description: "Te ajută să găsești rapid informații relevante în conținutul cursurilor.",
      },
      {
        icon: BookOpenCheck,
        title: "Structurează informația",
        description: "Organizează ideile și informațiile într-o formă mai clară și ușor de urmărit.",
      },
    ],
  },
  admin: {
    heroDescription: "Aky este asistentul AI integrat în Akadion, conceput pentru a sprijini interacțiunea utilizatorilor cu materialele academice ale platformei.",
    aboutDescription: "Aky este o funcționalitate integrată în Akadion, construită pentru a oferi suport contextual bazat pe conținutul academic disponibil în platformă.",
    capabilityDescription: "Funcționalități prezentate din perspectiva rolului său în experiența academică integrată a platformei.",
    aboutItems: [
      {
        icon: Bot,
        title: "Asistent AI integrat",
        description: "Face parte din experiența Akadion și oferă suport contextual bazat pe conținut academic.",
      },
      {
        icon: BookOpenText,
        title: "Context academic",
        description: "Folosește informațiile disponibile în platformă pentru a oferi răspunsuri relevante.",
      },
      {
        icon: BrainCircuit,
        title: "Integrat în Akadion",
        description: "Funcționează împreună cu materialele și funcționalitățile academice ale platformei.",
        accent: true,
      },
    ],
    capabilityItems: [
      {
        icon: MessageSquareText,
        title: "Suport pentru utilizatori",
        description: "Ajută studenții și profesorii să interacționeze mai eficient cu materialele academice.",
      },
      {
        icon: Files,
        title: "Răspunsuri contextualizate",
        description: "Oferă informații bazate pe conținutul disponibil în platformă.",
      },
      {
        icon: BookOpenCheck,
        title: "Acces la informație",
        description: "Facilitează găsirea și înțelegerea informațiilor relevante.",
      },
      {
        icon: Puzzle,
        title: "Experiență integrată",
        description: "Completează funcționalitățile Akadion prin suport AI contextual.",
      },
    ],
  },
}

export default function DiscoverAkyPage() {
  const { user } = useAuth()
  const contentRole: DiscoverRole = isAdminUser(user) ? "admin" : isProfessorUser(user) ? "professor" : "student"
  const content = DISCOVER_AKY_CONTENT[contentRole]

  return (
    <AppShell
      title="Descoperă Aky"
      description={content.heroDescription}
      eyebrow="Asistent AI"
      heroClassName="relative min-h-[11rem] overflow-hidden border-0 bg-linear-to-r from-[#434f9f] via-[#5869bd] to-[#7c89dc] text-white shadow-[0_24px_60px_rgba(67,79,159,0.26)] lg:items-center before:absolute before:-top-12 before:right-[-3.5rem] before:h-56 before:w-56 before:rounded-full before:bg-white/14 before:content-[''] after:absolute after:-bottom-20 after:left-[-4.5rem] after:h-64 after:w-64 after:rounded-full after:bg-white/10 after:content-['']"
      heroEyebrowClassName="text-white/72"
      heroTitleClassName="text-white"
      heroDescriptionClassName="text-white/84 max-w-2xl"
      heroVisual={
        <div className="flex h-32 w-32 items-center justify-center rounded-[24px] border border-white/35 bg-[rgba(255,255,255,0.75)] p-4 shadow-[0_8px_18px_rgba(15,23,42,0.08)] sm:h-36 sm:w-36 sm:p-5">
          <img src={akyRagLogo} alt="Aky AI" className="h-full w-full object-contain" />
        </div>
      }
      heroVisualClassName="right-2 top-1/2 h-auto w-auto -translate-y-1/2 items-center justify-center lg:right-6"
    >
      <section className="grid gap-5 xl:grid-cols-2 xl:items-stretch">
        <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white shadow-[0_18px_48px_rgba(32,46,84,0.08)] xl:h-full">
          <CardHeader className="px-6 pb-3 pt-6">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <Bot className="h-5 w-5 text-[#24385b]" />
              Ce este Aky?
            </CardTitle>
            <CardDescription className="text-sm leading-7 text-slate-600">
              {content.aboutDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex h-full flex-col gap-3 px-6 pb-6 pt-1">
            {content.aboutItems.map(({ icon: Icon, title, description, accent }) => (
              <div key={title} className={`flex items-start gap-3 rounded-[1.2rem] border px-4 py-3 ${accent ? "border-[#d8dcef] bg-[#eef1fb]" : "border-[#e4d8cd] bg-[#fcf8f3]"}`}>
                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${accent ? "bg-white text-[#4A5681]" : "bg-[#eef1fb] text-[#24385b]"}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[1.75rem] border-[#e4d8cd] bg-white shadow-[0_18px_48px_rgba(32,46,84,0.08)] xl:h-full">
          <CardHeader className="px-6 pb-3 pt-6">
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <Puzzle className="h-5 w-5 text-[#24385b]" />
              Cum te ajută
            </CardTitle>
            <CardDescription className="text-sm leading-7 text-slate-600">
              {content.capabilityDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 px-6 pb-6 pt-1 sm:grid-cols-2">
            {content.capabilityItems.map(({ icon: Icon, title, description }) => (
              <div key={title} className="rounded-[1.2rem] border border-[#e4d8cd] bg-[#fcf8f3] px-4 py-4 shadow-[0_8px_24px_rgba(32,46,84,0.04)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef1fb] text-[#24385b]">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  )
}
