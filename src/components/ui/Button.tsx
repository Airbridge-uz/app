"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{
			className,
			variant = "primary",
			size = "md",
			isLoading,
			disabled,
			children,
			...props
		},
		ref,
	) => {
		const baseStyles =
			"inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

		const variants = {
			primary: "bg-ink text-white hover:bg-ink/90",
			secondary: "bg-white text-ink border border-border hover:bg-gray-50",
			ghost: "bg-transparent text-ink hover:bg-gray-100",
		};

		const sizes = {
			sm: "h-8 px-3 text-sm rounded-md",
			md: "h-10 px-4 text-sm rounded-lg",
			lg: "h-12 px-6 text-base rounded-lg",
		};

		return (
			<button
				ref={ref}
				className={cn(baseStyles, variants[variant], sizes[size], className)}
				disabled={disabled || isLoading}
				{...props}
			>
				{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				{children}
			</button>
		);
	},
);

Button.displayName = "Button";

export { Button };
