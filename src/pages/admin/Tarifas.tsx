import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/ui/AdminLayout'
import { Plus, Edit2, X, Loader2, CheckCircle2, XCircle, Settings2 } from 'lucide-react'
// Tarifas usa TarifaCreate del schema como payload de formulario
import {
    getTarifas, createTarifa, updateTarifa,
} from '@/services/service-tarifas'
import type { Tarifa, TarifaCreate } from '@/schemas/tarifas'

// Alias local para el formulario (TarifaCreate con campos string para los inputs numéricos)
type TarifaPayload = {
    nombre: string
    tramoMin: number
    tramoMax: number
    precioM3: string | number
    cargoFijo: string
    estado?: boolean
}

// ── Validación ────────────────────────────────────────────
const validate = (f: TarifaPayload): string => {
    if (!f.nombre.trim()) return 'El nombre es obligatorio.'
    if (f.tramoMin < 0) return 'El tramo mínimo no puede ser negativo.'
    if (f.tramoMax <= f.tramoMin) return 'El tramo máximo debe ser mayor al mínimo.'
    if (!f.precioM3 || isNaN(Number(f.precioM3)) || Number(f.precioM3) < 0) return 'El precio por m³ debe ser un número positivo.'
    if (!f.cargoFijo || isNaN(Number(f.cargoFijo)) || Number(f.cargoFijo) < 0) return 'El cargo fijo debe ser un número positivo.'
    return ''
}

// ── Modal de formulario ───────────────────────────────────
interface FormModalProps {
    mode: 'create' | 'edit'
    initial?: Tarifa | null
    onClose: () => void
    onSaved: () => void
}

const EMPTY_FORM: TarifaPayload = {
    nombre: '',
    tramoMin: 0,
    tramoMax: 10,
    precioM3: '0.00',
    cargoFijo: '0.00',
    estado: true,
}

const FormModal = ({ mode, initial, onClose, onSaved }: FormModalProps) => {
    const [form, setForm] = useState<TarifaPayload>(
        initial
            ? { nombre: initial.nombre, tramoMin: initial.tramoMin, tramoMax: initial.tramoMax, precioM3: initial.precioM3, cargoFijo: initial.cargoFijo, estado: initial.estado }
            : EMPTY_FORM
    )
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const set = (key: keyof TarifaPayload, value: TarifaPayload[keyof TarifaPayload]) =>
        setForm((prev: TarifaPayload) => ({ ...prev, [key]: value }))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const err = validate(form)
        if (err) { setError(err); return }
        setLoading(true)
        setError('')
        try {
            const payload: TarifaCreate = {
                nombre: form.nombre,
                tramoMin: form.tramoMin,
                tramoMax: form.tramoMax,
                precioM3: Number(form.precioM3),
                cargoFijo: String(form.cargoFijo),
                estado: form.estado ?? true,
            }
            if (mode === 'create') {
                await createTarifa(payload)
            } else if (initial) {
                await updateTarifa(initial.id, payload)
            }
            onSaved()
        } catch (e: any) {
            setError(e.message || 'Error al guardar la tarifa.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-black text-slate-900">
                        {mode === 'create' ? 'Nueva Tarifa' : 'Editar Tarifa'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre del tramo *</label>
                        <input
                            value={form.nombre}
                            onChange={e => set('nombre', e.target.value)}
                            placeholder="Ej: Tramo básico 0-10 m³"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                        />
                    </div>

                    {/* Tramos */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Tramo mínimo (m³) *</label>
                            <input
                                type="number"
                                min={0}
                                value={form.tramoMin}
                                onChange={e => set('tramoMin', Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Tramo máximo (m³) *</label>
                            <input
                                type="number"
                                min={1}
                                value={form.tramoMax}
                                onChange={e => set('tramoMax', Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                            />
                        </div>
                    </div>

                    {/* Precios */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Precio por m³ (Bs) *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Bs</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={form.precioM3}
                                    onChange={e => set('precioM3', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Cargo fijo mensual (Bs) *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">Bs</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    value={form.cargoFijo}
                                    onChange={e => set('cargoFijo', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Estado */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                        <span className="text-sm font-semibold text-slate-700">Estado:</span>
                        <button
                            type="button"
                            onClick={() => set('estado', !form.estado)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${form.estado
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-600'
                                }`}
                        >
                            {form.estado ? <><CheckCircle2 size={14} /> Activa</> : <><XCircle size={14} /> Inactiva</>}
                        </button>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Vista previa</p>
                        <p className="text-sm text-slate-700">
                            <span>Consumo de </span><strong>{form.tramoMin}</strong><span> a </span><strong><span>{form.tramoMax} m³</span></strong><span> → </span>
                            <strong><span>Bs {Number(form.precioM3).toFixed(2)}/m³</span></strong><span> + cargo fijo </span>
                            <strong><span>Bs {Number(form.cargoFijo).toFixed(2)}</span></strong>
                        </p>
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
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {mode === 'create' ? 'Crear Tarifa' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Página principal ──────────────────────────────────────
const Tarifas = () => {
    const [tarifas, setTarifas] = useState<Tarifa[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState<Tarifa | null>(null)

    const fetchTarifas = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const data = await getTarifas()
            setTarifas(data)
        } catch (e: any) {
            setError(e.message || 'Error al cargar tarifas.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchTarifas() }, [fetchTarifas])

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Encabezado */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tarifario</h1>
                
                    </div>
                    <button
                        onClick={() => { setEditTarget(null); setShowForm(true) }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                    >
                        <Plus size={20} /> Nueva Tarifa
                    </button>
                </div>

                

                {/* Error */}
                {error && (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">{error}</div>
                )}

                {/* Tabla */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="animate-spin text-blue-600" />
                        </div>
                    ) : tarifas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                            <Settings2 size={40} className="mb-3 opacity-30" />
                            <p className="font-medium">No hay tarifas configuradas</p>
                            <p className="text-sm mt-1">Crea la primera tarifa con el botón de arriba</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50/50 border-b border-slate-200">
                                <tr>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Nombre</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tramo (m³)</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Precio / m³</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Cargo Fijo</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                    <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tarifas.map((t, i) => (
                                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black border border-blue-100">
                                                    T{i + 1}
                                                </div>
                                                <span className="text-sm font-bold text-slate-900">{t.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-medium text-slate-700">
                                                {t.tramoMin} – {t.tramoMax} m³
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-black text-blue-700">
                                                Bs {Number(t.precioM3).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-sm font-medium text-slate-700">
                                                Bs {Number(t.cargoFijo).toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${t.estado
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                                : 'bg-red-50 text-red-500 border border-red-100'
                                                }`}>
                                                {t.estado ? <><CheckCircle2 size={11} /> Activa</> : <><XCircle size={11} /> Inactiva</>}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => { setEditTarget(t); setShowForm(true) }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Editar tarifa"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {showForm && (
                <FormModal
                    mode={editTarget ? 'edit' : 'create'}
                    initial={editTarget}
                    onClose={() => { setShowForm(false); setEditTarget(null) }}
                    onSaved={() => { setShowForm(false); setEditTarget(null); fetchTarifas() }}
                />
            )}
        </AdminLayout>
    )
}

export default Tarifas
