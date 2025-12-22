import { getCurrentUserFn } from "@/shared/lib/auth"
import { useServerFn } from "@tanstack/react-start"
import { useEffect, useState } from "react"

export function Widget() {
  const fn = useServerFn(getCurrentUserFn)
  const [user, setUser] = useState<{ id: number; email: string } | undefined>(
    undefined,
  )

  useEffect(() => {
    ;(async () => {
      const result = await fn()
      if (!result) return
      setUser({
        id: result.id,
        email: result.email,
      })
    })()
  }, [])

  if (!user) return "No user"

  return (
    <div>
      <p>ID: {user.id}</p>
      <p>Email: {user.email}</p>
    </div>
  )
}
