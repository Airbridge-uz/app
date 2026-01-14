import type { ConversationMessage } from "@/services/conversation"

export interface Message {
  id?: string | null
  role: "user" | "assistant"
  content: string | null
  timestamp?: string | null
  ui?: UIComponent | null
}

export interface UIComponent {
  type: string
  data: Record<string, unknown> | null
  is_expired: boolean
  expires_in_minutes: number | null
  expiration_message: string | null
}

export interface FlightCard {
  offer_id: string
  airline: string
  origin: string
  destination: string
  departure_time: string
  arrival_time: string
  duration_minutes: number
  stops: number
  price: number
  currency: string
  cabin_class: string
  booking_url: string
}

export interface SearchInfo {
  origin: string | null
  destination: string | null
  departure_date: string | null
  return_date: string | null
  total_count: number
  searched_at: string | null
}

export interface Suggestion {
  label: string
  value: string
  icon?: string
  type?: string
}

export interface ChatResponse {
  response: string
  session_id: string
  messages: Message[] | null
  flight_cards: Record<string, unknown>[] | null
  search_info: SearchInfo | null
  suggestions: Record<string, string>[] | null
  itinerary_data: Record<string, unknown> | null
  itinerary_grounding: Record<string, unknown> | null
  saved_trip_id: number | null
  thought_process: string[] | null
}

export interface ChatSession {
  session_id: string
  title: string
  trip_id: number | null
  last_message_at: string | null
  message_count: number
  preview: string | null
  has_flights: boolean
  has_itinerary: boolean
  messages: ConversationMessage[]
}
