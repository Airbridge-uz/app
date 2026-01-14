import type { Trip, TripActivity, TripDay } from "@/entities/trip"
import { TripChatContext } from "@/features/trips/ui/TripChatContext"
import { useGetTripByIdQuery } from "@/shared/queries/trip"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { Skeleton } from "@/shared/ui/skeleton"
import { createFileRoute } from "@tanstack/react-router"
import { format } from "date-fns"
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  MapPin,
  Plus,
  Tag,
  Wallet,
} from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute("/_app/trips/$tripId/")({
  component: TripDetailsRoute,
})

type Variant = "dashboard" | "journal" | "schedule" | "bento" | "story"

function TripDetailsRoute() {
  const { tripId } = Route.useParams()
  const [variant, setVariant] = useState<Variant>("dashboard")

  const { data: trip, isLoading } = useGetTripByIdQuery({
    variables: {
      params: {
        tripId: Number.parseInt(tripId),
      },
    },
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-[400px] w-full rounded-3xl" />
      </div>
    )
  }

  if (!trip) {
    return <div className="p-8">Trip not found</div>
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Header / Variant Switcher */}
      <div className="px-8 py-4 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            type="button"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="text-xl font-semibold tracking-tight truncate max-w-[300px]">
            {trip.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            View Style:
          </span>
          <Select
            value={variant}
            onValueChange={(v) => setVariant(v as Variant)}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dashboard">Dashboard</SelectItem>
              <SelectItem value="journal">Journal</SelectItem>
              <SelectItem value="schedule">Schedule</SelectItem>
              <SelectItem value="bento">Bento Grid</SelectItem>
              <SelectItem value="story">Immersive Story</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {variant === "dashboard" && <DashboardView trip={trip} />}
        {variant === "journal" && <JournalView trip={trip} />}
        {variant === "schedule" && <ScheduleView trip={trip} />}
        {variant === "bento" && <BentoView trip={trip} />}
        {variant === "story" && <StoryView trip={trip} />}
      </div>
    </div>
  )
}

function DashboardView({ trip }: { trip: Trip }) {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="relative h-[300px] rounded-3xl overflow-hidden shadow-2xl">
        <img
          src={
            trip.cover_image_url ||
            "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800"
          }
          className="absolute inset-0 w-full h-full object-cover"
          alt=""
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white backdrop-blur-md border-none"
            >
              {trip.destination}
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white backdrop-blur-md uppercase tracking-tighter border-none"
            >
              {trip.status}
            </Badge>
          </div>
          <h2 className="text-5xl font-bold">{trip.title}</h2>
        </div>
      </div>
      <TripChatContext trip={trip} />
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            icon: Calendar,
            label: "Duration",
            value: `${trip.days.length} Days`,
            id: "duration",
          },
          {
            icon: Wallet,
            label: "Budget",
            value: `${trip.currency} ${trip.total_cost}`,
            id: "budget",
          },
          { icon: Compass, label: "Pace", value: trip.pace, id: "pace" },
          {
            icon: Tag,
            label: "Style",
            value: trip.vibe_tags?.join(", ") || "Casual",
            id: "style",
          },
        ].map((stat) => (
          <Card key={stat.id} className="border-none bg-muted/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-xl bg-background flex items-center justify-center shadow-xs text-primary">
                <stat.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase">
                  {stat.label}
                </p>
                <p className="font-semibold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Itinerary</h3>
        <div className="grid gap-6">
          {trip.days.map((day: TripDay) => (
            <div key={day.id} className="relative pl-8 border-l border-border">
              <div className="absolute -left-1.5 top-0 size-3 rounded-full bg-primary border-4 border-background" />
              <div className="mb-4">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  Day {day.day_number}: {day.title || "Exploring"}
                  <span className="text-sm font-normal text-muted-foreground">
                    — {format(new Date(day.date), "EEE, MMM d")}
                  </span>
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {day.activities.map((activity: TripActivity) => (
                  <Card
                    key={activity.id}
                    className="group hover:shadow-lg transition-shadow border-border"
                  >
                    <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">
                          {activity.time || "Morning"}
                        </span>
                      </div>
                      <Badge
                        variant={activity.is_booked ? "default" : "outline"}
                        className="text-[10px] h-4"
                      >
                        {activity.is_booked ? "Booked" : "Unbooked"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <h5 className="font-semibold text-sm mb-1 line-clamp-1">
                        {activity.name}
                      </h5>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function JournalView({ trip }: { trip: Trip }) {
  const [currentPage, setCurrentPage] = useState(0)
  const currentDay = trip.days[currentPage]

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <div className="text-sm font-mono text-primary uppercase tracking-[0.2em]">
          Travel Log / {trip.destination}
        </div>
        <h2 className="text-6xl font-serif italic">{trip.title}</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {trip.pace} journey through {trip.destination_country} •{" "}
          {trip.vibe_tags?.join(" • ")}
        </p>
      </div>

      {currentDay ? (
        <div
          key={currentDay.id}
          className="space-y-16 animate-in fade-in zoom-in-95 duration-700"
        >
          <section className="space-y-6">
            <div className="flex items-baseline gap-4 border-b pb-2">
              <span className="text-4xl font-black text-muted/30">
                0{currentDay.day_number}
              </span>
              <h3 className="text-2xl font-bold tracking-tight">
                {currentDay.title || "The Adventure Begins"}
              </h3>
              <span className="ml-auto text-sm font-medium text-muted-foreground">
                {format(new Date(currentDay.date), "MMMM do, yyyy")}
              </span>
            </div>

            <div className="columns-1 md:columns-2 gap-8 space-y-8">
              {currentDay.activities.map((activity: TripActivity) => (
                <div
                  key={activity.id}
                  className="break-inside-avoid space-y-3 p-4 rounded-xl border border-border/50 bg-muted/20"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-primary/60">
                      {activity.category}
                    </span>
                    <span className="text-xs text-muted-foreground italic">
                      {activity.time || "Scheduled"}
                    </span>
                  </div>
                  <h4 className="font-bold text-lg leading-tight">
                    {activity.name}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{activity.description}"
                  </p>
                  {activity.location && (
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                      <MapPin className="size-3" />
                      {activity.location}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-12 border-t">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="gap-2 rounded-full"
              type="button"
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <div className="text-xs font-mono text-muted-foreground">
              Day {currentDay.day_number} of {trip.days.length}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === trip.days.length - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="gap-2 rounded-full"
              type="button"
            >
              Next Day <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground italic">
          No journal entries for this trip.
        </div>
      )}
    </div>
  )
}

function ScheduleView({ trip }: { trip: Trip }) {
  return (
    <div className="p-0 animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-background z-10 border-b">
            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              <th className="px-8 py-3 w-32 border-r">Time</th>
              {trip.days.map((day: TripDay) => (
                <th key={day.id} className="px-6 py-3 min-w-[300px] border-r">
                  Day {day.day_number} — {format(new Date(day.date), "MMM d")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map(
              (time) => (
                <tr
                  key={time}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  <td className="px-8 py-4 font-mono text-xs border-r text-muted-foreground">
                    {time}
                  </td>
                  {trip.days.map((day: TripDay) => {
                    const activity = day.activities.find((a: TripActivity) =>
                      a.time?.startsWith(time.split(":")[0]),
                    )
                    return (
                      <td
                        key={`${day.id}-${time}`}
                        className="px-6 py-4 border-r align-top"
                      >
                        {activity ? (
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <div className="text-[10px] font-bold text-primary mb-1">
                              {activity.time || time}
                            </div>
                            <div className="text-sm font-semibold">
                              {activity.name}
                            </div>
                            {activity.location && (
                              <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {activity.location}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="h-full min-h-[60px] flex items-center justify-center border border-dashed border-muted-foreground/10 rounded-lg text-[10px] text-muted-foreground uppercase tracking-widest">
                            Free Time
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BentoView({ trip }: { trip: Trip }) {
  const allActivities = trip.days.flatMap((d: TripDay) => d.activities)

  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-4 md:grid-rows-4 gap-4 h-full md:h-[calc(100vh-140px)] animate-in zoom-in-95 duration-500">
      {/* Big Hero Activity */}
      <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden bg-primary text-primary-foreground p-8 shadow-2xl group">
        <img
          src="https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1935&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-200 transition-transform duration-700 group-hover:scale-110"
          alt=""
        />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <Badge className="bg-white/20 text-white border-none mb-4">
              Featured Highlight
            </Badge>
            <h2 className="text-4xl font-black leading-tight">
              {allActivities[0]?.name || "The Main Event"}
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-lg opacity-80 line-clamp-2">
              {allActivities[0]?.description ||
                "Experience the best of the destination."}
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="w-fit"
              type="button"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bento */}
      <div className="bg-muted rounded-3xl p-6 flex flex-col justify-center items-center text-center">
        <div className="text-6xl font-black text-primary">
          {trip.days.length}
        </div>
        <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          Days
        </div>
      </div>

      <div className="bg-secondary/40 rounded-3xl p-6 flex flex-col justify-center border border-secondary/20 backdrop-blur-sm">
        <div className="text-sm font-bold text-secondary-foreground opacity-60 mb-1 capitalize">
          {trip.pace} Pace
        </div>
        <div className="text-xl font-bold">
          {trip.vibe_tags?.[0] || "Explorer"} vibe
        </div>
        <div className="flex gap-1 mt-2">
          {trip.vibe_tags?.slice(1, 3).map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-[8px] px-1 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Small Bento items */}
      {allActivities.slice(1, 4).map((activity: TripActivity) => (
        <div
          key={activity.id}
          className={`rounded-3xl p-4 border border-border flex flex-col justify-between hover:bg-muted transition-colors group ${activity.id % 3 === 0 ? "md:row-span-2" : ""}`}
        >
          <div className="flex justify-between items-start">
            <div className="size-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-background transition-colors">
              <MapPin className="size-4 text-primary" />
            </div>
            <Badge
              variant="outline"
              className="text-[8px] font-black uppercase opacity-40"
            >
              {activity.category || "Activity"}
            </Badge>
          </div>
          <div className="mt-4">
            <h4 className="font-bold text-sm leading-tight">{activity.name}</h4>
            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
              {activity.description}
            </p>
          </div>
        </div>
      ))}

      <div className="md:col-span-2 bg-linear-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white flex items-center justify-between shadow-xl">
        <div>
          <h3 className="text-2xl font-bold">Planned Budget</h3>
          <p className="opacity-80 text-lg">
            {trip.currency} {trip.total_cost}
          </p>
          <div className="mt-4 flex gap-2">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-none"
            >
              Flights
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-none"
            >
              Hotels
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-none"
            >
              +12 more
            </Badge>
          </div>
        </div>
        <Plus className="size-16 opacity-20" />
      </div>
    </div>
  )
}

function StoryView({ trip }: { trip: Trip }) {
  const [currentPage, setCurrentPage] = useState(0) // 0 is cover, 1..N are days
  const isCover = currentPage === 0
  const currentDay = !isCover ? trip.days[currentPage - 1] : null

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col animate-in fade-in duration-1000">
      {isCover ? (
        <div className="relative flex-1 flex items-center justify-center overflow-hidden animate-in fade-in zoom-in-105 duration-1000">
          <img
            src={
              trip.cover_image_url ||
              "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1974&auto=format&fit=crop"
            }
            className="absolute inset-0 w-full h-full object-cover"
            alt=""
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div className="relative z-10 text-center text-white px-4 max-w-4xl">
            <Badge
              variant="secondary"
              className="mb-6 bg-white/10 text-white border-white/20 uppercase tracking-[0.4em] py-1 border"
            >
              The Grand Expedition
            </Badge>
            <h2 className="text-7xl md:text-9xl font-black tracking-tighter mb-6 leading-none">
              {trip.title.split(" ").map((word: string, i: number) => (
                <span key={i} className={i % 2 === 1 ? "text-primary" : ""}>
                  {word}{" "}
                </span>
              ))}
            </h2>
            <div className="flex items-center justify-center gap-6 text-lg font-medium opacity-80 uppercase tracking-widest">
              <span>{trip.destination}</span>
              <span className="size-1.5 rounded-full bg-primary" />
              <span>{format(new Date(trip.start_date), "MMMM yyyy")}</span>
            </div>

            <Button
              size="lg"
              onClick={() => setCurrentPage(1)}
              className="mt-12 rounded-full px-12 h-14 text-lg font-bold bg-white text-black hover:bg-white/90"
              type="button"
            >
              Open Story
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
          <div className="flex-1 flex flex-col md:flex-row">
            {/* Image Section */}
            <div className="flex-1 relative h-[40vh] md:h-auto">
              <img
                src={`https://images.unsplash.com/photo-${1500000000000 + (currentDay?.id || 0) * 12}?w=1200&auto=format&fit=crop`}
                className="absolute inset-0 w-full h-full object-cover"
                alt=""
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white md:hidden">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80">
                  Day 0{currentDay?.day_number}
                </span>
                <h3 className="text-3xl font-black">{currentDay?.title}</h3>
              </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 bg-background p-8 md:p-16 flex flex-col justify-center max-w-2xl mx-auto overflow-y-auto">
              <div className="mb-12 hidden md:block">
                <span className="text-xs font-black uppercase tracking-[0.6em] text-primary">
                  Day 0{currentDay?.day_number}
                </span>
                <h3 className="text-6xl font-black tracking-tight mt-2 leading-none">
                  {currentDay?.title || "The Unfolding"}
                </h3>
              </div>

              <div className="space-y-12">
                {currentDay?.activities.map((activity: TripActivity) => (
                  <div key={activity.id} className="space-y-4 group">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">
                        {activity.time || "Morning"}
                      </span>
                      <div className="w-8 h-px bg-border group-hover:w-12 transition-all" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {activity.category}
                      </span>
                    </div>
                    <h4 className="text-2xl font-bold leading-tight">
                      {activity.name}
                    </h4>
                    <p className="text-lg text-muted-foreground font-serif leading-relaxed italic opacity-80">
                      "{activity.description}"
                    </p>
                    {activity.location && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-primary/80">
                        <MapPin className="size-4" />
                        {activity.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer Nav */}
              <div className="mt-20 pt-8 border-t flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-primary transition-colors"
                  type="button"
                >
                  <ChevronLeft className="size-4" /> Back
                </button>
                <div className="text-[10px] font-mono opacity-40">
                  Samarkand Expedition / {currentPage} of {trip.days.length + 1}
                </div>
                {currentPage < trip.days.length ? (
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-primary transition-colors underline decoration-2 underline-offset-4"
                    type="button"
                  >
                    Next Day <ChevronRight className="size-4" />
                  </button>
                ) : (
                  <div className="text-xs font-black uppercase text-primary">
                    The End
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
