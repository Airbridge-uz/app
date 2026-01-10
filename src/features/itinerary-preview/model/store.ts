import type { ItineraryData } from "@/widgets/trip-planner/ui/trip-itinerary"
import { create } from "zustand"

export const useItineraryPreviewStore = create<{
  isModalOpen: boolean
  setIsModalOpen: (value: boolean) => void
  itinerary: ItineraryData | null
  setItinerary: (value: ItineraryData | null) => void
}>()((set) => ({
  isModalOpen: false,
  setIsModalOpen: (value: boolean) => {
    if (value === false) {
      return set({ itinerary: null, isModalOpen: value })
    }
    return set({ isModalOpen: value })
  },
  itinerary: null,
  setItinerary: (value: ItineraryData | null) => set({ itinerary: value }),
}))
