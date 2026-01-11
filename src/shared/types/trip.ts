export type CreateTripResponse = {
  id: number
  title: string
  destination: string
  destination_country: string
  destination_country_code: string
  start_date: string
  end_date: string
  status: string
  total_cost: number
  currency: string
  pace: string
  vibe_tags: string[]
  cover_image_url: string
  session_id: string
  created_at: string
  updated_at: string
  days: []
}
