import type { FlightOfferListPresenter } from "../model/types"

export function FlightOfferList({
  offers,
  Presenter,
}: FlightOfferListPresenter) {
  return offers.map((offer) => <Presenter key={offer.offer_id} offer={offer} />)
}
