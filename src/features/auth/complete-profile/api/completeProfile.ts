import apiClient from "@/api/client"

import type { CompleteProfileForm } from "@/features/auth/complete-profile/complete-profile.types"

export async function submitCompleteProfile(payload: CompleteProfileForm) {
  await apiClient.post("/api/auth/complete-profile", {
    nume: payload.nume.trim(),
    prenume: payload.prenume.trim(),
    facultate: payload.facultate.trim(),
    rolDorit: payload.rolDorit,
  })
}
