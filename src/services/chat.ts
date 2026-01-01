import type { ChatResponse } from "@/entities/chat"
import { typeSafeRequest } from "@/shared/lib/http"
import type { ApiRequestPayload } from "@/shared/types/http"

export async function sendChatMessage(payload: ApiRequestPayload<any>) {
  return await typeSafeRequest<any, undefined, ChatResponse>({
    url: "api/v1/chat/message",
    method: "post",
    payload,
  })
}

/**
 * Initiates a chat message stream (SSE).
 */
export async function startChatMessageStream(payload: ApiRequestPayload<any>) {
  return await typeSafeRequest<any, undefined, Response>({
    url: "api/v1/chat/message/stream",
    method: "post",
    payload,
    isStream: true,
  })
}
