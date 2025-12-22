import { signInWithCredentials } from "@/services/auth"
import { getCurrentUserFn } from "@/shared/lib/auth"
import { useAppSession } from "@/shared/lib/session"
import { createServerFn } from "@tanstack/react-start"
import { jwtDecode } from "jwt-decode"

export const signInFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const searchParams = new URLSearchParams()
    searchParams.set("username", data.email)
    searchParams.set("password", data.password)
    const result = await signInWithCredentials({
      email: data.email,
      password: data.password,
    })
    if (result.isErr())
      return {
        success: false,
        error: result.error,
      }

    // biome-ignore lint/correctness/useHookAtTopLevel: useAppSession is not a react hook, it is a server function
    const appSession = await useAppSession()
    const decodedToken = jwtDecode(result.value.access_token)
    await appSession.update({
      accessToken: result.value.access_token,
      userId: Number(decodedToken.sub),
    })
    const currentUser = await getCurrentUserFn()
    await appSession.update({
      email: currentUser?.email,
      userId: currentUser?.id,
      accessToken: result.value.access_token,
    })

    return {
      success: true,
      data: {
        ...result.value,
      },
    }
  })
