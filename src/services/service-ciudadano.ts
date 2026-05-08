import api from "@/lib/api"
import axios from "axios"

export interface Contrato {
    id: string
    nroContrato: string
    nroMedidor: string
    direccion: string
    estado: 'activo' | 'suspendido' | 'cortado'
    distritoId: string
    distrito?: { id: string; nombre: string; codigo: string }
    createdAt: string
}

export interface Factura {
    id: string
    contratoId: string
    periodo: string
    consumoM3: number
    total: string
    cargoFijo: string
    subtotal: string
    estado: 'pendiente' | 'pagada' | 'vencida'
    fechaVencimiento: string
    createdAt: string
    contrato?: { nroContrato: string; direccion: string }
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en la operación"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getMisContratos(): Promise<Contrato[]> {
    try {
        const res = await api.get<{ success: boolean; data: Contrato[] }>('/contratos/mis-contratos')
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getMisFacturas(): Promise<Factura[]> {
    try {
        const res = await api.get<{ success: boolean; data: Factura[] }>('/facturas/mis-facturas')
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getMisPagos(): Promise<any[]> {
    try {
        const res = await api.get<{ success: boolean; data: any[] }>('/pagos/mis-pagos')
        return res.data.data
    } catch (e) { handleError(e) }
}
