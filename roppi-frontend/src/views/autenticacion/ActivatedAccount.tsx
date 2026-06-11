import { PartyPopper, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

//Para el uso de este componente, se puede pasar el rol del usuario como prop para personalizar el mensaje y las características mostradas. 
// Si no se proporciona un rol, se asumirá 'CLIENT' por defecto.
export type UserActivatedRole = 'CLIENT' | 'MERCHANT' | 'ADMIN';

interface ActivatedAccountProps {
  role?: UserActivatedRole;
}

export default function AccountActivated({role = 'CLIENT'}: ActivatedAccountProps) {
  const navigate = useNavigate();

  // Diccionario de copys y características personalizadas por Rol
  const roleContent = {
    CLIENT: {
      subtitle: "Ahora ya puedes acceder a la tienda y explorar todo el catálogo de Roppi.",
      description: "Hemos preparado un ecosistema intuitivo para que disfrutes de una experiencia de compra única y personalizada.",
      features: [
        "Explora y descubre miles de productos únicos",
        "Gestiona tus compras y haz seguimiento en tiempo real",
        "Realiza pedidos y solicita cotizaciones al instante"
      ]
    },
    MERCHANT: {
      subtitle: "Tu espacio de venta está listo. Bienvenido al ecosistema comercial de Roppi.",
      description: "Un administrador ha completado tu inscripción para que empieces a digitalizar tu negocio y potenciar tus ventas desde hoy.",
      features: [
        "Gestiona y personaliza tu catálogo de productos",
        "Recibe, procesa y atiende pedidos eficientemente",
        "Responde a solicitudes de cotizaciones de clientes"
      ]
    },
    ADMIN: {
      subtitle: "Acceso concedido al panel de control y operaciones globales de Roppi.",
      description: "Tu cuenta administrativa ha sido configurada correctamente. Tienes las credenciales delegadas para supervisar el flujo operativo del sistema.",
      features: [
        "Control total sobre el catálogo global y comerciantes",
        "Supervisión y gestión de flujos de pedidos y cotizaciones",
        "Generación de reportes avanzados y analíticas de ventas"
      ]
    }
  };

  const currentContent = roleContent[role] || roleContent['CLIENT']; // Fallback a CLIENT si el rol no es reconocido

  return (
    <div className="w-full max-w-md font-primary animate-in fade-in zoom-in duration-300">
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-100 relative overflow-hidden">
        
        {/* Decoración sutil de fondo */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-light/30 rounded-full blur-3xl" />
        
        <div className="text-center relative z-10">
          {/* Icono de Éxito Celebratorio */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-green-50">
              <PartyPopper size={48} className="text-primary2" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center bg-green-500 text-white border-4 border-white shadow-sm">
              <CheckCircle2 size={24} />
            </div>
          </div>

          {/* Textos Principales */}
          <h1 className="text-3xl font-bold mb-2 text-primary-hover">
            ¡Cuenta Activada!
          </h1>
          
          <p className="text-lg font-medium text-brand-dark mb-4">
            Tu registro en Roppi se ha completado con éxito.
          </p>

          <hr className="border-gray-100 mb-6" />

          {/* Cuerpo del Mensaje Adaptable */}
          <div className="space-y-4 text-text-dark mb-8">
            <p className="text-sm leading-relaxed text-text-muted">
              {currentContent.description}
            </p>
            
            {/* Lista de características según el rol */}
            <ul className="text-left text-xs space-y-2.5 bg-brand-light/50 p-4 rounded-xl border border-primary2/10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-primary-hover mb-1">
                ¿Qué puedes hacer ahora?
              </p>
              {currentContent.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 leading-tight text-text-dark">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary2 mt-1.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Botón de Acción Principal */}
          <button
            onClick={() => navigate('/auth')}
            className="group w-full py-4 rounded-xl text-white font-bold bg-primary2 hover:bg-primary-hover transition-all cursor-pointer shadow-lg hover:shadow-primary2/20 flex items-center justify-center gap-2"
          >
            Volver al Inicio de Sesión
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </div>
    </div>
  );
}