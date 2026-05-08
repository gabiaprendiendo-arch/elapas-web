import api from "@/lib/api";
import type { DataAuth } from "@/schemas/auth";
import axios from "axios";
// import axios from "axios";

export async function service_logion({ email, password }: { email: string, password: string }): Promise<DataAuth> {
    try {
        const response = await api.post<DataAuth>('/auth/sign-in/email', { email: email, password: password });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message || "Error al iniciar sesión";
            throw new Error(message, { cause: error });
        }

        throw new Error("Ocurrió un error inesperado", { cause: error });
    }
}