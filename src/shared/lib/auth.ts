import { useAppSession } from "@/shared/lib/session"
import { redirect } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { apiClient } from "../api/client"

// Get current user
export const getCurrentUserFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession()
    const userId = session.data.userId

    if (!userId) {
      return null
    }
    const response = await apiClient<{ id: number; email: string }>(
      "api/v1/auth/me",
    )
    const json = await response.json()

    return json
  },
)

export const logOut = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useAppSession()
  session.clear()
  throw redirect({
    to: "/auth/login",
  })
})

export const getSessionToken = createServerFn({ method: "GET" }).handler(
  async () => {
    const session = await useAppSession()
    if (session.data === undefined || session.data === null)
      return {
        success: false,
        error: {
          type: "SESSION_NOT_FOUND",
        },
      }
    if (typeof session.data?.accessToken !== "string")
      return {
        success: false,
        error: {
          type: "TOKEN_NOT_FOUND",
        },
      }

    return {
      success: true,
      data: session.data.accessToken,
    }
  },
)
