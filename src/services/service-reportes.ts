import api from "@/lib/api"
import axios from "axios"

export interface ResumenDiario {
    lecturas: number
    cortes: number
    recaudacion: string
    contratosActivos: number
}

export interface RecaudacionPorDistrito {
    distritoId: string
    distritoNombre: string
    total: string
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
        const res = await api.get('/reportes/resumen-diario')
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getRecaudacionPorDistrito(): Promise<RecaudacionPorDistrito[]> {
    try {
        const res = await api.get('/reportes/recaudacion-por-distrito')
        return res.data.data
    } catch (e) { handleError(e) }
}
