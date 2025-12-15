"use client";

import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { User, LogOut } from "lucide-react";

export function Header() {
	const { user, isAuthenticated, logout } = useAuthStore();

	return (
		<header className="sticky top-0 z-50 h-14 bg-white/95 backdrop-blur-sm border-b border-gray-200">
			<div className="h-full px-4 flex items-center justify-end">
				{/* Right: Auth */}
				<div className="flex items-center gap-3">
					{isAuthenticated && user ? (
						<div className="flex items-center gap-2">
							<div className="flex items-center gap-2 text-sm text-gray-500">
								<User className="w-4 h-4" />
								<span className="hidden sm:inline max-w-32 truncate">
									{user.email}
								</span>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={logout}
								className="text-gray-500 hover:text-gray-900"
							>
								<LogOut className="w-4 h-4" />
							</Button>
						</div>
					) : (
						<a href="/login">
							<Button variant="secondary" size="sm">
								Log in
							</Button>
						</a>
					)}
				</div>
			</div>
		</header>
	);
}
