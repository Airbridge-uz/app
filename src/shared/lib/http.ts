import { apiClient, publicApiClient } from "@/shared/api/client"
import axios, { type AxiosRequestConfig } from "axios"
import { ResultAsync } from "neverthrow"
import type { ApiError, ApiRequestPayload } from "../types/http"
import { getSessionToken } from "./auth"

interface RequestConfig<TBody, TParams> {
  url: string
  method: "get" | "post" | "put" | "delete" | "patch"
  payload?: ApiRequestPayload<TBody, TParams>
  isPublic?: boolean
  options?: AxiosRequestConfig
  isStream?: boolean
}

export function typeSafeRequest<TBody, TParams, TResult>(
  config: RequestConfig<TBody, TParams>,
) {
  const {
    url,
    method,
    payload,
    isPublic,
    options: customOptions,
    isStream,
  } = config
  const client = isPublic ? publicApiClient : apiClient

  const reqFn = async () => {
    if (isStream) {
      // Use native fetch for streaming because Axios doesn't support it in browsers
      const baseURL = client.defaults.baseURL || ""
      const normalizedBaseURL = baseURL.endsWith("/") ? baseURL : `${baseURL}/`
      const cleanUrl = url.startsWith("/") ? url.slice(1) : url
      const fullUrl = new URL(cleanUrl, normalizedBaseURL)

      if (payload?.params) {
        Object.entries(payload.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            fullUrl.searchParams.append(key, String(value))
          }
        })
      }

      const headers = new Headers({
        "Content-Type": "application/json",
        Accept: "application/json",
        ...payload?.headers,
        ...customOptions?.headers,
      } as Record<string, string>)

      if (!isPublic) {
        const tokenResult = await getSessionToken()
        if (tokenResult.success) {
          headers.set("Authorization", `Bearer ${tokenResult.data}`)
        }
      }

      const response = await fetch(fullUrl.toString(), {
        method: method.toUpperCase(),
        headers,
        body: payload?.body ? JSON.stringify(payload.body) : undefined,
      })

      if (!response.ok) {
        let errorData: any
        try {
          errorData = await response.json()
        } catch {
          errorData = { detail: response.statusText }
        }

        const error = new Error(errorData.detail || response.statusText) as any
        error.response = {
          data: errorData,
          status: response.status,
        }
        error.isAxiosError = true
        throw error
      }

      return response as unknown as TResult
    }

    const axiosConfig: AxiosRequestConfig = {
      ...customOptions,
      url,
      method,
      headers: {
        ...payload?.headers,
        ...customOptions?.headers,
      },
      params: payload?.params,
      data: payload?.body,
    }

    const response = await client.request<TResult>(axiosConfig)

    return response.data
  }

  return ResultAsync.fromPromise(reqFn(), async (error): Promise<ApiError> => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as Record<string, unknown> | undefined
      const detail = data?.detail as any

      return {
        type:
          error.response?.status === 422 ? "VALIDATION_ERROR" : "HTTP_ERROR",
        status: error.response?.status || 500,
        message: error.message,
        detail,
      }
    }

    return {
      type: "UNKNOWN_ERROR",
      message: (error as Error).message || "An unknown error occurred",
    }
  })
}
