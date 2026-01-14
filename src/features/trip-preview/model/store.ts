import type { SearchInfo } from "@/entities/chat"
import type { FlightOffer } from "@/entities/flight-offer"
import type { ItineraryData } from "@/widgets/trip-planner/ui/trip-itinerary"
import { create } from "zustand"

type TripPreviewStore = {
  itinerary: ItineraryData | null
  offers: FlightOffer[] | null
  selectedOffer: FlightOffer | null
  tripId: number | null
  searchInfo: SearchInfo | null
  mode: "preview" | "hidden" | "fullscreen"
  isOffersExpired: boolean
  setSelectedOffer: (offer: FlightOffer | null) => void
  setItinerary: (itinerary: ItineraryData | null) => void
  setOffers: (offers: FlightOffer[]) => void
  setIsOffersExpired: (isOffersExpired: boolean) => void
  setTripId: (tripId: number | null) => void
  setSearchInfo: (searchInfo: SearchInfo | null) => void
  setMode: (mode: "preview" | "hidden" | "fullscreen") => void
}

export const useTripPreviewStore = create<TripPreviewStore>((set) => ({
  itinerary: null,
  offers: null,
  tripId: null,
  selectedOffer: null,
  searchInfo: null,
  isOffersExpired: false,
  setIsOffersExpired: (isOffersExpired) => set({ isOffersExpired }),
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
