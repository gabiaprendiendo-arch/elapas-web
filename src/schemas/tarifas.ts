import z from "zod"

const tarifaSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    tramoMin: z.number(),
    tramoMax: z.number(),
    precioM3: z.number(),
    cargoFijo: z.string(),
    estado: z.boolean(),
})

export const tarifaschemaCreate = tarifaSchema.omit({
    id: true
})

export const tarifaschemaUpdate = tarifaSchema.partial().omit({
    id: true
})

export type Tarifa = z.infer<typeof tarifaSchema>
export type TarifaCreate = z.infer<typeof tarifaschemaCreate>
export type TarifaUpdate = z.infer<typeof tarifaschemaUpdate>