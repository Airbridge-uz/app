import { getCurrentUser } from "@/services/user"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  ChatContainerContent,
  ChatContainerRoot,
} from "@/shared/ui/chat-container"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/shared/ui/message"
import {
  PromptInput,
  PromptInputAction,
  PromptInputActions,
  PromptInputTextarea,
} from "@/shared/ui/prompt-input"
import { ScrollButton } from "@/shared/ui/scroll-button"
import type { MessagePart, UIMessage } from "@tanstack/ai-client"
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react"
import { getRouteApi } from "@tanstack/react-router"
import {
  ArrowUp,
  Copy,
  Mic,
  Pencil,
  Square,
  ThumbsDown,
  ThumbsUp,
  Trash,
} from "lucide-react"
import { useRef, useState } from "react"
import { ThinkingSteps } from "./thinking-steps"

const routeApi = getRouteApi("/_app/chat/$chatId/")

export function ChatInterface() {
  const [prompt, setPrompt] = useState("")
  const routeParams = routeApi.useParams()
  const loaderData = routeApi.useLoaderData()
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, isLoading, stop } = useChat({
    connection: fetchServerSentEvents(`/api/chat/${routeParams.chatId}`),
    initialMessages: loaderData.chat.isOk()
      ? loaderData.chat.value.messages.map((message) => {
          return {
            id: message.id,
            role: message.role as "user" | "assistant",
            parts: [{ type: "text", content: message.content }],
          }
        })
      : [],
  })

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return

    const user = await getCurrentUser()
    if (user.isErr()) return

    sendMessage(prompt)
    setPrompt("")
  }

  return (
    <main className="flex h-[90vh] flex-col overflow-hidden">
      <div ref={chatContainerRef} className="relative flex-1 overflow-y-auto">
        <ChatContainerRoot className="h-full">
          <ChatContainerContent className="space-y-0 px-5 py-12">
            {messages.map((message) => {
              const isAssistant = message.role === "assistant"

              return message.parts.map((part, index) => {
                if (part.type === "thinking") {
                  return <ThinkingMessage part={part} index={index} />
                }

                return (
                  <Message
                    key={message.id}
                    className={cn(
                      "mx-auto flex w-full max-w-3xl flex-col gap-2 px-6 mb-8",
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
            })}
          </ChatContainerContent>
          <div className="absolute bottom-4 left-1/2 flex w-full max-w-3xl -translate-x-1/2 justify-end px-5">
            <ScrollButton className="shadow-sm" />
          </div>
        </ChatContainerRoot>
      </div>

      <div className="bg-background z-10 shrink-0 px-3 pb-3 md:px-5 md:pb-5">
        <div className="mx-auto max-w-3xl">
          <PromptInput
            isLoading={isLoading}
            value={prompt}
            onValueChange={setPrompt}
            onSubmit={handleSubmit}
            className="border-input bg-popover relative z-10 w-full rounded-3xl border p-0 shadow-xs"
          >
            <div className="flex justify-between items-center gap-6 px-3 py-2">
              <PromptInputTextarea
                placeholder="Ask anything"
                className="bg-transparent! min-h-auto"
              />

              <PromptInputActions className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <PromptInputAction tooltip="Voice input">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-9 rounded-full"
                    >
                      <Mic size={18} />
                    </Button>
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

function ThinkingMessage({
  part,
  index,
}: {
  part: MessagePart
  index: number
}) {
  if (part.type !== "thinking") return null

  return (
    <div className="max-w-3xl mx-auto w-full">
      <ThinkingSteps key={index} steps={part.content.split("\n")} />
    </div>
  )
}

function UserMessage({ part }: { part: MessagePart }) {
  if (part.type !== "text") return null

  return (
    <div className="group flex flex-col items-end gap-1">
      <MessageContent markdown>{part.content}</MessageContent>
      <MessageActions className={cn("")}>
        <MessageAction tooltip="Edit">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Pencil />
          </Button>
        </MessageAction>
        <MessageAction tooltip="Delete">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Trash />
          </Button>
        </MessageAction>
        <MessageAction tooltip="Copy">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Copy />
          </Button>
        </MessageAction>
      </MessageActions>
    </div>
  )
}

function AssistantMessage({
  part,
  messages,
  index,
  isLoading,
}: {
  part: MessagePart
  messages: UIMessage[]
  index: number
  isLoading: boolean
}) {
  if (part.type !== "text") return null

  const isLastMessage = index === messages.length - 1

  return (
    <div className="group flex w-full flex-col gap-0">
      <MessageContent className="bg-transparent text-foreground" markdown>
        {part.content}
      </MessageContent>

      <MessageActions
        className={cn("", isLastMessage && !isLoading && "opacity-100")}
      >
        <MessageAction tooltip="Copy">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Copy />
          </Button>
        </MessageAction>
        <MessageAction tooltip="Upvote">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ThumbsUp />
          </Button>
        </MessageAction>
        <MessageAction tooltip="Downvote">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ThumbsDown />
          </Button>
        </MessageAction>
      </MessageActions>
    </div>
  )
}
