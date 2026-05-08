import api from "@/lib/api"
import axios from "axios"
import type { Medidor, MedidorCreate, MedidorUpdate } from "@/schemas/medidores"

type ApiResponse<T> = { success: boolean; data: T }
type PaginatedResponse<T> = {
    success: boolean
    data: T[]
    pagination: { page: number; limit: number; total: number }
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en medidores"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getMedidores(params?: {
    page?: number
    limit?: number
}): Promise<PaginatedResponse<Medidor>> {
    try {
        const res = await api.get<PaginatedResponse<Medidor>>("/medidores", { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function getMedidor(id: string): Promise<Medidor> {
    try {
        const res = await api.get<ApiResponse<Medidor>>(`/medidores/${id}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function createMedidor(payload: MedidorCreate): Promise<Medidor> {
    try {
        const res = await api.post<ApiResponse<Medidor>>("/medidores", payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function updateMedidor(id: string, payload: MedidorUpdate): Promise<Medidor> {
    try {
        const res = await api.put<ApiResponse<Medidor>>(`/medidores/${id}`, payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function deleteMedidor(id: string): Promise<void> {
    try {
        await api.delete<ApiResponse<void>>(`/medidores/${id}`)
    } catch (e) { handleError(e) }
}

export type { Medidor, MedidorCreate, MedidorUpdate }
