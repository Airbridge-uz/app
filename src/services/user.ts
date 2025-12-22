import { apiClient } from "@/shared/api/client"

export async function getCurrentUser() {
  const response = await apiClient.get<{ id: number; email: string }>(
    "api/v1/auth/me",
  )
  return response.json()
}
