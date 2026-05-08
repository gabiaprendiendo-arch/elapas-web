import z from "zod"

const prediosSchema = z.object({
    id: z.string(),
    distritoId: z.string(),
    direccion: z.string(),
    latitud: z.string().nullable().optional(),
    longitud: z.string().nullable().optional(),
    createdAt: z.string(),
})

export const predioSchemaCreate = z.object({
    distritoId: z.string().min(1),
    direccion: z.string().min(1),
    latitud: z.string().optional(),
    longitud: z.string().optional(),
})

export const predioSchemaUpdate = predioSchemaCreate.partial()

export type Predio = z.infer<typeof prediosSchema>
export type PredioCreate = z.infer<typeof predioSchemaCreate>
export type PredioUpdate = z.infer<typeof predioSchemaUpdate>
