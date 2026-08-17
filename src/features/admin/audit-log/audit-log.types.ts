export interface AuditLogEntry {
  id: string | number
  operatie?: string
  numeTabel?: string
  idInregistrare?: string | number
  numeUtilizator?: string
  emailUtilizator?: string
  creatLa?: string
  valoriVechi?: Record<string, unknown> | null
  valoriNoi?: Record<string, unknown> | null
}
