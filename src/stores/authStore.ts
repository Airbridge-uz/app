import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";
import {
	login as apiLogin,
	register as apiRegister,
	getMe,
} from "@/lib/api/auth";

interface AuthState {
	user: User | null;
	token: string | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	error: string | null;
}

interface AuthActions {
	login: (email: string, password: string) => Promise<void>;
	register: (
		email: string,
		password: string,
		fullName?: string,
	) => Promise<void>;
	logout: () => void;
	fetchUser: () => Promise<void>;
	setToken: (token: string) => void;
	clearError: () => void;
	initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
	persist(
		(set, get) => ({
			// State
			user: null,
			token: null,
			isLoading: false,
			isAuthenticated: false,
			error: null,

			// Actions
			login: async (email: string, password: string) => {
				set({ isLoading: true, error: null });
				try {
					const authToken = await apiLogin(email, password);

					// Save token to localStorage (for axios interceptor)
					if (typeof window !== "undefined") {
						localStorage.setItem("auth-token", authToken.access_token);
					}

					set({
						token: authToken.access_token,
						isAuthenticated: true,
						isLoading: false,
					});

					// Fetch user data
					await get().fetchUser();
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Login failed";
					set({ isLoading: false, error: message });
					throw error;
				}
			},

			register: async (email: string, password: string, fullName?: string) => {
				set({ isLoading: true, error: null });
				try {
					await apiRegister({ email, password, full_name: fullName });

					// Auto-login after registration
					await get().login(email, password);
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Registration failed";
					set({ isLoading: false, error: message });
					throw error;
				}
			},

			logout: () => {
				// Clear token from localStorage
				if (typeof window !== "undefined") {
					localStorage.removeItem("auth-token");
				}

				set({
					user: null,
					token: null,
					isAuthenticated: false,
					error: null,
				});
			},

			fetchUser: async () => {
				const { token } = get();
				if (!token) return;

				try {
					const user = await getMe();
					set({ user, isAuthenticated: true });
				} catch {
					// Token is invalid, logout
					get().logout();
				}
			},

			setToken: (token: string) => {
				if (typeof window !== "undefined") {
					localStorage.setItem("auth-token", token);
				}
				set({ token, isAuthenticated: true });
			},

			clearError: () => set({ error: null }),

			initialize: async () => {
				// Check for existing token on app load
				if (typeof window !== "undefined") {
					const storedToken = localStorage.getItem("auth-token");
					if (storedToken) {
						set({ token: storedToken, isAuthenticated: true });
						await get().fetchUser();
					}
				}
			},
		}),
		{
			name: "auth-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({ token: state.token }), // Only persist token
		},
	),
);
