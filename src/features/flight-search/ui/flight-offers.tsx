import {
  FLIGHT_OFFERS_REFRESH_INTERVAL,
  type FlightOffer,
} from "@/entities/flight-offer"
import { type SearchFlightSlice, searchFlights } from "@/services/duffel-search"
import { createQuery } from "react-query-kit"
import { match } from "ts-pattern"
import { DataRefreshReminder } from "./data-refresh-reminder"
import { FlightOfferCard } from "./flight-offer-card"
import { FlightOfferList } from "./flight-offer-list"
import { FlightOffersError } from "./flight-offers-error"
import { FlightOffersPending } from "./flight-offers-pending"

interface FlightOffersProps {
  offers: FlightOffer[]
  isExpired: boolean
}

export function FlightOffers({ offers, isExpired }: FlightOffersProps) {
  const queryResult = createQuery({
    queryKey: ["flight-offers"],
    fetcher: async () => {
      const payloadSlices: SearchFlightSlice[] = []

      offers.forEach((offer) => {
        offer.slices.forEach((slice) => {
          payloadSlices.push({
            arrival_date: slice.arrival.date,
            departure_date: slice.departure.date,
            origin: slice.origin.code,
            destination: slice.destination.code,
          })
        })
      })

      const result = await searchFlights({
        body: {
          slices: payloadSlices,
          cabin_class: "economy",
          currency: "USD",
          max_connections: 1,
          return_offers: true,
          supplier_timeout_ms: 1000,
          page_size: 50,
          passengers: [
            {
              age: 18,
              type: "adult",
            },
          ],
        },
      })

      if (result.isErr())
        throw new Error(result.error.message, {
          cause: result.error.detail,
        })

      if (result.value.offers.length === 0) {
        return offers
      }

      return result.value.offers
    },
    enabled: isExpired,
    placeholderData: offers,
    refetchInterval: FLIGHT_OFFERS_REFRESH_INTERVAL,
    refetchOnWindowFocus: true,
  })()

  return (
    <section className="space-y-6">
      {match(isExpired)
        .with(true, () => <DataRefreshReminder />)
        .otherwise(() => null)}
      {match(queryResult)
        .with({ status: "success" }, (result) => (
          <ul className="grid grid-cols-1 gap-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-700 max-h-[60vh] overflow-auto">
            <FlightOfferList offers={result.data} Presenter={FlightOfferCard} />
          </ul>
        ))
        .with({ status: "pending" }, () => <FlightOffersPending />)
        .with({ status: "error" }, () => <FlightOffersError />)
        .otherwise(() => null)}
    </section>
  )
}
