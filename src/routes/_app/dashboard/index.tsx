import { logOut } from "@/shared/lib/auth"
import { Button } from "@/shared/ui/button"
import { Widget as UserMenuWidget } from "@/widgets/user-menu"
import { createFileRoute } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"

export const Route = createFileRoute("/_app/dashboard/")({
  component: RouteComponent,
})

function RouteComponent() {
  const logOutFn = useServerFn(logOut)
  return (
    <div>
      <UserMenuWidget />
      <Button variant="destructive" onClick={() => logOutFn()}>
        Log out
      </Button>
    </div>
  )
}
