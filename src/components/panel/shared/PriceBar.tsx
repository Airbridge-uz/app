"use client";

import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

interface PriceBarProps {
	price: number;
	currency: string;
	buttonText: string;
	onButtonClick: () => void;
	isLoading?: boolean;
	disabled?: boolean;
	helperText?: string;
	className?: string;
}

export function PriceBar({
	price,
	currency,
	buttonText,
	onButtonClick,
	isLoading = false,
	disabled = false,
	helperText,
	className,
}: PriceBarProps) {
	const formatPrice = (amount: number, curr: string) => {
		const symbol =
			curr === "GBP" ? "£" : curr === "USD" ? "$" : curr === "EUR" ? "€" : curr;
		return `${symbol}${amount.toFixed(2)}`;
	};

	return (
		<div
			className={cn(
				"sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4",
				className,
			)}
		>
			<div className="flex items-center justify-between mb-2">
				<div>
					<p className="text-sm text-gray-500">Total price</p>
					<p className="text-2xl font-semibold text-gray-900">
						{formatPrice(price, currency)}
					</p>
				</div>
				<button
					onClick={onButtonClick}
					disabled={disabled || isLoading}
					className={cn(
						"px-8 py-3 rounded-lg text-sm font-medium transition-all duration-200",
						"bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950",
						"disabled:bg-gray-300 disabled:cursor-not-allowed",
						"flex items-center gap-2",
					)}
				>
					{isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
					{isLoading ? "Processing..." : buttonText}
				</button>
			</div>
			{helperText && <p className="text-xs text-gray-500">{helperText}</p>}
		</div>
	);
}

export default PriceBar;
