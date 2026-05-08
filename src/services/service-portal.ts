import api from "@/lib/api"
import axios from "axios"

// ── Tipos ─────────────────────────────────────────────────

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
    estado: 'pendiente' | 'pagada' | 'vencida'
    fechaVencimiento: string
    createdAt: string
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

export interface QrData {
    facturaId: string
    monto: string
    entidad: string
    qrString: string
}

// Resumen enriquecido para el portal ciudadano
export interface ResumenConsumo {
    contratos: Array<Contrato & {
        ultimaLectura: {
            id: string
            valorLectura: number
            fechaLectura: string
        } | null
    }>
    facturasPendientes: Array<Factura & {
        contrato: { id: string; nroContrato: string; direccion: string; nroMedidor: string; estado: string }
        tarifa: { nombre: string; precioM3: string; cargoFijo: string }
    }>
    deudaTotal: number
    cantidadPendientes: number
    ultimosPagos: Pago[]
}

// ── Error handler ─────────────────────────────────────────

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en la operación"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

// ── Contratos ─────────────────────────────────────────────

export async function getMisContratos(): Promise<Contrato[]> {
    try {
        const res = await api.get<{ success: boolean; data: Contrato[] }>('/contratos/mis-contratos')
        return res.data.data
    } catch (e) { handleError(e) }
}

// ── Facturas ──────────────────────────────────────────────

export async function getMisFacturas(): Promise<Factura[]> {
    try {
        const res = await api.get<{ success: boolean; data: Factura[] }>('/facturas/mis-facturas')
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getMiResumen(): Promise<ResumenConsumo> {
    try {
        const res = await api.get<{ success: boolean; data: ResumenConsumo }>('/facturas/mi-resumen')
        return res.data.data
    } catch (e) { handleError(e) }
}

// ── Pagos ─────────────────────────────────────────────────

export async function getMisPagos(): Promise<Pago[]> {
    try {
        const res = await api.get<{ success: boolean; data: Pago[] }>('/pagos/mis-pagos')
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function generarQr(facturaId: string): Promise<QrData> {
    try {
        const res = await api.post<{ success: boolean; data: QrData }>(`/pagos/qr/${facturaId}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function confirmarPago(payload: {
    facturaId: string
    monto: string
    metodoPago?: 'qr_simple' | 'efectivo' | 'transferencia'
    referencia?: string
}): Promise<Pago> {
    try {
        const res = await api.post<{ success: boolean; data: Pago }>('/pagos/confirmar', payload)
        return res.data.data
    } catch (e) { handleError(e) }
}
