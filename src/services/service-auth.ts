import api from "@/lib/api"
import type { DataAuth } from "@/schemas/auth"
import axios from "axios"

// Wrapper estándar de la API
type ApiResponse<T> = { success: boolean; data: T }

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error al iniciar sesión"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

// better-auth devuelve { token, user } directamente (sin wrapper success/data)
export async function service_logion(payload: { email: string; password: string }): Promise<DataAuth> {
    try {
        const res = await api.post<DataAuth>("/auth/sign-in/email", payload)
        return res.data
    } catch (e) { handleError(e) }
}

export async function service_signup(payload: {
    email: string
    password: string
    name: string
}): Promise<DataAuth> {
    try {
        const res = await api.post<DataAuth>("/auth/sign-up/email", payload)
        return res.data
    } catch (e) { handleError(e) }
}

export async function service_getSession(): Promise<DataAuth["user"] | null> {
    try {
        const res = await api.get<ApiResponse<DataAuth["user"]>>("/auth/get-session")
        return res.data.data ?? null
    } catch {
        return null
    }
}
