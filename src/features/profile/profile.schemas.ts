import { z } from "zod"

export const profileSchema = z.object({
  nume: z.string().trim().min(1, "Numele este obligatoriu."),
  prenume: z.string().trim().min(1, "Prenumele este obligatoriu."),
  facultate: z.string(),
})

export const emailSchema = z.object({
  email: z.string().trim().email("Introdu o adresă de email validă."),
})
