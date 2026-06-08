/*Este archivo no se debe de modificar para el resto de la construcción
 de la prueba, version simplificada sin revision de rol completo
 para facilitar etapa de prueba de arquitectura
 path="*" element=<ComercianteStack userId={SIMULATED_USER.id} />
 */

// src/navigation/AppRouter.tsx
import { Routes, Route } from 'react-router-dom';
import ComercianteStack from './stacks/ComercianteStack';
import ClienteStack from './stacks/ClienteStack';
import Loggeo from '../views/autenticacion/main';

export const AppRouter = () => {
  //const SIMULATED_USER = { id: 104, role: 'MERCHANT' };
  const SIMULATED_USER = { id: 104, role: 'CLIENT' };

  if (SIMULATED_USER.role === 'MERCHANT') {
    return (
      <Routes>
        { <Route path="/*" element={<ComercianteStack userId={SIMULATED_USER.id} />} />}
      </Routes>
    );
  }
  else if (SIMULATED_USER.role === 'CLIENT') {
    return (
      <Routes>
        { <Route path="/*" element={<ClienteStack userId={SIMULATED_USER.id} />} /> }
      </Routes>
    );
  }
  else {
    return (
      <Routes>
        <Route path="/*" element={<Loggeo />} />
      </Routes>
    );
  }
};
export default AppRouter;