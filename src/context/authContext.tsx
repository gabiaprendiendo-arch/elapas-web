import type { UserAUth } from "@/schemas/auth"
import { service_logion } from "@/services/service-auth"
import { createContext, useState, useEffect, type ReactNode } from "react"

export type Auth = {
    email: string
    password: string
}

type AuthContextType = {
    user: UserAUth | null
    isAuthenticate: boolean
    login: (data_auth: Auth) => Promise<UserAUth>
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticate: false,
    login: async () => { throw new Error('AuthProvider no montado') },
    logout: async () => { }
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserAUth | null>(() => {
        const stored = localStorage.getItem('auth_user')
        return stored ? (JSON.parse(stored) as UserAUth) : null
    })

    const clearSession = () => {
        setUser(null)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
    }

    // Escuchar el evento de sesión expirada que dispara el interceptor de axios
    useEffect(() => {
        const handleExpired = () => clearSession()
        window.addEventListener('auth:expired', handleExpired)
        return () => window.removeEventListener('auth:expired', handleExpired)
    }, [])

    const login = async (data_auth: Auth): Promise<UserAUth> => {
        const data = await service_logion(data_auth)
        setUser(data.user)
        localStorage.setItem('auth_user', JSON.stringify(data.user))
        localStorage.setItem('auth_token', data.token)
        return data.user
    }

    const logout = async () => {
        clearSession()
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
