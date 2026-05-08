import z from "zod";

const medidorSchema = z.object({
    id: z.string(),
    nroMedidor: z.string(),
    contratoId: z.string(),
    createdAt: z.string()
})

export const medidorSchemaCreate = medidorSchema.omit({
    id: true,
    createdAt: true
})

export const medidorSchemaUpdate = medidorSchema.omit({
    id: true,
    createdAt: true
})

export type Medidor = z.infer<typeof medidorSchema>
export type MedidorCreate = z.infer<typeof medidorSchemaCreate>
export type MedidorUpdate = z.infer<typeof medidorSchemaUpdate>



