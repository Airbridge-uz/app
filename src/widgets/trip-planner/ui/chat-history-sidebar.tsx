import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { Separator } from "@/shared/ui/separator"
import { History, MapPin, MessageSquare, Search } from "lucide-react"
import { useState } from "react"

interface ChatHistoryItem {
  id: string
  title: string
  timestamp: Date
}

const mockChats: ChatHistoryItem[] = [
  {
    id: "1",
    title: "Weekend in Tashkent",
    timestamp: new Date(),
  },
  {
    id: "2",
    title: "Trip to Samarkand",
    timestamp: new Date(Date.now() - 86400000),
  },
]

export function ChatHistorySidebar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  const filteredChats = mockChats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <History className="size-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">Chats</h2>
        </div>

        {/* Search */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/30 border-muted-foreground/10 focus:bg-background transition-all rounded-xl"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2 rounded-xl h-10 border-muted-foreground/10 hover:border-primary/30"
            size="sm"
          >
            <MessageSquare className="size-4" />
            New chat
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2 rounded-xl h-10 border-muted-foreground/10 hover:border-primary/30"
            size="sm"
          >
            <MapPin className="size-4" />
            New trip
          </Button>
        </div>
      </div>

      <Separator className="bg-muted-foreground/5 mx-6 w-auto" />

      {/* Chat List */}
      <ScrollArea className="flex-1 px-3 mt-4">
        <div className="space-y-1">
          <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Recent Chats
          </div>
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              type="button"
              onClick={() => setSelectedChatId(chat.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl transition-all group",
                selectedChatId === chat.id
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "hover:bg-muted/50 text-foreground/70 hover:text-foreground",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "size-2 rounded-full",
                      selectedChatId === chat.id
                        ? "bg-primary"
                        : "bg-muted-foreground/30 group-hover:bg-primary/50",
                    )}
                  />
                  <span className="text-sm font-medium truncate">
                    {chat.title}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums uppercase">
                  {chat.timestamp.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </button>
          ))}

          {filteredChats.length === 0 && (
            <div className="p-8 text-center space-y-2">
              <div className="size-12 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto opacity-40">
                <MessageSquare className="size-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">No chats found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
