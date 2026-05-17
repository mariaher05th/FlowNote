export function NoteEditor() {
  return (
    <div style={{ padding: '4rem 3rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Saludo */}
      <p style={{ fontSize: '0.9375rem', fontWeight: 300, color: 'var(--muted-fg)', marginBottom: '0.5rem', letterSpacing: '0.01em' }}>
        Good morning, Majo ✦
      </p>

      {/* Título */}
      <h1 style={{ fontWeight: 300, fontSize: '2.5rem', color: 'var(--card-title)', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
        Q2 Planning Notes
      </h1>

      <p style={{ fontSize: '0.9375rem', fontWeight: 300, color: 'var(--muted-fg)', marginBottom: '2rem' }}>
        Last edited today · 3 collaborators
      </p>

      {/* Barra de colaboración */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        marginBottom: '2.5rem', padding: '1rem 1.5rem',
        backgroundColor: 'var(--team-bar-bg)', borderRadius: '16px',
        border: '0.5px solid var(--team-bar-border)',
      }}>
        {[
          { initials: 'MJ', role: 'Editor'   },
          { initials: 'AS', role: 'Reviewer' },
          { initials: 'TK', role: 'Observer' },
        ].map(user => (
          <div key={user.initials} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              backgroundColor: 'var(--sidebar-avatar-bg)',
              border: '2px solid var(--sidebar-avatar-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--sidebar-avatar-fg)', fontSize: '0.8125rem', fontWeight: 400,
            }}>
              {user.initials}
            </div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--muted-fg)', fontWeight: 300 }}>
              {user.role}
            </span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button style={{
            backgroundColor: 'transparent', border: '0.5px solid var(--card-border)',
            borderRadius: '20px', padding: '0.4rem 1rem',
            fontSize: '0.8125rem', color: 'var(--subtle-fg)',
            cursor: 'pointer', fontWeight: 300,
          }}>
            + Invite
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem',
        padding: '1.75rem', backgroundColor: 'var(--highlight-bg)',
        borderRadius: '20px', border: '0.5px solid var(--highlight-border)', marginBottom: '2rem',
      }}>
        {[
          { title: 'Pending',     status: 'pending',    tasks: ['Review budget allocations', 'Schedule team meetings', 'Update project timeline'] },
          { title: 'In Progress', status: 'inprogress', tasks: ['Draft OKRs for Q2', 'Gather stakeholder feedback'] },
          { title: 'Completed',   status: 'done',       tasks: ['Review Q1 metrics', 'Analyze team capacity', 'Identify key priorities'] },
        ].map(col => (
          <div key={col.title}>
            <div style={{
              backgroundColor: `var(--status-${col.status}-bg)`,
              padding: '0.75rem 1.25rem', borderRadius: '12px', marginBottom: '0.875rem',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <h3 style={{ color: `var(--status-${col.status}-fg)`, fontWeight: 400, fontSize: '0.9375rem', margin: 0 }}>
                {col.title}
              </h3>
              <span style={{ fontSize: '0.75rem', color: `var(--status-${col.status}-fg)`, opacity: 0.7, fontWeight: 300 }}>
                {col.tasks.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {col.tasks.map(task => (
                <div
                  key={task}
                  style={{
                    backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)',
                    borderRadius: '12px', padding: '0.875rem 1.25rem',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <p style={{ color: 'var(--card-title)', fontSize: '0.9rem', fontWeight: 400, margin: 0, lineHeight: 1.5 }}>
                    {task}
                  </p>
                </div>
              ))}

              <button style={{
                backgroundColor: 'transparent',
                border: '0.5px dashed var(--card-border)',
                borderRadius: '12px', padding: '0.75rem 1.25rem',
                cursor: 'pointer', color: 'var(--muted-fg)',
                fontSize: '0.875rem', fontWeight: 300, textAlign: 'left',
              }}>
                + Add task
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Banner de recordatorio */}
      <div style={{
        backgroundColor: 'var(--banner-bg)', border: '0.5px solid var(--banner-border)',
        borderRadius: '16px', padding: '1rem 1.5rem', marginBottom: '2rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
      }}>
        <span style={{ fontSize: '1rem' }}>🔔</span>
        <div>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 400, color: 'var(--banner-fg)' }}>
            Reminder · Friday 5:00 PM
          </p>
          <p style={{ margin: 0, fontSize: '0.8125rem', fontWeight: 300, color: 'var(--banner-sub)' }}>
            Review your weekly goals from this note
          </p>
        </div>
        <button style={{
          marginLeft: 'auto', backgroundColor: 'transparent', border: 'none',
          color: 'var(--muted-fg)', fontSize: '0.8125rem', cursor: 'pointer', fontWeight: 300,
        }}>
          Dismiss
        </button>
      </div>

      {/* Widgets de Maps y Weather */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
        {/* Maps */}
        <div style={{
          backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--status-done-bg)',
          borderRadius: '16px', padding: '1.25rem', overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        }}>
          <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--status-done-fg)', fontWeight: 400 }}>
            📍 Location
          </p>
          <div style={{ width: '100%', height: '180px', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--highlight-bg)' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345096513!2d144.9537353159044!3d-37.81627974201477!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4c2b349649%3A0xb6899234e561db11!2sEnvato!5e0!3m2!1sen!2sau!4v1234567890123!5m2!1sen!2sau"
              width="100%" height="100%" style={{ border: 0 }} loading="lazy" title="Google Maps"
            />
          </div>
        </div>

        {/* Weather */}
        <div style={{
          backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--status-inprogress-bg)',
          borderRadius: '16px', padding: '1.25rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
        }}>
          <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'var(--status-inprogress-fg)', fontWeight: 400 }}>
            🌤 Weather
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '2.75rem', fontWeight: 300, color: 'var(--card-title)', lineHeight: 1, marginBottom: '0.4rem' }}>
                72°
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 300, color: 'var(--muted-fg)' }}>San Francisco</div>
            </div>
            <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="12" fill="var(--status-pending-bg)" />
              <line x1="32" y1="8"  x2="32" y2="14" stroke="var(--status-pending-bg)" strokeWidth="2" strokeLinecap="round" />
              <line x1="32" y1="50" x2="32" y2="56" stroke="var(--status-pending-bg)" strokeWidth="2" strokeLinecap="round" />
              <line x1="56" y1="32" x2="50" y2="32" stroke="var(--status-pending-bg)" strokeWidth="2" strokeLinecap="round" />
              <line x1="14" y1="32" x2="8"  y2="32" stroke="var(--status-pending-bg)" strokeWidth="2" strokeLinecap="round" />
              <line x1="47.5" y1="16.5" x2="43.3" y2="20.7" stroke="var(--status-pending-bg)" strokeWidth="2" strokeLinecap="round" />
              <line x1="20.7" y1="43.3" x2="16.5" y2="47.5" stroke="var(--status-pending-bg)" strokeWidth="2" strokeLinecap="round" />
              <line x1="47.5" y1="47.5" x2="43.3" y2="43.3" stroke="var(--status-pending-bg)" strokeWidth="2" strokeLinecap="round" />
              <line x1="20.7" y1="20.7" x2="16.5" y2="16.5" stroke="var(--status-pending-bg)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{
            marginTop: '1.25rem', paddingTop: '1rem',
            borderTop: '0.5px solid var(--card-border)',
            color: 'var(--muted-fg)', fontSize: '0.875rem', fontWeight: 300,
          }}>
            Sunny · High 75° · Low 62°
          </div>
        </div>
      </div>

    </div>
  );
}