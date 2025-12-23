import z from "zod"

export const signUpPayloadSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  full_name: z.string().optional(),
  phone: z.string().optional(),
  preferred_currency: z.string().optional(),
  preferred_language: z.string().optional(),
})
