import api from "@/lib/api"
import axios from "axios"

export interface Tarifa {
    id: string
    nombre: string
    tramoMin: number
    tramoMax: number
    precioM3: string
    cargoFijo: string
    estado: boolean
}

export interface TarifaPayload {
    nombre: string
    tramoMin: number
    tramoMax: number
    precioM3: string
    cargoFijo: string
    estado?: boolean
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en tarifas"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getTarifas(): Promise<Tarifa[]> {
    try {
        const res = await api.get<{ success: boolean; data: Tarifa[] }>('/tarifas')
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function createTarifa(payload: TarifaPayload): Promise<Tarifa> {
    try {
        const res = await api.post<{ success: boolean; data: Tarifa }>('/tarifas', payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function updateTarifa(id: string, payload: TarifaPayload): Promise<Tarifa> {
    try {
        const res = await api.put<{ success: boolean; data: Tarifa }>(`/tarifas/${id}`, payload)
        return res.data.data
    } catch (e) { handleError(e) }
}
