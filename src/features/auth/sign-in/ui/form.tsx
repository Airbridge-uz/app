import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { signInFn } from "../api/mutation"

export function SignInForm() {
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()
  const serverFn = useServerFn(signInFn)
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      const response = await serverFn({
        data: {
          email: value.email,
          password: value.password,
        },
      })
      if (response.success === false) {
        return toast.error("Failed to sign in!", {
          description: response.error.message,
          richColors: true,
          position: "top-right",
          dismissible: true,
        })
      }
      toast.success("Successfully signed in!", {
        richColors: true,
        position: "top-right",
        dismissible: true,
      })
      navigate({
        to: "/dashboard",
      })
    },
  })

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="email"
        children={(field) => (
          <div className="space-y-1">
            <Label htmlFor={field.name} className="leading-5">
              Email address
            </Label>
            <Input
              type="email"
              id={field.name}
              name={field.name}
              placeholder="Enter your email address"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
          </div>
        )}
      />
      <form.Field
        name="password"
        children={(field) => (
          <div className="w-full space-y-1">
            <Label htmlFor={field.name} className="leading-5">
              Password
            </Label>
            <div className="relative">
              <Input
                id={field.name}
                name={field.name}
                type={isVisible ? "text" : "password"}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="••••••••••••••••"
                className="pr-9"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible((prevState) => !prevState)}
                className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
              >
                {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                <span className="sr-only">
                  {isVisible ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button className="w-full" type="submit" disabled={!canSubmit}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Sign in to Shadcn Studio
          </Button>
        )}
      />
    </form>
  )
}
