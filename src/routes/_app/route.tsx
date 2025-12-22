import { getSessionToken } from "@/shared/lib/auth"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const result = await getSessionToken()
    if (result.success === false) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.href },
      })
    }
  },
})

function RouteComponent() {
  return <Outlet />
}
