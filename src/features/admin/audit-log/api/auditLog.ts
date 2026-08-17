import apiClient from "@/api/client"

import type { AuditLogEntry } from "@/features/admin/audit-log/audit-log.types"

export async function listAuditLog(limit: string) {
  const response = await apiClient.get<{ content?: AuditLogEntry[] }>("/api/admin/audit-log", {
    params: { size: limit },
  })

  return response.data?.content || []
}
