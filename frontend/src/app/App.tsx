import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { AuthPage } from './components/AuthPage';
import { ThemeProvider } from './components/context/ThemeContext';

export default function App() {
  const [screen, setScreen] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? 'dashboard' : 'login';
  });

  return (
    <ThemeProvider>
      <div style={{
        backgroundColor: 'var(--app-bg)',
        minHeight: '100vh',
        color: 'var(--app-fg)',
        transition: 'background-color 0.25s, color 0.25s'
      }}>
        {screen === 'login' && (
          <AuthPage
            initialView="login"
            onSuccess={() => setScreen('dashboard')}
            goToRegister={() => setScreen('register')}
          />
        )}

        {screen === 'register' && (
          <AuthPage
            initialView="register"
            onSuccess={() => setScreen('dashboard')}
            goToLogin={() => setScreen('login')}
          />
        )}

        {screen === 'dashboard' && (
          <Dashboard onLogout={() => setScreen('login')} />
        )}
      </div>
    </ThemeProvider>
  );
}