import z from 'zod'

// Tipo que devuelve el backend (campos del usuario autenticado)
export const userShema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    image: z.string().nullable().optional(),
    role: z.enum(["admin", "brigadista", "ciudadano"]),
    estado: z.boolean(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
})

// El endpoint POST /usuarios espera 'nombre' (no 'name') según el DTO del backend
export const createUserSchema = z.object({
    nombre: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["admin", "brigadista", "ciudadano"]),
})

// El endpoint PUT /usuarios/:id espera campos opcionales
export const updateUserSchema = z.object({
    nombre: z.string().min(1).optional(),
    email: z.string().email().optional(),
    role: z.enum(["admin", "brigadista", "ciudadano"]).optional(),
    estado: z.boolean().optional(),
})

export type User = z.infer<typeof userShema>
export type UserCrate = z.infer<typeof createUserSchema>
export type UserUpdate = z.infer<typeof updateUserSchema>
