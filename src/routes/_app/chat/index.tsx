import { TripPlannerLayout } from "@/widgets/trip-planner/ui"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_app/chat/")({
  component: RouteComponent,
})

function RouteComponent() {
  return <TripPlannerLayout />
}
