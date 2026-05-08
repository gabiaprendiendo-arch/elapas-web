import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  BarChart3, 
  Scissors, 
  FileText, 
  LogOut, 
  Droplets,
  Settings,
  Bell,
  ClipboardList,
  Receipt,
  MapPin,
  Gauge,
  Home,
  UserCheck
} from 'lucide-react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuGroups = [
    {
      label: 'Configuración',
      items: [
        { name: 'Usuarios',     path: '/admin/usuarios',     icon: <Users size={16} /> },
        { name: 'Distritos',    path: '/admin/distritos',    icon: <MapPin size={16} /> },
        { name: 'Predios',      path: '/admin/predios',      icon: <Home size={16} /> },
        { name: 'Medidores',    path: '/admin/medidores',    icon: <Gauge size={16} /> },
        { name: 'Tarifas',      path: '/admin/tarifas',      icon: <Settings size={16} /> },
      ],
    },
    {
      label: 'Operaciones',
      items: [
        { name: 'Contratos',    path: '/admin/contratos',    icon: <ClipboardList size={16} /> },
        { name: 'Asignaciones', path: '/admin/asignaciones', icon: <UserCheck size={16} /> },
        { name: 'Lecturas',     path: '/admin/lecturas',     icon: <BarChart3 size={16} /> },
        { name: 'Cortes',       path: '/admin/cortes',       icon: <Scissors size={16} /> },
      ],
    },
    {
      label: 'Finanzas',
      items: [
        { name: 'Facturas',     path: '/admin/facturas',     icon: <Receipt size={16} /> },
        { name: 'Recaudación',  path: '/admin/recaudacion',  icon: <FileText size={16} /> },
      ],
    },
  ];

  const currentName = menuGroups
    .flatMap(g => g.items)
    .find(i => i.path === location.pathname)?.name ?? location.pathname.split('/').pop()

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans selection:bg-blue-100">

      {/* ── Sidebar ── */}
      <aside className="w-60 bg-[#0F172A] text-slate-300 flex flex-col sticky top-0 h-screen shadow-2xl shadow-blue-900/20">

        {/* Logo — compacto */}
        <div className="px-5 py-5 shrink-0">
          <div className="flex items-center gap-2.5 text-white">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-600/30">
              <Droplets size={18} fill="currentColor" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight block leading-none">ELAPAS</span>
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest block mt-0.5">
                Gestión Central
              </span>
            </div>
          </div>
        </div>

        {/* Nav — scrolleable */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-4 scrollbar-thin">
          {menuGroups.map(group => (
            <div key={group.label}>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = location.pathname === item.path
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 group text-left ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                        {item.icon}
                      </span>
                      <span className="text-xs font-semibold truncate">{item.name}</span>
                      {isActive && (
                        <div className="ml-auto w-1 h-1 rounded-full bg-white shadow-[0_0_6px_white] shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-white/5 shrink-0">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all text-xs font-medium"
          >
            <LogOut size={15} /> Salir del Sistema
          </button>
        </div>
      </aside>

      {/* ── Contenido ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-800 font-semibold capitalize">{currentName}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-blue-600 transition-colors relative">
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 pl-4 border-l border-slate-200">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900">Admin General</p>
                <p className="text-[10px] text-slate-400">Sesión activa</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                AD
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-screen-2xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
