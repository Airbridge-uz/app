'use client';

import Image from 'next/image';
import { Sparkles, Compass, MapPin, Palmtree, Zap, ArrowRightLeft, BarChart3, Coins } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyChatStateProps {
    onSuggestionClick: (suggestion: string) => void;
    mode?: 'chat' | 'analyze';
}

interface SuggestionItem {
    icon: ReactNode;
    label: string;
    value: string;
}

// Discovery-focused suggestions - no hardcoded destinations!
const CHAT_SUGGESTIONS: SuggestionItem[] = [
    { icon: <Sparkles className="w-4 h-4" />, label: 'Inspire Me', value: 'Surprise me with a destination I\'d love' },
    { icon: <Palmtree className="w-4 h-4" />, label: 'Weekend Escape', value: 'Suggest a quick weekend getaway' },
    { icon: <Compass className="w-4 h-4" />, label: 'Hidden Gems', value: 'What are some underrated destinations?' },
    { icon: <MapPin className="w-4 h-4" />, label: 'Plan a Trip', value: 'Help me plan my next adventure' },
];

const ANALYZE_SUGGESTIONS: SuggestionItem[] = [
    { icon: <Coins className="w-4 h-4" />, label: 'Show cheapest', value: 'Which of these is the cheapest option?' },
    { icon: <Zap className="w-4 h-4" />, label: 'Show fastest', value: 'Which flight is the fastest?' },
    { icon: <ArrowRightLeft className="w-4 h-4" />, label: 'Direct flights', value: 'Show me only direct flights' },
    { icon: <BarChart3 className="w-4 h-4" />, label: 'Compare value', value: 'Compare the best value options' },
];

export function EmptyChatState({ onSuggestionClick, mode = 'chat' }: EmptyChatStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full px-4 py-12 w-full">
            {/* Hero Image with Sunbeam Effect */}
            <div className="relative mb-8 flex-shrink-0 flex items-center justify-center">
                {/* Sunbeam Wheel - Rotating on center axis */}
                <div 
                    className="absolute animate-spin-slow"
                    style={{ 
                        width: '280px',
                        height: '280px',
                        animationDuration: '30s',
                    }}
                >
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute left-1/2 top-1/2"
                            style={{ 
                                transform: `translate(-50%, -50%) rotate(${i * 18}deg)`,
                                width: '4px',
                                height: '280px',
                                background: `linear-gradient(
                                    to bottom,
                                    transparent 0%,
                                    rgba(255, 200, 50, 0.15) 20%,
                                    rgba(255, 180, 0, 0.7) 35%,
                                    rgba(255, 220, 100, 0.9) 50%,
                                    rgba(255, 180, 0, 0.7) 65%,
                                    rgba(255, 200, 50, 0.15) 80%,
                                    transparent 100%
                                )`,
                                borderRadius: '2px',
                            }}
                        />
                    ))}
                </div>
                
                {/* Inner glow - warm center */}
                <div 
                    className="absolute rounded-full blur-2xl animate-pulse-glow"
                    style={{
                        width: '160px',
                        height: '160px',
                        background: 'radial-gradient(circle, rgba(255, 200, 50, 0.6) 0%, rgba(255, 170, 0, 0.3) 40%, transparent 70%)',
                    }}
                />
                
                {/* Image Container - On top */}
                <div className="relative z-10 w-40 h-32 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white bg-gradient-to-br from-amber-50 to-orange-50">
                    <Image
                        src="/img/Gemini_Generated_Image_yiaq06yiaq06yiaq.png"
                        alt="Travel AI Assistant"
                        width={160}
                        height={128}
                        className="w-full h-full object-cover"
                        priority
                    />
                </div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-semibold text-ink mb-2 text-center">
                {mode === 'analyze' ? 'Analyze Flights' : 'Where to next?'}
            </h1>

            {/* Subtext */}
            <p className="text-muted text-center mb-8 max-w-[90%] lg:max-w-md">
                {mode === 'analyze'
                    ? 'Ask me anything about these flight results. I can compare prices, times, and amenities.'
                    : 'I can help you find flights anywhere. Just ask me about destinations, prices, or travel dates.'}
            </p>

            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-2.5 justify-center max-w-lg">
                {(mode === 'analyze' ? ANALYZE_SUGGESTIONS : CHAT_SUGGESTIONS).map((suggestion) => (
                    <button
                        key={suggestion.value}
                        onClick={() => onSuggestionClick(suggestion.value)}
                        className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all duration-200 shadow-sm hover:shadow"
                    >
                        <span className="text-gray-400 group-hover:text-accent transition-colors">
                            {suggestion.icon}
                        </span>
                        {suggestion.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
