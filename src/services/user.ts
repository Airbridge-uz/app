import ky from "ky"

export const getUserById = async (id: string) => {
  const response = await ky.get(`/api/users/${id}`)
  return response.json()
}
