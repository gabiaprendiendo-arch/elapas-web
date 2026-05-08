import { useState, useEffect } from 'react'
import PortalLayout from '@/components/ui/PortalLayout'
import { getMisPagos, type Pago } from '@/services/service-portal'
import {
    CreditCard, Loader2, QrCode, Banknote,
    ArrowLeftRight, CheckCircle2, TrendingUp
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// ── helpers ───────────────────────────────────────────────
const formatBs = (v: string | number) =>
    `Bs ${Number(v).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`

const formatFecha = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })

const METODO_STYLES: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    qr_simple: {
        label: 'QR Simple',
        cls: 'bg-violet-50 text-violet-700 border border-violet-200',
        icon: <QrCode size={12} />,
    },
    efectivo: {
        label: 'Efectivo',
        cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        icon: <Banknote size={12} />,
    },
    transferencia: {
        label: 'Transferencia',
        cls: 'bg-blue-50 text-blue-700 border border-blue-200',
        icon: <ArrowLeftRight size={12} />,
    },
}

const CHART_COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444']

// ── Página de pagos ───────────────────────────────────────
const PortalPagos = () => {
    const [pagos, setPagos] = useState<Pago[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetch = async () => {
            setLoading(true)
            setError('')
            try {
                const data = await getMisPagos()
                setPagos(data)
            } catch (e: any) {
                setError(e.message || 'Error al cargar pagos.')
            } finally {
                setLoading(false)
            }
        }
        fetch()
    }, [])

    const totalPagado = pagos.reduce((acc, p) => acc + Number(p.monto), 0)

    // Agrupar por mes para el gráfico
    const porMes = pagos.reduce<Record<string, number>>((acc, p) => {
        const mes = new Date(p.fechaPago).toLocaleDateString('es-BO', { month: 'short', year: '2-digit' })
        acc[mes] = (acc[mes] ?? 0) + Number(p.monto)
        return acc
    }, {})
    const chartData = Object.entries(porMes)
        .map(([mes, total]) => ({ mes, total }))
        .slice(-6) // últimos 6 meses

    // Agrupar por método
    const porMetodo = pagos.reduce<Record<string, number>>((acc, p) => {
        acc[p.metodoPago] = (acc[p.metodoPago] ?? 0) + 1
        return acc
    }, {})

    return (
        <PortalLayout>
            <div className="space-y-6">
                {/* Encabezado */}
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Mis Pagos</h1>
                    <p className="text-slate-500 text-sm mt-1">Historial completo de todos tus pagos realizados.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 size={32} className="animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">{error}</div>
                ) : (
                    <>
                        {/* Tarjetas resumen */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <TrendingUp size={18} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total pagado</p>
                                </div>
                                <p className="text-xl font-black text-emerald-700">{formatBs(totalPagado)}</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                        <CheckCircle2 size={18} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pagos realizados</p>
                                </div>
                                <p className="text-2xl font-black text-slate-900">{pagos.length}</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                                        <CreditCard size={18} />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Métodos usados</p>
                                </div>
                                <div className="flex gap-2 flex-wrap mt-1">
                                    {Object.entries(porMetodo).map(([m, count]) => {
                                        const info = METODO_STYLES[m]
                                        return (
                                            <span key={m} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${info?.cls ?? ''}`}>
                                                {info?.icon}{info?.label ?? m} ({count})
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Gráfico de pagos por mes */}
                        {chartData.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                                <h2 className="text-base font-black text-slate-900 mb-5">Pagos por mes</h2>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: '#94a3b8' }}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={v => `Bs ${v}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                            formatter={(v) => [formatBs(v as number), 'Pagado']}
                                        />
                                        <Bar dataKey="total" radius={[8, 8, 0, 0]} maxBarSize={60}>
                                            {chartData.map((_, i) => (
                                                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Lista de pagos */}
                        {pagos.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center text-slate-400">
                                <CreditCard size={36} className="mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No tienes pagos registrados aún</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100">
                                    <h2 className="text-base font-black text-slate-900">Historial de pagos</h2>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {pagos.map(p => {
                                        const metodo = METODO_STYLES[p.metodoPago]
                                        return (
                                            <div key={p.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                                        <CheckCircle2 size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="text-sm font-bold text-slate-900">
                                                                Pago #{p.id.slice(0, 8).toUpperCase()}
                                                            </p>
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${metodo?.cls ?? ''}`}>
                                                                {metodo?.icon}{metodo?.label ?? p.metodoPago}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-0.5">
                                                            {formatFecha(p.fechaPago)}
                                                            {p.referencia && ` · Ref: ${p.referencia}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-base font-black text-emerald-700 shrink-0">
                                                    {formatBs(p.monto)}
                                                </p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PortalLayout>
    )
}

export default PortalPagos
