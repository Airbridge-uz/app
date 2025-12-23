import { SignUp } from "@/features/auth/sign-up"
import { Button } from "@/shared/ui/button"
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import { Separator } from "@/shared/ui/separator"
import { ModeToggle } from "@/widgets/theme-toggle"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/signup")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <CardHeader className="flex flex-row justify-between gap-6 items-center">
        <CardTitle className="text-2xl text-center font-bold">
          Sign in to SkySearch
        </CardTitle>
        <ModeToggle />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SignUp />
          <p className="text-muted-foreground text-center">
            Already have an account?{" "}
            <Link
              to="/auth/login"
              className="text-card-foreground hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex-col space-y-4">
        <div className="flex items-center gap-4">
          <Separator className="flex-1" />
          <p>or</p>
          <Separator className="flex-1" />
        </div>

        <Button variant="secondary" className="w-full">
          Sign in with google
        </Button>
      </CardFooter>
    </>
  )
}
