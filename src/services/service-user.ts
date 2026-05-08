import api from "@/lib/api"
import axios from "axios"
import type { User, UserCrate, UserUpdate } from "@/schemas/user"

type ApiResponse<T> = { success: boolean; data: T }
type PaginatedResponse<T> = {
    success: boolean
    data: T[]
    pagination: { page: number; limit: number; total: number }
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en usuarios"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getUsuarios(params?: {
    role?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<User>> {
    try {
        const res = await api.get<PaginatedResponse<User>>("/usuarios", { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function getUsuario(id: string): Promise<User> {
    try {
        const res = await api.get<ApiResponse<User>>(`/usuarios/${id}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

// UserCrate usa 'nombre' (alineado con el DTO del backend POST /usuarios)
export async function createUsuario(payload: UserCrate): Promise<User> {
    try {
        const res = await api.post<ApiResponse<User>>("/usuarios", payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

// UserUpdate usa 'nombre' (alineado con el DTO del backend PUT /usuarios/:id)
export async function updateUsuario(id: string, payload: UserUpdate): Promise<User> {
    try {
        const res = await api.put<ApiResponse<User>>(`/usuarios/${id}`, payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function deleteUsuario(id: string): Promise<void> {
    try {
        await api.delete<ApiResponse<void>>(`/usuarios/${id}`)
    } catch (e) { handleError(e) }
}
