import { notifyError, notifySuccess } from "@/services/notification"
import { Button } from "@/shared/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { z } from "zod"
import { signInFn } from "../api/mutation"

const formSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

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
      const response = await serverFn({
        data: {
          email: value.email,
          password: value.password,
        },
      })
      if (response.success === false) {
        return notifyError("Failed to sign in!", {
          description: response.error.message,
        })
      }
      notifySuccess("Successfully signed in!")
      navigate({
        to: "/chat",
      })
      form.reset()
    },
    validators: {
      onSubmit: formSchema,
      onChange: formSchema,
      onBlur: formSchema,
    },
    canSubmitWhenInvalid: true,
    asyncAlways: true,
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
      <FieldGroup>
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <div className="w-full space-y-1">
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              </div>
            )
          }}
        />
      </FieldGroup>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button className="w-full" type="submit" disabled={!canSubmit}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            Sign in
          </Button>
        )}
      />
    </form>
  )
}
