import api from "@/lib/api"
import axios from "axios"

type ApiResponse<T> = { success: boolean; data: T }

// Tipos reales que devuelve el backend
export interface ResumenDiario {
    lecturasHoy: number
    cortesHoy: number
    recaudacionHoy: number
    contratosActivos: number
}

export interface RecaudacionPorDistrito {
    distrito: string   // nombre del distrito directamente
    total: number
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en reportes"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getResumenDiario(): Promise<ResumenDiario> {
    try {
        const res = await api.get<ApiResponse<ResumenDiario>>("/reportes/resumen-diario")
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getRecaudacionPorDistrito(): Promise<RecaudacionPorDistrito[]> {
    try {
        const res = await api.get<ApiResponse<RecaudacionPorDistrito[]>>("/reportes/recaudacion-por-distrito")
        return res.data.data
    } catch (e) { handleError(e) }
}
