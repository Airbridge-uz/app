import { SignIn } from "@/features/auth/sign-in"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { ModeToggle } from "@/widgets/theme-toggle"
import { Separator } from "@base-ui/react"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/auth/login")({
  component: () => (
    <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <Card className="z-1 w-full border-none shadow-md sm:max-w-lg">
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
              <a href="#" className="text-card-foreground hover:underline">
                Create an account
              </a>
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
      </Card>
    </div>
  ),
})
