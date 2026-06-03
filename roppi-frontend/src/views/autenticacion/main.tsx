import { useState } from 'react';
import LoginForm from './LoginForm';
import ForgotPassword from './ForgotPassword';
import RegisterForm from './RegisterForm';
import VerifyAccount from './VerifyAccount';

export default function Loggeo() {
  const [view, setView] = useState<'login' | 'forgot-password' | 'register' | 'verify'>('login');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleRegistrationComplete = (email: string) => {
    setRegisteredEmail(email);
    setView('verify');
  };

  return (
    <div className="min-h-screen size-full flex items-center justify-center" style={{ backgroundColor: '#D5E4E6' }}>
      {view === 'login' && (
        <LoginForm
          onForgotPassword={() => setView('forgot-password')}
          onRegister={() => setView('register')}
        />
      )}
      {view === 'forgot-password' && (
        <ForgotPassword onBack={() => setView('login')} />
      )}
      {view === 'register' && (
        <RegisterForm
          onBack={() => setView('login')}
          onRegistrationComplete={handleRegistrationComplete}
        />
      )}
      {view === 'verify' && (
        <VerifyAccount
          email={registeredEmail}
          onBackToLogin={() => setView('login')}
        />
      )}
    </div>
  );
}