import { TripPreview } from "@/features/trip-preview"
import { Outlet } from "@tanstack/react-router"
import { TripSearchHeader } from "./trip-search-header"

export function TripPlannerLayout() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <TripSearchHeader />
      <div className="flex flex-1 overflow-hidden relative">
        <Outlet />
        <TripPreview />
      </div>
    </div>
  )
}
