import { FlightOffers } from "@/features/flight-search/ui/flight-offers"
import { getConversationById } from "@/services/conversation"
import { buttonVariants } from "@/shared/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { TripItinerary } from "@/widgets/trip-planner/ui"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"
import { useEffect } from "react"
import { match } from "ts-pattern"
import { useTripPreviewStore } from "../model/store"
import { CreateTripButton } from "./create-trip-button"

export function TripPreview() {
  return (
    <>
      <Dynamic />
      <RouteWatcher />
    </>
  )
}

function Dynamic() {
  const store = useTripPreviewStore()

  return match(store.mode)
    .with("hidden", () => null)
    .otherwise(() => (
      <aside className="p-3 bg-background/70 border-l max-w-md min-w-md">
        <Tabs defaultValue="itineraryPlan" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="itineraryPlan">Itinerary plan</TabsTrigger>
            <TabsTrigger value="flightOffers">Flight offers</TabsTrigger>
          </TabsList>
          <TabsContent
            className="overflow-auto max-h-[75vh] p-1"
            value="itineraryPlan"
          >
            {store.itinerary && <TripItinerary data={store.itinerary} />}
          </TabsContent>
          <TabsContent
            className="overflow-auto max-h-[75vh] p-1"
            value="flightOffers"
          >
            {store.offers && (
              <FlightOffers
                isExpired={store.isOffersExpired}
                offers={store.offers}
              />
            )}
          </TabsContent>
          <div className="flex justify-end">
            {store.tripId !== null ? (
              <Link
                to="/trips/$tripId"
                params={{ tripId: String(store.tripId) }}
                className={buttonVariants({
                  variant: "secondary",
                  class: "w-full",
                  size: "lg",
                })}
              >
                Open trip
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <CreateTripProvider />
            )}
          </div>
        </Tabs>
      </aside>
    ))
}

function CreateTripProvider() {
  const store = useTripPreviewStore()
  const { chatId } = useParams({
    from: "/_app/chat/$chatId/",
  })

  if (store.itinerary && store.offers && store.searchInfo) {
    return (
      <CreateTripButton
        itinerary={store.itinerary}
        flightOffers={store.offers}
        searchInfo={store.searchInfo}
        sessionId={chatId}
      />
    )
  }

  return <TryToFindItComponent />
}

function TryToFindItComponent() {
  const params = useParams({
    from: "/_app/chat/$chatId/",
  })
  const queryResult = useQuery({
    queryKey: ["conversation", "duplicate", params.chatId],
    queryFn: async () => {
      const result = await getConversationById({ id: params.chatId })
      if (result.isErr()) {
        throw new Error(result.error.message)
      }
      return result.value ?? []
    },
    retry: 10,
  })

  if (!queryResult.isSuccess) return null

  return (
    <CreateTripButton
      itinerary={queryResult.data?.itinerary_data}
      flightOffers={queryResult.data?.flight_cards ?? []}
      searchInfo={queryResult.data?.search_info}
      sessionId={params.chatId}
    />
  )
}

function RouteWatcher() {
  const store = useTripPreviewStore.getState()
  const params = useParams({
    from: "/_app/chat/$chatId/",
  })

  // biome-ignore lint/correctness/useExhaustiveDependencies: we only want to reset the store when the chatId changes
  useEffect(() => {
    store.setMode("hidden")
    store.setOffers([])
    store.setItinerary(null)
    store.setSelectedOffer(null)
    store.setIsOffersExpired(false)
    store.setSearchInfo(null)
    store.setTripId(null)
  }, [params.chatId])

  return null
}
