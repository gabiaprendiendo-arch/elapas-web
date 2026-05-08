import { useState, useEffect } from 'react'
import PortalLayout from '@/components/ui/PortalLayout'
import {
    getMisFacturas, generarQr, confirmarPago,
    type FacturaPortal as Factura,
} from '@/services/service-portal'
import {
    FileText, Loader2, CheckCircle2, Clock, AlertTriangle,
    X, QrCode, Banknote, ArrowLeftRight, CreditCard
} from 'lucide-react'

const formatBs = (v: string | number) =>
    `Bs ${Number(v).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`

const formatFecha = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })

const ESTADO_STYLES: Record<string, string> = {
    pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
    pagada:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
    vencida:   'bg-red-50 text-red-600 border border-red-200',
}
const ESTADO_ICONS: Record<string, React.ReactNode> = {
    pendiente: <Clock size={12} />,
    pagada:    <CheckCircle2 size={12} />,
    vencida:   <AlertTriangle size={12} />,
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
    // qrData es el JSON string que devuelve el backend
    const [qrGenerado, setQrGenerado] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // ── QR: genera el pago automáticamente al llamar al endpoint ──
    const handleQr = async () => {
        setLoading(true); setError('')
        try {
            // POST /pagos/qr/:facturaId — registra el pago y devuelve { qrData: string }
            const data = await generarQr(factura.id)
            setQrGenerado(data.qrData)   // qrData es el JSON string del QR
            setSuccess(true)
            setTimeout(() => onPagado(), 2500)
        } catch (e: any) {
            const msg: string = e.message ?? ''
            if (msg.includes('pagada') || msg.includes('400')) {
                setError('Esta factura ya fue pagada anteriormente.')
            } else {
                setError(msg || 'Error al generar el QR.')
            }
        } finally { setLoading(false) }
    }

    // ── Efectivo / Transferencia: confirmar pago ──────────────────
    const handleConfirmar = async () => {
        if (metodo === 'transferencia' && !referencia.trim()) {
            setError('Ingresa el número de referencia de la transferencia.')
            return
        }
        setLoading(true); setError('')
        try {
            // POST /pagos/confirmar — registra el pago y marca la factura como pagada
            await confirmarPago({
                facturaId: factura.id,
                monto: factura.total,
                metodoPago: metodo,
                referencia: referencia.trim() || undefined,
            })
            setSuccess(true)
            setTimeout(() => onPagado(), 1500)
        } catch (e: any) {
            setError(e.message || 'Error al confirmar el pago.')
        } finally { setLoading(false) }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div>
                        <p className="text-base font-bold text-slate-900">Pagar Factura</p>
                        <p className="text-xs text-slate-400"><span>Período {factura.periodo}</span></p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                {/* Éxito */}
                {success ? (
                    <div className="flex flex-col items-center justify-center py-10 px-5">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                            <CheckCircle2 size={28} className="text-emerald-600" />
                        </div>
                        <p className="text-base font-bold text-slate-900">¡Pago registrado!</p>
                        <p className="text-sm text-slate-500 mt-1 text-center">
                            Tu factura ha sido marcada como pagada.
                        </p>
                        {qrGenerado && (
                            <div className="mt-4 bg-slate-50 rounded-xl p-3 w-full">
                                <p className="text-xs text-slate-400 text-center mb-2">Datos del QR generado</p>
                                <p className="text-[10px] font-mono text-slate-500 break-all text-center">
                                    {qrGenerado.slice(0, 80)}…
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="px-5 py-4 space-y-4">

                        {/* Resumen */}
                        <div className="bg-slate-50 rounded-xl p-3.5 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Consumo</span>
                                <span className="font-semibold text-slate-800"><span>{factura.consumoM3} m³</span></span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Cargo fijo</span>
                                <span className="font-semibold text-slate-800">{formatBs(factura.cargoFijo ?? 0)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-slate-200">
                                <span className="font-bold text-slate-900">Total</span>
                                <span className="text-base font-black text-blue-700">{formatBs(factura.total)}</span>
                            </div>
                        </div>

                        {/* Método */}
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Método de pago</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { key: 'qr_simple',     label: 'QR',           icon: <QrCode size={16} /> },
                                    { key: 'efectivo',      label: 'Efectivo',     icon: <Banknote size={16} /> },
                                    { key: 'transferencia', label: 'Transferencia',icon: <ArrowLeftRight size={16} /> },
                                ].map(m => (
                                    <button key={m.key} type="button"
                                        onClick={() => { setMetodo(m.key as typeof metodo); setError('') }}
                                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all text-xs font-semibold ${
                                            metodo === m.key
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}>
                                        {m.icon}{m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Descripción del método */}
                        {metodo === 'qr_simple' && (
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                                Al hacer clic en <strong>"Generar y Pagar"</strong>, se registrará el pago y se generará el código QR de confirmación.
                            </div>
                        )}

                        {metodo === 'efectivo' && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-700">
                                Confirma que realizaste el pago en efectivo en las oficinas de ELAPAS.
                            </div>
                        )}

                        {metodo === 'transferencia' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Número de referencia *
                                </label>
                                <input
                                    value={referencia}
                                    onChange={e => setReferencia(e.target.value)}
                                    placeholder="Ej: TRF-20260501-001"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                />
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        {/* Botón de acción */}
                        <div className="flex gap-2 pt-1">
                            <button type="button" onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
                                Cancelar
                            </button>
                            <button
                                onClick={metodo === 'qr_simple' ? handleQr : handleConfirmar}
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                {loading && <Loader2 size={14} className="animate-spin" />}
                                {loading
                                    ? 'Procesando...'
                                    : metodo === 'qr_simple'
                                        ? 'Generar y Pagar'
                                        : `Confirmar ${formatBs(factura.total)}`
                                }
                            </button>
                        </div>
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
        setLoading(true); setError('')
        try {
            setFacturas(await getMisFacturas())
        } catch (e: any) {
            setError(e.message || 'Error al cargar facturas.')
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchFacturas() }, [])

    const filtradas = filtro === 'todas' ? facturas : facturas.filter(f => f.estado === filtro)
    const pendientes = facturas.filter(f => f.estado === 'pendiente').length
    const vencidas   = facturas.filter(f => f.estado === 'vencida').length
    const pagadas    = facturas.filter(f => f.estado === 'pagada').length

    return (
        <PortalLayout>
            <div className="space-y-5 max-w-2xl">

                <div>
                    <h1 className="text-xl font-bold text-slate-900">Mis Facturas</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Historial de tus facturas de agua potable</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-center">
                        <p className="text-2xl font-bold text-amber-700">{pendientes}</p>
                        <p className="text-xs font-semibold text-amber-600 mt-0.5">Pendientes</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-center">
                        <p className="text-2xl font-bold text-red-600">{vencidas}</p>
                        <p className="text-xs font-semibold text-red-500 mt-0.5">Vencidas</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-center">
                        <p className="text-2xl font-bold text-emerald-700">{pagadas}</p>
                        <p className="text-xs font-semibold text-emerald-600 mt-0.5">Pagadas</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 flex-wrap">
                    {(['todas', 'pendiente', 'vencida', 'pagada'] as const).map(f => (
                        <button key={f} onClick={() => setFiltro(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                filtro === f
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
                            }`}>
                            {f === 'todas' ? 'Todas' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-slate-300" />
                    </div>
                ) : filtradas.length === 0 ? (
                    <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                        <FileText size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No hay facturas {filtro !== 'todas' ? `"${filtro}"` : ''}</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtradas.map(f => {
                            const puedesPagar = f.estado === 'pendiente' || f.estado === 'vencida'
                            const est = ESTADO_STYLES[f.estado]
                            const icon = ESTADO_ICONS[f.estado]
                            return (
                                <div key={f.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                    f.estado === 'pagada' ? 'bg-emerald-50 text-emerald-600'
                                                    : f.estado === 'vencida' ? 'bg-red-50 text-red-500'
                                                    : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className="text-sm font-bold text-slate-900"><span>Período {f.periodo}</span></p>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${est}`}>
                                                            {icon}{f.estado}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        Vence: {formatFecha(f.fechaVencimiento)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-base font-black text-slate-900">{formatBs(f.total)}</p>
                                                <p className="text-xs text-slate-400"><span>{f.consumoM3} m³</span></p>
                                            </div>
                                        </div>

                                        {/* Desglose */}
                                        <div className="mt-3 pt-3 border-t border-slate-50 grid grid-cols-3 gap-2">
                                            <div>
                                                <p className="text-[10px] text-slate-400">Consumo</p>
                                                <p className="text-xs font-semibold text-slate-700"><span>{f.consumoM3} m³</span></p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400">Cargo fijo</p>
                                                <p className="text-xs font-semibold text-slate-700">{formatBs(f.cargoFijo ?? 0)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400">Total</p>
                                                <p className="text-xs font-bold text-blue-700">{formatBs(f.total)}</p>
                                            </div>
                                        </div>

                                        {puedesPagar && (
                                            <button onClick={() => setPagarFactura(f)}
                                                className="mt-3 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                                                <CreditCard size={15} /> Pagar ahora
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
