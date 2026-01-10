import type { FlightOffer } from "@/features/flight-search"
import type { ItineraryData } from "@/widgets/trip-planner/ui/trip-itinerary"
import { useTripPreviewStore } from "../../model/store"

export function useTripPreview() {
  const store = useTripPreviewStore()

  function execute() {
    store.setMode("preview")
  }

  function previewItinerary(itinerary: ItineraryData) {
    store.setItinerary(itinerary)
  }

  function previewOffers(offers: FlightOffer[]) {
    store.setOffers(offers)
  }

  return {
    execute,
    previewItinerary,
    previewOffers,
  }
}
