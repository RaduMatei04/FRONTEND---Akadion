import { getThemeUserKey } from "@/lib/courseThemes"

import type { AuthUser } from "@/types/user"

const astronomerOwl = "/poze_galerie/astronomerowl.png"
const geniusOwl = "/poze_galerie/geniusowl.png"
const hackerOwl = "/poze_galerie/hackerowl.png"
const potionsOwl = "/poze_galerie/potionsowl.png"
const samuraiOwl = "/poze_galerie/samuraiowl.png"
const warriorOwl = "/poze_galerie/warriorowl.png"
const wizardOwl = "/poze_galerie/wizardowl.png"
const defaultStudentOwl = "/logo_dashboard_student.png"

export const DEFAULT_STUDENT_HOMEPAGE_OWL = "default"
const STUDENT_HOMEPAGE_OWL_STORAGE_PREFIX = "akadion:student-homepage-owl"
const OWL_HALL_DISCOVERED_STORAGE_PREFIX = "akadion:owl-hall-discovered"

export interface LegendaryOwl {
  id: string
  name: string
  role: string
  image: string
  description: string
  longDescription: string
  artifact: string
  aura: string
  glow: string
}

export const LEGENDARY_OWLS: LegendaryOwl[] = [
  {
    id: "wizard",
    name: "Vrăjitorul",
    role: "Organizarea resurselor",
    image: wizardOwl,
    description: "Specializat în organizarea și explorarea resurselor de studiu.",
    longDescription: "Vrăjitorul este asociat cu organizarea clară a resurselor și cu transformarea informației într-un traseu de studiu coerent. Reprezintă capacitatea de a pune ordine într-un volum mare de materiale, fără a pierde din vedere ce este important. Este potrivit pentru cei care învață mai bine atunci când au structură, repere clare și acces rapid la sursele potrivite. În context universitar, sugerează rigoare, planificare și un mod de lucru eficient.",
    artifact: "Resurse și structură",
    aura: "from-[#a2b8cf] via-[#4A5681] to-[#172554]",
    glow: "rgba(74, 86, 129, 0.42)",
  },
  {
    id: "warrior",
    name: "Cavalerul",
    role: "Disciplină și progres",
    image: warriorOwl,
    description: "Reprezintă disciplina, progresul constant și atingerea obiectivelor.",
    longDescription: "Cavalerul simbolizează disciplina și capacitatea de a rămâne consecvent chiar și atunci când ritmul de lucru devine solicitant. Este avatarul asociat cu progresul construit pas cu pas, prin obiective clare și efort susținut. Se potrivește celor care apreciază organizarea, seriozitatea și stabilitatea în procesul de învățare. Într-o platformă academică, transmite ideea de responsabilitate și continuitate.",
    artifact: "Obiective și consecvență",
    aura: "from-[#8c82b9] via-[#4A5681] to-[#0f172a]",
    glow: "rgba(74, 86, 129, 0.46)",
  },
  {
    id: "samurai",
    name: "Samuraiul",
    role: "Precizie și concentrare",
    image: samuraiOwl,
    description: "Axat pe precizie, concentrare și dezvoltarea continuă a competențelor.",
    longDescription: "Samuraiul pune accent pe precizie, concentrare și dezvoltarea atentă a competențelor. Reflectă un stil de lucru în care fiecare etapă este tratată cu atenție, iar progresul vine din exersare constantă și control bun al detaliilor. Este potrivit pentru cei care preferă claritatea, focusul și standardele ridicate în propriul parcurs academic. Sugerează disciplină intelectuală și învățare orientată spre performanță reală.",
    artifact: "Precizie și rigoare",
    aura: "from-[#95acc5] via-[#62559A] to-[#172554]",
    glow: "rgba(94, 90, 138, 0.46)",
  },
  {
    id: "potions",
    name: "Alchimistul",
    role: "Cunoaștere aplicată",
    image: potionsOwl,
    description: "Transformă informația și practica în cunoștințe aplicabile.",
    longDescription: "Alchimistul reprezintă legătura dintre teorie și practică, dintre informația acumulată și modul în care aceasta poate fi folosită concret. Este asociat cu studenții care caută sens aplicat în ceea ce învață și care valorifică exemple, exerciții și conexiuni între domenii. Sugerează adaptabilitate și capacitatea de a combina concepte diferite într-o înțelegere utilă. În mediul universitar, transmite ideea de învățare activă și relevantă.",
    artifact: "Aplicare și sinteză",
    aura: "from-[#8daac7] via-[#62559A] to-[#1e3a5f]",
    glow: "rgba(95, 128, 167, 0.42)",
  },
  {
    id: "hacker",
    name: "Hackerul",
    role: "Tehnologie și analiză",
    image: hackerOwl,
    description: "Orientat spre tehnologie, rezolvarea problemelor și gândirea analitică.",
    longDescription: "Hackerul este orientat spre tehnologie, logică și rezolvarea problemelor prin analiză clară. Reflectă un mod de gândire structurat, în care întrebările sunt descompuse în pași concreți și soluțiile sunt construite metodic. Este potrivit pentru cei care lucrează bine cu sisteme, reguli, modele și procese tehnice. Într-un cadru academic, exprimă rigoare analitică și deschidere spre inovație practică.",
    artifact: "Sisteme și logică",
    aura: "from-[#5caab7] via-[#4A5681] to-[#020617]",
    glow: "rgba(47, 135, 150, 0.38)",
  },
  {
    id: "genius",
    name: "Înțeleptul",
    role: "Experiență și claritate",
    image: geniusOwl,
    description: "Reprezintă experiența, înțelegerea aprofundată și claritatea în învățare.",
    longDescription: "Înțeleptul este simbolul experienței, al înțelegerii aprofundate și al clarității dobândite în timp. Reprezintă capacitatea de a distinge între informația esențială și detaliul secundar, oferind perspectivă și echilibru. Este avatarul potrivit pentru cei care caută sens, coerență și o înțelegere matură a subiectelor studiate. În spațiul universitar, sugerează reflecție, discernământ și profunzime intelectuală.",
    artifact: "Experiență și perspectivă",
    aura: "from-[#c5d6e4] via-[#718FAE] to-[#2b4b6b]",
    glow: "rgba(113, 143, 174, 0.4)",
  },
  {
    id: "astronomer",
    name: "Astronomul",
    role: "Viziune de ansamblu",
    image: astronomerOwl,
    description: "Explorează concepte complexe și urmărește imaginea de ansamblu.",
    longDescription: "Astronomul este asociat cu explorarea conceptelor complexe și cu abilitatea de a vedea imaginea de ansamblu. Reprezintă curiozitatea intelectuală orientată spre conexiuni mai ample, modele și relații între idei aparent separate. Este potrivit pentru cei care înțeleg mai bine atunci când pot integra detaliile într-o perspectivă largă și coerentă. Într-o platformă academică, exprimă gândire strategică, profunzime și deschidere spre descoperire.",
    artifact: "Analiză și perspectivă",
    aura: "from-[#8ea8c4] via-[#4A5681] to-[#111827]",
    glow: "rgba(74, 86, 129, 0.46)",
  },
]

const LEGENDARY_OWL_IDS = new Set(LEGENDARY_OWLS.map((owl) => owl.id))

export function getStudentHomepageOwlStorageKey(user: AuthUser | null | undefined) {
  return `${STUDENT_HOMEPAGE_OWL_STORAGE_PREFIX}:${getThemeUserKey(user)}`
}

export function getOwlHallDiscoveredStorageKey(user: AuthUser | null | undefined) {
  return `${OWL_HALL_DISCOVERED_STORAGE_PREFIX}:${getThemeUserKey(user)}`
}

export function getLegendaryOwlById(owlId: string | null | undefined): LegendaryOwl | null {
  return LEGENDARY_OWLS.find((owl) => owl.id === owlId) ?? null
}

export function getStudentHomepageOwlId(user: AuthUser | null | undefined) {
  try {
    const storedOwlId = window.localStorage.getItem(getStudentHomepageOwlStorageKey(user))
    return LEGENDARY_OWL_IDS.has(storedOwlId) ? storedOwlId : DEFAULT_STUDENT_HOMEPAGE_OWL
  } catch {
    return DEFAULT_STUDENT_HOMEPAGE_OWL
  }
}

export function setStudentHomepageOwlId(user: AuthUser | null | undefined, owlId: string | null | undefined) {
  try {
    const storageKey = getStudentHomepageOwlStorageKey(user)
    if (!owlId || owlId === DEFAULT_STUDENT_HOMEPAGE_OWL) {
      window.localStorage.removeItem(storageKey)
      return DEFAULT_STUDENT_HOMEPAGE_OWL
    }

    if (!LEGENDARY_OWL_IDS.has(owlId)) {
      return getStudentHomepageOwlId(user)
    }

    window.localStorage.setItem(storageKey, owlId)
    return owlId
  } catch {
    return owlId && LEGENDARY_OWL_IDS.has(owlId) ? owlId : DEFAULT_STUDENT_HOMEPAGE_OWL
  }
}

export function getStudentHomepageOwlImage(owlId: string | null | undefined) {
  return getLegendaryOwlById(owlId)?.image || defaultStudentOwl
}

export function getStudentHomepageOwlRole(owlId: string | null | undefined) {
  return getLegendaryOwlById(owlId)?.name || "Dashboard STUDENT"
}

export function hasDiscoveredOwlHall(user: AuthUser | null | undefined) {
  try {
    return window.localStorage.getItem(getOwlHallDiscoveredStorageKey(user)) === "true"
  } catch {
    return false
  }
}

export function markOwlHallDiscovered(user: AuthUser | null | undefined) {
  try {
    window.localStorage.setItem(getOwlHallDiscoveredStorageKey(user), "true")
    return true
  } catch {
    return false
  }
}
