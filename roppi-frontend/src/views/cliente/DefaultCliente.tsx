import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Compass, Sparkles, ShieldCheck } from 'lucide-react';

export default function DefaultCliente() {
  const navigate = useNavigate();

  // Cambiar a '/productos' si tu archivo App.tsx o enrutador usa esa ruta exacta
  const handleExploreProducts = () => {
    navigate('/products'); 
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto bg-gray-50/50 flex flex-col justify-center items-center p-6 animate-in fade-in duration-300">
      
      {/* Contenedor Principal en forma de Tarjeta Hero */}
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-primary-hover/10 shadow-xl p-8 md:p-12 text-center relative overflow-hidden">
        
        {/* Adornos de fondo abstractos muy sutiles */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-brand-light/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-primary2/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-md mx-auto">
          
          {/* Icono de bienvenida destacado */}
          <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary2/10">
            <ShoppingBag size={32} className="text-primary2" />
          </div>

          {/* Textos Principales */}
          <h1 className="text-3xl font-extrabold text-brand-dark mb-3 tracking-tight">
            ¡Qué bueno verte de nuevo!
          </h1>
          <p className="text-sm text-brand-muted leading-relaxed mb-8">
            Bienvenido a tu espacio personal en <span className="font-bold text-primary-hover">Roppi</span>. Desde aquí puedes explorar los mejores artículos del mercado, solicitar cotizaciones personalizadas y gestionar tus compras de manera fácil y segura.
          </p>

          {/* Botón de Acción Principal (Call to Action) */}
          <button
            onClick={handleExploreProducts}
            className="group w-full py-3.5 px-6 bg-primary2 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-hover shadow-lg hover:shadow-primary2/20 transition-all cursor-pointer text-sm"
          >
            Explorar catálogo de productos
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <hr className="border-gray-100 my-8" />

          {/* Mini-sección de beneficios rápidos para rellenar el Dashboard */}
          <div className="grid grid-cols-3 gap-4 text-left">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <Compass size={18} className="text-primary2 mb-1.5" />
              <p className="text-xs font-bold text-brand-dark mb-0.5">Variedad</p>
              <p className="text-[10px] text-brand-muted leading-tight">Miles de opciones personalizables.</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <Sparkles size={18} className="text-primary2 mb-1.5" />
              <p className="text-xs font-bold text-brand-dark mb-0.5">A medida</p>
              <p className="text-[10px] text-brand-muted leading-tight">Ajusta dimensiones y colores.</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <ShieldCheck size={18} className="text-primary2 mb-1.5" />
              <p className="text-xs font-bold text-brand-dark mb-0.5">Seguridad</p>
              <p className="text-[10px] text-brand-muted leading-tight">Monitoreo y soporte continuo.</p>
            </div>
          </div>

          {/* Footer sutil */}
          <p className="mt-8 text-[10px] text-brand-muted/70 uppercase tracking-widest font-semibold">
            Roppi E-Commerce
          </p>

        </div>
      </div>

    </div>
  );
}