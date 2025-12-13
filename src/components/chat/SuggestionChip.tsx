'use client';

import { Sparkles, Plane, Calendar } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Suggestion } from '@/types';
import { CSSProperties } from 'react';

interface SuggestionChipProps {
    suggestion: Suggestion;
    onClick: (value: string) => void;
    disabled?: boolean;
    style?: CSSProperties;
}

export function SuggestionChip({
    suggestion,
    onClick,
    disabled = false,
    style,
}: SuggestionChipProps) {
    const isMagicAction = suggestion.type === 'magic_action';
    const isUITrigger = suggestion.type === 'ui_trigger';

    // Determine icon based on label content
    const getIcon = () => {
        if (suggestion.label.includes('Plan') || suggestion.label.includes('✨')) {
            return <Sparkles className="w-4 h-4" />;
        }
        if (suggestion.label.includes('Flight') || suggestion.label.includes('✈️')) {
            return <Plane className="w-4 h-4" />;
        }
        if (suggestion.value === 'OPEN_CALENDAR_UI') {
            return <Calendar className="w-4 h-4" />;
        }
        return null;
    };

    return (
        <button
            onClick={() => onClick(suggestion.value)}
            disabled={disabled}
            style={style}
            className={cn(
                // Base styles
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                'flex items-center gap-2 whitespace-nowrap',
                'border focus:outline-none focus:ring-2 focus:ring-offset-2',

                // Magic Action - Premium styling with gradient
                isMagicAction && [
                    'bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10',
                    'border-amber-400/50 hover:border-amber-400',
                    'text-amber-700',
                    'hover:shadow-lg hover:shadow-amber-500/20',
                    'hover:scale-105',
                    'ring-amber-400/50',
                    // Subtle shimmer animation
                    'relative overflow-hidden',
                    'before:absolute before:inset-0',
                    'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
                    'before:translate-x-[-200%] hover:before:translate-x-[200%]',
                    'before:transition-transform before:duration-700',
                ],

                // Standard suggestion
                !isMagicAction && !isUITrigger && [
                    'bg-gray-100',
                    'border-gray-200',
                    'text-gray-700',
                    'hover:bg-gray-200',
                    'ring-gray-400/50',
                ],

                // UI Trigger (e.g., open calendar)
                isUITrigger && [
                    'bg-blue-50',
                    'border-blue-300',
                    'text-blue-700',
                    'hover:bg-blue-100',
                    'ring-blue-400/50',
                ],

                // Disabled state
                disabled && 'opacity-50 cursor-not-allowed hover:scale-100'
            )}
        >
            {(isMagicAction || isUITrigger) && getIcon()}
            <span>{suggestion.label}</span>
        </button>
    );
}

