import type { BeforeErrorHook, BeforeRequestHook } from "ky"
import { getSessionToken } from "../lib/auth"
import type { BaseApiError } from "../types/http"

export const beforeErrorHook: BeforeErrorHook = async (error: BaseApiError) => {
  const { response } = error
  if (response) {
    const body = await response.json()
    error.message = body.detail
  }

  return error
}

export const authHeaderHook: BeforeRequestHook = async (req) => {
  const result = await getSessionToken()

  if (result.success) {
    return new Request(req, {
      headers: {
        ...req.headers,
        Authorization: result.success ? `Bearer ${result.data}` : undefined,
      },
    })
  }

  return req
}
