export const FLIGHT_OFFERS_REFRESH_INTERVAL = 5 * 60 * 1000

export interface FlightOffer {
  offer_id: string
  rank: number
  label: string
  airline: {
    code: string
    name: string
    logo_url: string
  }
  price: {
    amount: number
    currency: string
    display: string
  }
  duration: {
    display: string
  }
  stops: {
    display: string
    count: number
  }
  slices: Array<{
    origin: { code: string; name: string; city: string }
    destination: { code: string; name: string; city: string }
    departure: { time: string; date: string }
    arrival: { time: string; date: string }
    duration: { display: string }
    stops: number
    segments: Array<{
      flight_number: string
      cabin_class: string
    }>
  }>
  baggage: {
    cabin: { allowed: boolean; quantity: number }
    checked: { allowed: boolean; quantity: number }
  }
}
