import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { MyNotes } from './MyNotes';
import { Workflows } from './Workflows';
import { Team } from './Team';
import { Reminders } from './Reminders';
import { Whiteboard } from './Whiteboard';
import React from 'react';
import { Home, StickyNote, Workflow, Bell, Users, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
// ========================================
// CONFIGURACIÓN DRAG & DROP
// ========================================
const WIDGET_TYPE = 'WIDGET'; // Identificador único para widgets arrastrables

// ========================================
// DATOS INICIALES - Widgets del dashboard principal
// ========================================
const initialWidgets = [
  { id: 'pending',    title: 'Pendientes',    border: '#E4DCF4', accent: '#8070C8' },
  { id: 'projects',  title: 'Proyectos',     border: '#F0D8EC', accent: '#C070A0' },
  { id: 'weather',   title: 'Clima',         border: '#D8ECF8', accent: '#7090B8' },
  { id: 'maps',      title: 'Ubicación',     border: '#D8F8EC', accent: '#508070' },
  { id: 'reminders', title: 'Recordatorios', border: '#F8ECD8', accent: '#A08040' },
  { id: 'notes',     title: 'Nota rápida',   border: '#E4DCF4', accent: '#8070C8' },
];


const availableWidgets = [
  { id: 'pending', title: 'Pendientes', border: '#E4DCF4', accent: '#8070C8' },
  { id: 'projects', title: 'Proyectos', border: '#F0D8EC', accent: '#C070A0' },
  { id: 'weather', title: 'Clima', border: '#D8ECF8', accent: '#7090B8' },
  { id: 'maps', title: 'Ubicación', border: '#D8F8EC', accent: '#508070' },
  { id: 'reminders', title: 'Recordatorios', border: '#F8ECD8', accent: '#A08040' },
  { id: 'notes', title: 'Nota rápida', border: '#E4DCF4', accent: '#8070C8' },
];

// Datos mock para widget de tareas pendientes
const pendingTasks = [
  { id: 1, text: 'Review budget allocations',   status: 'pending' },
  { id: 2, text: 'Draft OKRs for Q2',           status: 'inprogress' },
  { id: 3, text: 'Schedule team meetings',      status: 'pending' },
  { id: 4, text: 'Gather stakeholder feedback', status: 'inprogress' },
  { id: 5, text: 'Update project timeline',     status: 'done' },
];

// Estilos para badges de estado (pending/inprogress/done)
const statusStyle: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: '#F8D8EC', color: '#A06080', label: 'Pendiente' },
  inprogress: { bg: '#E0D8F8', color: '#7060A8', label: 'En progreso' },
  done:       { bg: '#D8F8EC', color: '#408060', label: 'Completado' },
};

// ========================================
// RENDERIZADOR DE CONTENIDO POR WIDGET
// ========================================
function WidgetContent({ id }: { id: string }) {
  if (id === 'pending') {
    // Widget muestra lista de tareas con badges de estado
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {pendingTasks.map(task => (
          <div key={task.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: '#F6F4FB', border: '0.5px solid #EDE8F8',
            borderRadius: '10px', padding: '7px 10px',
          }}>
            <span style={{ fontSize: '0.875rem', color: '#5A5070', fontWeight: 300 }}>{task.text}</span>
            <span style={{
              fontSize: '0.75rem', fontWeight: 400,
              backgroundColor: statusStyle[task.status].bg,
              color: statusStyle[task.status].color,
              padding: '2px 10px', borderRadius: '20px', whiteSpace: 'nowrap', marginLeft: '8px'
            }}>
              {statusStyle[task.status].label}
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
          { name: 'FlowNote App', progress: 65, color: '#8070C8' },
          { name: 'Marketing Q2', progress: 40, color: '#C070A0' },
          { name: 'Diseño UI',    progress: 80, color: '#70A0B8' },
        ].map(p => (
          <div key={p.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.875rem', color: '#5A5070', fontWeight: 300 }}>{p.name}</span>
              <span style={{ fontSize: '0.75rem', color: '#B0A0C0' }}>{p.progress}%</span>
            </div>
            <div style={{ backgroundColor: '#EDE8F8', borderRadius: '6px', height: '4px' }}>
              <div style={{ width: `${p.progress}%`, backgroundColor: p.color, borderRadius: '6px', height: '4px' }} />
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
          <div style={{ fontSize: '2.5rem', fontWeight: 300, color: '#2F2840', lineHeight: 1 }}>72°</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 300, color: '#B0A0C0', marginTop: '4px' }}>San Francisco</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 300, color: '#B0A0C0', marginTop: '6px' }}>Sunny · High 75° · Low 62°</div>
        </div>
        <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="12" fill="#F8D8EC" />
          <line x1="32" y1="8"  x2="32" y2="14" stroke="#F8D8EC" strokeWidth="2" strokeLinecap="round" />
          <line x1="32" y1="50" x2="32" y2="56" stroke="#F8D8EC" strokeWidth="2" strokeLinecap="round" />
          <line x1="56" y1="32" x2="50" y2="32" stroke="#F8D8EC" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="32" x2="8"  y2="32" stroke="#F8D8EC" strokeWidth="2" strokeLinecap="round" />
          <line x1="47.5" y1="16.5" x2="43.3" y2="20.7" stroke="#F8D8EC" strokeWidth="2" strokeLinecap="round" />
          <line x1="20.7" y1="43.3" x2="16.5" y2="47.5" stroke="#F8D8EC" strokeWidth="2" strokeLinecap="round" />
          <line x1="47.5" y1="47.5" x2="43.3" y2="43.3" stroke="#F8D8EC" strokeWidth="2" strokeLinecap="round" />
          <line x1="20.7" y1="20.7" x2="16.5" y2="16.5" stroke="#F8D8EC" strokeWidth="2" strokeLinecap="round" />
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
          { text: 'Reunión de equipo',           time: 'Lunes 9:00 AM' },
          { text: 'Entregar informe Q2',         time: 'Miércoles 3:00 PM' },
        ].map((r, i) => (
          <div key={i} style={{
            backgroundColor: '#F6F4FB', border: '0.5px solid #EDE8F8',
            borderRadius: '10px', padding: '7px 10px',
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#5A5070', fontWeight: 400 }}>{r.text}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#B0A0C0', fontWeight: 300 }}>{r.time}</p>
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
          fontSize: '0.875rem', color: '#2F2840', fontWeight: 300,
          outline: 'none', fontFamily: 'inherit', lineHeight: 1.6,
        }}
      />
    );
  }

  return null;
}

function DraggableWidget({ widget, index, moveWidget }: {
  widget: typeof initialWidgets[0];
  index: number;
  moveWidget: (from: number, to: number) => void;
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
        backgroundColor: '#FFFFFF',
        border: `0.5px solid ${widget.border}`,
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: '0 2px 12px rgba(128,112,200,0.06)',
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(128,112,200,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(128,112,200,0.06)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 400, color: '#2F2840' }}>
          {widget.title}
        </h3>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: widget.accent }} />
      </div>
      <WidgetContent id={widget.id} />
    </div>
  );
}

function HomeContent({ widgets, moveWidget, onAddClick }: {
  widgets: typeof initialWidgets;
  moveWidget: (from: number, to: number) => void;
  onAddClick: () => void;
}) {
  return (
    <>
      <div style={{
        width: '100%', height: '200px',
        background: 'linear-gradient(135deg, #E0D8F8 0%, #F8D8EC 50%, #D8ECF8 100%)',
        display: 'flex', alignItems: 'flex-end', padding: '0 3rem 1.5rem',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          backgroundColor: '#FFFFFF', border: '3px solid #F6F4FB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', boxShadow: '0 4px 12px rgba(128,112,200,0.15)',
        }}>✨</div>
      </div>

      <div style={{ padding: '1.5rem 3rem 0' }}>
        <p style={{ fontSize: '0.9rem', color: '#B0A0C0', fontWeight: 300, margin: '0 0 0.25rem' }}>Bienvenida de vuelta</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#2F2840', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>Bienvenida, María</h1>
        <p style={{ fontSize: '0.875rem', color: '#B0A0C0', fontWeight: 300, margin: '0 0 2rem' }}>3 tareas pendientes hoy · Arrastra los widgets para organizarlos</p>


      </div>

      <div style={{ padding: '0 3rem 3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {widgets.map((widget, index) => (
          <DraggableWidget key={`${widget.id}-${index}`} widget={widget} index={index} moveWidget={moveWidget} />
        ))}

        {/* Widget vacío para agregar */}
        <button
          onClick={onAddClick}
          style={{
            minHeight: '180px',
            backgroundColor: '#FFFFFF',
            border: '2px dashed #C8C0E0',
            borderRadius: '16px',
            cursor: 'pointer',
            color: '#8070C8',
            fontSize: '2rem',
            fontWeight: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ fontSize: '2.5rem' }}>+</span>
          <span style={{ fontSize: '0.9rem' }}>
            Agregar widget
          </span>
        </button>


      </div>
    </>
  );
}

export function Dashboard() {
  const [widgets, setWidgets] = useState(initialWidgets);
  const [activePage, setActivePage] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [showWidgetModal, setShowWidgetModal] = useState(false);

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

  const pages: Record<string, React.ReactNode> = {
    inicio:        (<HomeContent widgets={widgets} moveWidget={moveWidget}
                  onAddClick={() => setShowWidgetModal(true)} />),
    notas:         <MyNotes goToBoard={() => setActivePage('tablero')} />,
    workflows:     <Workflows goToTeam={() => setActivePage('equipo')} />,
    equipo:        <Team />,
    recordatorios: <Reminders />,
    tablero:       <Whiteboard />,
  };
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        <aside style={{
          width: sidebarOpen ? '220px' : '76px',
          backgroundColor: '#EAE4F8',
          borderRight: '0.5px solid #D8D0EC',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.3s ease',
        }}>
          <div style={{
            padding: sidebarOpen ? '2.5rem 1.5rem' : '2.5rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '3rem',
            transition: 'padding 0.3s ease',
          }}>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarOpen ? 'space-between' : 'center',
              gap: '0.75rem',
            }}>
              {sidebarOpen && (
                <h1 style={{
                  color: '#8070C8',
                  fontWeight: 300,
                  fontSize: '1.5rem',
                  letterSpacing: '-0.02em',
                  margin: 0,
                  whiteSpace: 'nowrap',
                }}>
                  FlowNote
                </h1>
              )}

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title={sidebarOpen ? 'Cerrar barra lateral' : 'Abrir barra lateral'}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  border: '0.5px solid #D8D0EC',
                  backgroundColor: '#E0D8F8',
                  color: '#8070C8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'Inicio', key: 'inicio', icon: Home },
                { label: 'Mis Notas', key: 'notas', icon: StickyNote },
                { label: 'Workflows', key: 'workflows', icon: Workflow },
                { label: 'Recordatorios', key: 'recordatorios', icon: Bell },
              ].map(item => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.key}
                    onClick={() => setActivePage(item.key)}
                    title={!sidebarOpen ? item.label : undefined}
                    style={{
                      padding: sidebarOpen ? '0.625rem 1rem' : '0.75rem',
                      borderRadius: '10px',
                      textAlign: 'left',
                      backgroundColor: activePage === item.key ? '#E0D8F8' : 'transparent',
                      color: activePage === item.key ? '#8070C8' : '#9080B0',
                      fontWeight: activePage === item.key ? 400 : 300,
                      fontSize: '0.9375rem',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: sidebarOpen ? 'flex-start' : 'center',
                      gap: '0.7rem',
                      width: '100%',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {Icon && <Icon size={18} strokeWidth={1.8} />}
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          <div style={{
            padding: sidebarOpen ? '1.5rem' : '1rem 0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            gap: '0.75rem',
            transition: 'all 0.3s ease',
          }}>
            <div
              title={!sidebarOpen ? 'Maria José - Admin' : undefined}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#E0D8F8',
                border: '2px solid #8070C8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8125rem',
                fontWeight: 400,
                color: '#8070C8',
                flexShrink: 0,
              }}
            >
              MJ
            </div>

            {sidebarOpen && (
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 400, color: '#2F2840' }}>
                  Maria José
                </div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 300, color: '#C070A0' }}>
                  Admin
                </div>
              </div>
            )}
          </div>
        </aside>

        <main style={{
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#F6F4FB'
}}>

  {/* 🔝 HEADER */}
  <div style={{
    padding: '1rem 2rem',
    borderBottom: '1px solid #E4DCF4',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>

    {/* IZQUIERDA */}
    <span style={{
      fontSize: '1rem',
      color: '#2F2840',
      fontWeight: 400
    }}>
      {activePage === 'inicio' && 'Dashboard'}
      {activePage === 'notas' && 'Mis Notas'}
      {activePage === 'workflows' && 'Workflows'}
      {activePage === 'equipo' && 'Equipo'}
      {activePage === 'recordatorios' && 'Recordatorios'}
      {activePage === 'tablero' && 'Tablero'}
    </span>

    {/* DERECHA */}
    <input
      placeholder="Buscar notas..."
      style={{
        padding: '0.4rem 1rem',
        borderRadius: '20px',
        border: '1px solid #D8D0EC',
        fontSize: '0.8rem',
        outline: 'none'
      }}
    />
  </div>

  {/* 📄 CONTENIDO */}
  <div style={{ flex: 1, overflow: 'auto' }}>
    {pages[activePage]}
  </div>

</main>
        

      </div>
      {showWidgetModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(47, 40, 64, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '2rem',
            width: '420px',
            boxShadow: '0 12px 40px rgba(47, 40, 64, 0.18)'
          }}>
            <h2 style={{
              margin: '0 0 0.5rem',
              fontSize: '1.4rem',
              fontWeight: 300,
              color: '#2F2840'
            }}>
              Agregar widget
            </h2>

            <p style={{
              margin: '0 0 1.5rem',
              fontSize: '0.875rem',
              color: '#B0A0C0'
            }}>
              Selecciona el tipo de widget que quieres agregar al inicio.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem'
            }}>
              {availableWidgets.map(widget => (
                <button
                  key={widget.id}
                  onClick={() => addWidget(widget)}
                  style={{
                    padding: '1rem',
                    borderRadius: '14px',
                    border: `1px solid ${widget.border}`,
                    backgroundColor: '#F6F4FB',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: widget.accent,
                    marginBottom: '0.75rem'
                  }} />

                  <span style={{
                    fontSize: '0.9rem',
                    color: '#2F2840',
                    fontWeight: 400
                  }}>
                    {widget.title}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowWidgetModal(false)}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                padding: '0.7rem',
                borderRadius: '20px',
                border: '1px solid #D8D0EC',
                backgroundColor: 'transparent',
                color: '#9080B0',
                cursor: 'pointer'
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