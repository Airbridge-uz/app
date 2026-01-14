import type { FlightOffer } from "@/entities/flight-offer"
import { create } from "zustand"

export const useFlightPreviewStore = create<{
  isModalOpen: boolean
  setIsModalOpen: (value: boolean) => void
  offers: FlightOffer[]
  setOffers: (offers: FlightOffer[]) => void
}>()((set) => ({
  isModalOpen: false,
  setIsModalOpen: (value: boolean) => {
    if (value === false) {
      set({ offers: [], isModalOpen: value })
    }
    return set({ isModalOpen: value })
  },
  offers: [],
  setOffers: (offers: FlightOffer[]) => set({ offers }),
}))
