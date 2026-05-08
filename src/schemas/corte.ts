import { z } from "zod";

export const corteSchema = z.object({
    id: z.string(),
    contratoId: z.string(),
    brigadistaId: z.string(),
    motivo: z.string(),
    fotoUrl: z.string(),
    latitud: z.string(),
    longitud: z.string(),
    fechaCorte: z.coerce.date(),
    estado: z.enum(["efectuado", "reconectado"]),
    createdAt: z.coerce.date(),
});

// Tipo de TypeScript para este esquema
export type Corte = z.infer<typeof corteSchema>;