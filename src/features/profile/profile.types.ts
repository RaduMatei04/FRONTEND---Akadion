import type { FormAsyncValidateOrFn, FormValidateOrFn, ReactFormExtendedApi } from "@tanstack/react-form"

import type { emailSchema, profileSchema } from "@/features/profile/profile.schemas"

export type ProfileFormValues = {
  nume: string
  prenume: string
  facultate: string
}

export type EmailFormValues = {
  email: string
}

export type PersonalInfoForm = ReactFormExtendedApi<
  ProfileFormValues,
  FormValidateOrFn<ProfileFormValues>,
  typeof profileSchema,
  FormAsyncValidateOrFn<ProfileFormValues>,
  FormValidateOrFn<ProfileFormValues>,
  FormAsyncValidateOrFn<ProfileFormValues>,
  FormValidateOrFn<ProfileFormValues>,
  FormAsyncValidateOrFn<ProfileFormValues>,
  FormValidateOrFn<ProfileFormValues>,
  FormAsyncValidateOrFn<ProfileFormValues>,
  FormAsyncValidateOrFn<ProfileFormValues>,
  unknown
>

export type EmailForm = ReactFormExtendedApi<
  EmailFormValues,
  FormValidateOrFn<EmailFormValues>,
  typeof emailSchema,
  FormAsyncValidateOrFn<EmailFormValues>,
  FormValidateOrFn<EmailFormValues>,
  FormAsyncValidateOrFn<EmailFormValues>,
  FormValidateOrFn<EmailFormValues>,
  FormAsyncValidateOrFn<EmailFormValues>,
  FormValidateOrFn<EmailFormValues>,
  FormAsyncValidateOrFn<EmailFormValues>,
  FormAsyncValidateOrFn<EmailFormValues>,
  unknown
>
