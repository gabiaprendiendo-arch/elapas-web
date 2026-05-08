import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Loader2, Search, RefreshCw } from 'lucide-react'
import { getLecturas, getLecturasPorBrigadista, type Lectura, type LecturasPorBrigadista } from '@/services/service-lecturas'

const COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']

const fmt = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })

const monthStart = () => { const d = new Date(); d.setDate(1); return d.toISOString().split('T')[0] }
const todayStr = () => new Date().toISOString().split('T')[0]

const Lecturas = () => {
    const [fechaInicio, setFechaInicio] = useState(monthStart())
    const [fechaFin, setFechaFin] = useState(todayStr())
    const [search, setSearch] = useState('')

    const [lecturas, setLecturas] = useState<Lectura[]>([])
    const [porBrigadista, setPorBrigadista] = useState<LecturasPorBrigadista[]>([])
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [loadingChart, setLoadingChart] = useState(false)
    const [error, setError] = useState('')

    const fetchLecturas = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const res = await getLecturas({ fechaInicio, fechaFin, page, limit: 20 })
            setLecturas(res.data)
            setPagination(res.pagination)
        } catch (e: any) {
            setError(e.message || 'Error al cargar lecturas.')
        } finally { setLoading(false) }
    }, [fechaInicio, fechaFin, page])

    const fetchChart = useCallback(async () => {
        setLoadingChart(true)
        try {
            const data = await getLecturasPorBrigadista({ fechaInicio, fechaFin })
            setPorBrigadista(data)
        } catch { }
        finally { setLoadingChart(false) }
    }, [fechaInicio, fechaFin])

    useEffect(() => { fetchLecturas() }, [fetchLecturas])
    useEffect(() => { fetchChart() }, [fetchChart])

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault(); setPage(1); fetchLecturas(); fetchChart()
    }

    const filtered = lecturas.filter(l =>
        l.contratoId.includes(search) ||
        l.brigadistaId.includes(search) ||
        String(l.valorLectura).includes(search)
    )

    const totalPages = Math.ceil(pagination.total / pagination.limit)

    return (
        <AdminLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Lecturas</h1>
                        <p className="text-sm text-slate-400 mt-0.5">{pagination.total} registros en el período</p>
                    </div>
                    <button onClick={() => { fetchLecturas(); fetchChart() }}
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
                    <button type="submit"
                        className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all">
                        Filtrar
                    </button>
                </form>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total lecturas', value: pagination.total, color: 'text-slate-900' },
                        { label: 'Brigadistas', value: porBrigadista.length, color: 'text-blue-600' },
                        { label: 'Esta página', value: filtered.length, color: 'text-slate-600' },
                    ].map(s => (
                        <div key={s.label} className="bg-white border border-slate-100 rounded-xl p-4">
                            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
                            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Gráfico */}
                {(loadingChart || porBrigadista.length > 0) && (
                    <div className="bg-white border border-slate-100 rounded-xl p-5">
                        <p className="text-sm font-semibold text-slate-700 mb-4">Lecturas por brigadista</p>
                        {loadingChart ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 size={24} className="animate-spin text-slate-300" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={porBrigadista} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                                    <XAxis dataKey="brigadistaNombre" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                                        formatter={(v) => [v, 'lecturas']}
                                    />
                                    <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={48}>
                                        {porBrigadista.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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

                {/* Buscador + tabla */}
                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                        <Search size={15} className="text-slate-400 shrink-0" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por contrato, brigadista o valor..."
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
                            No hay lecturas para los filtros aplicados
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Contrato</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Brigadista</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Valor</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((l, i) => (
                                    <tr key={l.id} className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                {l.contratoId.slice(0, 8)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                {l.brigadistaId.slice(0, 8)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="font-semibold text-blue-700">{l.valorLectura}</span>
                                            <span className="text-slate-400 text-xs ml-1">m³</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{fmt(l.fechaLectura)}</td>
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
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                ←
                            </button>
                            <span className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">{page}</span>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">
                                →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

export default Lecturas
