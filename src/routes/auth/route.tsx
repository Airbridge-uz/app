import { getSessionToken } from "@/shared/lib/auth"
import { Card } from "@/shared/ui/card"
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/auth")({
  async beforeLoad() {
    const result = await getSessionToken()
    if (result.success)
      throw redirect({
        to: "/dashboard",
      })
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <section className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <Card className="z-1 w-full border-none shadow-md sm:max-w-lg">
        <Outlet />
      </Card>
    </section>
  )
}
