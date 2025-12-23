import { registerUser } from "@/services/auth"
import { createServerFn } from "@tanstack/react-start"
import { signUpPayloadSchema } from "../model/schema"

export const signUpFn = createServerFn({ method: "POST" })
  .inputValidator(signUpPayloadSchema)
  .handler(async ({ data }) => {
    const result = await registerUser(data)
    if (result.isErr()) return { success: false, error: result.error }

    return {
      success: true,
      data: {
        ...result.value,
      },
    }
  })
