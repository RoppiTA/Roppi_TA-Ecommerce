//Se crea un cliente de Axios para realizar solicitudes HTTP a la 
//API del backend. Se guarda el url base de la API.

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://api.roppita.com/v1', // URL futura de backend
  headers: { 'Content-Type': 'application/json' },
});

export default apiClient;