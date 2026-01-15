import { useTripPreview } from "@/features/trip-preview"
import { getConversationById } from "@/services/conversation"
import { getCurrentUser } from "@/services/user"
import { cn } from "@/shared/lib/utils"
import { Button, buttonVariants } from "@/shared/ui/button"
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/shared/ui/chat-container"
import { Message, MessageContent } from "@/shared/ui/message"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/shared/ui/prompt-input"
import { ScrollButton } from "@/shared/ui/scroll-button"
import { TextShimmer } from "@/shared/ui/text-shimmer"
import type { MessagePart, UIMessage } from "@tanstack/ai-client"
import {
  fetchServerSentEvents,
  useChat,
  type UseChatReturn,
} from "@tanstack/ai-react"
import { useQuery } from "@tanstack/react-query"
import { getRouteApi, useParams } from "@tanstack/react-router"
import { ArrowUp, Globe, Loader2, Mic, Square } from "lucide-react"
import { useRef, useState } from "react"
import { SuggestionList } from "./suggestion-list"
import { ThinkingSteps } from "./thinking-steps"

const routeApi = getRouteApi("/_app/chat/$chatId/")

export function ChatInterface() {
  const [prompt, setPrompt] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<
    { label: string; value: string; type: string }[]
  >([])
  const { execute, previewItinerary, previewOffers } = useTripPreview()
  const routeParams = useParams({
    from: "/_app/chat/$chatId/",
  })
  const chatContainerRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, isLoading, stop, setMessages, ...chatUtils } =
    useChat({
      connection: fetchServerSentEvents(`/api/chat/${routeParams.chatId}`),
      onChunk(chunk: any) {
        if (chunk.type === "itinerary") {
          execute()
          previewItinerary(chunk.payload)
        } else if (chunk.type === "flight_cards") {
          execute()
          previewOffers(chunk.payload, false)
        } else if (chunk.type === "suggestions") {
          setSuggestions(chunk.content)
        } else if (chunk.type === "status") {
          setStatus(chunk.content)
        }
      },
      onFinish() {
        setStatus(null)
      },
      onError() {
        setStatus("Something went wrong")
        setSuggestions([])
      },
      id: routeParams.chatId,
    })

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return

    const user = await getCurrentUser()
    if (user.isErr()) return

    setStatus("Generating your plan 🪄")
    sendMessage(prompt)
    setPrompt("")
    setSuggestions([])
  }

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion)
    sendMessage(suggestion)
    setSuggestions([])
  }

  return (
    <main className="flex h-[90vh] flex-col overflow-hidden">
      <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="space-y-0 px-5 py-12">
            <Messages
              setMessages={setMessages}
              messages={messages}
              isLoading={isLoading}
              sendMessage={sendMessage}
              stop={stop}
              {...chatUtils}
            />
          </ChatContainerContent>
          <div className="absolute bottom-4 left-1/2 flex w-full max-w-7xl -translate-x-1/2 justify-end px-5">
            <ScrollButton className="shadow-sm" />
          </div>
        </ChatContainerRoot>
      </div>

      <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
        <div className="max-w-7xl mx-auto space-y-6">
          {status !== null && <TextShimmer duration={2}>{status}</TextShimmer>}
          {suggestions.length > 0 && (
            <SuggestionList
              suggestions={suggestions}
              onSelect={handleSuggestionClick}
            />
          )}
          <PromptInput
            isLoading={isLoading}
            value={prompt}
            onValueChange={setPrompt}
            onSubmit={handleSubmit}
            className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 shadow-xs mt-6"
          >
            <div className="flex justify-between items-center gap-6 px-3 py-2">
              <PromptInputTextarea
                placeholder="Ask anything"
                className="bg-transparent! min-h-auto"
              />

              <PromptInputActions className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PromptInputAction
                    className={buttonVariants({
                      variant: "outline",
                      size: "icon",
                      className: "size-9 rounded-full",
                    })}
                    tooltip="Voice input"
                  >
                    <Mic size={18} />
                  </PromptInputAction>

                  {isLoading ? (
                    <Button
                      size="icon"
                      onClick={() => stop()}
                      className="size-9 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <Square size={16} fill="currentColor" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      disabled={!prompt.trim() || isLoading}
                      onClick={handleSubmit}
                      className="size-9 rounded-full"
                    >
                      {!isLoading ? (
                        <ArrowUp size={18} />
                      ) : (
                        <span className="size-3 rounded-xs bg-background animate-pulse" />
                      )}
                    </Button>
                  )}
                </div>
              </PromptInputActions>
            </div>
          </PromptInput>
        </div>
      </div>
    </main>
  )
}

function Messages({ setMessages, messages, isLoading }: UseChatReturn<any>) {
  const { previewItinerary, previewOffers, setSearchInfo, setTripId, execute } =
    useTripPreview()
  const routeParams = routeApi.useParams()
  const queryResult = useQuery({
    queryKey: ["conversation", routeParams.chatId],
    queryFn: async () => {
      const result = await getConversationById({ id: routeParams.chatId })
      if (result.isErr()) {
        setMessages([])
        throw new Error(result.error.message)
      }

      if (result.value.flight_cards) {
        previewOffers(
          result.value.flight_cards,
          result.value.flight_cards_expired,
        )
        execute()
      }

      if (result.value.itinerary_data) {
        previewItinerary(result.value.itinerary_data)
        execute()
      }

      if (result.value.search_info) {
        setSearchInfo(result.value.search_info)
        execute()
      }

      if (result.value.trip_id) {
        setTripId(result.value.trip_id)
      }

      setMessages(
        (result.value ?? []).messages.map((message) => {
          return {
            id: message.id,
            role: message.role as "user" | "assistant",
            parts: [{ type: "text", content: message.content }],
          }
        }),
      )
      return result.value ?? []
    },
    retry: false,
  })

  if (queryResult.isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-4xl mx-auto space-y-8 px-4">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="p-4 rounded-full bg-primary/5 border border-primary/10 shadow-sm">
            <Globe className="w-10 h-10 text-primary animate-pulse-slow" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              How can I help you with your journey?
            </h1>
            <p className="text-muted-foreground text-lg">
              Plan your next adventure, find flights, or explore new
              destinations.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return messages.map((message) => {
    const isAssistant = message.role === "assistant"

    return message.parts.map((part, index) => {
      if (part.type === "thinking") {
        return (
          <ThinkingMessage
            part={part}
            key={`${message.id}-thinking-${index}`}
            index={index}
          />
        )
      }

      return (
        <Message
          key={`${message.id}-${index}`}
          className={cn(
            "mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 mb-8",
            isAssistant ? "items-start" : "items-end",
          )}
        >
          {isAssistant ? (
            <AssistantMessage
              part={part}
              messages={messages}
              index={index}
              isLoading={isLoading}
            />
          ) : (
            <UserMessage part={part} />
          )}
        </Message>
      )
    })
  })
}

function ThinkingMessage({ part }: { part: MessagePart; index: number }) {
  if (part.type !== "thinking") return null

  return (
    <div className="max-w-7xl mx-auto w-full">
      <ThinkingSteps steps={part.content.split("\n")} />
    </div>
  )
}

function UserMessage({ part }: { part: MessagePart }) {
  if (part.type !== "text") return null

  return <MessageContent markdown>{part.content}</MessageContent>
}

function AssistantMessage({
  part,
}: {
  part: MessagePart
  messages: UIMessage[]
  index: number
  isLoading: boolean
}) {
  if (part.type !== "text") return null

  return (
    <MessageContent className="bg-transparent text-foreground" markdown>
      {part.content}
    </MessageContent>
  )
}
