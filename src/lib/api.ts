import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // withCredentials envía automáticamente las cookies de sesión de better-auth
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// NO se usa Bearer token — better-auth autentica por cookie de sesión (better-auth.session_token)
// El interceptor de request no agrega Authorization header

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Sesión expirada o inválida — limpiar y redirigir
            localStorage.removeItem('auth_user')
            localStorage.removeItem('auth_token')
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error);
    },
);

export default api;
