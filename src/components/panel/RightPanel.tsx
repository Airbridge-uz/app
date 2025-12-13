'use client';

import { useEffect } from 'react';
import { X, Check, ChevronRight } from 'lucide-react';
import { usePanelStore, PanelView } from '@/stores/panelStore';
import { cn } from '@/utils/cn';
import { FlightDetailPanel } from './FlightDetailPanel';
import { FareSelectionPanel } from './FareSelectionPanel';
import { PassengerFormPanel } from './PassengerFormPanel';
import { ConfirmationPanel } from './ConfirmationPanel';

interface RightPanelProps {
    className?: string;
}

// Breadcrumb step definition
interface BreadcrumbStep {
    id: PanelView;
    label: string;
    shortLabel: string;
}

const BOOKING_STEPS: BreadcrumbStep[] = [
    { id: 'flight-detail', label: 'Flight Details', shortLabel: 'Flight' },
    { id: 'fare-selection', label: 'Select Fare', shortLabel: 'Fare' },
    { id: 'passenger-details', label: 'Passengers', shortLabel: 'Passengers' },
    { id: 'confirmation', label: 'Confirmation', shortLabel: 'Done' },
];

export function RightPanel({ className }: RightPanelProps) {
    const { currentView, isOpen, closePanel, setView } = usePanelStore();
    
    // Handle Escape key to close panel
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                closePanel();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closePanel]);
    
    // Get current step index
    const currentStepIndex = BOOKING_STEPS.findIndex(step => step.id === currentView);
    
    // Handle breadcrumb click - only allow going back to previous steps
    const handleBreadcrumbClick = (stepIndex: number) => {
        // Can only click on completed steps (before current) or current step
        if (stepIndex < currentStepIndex) {
            setView(BOOKING_STEPS[stepIndex].id);
        }
    };
    
    return (
        <div 
            className={cn(
                'flex flex-col h-full bg-white border-l border-gray-200',
                'shadow-[-4px_0_20px_rgba(0,0,0,0.08)]',
                className
            )}
        >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
                <span className="text-sm font-medium text-gray-600">Book Flight</span>
                <button
                    onClick={closePanel}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Close panel"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>
            
            {/* Breadcrumb Navigation */}
            {currentView !== 'confirmation' && (
                <div className="px-5 py-3 border-b border-gray-100 flex-shrink-0">
                    <nav className="flex items-center" aria-label="Booking progress">
                        {BOOKING_STEPS.slice(0, -1).map((step, index) => {
                            const isCompleted = index < currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            const isClickable = index < currentStepIndex;
                            const isLast = index === BOOKING_STEPS.length - 2;
                            
                            return (
                                <div key={step.id} className="flex items-center">
                                    {/* Step indicator */}
                                    <button
                                        onClick={() => handleBreadcrumbClick(index)}
                                        disabled={!isClickable}
                                        className={cn(
                                            'flex items-center gap-2 transition-all duration-200',
                                            isClickable && 'cursor-pointer hover:opacity-80',
                                            !isClickable && !isCurrent && 'cursor-default'
                                        )}
                                    >
                                        {/* Step number/check circle */}
                                        <div
                                            className={cn(
                                                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200',
                                                isCompleted && 'bg-teal-500 text-white',
                                                isCurrent && 'bg-gray-900 text-white',
                                                !isCompleted && !isCurrent && 'bg-gray-200 text-gray-500'
                                            )}
                                        >
                                            {isCompleted ? (
                                                <Check className="w-3.5 h-3.5" />
                                            ) : (
                                                index + 1
                                            )}
                                        </div>
                                        
                                        {/* Step label */}
                                        <span
                                            className={cn(
                                                'text-sm font-medium transition-colors duration-200',
                                                isCurrent && 'text-gray-900',
                                                isCompleted && 'text-teal-600',
                                                !isCompleted && !isCurrent && 'text-gray-400'
                                            )}
                                        >
                                            {step.shortLabel}
                                        </span>
                                    </button>
                                    
                                    {/* Separator */}
                                    {!isLast && (
                                        <ChevronRight className="w-4 h-4 mx-2 text-gray-300 flex-shrink-0" />
                                    )}
                                </div>
                            );
                        })}
                    </nav>
                </div>
            )}
            
            {/* Content area - scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                {currentView === 'flight-detail' && <FlightDetailPanel />}
                {currentView === 'fare-selection' && <FareSelectionPanel />}
                {currentView === 'passenger-details' && <PassengerFormPanel />}
                {currentView === 'confirmation' && <ConfirmationPanel />}
            </div>
        </div>
    );
}

export default RightPanel;

