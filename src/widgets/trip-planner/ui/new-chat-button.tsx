import { queryClient } from "@/app/providers/tanstack-query/provider"
import { getEmptyConversation } from "@/entities/conversation"
import { CryptoIdGenerator } from "@/shared/lib/id-generator"
import { useGetConversationListQuery } from "@/shared/queries/conversation"
import { Button } from "@/shared/ui/button"
import { useNavigate } from "@tanstack/react-router"
import { MessageSquare } from "lucide-react"

export function NewChatButton() {
  const navigate = useNavigate()

  const handleNewChat = () => {
    const randomChatId = CryptoIdGenerator.new().generate()

    const query = useGetConversationListQuery
    queryClient.setQueryData(query.getKey(), () => {
      const prevData = queryClient.getQueryData(query.getKey())
      if (!prevData) return prevData

      const newConversation = getEmptyConversation(randomChatId)

      return {
        conversations: [newConversation, ...prevData.conversations],
        total: prevData.total + 1,
      }
    })
    navigate({ to: "/chat/$chatId", params: { chatId: randomChatId } })
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleNewChat}>
      <MessageSquare className="size-4" />
      New chat
    </Button>
  )
}
