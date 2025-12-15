import { create } from "zustand";
import { FlightCard } from "@/types";

// ================================
// Panel View States
// ================================
export type PanelView =
	| "flight-detail"
	| "fare-selection"
	| "passenger-details"
	| "confirmation";

// ================================
// Fare Option Type
// ================================
export interface FareOption {
	id: string;
	cabin_class: string;
	fare_brand_name: string;
	price: {
		total: number;
		currency: string;
	};
	conditions: {
		changeable: boolean;
		change_fee?: number;
		refundable: boolean;
		refund_fee?: number;
	};
	baggage: {
		cabin: {
			included: boolean;
			quantity?: number;
		};
		checked: {
			included: boolean;
			quantity?: number;
			weight_kg?: number;
		};
	};
	seat_selection?: boolean;
	meal_included?: boolean;
}

// ================================
// Passenger Type
// ================================
export interface PassengerDetails {
	id: string;
	type: "adult" | "child" | "infant";
	title: string;
	given_name: string;
	family_name: string;
	date_of_birth: string;
	gender: "male" | "female";
	email?: string;
	phone?: string;
	// Passport details (for international)
	passport_number?: string;
	passport_expiry?: string;
	nationality?: string;
}

// ================================
// Contact Details Type
// ================================
export interface ContactDetails {
	email: string;
	phone: string;
}

// ================================
// Booking Result Type
// ================================
export interface BookingResult {
	booking_reference: string;
	booking_id: string;
	duffel_order_id?: string;
	status: "confirmed" | "pending" | "failed";
	total_amount: number;
	currency: string;
	passengers: Array<{
		name: string;
		ticket_number?: string;
	}>;
	flights?: Array<{
		origin: string;
		destination: string;
		departure: string;
		arrival: string;
		airline: string;
		flight_number: string;
	}>;
	created_at: string;
	// Post-booking context
	post_booking?: {
		booking_summary: {
			booking_id: string;
			booking_reference: string;
			origin_code: string;
			origin_city: string;
			destination_code: string;
			destination_city: string;
			departure_date: string;
			return_date?: string | null;
			airline?: string | null;
			total_paid: number;
			currency: string;
			passengers_count: number;
			is_international: boolean;
		};
		suggestions: Array<{
			label: string;
			value: string;
			icon: string;
			type: string;
		}>;
		chat_context: string;
		next_steps: string[];
	};
}

// ================================
// Panel State
// ================================
interface PanelState {
	// Panel visibility
	isOpen: boolean;

	// Current view
	currentView: PanelView;

	// Selected flight offer
	selectedFlight: FlightCard | null;

	// Available fare options (fetched after selecting flight)
	fareOptions: FareOption[];

	// Selected fare
	selectedFare: FareOption | null;

	// Payment timing
	paymentTiming: "pay_now" | "hold";

	// Contact details
	contactDetails: ContactDetails;

	// Passenger details
	passengers: PassengerDetails[];

	// Booking result
	bookingResult: BookingResult | null;

	// Loading states
	isLoading: boolean;
	isLoadingFares: boolean;
	isSubmitting: boolean;

	// Error state
	error: string | null;
}

// ================================
// Panel Actions
// ================================
interface PanelActions {
	// Panel visibility
	openPanel: (flight: FlightCard) => void;
	closePanel: () => void;

	// Navigation
	selectFlight: (flight: FlightCard) => void;
	selectFare: (fare: FareOption) => void;
	goBack: () => void;
	resetPanel: () => void;
	setView: (view: PanelView) => void;

	// Data updates
	setFareOptions: (fares: FareOption[]) => void;
	setPaymentTiming: (timing: "pay_now" | "hold") => void;
	updateContactDetails: (details: Partial<ContactDetails>) => void;
	updatePassenger: (index: number, details: Partial<PassengerDetails>) => void;
	addPassenger: (type: "adult" | "child" | "infant") => void;
	removePassenger: (index: number) => void;

	// Booking
	submitBooking: () => Promise<void>;
	setBookingResult: (result: BookingResult) => void;

	// Loading & Error
	setLoading: (loading: boolean) => void;
	setLoadingFares: (loading: boolean) => void;
	setSubmitting: (submitting: boolean) => void;
	setError: (error: string | null) => void;
}

// ================================
// Initial State
// ================================
const initialState: PanelState = {
	isOpen: false,
	currentView: "flight-detail",
	selectedFlight: null,
	fareOptions: [],
	selectedFare: null,
	paymentTiming: "pay_now",
	contactDetails: {
		email: "",
		phone: "",
	},
	passengers: [],
	bookingResult: null,
	isLoading: false,
	isLoadingFares: false,
	isSubmitting: false,
	error: null,
};

// ================================
// Create Store
// ================================
export const usePanelStore = create<PanelState & PanelActions>((set, get) => ({
	...initialState,

	// ============================
	// Panel Visibility Actions
	// ============================
	openPanel: (flight: FlightCard) => {
		console.log("[PanelStore] Opening panel with flight:", flight.offer_id);
		set({
			isOpen: true,
			selectedFlight: flight,
			currentView: "flight-detail",
			selectedFare: null,
			fareOptions: [],
			error: null,
			// Initialize with one adult passenger
			passengers: [
				{
					id: `pax_${Date.now()}`,
					type: "adult",
					title: "Mr",
					given_name: "",
					family_name: "",
					date_of_birth: "",
					gender: "male",
				},
			],
		});
	},

	closePanel: () => {
		console.log("[PanelStore] Closing panel");
		set({
			isOpen: false,
			selectedFlight: null,
			currentView: "flight-detail",
			selectedFare: null,
			fareOptions: [],
			error: null,
		});
	},

	// ============================
	// Navigation Actions
	// ============================
	selectFlight: (flight: FlightCard) => {
		// Alias for openPanel for backwards compatibility
		console.log("[PanelStore] Selecting flight:", flight.offer_id);
		set({
			isOpen: true,
			selectedFlight: flight,
			currentView: "flight-detail",
			selectedFare: null,
			fareOptions: [],
			error: null,
			// Initialize with one adult passenger
			passengers: [
				{
					id: `pax_${Date.now()}`,
					type: "adult",
					title: "Mr",
					given_name: "",
					family_name: "",
					date_of_birth: "",
					gender: "male",
				},
			],
		});
	},

	selectFare: (fare: FareOption) => {
		console.log("[PanelStore] Selecting fare:", fare.fare_brand_name);
		set({
			selectedFare: fare,
			currentView: "passenger-details",
			error: null,
		});
	},

	goBack: () => {
		const { currentView } = get();
		const viewOrder: PanelView[] = [
			"flight-detail",
			"fare-selection",
			"passenger-details",
			"confirmation",
		];
		const currentIndex = viewOrder.indexOf(currentView);

		if (currentIndex > 0) {
			set({
				currentView: viewOrder[currentIndex - 1],
				error: null,
			});
		} else {
			// At first view, close the panel
			set({ isOpen: false, selectedFlight: null });
		}
	},

	resetPanel: () => {
		console.log("[PanelStore] Resetting panel");
		set(initialState);
	},

	setView: (view: PanelView) => {
		set({ currentView: view, error: null });
	},

	// ============================
	// Data Update Actions
	// ============================
	setFareOptions: (fares: FareOption[]) => {
		set({ fareOptions: fares });
	},

	setPaymentTiming: (timing: "pay_now" | "hold") => {
		set({ paymentTiming: timing });
	},

	updateContactDetails: (details: Partial<ContactDetails>) => {
		const { contactDetails } = get();
		set({
			contactDetails: { ...contactDetails, ...details },
		});
	},

	updatePassenger: (index: number, details: Partial<PassengerDetails>) => {
		const { passengers } = get();
		const updated = [...passengers];
		if (updated[index]) {
			updated[index] = { ...updated[index], ...details };
			set({ passengers: updated });
		}
	},

	addPassenger: (type: "adult" | "child" | "infant") => {
		const { passengers } = get();
		set({
			passengers: [
				...passengers,
				{
					id: `pax_${Date.now()}`,
					type,
					title: type === "adult" ? "Mr" : "",
					given_name: "",
					family_name: "",
					date_of_birth: "",
					gender: "male",
				},
			],
		});
	},

	removePassenger: (index: number) => {
		const { passengers } = get();
		if (passengers.length > 1) {
			set({
				passengers: passengers.filter((_, i) => i !== index),
			});
		}
	},

	// ============================
	// Booking Actions
	// ============================
	submitBooking: async () => {
		const { selectedFlight, selectedFare, passengers, contactDetails } = get();

		if (!selectedFlight || !selectedFare) {
			set({ error: "Missing flight or fare selection" });
			return;
		}

		set({ isSubmitting: true, error: null });

		try {
			// TODO: Call actual booking API
			// const response = await createBooking({
			//     offer_id: selectedFlight.offer_id,
			//     fare_id: selectedFare.id,
			//     passengers,
			//     contact: contactDetails,
			// });

			// Simulate API call for now
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Mock success response
			const mockResult: BookingResult = {
				booking_reference: `TRV${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
				order_id: `ord_${Date.now()}`,
				status: "confirmed",
				total_amount: selectedFare.price.total,
				currency: selectedFare.price.currency,
				passengers: passengers.map((p) => ({
					name: `${p.given_name} ${p.family_name}`,
					ticket_number: `TKT${Math.random().toString().substring(2, 15)}`,
				})),
				created_at: new Date().toISOString(),
			};

			set({
				bookingResult: mockResult,
				currentView: "confirmation",
				isSubmitting: false,
			});
		} catch (error) {
			console.error("[PanelStore] Booking failed:", error);
			set({
				error:
					error instanceof Error
						? error.message
						: "Booking failed. Please try again.",
				isSubmitting: false,
			});
		}
	},

	setBookingResult: (result: BookingResult) => {
		set({ bookingResult: result });
	},

	// ============================
	// Loading & Error Actions
	// ============================
	setLoading: (loading: boolean) => {
		set({ isLoading: loading });
	},

	setLoadingFares: (loading: boolean) => {
		set({ isLoadingFares: loading });
	},

	setSubmitting: (submitting: boolean) => {
		set({ isSubmitting: submitting });
	},

	setError: (error: string | null) => {
		set({ error });
	},
}));

// ================================
// Selectors
// ================================
export const selectCurrentView = (state: PanelState) => state.currentView;
export const selectSelectedFlight = (state: PanelState) => state.selectedFlight;
export const selectTotalPrice = (state: PanelState) => {
	if (state.selectedFare) {
		return state.selectedFare.price;
	}
	if (state.selectedFlight) {
		return {
			total:
				state.selectedFlight.price.total ??
				state.selectedFlight.price.amount ??
				0,
			currency: state.selectedFlight.price.currency,
		};
	}
	return null;
};
