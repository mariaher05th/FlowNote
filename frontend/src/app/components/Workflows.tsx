import { Users } from "lucide-react";

const flows = [
  {
    id: 1, title: 'Proceso de diseño UI', steps: [
      { name: 'Investigación', status: 'done'       },
      { name: 'Wireframes',    status: 'done'       },
      { name: 'Prototipo',     status: 'inprogress' },
      { name: 'Revisión',      status: 'pending'    },
      { name: 'Entrega',       status: 'pending'    },
    ],
  },
  {
    id: 2, title: 'Lanzamiento Q2', steps: [
      { name: 'Planificación', status: 'done'       },
      { name: 'Desarrollo',    status: 'inprogress' },
      { name: 'Testing',       status: 'pending'    },
      { name: 'Deploy',        status: 'pending'    },
    ],
  },
  {
    id: 3, title: 'Onboarding equipo', steps: [
      { name: 'Invitar miembros', status: 'done'       },
      { name: 'Asignar roles',    status: 'done'       },
      { name: 'Capacitación',     status: 'inprogress' },
      { name: 'Revisión 30 días', status: 'pending'    },
    ],
  },
];

type WorkflowsProps = {
  goToTeam: () => void; // prop de compañera
};

export function Workflows({ goToTeam }: WorkflowsProps) {
  return (
    <div style={{ padding: '3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, color: 'var(--card-title)', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>
        Workflows
      </h1>
      <p style={{ fontSize: '0.875rem', color: 'var(--muted-fg)', fontWeight: 300, margin: '0 0 2rem' }}>
        Flujos de trabajo activos
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {flows.map(flow => (
          <div key={flow.id} style={{
            backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)',
            borderRadius: '16px', padding: '1.5rem',
          }}>
            {/* Header con botón "Ver equipo" (cambio de compañera) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--card-title)', margin: 0 }}>
                {flow.title}
              </h3>

              {/* Botón con tooltip — cambio de compañera */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={goToTeam}
                  style={{
                    width: '34px', height: '34px', borderRadius: '10px', border: 'none',
                    backgroundColor: 'var(--highlight-bg)', color: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--sidebar-active-bg)';
                    const tooltip = e.currentTarget.parentElement?.querySelector('.tooltip');
                    if (tooltip) {
                      (tooltip as HTMLElement).style.opacity = '1';
                      (tooltip as HTMLElement).style.transform = 'translateX(-50%) translateY(0px)';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'var(--highlight-bg)';
                    const tooltip = e.currentTarget.parentElement?.querySelector('.tooltip');
                    if (tooltip) {
                      (tooltip as HTMLElement).style.opacity = '0';
                      (tooltip as HTMLElement).style.transform = 'translateX(-50%) translateY(5px)';
                    }
                  }}
                >
                  <Users size={16} strokeWidth={1.8} />
                </button>

                <div
                  className="tooltip"
                  style={{
                    position: 'absolute', top: '42px', left: '50%',
                    transform: 'translateX(-50%) translateY(5px)',
                    backgroundColor: 'var(--app-fg)', color: 'var(--app-bg)',
                    fontSize: '0.72rem', padding: '0.35rem 0.6rem',
                    borderRadius: '8px', whiteSpace: 'nowrap',
                    opacity: 0, pointerEvents: 'none', transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)', fontWeight: 300, zIndex: 100,
                  }}
                >
                  Ver equipo
                </div>
              </div>
            </div>

            {/* Steps */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              {flow.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      backgroundColor: `var(--status-${step.status}-bg)`,
                      border: `2px solid var(--status-${step.status}-fg)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '6px',
                    }}>
                      {step.status === 'done' && (
                        <span style={{ fontSize: '14px', color: 'var(--status-done-fg)' }}>✓</span>
                      )}
                      {step.status !== 'done' && (
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: `var(--status-${step.status}-fg)` }} />
                      )}
                    </div>
                    <span style={{
                      fontSize: '0.75rem', color: `var(--status-${step.status}-fg)`,
                      fontWeight: 300, textAlign: 'center', whiteSpace: 'nowrap',
                    }}>{step.name}</span>
                  </div>
                  {i < flow.steps.length - 1 && (
                    <div style={{
                      height: '2px', flex: 1, marginBottom: '20px',
                      backgroundColor: step.status === 'done' ? 'var(--status-done-fg)' : 'var(--card-border)',
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}