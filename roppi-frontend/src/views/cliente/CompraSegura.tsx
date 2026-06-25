// Elemento visual: Pantalla placeholder de compra segura
// Informa al usuario que la funcionalidad de compra directa estará disponible próximamente

import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';

export const CompraSegura = () => {
  const navigate = useNavigate();

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center p-8 text-center"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <div className="bg-white rounded-[20px] border border-[#C8E6E8] shadow-[0_2px_16px_rgba(61,30,8,0.06)] p-10 max-w-sm w-full flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary2/10 flex items-center justify-center">
          <Lock size={32} className="text-primary2" />
        </div>
        <h1 className="text-xl font-bold text-brand-dark">Compra Segura</h1>
        <p className="text-sm text-brand-muted leading-relaxed">
          Pronto podrás comprar directamente en Roppi con total seguridad y confianza.
        </p>
        <p className="text-[11px] text-brand-muted/60 bg-brand-light/40 rounded-lg px-4 py-2 border border-primary2/10">
          Funcionalidad en desarrollo — gracias por tu paciencia.
        </p>
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-1.5 text-primary2 hover:text-primary-hover text-sm font-semibold transition-colors mt-2"
        >
          <ArrowLeft size={15} />
          Volver al carrito
        </button>
      </div>
    </div>
  );
};

export default CompraSegura;
