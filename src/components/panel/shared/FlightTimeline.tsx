'use client';

import { FlightSlice } from '@/types';
import { cn } from '@/utils/cn';
import { Briefcase, Luggage } from 'lucide-react';

interface FlightTimelineProps {
    slice: FlightSlice;
    airlineName?: string;
    className?: string;
}

export function FlightTimeline({ slice, airlineName, className }: FlightTimelineProps) {
    const formatDate = (dateStr: string | undefined, timeStr: string | undefined) => {
        if (!dateStr || !timeStr) return timeStr || dateStr || 'N/A';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return `${dateStr}, ${timeStr}`;
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${timeStr}`;
        } catch {
            return `${dateStr}, ${timeStr}`;
        }
    };
    
    const formatDuration = (minutes: number | undefined) => {
        if (!minutes) return 'N/A';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
    };
    
    // If no segments, show a simple departure/arrival view
    if (!slice.segments || slice.segments.length === 0) {
        return (
            <div className={cn('space-y-0', className)}>
                <div className="relative pl-8">
                    {/* Timeline Line */}
                    <div className="absolute left-[11px] top-6 bottom-6 w-px border-l-2 border-dashed border-gray-300" />
                    
                    {/* Departure Point */}
                    <div className="relative pb-4">
                        <div className="absolute left-[-26px] top-1.5 w-3 h-3 rounded-full border-2 border-gray-300 bg-white" />
                        <div className="text-sm">
                            <span className="font-semibold text-gray-900">
                                {formatDate(slice.departure?.date, slice.departure?.time)}
                            </span>
                            <span className="ml-3 text-gray-600">
                                Depart from {slice.origin?.name || slice.origin?.code || 'Origin'} ({slice.origin?.code || '---'})
                            </span>
                        </div>
                    </div>
                    
                    {/* Duration */}
                    <div className="relative pb-4 pl-2">
                        <p className="text-sm text-gray-500">
                            Flight duration: {formatDuration(slice.duration?.total_minutes)}
                        </p>
                    </div>
                    
                    {/* Arrival Point */}
                    <div className="relative pb-4">
                        <div className="absolute left-[-26px] top-1.5 w-3 h-3 rounded-full border-2 border-gray-300 bg-white" />
                        <div className="text-sm">
                            <span className="font-semibold text-gray-900">
                                {formatDate(slice.arrival?.date, slice.arrival?.time)}
                            </span>
                            <span className="ml-3 text-gray-600">
                                Arrive at {slice.destination?.name || slice.destination?.code || 'Destination'} ({slice.destination?.code || '---'})
                            </span>
                        </div>
                    </div>
                    
                    {/* Basic Tags */}
                    <div className="flex flex-wrap gap-2 pb-4 text-xs text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded">Economy</span>
                        {airlineName && (
                            <span className="px-2 py-1 bg-gray-100 rounded">{airlineName}</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className={cn('space-y-0', className)}>
            {slice.segments.map((segment, segIdx) => {
                // Safely extract departure/arrival times
                const depTime = segment?.departure?.time || slice.departure?.time || '';
                const arrTime = segment?.arrival?.time || slice.arrival?.time || '';
                const depAirport = segment?.departure?.airport_code || slice.origin?.code || '';
                const arrAirport = segment?.arrival?.airport_code || slice.destination?.code || '';
                const duration = segment?.duration_minutes || 0;
                
                return (
                    <div key={segment?.flight_number || segIdx}>
                        {/* Segment Timeline */}
                        <div className="relative pl-8">
                            {/* Timeline Line */}
                            <div className="absolute left-[11px] top-6 bottom-6 w-px border-l-2 border-dashed border-gray-300" />
                            
                            {/* Departure Point */}
                            <div className="relative pb-4">
                                {/* Circle marker */}
                                <div className="absolute left-[-26px] top-1.5 w-3 h-3 rounded-full border-2 border-gray-300 bg-white" />
                                
                                <div className="text-sm">
                                    <span className="font-semibold text-gray-900">
                                        {formatDate(slice.departure?.date, depTime)}
                                    </span>
                                    <span className="ml-3 text-gray-600">
                                        Depart from {segIdx === 0 ? (slice.origin?.name || depAirport) : depAirport} ({depAirport})
                                    </span>
                                </div>
                            </div>
                            
                            {/* Duration */}
                            <div className="relative pb-4 pl-2">
                                <p className="text-sm text-gray-500">
                                    Flight duration: {formatDuration(duration)}
                                </p>
                            </div>
                            
                            {/* Arrival Point */}
                            <div className="relative pb-4">
                                {/* Circle marker */}
                                <div className="absolute left-[-26px] top-1.5 w-3 h-3 rounded-full border-2 border-gray-300 bg-white" />
                                
                                <div className="text-sm">
                                    <span className="font-semibold text-gray-900">
                                        {formatDate(slice.arrival?.date, arrTime)}
                                    </span>
                                    <span className="ml-3 text-gray-600">
                                        Arrive at {segIdx === slice.segments.length - 1 ? (slice.destination?.name || arrAirport) : arrAirport} ({arrAirport})
                                    </span>
                                </div>
                            </div>
                            
                            {/* Segment Details Tags */}
                            <div className="flex flex-wrap gap-2 pb-4 text-xs text-gray-600">
                                <span className="px-2 py-1 bg-gray-100 rounded">Economy</span>
                                <span className="px-2 py-1 bg-gray-100 rounded">{segment?.airline?.name || airlineName || 'Airline'}</span>
                                {segment?.aircraft && (
                                    <span className="px-2 py-1 bg-gray-100 rounded">{segment.aircraft}</span>
                                )}
                                {segment?.flight_number && (
                                    <span className="px-2 py-1 bg-gray-100 rounded">{segment.flight_number}</span>
                                )}
                                <span className="px-2 py-1 bg-gray-100 rounded inline-flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    1 carry-on bag
                                </span>
                                <span className="px-2 py-1 bg-gray-100 rounded inline-flex items-center gap-1">
                                    <Luggage className="w-3 h-3" />
                                    1 checked bag
                                </span>
                            </div>
                        </div>
                        
                        {/* Layover (if not last segment) */}
                        {segIdx < slice.segments.length - 1 && slice.layovers?.[segIdx] && (
                            <div className="my-4 mx-4 px-4 py-3 bg-amber-50 rounded-lg text-sm text-amber-800 border border-amber-100">
                                {formatDuration(slice.layovers[segIdx]?.duration_minutes)} layover at {slice.layovers[segIdx]?.city || 'Airport'} ({slice.layovers[segIdx]?.airport_code || '---'})
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default FlightTimeline;

