const members = [
  { initials: 'MJ', name: 'Maria José', role: 'Editor',     notes: 12, roleKey: 'editor'     },
  { initials: 'AS', name: 'Ana Sofía',  role: 'Revisor',    notes: 8,  roleKey: 'revisor'    },
  { initials: 'TK', name: 'Tomás K.',   role: 'Observador', notes: 3,  roleKey: 'observador' },
  { initials: 'LR', name: 'Laura Ruiz', role: 'Editor',     notes: 9,  roleKey: 'editor'     },
  { initials: 'PM', name: 'Pedro M.',   role: 'Revisor',    notes: 5,  roleKey: 'revisor'    },
];

const roleDesc: Record<string, string> = {
  Editor:     'Puede crear, editar y asignar tareas',
  Revisor:    'Puede comentar y aprobar contenido',
  Observador: 'Solo lectura',
};

// Mapeo de variantes de rol a variables del tema
const roleVar: Record<string, { bg: string; fg: string }> = {
  editor:     { bg: 'var(--status-inprogress-bg)', fg: 'var(--status-inprogress-fg)' },
  revisor:    { bg: 'var(--status-pending-bg)',     fg: 'var(--status-pending-fg)'    },
  observador: { bg: 'var(--highlight-bg)',           fg: 'var(--subtle-fg)'            },
};

export function Team() {
  return (
    <div style={{ padding: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--card-title)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
            Equipo
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-fg)', fontWeight: 300, margin: 0 }}>
            {members.length} miembros activos
          </p>
        </div>
        <button style={{
          padding: '0.5rem 1.25rem', borderRadius: '20px', border: 'none',
          cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 400,
          backgroundColor: 'var(--primary)', color: 'var(--primary-fg)',
        }}>+ Invitar miembro</button>
      </div>

      {/* Leyenda de roles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {Object.entries(roleVar).map(([key, v]) => (
          <div key={key} style={{
            backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)',
            borderRadius: '14px', padding: '1rem 1.25rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: v.fg }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--card-title)', textTransform: 'capitalize' }}>{key}</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--muted-fg)', fontWeight: 300, margin: 0 }}>
              {roleDesc[key.charAt(0).toUpperCase() + key.slice(1)]}
            </p>
          </div>
        ))}
      </div>

      {/* Lista de miembros */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {members.map(m => {
          const rv = roleVar[m.roleKey];
          return (
            <div key={m.initials} style={{
              backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)',
              borderRadius: '14px', padding: '1rem 1.5rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%',
                backgroundColor: rv.bg, border: `2px solid ${rv.fg}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.875rem', fontWeight: 400, color: rv.fg, flexShrink: 0,
              }}>{m.initials}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 400, color: 'var(--card-title)' }}>{m.name}</p>
                <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 300, color: 'var(--muted-fg)' }}>
                  {m.notes} notas compartidas
                </p>
              </div>
              <span style={{
                fontSize: '0.8125rem', fontWeight: 400,
                backgroundColor: rv.bg, color: rv.fg,
                padding: '4px 14px', borderRadius: '20px',
              }}>{m.role}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}