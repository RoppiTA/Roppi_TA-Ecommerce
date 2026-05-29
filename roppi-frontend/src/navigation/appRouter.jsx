/*Este archivo no se debe de modificar para el resto de la construcción
 de la prueba, version simplificada sin revision de rol completo
 para facilitar etapa de prueba de arquitectura
 path="*" element=<ComercianteStack userId={SIMULATED_USER.id} />
 */

// src/navigation/AppRouter.tsx
import { Routes, Route } from 'react-router-dom';
import ComercianteStack from './stacks/ComercianteStack';

export const AppRouter = () => {
  const SIMULATED_USER = { id: 104, role: 'MERCHANT' };

  return (
    <Routes>
      <Route path="/*" element={<ComercianteStack userId={SIMULATED_USER.id} />} />
    </Routes>
  );
};
export default AppRouter;