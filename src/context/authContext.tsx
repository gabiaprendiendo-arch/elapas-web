
import type { UserAUth } from "@/schemas/auth"
import { service_logion } from "@/services/service-auth"
import { createContext, useState, type ReactNode } from "react"

export type Auth = {
    email: string
    password: string
}

type AuthContextType = {
    user: UserAUth | null
    isAuthenticate: boolean
    login: (data_auth: Auth) => Promise<void>
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticate: false,
    login: async () => { },
    logout: async () => { }
})


export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserAUth | null>(null)

    const login = async (data_auth: Auth) => {
        const data = await service_logion(data_auth)
        setUser(data.user)
    }

    const logout = async () => {
        // await service_logout()
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticate: !!user,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}