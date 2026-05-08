import api from "@/lib/api"
import axios from "axios"

export interface Contrato {
    id: string
    nroContrato: string
    usuarioId: string
    distritoId: string
    direccion: string
    nroMedidor: string
    latitud: string | null
    longitud: string | null
    estado: 'activo' | 'suspendido' | 'cortado'
    createdAt: string
    updatedAt: string
}

export interface CreateContratoPayload {
    nroContrato: string
    usuarioId: string
    distritoId: string
    direccion: string
    nroMedidor: string
    latitud?: string
    longitud?: string
    estado?: 'activo' | 'suspendido' | 'cortado'
}

export interface Moroso {
    usuarioId: string
    nombre: string
    email: string
    cantidadFacturas: number
    deudaTotal: number
    facturasMasAntigua: string
}

export interface PaginatedResponse<T> {
    success: boolean
    data: T[]
    pagination: { page: number; limit: number; total: number }
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en contratos"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getContratos(params?: {
    distritoId?: string
    estado?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<Contrato>> {
    try {
        const res = await api.get<PaginatedResponse<Contrato>>('/contratos', { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function createContrato(payload: CreateContratoPayload): Promise<Contrato> {
    try {
        const res = await api.post<{ success: boolean; data: Contrato }>('/contratos', payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function updateContrato(id: string, payload: Partial<CreateContratoPayload>): Promise<Contrato> {
    try {
        const res = await api.put<{ success: boolean; data: Contrato }>(`/contratos/${id}`, payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getMorosos(params?: {
    periodo?: string
    distritoId?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<Moroso>> {
    try {
        const res = await api.get<PaginatedResponse<Moroso>>('/facturas/morosos', { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function generarFacturas(payload: {
    periodo: string
    fechaVencimiento: string
}): Promise<number> {
    try {
        const res = await api.post<{ success: boolean; data: number }>('/facturas/generar', payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getFacturasAdmin(params?: {
    estado?: string
    periodo?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<{
    id: string; contratoId: string; periodo: string
    consumoM3: number; total: string; estado: string
    fechaVencimiento: string; createdAt: string
}>> {
    try {
        const res = await api.get('/facturas', { params })
        return res.data
    } catch (e) { handleError(e) }
}
