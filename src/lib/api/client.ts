import axios, {
	AxiosError,
	InternalAxiosRequestConfig,
	AxiosResponse,
} from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance with default config
export const apiClient = axios.create({
	baseURL: API_URL,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		// Only access localStorage in browser
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("auth-token");
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	},
);

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
	(response: AxiosResponse) => response,
	(error: AxiosError) => {
		if (error.response?.status === 401) {
			// Clear token and redirect to login
			if (typeof window !== "undefined") {
				localStorage.removeItem("auth-token");
				// Only redirect if not already on auth pages
				if (
					!window.location.pathname.includes("/login") &&
					!window.location.pathname.includes("/register")
				) {
					window.location.href = "/login";
				}
			}
		}
		return Promise.reject(error);
	},
);

export default apiClient;
