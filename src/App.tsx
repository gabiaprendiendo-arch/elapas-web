import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Component, type ReactNode } from 'react'
import { AuthProvider } from './context/authContext'
import ProtectedRoute from './components/ProtectedRoute'

// Páginas públicas
import Home from './Home'
import LoginScreen from './login'

// Páginas admin
import UserManagement from './pages/admin/UserManagement'
import Distritos from './pages/admin/Distritos'
import Predios from './pages/admin/Predios'
import Medidores from './pages/admin/Medidores'
import Contratos from './pages/admin/Contratos'
import Asignaciones from './pages/admin/Asignaciones'
import FacturasAdmin from './pages/admin/FacturasAdmin'
import Lecturas from './pages/admin/Lecturas'
import Cortes from './pages/admin/Cortes'
import Recaudacion from './pages/admin/Recaudacion'
import Tarifas from './pages/admin/Tarifas'

// Páginas portal ciudadano
import PortalDashboard from './pages/ciudadanos/PortalDashboard'
import PortalFacturas from './pages/ciudadanos/PortalFacturas'
import PortalPagos from './pages/ciudadanos/PortalPagos'

// ── Error Boundary global ─────────────────────────────────
class ErrorBoundary extends Component<
    { children: ReactNode },
    { hasError: boolean; message: string }
> {
    constructor(props: { children: ReactNode }) {
        super(props)
        this.state = { hasError: false, message: '' }
    }
    static getDerivedStateFromError(error: Error) {
        return { hasError: true, message: error.message }
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
                    <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-md w-full text-center shadow-sm">
                        <p className="text-4xl mb-4">⚠️</p>
                        <p className="text-base font-bold text-slate-900 mb-2">Algo salió mal</p>
                        <p className="text-sm text-slate-500 mb-6">{this.state.message || 'Error inesperado en la aplicación.'}</p>
                        <button
                            onClick={() => { this.setState({ hasError: false, message: '' }); window.location.reload() }}
                            className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all"
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

// ── App ───────────────────────────────────────────────────
const App = () => {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* ── Públicas ── */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<LoginScreen />} />

                        {/* ── Portal Ciudadano ── */}
                        <Route path="/portal" element={
                            <ProtectedRoute allowedRoles={['ciudadano']}>
                                <PortalDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/portal/facturas" element={
                            <ProtectedRoute allowedRoles={['ciudadano']}>
                                <PortalFacturas />
                            </ProtectedRoute>
                        } />
                        <Route path="/portal/pagos" element={
                            <ProtectedRoute allowedRoles={['ciudadano']}>
                                <PortalPagos />
                            </ProtectedRoute>
                        } />

                        {/* ── Administración ── */}
                        <Route path="/admin/usuarios" element={
                            <ProtectedRoute allowedRoles={['admin', 'brigadista']}>
                                <UserManagement />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/distritos" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Distritos />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/predios" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Predios />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/medidores" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Medidores />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/contratos" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Contratos />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/asignaciones" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Asignaciones />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/facturas" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <FacturasAdmin />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/lecturas" element={
                            <ProtectedRoute allowedRoles={['admin', 'brigadista']}>
                                <Lecturas />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/cortes" element={
                            <ProtectedRoute allowedRoles={['admin', 'brigadista']}>
                                <Cortes />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/recaudacion" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Recaudacion />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/tarifas" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <Tarifas />
                            </ProtectedRoute>
                        } />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ErrorBoundary>
    )
}

export default App
