import api from "@/lib/api"
import axios from "axios"

export interface Usuario {
    id: string
    name: string
    email: string
    role: 'admin' | 'brigadista' | 'ciudadano'
    estado: boolean
    emailVerified: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateUsuarioPayload {
    nombre: string
    email: string
    password: string
    role: 'admin' | 'brigadista' | 'ciudadano'
}

export interface UpdateUsuarioPayload {
    nombre?: string
    email?: string
    role?: 'admin' | 'brigadista' | 'ciudadano'
    estado?: boolean
}

export interface PaginatedResponse<T> {
    success: boolean
    data: T[]
    pagination: { page: number; limit: number; total: number }
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en la operación"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getUsuarios(params?: {
    role?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<Usuario>> {
    try {
        const res = await api.get<PaginatedResponse<Usuario>>('/usuarios', { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function getUsuario(id: string): Promise<Usuario> {
    try {
        const res = await api.get<{ success: boolean; data: Usuario }>(`/usuarios/${id}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function createUsuario(payload: CreateUsuarioPayload): Promise<Usuario> {
    try {
        const res = await api.post<{ success: boolean; data: Usuario }>('/usuarios', payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function updateUsuario(id: string, payload: UpdateUsuarioPayload): Promise<Usuario> {
    try {
        const res = await api.put<{ success: boolean; data: Usuario }>(`/usuarios/${id}`, payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function deleteUsuario(id: string): Promise<void> {
    try {
        await api.delete(`/usuarios/${id}`)
    } catch (e) { handleError(e) }
}
