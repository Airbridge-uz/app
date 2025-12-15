"use client";

import { FlightCard } from "@/types";
import { DuffelFlightCard } from "./DuffelFlightCard";
import { SearchSummaryCard } from "./SearchSummaryCard";
import { ChevronRight } from "lucide-react";

interface FlightResultsViewProps {
	flights: FlightCard[];
	searchParams: {
		origin: string;
		destination: string;
		departureDate: string;
		returnDate: string;
		passengers: string;
		cabinClass: string;
	};
	onEditSearch: () => void;
	onSelectFlight: (flight: FlightCard) => void;
}

export function FlightResultsView({
	flights,
	searchParams,
	onEditSearch,
	onSelectFlight,
}: FlightResultsViewProps) {
	return (
		<div className="w-full h-full flex flex-col bg-white animate-[slide-in-right_300ms_ease-out]">
			{/* Breadcrumbs */}
			<div className="px-8 py-6 border-b border-border/50">
				<div className="flex items-center gap-2 text-sm text-muted">
					<span className="text-accent">Orders</span>
					<ChevronRight className="w-3 h-3" />
					<span className="text-accent">New order</span>
					<ChevronRight className="w-3 h-3" />
					<span className="font-medium text-ink">
						{searchParams.origin} to {searchParams.destination}
					</span>
					<ChevronRight className="w-3 h-3" />
					<span>
						{searchParams.destination} to {searchParams.origin}
					</span>
					<ChevronRight className="w-3 h-3" />
					<span>Fare options</span>
				</div>
			</div>

			{/* Content Content */}
			<div className="flex-1 overflow-y-auto p-8">
				<div className="flex gap-8">
					{/* Left Column: Summary Card (approx 1/3) */}
					<div className="w-[280px] flex-shrink-0">
						<SearchSummaryCard {...searchParams} onEdit={onEditSearch} />
					</div>

					{/* Right Column: Results List (approx 2/3) */}
					<div className="flex-1">
						{/* Sorting/Header could go here */}

						<div className="space-y-4">
							{flights.map((flight) => (
								<DuffelFlightCard
									key={flight.offer_id}
									flight={flight}
									onSelect={onSelectFlight}
								/>
							))}
						</div>

						<div className="mt-4 text-center text-xs text-muted">
							Found {flights.length} results
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
