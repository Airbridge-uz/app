import apiClient from "./client";
import { AuthToken, User, RegisterData } from "@/types";

/**
 * Login user with email and password
 * @important Uses form-urlencoded format per OAuth2 spec
 */
export async function login(
	email: string,
	password: string,
): Promise<AuthToken> {
	// OAuth2 requires form-urlencoded, not JSON
	const formData = new URLSearchParams();
	formData.append("username", email); // OAuth2 uses 'username' field
	formData.append("password", password);

	const response = await apiClient.post<AuthToken>(
		"/api/v1/auth/login",
		formData,
		{
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		},
	);

	return response.data;
}

/**
 * Register new user
 */
export async function register(data: RegisterData): Promise<User> {
	const response = await apiClient.post<User>("/api/v1/auth/register", {
		email: data.email,
		password: data.password,
		full_name: data.full_name,
	});

	return response.data;
}

/**
 * Get current authenticated user
 */
export async function getMe(): Promise<User> {
	const response = await apiClient.get<User>("/api/v1/auth/me");
	return response.data;
}

/**
 * Test if token is valid
 */
export async function testToken(): Promise<User> {
	const response = await apiClient.post<User>("/api/v1/auth/test-token");
	return response.data;
}
