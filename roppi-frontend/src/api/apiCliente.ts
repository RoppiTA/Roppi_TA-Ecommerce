//Se crea un cliente de Axios para realizar solicitudes HTTP a la 
//API del backend. Se guarda el url base de la API.
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`, // URL de backend
  headers: {
     'Content-Type': 'application/json', 
     'Accept': 'application/json'
    },
});

export default apiClient;