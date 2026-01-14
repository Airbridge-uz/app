import type { FlightOffer } from "@/features/flight-search"
import { typeSafeRequest } from "@/shared/lib/http"
import type { ApiRequestPayload } from "@/shared/types/http"

export interface SearchFlightSlice {
  origin: string
  destination: string
  arrival_date: string
  departure_date: string
  departure_time?: {
    from: string
    to: string
  }
  arrival_time?: {
    from: string
    to: string
  }
}

export interface SearchPassenger {
  type: string
  age: number
}

interface SearchFlightsBody {
  slices: Array<SearchFlightSlice>
  passengers: Array<SearchPassenger>
  cabin_class: string
  max_connections: number
  supplier_timeout_ms: number
  return_offers: boolean
  page_size: number
  currency: string
}

interface SearchFlightsParams {
  format?: string
}

interface SearchFlightsResponse {
  offer_request_id: string
  offers: Array<FlightOffer>
  meta: {
    page_size: number
    has_more: boolean
    next_after: string
    source: string
    cache_hit: boolean
    cache_age_seconds: number
  }
}

export async function searchFlights(
  payload: ApiRequestPayload<SearchFlightsBody, SearchFlightsParams>,
) {
  return await typeSafeRequest<
    SearchFlightsBody,
    SearchFlightsParams,
    SearchFlightsResponse
  >({
    url: "api/v1/duffel-search/search",
    method: "post",
    payload,
  })
}
