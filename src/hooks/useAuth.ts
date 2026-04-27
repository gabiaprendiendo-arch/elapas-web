import { AuthContext } from "@/context/authContext"
import { useContext } from "react"

export const useAuth = () => {
    const context = useContext(AuthContext)

    if (!context) {
        return {
            user: null,
            isAutheticate: false,
            login: async () => console.warn("login no disponible"),
            logout: async () => console.warn("logout no disponible")
        }
    }
    return context
}