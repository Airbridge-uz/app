import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { PanelRight } from "lucide-react"
import { useState } from "react"
import { ChatInterface } from "./chat-interface"
import { ItineraryPreview } from "./itinerary-preview"
import { TripSearchHeader } from "./trip-search-header"

export function TripPlannerLayout() {
  const [showPreview, setShowPreview] = useState(true)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header */}
      <TripSearchHeader />

      {/* Main Content - History is now a floating overlay in AppLayout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Toggle Buttons (Floating) - Mobile/Generic */}
        <div className="absolute top-4 right-4 z-20 xl:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowPreview(!showPreview)}
          >
            <PanelRight className="size-4" />
          </Button>
        </div>

        {/* Center: Chat Interface */}
        <main className="flex-1 overflow-hidden relative">
          <ChatInterface />
        </main>

        {/* Right: Itinerary Preview (Collapsible) */}
        <aside
          className={cn(
            "transition-all duration-300 ease-in-out border-l border-border bg-card/30 backdrop-blur-sm",
            showPreview
              ? "w-96 translate-x-0"
              : "w-0 translate-x-full opacity-0",
            "hidden xl:block shrink-0 overflow-hidden",
          )}
        >
          <ItineraryPreview />
        </aside>
      </div>

      {/* Desktop Toggle for Preview */}
      <div className="fixed bottom-24 right-4 z-50 hidden xl:flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg border border-border"
          onClick={() => setShowPreview(!showPreview)}
          title="Toggle Preview"
        >
          <PanelRight
            className={cn(
              "size-4 transition-transform",
              !showPreview && "rotate-180",
            )}
          />
        </Button>
      </div>
    </div>
  )
}
