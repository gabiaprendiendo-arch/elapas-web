import z from "zod";

export const contratoSchema = z.object({
    contrato: z.object({
        id: z.string(),
        nroContrato: z.string(),
        usuarioId: z.string(),
        predioId: z.string(),
        medidorId: z.string(),
        estado: z.string(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
    }),
    predio: z.object({
        id: z.string(),
        distritoId: z.string(),
        direccion: z.string(),
        latitud: z.string(),
        longitud: z.string(),
        createdAt: z.coerce.date(),
    }),
    medidor: z.object({
        id: z.string(),
        nroMedidor: z.string(),
        contratoId: z.string(),
        createdAt: z.coerce.date(),
    }),
});

export const contratoCreateSchema = z.object({
    nroContrato: z.string(),
    usuarioId: z.string(),
    predioId: z.string(),
    medidorId: z.string(),
    estado: z.string(),
})

export const contratoUpdateSchema = contratoCreateSchema.partial();

export type Contrato = z.infer<typeof contratoSchema>;
export type ContratoCreate = z.infer<typeof contratoCreateSchema>;
export type ContratoUpdate = z.infer<typeof contratoUpdateSchema>;