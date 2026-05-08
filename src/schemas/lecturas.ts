import { z } from "zod"

// El backend devuelve fechas como strings ISO — las mantenemos como string
export const lecturaSchema = z.object({
    id: z.string(),
    contratoId: z.string(),
    brigadistaId: z.string(),
    valorLectura: z.number(),
    fotoUrl: z.string().nullable().optional(),
    latitud: z.string().nullable().optional(),
    longitud: z.string().nullable().optional(),
    fechaLectura: z.string(),
    createdAt: z.string(),
})

export type Lectura = z.infer<typeof lecturaSchema>
