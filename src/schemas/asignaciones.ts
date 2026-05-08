import { z } from "zod";

export const asignacionesSchema = z.array(
    z.object({
        asignacion: z.object({
            id: z.string(),
            brigadistaId: z.string(),
            contratoId: z.string(),
            createdAt: z.coerce.date(),
        }),
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
        distrito: z.object({
            id: z.string(),
            nombre: z.string(),
            codigo: z.string(),
        }),
        medidor: z.object({
            id: z.string(),
            nroMedidor: z.string(),
            contratoId: z.string(),
            createdAt: z.coerce.date(),
        }),
    })
);

export const aignacionSchemaCreate = z.object({
    brigadistaId: z.string(),
    contratoIds: z.array(z.string()),
});

export const aignacionSchemaUpdate = aignacionSchemaCreate.omit({
    brigadistaId: true,
})

export type Asignaciones = z.infer<typeof asignacionesSchema>;
export type AsignacionCreate = z.infer<typeof aignacionSchemaCreate>;
export type AsignacionUpdate = z.infer<typeof aignacionSchemaUpdate>;
