import { queryClient } from "@/app/providers/tanstack-query/provider"
import { getEmptyConversation } from "@/entities/conversation"
import { getConversationById } from "@/services/conversation"
import { useGetConversationListQuery } from "@/shared/queries/conversation"
import { ChatInterface } from "@/widgets/trip-planner/ui"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/_app/chat/$chatId/")({
  component: RouteComponent,
  async loader({ params }) {
    const { chatId } = params
    const conversationListQueryKey = useGetConversationListQuery.getKey()
    const existingConversations = await queryClient.ensureQueryData({
      queryKey: conversationListQueryKey,
      queryFn: async () => useGetConversationListQuery.fetcher({}),
    })
    const doesConversationExist = existingConversations?.conversations?.some(
      (conversation) => conversation.session_id === chatId,
    )
    if (
      !doesConversationExist &&
      existingConversations?.conversations.length > 0
    ) {
      throw redirect({
        to: "/chat/$chatId",
        params: {
          chatId: existingConversations.conversations[0].session_id,
        },
      })
    }
    if (
      !doesConversationExist &&
      existingConversations.conversations.length === 0
    ) {
      const emptyConversation = getEmptyConversation(chatId)
      queryClient.setQueryData(["conversation", chatId], emptyConversation)
      queryClient.setQueryData(conversationListQueryKey, {
        conversations: [emptyConversation],
        total: 1,
      })
      throw redirect({
        to: "/chat/$chatId",
        params: {
          chatId,
        },
      })
    }
    const getConversationQueryResult = queryClient.ensureQueryData({
      queryKey: ["conversation", chatId],
      queryFn: async () => {
        const result = await getConversationById({ id: chatId })
        if (result.isErr()) {
          if (result.error.status === 404) return getEmptyConversation(chatId)
          throw new Error(result.error.message)
        }
        return result.value
      },
    })

    return {
      getConversationQueryResult,
    }
  },
})

function RouteComponent() {
  const params = Route.useParams()

  return (
    <>
      <main className="flex-1 overflow-hidden relative">
        <ChatInterface key={params.chatId} />
      </main>
      <RouteWatcher />
    </>
  )
}

function RouteWatcher() {
  const params = Route.useParams()

  useEffect(() => {
    queryClient.resetQueries({ queryKey: ["conversation", params.chatId] })
    queryClient.invalidateQueries({ queryKey: ["conversation", params.chatId] })
  }, [params.chatId])

  return null
}
