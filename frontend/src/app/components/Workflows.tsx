const flows = [
  {
    id: 1, title: 'Proceso de diseño UI', steps: [
      { name: 'Investigación', status: 'done' },
      { name: 'Wireframes', status: 'done' },
      { name: 'Prototipo', status: 'inprogress' },
      { name: 'Revisión', status: 'pending' },
      { name: 'Entrega', status: 'pending' },
    ]
  },
  {
    id: 2, title: 'Lanzamiento Q2', steps: [
      { name: 'Planificación', status: 'done' },
      { name: 'Desarrollo', status: 'inprogress' },
      { name: 'Testing', status: 'pending' },
      { name: 'Deploy', status: 'pending' },
    ]
  },
  {
    id: 3, title: 'Onboarding equipo', steps: [
      { name: 'Invitar miembros', status: 'done' },
      { name: 'Asignar roles', status: 'done' },
      { name: 'Capacitación', status: 'inprogress' },
      { name: 'Revisión 30 días', status: 'pending' },
    ]
  },
];

const stepColor: Record<string, { bg: string; color: string; dot: string }> = {
  done:       { bg: '#D8F8EC', color: '#408060', dot: '#60C090' },
  inprogress: { bg: '#E0D8F8', color: '#7060A8', dot: '#8070C8' },
  pending:    { bg: '#F4F0FC', color: '#A090C0', dot: '#C0B0D8' },
};

export function Workflows() {
  return (
    <div style={{ padding: '3rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 300, color: '#2F2840', letterSpacing: '-0.02em', margin: '0 0 0.5rem' }}>Workflows</h1>
      <p style={{ fontSize: '0.875rem', color: '#B0A0C0', fontWeight: 300, margin: '0 0 2rem' }}>Flujos de trabajo activos</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {flows.map(flow => (
          <div key={flow.id} style={{
            backgroundColor: '#FFFFFF', border: '0.5px solid #E4DCF4',
            borderRadius: '16px', padding: '1.5rem',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 400, color: '#2F2840', margin: '0 0 1.25rem' }}>{flow.title}</h3>

            {/* Steps */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              {flow.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      backgroundColor: stepColor[step.status].bg,
                      border: `2px solid ${stepColor[step.status].dot}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '6px',
                    }}>
                      {step.status === 'done' && <span style={{ fontSize: '14px', color: stepColor[step.status].color }}>✓</span>}
                      {step.status === 'inprogress' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stepColor[step.status].dot }} />}
                      {step.status === 'pending' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: stepColor[step.status].dot }} />}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: stepColor[step.status].color, fontWeight: 300, textAlign: 'center', whiteSpace: 'nowrap' }}>{step.name}</span>
                  </div>
                  {i < flow.steps.length - 1 && (
                    <div style={{
                      height: '2px', flex: 1, marginBottom: '20px',
                      backgroundColor: step.status === 'done' ? '#60C090' : '#E4DCF4',
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