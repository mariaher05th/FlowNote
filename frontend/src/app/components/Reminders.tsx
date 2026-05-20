import { useState, useEffect } from 'react';
import { remindersService, Reminder } from '../../services/reminders.service';

function formatFecha(fechaStr: string) {
  const fecha = new Date(fechaStr);
  const hoy = new Date();
  const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);

  const hora = fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  const esHoy = fecha.toDateString() === hoy.toDateString();
  const esManana = fecha.toDateString() === manana.toDateString();

  if (esHoy) return `Hoy ${hora}`;
  if (esManana) return `Mañana ${hora}`;
  return fecha.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }) + ` ${hora}`;
}

function esPasado(fechaStr: string) {
  return new Date(fechaStr) < new Date();
}

export function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    remindersService.getAll()
      .then(data => setReminders(data.sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())))
      .catch(() => setReminders([]))
      .finally(() => setLoading(false));
  }, []);

  const marcarCompletado = async (id: string) => {
    try {
      await remindersService.marcarEnviado(id);
      setReminders(prev => prev.map(r => r._id === id ? { ...r, enviado: true } : r));
    } catch {}
  };

  const eliminar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await remindersService.eliminar(id);
      setReminders(prev => prev.filter(r => r._id !== id));
    } catch {}
  };

  const pendientes = reminders.filter(r => !r.enviado);
  const completados = reminders.filter(r => r.enviado);

  return (
    <div style={{ padding: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--card-title)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
            Recordatorios
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-fg)', fontWeight: 300, margin: 0 }}>
            {loading ? 'Cargando...' : `${pendientes.length} pendiente${pendientes.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {!loading && reminders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔔</div>
          <p style={{ color: 'var(--muted-fg)', fontWeight: 300, fontSize: '0.95rem' }}>
            No tienes recordatorios. Crea uno desde el tablero de una nota.
          </p>
        </div>
      )}

      {/* Pendientes */}
      {pendientes.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem' }}>
            Pendientes
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendientes.map(r => (
              <div key={r._id} style={{
                backgroundColor: 'var(--card-bg)', border: `0.5px solid ${esPasado(r.fecha_hora) ? '#F0C0CC' : 'var(--card-border)'}`,
                borderRadius: '14px', padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                position: 'relative',
              }}>
                {/* Ícono */}
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: esPasado(r.fecha_hora) ? '#FEE8EC' : 'var(--highlight-bg)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                  {esPasado(r.fecha_hora) ? '⚠️' : '🔔'}
                </div>

                {/* Contenido */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 400, color: 'var(--card-title)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.mensaje}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', fontWeight: 300, color: esPasado(r.fecha_hora) ? '#C04060' : 'var(--muted-fg)' }}>
                    {formatFecha(r.fecha_hora)}
                  </p>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button onClick={() => marcarCompletado(r._id)} style={{ padding: '5px 12px', borderRadius: '20px', border: 'none', backgroundColor: 'var(--highlight-bg)', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', fontWeight: 400 }}>
                    ✓ Listo
                  </button>
                  <button onClick={e => eliminar(r._id, e)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--muted-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEE8EC'; e.currentTarget.style.color = '#C04060'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--muted-fg)'; }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completados */}
      {completados.length > 0 && (
        <div>
          <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 0.75rem' }}>
            Completados
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {completados.map(r => (
              <div key={r._id} style={{ backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: '14px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#D1FAE5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>✓</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 300, color: 'var(--card-title)', textDecoration: 'line-through', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.mensaje}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-fg)' }}>{formatFecha(r.fecha_hora)}</p>
                </div>
                <button onClick={e => eliminar(r._id, e)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--muted-fg)', fontSize: '0.75rem' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
