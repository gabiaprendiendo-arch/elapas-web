import { z } from "zod"

// El backend devuelve fechas como strings ISO
export const corteSchema = z.object({
    id: z.string(),
    contratoId: z.string(),
    brigadistaId: z.string(),
    motivo: z.string(),
    fotoUrl: z.string().nullable().optional(),
    latitud: z.string().nullable().optional(),
    longitud: z.string().nullable().optional(),
    fechaCorte: z.string(),
    estado: z.enum(["efectuado", "reconectado"]),
    createdAt: z.string(),
})

export type Corte = z.infer<typeof corteSchema>
