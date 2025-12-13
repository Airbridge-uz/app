'use client';

import { useState } from 'react';
import { FlightCard } from '@/types';
import { cn } from '@/utils/cn';
import { ChevronDown, ChevronUp, Loader2, AlertTriangle, Plane } from 'lucide-react';
import { getOfferDetails, OfferDetails } from '@/lib/api/flights';
import { formatDuration } from '@/utils/format';
import { usePanelStore } from '@/stores/panelStore';

interface DuffelFlightCardProps {
    flight: FlightCard;
    onSelect?: (flight: FlightCard) => void;
    compact?: boolean;
    isSelected?: boolean;
}

export function DuffelFlightCard({ flight, onSelect, compact = false, isSelected = false }: DuffelFlightCardProps) {
    const { selectFlight, selectedFlight } = usePanelStore();
    
    // Determine if this card is the currently selected one
    const isCurrentlySelected = isSelected || (selectedFlight?.offer_id === flight.offer_id);
    const [isExpanded, setIsExpanded] = useState(false);
    const [offerDetails, setOfferDetails] = useState<OfferDetails | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extract data from the first slice (outbound)
    const outboundSlice = flight.slices?.[0];
    const originCode = outboundSlice?.origin.code || 'XXX';
    const destCode = outboundSlice?.destination.code || 'XXX';

    // Parse times from slice or fallback
    const startTime = outboundSlice?.departure.time?.slice(0, 5) || "00:00";
    const endTime = outboundSlice?.arrival.time?.slice(0, 5) || "00:00";

    // Duration calculation
    const durationHours = outboundSlice?.duration?.hours || Math.floor((flight.duration?.total_minutes || 0) / 60);
    const durationMinutes = outboundSlice?.duration?.minutes || ((flight.duration?.total_minutes || 0) % 60);

    // Stops info
    const stopsCount = flight.stops?.count ?? outboundSlice?.stops ?? 0;
    const layovers = outboundSlice?.layovers || [];
    const firstLayover = layovers[0];

    // Build layover display string
    const getLayoverDisplay = () => {
        if (stopsCount === 0) return null;
        if (firstLayover) {
            const durationMins = firstLayover.duration_minutes;
            if (durationMins) {
                const hours = Math.floor(durationMins / 60);
                const mins = durationMins % 60;
                return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${firstLayover.airport_code}`;
            }
            return firstLayover.airport_code;
        }
        return null;
    };

    // Get flight numbers from segments
    const getFlightNumbers = () => {
        const segments = outboundSlice?.segments || [];
        if (segments.length === 0) return flight.airline?.code || '';
        return segments.map(s => s.flight_number).join(', ');
    };

    // Format price with currency symbol
    const formatPrice = (price: number, currency: string) => {
        const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
        return `${symbol}${price.toFixed(2)}`;
    };

    const handleToggle = async () => {
        if (!isExpanded && !offerDetails && !isLoadingDetails) {
            // Fetch details when expanding for the first time
            setIsLoadingDetails(true);
            setError(null);
            try {
                const response = await getOfferDetails(flight.offer_id);
                setOfferDetails(response.offer);
            } catch (err) {
                console.error('Failed to fetch offer details:', err);
                setError('Failed to load offer details. The offer may have expired.');
            } finally {
                setIsLoadingDetails(false);
            }
        }
        setIsExpanded(!isExpanded);
    };

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Open the flight detail panel
        selectFlight(flight);
        // Also call the onSelect callback if provided
        onSelect?.(flight);
    };

    const priceValue = flight.price?.total ?? flight.price?.amount ?? 0;
    const currency = flight.price?.currency || 'GBP';

    // Compact card for carousel display
    if (compact) {
        return (
            <div 
                className={cn(
                    "bg-white rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer",
                    isCurrentlySelected 
                        ? "border-gray-900 ring-2 ring-gray-900/10 shadow-lg" 
                        : "border-gray-200 hover:shadow-lg hover:border-gray-300"
                )}
                onClick={handleSelect}
            >
                {/* Main Card Content */}
                <div className="p-5">
                    <div className="flex items-center gap-5">
                        {/* Airline Logo */}
                        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                            {flight.airline?.logo_url ? (
                                <img
                                    src={flight.airline.logo_url}
                                    alt={flight.airline.name || flight.airline.code}
                                    className="w-10 h-10 object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={cn(
                                "w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500",
                                flight.airline?.logo_url ? "hidden" : "flex"
                            )}>
                                {flight.airline?.code || "AIR"}
                            </div>
                        </div>

                        {/* Flight Info */}
                        <div className="flex-1 grid grid-cols-3 gap-4">
                            {/* Times & Airline */}
                            <div>
                                <div className="text-base font-semibold text-gray-900">
                                    {startTime} – {endTime}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                    {flight.airline?.name || 'Airline'} · {getFlightNumbers()}
                                </div>
                            </div>

                            {/* Duration & Route */}
                            <div className="text-center">
                                <div className="text-base font-semibold text-gray-900">
                                    {String(durationHours).padStart(2, '0')}h {String(durationMinutes).padStart(2, '0')}m
                                </div>
                                <div className="text-sm text-gray-500">
                                    {originCode} – {destCode}
                                </div>
                            </div>

                            {/* Stops */}
                            <div className="text-right">
                                <div className="text-base font-semibold text-gray-900">
                                    {stopsCount === 0 ? 'Non-stop' : `${stopsCount} stop${stopsCount > 1 ? 's' : ''}`}
                                </div>
                                {getLayoverDisplay() && (
                                    <div className="text-sm text-gray-500">
                                        {getLayoverDisplay()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Price & Select Row */}
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-gray-500">From</span>
                        <span className="text-2xl font-semibold text-gray-900 ml-2">
                            {formatPrice(priceValue, currency)}
                        </span>
                    </div>
                    <button
                        onClick={handleSelect}
                        className={cn(
                            "px-6 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150",
                            isCurrentlySelected
                                ? "bg-gray-100 text-gray-900 border border-gray-900"
                                : "bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950"
                        )}
                    >
                        {isCurrentlySelected ? 'Selected' : 'Select'}
                    </button>
                </div>
            </div>
        );
    }

    // Full card with expandable details
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg">
            {/* Main Card Row */}
            <div
                className="flex items-center p-5 cursor-pointer"
                onClick={handleToggle}
            >
                {/* Airline Logo */}
                <div className="w-14 h-14 flex-shrink-0 flex items-center justify-center mr-6">
                    {flight.airline?.logo_url ? (
                        <img
                            src={flight.airline.logo_url}
                            alt={flight.airline.name || flight.airline.code}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    <div className={cn(
                        "w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500",
                        flight.airline?.logo_url ? "hidden" : "flex"
                    )}>
                        {flight.airline?.code || "AIR"}
                    </div>
                </div>

                {/* Flight Details */}
                <div className="flex-1 flex items-center gap-8">
                    {/* Times & Airline Info */}
                    <div className="min-w-[180px]">
                        <div className="text-lg font-semibold text-gray-900">
                            {startTime} – {endTime}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {flight.airline?.name || 'Airline'} · {getFlightNumbers()}
                        </div>
                    </div>

                    {/* Duration & Route */}
                    <div className="min-w-[100px] text-center">
                        <div className="text-lg font-semibold text-gray-900">
                            {String(durationHours).padStart(2, '0')}h {String(durationMinutes).padStart(2, '0')}m
                        </div>
                        <div className="text-sm text-gray-500">
                            {originCode} – {destCode}
                        </div>
                    </div>

                    {/* Stops */}
                    <div className="min-w-[120px] text-right">
                        <div className="text-lg font-semibold text-gray-900">
                            {stopsCount === 0 ? 'Non-stop' : `${stopsCount} stop${stopsCount > 1 ? 's' : ''}`}
                        </div>
                        {getLayoverDisplay() && (
                            <div className="text-sm text-gray-500">
                                {getLayoverDisplay()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Price & Select Button */}
                <div className="flex items-center gap-6 ml-8 pl-6 border-l border-gray-100">
                    <div className="text-right">
                        <div className="text-xs text-gray-500 mb-0.5">From</div>
                        <div className="text-2xl font-semibold text-gray-900">
                            {formatPrice(priceValue, currency)}
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggle();
                        }}
                        className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 active:bg-gray-950 transition-colors duration-150 flex items-center gap-2"
                    >
                        Select
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 animate-[slideDown_200ms_ease-out]">
                    {isLoadingDetails ? (
                        <div className="p-8 flex flex-col items-center justify-center">
                            <Loader2 className="w-6 h-6 text-gray-400 animate-spin mb-2" />
                            <span className="text-sm text-gray-500">Loading flight details...</span>
                        </div>
                    ) : error ? (
                        <div className="p-6 flex flex-col items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-amber-500 mb-2" />
                            <span className="text-sm text-gray-600">{error}</span>
                        </div>
                    ) : offerDetails ? (
                        <div className="p-6 space-y-4">
                            {/* Slices / Legs */}
                            {offerDetails.slices.map((slice, idx) => (
                                <div key={slice.slice_id || idx} className="bg-white rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-semibold uppercase text-gray-500 tracking-wide">
                                            {idx === 0 ? 'Outbound Flight' : 'Return Flight'}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {formatDuration(slice.duration.total_minutes)}
                                        </span>
                                    </div>

                                    {/* Segments */}
                                    <div className="space-y-3">
                                        {slice.segments.map((seg, segIdx) => (
                                            <div key={seg.segment_id || segIdx}>
                                                <div className="flex items-center gap-4">
                                                    {/* Segment Origin */}
                                                    <div className="text-center min-w-[80px]">
                                                        <div className="text-lg font-semibold text-gray-900">{seg.departure.time}</div>
                                                        <div className="text-sm font-medium text-gray-700">{seg.origin.airport_code}</div>
                                                        <div className="text-xs text-gray-500">{seg.origin.city}</div>
                                                    </div>

                                                    {/* Flight Line */}
                                                    <div className="flex-1 flex items-center gap-2">
                                                        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                                                        <div className="flex flex-col items-center">
                                                            <Plane className="w-4 h-4 text-gray-400 rotate-90" />
                                                            <span className="text-xs text-gray-500 mt-1">{seg.flight_number}</span>
                                                        </div>
                                                        <div className="flex-1 border-t-2 border-dashed border-gray-300" />
                                                    </div>

                                                    {/* Segment Destination */}
                                                    <div className="text-center min-w-[80px]">
                                                        <div className="text-lg font-semibold text-gray-900">{seg.arrival.time}</div>
                                                        <div className="text-sm font-medium text-gray-700">{seg.destination.airport_code}</div>
                                                        <div className="text-xs text-gray-500">{seg.destination.city}</div>
                                                    </div>
                                                </div>

                                                {/* Segment Meta */}
                                                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span>{seg.operating_carrier?.name || flight.airline?.name}</span>
                                                    <span>•</span>
                                                    <span>{seg.aircraft?.model || 'Aircraft TBD'}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{seg.cabin_class?.toLowerCase() || 'Economy'}</span>
                                                </div>

                                                {/* Layover indicator */}
                                                {segIdx < slice.segments.length - 1 && slice.layovers[segIdx] && (
                                                    <div className="my-3 flex items-center justify-center">
                                                        <div className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full">
                                                            Layover: {slice.layovers[segIdx].duration_formatted} in {slice.layovers[segIdx].city} ({slice.layovers[segIdx].airport_code})
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Policies */}
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'px-3 py-1.5 rounded-full text-xs font-medium',
                                    offerDetails.policies.refundable
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                )}>
                                    {offerDetails.policies.refundable ? '✓ Refundable' : 'Non-refundable'}
                                </div>
                                <div className={cn(
                                    'px-3 py-1.5 rounded-full text-xs font-medium',
                                    offerDetails.policies.changeable
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-gray-100 text-gray-600'
                                )}>
                                    {offerDetails.policies.changeable ? '✓ Changeable' : 'No changes'}
                                </div>
                                {offerDetails.metadata?.cabin_class && (
                                    <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 capitalize">
                                        {offerDetails.metadata.cabin_class.toLowerCase()}
                                    </div>
                                )}
                            </div>

                            {/* Expiration Warning */}
                            {offerDetails.booking_info?.expires_soon && !offerDetails.booking_info.is_expired && (
                                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-4 py-2 rounded-lg">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>This offer expires in {offerDetails.booking_info.expires_in_minutes} minutes</span>
                                </div>
                            )}

                            {/* Price Breakdown */}
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm text-gray-500">Total Price</div>
                                        <div className="text-2xl font-bold text-gray-900">
                                            {formatPrice(offerDetails.price.total, offerDetails.price.currency)}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Base: {formatPrice(offerDetails.price.base, offerDetails.price.currency)} +
                                            Tax: {formatPrice(offerDetails.price.tax, offerDetails.price.currency)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onSelect?.(flight)}
                                        className="bg-gray-900 text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 active:bg-gray-950 transition-colors duration-150"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            {/* Animation styles */}
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
