import api from "@/lib/api"
import axios from "axios"
import type { Lectura } from "@/schemas/lecturas"

type ApiResponse<T> = { success: boolean; data: T }
type PaginatedResponse<T> = {
    success: boolean
    data: T[]
    pagination: { page: number; limit: number; total: number }
}

// Tipo real que devuelve el backend: { brigadista: string, cantidad: number }
export interface LecturasPorBrigadista {
    brigadista: string
    cantidad: number
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en lecturas"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getLecturas(params?: {
    fechaInicio?: string
    fechaFin?: string
    brigadistaId?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<Lectura>> {
    try {
        const res = await api.get<PaginatedResponse<Lectura>>("/lecturas", { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function getLectura(id: string): Promise<Lectura> {
    try {
        const res = await api.get<ApiResponse<Lectura>>(`/lecturas/${id}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getLecturasPorBrigadista(params?: {
    fechaInicio?: string
    fechaFin?: string
}): Promise<LecturasPorBrigadista[]> {
    try {
        const res = await api.get<ApiResponse<LecturasPorBrigadista[]>>(
            "/reportes/lecturas-por-brigadista",
            { params }
        )
        return res.data.data
    } catch (e) { handleError(e) }
}

// Re-export del tipo
export type { Lectura }
