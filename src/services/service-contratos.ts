import api from "@/lib/api"
import axios from "axios"
import type { Contrato, ContratoCreate, ContratoUpdate } from "@/schemas/contrato"

type ApiResponse<T> = { success: boolean; data: T }
type PaginatedResponse<T> = {
    success: boolean
    data: T[]
    pagination: { page: number; limit: number; total: number }
}

export interface Moroso {
    usuarioId: string
    nombre: string
    email: string
    cantidadFacturas: number
    deudaTotal: number
    facturasMasAntigua: string
}

export interface FacturaAdmin {
    id: string
    contratoId: string
    periodo: string
    consumoM3: number
    total: string
    estado: "pendiente" | "pagada" | "vencida"
    fechaVencimiento: string
    createdAt: string
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
        const res = await api.get<PaginatedResponse<Contrato>>("/contratos", { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function getContrato(id: string): Promise<Contrato> {
    try {
        const res = await api.get<ApiResponse<Contrato>>(`/contratos/${id}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function createContrato(payload: ContratoCreate): Promise<Contrato> {
    try {
        const res = await api.post<ApiResponse<Contrato>>("/contratos", payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function updateContrato(id: string, payload: ContratoUpdate): Promise<Contrato> {
    try {
        const res = await api.put<ApiResponse<Contrato>>(`/contratos/${id}`, payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getFacturasAdmin(params?: {
    estado?: string
    periodo?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<FacturaAdmin>> {
    try {
        const res = await api.get<PaginatedResponse<FacturaAdmin>>("/facturas", { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function getMorosos(params?: {
    periodo?: string
    distritoId?: string
    page?: number
    limit?: number
}): Promise<PaginatedResponse<Moroso>> {
    try {
        const res = await api.get<PaginatedResponse<Moroso>>("/facturas/morosos", { params })
        return res.data
    } catch (e) { handleError(e) }
}

export async function generarFacturas(payload: {
    periodo: string
    fechaVencimiento: string
}): Promise<number> {
    try {
        const res = await api.post<ApiResponse<number>>("/facturas/generar", payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export type { Contrato, ContratoCreate, ContratoUpdate }
