/*Este archivo no se debe de modificar para el resto de la construcción
 de la prueba, version simplificada sin revision de rol completo
 para facilitar etapa de prueba de arquitectura */

import { Routes, Route, Navigate } from 'react-router-dom';
import MerchantStack from './stacks/MerchantStack';

export const AppRouter = () => {
  // Hardcodeado para cumplir el objetivo de la PoC de Roppi TA
  const currentUserRole = 'MERCHANT'; 

  return (
    <Routes>
      {/* Simulación de Guarda de Ruta por Rol global */}
      {currentUserRole === 'MERCHANT' ? (
        <Route path="/*" element={<MerchantStack />} />
      ) : (
        <Route path="*" element={<div>No tienes acceso a este rol.</div>} />
      )}
      
      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
};

export default AppRouter;