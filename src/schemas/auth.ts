export type UserAUth = {
    id: string,
    name: string,
    email: string
    emailVerified: string
    image: object,
    createAt: string
    updateAt: string
}

export type DataAuth = {
    redirect: false
    token: string
    user: UserAUth
} 