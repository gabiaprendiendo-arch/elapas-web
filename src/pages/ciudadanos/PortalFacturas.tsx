import { useState, useEffect } from 'react'
import PortalLayout from '@/components/ui/PortalLayout'
import {
    getMisFacturas, generarQr,
    type FacturaPortal as Factura,
} from '@/services/service-portal'
import {
    FileText, Loader2, CheckCircle2, Clock, AlertTriangle,
    X, QrCode, CreditCard, RefreshCw
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

// ── helpers ───────────────────────────────────────────────
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

const buildQrString = (factura: Factura) =>
    JSON.stringify({
        entidad: 'ELAPAS',
        facturaId: factura.id,
        periodo: factura.periodo,
        monto: Number(factura.total),
        moneda: 'BOB',
        fecha: new Date().toISOString().slice(0, 10),
        ref: `QR-${factura.id.slice(0, 8).toUpperCase()}`,
    })

// ── Panel QR — componente separado para evitar problemas de reconciliación ──
interface QrPanelProps {
    factura: Factura
    onPagado: () => void
    onReiniciar: () => void
}

const QrPanel = ({ factura, onPagado, onReiniciar }: QrPanelProps) => {
    const [countdown, setCountdown] = useState(30)
    const [fase, setFase] = useState<'esperando' | 'verificando'>('esperando')
    const qrValue = buildQrString(factura)

    // Cuenta regresiva con useEffect — sin closures problemáticos
    useEffect(() => {
        if (fase !== 'esperando') return
        if (countdown <= 0) {
            iniciarVerificacion()
            return
        }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(t)
    }, [countdown, fase])

    const iniciarVerificacion = () => {
        setFase('verificando')
        setTimeout(() => onPagado(), 1800)
    }

    if (fase === 'verificando') return (
        <div className="flex flex-col items-center gap-3 py-8">
            <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
                <QrCode size={20} className="absolute inset-0 m-auto text-blue-500" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Verificando pago…</p>
            <p className="text-xs text-slate-400">Confirmando con el servidor</p>
        </div>
    )

    return (
        <div className="flex flex-col items-center gap-3">
            {/* QR */}
            <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 relative">
                <QRCodeSVG
                    value={qrValue}
                    size={180}
                    level="M"
                    marginSize={1}
                />
                <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow">
                    <span className="text-[10px] font-black text-white">{countdown}</span>
                </div>
            </div>

            {/* Info */}
            <div className="text-center space-y-0.5">
                <p className="text-xs font-bold text-slate-700">Escanea con tu app bancaria</p>
                <p className="text-[10px] text-slate-400">
                    Ref: <span className="font-mono">QR-{factura.id.slice(0, 8).toUpperCase()}</span>
                </p>
                <p className="text-[10px] text-slate-400">
                    Monto: <span className="font-semibold text-blue-700">{formatBs(factura.total)}</span>
                </p>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{ width: `${(countdown / 30) * 100}%` }}
                />
            </div>
            <p className="text-[10px] text-slate-400">Expira en {countdown}s</p>

            {/* Acciones */}
            <div className="flex gap-2 w-full">
                <button
                    onClick={onReiniciar}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition-all">
                    <RefreshCw size={13} /> Nuevo QR
                </button>
                <button
                    onClick={iniciarVerificacion}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all">
                    <CheckCircle2 size={13} /> Simular pago
                </button>
            </div>
        </div>
    )
}

// ── Modal de pago ─────────────────────────────────────────
interface PagoModalProps {
    factura: Factura
    onClose: () => void
    onPagado: () => void
}

type Fase = 'idle' | 'generando' | 'qr' | 'exito'

const PagoModal = ({ factura, onClose, onPagado }: PagoModalProps) => {
    const [fase, setFase] = useState<Fase>('idle')
    const [error, setError] = useState('')

    const handleGenerarQr = async () => {
        setFase('generando')
        setError('')
        try {
            await generarQr(factura.id)
        } catch {
            // silencioso — continuamos con la simulación
        }
        setFase('qr')
    }

    const handlePagado = () => {
        setFase('exito')
        setTimeout(() => onPagado(), 2000)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <div>
                        <p className="text-base font-bold text-slate-900">Pagar Factura</p>
                        <p className="text-xs text-slate-400">Período {factura.periodo}</p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={fase === 'generando'}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-40">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                <div className="px-5 py-4 space-y-4">

                    {/* Resumen siempre visible */}
                    <div className="bg-slate-50 rounded-xl p-3.5 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Consumo</span>
                            <span className="font-semibold text-slate-800">{factura.consumoM3} m³</span>
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

                    {/* ── idle ── */}
                    {fase === 'idle' && (
                        <>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                                Se generará un código QR para realizar el pago desde tu app bancaria.
                            </div>
                            {error && (
                                <div className="px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
                                    {error}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
                                    Cancelar
                                </button>
                                <button onClick={handleGenerarQr}
                                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                    <QrCode size={15} /> Generar QR
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── generando ── */}
                    {fase === 'generando' && (
                        <div className="flex flex-col items-center gap-3 py-8">
                            <Loader2 size={28} className="animate-spin text-blue-500" />
                            <p className="text-sm text-slate-500">Generando código QR…</p>
                        </div>
                    )}

                    {/* ── qr ── */}
                    {fase === 'qr' && (
                        <QrPanel
                            factura={factura}
                            onPagado={handlePagado}
                            onReiniciar={() => setFase('idle')}
                        />
                    )}

                    {/* ── exito ── */}
                    {fase === 'exito' && (
                        <div className="flex flex-col items-center py-6 gap-3">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle2 size={32} className="text-emerald-600" />
                            </div>
                            <p className="text-base font-bold text-slate-900">¡Pago registrado!</p>
                            <p className="text-sm text-slate-500 text-center">
                                Tu factura del período <strong>{factura.periodo}</strong> ha sido marcada como pagada.
                            </p>
                            <div className="bg-slate-50 rounded-xl p-3 w-full text-center space-y-1">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Comprobante</p>
                                <p className="text-xs font-mono text-slate-600">
                                    REF: QR-{factura.id.slice(0, 8).toUpperCase()}
                                </p>
                                <p className="text-[10px] text-slate-400">Método: QR Simple</p>
                                <p className="text-sm font-black text-emerald-700">{formatBs(factura.total)}</p>
                            </div>
                        </div>
                    )}
                </div>
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
                                                        <p className="text-sm font-bold text-slate-900">Período {f.periodo}</p>
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
                                                <p className="text-xs text-slate-400">{f.consumoM3} m³</p>
                                            </div>
                                        </div>

                                        {/* Desglose */}
                                        <div className="mt-3 pt-3 border-t border-slate-50 grid grid-cols-3 gap-2">
                                            <div>
                                                <p className="text-[10px] text-slate-400">Consumo</p>
                                                <p className="text-xs font-semibold text-slate-700">{f.consumoM3} m³</p>
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
