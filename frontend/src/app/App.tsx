import React from 'react';
import { Dashboard } from './components/Dashboard';
import { AuthPage } from './components/AuthPage';

interface AppProps {
  page: string;
}

export default function App({ page }: AppProps) {
  if (page === 'login' || page === 'register') {
    return <AuthPage initialView={page as 'login' | 'register'} />;
  }

  return (
    <div style={{ backgroundColor: '#F6F4FB', minHeight: '100vh', color: '#2F2840' }}>
      <Dashboard initialPage={page} />
    </div>
  );
}