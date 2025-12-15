"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
	({ className, label, error, id, ...props }, ref) => {
		const inputId = id || props.name;

		return (
			<div className="w-full">
				{label && (
					<label
						htmlFor={inputId}
						className="block text-sm font-medium text-ink mb-1.5"
					>
						{label}
					</label>
				)}
				<input
					ref={ref}
					id={inputId}
					className={cn(
						"flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm",
						"placeholder:text-muted",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0",
						"disabled:cursor-not-allowed disabled:opacity-50",
						error ? "border-error focus-visible:ring-error" : "border-border",
						className,
					)}
					{...props}
				/>
				{error && <p className="mt-1.5 text-sm text-error">{error}</p>}
			</div>
		);
	},
);

Input.displayName = "Input";

export { Input };
