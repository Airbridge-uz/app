import apiClient from './client';
import { ChatResponse, StreamChunk } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Send a non-streaming chat message
 */
export async function sendMessage(
    message: string,
    sessionId?: string,
    userId?: number
): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/api/v1/chat/message', {
        message,
        session_id: sessionId,
        user_id: userId,
        stream: false,
    });

    return response.data;
}

/**
 * Send a streaming chat message using SSE
 * @important Uses fetch API (not axios) for streaming support
 */
export async function* streamMessage(
    message: string,
    sessionId?: string,
    userId?: number
): AsyncGenerator<StreamChunk> {
    const token = typeof window !== 'undefined'
        ? localStorage.getItem('auth-token')
        : null;

    const response = await fetch(`${API_URL}/api/v1/chat/message/stream`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            message,
            session_id: sessionId,
            user_id: userId,
            stream: true,
        }),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
        throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    let currentEventType = '';
    
    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Parse SSE events
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
                // Skip empty lines
                if (!line.trim()) continue;
                
                if (line.startsWith('event: ')) {
                    // Get event type for next data line
                    currentEventType = line.slice(7).trim();
                    console.log('[SSE] Event type:', currentEventType);
                    continue;
                }

                if (line.startsWith('data: ')) {
                    const data = line.slice(6);

                    if (!data || data === '') continue;
                    
                    // Debug: log raw data with current event type
                    if (currentEventType) {
                        console.log('[SSE] Processing data for event:', currentEventType, data.substring(0, 100));
                    }

                    try {
                        const parsed = JSON.parse(data);

                        // Handle specific event types from backend
                        if (currentEventType === 'suggestions') {
                            // Backend sends suggestions as: event: suggestions\ndata: [...]
                            const suggestionsArray = Array.isArray(parsed) ? parsed : parsed.suggestions || [];
                            console.log('[SSE] ✅ Suggestions event received:', suggestionsArray);
                            yield { 
                                type: 'data_payload', 
                                data: { 
                                    type: 'suggestions', 
                                    suggestions: suggestionsArray,
                                } 
                            };
                            currentEventType = '';
                            continue;
                        }
                        
                        if (currentEventType === 'ui_component') {
                            yield { type: 'data_payload', data: { type: 'ui_component', ...parsed } };
                            currentEventType = '';
                            continue;
                        }

                        // Reset event type after processing
                        currentEventType = '';

                        // Determine chunk type based on content
                        if (parsed.content !== undefined) {
                            yield { type: 'token', content: parsed.content };
                        } else if (parsed.steps !== undefined) {
                            yield { type: 'thinking', steps: parsed.steps, action: parsed.action };
                        } else if (parsed.type === 'flight_cards') {
                            yield { 
                                type: 'data_payload', 
                                data: { 
                                    type: 'flight_cards', 
                                    flights: parsed.data,
                                    suggestions: parsed.suggestions,
                                } 
                            };
                        } else if (parsed.type === 'itinerary') {
                            yield { 
                                type: 'data_payload', 
                                data: { 
                                    type: 'itinerary', 
                                    itinerary: parsed.data, 
                                    grounding: parsed.grounding,
                                    suggestions: parsed.suggestions,
                                } 
                            };
                        } else if (parsed.type === 'suggestions') {
                            yield { 
                                type: 'data_payload', 
                                data: { 
                                    type: 'suggestions', 
                                    suggestions: parsed.data || parsed.suggestions,
                                } 
                            };
                        } else if (parsed.type === 'trip_saved') {
                            yield { type: 'data_payload', data: parsed };
                        } else if (parsed.session_id !== undefined) {
                            yield { 
                                type: 'done', 
                                session_id: parsed.session_id,
                                suggestions: parsed.suggestions,
                            };
                        } else if (parsed.error) {
                            yield { type: 'error', content: parsed.error };
                        } else if (Array.isArray(parsed)) {
                            // Array of suggestions sent directly
                            yield { 
                                type: 'data_payload', 
                                data: { 
                                    type: 'suggestions', 
                                    suggestions: parsed,
                                } 
                            };
                        } else if (parsed.suggestions) {
                            yield { 
                                type: 'data_payload', 
                                data: { 
                                    type: 'suggestions', 
                                    suggestions: parsed.suggestions,
                                } 
                            };
                        }
                    } catch {
                        // Not valid JSON, might be partial data
                        console.warn('Failed to parse SSE data:', data);
                    }
                }
            }
        }
    } finally {
        reader.releaseLock();
    }
}
