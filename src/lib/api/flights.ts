"use client";

import { apiClient } from "./client";

export interface OfferDetails {
	offer_id: string;
	airline: {
		name: string;
		code: string;
		logo: string;
	};
	price: {
		total: number;
		currency: string;
		base: number;
		tax: number;
	};
	slices: Array<{
		slice_id: string;
		origin: {
			airport_code: string;
			city: string;
			timezone?: string;
		};
		destination: {
			airport_code: string;
			city: string;
			timezone?: string;
		};
		departure: {
			date: string;
			time: string;
			datetime: string;
			iso: string;
		};
		arrival: {
			date: string;
			time: string;
			datetime: string;
			iso: string;
		};
		duration: {
			hours: number;
			minutes: number;
			total_minutes: number;
		};
		stops: number;
		segments: Array<{
			segment_id: string;
			origin: {
				airport_code: string;
				airport_name: string;
				city: string;
			};
			destination: {
				airport_code: string;
				airport_name: string;
				city: string;
			};
			departure: {
				date: string;
				time: string;
			};
			arrival: {
				date: string;
				time: string;
			};
			duration: {
				hours: number;
				minutes: number;
				total_minutes: number;
			};
			operating_carrier: {
				name: string;
				code: string;
				logo: string;
			};
			flight_number: string;
			aircraft: {
				model: string;
				code: string;
			};
			cabin_class: string;
		}>;
		layovers: Array<{
			airport_code: string;
			airport_name: string;
			city: string;
			duration_minutes: number;
			duration_formatted: string;
		}>;
	}>;
	policies: {
		refundable: boolean;
		changeable: boolean;
		refund_penalty?: {
			amount: number;
			currency: string;
		};
		change_penalty?: {
			amount: number;
			currency: string;
		};
	};
	booking_info: {
		expires_at: string;
		expires_in_minutes: number;
		is_expired: boolean;
		expires_soon: boolean;
		passenger_identity_documents_required: boolean;
	};
	metadata: {
		cabin_class: string;
		fare_brand?: string;
		emissions_kg?: number;
		emissions_label?: string;
	};
}

export interface OfferResponse {
	offer: OfferDetails;
	price_change?: {
		changed: boolean;
		old_price: number;
		new_price: number;
		difference: number;
		percent_change: number;
		increased: boolean;
	};
	cached: boolean;
}

/**
 * Get detailed offer information from Duffel API
 * Use this when user clicks on a flight card
 */
export async function getOfferDetails(offerId: string): Promise<OfferResponse> {
	const response = await apiClient.get<OfferResponse>(
		`/api/v1/duffel-search/offers/${offerId}`,
		{
			params: {
				include_services: true,
				detect_price_changes: true,
			},
		},
	);
	return response.data;
}
