import ky from "ky"
import { getSessionToken } from "../lib/auth"

export const apiClient = ky.create({
  prefixUrl: import.meta.env.VITE_API_URL,
  hooks: {
    beforeRequest: [
      async (req) => {
        const result = await getSessionToken()

        if (result.success) {
          return new Request(req, {
            headers: {
              ...req.headers,
              Authorization: result.success
                ? `Bearer ${result.data}`
                : undefined,
            },
          })
        }

        return req
      },
    ],
  },
})
