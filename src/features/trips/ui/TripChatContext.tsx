import type { Trip } from "@/entities/trip"
import { Link } from "@tanstack/react-router"
import { format } from "date-fns"
import { ChevronRight } from "lucide-react"

interface TripChatContextProps {
  trip: Trip
}

export function TripChatContext({ trip }: TripChatContextProps) {
  if (!trip.session_id) return null

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold tracking-tight">Chats</h3>
        <span className="text-muted-foreground text-lg font-medium">1</span>
      </div>
      <Link
        to="/chat/$chatId"
        params={{ chatId: trip.session_id }}
        className="block group"
      >
        <div className="flex items-center justify-between p-6 rounded-[2rem] border border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30 transition-all duration-300 shadow-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-xl leading-snug group-hover:text-primary transition-colors">
              {trip.days.length} Day {trip.destination} Trip Itinerary Plan
            </h4>
            <p className="text-muted-foreground font-medium">
              {format(new Date(trip.created_at || new Date()), "MMM d, yyyy")}
            </p>
          </div>
          <ChevronRight className="size-8 text-muted-foreground/50 group-hover:text-primary transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </div>
  )
}
