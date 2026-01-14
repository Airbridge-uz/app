import type { SearchInfo } from "@/entities/chat"
import { createTripMutation } from "@/features/create-trip"
import type { FlightOffer } from "@/features/flight-search"
import { notifyError, notifySuccess } from "@/services/notification"
import { getCurrentUserFn } from "@/shared/lib/auth"
import { Button } from "@/shared/ui/button"
import type { ItineraryData } from "@/widgets/trip-planner/ui/trip-itinerary"
import { useIsMutating } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { Loader2 } from "lucide-react"

type Props = {
  itinerary: ItineraryData
  flightOffers: FlightOffer[]
  searchInfo: SearchInfo
  sessionId?: string
}

export function CreateTripButton({ itinerary, searchInfo, sessionId }: Props) {
  const navigate = useNavigate()
  const mutation = createTripMutation()
  const currentUserFn = useServerFn(getCurrentUserFn)
  const mutationNumber = useIsMutating({
    mutationKey: createTripMutation.getKey(),
  })

  const handleClick = async () => {
    const user = await currentUserFn()
    if (!user) return

    await mutation.mutateAsync(
      {
        title: itinerary.trip_title,
        destination: itinerary.city,
        destination_country_code: itinerary.country_code,
        destination_country: itinerary.country_code,
        currency: user.preferred_currency,
        start_date: searchInfo.departure_date,
        end_date: searchInfo.return_date,
        status: "planning",
        total_cost: itinerary.total_estimated_cost,
        session_id: sessionId,
      },
      {
        onSuccess(data) {
          navigate({
            to: "/trips/$tripId",
            params: { tripId: String(data.id) },
          })
          notifySuccess("Trip created successfully")
        },
        onError(error) {
          notifyError(error.message)
        },
      },
    )
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleClick}
      disabled={mutationNumber > 0}
    >
      {mutationNumber > 0 && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Create trip
    </Button>
  )
}
