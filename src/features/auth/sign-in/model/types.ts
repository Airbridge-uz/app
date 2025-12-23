import type z from "zod"
import type { signInPayloadSchema } from "./schema"

export type SignInPayload = z.infer<typeof signInPayloadSchema>
export type SignInResult = {
  access_token: string
  token_type: "Bearer"
}
