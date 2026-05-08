import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
    Droplets, LayoutDashboard, FileText,
    CreditCard, Home, LogOut, Bell, ChevronRight
} from 'lucide-react'
import type { ReactNode } from 'react'

const menuItems = [
    { name: 'Inicio', path: '/portal', icon: <LayoutDashboard size={20} /> },
    { name: 'Mis Facturas', path: '/portal/facturas', icon: <FileText size={20} /> },
    { name: 'Mis Pagos', path: '/portal/pagos', icon: <CreditCard size={20} /> },
]

const PortalLayout = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : 'U'

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-100 flex flex-col sticky top-0 h-screen shadow-sm">
                {/* Logo */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/30">
                            <Droplets size={22} fill="white" className="text-white" />
                        </div>
                        <div>
                            <span className="font-black text-lg text-slate-900 block leading-none">ELAPAS</span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Portal Ciudadano</span>
                        </div>
                    </div>
                </div>

                {/* Perfil */}
                <div className="p-4 mx-3 mt-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-blue-600/30">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{user?.name ?? 'Usuario'}</p>
                            <p className="text-[11px] text-slate-500 truncate">{user?.email ?? ''}</p>
                        </div>
                    </div>
                </div>

                {/* Navegación */}
                <nav className="flex-1 px-3 mt-6 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">Mi Portal</p>
                    {menuItems.map(item => {
                        const isActive = location.pathname === item.path
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 group text-left ${isActive
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}>
                                    {item.icon}
                                </span>
                                <span className="text-sm font-semibold flex-1">{item.name}</span>
                                {isActive && <ChevronRight size={14} className="text-white/70" />}
                            </button>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-3 border-t border-slate-100">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all text-sm font-medium"
                    >
                        <Home size={17} /> Volver al inicio
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-medium mt-1"
                    >
                        <LogOut size={17} /> Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Contenido */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>Portal</span>
                        <ChevronRight size={14} />
                        <span className="text-slate-800 font-semibold capitalize">
                            {location.pathname === '/portal' ? 'Inicio' : location.pathname.split('/').pop()}
                        </span>
                    </div>
                    <button className="relative text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-xl hover:bg-blue-50">
                        <Bell size={19} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
                    </button>
                </header>

                <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default PortalLayout
