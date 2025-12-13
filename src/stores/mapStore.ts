'use client';

import { create } from 'zustand';

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface FlightRoute {
    origin: Coordinates;
    destination: Coordinates;
    originCode?: string;
    destinationCode?: string;
    originCity?: string;
    destinationCity?: string;
}

export interface ViewState {
    latitude: number;
    longitude: number;
    zoom: number;
}

interface MapState {
    // View state
    viewState: ViewState;
    
    // Flight route visualization
    flightRoute: FlightRoute | null;
    
    // User's home location (from IP/airport detection)
    userLocation: Coordinates | null;
    userAirportCode: string | null;
    
    // Loading states
    isMapLoading: boolean;
    isLocationLoading: boolean;
    
    // Error handling
    mapError: string | null;
}

interface MapActions {
    // View control
    flyToCity: (coords: Coordinates, zoom?: number) => void;
    flyToBounds: (coords: Coordinates[]) => void;
    resetView: () => void;
    
    // Flight route
    setFlightRoute: (route: FlightRoute) => void;
    clearFlightRoute: () => void;
    
    // User location
    setUserLocation: (coords: Coordinates, airportCode?: string) => void;
    
    // Loading states
    setMapLoading: (loading: boolean) => void;
    setLocationLoading: (loading: boolean) => void;
    
    // Error handling
    setMapError: (error: string | null) => void;
}

// Default world view centered on user-friendly location
const DEFAULT_VIEW: ViewState = {
    latitude: 41.2995,
    longitude: 69.2401,
    zoom: 4,
};

export const useMapStore = create<MapState & MapActions>((set, get) => ({
    // Initial state
    viewState: DEFAULT_VIEW,
    flightRoute: null,
    userLocation: null,
    userAirportCode: null,
    isMapLoading: false,
    isLocationLoading: false,
    mapError: null,

    // Actions
    flyToCity: (coords: Coordinates, zoom: number = 12) => {
        set({
            viewState: {
                latitude: coords.latitude,
                longitude: coords.longitude,
                zoom,
            },
            mapError: null,
        });
    },

    flyToBounds: (coords: Coordinates[]) => {
        if (coords.length === 0) return;
        
        if (coords.length === 1) {
            set({
                viewState: {
                    latitude: coords[0].latitude,
                    longitude: coords[0].longitude,
                    zoom: 12,
                },
            });
            return;
        }

        // Calculate center and appropriate zoom for multiple points
        const lats = coords.map(c => c.latitude);
        const lngs = coords.map(c => c.longitude);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        
        // Calculate zoom based on distance
        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const maxDiff = Math.max(latDiff, lngDiff);
        
        // Rough zoom calculation
        let zoom = 4;
        if (maxDiff < 1) zoom = 10;
        else if (maxDiff < 5) zoom = 7;
        else if (maxDiff < 20) zoom = 5;
        else if (maxDiff < 60) zoom = 3;
        else zoom = 2;

        set({
            viewState: {
                latitude: centerLat,
                longitude: centerLng,
                zoom,
            },
        });
    },

    resetView: () => {
        const { userLocation } = get();
        if (userLocation) {
            set({
                viewState: {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    zoom: 8,
                },
            });
        } else {
            set({ viewState: DEFAULT_VIEW });
        }
    },

    setFlightRoute: (route: FlightRoute) => {
        set({ flightRoute: route });
        
        // Auto-adjust view to show route
        get().flyToBounds([route.origin, route.destination]);
    },

    clearFlightRoute: () => {
        set({ flightRoute: null });
    },

    setUserLocation: (coords: Coordinates, airportCode?: string) => {
        set({
            userLocation: coords,
            userAirportCode: airportCode || null,
            viewState: {
                latitude: coords.latitude,
                longitude: coords.longitude,
                zoom: 8,
            },
        });
    },

    setMapLoading: (loading: boolean) => {
        set({ isMapLoading: loading });
    },

    setLocationLoading: (loading: boolean) => {
        set({ isLocationLoading: loading });
    },

    setMapError: (error: string | null) => {
        set({ mapError: error });
    },
}));


// =============================================================================
// API HELPERS
// =============================================================================

/**
 * Fetch user's nearest airport from backend
 * Uses the /api/v1/nearest-airport/nearest-airport endpoint
 */
export async function fetchUserLocation(): Promise<{
    coords: Coordinates;
    airportCode: string;
    city: string;
    airportName: string;
    country: string;
} | null> {
    try {
        // Use environment variable or default to production API
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';
        const url = API_BASE 
            ? `${API_BASE}/api/v1/nearest-airport/nearest-airport`
            : '/api/v1/nearest-airport/nearest-airport';
        
        console.log('[MapStore] Fetching user location from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        
        if (!response.ok) {
            console.warn('[MapStore] Failed to fetch user location:', response.status);
            // Return default location (Tashkent) on failure
            return getDefaultLocation();
        }
        
        const data = await response.json();
        console.log('[MapStore] Location response:', data);
        
        // Response format: { airport: { iata, city, name, country }, detected_location: {...} }
        if (data.airport) {
            const airport = data.airport;
            // Get coordinates from our airport lookup
            const coords = getAirportCoordinates(airport.iata);
            
            if (coords) {
                return {
                    coords,
                    airportCode: airport.iata,
                    city: airport.city,
                    airportName: airport.name,
                    country: airport.country,
                };
            }
            
            // Fallback to detected location if available
            if (data.detected_location?.lat && data.detected_location?.lon) {
                return {
                    coords: {
                        latitude: data.detected_location.lat,
                        longitude: data.detected_location.lon,
                    },
                    airportCode: airport.iata,
                    city: airport.city,
                    airportName: airport.name,
                    country: airport.country,
                };
            }
        }
        
        // Return default on parse failure
        return getDefaultLocation();
    } catch (error) {
        console.error('[MapStore] Error fetching user location:', error);
        // Return default location on error
        return getDefaultLocation();
    }
}

/**
 * Default location fallback (Tashkent)
 */
function getDefaultLocation(): {
    coords: Coordinates;
    airportCode: string;
    city: string;
    airportName: string;
    country: string;
} {
    return {
        coords: { latitude: 41.2579, longitude: 69.2812 },
        airportCode: 'TAS',
        city: 'Tashkent',
        airportName: 'Tashkent International Airport',
        country: 'UZ',
    };
}

/**
 * Extract coordinates from flight card data
 * Matches the FlightSlice interface structure
 */
export function extractFlightRouteFromCards(
    flightCards: Array<{
        slices?: Array<{
            origin?: { 
                code?: string; 
                city?: string;
                coordinates?: {
                    lat: number;
                    lon: number;
                };
            };
            destination?: { 
                code?: string; 
                city?: string;
                coordinates?: {
                    lat: number;
                    lon: number;
                };
            };
        }>;
    }>,
    userLocation?: Coordinates | null
): FlightRoute | null {
    console.log('[MapStore] extractFlightRouteFromCards called with:', flightCards?.length, 'cards');
    
    if (!flightCards || flightCards.length === 0) {
        console.log('[MapStore] No flight cards provided');
        return null;
    }
    
    const firstCard = flightCards[0];
    const slices = firstCard.slices;
    
    console.log('[MapStore] First card slices:', slices?.length);
    
    if (!slices || slices.length === 0) {
        console.log('[MapStore] No slices in first card');
        return null;
    }
    
    const firstSlice = slices[0];
    const origin = firstSlice.origin;
    const destination = firstSlice.destination;
    
    console.log('[MapStore] Origin:', origin);
    console.log('[MapStore] Destination:', destination);
    
    if (!destination) {
        console.log('[MapStore] No destination');
        return null;
    }
    
    // Try to get destination coordinates from flight data
    let destCoords: Coordinates | null = null;
    
    if (destination.coordinates?.lat && destination.coordinates?.lon) {
        destCoords = { 
            latitude: destination.coordinates.lat, 
            longitude: destination.coordinates.lon 
        };
        console.log('[MapStore] Using destination coordinates from flight data');
    } else if (destination.code) {
        destCoords = getAirportCoordinates(destination.code);
        console.log('[MapStore] Looking up destination by code:', destination.code, '→', destCoords);
    }
    
    if (!destCoords) {
        console.log('[MapStore] Could not get destination coordinates');
        return null;
    }
    
    // Get origin coordinates from flight data or user location
    let originCoords: Coordinates | null = null;
    
    if (origin?.coordinates?.lat && origin?.coordinates?.lon) {
        originCoords = { 
            latitude: origin.coordinates.lat, 
            longitude: origin.coordinates.lon 
        };
        console.log('[MapStore] Using origin coordinates from flight data');
    } else if (origin?.code) {
        originCoords = getAirportCoordinates(origin.code);
        console.log('[MapStore] Looking up origin by code:', origin.code, '→', originCoords);
    }
    
    // Fall back to user location
    if (!originCoords && userLocation) {
        originCoords = userLocation;
        console.log('[MapStore] Using user location as origin');
    }
    
    if (!originCoords) {
        console.log('[MapStore] Could not get origin coordinates');
        return null;
    }
    
    const route: FlightRoute = {
        origin: originCoords,
        destination: destCoords,
        originCode: origin?.code,
        destinationCode: destination?.code,
        originCity: origin?.city,
        destinationCity: destination?.city,
    };
    
    console.log('[MapStore] ✅ Route created:', route);
    return route;
}

/**
 * Basic airport coordinates lookup (fallback)
 * In production, this would query a database
 */
function getAirportCoordinates(code?: string): Coordinates | null {
    if (!code) return null;
    
    const airports: Record<string, Coordinates> = {
        // Major hubs
        'LHR': { latitude: 51.4700, longitude: -0.4543 },
        'JFK': { latitude: 40.6413, longitude: -73.7781 },
        'DXB': { latitude: 25.2532, longitude: 55.3657 },
        'CDG': { latitude: 49.0097, longitude: 2.5479 },
        'IST': { latitude: 41.2753, longitude: 28.7519 },
        'SIN': { latitude: 1.3644, longitude: 103.9915 },
        'HND': { latitude: 35.5494, longitude: 139.7798 },
        'NRT': { latitude: 35.7720, longitude: 140.3929 },
        'LAX': { latitude: 33.9416, longitude: -118.4085 },
        'ORD': { latitude: 41.9742, longitude: -87.9073 },
        'FRA': { latitude: 50.0379, longitude: 8.5622 },
        'AMS': { latitude: 52.3105, longitude: 4.7683 },
        'BKK': { latitude: 13.6900, longitude: 100.7501 },
        'HKG': { latitude: 22.3080, longitude: 113.9185 },
        'SYD': { latitude: -33.9399, longitude: 151.1753 },
        // Central Asia
        'TAS': { latitude: 41.2579, longitude: 69.2812 },
        'SKD': { latitude: 39.7005, longitude: 66.9838 },
        'BHK': { latitude: 39.7753, longitude: 64.4833 },
        'ALA': { latitude: 43.3521, longitude: 77.0405 },
        'NQZ': { latitude: 51.0222, longitude: 71.4669 },
        // Middle East
        'DOH': { latitude: 25.2731, longitude: 51.6081 },
        'AUH': { latitude: 24.4330, longitude: 54.6511 },
        'RUH': { latitude: 24.9576, longitude: 46.6988 },
        // Europe
        'FCO': { latitude: 41.8003, longitude: 12.2389 },
        'MAD': { latitude: 40.4983, longitude: -3.5676 },
        'BCN': { latitude: 41.2971, longitude: 2.0785 },
        'MUC': { latitude: 48.3537, longitude: 11.7750 },
        'ZRH': { latitude: 47.4647, longitude: 8.5492 },
        'VIE': { latitude: 48.1103, longitude: 16.5697 },
        'SVO': { latitude: 55.9726, longitude: 37.4146 },
        'DME': { latitude: 55.4088, longitude: 37.9063 },
        'LED': { latitude: 59.8003, longitude: 30.2625 },
    };
    
    return airports[code.toUpperCase()] || null;
}

