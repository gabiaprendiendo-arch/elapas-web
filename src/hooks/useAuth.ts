import { AuthContext } from "@/context/authContext"
import { useContext } from "react"

export const useAuth = () => {
    const context = useContext(AuthContext)
    return context
}
