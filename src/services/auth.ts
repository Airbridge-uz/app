import { apiClient } from "@/shared/api/client"
import type { HTTPError } from "ky"
import { ResultAsync } from "neverthrow"

export async function signInWithCredentials(payload: {
  email: string
  password: string
}) {
  const searchParams = new URLSearchParams()
  searchParams.set("username", payload.email)
  searchParams.set("password", payload.password)
  return await ResultAsync.fromThrowable(async () => {
    return await apiClient.post<{ access_token: string }>("api/v1/auth/login", {
      body: searchParams,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  })()
    .map(async (response) => await response.json())
    .mapErr((error) => {
      const httpError = error as HTTPError
      return {
        type: "HTTP_ERROR",
        status: httpError.response.status,
        message: httpError.message,
      }
    })
}
