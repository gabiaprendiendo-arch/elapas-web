import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import { Plus, Edit2, Trash2, X, Loader2, MapPin, Search } from 'lucide-react'
import {
    getDistritos, createDistrito, updateDistrito, deleteDistrito,
} from '@/services/service-distritos'
import type { Distrito, DistritoCreate, DistritoUpdate } from '@/schemas/distritos'

// ── Modal formulario ──────────────────────────────────────
interface FormModalProps {
    mode: 'create' | 'edit'
    initial?: Distrito | null
    onClose: () => void
    onSaved: () => void
}

const FormModal = ({ mode, initial, onClose, onSaved }: FormModalProps) => {
    const [nombre, setNombre] = useState(initial?.nombre ?? '')
    const [codigo, setCodigo] = useState(initial?.codigo ?? '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const validate = (): string => {
        if (!nombre.trim()) return 'El nombre es obligatorio.'
        if (!codigo.trim()) return 'El código es obligatorio.'
        return ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const err = validate()
        if (err) { setError(err); return }
        setLoading(true); setError('')
        try {
            if (mode === 'create') {
                const payload: DistritoCreate = { nombre: nombre.trim(), codigo: codigo.trim().toUpperCase() }
                await createDistrito(payload)
            } else if (initial) {
                const payload: DistritoUpdate = { nombre: nombre.trim(), codigo: codigo.trim().toUpperCase() }
                await updateDistrito(initial.id, payload)
            }
            onSaved()
        } catch (e: any) {
            setError(e.message || 'Error al guardar.')
        } finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">
                        {mode === 'create' ? 'Nuevo Distrito' : 'Editar Distrito'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Nombre *
                        </label>
                        <input
                            value={nombre}
                            onChange={e => setNombre(e.target.value)}
                            placeholder="Ej: Distrito 1"
                            autoFocus
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Código *
                        </label>
                        <input
                            value={codigo}
                            onChange={e => setCodigo(e.target.value)}
                            placeholder="Ej: D1"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-mono uppercase"
                        />
                        <p className="text-xs text-slate-400 mt-1">Se guardará en mayúsculas automáticamente.</p>
                    </div>

                    {error && (
                        <div className="px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {mode === 'create' ? 'Crear' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Modal confirmación eliminar ───────────────────────────
interface ConfirmModalProps {
    distrito: Distrito
    onConfirm: () => void
    onCancel: () => void
    loading: boolean
}

const ConfirmModal = ({ distrito, onConfirm, onCancel, loading }: ConfirmModalProps) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">¿Eliminar distrito?</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold">{distrito.nombre}</span> ({distrito.codigo})
                    </p>
                </div>
            </div>
            <p className="text-xs text-slate-500 mb-5">
                Esta acción no se puede deshacer. Los contratos asociados a este distrito quedarán sin distrito asignado.
            </p>
            <div className="flex gap-2">
                <button onClick={onCancel}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
                    Cancelar
                </button>
                <button onClick={onConfirm} disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    Eliminar
                </button>
            </div>
        </div>
    </div>
)

// ── Página principal ──────────────────────────────────────
const Distritos = () => {
    const [distritos, setDistritos] = useState<Distrito[]>([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState<Distrito | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Distrito | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const fetchDistritos = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const data = await getDistritos()
            setDistritos(data)
        } catch (e: any) {
            setError(e.message || 'Error al cargar distritos.')
        } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchDistritos() }, [fetchDistritos])

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleteLoading(true)
        try {
            await deleteDistrito(deleteTarget.id)
            setDeleteTarget(null)
            fetchDistritos()
        } catch (e: any) {
            setError(e.message || 'Error al eliminar.')
            setDeleteTarget(null)
        } finally { setDeleteLoading(false) }
    }

    const filtered = distritos.filter(d =>
        (d.nombre ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (d.codigo ?? '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Encabezado */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Distritos</h1>
                        <p className="text-sm text-slate-400 mt-0.5"><span>{distritos.length} distritos registrados</span></p>
                    </div>
                    <button
                        onClick={() => { setEditTarget(null); setShowForm(true) }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all text-sm active:scale-95 shadow-lg shadow-blue-600/20">
                        <Plus size={17} /> Nuevo Distrito
                    </button>
                </div>

                {/* Buscador */}
                <div className="relative max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o código..."
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Contenido */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 size={28} className="animate-spin text-slate-300" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                        <MapPin size={36} className="mb-3 opacity-30" />
                        <p className="text-sm font-medium">
                            {search ? 'Sin resultados para la búsqueda' : 'No hay distritos registrados'}
                        </p>
                        {!search && (
                            <button
                                onClick={() => { setEditTarget(null); setShowForm(true) }}
                                className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-semibold">
                                + Crear el primer distrito
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filtered.map(d => (
                            <div key={d.id}
                                className="bg-white border border-slate-100 rounded-xl p-4 hover:shadow-sm transition-all group">
                                <div className="flex items-start justify-between gap-2">
                                    {/* Ícono + info */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                                            <MapPin size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-900 truncate">{d.nombre}</p>
                                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-mono font-bold rounded">
                                                {d.codigo}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setEditTarget(d); setShowForm(true) }}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Editar">
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(d)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            title="Eliminar">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modales */}
            {showForm && (
                <FormModal
                    mode={editTarget ? 'edit' : 'create'}
                    initial={editTarget}
                    onClose={() => { setShowForm(false); setEditTarget(null) }}
                    onSaved={() => { setShowForm(false); setEditTarget(null); fetchDistritos() }}
                />
            )}
            {deleteTarget && (
                <ConfirmModal
                    distrito={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleteLoading}
                />
            )}
        </AdminLayout>
    )
}

export default Distritos
