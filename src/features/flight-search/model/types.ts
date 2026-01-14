import type { FlightOffer } from "@/entities/flight-offer"
import type { ComponentType } from "react"

export interface FlightOfferPresenter {
  offer: FlightOffer
  onSelect?: (offer: FlightOffer) => void
}

export interface FlightOfferListPresenter {
  offers: FlightOffer[]
  Presenter: ComponentType<FlightOfferPresenter>
}
