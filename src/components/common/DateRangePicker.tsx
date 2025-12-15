"use client";

import { useState, useRef, useEffect } from "react";
import {
	format,
	addMonths,
	subMonths,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isSameMonth,
	isSameDay,
	isToday,
	isBefore,
	startOfDay,
	isAfter,
	isWithinInterval,
} from "date-fns";
import {
	ChevronLeft,
	ChevronRight,
	Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";

interface DateRangePickerProps {
	startDate: string; // YYYY-MM-DD
	endDate: string; // YYYY-MM-DD
	onStartDateChange: (date: string) => void;
	onEndDateChange: (date: string) => void;
	minDate?: Date;
	isOneWay?: boolean;
}

export function DateRangePicker({
	startDate,
	endDate,
	onStartDateChange,
	onEndDateChange,
	minDate = new Date(),
	isOneWay = false,
}: DateRangePickerProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [viewDate, setViewDate] = useState(new Date());
	const [hoverDate, setHoverDate] = useState<Date | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// Parse dates from string
	const startObj = startDate ? new Date(startDate) : null;
	const endObj = endDate ? new Date(endDate) : null;

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleDateClick = (date: Date) => {
		const dateStr = format(date, "yyyy-MM-dd");

		if (isOneWay) {
			onStartDateChange(dateStr);
			setIsOpen(false);
			return;
		}

		if (!startDate || (startDate && endDate)) {
			// Start new range
			onStartDateChange(dateStr);
			onEndDateChange("");
		} else if (startDate && !endDate) {
			// Complete range or restart if earlier
			if (isBefore(date, startObj!)) {
				onStartDateChange(dateStr);
			} else {
				onEndDateChange(dateStr);
				setIsOpen(false);
			}
		}
	};

	const renderMonth = (monthDate: Date) => {
		const monthStart = startOfMonth(monthDate);
		const monthEnd = endOfMonth(monthDate);
		const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
		const startDayOfWeek = monthStart.getDay(); // 0 = Sunday

		// Pad empty days at start
		const padding = Array(startDayOfWeek).fill(null);

		return (
			<div className="w-64 p-4">
				<div className="text-center font-medium mb-4 text-ink">
					{format(monthDate, "MMMM yyyy")}
				</div>
				<div className="grid grid-cols-7 gap-1 text-xs text-muted mb-2 text-center">
					{["Sn", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
						<div key={d}>{d}</div>
					))}
				</div>
				<div className="grid grid-cols-7 gap-1">
					{padding.map((_, i) => (
						<div key={`pad-${i}`} />
					))}
					{days.map((day) => {
						const dateStr = format(day, "yyyy-MM-dd");
						const isSelectedStart = startObj && isSameDay(day, startObj);
						const isSelectedEnd = endObj && isSameDay(day, endObj);
						const isDisabled = isBefore(day, startOfDay(minDate));

						let isInRange = false;
						if (
							startObj &&
							endObj &&
							isWithinInterval(day, { start: startObj, end: endObj })
						) {
							isInRange = true;
						} else if (
							startObj &&
							!endObj &&
							hoverDate &&
							isAfter(hoverDate, startObj) &&
							isWithinInterval(day, { start: startObj, end: hoverDate })
						) {
							isInRange = true;
						}

						// One way logic
						if (isOneWay) {
							isInRange = false;
						}

						return (
							<button
								key={dateStr}
								onClick={() => !isDisabled && handleDateClick(day)}
								onMouseEnter={() => !isDisabled && setHoverDate(day)}
								disabled={isDisabled}
								className={cn(
									"h-8 w-8 rounded-full text-sm flex items-center justify-center transition-colors relative z-10",
									isDisabled && "text-muted/30 cursor-not-allowed",
									!isDisabled &&
										"hover:bg-accent/10 hover:text-accent text-ink",
									(isSelectedStart || isSelectedEnd) &&
										"bg-accent text-white hover:bg-accent hover:text-white",
									isInRange &&
										!isSelectedStart &&
										!isSelectedEnd &&
										"bg-accent-muted/50 rounded-none text-ink width-[calc(100%+4px)] -mx-[2px]",
								)}
							>
								{format(day, "d")}
							</button>
						);
					})}
				</div>
			</div>
		);
	};

	return (
		<div className="relative" ref={containerRef}>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-ink mb-2">
						Departure date
					</label>
					<div
						onClick={() => setIsOpen(true)}
						className={cn(
							"w-full px-4 py-3 border rounded-lg text-sm text-ink cursor-pointer bg-white flex items-center gap-2 transition-colors",
							isOpen ? "border-ink" : "border-border",
							!startDate && "text-muted/50",
						)}
					>
						<CalendarIcon className="w-4 h-4 text-muted" />
						{startDate
							? format(new Date(startDate), "dd MMM yyyy")
							: "DD / MM / YYYY"}
					</div>
				</div>
				<div>
					<label className="block text-sm font-medium text-ink mb-2">
						Return date
					</label>
					<div
						onClick={() => !isOneWay && setIsOpen(true)}
						className={cn(
							"w-full px-4 py-3 border rounded-lg text-sm text-ink cursor-pointer bg-white flex items-center gap-2 transition-colors",
							isOpen ? "border-ink" : "border-border",
							isOneWay && "opacity-50 cursor-not-allowed bg-paper",
							!endDate && "text-muted/50",
						)}
					>
						<CalendarIcon className="w-4 h-4 text-muted" />
						{endDate
							? format(new Date(endDate), "dd MMM yyyy")
							: "DD / MM / YYYY"}
					</div>
				</div>
			</div>

			{isOpen && (
				<div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white rounded-lg shadow-xl border border-border overflow-hidden animate-[fade-in_200ms_ease-out]">
					<div className="flex items-start">
						<button
							onClick={() => setViewDate((d) => subMonths(d, 1))}
							className="absolute top-4 left-4 p-1 hover:bg-paper rounded-full transition-colors"
						>
							<ChevronLeft className="w-4 h-4 text-muted" />
						</button>

						{renderMonth(viewDate)}

						<div className="w-[1px] bg-border self-stretch my-4" />

						{renderMonth(addMonths(viewDate, 1))}

						<button
							onClick={() => setViewDate((d) => addMonths(d, 1))}
							className="absolute top-4 right-4 p-1 hover:bg-paper rounded-full transition-colors"
						>
							<ChevronRight className="w-4 h-4 text-muted" />
						</button>
					</div>
				</div>
			)}
		</div>
	);
}
