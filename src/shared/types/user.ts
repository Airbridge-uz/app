export type UserDto = {
  id: number
  email: string
  full_name: string | null
  phone: string | null
  preferred_currency: string
  preferred_language: string
  is_active: boolean
}
