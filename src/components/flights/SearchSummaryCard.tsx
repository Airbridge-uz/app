"use client";

import { ArrowRightLeft } from "lucide-react";

interface SearchSummaryCardProps {
	origin: string;
	destination: string;
	departureDate: string;
	returnDate: string;
	passengers: string;
	cabinClass: string;
	onEdit: () => void;
}

export function SearchSummaryCard({
	origin,
	destination,
	departureDate,
	returnDate,
	passengers,
	cabinClass,
	onEdit,
}: SearchSummaryCardProps) {
	return (
		<div className="bg-paper rounded-lg p-6 mb-8">
			<h2 className="text-base font-semibold text-ink mb-1 flex items-center gap-2">
				Round trip to {destination}
			</h2>
			<div className="flex items-center gap-2 text-sm text-muted mb-2">
				<span>{origin}</span>
				<ArrowRightLeft className="w-3 h-3" />
				<span>{destination}</span>
				<span>•</span>
				<span>Return</span>
			</div>
			<div className="text-sm text-muted mb-4">
				{departureDate} – {returnDate} • {passengers}
			</div>
			<div className="text-sm text-muted mb-6 capitalize">{cabinClass}</div>

			<button
				onClick={onEdit}
				className="w-full py-2.5 border border-border bg-white rounded-lg text-sm font-medium text-ink hover:bg-gray-50 transition-colors"
			>
				Edit search
			</button>
		</div>
	);
}
