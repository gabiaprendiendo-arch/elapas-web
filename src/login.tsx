import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Droplets, Eye, EyeOff } from 'lucide-react'

const LoginScreen = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      return setError('El correo electrónico es obligatorio.')
    }
    if (!email.includes('@')) {
      return setError('Ingresa un correo electrónico válido.')
    }
    if (!password) {
      return setError('La contraseña es obligatoria.')
    }
    if (password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.')
    }

    setLoading(true)
    try {
      const user = await login({ email: email.trim().toLowerCase(), password })
      if (user.role === 'admin' || user.role === 'brigadista') {
        navigate('/admin/usuarios')
      } else {
        navigate('/portal')
      }
    } catch (err: any) {
      // Traducir errores comunes de better-auth
      const msg: string = err.message ?? ''
      if (msg.includes('Invalid email or password') || msg.includes('INVALID_EMAIL_OR_PASSWORD')) {
        setError('Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.')
      } else if (msg.includes('User not found') || msg.includes('USER_NOT_FOUND')) {
        setError('No existe una cuenta con ese correo electrónico.')
      } else if (msg.includes('Account disabled') || msg.includes('estado')) {
        setError('Tu cuenta está desactivada. Contacta al administrador.')
      } else if (msg.includes('Network Error') || msg.includes('ERR_CONNECTION_REFUSED')) {
        setError('No se puede conectar al servidor. Verifica que el servicio esté activo.')
      } else {
        setError(msg || 'Error al iniciar sesión. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role: 'admin' | 'brigadista' | 'ciudadano') => {
    const creds: Record<string, { email: string; password: string }> = {
      admin: { email: 'admin@elapas.com', password: 'password123' },
      brigadista: { email: 'brigadista1@elapas.com', password: 'password123' },
      ciudadano: { email: 'ciudadano1@elapas.com', password: 'password123' },
    }
    setEmail(creds[role].email)
    setPassword(creds[role].password)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-8 text-center">
            <h1 className="text-2xl font-black text-white">ELAPAS</h1>
            
          </div>

          <div className="px-8 py-8">
            <h2 className="text-lg font-black text-slate-900 mb-1">Iniciar Sesión</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98] disabled:opacity-60 text-sm mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verificando...
                  </span>
                ) : 'Ingresar al Portal'}
              </button>
            </form>

            
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors text-center"
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  )
}

export default LoginScreen
