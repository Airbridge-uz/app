import { SignIn } from "@/features/auth/sign-in"
import { Button } from "@/shared/ui/button"
import { CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { ModeToggle } from "@/widgets/theme-toggle"
import { Separator } from "@base-ui/react"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/login")({
  component: () => (
    <>
      <CardHeader className="flex flex-row justify-between gap-6 items-center">
        <CardTitle className="text-2xl text-center font-bold">
          Sign in to SkySearch
        </CardTitle>
        <ModeToggle />
      </CardHeader>
      <CardContent>
        {/* Login Form */}
        <div className="space-y-4">
          <SignIn />

          <p className="text-muted-foreground text-center">
            New on our platform?{" "}
            <Link
              to="/auth/signup"
              className="text-card-foreground hover:underline"
            >
              Create an account
            </Link>
          </p>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <p>or</p>
            <Separator className="flex-1" />
          </div>

          <Button variant="secondary" className="w-full">
            Sign in with google
          </Button>
        </div>
      </CardContent>
    </>
  ),
})
