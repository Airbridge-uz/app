import type { FlightOffer } from "@/entities/flight-offer"
import { useFlightPreviewStore } from "../../model/store"

export function useFlightPreview() {
  const store = useFlightPreviewStore()

  function execute(offers: FlightOffer[]) {
    store.setOffers(offers)
    store.setIsModalOpen(true)
  }

  return execute
}
