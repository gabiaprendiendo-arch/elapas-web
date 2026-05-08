import api from "@/lib/api"
import axios from "axios"
import type { Tarifa } from "@/schemas/tarifas"

type ApiResponse<T> = { success: boolean; data: T }

// ── Tipos de Factura y Pago ───────────────────────────────
// No tienen schema Zod en src/schemas, se definen aquí como fuente de verdad

export interface Factura {
    id: string
    contratoId: string
    lecturaId: string
    periodo: string
    consumoM3: number
    tarifaId: string
    cargoFijo: string | null
    subtotal: string | null
    total: string
    estado: "pendiente" | "pagada" | "vencida"
    fechaVencimiento: string
    createdAt: string
}

// Factura enriquecida con relaciones (usada en portal ciudadano)
export interface FacturaConRelaciones extends Factura {
    contrato: {
        id: string
        nroContrato: string
        estado: string
        direccion: string
        nroMedidor: string
    }
    tarifa: Pick<Tarifa, "nombre" | "cargoFijo"> & { precioM3: number | string }
}

export interface Pago {
    id: string
    facturaId: string
    monto: string
    metodoPago: "qr_simple" | "efectivo" | "transferencia"
    referencia: string | null
    qrData: string | null
    fechaPago: string
    createdAt: string
}

export interface QrData {
    facturaId: string
    monto: string
    entidad: string
    qrString: string
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en facturas"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

// ── Ciudadano ─────────────────────────────────────────────

export async function getMisFacturas(): Promise<Factura[]> {
    try {
        const res = await api.get<ApiResponse<Factura[]>>("/facturas/mis-facturas")
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getFactura(id: string): Promise<Factura> {
    try {
        const res = await api.get<ApiResponse<Factura>>(`/facturas/${id}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

// ── Pagos ─────────────────────────────────────────────────

export async function getMisPagos(): Promise<Pago[]> {
    try {
        const res = await api.get<ApiResponse<Pago[]>>("/pagos/mis-pagos")
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function generarQr(facturaId: string): Promise<QrData> {
    try {
        const res = await api.post<ApiResponse<QrData>>(`/pagos/qr/${facturaId}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function confirmarPago(payload: {
    facturaId: string
    monto: string
    metodoPago?: Pago["metodoPago"]
    referencia?: string
}): Promise<Pago> {
    try {
        const res = await api.post<ApiResponse<Pago>>("/pagos/confirmar", payload)
        return res.data.data
    } catch (e) { handleError(e) }
}
