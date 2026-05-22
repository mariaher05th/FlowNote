import React, { useState, useEffect } from 'react';
import { notesService, Note } from '../../services/notes.service';
import { authService } from '../../services/auth.service';
import api from '../../services/api';

const rolColors: Record<string, { bg: string; border: string; text: string }> = {
  admin:    { bg: '#EDE9FE', border: '#8070C8', text: '#8070C8' },
  editor:   { bg: '#F9E8F3', border: '#C070A0', text: '#C070A0' },
  revisor:  { bg: '#E8EFF9', border: '#7090B8', text: '#7090B8' },
};

const rolDesc: Record<string, string> = {
  admin:   'Puede gestionar el equipo, editar y completar el proyecto',
  editor:  'Puede editar el tablero y crear tareas',
  revisor: 'Solo puede ver el tablero',
};

const ROLES = ['admin', 'editor', 'revisor'] as const;

interface TeamPanelProps {
  nota: Note;
  miUsername: string;
  miRol: string;
  onUpdated: () => void;
}

export function NoteTeamPanel({ nota, miUsername, miRol, onUpdated }: TeamPanelProps) {
  const [cambiando, setCambiando] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const [addSearch, setAddSearch] = useState('');
  const [addResults, setAddResults] = useState<any[]>([]);
  const [addBuscando, setAddBuscando] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const esAdmin = miRol === 'admin';

  const cambiarRol = async (username: string, nuevoRol: string) => {
    setCambiando(username);
    try {
      await api.patch(`/notes/${nota._id}/colaboradores/${username}/rol`, { rol: nuevoRol });
      onUpdated();
    } catch {}
    finally { setCambiando(null); }
  };

  const eliminar = async (username: string) => {
    if (!confirm(`¿Eliminar a @${username} del equipo?`)) return;
    setEliminando(username);
    try {
      await api.delete(`/notes/${nota._id}/colaboradores/${username}`);
      onUpdated();
    } catch {}
    finally { setEliminando(null); }
  };

  const buscarUsuarios = (q: string) => {
    setAddSearch(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) { setAddResults([]); return; }
    setAddBuscando(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.get(`/auth/buscar?q=${encodeURIComponent(q)}`);
        const yaEstan = new Set(nota.colaboradores.map(c => c.username));
        setAddResults(res.data.filter((u: any) => !yaEstan.has(u.username)));
      } catch { setAddResults([]); }
      finally { setAddBuscando(false); }
    }, 350);
  };

  const agregarMiembro = async (u: any, rol: string) => {
    try {
      await api.post(`/notes/${nota._id}/colaboradores`, {
        usuario_id: String(u._id), username: u.username,
        nombre: `${u.nombre} ${u.apellido || ''}`.trim(), rol,
      });
      setAddSearch(''); setAddResults([]); setShowAdd(false);
      onUpdated();
    } catch {}
  };

  const colaboradoresAceptados = nota.colaboradores.filter(
    (c: any) => !c.invitacion || c.invitacion === 'aceptada'
  );

  return (
    <div style={{ borderTop: '0.5px solid var(--card-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {colaboradoresAceptados.map(c => {
          const colores = rolColors[c.rol] || rolColors.revisor;
          const esCambiando = cambiando === c.username;
          const esEliminando = eliminando === c.username;
          const esYo = c.username === miUsername;

          return (
            <div key={c.username} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '12px', backgroundColor: 'var(--app-bg)' }}>
              {/* Avatar */}
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: colores.bg, border: `2px solid ${colores.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: colores.text, flexShrink: 0 }}>
                {c.nombre.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 400, color: 'var(--card-title)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.nombre} {esYo && <span style={{ fontSize: '0.7rem', color: 'var(--muted-fg)' }}>(tú)</span>}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-fg)' }}>@{c.username}</p>
              </div>

              {/* Rol */}
              {esAdmin && !esYo ? (
                <select value={c.rol} disabled={esCambiando}
                  onChange={e => cambiarRol(c.username, e.target.value)}
                  style={{ padding: '4px 8px', borderRadius: '8px', border: `1px solid ${colores.border}`, backgroundColor: colores.bg, color: colores.text, fontSize: '0.78rem', cursor: 'pointer', outline: 'none', fontWeight: 500 }}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              ) : (
                <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: colores.bg, color: colores.text, fontSize: '0.78rem', fontWeight: 500, border: `0.5px solid ${colores.border}` }}>
                  {c.rol.charAt(0).toUpperCase() + c.rol.slice(1)}
                </span>
              )}

              {/* Eliminar (solo admin, no a sí mismo) */}
              {esAdmin && !esYo && (
                <button onClick={() => eliminar(c.username)} disabled={esEliminando}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--muted-fg)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEE8EC'; e.currentTarget.style.color = '#C04060'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--muted-fg)'; }}>
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Invitaciones pendientes */}
      {nota.colaboradores.filter((c: any) => c.invitacion === 'pendiente').length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted-fg)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.4rem' }}>Pendientes de aceptar</p>
          {nota.colaboradores.filter((c: any) => c.invitacion === 'pendiente').map(c => (
            <div key={c.username} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', opacity: 0.6, fontSize: '0.82rem', color: 'var(--muted-fg)' }}>
              <span>⏳</span><span>@{c.username}</span>
              <span style={{ fontSize: '0.7rem', backgroundColor: '#FEF3C7', color: '#92400E', padding: '1px 7px', borderRadius: '10px' }}>Pendiente</span>
            </div>
          ))}
        </div>
      )}

      {/* Agregar miembro (solo admin) */}
      {esAdmin && (
        <div style={{ marginTop: '0.75rem' }}>
          {!showAdd ? (
            <button onClick={() => setShowAdd(true)} style={{ fontSize: '0.8rem', color: 'var(--primary)', background: 'none', border: '0.5px dashed var(--card-border)', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', width: '100%' }}>
              + Agregar miembro
            </button>
          ) : (
            <div style={{ position: 'relative' }}>
              <input value={addSearch} onChange={e => buscarUsuarios(e.target.value)} placeholder="@usuario o nombre..."
                autoFocus
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '0.5px solid var(--card-border)', backgroundColor: 'var(--app-bg)', color: 'var(--app-fg)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
              {addBuscando && <p style={{ fontSize: '0.8rem', color: 'var(--muted-fg)', margin: '4px 0 0' }}>Buscando...</p>}
              {addResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden', marginTop: '4px' }}>
                  {addResults.map(u => (
                    <div key={u._id} style={{ padding: '0.6rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '0.5px solid var(--card-border)' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--card-title)', fontWeight: 400 }}>{u.nombre} {u.apellido}</p>
                        <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--muted-fg)' }}>@{u.username}</p>
                      </div>
                      <select defaultValue="editor" onChange={e => e.target.value && agregarMiembro(u, e.target.value)}
                        style={{ padding: '3px 6px', borderRadius: '6px', border: '0.5px solid var(--card-border)', fontSize: '0.78rem', cursor: 'pointer', outline: 'none' }}>
                        <option value="" disabled>Rol...</option>
                        <option value="editor">Editor</option>
                        <option value="revisor">Revisor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => { setShowAdd(false); setAddSearch(''); setAddResults([]); }}
                style={{ fontSize: '0.75rem', color: 'var(--muted-fg)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Team() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const miUsername = user.username || '';
  const miUserId = String(user.id || user._id || '');

  const cargar = () => {
    notesService.getAll()
      .then(data => setNotes(data.filter(n => n.es_colaborativa)))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const miRolEn = (nota: Note) => {
    const col = nota.colaboradores?.find(c => c.username === miUsername || String(c.usuario_id) === miUserId);
    return col?.rol || (String(nota.autor_id) === miUserId ? 'admin' : 'revisor');
  };

  if (loading) return (
    <div style={{ padding: '3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--card-title)', margin: '0 0 0.5rem' }}>Equipo</h1>
      <p style={{ color: 'var(--muted-fg)', fontWeight: 300 }}>Cargando...</p>
    </div>
  );

  return (
    <div style={{ padding: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--card-title)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
          Equipo
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-fg)', fontWeight: 300, margin: 0 }}>
          {notes.length} nota{notes.length !== 1 ? 's' : ''} colaborativa{notes.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Leyenda de roles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
        {Object.entries(rolDesc).map(([rol, desc]) => {
          const c = rolColors[rol];
          return (
            <div key={rol} style={{ backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: '12px', padding: '0.875rem 1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: c.border }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: c.text, textTransform: 'capitalize' }}>{rol}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted-fg)', fontWeight: 300, margin: 0 }}>{desc}</p>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {notes.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👥</div>
          <p style={{ color: 'var(--muted-fg)', fontWeight: 300, fontSize: '0.95rem' }}>
            No tienes notas colaborativas aún. Crea una para empezar a trabajar en equipo.
          </p>
        </div>
      )}

      {/* Notas colaborativas con sus equipos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {notes.map(nota => {
          const isOpen = expanded.has(nota._id);
          const miRol = miRolEn(nota);
          const esAdmin = miRol === 'admin';
          const totalAceptados = nota.colaboradores.filter((c: any) => !c.invitacion || c.invitacion === 'aceptada').length;

          return (
            <div key={nota._id} style={{ backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: '16px', overflow: 'visible' }}>
              {/* Header */}
              <div onClick={() => toggle(nota._id)} style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 400, color: 'var(--card-title)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {nota.titulo}
                    </h3>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px', backgroundColor: rolColors[miRol]?.bg, color: rolColors[miRol]?.text, border: `0.5px solid ${rolColors[miRol]?.border}`, fontWeight: 500, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {esAdmin ? '⚙ Admin' : miRol.charAt(0).toUpperCase() + miRol.slice(1)}
                    </span>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: 'var(--muted-fg)', fontWeight: 300 }}>
                    {totalAceptados} miembro{totalAceptados !== 1 ? 's' : ''}
                    {!esAdmin && ' · Solo puedes ver el equipo'}
                  </p>
                </div>

                {/* Avatares mini */}
                <div style={{ display: 'flex', flexShrink: 0 }}>
                  {nota.colaboradores.filter((c: any) => !c.invitacion || c.invitacion === 'aceptada').slice(0, 4).map((c, i) => {
                    const col = rolColors[c.rol] || rolColors.revisor;
                    return (
                      <div key={c.username} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: col.bg, border: `2px solid ${col.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600, color: col.text, marginLeft: i > 0 ? '-6px' : 0 }}>
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                    );
                  })}
                </div>

                <span style={{ color: 'var(--muted-fg)', fontSize: '0.8rem', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* Panel del equipo */}
              {isOpen && (
                <div style={{ padding: '0 1.5rem 1.25rem' }}>
                  <NoteTeamPanel
                    nota={nota}
                    miUsername={miUsername}
                    miRol={miRol}
                    onUpdated={cargar}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
