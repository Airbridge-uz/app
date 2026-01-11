import { FlightOffersList } from "@/features/flight-search/ui/flight-offers-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { TripItinerary } from "@/widgets/trip-planner/ui"
import { Link, useParams } from "@tanstack/react-router"
import { useEffect } from "react"
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

  if (store.mode === "hidden") return null

  return (
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
          {store.offers && <FlightOffersList offers={store.offers} />}
        </TabsContent>
        <div className="flex justify-end">
          {store.tripId ? (
            <Link to="/trips" className="w-full">
              Open trip
            </Link>
          ) : (
            <CreateTripProvider />
          )}
        </div>
      </Tabs>
    </aside>
  )
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

  return null
}

function RouteWatcher() {
  const store = useTripPreviewStore.getState()
  const params = useParams({
    from: "/_app/chat/$chatId/",
  })

  useEffect(() => {
    store.setMode("hidden")
    store.setOffers([])
    store.setItinerary(null)
    store.setSelectedOffer(null)
  }, [params.chatId])

  return null
}
