import api from "@/lib/api"
import axios from "axios"

type ApiResponse<T> = { success: boolean; data: T }

// ── Tipos reales del backend ──────────────────────────────

// /contratos/mis-contratos devuelve { contrato, predio, medidor }[]
export interface ContratoPortal {
    contrato: {
        id: string
        nroContrato: string
        usuarioId: string
        predioId: string
        medidorId: string
        estado: 'activo' | 'suspendido' | 'cortado'
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
    medidor: {
        id: string
        nroMedidor: string
        contratoId: string
        createdAt: string
    }
}

// /facturas/mis-facturas devuelve facturas planas
export interface FacturaPortal {
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

// /pagos/mis-pagos devuelve pagos planos
export interface PagoPortal {
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
    qrData?: string   // JSON string con { facturaId, monto, entidad, fecha }
    qrString?: string // alias usado en algunos endpoints
    facturaId?: string
    monto?: string
    entidad?: string
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en el portal"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getMisContratos(): Promise<ContratoPortal[]> {
    try {
        const res = await api.get<ApiResponse<ContratoPortal[]>>("/contratos/mis-contratos")
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getMisFacturas(): Promise<FacturaPortal[]> {
    try {
        const res = await api.get<ApiResponse<FacturaPortal[]>>("/facturas/mis-facturas")
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getMisPagos(): Promise<PagoPortal[]> {
    try {
        const res = await api.get<ApiResponse<PagoPortal[]>>("/pagos/mis-pagos")
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
    monto: string | number
    metodoPago?: PagoPortal["metodoPago"]
    referencia?: string
}): Promise<PagoPortal> {
    try {
        const res = await api.post<ApiResponse<PagoPortal>>("/pagos/confirmar", {
            ...payload,
            monto: Number(payload.monto),   // el backend espera número
        })
        return res.data.data
    } catch (e) { handleError(e) }
}
