import api from "@/lib/api"
import axios from "axios"
import type { Distrito, DistritoCreate, DistritoUpdate } from "@/schemas/distritos"

type ApiResponse<T> = { success: boolean; data: T }

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en distritos"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getDistritos(): Promise<Distrito[]> {
    try {
        const res = await api.get<ApiResponse<Distrito[]>>("/distritos")
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function getDistrito(id: string): Promise<Distrito> {
    try {
        const res = await api.get<ApiResponse<Distrito>>(`/distritos/${id}`)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function createDistrito(payload: DistritoCreate): Promise<Distrito> {
    try {
        const res = await api.post<ApiResponse<Distrito>>("/distritos", payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function updateDistrito(id: string, payload: DistritoUpdate): Promise<Distrito> {
    try {
        const res = await api.put<ApiResponse<Distrito>>(`/distritos/${id}`, payload)
        return res.data.data
    } catch (e) { handleError(e) }
}

export async function deleteDistrito(id: string): Promise<void> {
    try {
        await api.delete<ApiResponse<void>>(`/distritos/${id}`)
    } catch (e) { handleError(e) }
}

// Re-export del tipo para que los componentes lo importen desde aquí
export type { Distrito }
