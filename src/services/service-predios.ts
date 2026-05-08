import api from "@/lib/api"
import axios from "axios"
import type { Predio, PredioCreate, PredioUpdate } from "@/schemas/predios"

type ApiResponse<T> = { success: boolean; data: T }
type PaginatedResponse<T> = {
    success: boolean
    data: T[]
    pagination: { page: number; limit: number; total: number }
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en predios"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getPredios(params?: {
    distritoId?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<Predio>> {
    try {
        const res = await api.get<PaginatedResponse<Predio>>("/predios", { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function getPredio(id: string): Promise<Predio> {
    try {
        const res = await api.get<ApiResponse<Predio>>(`/predios/${id}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function createPredio(payload: PredioCreate): Promise<Predio> {
    try {
        const res = await api.post<ApiResponse<Predio>>("/predios", payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function updatePredio(id: string, payload: PredioUpdate): Promise<Predio> {
    try {
        const res = await api.put<ApiResponse<Predio>>(`/predios/${id}`, payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function deletePredio(id: string): Promise<void> {
    try {
        await api.delete<ApiResponse<void>>(`/predios/${id}`)
    } catch (e) { handleError(e) }
}

export type { Predio, PredioCreate, PredioUpdate }
