// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPIService } from '../api/auth.api';
import { isTokenExpired } from '../api/apiCliente';

// Tipos base
export type UserRole = 'COMERCIANTE' | 'CLIENTE' | 'GUEST';
export type AuthError = 'none' | 'invalid-account' | 'incorrect-credentials' | 'account-locked';

// Definición de usuario
interface User {
  id: number;
  role: UserRole[];
  name: string;
}

// Datos para registro
export interface RegisterData {
  fullName: string;
  email: string;
  documentType: string;
  documentNumber: string;
  password: string;
}

// Contexto de autenticación
interface AuthContextType {
  user: User;
  token: string | null;
  login: (email: string, pass: string) => Promise<AuthError>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  resetPassword: (id: number, newPass: string) => Promise<boolean>;
}

// Crear contexto con valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeToken = (token: string): User | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      role: payload.roles ?? ['GUEST'],  // ✅ array completo
      name: payload.nombre ?? 'Usuario',
    };
  } catch {
    return null;
  }
};


// Proveedor de autenticación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('roppi_token');
    if (!savedToken || isTokenExpired(savedToken)) {
      localStorage.removeItem('roppi_token'); // limpia si venció
      return null;
    }
    return savedToken;
  });
  const [user, setUser] = useState<User>(() => {
    const savedToken = localStorage.getItem('roppi_token');
    console.log('savedToken:', savedToken); // ¿hay token?
    if (savedToken && !isTokenExpired(savedToken)) {
      const decoded = decodeToken(savedToken);
      console.log('decoded:', decoded); // ¿qué trae?
      if (decoded) return decoded;
    }
    return { id: 0, role: ['GUEST'], name: 'Invitado' };
  });
  // Simulación de BD para el API
  /*{const [simulatedDB, setSimulatedDB] = useState([
    { email: 'comerciante@roppi.com', pass: '123456', user: { id: 104, role: 'MERCHANT' as UserRole, name: 'Juan Pérez' } },
    { email: 'cliente@roppi.com', pass: '123456', user: { id: 105, role: 'CLIENT' as UserRole, name: 'María Gómez' } }
  ]);}*/

  // Agregar esto después de los useState, antes de las funciones

  // Simulación del endpoint de Login
  const login = async (email: string, pass: string): Promise<AuthError> => {
    // Validar bloqueo previo
    const lockTime = localStorage.getItem('auth_lockout');
    if (lockTime && Date.now() < parseInt(lockTime)) return 'account-locked';
    if (lockTime) localStorage.removeItem('auth_lockout'); // Ya pasó el tiempo

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Validar "Cuenta inexistente o no activa" (Unificados)
    if (email === 'inexistente@ejemplo.com' || email === 'noactivado@ejemplo.com') {
      return 'invalid-account';
    }

    try{
      const foundUser = await AuthAPIService.validarCuenta(email, pass);
      setToken(foundUser.data.token); // guardar el token
      localStorage.setItem('roppi_token', foundUser.data.token);
      setUser({
        id: foundUser.data.usuario.id,
        role: foundUser.data.usuario.roles,
        name: foundUser.data.usuario.nombre
      });
      localStorage.removeItem('auth_attempts');
      
      if (foundUser.data.usuario.roles.includes('COMERCIANTE')) navigate('/comerciante');
      else navigate('/');
    } catch (err: any) {
      const backendMessage = err.response?.data?.mensaje || err.response?.data?.message || 'Error de autenticación';
      throw new Error(backendMessage);
    }
    return 'none';
  };

  // Lógica interna para manejar los 3 intentos fallidos
  const handleFailedAttempt = () => {
    const attempts = parseInt(localStorage.getItem('auth_attempts') || '0') + 1;
    if (attempts >= 3) {
      const lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutos en milisegundos
      localStorage.setItem('auth_lockout', lockUntil.toString());
      localStorage.removeItem('auth_attempts');
    } else {
      localStorage.setItem('auth_attempts', attempts.toString());
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('roppi_token');
    setUser({ id: 0, role: ['GUEST'], name: 'Invitado' });
    navigate('/auth');
  };

  // Simulación del endpoint de recuperar contraseña
  const forgotPassword = async (email: string) => {
    try{
      const resultado = await AuthAPIService.recuperarContrasena(email);
      return true;
    }catch(err: any){
      console.log(err);
      const backendMessage = err.response?.data?.mensaje || err.response?.data?.message || 'Error de validacion';
      throw new Error(backendMessage);
    }
  };

  const register = async (data: RegisterData) => {
    
    try {
      const nuevo = await AuthAPIService.createUsuario(data.fullName, data.email, data.password, data.documentNumber, data.documentType);
      return true;
    } catch (err){
        console.error("Error al crear cuenta", err);
        throw err;
    }
    
    /*{// llamar a la api que crea el usuario
    setSimulatedDB(prev => [...prev, newUser]);
    
    return true;}*/
  };

  const resetPassword = async (id: number, newPass: string) => {
    try{
      await AuthAPIService.resetearContrasena(id, newPass);
      return true;
    }catch(err: any){
      const backendMessage = err.response?.data?.mensaje || err.response?.data?.message || 'Error al restablecer la contraseña';
      throw new Error(backendMessage);
    }
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, forgotPassword, register, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  return context;
};