import apiClient from "./client";
import { ConversationSummary, ConversationDetail } from "@/types";

interface ConversationListResponse {
	conversations: ConversationSummary[];
	total: number;
}

/**
 * List user's chat conversation history
 */
export async function listConversations(
	limit: number = 20,
	offset: number = 0,
): Promise<ConversationListResponse> {
	const response = await apiClient.get<ConversationListResponse>(
		"/api/v1/conversations",
		{ params: { limit, offset } },
	);
	return response.data;
}

/**
 * Get a specific conversation with full message history
 */
export async function getConversation(
	sessionId: string,
): Promise<ConversationDetail> {
	const response = await apiClient.get<ConversationDetail>(
		`/api/v1/conversations/${sessionId}`,
	);
	return response.data;
}

/**
 * Delete a conversation
 */
export async function deleteConversation(sessionId: string): Promise<void> {
	await apiClient.delete(`/api/v1/conversations/${sessionId}`);
}
