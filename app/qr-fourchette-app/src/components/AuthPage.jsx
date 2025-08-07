import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);

  // Expose setter functions globally
  window.setIsLogin = setIsLogin;
  window.setUser = setUser;

  return (
    <div className="bg-white rounded shadow-md w-full max-w-md">
      {isLogin ? (
        <LoginForm onLoginSuccess={setUser} />
      ) : (
        <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
}
