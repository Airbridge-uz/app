"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Grid2X2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { FlightCard as FlightCardType } from "@/types";
import { DuffelFlightCard } from "./DuffelFlightCard";

interface FlightCarouselProps {
	flights: FlightCardType[];
	onSelectFlight?: (flight: FlightCardType) => void;
	onShowAll?: () => void;
}

export function FlightCarousel({
	flights,
	onSelectFlight,
	onShowAll,
}: FlightCarouselProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	const checkScrollability = () => {
		const container = containerRef.current;
		if (!container) return;

		const { scrollLeft, scrollWidth, clientWidth } = container;
		setCanScrollLeft(scrollLeft > 0);
		setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
	};

	useEffect(() => {
		checkScrollability();
		const container = containerRef.current;
		if (container) {
			container.addEventListener("scroll", checkScrollability);
			window.addEventListener("resize", checkScrollability);
		}
		return () => {
			if (container) {
				container.removeEventListener("scroll", checkScrollability);
			}
			window.removeEventListener("resize", checkScrollability);
		};
	}, [flights]);

	const scrollTo = (direction: "left" | "right") => {
		const container = containerRef.current;
		if (!container) return;

		const cardWidth =
			container.querySelector(".flight-card-item")?.clientWidth || 400;
		const gap = 16; // gap-4 = 16px
		const scrollAmount = cardWidth + gap;

		if (direction === "left") {
			container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
			setCurrentIndex(Math.max(0, currentIndex - 1));
		} else {
			container.scrollBy({ left: scrollAmount, behavior: "smooth" });
			setCurrentIndex(Math.min(flights.length - 1, currentIndex + 1));
		}
	};

	if (flights.length === 0) return null;

	return (
		<div className="relative w-full">
			{/* Carousel Container */}
			<div
				ref={containerRef}
				className="flex gap-4 overflow-x-auto pb-4 scroll-smooth hide-scrollbar"
				style={{ scrollSnapType: "x mandatory" }}
			>
				{flights.map((flight, idx) => (
					<div
						key={flight.offer_id || idx}
						className="flight-card-item flex-shrink-0 w-full max-w-[520px]"
						style={{ scrollSnapAlign: "start" }}
					>
						<DuffelFlightCard
							flight={flight}
							onSelect={onSelectFlight}
							compact
						/>
					</div>
				))}
			</div>

			{/* Navigation Controls */}
			<div className="flex items-center justify-between mt-3">
				{/* Navigation Buttons */}
				<div className="flex items-center gap-2">
					<button
						onClick={() => scrollTo("left")}
						disabled={!canScrollLeft}
						className={cn(
							"w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 transition-all duration-200",
							canScrollLeft
								? "bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300 cursor-pointer"
								: "bg-gray-50 text-gray-300 cursor-not-allowed",
						)}
						aria-label="Previous flight"
					>
						<ChevronLeft className="w-4 h-4" />
					</button>
					<button
						onClick={() => scrollTo("right")}
						disabled={!canScrollRight}
						className={cn(
							"w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 transition-all duration-200",
							canScrollRight
								? "bg-white hover:bg-gray-50 text-gray-700 hover:border-gray-300 cursor-pointer"
								: "bg-gray-50 text-gray-300 cursor-not-allowed",
						)}
						aria-label="Next flight"
					>
						<ChevronRight className="w-4 h-4" />
					</button>

					{/* Progress indicator */}
					<span className="text-xs text-gray-500 ml-2">
						{flights.length} {flights.length === 1 ? "flight" : "flights"} found
					</span>
				</div>

				{/* Show All Button */}
				{flights.length > 1 && onShowAll && (
					<button
						onClick={onShowAll}
						className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
					>
						<Grid2X2 className="w-4 h-4" />
						Show all flights
					</button>
				)}
			</div>

			{/* Custom scrollbar hide styles */}
			<style jsx>{`
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
		</div>
	);
}
