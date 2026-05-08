// Re-exports del portal para compatibilidad con imports existentes
export {
    getMisContratos,
    getMisFacturas,
    getMisPagos,
    generarQr,
    confirmarPago,
    type ContratoPortal,
    type FacturaPortal,
    type PagoPortal,
    type QrData,
} from "@/services/service-portal"
