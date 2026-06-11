// src/navigation/stacks/AuthStack.tsx
import { Routes, Route, useNavigate } from 'react-router-dom';
import LoginForm from '../../views/autenticacion/LoginForm';
import ForgotPassword from '../../views/autenticacion/ForgotPassword';
import RegisterForm from '../../views/autenticacion/RegisterForm';
import VerifyAccount from '../../views/autenticacion/VerifyAccount';
import ActivatedAccount from '../../views/autenticacion/ActivatedAccount';
import ResetPassword from '../../views/autenticacion/ResetPassword'; // 💡 Importamos la nueva vista

export const AuthStack = () => {
  const navigate = useNavigate();

  const handleRegistrationComplete = (email: string) => {
    navigate('/auth/verify', { state: { email } });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#D5E4E6' }}>
      <Routes>
        <Route 
          index 
          element={
            <LoginForm
              onForgotPassword={() => navigate('/auth/forgot-password')}
              onRegister={() => navigate('/auth/register')}
            />
          } 
        />

        <Route 
          path="forgot-password" 
          element={<ForgotPassword onBack={() => navigate('/auth')} />} 
        />

        {/* 💡 Agregamos la ruta de restablecimiento de contraseña */}
        <Route 
          path="reset-password" 
          element={<ResetPassword />} 
        />

        <Route 
          path="register" 
          element={
            <RegisterForm 
              onBack={() => navigate('/auth')} 
              onRegistrationComplete={handleRegistrationComplete}
            />
          } 
        />

        <Route path="verify" element={<VerifyAccount />} />
        <Route path="activated" element={<ActivatedAccount />} />
      </Routes>
    </div>
  );
};

export default AuthStack;