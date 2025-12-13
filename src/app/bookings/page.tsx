'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/stores/authStore';
import { Booking } from '@/types';
import { cn } from '@/utils/cn';
import { 
    Plane, 
    ArrowRight, 
    Calendar,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    ChevronRight,
    Ticket,
    MessageSquare
} from 'lucide-react';

// Status badge configurations
const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    CONFIRMED: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: <CheckCircle className="w-3.5 h-3.5" />
    },
    PENDING: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        icon: <Clock className="w-3.5 h-3.5" />
    },
    CANCELLED: {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        icon: <XCircle className="w-3.5 h-3.5" />
    },
    FAILED: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: <AlertCircle className="w-3.5 h-3.5" />
    },
};

export default function BookingsPage() {
    const router = useRouter();
    const { user, isAuthenticated, token } = useAuthStore();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        // Redirect to login if not authenticated
        if (!isAuthenticated || !token) {
            router.push('/login?redirect=/bookings');
            return;
        }
        
        fetchBookings();
    }, [isAuthenticated, token, router]);
    
    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${API_URL}/api/v1/bookings/my-bookings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    router.push('/login?redirect=/bookings');
                    return;
                }
                throw new Error('Failed to fetch bookings');
            }
            
            const data = await response.json();
            setBookings(data);
        } catch (err) {
            console.error('Failed to fetch bookings:', err);
            setError(err instanceof Error ? err.message : 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };
    
    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };
    
    const formatPrice = (amount: number, currency: string) => {
        const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency + ' ';
        return `${symbol}${amount.toFixed(2)}`;
    };
    
    // Get city name from airport code (basic mapping)
    const getCity = (code: string) => {
        const cities: Record<string, string> = {
            'TAS': 'Tashkent',
            'LHR': 'London',
            'JFK': 'New York',
            'CDG': 'Paris',
            'DXB': 'Dubai',
            'IST': 'Istanbul',
        };
        return cities[code] || code;
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            
            <main className="max-w-3xl mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-gray-900">My Bookings</h1>
                    <p className="text-gray-500 mt-1">View and manage your flight bookings</p>
                </div>
                
                {/* Loading State */}
                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                                    <div className="flex-1">
                                        <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
                                        <div className="h-4 bg-gray-200 rounded w-24" />
                                    </div>
                                    <div className="h-6 bg-gray-200 rounded w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                        <p className="text-red-700 font-medium">{error}</p>
                        <button 
                            onClick={fetchBookings}
                            className="mt-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}
                
                {/* Empty State */}
                {!loading && !error && bookings.length === 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Ticket className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
                        <p className="text-gray-500 mb-6">
                            You haven't made any flight bookings yet. Start planning your next trip!
                        </p>
                        <Link 
                            href="/chat"
                            className={cn(
                                'inline-flex items-center gap-2 px-6 py-3 rounded-lg',
                                'bg-gray-900 text-white font-medium',
                                'hover:bg-gray-800 transition-colors'
                            )}
                        >
                            <MessageSquare className="w-4 h-4" />
                            Start Planning
                        </Link>
                    </div>
                )}
                
                {/* Bookings List */}
                {!loading && !error && bookings.length > 0 && (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            const status = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
                            
                            return (
                                <div 
                                    key={booking.internal_booking_id}
                                    className={cn(
                                        'bg-white rounded-xl border border-gray-200',
                                        'hover:border-gray-300 hover:shadow-sm',
                                        'transition-all duration-200 cursor-pointer'
                                    )}
                                    onClick={() => router.push(`/bookings/${booking.internal_booking_id}`)}
                                >
                                    <div className="p-5">
                                        {/* Top Row: Route and Status */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Plane className="w-5 h-5 text-gray-600" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 font-semibold text-gray-900">
                                                        <span>{getCity(booking.origin)}</span>
                                                        <ArrowRight className="w-4 h-4 text-gray-400" />
                                                        <span>{getCity(booking.destination)}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>{formatDate(booking.departure_date)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Status Badge */}
                                            <div className={cn(
                                                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
                                                status.bg,
                                                status.text
                                            )}>
                                                {status.icon}
                                                <span>{booking.status}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Bottom Row: Reference and Price */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                            <div>
                                                <span className="text-xs text-gray-500">Reference: </span>
                                                <span className="text-sm font-mono font-medium text-gray-900">
                                                    {booking.booking_reference || booking.internal_booking_id.slice(-8).toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-900">
                                                    {formatPrice(booking.total_price, booking.currency)}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                
                {/* Back to Chat Link */}
                {!loading && bookings.length > 0 && (
                    <div className="mt-8 text-center">
                        <Link 
                            href="/chat"
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            ← Back to Chat
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
