import axios from 'axios';

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// ✅ Helper reutilizable (también lo usará AuthContext)
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// Interceptor de REQUEST — corta antes de enviar si el token ya expiró
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('roppi_token');
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('roppi_token');
    window.location.href = '/auth';
    return Promise.reject(new Error('Token expirado'));
  }
  return config;
});

// Interceptor de RESPONSE — por si el backend rechaza con 401
/*{apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('roppi_token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);}*/

export default apiClient;