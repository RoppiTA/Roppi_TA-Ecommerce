import { CheckCircle, AlertCircle, AlertTriangle, X } from 'lucide-react';

// Modal del sistema para comunicación con el usuario.
// 'cargando' — bloquea interacción mientras espera respuesta del servidor.
// 'confirmar' — pide confirmación antes de una acción destructiva.

interface MensajeModalProps {
  tipo: 'exito' | 'error' | 'cargando' | 'confirmar';
  mensaje?: string;
  onClose?: () => void;
  onConfirm?: () => void | Promise<void>;
}

export function MensajeModal({ tipo, mensaje, onClose, onConfirm }: MensajeModalProps) {
  const esCargando  = tipo === 'cargando';
  const esConfirmar = tipo === 'confirmar';
  const esExito     = tipo === 'exito';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={esCargando ? undefined : onClose}
    >
      <div
        className="bg-brand-light rounded-3xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Botón cerrar — solo en exito/error */}
          {!esCargando && !esConfirmar && (
            <div className="flex justify-end mb-2">
              <button
                onClick={onClose}
                className="text-brand-muted hover:text-brand-dark transition-colors"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Icono y mensaje */}
          <div className={`flex flex-col items-center text-center gap-3 ${esConfirmar ? 'pt-2' : 'pb-2'}`}>
            {esCargando ? (
              <div className="w-10 h-10 border-4 border-primary2/30 border-t-primary-hover rounded-full animate-spin" />
            ) : esConfirmar ? (
              <AlertTriangle size={40} className="text-brand-error" />
            ) : esExito ? (
              <CheckCircle size={40} className="text-primary-hover" />
            ) : (
              <AlertCircle size={40} className="text-brand-error" />
            )}
            <p className="text-sm font-medium text-brand-dark">
              {mensaje ?? (esCargando ? 'Cargando...' : '')}
            </p>
          </div>

          {/* Botones */}
          {esConfirmar && (
            <div className="flex gap-3 mt-5">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-full text-sm font-semibold border border-brand-muted text-brand-muted hover:bg-brand-muted/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2 rounded-full text-sm font-semibold text-white bg-brand-error hover:opacity-90 transition-colors"
              >
                Confirmar
              </button>
            </div>
          )}

          {!esCargando && !esConfirmar && (
            <button
              onClick={onClose}
              className={`mt-5 w-full py-2 rounded-full text-sm font-semibold text-white transition-colors
                ${esExito ? 'bg-primary-hover hover:bg-primary2' : 'bg-brand-error hover:opacity-90'}`}
            >
              Aceptar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
