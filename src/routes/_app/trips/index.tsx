import { useListUserTripsQuery } from "@/shared/queries/trip"
import { Button } from "@/shared/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Skeleton } from "@/shared/ui/skeleton"
import { createFileRoute, Link } from "@tanstack/react-router"
import { format } from "date-fns"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute("/_app/trips/")({
  component: TripListRoute,
})

function TripListRoute() {
  const [bookedOnly, setBookedOnly] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data, isLoading } = useListUserTripsQuery({
    variables: {
      params: {
        status: statusFilter === "all" ? undefined : statusFilter,
      },
    },
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-8 pb-4">
        <h1 className="text-4xl font-semibold tracking-tight mb-8">
          Your trips
        </h1>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBookedOnly(!bookedOnly)}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div
                className={`w-10 h-6 rounded-full transition-colors relative ${bookedOnly ? "bg-primary" : "bg-muted"}`}
              >
                <div
                  className={`absolute top-1 left-1 size-4 rounded-full bg-white transition-transform ${bookedOnly ? "translate-x-4" : "translate-x-0"}`}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Booked only
              </span>
            </button>
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[80px] border-none shadow-none hover:bg-muted font-medium bg-transparent">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-4/3 rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 max-h-[75vh] overflow-y-auto">
            {data?.trips.map((trip) => (
              <Link
                header-button-group
                key={trip.id}
                to="/trips/$tripId"
                params={{ tripId: trip.id.toString() }}
                className="group relative aspect-4/3 overflow-hidden rounded-3xl bg-muted transition-all active:scale-[0.98]"
              >
                <img
                  src={
                    trip.cover_image_url ||
                    "https://images.unsplash.com/photo-1486299267070-83823f5448dd?q=80&w=2071&auto=format&fit=crop"
                  }
                  alt={trip.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 right-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-8 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border-none text-white"
                    onClick={(e) => {
                      e.preventDefault()
                      // Menu logic
                    }}
                  >
                    <MoreHorizontal className="size-5" />
                  </Button>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <h3 className="text-2xl font-bold mb-1 leading-tight line-clamp-2">
                    {trip.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-white/80 font-medium">
                    <span>
                      {trip.days.length > 1 ? "Multi-country" : "Single City"}
                    </span>
                    <span>•</span>
                    <span>
                      {format(new Date(trip.start_date), "MMM d")} –{" "}
                      {format(new Date(trip.end_date), "d")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
