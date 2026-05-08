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
  Receipt
} from 'lucide-react';

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Usuarios', path: '/admin/usuarios', icon: <Users size={20} /> },
    { name: 'Contratos', path: '/admin/contratos', icon: <ClipboardList size={20} /> },
    { name: 'Facturas', path: '/admin/facturas', icon: <Receipt size={20} /> },
    { name: 'Lecturas', path: '/admin/lecturas', icon: <BarChart3 size={20} /> },
    { name: 'Cortes', path: '/admin/cortes', icon: <Scissors size={20} /> },
    { name: 'Recaudación', path: '/admin/recaudacion', icon: <FileText size={20} /> },
    { name: 'Tarifas', path: '/admin/tarifas', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] font-sans selection:bg-blue-100">
      {/* Sidebar Lateral */}
      <aside className="w-72 bg-[#0F172A] text-slate-300 flex flex-col sticky top-0 h-screen shadow-2xl shadow-blue-900/20">
        <div className="p-8 mb-4">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/30">
              <Droplets size={24} fill="currentColor" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight block leading-none">ELAPAS</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1 block">Gestión Central</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Menú Principal</p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-semibold">{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <button 
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all text-sm font-medium"
          >
            <LogOut size={18} /> Salir del Sistema
          </button>
        </div>
      </aside>

      {/* Área de Contenido */}
      <div className="flex-1 flex flex-col">
        {/* Top Header Barra Superior */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>Admin</span> / <span className="text-slate-900 font-bold capitalize">{location.pathname.split('/').pop()}</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-blue-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">Admin General</p>
                <p className="text-[11px] text-slate-500">Sesión activa</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                AD
              </div>
            </div>
          </div>
        </header>

        <main className="p-10 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;