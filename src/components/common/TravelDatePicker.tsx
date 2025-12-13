'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isBefore,
    startOfDay,
    isAfter,
    isWithinInterval,
    addDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, X, Plane } from 'lucide-react';
import { cn } from '@/utils/cn';

interface TravelDatePickerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (departureDate: string, returnDate: string | null) => void;
    initialDepartureDate?: string;
    initialReturnDate?: string;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function TravelDatePicker({
    isOpen,
    onClose,
    onConfirm,
    initialDepartureDate,
    initialReturnDate,
}: TravelDatePickerProps) {
    const [viewDate, setViewDate] = useState(() => new Date());
    const [departureDate, setDepartureDate] = useState<Date | null>(null);
    const [returnDate, setReturnDate] = useState<Date | null>(null);
    const [isOneWay, setIsOneWay] = useState(false);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const [selectingReturn, setSelectingReturn] = useState(false);

    const minDate = startOfDay(new Date());

    // Initialize dates from props
    useEffect(() => {
        if (initialDepartureDate) {
            setDepartureDate(new Date(initialDepartureDate));
        }
        if (initialReturnDate) {
            setReturnDate(new Date(initialReturnDate));
        }
    }, [initialDepartureDate, initialReturnDate]);

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setViewDate(new Date());
            setSelectingReturn(false);
            if (!initialDepartureDate) {
                setDepartureDate(null);
                setReturnDate(null);
                setIsOneWay(false);
            }
        }
    }, [isOpen, initialDepartureDate]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    const handleDateClick = useCallback((date: Date) => {
        if (isOneWay) {
            setDepartureDate(date);
            return;
        }

        if (!departureDate || (departureDate && returnDate)) {
            // Start fresh selection
            setDepartureDate(date);
            setReturnDate(null);
            setSelectingReturn(true);
        } else if (selectingReturn) {
            // Selecting return date
            if (isBefore(date, departureDate)) {
                // Clicked before departure - restart
                setDepartureDate(date);
                setReturnDate(null);
            } else {
                setReturnDate(date);
                setSelectingReturn(false);
            }
        }
    }, [departureDate, returnDate, selectingReturn, isOneWay]);

    const handleConfirm = () => {
        if (!departureDate) return;
        
        const depStr = format(departureDate, 'yyyy-MM-dd');
        const retStr = returnDate && !isOneWay ? format(returnDate, 'yyyy-MM-dd') : null;
        
        onConfirm(depStr, retStr);
        onClose();
    };

    const handleOneWayToggle = () => {
        setIsOneWay(!isOneWay);
        if (!isOneWay) {
            setReturnDate(null);
        }
    };

    const renderMonth = (monthDate: Date, isSecond: boolean = false) => {
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
        const startDayOfWeek = monthStart.getDay();
        const padding = Array(startDayOfWeek).fill(null);

        return (
            <div className={cn("flex-1", isSecond && "border-l border-gray-100 pl-6")}>
                {/* Month Header */}
                <div className="text-center mb-4">
                    <span className="text-sm font-medium text-gray-900">
                        {format(monthDate, 'MMMM yyyy')}
                    </span>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {WEEKDAYS.map(day => (
                        <div key={day} className="h-8 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-400">{day}</span>
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {padding.map((_, i) => (
                        <div key={`pad-${i}`} className="h-10" />
                    ))}
                    {days.map(day => {
                        const isDisabled = isBefore(day, minDate);
                        const isSelectedDeparture = !!(departureDate && isSameDay(day, departureDate));
                        const isSelectedReturn = !!(returnDate && isSameDay(day, returnDate));
                        const isSelected = isSelectedDeparture || isSelectedReturn;

                        // Range highlighting
                        let isInRange = false;
                        let isRangeStart = false;
                        let isRangeEnd = false;

                        if (!isOneWay && departureDate) {
                            if (returnDate) {
                                isInRange = isWithinInterval(day, { start: departureDate, end: returnDate });
                                isRangeStart = isSelectedDeparture;
                                isRangeEnd = isSelectedReturn;
                            } else if (hoverDate && isAfter(hoverDate, departureDate) && selectingReturn) {
                                isInRange = isWithinInterval(day, { start: departureDate, end: hoverDate });
                                isRangeStart = isSelectedDeparture;
                                isRangeEnd = isSameDay(day, hoverDate);
                            }
                        }

                        return (
                            <div key={day.toISOString()} className="relative">
                                {/* Range background */}
                                {isInRange && !isRangeStart && !isRangeEnd && (
                                    <div className="absolute inset-0 bg-amber-50" />
                                )}
                                {isRangeStart && isInRange && (
                                    <div className="absolute inset-y-0 right-0 left-1/2 bg-amber-50" />
                                )}
                                {isRangeEnd && isInRange && (
                                    <div className="absolute inset-y-0 left-0 right-1/2 bg-amber-50" />
                                )}

                                <button
                                    onClick={() => !isDisabled && handleDateClick(day)}
                                    onMouseEnter={() => !isDisabled && setHoverDate(day)}
                                    onMouseLeave={() => setHoverDate(null)}
                                    disabled={isDisabled}
                                    className={cn(
                                        "relative z-10 h-10 w-full flex items-center justify-center text-sm transition-all duration-150",
                                        // Disabled state
                                        isDisabled && "text-gray-200 cursor-not-allowed",
                                        // Default state
                                        !isDisabled && !isSelected && "text-gray-700 hover:bg-gray-100 rounded-full",
                                        // Selected state (both departure and return)
                                        isSelected && "bg-amber-500 text-white rounded-full font-medium shadow-sm",
                                        // In range but not selected
                                        isInRange && !isSelected && "text-amber-900",
                                    )}
                                >
                                    {format(day, 'd')}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    const canConfirm = departureDate && (isOneWay || returnDate);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto animate-in zoom-in-95 fade-in duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                                <Plane className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Select travel dates</h2>
                                <p className="text-sm text-gray-500">
                                    {selectingReturn ? 'Now select your return date' : 'Choose your departure date'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Selected Dates Display */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="text-xs font-medium text-gray-500 mb-1">Departure</div>
                                <div className={cn(
                                    "text-lg font-medium",
                                    departureDate ? "text-gray-900" : "text-gray-300"
                                )}>
                                    {departureDate ? format(departureDate, 'EEE, MMM d') : 'Select date'}
                                </div>
                            </div>
                            
                            {!isOneWay && (
                                <>
                                    <div className="w-8 h-[1px] bg-gray-300" />
                                    <div className="flex-1">
                                        <div className="text-xs font-medium text-gray-500 mb-1">Return</div>
                                        <div className={cn(
                                            "text-lg font-medium",
                                            returnDate ? "text-gray-900" : "text-gray-300"
                                        )}>
                                            {returnDate ? format(returnDate, 'EEE, MMM d') : 'Select date'}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Calendar */}
                    <div className="p-6">
                        {/* Navigation */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                onClick={() => setViewDate(d => subMonths(d, 1))}
                                disabled={isBefore(startOfMonth(viewDate), startOfMonth(new Date()))}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                                onClick={() => setViewDate(d => addMonths(d, 1))}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        {/* Two-Month View */}
                        <div className="flex gap-6">
                            {renderMonth(viewDate)}
                            {renderMonth(addMonths(viewDate, 1), true)}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        {/* One-way toggle */}
                        <button
                            type="button"
                            onClick={handleOneWayToggle}
                            className="flex items-center gap-3 cursor-pointer group"
                            role="switch"
                            aria-checked={isOneWay}
                        >
                            <div className={cn(
                                "w-11 h-6 rounded-full transition-colors relative",
                                isOneWay ? "bg-amber-500" : "bg-gray-200"
                            )}>
                                <div className={cn(
                                    "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                                    isOneWay ? "translate-x-[22px]" : "translate-x-0.5"
                                )} />
                            </div>
                            <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors select-none">
                                No return ticket needed
                            </span>
                        </button>

                        {/* Confirm Button */}
                        <button
                            onClick={handleConfirm}
                            disabled={!canConfirm}
                            className={cn(
                                "px-6 py-2.5 rounded-full text-sm font-medium transition-all",
                                canConfirm
                                    ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm hover:shadow"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            )}
                        >
                            {canConfirm ? 'Confirm dates' : 'Select dates'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
