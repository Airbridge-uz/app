"use client";

import { cn } from "@/utils/cn";
import { RefreshCw, Banknote } from "lucide-react";

interface PolicyCardProps {
	type: "change" | "refund";
	allowed: boolean;
	fee?: number;
	currency?: string;
	className?: string;
}

export function PolicyCard({
	type,
	allowed,
	fee,
	currency = "GBP",
	className,
}: PolicyCardProps) {
	const Icon = type === "change" ? RefreshCw : Banknote;
	const title =
		type === "change" ? "Flight change policy" : "Order refund policy";

	const getDescription = () => {
		if (!allowed) {
			return type === "change"
				? "Changes are not permitted for this fare"
				: "This fare is non-refundable";
		}
		if (fee && fee > 0) {
			const symbol =
				currency === "GBP" ? "£" : currency === "USD" ? "$" : currency;
			return type === "change"
				? `Changes allowed with ${symbol}${fee} fee`
				: `Refundable with ${symbol}${fee} fee`;
		}
		return type === "change" ? "Free changes allowed" : "Fully refundable";
	};

	return (
		<div
			className={cn(
				"flex-1 p-4 bg-white border border-gray-200 rounded-lg",
				className,
			)}
		>
			<div className="flex items-start gap-3">
				<div
					className={cn(
						"w-8 h-8 flex items-center justify-center rounded-lg",
						allowed ? "bg-amber-50" : "bg-gray-100",
					)}
				>
					<Icon
						className={cn(
							"w-4 h-4",
							allowed ? "text-amber-600" : "text-gray-400",
						)}
					/>
				</div>
				<div>
					<h4 className="text-sm font-medium text-gray-900">{title}</h4>
					<p className="text-xs text-gray-500 mt-0.5">{getDescription()}</p>
				</div>
			</div>
		</div>
	);
}

export default PolicyCard;
