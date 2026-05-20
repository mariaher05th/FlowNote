import React, { useState, useEffect, useRef } from 'react';
import { authService } from '../../services/auth.service';
import { notesService } from '../../services/notes.service';

// ── Tipos ──
interface UsuarioBusqueda {
  _id: string;
  nombre: string;
  apellido: string;
  username: string;
}

interface Colaborador extends UsuarioBusqueda {
  rol: 'admin' | 'editor' | 'revisor' | 'observador';
  esCreador?: boolean;
}

const ROLES = [
  { key: 'admin' as const,      label: 'Admin',      color: '#8070C8' },
  { key: 'editor' as const,     label: 'Editor',     color: '#C070A0' },
  { key: 'revisor' as const,    label: 'Revisor',    color: '#7090B8' },
  { key: 'observador' as const, label: 'Observador', color: '#B0A0C0' },
];

interface Props {
  onClose: () => void;
  onCreada: (noteId: string) => void;
}

export function CreateNoteModal({ onClose, onCreada }: Props) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const creador: Colaborador = {
    _id: String(user.id || user._id || ''),
    nombre: user.nombre || '',
    apellido: user.apellido || '',
    username: user.username || '',
    rol: 'admin',
    esCreador: true,
  };

  const [paso, setPaso]               = useState<1 | 2>(1);
  const [nombre, setNombre]           = useState('');
  const [modo, setModo]               = useState<'solo' | 'colaborativa'>('solo');
  const [colaboradores, setColab]     = useState<Colaborador[]>([creador]);
  const [busqueda, setBusqueda]       = useState('');
  const [resultados, setResultados]   = useState<UsuarioBusqueda[]>([]);
  const [buscando, setBuscando]       = useState(false);
  const [todoAdmin, setTodoAdmin]     = useState(false);
  const [creando, setCreando]         = useState(false);
  const [error, setError]             = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Bloquear scroll del fondo
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Cerrar sugerencias al click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setResultados([]);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const normalizarTermino = (texto: string) => texto.trim().replace(/^@+/, '');

  // Búsqueda con debounce — @usuario desde 1 carácter; sin @ desde 2
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const raw = busqueda.trim();
    const term = normalizarTermino(raw);
    const minLen = raw.startsWith('@') ? 1 : 2;

    if (term.length < minLen) {
      setResultados([]);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await authService.buscarUsuarios(term);
        const idsAgregados = new Set(colaboradores.map(c => String(c._id)));
        setResultados(data.filter(u => !idsAgregados.has(String(u._id))));
      } catch {
        setResultados([]);
      } finally {
        setBuscando(false);
      }
    }, 300);
  }, [busqueda, colaboradores]);

  const agregarColab = (u: UsuarioBusqueda) => {
    setColab(prev => [...prev, { ...u, _id: String(u._id), rol: 'editor' }]);
    setBusqueda('');
    setResultados([]);
  };

  const quitarColab = (id: string) => setColab(prev => prev.filter(c => c._id !== id));

  const cambiarRol = (id: string, rol: Colaborador['rol']) => {
    setColab(prev => prev.map(c => c._id === id ? { ...c, rol } : c));
  };

  const toggleTodoAdmin = (val: boolean) => {
    setTodoAdmin(val);
    if (val) setColab(prev => prev.map(c => ({ ...c, rol: 'admin' as const })));
  };

  const handleCrear = async () => {
    if (!nombre.trim()) { setError('El nombre de la nota no puede estar vacío.'); return; }
    setError('');
    setCreando(true);
    try {
      const nueva = await notesService.create({
        titulo: nombre.trim(),
        es_colaborativa: modo === 'colaborativa',
        colaboradores: modo === 'colaborativa'
          ? colaboradores.map(c => ({
              usuario_id: String(c._id),
              username: c.username,
              nombre: `${c.nombre}${c.apellido ? ` ${c.apellido}` : ''}`.trim(),
              rol: c.rol,
            }))
          : [],
      });
      onCreada(nueva._id);
    } catch (e: any) {
      const msg = e.response?.data?.message;
      setError(Array.isArray(msg) ? msg[0] : msg || 'Error al crear la nota.');
    } finally {
      setCreando(false);
    }
  };

  const iniciales = (c: Colaborador) =>
    `${c.nombre.charAt(0)}${(c.apellido || '').charAt(0)}`.toUpperCase() || '?';

  // ── Estilos reutilizables ──
  const pill = (active: boolean, color: string): React.CSSProperties => ({
    padding: '5px 14px', borderRadius: '20px', border: `1.5px solid ${active ? color : '#E4DCF4'}`,
    backgroundColor: active ? color : '#FFFFFF', color: active ? '#FFFFFF' : '#B0A0C0',
    fontSize: '0.78rem', fontWeight: active ? 500 : 300, cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'rgba(47,40,64,0.4)', backdropFilter: 'blur(8px)',
      }}
    >
      {/* Tarjeta — stopPropagation para no cerrar al hacer clic dentro */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF', borderRadius: '24px',
          padding: '2rem', width: '100%', maxWidth: '500px',
          boxShadow: '0 24px 64px rgba(47,40,64,0.18)',
          position: 'relative', maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* X cerrar */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '1.25rem', right: '1.25rem',
          width: '28px', height: '28px', borderRadius: '50%',
          border: 'none', backgroundColor: '#F6F4FB', cursor: 'pointer',
          color: '#B0A0C0', fontSize: '1rem', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>✕</button>

        {/* ══════════ PASO 1 ══════════ */}
        {paso === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Campo nombre — grande, sin borde */}
            <input
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Dale un nombre a tu espacio..."
              autoFocus
              style={{
                border: 'none', outline: 'none', width: '100%',
                fontSize: '1.4rem', fontWeight: 300, color: '#2F2840',
                backgroundColor: 'transparent', fontFamily: 'inherit',
                borderBottom: '1.5px solid #E4DCF4', paddingBottom: '0.5rem',
              }}
            />

            {/* Toggle Solo / Colaborativa — pills */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setModo('solo')}
                style={pill(modo === 'solo', '#8070C8')}
              >Solo</button>
              <button
                onClick={() => setModo('colaborativa')}
                style={pill(modo === 'colaborativa', '#C070A0')}
              >Colaborativa</button>
            </div>

            {/* Buscador — solo colaborativa */}
            {modo === 'colaborativa' && (
              <div>
                <div ref={searchRef} style={{ position: 'relative' }}>
                  <input
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    placeholder="Escribe @usuario para invitar..."
                    style={{
                      width: '100%', padding: '0.7rem 1rem', borderRadius: '12px',
                      border: '0.5px solid #E4DCF4', backgroundColor: '#F6F4FB',
                      fontSize: '0.9rem', color: '#2F2840', outline: 'none',
                      fontFamily: 'inherit', boxSizing: 'border-box',
                    }}
                  />

                  {/* Estado carga */}
                  {buscando && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                      backgroundColor: '#FFFFFF', borderRadius: '12px',
                      border: '0.5px solid #E4DCF4', padding: '0.75rem 1rem',
                      fontSize: '0.85rem', color: '#B0A0C0',
                    }}>Buscando...</div>
                  )}

                  {/* Resultados */}
                  {!buscando && resultados.length > 0 && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                      backgroundColor: '#FFFFFF', borderRadius: '12px',
                      border: '0.5px solid #E4DCF4', boxShadow: '0 8px 24px rgba(47,40,64,0.1)',
                      zIndex: 10, overflow: 'hidden',
                    }}>
                      {resultados.map(u => (
                        <button
                          key={u._id}
                          onClick={() => agregarColab(u)}
                          style={{
                            width: '100%', padding: '0.7rem 1rem', border: 'none',
                            backgroundColor: 'transparent', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            textAlign: 'left',
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F6F4FB'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            backgroundColor: '#E0D8F8', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: '0.75rem', color: '#8070C8',
                            fontWeight: 600, flexShrink: 0,
                          }}>
                            {`${u.nombre.charAt(0)}${(u.apellido || '').charAt(0)}`.toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.875rem', color: '#2F2840', fontWeight: 400 }}>
                              {u.nombre} {u.apellido}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#B0A0C0' }}>@{u.username}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Sin resultados */}
                  {!buscando && normalizarTermino(busqueda).length >= (busqueda.trim().startsWith('@') ? 1 : 2) && resultados.length === 0 && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                      backgroundColor: '#FFFFFF', borderRadius: '12px',
                      border: '0.5px solid #E4DCF4', padding: '0.75rem 1rem',
                      fontSize: '0.85rem', color: '#B0A0C0',
                    }}>
                      No hay usuarios con «{normalizarTermino(busqueda)}». Deben estar registrados en FlowNote.
                    </div>
                  )}
                </div>

                {/* Chips colaboradores */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {colaboradores.map(c => (
                    <div key={c._id} style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      backgroundColor: c.esCreador ? '#EDE8F8' : '#F6F4FB',
                      border: `0.5px solid ${c.esCreador ? '#C8B8F0' : '#E4DCF4'}`,
                      borderRadius: '20px', padding: '4px 10px 4px 6px',
                    }}>
                      <div style={{
                        width: '22px', height: '22px', borderRadius: '50%',
                        backgroundColor: c.esCreador ? '#8070C8' : '#B0A0C0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6rem', color: '#FFFFFF', fontWeight: 600, flexShrink: 0,
                      }}>{iniciales(c)}</div>
                      <span style={{ fontSize: '0.8rem', color: '#2F2840' }}>@{c.username}</span>
                      {c.esCreador
                        ? <span style={{ fontSize: '0.65rem', color: '#8070C8', fontWeight: 600 }}>Admin</span>
                        : <button onClick={() => quitarColab(c._id)} style={{
                            border: 'none', background: 'none', cursor: 'pointer',
                            color: '#B0A0C0', fontSize: '0.75rem', lineHeight: 1, padding: 0,
                          }}>✕</button>
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                backgroundColor: '#FEE8EC', border: '0.5px solid #F0C0CC',
                borderRadius: '10px', padding: '0.65rem 1rem',
                fontSize: '0.82rem', color: '#C04060',
              }}>{error}</div>
            )}

            {/* Botón */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              {modo === 'solo' ? (
                <button onClick={handleCrear} disabled={creando || !nombre.trim()} style={{
                  padding: '0.7rem 1.75rem', borderRadius: '14px', border: 'none',
                  backgroundColor: nombre.trim() ? '#8070C8' : '#D8D0EC',
                  color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 400,
                  cursor: nombre.trim() && !creando ? 'pointer' : 'not-allowed',
                }}>
                  {creando ? 'Creando...' : 'Crear nota'}
                </button>
              ) : (
                <button
                  onClick={() => { if (!nombre.trim()) { setError('El nombre no puede estar vacío.'); return; } setError(''); setPaso(2); }}
                  disabled={!nombre.trim()}
                  style={{
                    padding: '0.7rem 1.75rem', borderRadius: '14px', border: 'none',
                    backgroundColor: nombre.trim() ? '#C070A0' : '#D8D0EC',
                    color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 400,
                    cursor: nombre.trim() ? 'pointer' : 'not-allowed',
                  }}
                >Siguiente →</button>
              )}
            </div>
          </div>
        )}

        {/* ══════════ PASO 2 ══════════ */}
        {paso === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Header: volver + indicador */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button onClick={() => { setPaso(1); setError(''); }} style={{
                border: 'none', background: 'none', cursor: 'pointer',
                color: '#B0A0C0', fontSize: '1.1rem', padding: 0, lineHeight: 1,
              }}>←</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {[1, 2].map(n => (
                  <React.Fragment key={n}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      backgroundColor: n === paso ? '#8070C8' : '#E4DCF4',
                      color: n === paso ? '#FFFFFF' : '#B0A0C0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 500,
                    }}>{n}</div>
                    {n < 2 && <div style={{ width: '20px', height: '1px', backgroundColor: '#E4DCF4' }} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Título */}
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 300, color: '#2F2840', margin: 0 }}>
                Asigna los roles
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#B0A0C0', margin: '4px 0 0', fontWeight: 300 }}>
                Define qué puede hacer cada persona en «{nombre}»
              </p>
            </div>

            {/* Toggle hacer todos admin */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: '#F6F4FB', borderRadius: '12px', padding: '0.7rem 1rem',
            }}>
              <span style={{ fontSize: '0.875rem', color: '#2F2840', fontWeight: 300 }}>
                Hacer todos Admin
              </span>
              <button
                onClick={() => toggleTodoAdmin(!todoAdmin)}
                style={{
                  width: '40px', height: '22px', borderRadius: '11px',
                  backgroundColor: todoAdmin ? '#8070C8' : '#D8D0EC',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background-color 0.2s', flexShrink: 0,
                }}
              >
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  backgroundColor: '#FFFFFF', position: 'absolute',
                  top: '3px', left: todoAdmin ? '21px' : '3px',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }} />
              </button>
            </div>

            {/* Lista de colaboradores */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {colaboradores.map(c => (
                <div key={c._id} style={{
                  backgroundColor: '#F6F4FB', borderRadius: '14px',
                  padding: '0.875rem 1rem', display: 'flex',
                  flexDirection: 'column', gap: '0.6rem',
                }}>
                  {/* Usuario */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      backgroundColor: c.esCreador ? '#E0D8F8' : '#EDE8F8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', color: '#8070C8', fontWeight: 600, flexShrink: 0,
                    }}>{iniciales(c)}</div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: '#2F2840', fontWeight: 400 }}>
                        {c.nombre} {c.apellido}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#B0A0C0' }}>@{c.username}</div>
                    </div>
                  </div>

                  {/* Rol */}
                  {c.esCreador ? (
                    <span style={{
                      display: 'inline-block', padding: '4px 14px', borderRadius: '20px',
                      backgroundColor: '#8070C8', color: '#FFFFFF',
                      fontSize: '0.78rem', fontWeight: 500, alignSelf: 'flex-start',
                    }}>Admin</span>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {ROLES.map(r => (
                        <button
                          key={r.key}
                          onClick={() => cambiarRol(c._id, r.key)}
                          style={{
                            padding: '4px 12px', borderRadius: '20px',
                            border: `1.5px solid ${c.rol === r.key ? r.color : '#E4DCF4'}`,
                            backgroundColor: c.rol === r.key ? r.color : '#FFFFFF',
                            color: c.rol === r.key ? '#FFFFFF' : '#B0A0C0',
                            fontSize: '0.78rem', fontWeight: c.rol === r.key ? 500 : 300,
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                        >{r.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div style={{
                backgroundColor: '#FEE8EC', border: '0.5px solid #F0C0CC',
                borderRadius: '10px', padding: '0.65rem 1rem',
                fontSize: '0.82rem', color: '#C04060',
              }}>{error}</div>
            )}

            {/* Botón crear */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleCrear} disabled={creando} style={{
                padding: '0.7rem 1.75rem', borderRadius: '14px', border: 'none',
                backgroundColor: creando ? '#D8D0EC' : '#8070C8',
                color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 400,
                cursor: creando ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              }}>
                {creando ? 'Creando...' : 'Crear nota'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
