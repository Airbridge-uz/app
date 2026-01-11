import type { SearchInfo } from "@/entities/chat"
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

  function setTripId(tripId: number) {
    store.setTripId(tripId)
  }

  function setSearchInfo(searchInfo: SearchInfo) {
    store.setSearchInfo(searchInfo)
  }

  return {
    execute,
    previewItinerary,
    previewOffers,
    setTripId,
    setSearchInfo,
  }
}
