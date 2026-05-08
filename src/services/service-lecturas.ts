import api from "@/lib/api"
import axios from "axios"

export interface Lectura {
    id: string
    contratoId: string
    brigadistaId: string
    valorLectura: number
    fotoUrl: string | null
    latitud: string | null
    longitud: string | null
    fechaLectura: string
    createdAt: string
    brigadista?: { id: string; name: string; email: string }
    contrato?: { id: string; nroContrato: string; nroMedidor: string }
}

export interface LecturasPorBrigadista {
    brigadistaId: string
    brigadistaNombre: string
    total: number
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
}): Promise<{ data: Lectura[]; pagination: { page: number; limit: number; total: number } }> {
    try {
        const res = await api.get('/lecturas', { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function getLecturasPorBrigadista(params?: {
    fechaInicio?: string
    fechaFin?: string
}): Promise<LecturasPorBrigadista[]> {
    try {
        const res = await api.get('/reportes/lecturas-por-brigadista', { params })
        return res.data.data
    } catch (e) { handleError(e) }
}
