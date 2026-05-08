import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import {
    Plus, Trash2, X, Loader2, Search,
    RefreshCw, UserCheck, ChevronDown, ChevronUp, CheckSquare, Square
} from 'lucide-react'
import {
    getAsignaciones, createAsignacion, deleteAsignacion,
    type AsignacionRow,
} from '@/services/service-asignaciones'
import { getUsuarios } from '@/services/service-user'
import type { User } from '@/schemas/user'
import { getContratos } from '@/services/service-contratos'
import type { Contrato } from '@/schemas/contrato'

const fmt = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })

// ── Modal asignar contratos ───────────────────────────────
interface AsignarModalProps {
    brigadistas: User[]
    contratos: Contrato[]
    onClose: () => void
    onSaved: () => void
}

const AsignarModal = ({ brigadistas, contratos, onClose, onSaved }: AsignarModalProps) => {
    const [brigadistaId, setBrigadistaId] = useState('')
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [searchContrato, setSearchContrato] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const toggle = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    const toggleAll = () => {
        if (selectedIds.size === filteredContratos.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(filteredContratos.map(c => c.contrato.id)))
        }
    }

    const filteredContratos = contratos.filter(c =>
        (c.contrato.nroContrato ?? '').toLowerCase().includes(searchContrato.toLowerCase()) ||
        (c.predio.direccion ?? '').toLowerCase().includes(searchContrato.toLowerCase())
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!brigadistaId) { setError('Selecciona un brigadista.'); return }
        if (selectedIds.size === 0) { setError('Selecciona al menos un contrato.'); return }
        setLoading(true); setError('')
        try {
            await createAsignacion({
                brigadistaId,
                contratoIds: Array.from(selectedIds),
            })
            onSaved()
        } catch (e: any) {
            setError(e.message || 'Error al asignar.')
        } finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <h2 className="text-base font-bold text-slate-900">Asignar Contratos</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
                        {/* Brigadista */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Brigadista *
                            </label>
                            <select
                                value={brigadistaId}
                                onChange={e => setBrigadistaId(e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white"
                            >
                                <option value="">— Seleccionar brigadista —</option>
                                {brigadistas.map(b => (
                                    <option key={b.id} value={b.id}>{b.name} ({b.email})</option>
                                ))}
                            </select>
                        </div>

                        {/* Contratos */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-semibold text-slate-700">
                                    Contratos * <span className="text-slate-400 font-normal">({selectedIds.size} seleccionados)</span>
                                </label>
                                <button type="button" onClick={toggleAll}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold">
                                    {selectedIds.size === filteredContratos.length && filteredContratos.length > 0
                                        ? 'Deseleccionar todos'
                                        : 'Seleccionar todos'}
                                </button>
                            </div>

                            {/* Buscador contratos */}
                            <div className="relative mb-2">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={searchContrato}
                                    onChange={e => setSearchContrato(e.target.value)}
                                    placeholder="Buscar contrato..."
                                    className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-blue-400 transition-all"
                                />
                            </div>

                            {/* Lista de contratos */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                                {filteredContratos.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-6">Sin contratos disponibles</p>
                                ) : (
                                    filteredContratos.map(c => {
                                        const checked = selectedIds.has(c.contrato.id)
                                        return (
                                            <button
                                                key={c.contrato.id}
                                                type="button"
                                                onClick={() => toggle(c.contrato.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left border-b border-slate-50 last:border-0 transition-colors ${checked ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                                            >
                                                {checked
                                                    ? <CheckSquare size={15} className="text-blue-600 shrink-0" />
                                                    : <Square size={15} className="text-slate-300 shrink-0" />
                                                }
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-slate-800">{c.contrato.nroContrato}</p>
                                                    <p className="text-[10px] text-slate-400 truncate">{c.predio.direccion} · {c.medidor.nroMedidor}</p>
                                                </div>
                                                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${c.contrato.estado === 'activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                                    {c.contrato.estado}
                                                </span>
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex gap-2 px-6 py-4 border-t border-slate-100 shrink-0">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            Asignar {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Modal confirmación eliminar ───────────────────────────
interface ConfirmModalProps {
    row: AsignacionRow
    onConfirm: () => void
    onCancel: () => void
    loading: boolean
}

const ConfirmModal = ({ row, onConfirm, onCancel, loading }: ConfirmModalProps) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-900">¿Eliminar asignación?</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Contrato <span className="font-semibold">{row.contrato.nroContrato}</span>
                    </p>
                </div>
            </div>
            <p className="text-xs text-slate-500 mb-5">
                El brigadista ya no tendrá acceso a este contrato. Esta acción no se puede deshacer.
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

// ── Fila agrupada por brigadista ──────────────────────────
interface BrigadistaGroupProps {
    brigadistaId: string
    brigadistaNombre: string
    rows: AsignacionRow[]
    onDelete: (row: AsignacionRow) => void
}

const BrigadistaGroup = ({ brigadistaId: _id, brigadistaNombre, rows, onDelete }: BrigadistaGroupProps) => {
    const [open, setOpen] = useState(true)
    return (
        <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
            {/* Header del grupo */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 border border-cyan-100 shrink-0">
                        <UserCheck size={15} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-900">{brigadistaNombre}</p>
                        <p className="text-xs text-slate-400"><span>{`${rows.length} contrato${rows.length !== 1 ? 's' : ''} asignado${rows.length !== 1 ? 's' : ''}`}</span></p>
                    </div>
                </div>
                {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>

            {/* Contratos del brigadista */}
            {open && (
                <div className="border-t border-slate-50">
                    {rows.map((row, i) => (
                        <div key={row.asignacion.id}
                            className={`flex items-center justify-between px-5 py-3 border-b border-slate-50 last:border-0 ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800">{row.contrato.nroContrato}</p>
                                    <p className="text-xs text-slate-400 truncate">
                                        {row.predio.direccion} · {row.medidor.nroMedidor} · {row.distrito.nombre}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${row.contrato.estado === 'activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                                    {row.contrato.estado}
                                </span>
                                <span className="text-xs text-slate-400">{fmt(row.asignacion.createdAt)}</span>
                                <button
                                    onClick={() => onDelete(row)}
                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Eliminar asignación">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ── Página principal ──────────────────────────────────────
const Asignaciones = () => {
    const [rows, setRows] = useState<AsignacionRow[]>([])
    const [brigadistas, setBrigadistas] = useState<User[]>([])
    const [contratos, setContratos] = useState<Contrato[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const LIMIT = 50

    const [search, setSearch] = useState('')
    const [brigadistaFilter, setBrigadistaFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [showForm, setShowForm] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<AsignacionRow | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    const fetchAsignaciones = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const res = await getAsignaciones({
                brigadistaId: brigadistaFilter || undefined,
                page,
                limit: LIMIT,
            })
            setRows(res.data)
            setTotal(res.pagination.total)
        } catch (e: any) {
            setError(e.message || 'Error al cargar asignaciones.')
        } finally { setLoading(false) }
    }, [brigadistaFilter, page])

    useEffect(() => { fetchAsignaciones() }, [fetchAsignaciones])

    useEffect(() => {
        // Cargar brigadistas y contratos para los modales
        getUsuarios({ role: 'brigadista', limit: 100 })
            .then(r => setBrigadistas(r.data))
            .catch(() => { })
        getContratos({ limit: 200 })
            .then(r => setContratos(r.data))
            .catch(() => { })
    }, [])

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleteLoading(true)
        try {
            await deleteAsignacion(deleteTarget.asignacion.id)
            setDeleteTarget(null)
            fetchAsignaciones()
        } catch (e: any) {
            setError(e.message || 'Error al eliminar asignación.')
            setDeleteTarget(null)
        } finally { setDeleteLoading(false) }
    }

    // Filtrar por búsqueda
    const filtered = rows.filter(r =>
        (r.contrato.nroContrato ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.predio.direccion ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (r.distrito.nombre ?? '').toLowerCase().includes(search.toLowerCase())
    )

    // Agrupar por brigadista
    const grouped = filtered.reduce<Record<string, { nombre: string; rows: AsignacionRow[] }>>((acc, row) => {
        const bid = row.asignacion.brigadistaId
        if (!acc[bid]) {
            const brigadista = brigadistas.find(b => b.id === bid)
            acc[bid] = {
                nombre: brigadista?.name ?? `Brigadista ${bid.slice(0, 8)}`,
                rows: [],
            }
        }
        acc[bid].rows.push(row)
        return acc
    }, {})

    const totalPages = Math.ceil(total / LIMIT)

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Encabezado */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Asignaciones</h1>
                        <p className="text-sm text-slate-400 mt-0.5"><span>{total} asignaciones registradas</span></p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={fetchAsignaciones}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                            <RefreshCw size={15} /> Actualizar
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all text-sm active:scale-95 shadow-lg shadow-blue-600/20">
                            <Plus size={17} /> Nueva Asignación
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
                            placeholder="Buscar por contrato, dirección o distrito..."
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                        />
                        {search && (
                            <button onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600">✕</button>
                        )}
                    </div>
                    <select
                        value={brigadistaFilter}
                        onChange={e => { setBrigadistaFilter(e.target.value); setPage(1) }}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all">
                        <option value="">Todos los brigadistas</option>
                        {brigadistas.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>

                {/* Error */}
                {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
                )}

                {/* Contenido */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 size={28} className="animate-spin text-slate-300" />
                    </div>
                ) : Object.keys(grouped).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                        <UserCheck size={36} className="mb-3 opacity-30" />
                        <p className="text-sm font-medium">
                            {search || brigadistaFilter ? 'Sin resultados para los filtros aplicados' : 'No hay asignaciones registradas'}
                        </p>
                        {!search && !brigadistaFilter && (
                            <button onClick={() => setShowForm(true)}
                                className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-semibold">
                                + Crear la primera asignación
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {Object.entries(grouped).map(([bid, group]) => (
                            <BrigadistaGroup
                                key={bid}
                                brigadistaId={bid}
                                brigadistaNombre={group.nombre}
                                rows={group.rows}
                                onDelete={setDeleteTarget}
                            />
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">
                            Página {page} de {totalPages} — {total} asignaciones
                        </span>
                        <div className="flex gap-1">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">←</button>
                            <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">{page}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">→</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modales */}
            {showForm && (
                <AsignarModal
                    brigadistas={brigadistas}
                    contratos={contratos}
                    onClose={() => setShowForm(false)}
                    onSaved={() => { setShowForm(false); fetchAsignaciones() }}
                />
            )}
            {deleteTarget && (
                <ConfirmModal
                    row={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleteLoading}
                />
            )}
        </AdminLayout>
    )
}

export default Asignaciones
