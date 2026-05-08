import { useState, useEffect } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts'
import { DollarSign, Loader2, TrendingUp, MapPin, Activity } from 'lucide-react'
import { getResumenDiario, getRecaudacionPorDistrito, type ResumenDiario, type RecaudacionPorDistrito } from '@/services/service-reportes'

const DISTRICT_COLORS: Record<string, string> = {
    'Distrito 1': '#3B82F6',
    'Distrito 2': '#06B6D4',
    'Distrito 3': '#8B5CF6',
    'Distrito 4': '#10B981',
    'Distrito 5': '#F59E0B',
}
const FALLBACK_COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']

const formatBs = (val: string | number) =>
    `Bs ${Number(val).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-4 min-w-[160px]">
                <p className="text-xs font-bold text-slate-500 mb-2">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="text-sm font-black" style={{ color: p.fill }}>
                        {formatBs(p.value)}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

const Recaudacion = () => {
    const [resumen, setResumen] = useState<ResumenDiario | null>(null)
    const [porDistrito, setPorDistrito] = useState<RecaudacionPorDistrito[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true)
            setError('')
            try {
                const [res, dist] = await Promise.all([
                    getResumenDiario(),
                    getRecaudacionPorDistrito(),
                ])
                setResumen(res)
                setPorDistrito(dist)
            } catch (e: any) {
                setError(e.message || 'Error al cargar datos de recaudación.')
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    const totalRecaudado = porDistrito.reduce((acc, d) => acc + Number(d.total), 0)

    const chartData = porDistrito.map(d => ({
        nombre: d.distrito,
        total: Number(d.total),
    }))

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Encabezado */}
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Recaudación</h1>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 size={36} className="animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">{error}</div>
                ) : (
                    <>
                        {/* Tarjetas resumen del día */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <DollarSign size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recaudación Hoy</p>
                                    <p className="text-xl font-black text-emerald-700">{formatBs(resumen?.recaudacionHoy ?? 0)}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Activity size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lecturas Hoy</p>
                                    <p className="text-2xl font-black text-slate-900">{resumen?.lecturasHoy ?? 0}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                                    <TrendingUp size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cortes Hoy</p>
                                    <p className="text-2xl font-black text-slate-900">{resumen?.cortesHoy ?? 0}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                                    <MapPin size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contratos Activos</p>
                                    <p className="text-2xl font-black text-slate-900">{resumen?.contratosActivos ?? 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Gráfico principal de barras por distrito */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">Recaudación por Distrito</h2>
                                    <p className="text-sm text-slate-500 mt-0.5">Total acumulado: <span className="font-bold text-emerald-700">{formatBs(totalRecaudado)}</span></p>
                                </div>
                            </div>
                            {chartData.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                    <DollarSign size={40} className="mb-3 opacity-30" />
                                    <p className="text-sm">Sin datos de recaudación disponibles</p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={320}>
                                    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis
                                            dataKey="nombre"
                                            tick={{ fontSize: 13, fill: '#475569', fontWeight: 600 }}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={v => `Bs ${(v / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Bar dataKey="total" radius={[10, 10, 0, 0]} maxBarSize={80}>
                                            {chartData.map((entry, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={DISTRICT_COLORS[entry.nombre] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>

                        {/* Tabla de desglose por distrito */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-8 py-5 border-b border-slate-100">
                                <h2 className="text-base font-black text-slate-900">Desglose por Distrito</h2>
                            </div>
                            {porDistrito.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <MapPin size={36} className="mb-2 opacity-30" />
                                    <p className="text-sm">Sin datos disponibles</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Distrito</th>
                                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Recaudación Total</th>
                                            <th className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">% del Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {porDistrito.map((d, i) => {
                                            const pct = totalRecaudado > 0 ? (Number(d.total) / totalRecaudado) * 100 : 0
                                            const color = DISTRICT_COLORS[d.distrito] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]
                                            return (
                                                <tr key={d.distrito} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                                                            <span className="text-sm font-bold text-slate-900">{d.distrito}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <span className="text-sm font-black text-emerald-700">{formatBs(d.total)}</span>
                                                    </td>
                                                    <td className="px-8 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 bg-slate-100 rounded-full h-2 max-w-[120px]">
                                                                <div
                                                                    className="h-2 rounded-full transition-all"
                                                                    style={{ width: `${pct}%`, backgroundColor: color }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-bold text-slate-600">{pct.toFixed(1)}%</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    )
}

export default Recaudacion
