// src/views/autenticacion/ResetPassword.tsx
import { useState } from 'react';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate, useSearchParams  } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const decodeTokenTemp = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch {
    return null;
  }
};

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pass: string): string[] => {
    const validationErrors: string[] = [];
    if (pass.length < 8) validationErrors.push('La contraseña debe tener mínimo 8 caracteres');
    if (!/[A-Z]/.test(pass)) validationErrors.push('Debe contener al menos una letra mayúscula');
    if (!/[0-9]/.test(pass)) validationErrors.push('Debe contener al menos un número');
    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validatePassword(password);

    if (password !== confirmPassword) {
      validationErrors.push('Las contraseñas no coinciden');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsLoading(true);

    try {
      const id = decodeTokenTemp(token);
      await resetPassword(Number(id), password);
      setSuccess(true);
    } catch (error: any) {
      setErrors([error.message || 'Error al restablecer la contraseña. El enlace podría ser inválido o haber expirado.']);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md font-primary">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100 text-center">
          <CheckCircle size={64} className="mx-auto mb-4 text-primary2" />
          <h2 className="text-xl font-medium mb-4 text-primary-hover">¡Contraseña Actualizada!</h2>
          <p className="mb-6 text-text-dark">Tu contraseña ha sido restablecida exitosamente.</p>
          <button
            onClick={() => navigate('/auth')}
            className="w-full py-3 rounded-lg text-white font-medium bg-primary2 hover:bg-primary-hover transition-colors cursor-pointer shadow-md"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full max-w-md font-primary">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center border-brand-error border">
          <p className="text-brand-error font-bold">Enlace inválido o expirado.</p>
          <button onClick={() => navigate('/auth')} className="mt-4 text-primary2 font-bold hover:underline">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md font-primary">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        <h1 className="text-center text-2xl font-bold mb-4 text-primary-hover">Nueva Contraseña</h1>
        <p className="text-center mb-8 text-text-muted text-small">
          Ingresa tu nueva contraseña
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-bold text-text-dark">Nueva Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors([]); }}
                className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-primary2 bg-white transition-colors outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="••••••••"
                required
              />
            </div>
            <p className="text-xs mt-1 text-brand-muted">Mínimo 8 caracteres, una mayúscula y un número</p>
          </div>

          <div>
            <label className="block mb-2 font-bold text-text-dark">Confirmar Nueva Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors([]); }}
                className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-primary2 bg-white transition-colors outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="p-4 rounded-lg bg-brand-error text-white shadow-sm">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="font-medium">Errores:</p>
              </div>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                {errors.map((error, index) => <li key={index}>{error}</li>)}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg text-white font-medium bg-primary2 hover:bg-primary-hover transition-colors cursor-pointer shadow-md disabled:opacity-60"
          >
            {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
}