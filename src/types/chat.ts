export interface Conversatie {
  id?: string | number
  titlu?: string
  nume?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface AkyMessage {
  id?: string | number
  intrebare?: string
  raspuns?: string
  continut?: string
  role?: string
  createdAt?: string
  [key: string]: unknown
}
