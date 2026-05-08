import z from "zod";

const distritoSchema = z.object({
    id: z.string(),
    nombre: z.string(),
    codigo: z.string()
})

export const distritoSchemaCreate = distritoSchema.omit({
    id: true
})

export const distritoSchemaUpdate = distritoSchema.partial().omit({
    id: true
})

export type Distrito = z.infer<typeof distritoSchema>
export type DistritoCreate = z.infer<typeof distritoSchemaCreate>
export type DistritoUpdate = z.infer<typeof distritoSchemaUpdate>

