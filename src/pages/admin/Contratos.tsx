import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import {
    Plus, Search, Edit2, X, Loader2, MapPin,
    Hash, CheckCircle2, AlertTriangle, Clock, FileText
} from 'lucide-react'
import {
    getContratos, createContrato, updateContrato,
    type Contrato, type CreateContratoPayload
} from '@/services/service-contratos'
import { getUsuarios, type Usuario } from '@/services/service-user'
import { getDistritos, type Distrito } from '@/services/service-distritos'

// ── helpers ───────────────────────────────────────────────
const ESTADO_STYLES: Record<string, string> = {
    activo: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    suspendido: 'bg-amber-50 text-amber-700 border border-amber-200',
    cortado: 'bg-red-50 text-red-600 border border-red-200',
}
const ESTADO_ICONS: Record<string, React.ReactNode> = {
    activo: <CheckCircle2 size={11} />,
    suspendido: <Clock size={11} />,
    cortado: <AlertTriangle size={11} />,
}

// ── Modal formulario ──────────────────────────────────────
interface FormModalProps {
    mode: 'create' | 'edit'
    initial?: Contrato | null
    usuarios: Usuario[]
    distritos: Distrito[]
    onClose: () => void
    onSaved: () => void
}

const EMPTY: CreateContratoPayload = {
    nroContrato: '', usuarioId: '', distritoId: '',
    direccion: '', nroMedidor: '', estado: 'activo',
}

const FormModal = ({ mode, initial, usuarios, distritos, onClose, onSaved }: FormModalProps) => {
    const [form, setForm] = useState<CreateContratoPayload>(
        initial
            ? {
                nroContrato: initial.nroContrato,
                usuarioId: initial.usuarioId,
                distritoId: initial.distritoId,
                direccion: initial.direccion,
                nroMedidor: initial.nroMedidor,
                latitud: initial.latitud ?? undefined,
                longitud: initial.longitud ?? undefined,
                estado: initial.estado,
            }
            : EMPTY
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const set = (k: keyof CreateContratoPayload, v: string) =>
        setForm(p => ({ ...p, [k]: v }))

    const validate = () => {
        if (!form.nroContrato.trim()) return 'El número de contrato es obligatorio.'
        if (!form.usuarioId) return 'Selecciona un usuario.'
        if (!form.distritoId) return 'Selecciona un distrito.'
        if (!form.direccion.trim()) return 'La dirección es obligatoria.'
        if (!form.nroMedidor.trim()) return 'El número de medidor es obligatorio.'
        return ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const err = validate()
        if (err) { setError(err); return }
        setLoading(true); setError('')
        try {
            if (mode === 'create') await createContrato(form)
            else if (initial) await updateContrato(initial.id, form)
            onSaved()
        } catch (e: any) {
            setError(e.message || 'Error al guardar.')
        } finally { setLoading(false) }
    }

    // Filtrar solo ciudadanos para asignar contratos
    const ciudadanos = usuarios.filter(u => u.role === 'ciudadano')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-900">
                        {mode === 'create' ? 'Nuevo Contrato' : 'Editar Contrato'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Nro contrato */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nº de Contrato *</label>
                        <input value={form.nroContrato} onChange={e => set('nroContrato', e.target.value)}
                            placeholder="Ej: CONT-2026-001"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" />
                    </div>

                    {/* Usuario */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Ciudadano titular *</label>
                        <select value={form.usuarioId} onChange={e => set('usuarioId', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white">
                            <option value="">— Seleccionar ciudadano —</option>
                            {ciudadanos.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                            ))}
                        </select>
                    </div>

                    {/* Distrito */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Distrito *</label>
                        <select value={form.distritoId} onChange={e => set('distritoId', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white">
                            <option value="">— Seleccionar distrito —</option>
                            {distritos.map(d => (
                                <option key={d.id} value={d.id}>{d.nombre} ({d.codigo})</option>
                            ))}
                        </select>
                    </div>

                    {/* Dirección */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Dirección *</label>
                        <input value={form.direccion} onChange={e => set('direccion', e.target.value)}
                            placeholder="Ej: Av. Heroínas #123, Zona Central"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" />
                    </div>

                    {/* Medidor */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nº de Medidor *</label>
                        <input value={form.nroMedidor} onChange={e => set('nroMedidor', e.target.value)}
                            placeholder="Ej: MED-00123456"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" />
                    </div>

                    {/* Estado (solo en edición) */}
                    {mode === 'edit' && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Estado del servicio</label>
                            <select value={form.estado} onChange={e => set('estado', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white">
                                <option value="activo">Activo</option>
                                <option value="suspendido">Suspendido</option>
                                <option value="cortado">Cortado</option>
                            </select>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">{error}</div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {mode === 'create' ? 'Crear Contrato' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Página principal ──────────────────────────────────────
const Contratos = () => {
    const [contratos, setContratos] = useState<Contrato[]>([])
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [distritos, setDistritos] = useState<Distrito[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const LIMIT = 15

    const [search, setSearch] = useState('')
    const [estadoFilter, setEstadoFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState<Contrato | null>(null)

    // Mapa usuario id → nombre para mostrar en tabla
    const usuarioMap = Object.fromEntries(usuarios.map(u => [u.id, u]))
    const distritoMap = Object.fromEntries(distritos.map(d => [d.id, d]))

    const fetchContratos = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const res = await getContratos({ estado: estadoFilter || undefined, page, limit: LIMIT })
            setContratos(res.data)
            setTotal(res.pagination.total)
        } catch (e: any) {
            setError(e.message || 'Error al cargar contratos.')
        } finally { setLoading(false) }
    }, [estadoFilter, page])

    useEffect(() => { fetchContratos() }, [fetchContratos])

    useEffect(() => {
        // Cargar usuarios y distritos para los selectores
        getUsuarios({ limit: 200 }).then(r => setUsuarios(r.data)).catch(() => { })
        getDistritos().then(setDistritos).catch(() => { })
    }, [])

    const filtered = contratos.filter(c =>
        c.nroContrato.toLowerCase().includes(search.toLowerCase()) ||
        c.nroMedidor.toLowerCase().includes(search.toLowerCase()) ||
        c.direccion.toLowerCase().includes(search.toLowerCase()) ||
        (usuarioMap[c.usuarioId]?.name ?? '').toLowerCase().includes(search.toLowerCase())
    )

    const totalPages = Math.ceil(total / LIMIT)

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Encabezado */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Contratos</h1>
                    </div>
                    <button
                        onClick={() => { setEditTarget(null); setShowForm(true) }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={20} /> Nuevo Contrato
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por contrato, medidor, dirección o titular..."
                            className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 transition-all" />
                    </div>
                    <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1) }}
                        className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-600/20">
                        <option value="">Todos los estados</option>
                        <option value="activo">Activo</option>
                        <option value="suspendido">Suspendido</option>
                        <option value="cortado">Cortado</option>
                    </select>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">{error}</div>
                )}

                {/* Tabla */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-blue-600" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <FileText size={40} className="mb-3 opacity-30" />
                            <p className="font-medium">No se encontraron contratos</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Contrato / Medidor</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Titular</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Dirección</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Distrito</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                    <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filtered.map(c => {
                                    const titular = usuarioMap[c.usuarioId]
                                    const distrito = distritoMap[c.distritoId]
                                    return (
                                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-black text-slate-900">{c.nroContrato}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Hash size={11} />{c.nroMedidor}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                {titular ? (
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{titular.name}</p>
                                                        <p className="text-xs text-slate-500">{titular.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Sin asignar</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600 flex items-center gap-1.5">
                                                    <MapPin size={13} className="text-slate-400 shrink-0" />
                                                    <span className="truncate max-w-[180px]">{c.direccion}</span>
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                                {distrito?.nombre ?? '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${ESTADO_STYLES[c.estado]}`}>
                                                    {ESTADO_ICONS[c.estado]}
                                                    {c.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => { setEditTarget(c); setShowForm(true) }}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Editar contrato"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
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
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Mostrando {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} de {total} contratos
                        </p>
                        <div className="flex gap-2">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                Anterior
                            </button>
                            <span className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold">{page} / {totalPages}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showForm && (
                <FormModal
                    mode={editTarget ? 'edit' : 'create'}
                    initial={editTarget}
                    usuarios={usuarios}
                    distritos={distritos}
                    onClose={() => { setShowForm(false); setEditTarget(null) }}
                    onSaved={() => { setShowForm(false); setEditTarget(null); fetchContratos() }}
                />
            )}
        </AdminLayout>
    )
}

export default Contratos
