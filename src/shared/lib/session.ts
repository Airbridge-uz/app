// utils/session.ts
import { useSession } from "@tanstack/react-start/server"
import type { SessionPayload } from "../types/session"

export function useAppSession() {
  return useSession<SessionPayload>({
    // Session configuration
    name: "sky-search-web-app-session",
    password: process.env.SESSION_SECRET!, // At least 32 characters
    // Optional: customize cookie settings
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 1 * 24 * 60 * 60, // 1 days
    },
  })
}
