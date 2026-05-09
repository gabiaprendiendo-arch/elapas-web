import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import { Plus, Search, Edit2, X, Loader2, MapPin, Hash, CheckCircle2, AlertTriangle, Clock, FileText } from 'lucide-react'
import { getContratos, createContrato, updateContrato } from '@/services/service-contratos'
import type { Contrato, ContratoCreate } from '@/schemas/contrato'
import { getUsuarios } from '@/services/service-user'
import type { User } from '@/schemas/user'
import { getDistritos } from '@/services/service-distritos'
import type { Distrito } from '@/schemas/distritos'
import { getPredios } from '@/services/service-predios'
import type { Predio } from '@/schemas/predios'
import { getMedidores } from '@/services/service-medidores'
import type { Medidor } from '@/schemas/medidores'

const ESTADO_STYLES: Record<string, string> = {
    activo:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
    suspendido:'bg-amber-50 text-amber-700 border border-amber-200',
    cortado:   'bg-red-50 text-red-600 border border-red-200',
}
const ESTADO_ICONS: Record<string, React.ReactNode> = {
    activo:    <CheckCircle2 size={11} />,
    suspendido:<Clock size={11} />,
    cortado:   <AlertTriangle size={11} />,
}

// ── Modal formulario ──────────────────────────────────────
interface FormModalProps {
    mode: 'create' | 'edit'
    initial?: Contrato | null
    usuarios: User[]
    distritos: Distrito[]
    predios: Predio[]
    medidores: Medidor[]
    onClose: () => void
    onSaved: () => void
}

const EMPTY: ContratoCreate = {
    nroContrato: '',
    usuarioId: '',
    predioId: '',
    medidorId: '',
}

const FormModal = ({ mode, initial, usuarios, distritos, predios, medidores, onClose, onSaved }: FormModalProps) => {
    const [form, setForm] = useState<ContratoCreate>(
        initial
            ? {
                nroContrato: initial.contrato.nroContrato,
                usuarioId:   initial.contrato.usuarioId,
                predioId:    initial.contrato.predioId,
                medidorId:   initial.contrato.medidorId,
                estado:      initial.contrato.estado,
            }
            : EMPTY
    )
    // Filtrar predios por distrito seleccionado
    const [distritoFiltro, setDistritoFiltro] = useState(() => {
        if (!initial) return ''
        const predio = predios.find(p => p.id === initial.contrato.predioId)
        return predio?.distritoId ?? ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const set = (k: keyof ContratoCreate, v: string) =>
        setForm((p: ContratoCreate) => ({ ...p, [k]: v }))

    const prediosFiltrados = distritoFiltro
        ? predios.filter(p => p.distritoId === distritoFiltro)
        : predios

    const validate = () => {
        if (!form.nroContrato.trim()) return 'El número de contrato es obligatorio.'
        if (!form.usuarioId)          return 'Selecciona un ciudadano.'
        if (!form.predioId)           return 'Selecciona un predio.'
        if (!form.medidorId)          return 'Selecciona un medidor.'
        return ''
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const err = validate()
        if (err) { setError(err); return }
        setLoading(true); setError('')
        try {
            if (mode === 'create') await createContrato(form)
            else if (initial) await updateContrato(initial.contrato.id, form)
            onSaved()
        } catch (e: any) {
            setError(e.message || 'Error al guardar.')
        } finally { setLoading(false) }
    }

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
                    {/* Nº Contrato */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nº de Contrato *</label>
                        <input value={form.nroContrato} onChange={e => set('nroContrato', e.target.value)}
                            placeholder="Ej: CNT-2026-001"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" />
                    </div>

                    {/* Ciudadano */}
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

                    {/* Distrito (filtro para predios) */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Filtrar por distrito</label>
                        <select
                            value={distritoFiltro}
                            onChange={e => { setDistritoFiltro(e.target.value); set('predioId', '') }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white">
                            <option value="">— Todos los distritos —</option>
                            {distritos.map(d => (
                                <option key={d.id} value={d.id}>{d.nombre} ({d.codigo})</option>
                            ))}
                        </select>
                    </div>

                    {/* Predio */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Predio *</label>
                        <select value={form.predioId} onChange={e => set('predioId', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white">
                            <option value="">— Seleccionar predio —</option>
                            {prediosFiltrados.map(p => (
                                <option key={p.id} value={p.id}>{p.direccion}</option>
                            ))}
                        </select>
                        {prediosFiltrados.length === 0 && distritoFiltro && (
                            <p className="text-xs text-slate-400 mt-1">No hay predios en este distrito.</p>
                        )}
                    </div>

                    {/* Medidor */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Medidor *</label>
                        <select value={form.medidorId} onChange={e => set('medidorId', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm bg-white">
                            <option value="">— Seleccionar medidor —</option>
                            {medidores.map(m => (
                                <option key={m.id} value={m.id}>{m.nroMedidor}</option>
                            ))}
                        </select>
                    </div>

                    {/* Estado (solo edición) */}
                    {mode === 'edit' && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Estado</label>
                            <select value={form.estado ?? 'activo'} onChange={e => set('estado', e.target.value)}
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
                            {mode === 'create' ? 'Crear' : 'Guardar'}
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
    const [usuarios, setUsuarios] = useState<User[]>([])
    const [distritos, setDistritos] = useState<Distrito[]>([])
    const [predios, setPredios] = useState<Predio[]>([])
    const [medidores, setMedidores] = useState<Medidor[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const LIMIT = 15

    const [search, setSearch] = useState('')
    const [estadoFilter, setEstadoFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState<Contrato | null>(null)

    // Mapas para lookup rápido
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
        getUsuarios({ limit: 200 }).then(r => setUsuarios(r.data)).catch(() => { })
        getDistritos().then(setDistritos).catch(() => { })
        getPredios({ limit: 500 }).then(r => setPredios(r.data)).catch(() => { })
        getMedidores({ limit: 500 }).then(r => setMedidores(r.data)).catch(() => { })
    }, [])

    // Acceso correcto a la estructura anidada { contrato, predio, medidor }
    const filtered = contratos.filter(c => {
        const q = search.toLowerCase()
        return (
            (c.contrato.nroContrato ?? '').toLowerCase().includes(q) ||
            (c.medidor.nroMedidor ?? '').toLowerCase().includes(q) ||
            (c.predio.direccion ?? '').toLowerCase().includes(q) ||
            (usuarioMap[c.contrato.usuarioId]?.name ?? '').toLowerCase().includes(q)
        )
    })

    const totalPages = Math.ceil(total / LIMIT)

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Encabezado */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Contratos</h1>
                        <p className="text-sm text-slate-400 mt-0.5"><span>{total} contratos registrados</span></p>
                    </div>
                    <button
                        onClick={() => { setEditTarget(null); setShowForm(true) }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all text-sm active:scale-95">
                        <Plus size={18} /> Nuevo Contrato
                    </button>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por contrato, medidor, dirección o titular..."
                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all" />
                    </div>
                    <select value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setPage(1) }}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100">
                        <option value="">Todos los estados</option>
                        <option value="activo">Activo</option>
                        <option value="suspendido">Suspendido</option>
                        <option value="cortado">Cortado</option>
                    </select>
                </div>

                {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
                )}

                {/* Tabla */}
                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={28} className="animate-spin text-slate-300" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <FileText size={36} className="mb-3 opacity-30" />
                            <p className="text-sm">No se encontraron contratos</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Contrato</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Titular</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Dirección</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Medidor</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Distrito</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Estado</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((c, i) => {
                                    const titular = usuarioMap[c.contrato.usuarioId]
                                    const distrito = distritoMap[c.predio.distritoId]
                                    return (
                                        <tr key={c.contrato.id}
                                            className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                                            <td className="px-5 py-3.5">
                                                <p className="font-semibold text-slate-800">{c.contrato.nroContrato}</p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                {titular ? (
                                                    <div>
                                                        <p className="font-medium text-slate-800">{titular.name}</p>
                                                        <p className="text-xs text-slate-400">{titular.email}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">Sin asignar</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <p className="text-slate-600 flex items-center gap-1.5 max-w-44 truncate">
                                                    <MapPin size={12} className="text-slate-300 shrink-0" />
                                                    {c.predio.direccion}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                                                    <Hash size={10} />{c.medidor.nroMedidor}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600 text-xs">
                                                {distrito?.nombre ?? '—'}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${ESTADO_STYLES[c.contrato.estado]}`}>
                                                    {ESTADO_ICONS[c.contrato.estado]}
                                                    {c.contrato.estado}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <button
                                                    onClick={() => { setEditTarget(c); setShowForm(true) }}
                                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="Editar">
                                                    <Edit2 size={15} />
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
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">
                            {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} de {total}
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

            {showForm && (
                <FormModal
                    mode={editTarget ? 'edit' : 'create'}
                    initial={editTarget}
                    usuarios={usuarios}
                    distritos={distritos}
                    predios={predios}
                    medidores={medidores}
                    onClose={() => { setShowForm(false); setEditTarget(null) }}
                    onSaved={() => { setShowForm(false); setEditTarget(null); fetchContratos() }}
                />
            )}
        </AdminLayout>
    )
}

export default Contratos
