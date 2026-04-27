import { useState } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { useAuth } from './hooks/useAuth'

const LoginScreen = () => {

    const { login, user } = useAuth()
    const [email, setEmail] = useState('test@example.com')
    const [password, setPassword] = useState('password123')
    const handleLogin = async () => {
        await login({ email: email, password: password })
    }

    return (
        <div className='flex flex-col justify-center items-center'>
            <p className='text-3xl text-red-800'>
                {user?.name || "uknow"}
            </p>
            <p className='text-3xl text-red-800'>
                {user?.email || "uknow"}
            </p>
            <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='hello ibling'
            />

            <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='hello ibling'
            />
            <Button onClick={handleLogin}>
                hello
            </Button>
        </div>
    )
}
export default LoginScreen