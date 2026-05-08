import api from "@/lib/api"
import axios from "axios"

export interface Tarifa {
    id: string
    nombre: string
    tramoMin: number
    tramoMax: number
    precioM3: string
    cargoFijo: string
}

export interface Contrato {
    id: string
    nroContrato: string
    nroMedidor: string
    direccion: string
    estado: 'activo' | 'suspendido' | 'cortado'
    distritoId: string
    distrito?: { id: string; nombre: string; codigo: string }
}

export interface Factura {
    id: string
    contratoId: string
    lecturaId: string
    periodo: string          // "2025-04"
    consumoM3: number
    tarifaId: string
    cargoFijo: string
    subtotal: string
    total: string
    estado: 'pendiente' | 'pagada' | 'vencida'
    fechaVencimiento: string
    createdAt: string
    tarifa?: Tarifa
    contrato?: Contrato
}

export interface Pago {
    id: string
    facturaId: string
    monto: string
    metodoPago: 'qr_simple' | 'efectivo' | 'transferencia'
    referencia: string | null
    qrData: string | null
    fechaPago: string
    createdAt: string
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en la operación"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

/** Facturas del ciudadano autenticado */
export async function getMisFacturas(): Promise<Factura[]> {
    try {
        const res = await api.get<{ success: boolean; data: Factura[] }>('/facturas/mis-facturas')
        return res.data.data
    } catch (e) { handleError(e) }
}

/** Detalle de una factura */
export async function getFactura(id: string): Promise<Factura> {
    try {
        const res = await api.get<{ success: boolean; data: Factura }>(`/facturas/${id}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

/** Contratos del ciudadano autenticado */
export async function getMisContratos(): Promise<Contrato[]> {
    try {
        const res = await api.get<{ success: boolean; data: Contrato[] }>('/contratos/mis-contratos')
        return res.data.data
    } catch (e) { handleError(e) }
}

/** Pagos del ciudadano autenticado */
export async function getMisPagos(): Promise<Pago[]> {
    try {
        const res = await api.get<{ success: boolean; data: Pago[] }>('/pagos/mis-pagos')
        return res.data.data
    } catch (e) { handleError(e) }
}

/** Generar QR para una factura pendiente */
export async function generarQR(facturaId: string): Promise<{ qrData: string }> {
    try {
        const res = await api.post<{ success: boolean; data: { qrData: string } }>(`/pagos/qr/${facturaId}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

/** Confirmar pago (simulado) */
export async function confirmarPago(payload: {
    facturaId: string
    monto: string
    metodoPago?: string
    referencia?: string
}): Promise<Pago> {
    try {
        const res = await api.post<{ success: boolean; data: Pago }>('/pagos/confirmar', payload)
        return res.data.data
    } catch (e) { handleError(e) }
}
