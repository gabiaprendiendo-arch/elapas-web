import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import {
    Plus, Edit2, Trash2, X, Loader2, Home,
    Search, RefreshCw, MapPin, Filter
} from 'lucide-react'
import { getPredios, createPredio, updatePredio, deletePredio } from '@/services/service-predios'
import type { Predio, PredioCreate, PredioUpdate } from '@/schemas/predios'
import { getDistritos } from '@/services/service-distritos'
import type { Distrito } from '@/schemas/distritos'

const fmt = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })

// ── Modal formulario ──────────────────────────────────────
interface FormModalProps {
    mode: 'create' | 'edit'
    initial?: Predio | null
    distritos: Distrito[]
    onClose: () => void
    onSaved: () => void
}

const EMPTY: PredioCreate = { distritoId: '', direccion: '', latitud: '', longitud: '' }

const FormModal = ({ mode, initial, distritos, onClose, onSaved }: FormModalProps) => {
    const [form, setForm] = useState<PredioCreate>(
        initial
            ? {
                distritoId: initial.distritoId,
                direccion: initial.direccion,
                latitud: initial.latitud ?? '',
                longitud: initial.longitud ?? '',
            }
            : EMPTY
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const set = (k: keyof PredioCreate, v: string) =>
        setForm(p => ({ ...p, [k]: v }))

    const validate = (): string => {
        if (!form.distritoId) return 'Selecciona un distrito.'
        if (!form.direccion.trim()) return 'La dirección es obligatoria.'
        if (form.latitud && isNaN(Number(form.latitud))) return 'La latitud debe ser un número válido.'
        if (form.longitud && isNaN(Number(form.longitud))) return 'La longitud debe ser un número válido.'
        return ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const err = validate()
        if (err) { setError(err); return }
        setLoading(true); setError('')
        try {
            // Solo enviar lat/lng si tienen valor
            const payload: PredioCreate = {
                distritoId: form.distritoId,
                direccion: form.direccion.trim(),
                ...(form.latitud?.trim() && { latitud: form.latitud.trim() }),
                ...(form.longitud?.trim() && { longitud: form.longitud.trim() }),
            }
            if (mode === 'create') {
                await createPredio(payload)
            } else if (initial) {
                const upd: PredioUpdate = { ...payload }
                await updatePredio(initial.id, upd)
            }
            onSaved()
        } catch (e: any) {
            setError(e.message || 'Error al guardar.')
        } finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">
                        {mode === 'create' ? 'Nuevo Predio' : 'Editar Predio'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Distrito */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Distrito *
                        </label>
                        <select
                            value={form.distritoId}
                            onChange={e => set('distritoId', e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white"
                        >
                            <option value="">— Seleccionar distrito —</option>
                            {distritos.map(d => (
                                <option key={d.id} value={d.id}>{d.nombre} ({d.codigo})</option>
                            ))}
                        </select>
                    </div>

                    {/* Dirección */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Dirección *
                        </label>
                        <input
                            value={form.direccion}
                            onChange={e => set('direccion', e.target.value)}
                            placeholder="Ej: Av. Heroínas #123, Zona Central"
                            autoFocus
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                        />
                    </div>

                    {/* Coordenadas GPS */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Coordenadas GPS <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Latitud</label>
                                <input
                                    value={form.latitud ?? ''}
                                    onChange={e => set('latitud', e.target.value)}
                                    placeholder="-19.0461"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">Longitud</label>
                                <input
                                    value={form.longitud ?? ''}
                                    onChange={e => set('longitud', e.target.value)}
                                    placeholder="-65.2595"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-mono"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">
                            Formato decimal. Ej: latitud <code className="bg-slate-100 px-1 rounded">-19.0461</code>
                        </p>
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
                            {mode === 'create' ? 'Crear Predio' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Modal confirmación eliminar ───────────────────────────
interface ConfirmModalProps {
    predio: Predio
    distritoNombre: string
    onConfirm: () => void
    onCancel: () => void
    loading: boolean
}

const ConfirmModal = ({ predio, distritoNombre, onConfirm, onCancel, loading }: ConfirmModalProps) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">¿Eliminar predio?</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-52">{predio.direccion}</p>
                    <p className="text-xs text-slate-400">{distritoNombre}</p>
                </div>
            </div>
            <p className="text-xs text-slate-500 mb-5">
                Solo se puede eliminar si el predio no tiene contratos asociados. Esta acción no se puede deshacer.
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
const Predios = () => {
    const [predios, setPredios] = useState<Predio[]>([])
    const [distritos, setDistritos] = useState<Distrito[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const LIMIT = 20

    const [search, setSearch] = useState('')
    const [distritoFilter, setDistritoFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState<Predio | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Predio | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    // Mapa id → distrito para lookup rápido
    const distritoMap = Object.fromEntries(distritos.map(d => [d.id, d]))

    const fetchPredios = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const res = await getPredios({
                distritoId: distritoFilter || undefined,
                page,
                limit: LIMIT,
            })
            setPredios(res.data)
            setTotal(res.pagination.total)
        } catch (e: any) {
            setError(e.message || 'Error al cargar predios.')
        } finally { setLoading(false) }
    }, [distritoFilter, page])

    useEffect(() => { fetchPredios() }, [fetchPredios])

    useEffect(() => {
        getDistritos().then(setDistritos).catch(() => { })
    }, [])

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleteLoading(true)
        try {
            await deletePredio(deleteTarget.id)
            setDeleteTarget(null)
            fetchPredios()
        } catch (e: any) {
            setError(e.message || 'Error al eliminar. Verifica que el predio no tenga contratos activos.')
            setDeleteTarget(null)
        } finally { setDeleteLoading(false) }
    }

    const filtered = predios.filter(p =>
        (p.direccion ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (distritoMap[p.distritoId]?.nombre ?? '').toLowerCase().includes(search.toLowerCase())
    )

    const totalPages = Math.ceil(total / LIMIT)

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Encabezado */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Predios</h1>
                        <p className="text-sm text-slate-400 mt-0.5"><span>{total} predios registrados</span></p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchPredios}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                            <RefreshCw size={15} /> Actualizar
                        </button>
                        <button
                            onClick={() => { setEditTarget(null); setShowForm(true) }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all text-sm active:scale-95 shadow-lg shadow-blue-600/20">
                            <Plus size={17} /> Nuevo Predio
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-48">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por dirección o distrito..."
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-slate-400" />
                        <select
                            value={distritoFilter}
                            onChange={e => { setDistritoFilter(e.target.value); setPage(1) }}
                            className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all">
                            <option value="">Todos los distritos</option>
                            {distritos.map(d => (
                                <option key={d.id} value={d.id}>{d.nombre}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* Tabla */}
                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 size={28} className="animate-spin text-slate-300" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                            <Home size={36} className="mb-3 opacity-30" />
                            <p className="text-sm font-medium">
                                {search || distritoFilter ? 'Sin resultados para los filtros aplicados' : 'No hay predios registrados'}
                            </p>
                            {!search && !distritoFilter && (
                                <button
                                    onClick={() => { setEditTarget(null); setShowForm(true) }}
                                    className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-semibold">
                                    + Registrar el primer predio
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">#</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Dirección</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Distrito</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Coordenadas</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Registrado</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p, i) => {
                                    const distrito = distritoMap[p.distritoId]
                                    const tieneGps = p.latitud && p.longitud
                                    return (
                                        <tr key={p.id}
                                            className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                                            <td className="px-5 py-3.5 text-slate-400 text-xs">
                                                {((page - 1) * LIMIT) + i + 1}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                                                        <Home size={14} />
                                                    </div>
                                                    <span className="font-medium text-slate-800 max-w-56 truncate">
                                                        {p.direccion}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {distrito ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                                                        <MapPin size={10} />
                                                        {distrito.nombre}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Sin distrito</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {tieneGps ? (
                                                    <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                        {Number(p.latitud).toFixed(4)}, {Number(p.longitud).toFixed(4)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-500 text-xs">
                                                {fmt(p.createdAt)}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => { setEditTarget(p); setShowForm(true) }}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Editar">
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(p)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Eliminar">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">
                            {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} de {total} predios
                        </span>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                ←
                            </button>
                            <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
                                {page}
                            </span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                →
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
                    distritos={distritos}
                    onClose={() => { setShowForm(false); setEditTarget(null) }}
                    onSaved={() => { setShowForm(false); setEditTarget(null); fetchPredios() }}
                />
            )}
            {deleteTarget && (
                <ConfirmModal
                    predio={deleteTarget}
                    distritoNombre={distritoMap[deleteTarget.distritoId]?.nombre ?? '—'}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleteLoading}
                />
            )}
        </AdminLayout>
    )
}

export default Predios
