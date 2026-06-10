// src/navigation/AppRouter.tsx
import { Routes, Route } from 'react-router-dom';
import ComercianteStack from './stacks/ComercianteStack';
import ClienteStack from './stacks/ClienteStack';
import AuthStack from './stacks/AuthStack';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext'; // Importamos el hook

export const AppRouter = () => {
  //const [user, setUser] = useState({ id: 104, role: 'MERCHANT', name: 'Juan Pérez' });
  //const [user, setUser] = useState({ id: 104, role: 'CLIENT' , name: 'María Gómez' });
  //const [user, setUser] = useState({ id: 104, role: 'GUEST', name: 'Invitado' });

   const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth/*" element={<AuthStack />} />

      <Route 
        path="/comerciante/*" 
        element={
          <ProtectedRoute isAllowed={user.role === 'MERCHANT'} redirectTo="/">
            <ComercianteStack user={user} />
          </ProtectedRoute>
        } 
      />

      <Route path="/*" element={<ClienteStack user={user} />} />
    </Routes>
  );
};

export default AppRouter;