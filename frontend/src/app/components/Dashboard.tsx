// src/app/components/Dashboard.tsx

import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MyNotes } from './MyNotes';
import { Workflows } from './Workflows';
import { Team } from './Team';
import { Reminders } from './Reminders';
import { Whiteboard } from './Whiteboard';
import { ThemePicker } from './ThemePicker';
import React from 'react';
import { Home, StickyNote, Workflow, Bell, ChevronLeft, ChevronRight } from "lucide-react";

// ========================================
// CONFIGURACIÓN DRAG & DROP
// ========================================
const WIDGET_TYPE = 'WIDGET';

// Los border/accent de los widgets usan variables del tema activo
const initialWidgets = [
  { id: 'pending',    title: 'Pendientes'    },
  { id: 'projects',  title: 'Proyectos'     },
  { id: 'weather',   title: 'Clima'         },
  { id: 'maps',      title: 'Ubicación'     },
  { id: 'reminders', title: 'Recordatorios' },
  { id: 'notes',     title: 'Nota rápida'   },
];

// availableWidgets igual que initialWidgets (para el modal)
const availableWidgets = [...initialWidgets];

const pendingTasks = [
  { id: 1, text: 'Review budget allocations',   status: 'pending'    },
  { id: 2, text: 'Draft OKRs for Q2',           status: 'inprogress' },
  { id: 3, text: 'Schedule team meetings',      status: 'pending'    },
  { id: 4, text: 'Gather stakeholder feedback', status: 'inprogress' },
  { id: 5, text: 'Update project timeline',     status: 'done'       },
];

const statusLabel: Record<string, string> = {
  pending: 'Pendiente', inprogress: 'En progreso', done: 'Completado',
};

// ========================================
// CONTENIDO DE WIDGETS
// ========================================
function WidgetContent({ id }: { id: string }) {
  if (id === 'pending') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {pendingTasks.map(task => (
          <div key={task.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: 'var(--app-bg)', border: '0.5px solid var(--card-border)',
            borderRadius: '10px', padding: '7px 10px',
          }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--dim-fg)', fontWeight: 300 }}>{task.text}</span>
            <span style={{
              fontSize: '0.75rem', fontWeight: 400,
              backgroundColor: `var(--status-${task.status}-bg)`,
              color: `var(--status-${task.status}-fg)`,
              padding: '2px 10px', borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '8px',
            }}>
              {statusLabel[task.status]}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (id === 'projects') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          { name: 'FlowNote App', progress: 65 },
          { name: 'Marketing Q2', progress: 40 },
          { name: 'Diseño UI',    progress: 80 },
        ].map((p, i) => (
          <div key={p.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--dim-fg)', fontWeight: 300 }}>{p.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted-fg)' }}>{p.progress}%</span>
            </div>
            <div style={{ backgroundColor: 'var(--progress-track)', borderRadius: '6px', height: '4px' }}>
              <div style={{
                width: `${p.progress}%`,
                backgroundColor: i === 1 ? 'var(--sidebar-user-role)' : 'var(--primary)',
                borderRadius: '6px', height: '4px',
              }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (id === 'weather') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '4px 0' }}>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 300, color: 'var(--card-title)', lineHeight: 1 }}>72°</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 300, color: 'var(--muted-fg)', marginTop: '4px' }}>San Francisco</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 300, color: 'var(--muted-fg)', marginTop: '6px' }}>Sunny · High 75° · Low 62°</div>
        </div>
        <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
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
    );
  }

  if (id === 'maps') {
    return (
      <div style={{ width: '100%', height: '160px', borderRadius: '10px', overflow: 'hidden' }}>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.8354345096513!2d144.9537353159044!3d-37.81627974201477!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d4c2b349649%3A0xb6899234e561db11!2sEnvato!5e0!3m2!1sen!2sau!4v1234567890123!5m2!1sen!2sau"
          width="100%" height="100%" style={{ border: 0 }} loading="lazy" title="Maps"
        />
      </div>
    );
  }

  if (id === 'reminders') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[
          { text: 'Revisar objetivos semanales', time: 'Viernes 5:00 PM' },
          { text: 'Reunión de equipo',           time: 'Lunes 9:00 AM'   },
          { text: 'Entregar informe Q2',         time: 'Miércoles 3:00 PM' },
        ].map((r, i) => (
          <div key={i} style={{
            backgroundColor: 'var(--app-bg)', border: '0.5px solid var(--card-border)',
            borderRadius: '10px', padding: '7px 10px',
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--dim-fg)', fontWeight: 400 }}>{r.text}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-fg)', fontWeight: 300 }}>{r.time}</p>
          </div>
        ))}
      </div>
    );
  }

  if (id === 'notes') {
    return (
      <textarea
        placeholder="Escribe algo rápido aquí..."
        style={{
          width: '100%', height: '120px', border: 'none',
          backgroundColor: 'transparent', resize: 'none',
          fontSize: '0.875rem', color: 'var(--app-fg)', fontWeight: 300,
          outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
        }}
      />
    );
  }

  return null;
}

// ========================================
// WIDGET ARRASTRABLE (con botón de quitar — cambio de compañera)
// ========================================
function DraggableWidget({ widget, index, moveWidget, removeWidget }: {
  widget: typeof initialWidgets[0];
  index: number;
  moveWidget: (from: number, to: number) => void;
  removeWidget: (index: number) => void;
}) {
  const [{ isDragging }, drag] = useDrag({
    type: WIDGET_TYPE,
    item: { index },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: WIDGET_TYPE,
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveWidget(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={node => { drag(node); drop(node); }}
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '0.5px solid var(--card-border)',
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 400, color: 'var(--card-title)' }}>
            {widget.title}
          </h3>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
        </div>
        {/* Botón quitar widget — cambio de compañera */}
        <button
          onClick={() => removeWidget(index)}
          style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            color: 'var(--muted-fg)', fontSize: '1rem',
            width: '24px', height: '24px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: '0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--highlight-bg)';
            e.currentTarget.style.color = 'var(--primary)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--muted-fg)';
          }}
        >
          ✕
        </button>
      </div>
      <WidgetContent id={widget.id} />
    </div>
  );
}

// ========================================
// HOME CONTENT (con botón agregar widget — cambio de compañera)
// ========================================
function HomeContent({ widgets, moveWidget, removeWidget, onAddClick }: {
  widgets: typeof initialWidgets;
  moveWidget: (from: number, to: number) => void;
  removeWidget: (index: number) => void;
  onAddClick: () => void;
}) {
  return (
    <>
      <div style={{
        width: '100%', height: '200px',
        background: 'var(--hero-gradient)',
        display: 'flex', alignItems: 'flex-end', padding: '0 3rem 1.5rem',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: 'var(--card-bg)', border: '3px solid var(--app-bg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.10)',
        }}>✨</div>
      </div>

      <div style={{ padding: '1.5rem 3rem 0' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted-fg)', fontWeight: 300, margin: '0 0 0.25rem' }}>Bienvenida de vuelta</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--card-title)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>Bienvenida, María</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-fg)', fontWeight: 300, margin: '0 0 2rem' }}>3 tareas pendientes hoy · Arrastra los widgets para organizarlos</p>
      </div>

      <div style={{ padding: '0 3rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {widgets.map((widget, index) => (
          <DraggableWidget key={`${widget.id}-${index}`} widget={widget} index={index} moveWidget={moveWidget} removeWidget={removeWidget} />
        ))}

        {/* Botón agregar widget — cambio de compañera */}
        <button
          onClick={onAddClick}
          style={{
            minHeight: '180px',
            backgroundColor: 'var(--card-bg)',
            border: '2px dashed var(--card-border)',
            borderRadius: '16px',
            cursor: 'pointer',
            color: 'var(--primary)',
            fontSize: '2rem',
            fontWeight: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease',
          }}
        >
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
  const [widgets, setWidgets]               = useState(initialWidgets);
  const [activePage, setActivePage]         = useState('inicio');
  const [sidebarOpen, setSidebarOpen]       = useState(true);   // cambio de compañera
  const [showWidgetModal, setShowWidgetModal] = useState(false); // cambio de compañera

  const addWidget = (widget: typeof initialWidgets[0]) => {
    setWidgets([...widgets, widget]);
    setShowWidgetModal(false);
  };

  const moveWidget = (from: number, to: number) => {
    const updated = [...widgets];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setWidgets(updated);
  };

  const removeWidget = (index: number) => {
    setWidgets(widgets.filter((_, i) => i !== index));
  };

  const pages: Record<string, React.ReactNode> = {
    inicio:        <HomeContent widgets={widgets} moveWidget={moveWidget} removeWidget={removeWidget} onAddClick={() => setShowWidgetModal(true)} />,
    notas:         <MyNotes goToBoard={() => setActivePage('tablero')} />,
    workflows:     <Workflows goToTeam={() => setActivePage('equipo')} />,
    equipo:        <Team />,
    recordatorios: <Reminders />,
    tablero:       <Whiteboard />,
  };

  const pageTitle: Record<string, string> = {
    inicio: 'Dashboard', notas: 'Mis Notas', workflows: 'Workflows',
    equipo: 'Equipo', recordatorios: 'Recordatorios', tablero: 'Tablero',
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

        {/* ── SIDEBAR (colapsable — cambio de compañera) ── */}
        <aside style={{
          width: sidebarOpen ? '220px' : '76px',
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '0.5px solid var(--sidebar-border)',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          height: '100vh', position: 'sticky', top: 0, flexShrink: 0,
          overflow: 'hidden', transition: 'width 0.3s ease',
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
              >MJ</div>
              {sidebarOpen && (
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 400, color: 'var(--card-title)' }}>Maria José</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 300, color: 'var(--sidebar-user-role)' }}>Admin</div>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--app-bg)' }}>
          {/* Header */}
          <div style={{
            padding: '1rem 2rem', borderBottom: '1px solid var(--header-border)',
            backgroundColor: 'var(--header-bg)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '1rem', color: 'var(--header-fg)', fontWeight: 400 }}>
              {pageTitle[activePage]}
            </span>
            <input
              placeholder="Buscar notas..."
              style={{
                padding: '0.4rem 1rem', borderRadius: '20px',
                border: '1px solid var(--input-border)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--app-fg)',
                fontSize: '0.8rem', outline: 'none',
              }}
            />
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            {pages[activePage]}
          </div>
        </main>

      </div>

      {/* Modal agregar widget (cambio de compañera) */}
      {showWidgetModal && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: '18px',
            padding: '2rem', width: '420px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 300, color: 'var(--card-title)' }}>
              Agregar widget
            </h2>
            <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'var(--muted-fg)' }}>
              Selecciona el tipo de widget que quieres agregar al inicio.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {availableWidgets.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => addWidget(widget)}
                  style={{
                    padding: '1rem', borderRadius: '14px',
                    border: '1px solid var(--card-border)',
                    backgroundColor: 'var(--app-bg)',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: 'var(--primary)', marginBottom: '0.75rem',
                  }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--card-title)', fontWeight: 400 }}>
                    {widget.title}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowWidgetModal(false)}
              style={{
                marginTop: '1.5rem', width: '100%', padding: '0.7rem',
                borderRadius: '20px', border: '1px solid var(--card-border)',
                backgroundColor: 'transparent', color: 'var(--subtle-fg)', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </DndProvider>
  );
}