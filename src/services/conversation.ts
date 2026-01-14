import type { ChatSession, SearchInfo } from "@/entities/chat"
import type { FlightOffer } from "@/entities/flight-offer"
import { typeSafeRequest } from "@/shared/lib/http"
import type { ApiRequestPayload } from "@/shared/types/http"
import type { ItineraryData } from "@/widgets/trip-planner/ui/trip-itinerary"

export type GetConversationByIdResult = {
  session_id: string
  trip_id: number | null
  messages: Array<ConversationMessage>
} & (ConversationWithFlightCards | ConversationWithoutFlightCards) &
  ConversationWithItinerary &
  ConversationWithSearchInfo

export type ConversationWithFlightCards = {
  flight_cards: Array<FlightOffer>
  flight_cards_expired: boolean
}

export type ConversationWithoutFlightCards = {
  flight_cards: null
  flight_cards_expired: null
}

export type ConversationWithItinerary = {
  itinerary_data: ItineraryData
  itinerary_grounding: unknown
}

export type ConversationWithSearchInfo = {
  search_info: SearchInfo
}

export type ConversationMessage = {
  id: string
  role: string
  content: string
  timestamp: string
  ui: {
    type: string
    data: string
    is_expired: boolean
    expires_in_minutes: number
    expiration_message: string
  }
}

export type GetConversationListResult = {
  conversations: ChatSession[]
  total: number
}
export type GetConversationListRequestParams = {
  limit?: number
  offset?: number
  trip_id?: number
}

export async function getConversationById(
  payload: ApiRequestPayload<undefined, undefined> & { id: string },
) {
  return await typeSafeRequest<undefined, undefined, GetConversationByIdResult>(
    {
      url: `api/v1/conversations/${payload.id}`,
      method: "get",
      payload,
    },
  )
}

export async function getConversationList(
  payload?: ApiRequestPayload<undefined, GetConversationListRequestParams>,
) {
  return await typeSafeRequest<
    undefined,
    GetConversationListRequestParams,
    GetConversationListResult
  >({
    url: "api/v1/conversations",
    method: "get",
    payload,
  })
}

export async function deleteConversation(
  payload: ApiRequestPayload<undefined, undefined> & { id: string },
) {
  return await typeSafeRequest<undefined, undefined, { success: boolean }>({
    url: `api/v1/conversations/${payload.id}`,
    method: "delete",
    payload,
  })
}
