import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    // withCredentials envía automáticamente las cookies de sesión de better-auth
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Limpiar sesión local
            localStorage.removeItem('auth_user')
            localStorage.removeItem('auth_token')
            // Disparar evento para que el contexto de auth reaccione
            window.dispatchEvent(new CustomEvent('auth:expired'))
        }
        return Promise.reject(error);
    },
);

export default api;
