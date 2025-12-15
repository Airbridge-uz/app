"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/AppSidebar";
import {
	ChatMessage,
	ChatInput,
	EmptyChatState,
	SuggestionChips,
} from "@/components/chat";
import { FlightSearchPanel, FlightCarousel } from "@/components/flights";
import { SavedTripsPanel } from "@/components/trips";
import { RightPanel } from "@/components/panel";
import { TravelDatePicker } from "@/components/common/TravelDatePicker";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import {
	useMapStore,
	fetchUserLocation,
	extractFlightRouteFromCards,
} from "@/stores/mapStore";
import { usePanelStore } from "@/stores/panelStore";
import { cn } from "@/utils/cn";
import { ChevronUp, ChevronDown, Map, Plane } from "lucide-react";
import { FlightCard } from "@/types";

export default function ChatPage() {
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	const {
		messages,
		flightCards,
		isLoading,
		isStreaming,
		error,
		sendMessage,
		thoughtProcess,
		itineraryData,
		suggestions,
	} = useChatStore();

	const { user } = useAuthStore();
	const { activePanel, isDatePickerOpen, openDatePicker, closeDatePicker } =
		useUIStore();
	const {
		setUserLocation,
		setLocationLoading,
		userLocation,
		clearFlightRoute,
		flightRoute,
	} = useMapStore();
	const {
		isOpen: isPanelOpen,
		selectedFlight: panelSelectedFlight,
		closePanel,
	} = usePanelStore();

	// Clear stale flight route on fresh page load (no messages = new session)
	useEffect(() => {
		if (messages.length === 0 && flightRoute) {
			console.log("[ChatPage] Clearing stale flight route on fresh page");
			clearFlightRoute();
		}
	}, [messages.length, flightRoute, clearFlightRoute]);

	// Fetch user location on mount
	useEffect(() => {
		async function loadUserLocation() {
			if (userLocation) return; // Already loaded

			setLocationLoading(true);
			try {
				const locationData = await fetchUserLocation();
				if (locationData) {
					setUserLocation(locationData.coords, locationData.airportCode);
					console.log("[ChatPage] User location loaded:", locationData);
				}
			} catch (error) {
				console.error("[ChatPage] Failed to load user location:", error);
			} finally {
				setLocationLoading(false);
			}
		}

		loadUserLocation();
	}, [userLocation, setUserLocation, setLocationLoading]);

	// Auto-scroll to bottom on new messages
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, flightCards]);

	const handleSendMessage = (content: string) => {
		sendMessage(content, user?.id);
	};

	// Handle date picker confirmation
	const handleDateConfirm = useCallback(
		(departureDate: string, returnDate: string | null) => {
			// Format dates for natural language message
			const depDate = new Date(departureDate);
			const depFormatted = format(depDate, "MMMM d, yyyy");

			let message: string;
			if (returnDate) {
				const retDate = new Date(returnDate);
				const retFormatted = format(retDate, "MMMM d, yyyy");
				message = `I want to travel from ${depFormatted} to ${retFormatted}`;
			} else {
				message = `I want to depart on ${depFormatted} (one-way)`;
			}

			// Send as chat message
			sendMessage(message, user?.id);
			console.log("[DatePicker] Sent dates:", { departureDate, returnDate });
		},
		[sendMessage, user?.id],
	);

	// Handle suggestion chip clicks
	const handleSuggestionClick = (value: string) => {
		// Handle special UI triggers
		if (value === "OPEN_CALENDAR_UI") {
			console.log("[SuggestionChip] Opening calendar UI");
			openDatePicker();
			return;
		}

		if (value === "SAVE_TRIP") {
			// This is handled by the backend, but we can add UI feedback here
			console.log("[SuggestionChip] Save trip action");
		}

		// Send as regular message
		sendMessage(value, user?.id);
	};

	const handleSelectFlight = (flight: FlightCard) => {
		console.log("[ChatPage] Selected flight:", flight.offer_id);
		console.log("[ChatPage] Flight data:", JSON.stringify(flight, null, 2));

		// Extract route from selected flight and show on map
		const mapStore = useMapStore.getState();
		console.log("[ChatPage] Current userLocation:", mapStore.userLocation);

		const route = extractFlightRouteFromCards([flight], mapStore.userLocation);
		console.log("[ChatPage] Extracted route:", route);

		if (route) {
			mapStore.setFlightRoute(route);
			console.log("[ChatPage] ✅ Flight route set on map");
		} else {
			console.log("[ChatPage] ⚠️ Could not extract route from flight");
		}
	};

	const handleShowAllFlights = (flights: FlightCard[]) => {
		// Store flights in session storage for the flights page
		if (typeof window !== "undefined") {
			sessionStorage.setItem("allFlights", JSON.stringify(flights));
		}
		router.push("/flights");
	};

	const hasMessages = messages.length > 0;
	const showItinerary = !!itineraryData;

	// Debug: Log suggestions state
	if (suggestions.length > 0) {
		console.log("[ChatPage] Global suggestions available:", suggestions);
	}

	// Determine what to show in right panel (for special panels like flights search, saved trips)
	const getRightPanelContent = () => {
		if (activePanel === "flights") {
			return <FlightSearchPanel />;
		}
		if (activePanel === "saved-trips") {
			return <SavedTripsPanel />;
		}

		return null;
	};

	const rightPanelContent = getRightPanelContent();
	const showSpecialPanel = rightPanelContent !== null;

	return (
		<div className="flex flex-col h-screen bg-paper">
			{/* Header */}
			<Header />

			{/* Main Layout */}
			<div className="flex-1 flex overflow-hidden">
				{/* Left: App Sidebar (with integrated history) */}
				<AppSidebar />

				{/* Content Area: Chat + Sliding Panel */}
				<div className="flex-1 flex overflow-hidden">
					{/* Chat Section - expands/contracts based on panel state */}
					<main
						className={cn(
							"flex flex-col overflow-hidden transition-all duration-300 ease-out",
							// When special panel (flights search, saved trips, itinerary) is shown
							showSpecialPanel
								? activePanel === "flights"
									? "w-[35%] max-w-[500px]"
									: "w-1/2"
								: // When flight detail panel is open, chat shrinks
									isPanelOpen
									? "flex-1"
									: // Default: chat takes full width
										"flex-1",
							"relative",
						)}
					>
						{/* Messages Container */}
						<div className="flex-1 overflow-y-auto">
							<div
								className={cn(
									"px-4 py-6 transition-all duration-300 ease-out",
									// When panel is open, align left with padding
									isPanelOpen
										? "max-w-full px-6"
										: // When special panel is open
											showSpecialPanel
											? activePanel === "flights"
												? "px-4"
												: "max-w-full px-6"
											: // Default: centered with max-width for comfortable reading
												"mx-auto max-w-[760px]",
								)}
							>
								{!hasMessages ? (
									<EmptyChatState
										onSuggestionClick={handleSendMessage}
										mode={activePanel === "flights" ? "analyze" : "chat"}
									/>
								) : (
									<div className="space-y-4">
										{messages.map((message, index) => (
											<div key={message.id}>
												<ChatMessage
													message={message}
													onSuggestionClick={handleSuggestionClick}
													isLoading={
														isStreaming && index === messages.length - 1
													}
												/>

												{/* Thought process (collapsible) */}
												{message.role === "assistant" &&
													message.thoughtProcess &&
													message.thoughtProcess.length > 0 && (
														<div className="ml-11 mt-2 mb-2">
															<details className="text-xs text-muted">
																<summary className="cursor-pointer hover:text-ink transition-colors">
																	View reasoning
																</summary>
																<ul className="mt-2 space-y-1 pl-4 border-l border-border">
																	{message.thoughtProcess.map((step, i) => (
																		<li key={i}>{step}</li>
																	))}
																</ul>
															</details>
														</div>
													)}

												{/* Flight cards carousel */}
												{message.role === "assistant" &&
													message.flightCards &&
													message.flightCards.length > 0 && (
														<div className="mt-4">
															<FlightCarousel
																flights={message.flightCards}
																onSelectFlight={handleSelectFlight}
																onShowAll={() =>
																	handleShowAllFlights(message.flightCards!)
																}
															/>
														</div>
													)}
											</div>
										))}

										{/* Current flight cards carousel (not attached to message yet) */}
										{!isStreaming &&
											flightCards.length > 0 &&
											messages.length > 0 &&
											!messages[messages.length - 1]?.flightCards && (
												<div className="mt-4">
													<FlightCarousel
														flights={flightCards}
														onSelectFlight={handleSelectFlight}
														onShowAll={() => handleShowAllFlights(flightCards)}
													/>
												</div>
											)}

										{/* Standalone suggestions (when not attached to message) */}
										{!isStreaming &&
											suggestions.length > 0 &&
											messages.length > 0 &&
											!messages[messages.length - 1]?.suggestions && (
												<div className="mt-4 ml-0">
													<SuggestionChips
														suggestions={suggestions}
														onSuggestionClick={handleSuggestionClick}
														isLoading={isLoading}
													/>
												</div>
											)}

										{/* Loading spinner - shows when waiting for response */}
										{isStreaming && thoughtProcess.length === 0 && (
											<div className="flex items-center gap-3 py-3">
												<div className="relative w-5 h-5">
													<div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
													<div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin"></div>
												</div>
											</div>
										)}

										{/* Thinking indicator - shows current thought */}
										{isStreaming && thoughtProcess.length > 0 && (
											<div className="text-xs text-muted animate-pulse">
												<span className="font-medium">Thinking:</span>{" "}
												{thoughtProcess[thoughtProcess.length - 1]}
											</div>
										)}
									</div>
								)}

								{/* Error Message */}
								{error && (
									<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-error">
										{error}
									</div>
								)}

								{/* Scroll anchor */}
								<div ref={messagesEndRef} />
							</div>
						</div>

						{/* Chat Input */}
						<div className="border-t border-border bg-paper">
							<div
								className={cn(
									"px-4 py-4 transition-all duration-300 ease-out",
									// When panel is open, full width with padding
									isPanelOpen
										? "max-w-full px-6"
										: // When special panel is open
											showSpecialPanel
											? activePanel === "flights"
												? "px-4"
												: "max-w-full px-6"
											: // Default: centered with max-width
												"mx-auto max-w-[760px]",
								)}
							>
								<ChatInput
									onSend={handleSendMessage}
									isLoading={isLoading || isStreaming}
									placeholder={
										activePanel === "flights"
											? "Ask about these flights..."
											: undefined
									}
								/>
							</div>
						</div>
					</main>

					{/* Special Panels (Flights Search, Saved Trips, Itinerary) */}
					{showSpecialPanel && (
						<aside
							className={cn(
								"hidden lg:flex flex-shrink-0 border-l border-gray-200 transition-all duration-300 overflow-hidden",
								activePanel === "flights" ? "flex-1" : "w-1/2",
							)}
						>
							{rightPanelContent}
						</aside>
					)}

					{/* Sliding Flight Detail Panel - 40% width when open */}
					<aside
						className={cn(
							"hidden lg:flex flex-shrink-0 transition-all duration-300 ease-out overflow-hidden",
							isPanelOpen ? "w-[40%] min-w-[500px] max-w-[700px]" : "w-0",
						)}
					>
						{isPanelOpen && <RightPanel className="w-full" />}
					</aside>
				</div>
			</div>

			{/* Mobile Panel Bottom Sheet */}
			{(showSpecialPanel || isPanelOpen) && (
				<div className="lg:hidden fixed inset-x-0 bottom-0 z-40">
					<MobileBottomSheet
						title={
							activePanel === "flights"
								? "Search Flights"
								: activePanel === "saved-trips"
									? "Saved Trips"
									: isPanelOpen
										? "Flight Details"
										: itineraryData?.trip_title || "Trip Planner"
						}
						icon={
							isPanelOpen ? (
								<Plane className="w-4 h-4 text-accent" />
							) : (
								<Map className="w-4 h-4 text-accent" />
							)
						}
					>
						{isPanelOpen ? <RightPanel /> : rightPanelContent}
					</MobileBottomSheet>
				</div>
			)}

			{/* Travel Date Picker Modal */}
			<TravelDatePicker
				isOpen={isDatePickerOpen}
				onClose={closeDatePicker}
				onConfirm={handleDateConfirm}
			/>
		</div>
	);
}

// Mobile bottom sheet
function MobileBottomSheet({
	title,
	children,
	icon,
}: {
	title: string;
	children: React.ReactNode;
	icon?: React.ReactNode;
}) {
	const [isExpanded, setIsExpanded] = useState(false);

	return (
		<>
			{/* Backdrop */}
			{isExpanded && (
				<div
					className="fixed inset-0 bg-black/30 z-30"
					onClick={() => setIsExpanded(false)}
				/>
			)}

			{/* Sheet */}
			<div
				className={cn(
					"relative z-40 bg-white border-t border-border shadow-lg transition-all duration-300",
					isExpanded ? "h-[80vh]" : "h-auto",
				)}
			>
				{/* Handle */}
				<button
					onClick={() => setIsExpanded(!isExpanded)}
					className="w-full flex items-center justify-center gap-2 py-3 border-b border-border"
				>
					{icon || <Map className="w-4 h-4 text-accent" />}
					<span className="text-sm font-medium text-ink">{title}</span>
					{isExpanded ? (
						<ChevronDown className="w-4 h-4 text-muted" />
					) : (
						<ChevronUp className="w-4 h-4 text-muted" />
					)}
				</button>

				{/* Content */}
				{isExpanded && (
					<div className="h-[calc(100%-52px)] overflow-hidden">{children}</div>
				)}
			</div>
		</>
	);
}
