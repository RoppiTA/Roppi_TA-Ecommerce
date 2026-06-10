// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Tipos base
export type UserRole = 'MERCHANT' | 'CLIENT' | 'GUEST';
export type AuthError = 'none' | 'invalid-account' | 'incorrect-credentials' | 'account-locked';

// Definición de usuario
interface User {
  id: number;
  role: UserRole;
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
  resetPassword: (email: string, newPass: string) => Promise<boolean>;
}

// Crear contexto con valor inicial undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor de autenticación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({ id: 0, role: 'GUEST', name: 'Invitado' });
  const [token, setToken] = useState<string | null>(null);

  // Simulación de BD para el API
  const [simulatedDB, setSimulatedDB] = useState([
    { email: 'comerciante@roppi.com', pass: '123456', user: { id: 104, role: 'MERCHANT' as UserRole, name: 'Juan Pérez' } },
    { email: 'cliente@roppi.com', pass: '123456', user: { id: 105, role: 'CLIENT' as UserRole, name: 'María Gómez' } }
  ]);

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

    // Buscar usuario
    const foundUser = simulatedDB.find(u => u.email === email);
    if (!foundUser || foundUser.pass !== pass) {
      handleFailedAttempt();
      return 'incorrect-credentials';
    }

    // Éxito: Guardar sesión y JWT Simulado
    const mockJWT = `eyJhbGciOiJIUzI1NiIsIn...simulacion...${foundUser.user.id}`;
    setToken(mockJWT);
    setUser(foundUser.user);
    localStorage.removeItem('auth_attempts'); // Reiniciar intentos

    // Redirección por rol
    if (foundUser.user.role === 'MERCHANT') navigate('/comerciante');
    else navigate('/');
    
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
    setUser({ id: 0, role: 'GUEST', name: 'Invitado' });
    navigate('/auth');
  };

  // Simulación del endpoint de recuperar contraseña
  const forgotPassword = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    /* INTEGRACIÓN API FUTURA:
    const response = await fetch('https://tu-api.com/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!response.ok) throw new Error('Error al enviar correo');
    return true;
    */
    console.log(`Simulación: Correo de recuperación enviado a ${email}`);
    return true;
  };

  const register = async (data: RegisterData) => {

    /* 🚀 INTEGRACIÓN API FUTURA:
    const response = await fetch('https://tu-api.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error en el registro');
    // const result = await response.json();
    */

    // Simulación: Agregar el nuevo usuario a la BD local
    const newUser = {
      email: data.email,
      pass: data.password,
      user: { id: Date.now(), role: 'CLIENT' as UserRole, name: data.fullName }
    };
    setSimulatedDB(prev => [...prev, newUser]);
    
    return true;
  };

  const resetPassword = async (email: string, newPass: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    /* 🚀 INTEGRACIÓN API FUTURA:
    const response = await fetch('https://tu-api.com/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // En un flujo real, aquí enviarías un token en lugar del email directamente
      body: JSON.stringify({ email, newPassword: newPass }) 
    });
    if (!response.ok) throw new Error('Error al actualizar contraseña');
    */

    // Simulación: Cambiar la contraseña en la BD local
    setSimulatedDB(prev => 
      prev.map(u => u.email === email ? { ...u, pass: newPass } : u)
    );
    
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