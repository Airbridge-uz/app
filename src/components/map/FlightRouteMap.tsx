'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { useMapStore, FlightRoute, Coordinates } from '@/stores/mapStore';
import { Loader2, Plane, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FlightRouteMapProps {
    googleMapsApiKey: string;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

// Swiss-style clean map design
const mapStyles = [
    {
        featureType: 'all',
        elementType: 'geometry.fill',
        stylers: [{ saturation: -20 }],
    },
    {
        featureType: 'water',
        elementType: 'geometry.fill',
        stylers: [{ color: '#c8e0f0' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry.fill',
        stylers: [{ color: '#ffffff' }],
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#e5e5e5' }],
    },
    {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
    },
    {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
    },
];

// Create airport marker SVG - circular with plane icon like the screenshot
function createAirportMarker(isOrigin: boolean, code?: string): string {
    const bgColor = '#1a1a1a'; // Dark background like screenshot
    
    return `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
            <defs>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.35"/>
                </filter>
            </defs>
            <!-- Outer circle with shadow -->
            <circle cx="22" cy="22" r="20" fill="${bgColor}" filter="url(#shadow)"/>
            <!-- White border -->
            <circle cx="22" cy="22" r="17" fill="none" stroke="white" stroke-width="2.5"/>
            <!-- Plane icon -->
            <g transform="translate(10, 10)">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
                </svg>
            </g>
        </svg>
    `)}`;
}

// Generate curved flight path
function generateCurvedPath(origin: Coordinates, destination: Coordinates): google.maps.LatLngLiteral[] {
    const points: google.maps.LatLngLiteral[] = [];
    const segments = 100;
    
    // Calculate control point for curve
    const midLat = (origin.latitude + destination.latitude) / 2;
    const midLng = (origin.longitude + destination.longitude) / 2;
    
    // Calculate distance for curve height
    const latDiff = Math.abs(origin.latitude - destination.latitude);
    const lngDiff = Math.abs(origin.longitude - destination.longitude);
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    
    // Curve offset (more curve for longer routes)
    const curveOffset = Math.min(distance * 0.25, 12);
    
    for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        // Quadratic bezier curve
        const lat = (1 - t) * (1 - t) * origin.latitude + 
                   2 * (1 - t) * t * (midLat + curveOffset) + 
                   t * t * destination.latitude;
        const lng = (1 - t) * (1 - t) * origin.longitude + 
                   2 * (1 - t) * t * midLng + 
                   t * t * destination.longitude;
        points.push({ lat, lng });
    }
    
    return points;
}

export function FlightRouteMap({ googleMapsApiKey }: FlightRouteMapProps) {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [hoveredAirport, setHoveredAirport] = useState<'origin' | 'destination' | null>(null);
    
    const { 
        viewState, 
        flightRoute, 
        userLocation, 
        userAirportCode,
        isMapLoading, 
        isLocationLoading 
    } = useMapStore();
    
    // Debug: log when flightRoute changes
    useEffect(() => {
        console.log('[FlightRouteMap] flightRoute changed:', flightRoute);
    }, [flightRoute]);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: googleMapsApiKey || '',
        id: 'google-map-script',
    });

    // Calculate center based on state
    const center = useMemo(() => {
        if (flightRoute) {
            // Center between origin and destination
            return {
                lat: (flightRoute.origin.latitude + flightRoute.destination.latitude) / 2,
                lng: (flightRoute.origin.longitude + flightRoute.destination.longitude) / 2,
            };
        }
        if (userLocation) {
            return { lat: userLocation.latitude, lng: userLocation.longitude };
        }
        return { lat: viewState.latitude, lng: viewState.longitude };
    }, [flightRoute, userLocation, viewState]);

    // Generate curved path if route exists
    const curvePath = useMemo(() => {
        if (!flightRoute) return null;
        return generateCurvedPath(flightRoute.origin, flightRoute.destination);
    }, [flightRoute]);

    // Fit bounds when route changes
    useEffect(() => {
        if (!map || !flightRoute) return;

        const bounds = new google.maps.LatLngBounds();
        bounds.extend({ lat: flightRoute.origin.latitude, lng: flightRoute.origin.longitude });
        bounds.extend({ lat: flightRoute.destination.latitude, lng: flightRoute.destination.longitude });
        
        map.fitBounds(bounds, { top: 80, right: 80, bottom: 80, left: 80 });
    }, [map, flightRoute]);

    // Pan to user location when it's set
    useEffect(() => {
        if (!map || !userLocation || flightRoute) return;
        map.panTo({ lat: userLocation.latitude, lng: userLocation.longitude });
        map.setZoom(10);
    }, [map, userLocation, flightRoute]);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    // Handle missing API key
    if (!googleMapsApiKey) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center p-6">
                    <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="font-medium text-gray-700 mb-1">Map Not Available</h3>
                    <p className="text-sm text-gray-500 max-w-xs">
                        Google Maps API key is required.
                    </p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">
                Failed to load Google Maps
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-accent animate-spin" />
                    <span className="text-sm text-gray-500">Loading map...</span>
                </div>
            </div>
        );
    }

    const isLoading = isMapLoading || isLocationLoading;

    return (
        <div className="relative h-full w-full">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={flightRoute ? 4 : userLocation ? 10 : viewState.zoom}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    styles: mapStyles,
                    disableDefaultUI: true,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_BOTTOM,
                    },
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                }}
            >
                {/* Flight Route Line */}
                {curvePath && (
                    <>
                        {/* Shadow/glow line */}
                        <Polyline
                            path={curvePath}
                            options={{
                                strokeColor: '#000000',
                                strokeOpacity: 0.15,
                                strokeWeight: 12,
                            }}
                        />
                        {/* Main thick dashed line - like the screenshot */}
                        <Polyline
                            path={curvePath}
                            options={{
                                strokeColor: '#1a1a1a',
                                strokeOpacity: 1,
                                strokeWeight: 4,
                                icons: [{
                                    icon: {
                                        path: 'M 0,-1 0,1',
                                        strokeOpacity: 1,
                                        strokeWeight: 4,
                                        scale: 5,
                                    },
                                    offset: '0',
                                    repeat: '16px',
                                }],
                            }}
                        />
                    </>
                )}

                {/* Origin Airport Marker */}
                {flightRoute && (
                    <Marker
                        position={{ 
                            lat: flightRoute.origin.latitude, 
                            lng: flightRoute.origin.longitude 
                        }}
                        icon={{
                            url: createAirportMarker(true, flightRoute.originCode),
                            scaledSize: new google.maps.Size(44, 44),
                            anchor: new google.maps.Point(22, 22),
                        }}
                        onMouseOver={() => setHoveredAirport('origin')}
                        onMouseOut={() => setHoveredAirport(null)}
                        zIndex={100}
                    />
                )}

                {/* Destination Airport Marker */}
                {flightRoute && (
                    <Marker
                        position={{ 
                            lat: flightRoute.destination.latitude, 
                            lng: flightRoute.destination.longitude 
                        }}
                        icon={{
                            url: createAirportMarker(false, flightRoute.destinationCode),
                            scaledSize: new google.maps.Size(44, 44),
                            anchor: new google.maps.Point(22, 22),
                        }}
                        onMouseOver={() => setHoveredAirport('destination')}
                        onMouseOut={() => setHoveredAirport(null)}
                        zIndex={101}
                    />
                )}

                {/* User Location Marker (when no flight route) */}
                {!flightRoute && userLocation && (
                    <Marker
                        position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
                        icon={{
                            url: createAirportMarker(true, userAirportCode || undefined),
                            scaledSize: new google.maps.Size(44, 44),
                            anchor: new google.maps.Point(22, 22),
                        }}
                    />
                )}

                {/* Info Windows */}
                {hoveredAirport === 'origin' && flightRoute && (
                    <InfoWindow
                        position={{ 
                            lat: flightRoute.origin.latitude, 
                            lng: flightRoute.origin.longitude 
                        }}
                        options={{
                            pixelOffset: new google.maps.Size(0, -58),
                            disableAutoPan: true,
                        }}
                        onCloseClick={() => setHoveredAirport(null)}
                    >
                        <div className="p-2 font-sans">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <Plane className="w-3 h-3 text-white transform -rotate-45" />
                                </div>
                                <span className="font-semibold text-gray-900">
                                    {flightRoute.originCode || 'Origin'}
                                </span>
                            </div>
                            {flightRoute.originCity && (
                                <p className="text-sm text-gray-600">{flightRoute.originCity}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">Departure</p>
                        </div>
                    </InfoWindow>
                )}

                {hoveredAirport === 'destination' && flightRoute && (
                    <InfoWindow
                        position={{ 
                            lat: flightRoute.destination.latitude, 
                            lng: flightRoute.destination.longitude 
                        }}
                        options={{
                            pixelOffset: new google.maps.Size(0, -58),
                            disableAutoPan: true,
                        }}
                        onCloseClick={() => setHoveredAirport(null)}
                    >
                        <div className="p-2 font-sans">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                                    <Plane className="w-3 h-3 text-white transform rotate-45" />
                                </div>
                                <span className="font-semibold text-gray-900">
                                    {flightRoute.destinationCode || 'Destination'}
                                </span>
                            </div>
                            {flightRoute.destinationCity && (
                                <p className="text-sm text-gray-600">{flightRoute.destinationCity}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">Arrival</p>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3 bg-white rounded-xl px-6 py-4 shadow-lg">
                        <Loader2 className="w-8 h-8 text-accent animate-spin" />
                        <span className="text-sm text-gray-600 font-medium">
                            {isLocationLoading ? 'Finding your airport...' : 'Loading...'}
                        </span>
                    </div>
                </div>
            )}

            {/* Route Info Card */}
            {flightRoute && (
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4 max-w-xs">
                    <div className="flex items-center gap-3">
                        {/* Origin */}
                        <div className="text-center">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-1">
                                <span className="font-bold text-green-600 text-sm">
                                    {flightRoute.originCode || 'A'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate max-w-[80px]">
                                {flightRoute.originCity || 'Origin'}
                            </p>
                        </div>

                        {/* Arrow */}
                        <div className="flex-1 flex items-center justify-center">
                            <div className="h-0.5 flex-1 bg-gray-200 relative">
                                <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-accent bg-white px-1" />
                            </div>
                        </div>

                        {/* Destination */}
                        <div className="text-center">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mb-1">
                                <span className="font-bold text-accent text-sm">
                                    {flightRoute.destinationCode || 'B'}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 truncate max-w-[80px]">
                                {flightRoute.destinationCity || 'Destination'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* User Airport Card (when no flight route) */}
            {!flightRoute && userLocation && userAirportCode && (
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Plane className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">{userAirportCode}</p>
                            <p className="text-xs text-gray-500">Your nearest airport</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

