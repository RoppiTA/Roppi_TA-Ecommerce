import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface ForgotPasswordProps {
  onBack: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md font-primary">
        <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
          <div className="text-center">
            <CheckCircle size={64} className="mx-auto mb-4 text-primary2" />
            <h2 className="text-xl font-medium mb-4 text-primary-hover">
              Correo Enviado
            </h2>
            <p className="mb-6 text-text-dark">
              Hemos enviado un enlace de recuperación a <strong className="text-primary font-bold">{email}</strong>
            </p>
            <p className="text-sm mb-6 text-text-muted">
              Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
            </p>
            <button
              onClick={onBack}
              className="w-full py-3 rounded-lg text-white font-medium bg-primary2 hover:bg-primary-hover transition-colors cursor-pointer shadow-md"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md font-primary">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 text-primary2 hover:text-primary-hover font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={20}/>
          Volver
        </button>

        <h1 className="text-center text-2xl font-bold mb-4 text-primary-hover">
          Recuperar Contraseña
        </h1>

        <p className="text-center mb-8 text-text-muted text-small">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>

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
                className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-primary2 bg-white transition-colors outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="tu@correo.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-white font-medium bg-primary2 hover:bg-primary-hover transition-colors cursor-pointer shadow-md"
          >
            Enviar Enlace de Recuperación
          </button>
        </form>
      </div>
    </div>
  );
}