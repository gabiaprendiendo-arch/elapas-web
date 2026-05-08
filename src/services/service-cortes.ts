import api from "@/lib/api"
import axios from "axios"

export interface Corte {
    id: string
    contratoId: string
    brigadistaId: string
    motivo: string
    fotoUrl: string | null
    latitud: string | null
    longitud: string | null
    fechaCorte: string
    estado: 'efectuado' | 'reconectado'
    createdAt: string
    brigadista?: { id: string; name: string }
    contrato?: {
        id: string
        nroContrato: string
        nroMedidor: string
        direccion: string
        distrito?: { id: string; nombre: string; codigo: string }
    }
}

export interface CortesPorDistrito {
    distritoId: string
    distritoNombre: string
    total: number
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
}): Promise<{ data: Corte[]; pagination: { page: number; limit: number; total: number } }> {
    try {
        const res = await api.get('/cortes', { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function getCortesPorDistrito(): Promise<CortesPorDistrito[]> {
    try {
        const res = await api.get('/reportes/cortes-por-distrito')
        return res.data.data
    } catch (e) { handleError(e) }
}
