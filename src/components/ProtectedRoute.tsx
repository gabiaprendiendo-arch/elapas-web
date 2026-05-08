import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
    children: ReactNode
    allowedRoles?: string[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticate, user } = useAuth()

    // No autenticado → login
    if (!isAuthenticate) {
        return <Navigate to="/login" replace />
    }

    // Rol no permitido → redirigir al portal correcto
    if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
        if (user.role === 'ciudadano') {
            return <Navigate to="/portal" replace />
        }
        return <Navigate to="/admin/usuarios" replace />
    }

    return <>{children}</>
}

export default ProtectedRoute
