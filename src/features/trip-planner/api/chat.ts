export interface ChatResponse {
  message: string
  suggestions?: {
    title: string
    description: string
    image: string
    type: "hotel" | "restaurant" | "activity"
  }[]
  actions?: {
    label: string
    type: string
  }[]
}

export const chatService = {
  async sendMessage(text: string): Promise<ChatResponse> {
    // In a real application, this would call the Python backend
    // const response = await ky.post('http://localhost:8000/api/chat', { json: { text } }).json<ChatResponse>()

    // Simulating API latency
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock response logic
    if (text.toLowerCase().includes("tashkent")) {
      return {
        message:
          "Great choice! Tashkent is beautiful. Here are some top-rated places you might enjoy:",
        suggestions: [
          {
            title: "Chorsu Bazaar",
            description: "Traditional market in the heart of the old city",
            image:
              "https://images.unsplash.com/photo-1597074866923-dc0589150358?w=400",
            type: "activity",
          },
          {
            title: "Hotel Uzbekistan",
            description: "Iconic Soviet-era architecture",
            image:
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400",
            type: "hotel",
          },
        ],
        actions: [
          { label: "Book a tour", type: "action" },
          { label: "See more hotels", type: "nav" },
        ],
      }
    }

    return {
      message:
        "I've started looking into your trip requests. I can help you find flights, accommodation, and build a full itinerary. What's your top priority for this trip?",
      actions: [
        { label: "Find Hotels", type: "search" },
        { label: "Explore Food", type: "search" },
      ],
    }
  },
}
