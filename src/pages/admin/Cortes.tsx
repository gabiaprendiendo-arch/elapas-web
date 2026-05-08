import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Loader2, Search, RefreshCw, ImageOff, X, ZoomIn } from 'lucide-react'
import { getCortes, getCortesPorDistrito, type CortesPorDistrito } from '@/services/service-cortes'
import { getDistritos, type Distrito } from '@/services/service-distritos'

// El backend sirve /uploads directamente en la raíz (sin /api)
const MEDIA_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') ?? 'http://localhost:3000'

const buildUrl = (path: string | null | undefined): string | null => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `${MEDIA_BASE}${path}`
}

interface CorteRow {
    corte: {
        id: string
        contratoId: string
        brigadistaId: string
        motivo: string
        fotoUrl: string | null
        fechaCorte: string
        estado: 'efectuado' | 'reconectado'
        createdAt: string
    }
    contrato: {
        id: string
        nroContrato: string
        nroMedidor: string
        direccion: string
        distritoId: string
        estado: string
    }
}

const COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B']

const fmt = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })

const ESTADO_BADGE: Record<string, string> = {
    efectuado:   'bg-red-50 text-red-600 border border-red-100',
    reconectado: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
}

// ── Miniatura con modal ───────────────────────────────────
const FotoCell = ({ url }: { url: string | null | undefined }) => {
    const [open, setOpen] = useState(false)
    const src = buildUrl(url)

    if (!src) {
        return (
            <span className="inline-flex items-center gap-1 text-slate-300 text-xs">
                <ImageOff size={13} /> Sin foto
            </span>
        )
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="group relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 transition-all"
                title="Ver foto"
            >
                <img src={src} alt="Foto corte" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <ZoomIn size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={() => setOpen(false)}
                >
                    <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute -top-3 -right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-slate-100 transition-all"
                        >
                            <X size={16} className="text-slate-700" />
                        </button>
                        <img
                            src={src}
                            alt="Foto corte"
                            className="w-full rounded-2xl shadow-2xl object-contain max-h-[80vh]"
                        />
                    </div>
                </div>
            )}
        </>
    )
}

const Cortes = () => {
    const [fechaInicio, setFechaInicio] = useState('')
    const [fechaFin, setFechaFin] = useState('')
    const [distritoId, setDistritoId] = useState('')
    const [search, setSearch] = useState('')

    const [rows, setRows] = useState<CorteRow[]>([])
    const [porDistrito, setPorDistrito] = useState<CortesPorDistrito[]>([])
    const [distritos, setDistritos] = useState<Distrito[]>([])
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [loadingChart, setLoadingChart] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { getDistritos().then(setDistritos).catch(() => { }) }, [])

    const fetchCortes = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const res = await getCortes({ distritoId: distritoId || undefined, fechaInicio, fechaFin, page, limit: 20 })
            setRows(res.data as unknown as CorteRow[])
            setPagination(res.pagination)
        } catch (e: any) {
            setError(e.message || 'Error al cargar cortes.')
        } finally { setLoading(false) }
    }, [distritoId, fechaInicio, fechaFin, page])

    const fetchChart = useCallback(async () => {
        setLoadingChart(true)
        try { setPorDistrito(await getCortesPorDistrito()) }
        catch { }
        finally { setLoadingChart(false) }
    }, [])

    useEffect(() => { fetchCortes() }, [fetchCortes])
    useEffect(() => { fetchChart() }, [fetchChart])

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault(); setPage(1); fetchCortes()
    }

    const filtered = rows.filter(r =>
        r.corte.motivo.toLowerCase().includes(search.toLowerCase()) ||
        r.contrato.nroContrato.toLowerCase().includes(search.toLowerCase()) ||
        r.contrato.direccion.toLowerCase().includes(search.toLowerCase())
    )

    const efectuados  = rows.filter(r => r.corte.estado === 'efectuado').length
    const reconectados = rows.filter(r => r.corte.estado === 'reconectado').length
    const totalPages  = Math.ceil(pagination.total / pagination.limit)

    return (
        <AdminLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Cortes de Servicio</h1>
                        <p className="text-sm text-slate-400 mt-0.5"><span>{pagination.total} registros en el período</span></p>
                    </div>
                    <button onClick={() => { fetchCortes(); fetchChart() }}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
                        <RefreshCw size={15} /> Actualizar
                    </button>
                </div>

                {/* Filtros */}
                <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500 font-medium">Desde</label>
                        <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all bg-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500 font-medium">Hasta</label>
                        <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all bg-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500 font-medium">Distrito</label>
                        <select value={distritoId} onChange={e => setDistritoId(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all bg-white min-w-36">
                            <option value="">Todos</option>
                            {distritos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                        </select>
                    </div>
                    <button type="submit"
                        className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all">
                        Filtrar
                    </button>
                </form>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-100 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">Total cortes</p>
                        <p className="text-2xl font-bold text-slate-900">{pagination.total}</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">Efectuados</p>
                        <p className="text-2xl font-bold text-red-600">{efectuados}</p>
                    </div>
                    <div className="bg-white border border-slate-100 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">Reconectados</p>
                        <p className="text-2xl font-bold text-emerald-600">{reconectados}</p>
                    </div>
                </div>

                {/* Gráfico */}
                {(loadingChart || porDistrito.length > 0) && (
                    <div className="bg-white border border-slate-100 rounded-xl p-5">
                        <p className="text-sm font-semibold text-slate-700 mb-4">Cortes por distrito</p>
                        {loadingChart ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 size={24} className="animate-spin text-slate-300" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={porDistrito} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                                    <XAxis dataKey="distrito" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                                        formatter={(v) => [v, 'cortes']}
                                    />
                                    <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} maxBarSize={48}>
                                        {porDistrito.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
                )}

                {/* Tabla */}
                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                        <Search size={15} className="text-slate-400 shrink-0" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por contrato, dirección o motivo..."
                            className="flex-1 text-sm outline-none text-slate-700 placeholder:text-slate-400"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-slate-600">
                                Limpiar
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 size={24} className="animate-spin text-slate-300" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 text-sm">
                            No hay cortes para los filtros aplicados
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Foto</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Contrato</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Dirección</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Motivo</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Estado</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r, i) => (
                                    <tr key={r.corte.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                                        <td className="px-4 py-3">
                                            <FotoCell url={r.corte.fotoUrl} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-800">{r.contrato.nroContrato}</p>
                                            <p className="text-xs text-slate-400 font-mono">{r.contrato.nroMedidor}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 max-w-44 truncate">{r.contrato.direccion}</td>
                                        <td className="px-4 py-3 text-slate-600 max-w-44 truncate">{r.corte.motivo}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${ESTADO_BADGE[r.corte.estado]}`}>
                                                {r.corte.estado}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{fmt(r.corte.fechaCorte)}</td>
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
                            {((page - 1) * 20) + 1}–{Math.min(page * 20, pagination.total)} de {pagination.total}
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
        </AdminLayout>
    )
}

export default Cortes
