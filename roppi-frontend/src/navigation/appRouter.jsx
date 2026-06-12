// src/navigation/AppRouter.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import ComercianteStack from './stacks/ComercianteStack';
// import ClienteStack from './stacks/ClienteStack';
// import AuthStack from './stacks/AuthStack';
// import { ProtectedRoute } from '../components/ProtectedRoute';
// import { useAuth } from '../context/AuthContext';

export const AppRouter = () => {
  // Stub temporal — redirige directo al comerciante sin pasar por auth
  // Restaurar cuando el login esté conectado:
  //   const { user } = useAuth();
  const user = { id: 1, role: 'MERCHANT', name: 'Comerciante Test' };

  return (
    <Routes>
      {/* <Route path="/auth/*" element={<AuthStack />} /> */}

      <Route path="/comerciante/*" element={<ComercianteStack user={user} />} />

      {/* Redirige cualquier otra ruta directo al comerciante */}
      <Route path="/*" element={<Navigate to="/comerciante" replace />} />

      {/* Ruteo original — restaurar cuando el login esté conectado:
      <Route
        path="/comerciante/*"
        element={
          <ProtectedRoute isAllowed={user.role === 'MERCHANT'} redirectTo="/">
            <ComercianteStack user={user} />
          </ProtectedRoute>
        }
      />
      <Route path="/*" element={<ClienteStack user={user} />} />
      */}
    </Routes>
  );
};

export default AppRouter;