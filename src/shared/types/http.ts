import type { HTTPError } from "ky"

export type BaseApiError = HTTPError<{
  detail: string
}>
