import { startChatMessageStream } from "@/services/chat"
import { getCurrentUser } from "@/services/user"
import {
  ErrorChunkParser,
  SuggestionsParser,
  ThinkingParser,
  TokenParser,
} from "@/shared/lib/event-parser"
import { streamDecoder } from "@/shared/lib/stream-decoder"
import { type StreamChunk, toServerSentEventsStream } from "@tanstack/ai"
import { createFileRoute } from "@tanstack/react-router"

/**
 * Converts a Python backend stream (Node.js Readable or Web Response)
 * into AsyncIterable<StreamChunk> for TanStack AI
 */
export async function* responseToStreamChunks(
  streamInput: Response,
): AsyncIterable<StreamChunk> {
  let buffer = ""
  let currentEvent = ""
  const iterable: AsyncIterable<Uint8Array | string> = streamInput.body as any
  const errorChunkParser = ErrorChunkParser.new()

  try {
    for await (const value of iterable) {
      const chunkStr =
        typeof value === "string"
          ? value
          : streamDecoder.decode(value, { stream: true })
      buffer += chunkStr

      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim()
        } else if (line.startsWith("data: ")) {
          const data = line.slice(6).trim()
          if (data === "[DONE]") return

          if (currentEvent === "token") {
            const tokenParser = TokenParser.new()
            const parseResult = tokenParser.parse(data)
            if (parseResult.isErr()) {
              yield errorChunkParser.format(parseResult.error.message)
              continue
            }
            yield tokenParser.format(parseResult.value)
          } else if (currentEvent === "thinking") {
            const thinkingParser = ThinkingParser.new()
            const parseResult = thinkingParser.parse(data)
            if (parseResult.isErr()) {
              yield errorChunkParser.format(parseResult.error.message)
              continue
            }
            yield thinkingParser.format(parseResult.value)
          } else if (currentEvent === "suggestions") {
            const suggestionsParser = SuggestionsParser.new()
            const parseResult = suggestionsParser.parse(data)
            if (parseResult.isErr()) {
              yield errorChunkParser.format(parseResult.error.message)
              continue
            }
            yield suggestionsParser.format(parseResult.value)
          } else if (currentEvent === "status") {
            const statusData = JSON.parse(data)
            yield {
              type: "status",
              timestamp: Date.now(),
              status: statusData.status,
              content: statusData.message || "",
            } as any
          } else if (currentEvent === "data_payload") {
            const payloadData = JSON.parse(data)
            yield {
              type: payloadData.type,
              timestamp: Date.now(),
              payload: payloadData.data,
            } as any
          }
        } else if (line.trim() === "") {
          currentEvent = ""
        }
      }
    }
  } finally {
    // No explicit close needed for async iterables usually,
    // but if it was a reader we would release lock.
  }
}

export const Route = createFileRoute("/api/chat/$chatId")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        try {
          const { messages } = await request.json()
          const currentUser = await getCurrentUser()
          if (currentUser.isErr()) {
            return new Response(JSON.stringify(currentUser.error), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            })
          }

          // Get the last user message content
          const lastMessage = messages[messages.length - 1]
          let userContent = ""

          if (typeof lastMessage.content === "string") {
            userContent = lastMessage.content
          } else if (Array.isArray(lastMessage.parts)) {
            userContent = lastMessage.parts
              .filter((p: any) => p.type === "text")
              .map((p: any) => p.content || p.text)
              .join("")
          }

          // startChatMessageStream returns a ResultAsync containing the Node stream in .value
          const response = await startChatMessageStream({
            body: {
              message: userContent,
              session_id: params.chatId,
              stream: true,
              user_id: currentUser.value.id,
            },
          })

          if (response.isErr()) {
            return new Response(
              JSON.stringify({ error: (response.error as any).message }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              },
            )
          }

          // response.value is the Node Readable stream from Axios
          const chunks = responseToStreamChunks(response.value)

          // Convert to SSE stream for the client
          const sseStream = toServerSentEventsStream(chunks)

          return new Response(sseStream)
        } catch (error) {
          return new Response(
            JSON.stringify({
              error:
                error instanceof Error
                  ? error.message
                  : "Internal Server Error",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          )
        }
      },
    },
  },
})
