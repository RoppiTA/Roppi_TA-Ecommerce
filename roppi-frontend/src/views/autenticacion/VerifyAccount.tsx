import { Mail, CheckCircle } from 'lucide-react';

interface VerifyAccountProps {
  email: string;
  onBackToLogin: () => void;
}

export default function VerifyAccount({ email, onBackToLogin }: VerifyAccountProps) {
  return (
    <div className="w-full max-w-md font-primary">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        <div className="text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-brand-light">
              <Mail size={40} className="text-primary2" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center bg-primary2 text-white">
              <CheckCircle size={18} />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-4 text-primary-hover">
            Verifica tu Cuenta
          </h1>

          <p className="mb-4 text-text-dark">
            Hemos enviado un correo de verificación a:
          </p>

          <p className="mb-6 px-4 py-3 rounded-lg bg-brand-light text-primary-hover font-bold">
            {email}
          </p>

          <div className="text-left mb-6 space-y-3 text-text-dark">
            <p className="text-sm font-medium">Por favor sigue estos pasos:</p>
            <ol className="list-decimal list-inside text-sm space-y-2 ml-2 text-text-muted">
              <li>Revisa tu bandeja de entrada</li>
              <li>Abre el correo de verificación</li>
              <li>Haz clic en el enlace de activación</li>
              <li>Regresa aquí para iniciar sesión</li>
            </ol>
          </div>

          <div className="p-4 rounded-lg mb-6 text-sm bg-brand-light text-brand-dark">
            <p>
              <strong>Nota:</strong> Si no ves el correo, revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>

          <button
            onClick={onBackToLogin}
            className="w-full py-3 rounded-lg text-white font-medium bg-primary2 hover:bg-primary-hover transition-colors cursor-pointer shadow-md"
          >
            Ir al Inicio de Sesión
          </button>
        </div>
      </div>
    </div>
  );
}