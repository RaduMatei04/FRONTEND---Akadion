import { z } from "zod"

export const newCourseSchema = z.object({
  denumire: z.string().trim().min(1, "Denumirea cursului este obligatorie."),
  descriere: z.string(),
  dataInceput: z.string().min(1, "Data de început este obligatorie."),
})

export const weekDescriptionSchema = z.object({
  descriere: z
    .string()
    .trim()
    .min(1, "Descrierea săptămânii este obligatorie.")
    .max(500, "Descrierea săptămânii poate avea maximum 500 de caractere."),
})

export const weekDocumentSchema = z
  .object({
    titlu: z.string().trim(),
    file: z.custom<File | null>((value) => value === null || value instanceof File),
  })
  .superRefine((values, context) => {
    if (!values.titlu && !values.file) {
      context.addIssue({
        code: "custom",
        path: ["titlu"],
        message: "Adaugă un titlu sau alege un fișier nou pentru document.",
      })
    }
  })

export const weekDocumentUploadSchema = z.object({
  titlu: z.string().trim().min(1, "Titlul documentului și fișierul sunt obligatorii pentru upload."),
  file: z.custom<File | null>((value) => value instanceof File, "Titlul documentului și fișierul sunt obligatorii pentru upload."),
})
