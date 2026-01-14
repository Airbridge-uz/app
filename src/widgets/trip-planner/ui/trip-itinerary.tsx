import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { ScrollArea } from "@/shared/ui/scroll-area"
import {
  Bus,
  Calendar,
  Camera,
  Clock,
  Coffee,
  DollarSign,
  Download,
  Map as MapIcon,
  MapPin,
  Navigation,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  Utensils,
} from "lucide-react"
import { SuggestionCard } from "./suggestion-card"

interface DayActivity {
  time: string
  name: string
  description: string
  duration_minutes: number
  category: string
  place_id: number | string
  insider_tip: string
  address: string
  latitude: number
  longitude: number
  price_level: number | null
  rating: number
  cover_image_url: string
  transit_to_next: string
}

interface TripDay {
  day_number: number
  date: string | null
  title: string
  theme: string
  template: string
  activities: DayActivity[]
  estimated_cost: number
  currency: string
}

export interface ItineraryData {
  trip_title: string
  city: string
  country_code: string
  summary: string
  days: TripDay[]
  total_estimated_cost: number
  currency: string
}

const getCategoryIcon = (category: string) => {
  const c = category.toLowerCase()
  if (c.includes("restaurant") || c.includes("food") || c.includes("pilaf"))
    return Utensils
  if (c.includes("cafe") || c.includes("coffee")) return Coffee
  if (c.includes("market") || c.includes("bazaar") || c.includes("shop"))
    return ShoppingBag
  if (c.includes("park") || c.includes("garden")) return MapIcon
  if (c.includes("museum") || c.includes("history")) return Camera
  return MapPin
}

export function TripItinerary({ data }: { data: ItineraryData }) {
  if (!data) return null

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-3xl overflow-hidden animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="relative border-b border-border/40 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-transparent to-secondary/5 opacity-50" />
        <div className="relative p-6 md:p-8 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Badge
                variant="secondary"
                className="rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-primary/20"
              >
                {data.city}, {data.country_code}
              </Badge>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {data.trip_title}
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full size-10 border-border/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
              >
                <Share2 className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full size-10 border-border/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
              >
                <Download className="size-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
            {data.summary}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium">
              <Calendar className="size-3.5 text-primary" />
              {data.days.length} Days
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium">
              <DollarSign className="size-3.5 text-primary" />
              Est. {data.currency}{" "}
              {data.total_estimated_cost > 0
                ? data.total_estimated_cost
                : data.days.reduce((acc, d) => acc + d.estimated_cost, 0)}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <Sparkles className="size-3.5" />
              AI Optimized
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1 min-h-0 overflow-y-auto w-full max-h-[50vh]">
        <div className="p-4 md:p-8 space-y-12 pb-32">
          {data.days.map((day) => (
            <section
              key={day.day_number}
              id={`day-${day.day_number}`}
              className="space-y-6 scroll-mt-6"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-primary flex flex-col items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                  <span className="text-[8px] md:text-[10px] font-bold uppercase leading-none opacity-80">
                    Day
                  </span>
                  <span className="text-base md:text-lg font-bold leading-none mt-0.5">
                    {day.day_number}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-lg md:text-xl font-bold tracking-tight">
                    {day.title}
                  </h2>
                  <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="size-3 text-primary/70" />
                    {day.theme}
                  </p>
                </div>
              </div>

              <div className="relative pl-4 md:pl-6 space-y-8 ml-4 md:ml-6 border-l-2 border-border/50">
                {day.activities.map((activity) => {
                  const CategoryIcon = getCategoryIcon(activity.category)
                  return (
                    <div
                      key={`${day.day_number}-${activity.name}-${activity.time}`}
                      className="relative group"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute -left-[25px] md:-left-[31px] top-0 size-3 md:size-4 rounded-full bg-background border-[3px] md:border-4 border-primary shadow-sm group-hover:scale-125 transition-transform duration-300 z-10" />

                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3">
                          <div className="flex items-center gap-1.2 md:gap-1.5 text-[10px] md:text-xs font-bold text-primary bg-primary/5 px-2 py-0.5 md:px-2.5 md:py-1 rounded-md">
                            <Clock className="size-3 md:size-3.5" />
                            {activity.time}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted-foreground font-semibold">
                            <span className="size-1 rounded-full bg-muted-foreground/30" />
                            {activity.duration_minutes} mins
                          </div>
                          {activity.rating && (
                            <div className="flex items-center gap-1 text-[10px] md:text-xs text-amber-500 font-bold px-2 py-0.5 rounded-md bg-amber-500/5">
                              <Star className="size-3 fill-amber-500" />
                              {activity.rating}
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                          <SuggestionCard
                            title={activity.name}
                            description={activity.address}
                            image={activity.cover_image_url}
                            className="w-full h-40 md:h-48 xl:h-56 shadow-xl shadow-foreground/5"
                          />
                          <div className="space-y-4 py-1 xl:py-2">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CategoryIcon className="size-4 text-primary" />
                                <span className="text-sm font-bold capitalize">
                                  {activity.category.replace(/_/g, " ")}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {activity.description}
                              </p>
                            </div>

                            {activity.insider_tip && (
                              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 space-y-1.5 animate-in slide-in-from-left-4 duration-500 delay-200">
                                <div className="flex items-center gap-2 text-primary">
                                  <Sparkles className="size-3.5" />
                                  <span className="text-[10px] font-bold uppercase tracking-wider">
                                    Insider Tip
                                  </span>
                                </div>
                                <p className="text-xs font-medium text-foreground/80 italic leading-relaxed">
                                  "{activity.insider_tip}"
                                </p>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="h-8 text-[11px] font-bold rounded-lg gap-1.5 flex-1 md:flex-none"
                                type="button"
                              >
                                <MapIcon className="size-3" />
                                View Location
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[11px] font-bold rounded-lg gap-1.5 flex-1 md:flex-none"
                                type="button"
                              >
                                <Navigation className="size-3" />
                                Directions
                              </Button>
                            </div>
                          </div>
                        </div>

                        {activity.transit_to_next && (
                          <div className="flex items-center gap-3 py-2 text-xs font-medium text-muted-foreground/70 animate-in fade-in duration-1000">
                            <div className="flex flex-col items-center gap-1.5 ml-[-26px] md:ml-[-34px] mr-2">
                              <div className="w-0.5 h-6 bg-linear-to-b from-border/50 to-transparent" />
                              <Bus className="size-3.5 md:size-4 text-primary/40" />
                              <div className="w-0.5 h-6 bg-linear-to-b from-transparent to-border/50" />
                            </div>
                            <span className="px-3 py-1.5 rounded-full border border-dashed border-border/50 text-[10px] md:text-xs">
                              {activity.transit_to_next}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {day.estimated_cost > 0 && (
                <div className="ml-4 md:ml-6 pl-4 md:pl-6 pt-4">
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-primary" />
                      <span className="text-sm font-semibold">
                        Daily Budget
                      </span>
                    </div>
                    <span className="text-sm font-bold tracking-tight text-primary">
                      {day.currency} {day.estimated_cost}
                    </span>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>
      </ScrollArea>

      {/* Quick Access Sidebar / Floating Navigation */}
      <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 hidden 2xl:flex flex-col gap-2 p-2 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl z-20 overflow-y-auto max-h-[80vh]">
        {data.days.map((day) => (
          <button
            key={day.day_number}
            type="button"
            className="size-8 md:size-10 rounded-lg md:rounded-xl flex items-center justify-center text-[10px] md:text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            onClick={() =>
              document
                .getElementById(`day-${day.day_number}`)
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            D{day.day_number}
          </button>
        ))}
      </div>
    </div>
  )
}
