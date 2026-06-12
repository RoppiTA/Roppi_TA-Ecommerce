import { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LoginFormProps {
  onForgotPassword: () => void;
  onRegister: () => void;
}

export default function LoginForm({ onForgotPassword, onRegister }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activado = queryParams.get('activado');
  const errorActivacion = queryParams.get('error_activacion');

  // Eliminamos errorMessages predefinidos ya que usaremos los del backend

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAttemptCount = attemptCount + 1;
    setAttemptCount(newAttemptCount);

    if (newAttemptCount >= 5) {
      setError('Cuenta temporalmente bloqueada por múltiples intentos fallidos');
      return;
    }

    setIsLoading(true);
    setError('');

    try{
      const loggeo = await login(email, password);

    }catch(err: any){
      setError(err.message || 'Error de conexión con el servidor');
    } finally{
      setIsLoading(false);
    }
  }
  
  const isLocked = error.includes('bloqueada') || isLoading;

  return (
    <div className=  // Eliminamos errorMessages predefinidos ya que usaremos los del backend
"w-full max-w-md font-primary">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        <h1 className="text-center text-2xl font-bold mb-8 text-primary-hover">
          Iniciar Sesión
        </h1>

        {activado === 'true' && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-[#D5E4E6] text-[#0E7490] shadow-sm border border-[#0E7490]">
            <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">¡Cuenta activada exitosamente! Ya puedes iniciar sesión.</p>
          </div>
        )}

        {errorActivacion && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-brand-error text-white shadow-sm">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">Error al activar cuenta: {errorActivacion}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block mb-2 font-bold text-text-dark">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLocked}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 bg-white transition-colors outline-none focus:ring-2 focus:ring-primary/40 ${
                  error ? 'border-brand-error' : 'border-primary2'
                }`}
                placeholder="tu@correo.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 font-bold text-text-dark">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLocked}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 bg-white transition-colors outline-none focus:ring-2 focus:ring-primary/40 ${
                  error ? 'border-brand-error' : 'border-primary2'
                }`}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-brand-error text-white shadow-sm">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLocked || isLoading}
            className="w-full py-3 rounded-lg text-white font-medium bg-primary2 hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-small font-bold text-primary2 hover:text-primary-hover transition-colors cursor-pointer"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onRegister}
              className="text-small font-bold text-primary2 hover:text-primary-hover transition-colors cursor-pointer"
            >
              ¿No tienes cuenta? Regístrate
            </button>
          </div>
        </form>

        {attemptCount > 0 && attemptCount < 5 && error && (
          <p className="text-center mt-4 text-sm text-text-muted">
            Intento {attemptCount} de 5
          </p>
        )}
      </div>
    </div>
  );
}