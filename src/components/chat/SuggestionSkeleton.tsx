"use client";

import React from "react";
import { cn } from "@/utils/cn";

interface SuggestionSkeletonProps {
	count?: number;
	className?: string;
}

/**
 * SuggestionSkeleton
 *
 * Skeleton loading state for suggestion buttons.
 * Shows animated placeholder buttons while suggestions load.
 *
 * Design: Swiss minimalist - subtle, professional, not distracting
 */
export function SuggestionSkeleton({
	count = 3,
	className,
}: SuggestionSkeletonProps) {
	// Varying widths for natural look
	const widths = ["w-20", "w-24", "w-28", "w-22"];

	return (
		<div className={cn("flex flex-wrap gap-2 mt-3", className)}>
			{Array.from({ length: count }).map((_, index) => (
				<div
					key={index}
					className={cn(
						"h-9 rounded-full bg-gray-100 animate-pulse",
						widths[index % widths.length],
					)}
					style={{
						animationDelay: `${index * 100}ms`,
						animationDuration: "1.5s",
					}}
				/>
			))}
		</div>
	);
}

export default SuggestionSkeleton;
