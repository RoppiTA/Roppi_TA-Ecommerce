// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Tipos base
export type UserRole = 'MERCHANT' | 'CLIENT' | 'GUEST';
export type AuthError = 'none' | 'invalid-account' | 'incorrect-credentials' | 'account-locked';

interface User {
  id: number;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User;
  token: string | null;
  login: (email: string, pass: string) => Promise<AuthError>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({ id: 0, role: 'GUEST', name: 'Invitado' });
  const [token, setToken] = useState<string | null>(null);

  // Simulación de BD para el API
  const SIMULATED_DB = [
    { email: 'comerciante@roppi.com', pass: '123456', user: { id: 104, role: 'MERCHANT' as UserRole, name: 'Juan Pérez' } },
    { email: 'cliente@roppi.com', pass: '123456', user: { id: 105, role: 'CLIENT' as UserRole, name: 'María Gómez' } }
  ];

  // Simulación del endpoint de Login
  const login = async (email: string, pass: string): Promise<AuthError> => {
    // 1. Validar bloqueo previo
    const lockTime = localStorage.getItem('auth_lockout');
    if (lockTime && Date.now() < parseInt(lockTime)) return 'account-locked';
    if (lockTime) localStorage.removeItem('auth_lockout'); // Ya pasó el tiempo

    // Simular latencia de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // 2. Validar "Cuenta inexistente o no activa" (Unificados)
    if (email === 'inexistente@ejemplo.com' || email === 'noactivado@ejemplo.com') {
      return 'invalid-account';
    }

    // 3. Buscar usuario
    const foundUser = SIMULATED_DB.find(u => u.email === email);
    if (!foundUser || foundUser.pass !== pass) {
      handleFailedAttempt();
      return 'incorrect-credentials';
    }

    // 4. Éxito: Guardar sesión y JWT Simulado
    const mockJWT = `eyJhbGciOiJIUzI1NiIsIn...simulacion...${foundUser.user.id}`;
    setToken(mockJWT);
    setUser(foundUser.user);
    localStorage.removeItem('auth_attempts'); // Reiniciar intentos

    // 5. Redirección por rol
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
    console.log(`API Call: Enviando correo de recuperación a ${email}`);
    return true; 
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, forgotPassword }}>
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