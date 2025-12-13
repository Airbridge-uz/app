'use client';

import { User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ChatMessage as ChatMessageType } from '@/types';
import ReactMarkdown from 'react-markdown';
import { SuggestionChips } from './SuggestionChips';

interface ChatMessageProps {
    message: ChatMessageType;
    onSuggestionClick?: (value: string) => void;
    isLoading?: boolean;
}

export function ChatMessage({ message, onSuggestionClick, isLoading }: ChatMessageProps) {
    const isUser = message.role === 'user';
    const isAssistant = message.role === 'assistant';

    return (
        <div
            className={cn(
                'flex gap-3 animate-[slide-up_200ms_ease-out]',
                isUser ? 'flex-row-reverse' : 'flex-row'
            )}
        >
            {/* Avatar - Only show for user messages */}
            {isUser && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-ink text-white">
                    <User className="w-4 h-4" />
                </div>
            )}

            {/* Message Bubble */}
            <div
                className={cn(
                    'px-4 py-3 text-sm leading-relaxed',
                    isUser
                        ? 'max-w-[80%] bg-ink text-white rounded-2xl rounded-tr-md'
                        : 'max-w-[85%] bg-gray-100 text-ink rounded-2xl rounded-tl-md',
                    message.isStreaming && 'streaming-cursor'
                )}
            >
                {/* Render message content with markdown support */}
                <div className={cn(
                    'break-words',
                    // Markdown styles for assistant messages
                    !isUser && 'prose prose-sm max-w-none prose-p:my-2 prose-p:leading-relaxed prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5'
                )}>
                    {isUser ? (
                        // User messages: plain text with whitespace preserved
                        <span className="whitespace-pre-wrap">{message.content}</span>
                    ) : (
                        // Assistant messages: render markdown
                        message.content ? (
                            <ReactMarkdown
                                components={{
                                    // Customize markdown components
                                    p: ({ children }) => <p className="my-2 first:mt-0 last:mb-0">{children}</p>,
                                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                    em: ({ children }) => <em className="italic">{children}</em>,
                                    ul: ({ children }) => <ul className="list-disc pl-4 my-2">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-4 my-2">{children}</ol>,
                                    li: ({ children }) => <li className="my-0.5">{children}</li>,
                                    a: ({ href, children }) => (
                                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline hover:no-underline">
                                            {children}
                                        </a>
                                    ),
                                    code: ({ children }) => (
                                        <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                                    ),
                                    h1: ({ children }) => <h1 className="text-lg font-semibold mt-3 mb-2">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-2">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-2 border-accent pl-3 my-2 italic text-muted">
                                            {children}
                                        </blockquote>
                                    ),
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        ) : (
                            message.isStreaming && '\u00A0'
                        )
                    )}
                </div>

                {/* Suggestion Chips - Only for assistant messages */}
                {isAssistant && onSuggestionClick && (
                    <SuggestionChips
                        suggestions={message.suggestions || []}
                        onSuggestionClick={onSuggestionClick}
                        isLoading={isLoading}
                        isStreaming={message.isStreaming}
                        showSkeleton={!message.isStreaming && (!message.suggestions || message.suggestions.length === 0)}
                    />
                )}
            </div>
        </div>
    );
}
