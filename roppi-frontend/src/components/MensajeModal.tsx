import { CheckCircle, AlertCircle, X } from 'lucide-react';

//modal del sistema para comunicación con el usuario. //

interface MensajeModalProps {
  mensaje: string;
  tipo: 'exito' | 'error';
  onClose: () => void;
}

export function MensajeModal({ mensaje, tipo, onClose }: MensajeModalProps) {
  const esExito = tipo === 'exito';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-brand-light rounded-3xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Contenido */}
        <div className="p-6">
          {/* Botón cerrar */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="text-brand-muted hover:text-brand-dark transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Icono y mensaje */}
          <div className="flex flex-col items-center text-center gap-3 pb-2">
            {esExito ? (
              <CheckCircle size={40} className="text-primary-hover" />
            ) : (
              <AlertCircle size={40} className="text-brand-error" />
            )}
            <p className="text-sm font-medium text-brand-dark">{mensaje}</p>
          </div>

          {/* Botón de confirmación */}
          <button
            onClick={onClose}
            className={`mt-5 w-full py-2 rounded-full text-sm font-semibold text-white transition-colors
              ${esExito ? 'bg-primary-hover hover:bg-primary2' : 'bg-brand-error hover:opacity-90'}`}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
