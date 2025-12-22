import { getSessionToken } from "@/shared/lib/auth"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/auth")({
  async beforeLoad() {
    const result = await getSessionToken()
    if (result.success)
      throw redirect({
        to: "/dashboard",
      })
  },
})
