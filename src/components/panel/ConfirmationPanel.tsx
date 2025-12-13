'use client';

import { useRouter } from 'next/navigation';
import { usePanelStore } from '@/stores/panelStore';
import { useChatStore } from '@/stores/chatStore';
import { cn } from '@/utils/cn';
import { 
    CheckCircle, 
    Download, 
    Mail, 
    ArrowRight, 
    Plane, 
    Lightbulb,
    MapPin,
    Shield,
    Hotel,
    Luggage,
    UtensilsCrossed,
    ChevronRight
} from 'lucide-react';

// Icon mapping for suggestions
const SUGGESTION_ICONS: Record<string, React.ReactNode> = {
    map: <MapPin className="w-4 h-4" />,
    passport: <Shield className="w-4 h-4" />,
    hotel: <Hotel className="w-4 h-4" />,
    luggage: <Luggage className="w-4 h-4" />,
    food: <UtensilsCrossed className="w-4 h-4" />,
};

export function ConfirmationPanel() {
    const router = useRouter();
    const { bookingResult, selectedFlight, resetPanel, closePanel } = usePanelStore();
    const { sendMessage, clearChat } = useChatStore();
    
    if (!bookingResult) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No booking information available</p>
            </div>
        );
    }
    
    const postBooking = bookingResult.post_booking;
    const outboundSlice = selectedFlight?.slices?.[0];
    
    // Use post_booking data if available, otherwise fallback to selectedFlight
    const originCode = postBooking?.booking_summary.origin_code || outboundSlice?.origin.code || 'XXX';
    const destCode = postBooking?.booking_summary.destination_code || outboundSlice?.destination.code || 'XXX';
    const originCity = postBooking?.booking_summary.origin_city || outboundSlice?.origin.city || originCode;
    const destCity = postBooking?.booking_summary.destination_city || outboundSlice?.destination.city || destCode;
    const departureDate = postBooking?.booking_summary.departure_date || outboundSlice?.departure.date || '';
    
    const formatDisplayDate = (dateStr: string) => {
        // If already formatted like "Dec 15, 2025", return as-is
        if (dateStr.includes(',')) return dateStr;
        
        try {
            const date = new Date(dateStr);
            const options: Intl.DateTimeFormatOptions = { 
                weekday: 'short', 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
            };
            return date.toLocaleDateString('en-US', options);
        } catch {
            return dateStr;
        }
    };
    
    const formatPrice = (amount: number, currency: string) => {
        const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency;
        return `${symbol}${amount.toFixed(2)}`;
    };
    
    // Handle suggestion click - sends message to chat
    const handleSuggestionClick = (suggestion: { label: string; value: string }) => {
        closePanel();
        sendMessage(suggestion.value);
    };
    
    // Handle view bookings
    const handleViewBookings = () => {
        closePanel();
        router.push('/bookings');
    };
    
    // Handle continue planning
    const handleContinuePlanning = () => {
        closePanel();
        // Optionally send a contextual message
        if (postBooking?.chat_context) {
            // The chat context is available for the LLM
        }
    };
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                {/* Success Header */}
                <div className="flex flex-col items-center justify-center py-10 px-6 bg-gradient-to-b from-green-50 to-white">
                    {/* Success Icon */}
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-sm">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    
                    {/* Success Message */}
                    <h1 className="text-xl font-semibold text-gray-900 mb-1">
                        Booking Confirmed!
                    </h1>
                    <p className="text-gray-500 text-sm text-center">
                        Your flight to {destCity} is booked
                    </p>
                </div>
                
                {/* Booking Reference */}
                <div className="mx-6 p-5 bg-gray-50 rounded-xl mb-5 -mt-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Booking Reference</p>
                    <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                        {bookingResult.booking_reference}
                    </p>
                </div>
                
                {/* Flight Summary Card */}
                <div className="mx-6 p-4 border border-gray-200 rounded-xl mb-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center">
                            <Plane className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 font-semibold text-gray-900">
                                <span>{originCity}</span>
                                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                                <span>{destCity}</span>
                            </div>
                            <p className="text-xs text-gray-500">
                                {formatDisplayDate(departureDate)}
                            </p>
                        </div>
                    </div>
                    
                    <div className="space-y-0 divide-y divide-gray-100">
                        <div className="flex justify-between py-2.5">
                            <span className="text-sm text-gray-500">Passengers</span>
                            <span className="text-sm font-medium text-gray-900">
                                {postBooking?.booking_summary.passengers_count || bookingResult.passengers.length}
                            </span>
                        </div>
                        
                        <div className="flex justify-between py-2.5">
                            <span className="text-sm text-gray-500">Total Paid</span>
                            <span className="text-sm font-semibold text-gray-900">
                                {formatPrice(bookingResult.total_amount, bookingResult.currency)}
                            </span>
                        </div>
                    </div>
                </div>
                
                {/* What's Next - Post-booking Suggestions */}
                {postBooking && postBooking.suggestions.length > 0 && (
                    <div className="mx-6 mb-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            <h3 className="text-sm font-medium text-gray-900">What's Next?</h3>
                        </div>
                        
                        <div className="space-y-2">
                            {postBooking.suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={cn(
                                        'w-full flex items-center gap-3 p-3 rounded-lg',
                                        'bg-amber-50 hover:bg-amber-100',
                                        'text-left transition-colors duration-150',
                                        'border border-amber-100'
                                    )}
                                >
                                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                        {SUGGESTION_ICONS[suggestion.icon] || <MapPin className="w-4 h-4" />}
                                    </div>
                                    <span className="flex-1 text-sm font-medium text-gray-800">
                                        {suggestion.label}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-amber-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Next Steps Checklist */}
                {postBooking && postBooking.next_steps.length > 0 && (
                    <div className="mx-6 mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-medium text-blue-900 mb-3">Before You Travel</h3>
                        <ul className="space-y-2">
                            {postBooking.next_steps.map((step, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                                    <span className="flex-shrink-0">{step.split(' ')[0]}</span>
                                    <span>{step.split(' ').slice(1).join(' ')}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                {/* Passenger List */}
                <div className="mx-6 mb-5">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Passengers</h3>
                    <div className="space-y-1.5">
                        {bookingResult.passengers.map((passenger, index) => (
                            <div 
                                key={index}
                                className="p-3 bg-gray-50 rounded-lg"
                            >
                                <p className="text-sm font-medium text-gray-900">{passenger.name}</p>
                                {passenger.ticket_number && (
                                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                                        Ticket: {passenger.ticket_number}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mx-6 space-y-2 mb-6">
                    <button
                        className={cn(
                            'w-full flex items-center justify-center gap-2 px-4 py-2.5',
                            'border border-gray-200 rounded-lg',
                            'text-sm font-medium text-gray-700',
                            'hover:bg-gray-50 transition-colors'
                        )}
                    >
                        <Download className="w-4 h-4" />
                        Download E-Ticket
                    </button>
                    
                    <button
                        className={cn(
                            'w-full flex items-center justify-center gap-2 px-4 py-2.5',
                            'border border-gray-200 rounded-lg',
                            'text-sm font-medium text-gray-700',
                            'hover:bg-gray-50 transition-colors'
                        )}
                    >
                        <Mail className="w-4 h-4" />
                        Email Confirmation
                    </button>
                </div>
            </div>
            
            {/* Bottom Actions */}
            <div className="sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 space-y-2">
                <button
                    onClick={handleViewBookings}
                    className={cn(
                        'w-full px-6 py-2.5 rounded-lg text-sm font-medium',
                        'border border-gray-200 text-gray-700',
                        'hover:bg-gray-50',
                        'transition-colors duration-200'
                    )}
                >
                    View My Bookings
                </button>
                
                <button
                    onClick={handleContinuePlanning}
                    className={cn(
                        'w-full px-6 py-2.5 rounded-lg text-sm font-medium',
                        'bg-gray-900 text-white',
                        'hover:bg-gray-800 active:bg-gray-950',
                        'transition-colors duration-200'
                    )}
                >
                    Continue Planning
                </button>
            </div>
        </div>
    );
}

export default ConfirmationPanel;
