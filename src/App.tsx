import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/authContext'
import ProtectedRoute from './components/ProtectedRoute'

// Páginas públicas
import Home from './Home'
import LoginScreen from './login'

// Páginas admin
import UserManagement from './pages/admin/UserManagement'
import Contratos from './pages/admin/Contratos'
import FacturasAdmin from './pages/admin/FacturasAdmin'
import Lecturas from './pages/admin/Lecturas'
import Cortes from './pages/admin/Cortes'
import Recaudacion from './pages/admin/Recaudacion'
import Tarifas from './pages/admin/Tarifas'

// Páginas portal ciudadano
import PortalDashboard from './pages/ciudadanos/PortalDashboard'
import PortalFacturas from './pages/ciudadanos/PortalFacturas'
import PortalPagos from './pages/ciudadanos/PortalPagos'

const App = () => {
  return (
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
          <Route path="/admin/contratos" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Contratos />
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
  )
}

export default App
