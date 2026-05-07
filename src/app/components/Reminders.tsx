const reminders = [
  { id: 1, title: 'Revisar objetivos semanales', note: 'Objetivos semanales', time: 'Viernes 5:00 PM',   repeat: 'Cada semana',  status: 'active',   color: '#E0D8F8', accent: '#8070C8' },
  { id: 2, title: 'Reunión de equipo',           note: 'Reunión de equipo',   time: 'Lunes 9:00 AM',    repeat: 'Cada semana',  status: 'active',   color: '#F8D8EC', accent: '#C070A0' },
  { id: 3, title: 'Entregar informe Q2',         note: 'Q2 Planning Notes',   time: 'Miércoles 3:00 PM', repeat: 'Una vez',     status: 'active',   color: '#D8ECF8', accent: '#7090B8' },
  { id: 4, title: 'Retomar nota pendiente',      note: 'Diseño UI FlowNote',  time: 'Mañana 10:00 AM',  repeat: 'Contextual',   status: 'active',   color: '#F0EAF8', accent: '#9080B8' },
  { id: 5, title: 'Revisar feedback',            note: 'Q2 Planning Notes',   time: 'Jueves 4:00 PM',   repeat: 'Cada semana',  status: 'inactive', color: '#F4F0FC', accent: '#C0B0D8' },
];

export function Reminders() {
  return (
    <div style={{ padding: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#2F2840', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>Recordatorios</h1>
          <p style={{ fontSize: '0.875rem', color: '#B0A0C0', fontWeight: 300, margin: 0 }}>Contextuales e inteligentes</p>
        </div>
        <button style={{
          padding: '0.5rem 1.25rem', borderRadius: '20px', border: 'none',
          cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 400,
          backgroundColor: '#8070C8', color: '#FFFFFF',
        }}>+ Nuevo recordatorio</button>
      </div>

      {/* Info banner */}
      <div style={{
        backgroundColor: '#EDE8F8', border: '0.5px solid #D8D0EC',
        borderRadius: '14px', padding: '1rem 1.5rem',
        marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <span style={{ fontSize: '1.25rem' }}>🧠</span>
        <div>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 400, color: '#7060A8' }}>Recordatorios contextuales</p>
          <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 300, color: '#9080B0' }}>
            FlowNote aprende tus hábitos y sugiere acciones en el momento adecuado según tu historial de uso.
          </p>
        </div>
      </div>

      {/* Reminders list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {reminders.map(r => (
          <div key={r.id} style={{
            backgroundColor: '#FFFFFF', border: '0.5px solid #E4DCF4',
            borderRadius: '14px', padding: '1rem 1.5rem',
            display: 'flex', alignItems: 'center', gap: '1rem',
            opacity: r.status === 'inactive' ? 0.5 : 1,
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              backgroundColor: r.color, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem',
            }}>🔔</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 400, color: '#2F2840' }}>{r.title}</p>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 300, color: '#B0A0C0' }}>
                Nota: {r.note} · {r.repeat}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 400, color: r.accent }}>{r.time}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 300, color: '#C0B0D0' }}>
                {r.status === 'active' ? 'Activo' : 'Inactivo'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}