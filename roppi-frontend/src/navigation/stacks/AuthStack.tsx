// src/navigation/stacks/AuthStack.tsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginForm from '../../views/autenticacion/LoginForm';
import ForgotPassword from '../../views/autenticacion/ForgotPassword';
import RegisterForm from '../../views/autenticacion/RegisterForm';
import VerifyAccount from '../../views/autenticacion/VerifyAccount';

export const AuthStack = () => {
  const navigate = useNavigate();

  // Reemplaza la lógica de estado enviando el email de manera segura en el historial de navegación
  const handleRegistrationComplete = (email: string) => {
    navigate('verify', { state: { email } });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#D5E4E6' }}>
      <Routes>
        {/* Vista por defecto: Login */}
        <Route 
          index 
          element={
            <LoginForm
              onForgotPassword={() => navigate('forgot-password')}
              onRegister={() => navigate('register')}
            />
          } 
        />

        {/* Vista: Recuperar contraseña */}
        <Route 
          path="forgot-password" 
          element={<ForgotPassword onBack={() => navigate('/auth')} />} 
        />

        {/* Vista: Registro */}
        <Route 
          path="register" 
          element={
            <RegisterForm onBack={() => navigate('/')} 
             onRegistrationComplete={handleRegistrationComplete}
            />
          } 
        />

        {/* Vista: Verificación de cuenta */}
        <Route path="verify" element={<VerifyAccount />} 
        />
      </Routes>
    </div>
  );
};

export default AuthStack;