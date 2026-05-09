import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import { Plus, Edit2, Trash2, X, Loader2, Gauge, Search, RefreshCw, AlertTriangle } from 'lucide-react'
import {
    getMedidores, createMedidor, updateMedidor, deleteMedidor,
} from '@/services/service-medidores'
import { getContratos } from '@/services/service-contratos'
import type { Medidor, MedidorCreate, MedidorUpdate } from '@/schemas/medidores'
import type { Contrato } from '@/schemas/contrato'

const fmt = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })

// ── Modal formulario ──────────────────────────────────────
interface FormModalProps {
    mode: 'create' | 'edit'
    initial?: Medidor | null
    contratos: Contrato[]
    onClose: () => void
    onSaved: () => void
}

interface FormModalProps {
    mode: 'create' | 'edit'
    initial?: Medidor | null
    contratos: Contrato[]
    onClose: () => void
    onSaved: () => void
}

const FormModal = ({ mode, initial, contratos, onClose, onSaved }: FormModalProps) => {
    const [nroMedidor, setNroMedidor] = useState(initial?.nroMedidor ?? '')
    const [contratoId, setContratoId] = useState(initial?.contratoId ?? '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const validate = (): string => {
        if (!nroMedidor.trim()) return 'El número de medidor es obligatorio.'
        return ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const err = validate()
        if (err) { setError(err); return }
        setLoading(true); setError('')
        try {
            if (mode === 'create') {
                const payload: MedidorCreate = {
                    nroMedidor: nroMedidor.trim().toUpperCase(),
                    contratoId: contratoId.trim(),
                }
                await createMedidor(payload)
            } else if (initial) {
                const payload: MedidorUpdate = {
                    nroMedidor: nroMedidor.trim().toUpperCase(),
                    contratoId: contratoId.trim(),
                }
                await updateMedidor(initial.id, payload)
            }
            onSaved()
        } catch (e: any) {
            setError(e.message || 'Error al guardar.')
        } finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900">
                        {mode === 'create' ? 'Nuevo Medidor' : 'Editar Medidor'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    {/* Aviso de dependencia circular */}
                    <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <AlertTriangle size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700">
                            Puedes crear el medidor sin contrato y asociarlo después desde el módulo de Contratos.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Nº de Medidor *
                        </label>
                        <input
                            value={nroMedidor}
                            onChange={e => setNroMedidor(e.target.value)}
                            placeholder="Ej: MED-00123"
                            autoFocus
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-mono uppercase"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Contrato asociado <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <select
                            value={contratoId}
                            onChange={e => setContratoId(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white"
                        >
                            <option value="">— Sin contrato por ahora —</option>
                            {contratos.map(c => (
                                <option key={c.contrato.id} value={c.contrato.id}>
                                    {c.contrato.nroContrato} · {c.predio.direccion}
                                </option>
                            ))}
                        </select>
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
    medidor: Medidor
    onConfirm: () => void
    onCancel: () => void
    loading: boolean
}

const ConfirmModal = ({ medidor, onConfirm, onCancel, loading }: ConfirmModalProps) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">¿Eliminar medidor?</p>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">{medidor.nroMedidor}</p>
                </div>
            </div>
            <p className="text-xs text-slate-500 mb-5">
                Solo se puede eliminar si el medidor no tiene contratos asociados. Esta acción no se puede deshacer.
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
const Medidores = () => {
    const [medidores, setMedidores] = useState<Medidor[]>([])
    const [contratos, setContratos] = useState<Contrato[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const LIMIT = 20

    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState<Medidor | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<Medidor | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const fetchMedidores = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const res = await getMedidores({ page, limit: LIMIT })
            setMedidores(res.data)
            setTotal(res.pagination.total)
        } catch (e: any) {
            setError(e.message || 'Error al cargar medidores.')
        } finally { setLoading(false) }
    }, [page])

    useEffect(() => { fetchMedidores() }, [fetchMedidores])

    useEffect(() => {
        getContratos({ limit: 500 }).then(r => setContratos(r.data)).catch(() => {})
    }, [])

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleteLoading(true)
        try {
            await deleteMedidor(deleteTarget.id)
            setDeleteTarget(null)
            fetchMedidores()
        } catch (e: any) {
            setError(e.message || 'Error al eliminar. Verifica que el medidor no tenga contratos activos.')
            setDeleteTarget(null)
        } finally { setDeleteLoading(false) }
    }

    const filtered = medidores.filter(m =>
        (m.nroMedidor ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (m.contratoId ?? '').toLowerCase().includes(search.toLowerCase())
    )

    const totalPages = Math.ceil(total / LIMIT)

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Encabezado */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Medidores</h1>
                        <p className="text-sm text-slate-400 mt-0.5"><span>{total} medidores registrados</span></p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchMedidores}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                            <RefreshCw size={15} /> Actualizar
                        </button>
                        <button
                            onClick={() => { setEditTarget(null); setShowForm(true) }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all text-sm active:scale-95 shadow-lg shadow-blue-600/20">
                            <Plus size={17} /> Nuevo Medidor
                        </button>
                    </div>
                </div>

                {/* Buscador */}
                <div className="relative max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por número o contrato..."
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                    />
                    {search && (
                        <button onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600">
                            ✕
                        </button>
                    )}
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
                            <Gauge size={36} className="mb-3 opacity-30" />
                            <p className="text-sm font-medium">
                                {search ? 'Sin resultados para la búsqueda' : 'No hay medidores registrados'}
                            </p>
                            {!search && (
                                <button
                                    onClick={() => { setEditTarget(null); setShowForm(true) }}
                                    className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-semibold">
                                    + Registrar el primer medidor
                                </button>
                            )}
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">#</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Nº Medidor</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Contrato asociado</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Registrado</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((m, i) => (
                                    <tr key={m.id}
                                        className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                                        <td className="px-5 py-3.5 text-slate-400 text-xs">
                                            {((page - 1) * LIMIT) + i + 1}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                                                    <Gauge size={14} />
                                                </div>
                                                <span className="font-mono font-semibold text-slate-800">
                                                    {m.nroMedidor}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                {m.contratoId.slice(0, 8)}…
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500 text-xs">
                                            {fmt(m.createdAt)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => { setEditTarget(m); setShowForm(true) }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Editar">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(m)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Eliminar">
                                                    <Trash2 size={14} />
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
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">
                            {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} de {total} medidores
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
                    contratos={contratos}
                    onClose={() => { setShowForm(false); setEditTarget(null) }}
                    onSaved={() => { setShowForm(false); setEditTarget(null); fetchMedidores() }}
                />
            )}
            {deleteTarget && (
                <ConfirmModal
                    medidor={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleteLoading}
                />
            )}
        </AdminLayout>
    )
}

export default Medidores
