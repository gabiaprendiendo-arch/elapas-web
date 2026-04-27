import z from 'zod'

export const userShema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.email(),
    emailVerified: z.boolean(),
    image: z.string().optional(),
    role: z.enum(["admin", "brigadista", "ciudadano"]),
    estado: z.boolean(),
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
})

export const createUserSchema = userShema.omit({
    id: true,
    emailVerified: true,
    image: true,
    estado: true,
    createAt: true,
    updateAt: true,
}).extend({
    password: z.string()
})

export const updateUserSchema = userShema.omit({
    id: true,
    emailVerified: true,
    image: true,
    createAt: true,
    updateAt: true,
}).partial()

export type User = z.infer<typeof userShema>
export type UserCrate = z.infer<typeof createUserSchema>
export type UserUpdate = z.infer<typeof updateUserSchema>