"use client";

import { useState } from "react";
import { Plane, Clock, Luggage, ExternalLink } from "lucide-react";
import { cn } from "@/utils/cn";
import { FlightCard as FlightCardType } from "@/types";
import { formatPrice, formatDuration } from "@/utils/format";

interface FlightCardProps {
	flight: FlightCardType;
}

export function FlightCard({ flight }: FlightCardProps) {
	const { airline, price, duration, stops, slices, label, operating_carrier } =
		flight;
	const [logoError, setLogoError] = useState(false);

	const getLabelStyles = (labelType: string | null | undefined) => {
		switch (labelType) {
			case "cheapest":
				return "bg-green-100 text-green-700";
			case "fastest":
				return "bg-blue-100 text-blue-700";
			case "best_value":
				return "bg-accent-muted text-accent";
			default:
				return "";
		}
	};

	const getLabelText = (labelType: string | null | undefined) => {
		switch (labelType) {
			case "cheapest":
				return "Cheapest";
			case "fastest":
				return "Fastest";
			case "best_value":
				return "Best Value";
			default:
				return "";
		}
	};

	// Helper function to get baggage display text
	const getBaggageText = (): string => {
		const cabin = flight.baggage?.cabin;

		if (!cabin) {
			return "Cabin bag included";
		}

		if (typeof cabin === "string") {
			return cabin;
		}

		// Handle object format: {allowed/included, quantity}
		const isIncluded = cabin.allowed ?? cabin.included ?? true;
		const quantity = cabin.quantity ?? 1;

		if (isIncluded && quantity > 0) {
			return `${quantity} cabin bag${quantity > 1 ? "s" : ""} included`;
		}

		return "No cabin bag";
	};

	// Check if operating carrier is different from marketing carrier
	const showOperatingCarrier =
		operating_carrier && operating_carrier !== airline.name;

	return (
		<div className="bg-white border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
			{/* Header: Airline + Label */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					{/* Airline Logo with Fallback */}
					{airline.logo_url && !logoError ? (
						<img
							src={airline.logo_url}
							alt={airline.name}
							className="h-6 w-auto object-contain"
							onError={() => setLogoError(true)}
						/>
					) : (
						<div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
							<Plane className="w-4 h-4 text-gray-400" />
						</div>
					)}

					{/* Airline Name + Operating Carrier */}
					<div>
						<span className="text-sm font-medium text-ink">{airline.name}</span>
						{showOperatingCarrier && (
							<div className="text-xs text-muted">
								Operated by {operating_carrier}
							</div>
						)}
					</div>
				</div>

				{label && (
					<span
						className={cn(
							"px-2 py-1 text-xs font-medium rounded-full",
							getLabelStyles(label),
						)}
					>
						{getLabelText(label)}
					</span>
				)}
			</div>

			{/* Flight Slices (Outbound / Return) */}
			<div className="space-y-3">
				{slices.map((slice, index) => (
					<div key={index}>
						{index > 0 && <div className="border-t border-border my-3" />}

						<div className="flex items-center justify-between">
							{/* Origin */}
							<div className="text-center">
								<div className="text-lg font-semibold text-ink">
									{slice.departure.time}
								</div>
								<div className="text-sm font-medium text-ink">
									{slice.origin.code}
								</div>
								<div className="text-xs text-muted">{slice.origin.city}</div>
							</div>

							{/* Flight Path Visualization */}
							<div className="flex-1 px-4">
								<div className="flex items-center justify-center gap-2 text-xs text-muted mb-1">
									<Clock className="w-3 h-3" />
									<span className="font-medium">
										{formatDuration(slice.duration.total_minutes)}
									</span>
								</div>

								<div className="relative flex items-center">
									<div className="flex-1 border-t border-dashed border-border" />
									<Plane className="w-4 h-4 text-accent mx-2" />
									<div className="flex-1 border-t border-dashed border-border" />
								</div>

								<div className="text-center text-xs text-muted mt-1">
									{slice.stops === 0
										? "Non-stop"
										: `${slice.stops} stop${slice.stops > 1 ? "s" : ""}`}
									{slice.layovers && slice.layovers.length > 0 && (
										<span>
											{" "}
											· {slice.layovers.map((l) => l.airport_code).join(", ")}
										</span>
									)}
								</div>
							</div>

							{/* Destination */}
							<div className="text-center">
								<div className="text-lg font-semibold text-ink">
									{slice.arrival.time}
								</div>
								<div className="text-sm font-medium text-ink">
									{slice.destination.code}
								</div>
								<div className="text-xs text-muted">
									{slice.destination.city}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Footer: Baggage, Price, Action */}
			<div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
				{/* Baggage Info */}
				<div className="flex items-center gap-1.5 text-xs text-muted">
					<Luggage className="w-3.5 h-3.5" />
					<span>{getBaggageText()}</span>
				</div>

				{/* Price + Action */}
				<div className="flex items-center gap-3">
					<div className="text-right">
						<div className="text-xl font-semibold text-ink">
							{formatPrice(price.total ?? price.amount ?? 0, price.currency)}
						</div>
						<div className="text-xs text-muted">per person</div>
					</div>

					<button
						onClick={() => {
							if (flight.booking?.url) {
								window.open(flight.booking.url, "_blank");
							}
						}}
						className="flex items-center gap-1 px-3 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors"
					>
						View
						<ExternalLink className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>
		</div>
	);
}
