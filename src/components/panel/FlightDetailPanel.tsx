"use client";

import { usePanelStore } from "@/stores/panelStore";
import { FlightTimeline } from "./shared/FlightTimeline";
import { PolicyCard } from "./shared/PolicyCard";
import { PriceBar } from "./shared/PriceBar";
import { cn } from "@/utils/cn";
import {
	ArrowRight,
	Clock,
	Briefcase,
	Utensils,
	Tv,
	Luggage,
} from "lucide-react";

export function FlightDetailPanel() {
	const { selectedFlight, setView, isLoading } = usePanelStore();

	if (!selectedFlight) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-gray-500">No flight selected</p>
			</div>
		);
	}

	const outboundSlice = selectedFlight.slices?.[0];
	const returnSlice = selectedFlight.slices?.[1];

	const originCode = outboundSlice?.origin.code || "XXX";
	const destCode = outboundSlice?.destination.code || "XXX";
	const departureDate = outboundSlice?.departure.date || "";
	const stopsCount = selectedFlight.stops?.count ?? outboundSlice?.stops ?? 0;

	// Format duration
	const formatDuration = (hours: number, minutes: number) => {
		return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
	};

	const totalDuration = formatDuration(
		selectedFlight.duration?.hours || 0,
		selectedFlight.duration?.minutes || 0,
	);

	// Format date for display
	const formatDisplayDate = (dateStr: string) => {
		try {
			const date = new Date(dateStr);
			const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
			const months = [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
			];
			return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
		} catch {
			return dateStr;
		}
	};

	const price =
		selectedFlight.price?.total ?? selectedFlight.price?.amount ?? 0;
	const currency = selectedFlight.price?.currency || "GBP";

	// Get layover info for summary
	const getLayoverInfo = () => {
		if (stopsCount === 0) return null;
		const layover = outboundSlice?.layovers?.[0];
		if (!layover) return `${stopsCount} stop`;
		const hours = Math.floor((layover.duration_minutes || 0) / 60);
		const mins = (layover.duration_minutes || 0) % 60;
		return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${layover.airport_code}`;
	};

	const handleBookFlight = () => {
		// Navigate to fare selection to show available fare options
		// The FareSelectionPanel will fetch/generate fare options
		setView("fare-selection");
	};

	return (
		<div className="flex flex-col h-full">
			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto">
				{/* Header Pills */}
				<div className="px-6 pt-6">
					<div className="flex flex-wrap gap-2 mb-4">
						<span className="px-3 py-1.5 text-sm bg-gray-100 rounded-full text-gray-700">
							{returnSlice ? "Round trip" : "One way"}
						</span>
						<span className="px-3 py-1.5 text-sm bg-gray-100 rounded-full text-gray-700">
							{formatDisplayDate(departureDate)}
						</span>
						<span className="px-3 py-1.5 text-sm bg-gray-100 rounded-full text-gray-700">
							1 Passenger
						</span>
						<span className="px-3 py-1.5 text-sm bg-gray-100 rounded-full text-gray-700">
							Economy
						</span>
					</div>

					{/* Route Display */}
					<div className="mb-2">
						<h1 className="text-3xl font-semibold text-gray-900 flex items-center gap-3">
							{originCode}
							<ArrowRight className="w-6 h-6 text-gray-400" />
							{destCode}
						</h1>
					</div>

					{/* Offer Expiry Notice */}
					<p className="text-sm text-gray-500 mb-6">
						This offer will expire in 30 minutes
					</p>
				</div>

				<div className="border-t border-gray-100" />

				{/* Selected Flight Section */}
				<div className="px-6 py-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">
						Selected flight
					</h2>

					{/* Flight Summary Card */}
					<div className="bg-gray-50 rounded-xl p-4 mb-6">
						<div className="flex items-center gap-4">
							{/* Airline Logo */}
							<div className="w-12 h-12 flex-shrink-0">
								{selectedFlight.airline?.logo_url ? (
									<img
										src={selectedFlight.airline.logo_url}
										alt={selectedFlight.airline.name}
										className="w-12 h-12 object-contain"
									/>
								) : (
									<div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
										{selectedFlight.airline?.code || "AIR"}
									</div>
								)}
							</div>

							{/* Flight Info */}
							<div className="flex-1">
								<div className="flex items-center gap-2 text-base font-semibold text-gray-900">
									<span>{formatDisplayDate(departureDate)}</span>
									<span>
										{outboundSlice?.departure.time?.slice(0, 5)} -{" "}
										{outboundSlice?.arrival.time?.slice(0, 5)}
									</span>
								</div>
								<div className="text-sm text-gray-500">
									Economy · {selectedFlight.airline?.name}
								</div>
							</div>

							{/* Duration & Stops */}
							<div className="text-right">
								<div className="text-base font-semibold text-gray-900">
									{totalDuration}
								</div>
								<div className="text-sm text-gray-500">
									{stopsCount === 0 ? "Non-stop" : getLayoverInfo()}
								</div>
							</div>
						</div>
					</div>

					{/* Flight Timeline */}
					{outboundSlice && (
						<FlightTimeline
							slice={outboundSlice}
							airlineName={selectedFlight.airline?.name}
							className="mb-6"
						/>
					)}

					{/* Return Flight (if round trip) */}
					{returnSlice && (
						<>
							<div className="border-t border-gray-200 my-6" />
							<h3 className="text-md font-semibold text-gray-900 mb-4">
								Return flight
							</h3>
							<FlightTimeline
								slice={returnSlice}
								airlineName={selectedFlight.airline?.name}
								className="mb-6"
							/>
						</>
					)}
				</div>

				<div className="border-t border-gray-100" />

				{/* Policy Cards */}
				<div className="px-6 py-6">
					<div className="flex gap-4">
						<PolicyCard type="change" allowed={false} className="flex-1" />
						<PolicyCard type="refund" allowed={false} className="flex-1" />
					</div>
				</div>

				<div className="border-t border-gray-100" />

				{/* Included Amenities */}
				<div className="px-6 py-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						What's included
					</h3>
					<div className="grid grid-cols-2 gap-4">
						<AmenityItem
							icon={<Luggage className="w-5 h-5" />}
							title="Checked baggage"
							description="1 bag, 23kg included"
							included
						/>
						<AmenityItem
							icon={<Briefcase className="w-5 h-5" />}
							title="Carry-on baggage"
							description="1 bag included"
							included
						/>
						<AmenityItem
							icon={<Utensils className="w-5 h-5" />}
							title="Meal service"
							description="Included on flight"
							included
						/>
						<AmenityItem
							icon={<Tv className="w-5 h-5" />}
							title="Entertainment"
							description="Seatback screen"
							included
						/>
					</div>
				</div>

				{/* Spacer for fixed bottom bar */}
				<div className="h-24" />
			</div>

			{/* Fixed Price Bar */}
			<PriceBar
				price={price}
				currency={currency}
				buttonText="Book This Flight"
				onButtonClick={handleBookFlight}
				isLoading={isLoading}
				helperText="Price includes all taxes and fees"
			/>
		</div>
	);
}

// Amenity Item Component
interface AmenityItemProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	included: boolean;
}

function AmenityItem({ icon, title, description, included }: AmenityItemProps) {
	return (
		<div
			className={cn(
				"flex items-start gap-3 p-3 rounded-lg",
				included ? "bg-green-50" : "bg-gray-50",
			)}
		>
			<div
				className={cn(
					"flex-shrink-0",
					included ? "text-green-600" : "text-gray-400",
				)}
			>
				{icon}
			</div>
			<div>
				<p
					className={cn(
						"text-sm font-medium",
						included ? "text-gray-900" : "text-gray-500",
					)}
				>
					{title}
				</p>
				<p className="text-xs text-gray-500">{description}</p>
			</div>
		</div>
	);
}

export default FlightDetailPanel;
