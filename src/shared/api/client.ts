import ky from "ky"
import { authHeaderHook, beforeErrorHook } from "./hooks"

export const apiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  hooks: {
    beforeRequest: [authHeaderHook],
    beforeError: [beforeErrorHook],
  },
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
})

export const publicApiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    accept: "application/json",
  },
  hooks: {
    beforeError: [beforeErrorHook],
  },
})
