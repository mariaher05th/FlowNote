import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { notesService, Note } from '../../services/notes.service';
import { NoteTeamPanel } from './Team';

interface Task { id: string; content: string; status: string; asignadoA?: string; }

function parseTareas(contenido: string): Task[] {
  try {
    const data = JSON.parse(contenido || '{}');
    return (data.items || []).filter((i: any) => i.type === 'task');
  } catch { return []; }
}

const estadoColores: Record<string, { bg: string; fg: string; dot: string; label: string }> = {
  pendiente:  { bg: '#FEF3C7', fg: '#92400E', dot: '#F59E0B', label: 'Pendiente'  },
  en_proceso: { bg: '#EDE9FE', fg: '#5B21B6', dot: '#8070C8', label: 'En proceso' },
  finalizada: { bg: '#D1FAE5', fg: '#065F46', dot: '#34D399', label: 'Finalizada' },
  pendiente_nota: { bg: '#FEF3C7', fg: '#92400E', dot: '#F59E0B', label: 'Pendiente' },
  en_progreso:    { bg: '#EDE9FE', fg: '#5B21B6', dot: '#8070C8', label: 'En progreso' },
  completado:     { bg: '#D1FAE5', fg: '#065F46', dot: '#34D399', label: 'Completada' },
};

const rolColors: Record<string, string> = { admin: '#8070C8', editor: '#C070A0', revisor: '#7090B8' };

export function Workflows() {
  const [notes, setNotes]       = useState<Note[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [teamPanel, setTeamPanel] = useState<Note | null>(null);

  const user       = JSON.parse(localStorage.getItem('user') || '{}');
  const miUsername = user.username || '';
  const miUserId   = String(user.id || user._id || '');

  const miRolEnNota = (note: Note) => {
    const col = note.colaboradores?.find(
      c => c.username === miUsername || String(c.usuario_id) === miUserId,
    );
    return col?.rol || (String(note.autor_id) === miUserId ? 'admin' : 'revisor');
  };

  const cargarNotas = () =>
    notesService.getAll()
      .then(data => {
        setNotes(data);
        setTeamPanel(prev => prev ? (data.find(n => n._id === prev._id) ?? null) : null);
      })
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));

  useEffect(() => { cargarNotas(); }, []);

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const notaEstadoCss = (estado: string) => {
    if (estado === 'completado') return { bg: 'var(--status-done-bg)', fg: 'var(--status-done-fg)', label: 'Completada' };
    if (estado === 'en_progreso') return { bg: 'var(--status-inprogress-bg)', fg: 'var(--status-inprogress-fg)', label: 'En progreso' };
    return { bg: 'var(--status-pending-bg)', fg: 'var(--status-pending-fg)', label: 'Pendiente' };
  };

  if (loading) return (
    <div style={{ padding: '3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--card-title)', margin: '0 0 0.5rem' }}>Workflows</h1>
      <p style={{ color: 'var(--muted-fg)', fontWeight: 300, fontSize: '0.875rem' }}>Cargando...</p>
    </div>
  );

  return (
    <div style={{ padding: '3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--card-title)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
        Workflows
      </h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--muted-fg)', fontWeight: 300, margin: '0 0 2rem' }}>
        {notes.length} nota{notes.length !== 1 ? 's' : ''} · flujos de trabajo activos
      </p>

      {notes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
          <p style={{ color: 'var(--muted-fg)', fontWeight: 300, fontSize: '0.95rem' }}>
            Aún no tienes notas. Crea una para empezar tu primer workflow.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notes.map(note => {
          const tareas = parseTareas(note.contenido);
          const isOpen = expanded.has(note._id);
          const css = notaEstadoCss(note.estado);
          const completadas = tareas.filter(t => t.status === 'finalizada' || t.status === 'completado').length;
          const progreso = tareas.length > 0 ? Math.round((completadas / tareas.length) * 100) : 0;

          return (
            <div key={note._id} style={{ backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: '16px', overflow: 'hidden' }}>

              {/* Header */}
              <div onClick={() => toggle(note._id)} style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Título + badges */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--card-title)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {note.titulo}
                    </h3>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', backgroundColor: css.bg, color: css.fg, fontWeight: 500, whiteSpace: 'nowrap' }}>
                      {css.label}
                    </span>
                    {note.es_colaborativa && (
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', backgroundColor: '#F0D8EC', color: '#C070A0', fontWeight: 400 }}>
                        Colaborativa
                      </span>
                    )}
                  </div>

                  {/* Progreso */}
                  {tareas.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <div style={{ flex: 1, backgroundColor: 'var(--card-border)', borderRadius: '4px', height: '4px', maxWidth: '200px' }}>
                        <div style={{ width: `${progreso}%`, backgroundColor: progreso === 100 ? '#34D399' : 'var(--primary)', borderRadius: '4px', height: '4px', transition: 'width 0.3s' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted-fg)', whiteSpace: 'nowrap' }}>
                        {completadas}/{tareas.length} tareas
                      </span>
                    </div>
                  )}
                  {tareas.length === 0 && (
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--muted-fg)', fontWeight: 300 }}>Sin tareas — abre el tablero para agregar</p>
                  )}
                </div>

                {/* Colaboradores avatares */}
                {note.es_colaborativa && note.colaboradores?.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    {note.colaboradores.slice(0, 3).map(c => (
                      <div key={c.username} title={`${c.nombre} · ${c.rol}`} style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#E0D8F8', border: `2px solid ${rolColors[c.rol] || '#8070C8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 600, color: '#2F2840', marginLeft: '-4px' }}>
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                    ))}
                    {note.colaboradores.length > 3 && (
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#F0EBF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#8070C8', fontWeight: 600, marginLeft: '-4px' }}>
                        +{note.colaboradores.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Botón equipo (solo collab) */}
                {note.es_colaborativa && (
                  <button onClick={e => { e.stopPropagation(); setTeamPanel(note); }} title="Ver equipo"
                    style={{ width: '32px', height: '32px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--highlight-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                    <Users size={15} strokeWidth={1.8} />
                  </button>
                )}

                <span style={{ color: 'var(--muted-fg)', fontSize: '0.8rem', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* Tareas expandidas */}
              {isOpen && tareas.length > 0 && (
                <div style={{ borderTop: '0.5px solid var(--card-border)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {tareas.map((t, i) => {
                    const colores = estadoColores[t.status] || estadoColores.pendiente;
                    return (
                      <div key={t.id || i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', borderRadius: '10px', backgroundColor: 'var(--app-bg)' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colores.dot, flexShrink: 0 }} />
                        <span style={{ fontSize: '0.875rem', color: 'var(--dim-fg)', fontWeight: 300, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {t.content}
                        </span>
                        {t.asignadoA && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--muted-fg)', whiteSpace: 'nowrap' }}>@{t.asignadoA}</span>
                        )}
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', backgroundColor: colores.bg, color: colores.fg, fontWeight: 500, whiteSpace: 'nowrap' }}>
                          {colores.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {isOpen && tareas.length === 0 && (
                <div style={{ borderTop: '0.5px solid var(--card-border)', padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--muted-fg)', fontSize: '0.85rem', fontWeight: 300, margin: 0 }}>
                    Esta nota no tiene tareas aún. Ábrela en el tablero para crearlas.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── PANEL LATERAL EQUIPO ── */}
      {teamPanel && (() => {
        const miRol = miRolEnNota(teamPanel);
        const esAdmin = miRol === 'admin';
        const aceptados = teamPanel.colaboradores?.filter((c: any) => !c.invitacion || c.invitacion === 'aceptada') ?? [];
        return (
          <>
            <div onClick={() => setTeamPanel(null)} style={{ position: 'fixed', inset: 0, zIndex: 1999, backgroundColor: 'rgba(47,40,64,0.18)' }} />
            <div style={{ position: 'fixed', right: 0, top: 0, height: '100vh', width: '380px', backgroundColor: 'var(--card-bg)', zIndex: 2000, boxShadow: '-8px 0 40px rgba(47,40,64,0.14)', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>

              {/* Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500, color: 'var(--card-title)' }}>👥 Equipo</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--muted-fg)', fontWeight: 300 }}>{teamPanel.titulo} · {aceptados.length} miembro{aceptados.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setTeamPanel(null)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--muted-fg)', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--highlight-bg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>✕</button>
              </div>

              {/* Tu rol */}
              <div style={{ padding: '0.75rem 1.5rem', borderBottom: '0.5px solid var(--card-border)', backgroundColor: 'var(--app-bg)', flexShrink: 0 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-fg)', fontWeight: 300 }}>Tu rol: </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: miRol === 'admin' ? '#8070C8' : miRol === 'editor' ? '#C070A0' : '#7090B8' }}>
                  {miRol === 'admin' ? 'Administrador' : miRol === 'editor' ? 'Editor' : 'Revisor'}
                </span>
                {!esAdmin && <span style={{ fontSize: '0.72rem', color: 'var(--muted-fg)', marginLeft: '8px' }}>· solo lectura</span>}
              </div>

              {/* Lista de miembros */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
                <NoteTeamPanel
                  nota={teamPanel}
                  miUsername={miUsername}
                  miRol={miRol}
                  onUpdated={cargarNotas}
                />
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
