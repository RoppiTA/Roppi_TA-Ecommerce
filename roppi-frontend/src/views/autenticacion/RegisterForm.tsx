import { useState } from 'react';
import { Mail, Lock, User, FileText, ArrowLeft, AlertCircle } from 'lucide-react';

interface RegisterFormProps {
  onBack: () => void;
  onRegistrationComplete: (email: string) => void;
}

type DocumentType = 'DNI' | 'CE' | 'RUC';

export default function RegisterForm({ onBack, onRegistrationComplete }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    documentType: 'DNI' as DocumentType,
    documentNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): string[] => {
    const validationErrors: string[] = [];
    if (password.length < 8) validationErrors.push('La contraseña debe tener mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) validationErrors.push('Debe contener al menos una letra mayúscula');
    if (!/[0-9]/.test(password)) validationErrors.push('Debe contener al menos un número');
    return validationErrors;
  };

  const validateDocumentNumber = (documentType: DocumentType, documentNumber: string): string[] => {
    const validationErrors: string[] = [];
    if (!/^\d+$/.test(documentNumber)) {
      validationErrors.push('El número de documento solo puede contener números');
      return validationErrors;
    }
    const documentLengths: Record<DocumentType, number> = { DNI: 8, CE: 12, RUC: 11 };
    if (documentNumber.length !== documentLengths[documentType]) {
      validationErrors.push(`El ${documentType} debe tener exactamente ${documentLengths[documentType]} números`);
    }
    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: string[] = [];

    validationErrors.push(...validateDocumentNumber(formData.documentType, formData.documentNumber));
    validationErrors.push(...validatePassword(formData.password));

    if (formData.password !== formData.confirmPassword) {
      validationErrors.push('Las contraseñas no coinciden');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/usuarios/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.fullName,
          correo: formData.email,
          contraseña: formData.password,
          tipoDocumento: formData.documentType,
          numeroDocumento: formData.documentNumber
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.mensaje || 'Error al crear la cuenta');
      }

      onRegistrationComplete(formData.email);
    } catch (err: any) {
      setErrors([err.message || 'Error de conexión con el servidor']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) setErrors([]);
  };

  return (
    <div className="w-full max-w-md font-primary">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-6 text-primary2 hover:text-primary-hover font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          Volver
        </button>

        <h1 className="text-center text-2xl font-bold mb-6 text-primary-hover">
          Crear Cuenta
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block mb-2 font-bold text-text-dark">
              Nombre Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 bg-white transition-colors outline-none focus:ring-2 focus:ring-primary/40 ${errors.length > 0 ? 'border-brand-error' : 'border-primary2'
                  }`}
                placeholder="Juan Pérez García"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block mb-2 font-bold text-text-dark">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 bg-white transition-colors outline-none focus:ring-2 focus:ring-primary/40 ${errors.length > 0 ? 'border-brand-error' : 'border-primary2'
                  }`}
                placeholder="tu@correo.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="documentType" className="block mb-2 font-bold text-text-dark">
                Tipo Doc.
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" size={20} />
                <select
                  id="documentType"
                  value={formData.documentType}
                  onChange={(e) => handleChange('documentType', e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 bg-white transition-colors outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer text-text-dark ${errors.length > 0 ? 'border-brand-error' : 'border-primary2'
                    }`}
                  required
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="documentNumber" className="block mb-2 font-bold text-text-dark">
                Número
              </label>
              <input
                id="documentNumber"
                type="text"
                value={formData.documentNumber}
                onChange={(e) => /^\d*$/.test(e.target.value) && handleChange('documentNumber', e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border-2 bg-white transition-colors outline-none focus:ring-2 focus:ring-primary/40 ${errors.length > 0 ? 'border-brand-error' : 'border-primary2'
                  }`}
                placeholder={formData.documentType === 'DNI' ? '12345678' : formData.documentType === 'CE' ? '123456789012' : '12345678901'}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 font-bold text-text-dark">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 bg-white transition-colors outline-none focus:ring-2 focus:ring-primary/40 ${errors.length > 0 ? 'border-brand-error' : 'border-primary2'
                  }`}
                placeholder="••••••••"
                required
              />
            </div>
            <p className="text-xs mt-1 text-brand-muted">Mínimo 8 caracteres, una mayúscula y un número</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-2 font-bold text-text-dark">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={20} />
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-lg border-2 bg-white transition-colors outline-none focus:ring-2 focus:ring-primary/40 ${errors.length > 0 ? 'border-brand-error' : 'border-primary2'
                  }`}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {errors.length > 0 && (
            <div className="p-4 rounded-lg bg-brand-error text-white shadow-sm">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <p className="font-medium">Errores de validación:</p>
              </div>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                {errors.map((error, index) => <li key={index}>{error}</li>)}
              </ul>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg text-white font-medium bg-primary2 hover:bg-primary-hover transition-colors cursor-pointer shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}