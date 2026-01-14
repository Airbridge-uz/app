import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { ArrowRight, Backpack, Briefcase, Plane, Star, Zap } from "lucide-react"
import type { FlightOfferPresenter } from "../model/types"

export function FlightOfferCard({ offer, onSelect }: FlightOfferPresenter) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden group transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 border-border/40 bg-card/40 backdrop-blur-xl",
        offer.rank === 1 && "border-primary/30 bg-primary/5",
      )}
    >
      {/* Selection Glow */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Rank/Label Badge */}
      <div className="absolute top-0 right-0 pt-4 pr-4">
        <Badge
          variant={offer.label?.includes("Overall") ? "default" : "secondary"}
          className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-tighter gap-1.5 shadow-sm"
        >
          {offer.label?.includes("Overall") ? (
            <Star className="size-3 fill-current" />
          ) : (
            <Zap className="size-3 fill-current" />
          )}
          {offer.label}
        </Badge>
      </div>

      <div className="p-5 md:p-6 space-y-6">
        {/* Header: Airline info */}
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-white p-2 flex items-center justify-center shadow-md shadow-black/5 ring-1 ring-border/20">
            <img
              src={offer.airline.logo_url}
              alt={offer.airline.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="font-bold text-base leading-none">
              {offer.airline.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">
              {offer.airline.code} •{" "}
              {offer.slices?.[0]?.segments?.[0]?.cabin_class}
            </p>
          </div>
        </div>

        {/* Flight Slices */}
        <div className="space-y-6">
          {offer.slices.map((slice, idx) => (
            <div
              key={`${slice.origin.code}-${slice.destination.code}-${slice.departure.time}`}
              className="relative"
            >
              {idx > 0 && (
                <div className="absolute -top-3 left-0 right-0 border-t border-dashed border-border/40" />
              )}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                {/* Time & Route Info */}
                <div className="flex flex-1 items-center gap-4 md:gap-8">
                  <div className="space-y-1 min-w-[60px]">
                    <div className="text-xl md:text-2xl font-black tracking-tighter">
                      {slice.departure.time}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">
                      {slice.origin.code}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center gap-1.5 max-w-[120px]">
                    <span className="text-[10px] font-bold text-muted-foreground/70 uppercase">
                      {slice.duration.display}
                    </span>
                    <div className="relative w-full flex items-center">
                      <div className="h-[2px] w-full bg-linear-to-r from-transparent via-border to-transparent" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border px-1.5 py-0.5 rounded-full z-10">
                        <Plane
                          className={cn(
                            "size-3 text-primary",
                            idx === 1 && "rotate-180",
                          )}
                        />
                      </div>
                      {slice.stops > 0 && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-[9px] font-bold text-amber-500 whitespace-nowrap">
                          {slice.stops} {slice.stops === 1 ? "stop" : "stops"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1 text-right min-w-[60px]">
                    <div className="text-xl md:text-2xl font-black tracking-tighter">
                      {slice.arrival.time}
                    </div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">
                      {slice.destination.code}
                    </div>
                  </div>
                </div>

                {/* Date & Additional Info (Hidden on very small mobile) */}
                <div className="hidden sm:flex flex-col items-end justify-center">
                  <span className="text-[11px] font-bold text-foreground/80">
                    {new Date(slice.departure.date).toLocaleDateString(
                      undefined,
                      { month: "short", day: "numeric", weekday: "short" },
                    )}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium">
                    {slice.origin.city} to {slice.destination.city}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: Price and CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between border-t border-border/50 gap-4">
          <div className="flex items-center gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Total Price
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tighter text-foreground">
                  {offer.price.currency}
                </span>
                <span className="text-3xl font-black tracking-tighter text-foreground">
                  {offer.price.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="h-8 w-px bg-border/50 mx-2" />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Backpack
                  className={cn(
                    "size-3.5",
                    offer.baggage.cabin.allowed
                      ? "text-emerald-500"
                      : "text-muted-foreground/50",
                  )}
                />
                <span className="text-[10px] font-bold">Cabin</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Briefcase
                  className={cn(
                    "size-3.5",
                    offer.baggage.checked.allowed
                      ? "text-emerald-500"
                      : "text-muted-foreground/50",
                  )}
                />
                <span className="text-[10px] font-bold">Checked</span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => onSelect?.(offer)}
            className="w-full sm:w-auto rounded-full px-8 py-6 h-auto font-black uppercase text-xs tracking-tighter gap-2 transition-all duration-300 hover:scale-105 active:scale-95 group/btn"
          >
            Select Flight
            <ArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
