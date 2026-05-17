import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './app/App';
import './styles/index.css';

// Componente que protege rutas privadas
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ruta pública — login y registro */}
        <Route path="/login" element={<App page="login" />} />
        <Route path="/register" element={<App page="register" />} />

        {/* Rutas privadas — solo si hay sesión */}
        <Route path="/" element={
          <PrivateRoute>
            <App page="dashboard" />
          </PrivateRoute>
        } />
        <Route path="/notas" element={
          <PrivateRoute>
            <App page="notas" />
          </PrivateRoute>
        } />
        <Route path="/workflows" element={
          <PrivateRoute>
            <App page="workflows" />
          </PrivateRoute>
        } />
        <Route path="/recordatorios" element={
          <PrivateRoute>
            <App page="recordatorios" />
          </PrivateRoute>
        } />
        <Route path="/tablero/:notaId" element={
          <PrivateRoute>
            <App page="tablero" />
          </PrivateRoute>
        } />

        {/* Cualquier ruta desconocida manda al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);