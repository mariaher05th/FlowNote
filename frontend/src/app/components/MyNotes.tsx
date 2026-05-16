import { useState } from 'react';

const notes = [
  { id: 1, title: 'Q2 Planning Notes',     preview: 'Review budget, OKRs, team meetings...', status: 'inprogress', date: 'Hoy',      tags: ['trabajo', 'Q2'] },
  { id: 2, title: 'Diseño UI FlowNote',    preview: 'Paleta lavender fog, componentes....',  status: 'inprogress', date: 'Ayer',     tags: ['diseño'] },
  { id: 3, title: 'Objetivos semanales',   preview: 'Revisar metas del viernes pasado...',   status: 'pending',    date: 'Lun',      tags: ['personal'] },
  { id: 4, title: 'Reunión de equipo',     preview: 'Puntos a tratar: roadmap, roles...',    status: 'pending',    date: 'Lun',      tags: ['equipo'] },
  { id: 5, title: 'Ideas de funcionalidades', preview: 'Drag and drop, notificaciones...',   status: 'done',       date: 'Dom',      tags: ['producto'] },
  { id: 6, title: 'Recursos del proyecto', preview: 'Links útiles, APIs, documentación...',  status: 'done',       date: '28 mar',   tags: ['recursos'] },
];

const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: '#F8D8EC', color: '#A06080', label: 'Pendiente' },
  inprogress: { bg: '#E0D8F8', color: '#7060A8', label: 'En progreso' },
  done:       { bg: '#D8F8EC', color: '#408060', label: 'Completado' },
};

export function MyNotes({goToBoard}: {goToBoard: () => void;}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [isCollaborativeMode, setIsCollaborativeMode] = useState(false); // ← NUEVO

  const filtered = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || n.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ padding: '3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#2F2840', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>Mis Notas</h1>
      <p style={{ fontSize: '0.875rem', color: '#B0A0C0', fontWeight: 300, margin: '0 0 2rem' }}>{notes.length} notas en total</p>

      {/* Search + filters + TOGGLE COLABORATIVO ← NUEVO */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar notas..."
          style={{
            flex: 1, minWidth: '200px', padding: '0.625rem 1rem', borderRadius: '12px',
            border: '0.5px solid #D8D0EC', backgroundColor: '#FFFFFF',
            fontSize: '0.9rem', color: '#2F2840', outline: 'none',
            fontFamily: 'inherit', fontWeight: 300,
          }}
        />
        {['all', 'pending', 'inprogress', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer',
            fontSize: '0.8125rem', fontWeight: filter === f ? 400 : 300,
            backgroundColor: filter === f ? '#E0D8F8' : '#FFFFFF',
            color: filter === f ? '#8070C8' : '#9080B0',
            border: `0.5px solid ${filter === f ? '#C8C0E0' : '#E0D8EC'}`,
          }}>
            {{ all: 'Todas', pending: 'Pendientes', inprogress: 'En progreso', done: 'Completadas' }[f]}
          </button>
        ))}
        
        {/* ← TOGGLE NUEVO AQUÍ */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: '#F8F7FA', borderRadius: '20px', border: '0.5px solid #E4DCF4' }}>
          <label style={{ fontSize: '0.8125rem', color: '#7060A8', fontWeight: 400 }}>Colaborativo</label>
          <button
            onClick={() => setIsCollaborativeMode(!isCollaborativeMode)}
            style={{
              width: '36px', height: '20px', borderRadius: '10px',
              backgroundColor: isCollaborativeMode ? '#8070C8' : '#E4DCF4',
              border: 'none', cursor: 'pointer', position: 'relative',
            }}
          >
            <div style={{
              width: '16px', height: '16px', borderRadius: '50%',
              backgroundColor: '#FFFFFF', position: 'absolute',
              top: '2px', left: isCollaborativeMode ? '18px' : '2px',
              transition: 'left 0.2s ease',
            }} />
          </button>
        </div>

        <button onClick={goToBoard} style={{ 
          padding: '0.5rem 1.25rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
          fontSize: '0.8125rem', fontWeight: 400,
          backgroundColor: '#8070C8', color: '#FFFFFF',
        }}>+ Nueva nota</button>
      </div>

      {/* ← DASHBOARD COLABORATIVO CUANDO ESTÁ ACTIVO */}
      {isCollaborativeMode && (
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#F8F7FA', 
          borderRadius: '20px', 
          border: '0.5px solid #E4DCF4',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 400, color: '#2F2840', margin: 0 }}>
              ✨ Dashboard Colaborativo
            </h2>
            <span style={{ fontSize: '0.8125rem', color: '#8070C8', fontWeight: 400 }}>2 flujos activos</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Revisión Q2', steps: ['Budget OK', 'OKRs ✗', 'Feedback ✗'] },
              { title: 'Roadmap Junio', steps: ['Prioridades ✓', 'Responsables ✗', 'Revisión ✗'] }
            ].map((flow, i) => (
              <div key={i} style={{
                backgroundColor: '#FFFFFF', border: '0.5px solid #E4DCF4',
                borderRadius: '16px', padding: '1.25rem', cursor: 'pointer'
              }}>
                <h3 style={{ fontSize: '0.9375rem', color: '#2F2840', margin: '0 0 1rem', fontWeight: 400 }}>
                  {flow.title}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {flow.steps.map((step, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '12px', height: '12px', borderRadius: '50%',
                        backgroundColor: step.includes('✓') ? '#60C090' : '#E4DCF4'
                      }} />
                      <span style={{ fontSize: '0.8125rem', color: '#5A5070' }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes grid - ORIGINAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filtered.map(note => (
          <div key={note.id} style={{
            backgroundColor: '#FFFFFF', border: '0.5px solid #E4DCF4',
            borderRadius: '16px', padding: '1.25rem', cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(128,112,200,0.12)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 400, color: '#2F2840', margin: 0, flex: 1, paddingRight: '8px' }}>{note.title}</h3>
              <span style={{
                fontSize: '0.75rem', fontWeight: 400,
                backgroundColor: statusStyle[note.status].bg,
                color: statusStyle[note.status].color,
                padding: '2px 10px', borderRadius: '20px', whiteSpace: 'nowrap',
              }}>{statusStyle[note.status].label}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9080B0', fontWeight: 300, margin: '0 0 1rem', lineHeight: 1.5 }}>{note.preview}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {note.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: '#F0EAF8', color: '#8070C8', fontWeight: 300,
                  }}>{tag}</span>
                ))}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#C0B0D0', fontWeight: 300 }}>{note.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
