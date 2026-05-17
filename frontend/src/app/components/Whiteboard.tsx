import { useState, useRef, useEffect } from 'react';

type Tool = 'select' | 'pen' | 'text' | 'note' | 'task' | 'eraser';

interface CanvasItem {
  id: string;
  type: 'note' | 'task' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  status?: 'pending' | 'inprogress' | 'done';
  color: string; // nota: el color de los sticky notes se mantiene fijo (son "papel")
}

// Colores fijos de sticky notes — intencionalmente no temáticos (son papel físico)
const noteColors = ['#FFF8E7', '#F0EEFF', '#FFE8F0', '#E8F5FF', '#E8FFE8'];

const initialItems: CanvasItem[] = [
  { id: '1', type: 'note', x: 80,  y: 80,  width: 200, height: 140, content: 'Ideas iniciales del proyecto FlowNote', color: '#FFF8E7' },
  { id: '2', type: 'task', x: 340, y: 80,  width: 220, height: 80,  content: 'Diseñar prototipo UI',        status: 'done',       color: '' },
  { id: '3', type: 'task', x: 340, y: 180, width: 220, height: 80,  content: 'Implementar drag and drop',   status: 'inprogress', color: '' },
  { id: '4', type: 'task', x: 340, y: 280, width: 220, height: 80,  content: 'Conectar API de clima',       status: 'pending',    color: '' },
  { id: '5', type: 'note', x: 620, y: 80,  width: 200, height: 140, content: 'Paleta: Lavender Fog\n#EAE4F8 #F8D8EC', color: '#F0EEFF' },
  { id: '6', type: 'text', x: 80,  y: 280, width: 200, height: 60,  content: 'Sprint 1 — Abril 2025',       color: 'transparent' },
];

export function Whiteboard() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [tool,       setTool]       = useState<Tool>('select');
  const [items,      setItems]      = useState<CanvasItem[]>(initialItems);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging,   setDragging]   = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [drawing,    setDrawing]    = useState(false);
  const [penColor,   setPenColor]   = useState('#8070C8');
  const [penSize,    setPenSize]    = useState(3);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editText,   setEditText]   = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'pen' && tool !== 'eraser') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    // El eraser usa el fondo del tablero — leemos la variable CSS en runtime
    const eraserColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--whiteboard-bg').trim() || '#F6F4FB';
    ctx.strokeStyle = tool === 'eraser' ? eraserColor : penColor;
    ctx.lineWidth   = tool === 'eraser' ? 24 : penSize;
    setDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDraw = () => setDrawing(false);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool === 'pen' || tool === 'eraser') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'note') {
      setItems(prev => [...prev, {
        id: Date.now().toString(), type: 'note', x, y, width: 200, height: 140,
        content: 'Nueva nota',
        color: noteColors[Math.floor(Math.random() * noteColors.length)],
      }]);
      setTool('select');
      return;
    }
    if (tool === 'task') {
      setItems(prev => [...prev, {
        id: Date.now().toString(), type: 'task', x, y, width: 220, height: 80,
        content: 'Nueva tarea', status: 'pending', color: '',
      }]);
      setTool('select');
      return;
    }
    if (tool === 'text') {
      setItems(prev => [...prev, {
        id: Date.now().toString(), type: 'text', x, y, width: 200, height: 50,
        content: 'Texto libre', color: 'transparent',
      }]);
      setTool('select');
      return;
    }
  };

  const startDrag = (e: React.MouseEvent, id: string) => {
    if (tool !== 'select') return;
    e.stopPropagation();
    const item = items.find(i => i.id === id);
    if (!item || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDragging({ id, offsetX: e.clientX - rect.left - item.x, offsetY: e.clientY - rect.top - item.y });
    setSelectedId(id);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setItems(prev => prev.map(i =>
      i.id === dragging.id
        ? { ...i, x: e.clientX - rect.left - dragging.offsetX, y: e.clientY - rect.top - dragging.offsetY }
        : i
    ));
  };

  const stopDrag = () => setDragging(null);
  const deleteItem = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setSelectedId(null); };

  const cycleStatus = (id: string) => {
    const cycle = ['pending', 'inprogress', 'done'] as const;
    setItems(prev => prev.map(i => {
      if (i.id !== id || i.type !== 'task') return i;
      const current = cycle.indexOf(i.status as typeof cycle[number]);
      return { ...i, status: cycle[(current + 1) % 3] };
    }));
  };

  const startEdit = (e: React.MouseEvent, item: CanvasItem) => {
    e.stopPropagation();
    if (tool !== 'select') return;
    setEditingId(item.id);
    setEditText(item.content);
  };

  const saveEdit = () => {
    setItems(prev => prev.map(i => i.id === editingId ? { ...i, content: editText } : i));
    setEditingId(null);
  };

  const tools: { key: Tool; label: string; icon: string }[] = [
    { key: 'select', label: 'Seleccionar', icon: '↖' },
    { key: 'pen',    label: 'Dibujar',     icon: '✏' },
    { key: 'eraser', label: 'Borrar',      icon: '⬜' },
    { key: 'note',   label: 'Nota',        icon: '📄' },
    { key: 'task',   label: 'Tarea',       icon: '☑' },
    { key: 'text',   label: 'Texto',       icon: 'T'  },
  ];

  const penColors = ['#8070C8', '#C070A0', '#7090B8', '#508070', '#C07840', '#3D3D3D'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--whiteboard-bg)' }}>

      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 20px',
        backgroundColor: 'var(--whiteboard-toolbar-bg)',
        borderBottom: `0.5px solid var(--whiteboard-toolbar-border)`,
        flexShrink: 0, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--primary)', marginRight: '8px' }}>Tablero</span>

        <div style={{ display: 'flex', gap: '4px' }}>
          {tools.map(t => (
            <button key={t.key} onClick={() => setTool(t.key)} title={t.label} style={{
              width: '36px', height: '36px', borderRadius: '10px', border: 'none',
              backgroundColor: tool === t.key ? 'var(--whiteboard-tool-active-bg)' : 'transparent',
              color: tool === t.key ? 'var(--whiteboard-tool-active-fg)' : 'var(--whiteboard-tool-fg)',
              fontSize: t.key === 'text' ? '14px' : '16px',
              cursor: 'pointer', fontWeight: 400, transition: 'background 0.15s',
            }}>{t.icon}</button>
          ))}
        </div>

        <div style={{ width: '0.5px', height: '24px', backgroundColor: 'var(--whiteboard-toolbar-border)', margin: '0 4px' }} />

        {tool === 'pen' && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {penColors.map(c => (
              <div key={c} onClick={() => setPenColor(c)} style={{
                width: '20px', height: '20px', borderRadius: '50%', backgroundColor: c,
                cursor: 'pointer',
                border: penColor === c ? '2px solid var(--app-fg)' : '2px solid transparent',
                transition: 'border 0.1s',
              }} />
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted-fg)' }}>Grosor</span>
              {[2, 4, 8].map(s => (
                <div key={s} onClick={() => setPenSize(s)} style={{
                  width: `${s + 10}px`, height: `${s + 10}px`, borderRadius: '50%',
                  backgroundColor: penSize === s ? 'var(--primary)' : 'var(--card-border)',
                  cursor: 'pointer',
                }} />
              ))}
            </div>
          </div>
        )}

        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--muted-fg)', fontWeight: 300 }}>
          {tool === 'select' ? 'Arrastra los elementos · Doble clic para editar' :
           tool === 'pen'    ? 'Dibuja libremente en el tablero' :
           tool === 'eraser' ? 'Haz clic para borrar trazos' :
           tool === 'note'   ? 'Haz clic para colocar una nota' :
           tool === 'task'   ? 'Haz clic para colocar una tarea' :
                               'Haz clic para agregar texto'}
        </span>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          cursor: tool === 'pen' || tool === 'eraser' ? 'crosshair' : 'default',
        }}
        onClick={handleCanvasClick}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
      >
        {/* Fondo punteado */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="var(--whiteboard-dot)" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Canvas de dibujo libre */}
        <canvas
          ref={canvasRef}
          width={2000} height={2000}
          style={{
            position: 'absolute', inset: 0,
            pointerEvents: tool === 'pen' || tool === 'eraser' ? 'auto' : 'none',
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
        />

        {/* Items */}
        {items.map(item => (
          <div
            key={item.id}
            style={{
              position: 'absolute', left: item.x, top: item.y, width: item.width,
              cursor: tool === 'select' ? (dragging?.id === item.id ? 'grabbing' : 'grab') : 'default',
              userSelect: 'none',
            }}
            onMouseDown={e => startDrag(e, item.id)}
          >
            {/* Sticky note */}
            {item.type === 'note' && (
              <div style={{
                backgroundColor: item.color,
                border: selectedId === item.id ? `1.5px solid var(--primary)` : '0.5px solid var(--card-border)',
                borderRadius: '12px', padding: '12px',
                minHeight: item.height, boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--muted-fg)', fontWeight: 300 }}>nota</span>
                  {selectedId === item.id && (
                    <button onClick={() => deleteItem(item.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '12px', color: 'var(--status-pending-fg)', padding: 0,
                    }}>✕</button>
                  )}
                </div>
                {editingId === item.id ? (
                  <textarea
                    autoFocus value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={saveEdit}
                    style={{
                      width: '100%', border: 'none', background: 'transparent',
                      fontSize: '0.875rem', color: 'var(--app-fg)', fontWeight: 300,
                      resize: 'none', outline: 'none', fontFamily: 'inherit',
                      lineHeight: 1.5, minHeight: '80px',
                    }}
                  />
                ) : (
                  <p onDoubleClick={e => startEdit(e, item)} style={{
                    fontSize: '0.875rem', color: 'var(--app-fg)', fontWeight: 300,
                    margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap',
                  }}>{item.content}</p>
                )}
              </div>
            )}

            {/* Task card */}
            {item.type === 'task' && (
              <div style={{
                backgroundColor: 'var(--card-bg)',
                border: selectedId === item.id ? `1.5px solid var(--primary)` : '0.5px solid var(--card-border)',
                borderRadius: '12px', padding: '10px 12px',
                minHeight: item.height, boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  {editingId === item.id ? (
                    <input
                      autoFocus value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onBlur={saveEdit}
                      style={{
                        flex: 1, border: 'none', background: 'transparent',
                        fontSize: '0.875rem', color: 'var(--card-title)', fontWeight: 400,
                        outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                  ) : (
                    <p onDoubleClick={e => startEdit(e, item)} style={{
                      fontSize: '0.875rem', color: 'var(--card-title)', fontWeight: 400,
                      margin: 0, flex: 1, paddingRight: '8px',
                    }}>{item.content}</p>
                  )}
                  {selectedId === item.id && (
                    <button onClick={() => deleteItem(item.id)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '12px', color: 'var(--status-pending-fg)', padding: 0, flexShrink: 0,
                    }}>✕</button>
                  )}
                </div>
                <button onClick={e => { e.stopPropagation(); cycleStatus(item.id); }} style={{
                  fontSize: '0.75rem', fontWeight: 400, padding: '2px 10px',
                  borderRadius: '20px', border: 'none', cursor: 'pointer',
                  backgroundColor: `var(--status-${item.status ?? 'pending'}-bg)`,
                  color: `var(--status-${item.status ?? 'pending'}-fg)`,
                }}>
                  {{ pending: 'Pendiente', inprogress: 'En progreso', done: 'Completado' }[item.status ?? 'pending']}
                </button>
              </div>
            )}

            {/* Free text */}
            {item.type === 'text' && (
              <div style={{
                border: selectedId === item.id ? '1px dashed var(--card-border)' : '1px dashed transparent',
                borderRadius: '8px', padding: '4px 8px',
              }}>
                {editingId === item.id ? (
                  <input
                    autoFocus value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={saveEdit}
                    style={{
                      border: 'none', background: 'transparent',
                      fontSize: '1rem', color: 'var(--card-title)', fontWeight: 300,
                      outline: 'none', fontFamily: 'inherit', width: '100%',
                    }}
                  />
                ) : (
                  <p onDoubleClick={e => startEdit(e, item)} style={{
                    fontSize: '1rem', color: 'var(--card-title)', fontWeight: 300, margin: 0,
                  }}>{item.content}</p>
                )}
                {selectedId === item.id && (
                  <button onClick={() => deleteItem(item.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '12px', color: 'var(--status-pending-fg)', padding: 0,
                  }}>✕</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}