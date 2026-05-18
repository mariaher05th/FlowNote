// src/app/components/Dashboard.tsx

import { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MyNotes } from './MyNotes';
import { Workflows } from './Workflows';
import { Team } from './Team';
import { Reminders } from './Reminders';
import { Whiteboard } from './Whiteboard';
import { ThemePicker } from './ThemePicker';
import React from 'react';
import { Home, StickyNote, Workflow, Bell, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { authService } from '../../services/auth.service';
import { dashboardWidgetsService, DashboardWidget } from '../../services/dashboard-widgets.service';
import { notesService, Note } from '../../services/notes.service';
import { remindersService, Reminder } from '../../services/reminders.service';

const WIDGET_TYPE = 'WIDGET';

// ── Tipos de widget disponibles ──
const WIDGET_TIPOS = [
  { tipo: 'pendientes',   label: 'Pendientes',      desc: 'Tus notas pendientes',           icon: '📋' },
  { tipo: 'nota',         label: 'Acceso a nota',   desc: 'Acceso directo a una de tus notas', icon: '🔗' },
  { tipo: 'nota_rapida',  label: 'Nota rápida',     desc: 'Escribe lo que quieras',         icon: '✏️' },
  { tipo: 'recordatorios',label: 'Recordatorios',   desc: 'Tus próximos recordatorios',     icon: '🔔' },
  { tipo: 'externo',      label: 'Widget externo',  desc: 'Inserta un link externo (Notion, etc.)', icon: '🌐' },
];

const titleForTipo: Record<string, string> = {
  pendientes: 'Pendientes', nota: 'Nota', nota_rapida: 'Nota rápida',
  recordatorios: 'Recordatorios', externo: 'Widget externo',
};

// ── Empty state reutilizable ──
function EmptyState({ icon, texto }: { icon: string; texto: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', gap: '0.75rem' }}>
      <span style={{ fontSize: '2rem', opacity: 0.5 }}>{icon}</span>
      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-fg)', textAlign: 'center', fontWeight: 300, lineHeight: 1.5 }}>{texto}</p>
    </div>
  );
}

const estadoColor: Record<string, { bg: string; fg: string; dot: string }> = {
  pendiente:   { bg: '#FEF3C7', fg: '#92400E', dot: '#F59E0B' },
  en_progreso: { bg: '#EDE9FE', fg: '#5B21B6', dot: '#8070C8' },
  completado:  { bg: '#D1FAE5', fg: '#065F46', dot: '#34D399' },
};

// ── Widget: Pendientes ──
function PendientesWidget() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    notesService.getAll()
      .then(data => setNotes(data.filter(n => n.estado !== 'completado').slice(0, 6)))
      .catch(() => setNotes([]))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <EmptyState icon="⏳" texto="Cargando..." />;
  if (!notes.length) return <EmptyState icon="📋" texto="Aún no tienes notas pendientes" />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {notes.map(n => {
        const c = estadoColor[n.estado] || estadoColor.pendiente;
        return (
          <div key={n._id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 10px', borderRadius: '10px',
            backgroundColor: 'var(--app-bg)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--highlight-bg)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--app-bg)'}
          >
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: c.dot, flexShrink: 0 }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--dim-fg)', fontWeight: 300, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {n.titulo}
            </span>
            <span style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '20px', backgroundColor: c.bg, color: c.fg, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {n.estado === 'en_progreso' ? 'En progreso' : n.estado === 'completado' ? 'Listo' : 'Pendiente'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Widget: Acceso a nota ──
function NotaWidget({ config, onNavigate }: { config: Record<string, any>; onNavigate: (noteId: string) => void }) {
  return (
    <div
      onClick={() => config.nota_id && onNavigate(config.nota_id)}
      style={{
        borderRadius: '14px', overflow: 'hidden', cursor: 'pointer',
        background: 'linear-gradient(135deg, #E8E0F8 0%, #F0D8EC 100%)',
        padding: '1.25rem', display: 'flex', flexDirection: 'column',
        gap: '0.75rem', transition: 'opacity 0.2s',
        minHeight: '100px',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
    >
      <div style={{ fontSize: '1.5rem' }}>📄</div>
      <div>
        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 500, color: '#2F2840', lineHeight: 1.3 }}>
          {config.nota_titulo || 'Sin título'}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#8070C8', fontWeight: 300 }}>
          Abrir nota →
        </p>
      </div>
    </div>
  );
}

// ── Widget: Nota rápida ──
function NotaRapidaWidget({ widget, onSave }: { widget: DashboardWidget; onSave: (id: string, config: Record<string, any>) => void }) {
  const [text, setText] = useState<string>((widget.config?.contenido as string) || '');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = taRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const handleChange = (val: string) => {
    setText(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSave(widget._id, { ...widget.config, contenido: val }), 800);
  };

  return (
    <textarea
      ref={taRef}
      value={text}
      onChange={e => handleChange(e.target.value)}
      placeholder="Escribe algo aquí..."
      style={{
        width: '100%', minHeight: '80px', border: 'none',
        backgroundColor: 'transparent', resize: 'none', overflow: 'hidden',
        fontSize: '0.875rem', color: 'var(--app-fg)', fontWeight: 300,
        outline: 'none', fontFamily: 'inherit', lineHeight: 1.7,
        boxSizing: 'border-box',
      }}
    />
  );
}

// ── Widget: Recordatorios ──
function RecordatoriosWidget() {
  const [items, setItems] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    remindersService.getAll()
      .then(data => setItems(data.filter(r => !r.completado).slice(0, 4)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <EmptyState icon="⏳" texto="Cargando..." />;
  if (!items.length) return <EmptyState icon="🔔" texto="Sin recordatorios pendientes" />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {items.map(r => (
        <div key={r._id} style={{
          display: 'flex', gap: '10px', alignItems: 'flex-start',
          padding: '8px 10px', borderRadius: '10px',
          backgroundColor: 'var(--app-bg)', transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--highlight-bg)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--app-bg)'}
        >
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.75rem' }}>🔔</div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--dim-fg)', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.titulo}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--muted-fg)', fontWeight: 300 }}>
              {new Date(r.fecha).toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Widget: Externo ──
function ExternoWidget({ config }: { config: Record<string, any> }) {
  if (!config.url) return <EmptyState icon="🌐" texto="Sin URL configurada" />;
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '140px', borderRadius: '10px', overflow: 'hidden' }}>
      <iframe src={config.url} width="100%" height="100%" style={{ border: 0, display: 'block' }} title={config.titulo || 'Widget externo'} loading="lazy" scrolling="no" />
    </div>
  );
}

// ── Renderizador por tipo ──
function WidgetContentRenderer({ widget, onSave, onNavigate }: {
  widget: DashboardWidget;
  onSave: (id: string, config: Record<string, any>) => void;
  onNavigate: (noteId: string) => void;
}) {
  switch (widget.tipo) {
    case 'pendientes':    return <PendientesWidget />;
    case 'nota':          return <NotaWidget config={widget.config} onNavigate={onNavigate} />;
    case 'nota_rapida':   return <NotaRapidaWidget widget={widget} onSave={onSave} />;
    case 'recordatorios': return <RecordatoriosWidget />;
    case 'externo':       return <ExternoWidget config={widget.config} />;
    default:              return null;
  }
}

// ── Widget arrastrable ──
function DraggableWidget({ widget, index, moveWidget, removeWidget, onSave, onNavigate }: {
  widget: DashboardWidget;
  index: number;
  moveWidget: (from: number, to: number) => void;
  removeWidget: (index: number) => void;
  onSave: (id: string, config: Record<string, any>) => void;
  onNavigate: (noteId: string) => void;
}) {
  const [minH, setMinH] = useState<number>((widget.config?._height as number) || 0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: WIDGET_TYPE,
    item: { index },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });
  const [, drop] = useDrop({
    accept: WIDGET_TYPE,
    hover: (item: { index: number }) => {
      if (item.index !== index) { moveWidget(item.index, index); item.index = index; }
    },
  });

  // Actualiza startResize para leer altura del cardRef
  const startResizeFinal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startY = e.clientY;
    const startH = cardRef.current?.offsetHeight ?? 200;
    const onMove = (ev: MouseEvent) => {
      setMinH(Math.max(80, startH + ev.clientY - startY));
    };
    const onUp = (ev: MouseEvent) => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      const finalH = Math.max(80, startH + ev.clientY - startY);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() =>
        onSave(widget._id, { ...widget.config, _height: finalH }), 400);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      ref={node => { drop(node); if (node) cardRef.current = node; }}
      style={{
        backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)',
        borderRadius: '16px', padding: '1.25rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        opacity: isDragging ? 0.4 : 1,
        transition: 'box-shadow 0.15s ease',
        minHeight: minH > 0 ? `${minH}px` : undefined,
        position: 'relative',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'}
    >
      {/* Solo el header arrastra el widget */}
      <div ref={drag as any} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', cursor: 'grab' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 400, color: 'var(--card-title)' }}>
            {widget.tipo === 'nota' ? (widget.config?.nota_titulo as string || 'Nota') : titleForTipo[widget.tipo]}
          </h3>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
        </div>
        <button
          onClick={() => removeWidget(index)}
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted-fg)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--highlight-bg)'; e.currentTarget.style.color = 'var(--primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--muted-fg)'; }}
        >✕</button>
      </div>

      <WidgetContentRenderer widget={widget} onSave={onSave} onNavigate={onNavigate} />

      {/* Handle de resize estilo Xtiles — esquina inferior derecha */}
      <div
        onMouseDown={startResizeFinal}
        style={{
          position: 'absolute', bottom: '4px', right: '6px',
          width: '14px', height: '14px', cursor: 'nwse-resize',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--muted-fg)', fontSize: '10px', opacity: 0.4,
          userSelect: 'none', lineHeight: 1,
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
      >⌟</div>
    </div>
  );
}

// ── Home content ──
function HomeContent({ widgets, moveWidget, removeWidget, onAddClick, nombre, onSave, onNavigate, loading }: {
  widgets: DashboardWidget[];
  moveWidget: (from: number, to: number) => void;
  removeWidget: (index: number) => void;
  onAddClick: () => void;
  nombre: string;
  onSave: (id: string, config: Record<string, any>) => void;
  onNavigate: (noteId: string) => void;
  loading: boolean;
}) {
  return (
    <>
      <div style={{ width: '100%', height: '200px', background: 'var(--hero-gradient)', display: 'flex', alignItems: 'flex-end', padding: '0 3rem 1.5rem' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--card-bg)', border: '3px solid var(--app-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.10)' }}>✨</div>
      </div>
      <div style={{ padding: '1.5rem 3rem 0' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted-fg)', fontWeight: 300, margin: '0 0 0.25rem' }}>Bienvenida de vuelta</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--card-title)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>Bienvenida, {nombre}</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-fg)', fontWeight: 300, margin: '0 0 2rem' }}>Arrastra los widgets para organizarlos</p>
      </div>
      <div style={{ padding: '0 3rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
        {loading ? (
          <p style={{ color: 'var(--muted-fg)' }}>Cargando widgets...</p>
        ) : (
          widgets.map((widget, index) => (
            <DraggableWidget key={widget._id} widget={widget} index={index} moveWidget={moveWidget} removeWidget={removeWidget} onSave={onSave} onNavigate={onNavigate} />
          ))
        )}
        <button onClick={onAddClick} style={{ minHeight: '180px', backgroundColor: 'var(--card-bg)', border: '2px dashed var(--card-border)', borderRadius: '16px', cursor: 'pointer', color: 'var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.15s ease' }}>
          <span style={{ fontSize: '2.5rem' }}>+</span>
          <span style={{ fontSize: '0.9rem' }}>Agregar widget</span>
        </button>
      </div>
    </>
  );
}

// ========================================
// DASHBOARD PRINCIPAL
// ========================================
export function Dashboard() {
  const [widgets, setWidgets]               = useState<DashboardWidget[]>([]);
  const [loadingWidgets, setLoadingWidgets] = useState(true);
  const [activePage, setActivePage]         = useState('inicio');
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [sidebarWidth, setSidebarWidth]     = useState(220);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [modalStep, setModalStep]           = useState<'tipo' | 'nota' | 'externo'>('tipo');
  const [modalError, setModalError]         = useState('');
  const [addingWidget, setAddingWidget]     = useState(false);
  const [userNotes, setUserNotes]           = useState<Note[]>([]);
  const [externUrl, setExternUrl]           = useState('');
  const [externTitle, setExternTitle]       = useState('');
  const [activeNoteId, setActiveNoteId]     = useState<string | null>(null);

  const goToBoard = (noteId: string) => {
    setActiveNoteId(noteId);
    setActivePage('tablero');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const nombre = user.nombre || '';
  const apellido = user.apellido || '';
  const iniciales = `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase() || '?';
  const nombreCompleto = apellido ? `${nombre} ${apellido}` : nombre;

  useEffect(() => {
    dashboardWidgetsService.getAll()
      .then(data => setWidgets(data))
      .catch(() => setWidgets([]))
      .finally(() => setLoadingWidgets(false));
  }, []);

  const openModal = () => {
    setModalStep('tipo');
    setModalError('');
    setExternUrl('');
    setExternTitle('');
    setShowWidgetModal(true);
  };

  const addWidget = async (tipo: string, config: Record<string, any> = {}) => {
    setAddingWidget(true);
    setModalError('');
    try {
      const w = await dashboardWidgetsService.create(tipo, config);
      setWidgets(prev => [...prev, w]);
      setShowWidgetModal(false);
    } catch {
      setModalError('No se pudo crear el widget. Reconstruye el backend: docker compose build backend');
    } finally {
      setAddingWidget(false);
    }
  };

  const handleTipoSelect = async (tipo: string) => {
    setModalError('');
    try {
      if (tipo === 'nota') {
        const notes = await notesService.getAll();
        setUserNotes(notes);
        setModalStep('nota');
      } else if (tipo === 'externo') {
        setModalStep('externo');
      } else {
        await addWidget(tipo);
      }
    } catch {
      setModalError('Ocurrió un error. Intenta de nuevo.');
    }
  };

  const moveWidget = (from: number, to: number) => {
    const updated = [...widgets];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setWidgets(updated);
  };

  const removeWidget = async (index: number) => {
    const w = widgets[index];
    await dashboardWidgetsService.delete(w._id);
    setWidgets(prev => prev.filter((_, i) => i !== index));
  };

  const saveWidgetConfig = async (id: string, config: Record<string, any>) => {
    await dashboardWidgetsService.updateConfig(id, config);
    setWidgets(prev => prev.map(w => w._id === id ? { ...w, config } : w));
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = sidebarWidth;
    const onMove = (ev: MouseEvent) => {
      const next = Math.min(400, Math.max(160, startW + ev.clientX - startX));
      setSidebarWidth(next);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const pages: Record<string, React.ReactNode> = {
    inicio: <HomeContent widgets={widgets} moveWidget={moveWidget} removeWidget={removeWidget} onAddClick={openModal} nombre={nombre} onSave={saveWidgetConfig} onNavigate={goToBoard} loading={loadingWidgets} />,
    notas:         <MyNotes goToBoard={goToBoard} />,
    workflows:     <Workflows goToTeam={() => setActivePage('equipo')} />,
    equipo:        <Team />,
    recordatorios: <Reminders />,
    tablero:       <Whiteboard noteId={activeNoteId} onBack={() => setActivePage('notas')} />,
  };


  const navItems = [
    { label: 'Inicio',        key: 'inicio',        icon: Home      },
    { label: 'Mis Notas',     key: 'notas',         icon: StickyNote },
    { label: 'Workflows',     key: 'workflows',     icon: Workflow   },
    { label: 'Recordatorios', key: 'recordatorios', icon: Bell       },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: sidebarOpen ? `${sidebarWidth}px` : '76px',
          backgroundColor: 'var(--sidebar-bg)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          height: '100vh', position: 'sticky', top: 0, flexShrink: 0,
          overflow: 'hidden', transition: sidebarOpen ? 'none' : 'width 0.3s ease',
        }}>
          <div style={{
            padding: sidebarOpen ? '2.5rem 1.5rem' : '2.5rem 0.75rem',
            display: 'flex', flexDirection: 'column', gap: '3rem',
            transition: 'padding 0.3s ease',
          }}>
            {/* Header del sidebar: título + botón colapsar */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: sidebarOpen ? 'space-between' : 'center', gap: '0.75rem',
            }}>
              {sidebarOpen && (
                <h1 style={{ color: 'var(--sidebar-title)', fontWeight: 300, fontSize: '1.5rem', letterSpacing: '-0.02em', margin: 0, whiteSpace: 'nowrap' }}>
                  FlowNote
                </h1>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title={sidebarOpen ? 'Cerrar barra lateral' : 'Abrir barra lateral'}
                style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  border: '0.5px solid var(--sidebar-border)',
                  backgroundColor: 'var(--sidebar-active-bg)',
                  color: 'var(--sidebar-active-fg)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            </div>

            {/* Navegación con iconos (cambio de compañera) */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActivePage(item.key)}
                    title={!sidebarOpen ? item.label : undefined}
                    style={{
                      padding: sidebarOpen ? '0.625rem 1rem' : '0.75rem',
                      borderRadius: '10px', textAlign: 'left',
                      backgroundColor: activePage === item.key ? 'var(--sidebar-active-bg)' : 'transparent',
                      color: activePage === item.key ? 'var(--sidebar-active-fg)' : 'var(--sidebar-inactive-fg)',
                      fontWeight: activePage === item.key ? 400 : 300,
                      fontSize: '0.9375rem', border: 'none', cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center',
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      gap: '0.7rem', width: '100%', whiteSpace: 'nowrap',
                    }}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Zona inferior: ThemePicker + usuario */}
          <div style={{
            padding: sidebarOpen ? '1rem 1.5rem 1.5rem' : '1rem 0.75rem 1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
            transition: 'padding 0.3s ease',
          }}>
            {/* 🎨 Selector de tema — solo visible con sidebar abierto */}
            {sidebarOpen && <ThemePicker />}

            {/* Usuario */}
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '0.75rem',
              paddingTop: sidebarOpen ? '0.5rem' : '0',
              borderTop: sidebarOpen ? '0.5px solid var(--sidebar-border)' : 'none',
            }}>
              <div
                title={!sidebarOpen ? 'Maria José - Admin' : undefined}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  backgroundColor: 'var(--sidebar-avatar-bg)',
                  border: '2px solid var(--sidebar-avatar-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8125rem', fontWeight: 400, color: 'var(--sidebar-avatar-fg)', flexShrink: 0,
                }}
              >{iniciales}</div>
              {sidebarOpen && (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 400, color: 'var(--card-title)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nombreCompleto}</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 300, color: 'var(--card-title)' }}>@{user.username || nombre.toLowerCase()}</div>
                </div>
              )}
              <button
                onClick={() => authService.logout()}
                title="Cerrar sesión"
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#B0A0C0', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', padding: '6px', borderRadius: '8px',
                  flexShrink: 0, transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F0EBF8'; e.currentTarget.style.color = '#8070C8'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#B0A0C0'; }}
              >
                <LogOut size={17} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </aside>

        {/* Handle de arrastre entre sidebar y main */}
        {sidebarOpen && (
          <div
            onMouseDown={startResize}
            style={{
              width: '5px', cursor: 'col-resize', flexShrink: 0,
              backgroundColor: 'transparent', transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--sidebar-border)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          />
        )}

        {/* ── MAIN ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--app-bg)' }}>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {pages[activePage]}
          </div>
        </main>

      </div>

      {/* Modal agregar widget (cambio de compañera) */}
      {showWidgetModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.30)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '18px', padding: '2rem', width: '440px', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>

            {modalError && (
              <div style={{ backgroundColor: '#FEE8EC', border: '0.5px solid #F0C0CC', borderRadius: '10px', padding: '0.65rem 1rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#C04060' }}>
                {modalError}
              </div>
            )}

            {/* Paso 1: elegir tipo */}
            {modalStep === 'tipo' && (<>
              <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.3rem', fontWeight: 300, color: 'var(--card-title)' }}>Agregar widget</h2>
              <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: 'var(--muted-fg)' }}>¿Qué tipo de widget quieres agregar?</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {WIDGET_TIPOS.map(t => (
                  <button key={t.tipo} onClick={() => handleTipoSelect(t.tipo)} disabled={addingWidget} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', borderRadius: '12px', border: '0.5px solid var(--card-border)', backgroundColor: 'var(--app-bg)', cursor: addingWidget ? 'wait' : 'pointer', textAlign: 'left', opacity: addingWidget ? 0.6 : 1 }}>
                    <span style={{ fontSize: '1.4rem' }}>{t.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--card-title)' }}>{t.label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted-fg)' }}>{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>)}

            {/* Paso 2a: elegir nota */}
            {modalStep === 'nota' && (<>
              <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.3rem', fontWeight: 300, color: 'var(--card-title)' }}>Elige una nota</h2>
              <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--muted-fg)' }}>Selecciona la nota que quieres como acceso directo</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                {userNotes.length === 0 && <p style={{ color: 'var(--muted-fg)', fontSize: '0.85rem' }}>No tienes notas aún.</p>}
                {userNotes.map(n => (
                  <button key={n._id} onClick={() => addWidget('nota', { nota_id: n._id, nota_titulo: n.titulo })} style={{ padding: '0.75rem 1rem', borderRadius: '10px', border: '0.5px solid var(--card-border)', backgroundColor: 'var(--app-bg)', cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem', color: 'var(--card-title)' }}>
                    {n.titulo}
                  </button>
                ))}
              </div>
              <button onClick={() => setModalStep('tipo')} style={{ marginTop: '1rem', fontSize: '0.85rem', background: 'none', border: 'none', color: 'var(--muted-fg)', cursor: 'pointer' }}>← Volver</button>
            </>)}

            {/* Paso 2b: URL externo */}
            {modalStep === 'externo' && (<>
              <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.3rem', fontWeight: 300, color: 'var(--card-title)' }}>Widget externo</h2>
              <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--muted-fg)' }}>Ingresa el URL del servicio externo</p>
              <input value={externTitle} onChange={e => setExternTitle(e.target.value)} placeholder="Título (ej. Mi Notion)" style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '0.5px solid var(--card-border)', backgroundColor: 'var(--app-bg)', color: 'var(--card-title)', fontSize: '0.9rem', outline: 'none', marginBottom: '0.75rem', boxSizing: 'border-box' }} />
              <input value={externUrl} onChange={e => setExternUrl(e.target.value)} placeholder="https://notion.so/..." style={{ width: '100%', padding: '0.7rem 1rem', borderRadius: '10px', border: '0.5px solid var(--card-border)', backgroundColor: 'var(--app-bg)', color: 'var(--card-title)', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button onClick={() => setModalStep('tipo')} style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: '0.5px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--muted-fg)', cursor: 'pointer' }}>← Volver</button>
                <button onClick={() => addWidget('externo', { url: externUrl, titulo: externTitle })} disabled={!externUrl} style={{ flex: 2, padding: '0.7rem', borderRadius: '10px', border: 'none', backgroundColor: 'var(--primary)', color: '#fff', cursor: externUrl ? 'pointer' : 'not-allowed', opacity: externUrl ? 1 : 0.5 }}>Agregar</button>
              </div>
            </>)}

            <button onClick={() => setShowWidgetModal(false)} style={{ marginTop: '1.25rem', width: '100%', padding: '0.6rem', borderRadius: '20px', border: '0.5px solid var(--card-border)', backgroundColor: 'transparent', color: 'var(--muted-fg)', cursor: 'pointer', fontSize: '0.85rem' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </DndProvider>
  );
}