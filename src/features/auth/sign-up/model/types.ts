import type { UserDto } from "@/shared/types/user"
import type z from "zod"
import type { signUpPayloadSchema } from "./schema"

export type SignUpPayload = z.infer<typeof signUpPayloadSchema>
export type SignUpResult = UserDto
