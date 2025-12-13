'use client';

import { SuggestionChip } from './SuggestionChip';
import { SuggestionSkeleton } from './SuggestionSkeleton';
import { Suggestion } from '@/types';

interface SuggestionChipsProps {
    suggestions: Suggestion[];
    onSuggestionClick: (value: string) => void;
    isLoading?: boolean;
    isStreaming?: boolean;
    showSkeleton?: boolean;
}

/**
 * SuggestionChips
 * 
 * Smart suggestion buttons with instant display and skeleton loading.
 * 
 * UX Pattern:
 * 1. Message streaming → Show nothing
 * 2. Message complete, no suggestions yet → Show skeleton (briefly)
 * 3. Suggestions received → Show buttons with subtle fade-in
 */
export function SuggestionChips({
    suggestions,
    onSuggestionClick,
    isLoading = false,
    isStreaming = false,
    showSkeleton = false,
}: SuggestionChipsProps) {
    // Don't show anything while streaming
    if (isStreaming) {
        return null;
    }
    
    // Show skeleton while loading (message complete but no suggestions yet)
    // Only show skeleton briefly - suggestions should arrive instantly now
    if (showSkeleton && (!suggestions || suggestions.length === 0)) {
        return <SuggestionSkeleton count={3} />;
    }
    
    // Don't render if no suggestions
    if (!suggestions || suggestions.length === 0) {
        return null;
    }

    // Sort to put magic_action first, then ui_trigger, then others
    const sortedSuggestions = [...suggestions].sort((a, b) => {
        const priority = { magic_action: 0, ui_trigger: 1, action: 2, query: 3 };
        const aPriority = priority[a.type || 'query'] ?? 3;
        const bPriority = priority[b.type || 'query'] ?? 3;
        return aPriority - bPriority;
    });

    return (
        <div 
            className="flex flex-wrap gap-2 mt-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
            role="group"
            aria-label="Suggested responses"
        >
            {sortedSuggestions.map((suggestion, index) => (
                <SuggestionChip
                    key={`${suggestion.label}-${index}`}
                    suggestion={suggestion}
                    onClick={onSuggestionClick}
                    disabled={isLoading}
                    style={{
                        // Stagger animation for each button
                        animationDelay: `${index * 50}ms`,
                    }}
                />
            ))}
        </div>
    );
}

