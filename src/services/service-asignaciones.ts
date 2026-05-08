import api from "@/lib/api"
import axios from "axios"
import type { AsignacionCreate, AsignacionUpdate } from "@/schemas/asignaciones"

type ApiResponse<T> = { success: boolean; data: T }
type PaginatedResponse<T> = {
    success: boolean
    data: T[]
    pagination: { page: number; limit: number; total: number }
}

// Estructura real que devuelve el backend por cada asignación
export interface AsignacionRow {
    asignacion: {
        id: string
        brigadistaId: string
        contratoId: string
        createdAt: string
    }
    contrato: {
        id: string
        nroContrato: string
        usuarioId: string
        predioId: string
        medidorId: string
        estado: string
        createdAt: string
        updatedAt: string
    }
    predio: {
        id: string
        distritoId: string
        direccion: string
        latitud: string | null
        longitud: string | null
        createdAt: string
    }
    distrito: {
        id: string
        nombre: string
        codigo: string
    }
    medidor: {
        id: string
        nroMedidor: string
        contratoId: string
        createdAt: string
    }
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en asignaciones"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getAsignaciones(params?: {
    brigadistaId?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<AsignacionRow>> {
    try {
        const res = await api.get<PaginatedResponse<AsignacionRow>>("/asignaciones", { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function getAsignacionesBrigadista(brigadistaId: string): Promise<AsignacionRow[]> {
    try {
        const res = await api.get<ApiResponse<AsignacionRow[]>>(`/asignaciones/brigadista/${brigadistaId}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function createAsignacion(payload: AsignacionCreate): Promise<AsignacionRow[]> {
    try {
        const res = await api.post<ApiResponse<AsignacionRow[]>>("/asignaciones", payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function replaceAsignaciones(brigadistaId: string, payload: AsignacionUpdate): Promise<AsignacionRow[]> {
    try {
        const res = await api.put<ApiResponse<AsignacionRow[]>>(`/asignaciones/${brigadistaId}`, payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function deleteAsignacion(id: string): Promise<void> {
    try {
        await api.delete<ApiResponse<void>>(`/asignaciones/${id}`)
    } catch (e) { handleError(e) }
}
