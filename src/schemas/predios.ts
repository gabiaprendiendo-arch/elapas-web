import z from "zod";

const prediosSchema = z.object({
    id: z.string(),
    distritoId: z.string(),
    direccion: z.string(),
    latitud: z.string(),
    longitud: z.string(),
    createdAt: z.string(),
})

export const predioSchemaCreate = prediosSchema.omit({
    id: true,
    createdAt: true,
})
export const predioSchemaUpdate = prediosSchema.omit({
    id: true,
    createdAt: true,
})

export type Predio = z.infer<typeof prediosSchema>
export type PredioCreate = z.infer<typeof predioSchemaCreate>
export type PredioUpdate = z.infer<typeof predioSchemaUpdate>