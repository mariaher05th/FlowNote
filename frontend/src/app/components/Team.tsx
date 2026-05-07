const members = [
  { initials: 'MJ', name: 'Maria José',   role: 'Editor',     notes: 12, color: '#8070C8', bg: '#E0D8F8' },
  { initials: 'AS', name: 'Ana Sofía',    role: 'Revisor',    notes: 8,  color: '#C070A0', bg: '#F8D8EC' },
  { initials: 'TK', name: 'Tomás K.',     role: 'Observador', notes: 3,  color: '#7090B8', bg: '#D8ECF8' },
  { initials: 'LR', name: 'Laura Ruiz',   role: 'Editor',     notes: 9,  color: '#8070C8', bg: '#E0D8F8' },
  { initials: 'PM', name: 'Pedro M.',     role: 'Revisor',    notes: 5,  color: '#C070A0', bg: '#F8D8EC' },
];

const roleDesc: Record<string, string> = {
  Editor:     'Puede crear, editar y asignar tareas',
  Revisor:    'Puede comentar y aprobar contenido',
  Observador: 'Solo lectura',
};

export function Team() {
  return (
    <div style={{ padding: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#2F2840', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>Equipo</h1>
          <p style={{ fontSize: '0.875rem', color: '#B0A0C0', fontWeight: 300, margin: 0 }}>{members.length} miembros activos</p>
        </div>
        <button style={{
          padding: '0.5rem 1.25rem', borderRadius: '20px', border: 'none',
          cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 400,
          backgroundColor: '#8070C8', color: '#FFFFFF',
        }}>+ Invitar miembro</button>
      </div>

      {/* Role legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { role: 'Editor',     color: '#8070C8', bg: '#E0D8F8' },
          { role: 'Revisor',    color: '#C070A0', bg: '#F8D8EC' },
          { role: 'Observador', color: '#7090B8', bg: '#D8ECF8' },
        ].map(r => (
          <div key={r.role} style={{
            backgroundColor: '#FFFFFF', border: '0.5px solid #E4DCF4',
            borderRadius: '14px', padding: '1rem 1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: r.color }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 400, color: '#2F2840' }}>{r.role}</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#B0A0C0', fontWeight: 300, margin: 0 }}>{roleDesc[r.role]}</p>
          </div>
        ))}
      </div>

      {/* Members list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {members.map(m => (
          <div key={m.initials} style={{
            backgroundColor: '#FFFFFF', border: '0.5px solid #E4DCF4',
            borderRadius: '14px', padding: '1rem 1.5rem',
            display: 'flex', alignItems: 'center', gap: '1rem',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              backgroundColor: m.bg, border: `2px solid ${m.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.875rem', fontWeight: 400, color: m.color, flexShrink: 0,
            }}>{m.initials}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 400, color: '#2F2840' }}>{m.name}</p>
              <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 300, color: '#B0A0C0' }}>{m.notes} notas compartidas</p>
            </div>
            <span style={{
              fontSize: '0.8125rem', fontWeight: 400,
              backgroundColor: m.bg, color: m.color,
              padding: '4px 14px', borderRadius: '20px',
            }}>{m.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}