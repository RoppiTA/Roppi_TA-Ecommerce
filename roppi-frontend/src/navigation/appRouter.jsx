// src/navigation/AppRouter.tsx
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import ComercianteStack from './stacks/ComercianteStack';
import ClienteStack from './stacks/ClienteStack';
import AuthStack from './stacks/AuthStack';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const AppRouter = () => {
  //const const [user, setUser] = useState({ id: 104, role: 'MERCHANT' });
  //const [user, setUser] = useState({ id: 104, role: 'CLIENT' });
  const [user, setUser] = useState({ id: 104, role: 'GUEST' });

  return (
    <Routes>
      {/* AUTH STACK: Público para todos */}
      <Route path="/auth/*" element={<AuthStack />} />

      {/* COMERCIANTE STACK: Protegido. Solo entra si el rol es MERCHANT */}
      <Route 
        path="/comerciante/*" 
        element={
          <ProtectedRoute isAllowed={user.role === 'MERCHANT'} redirectTo="/auth">
            <ComercianteStack userId={user.id} />
          </ProtectedRoute>
        } 
      />

      {/* 3. CLIENTE STACK: Base de la app. Tiene partes públicas y privadas,
          así que le pasamos el rol para que se proteja a sí mismo por dentro. */}
      <Route path="/*" element={<ClienteStack user={user} />} />
    </Routes>
  );
};
export default AppRouter;