import api from "@/lib/api"
import axios from "axios"
import type { Tarifa, TarifaCreate, TarifaUpdate } from "@/schemas/tarifas"

type ApiResponse<T> = { success: boolean; data: T }

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en tarifas"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getTarifas(): Promise<Tarifa[]> {
    try {
        const res = await api.get<ApiResponse<Tarifa[]>>("/tarifas")
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getTarifa(id: string): Promise<Tarifa> {
    try {
        const res = await api.get<ApiResponse<Tarifa>>(`/tarifas/${id}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function createTarifa(payload: TarifaCreate): Promise<Tarifa> {
    try {
        const res = await api.post<ApiResponse<Tarifa>>("/tarifas", payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function updateTarifa(id: string, payload: TarifaUpdate): Promise<Tarifa> {
    try {
        const res = await api.put<ApiResponse<Tarifa>>(`/tarifas/${id}`, payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

// Re-export del tipo
export type { Tarifa, TarifaCreate, TarifaUpdate }
