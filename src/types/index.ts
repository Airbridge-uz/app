// ================================
// User Types
// ================================
export interface User {
	id: number;
	email: string;
	full_name?: string;
	phone?: string;
	preferred_currency: string;
	preferred_language: string;
	is_active?: boolean;
}

// ================================
// Auth Types
// ================================
export interface LoginCredentials {
	username: string; // OAuth2 spec uses 'username' for email
	password: string;
}

export interface RegisterData {
	email: string;
	password: string;
	full_name?: string;
}

export interface AuthToken {
	access_token: string;
	token_type: string;
}

// ================================
// Chat Types
// ================================
export interface ChatMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	isStreaming?: boolean;
	flightCards?: FlightCard[];
	suggestions?: Suggestion[];
	thoughtProcess?: string[];
	itineraryData?: ItineraryData;
}

export interface ChatRequest {
	message: string;
	session_id?: string;
	user_id?: number;
	stream?: boolean;
	save_trip?: boolean;
}

export interface ChatResponse {
	response: string;
	session_id: string;
	messages?: unknown[];
	flight_cards?: FlightCard[];
	search_info?: Record<string, unknown>;
	ui_components?: Record<string, unknown>;
	suggestions?: Suggestion[];
	itinerary_data?: Record<string, unknown>;
	saved_trip_id?: number;
	thought_process?: string[];
}

export interface Suggestion {
	label: string;
	value: string;
	type?: "magic_action" | "action" | "ui_trigger" | "query";
}

// Stream event types
export type StreamEventType =
	| "token"
	| "thinking"
	| "data_payload"
	| "done"
	| "error";

export interface StreamChunk {
	type: StreamEventType;
	content?: string;
	data?: unknown;
	session_id?: string;
	steps?: string[];
	action?: string;
	suggestions?: Suggestion[];
}

// ================================
// Flight Types (matching backend _create_rich_flight_for_frontend)
// ================================
export interface FlightCard {
	offer_id: string;
	rank: number;
	label?: "cheapest" | "fastest" | "best_value" | null;
	price: {
		total?: number;
		amount?: number;
		currency: string;
		formatted?: string;
		display?: string;
	};
	airline: {
		code: string;
		name: string;
		logo_url: string;
	};
	operating_carrier?: string;
	duration: {
		hours: number;
		minutes: number;
		total_minutes: number;
		formatted: string;
	};
	stops: {
		count: number;
		max: number;
	};
	slices: FlightSlice[];
	baggage?: {
		cabin?:
			| string
			| {
					allowed?: boolean;
					included?: boolean;
					quantity?: number;
			  };
		checked?:
			| string
			| {
					allowed?: boolean;
					included?: boolean;
					quantity?: number;
			  };
	};
	booking?: {
		url?: string;
		deep_link?: string;
	};
}

export interface FlightSlice {
	origin: {
		code: string;
		name: string;
		city: string;
		coordinates?: {
			lat: number;
			lon: number;
		};
	};
	destination: {
		code: string;
		name: string;
		city: string;
		coordinates?: {
			lat: number;
			lon: number;
		};
	};
	departure: {
		date: string;
		time: string;
		datetime?: string;
	};
	arrival: {
		date: string;
		time: string;
		datetime?: string;
	};
	duration: {
		hours: number;
		minutes: number;
		total_minutes: number;
	};
	stops: number;
	layovers: FlightLayover[];
	segments: FlightSegment[];
}

export interface FlightLayover {
	airport_code: string;
	city: string;
	duration_minutes?: number;
}

export interface FlightSegment {
	flight_number: string;
	airline: {
		code: string;
		name: string;
		logo_url?: string;
	};
	departure: {
		airport_code: string;
		time: string;
	};
	arrival: {
		airport_code: string;
		time: string;
	};
	duration_minutes: number;
	aircraft?: string;
}

// ================================
// Itinerary Types
// ================================
export interface ItineraryActivity {
	time: string;
	name: string;
	description: string;
	duration_minutes?: number;
	category: string;
	place_id?: number;
	insider_tip?: string;
	address?: string;
	latitude?: number;
	longitude?: number;
	price_level?: number;
	rating?: number;
	cover_image_url?: string;
	transit_to_next?: string;
}

export interface ItineraryDay {
	day_number: number;
	date?: string;
	title: string;
	theme: string;
	activities: ItineraryActivity[];
	estimated_cost?: number;
	currency?: string;
}

export interface ItineraryData {
	trip_title: string;
	city: string;
	country_code?: string;
	summary: string;
	days: ItineraryDay[];
	total_estimated_cost?: number;
	currency?: string;
	cultural_tips?: string[];
	best_time_to_visit?: string[];
	places_used: number;
	verified_places: number;
}

export interface ItineraryGrounding {
	city: string;
	days: number;
	places_used: number;
	verified_places: number;
	is_rag_grounded: boolean;
}

// ================================
// Conversation History Types
// ================================
export interface ConversationSummary {
	session_id: string;
	title: string;
	trip_id?: number;
	last_message_at?: string;
	message_count: number;
	preview?: string;
	has_flights: boolean;
	has_itinerary: boolean;
}

export interface ConversationDetail {
	session_id: string;
	title: string;
	messages: ChatMessage[];
	trip_id?: number;
	flight_cards?: FlightCard[];
	flight_cards_expired?: boolean;
	itinerary_data?: ItineraryData;
	itinerary_grounding?: ItineraryGrounding;
	created_at?: string;
	updated_at?: string;
}

// ================================
// Booking Types
// ================================
export interface PostBookingSuggestion {
	label: string;
	value: string;
	icon: string;
	type: "magic_action" | "action" | "ui_trigger" | "query";
}

export interface BookingSummary {
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
}

export interface PostBookingData {
	booking_summary: BookingSummary;
	suggestions: PostBookingSuggestion[];
	chat_context: string;
	next_steps: string[];
}

export interface BookingResult {
	success: boolean;
	booking_id: string;
	booking_reference: string;
	duffel_order_id: string;
	total_paid: number;
	currency: string;
	flights: Array<{
		origin: string;
		destination: string;
		departure: string;
		arrival: string;
		airline: string;
		flight_number: string;
	}>;
	passengers: Array<{
		name: string;
		ticket_number?: string;
	}>;
	confirmation_email_sent: boolean;
	documents?: Array<Record<string, unknown>>;
	post_booking?: PostBookingData;
}

export interface Booking {
	id: number;
	internal_booking_id: string;
	booking_reference?: string;
	origin: string;
	destination: string;
	departure_date: string;
	return_date?: string;
	total_price: number;
	currency: string;
	status: "CONFIRMED" | "PENDING" | "CANCELLED" | "FAILED";
	airline?: string;
	created_at: string;
	passengers_count?: number;
}
