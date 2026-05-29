/*Este archivo no se debe de modificar para el resto de la construcción
 de la prueba, version simplificada sin revision de rol completo
 para facilitar etapa de prueba de arquitectura
 path="*" element=<ComercianteStack userId={SIMULATED_USER.id} />
 */

// src/navigation/AppRouter.tsx
import { Routes, Route } from 'react-router-dom';
//import ComercianteStack from './stacks/ComercianteStack';


import DetalleProducto from '../views/comerciante/DetalleProducto';
import DefaultComerciante from '../views/DefaultComerciante';

export const AppRouter = () => {
  const SIMULATED_USER = { id: 104, role: 'MERCHANT' };

  return (
    <Routes>
      {/* 🔴 ASEGÚRATE DE QUE EL PATH SEA "/*" */}
      <Route path="*" element={<DefaultComerciante/>}/>


      //ESTOY PROBANDO LAS RUTAS ACA PORQUE NECESITO PROBAR
      <Route path="products/new" element={<DetalleProducto/>}/>
      <Route path="products/view/*" element={<DetalleProducto/>}/>
      <Route path="products/edit" element={<DetalleProducto/>}/>
    </Routes>
  );
};
export default AppRouter;