import React, { useState, useEffect } from 'react';
import { CreateNoteModal } from './CreateNoteModal';
import { notesService, Note } from '../../services/notes.service';
import api from '../../services/api';

const statusLabel: Record<string, string> = {
  pendiente: 'Pendiente', en_progreso: 'En progreso', completado: 'Completado',
};

const rolLabel: Record<string, string> = {
  admin: 'Administrador', editor: 'Editor', revisor: 'Revisor',
};

export function MyNotes({ goToBoard }: { goToBoard: (noteId: string) => void }) {
  const [notes, setNotes]               = useState<Note[]>([]);
  const [invitaciones, setInvitaciones] = useState<Note[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filter, setFilter]             = useState('all');
  const [showModal, setShowModal]       = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const miUserId = String(user.id || user._id || '');

  const esAutor = (nota: Note) => String(nota.autor_id || '') === miUserId;
  const soyInvitado = (nota: Note) =>
    nota.es_colaborativa && !esAutor(nota) && nota.colaboradores?.some(
      c => String(c.usuario_id) === miUserId || c.username === user.username,
    );
  const miRolEn = (nota: Note) =>
    nota.colaboradores?.find(
      c => String(c.usuario_id) === miUserId || c.username === user.username,
    )?.rol;
  const puedeEliminar = (nota: Note) => esAutor(nota) || miRolEn(nota) === 'admin';

  useEffect(() => {
    Promise.all([
      notesService.getAll(),
      api.get('/notes/invitaciones').then(r => r.data).catch(() => []),
    ]).then(([notas, invs]) => {
      setNotes(notas);
      setInvitaciones(invs);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const responderInvitacion = async (noteId: string, respuesta: 'aceptada' | 'rechazada') => {
    try {
      await api.patch(`/notes/${noteId}/invitacion`, { respuesta });
      setInvitaciones(prev => prev.filter(n => n._id !== noteId));
      if (respuesta === 'aceptada') {
        const notas = await notesService.getAll();
        setNotes(notas);
      }
    } catch {}
  };

  const handleCreada = (noteId: string) => {
    setShowModal(false);
    notesService.getAll().then(data => setNotes(data)).catch(() => {});
    goToBoard(noteId);
  };

  const handleEliminar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notesService.delete(id);
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch {}
  };

  const filtered = notes.filter(n => {
    const matchSearch = n.titulo.toLowerCase().includes(search.toLowerCase());

    if (filter === 'compartidas') {
      return matchSearch && soyInvitado(n);
    }

    const matchFilter =
      filter === 'all' ||
      n.estado === filter ||
      (filter === 'pendiente' && n.estado === 'pendiente') ||
      (filter === 'en_progreso' && n.estado === 'en_progreso') ||
      (filter === 'completado' && n.estado === 'completado');

    return matchSearch && matchFilter;
  });

  const esAdmin = (nota: Note) => {
    if (!nota.es_colaborativa) return true;
    const yo = nota.colaboradores?.find(c => c.username === user.username);
    return !yo || yo.rol === 'admin';
  };

  return (
    <div style={{ padding: '3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--card-title)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
        Mis Notas
      </h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--muted-fg)', fontWeight: 300, margin: '0 0 2rem' }}>
        {loading ? 'Cargando...' : `${notes.length} nota${notes.length !== 1 ? 's' : ''} en total`}
      </p>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar notas..."
          style={{
            flex: 1, minWidth: '200px', padding: '0.625rem 1rem', borderRadius: '12px',
            border: '0.5px solid var(--input-border)', backgroundColor: 'var(--input-bg)',
            fontSize: '0.9rem', color: 'var(--app-fg)', outline: 'none',
            fontFamily: 'inherit', fontWeight: 300,
          }}
        />
        {(['all', 'compartidas', 'pendiente', 'en_progreso', 'completado'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer',
            fontSize: '0.8125rem', fontWeight: filter === f ? 400 : 300,
            backgroundColor: filter === f ? 'var(--highlight-bg)' : 'var(--card-bg)',
            color: filter === f ? 'var(--primary)' : 'var(--subtle-fg)',
            border: '0.5px solid var(--card-border)',
          }}>
            {{ all: 'Todas', compartidas: 'Compartidas conmigo', pendiente: 'Pendientes', en_progreso: 'En progreso', completado: 'Completadas' }[f]}
          </button>
        ))}

        <button onClick={() => setShowModal(true)} style={{
          padding: '0.5rem 1.25rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
          fontSize: '0.8125rem', fontWeight: 400,
          backgroundColor: 'var(--primary)', color: '#FFFFFF',
        }}>+ Nueva nota</button>
      </div>

      {/* Modal */}
      {showModal && (
        <CreateNoteModal
          onClose={() => setShowModal(false)}
          onCreada={handleCreada}
        />
      )}

      {/* ── Invitaciones pendientes ── */}
      {invitaciones.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#C070A0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Invitaciones pendientes
            </span>
            <span style={{ backgroundColor: '#F0D8EC', color: '#C070A0', fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>
              {invitaciones.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {invitaciones.map(inv => {
              const miColaborador = inv.colaboradores?.find(
                (c: any) => String(c.usuario_id) === miUserId || c.username === user.username
              );
              const rolColors: Record<string, string> = { admin: '#8070C8', editor: '#C070A0', revisor: '#7090B8' };
              const rol = miColaborador?.rol || 'editor';
              return (
                <div key={inv._id} style={{ backgroundColor: 'var(--card-bg)', border: '0.5px solid #F0D8EC', borderRadius: '14px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 400, color: 'var(--card-title)', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inv.titulo}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--muted-fg)', fontWeight: 300 }}>
                      Te invitaron como{' '}
                      <span style={{ color: rolColors[rol] || '#8070C8', fontWeight: 500 }}>{rolLabel[rol] || rol}</span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <button onClick={() => responderInvitacion(inv._id, 'aceptada')} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', backgroundColor: '#8070C8', color: '#FFFFFF', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 400 }}>
                      Aceptar
                    </button>
                    <button onClick={() => responderInvitacion(inv._id, 'rechazada')} style={{ padding: '6px 14px', borderRadius: '20px', border: '0.5px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--muted-fg)', fontSize: '0.8rem', cursor: 'pointer' }}>
                      Rechazar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📝</div>
          <p style={{ color: 'var(--muted-fg)', fontWeight: 300, fontSize: '0.95rem' }}>
            {search ? 'No se encontraron notas.' : 'Aún no tienes notas. ¡Crea tu primera!'}
          </p>
        </div>
      )}

      {/* Grid de notas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {filtered.map(note => (
          <div
            key={note._id}
            onClick={() => goToBoard(note._id)}
            style={{
              backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)',
              borderRadius: '16px', padding: '1.25rem', cursor: 'pointer',
              transition: 'all 0.15s ease', position: 'relative',
            }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            {/* Botón eliminar — solo visible al hover */}
            {puedeEliminar(note) && (
              <button
                onClick={e => handleEliminar(note._id, e)}
                style={{
                  position: 'absolute', top: '0.75rem', right: '0.75rem',
                  width: '22px', height: '22px', borderRadius: '50%',
                  border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
                  color: 'var(--muted-fg)', fontSize: '0.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEE8EC'; e.currentTarget.style.color = '#C04060'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--muted-fg)'; }}
                title="Eliminar nota"
              >✕</button>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', paddingRight: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--card-title)', margin: 0 }}>
                {note.titulo}
              </h3>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{
                fontSize: '0.75rem', fontWeight: 400,
                backgroundColor: `var(--status-${note.estado === 'en_progreso' ? 'inprogress' : note.estado === 'completado' ? 'done' : 'pending'}-bg)`,
                color: `var(--status-${note.estado === 'en_progreso' ? 'inprogress' : note.estado === 'completado' ? 'done' : 'pending'}-fg)`,
                padding: '2px 10px', borderRadius: '20px',
              }}>{statusLabel[note.estado] || note.estado}</span>

              {soyInvitado(note) ? (
                <span style={{
                  fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px',
                  backgroundColor: '#E8F0FF', color: '#5070B0', fontWeight: 400,
                }}>Compartida contigo</span>
              ) : note.es_colaborativa && (
                <span style={{
                  fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px',
                  backgroundColor: '#F0D8EC', color: '#C070A0', fontWeight: 400,
                }}>Colaborativa</span>
              )}
            </div>

            {/* Etiquetas */}
            {note.etiquetas?.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {note.etiquetas.map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px',
                    backgroundColor: 'var(--tag-bg)', color: 'var(--tag-fg)', fontWeight: 300,
                  }}>{tag}</span>
                ))}
              </div>
            )}

            {soyInvitado(note) && miRolEn(note) && (
              <p style={{ fontSize: '0.75rem', color: 'var(--muted-fg)', margin: '0 0 0.5rem', fontWeight: 300 }}>
                Tu rol: {rolLabel[miRolEn(note)!] || miRolEn(note)}
              </p>
            )}

            {/* Colaboradores */}
            {note.es_colaborativa && note.colaboradores?.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {note.colaboradores.slice(0, 4).map(c => (
                  <div key={c.username} title={`${c.nombre} — ${c.rol}`} style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    backgroundColor: c.rol === 'admin' ? '#E0D8F8' : '#EDE8F8',
                    border: '1.5px solid var(--card-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.6rem', color: '#8070C8', fontWeight: 600,
                    marginLeft: '-4px',
                  }}>
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
                ))}
                {note.colaboradores.length > 4 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted-fg)', marginLeft: '4px' }}>
                    +{note.colaboradores.length - 4}
                  </span>
                )}
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted-fg)', fontWeight: 300 }}>
                {new Date(note.updatedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
