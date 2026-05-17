import React, { useState } from 'react';
import { authService } from '../../services/auth.service';

interface AuthPageProps {
  initialView: 'login' | 'register';
}

export function AuthPage({ initialView }: AuthPageProps) {
  const [view, setView] = useState<'login' | 'register'>(initialView);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loginData, setLoginData] = useState({ email: '', contrasena: '' });
  const [registerData, setRegisterData] = useState({ nombre: '', apellido: '', email: '', username: '', contrasena: '' });

  const handleLogin = async () => {
    if (!loginData.email || !loginData.contrasena) {
      setError('Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.login(loginData);
      window.location.href = '/';
    } catch (e: any) {
      setError(e.response?.data?.message || 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerData.nombre || !registerData.apellido || !registerData.email || !registerData.username || !registerData.contrasena) {
      setError('Por favor completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.register(registerData);
      await authService.login({ email: registerData.email, contrasena: registerData.contrasena });
      window.location.href = '/';
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#F6F4FB',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Fondo decorativo */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '40vh',
        background: 'linear-gradient(135deg, #E0D8F8 0%, #F8D8EC 50%, #D8ECF8 100%)',
        zIndex: 0,
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        backgroundColor: '#FFFFFF', borderRadius: '24px',
        padding: '2.5rem', width: '100%', maxWidth: '420px',
        boxShadow: '0 8px 32px rgba(128,112,200,0.12)',
        border: '0.5px solid #E4DCF4',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 300,
            color: '#8070C8', letterSpacing: '-0.02em', margin: 0,
          }}>FlowNote</h1>
          <p style={{ fontSize: '0.875rem', color: '#B0A0C0', fontWeight: 300, margin: '4px 0 0' }}>
            {view === 'login' ? 'Bienvenida de vuelta' : 'Crea tu cuenta'}
          </p>
        </div>

        {/* Toggle login/register */}
        <div style={{
          display: 'flex', backgroundColor: '#F6F4FB',
          borderRadius: '12px', padding: '4px', marginBottom: '1.5rem',
        }}>
          {(['login', 'register'] as const).map(v => (
            <button key={v} onClick={() => { setView(v); setError(''); }} style={{
              flex: 1, padding: '0.5rem', borderRadius: '10px', border: 'none',
              cursor: 'pointer', fontSize: '0.875rem', fontWeight: view === v ? 400 : 300,
              backgroundColor: view === v ? '#FFFFFF' : 'transparent',
              color: view === v ? '#8070C8' : '#B0A0C0',
              boxShadow: view === v ? '0 2px 8px rgba(128,112,200,0.1)' : 'none',
              transition: 'all 0.2s ease',
            }}>
              {v === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            backgroundColor: '#FEE8EC', border: '0.5px solid #F0C0CC',
            borderRadius: '10px', padding: '0.75rem 1rem',
            marginBottom: '1rem', fontSize: '0.875rem', color: '#C04060',
          }}>
            {error}
          </div>
        )}

        {/* Login form */}
        {view === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#9080B0', fontWeight: 300, display: 'block', marginBottom: '6px' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                placeholder="maria@correo.com"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                  border: '0.5px solid #D8D0EC', backgroundColor: '#F6F4FB',
                  fontSize: '0.9rem', color: '#2F2840', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#9080B0', fontWeight: 300, display: 'block', marginBottom: '6px' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={loginData.contrasena}
                onChange={e => setLoginData(p => ({ ...p, contrasena: e.target.value }))}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                  border: '0.5px solid #D8D0EC', backgroundColor: '#F6F4FB',
                  fontSize: '0.9rem', color: '#2F2840', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
            </div>
            <button onClick={handleLogin} disabled={loading} style={{
              width: '100%', padding: '0.75rem', borderRadius: '12px',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: '#8070C8', color: '#FFFFFF',
              fontSize: '0.9375rem', fontWeight: 400,
              opacity: loading ? 0.7 : 1, marginTop: '0.5rem',
              transition: 'opacity 0.2s ease',
            }}>
              {loading ? 'Cargando...' : 'Iniciar sesión'}
            </button>
          </div>
        )}

        {/* Register form */}
        {view === 'register' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', color: '#9080B0', fontWeight: 300, display: 'block', marginBottom: '6px' }}>
                  Nombre
                </label>
                <input
                  value={registerData.nombre}
                  onChange={e => setRegisterData(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="María"
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                    border: '0.5px solid #D8D0EC', backgroundColor: '#F6F4FB',
                    fontSize: '0.9rem', color: '#2F2840', outline: 'none',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', color: '#9080B0', fontWeight: 300, display: 'block', marginBottom: '6px' }}>
                  Apellido
                </label>
                <input
                  value={registerData.apellido}
                  onChange={e => setRegisterData(p => ({ ...p, apellido: e.target.value }))}
                  placeholder="García"
                  style={{
                    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                    border: '0.5px solid #D8D0EC', backgroundColor: '#F6F4FB',
                    fontSize: '0.9rem', color: '#2F2840', outline: 'none',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#9080B0', fontWeight: 300, display: 'block', marginBottom: '6px' }}>
                Nombre de usuario
              </label>
              <input
                value={registerData.username}
                onChange={e => setRegisterData(p => ({ ...p, username: e.target.value }))}
                placeholder="maria_garcia"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                  border: '0.5px solid #D8D0EC', backgroundColor: '#F6F4FB',
                  fontSize: '0.9rem', color: '#2F2840', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#9080B0', fontWeight: 300, display: 'block', marginBottom: '6px' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={e => setRegisterData(p => ({ ...p, email: e.target.value }))}
                placeholder="maria@correo.com"
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                  border: '0.5px solid #D8D0EC', backgroundColor: '#F6F4FB',
                  fontSize: '0.9rem', color: '#2F2840', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8125rem', color: '#9080B0', fontWeight: 300, display: 'block', marginBottom: '6px' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={registerData.contrasena}
                onChange={e => setRegisterData(p => ({ ...p, contrasena: e.target.value }))}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                  border: '0.5px solid #D8D0EC', backgroundColor: '#F6F4FB',
                  fontSize: '0.9rem', color: '#2F2840', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
            </div>
            <button onClick={handleRegister} disabled={loading} style={{
              width: '100%', padding: '0.75rem', borderRadius: '12px',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              backgroundColor: '#8070C8', color: '#FFFFFF',
              fontSize: '0.9375rem', fontWeight: 400,
              opacity: loading ? 0.7 : 1, marginTop: '0.5rem',
              transition: 'opacity 0.2s ease',
            }}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}