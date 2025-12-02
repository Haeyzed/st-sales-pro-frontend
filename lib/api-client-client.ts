/**
 * Client-Side API Client Utility
 *
 * For use in client components. Gets token from NextAuth session.
 */

import { getSession } from "next-auth/react"

export type ApiResponse<T> = {
    success: boolean
    message: string
    data: T
    meta?: {
        current_page: number
        per_page: number
        total: number
        last_page: number
        from: number
        to: number
    }
    errors?: Record<string, string[]>
}

type ApiError = {
    success: false
    message: string
    errors?: Record<string, string[]>
}

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

async function getAuthToken(): Promise<string | null> {
    try {
        const session = await getSession()
        return (session?.user as any)?.token || null
    } catch (error) {
        return null
    }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type")

    if (!contentType?.includes("application/json")) {
        throw new Error("Response is not JSON")
    }

    const data = await response.json()

    if (!response.ok) {
        // Handle 401 Unauthorized - session expired
        if (response.status === 401) {
            // Redirect to login with current page as callback
            if (typeof window !== 'undefined') {
                const currentPath = window.location.pathname + window.location.search
                window.location.href = `/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`
            }
        }

        const error: ApiError = {
            success: false,
            message: data.message || "An error occurred",
            errors: data.errors,
        }
        throw error
    }

    return data as ApiResponse<T>
}

export async function apiGetClient<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | null | undefined>
): Promise<ApiResponse<T>> {
    const token = await getAuthToken()

    const url = new URL(`${API_BASE_URL}/${endpoint.replace(/^\//, "")}`)

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
                url.searchParams.append(key, String(value))
            }
        })
    }

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
    })

    return handleResponse<T>(response)
}

export async function apiPostClient<T>(
    endpoint: string,
    body?: Record<string, unknown> | FormData
): Promise<ApiResponse<T>> {
    const token = await getAuthToken()

    const isFormData = body instanceof FormData

    const response = await fetch(
        `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                ...(!isFormData && { "Content-Type": "application/json" }),
            },
            body: isFormData ? body : JSON.stringify(body),
            credentials: "include",
        }
    )

    return handleResponse<T>(response)
}

export async function apiPutClient<T>(
    endpoint: string,
    body?: Record<string, unknown> | FormData
): Promise<ApiResponse<T>> {
    const token = await getAuthToken()

    const isFormData = body instanceof FormData

    const response = await fetch(
        `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`,
        {
            method: "PUT",
            headers: {
                Accept: "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                ...(!isFormData && { "Content-Type": "application/json" }),
            },
            body: isFormData ? body : JSON.stringify(body),
            credentials: "include",
        }
    )

    return handleResponse<T>(response)
}

export async function apiPatchClient<T>(
    endpoint: string,
    body?: Record<string, unknown> | FormData
): Promise<ApiResponse<T>> {
    const token = await getAuthToken()

    const isFormData = body instanceof FormData

    const response = await fetch(
        `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`,
        {
            method: "PATCH",
            headers: {
                Accept: "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
                ...(!isFormData && { "Content-Type": "application/json" }),
            },
            body: isFormData ? body : JSON.stringify(body),
            credentials: "include",
        }
    )

    return handleResponse<T>(response)
}

export async function apiDeleteClient<T>(
    endpoint: string
): Promise<ApiResponse<T>> {
    const token = await getAuthToken()

    const response = await fetch(
        `${API_BASE_URL}/${endpoint.replace(/^\//, "")}`,
        {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            credentials: "include",
        }
    )

    return handleResponse<T>(response)
}

