import type { HTTPError } from "ky"
import { ResultAsync } from "neverthrow"

export async function typeSafeRequest<T>(reqFn: () => Promise<T>) {
  return await ResultAsync.fromThrowable(reqFn)().mapErr(async (error) => {
    const httpError = error as HTTPError
    return {
      type: "HTTP_ERROR",
      status: httpError.response.status,
      message: httpError.message,
    }
  })
}
