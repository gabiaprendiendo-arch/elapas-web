import api from "@/lib/api"
import axios from "axios"

export interface Distrito {
    id: string
    nombre: string
    codigo: string
}

function handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
        const msg = error.response?.data?.message || "Error en distritos"
        throw new Error(msg, { cause: error })
    }
    throw new Error("Error inesperado", { cause: error })
}

export async function getDistritos(): Promise<Distrito[]> {
    try {
        const res = await api.get<{ success: boolean; data: Distrito[] }>('/distritos')
        return res.data.data
    } catch (e) { handleError(e) }
}
