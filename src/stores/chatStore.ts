import { create } from 'zustand';
import { ChatMessage, FlightCard, Suggestion, ItineraryData, ItineraryGrounding } from '@/types';
import { streamMessage } from '@/lib/api/chat';
import { useMapStore, extractFlightRouteFromCards, fetchUserLocation } from '@/stores/mapStore';

interface ChatState {
    messages: ChatMessage[];
    sessionId: string | null;
    isLoading: boolean;
    isStreaming: boolean;
    flightCards: FlightCard[];
    suggestions: Suggestion[];
    error: string | null;
    thoughtProcess: string[];
    itineraryData: ItineraryData | null;
    itineraryGrounding: ItineraryGrounding | null;
}

interface ChatActions {
    sendMessage: (content: string, userId?: number) => Promise<void>;
    clearChat: () => void;
    setError: (error: string | null) => void;
    addSuggestionClick: (suggestion: Suggestion) => void;
    restoreSession: (
        sessionId: string,
        messages: ChatMessage[],
        itineraryData?: ItineraryData | null,
        flightCards?: FlightCard[]
    ) => void;
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// Helper function to update map when flight cards are received
async function updateMapWithFlightRoute(flightCards: FlightCard[]) {
    const mapStore = useMapStore.getState();
    
    try {
        mapStore.setMapLoading(true);
        
        // Try to get user location if not already set
        let userLocation = mapStore.userLocation;
        if (!userLocation) {
            mapStore.setLocationLoading(true);
            const locationData = await fetchUserLocation();
            if (locationData) {
                mapStore.setUserLocation(locationData.coords, locationData.airportCode);
                userLocation = locationData.coords;
            }
            mapStore.setLocationLoading(false);
        }
        
        // Extract flight route from cards
        const route = extractFlightRouteFromCards(flightCards, userLocation);
        
        if (route) {
            mapStore.setFlightRoute(route);
            console.log('[ChatStore] Map updated with flight route:', route);
        } else {
            console.warn('[ChatStore] Could not extract flight route from cards');
        }
    } catch (error) {
        console.error('[ChatStore] Failed to update map with flight route:', error);
        mapStore.setMapError('Failed to load flight route');
    } finally {
        mapStore.setMapLoading(false);
    }
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
    // State
    messages: [],
    sessionId: null,
    isLoading: false,
    isStreaming: false,
    flightCards: [],
    suggestions: [],
    error: null,
    thoughtProcess: [],
    itineraryData: null,
    itineraryGrounding: null,

    // Actions
    sendMessage: async (content: string, userId?: number) => {
        const { sessionId, messages } = get();

        // 1. Add user message immediately
        const userMessage: ChatMessage = {
            id: generateId(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        // 2. Add empty assistant message with streaming flag
        const assistantMessage: ChatMessage = {
            id: generateId(),
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isStreaming: true,
        };

        set({
            messages: [...messages, userMessage, assistantMessage],
            isLoading: true,
            isStreaming: true,
            error: null,
            flightCards: [], // Clear previous flight cards
            suggestions: [], // Clear previous suggestions immediately for clean transition
            thoughtProcess: [],
            // Don't clear itinerary - keep it visible
        });

        try {
            let fullContent = '';
            let newSessionId = sessionId;
            let receivedFlightCards: FlightCard[] = [];
            let receivedThoughtProcess: string[] = [];
            let receivedItinerary: ItineraryData | null = null;
            let receivedGrounding: ItineraryGrounding | null = null;
            let receivedSuggestions: Suggestion[] = [];

            // 3. Stream the response
            for await (const chunk of streamMessage(content, sessionId || undefined, userId)) {
                switch (chunk.type) {
                    case 'token':
                        if (chunk.content) {
                            fullContent += chunk.content;
                            // Update assistant message with accumulated content
                            set((state) => ({
                                messages: state.messages.map((msg) =>
                                    msg.id === assistantMessage.id
                                        ? { ...msg, content: fullContent }
                                        : msg
                                ),
                            }));
                        }
                        break;

                    case 'thinking':
                        if (chunk.steps) {
                            receivedThoughtProcess = chunk.steps;
                            set({ thoughtProcess: chunk.steps });
                        }
                        break;

                    case 'data_payload':
                        if (chunk.data && typeof chunk.data === 'object') {
                            const payload = chunk.data as Record<string, unknown>;
                            console.log('[ChatStore] data_payload received:', payload.type, payload);

                            if (payload.type === 'flight_cards' && Array.isArray(payload.flights)) {
                                receivedFlightCards = payload.flights as FlightCard[];
                                // Also check for suggestions in flight_cards payload
                                if (Array.isArray(payload.suggestions)) {
                                    receivedSuggestions = payload.suggestions as Suggestion[];
                                    console.log('[ChatStore] Suggestions from flight_cards:', receivedSuggestions);
                                }
                                set({ flightCards: receivedFlightCards, suggestions: receivedSuggestions });
                                
                                // Update map with flight route
                                updateMapWithFlightRoute(receivedFlightCards);
                            } else if (payload.type === 'itinerary' && payload.itinerary) {
                                receivedItinerary = payload.itinerary as ItineraryData;
                                receivedGrounding = (payload.grounding as ItineraryGrounding) || null;
                                // Also check for suggestions in itinerary payload
                                if (Array.isArray(payload.suggestions)) {
                                    receivedSuggestions = payload.suggestions as Suggestion[];
                                    console.log('[ChatStore] Suggestions from itinerary:', receivedSuggestions);
                                }
                                set({
                                    itineraryData: receivedItinerary,
                                    itineraryGrounding: receivedGrounding,
                                    suggestions: receivedSuggestions,
                                });
                            } else if (payload.type === 'suggestions') {
                                // Handle standalone suggestions payload
                                const suggestionsData = payload.suggestions as Suggestion[];
                                if (Array.isArray(suggestionsData)) {
                                    receivedSuggestions = suggestionsData;
                                    console.log('[ChatStore] ✅ Standalone suggestions received:', receivedSuggestions);
                                    set({ suggestions: receivedSuggestions });
                                }
                            }
                        }
                        break;

                    case 'done':
                        if (chunk.session_id) {
                            newSessionId = chunk.session_id;
                        }
                        // Check for suggestions in done event
                        if (chunk.suggestions && Array.isArray(chunk.suggestions)) {
                            receivedSuggestions = chunk.suggestions;
                            set({ suggestions: receivedSuggestions });
                        }
                        break;

                    case 'error':
                        throw new Error(chunk.content || 'Stream error');
                }
            }

            // 4. Finalize the message
            console.log('[ChatStore] Finalizing message with suggestions:', receivedSuggestions);
            set((state) => ({
                messages: state.messages.map((msg) =>
                    msg.id === assistantMessage.id
                        ? {
                            ...msg,
                            content: fullContent,
                            isStreaming: false,
                            flightCards: receivedFlightCards.length > 0 ? receivedFlightCards : undefined,
                            thoughtProcess: receivedThoughtProcess.length > 0 ? receivedThoughtProcess : undefined,
                            itineraryData: receivedItinerary || undefined,
                            suggestions: receivedSuggestions.length > 0 ? receivedSuggestions : undefined,
                        }
                        : msg
                ),
                sessionId: newSessionId,
                isLoading: false,
                isStreaming: false,
                suggestions: receivedSuggestions, // Also update global suggestions state
            }));
        } catch (error) {
            // Remove the empty assistant message on error
            set((state) => ({
                messages: state.messages.filter((msg) => msg.id !== assistantMessage.id),
                isLoading: false,
                isStreaming: false,
                error: error instanceof Error ? error.message : 'Failed to send message',
            }));
        }
    },

    clearChat: () => {
        // Clear chat state
        set({
            messages: [],
            sessionId: null,
            flightCards: [],
            suggestions: [],
            error: null,
            thoughtProcess: [],
            itineraryData: null,
            itineraryGrounding: null,
        });
        
        // Also clear the flight route from map (prevents stale routes on new chat)
        useMapStore.getState().clearFlightRoute();
    },

    setError: (error: string | null) => set({ error }),

    addSuggestionClick: (suggestion: Suggestion) => {
        get().sendMessage(suggestion.value);
    },

    restoreSession: (
        sessionId: string,
        messages: ChatMessage[],
        itineraryData?: ItineraryData | null,
        flightCards?: FlightCard[]
    ) => {
        set({
            sessionId,
            messages,
            itineraryData: itineraryData || null,
            itineraryGrounding: null,
            flightCards: flightCards || [],
            error: null,
        });
    },
}));
