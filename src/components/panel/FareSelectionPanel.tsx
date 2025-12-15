"use client";

import { useState, useEffect } from "react";
import { usePanelStore, FareOption } from "@/stores/panelStore";
import { FareCard } from "./shared/FareCard";
import { cn } from "@/utils/cn";
import { ArrowRight, Plane, Cloud, Loader2 } from "lucide-react";

export function FareSelectionPanel() {
	const {
		selectedFlight,
		fareOptions,
		selectedFare,
		isLoadingFares,
		selectFare,
		setFareOptions,
		setLoadingFares,
		setView,
		goBack,
	} = usePanelStore();

	const [localSelectedFare, setLocalSelectedFare] = useState<FareOption | null>(
		selectedFare,
	);

	// Generate mock fare options if not already loaded
	useEffect(() => {
		if (fareOptions.length === 0 && selectedFlight && !isLoadingFares) {
			generateMockFareOptions();
		}
	}, [fareOptions, selectedFlight, isLoadingFares]);

	// Generate mock fare options based on selected flight
	const generateMockFareOptions = () => {
		if (!selectedFlight) return;

		setLoadingFares(true);

		// Simulate API call delay
		setTimeout(() => {
			const basePrice =
				selectedFlight.price?.total ?? selectedFlight.price?.amount ?? 100;
			const currency = selectedFlight.price?.currency || "GBP";

			const mockFares: FareOption[] = [
				{
					id: `fare_basic_${selectedFlight.offer_id}`,
					cabin_class: "ECONOMY",
					fare_brand_name: "Economy Basic",
					price: {
						total: basePrice,
						currency: currency,
					},
					conditions: {
						changeable: false,
						refundable: false,
					},
					baggage: {
						cabin: {
							included: true,
							quantity: 1,
						},
						checked: {
							included: false,
							quantity: 0,
						},
					},
					seat_selection: false,
					meal_included: false,
				},
				{
					id: `fare_plus_${selectedFlight.offer_id}`,
					cabin_class: "ECONOMY",
					fare_brand_name: "Economy Plus",
					price: {
						total: Math.round(basePrice * 1.25),
						currency: currency,
					},
					conditions: {
						changeable: true,
						change_fee: 50,
						refundable: false,
					},
					baggage: {
						cabin: {
							included: true,
							quantity: 1,
						},
						checked: {
							included: true,
							quantity: 1,
							weight_kg: 23,
						},
					},
					seat_selection: true,
					meal_included: true,
				},
				{
					id: `fare_flex_${selectedFlight.offer_id}`,
					cabin_class: "ECONOMY",
					fare_brand_name: "Economy Flex",
					price: {
						total: Math.round(basePrice * 1.5),
						currency: currency,
					},
					conditions: {
						changeable: true,
						change_fee: 0,
						refundable: true,
						refund_fee: 25,
					},
					baggage: {
						cabin: {
							included: true,
							quantity: 1,
						},
						checked: {
							included: true,
							quantity: 2,
							weight_kg: 23,
						},
					},
					seat_selection: true,
					meal_included: true,
				},
			];

			setFareOptions(mockFares);
			setLoadingFares(false);
		}, 800);
	};

	// Handle fare selection
	const handleSelectFare = (fare: FareOption) => {
		setLocalSelectedFare(fare);
	};

	// Handle continue button
	const handleContinue = () => {
		if (localSelectedFare) {
			selectFare(localSelectedFare);
		}
	};

	if (!selectedFlight) {
		return (
			<div className="flex items-center justify-center h-full">
				<p className="text-gray-500">No flight selected</p>
			</div>
		);
	}

	const outboundSlice = selectedFlight.slices?.[0];
	const originCode = outboundSlice?.origin.code || "XXX";
	const destCode = outboundSlice?.destination.code || "XXX";
	const departureTime = outboundSlice?.departure.time?.slice(0, 5) || "--:--";
	const arrivalTime = outboundSlice?.arrival.time?.slice(0, 5) || "--:--";
	const stopsCount = selectedFlight.stops?.count ?? outboundSlice?.stops ?? 0;

	// Format duration
	const formatDuration = (hours: number, minutes: number) => {
		return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`;
	};

	const totalDuration = formatDuration(
		selectedFlight.duration?.hours || 0,
		selectedFlight.duration?.minutes || 0,
	);

	// Calculate CO2 emissions (mock calculation)
	const estimatedCO2 = Math.round(
		(selectedFlight.duration?.total_minutes || 180) * 0.15,
	);

	return (
		<div className="flex flex-col h-full">
			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto">
				{/* Flight Summary Header */}
				<div className="px-6 py-5 border-b border-gray-100">
					<div className="flex items-center gap-4">
						{/* Airline Logo */}
						<div className="w-10 h-10 flex-shrink-0">
							{selectedFlight.airline?.logo_url ? (
								<img
									src={selectedFlight.airline.logo_url}
									alt={selectedFlight.airline.name}
									className="w-10 h-10 object-contain"
								/>
							) : (
								<div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
									<Plane className="w-5 h-5 text-gray-400" />
								</div>
							)}
						</div>

						{/* Flight Times */}
						<div className="flex-1">
							<div className="flex items-center gap-3">
								<span className="text-lg font-semibold text-gray-900">
									{departureTime}
								</span>
								<div className="flex items-center flex-1">
									<div className="h-px flex-1 bg-gray-300" />
									<span className="px-2 text-xs text-gray-500">
										{totalDuration}
									</span>
									<div className="h-px flex-1 bg-gray-300" />
								</div>
								<span className="text-lg font-semibold text-gray-900">
									{arrivalTime}
								</span>
							</div>
							<div className="flex justify-between mt-1">
								<span className="text-sm text-gray-500">{originCode}</span>
								<span className="text-sm text-gray-500">{destCode}</span>
							</div>
						</div>

						{/* Stops Indicator */}
						<div className="text-right">
							<span
								className={cn(
									"inline-block px-2.5 py-1 text-xs font-medium rounded-full",
									stopsCount === 0
										? "bg-green-100 text-green-700"
										: "bg-gray-100 text-gray-700",
								)}
							>
								{stopsCount === 0
									? "Direct"
									: `${stopsCount} stop${stopsCount > 1 ? "s" : ""}`}
							</span>
						</div>
					</div>
				</div>

				{/* Fare Selection Area */}
				<div className="px-6 py-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-1">
						Select your fare
					</h2>
					<p className="text-sm text-gray-500 mb-6">
						Choose the fare that best suits your travel needs
					</p>

					{/* Loading State */}
					{isLoadingFares && (
						<div className="flex flex-col items-center justify-center py-12">
							<Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
							<p className="text-sm text-gray-500">Loading fare options...</p>
						</div>
					)}

					{/* Fare Cards Grid */}
					{!isLoadingFares && fareOptions.length > 0 && (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{fareOptions.map((fare) => (
								<FareCard
									key={fare.id}
									fare={fare}
									isSelected={localSelectedFare?.id === fare.id}
									onSelect={() => handleSelectFare(fare)}
								/>
							))}
						</div>
					)}

					{/* No Fares State */}
					{!isLoadingFares && fareOptions.length === 0 && (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
								<Plane className="w-8 h-8 text-gray-400" />
							</div>
							<p className="text-gray-600 font-medium mb-1">
								No fare options available
							</p>
							<p className="text-sm text-gray-500">
								Please try selecting a different flight
							</p>
						</div>
					)}
				</div>

				{/* Summary Sidebar Info (inline on mobile) */}
				<div className="px-6 pb-6">
					<div className="bg-gray-50 rounded-xl p-4 space-y-4">
						{/* Sold By */}
						<div className="flex items-center gap-3">
							<span className="text-sm text-gray-500">Sold by</span>
							<div className="flex items-center gap-2">
								{selectedFlight.airline?.logo_url && (
									<img
										src={selectedFlight.airline.logo_url}
										alt=""
										className="w-5 h-5 object-contain"
									/>
								)}
								<span className="text-sm font-medium text-gray-900">
									{selectedFlight.airline?.name || "Airline"}
								</span>
							</div>
						</div>

						{/* CO2 Emissions */}
						<div className="flex items-center gap-3">
							<Cloud className="w-4 h-4 text-gray-400" />
							<span className="text-sm text-gray-600">
								From {estimatedCO2}kg CO₂
							</span>
						</div>

						{/* Helper Text */}
						<p className="text-xs text-gray-500">
							Select fare options to continue to checkout
						</p>
					</div>
				</div>

				{/* Spacer for fixed bottom bar */}
				<div className="h-28" />
			</div>

			{/* Fixed Bottom Bar */}
			<div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
				<div className="flex items-center justify-between mb-3">
					{localSelectedFare ? (
						<>
							<div>
								<p className="text-sm text-gray-500">Selected fare</p>
								<p className="font-semibold text-gray-900">
									{localSelectedFare.fare_brand_name}
								</p>
							</div>
							<div className="text-right">
								<p className="text-sm text-gray-500">Total price</p>
								<p className="text-xl font-bold text-gray-900">
									{new Intl.NumberFormat("en-GB", {
										style: "currency",
										currency: localSelectedFare.price.currency,
									}).format(localSelectedFare.price.total)}
								</p>
							</div>
						</>
					) : (
						<p className="text-sm text-gray-500">Select a fare to continue</p>
					)}
				</div>

				<button
					onClick={handleContinue}
					disabled={!localSelectedFare}
					className={cn(
						"w-full py-3.5 px-6 rounded-xl font-semibold text-white transition-all duration-200",
						"flex items-center justify-center gap-2",
						localSelectedFare
							? "bg-gray-900 hover:bg-gray-800 active:bg-gray-950"
							: "bg-gray-300 cursor-not-allowed",
					)}
				>
					Go to checkout
					<ArrowRight className="w-5 h-5" />
				</button>
			</div>
		</div>
	);
}

export default FareSelectionPanel;
