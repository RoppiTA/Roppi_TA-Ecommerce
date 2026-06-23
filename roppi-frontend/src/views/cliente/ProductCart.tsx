import { Send } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const QuoteRequest: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '20px' }}>
      <h1>Va a ser el carrito de productos (en proceso)</h1>
      <button
        onClick={() => navigate("/quotes/new")}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-[#005f6a] text-white font-bold text-sm shadow-md hover:bg-[#004d56] transition-colors"
      >
        <Send className="w-4 h-4" /> Solicitar Cotización
      </button>
    </div>
  );
};

export default QuoteRequest;