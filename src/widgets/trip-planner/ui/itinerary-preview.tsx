import { SuggestionCard } from "@/features/trip-planner/ui/suggestion-card"
import { Button } from "@/shared/ui/button"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Compass, Map, MoreVertical, Navigation, Share2 } from "lucide-react"

export function ItineraryPreview() {
  return (
    <div className="flex flex-col h-full bg-card/50 backdrop-blur-xl">
      {/* Header */}
      <div className="p-6 border-b border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Compass className="size-4 text-primary" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">Itinerary</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8">
              <Share2 className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVertical className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 gap-2 rounded-xl"
          >
            <Map className="size-3.5" />
            View Map
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-2 rounded-xl"
          >
            <Navigation className="size-3.5" />
            Directions
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 pb-32">
          {/* Day Section */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary">
                Day 1 — Arrival
              </h3>
              <span className="text-xs text-muted-foreground">Jan 12</span>
            </div>

            <div className="space-y-4 relative pl-4 border-l-2 border-primary/20 ml-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 -ml-[1.4rem]">
                  <div className="size-3 rounded-full bg-primary ring-4 ring-background" />
                  <span className="text-sm font-medium">
                    10:00 AM — Hotel Check-in
                  </span>
                </div>
                <SuggestionCard
                  title="Courtyard by Marriott Tashkent"
                  description="🏨 Luxury Stay"
                  image="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400"
                  className="w-full h-40 shadow-xl shadow-primary/5 hover:shadow-primary/10"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 -ml-[1.4rem]">
                  <div className="size-3 rounded-full bg-secondary ring-4 ring-background" />
                  <span className="text-sm font-medium">01:00 PM — Lunch</span>
                </div>
                <SuggestionCard
                  title="Besh Qozon Pilaf Center"
                  description="🍽️ Best local food experience"
                  image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400"
                  className="w-full h-40"
                />
              </div>
            </div>
          </div>

          {/* Inspiration Section */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Nearby Explore
              </h3>
              <Button variant="link" size="sm" className="text-xs h-auto p-0">
                See all
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <SuggestionCard
                title="Amir Temur Square"
                description="📍 1.2km away"
                image="https://images.unsplash.com/photo-1597074866923-dc0589150358?w=400"
                className="w-full h-32 opacity-80 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Dynamic Summary Card (Glassmorphic) */}
      <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-primary/10 backdrop-blur-xl border border-primary/20 shadow-2xl animate-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between font-semibold text-sm">
          <span>Estimated Budget</span>
          <span className="text-primary">$1,250</span>
        </div>
        <div className="mt-2 h-1.5 w-full bg-primary/20 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-2/3 rounded-full" />
        </div>
      </div>
    </div>
  )
}
