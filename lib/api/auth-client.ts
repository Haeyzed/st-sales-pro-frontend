/**
 * Client-Side Auth API Functions
 *
 * For use in client components.
 */

import { apiPostClient, apiGetClient } from "../api-client-client"

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
 * Login user (client-side)
 */
export async function loginClient(
    email: string,
    password: string
): Promise<LoginResponse> {
    const response = await apiPostClient<LoginResponse>("auth/login", {
        email,
        password,
    })
    return response.data
}

/**
 * Register new user (client-side)
 */
export async function registerClient(data: {
    name: string
    email: string
    password: string
    password_confirmation: string
    phone?: string
    company_name?: string
}): Promise<RegisterResponse> {
    const response = await apiPostClient<RegisterResponse>("auth/register", data)
    return response.data
}

/**
 * Get authenticated user (client-side)
 */
export async function getMeClient(): Promise<User> {
    const response = await apiGetClient<User>("auth/me")
    return response.data
}

/**
 * Logout user (client-side)
 */
export async function logoutClient(): Promise<void> {
    await apiPostClient("auth/logout")
}

/**
 * Refresh authentication token (client-side)
 */
export async function refreshTokenClient(): Promise<string> {
    const response = await apiPostClient<RefreshTokenResponse>("auth/refresh")
    return response.data.token
}

/**
 * Resend verification email (client-side)
 */
export async function resendVerificationClient(email: string): Promise<void> {
    await apiPostClient("auth/resend-verification", { email })
}

/**
 * Send password reset link (client-side)
 */
export async function sendResetLinkClient(email: string): Promise<void> {
    await apiPostClient("auth/forgot-password", { email })
}

/**
 * Reset password (client-side)
 */
export async function resetPasswordClient(data: {
    email: string
    password: string
    password_confirmation: string
    token: string
}): Promise<void> {
    await apiPostClient("auth/reset-password", data)
}

/**
 * Verify email (client-side)
 */
export async function verifyEmailClient(): Promise<void> {
    await apiGetClient("auth/verify-email")
}

