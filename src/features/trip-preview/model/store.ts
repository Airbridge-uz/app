import type { SearchInfo } from "@/entities/chat"
import type { FlightOffer } from "@/features/flight-search"
import type { ItineraryData } from "@/widgets/trip-planner/ui/trip-itinerary"
import { create } from "zustand"

interface TripPreviewStore {
  itinerary: ItineraryData | null
  offers: FlightOffer[] | null
  selectedOffer: FlightOffer | null
  tripId: number | null
  searchInfo: SearchInfo | null
  setSelectedOffer: (offer: FlightOffer | null) => void
  setItinerary: (itinerary: ItineraryData | null) => void
  setOffers: (offers: FlightOffer[]) => void
  setTripId: (tripId: number | null) => void
  setSearchInfo: (searchInfo: SearchInfo | null) => void
  mode: "preview" | "hidden" | "fullscreen"
  setMode: (mode: "preview" | "hidden" | "fullscreen") => void
}

export const useTripPreviewStore = create<TripPreviewStore>((set) => ({
  itinerary: null,
  offers: null,
  tripId: null,
  selectedOffer: null,
  searchInfo: null,
  setSelectedOffer: (offer) => set({ selectedOffer: offer }),
  setItinerary: (itinerary) => set({ itinerary }),
  setOffers: (offers) => set({ offers }),
  setTripId: (tripId) => set({ tripId }),
  setSearchInfo: (searchInfo) => set({ searchInfo }),
  mode: "hidden",
  setMode: (mode) => {
    if (mode === "hidden") {
      return set({
        itinerary: null,
        offers: null,
        selectedOffer: null,
        mode,
      })
    }
    return set({ mode })
  },
}))
