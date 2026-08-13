import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatWeeks(count: unknown) {
  const n = Number(count) || 0
  return n === 1 ? "1 săptămână" : `${n} săptămâni`
}

export function formatStudents(count: unknown) {
  const n = Number(count) || 0
  return n === 1 ? "1 student" : `${n} studenți`
}
