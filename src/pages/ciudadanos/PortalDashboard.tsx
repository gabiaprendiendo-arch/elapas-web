import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import PortalLayout from '@/components/ui/PortalLayout'
import {
    getMisContratos, getMisFacturas, getMisPagos,
    type ContratoPortal, type FacturaPortal, type PagoPortal
} from '@/services/service-portal'
import {
    Droplets, FileText, AlertTriangle, CheckCircle2,
    Clock, Loader2, ChevronRight, MapPin, Gauge, Zap, DollarSign
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const bs = (v: string | number) =>
    `Bs ${Number(v).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`

const fecha = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })

const ESTADO_CONTRATO: Record<string, { dot: string; label: string; text: string }> = {
    activo:     { dot: 'bg-emerald-500', label: 'Activo',     text: 'text-emerald-700' },
    suspendido: { dot: 'bg-amber-400',   label: 'Suspendido', text: 'text-amber-700'   },
    cortado:    { dot: 'bg-red-500',     label: 'Cortado',    text: 'text-red-600'     },
}

const ESTADO_FACTURA: Record<string, { icon: React.ReactNode; cls: string }> = {
    pendiente: { icon: <Clock size={10} />,         cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    vencida:   { icon: <AlertTriangle size={10} />, cls: 'bg-red-50 text-red-600 border-red-200'       },
    pagada:    { icon: <CheckCircle2 size={10} />,  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

const PortalDashboard = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    const [contratos, setContratos] = useState<ContratoPortal[]>([])
    const [facturas, setFacturas] = useState<FacturaPortal[]>([])
    const [pagos, setPagos] = useState<PagoPortal[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([getMisContratos(), getMisFacturas(), getMisPagos()])
            .then(([c, f, p]) => { setContratos(c); setFacturas(f); setPagos(p) })
            .catch((e: any) => setError(e.message || 'Error al cargar datos.'))
            .finally(() => setLoading(false))
    }, [])

    // Calcular métricas
    const facturasPendientes = facturas.filter(f => f.estado === 'pendiente' || f.estado === 'vencida')
    const deudaTotal = facturasPendientes.reduce((acc, f) => acc + Number(f.total), 0)
    const ultimaFactura = facturas[0]

    // Gráfico: consumo por período (todas las facturas ordenadas)
    const chartData = [...facturas]
        .sort((a, b) => a.periodo.localeCompare(b.periodo))
        .slice(-6)
        .map(f => ({ periodo: f.periodo, consumo: f.consumoM3 }))

    const hora = new Date().getHours()
    const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

    return (
        <PortalLayout>
            <div className="space-y-6 max-w-2xl">

                {/* Saludo */}
                <div>
                    <h1 className="text-xl font-bold text-slate-900">
                        <span>{saludo}, {user?.name?.split(' ')[0] ?? 'Usuario'}</span>
                    </h1>
                    <p className="text-sm text-slate-400 mt-0.5">Resumen de tu cuenta de agua potable</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 size={28} className="animate-spin text-slate-300" />
                    </div>
                ) : error ? (
                    <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
                ) : (
                    <>
                        {/* Alerta deuda */}
                        {deudaTotal > 0 && (
                            <div className="flex items-center justify-between gap-4 px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={16} className="text-red-500 shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-700">
                                            {facturasPendientes.length} factura{facturasPendientes.length > 1 ? 's' : ''} pendiente{facturasPendientes.length > 1 ? 's' : ''}
                                        </p>
                                        <p className="text-xs text-red-500">Deuda total: {bs(deudaTotal)}</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/portal/facturas')}
                                    className="shrink-0 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-all">
                                    Pagar
                                </button>
                            </div>
                        )}

                        {/* Métricas */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`rounded-xl border p-4 ${deudaTotal > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign size={14} className={deudaTotal > 0 ? 'text-red-400' : 'text-emerald-500'} />
                                    <span className="text-xs text-slate-400">Deuda actual</span>
                                </div>
                                <p className={`text-xl font-bold ${deudaTotal > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    {bs(deudaTotal)}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {deudaTotal > 0 ? `${facturasPendientes.length} sin pagar` : 'Al día ✓'}
                                </p>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Droplets size={14} className="text-blue-500" />
                                    <span className="text-xs text-slate-400">Último consumo</span>
                                </div>
                                <p className="text-xl font-bold text-slate-900">
                                    {ultimaFactura?.consumoM3 ?? 0}
                                    <span className="text-sm font-normal text-slate-400 ml-1">m³</span>
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {ultimaFactura?.periodo ?? 'Sin datos'}
                                </p>
                            </div>
                        </div>

                        {/* Mis contratos */}
                        {contratos.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mis contratos</p>
                                {contratos.map(c => {
                                    const est = ESTADO_CONTRATO[c.contrato.estado] ?? ESTADO_CONTRATO.activo
                                    return (
                                        <div key={c.contrato.id} className="bg-white border border-slate-100 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Gauge size={15} className="text-slate-400" />
                                                    <span className="text-sm font-semibold text-slate-800">{c.contrato.nroContrato}</span>
                                                </div>
                                                <span className={`flex items-center gap-1.5 text-xs font-medium ${est.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${est.dot}`} />
                                                    {est.label}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                                                    <MapPin size={11} className="text-slate-300" />
                                                    {c.predio.direccion}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    Medidor: <span className="font-mono">{c.medidor.nroMedidor}</span>
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Facturas pendientes */}
                        {facturasPendientes.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Por pagar</p>
                                {facturasPendientes.map(f => {
                                    const est = ESTADO_FACTURA[f.estado] ?? ESTADO_FACTURA.pendiente
                                    return (
                                        <div key={f.id} className="bg-white border border-slate-100 rounded-xl p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${f.estado === 'vencida' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>
                                                        <FileText size={15} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-slate-800"><span>Período {f.periodo}</span></span>
                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${est.cls}`}>
                                                                {est.icon}{f.estado}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-400 mt-0.5">
                                                            Vence {fecha(f.fechaVencimiento)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-base font-bold text-slate-900 shrink-0">{bs(f.total)}</span>
                                            </div>

                                            {/* Desglose */}
                                            <div className="mt-3 grid grid-cols-3 gap-2 bg-slate-50 rounded-lg p-2.5">
                                                <div>
                                                    <p className="text-[10px] text-slate-400">Consumo</p>
                                                    <p className="text-xs font-semibold text-slate-700"><span>{f.consumoM3} m³</span></p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400">Cargo fijo</p>
                                                    <p className="text-xs font-semibold text-slate-700">{bs(f.cargoFijo ?? 0)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-400">Total</p>
                                                    <p className="text-xs font-semibold text-blue-700">{bs(f.total)}</p>
                                                </div>
                                            </div>

                                            <button onClick={() => navigate('/portal/facturas')}
                                                className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5">
                                                <Zap size={13} /> Pagar {bs(f.total)}
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Gráfico consumo */}
                        {chartData.length > 1 && (
                            <div className="bg-white border border-slate-100 rounded-xl p-4">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Historial de consumo</p>
                                <ResponsiveContainer width="100%" height={160}>
                                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.12} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="periodo" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                        <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 11 }}
                                            formatter={(v) => [`${v} m³`, 'Consumo']}
                                        />
                                        <Area type="monotone" dataKey="consumo" stroke="#3B82F6" strokeWidth={2}
                                            fill="url(#grad)" dot={{ fill: '#3B82F6', r: 3 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Últimos pagos */}
                        {pagos.length > 0 && (
                            <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Últimos pagos</p>
                                    <button onClick={() => navigate('/portal/pagos')}
                                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
                                        Ver todos <ChevronRight size={12} />
                                    </button>
                                </div>
                                {pagos.slice(0, 3).map(p => (
                                    <div key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                                            <span className="text-sm text-slate-600">{fecha(p.fechaPago)}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-emerald-700">{bs(p.monto)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Al día */}
                        {deudaTotal === 0 && contratos.length > 0 && (
                            <div className="flex items-center gap-3 px-4 py-3.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-emerald-800">¡Estás al día!</p>
                                    <p className="text-xs text-emerald-600">No tienes facturas pendientes.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </PortalLayout>
    )
}

export default PortalDashboard
