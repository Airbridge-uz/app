'use client';

import { useEffect } from 'react';
import {
    MessageSquare,
    Heart,
    Plane,
    Plus,
    PanelLeftClose,
    PanelLeftOpen,
    Map,
    Loader2
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useUIStore, ActivePanel } from '@/stores/uiStore';
import { useChatStore } from '@/stores/chatStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDistanceToNow, isToday, isYesterday, subDays, isAfter } from 'date-fns';

interface NavItem {
    id: ActivePanel;
    icon: React.ElementType;
    label: string;
    tooltip: string;
}

const navItems: NavItem[] = [
    { id: 'chat', icon: MessageSquare, label: 'Chat', tooltip: 'AI Chat' },
    { id: 'saved-trips', icon: Heart, label: 'Saved', tooltip: 'Saved Trips' },

];

// Group conversations by date
function groupConversationsByDate(conversations: Array<{ session_id: string; title: string; last_message_at?: string; preview?: string; has_itinerary: boolean; has_flights: boolean }>) {
    const today: typeof conversations = [];
    const yesterday: typeof conversations = [];
    const previous30Days: typeof conversations = [];
    const older: typeof conversations = [];

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    conversations.forEach(conv => {
        if (!conv.last_message_at) {
            older.push(conv);
            return;
        }

        const date = new Date(conv.last_message_at);

        if (isToday(date)) {
            today.push(conv);
        } else if (isYesterday(date)) {
            yesterday.push(conv);
        } else if (isAfter(date, thirtyDaysAgo)) {
            previous30Days.push(conv);
        } else {
            older.push(conv);
        }
    });

    return { today, yesterday, previous30Days, older };
}

export function AppSidebar() {
    const { activePanel, setActivePanel, isSidebarCollapsed, toggleSidebar } = useUIStore();
    const { clearChat, sessionId } = useChatStore();
    const { isAuthenticated } = useAuthStore();
    const {
        conversations,
        isLoading,
        error,
        loadConversations,
        loadConversation
    } = useHistoryStore();

    // Load conversations when authenticated
    useEffect(() => {
        if (isAuthenticated && conversations.length === 0) {
            loadConversations();
        }
    }, [isAuthenticated, conversations.length, loadConversations]);

    const handleNewChat = () => {
        clearChat();
        setActivePanel('chat');
    };

    const handleLoadConversation = (convSessionId: string) => {
        loadConversation(convSessionId);
        setActivePanel('chat');
    };

    const groupedConversations = groupConversationsByDate(conversations);

    return (
        <aside
            className={cn(
                "flex flex-col bg-white border-r border-gray-200 shrink-0 h-full",
                "transition-all duration-300 ease-in-out",
                isSidebarCollapsed ? "w-[70px]" : "w-64"
            )}
        >
            {/* Logo */}
            <div className={cn(
                "flex items-center h-14 border-b border-gray-100 shrink-0",
                isSidebarCollapsed ? "justify-center px-2" : "px-4"
            )}>
                {isSidebarCollapsed ? (
                    <span className="text-lg font-bold text-black">S</span>
                ) : (
                    <span className="text-lg font-semibold text-black">SkySearch</span>
                )}
            </div>

            {/* New Chat Button */}
            <div className={cn(
                "shrink-0 border-b border-gray-100",
                isSidebarCollapsed ? "p-2" : "p-3"
            )}>
                <button
                    onClick={handleNewChat}
                    className={cn(
                        "flex items-center justify-center gap-2 rounded font-medium transition-all",
                        "bg-black text-white",
                        "hover:bg-neutral-800",
                        "active:scale-[0.98]",
                        isSidebarCollapsed
                            ? "w-11 h-11 mx-auto"
                            : "w-full py-2.5 px-4"
                    )}
                >
                    <Plus className="w-5 h-5" strokeWidth={2} />
                    {!isSidebarCollapsed && <span>New Chat</span>}
                </button>
            </div>

            {/* Navigation */}
            <nav className={cn(
                "shrink-0 border-b border-gray-100",
                isSidebarCollapsed ? "p-2" : "p-2"
            )}>
                <div className={cn(
                    "flex",
                    isSidebarCollapsed ? "flex-col gap-1" : "flex-col gap-1"
                )}>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activePanel === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setActivePanel(item.id)}
                                className={cn(
                                    "group relative flex items-center gap-3 rounded transition-all",
                                    isSidebarCollapsed
                                        ? "w-11 h-11 justify-center mx-auto"
                                        : "w-full px-3 py-2.5",
                                    isActive
                                        ? "bg-black text-white"
                                        : "text-gray-500 hover:bg-gray-100 hover:text-black"
                                )}
                            >
                                <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />

                                {!isSidebarCollapsed && (
                                    <span className="text-sm font-medium">{item.label}</span>
                                )}

                                {/* Tooltip for collapsed mode */}
                                {isSidebarCollapsed && (
                                    <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                        {item.tooltip}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {isSidebarCollapsed ? (
                    // Collapsed: Just show a subtle indicator
                    <div className="p-2 flex flex-col items-center">
                        <div className="w-8 h-[1px] bg-gray-200 my-2" />
                    </div>
                ) : (
                    // Expanded: Show full history
                    <div className="p-2">
                        {/* Section Header */}
                        <div className="px-2 py-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Recent Chats
                        </div>

                        {!isAuthenticated ? (
                            <div className="px-3 py-4 text-center">
                                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                                <p className="text-xs text-gray-400">Log in to see history</p>
                            </div>
                        ) : isLoading && conversations.length === 0 ? (
                            <div className="px-3 py-4 flex justify-center">
                                <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="px-3 py-2 text-xs text-red-500">
                                {error}
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="px-3 py-4 text-center">
                                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                                <p className="text-xs text-gray-400">No conversations yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Today */}
                                {groupedConversations.today.length > 0 && (
                                    <ConversationGroup
                                        label="Today"
                                        conversations={groupedConversations.today}
                                        currentSessionId={sessionId}
                                        onSelect={handleLoadConversation}
                                    />
                                )}

                                {/* Yesterday */}
                                {groupedConversations.yesterday.length > 0 && (
                                    <ConversationGroup
                                        label="Yesterday"
                                        conversations={groupedConversations.yesterday}
                                        currentSessionId={sessionId}
                                        onSelect={handleLoadConversation}
                                    />
                                )}

                                {/* Previous 30 Days */}
                                {groupedConversations.previous30Days.length > 0 && (
                                    <ConversationGroup
                                        label="Previous 30 Days"
                                        conversations={groupedConversations.previous30Days}
                                        currentSessionId={sessionId}
                                        onSelect={handleLoadConversation}
                                    />
                                )}

                                {/* Older */}
                                {groupedConversations.older.length > 0 && (
                                    <ConversationGroup
                                        label="Older"
                                        conversations={groupedConversations.older}
                                        currentSessionId={sessionId}
                                        onSelect={handleLoadConversation}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Collapse Toggle */}
            <div className={cn(
                "shrink-0 border-t border-gray-100",
                isSidebarCollapsed ? "p-2" : "p-3"
            )}>
                <button
                    onClick={toggleSidebar}
                    className={cn(
                        "flex items-center gap-2 rounded transition-colors",
                        "text-gray-400 hover:text-black hover:bg-gray-100",
                        isSidebarCollapsed
                            ? "w-11 h-11 justify-center mx-auto"
                            : "w-full px-3 py-2"
                    )}
                >
                    {isSidebarCollapsed ? (
                        <PanelLeftOpen className="w-5 h-5" />
                    ) : (
                        <>
                            <PanelLeftClose className="w-5 h-5" />
                            <span className="text-sm">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}

// Conversation Group Component
function ConversationGroup({
    label,
    conversations,
    currentSessionId,
    onSelect
}: {
    label: string;
    conversations: Array<{ session_id: string; title: string; last_message_at?: string; preview?: string; has_itinerary: boolean; has_flights: boolean }>;
    currentSessionId: string | null;
    onSelect: (sessionId: string) => void;
}) {
    return (
        <div>
            <div className="px-2 py-1 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                {label}
            </div>
            <div className="space-y-0.5">
                {conversations.map((conv) => (
                    <button
                        key={conv.session_id}
                        onClick={() => onSelect(conv.session_id)}
                        className={cn(
                            "w-full text-left px-2 py-2 rounded transition-colors group",
                            conv.session_id === currentSessionId
                                ? "bg-gray-100"
                                : "hover:bg-gray-50"
                        )}
                    >
                        <div className="flex items-start gap-2">
                            <MessageSquare className={cn(
                                "w-4 h-4 shrink-0 mt-0.5",
                                conv.session_id === currentSessionId ? "text-black" : "text-gray-400"
                            )} />
                            <div className="flex-1 min-w-0">
                                <div className={cn(
                                    "text-sm font-medium truncate",
                                    conv.session_id === currentSessionId ? "text-black" : "text-gray-700"
                                )}>
                                    {conv.title}
                                </div>
                                {conv.preview && (
                                    <div className="text-xs text-gray-400 truncate mt-0.5">
                                        {conv.preview}
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 mt-1">
                                    {conv.has_itinerary && (
                                        <Map className="w-3 h-3 text-gray-500" />
                                    )}
                                    {conv.has_flights && (
                                        <Plane className="w-3 h-3 text-gray-500" />
                                    )}
                                    {conv.last_message_at && (
                                        <span className="text-[10px] text-gray-400">
                                            {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
