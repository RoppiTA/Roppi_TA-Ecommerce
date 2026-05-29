//Se crea un cliente de Axios para realizar solicitudes HTTP a la 
//API del backend. Se guarda el url base de la API.
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:3000/api', // URL futura de backend
  headers: {
     'Content-Type': 'application/json', 
     'Accept': 'application/json'
    },
});

export default apiClient;