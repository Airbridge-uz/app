'use client';

import { useState, useEffect, useRef } from 'react';
import { airportService, Airport } from '@/services/airportService';
import { cn } from '@/utils/cn';
import { Plane, MapPin, Loader2 } from 'lucide-react';

interface AirportAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label: string;
}

export function AirportAutocomplete({ value, onChange, placeholder, label }: AirportAutocompleteProps) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<Airport[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Update internal query when prop value changes (e.g. initial load or reset)
    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchTimer = setTimeout(async () => {
            if (query.length >= 1 && isOpen) {
                setIsLoading(true);
                const airports = await airportService.search(query);
                setResults(airports);
                setIsLoading(false);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(searchTimer);
    }, [query, isOpen]);

    const handleSelect = (airport: Airport) => {
        const formattedValue = airport.iata_code;
        setQuery(formattedValue);
        onChange(formattedValue);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-ink mb-2">{label}</label>
            <input
                type="text"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                    onChange(e.target.value); // Allow free text typing initially
                }}
                onFocus={() => setIsOpen(true)}
                placeholder={placeholder}
                className={cn(
                    "w-full px-4 py-3 border rounded-lg text-sm text-ink placeholder:text-muted/50 focus:outline-none transition-colors",
                    isOpen ? "border-ink" : "border-border"
                )}
            />

            {/* Dropdown */}
            {isOpen && (results.length > 0 || isLoading) && (
                <div className="absolute z-50 w-[400px] mt-2 bg-white rounded-lg shadow-xl border border-border overflow-hidden animate-[fade-in_200ms_ease-out]">
                    <div className="py-2">
                        {isLoading ? (
                            <div className="px-4 py-3 text-sm text-muted flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Searching airports...
                            </div>
                        ) : (
                            results.map((airport) => (
                                <button
                                    key={airport.iata_code}
                                    onClick={() => handleSelect(airport)}
                                    className="w-full px-4 py-3 flex items-start text-left hover:bg-accent-muted/50 transition-colors group"
                                >
                                    <div className="mt-0.5 mr-3 text-muted group-hover:text-accent transition-colors">
                                        <Plane className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-ink">
                                                {airport.city}
                                            </span>
                                            <span className="text-xs font-mono bg-paper px-1.5 py-0.5 rounded border border-border text-muted">
                                                {airport.iata_code}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted mt-0.5 truncate">
                                            {airport.name} • {airport.country}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}

                        {/* No results */}
                        {!isLoading && results.length === 0 && query.length > 1 && (
                            <div className="px-4 py-3 text-sm text-muted">
                                No airports found
                            </div>
                        )}
                    </div>

                    {/* Duffel-style footer */}
                    <div className="px-4 py-2 bg-paper border-t border-border flex items-center justify-between">
                        <span className="text-[10px] text-muted uppercase tracking-wider font-medium">Use precise location</span>
                        <MapPin className="w-3 h-3 text-muted" />
                    </div>
                </div>
            )}
        </div>
    );
}
