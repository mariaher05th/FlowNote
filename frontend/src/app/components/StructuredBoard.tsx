import React, { useState } from 'react';

// ── Tipos (mismos que Whiteboard) ──────────────────────
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

interface StructuredBoardProps {
  items: CanvasItem[];
  reminders: Reminder[];
  puedeEditar: boolean;
  onUpdateItem: (id: string, changes: Partial<CanvasItem>) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: (item: Omit<CanvasItem, 'id'>) => void;
}

// ── Colores de estado ──────────────────────────────────
const statusColors: Record<string, { bg: string; color: string }> = {
  pendiente:  { bg: '#FEF3C7', color: '#92400E' },
  en_proceso: { bg: '#EDE9FE', color: '#5B21B6' },
  finalizada: { bg: '#D1FAE5', color: '#065F46' },
};
const statusLabel: Record<string, string> = {
  pendiente: 'Pendiente', en_proceso: 'En proceso', finalizada: 'Finalizada',
};
const noteColors = ['#FFF8E7', '#F0EEFF', '#FFE8F0', '#E8F5FF', '#E8FFE8'];

// ── Zona del tablero estructurado ──────────────────────
function Zone({
  title, icon, color, borderColor, children, onAdd, addLabel, canAdd,
}: {
  title: string;
  icon: string;
  color: string;
  borderColor: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  canAdd?: boolean;
}) {
  return (
    <div style={{
      backgroundColor: color,
      border: `1.5px solid ${borderColor}`,
      borderRadius: '16px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      minHeight: '200px',
      flex: 1,
    }}>
      {/* Header de zona */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1rem' }}>{icon}</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2F2840', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {title}
          </span>
        </div>
        {canAdd && onAdd && (
          <button
            onClick={onAdd}
            title={addLabel}
            style={{
              width: '26px', height: '26px', borderRadius: '50%',
              border: `1.5px solid ${borderColor}`,
              backgroundColor: 'transparent',
              color: borderColor, fontSize: '1.1rem',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >+</button>
        )}
      </div>

      {/* Contenido de la zona */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

// ── Tarjeta de nota ────────────────────────────────────
function NoteCard({ item, puedeEditar, onUpdate, onDelete }: {
  item: CanvasItem;
  puedeEditar: boolean;
  onUpdate: (changes: Partial<CanvasItem>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.content);

  return (
    <div style={{
      backgroundColor: item.color || '#FFF8E7',
      borderRadius: '10px',
      padding: '10px 12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      position: 'relative',
    }}>
      {editing ? (
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={() => { onUpdate({ content: text }); setEditing(false); }}
          style={{
            width: '100%', border: 'none', background: 'transparent',
            fontSize: '0.875rem', color: '#2F2840', fontFamily: 'inherit',
            resize: 'none', outline: 'none', minHeight: '60px', lineHeight: 1.5,
          }}
        />
      ) : (
        <p
          onDoubleClick={() => puedeEditar && setEditing(true)}
          style={{ margin: 0, fontSize: '0.875rem', color: '#2F2840', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}
        >{item.content}</p>
      )}
      {puedeEditar && (
        <button
          onClick={onDelete}
          style={{
            position: 'absolute', top: '6px', right: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '11px', color: '#C04060', padding: '2px',
            opacity: 0.6,
          }}
        >✕</button>
      )}
    </div>
  );
}

// ── Tarjeta de tarea ───────────────────────────────────
function TaskCard({ item, puedeEditar, onUpdate, onDelete }: {
  item: CanvasItem;
  puedeEditar: boolean;
  onUpdate: (changes: Partial<CanvasItem>) => void;
  onDelete: () => void;
}) {
  const cycle: CanvasItem['status'][] = ['pendiente', 'en_proceso', 'finalizada'];
  const cycleStatus = () => {
    const idx = cycle.indexOf(item.status as CanvasItem['status']);
    onUpdate({ status: cycle[(idx + 1) % 3] });
  };

  return (
    <div style={{
      backgroundColor: 'var(--card-bg, #FFFFFF)',
      border: '0.5px solid var(--card-border, #E4DCF4)',
      borderRadius: '10px',
      padding: '10px 12px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      position: 'relative',
    }}>
      <p style={{ margin: '0 0 6px', fontSize: '0.875rem', color: '#2F2840', fontWeight: 400, paddingRight: '18px' }}>
        {item.content}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <button
          onClick={puedeEditar ? cycleStatus : undefined}
          style={{
            fontSize: '0.72rem', fontWeight: 500, padding: '2px 8px',
            borderRadius: '20px', border: 'none',
            cursor: puedeEditar ? 'pointer' : 'default',
            backgroundColor: statusColors[item.status ?? 'pendiente']?.bg,
            color: statusColors[item.status ?? 'pendiente']?.color,
          }}
        >{statusLabel[item.status ?? 'pendiente']}</button>
        {item.asignadoA && (
          <span style={{ fontSize: '0.7rem', color: '#8070C8' }}>@{item.asignadoA}</span>
        )}
      </div>
      {puedeEditar && (
        <button
          onClick={onDelete}
          style={{
            position: 'absolute', top: '6px', right: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '11px', color: '#C04060', padding: '2px', opacity: 0.6,
          }}
        >✕</button>
      )}
    </div>
  );
}

// ── Tarjeta de recordatorio ────────────────────────────
function ReminderCard({ reminder }: { reminder: Reminder }) {
  const fecha = new Date(reminder.fecha_hora);
  const ahora = new Date();
  const vencido = fecha < ahora && !reminder.enviado;
  const hoy = fecha.toDateString() === ahora.toDateString();

  return (
    <div style={{
      backgroundColor: vencido ? '#FEE8EC' : hoy ? '#FFF8E7' : '#F6F4FB',
      border: `0.5px solid ${vencido ? '#F0B0B8' : hoy ? '#F0D890' : '#E4DCF4'}`,
      borderRadius: '10px',
      padding: '10px 12px',
    }}>
      <p style={{ margin: '0 0 4px', fontSize: '0.875rem', color: '#2F2840', fontWeight: 400 }}>
        {reminder.enviado ? '✅ ' : vencido ? '⚠️ ' : '🔔 '}{reminder.mensaje}
      </p>
      <p style={{ margin: 0, fontSize: '0.72rem', color: vencido ? '#C04060' : '#B0A0C0' }}>
        {fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })} · {fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
        {vencido && ' · Vencido'}
        {hoy && !vencido && ' · Hoy'}
      </p>
    </div>
  );
}

// ── Tarjeta de texto libre ─────────────────────────────
function TextCard({ item, puedeEditar, onUpdate, onDelete }: {
  item: CanvasItem;
  puedeEditar: boolean;
  onUpdate: (changes: Partial<CanvasItem>) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.content);

  return (
    <div style={{
      backgroundColor: 'var(--card-bg, #FFFFFF)',
      border: '0.5px dashed var(--card-border, #E4DCF4)',
      borderRadius: '10px',
      padding: '10px 12px',
      position: 'relative',
    }}>
      {editing ? (
        <input
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={() => { onUpdate({ content: text }); setEditing(false); }}
          style={{
            width: '100%', border: 'none', background: 'transparent',
            fontSize: '0.95rem', color: '#2F2840', fontFamily: 'inherit', outline: 'none',
          }}
        />
      ) : (
        <p
          onDoubleClick={() => puedeEditar && setEditing(true)}
          style={{ margin: 0, fontSize: '0.95rem', color: '#2F2840', fontWeight: 300 }}
        >{item.content}</p>
      )}
      {puedeEditar && (
        <button
          onClick={onDelete}
          style={{
            position: 'absolute', top: '6px', right: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '11px', color: '#C04060', padding: '2px', opacity: 0.6,
          }}
        >✕</button>
      )}
    </div>
  );
}

// ── Componente principal ───────────────────────────────
export function StructuredBoard({
  items, reminders, puedeEditar, onUpdateItem, onDeleteItem, onAddItem,
}: StructuredBoardProps) {
  const notas  = items.filter(i => i.type === 'note');
  const tareas = items.filter(i => i.type === 'task');
  const textos = items.filter(i => i.type === 'text');

  const addNota = () => onAddItem({
    type: 'note', x: 0, y: 0, width: 200, height: 140,
    content: 'Nueva nota',
    color: noteColors[Math.floor(Math.random() * noteColors.length)],
  });

  const addTexto = () => onAddItem({
    type: 'text', x: 0, y: 0, width: 200, height: 50,
    content: 'Texto libre', color: 'transparent',
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '20px',
      height: '100%',
      boxSizing: 'border-box',
      overflowY: 'auto',
    }}>
      {/* Fila superior: Notas + Recordatorios */}
      <div style={{ display: 'flex', gap: '12px', flex: '1 1 50%' }}>

        {/* Zona Notas */}
        <Zone
          title="Notas"
          icon="📄"
          color="#FDFAF3"
          borderColor="#E8D890"
          onAdd={puedeEditar ? addNota : undefined}
          addLabel="Nueva nota"
          canAdd={puedeEditar}
        >
          {notas.length === 0 && (
            <p style={{ fontSize: '0.78rem', color: '#C8B870', fontStyle: 'italic', margin: 0 }}>
              Sin notas · {puedeEditar ? 'Presiona + para agregar' : ''}
            </p>
          )}
          {notas.map(item => (
            <NoteCard
              key={item.id}
              item={item}
              puedeEditar={puedeEditar}
              onUpdate={changes => onUpdateItem(item.id, changes)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}
        </Zone>

        {/* Zona Recordatorios */}
        <Zone
          title="Recordatorios"
          icon="🔔"
          color="#FDFAF6"
          borderColor="#F0D890"
          canAdd={false}
        >
          {reminders.length === 0 && (
            <p style={{ fontSize: '0.78rem', color: '#C8B870', fontStyle: 'italic', margin: 0 }}>
              Sin recordatorios · Usa el botón 🔔 de la toolbar para agregar
            </p>
          )}
          {reminders
            .slice()
            .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime())
            .map(r => (
              <ReminderCard key={r._id} reminder={r} />
            ))
          }
        </Zone>
      </div>

      {/* Fila inferior: Tareas + Textos y dibujos libres */}
      <div style={{ display: 'flex', gap: '12px', flex: '1 1 50%' }}>

        {/* Zona Tareas */}
        <Zone
          title="Tareas"
          icon="✅"
          color="#F6F4FB"
          borderColor="#C8B8F0"
          canAdd={false}
        >
          {tareas.length === 0 && (
            <p style={{ fontSize: '0.78rem', color: '#B0A0C0', fontStyle: 'italic', margin: 0 }}>
              Sin tareas · Usa el botón ✅ de la toolbar para agregar
            </p>
          )}
          {tareas.map(item => (
            <TaskCard
              key={item.id}
              item={item}
              puedeEditar={puedeEditar}
              onUpdate={changes => onUpdateItem(item.id, changes)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}
        </Zone>

        {/* Zona Textos libres */}
        <Zone
          title="Textos y dibujos libres"
          icon="✏️"
          color="#F4F8FC"
          borderColor="#B8D0E8"
          onAdd={puedeEditar ? addTexto : undefined}
          addLabel="Nuevo texto"
          canAdd={puedeEditar}
        >
          {textos.length === 0 && (
            <p style={{ fontSize: '0.78rem', color: '#90A8C0', fontStyle: 'italic', margin: 0 }}>
              Sin textos · {puedeEditar ? 'Presiona + para agregar' : ''}
            </p>
          )}
          {textos.map(item => (
            <TextCard
              key={item.id}
              item={item}
              puedeEditar={puedeEditar}
              onUpdate={changes => onUpdateItem(item.id, changes)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}
          <p style={{ fontSize: '0.72rem', color: '#B0C0D0', margin: 0, marginTop: 'auto', paddingTop: '8px' }}>
            Los dibujos solo están disponibles en el tablero libre
          </p>
        </Zone>
      </div>
    </div>
  );
}