export type UserAUth = {
    id: string
    name: string
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: string
    updatedAt: string
    role?: string
    estado?: boolean
}

export type DataAuth = {
    token: string
    user: UserAUth
}