import { startChatMessageStream } from "@/services/chat"
import { type StreamChunk, toServerSentEventsStream } from "@tanstack/ai"
import { createFileRoute } from "@tanstack/react-router"

/**
 * Converts a Python backend stream (Node.js Readable or Web Response)
 * into AsyncIterable<StreamChunk> for TanStack AI
 */
export async function* responseToStreamChunks(
  streamInput: any,
): AsyncIterable<StreamChunk> {
  const decoder = new TextDecoder()
  let buffer = ""

  // Normalize input to an async iterable
  let iterable: AsyncIterable<Uint8Array | string>
  if (streamInput instanceof Response) {
    if (!streamInput.body) throw new Error("Response body is missing")
    iterable = streamInput.body as any
  } else if (
    streamInput &&
    typeof streamInput[Symbol.asyncIterator] === "function"
  ) {
    iterable = streamInput
  } else {
    throw new Error("Invalid stream input")
  }

  let currentEvent = ""

  try {
    for await (const value of iterable) {
      const chunkStr =
        typeof value === "string"
          ? value
          : decoder.decode(value, { stream: true })
      buffer += chunkStr

      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        if (line.startsWith("event: ")) {
          currentEvent = line.slice(7).trim()
        } else if (line.startsWith("data: ")) {
          const data = line.slice(6).trim()

          if (data === "[DONE]") return

          const id = crypto.randomUUID()
          const timestamp = Date.now()

          try {
            if (currentEvent === "token") {
              const json = JSON.parse(data)
              yield {
                type: "content",
                delta: json.content || "",
                id,
                timestamp,
              } as any
            } else if (currentEvent === "thinking") {
              const json = JSON.parse(data)
              const steps = json.steps || (json.content ? [json.content] : [])
              const content = Array.isArray(steps)
                ? steps.join("\n")
                : String(steps)
              yield {
                type: "thinking",
                id,
                timestamp,
                delta: content,
                content: content,
                model: "",
              } as any
            } else if (currentEvent === "suggestions") {
              const json = JSON.parse(data)
              yield {
                type: "metadata" as any,
                value: { suggestions: json },
                id,
                timestamp,
                delta: "",
                content: "",
                model: "",
              } as any
            } else if (!currentEvent) {
              try {
                const json = JSON.parse(data)
                yield {
                  type: "content",
                  delta: json.delta || json.content || "",
                  id,
                  timestamp,
                } as any
              } catch {
                yield {
                  type: "content",
                  delta: data,
                  id,
                  timestamp,
                } as any
              }
            }
          } catch (e) {
            console.error("Error parsing SSE data chunk:", e, data)
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
            },
          })

          if (response.isErr()) {
            console.error("Error starting chat message stream:", response.error)
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
          console.error("API Chat Error:", error)
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
