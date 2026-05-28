/*Este archivo no se debe de modificar para el resto de la construcción
 de la prueba, version simplificada sin revision de rol completo
 para facilitar etapa de prueba de arquitectura */

// src/navigation/AppRouter.tsx
import { Routes, Route } from 'react-router-dom';
import MerchantStack from './stacks/MerchantStack';

export const AppRouter = () => {
  const SIMULATED_USER = { id: 104, role: 'MERCHANT' };

  return (
    <Routes>
      {/* 🔴 ASEGÚRATE DE QUE EL PATH SEA "/*" */}
      <Route path="/*" element={<MerchantStack userId={SIMULATED_USER.id} />} />
    </Routes>
  );
};
export default AppRouter;