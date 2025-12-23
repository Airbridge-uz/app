import { passwordSchema } from "@/shared/schema/password"
import z from "zod"

export const signInPayloadSchema = z.object({
  email: z.string(),
  password: passwordSchema,
})
