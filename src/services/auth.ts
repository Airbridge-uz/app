import type { SignInPayload, SignInResult } from "@/features/auth/sign-in"
import type { SignUpPayload, SignUpResult } from "@/features/auth/sign-up"
import { publicApiClient } from "@/shared/api/client"
import { typeSafeRequest } from "@/shared/lib/http"

export async function signInWithCredentials(payload: SignInPayload) {
  const searchParams = new URLSearchParams()
  searchParams.set("username", payload.email)
  searchParams.set("password", payload.password)
  return await typeSafeRequest(async () => {
    return await publicApiClient
      .post<SignInResult>("api/v1/auth/login", {
        body: searchParams,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .json()
  })
}

export async function registerUser(payload: SignUpPayload) {
  return typeSafeRequest(async () => {
    const wtf = await publicApiClient
      .post<SignUpResult>("api/v1/auth/register", {
        body: JSON.stringify(payload),
      })
      .json()
    return wtf
  })
}
