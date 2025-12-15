"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { DuffelFlightCard } from "@/components/flights";
import { FlightCard } from "@/types";
import { ArrowLeft, Plane } from "lucide-react";

export default function FlightsPage() {
	const router = useRouter();
	const [flights, setFlights] = useState<FlightCard[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		// Load flights from session storage
		if (typeof window !== "undefined") {
			const storedFlights = sessionStorage.getItem("allFlights");
			if (storedFlights) {
				try {
					setFlights(JSON.parse(storedFlights));
				} catch (e) {
					console.error("Failed to parse stored flights:", e);
				}
			}
			setIsLoading(false);
		}
	}, []);

	const handleSelectFlight = (flight: FlightCard) => {
		// TODO: Implement flight selection/booking logic
		console.log("Selected flight:", flight.offer_id);
	};

	const handleBack = () => {
		router.back();
	};

	return (
		<div className="flex flex-col h-screen bg-gray-50">
			{/* Header */}
			<Header />

			{/* Main Layout */}
			<div className="flex-1 flex overflow-hidden">
				{/* Left: App Sidebar */}
				<AppSidebar />

				{/* Main Content */}
				<main className="flex-1 overflow-y-auto">
					<div className="max-w-4xl mx-auto px-6 py-8">
						{/* Back Button & Title */}
						<div className="flex items-center gap-4 mb-8">
							<button
								onClick={handleBack}
								className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
							>
								<ArrowLeft className="w-5 h-5 text-gray-700" />
							</button>
							<div>
								<h1 className="text-2xl font-semibold text-gray-900">
									All Flights
								</h1>
								<p className="text-sm text-gray-500 mt-1">
									{flights.length} {flights.length === 1 ? "flight" : "flights"}{" "}
									found
								</p>
							</div>
						</div>

						{/* Content */}
						{isLoading ? (
							<div className="flex flex-col items-center justify-center py-16">
								<div className="relative w-12 h-12 mb-4">
									<div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
									<div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gray-900 animate-spin"></div>
								</div>
								<span className="text-sm text-gray-500">
									Loading flights...
								</span>
							</div>
						) : flights.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-16 text-center">
								<div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
									<Plane className="w-8 h-8 text-gray-400" />
								</div>
								<h2 className="text-lg font-medium text-gray-900 mb-2">
									No flights to display
								</h2>
								<p className="text-sm text-gray-500 max-w-sm">
									Start a new search in the chat to find available flights.
								</p>
								<button
									onClick={() => router.push("/chat")}
									className="mt-6 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
								>
									Search Flights
								</button>
							</div>
						) : (
							<div className="space-y-4">
								{flights.map((flight, idx) => (
									<DuffelFlightCard
										key={flight.offer_id || idx}
										flight={flight}
										onSelect={handleSelectFlight}
									/>
								))}
							</div>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}
