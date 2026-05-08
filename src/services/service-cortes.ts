import api from "@/lib/api"
import axios from "axios"
import type { Corte } from "@/schemas/corte"

type ApiResponse<T> = { success: boolean; data: T }
type PaginatedResponse<T> = {
    success: boolean
    data: T[]
    pagination: { page: number; limit: number; total: number }
}

// El backend devuelve cada elemento como { corte, contrato } (join)
export interface CorteConContrato {
    corte: Corte
    contrato: {
        id: string
        nroContrato: string
        nroMedidor: string
        direccion: string
        distritoId: string
        estado: string
    }
}

// Tipo real que devuelve el backend: { distrito: string, cantidad: number }
export interface CortesPorDistrito {
    distrito: string
    cantidad: number
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en cortes"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getCortes(params?: {
    distritoId?: string
    fechaInicio?: string
    fechaFin?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<CorteConContrato>> {
    try {
        const res = await api.get<PaginatedResponse<CorteConContrato>>("/cortes", { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function getCorte(id: string): Promise<CorteConContrato> {
    try {
        const res = await api.get<ApiResponse<CorteConContrato>>(`/cortes/${id}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getCortesPorDistrito(): Promise<CortesPorDistrito[]> {
    try {
        const res = await api.get<ApiResponse<CortesPorDistrito[]>>("/reportes/cortes-por-distrito")
        return res.data.data
    } catch (e) { handleError(e) }
}

export type { Corte }
