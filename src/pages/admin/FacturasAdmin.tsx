import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import {
    FileText, Loader2, CheckCircle2, Clock,
    AlertTriangle, Zap, X, Download
} from 'lucide-react'
import { getFacturasAdmin, generarFacturas, type FacturaAdmin } from '@/services/service-contratos'
import jsPDF from 'jspdf'

const formatBs = (v: string | number) =>
    `Bs ${Number(v).toLocaleString('es-BO', { minimumFractionDigits: 2 })}`

const formatFecha = (d: string) =>
    new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })

const ESTADO_STYLES: Record<string, string> = {
    pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
    pagada:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
    vencida:   'bg-red-50 text-red-600 border border-red-200',
}
const ESTADO_ICONS: Record<string, React.ReactNode> = {
    pendiente: <Clock size={11} />,
    pagada:    <CheckCircle2 size={11} />,
    vencida:   <AlertTriangle size={11} />,
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
        if (!fechaVencimiento) { setError('La fecha de vencimiento es obligatoria.'); return }
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Generar Facturas</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Para todos los contratos activos con 2+ lecturas</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                        <X size={18} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleGenerar} className="px-6 py-5 space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">
                            Calcula el consumo de cada contrato activo (diferencia entre las últimas 2 lecturas) y genera la factura correspondiente.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Período de facturación *
                        </label>
                        <input
                            value={periodo}
                            onChange={e => setPeriodo(e.target.value)}
                            placeholder="YYYY-MM (ej: 2026-05)"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Fecha de vencimiento *
                        </label>
                        <input
                            type="date"
                            value={fechaVencimiento}
                            onChange={e => setFechaVencimiento(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                        />
                    </div>

                    {error && (
                        <div className="px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">{error}</div>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button type="button" onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading ? <><Loader2 size={14} className="animate-spin" /> Generando...</> : <><Zap size={14} /> Generar</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Página principal ──────────────────────────────────────
const FacturasAdmin = () => {
    const [facturas, setFacturas] = useState<FacturaAdmin[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const LIMIT = 15

    const [estadoFilter, setEstadoFilter] = useState('')
    const [periodoFilter, setPeriodoFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showGenerar, setShowGenerar] = useState(false)
    const [successMsg, setSuccessMsg] = useState('')

    const fetchFacturas = useCallback(async () => {
        setLoading(true); setError('')
        try {
            const res = await getFacturasAdmin({
                estado: estadoFilter || undefined,
                periodo: periodoFilter || undefined,
                page,
                limit: LIMIT,
            })
            setFacturas(res.data)
            setTotal(res.pagination.total)
        } catch (e: any) {
            setError(e.message || 'Error al cargar facturas.')
        } finally { setLoading(false) }
    }, [estadoFilter, periodoFilter, page])

    useEffect(() => { fetchFacturas() }, [fetchFacturas])

    // Estadísticas rápidas
    const pendientes = facturas.filter(f => f.estado === 'pendiente').length
    const pagadas    = facturas.filter(f => f.estado === 'pagada').length
    const vencidas   = facturas.filter(f => f.estado === 'vencida').length
    const totalPages = Math.ceil(total / LIMIT)

    const [descargando, setDescargando] = useState<string | null>(null)

    const handleDescargarPdf = (f: FacturaAdmin) => {
        setDescargando(f.id)
        try {
            const doc = new jsPDF({ unit: 'mm', format: 'a4' })
            const W = 210
            const margin = 18

            // ── Encabezado ──────────────────────────────────────────
            doc.setFillColor(37, 99, 235)          // blue-600
            doc.rect(0, 0, W, 32, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('ELAPAS', margin, 14)
            doc.setFontSize(9)
            doc.setFont('helvetica', 'normal')
            doc.text('Empresa Local de Agua Potable y Alcantarillado', margin, 21)
            doc.text('Sucre, Bolivia', margin, 27)

            // Número de factura (derecha)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text(`FACTURA`, W - margin, 14, { align: 'right' })
            doc.setFontSize(8)
            doc.setFont('helvetica', 'normal')
            doc.text(`#${f.id.slice(0, 8).toUpperCase()}`, W - margin, 20, { align: 'right' })
            doc.text(`Período: ${f.periodo}`, W - margin, 26, { align: 'right' })

            // ── Cuerpo ───────────────────────────────────────────────
            doc.setTextColor(30, 41, 59)           // slate-800
            let y = 46

            // Datos del contrato
            doc.setFillColor(248, 250, 252)        // slate-50
            doc.roundedRect(margin, y, W - margin * 2, 28, 3, 3, 'F')
            doc.setFontSize(8)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(100, 116, 139)        // slate-500
            doc.text('CONTRATO', margin + 5, y + 7)
            doc.text('ESTADO', margin + 80, y + 7)
            doc.text('VENCIMIENTO', margin + 130, y + 7)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(30, 41, 59)
            doc.setFontSize(9)
            doc.text(f.contratoId.slice(0, 16) + '…', margin + 5, y + 16)
            doc.text(f.estado.toUpperCase(), margin + 80, y + 16)
            doc.text(formatFecha(f.fechaVencimiento), margin + 130, y + 16)

            y += 38

            // Tabla de detalle
            doc.setFillColor(37, 99, 235)
            doc.rect(margin, y, W - margin * 2, 9, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(8)
            doc.setFont('helvetica', 'bold')
            doc.text('DESCRIPCIÓN', margin + 4, y + 6)
            doc.text('CONSUMO', W - margin - 80, y + 6)
            doc.text('IMPORTE', W - margin - 4, y + 6, { align: 'right' })

            y += 9
            const rows = [
                ['Servicio de agua potable', `${f.consumoM3} m³`, formatBs(f.total)],
            ]
            rows.forEach((row, i) => {
                doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252)
                doc.rect(margin, y, W - margin * 2, 9, 'F')
                doc.setTextColor(30, 41, 59)
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8)
                doc.text(row[0], margin + 4, y + 6)
                doc.text(row[1], W - margin - 80, y + 6)
                doc.text(row[2], W - margin - 4, y + 6, { align: 'right' })
                y += 9
            })

            // Total
            y += 4
            doc.setFillColor(239, 246, 255)        // blue-50
            doc.roundedRect(W - margin - 70, y, 70, 14, 2, 2, 'F')
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(37, 99, 235)
            doc.text('TOTAL A PAGAR', W - margin - 66, y + 6)
            doc.setFontSize(11)
            doc.text(formatBs(f.total), W - margin - 4, y + 10, { align: 'right' })

            // ── Pie ──────────────────────────────────────────────────
            doc.setDrawColor(226, 232, 240)        // slate-200
            doc.line(margin, 270, W - margin, 270)
            doc.setFontSize(7)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(148, 163, 184)        // slate-400
            doc.text('Generado por el sistema ELAPAS · Este documento es válido como comprobante de facturación.', W / 2, 275, { align: 'center' })
            doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-BO')}`, W / 2, 280, { align: 'center' })

            doc.save(`Factura-${f.periodo}-${f.id.slice(0, 8)}.pdf`)
        } finally {
            setDescargando(null)
        }
    }

    return (
        <AdminLayout>
            <div className="space-y-6">

                {/* Encabezado */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Facturas</h1>
                        <p className="text-sm text-slate-400 mt-0.5"><span>{total} facturas registradas</span></p>
                    </div>
                    <button
                        onClick={() => setShowGenerar(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all text-sm active:scale-95 shadow-lg shadow-blue-600/20">
                        <Zap size={17} /> Generar Facturas
                    </button>
                </div>

                {/* Mensaje éxito */}
                {successMsg && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
                        <CheckCircle2 size={16} />
                        {successMsg}
                        <button onClick={() => setSuccessMsg('')} className="ml-auto text-emerald-500 hover:text-emerald-700">
                            <X size={15} />
                        </button>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-100 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">Total</p>
                        <p className="text-2xl font-bold text-slate-900">{total}</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-xs text-amber-600 mb-1">Pendientes</p>
                        <p className="text-2xl font-bold text-amber-700">{pendientes}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <p className="text-xs text-red-500 mb-1">Vencidas</p>
                        <p className="text-2xl font-bold text-red-600">{vencidas}</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <p className="text-xs text-emerald-600 mb-1">Pagadas</p>
                        <p className="text-2xl font-bold text-emerald-700">{pagadas}</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-3 items-center">
                    <select
                        value={estadoFilter}
                        onChange={e => { setEstadoFilter(e.target.value); setPage(1) }}
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all">
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="pagada">Pagada</option>
                        <option value="vencida">Vencida</option>
                    </select>
                    <input
                        type="text"
                        value={periodoFilter}
                        onChange={e => { setPeriodoFilter(e.target.value); setPage(1) }}
                        placeholder="Período (ej: 2026-05)"
                        className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-600 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all font-mono w-40"
                    />
                    {(estadoFilter || periodoFilter) && (
                        <button
                            onClick={() => { setEstadoFilter(''); setPeriodoFilter(''); setPage(1) }}
                            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                            <X size={13} /> Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>
                )}

                {/* Tabla */}
                <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={28} className="animate-spin text-slate-300" />
                        </div>
                    ) : facturas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <FileText size={36} className="mb-3 opacity-30" />
                            <p className="text-sm">No hay facturas para los filtros aplicados</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50">
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Período</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Contrato</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Consumo</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Total</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Estado</th>
                                    <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400">Vencimiento</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400">PDF</th>
                                </tr>
                            </thead>
                            <tbody>
                                {facturas.map((f, i) => (
                                    <tr key={f.id}
                                        className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                                        <td className="px-5 py-3.5">
                                            <span className="font-mono font-semibold text-slate-800">{f.periodo}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                {f.contratoId.slice(0, 8)}…
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="font-semibold text-blue-700">{f.consumoM3}</span>
                                            <span className="text-slate-400 text-xs ml-1">m³</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="font-bold text-slate-900">{formatBs(f.total)}</span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${ESTADO_STYLES[f.estado]}`}>
                                                {ESTADO_ICONS[f.estado]}{f.estado}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500 text-xs">
                                            {formatFecha(f.fechaVencimiento)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button
                                                onClick={() => handleDescargarPdf(f)}
                                                disabled={descargando === f.id}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                title="Descargar PDF">
                                                {descargando === f.id
                                                    ? <Loader2 size={14} className="animate-spin text-blue-500" />
                                                    : <Download size={14} />
                                                }
                                            </button>
                                        </td>
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
                            {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} de {total} facturas
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

            {showGenerar && (
                <GenerarModal
                    onClose={() => setShowGenerar(false)}
                    onGenerado={(n) => {
                        setShowGenerar(false)
                        setSuccessMsg(`✓ Se generaron ${n} factura${n !== 1 ? 's' : ''} correctamente.`)
                        fetchFacturas()
                    }}
                />
            )}
        </AdminLayout>
    )
}

export default FacturasAdmin
