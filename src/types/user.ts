export type UserRole = "ADMIN" | "PROFESOR" | "STUDENT" | string

export type AccountState = "ACTIV" | "INACTIV" | "PENDING" | "RESPINS" | "INCOMPLET" | string

export interface AuthUser {
  id?: string | number
  idKeycloak?: string
  mail?: string
  email?: string
  nume?: string
  prenume?: string
  facultate?: string
  rol?: UserRole | null
  rolDorit?: UserRole | null
  stare?: AccountState | null
  stareCont?: AccountState | null
  displayName?: string
  createdAt?: string
  nrRespingeriAnterioare?: number
  [key: string]: unknown
}
