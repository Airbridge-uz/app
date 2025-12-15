"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { DuffelFlightCard } from "@/components/flights";
import { AirportAutocomplete } from "./AirportAutocomplete";
import { DateRangePicker } from "@/components/common/DateRangePicker";
import { FlightResultsView } from "./FlightResultsView";
import { FlightCard } from "@/types";

type JourneyType = "one-way" | "return" | "multi-city";

interface FlightSearchPanelProps {
	onSearchComplete?: (flights: FlightCard[]) => void;
}

export function FlightSearchPanel({
	onSearchComplete,
}: FlightSearchPanelProps) {
	const [view, setView] = useState<"search" | "results">("search");
	const [journeyType, setJourneyType] = useState<JourneyType>("return");
	const [origin, setOrigin] = useState("");
	const [destination, setDestination] = useState("");
	const [departureDate, setDepartureDate] = useState("");
	const [returnDate, setReturnDate] = useState("");
	const [passengers, setPassengers] = useState("1 adult");
	const [cabinClass, setCabinClass] = useState("economy");
	const [isSearching, setIsSearching] = useState(false);
	const [searchResults, setSearchResults] = useState<FlightCard[]>([]);
	const [error, setError] = useState<string | null>(null);

	const handleSearch = async () => {
		if (!origin || !destination || !departureDate) {
			setError("Please fill in all required fields");
			return;
		}

		setIsSearching(true);
		setError(null);
		setSearchResults([]);

		try {
			// Parse passengers
			const passengerCount = parseInt(passengers.split(" ")[0]) || 1;

			// Build slices
			const slices = [
				{
					origin: origin.toUpperCase(),
					destination: destination.toUpperCase(),
					departure_date: departureDate,
				},
			];

			// Add return slice
			if (journeyType === "return" && returnDate) {
				slices.push({
					origin: destination.toUpperCase(),
					destination: origin.toUpperCase(),
					departure_date: returnDate,
				});
			}

			const passengersArray = Array(passengerCount).fill({ type: "adult" });

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/v1/duffel-search/search`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						slices,
						passengers: passengersArray,
						cabin_class: cabinClass,
						max_connections: 1,
						currency: "USD",
						page_size: 20,
					}),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.detail?.message || "Search failed");
			}

			const data = await response.json();

			const flights: FlightCard[] = (data.offers || []).map(
				(offer: Record<string, unknown>, index: number) => {
					const price = offer.price as Record<string, unknown> | undefined;
					const owner = offer.owner as Record<string, unknown> | undefined;
					const totalAmount = parseFloat(
						String(offer.total_amount || price?.total || 0),
					);

					return {
						offer_id: offer.id || offer.offer_id || `offer-${index}`,
						rank: index + 1,
						label: index === 0 ? ("cheapest" as const) : null,
						price: {
							total: totalAmount,
							currency: String(
								offer.total_currency || price?.currency || "USD",
							),
							formatted: `$${totalAmount.toFixed(2)}`,
						},
						airline: {
							code: String(owner?.iata_code || "XX"),
							name: String(owner?.name || "Unknown"),
							logo_url: `https://pics.avs.io/60/60/${owner?.iata_code || "XX"}.png`,
						},
						duration: { hours: 0, minutes: 0, total_minutes: 0, formatted: "" },
						stops: { count: 0, max: 0 },
						slices: [],
					};
				},
			);

			setSearchResults(flights);
			onSearchComplete?.(flights);
			setView("results");
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setIsSearching(false);
		}
	};

	if (view === "results") {
		return (
			<FlightResultsView
				flights={searchResults}
				searchParams={{
					origin,
					destination,
					departureDate,
					returnDate,
					passengers,
					cabinClass,
				}}
				onEditSearch={() => setView("search")}
				onSelectFlight={(flight) => {
					// Handle flight selection - maybe just log or props callback
					console.log("Selected flight:", flight);
				}}
			/>
		);
	}

	return (
		<div className="w-full flex flex-col h-full bg-white animate-[slide-in-right_300ms_ease-out]">
			{/* Header with welcoming message */}
			<div className="px-8 pt-8 pb-6">
				<p className="text-sm text-muted mb-1">Just flights?</p>
				<h1 className="text-2xl font-semibold text-ink">
					We&apos;ve got you covered
				</h1>
			</div>

			{/* Form */}
			<div className="flex-1 overflow-y-auto px-8">
				{/* Journey Type - Radio buttons */}
				<div className="mb-6">
					<label className="block text-sm font-medium text-ink mb-3">
						Journey type
					</label>
					<div className="flex items-center gap-6">
						{(["one-way", "return", "multi-city"] as JourneyType[]).map(
							(type) => (
								<label
									key={type}
									className="flex items-center gap-2 cursor-pointer"
									onClick={() => setJourneyType(type)}
								>
									<span
										className={cn(
											"w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
											journeyType === type ? "border-ink" : "border-border",
										)}
									>
										{journeyType === type && (
											<span className="w-2.5 h-2.5 rounded-full bg-ink" />
										)}
									</span>
									<span className="text-sm text-ink capitalize">
										{type === "one-way"
											? "One way"
											: type === "return"
												? "Return"
												: "Multi-city"}
									</span>
								</label>
							),
						)}
					</div>
				</div>

				{/* Origin & Destination */}
				<div className="grid grid-cols-2 gap-4 mb-6">
					<div>
						<AirportAutocomplete
							label="Origin"
							value={origin}
							onChange={setOrigin}
							placeholder="Origin"
						/>
					</div>
					<div>
						<AirportAutocomplete
							label="Destination"
							value={destination}
							onChange={setDestination}
							placeholder="Destination"
						/>
					</div>
				</div>

				{/* Dates */}
				<div className="mb-2">
					<DateRangePicker
						startDate={departureDate}
						endDate={returnDate}
						onStartDateChange={setDepartureDate}
						onEndDateChange={setReturnDate}
						isOneWay={journeyType === "one-way"}
					/>
				</div>

				{/* Time hints */}
				<div className="grid grid-cols-2 gap-4 mb-6">
					<button className="text-left text-sm text-accent hover:underline">
						At any time ▾
					</button>
					<button
						className={cn(
							"text-left text-sm text-accent hover:underline",
							journeyType === "one-way" && "opacity-50 pointer-events-none",
						)}
					>
						At any time ▾
					</button>
				</div>

				{/* Passengers & Class */}
				<div className="grid grid-cols-2 gap-4 mb-6">
					<div>
						<label className="block text-sm font-medium text-ink mb-2">
							Passengers
						</label>
						<div className="relative">
							<select
								value={passengers}
								onChange={(e) => setPassengers(e.target.value)}
								className="w-full px-4 py-3 border border-border rounded-lg text-sm text-ink appearance-none bg-white focus:outline-none focus:border-ink transition-colors cursor-pointer"
							>
								<option value="1 adult">1 adult</option>
								<option value="2 adults">2 adults</option>
								<option value="3 adults">3 adults</option>
								<option value="4 adults">4 adults</option>
							</select>
							<span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
								▾
							</span>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-ink mb-2">
							Class
						</label>
						<div className="relative">
							<select
								value={cabinClass}
								onChange={(e) => setCabinClass(e.target.value)}
								className="w-full px-4 py-3 border border-border rounded-lg text-sm text-ink appearance-none bg-white focus:outline-none focus:border-ink transition-colors cursor-pointer"
							>
								<option value="economy">Economy</option>
								<option value="premium_economy">Premium Economy</option>
								<option value="business">Business</option>
								<option value="first">First</option>
							</select>
							<span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
								▾
							</span>
						</div>
					</div>
				</div>

				{/* Advanced options link */}
				<div className="text-right mb-6">
					<button className="text-sm text-accent hover:underline">
						Advanced options
					</button>
				</div>

				{/* Search Button */}
				<button
					onClick={handleSearch}
					disabled={isSearching}
					className="w-full py-4 bg-ink text-white text-sm font-medium rounded-lg hover:bg-ink/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
				>
					{isSearching ? (
						<>
							<Loader2 className="w-4 h-4 animate-spin" />
							Searching...
						</>
					) : (
						"Find available flights"
					)}
				</button>

				{/* Error */}
				{error && (
					<div className="mt-4 p-3 border border-error/20 rounded-lg text-sm text-error">
						{error}
					</div>
				)}

				{/* Results */}
				{searchResults.length > 0 && (
					<div className="mt-8">
						<p className="text-sm text-muted mb-4">
							Found {searchResults.length} flights
						</p>
						<div className="space-y-3">
							{searchResults.map((flight, idx) => (
								<DuffelFlightCard
									key={flight.offer_id || idx}
									flight={flight}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
