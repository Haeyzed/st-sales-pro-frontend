/**
 * Auth API Functions (Server-Side)
 *
 * All authentication-related API calls for server components.
 */

import { apiGet, apiPost } from "../api-client"

export type User = {
    id: number
    name: string
    email: string
    phone: string | null
    company_name: string | null
    biller_id: number | null
    warehouse_id: number | null
    kitchen_id: number | null
    service_staff: string | null
    is_active: boolean
    is_deleted: boolean
    email_verified_at: string | null
    created_at: string
    updated_at: string
    roles: string[]
    permissions: string[]
}

export type LoginResponse = {
    user: User
    token: string
}

export type RegisterResponse = {
    user: User
    message: string
}

export type RefreshTokenResponse = {
    token: string
}

/**
 * Login user
 */
export async function login(
    email: string,
    password: string
): Promise<LoginResponse> {
    const response = await apiPost<LoginResponse>("auth/login", {
        email,
        password,
    })
    return response.data
}

/**
 * Register new user
 */
export async function register(data: {
    name: string
    email: string
    password: string
    password_confirmation: string
    phone?: string
    company_name?: string
}): Promise<RegisterResponse> {
    const response = await apiPost<RegisterResponse>("auth/register", data)
    return response.data
}

/**
 * Get authenticated user
 */
export async function getMe(): Promise<User> {
    const response = await apiGet<User>("auth/me")
    return response.data
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
    await apiPost("auth/logout")
}

/**
 * Refresh authentication token
 */
export async function refreshToken(): Promise<string> {
    const response = await apiPost<RefreshTokenResponse>("auth/refresh")
    return response.data.token
}

/**
 * Resend verification email
 */
export async function resendVerification(email: string): Promise<void> {
    await apiPost("auth/resend-verification", { email })
}

/**
 * Send password reset link
 */
export async function sendResetLink(email: string): Promise<void> {
    await apiPost("auth/forgot-password", { email })
}

/**
 * Reset password
 */
export async function resetPassword(data: {
    email: string
    password: string
    password_confirmation: string
    token: string
}): Promise<void> {
    await apiPost("auth/reset-password", data)
}

/**
 * Verify email
 */
export async function verifyEmail(): Promise<void> {
    await apiGet("auth/verify-email")
}

