import { z } from "zod";

export const lecturaSchema = z.object({
    id: z.string(),
    contratoId: z.string(),
    brigadistaId: z.string(),
    valorLectura: z.number(),
    fotoUrl: z.string(),
    latitud: z.string(),
    longitud: z.string(),
    fechaLectura: z.coerce.date(),
    createdAt: z.coerce.date(),
});

export type Lectura = z.infer<typeof lecturaSchema>;