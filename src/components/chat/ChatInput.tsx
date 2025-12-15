"use client";

import { useState, useRef, useEffect, KeyboardEvent, FormEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/utils/cn";

interface ChatInputProps {
	onSend: (message: string) => void;
	isLoading?: boolean;
	placeholder?: string;
}

export function ChatInput({
	onSend,
	isLoading = false,
	placeholder = "Where would you like to fly?",
}: ChatInputProps) {
	const [value, setValue] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Auto-resize textarea
	useEffect(() => {
		const textarea = textareaRef.current;
		if (textarea) {
			textarea.style.height = "auto";
			const newHeight = Math.min(textarea.scrollHeight, 120); // Max 4 lines (~120px)
			textarea.style.height = `${newHeight}px`;
		}
	}, [value]);

	const handleSubmit = (e?: FormEvent) => {
		e?.preventDefault();

		const trimmed = value.trim();
		if (!trimmed || isLoading) return;

		onSend(trimmed);
		setValue("");
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		// Enter to send, Shift+Enter for new line
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex items-end gap-2 p-2 bg-gray-50 rounded-xl border border-border focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-0 focus-within:border-accent transition-all"
		>
			<textarea
				ref={textareaRef}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				disabled={isLoading}
				rows={1}
				className={cn(
					"flex-1 resize-none bg-transparent px-2 py-2 text-sm",
					"placeholder:text-muted focus:outline-none",
					"disabled:opacity-50 disabled:cursor-not-allowed",
				)}
			/>

			<button
				type="submit"
				disabled={!value.trim() || isLoading}
				className={cn(
					"flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
					"disabled:opacity-50 disabled:cursor-not-allowed",
					value.trim() && !isLoading
						? "bg-accent text-white hover:bg-accent/90"
						: "bg-gray-200 text-muted",
				)}
			>
				<Send className="w-4 h-4" />
			</button>
		</form>
	);
}
