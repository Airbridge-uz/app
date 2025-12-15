"use client";

import { useEffect } from "react";
import { X, MessageSquare, Map, Plane, Plus, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { useHistoryStore } from "@/stores/historyStore";
import { useUIStore } from "@/stores/uiStore";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { formatDistanceToNow } from "date-fns";

interface HistorySidebarProps {
	className?: string;
}

export function HistorySidebar({ className }: HistorySidebarProps) {
	const { isAuthenticated } = useAuthStore();
	const { clearChat, sessionId } = useChatStore();
	const { historySidebarOpen, setHistorySidebarOpen } = useUIStore();
	const {
		conversations,
		isLoading,
		error,
		loadConversations,
		loadConversation,
	} = useHistoryStore();

	// Load conversations when authenticated and sidebar opened
	useEffect(() => {
		if (isAuthenticated && historySidebarOpen && conversations.length === 0) {
			loadConversations();
		}
	}, [
		isAuthenticated,
		historySidebarOpen,
		conversations.length,
		loadConversations,
	]);

	if (!historySidebarOpen) return null;

	return (
		<>
			{/* Overlay for mobile */}
			<div
				className="fixed inset-0 bg-black/20 z-40 lg:hidden"
				onClick={() => setHistorySidebarOpen(false)}
			/>

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed lg:relative inset-y-0 left-0 z-50 w-72 bg-white border-r border-border flex flex-col",
					"animate-[slide-in_200ms_ease-out]",
					className,
				)}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-border">
					<h2 className="font-semibold text-ink">Chat History</h2>
					<button
						onClick={() => setHistorySidebarOpen(false)}
						className="p-1 hover:bg-gray-100 rounded transition-colors lg:hidden"
					>
						<X className="w-5 h-5 text-muted" />
					</button>
				</div>

				{/* New Chat Button */}
				<div className="p-3 border-b border-border">
					<button
						onClick={() => {
							clearChat();
							setHistorySidebarOpen(false);
						}}
						className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
					>
						<Plus className="w-4 h-4" />
						New Chat
					</button>
				</div>

				{/* Conversation List */}
				<div className="flex-1 overflow-y-auto">
					{!isAuthenticated ? (
						<div className="p-4 text-center text-sm text-muted">
							<MessageSquare className="w-8 h-8 mx-auto mb-2 text-border" />
							<p>Log in to see your chat history</p>
						</div>
					) : isLoading ? (
						<div className="p-4 flex justify-center">
							<Loader2 className="w-5 h-5 text-muted animate-spin" />
						</div>
					) : error ? (
						<div className="p-4 text-center text-sm text-error">{error}</div>
					) : conversations.length === 0 ? (
						<div className="p-4 text-center text-sm text-muted">
							<MessageSquare className="w-8 h-8 mx-auto mb-2 text-border" />
							<p>No conversations yet</p>
						</div>
					) : (
						<div className="p-2">
							{conversations.map((conv) => (
								<button
									key={conv.session_id}
									onClick={() => loadConversation(conv.session_id)}
									className={cn(
										"w-full text-left p-3 rounded-lg mb-1 transition-colors",
										conv.session_id === sessionId
											? "bg-accent-muted border border-accent/20"
											: "hover:bg-gray-50",
									)}
								>
									{/* Title */}
									<div className="font-medium text-sm text-ink truncate">
										{conv.title}
									</div>

									{/* Preview */}
									{conv.preview && (
										<div className="text-xs text-muted truncate mt-1">
											{conv.preview}
										</div>
									)}

									{/* Meta */}
									<div className="flex items-center gap-2 mt-2 text-xs text-muted">
										{conv.last_message_at && (
											<span>
												{formatDistanceToNow(new Date(conv.last_message_at), {
													addSuffix: true,
												})}
											</span>
										)}
										{conv.has_itinerary && (
											<span className="flex items-center gap-1 text-accent">
												<Map className="w-3 h-3" />
											</span>
										)}
										{conv.has_flights && (
											<span className="flex items-center gap-1 text-accent">
												<Plane className="w-3 h-3" />
											</span>
										)}
									</div>
								</button>
							))}
						</div>
					)}
				</div>
			</aside>
		</>
	);
}
