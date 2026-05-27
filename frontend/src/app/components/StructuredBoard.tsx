import React, { useState } from 'react';

interface CanvasItem {
  id: string;
  type: 'note' | 'task' | 'text';
  x: number; y: number; width: number; height: number;
  content: string;
  status?: 'pendiente' | 'en_proceso' | 'finalizada';
  asignadoA?: string;
  color: string;
}

interface Reminder {
  _id: string;
  mensaje: string;
  fecha_hora: string;
  enviado: boolean;
  nota_id: string;
}

export interface StructuredBoardProps {
  items: CanvasItem[];
  reminders: Reminder[];
  puedeEditar: boolean;
  isDrawing: boolean;
  onUpdateItem: (id: string, changes: Partial<CanvasItem>) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<CanvasItem, 'id'>) => void;
}

const statusColors: Record<string, { bg: string; color: string }> = {
  pendiente:  { bg: '#FEF3C7', color: '#92400E' },
  en_proceso: { bg: '#EDE9FE', color: '#5B21B6' },
  finalizada: { bg: '#D1FAE5', color: '#065F46' },
};
const statusLabel: Record<string, string> = {
  pendiente: 'Pendiente', en_proceso: 'En proceso', finalizada: 'Finalizada',
};
const noteColors = ['#FFF8E7', '#F0EEFF', '#FFE8F0', '#E8F5FF', '#E8FFE8'];

// ── NoteCard ───────────────────────────────────────────
function NoteCard({ item, puedeEditar, onUpdate, onDelete }: {
  item: CanvasItem; puedeEditar: boolean;
  onUpdate: (c: Partial<CanvasItem>) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.content);
  return (
    <div style={{ backgroundColor: item.color || '#FFF8E7', borderRadius: '10px', padding: '10px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', position: 'relative', transition: 'box-shadow 0.15s' }}>
      {editing ? (
        <textarea autoFocus value={text} onChange={e => setText(e.target.value)}
          onBlur={() => { onUpdate({ content: text }); setEditing(false); }}
          style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '0.875rem', color: '#2F2840', fontFamily: 'inherit', resize: 'none', outline: 'none', minHeight: '56px', lineHeight: 1.5, boxSizing: 'border-box' }} />
      ) : (
        <p onDoubleClick={() => puedeEditar && setEditing(true)}
          style={{ margin: 0, fontSize: '0.875rem', color: '#2F2840', lineHeight: 1.5, whiteSpace: 'pre-wrap', cursor: puedeEditar ? 'text' : 'default', paddingRight: puedeEditar ? '16px' : 0 }}>
          {item.content}
        </p>
      )}
      {puedeEditar && (
        <button onClick={onDelete} style={{ position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#C04060', padding: '2px', opacity: 0.5 }}>✕</button>
      )}
    </div>
  );
}

// ── TaskCard ───────────────────────────────────────────
function TaskCard({ item, puedeEditar, onUpdate, onDelete }: {
  item: CanvasItem; puedeEditar: boolean;
  onUpdate: (c: Partial<CanvasItem>) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.content);
  const cycle: CanvasItem['status'][] = ['pendiente', 'en_proceso', 'finalizada'];

  const cycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = cycle.indexOf(item.status as CanvasItem['status']);
    onUpdate({ status: cycle[(idx + 1) % 3] });
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '0.5px solid #E4DCF4', borderRadius: '10px', padding: '10px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', position: 'relative' }}>
      {editing ? (
        <input autoFocus value={text} onChange={e => setText(e.target.value)}
          onBlur={() => { onUpdate({ content: text }); setEditing(false); }}
          onKeyDown={e => { if (e.key === 'Enter') { onUpdate({ content: text }); setEditing(false); } }}
          style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '0.875rem', color: '#2F2840', fontFamily: 'inherit', outline: 'none', paddingRight: '16px', boxSizing: 'border-box' }} />
      ) : (
        <p onDoubleClick={() => puedeEditar && setEditing(true)}
          style={{ margin: '0 0 6px', fontSize: '0.875rem', color: '#2F2840', fontWeight: 400, paddingRight: '18px', cursor: puedeEditar ? 'text' : 'default' }}>
          {item.content}
        </p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <button onClick={puedeEditar ? cycleStatus : undefined}
          style={{ fontSize: '0.7rem', fontWeight: 500, padding: '2px 8px', borderRadius: '20px', border: 'none', cursor: puedeEditar ? 'pointer' : 'default', backgroundColor: statusColors[item.status ?? 'pendiente']?.bg, color: statusColors[item.status ?? 'pendiente']?.color }}>
          {statusLabel[item.status ?? 'pendiente']}
        </button>
        {item.asignadoA && <span style={{ fontSize: '0.7rem', color: '#8070C8' }}>@{item.asignadoA}</span>}
      </div>
      {puedeEditar && (
        <button onClick={onDelete} style={{ position: 'absolute', top: '6px', right: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#C04060', padding: '2px', opacity: 0.5 }}>✕</button>
      )}
    </div>
  );
}

// ── TextCard ───────────────────────────────────────────
function TextCard({ item, puedeEditar, onUpdate, onDelete }: {
  item: CanvasItem; puedeEditar: boolean;
  onUpdate: (c: Partial<CanvasItem>) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.content);
  return (
    <div style={{ backgroundColor: 'transparent', border: '1px dashed #C8B8F0', borderRadius: '8px', padding: '8px 10px', position: 'relative' }}>
      {editing ? (
        <input autoFocus value={text} onChange={e => setText(e.target.value)}
          onBlur={() => { onUpdate({ content: text }); setEditing(false); }}
          style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '0.875rem', color: '#2F2840', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
      ) : (
        <p onDoubleClick={() => puedeEditar && setEditing(true)}
          style={{ margin: 0, fontSize: '0.875rem', color: '#4A4060', fontWeight: 300, cursor: puedeEditar ? 'text' : 'default', paddingRight: puedeEditar ? '16px' : 0 }}>
          {item.content}
        </p>
      )}
      {puedeEditar && (
        <button onClick={onDelete} style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#C04060', padding: '2px', opacity: 0.5 }}>✕</button>
      )}
    </div>
  );
}

// ── ReminderCard ───────────────────────────────────────
function ReminderCard({ reminder }: { reminder: Reminder }) {
  const fecha = new Date(reminder.fecha_hora);
  const ahora = new Date();
  const vencido = fecha < ahora && !reminder.enviado;
  const hoy = fecha.toDateString() === ahora.toDateString();
  return (
    <div style={{ backgroundColor: vencido ? '#FEE8EC' : hoy ? '#FFF8E7' : '#F6F4FB', border: `0.5px solid ${vencido ? '#F0B0B8' : hoy ? '#F0D890' : '#E4DCF4'}`, borderRadius: '10px', padding: '10px 12px' }}>
      <p style={{ margin: '0 0 4px', fontSize: '0.875rem', color: '#2F2840', fontWeight: 400 }}>
        {reminder.enviado ? '✅ ' : vencido ? '⚠️ ' : '🔔 '}{reminder.mensaje}
      </p>
      <p style={{ margin: 0, fontSize: '0.72rem', color: vencido ? '#C04060' : '#B0A0C0' }}>
        {fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · {fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
        {vencido && ' · Vencido'}{hoy && !vencido && ' · Hoy'}
      </p>
    </div>
  );
}

// ── KanbanColumn ───────────────────────────────────────
function KanbanColumn({ title, tasks, puedeEditar, onUpdate, onDelete, bg, border }: {
  title: string; tasks: CanvasItem[]; puedeEditar: boolean;
  onUpdate: (id: string, c: Partial<CanvasItem>) => void;
  onDelete: (id: string) => void;
  bg: string; border: string;
}) {
  return (
    <div style={{ flex: 1, minWidth: 0, backgroundColor: bg, border: `1.5px solid ${border}`, borderRadius: '12px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2F2840', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</span>
        <span style={{ fontSize: '0.7rem', color: '#B0A0C0', background: 'rgba(255,255,255,0.7)', padding: '1px 7px', borderRadius: '10px', fontWeight: 600 }}>{tasks.length}</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {tasks.length === 0 && (
          <p style={{ fontSize: '0.75rem', color: '#C0B0D0', fontStyle: 'italic', margin: '6px 0', textAlign: 'center' }}>Sin tareas</p>
        )}
        {tasks.map(item => (
          <TaskCard key={item.id} item={item} puedeEditar={puedeEditar}
            onUpdate={c => onUpdate(item.id, c)} onDelete={() => onDelete(item.id)} />
        ))}
      </div>
    </div>
  );
}

// ── StructuredBoard ────────────────────────────────────
export function StructuredBoard({ items, reminders, puedeEditar, isDrawing, onUpdateItem, onDeleteItem, onAddItem }: StructuredBoardProps) {
  const notas  = items.filter(i => i.type === 'note');
  const textos = items.filter(i => i.type === 'text');
  const allTareas = items.filter(i => i.type === 'task');
  const tareasPendiente  = allTareas.filter(i => !i.status || i.status === 'pendiente');
  const tareasEnProceso  = allTareas.filter(i => i.status === 'en_proceso');
  const tareasFinalizadas = allTareas.filter(i => i.status === 'finalizada');

  const [newTaskText, setNewTaskText] = useState('');

  const addNota = () => onAddItem({
    type: 'note', x: 0, y: 0, width: 200, height: 140,
    content: 'Nueva nota',
    color: noteColors[Math.floor(Math.random() * noteColors.length)],
  });

  const addTexto = () => onAddItem({
    type: 'text', x: 0, y: 0, width: 200, height: 50, content: 'Texto libre', color: 'transparent',
  });

  const addTask = () => {
    if (!newTaskText.trim()) return;
    onAddItem({ type: 'task', x: 0, y: 0, width: 240, height: 90, content: newTaskText.trim(), status: 'pendiente', color: '' });
    setNewTaskText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', height: '100%', boxSizing: 'border-box', overflowY: 'auto', position: 'relative' }}>

      {/* ── Drawing overlay ── */}
      {isDrawing && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(128,112,200,0.07)', backdropFilter: 'blur(1.5px)', borderRadius: '12px', pointerEvents: 'none' }}>
          <div style={{ backgroundColor: 'rgba(80,64,160,0.88)', color: '#fff', padding: '10px 22px', borderRadius: '20px', fontSize: '0.88rem', fontWeight: 500, boxShadow: '0 4px 16px rgba(80,64,160,0.25)' }}>
            ✏️ Modo dibujo activo — dibuja libremente en el tablero
          </div>
        </div>
      )}

      {/* ── Fila 1: Notas + Recordatorios ── */}
      <div style={{ display: 'flex', gap: '12px', minHeight: '180px' }}>

        {/* Notas */}
        <div style={{ flex: 1.2, backgroundColor: '#FDFAF3', border: '1.5px solid #E8D890', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2F2840', textTransform: 'uppercase', letterSpacing: '0.06em' }}>📄 Notas</span>
            {puedeEditar && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={addTexto} title="Texto libre" style={{ padding: '3px 8px', borderRadius: '8px', border: '1.5px solid #E8D890', background: 'transparent', color: '#8070C8', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>+ Texto</button>
                <button onClick={addNota} title="Nueva nota" style={{ padding: '3px 8px', borderRadius: '8px', border: '1.5px solid #E8D890', background: 'transparent', color: '#B09040', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600 }}>+ Nota</button>
              </div>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {notas.length === 0 && textos.length === 0 && (
              <p style={{ fontSize: '0.78rem', color: '#C8B870', fontStyle: 'italic', margin: '4px 0' }}>
                {puedeEditar ? 'Presiona + Nota para agregar' : 'Sin notas'}
              </p>
            )}
            {notas.map(item => (
              <NoteCard key={item.id} item={item} puedeEditar={puedeEditar}
                onUpdate={c => onUpdateItem(item.id, c)} onDelete={() => onDeleteItem(item.id)} />
            ))}
            {textos.length > 0 && notas.length > 0 && (
              <div style={{ borderTop: '1px dashed #D8C870', margin: '2px 0' }} />
            )}
            {textos.map(item => (
              <TextCard key={item.id} item={item} puedeEditar={puedeEditar}
                onUpdate={c => onUpdateItem(item.id, c)} onDelete={() => onDeleteItem(item.id)} />
            ))}
          </div>
        </div>

        {/* Recordatorios */}
        <div style={{ flex: 1, backgroundColor: '#FDFAF6', border: '1.5px solid #F0D890', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2F2840', textTransform: 'uppercase', letterSpacing: '0.06em' }}>🔔 Recordatorios</span>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {reminders.length === 0 && (
              <p style={{ fontSize: '0.78rem', color: '#C8B870', fontStyle: 'italic', margin: '4px 0' }}>
                Sin recordatorios · Usa el botón 🔔 de la barra para agregar
              </p>
            )}
            {reminders
              .slice()
              .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())
              .map(r => <ReminderCard key={r._id} reminder={r} />)}
          </div>
        </div>
      </div>

      {/* ── Fila 2: Kanban Tareas ── */}
      <div style={{ flex: 1, backgroundColor: '#F6F4FB', border: '1.5px solid #C8B8F0', borderRadius: '14px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '220px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2F2840', textTransform: 'uppercase', letterSpacing: '0.06em' }}>✅ Tareas</span>
          <span style={{ fontSize: '0.72rem', color: '#B0A0C0', marginLeft: '4px' }}>{allTareas.length} total</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', flex: 1, minHeight: 0 }}>
          <KanbanColumn title="Pendiente" tasks={tareasPendiente} puedeEditar={puedeEditar}
            onUpdate={onUpdateItem} onDelete={onDeleteItem}
            bg="#FEFDF6" border="#E8D060" />
          <KanbanColumn title="En proceso" tasks={tareasEnProceso} puedeEditar={puedeEditar}
            onUpdate={onUpdateItem} onDelete={onDeleteItem}
            bg="#F5F2FF" border="#A898D8" />
          <KanbanColumn title="Finalizada" tasks={tareasFinalizadas} puedeEditar={puedeEditar}
            onUpdate={onUpdateItem} onDelete={onDeleteItem}
            bg="#F0FDF8" border="#60C090" />
        </div>

        {puedeEditar && (
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <input
              value={newTaskText}
              onChange={e => setNewTaskText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              placeholder="Nueva tarea... (Enter para agregar)"
              style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #C8B8F0', backgroundColor: '#FFFFFF', fontSize: '0.875rem', color: '#2F2840', outline: 'none', fontFamily: 'inherit' }}
            />
            <button onClick={addTask} disabled={!newTaskText.trim()}
              style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', backgroundColor: newTaskText.trim() ? '#8070C8' : '#D8D0EC', color: '#fff', cursor: newTaskText.trim() ? 'pointer' : 'not-allowed', fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
              + Tarea
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
