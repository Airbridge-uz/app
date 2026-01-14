export function getEmptyConversation(
  conversationId: string,
  title: string = "New chat",
) {
  return {
    has_flights: false,
    has_itinerary: false,
    last_message_at: null,
    message_count: 0,
    preview: null,
    session_id: conversationId,
    trip_id: null,
    title,
    messages: [],
    flight_cards: [],
    suggestions: [],
    search_info: null,
    itinerary_data: null,
    itinerary_grounding: null,
    flight_cards_expired: false,
  }
}
