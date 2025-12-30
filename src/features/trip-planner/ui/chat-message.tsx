import { cn } from "@/shared/lib/utils"
import { Avatar, AvatarFallback } from "@/shared/ui/avatar"
import { Sparkles, User } from "lucide-react"
import { SuggestionCard } from "./suggestion-card"

export interface MessageAction {
  label: string
  onClick: () => void
}

export interface MessageContent {
  text: string
  items?: {
    title: string
    description?: string
    image?: string
    type: "hotel" | "restaurant" | "activity"
  }[]
  actions?: MessageAction[]
}

export interface ChatMessageProps {
  role: "user" | "assistant"
  content: MessageContent | string
  timestamp?: Date
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isAssistant = role === "assistant"

  // Normalize content
  const messageContent =
    typeof content === "string" ? { text: content } : content

  return (
    <div
      className={cn(
        "flex gap-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
        isAssistant ? "flex-row" : "flex-row-reverse",
      )}
    >
      <Avatar
        className={cn(
          "size-8 shrink-0",
          isAssistant ? "bg-primary/20" : "bg-muted",
        )}
      >
        {isAssistant ? (
          <>
            <AvatarFallback className="bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarFallback>
              <User className="size-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div
        className={cn(
          "flex flex-col gap-3 max-w-[80%]",
          isAssistant ? "items-start" : "items-end",
        )}
      >
        <div
          className={cn(
            "px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm",
            isAssistant
              ? "bg-muted text-foreground rounded-tl-none"
              : "bg-primary text-primary-foreground rounded-tr-none",
          )}
        >
          {messageContent.text}
        </div>

        {/* Interactive Items (Images/Cards) */}
        {messageContent.items && messageContent.items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {messageContent.items.map((item, idx) => (
              <SuggestionCard
                key={idx}
                title={item.title}
                description={item.description}
                image={item.image}
                className="w-full h-32"
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {messageContent.actions && messageContent.actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {messageContent.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="px-3 py-1.5 text-xs font-medium rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
