import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import {
    Plus, Search, Edit2, Trash2, X, Loader2,
    ShieldCheck, HardHat, User as UserIcon, CheckCircle2, XCircle
} from 'lucide-react'
import {
    getUsuarios, createUsuario, updateUsuario, deleteUsuario,
    type Usuario, type CreateUsuarioPayload, type UpdateUsuarioPayload
} from '@/services/service-user'

// ── helpers ──────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
    admin: 'Administrador',
    brigadista: 'Brigadista',
    ciudadano: 'Ciudadano',
}
const ROLE_STYLES: Record<string, string> = {
    admin: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    brigadista: 'bg-cyan-50 text-cyan-600 border border-cyan-100',
    ciudadano: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
}
const ROLE_ICONS: Record<string, React.ReactNode> = {
    admin: <ShieldCheck size={12} />,
    brigadista: <HardHat size={12} />,
    ciudadano: <UserIcon size={12} />,
}

// ── Modal de confirmación ─────────────────────────────────
interface ConfirmModalProps {
    message: string
    onConfirm: () => void
    onCancel: () => void
    loading?: boolean
}
const ConfirmModal = ({ message, onConfirm, onCancel, loading }: ConfirmModalProps) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
            <p className="text-slate-800 font-semibold text-center mb-6">{message}</p>
            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all">
                    Cancelar
                </button>
                <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    Eliminar
                </button>
            </div>
        </div>
    </div>
)

// ── Modal de formulario ───────────────────────────────────
interface FormModalProps {
    mode: 'create' | 'edit'
    initial?: Usuario | null
    onClose: () => void
    onSaved: () => void
}
const FormModal = ({ mode, initial, onClose, onSaved }: FormModalProps) => {
    const [nombre, setNombre] = useState(initial?.name ?? '')
    const [email, setEmail] = useState(initial?.email ?? '')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'admin' | 'brigadista' | 'ciudadano'>(
        (initial?.role as 'admin' | 'brigadista' | 'ciudadano') ?? 'ciudadano'
    )
    const [estado, setEstado] = useState(initial?.estado ?? true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const validate = () => {
        if (!nombre.trim()) return 'El nombre es obligatorio.'
        if (!email.includes('@')) return 'Ingresa un correo válido.'
        if (mode === 'create' && password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.'
        return ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const err = validate()
        if (err) { setError(err); return }
        setLoading(true)
        setError('')
        try {
            if (mode === 'create') {
                const payload: CreateUsuarioPayload = { nombre, email, password, role }
                await createUsuario(payload)
            } else if (initial) {
                const payload: UpdateUsuarioPayload = { nombre, email, role, estado }
                await updateUsuario(initial.id, payload)
            }
            onSaved()
        } catch (err: any) {
            setError(err.message || 'Error al guardar.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-slate-900">
                        {mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre completo *</label>
                        <input
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            placeholder="Ej: Juan Pérez"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Correo electrónico *</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="correo@ejemplo.com"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                        />
                    </div>
                    {mode === 'create' && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Contraseña * (mín. 8 caracteres)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Rol *</label>
                        <select
                            value={role}
                            onChange={e => setRole(e.target.value as 'admin' | 'brigadista' | 'ciudadano')}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white"
                        >
                            <option value="ciudadano">Ciudadano</option>
                            <option value="brigadista">Brigadista</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    {mode === 'edit' && (
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                            <span className="text-sm font-semibold text-slate-700">Estado:</span>
                            <button
                                type="button"
                                onClick={() => setEstado(!estado)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${estado
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-red-100 text-red-600'
                                    }`}
                            >
                                {estado ? <><CheckCircle2 size={14} /> Activo</> : <><XCircle size={14} /> Inactivo</>}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {mode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Página principal ──────────────────────────────────────
const UserManagement = () => {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const LIMIT = 10

    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState<Usuario | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const fetchUsuarios = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const res = await getUsuarios({ role: roleFilter || undefined, page, limit: LIMIT })
            setUsuarios(res.data)
            setTotal(res.pagination.total)
        } catch (e: any) {
            setError(e.message || 'Error al cargar usuarios.')
        } finally {
            setLoading(false)
        }
    }, [roleFilter, page])

    useEffect(() => { fetchUsuarios() }, [fetchUsuarios])

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleteLoading(true)
        try {
            await deleteUsuario(deleteTarget.id)
            setDeleteTarget(null)
            fetchUsuarios()
        } catch (e: any) {
            setError(e.message || 'Error al eliminar.')
            setDeleteTarget(null)
        } finally {
            setDeleteLoading(false)
        }
    }

    const filtered = usuarios.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    const totalPages = Math.ceil(total / LIMIT)

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Encabezado */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Usuarios</h1>
                    </div>
                    <button
                        onClick={() => { setEditTarget(null); setShowForm(true) }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={20} /> Nuevo Usuario
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por nombre o correo..."
                            className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                        />
                    </div>
                    <select
                        value={roleFilter}
                        onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
                        className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-600/20"
                    >
                        <option value="">Todos los Roles</option>
                        <option value="admin">Administrador</option>
                        <option value="brigadista">Brigadista</option>
                        <option value="ciudadano">Ciudadano</option>
                    </select>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                {/* Tabla */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-blue-600" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <UserIcon size={40} className="mb-3 opacity-30" />
                            <p className="font-medium">No se encontraron usuarios</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200 shrink-0">
                                                    {u.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${ROLE_STYLES[u.role] ?? ''}`}>
                                                {ROLE_ICONS[u.role]}
                                                {ROLE_LABELS[u.role] ?? u.role}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${u.estado
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-red-50 text-red-500 border border-red-100'
                                                }`}>
                                                {u.estado ? <><CheckCircle2 size={11} /> Activo</> : <><XCircle size={11} /> Inactivo</>}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditTarget(u); setShowForm(true) }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(u)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Mostrando {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} de {total} usuarios
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                            >
                                Anterior
                            </button>
                            <span className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modales */}
            {showForm && (
                <FormModal
                    mode={editTarget ? 'edit' : 'create'}
                    initial={editTarget}
                    onClose={() => { setShowForm(false); setEditTarget(null) }}
                    onSaved={() => { setShowForm(false); setEditTarget(null); fetchUsuarios() }}
                />
            )}
            {deleteTarget && (
                <ConfirmModal
                    message={`¿Eliminar al usuario "${deleteTarget.name}"? Esta acción lo desactivará del sistema.`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleteLoading}
                />
            )}
        </AdminLayout>
    )
}

export default UserManagement
