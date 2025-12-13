'use client';

import { Heart, MapPin, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

// Placeholder for saved trips - will be connected to backend later
interface SavedTrip {
    id: number;
    title: string;
    city: string;
    days: number;
    created_at: string;
}

export function SavedTripsPanel() {
    // TODO: Connect to backend API for saved trips
    const savedTrips: SavedTrip[] = [];
    const isLoading = false;

    return (
        <div className="flex flex-col h-full bg-paper">
            {/* Header */}
            <div className="p-4 border-b border-border bg-white">
                <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-accent" />
                    <h2 className="font-semibold text-ink">Saved Trips</h2>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-muted animate-spin" />
                    </div>
                ) : savedTrips.length > 0 ? (
                    <div className="space-y-3">
                        {savedTrips.map((trip) => (
                            <button
                                key={trip.id}
                                className="w-full p-4 bg-white border border-border rounded-xl text-left hover:border-accent transition-colors"
                            >
                                <h3 className="font-medium text-ink">{trip.title}</h3>
                                <div className="flex items-center gap-3 mt-2 text-sm text-muted">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {trip.city}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {trip.days} days
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted">
                        <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-medium mb-1">No saved trips yet</p>
                        <p className="text-xs">
                            Generate an itinerary in chat and click &quot;Save Trip&quot; to save it here
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
