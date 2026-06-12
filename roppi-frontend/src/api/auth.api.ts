import { apiClient } from "./apiCliente";

export const AuthAPIService = {
    createUsuario: async (nombre: string, correo: string, contrasena: string, documento:string, tipoDocumento: string) => {
        const dtoBackend = {
            nombre: nombre,
            correo: correo,
            contrasena: contrasena,
            numeroDocumento: documento,
            tipoDocumento: tipoDocumento
        }

        console.log(dtoBackend);

        const response = await apiClient.post<{ exito: boolean; datos: any }>('/usuarios/registro', dtoBackend);
        return response.data;
    },

    validarCuenta: async (correo: string, contrasena: string) => {
        try {
            const dtoBackend = { correo, contrasena }
            const response = await apiClient.post<{ exito: boolean; data: any }>('/usuarios/login', dtoBackend);
            return response.data;
        } catch (err: any) {
            throw err;
        }
    },

    activarUsuario: async (token: any) => {
        const response = await apiClient.get<{ exito: boolean; datos: any }>(`/usuarios/activar/${token}`);
        if (!response.data || !response.data.datos) {
            throw new Error(`Error en la validación de cuenta`);
        }
        return response.data.datos;
    },

    recuperarContrasena: async (correo : string) => {
        const dtoBackend = {correo}
        const response = await apiClient.post<{ exito: boolean; data: any}>('/usuarios/recuperar',dtoBackend);
        if (!response.data) {
            throw new Error(`Error en enviar el correo`);
        }
        return response.data;
    },

    resetearContrasena: async (usuarioId: number, nuevaContrasena: string) => {
        const dtoBackend = { usuarioId, nuevaContrasena };
        const response = await apiClient.put<{ exito: boolean; data: any }>('/usuarios/contrasena', dtoBackend);
        if (!response.data) {
            throw new Error('Error al restablecer la contraseña');
        }
        return response.data;
    }

}