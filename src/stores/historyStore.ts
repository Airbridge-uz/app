import { create } from "zustand";
import { ConversationSummary, ChatMessage } from "@/types";
import { listConversations, getConversation } from "@/lib/api/conversations";
import { useChatStore } from "./chatStore";

interface HistoryState {
	conversations: ConversationSummary[];
	isLoading: boolean;
	error: string | null;
	isOpen: boolean; // Sidebar visibility
}

interface HistoryActions {
	loadConversations: () => Promise<void>;
	loadConversation: (sessionId: string) => Promise<void>;
	toggleSidebar: () => void;
	setOpen: (open: boolean) => void;
}

export const useHistoryStore = create<HistoryState & HistoryActions>((set) => ({
	// State
	conversations: [],
	isLoading: false,
	error: null,
	isOpen: false,

	// Actions
	loadConversations: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await listConversations(50, 0);
			set({
				conversations: response.conversations,
				isLoading: false,
			});
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: "Failed to load conversations",
				isLoading: false,
			});
		}
	},

	loadConversation: async (sessionId: string) => {
		set({ isLoading: true, error: null });
		try {
			const detail = await getConversation(sessionId);

			// Convert backend messages to frontend format
			const messages: ChatMessage[] = detail.messages.map((msg, idx) => ({
				id: `restored_${idx}`,
				role: msg.role as "user" | "assistant",
				content: msg.content || "",
				timestamp: new Date(msg.timestamp || Date.now()),
			}));

			// Restore to chat store
			useChatStore
				.getState()
				.restoreSession(
					sessionId,
					messages,
					detail.itinerary_data,
					detail.flight_cards,
				);

			set({ isLoading: false, isOpen: false });
		} catch (error) {
			set({
				error:
					error instanceof Error
						? error.message
						: "Failed to load conversation",
				isLoading: false,
			});
		}
	},

	toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
	setOpen: (open: boolean) => set({ isOpen: open }),
}));
