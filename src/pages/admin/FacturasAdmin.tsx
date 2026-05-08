import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import {
    FileText, Loader2, AlertTriangle, CheckCircle2,
    Clock, Zap, X, Search, Users, DollarSign, Calendar
} from 'lucide-react'
import {
    getMorosos, generarFacturas, getFacturasAdmin,
    type Moroso
} from '@/services/service-contratos'
import { getDistritos, type Distrito } from '@/services/service-distritos'

const formatBs = (v: string | number) =>
    `Bs ${Number(v).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`

const formatFecha = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })

const ESTADO_STYLES: Record<string, string> = {
    pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
    pagada: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    vencida: 'bg-red-50 text-red-600 border border-red-200',
}
const ESTADO_ICONS: Record<string, React.ReactNode> = {
    pendiente: <Clock size={11} />,
    pagada: <CheckCircle2 size={11} />,
    vencida: <AlertTriangle size={11} />,
}

// ── Modal generar facturas ────────────────────────────────
interface GenerarModalProps {
    onClose: () => void
    onGenerado: (n: number) => void
}

const GenerarModal = ({ onClose, onGenerado }: GenerarModalProps) => {
    const now = new Date()
    const periodoDefault = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const vencimientoDefault = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString().split('T')[0]

    const [periodo, setPeriodo] = useState(periodoDefault)
    const [fechaVencimiento, setFechaVencimiento] = useState(vencimientoDefault)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleGenerar = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!periodo.match(/^\d{4}-\d{2}$/)) {
            setError('El período debe tener formato YYYY-MM (ej: 2026-05)')
            return
        }
        if (!fechaVencimiento) {
            setError('La fecha de vencimiento es obligatoria.')
            return
        }
        setLoading(true); setError('')
        try {
            const n = await generarFacturas({ periodo, fechaVencimiento })
            onGenerado(n)
        } catch (e: any) {
            setError(e.message || 'Error al generar facturas.')
        } finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">Generar Facturas</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Se generarán facturas para todos los contratos activos</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleGenerar} className="p-6 space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-700">
                            Este proceso calculará el consumo de cada contrato activo basándose en las últimas dos lecturas registradas y generará la factura correspondiente.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Período de facturación *
                        </label>
                        <input
                            value={periodo}
                            onChange={e => setPeriodo(e.target.value)}
                            placeholder="YYYY-MM (ej: 2026-05)"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-mono"
                        />
                        <p className="text-xs text-slate-400 mt-1">Formato: año-mes (ej: 2026-05)</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">
                            Fecha de vencimiento *
                        </label>
                        <input
                            type="date"
                            value={fechaVencimiento}
                            onChange={e => setFechaVencimiento(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                        />
                    </div>

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
                            {loading ? <><Loader2 size={16} className="animate-spin" /> Generando...</> : <><Zap size={16} /> Generar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Página principal ──────────────────────────────────────
type Tab = 'morosos' | 'facturas'

const FacturasAdmin = () => {
    const [tab, setTab] = useState<Tab>('morosos')

    // Morosos
    const [morosos, setMorosos] = useState<Moroso[]>([])
    const [totalMorosos, setTotalMorosos] = useState(0)
    const [pageMorosos, setPageMorosos] = useState(1)
    const [periodoFilter, setPeriodoFilter] = useState('')
    const [distritoFilter, setDistritoFilter] = useState('')
    const [searchMoroso, setSearchMoroso] = useState('')
    const [loadingMorosos, setLoadingMorosos] = useState(false)

    // Facturas
    const [facturas, setFacturas] = useState<any[]>([])
    const [totalFacturas, setTotalFacturas] = useState(0)
    const [pageFacturas, setPageFacturas] = useState(1)
    const [estadoFactura, setEstadoFactura] = useState('')
    const [loadingFacturas, setLoadingFacturas] = useState(false)

    const [distritos, setDistritos] = useState<Distrito[]>([])
    const [error, setError] = useState('')
    const [showGenerar, setShowGenerar] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    const LIMIT = 15

    useEffect(() => {
        getDistritos().then(setDistritos).catch(() => { })
    }, [])

    const fetchMorosos = useCallback(async () => {
        setLoadingMorosos(true); setError('')
        try {
            const res = await getMorosos({
                periodo: periodoFilter || undefined,
                distritoId: distritoFilter || undefined,
                page: pageMorosos, limit: LIMIT,
            })
            setMorosos(res.data)
            setTotalMorosos(res.pagination.total)
        } catch (e: any) {
            setError(e.message || 'Error al cargar morosos.')
        } finally { setLoadingMorosos(false) }
    }, [periodoFilter, distritoFilter, pageMorosos])

    const fetchFacturas = useCallback(async () => {
        setLoadingFacturas(true); setError('')
        try {
            const res = await getFacturasAdmin({
                estado: estadoFactura || undefined,
                page: pageFacturas, limit: LIMIT,
            })
            setFacturas(res.data)
            setTotalFacturas(res.pagination.total)
        } catch (e: any) {
            setError(e.message || 'Error al cargar facturas.')
        } finally { setLoadingFacturas(false) }
    }, [estadoFactura, pageFacturas])

    useEffect(() => { if (tab === 'morosos') fetchMorosos() }, [fetchMorosos, tab])
    useEffect(() => { if (tab === 'facturas') fetchFacturas() }, [fetchFacturas, tab])

    const filteredMorosos = morosos.filter(m =>
        m.nombre.toLowerCase().includes(searchMoroso.toLowerCase()) ||
        m.email.toLowerCase().includes(searchMoroso.toLowerCase())
    )

    const totalDeudaGeneral = morosos.reduce((acc, m) => acc + m.deudaTotal, 0)
    const totalPagesMorosos = Math.ceil(totalMorosos / LIMIT)
    const totalPagesFacturas = Math.ceil(totalFacturas / LIMIT)

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Encabezado */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Facturas</h1>
                    </div>
                    <button
                        onClick={() => setShowGenerar(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                    >
                        <Zap size={20} /> Generar Facturas
                    </button>
                </div>

                {/* Mensaje de éxito */}
                {successMsg && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm font-medium">
                        <CheckCircle2 size={18} />
                        {successMsg}
                        <button onClick={() => setSuccessMsg('')} className="ml-auto text-emerald-500 hover:text-emerald-700">
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                    <button
                        onClick={() => setTab('morosos')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'morosos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="flex items-center gap-2"><Users size={16} /> Morosos ({totalMorosos})</span>
                    </button>
                    <button
                        onClick={() => setTab('facturas')}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'facturas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <span className="flex items-center gap-2"><FileText size={16} /> Todas las Facturas ({totalFacturas})</span>
                    </button>
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">{error}</div>
                )}

                {/* ── TAB MOROSOS ── */}
                {tab === 'morosos' && (
                    <div className="space-y-6">
                        {/* Resumen deuda */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                                    <Users size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total morosos</p>
                                    <p className="text-2xl font-black text-red-600">{totalMorosos}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                    <DollarSign size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Deuda total</p>
                                    <p className="text-xl font-black text-amber-700">{formatBs(totalDeudaGeneral)}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Calendar size={22} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promedio deuda</p>
                                    <p className="text-xl font-black text-slate-900">
                                        {totalMorosos > 0 ? formatBs(totalDeudaGeneral / totalMorosos) : 'Bs 0.00'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Filtros morosos */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" value={searchMoroso} onChange={e => setSearchMoroso(e.target.value)}
                                    placeholder="Buscar por nombre o correo..."
                                    className="w-full bg-slate-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 transition-all" />
                            </div>
                            <input
                                type="text"
                                value={periodoFilter}
                                onChange={e => setPeriodoFilter(e.target.value)}
                                placeholder="Período (ej: 2026-04)"
                                className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-600/20 w-40 font-mono"
                            />
                            <select value={distritoFilter} onChange={e => setDistritoFilter(e.target.value)}
                                className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-600/20">
                                <option value="">Todos los distritos</option>
                                {distritos.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                            </select>
                            <button onClick={() => { setPageMorosos(1); fetchMorosos() }}
                                className="px-5 py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all">
                                Filtrar
                            </button>
                        </div>

                        {/* Tabla morosos */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            {loadingMorosos ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 size={32} className="animate-spin text-blue-600" />
                                </div>
                            ) : filteredMorosos.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                    <CheckCircle2 size={40} className="mb-3 opacity-30 text-emerald-400" />
                                    <p className="font-medium text-emerald-600">¡Sin morosos! Todos al día.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Ciudadano</th>
                                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Facturas pendientes</th>
                                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Deuda total</th>
                                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Desde</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredMorosos.map(m => (
                                            <tr key={m.usuarioId} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-black text-sm border border-red-100 shrink-0">
                                                            {m.nombre.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900">{m.nombre}</p>
                                                            <p className="text-xs text-slate-500">{m.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black bg-red-50 text-red-600 border border-red-100">
                                                        <AlertTriangle size={12} />
                                                        {m.cantidadFacturas} factura{m.cantidadFacturas > 1 ? 's' : ''}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-base font-black text-red-600">{formatBs(m.deudaTotal)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {formatFecha(m.facturasMasAntigua)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {totalPagesMorosos > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">Página {pageMorosos} de {totalPagesMorosos}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setPageMorosos(p => Math.max(1, p - 1))} disabled={pageMorosos === 1}
                                        className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">Anterior</button>
                                    <button onClick={() => setPageMorosos(p => Math.min(totalPagesMorosos, p + 1))} disabled={pageMorosos === totalPagesMorosos}
                                        className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">Siguiente</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB FACTURAS ── */}
                {tab === 'facturas' && (
                    <div className="space-y-6">
                        {/* Filtros */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
                            <select value={estadoFactura} onChange={e => { setEstadoFactura(e.target.value); setPageFacturas(1) }}
                                className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-blue-600/20">
                                <option value="">Todos los estados</option>
                                <option value="pendiente">Pendiente</option>
                                <option value="pagada">Pagada</option>
                                <option value="vencida">Vencida</option>
                            </select>
                        </div>

                        {/* Tabla facturas */}
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                            {loadingFacturas ? (
                                <div className="flex items-center justify-center py-20">
                                    <Loader2 size={32} className="animate-spin text-blue-600" />
                                </div>
                            ) : facturas.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                    <FileText size={40} className="mb-3 opacity-30" />
                                    <p className="font-medium">No hay facturas</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50/50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Período</th>
                                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Consumo</th>
                                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Total</th>
                                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                            <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Vencimiento</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {facturas.map((f: any) => (
                                            <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-black text-slate-900">{f.periodo}</p>
                                                    <p className="text-xs text-slate-400 font-mono">{f.id.slice(0, 8)}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-700">{f.consumoM3} m³</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-black text-slate-900">{formatBs(f.total)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${ESTADO_STYLES[f.estado]}`}>
                                                        {ESTADO_ICONS[f.estado]}{f.estado}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {formatFecha(f.fechaVencimiento)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {totalPagesFacturas > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">Página {pageFacturas} de {totalPagesFacturas} — {totalFacturas} facturas</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setPageFacturas(p => Math.max(1, p - 1))} disabled={pageFacturas === 1}
                                        className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">Anterior</button>
                                    <button onClick={() => setPageFacturas(p => Math.min(totalPagesFacturas, p + 1))} disabled={pageFacturas === totalPagesFacturas}
                                        className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all">Siguiente</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showGenerar && (
                <GenerarModal
                    onClose={() => setShowGenerar(false)}
                    onGenerado={(n) => {
                        setShowGenerar(false)
                        setSuccessMsg(`✓ Se generaron ${n} factura${n !== 1 ? 's' : ''} correctamente para el período.`)
                        fetchFacturas()
                        fetchMorosos()
                    }}
                />
            )}
        </AdminLayout>
    )
}

export default FacturasAdmin
