import { useState, useEffect } from 'react'
import PortalLayout from '@/components/ui/PortalLayout'
import {
    getMisFacturas, generarQr, confirmarPago,
    type Factura, type QrData
} from '@/services/service-portal'
import {
    FileText, Loader2, CheckCircle2, Clock, AlertTriangle,
    X, QrCode, CreditCard, Banknote, ArrowLeftRight
} from 'lucide-react'

// ── helpers ───────────────────────────────────────────────
const formatBs = (v: string | number) =>
    `Bs ${Number(v).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`

const formatFecha = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })

const ESTADO_STYLES: Record<string, string> = {
    pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
    pagada: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    vencida: 'bg-red-50 text-red-600 border border-red-200',
}
const ESTADO_ICONS: Record<string, React.ReactNode> = {
    pendiente: <Clock size={12} />,
    pagada: <CheckCircle2 size={12} />,
    vencida: <AlertTriangle size={12} />,
}

// ── Modal de pago ─────────────────────────────────────────
interface PagoModalProps {
    factura: Factura
    onClose: () => void
    onPagado: () => void
}

const PagoModal = ({ factura, onClose, onPagado }: PagoModalProps) => {
    const [metodo, setMetodo] = useState<'qr_simple' | 'efectivo' | 'transferencia'>('qr_simple')
    const [referencia, setReferencia] = useState('')
    const [qrData, setQrData] = useState<QrData | null>(null)
    const [loadingQr, setLoadingQr] = useState(false)
    const [loadingPago, setLoadingPago] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleGenerarQr = async () => {
        setLoadingQr(true)
        setError('')
        try {
            const data = await generarQr(factura.id)
            setQrData(data)
        } catch (e: any) {
            setError(e.message || 'Error al generar QR.')
        } finally {
            setLoadingQr(false)
        }
    }

    const handleConfirmar = async () => {
        if (metodo === 'transferencia' && !referencia.trim()) {
            setError('Ingresa el número de referencia de la transferencia.')
            return
        }
        setLoadingPago(true)
        setError('')
        try {
            await confirmarPago({
                facturaId: factura.id,
                monto: factura.total,
                metodoPago: metodo,
                referencia: referencia || undefined,
            })
            setSuccess(true)
            setTimeout(() => { onPagado() }, 1500)
        } catch (e: any) {
            setError(e.message || 'Error al confirmar el pago.')
        } finally {
            setLoadingPago(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">Pagar Factura</h2>
                        <p className="text-sm text-slate-500">Período {factura.periodo}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {success ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                            <CheckCircle2 size={32} className="text-emerald-600" />
                        </div>
                        <p className="text-lg font-black text-slate-900">¡Pago registrado!</p>
                        <p className="text-sm text-slate-500 mt-1">Tu factura ha sido marcada como pagada.</p>
                    </div>
                ) : (
                    <div className="p-6 space-y-5">
                        {/* Resumen */}
                        <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Consumo</span>
                                <span className="font-bold text-slate-900">{factura.consumoM3} m³</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Cargo fijo</span>
                                <span className="font-bold text-slate-900">{formatBs(factura.cargoFijo ?? 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="font-bold text-slate-900">{formatBs(factura.subtotal ?? 0)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-200">
                                <span className="font-bold text-slate-900">Total a pagar</span>
                                <span className="text-lg font-black text-blue-700">{formatBs(factura.total)}</span>
                            </div>
                        </div>

                        {/* Método de pago */}
                        <div>
                            <p className="text-sm font-bold text-slate-700 mb-3">Método de pago</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { key: 'qr_simple', label: 'QR Simple', icon: <QrCode size={18} /> },
                                    { key: 'efectivo', label: 'Efectivo', icon: <Banknote size={18} /> },
                                    { key: 'transferencia', label: 'Transferencia', icon: <ArrowLeftRight size={18} /> },
                                ].map(m => (
                                    <button
                                        key={m.key}
                                        type="button"
                                        onClick={() => { setMetodo(m.key as typeof metodo); setQrData(null); setError('') }}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-xs font-bold ${metodo === m.key
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        {m.icon}
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* QR */}
                        {metodo === 'qr_simple' && (
                            <div className="space-y-3">
                                {!qrData ? (
                                    <button
                                        onClick={handleGenerarQr}
                                        disabled={loadingQr}
                                        className="w-full py-3 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 font-bold text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {loadingQr ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
                                        {loadingQr ? 'Generando...' : 'Generar código QR'}
                                    </button>
                                ) : (
                                    <div className="bg-slate-50 rounded-2xl p-4 text-center">
                                        {/* Representación visual del QR */}
                                        <div className="w-40 h-40 mx-auto bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center mb-3">
                                            <div className="grid grid-cols-5 gap-0.5 p-2">
                                                {Array.from({ length: 25 }).map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`w-5 h-5 rounded-sm ${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-white'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Escanea con tu app bancaria
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1 font-mono break-all">
                                            {qrData.qrString?.slice(0, 40)}...
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Referencia para transferencia */}
                        {metodo === 'transferencia' && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">
                                    Número de referencia *
                                </label>
                                <input
                                    value={referencia}
                                    onChange={e => setReferencia(e.target.value)}
                                    placeholder="Ej: TRF-20260501-001"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                />
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Botón confirmar */}
                        <button
                            onClick={handleConfirmar}
                            disabled={loadingPago}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loadingPago && <Loader2 size={16} className="animate-spin" />}
                            {loadingPago ? 'Procesando...' : `Confirmar pago de ${formatBs(factura.total)}`}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

// ── Página de facturas ────────────────────────────────────
const PortalFacturas = () => {
    const [facturas, setFacturas] = useState<Factura[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filtro, setFiltro] = useState<'todas' | 'pendiente' | 'pagada' | 'vencida'>('todas')
    const [pagarFactura, setPagarFactura] = useState<Factura | null>(null)

    const fetchFacturas = async () => {
        setLoading(true)
        setError('')
        try {
            const data = await getMisFacturas()
            setFacturas(data)
        } catch (e: any) {
            setError(e.message || 'Error al cargar facturas.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchFacturas() }, [])

    const filtradas = filtro === 'todas' ? facturas : facturas.filter(f => f.estado === filtro)

    const pendientes = facturas.filter(f => f.estado === 'pendiente').length
    const vencidas = facturas.filter(f => f.estado === 'vencida').length
    const pagadas = facturas.filter(f => f.estado === 'pagada').length

    return (
        <PortalLayout>
            <div className="space-y-6">
                {/* Encabezado */}
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Mis Facturas</h1>
                    <p className="text-slate-500 text-sm mt-1">Historial completo de tus facturas de agua potable.</p>
                </div>

                {/* Resumen rápido */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-amber-700">{pendientes}</p>
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-1">Pendientes</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-red-600">{vencidas}</p>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-wider mt-1">Vencidas</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                        <p className="text-2xl font-black text-emerald-700">{pagadas}</p>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mt-1">Pagadas</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 flex-wrap">
                    {(['todas', 'pendiente', 'vencida', 'pagada'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFiltro(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filtro === f
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                                }`}
                        >
                            {f === 'todas' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">{error}</div>
                )}

                {/* Lista de facturas */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 size={32} className="animate-spin text-blue-600" />
                    </div>
                ) : filtradas.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center text-slate-400">
                        <FileText size={36} className="mx-auto mb-3 opacity-30" />
                        <p className="font-medium">No hay facturas {filtro !== 'todas' ? `con estado "${filtro}"` : ''}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtradas.map(f => {
                            const est = ESTADO_STYLES[f.estado]
                            const icon = ESTADO_ICONS[f.estado]
                            const puedesPagar = f.estado === 'pendiente' || f.estado === 'vencida'
                            return (
                                <div key={f.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${f.estado === 'pagada' ? 'bg-emerald-50 text-emerald-600' : f.estado === 'vencida' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-sm font-black text-slate-900">Período {f.periodo}</p>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${est}`}>
                                                            {icon}{f.estado}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        Vence: {formatFecha(f.fechaVencimiento)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-lg font-black text-slate-900">{formatBs(f.total)}</p>
                                                <p className="text-xs text-slate-500">{f.consumoM3} m³</p>
                                            </div>
                                        </div>

                                        {/* Desglose */}
                                        <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-3 gap-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consumo</p>
                                                <p className="text-sm font-bold text-slate-700">{f.consumoM3} m³</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cargo fijo</p>
                                                <p className="text-sm font-bold text-slate-700">{formatBs(f.cargoFijo ?? 0)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                                                <p className="text-sm font-black text-blue-700">{formatBs(f.total)}</p>
                                            </div>
                                        </div>

                                        {puedesPagar && (
                                            <button
                                                onClick={() => setPagarFactura(f)}
                                                className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
                                            >
                                                <CreditCard size={16} /> Pagar ahora
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {pagarFactura && (
                <PagoModal
                    factura={pagarFactura}
                    onClose={() => setPagarFactura(null)}
                    onPagado={() => { setPagarFactura(null); fetchFacturas() }}
                />
            )}
        </PortalLayout>
    )
}

export default PortalFacturas
