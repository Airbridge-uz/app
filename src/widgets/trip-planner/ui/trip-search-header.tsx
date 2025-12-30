import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Calendar, DollarSign, MapPin, Plus, Users } from "lucide-react"
import { useState } from "react"

export function TripSearchHeader() {
  const [destination, setDestination] = useState("")
  const [dates, setDates] = useState("")
  const [people, setPeople] = useState("2")
  const [budget, setBudget] = useState("")

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex items-center gap-3 px-6 py-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Where */}
          <div className="relative flex-1 max-w-xs">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Where"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="pl-10 bg-muted/50 border-0"
            />
          </div>

          {/* When */}
          <div className="relative flex-1 max-w-xs">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="When"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
              className="pl-10 bg-muted/50 border-0"
            />
          </div>

          {/* People */}
          <div className="relative w-32">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="2"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              className="pl-10 bg-muted/50 border-0"
              min="1"
            />
          </div>

          {/* Budget */}
          <div className="relative flex-1 max-w-xs">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="pl-10 bg-muted/50 border-0"
            />
          </div>
        </div>

        {/* Create a trip button */}
        <Button className="gap-2 shrink-0">
          <Plus className="size-4" />
          Create a trip
        </Button>
      </div>
    </header>
  )
}
