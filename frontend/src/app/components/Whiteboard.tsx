import React, { useState, useRef, useEffect, useCallback } from 'react';
import { isAxiosError } from 'axios';
import api from '../../services/api';
import { speechService, esArchivoAudioValido } from '../../services/speech.service';
import { useCollaboration } from '../../hooks/useCollaboration';
import { CollaborationBar } from './CollaborationBar';

// ── Tipos ──────────────────────────────────────────────
type Tool = 'select' | 'pen' | 'eraser' | 'note' | 'task' | 'text';

interface CanvasItem {
  id: string;
  type: 'note' | 'task' | 'text';
  x: number; y: number; width: number; height: number;
  content: string;
  status?: 'pendiente' | 'en_proceso' | 'finalizada';
  asignadoA?: string;
  color: string;
}

interface Stroke {
  color: string; size: number; eraser: boolean;
  points: { x: number; y: number }[];
}

interface Colaborador { usuario_id: string; username: string; nombre: string; rol: string; }

const noteColors = ['#FFF8E7', '#F0EEFF', '#FFE8F0', '#E8F5FF', '#E8FFE8'];
const penColors  = ['#8070C8', '#C070A0', '#7090B8', '#508070', '#C07840', '#2F2840'];
/** Espacio lógico del tablero (coordenadas normalizadas para colaboración) */
const BOARD_W = 2000;
const BOARD_H = 2000;

// ── Separador de toolbar ────────────────────────────────
const Sep = () => (
  <div style={{ width: '1px', height: '22px', backgroundColor: 'var(--whiteboard-toolbar-border)', margin: '0 8px', opacity: 0.5 }} />
);

// ── Label de sección ────────────────────────────────────
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <span style={{ fontSize: '0.6rem', color: 'var(--muted-fg)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: '2px', userSelect: 'none' }}>
    {children}
  </span>
);

// ── Botón de toolbar ────────────────────────────────────
function ToolBtn({ active, onClick, title, children, wide }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <button onClick={onClick} title={title} style={{
      minWidth: wide ? 'auto' : '32px', height: '32px', padding: wide ? '0 10px' : '0',
      borderRadius: '8px', border: 'none',
      backgroundColor: active ? '#8070C8' : 'transparent',
      color: active ? '#FFFFFF' : 'var(--whiteboard-tool-fg)',
      cursor: 'pointer', fontSize: '15px', transition: 'all 0.15s',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
      boxShadow: active ? '0 2px 8px rgba(128,112,200,0.35)' : 'none',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = 'var(--highlight-bg)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
    >{children}</button>
  );
}

// ── Modal genérico ──────────────────────────────────────
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 3000, backgroundColor: 'rgba(47,40,64,0.35)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 24px 64px rgba(47,40,64,0.18)' }}>
        {children}
      </div>
    </div>
  );
}

// ── Componente principal ────────────────────────────────
export function Whiteboard({ noteId, onBack }: { noteId: string | null; onBack?: () => void }) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const saveTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collabTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoaded      = useRef(false);
  const remoteApplying = useRef(false);
  const itemsRef      = useRef<CanvasItem[]>([]);
  const strokesRef    = useRef<Stroke[]>([]);
  const currentStroke = useRef<Stroke | null>(null);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const lastInsertPositionRef = useRef<{ x: number; y: number }>({ x: 120, y: 120 });

  // Estado de la nota
  const [noteTitle,      setNoteTitle]      = useState('');
  const [esColaborativa, setEsColaborativa] = useState(false);
  const [colaboradores,  setColaboradores]  = useState<Colaborador[]>([]);
  const [miRol,          setMiRol]          = useState<string>('admin');
  const [esInvitado,     setEsInvitado]     = useState(false);

  // Estado del tablero
  const [tool,       setTool]       = useState<Tool>('select');
  const [items,      setItems]      = useState<CanvasItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging,   setDragging]   = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [resizing,   setResizing]   = useState<{ id: string; handle: string; startX: number; startY: number; startItem: CanvasItem } | null>(null);
  const [drawing,    setDrawing]    = useState(false);
  const [canvasVer,  setCanvasVer]  = useState(0);
  const [penColor,   setPenColor]   = useState('#8070C8');
  const [penSize,    setPenSize]    = useState(3);
  const [eraserSize, setEraserSize] = useState(24);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [editText,   setEditText]   = useState('');
  const [guardando,  setGuardando]  = useState(false);
  const [guardado,   setGuardado]   = useState(false);

  const [speechOpen, setSpeechOpen] = useState(false);
  const [speechListening, setSpeechListening] = useState(false);
  const [speechLoading, setSpeechLoading] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [speechError, setSpeechError] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechAudioName, setSpeechAudioName] = useState('');
  const [comandoFeedback, setComandoFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [lockMsg,    setLockMsg]    = useState<string | null>(null);
  const lockRenewRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const draggingItemId = useRef<string | null>(null);

  // Modales
  const [taskModal,     setTaskModal]     = useState(false);
  const [taskTitulo,    setTaskTitulo]    = useState('');
  const [taskEstado,    setTaskEstado]    = useState<'pendiente' | 'en_proceso' | 'finalizada'>('pendiente');
  const [taskAsignado,  setTaskAsignado]  = useState('');
  const [reminderModal, setReminderModal]   = useState(false);
  const [remTitulo,     setRemTitulo]       = useState('');
  const [remDesc,       setRemDesc]         = useState('');
  const [remFecha,      setRemFecha]        = useState('');
  const [remHora,       setRemHora]         = useState('09:00');
  const [remCreando,    setRemCreando]      = useState(false);
  const [remExito,      setRemExito]        = useState(false);
  const [addCollabModal, setAddCollabModal] = useState(false);
  const [collabBusqueda, setCollabBusqueda] = useState('');
  const [collabResultados, setCollabResultados] = useState<any[]>([]);
  const [collabBuscando, setCollabBuscando] = useState(false);
  const collabDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [completarConfirm, setCompletarConfirm] = useState(false);
  const [noteEstado,    setNoteEstado]      = useState('pendiente');
  const [tooltip,       setTooltip]         = useState<{ text: string; x: number; y: number } | null>(null);
  const [exportMenu,    setExportMenu]      = useState(false);
  const exportBtnRef = useRef<HTMLDivElement>(null);
  const [exportPos,   setExportPos]     = useState({ top: 0, left: 0 });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const miUserId = String(user.id || user._id || '');
  const puedeEditar = ['admin', 'editor'].includes(miRol);
  const rolLabel: Record<string, string> = {
    admin: 'Administrador', editor: 'Editor', revisor: 'Revisor',
  };

  const replayStrokes = (strokes: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    strokes.forEach(s => {
      if (s.points.length < 2) return;
      ctx.beginPath();
      ctx.globalCompositeOperation = s.eraser ? 'destination-out' : 'source-over';
      ctx.strokeStyle = s.eraser ? 'rgba(0,0,0,1)' : s.color;
      ctx.lineWidth = s.size;
      ctx.moveTo(s.points[0].x, s.points[0].y);
      s.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
    ctx.globalCompositeOperation = 'source-over';
  };

  const applyRemoteBoard = useCallback((value: unknown) => {
    const data = value as { items?: CanvasItem[]; strokes?: Stroke[] };
    remoteApplying.current = true;
    if (Array.isArray(data?.items)) {
      itemsRef.current = data.items;
      setItems(data.items);
    }
    if (Array.isArray(data?.strokes)) {
      strokesRef.current = data.strokes;
      replayStrokes(data.strokes);
      setCanvasVer(v => v + 1);
    }
    setTimeout(() => { remoteApplying.current = false; }, 120);
  }, []);

  const handleRemoteDrawing = useCallback((mode: string, payload: Record<string, unknown>) => {
    remoteApplying.current = true;
    if (mode === 'clear') {
      strokesRef.current = [];
      const canvas = canvasRef.current;
      canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    } else if (mode === 'stroke') {
      const raw = (payload.trazo ?? payload) as {
        puntos?: { x: number; y: number }[];
        points?: { x: number; y: number }[];
        color?: string;
        grosor?: number;
        size?: number;
        eraser?: boolean;
      };
      const trazo: Stroke = {
        color: raw.color ?? '#8070C8',
        size: raw.grosor ?? raw.size ?? 3,
        eraser: raw.eraser ?? false,
        points: raw.points ?? raw.puntos?.map(p => ({ x: p.x, y: p.y })) ?? [],
      };
      if (trazo.points.length > 1) {
        strokesRef.current = [...strokesRef.current, trazo];
        replayStrokes(strokesRef.current);
        setCanvasVer(v => v + 1);
      }
    } else if (mode === 'full' && Array.isArray(payload.trazos)) {
      strokesRef.current = payload.trazos as Stroke[];
      replayStrokes(strokesRef.current);
      setCanvasVer(v => v + 1);
    }
    setTimeout(() => { remoteApplying.current = false; }, 120);
  }, []);

  const {
    connected: collabConnected,
    roomReady: collabRoomReady,
    joinError: collabJoinError,
    presencia: collabPresencia,
    locks: collabLocks,
    getLock,
    iHaveLock,
    isLockedByOther,
    broadcastBoard,
    broadcastStroke,
    acquireResourceLock,
    releaseResourceLock,
  } = useCollaboration({
    roomType: 'nota',
    roomId: noteId,
    enabled: !!noteId,
    onRemoteNoteUpdate: (field, value) => {
      if (field === 'contenido') applyRemoteBoard(value);
    },
    onRemoteDrawing: (mode, payload) => handleRemoteDrawing(mode, payload),
  });

  const buildContenido = (currentItems: CanvasItem[]) =>
    JSON.stringify({ items: currentItems, strokes: strokesRef.current });

  const calcularEstadoNota = (currentItems: CanvasItem[]): 'pendiente' | 'en_progreso' | 'completado' => {
    const tareas = currentItems.filter(i => i.type === 'task');

    if (tareas.length === 0) {
      return 'pendiente';
    }

    const todasFinalizadas = tareas.every(t => t.status === 'finalizada');

    if (todasFinalizadas) {
      return 'completado';
    }

    const algunaEnProcesoOFinalizada = tareas.some(
      t => t.status === 'en_proceso' || t.status === 'finalizada'
    );

    if (algunaEnProcesoOFinalizada) {
      return 'en_progreso';
    }

    return 'pendiente';
  };

  // ── Cargar nota ──
  useEffect(() => {
    isLoaded.current = false;
    strokesRef.current = [];
    setItems([]); setNoteTitle('');
    setEsColaborativa(false); setColaboradores([]); setMiRol('admin'); setEsInvitado(false);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    if (!noteId) return;
    api.get(`/notes/${noteId}`).then(res => {
      const note = res.data;
      setNoteTitle(note.titulo || '');
      setNoteEstado(note.estado || 'pendiente');
      setEsColaborativa(!!note.es_colaborativa);
      const cols: Colaborador[] = note.colaboradores || [];
      setColaboradores(cols);
      const autorId = String(note.autor_id || '');
      const esAutor = autorId === miUserId;
      const yo = cols.find(
        (c: Colaborador) => String(c.usuario_id) === miUserId || c.username === user.username,
      );
      setMiRol(yo?.rol ?? (esAutor ? 'admin' : 'revisor'));
      setEsInvitado(!esAutor && !!yo);
      try {
        const data = JSON.parse(note.contenido || '{}');
        setItems(Array.isArray(data?.items) ? data.items : []);
        if (Array.isArray(data?.strokes) && data.strokes.length > 0) {
          strokesRef.current = data.strokes;
          replayStrokes(data.strokes);
        }
      } catch { setItems([]); }
      isLoaded.current = true;
    }).catch(() => { setItems([]); isLoaded.current = true; });
  }, [noteId]);

  useEffect(() => { itemsRef.current = items; }, [items]);

  useEffect(() => {
    if (!noteId || !isLoaded.current || remoteApplying.current || !puedeEditar) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const nuevoEstado = calcularEstadoNota(itemsRef.current);
      api.put(`/notes/${noteId}`, {
        contenido: buildContenido(itemsRef.current),
        estado: nuevoEstado,
      });
      setNoteEstado(nuevoEstado);
    }, 500);
      
    if (!collabRoomReady) return;    
    if (collabTimer.current) clearTimeout(collabTimer.current);
    collabTimer.current = setTimeout(() => {
      broadcastBoard(itemsRef.current, strokesRef.current);
    }, 150);
  }, [items, noteId, broadcastBoard, puedeEditar, collabRoomReady]);

  useEffect(() => {
    if (!noteId || !isLoaded.current || remoteApplying.current || !puedeEditar || !collabRoomReady) return;
    if (collabTimer.current) clearTimeout(collabTimer.current);
    collabTimer.current = setTimeout(() => {
      broadcastBoard(itemsRef.current, strokesRef.current);
    }, 200);
  }, [canvasVer, noteId, broadcastBoard, puedeEditar, collabRoomReady]);

  useEffect(() => {
    return () => {
      if (noteId && isLoaded.current) {
        if (saveTimer.current) clearTimeout(saveTimer.current);

        const nuevoEstado = calcularEstadoNota(itemsRef.current);

        api.put(`/notes/${noteId}`, {
          contenido: buildContenido(itemsRef.current),
          estado: nuevoEstado,
        });
      }
    };
  }, [noteId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
  }, []);

  // ── Guardar ──
  const guardarAhora = async () => {
    if (!noteId || !puedeEditar) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setGuardando(true);
    try {
      const nuevoEstado = calcularEstadoNota(items);
      await api.put(`/notes/${noteId}`, {
        contenido: buildContenido(items),
        estado: nuevoEstado,  });
      setNoteEstado(nuevoEstado);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    } finally { setGuardando(false); }
  };

  const canvasLockId = noteId ?? 'canvas';
  const drawingLock = noteId ? getLock('drawing_canvas', canvasLockId) : undefined;
  // Solo bloquear si hay OTROS usuarios activos en el tablero ahora mismo
  const otrosActivos = collabPresencia.filter(p => String(p.userId ?? '') !== miUserId).length > 0;
  const drawingBlocked = noteId && otrosActivos
    ? isLockedByOther('drawing_canvas', canvasLockId)
    : false;

  const clearLockRenew = () => {
    if (lockRenewRef.current) {
      clearInterval(lockRenewRef.current);
      lockRenewRef.current = null;
    }
  };

  const startLockRenew = (resourceType: 'drawing_canvas' | 'board', resourceId: string) => {
    clearLockRenew();
    lockRenewRef.current = setInterval(() => {
      if (noteId && iHaveLock(resourceType, resourceId)) {
        acquireResourceLock(resourceType, resourceId).catch(() => {});
      }
    }, 12_000);
  };

  useEffect(() => () => {
    clearLockRenew();
    if (draggingItemId.current && noteId) {
      releaseResourceLock('board', draggingItemId.current);
    }
    if (noteId) {
      releaseResourceLock('drawing_canvas', canvasLockId);
    }
  }, [noteId, releaseResourceLock, canvasLockId]);

  // ── Dibujo ──
  const getCanvasPos = (e: React.MouseEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return { x: 0, y: 0 };
    return {
      x: ((e.clientX - rect.left) / rect.width) * BOARD_W,
      y: ((e.clientY - rect.top) / rect.height) * BOARD_H,
    };
  };

  const startDraw = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!puedeEditar) return;
    if (tool !== 'pen' && tool !== 'eraser') return;
    setLockMsg(null);

    // Solo aplicar sistema de locks si hay otros usuarios activos ahora mismo
    if (noteId && collabRoomReady && otrosActivos) {
      if (drawingBlocked) {
        setLockMsg(`${drawingLock?.holderNombre ?? 'Otro usuario'} está dibujando`);
        return;
      }
      const res = await acquireResourceLock('drawing_canvas', canvasLockId);
      if (!res.ok) {
        if (res.reason === 'denied') {
          setLockMsg(`${res.holderName ?? 'Otro usuario'} está dibujando`);
          return;
        }
        // Error técnico — se deja dibujar de todas formas
        setLockMsg('Modo offline');
      }
      startLockRenew('drawing_canvas', canvasLockId);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasPos(e, canvas);
    const isEraser = tool === 'eraser';
    currentStroke.current = { color: penColor, size: isEraser ? eraserSize : penSize, eraser: isEraser, points: [{ x, y }] };
    ctx.beginPath(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = isEraser ? 'rgba(0,0,0,1)' : penColor;
    ctx.lineWidth = isEraser ? eraserSize : penSize;
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !currentStroke.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasPos(e, canvas);
    currentStroke.current.points.push({ x, y });
    ctx.lineTo(x, y); ctx.stroke();
  };

  const stopDraw = () => {
    if (drawing && currentStroke.current && currentStroke.current.points.length > 1) {
      const finished = currentStroke.current;
      strokesRef.current = [...strokesRef.current, finished];
      currentStroke.current = null;
      setCanvasVer(v => v + 1);
      if (noteId && collabRoomReady && !remoteApplying.current) {
        broadcastStroke({
          points: finished.points,
          color: finished.color,
          size: finished.size,
          eraser: finished.eraser,
        });
      }
    }
    if (noteId && collabRoomReady) {
      releaseResourceLock('drawing_canvas', canvasLockId);
      clearLockRenew();
    }
    setDrawing(false);
  };

  // ── Items ──
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!puedeEditar) return;
    if (tool === 'pen' || tool === 'eraser') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    lastInsertPositionRef.current = { x, y };
    if (tool === 'note') {
      setItems(prev => [...prev, { id: Date.now().toString(), type: 'note', x, y, width: 200, height: 140, content: 'Nueva nota', color: noteColors[Math.floor(Math.random() * noteColors.length)] }]);
      setTool('select');
    }
    if (tool === 'text') {
      setItems(prev => [...prev, { id: Date.now().toString(), type: 'text', x, y, width: 200, height: 50, content: 'Texto', color: 'transparent' }]);
      setTool('select');
    }
  };

  const startDrag = (e: React.MouseEvent, id: string) => {
    if (!puedeEditar || tool !== 'select') return;
    e.stopPropagation();
    setLockMsg(null);

    // Bloqueo síncrono: si otro usuario ya tiene el lock, rechazar antes de iniciar
    if (noteId && collabRoomReady && isLockedByOther('board', id)) {
      const lock = getLock('board', id);
      setLockMsg(`${lock?.holderNombre ?? 'Otro usuario'} está editando este elemento`);
      return;
    }

    const item = items.find(i => i.id === id);
    if (!item || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Iniciar drag INMEDIATAMENTE sin esperar red
    setDragging({ id, offsetX: e.clientX - rect.left - item.x, offsetY: e.clientY - rect.top - item.y });
    setSelectedId(id);

    // Adquirir lock en segundo plano (no bloquea el drag)
    if (noteId && collabRoomReady) {
      draggingItemId.current = id;
      acquireResourceLock('board', id).then(res => {
        if (res.ok) {
          startLockRenew('board', id);
        } else if (res.reason === 'denied') {
          setLockMsg(`${res.holderName ?? 'Otro usuario'} está editando este elemento`);
        }
      }).catch(() => {});
    }
  };

  const startResizeHandle = (e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation(); e.preventDefault();
    const item = items.find(i => i.id === id);
    if (!item) return;
    setResizing({ id, handle, startX: e.clientX, startY: e.clientY, startItem: { ...item } });
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (resizing) {
      const dx = e.clientX - resizing.startX; const dy = e.clientY - resizing.startY;
      const { startItem: si, handle } = resizing; const MIN = 60;
      setItems(prev => prev.map(i => {
        if (i.id !== resizing.id) return i;
        let { x, y, width, height } = si;
        if (handle.includes('e')) width  = Math.max(MIN, si.width  + dx);
        if (handle.includes('s')) height = Math.max(MIN, si.height + dy);
        if (handle.includes('w')) { width  = Math.max(MIN, si.width  - dx); x = si.x + si.width  - width; }
        if (handle.includes('n')) { height = Math.max(MIN, si.height - dy); y = si.y + si.height - height; }
        return { ...i, x, y, width, height };
      }));
      return;
    }
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setItems(prev => prev.map(i => i.id === dragging.id ? { ...i, x: e.clientX - rect.left - dragging.offsetX, y: e.clientY - rect.top - dragging.offsetY } : i));
  };

  const stopDrag = () => {
    if (draggingItemId.current && noteId && collabRoomReady) {
      releaseResourceLock('board', draggingItemId.current);
      draggingItemId.current = null;
      clearLockRenew();
    }
    setDragging(null);
    setResizing(null);
  };
  const deleteItem = (id: string) => { setItems(prev => prev.filter(i => i.id !== id)); setSelectedId(null); };

  const cycleStatus = (id: string) => {
    const cycle: CanvasItem['status'][] = ['pendiente', 'en_proceso', 'finalizada'];
    setItems(prev => prev.map(i => {
      if (i.id !== id || i.type !== 'task') return i;
      const idx = cycle.indexOf(i.status as CanvasItem['status']);
      return { ...i, status: cycle[(idx + 1) % 3] };
    }));
  };

  const startEdit = (e: React.MouseEvent, item: CanvasItem) => {
    e.stopPropagation();
    if (tool !== 'select') return;
    setEditingId(item.id); setEditText(item.content);
  };

  const saveEdit = () => {
    setItems(prev => prev.map(i => i.id === editingId ? { ...i, content: editText } : i));
    setEditingId(null);
  };

  // ── Crear tarea ──
  const crearTarea = () => {
    if (!taskTitulo.trim()) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const x = rect ? rect.width / 2 - 120 : 100;
    const y = rect ? rect.height / 2 - 50 : 100;
    const newTask: CanvasItem = {
      id: Date.now().toString(),
      type: 'task', x, y,
      width: 240,
      height: 90,
      content: taskTitulo.trim(),
      status: taskEstado,
      asignadoA: esColaborativa ? (taskAsignado || user.username) : undefined,
      color: '',
    };
    setItems(prev => [...prev, newTask]);

    setTaskModal(false);
    setTaskTitulo('');
    setTaskEstado('pendiente');
    setTaskAsignado('');
  };

  // ── Crear recordatorio ──
  const crearRecordatorio = async () => {
    if (!remTitulo.trim() || !remFecha) return;
    setRemCreando(true);
    try {
      const fecha_hora = new Date(`${remFecha}T${remHora}:00`).toISOString();
      await api.post('/reminders', { nota_id: noteId || '', mensaje: remTitulo.trim(), fecha_hora });
      setReminderModal(false); setRemTitulo(''); setRemDesc(''); setRemFecha(''); setRemHora('09:00');
      setRemExito(true);
      setTimeout(() => setRemExito(false), 3000);
    } finally { setRemCreando(false); }
  };

  // ── Búsqueda de colaboradores ──
  const buscarColaboradores = (q: string) => {
    setCollabBusqueda(q);
    if (collabDebounce.current) clearTimeout(collabDebounce.current);
    if (q.length < 2) { setCollabResultados([]); return; }
    setCollabBuscando(true);
    collabDebounce.current = setTimeout(async () => {
      try {
        const res = await api.get(`/auth/buscar?q=${encodeURIComponent(q)}`);
        const yaEsta = new Set(colaboradores.map(c => c.username));
        setCollabResultados(res.data.filter((u: any) => !yaEsta.has(u.username)));
      } catch { setCollabResultados([]); }
      finally { setCollabBuscando(false); }
    }, 350);
  };

  const agregarColaborador = async (u: any, rol: string) => {
    if (!noteId) return;
    try {
      await api.post(`/notes/${noteId}/colaboradores`, {
        usuario_id: String(u._id), username: u.username,
        nombre: `${u.nombre} ${u.apellido || ''}`.trim(), rol,
      });
      setColaboradores(prev => [...prev, { usuario_id: String(u._id), username: u.username, nombre: `${u.nombre} ${u.apellido || ''}`.trim(), rol }]);
      setCollabResultados([]); setCollabBusqueda('');
    } catch {}
  };

  const completarNota = async () => {
    if (!noteId) return;
    try {
      await api.put(`/notes/${noteId}`, { estado: noteEstado === 'completado' ? 'pendiente' : 'completado' });
      setNoteEstado(prev => prev === 'completado' ? 'pendiente' : 'completado');
      setCompletarConfirm(false);
    } catch {}
  };

  // Colores de rol
  const rolColors: Record<string, string> = {
    admin: '#8070C8', editor: '#C070A0', revisor: '#7090B8',
  };

  // ── COMANDOS DE VOZ ──────────────────────────────────

  const parsearDia = (dia: string): string => {
    const hoy = new Date();
    const mapa: Record<string, number> = {
      hoy: 0, manana: 1, mañana: 1,
      lunes: 1, martes: 2, miercoles: 3, miércoles: 3,
      jueves: 4, viernes: 5, sabado: 6, sábado: 6, domingo: 0,
    };
    const key = dia.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const offset = mapa[key];
    if (offset === undefined) return hoy.toISOString().slice(0, 10);
    const fecha = new Date(hoy);
    if (offset === 0 && key !== 'hoy') {
      const diff = (7 - hoy.getDay()) % 7 || 7;
      fecha.setDate(hoy.getDate() + diff);
    } else if (key !== 'hoy') {
      const diaTarget = offset;
      const diffDias = (diaTarget - hoy.getDay() + 7) % 7 || 7;
      fecha.setDate(hoy.getDate() + diffDias);
    }
    return fecha.toISOString().slice(0, 10);
  };

  const parsearHora = (hora: string): string => {
    const m = hora.match(/(\d{1,2})(?::(\d{2}))?(?:\s*(am?|pm?))?/i);
    if (!m) return '09:00';
    let h = parseInt(m[1]);
    const min = m[2] || '00';
    const ap = (m[3] || '').toLowerCase();
    if ((ap === 'pm' || ap === 'p') && h < 12) h += 12;
    if ((ap === 'am' || ap === 'a') && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${min}`;
  };

  // Normaliza texto para comparar sin tildes ni mayúsculas
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

  // Posición central del canvas para nuevos items
  const centroCanvas = (w = 220, h = 100) => {
    const r = containerRef.current?.getBoundingClientRect();
    return { x: r ? r.width / 2 - w / 2 : 150, y: r ? r.height / 2 - h / 2 : 150 };
  };

  // Busca el colaborador que más se acerca al texto hablado (username o nombre)
  // Si no hay coincidencia o no es nota colaborativa → se lo asigna al usuario actual
  const resolverAsignado = (hablado: string): { username: string; nombre: string } => {
    const s      = norm(hablado);
    const sJunto = s.replace(/\s+/g, ''); // "Mari 05 th" → "mari05th"
    const candidatos = esColaborativa ? colaboradores.filter(
      (c: any) => !c.invitacion || c.invitacion === 'aceptada',
    ) : [];

    // Cuántos caracteres tienen en común (orden no importa)
    const similitud = (a: string, b: string) => {
      if (!a || !b) return 0;
      const set = new Set(b.split(''));
      return a.split('').filter(ch => set.has(ch)).length / Math.max(a.length, b.length);
    };

    // Prueba exacta / prefijo / nombre
    let c = candidatos.find(x => norm(x.username) === s || norm(x.username) === sJunto);
    if (!c) c = candidatos.find(x => norm(x.username).startsWith(sJunto) || sJunto.startsWith(norm(x.username)));
    if (!c) c = candidatos.find(x => norm(x.nombre.split(' ')[0]) === s);
    if (!c) c = candidatos.find(x => norm(x.nombre).includes(s));

    // Fuzzy: mayor similitud entre username (sin espacios) y lo hablado (sin espacios)
    if (!c && candidatos.length > 0) {
      const ranked = candidatos
        .map(x => ({ x, score: Math.max(similitud(norm(x.username), sJunto), similitud(norm(x.nombre), s)) }))
        .sort((a, b) => b.score - a.score);
      if (ranked[0].score >= 0.5) c = ranked[0].x;
    }

    if (c) return { username: c.username, nombre: c.nombre };
    return { username: user.username, nombre: user.nombre || user.username };
  };

  const ejecutarComandoVoz = async (texto: string): Promise<boolean> => {
    const t = norm(texto);

    // Quita el prefijo de activación y devuelve el resto del texto
    const tras = (patron: RegExp): string =>
      t.replace(patron, '').trim();

    // ── 📝 NOTA RÁPIDA ──────────────────────────────────
    // "crea una nota rapida", "anota que...", "nota rapida de...", etc.
    if (/\b(nota\s+rapida|anota(?:r)?|crea(?:r)?\s+(?:una?\s+)?nota|agrega(?:r)?\s+(?:una?\s+)?nota|escribe?\s+(?:una?\s+)?nota)\b/.test(t)) {
      const contenido = tras(/.*?\b(?:nota\s+rapida\s*(?:de\s+|sobre\s+|con\s+)?|anota(?:r)?\s*(?:que\s+)?|crea(?:r)?\s+(?:una?\s+)?nota\s*(?:rapida\s*)?(?:de\s+|sobre\s+|con\s+|que\s+diga\s+)?|agrega(?:r)?\s+(?:una?\s+)?nota\s*(?:rapida\s*)?(?:de\s+|sobre\s+|con\s+)?|escribe?\s+(?:una?\s+)?nota\s*(?:que\s+diga\s+)?)/);
      const { x, y } = centroCanvas(200, 140);
      setItems(prev => [...prev, { id: Date.now().toString(), type: 'note', x, y, width: 200, height: 140, content: contenido || '...', color: '#FFF8E7' }]);
      setComandoFeedback({ ok: true, msg: contenido ? `📝 Nota: "${contenido}"` : '📝 Nota creada' });
      setTool('select');
      return true;
    }

    // ── ✅ TAREA CON ASIGNACIÓN ──────────────────────────
    // "asigna una tarea a mary", "crea tarea de compras para carlos", etc.
    // Captura TODO lo que viene después de "a/para" (puede ser varias palabras)
    // Usa lastIndexOf para encontrar el último "a" / "para" como separador
    if (/\b(asigna(?:r)?|crea(?:r)?|agrega(?:r)?)\b.*\btarea\b/.test(t)) {
      const lastA    = t.lastIndexOf(' a ');
      const lastPara = t.lastIndexOf(' para ');
      const splitPos = Math.max(lastA, lastPara);
      if (splitPos !== -1) {
        const sepLen   = splitPos === lastPara ? 6 : 3; // " para " = 6, " a " = 3
        const antesAsig = t.slice(0, splitPos);
        const hablado   = t.slice(splitPos + sepLen).replace(/^@/, '').trim();
        const titulo    = antesAsig.replace(/.*?\btarea\s*(?:de\s+|la\s+|una?\s+)?/, '').trim() || 'Nueva tarea';
        const { username, nombre } = resolverAsignado(hablado);
        const { x, y } = centroCanvas(240, 90);
        setItems(prev => [...prev, { id: Date.now().toString(), type: 'task', x, y, width: 240, height: 90, content: titulo, status: 'pendiente', asignadoA: username, color: '' }]);
        setComandoFeedback({ ok: true, msg: `✅ Tarea "${titulo}" → ${nombre} (@${username})` });
        setTool('select');
        return true;
      }
    }

    // ── ✅ TAREA SIMPLE ──────────────────────────────────
    // "crea una tarea de compras", "necesito hacer...", "pendiente:..."
    if (/\b(crea(?:r)?\s+(?:una?\s+)?tarea|agrega(?:r)?\s+(?:una?\s+)?tarea|necesito\s+(?:hacer|recordar)|pendiente:|tarea:)\b/.test(t)) {
      const titulo = tras(/.*?\b(?:crea(?:r)?\s+(?:una?\s+)?tarea\s*(?:de\s+)?|agrega(?:r)?\s+(?:una?\s+)?tarea\s*(?:de\s+)?|necesito\s+(?:hacer|recordar)\s+|pendiente:\s*|tarea:\s*)/) || 'Nueva tarea';
      const { x, y } = centroCanvas(240, 90);
      setItems(prev => [...prev, { id: Date.now().toString(), type: 'task', x, y, width: 240, height: 90, content: titulo, status: 'pendiente', color: '' }]);
      setComandoFeedback({ ok: true, msg: `✅ Tarea: "${titulo}"` });
      setTool('select');
      return true;
    }

    // ── 🔔 RECORDATORIO ──────────────────────────────────
    // "recuérdame X el viernes a las 6pm"
    const mRec = t.match(/\b(?:recuerdame|ponme\s+(?:un\s+)?recordatorio|avisame|recuerda(?:\s+que)?|agenda(?:r)?)\b\s*(.*?)\s+(?:el\s+)?(\w+)\s+a\s+las?\s+(\d{1,2}(?::\d{2})?\s*(?:am?|pm?)?)/);
    if (mRec) {
      const titulo = mRec[1].replace(/^(?:de|que|para)\s+/, '').trim();
      const fecha = parsearDia(mRec[2]);
      const hora  = parsearHora(mRec[3]);
      try {
        await api.post('/reminders', { nota_id: noteId || '', mensaje: titulo || 'Recordatorio', fecha_hora: new Date(`${fecha}T${hora}:00`).toISOString() });
        setComandoFeedback({ ok: true, msg: `🔔 "${titulo || 'Recordatorio'}" · ${mRec[2]} ${hora}` });
        setRemExito(true); setTimeout(() => setRemExito(false), 3000);
      } catch { setComandoFeedback({ ok: false, msg: 'No se pudo crear el recordatorio.' }); }
      return true;
    }

    // ── 💬 TEXTO LIBRE ───────────────────────────────────
    // "escribe en el tablero...", "agrega texto...", "pon texto..."
    if (/\b(escribe?\s+(?:en\s+el\s+tablero|texto)|agrega(?:r)?\s+(?:un\s+)?texto|pon(?:er)?\s+(?:el\s+)?texto)\b/.test(t)) {
      const contenido = tras(/.*?\b(?:escribe?\s+(?:en\s+el\s+tablero\s+|texto\s+)?|agrega(?:r)?\s+(?:un\s+)?texto\s*(?:que\s+diga\s+)?|pon(?:er)?\s+(?:el\s+)?texto\s*)/);
      if (!contenido) return false;
      const { x, y } = centroCanvas(200, 50);
      setItems(prev => [...prev, { id: Date.now().toString(), type: 'text', x, y, width: 220, height: 50, content: contenido, color: 'transparent' }]);
      setComandoFeedback({ ok: true, msg: `💬 Texto: "${contenido}"` });
      setTool('select');
      return true;
    }

    // ── 🗑️ BORRAR ÚLTIMO ────────────────────────────────
    if (/\b(borra(?:r)?\s+(?:el\s+)?ultimo|elimina(?:r)?\s+(?:lo\s+)?ultimo|deshacer|deshaz)\b/.test(t)) {
      setItems(prev => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        setComandoFeedback({ ok: true, msg: `🗑️ Eliminado: "${last.content?.slice(0, 30)}"` });
        return prev.slice(0, -1);
      });
      return true;
    }

    return false;
  };

  const iniciarReconocimiento = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      setSpeechSupported(false);
      return;
    }

    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CO';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + ' ';
          ejecutarComandoVoz(finalTranscriptRef.current.trim()).then(esComando => {
            if (esComando) stopSpeechRecording();
          });
        } else {
          interimText += transcript;
        }
      }
      interimTranscriptRef.current = interimText;
      setSpeechText(`${finalTranscriptRef.current}${interimTranscriptRef.current}`.trim());
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        recognitionRef.current = null;
        setSpeechListening(false);
        setSpeechError('Permiso de micrófono denegado. Habilítalo en la configuración del navegador.');
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setSpeechListening(true);
      setSpeechSupported(true);
    } catch {
      setSpeechError('No se pudo iniciar el reconocimiento de voz.');
    }
  };

  const startSpeechRecording = () => {
    setSpeechError('');
    setSpeechOpen(true);
    setSpeechText('');
    setSpeechAudioName('');
    setComandoFeedback(null);
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    iniciarReconocimiento();
  };

  const reanudarEscucha = () => {
    if (speechListening || speechLoading) return;
    setSpeechError('');
    setComandoFeedback(null);
    setSpeechAudioName('');
    finalTranscriptRef.current = speechText.trim() ? `${speechText.trim()} ` : '';
    interimTranscriptRef.current = '';
    iniciarReconocimiento();
  };

  const handleAudioFileUpload = async (file: File) => {
    if (!esArchivoAudioValido(file)) {
      setSpeechError('Formato no soportado. Usa webm, mp4, mp3, wav u ogg.');
      return;
    }

    if (speechListening) stopSpeechRecording();

    setSpeechOpen(true);
    setSpeechError('');
    setComandoFeedback(null);
    setSpeechLoading(true);
    setSpeechAudioName(file.name);

    try {
      const { text } = await speechService.transcribe(file);
      if (!text) {
        setSpeechError('No se detectó texto en el audio.');
        setSpeechText('');
        finalTranscriptRef.current = '';
      } else {
        setSpeechText(text);
        finalTranscriptRef.current = `${text} `;
        interimTranscriptRef.current = '';
        await ejecutarComandoVoz(text);
      }
    } catch (err) {
      let msg = 'Error al transcribir el audio. Verifica tu conexión e intenta de nuevo.';
      if (isAxiosError<{ message?: string | string[] }>(err)) {
        const raw = err.response?.data?.message;
        if (typeof raw === 'string') msg = raw;
        else if (Array.isArray(raw)) msg = raw.join('. ');
      }
      setSpeechError(msg);
    } finally {
      setSpeechLoading(false);
      if (audioFileInputRef.current) audioFileInputRef.current.value = '';
    }
  };

  const onAudioFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleAudioFileUpload(file);
  };

  const stopSpeechRecording = () => {
    setSpeechListening(false);
    const rec = recognitionRef.current;
    recognitionRef.current = null; // limpiar antes de stop para que onend no reinicie
    if (rec) rec.stop();
  };

  const closeSpeechBox = () => {
    if (speechListening) {
      stopSpeechRecording();
    }

    setSpeechOpen(false);
    setSpeechText('');
    setSpeechError('');
    setSpeechLoading(false);
    setSpeechAudioName('');
    if (audioFileInputRef.current) audioFileInputRef.current.value = '';
  };

  const insertSpeechText = () => {
    if (!speechText.trim()) {
      setSpeechError('No hay texto para insertar.');
      return;
    }

    const { x, y } = lastInsertPositionRef.current;

    setItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'text',
        x,
        y,
        width: 320,
        height: 80,
        content: speechText.trim(),
        color: 'transparent',
      },
    ]);

    setTool('select');
    closeSpeechBox();
  };

  // ── Exportar ──
  const exportarMarkdown = () => {
    const lines: string[] = [`# ${noteTitle || 'Tablero'}\n`];
    const tasks = items.filter(i => i.type === 'task');
    const notes = items.filter(i => i.type === 'note');
    const texts = items.filter(i => i.type === 'text');
    if (tasks.length) {
      lines.push('## Tareas\n');
      tasks.forEach(t => {
        const estado = t.status === 'finalizada' ? '[x]' : t.status === 'en_proceso' ? '[~]' : '[ ]';
        const asig = t.asignadoA ? ` @${t.asignadoA}` : '';
        lines.push(`- ${estado} ${t.content}${asig}`);
      });
      lines.push('');
    }
    if (notes.length) {
      lines.push('## Notas\n');
      notes.forEach(n => lines.push(`> ${n.content}\n`));
    }
    if (texts.length) {
      lines.push('## Texto libre\n');
      texts.forEach(t => lines.push(`${t.content}\n`));
    }
    if (strokesRef.current.length > 0) lines.push(`\n_Contiene ${strokesRef.current.length} trazos de dibujo._\n`);
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${noteTitle || 'tablero'}.md`;
    a.click();
    setExportMenu(false);
  };

  const exportarPDF = () => {
    setExportMenu(false);
    const canvas = canvasRef.current;
    const imgData = canvas ? canvas.toDataURL('image/png') : '';

    const tareasHTML = items.filter(i => i.type === 'task').map(t =>
      `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #eee">
        <span style="padding:2px 8px;border-radius:20px;font-size:12px;background:${t.status === 'finalizada' ? '#D1FAE5' : t.status === 'en_proceso' ? '#EDE9FE' : '#FEF3C7'};color:${t.status === 'finalizada' ? '#065F46' : t.status === 'en_proceso' ? '#5B21B6' : '#92400E'}">${t.status === 'finalizada' ? 'Finalizada' : t.status === 'en_proceso' ? 'En proceso' : 'Pendiente'}</span>
        <span style="font-size:14px">${t.content}</span>
        ${t.asignadoA ? `<span style="font-size:12px;color:#8070C8">@${t.asignadoA}</span>` : ''}
      </div>`
    ).join('');

    const notasHTML = items.filter(i => i.type === 'note').map(n =>
      `<div style="background:${n.color};border-radius:8px;padding:10px 12px;font-size:13px;margin-bottom:8px">${n.content}</div>`
    ).join('');

    const html = `<!DOCTYPE html><html><head>
      <title>${noteTitle || 'Tablero'}</title>
      <style>body{font-family:system-ui,sans-serif;margin:0;padding:24px;color:#2F2840} h1{font-weight:300;color:#8070C8;margin-bottom:4px} .section{margin-top:20px} h3{font-size:14px;color:#B0A0C0;font-weight:500;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px} img{max-width:100%;border-radius:8px;border:1px solid #eee} @media print{body{padding:0}}</style>
    </head><body>
      <h1>${noteTitle || 'Tablero'}</h1>
      <p style="color:#B0A0C0;font-size:13px;margin:0 0 16px">Exportado el ${new Date().toLocaleDateString('es-MX', { day:'numeric', month:'long', year:'numeric' })}</p>
      ${imgData ? `<div class="section"><h3>Dibujo</h3><img src="${imgData}" /></div>` : ''}
      ${tareasHTML ? `<div class="section"><h3>Tareas</h3>${tareasHTML}</div>` : ''}
      ${notasHTML  ? `<div class="section"><h3>Notas</h3>${notasHTML}</div>` : ''}
      <script>window.onload=()=>{window.print()}</script>
    </body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  // ── Estado de tarea colores ──
  const statusColors: Record<string, { bg: string; color: string }> = {
    pendiente:  { bg: '#FEF3C7', color: '#92400E' },
    en_proceso: { bg: '#EDE9FE', color: '#5B21B6' },
    finalizada: { bg: '#D1FAE5', color: '#065F46' },
  };

  const statusLabel: Record<string, string> = { pendiente: 'Pendiente', en_proceso: 'En proceso', finalizada: 'Finalizada' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--whiteboard-bg)' }}>

      {esInvitado && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: '#E8F0FF',
          borderBottom: '0.5px solid #C8D8F0',
          fontSize: '0.85rem',
          color: '#405880',
          fontWeight: 300,
          flexShrink: 0,
        }}>
          Te invitaron a colaborar en este tablero como{' '}
          <strong style={{ fontWeight: 500 }}>{rolLabel[miRol] || miRol}</strong>
          {!puedeEditar && ' — modo solo lectura'}
        </div>
      )}

      {/* ── TOOLBAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', backgroundColor: 'var(--whiteboard-toolbar-bg)', borderBottom: '0.5px solid var(--whiteboard-toolbar-border)', flexShrink: 0, flexWrap: 'nowrap', overflowX: 'auto', position: 'relative', zIndex: 50 }}>

        {/* Salir */}
        {onBack && (
          <button onClick={async () => {
            if (noteId && isLoaded.current && puedeEditar) {
              if (saveTimer.current) clearTimeout(saveTimer.current);
              const nuevoEstado = calcularEstadoNota(itemsRef.current);

              await api.put(`/notes/${noteId}`, {
                contenido: buildContenido(itemsRef.current),
                estado: nuevoEstado,
              });

              setNoteEstado(nuevoEstado);
            }
            onBack();
          }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--highlight-bg)', color: 'var(--primary)', fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit', marginRight: '4px' }}>
            ← Mis Notas
          </button>
        )}

        <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--primary)', marginRight: '4px', whiteSpace: 'nowrap', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {noteTitle || 'Tablero'}
        </span>

        <Sep />

        {/* ── SECCIÓN DIBUJO ── */}
        <SectionLabel>Dibujo</SectionLabel>
        <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--app-bg)', borderRadius: '10px', padding: '3px' }}>
          <ToolBtn active={tool === 'select'} onClick={() => setTool('select')} title="Seleccionar">↖</ToolBtn>
          <ToolBtn active={tool === 'pen'}    onClick={() => setTool('pen')}    title="Lápiz">✏️</ToolBtn>
          <ToolBtn active={tool === 'eraser'} onClick={() => setTool('eraser')} title="Borrar">⬜</ToolBtn>
        </div>

        {tool === 'pen' && (
          <>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginLeft: '4px' }}>
              {penColors.map(c => (
                <div key={c} onClick={() => setPenColor(c)} style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: c, cursor: 'pointer', border: penColor === c ? '2.5px solid var(--app-fg)' : '2px solid transparent', transition: 'border 0.1s' }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginLeft: '4px' }}>
              {[2, 4, 8].map(s => (
                <div key={s} onClick={() => setPenSize(s)} style={{ width: `${s + 10}px`, height: `${s + 10}px`, borderRadius: '50%', backgroundColor: penSize === s ? 'var(--primary)' : 'var(--card-border)', cursor: 'pointer' }} />
              ))}
            </div>
          </>
        )}

        {tool === 'eraser' && (
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center', marginLeft: '4px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--muted-fg)', marginRight: '2px' }}>Tamaño</span>
            {[12, 24, 48].map(s => (
              <div key={s} onClick={() => setEraserSize(s)} title={`${s}px`} style={{
                width: `${Math.round(s / 3) + 8}px`, height: `${Math.round(s / 3) + 8}px`,
                borderRadius: '50%', cursor: 'pointer',
                backgroundColor: eraserSize === s ? '#2F2840' : 'var(--card-border)',
                transition: 'background 0.1s',
              }} />
            ))}
          </div>
        )}

        <Sep />

        {/* ── SECCIÓN CONTENIDO ── */}
        <SectionLabel>Contenido</SectionLabel>
        <div style={{ display: 'flex', gap: '2px', backgroundColor: 'var(--app-bg)', borderRadius: '10px', padding: '3px' }}>
          <ToolBtn active={tool === 'note'} onClick={() => setTool('note')} title="Sticky note">📄</ToolBtn>
          <ToolBtn active={tool === 'text'} onClick={() => setTool('text')} title="Texto libre" wide><span style={{ fontSize: '13px', fontWeight: 600 }}>T</span></ToolBtn>
          <ToolBtn active={false} onClick={() => { setTaskModal(true); setTaskTitulo(''); setTaskEstado('pendiente'); setTaskAsignado(''); }} title="Nueva tarea">✅</ToolBtn>
        </div>

        <Sep />

        {/* ── SECCIÓN ACCIONES ── */}
        <SectionLabel>Acciones</SectionLabel>

        <ToolBtn active={false} onClick={() => { setReminderModal(true); setRemTitulo(''); setRemFecha(new Date().toISOString().slice(0, 10)); setRemHora('09:00'); }} title="Crear recordatorio">🔔</ToolBtn>

        <ToolBtn
          active={speechListening}
          onClick={() => {
            if (speechListening) {
              stopSpeechRecording();
            } else if (speechOpen) {
              reanudarEscucha();
            } else {
              startSpeechRecording();
            }
          }}
          title="Dictar con micrófono"
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '999px',
              animation: speechListening ? 'speechPulse 1.2s infinite' : 'none',
            }}
          >
            🎙️
          </span>
        </ToolBtn>

        {/* Exportar */}
        <div ref={exportBtnRef}>
          <ToolBtn active={exportMenu} onClick={() => {
            const rect = exportBtnRef.current?.getBoundingClientRect();
            if (rect) setExportPos({ top: rect.bottom + 4, left: rect.left });
            setExportMenu(v => !v);
          }} title="Exportar" wide>
            <span>↓</span><span style={{ fontSize: '0.75rem' }}>Exportar</span>
          </ToolBtn>
        </div>

        {noteId && (
          <CollaborationBar
            connected={collabConnected}
            roomReady={collabRoomReady}
            joinError={collabJoinError}
            presencia={collabPresencia}
            locks={collabLocks}
            drawingLock={drawingLock}
            lockMsg={lockMsg}
            esColaborativa={esColaborativa || colaboradores.length > 0}
          />
        )}

        {/* ── COLABORADORES (avatares con tooltip y anillo de rol) ── */}
        {esColaborativa && colaboradores.length > 0 && (
          <>
            <Sep />
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', position: 'relative' }}>
              {colaboradores.slice(0, 3).map(c => (
                <div key={c.username}
                  onMouseEnter={e => { const r = e.currentTarget.getBoundingClientRect(); setTooltip({ text: `${c.nombre} · ${c.rol}`, x: r.left, y: r.bottom + 6 }); }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E0D8F8', border: `2.5px solid ${rolColors[c.rol] || '#8070C8'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600, color: '#2F2840', cursor: 'default', marginLeft: '-4px' }}>
                  {c.nombre.charAt(0).toUpperCase()}
                </div>
              ))}
              {colaboradores.length > 3 && (
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#F0EBF8', border: '2px solid #C8B8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 600, color: '#8070C8', marginLeft: '-4px' }}>
                  +{colaboradores.length - 3}
                </div>
              )}
              {miRol === 'admin' && (
                <button onClick={() => { setAddCollabModal(true); setCollabBusqueda(''); setCollabResultados([]); }}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1.5px dashed #B0A0C0', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B0A0C0', fontSize: '14px', marginLeft: '4px' }}
                  title="Agregar colaborador">+</button>
              )}
            </div>
          </>
        )}

        {/* ── COMPLETAR PROYECTO (solo admin) ── */}
        {esColaborativa && miRol === 'admin' && (
          <button onClick={() => setCompletarConfirm(true)}
            style={{ padding: '5px 10px', borderRadius: '8px', border: 'none', fontSize: '0.75rem', cursor: 'pointer', backgroundColor: noteEstado === 'completado' ? '#D1FAE5' : '#F6F4FB', color: noteEstado === 'completado' ? '#065F46' : 'var(--muted-fg)', fontWeight: 500 }}>
            {noteEstado === 'completado' ? '↩ Reabrir' : '✓ Completar'}
          </button>
        )}

        {/* Mensaje éxito recordatorio */}
        {remExito && (
          <span style={{ fontSize: '0.78rem', color: '#065F46', backgroundColor: '#D1FAE5', padding: '4px 10px', borderRadius: '20px' }}>
            ✓ Recordatorio creado
          </span>
        )}

        {/* Guardar */}
        <div style={{ marginLeft: 'auto' }}>
          {noteId && puedeEditar && (
            <button onClick={guardarAhora} disabled={guardando} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', backgroundColor: guardado ? '#D8F8EC' : 'var(--primary)', color: guardado ? '#408060' : '#FFFFFF', fontSize: '0.8rem', cursor: guardando ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              {guardando ? 'Guardando...' : guardado ? '✓ Guardado' : 'Guardar'}
            </button>
          )}
        </div>

        {/* Tooltip colaborador */}
        {tooltip && (
          <div style={{ position: 'fixed', top: tooltip.y, left: tooltip.x, backgroundColor: '#2F2840', color: '#FFFFFF', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '8px', zIndex: 9999, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            {tooltip.text}
          </div>
        )}
      </div>

      {/* ── CANVAS ── */}
      <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: tool === 'pen' || tool === 'eraser' ? 'crosshair' : 'default' }}
        onClick={handleCanvasClick} onMouseMove={onMouseMove} onMouseUp={stopDrag}>

        {/* Fondo punteado */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <defs><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="var(--whiteboard-dot)" opacity="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Canvas dibujo */}
        <canvas ref={canvasRef} width={BOARD_W} height={BOARD_H}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            pointerEvents: tool === 'pen' || tool === 'eraser' ? 'auto' : 'none',
            opacity: drawingBlocked && !drawing ? 0.85 : 1,
          }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} />

        {/* Items */}
        {items.map(item => (
          <div key={item.id} style={{ position: 'absolute', left: item.x, top: item.y, width: item.width, height: item.height, cursor: tool === 'select' ? (dragging?.id === item.id ? 'grabbing' : 'grab') : 'default', userSelect: 'none' }} onMouseDown={e => startDrag(e, item.id)}>

            {/* Sticky note */}
            {item.type === 'note' && (
              <div style={{ backgroundColor: item.color, border: selectedId === item.id ? '1.5px solid var(--primary)' : '0.5px solid var(--card-border)', borderRadius: '12px', padding: '12px', height: '100%', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--muted-fg)', fontWeight: 300 }}>nota</span>
                  {selectedId === item.id && <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#C04060', padding: 0 }}>✕</button>}
                </div>
                {editingId === item.id
                  ? <textarea autoFocus value={editText} onChange={e => setEditText(e.target.value)} onBlur={saveEdit} style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--app-fg)', fontWeight: 300, resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.5, minHeight: '80px' }} />
                  : <p onDoubleClick={e => startEdit(e, item)} style={{ fontSize: '0.875rem', color: 'var(--app-fg)', fontWeight: 300, margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{item.content}</p>
                }
              </div>
            )}

            {/* Tarea */}
            {item.type === 'task' && (
              <div style={{ backgroundColor: 'var(--card-bg)', border: selectedId === item.id ? '1.5px solid var(--primary)' : '0.5px solid var(--card-border)', borderRadius: '12px', padding: '10px 12px', height: '100%', boxSizing: 'border-box', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  {editingId === item.id
                    ? <input autoFocus value={editText} onChange={e => setEditText(e.target.value)} onBlur={saveEdit} style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--card-title)', fontWeight: 400, outline: 'none', fontFamily: 'inherit' }} />
                    : <p onDoubleClick={e => startEdit(e, item)} style={{ fontSize: '0.875rem', color: 'var(--card-title)', fontWeight: 400, margin: 0, flex: 1, paddingRight: '8px' }}>{item.content}</p>
                  }
                  {selectedId === item.id && <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#C04060', padding: 0, flexShrink: 0 }}>✕</button>}
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button onClick={e => { e.stopPropagation(); cycleStatus(item.id); }} style={{ fontSize: '0.72rem', fontWeight: 500, padding: '2px 8px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: statusColors[item.status ?? 'pendiente']?.bg, color: statusColors[item.status ?? 'pendiente']?.color }}>
                    {statusLabel[item.status ?? 'pendiente']}
                  </button>
                  {item.asignadoA && <span style={{ fontSize: '0.7rem', color: 'var(--muted-fg)' }}>@{item.asignadoA}</span>}
                </div>
              </div>
            )}

            {/* Texto libre */}
            {item.type === 'text' && (
              <div style={{ border: selectedId === item.id ? '1px dashed var(--card-border)' : '1px dashed transparent', borderRadius: '8px', padding: '4px 8px', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
                {editingId === item.id
                  ? <input autoFocus value={editText} onChange={e => setEditText(e.target.value)} onBlur={saveEdit} style={{ border: 'none', background: 'transparent', fontSize: '1rem', color: 'var(--card-title)', fontWeight: 300, outline: 'none', fontFamily: 'inherit', width: '100%' }} />
                  : <p onDoubleClick={e => startEdit(e, item)} style={{ fontSize: '1rem', color: 'var(--card-title)', fontWeight: 300, margin: 0 }}>{item.content}</p>
                }
                {selectedId === item.id && <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#C04060', padding: 0 }}>✕</button>}
              </div>
            )}

            {/* Handles resize */}
            {selectedId === item.id && tool === 'select' && (
              [{ h: 'nw', top: -5, left: -5, cursor: 'nwse-resize' }, { h: 'n', top: -5, left: item.width / 2 - 5, cursor: 'ns-resize' }, { h: 'ne', top: -5, left: item.width - 5, cursor: 'nesw-resize' }, { h: 'e', top: item.height / 2 - 5, left: item.width - 5, cursor: 'ew-resize' }, { h: 'se', top: item.height - 5, left: item.width - 5, cursor: 'nwse-resize' }, { h: 's', top: item.height - 5, left: item.width / 2 - 5, cursor: 'ns-resize' }, { h: 'sw', top: item.height - 5, left: -5, cursor: 'nesw-resize' }, { h: 'w', top: item.height / 2 - 5, left: -5, cursor: 'ew-resize' }]
              .map(({ h, top, left, cursor }) => (
                <div key={h} onMouseDown={e => startResizeHandle(e, item.id, h)} style={{ position: 'absolute', top, left, width: 10, height: 10, borderRadius: '2px', backgroundColor: '#FFFFFF', border: '1.5px solid #8070C8', cursor, zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
              ))
            )}
          </div>
        ))}
      </div>

      {/* ── SPEECH TO TEXT ── */}
      {speechOpen && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: '24px',
            transform: 'translateX(-50%)',
            width: 'min(720px, calc(100vw - 48px))',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E4DCF4',
            borderRadius: '18px',
            boxShadow: '0 18px 48px rgba(47,40,64,0.18)',
            zIndex: 1200,
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.1rem' }}>🎙️</span>
              <div>
                <p style={{ margin: 0, color: '#2F2840', fontSize: '0.95rem', fontWeight: 500 }}>
                  Dictado por voz
                </p>
                <p style={{ margin: 0, color: '#B0A0C0', fontSize: '0.75rem' }}>
                  {speechListening
                    ? 'Escuchando... di un comando o habla libremente'
                    : speechLoading
                      ? 'Transcribiendo archivo de audio...'
                      : speechAudioName
                        ? `Transcripción de "${speechAudioName}" — puedes reanudar el micrófono`
                        : 'Puedes editar el texto antes de insertarlo'}
                </p>
                {speechListening && (
                  <p style={{ margin: '2px 0 0', color: '#8070C8', fontSize: '0.7rem', fontWeight: 300 }}>
                    Comandos: "Crea una nota rápida [texto]" · "Crea una tarea de [título]" · "Recuérdame [título] el viernes a las 5pm" · "Asigna una tarea de [título] a @usuario"
                  </p>
                )}
              </div>
            </div>

            {(speechListening || speechLoading) && (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '999px',
                      backgroundColor: '#8070C8',
                      display: 'inline-block',
                      animation: `speechDots 1s ${i * 0.15}s infinite ease-in-out`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {!speechSupported && (
            <div style={{ padding: '8px 10px', backgroundColor: '#FFF8E7', color: '#92400E', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '10px' }}>
              Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.
            </div>
          )}

          {comandoFeedback && (
            <div style={{ padding: '10px 14px', backgroundColor: comandoFeedback.ok ? '#D1FAE5' : '#FDE2E8', color: comandoFeedback.ok ? '#065F46' : '#A8324E', borderRadius: '12px', fontSize: '0.875rem', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span>{comandoFeedback.msg}</span>
              <button onClick={() => setComandoFeedback(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6, fontSize: '1rem', flexShrink: 0 }}>✕</button>
            </div>
          )}

          {speechError && (
            <div style={{ padding: '8px 10px', backgroundColor: '#FDE2E8', color: '#A8324E', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '10px' }}>
              {speechError}
            </div>
          )}

          <input
            ref={audioFileInputRef}
            type="file"
            accept="audio/*,.webm,.mp4,.m4a,.mp3,.wav,.ogg"
            style={{ display: 'none' }}
            onChange={onAudioFileSelected}
          />

          <textarea
            value={speechText}
            onChange={e => setSpeechText(e.target.value)}
            placeholder="Aquí aparecerá la transcripción..."
            disabled={speechLoading}
            style={{
              width: '100%',
              minHeight: '96px',
              resize: 'vertical',
              border: '1px solid #E4DCF4',
              backgroundColor: '#F8F6FC',
              borderRadius: '12px',
              padding: '12px',
              color: '#2F2840',
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: '0.92rem',
              boxSizing: 'border-box',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => audioFileInputRef.current?.click()}
              disabled={speechListening || speechLoading}
              title="Subir un archivo de audio para transcribirlo"
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #E4DCF4',
                backgroundColor: speechListening || speechLoading ? '#F8F6FC' : '#F0EBF8',
                color: speechListening || speechLoading ? '#D8D0EC' : '#8070C8',
                cursor: speechListening || speechLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.85rem',
              }}
            >
              📁 Subir audio
            </button>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={closeSpeechBox}
              disabled={speechLoading}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #E4DCF4',
                backgroundColor: 'transparent',
                color: speechLoading ? '#D8D0EC' : '#B0A0C0',
                cursor: speechLoading ? 'not-allowed' : 'pointer',
              }}
            >
              Cerrar
            </button>

            <button
              onClick={() => {
                setSpeechText('');
                setSpeechAudioName('');
                finalTranscriptRef.current = '';
                interimTranscriptRef.current = '';
              }}
              disabled={!speechText.trim() || speechLoading}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #E4DCF4',
                backgroundColor: 'transparent',
                color: speechText.trim() && !speechLoading ? '#C04060' : '#D8D0EC',
                cursor: speechText.trim() && !speechLoading ? 'pointer' : 'not-allowed',
              }}
            >
              Limpiar
            </button>

            {!speechListening && !speechLoading && (
              <button
                onClick={reanudarEscucha}
                disabled={!speechSupported}
                title="Continuar dictando con el micrófono"
                style={{
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: speechSupported ? '#8070C8' : '#D8D0EC',
                  color: '#FFFFFF',
                  cursor: speechSupported ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                🎙️ Reanudar micrófono
              </button>
            )}

            <button
              onClick={stopSpeechRecording}
              disabled={!speechListening}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: speechListening ? '#FDE2E8' : '#EFEAF8',
                color: speechListening ? '#A8324E' : '#B0A0C0',
                cursor: speechListening ? 'pointer' : 'not-allowed',
              }}
            >
              Detener
            </button>

            <button
              onClick={insertSpeechText}
              disabled={!speechText.trim() || speechLoading}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: speechText.trim() && !speechLoading ? '#8070C8' : '#D8D0EC',
                color: '#FFFFFF',
                cursor: speechText.trim() && !speechLoading ? 'pointer' : 'not-allowed',
              }}
            >
              Insertar en canvas
            </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DROPDOWN EXPORTAR (fixed para evitar clipping) ── */}
      {exportMenu && (
        <>
          <div onClick={() => setExportMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
          <div style={{ position: 'fixed', top: exportPos.top, left: exportPos.left, backgroundColor: 'var(--card-bg)', border: '0.5px solid var(--card-border)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 1000, overflow: 'hidden', minWidth: '150px' }}>
            <button onClick={exportarMarkdown} style={{ width: '100%', padding: '0.65rem 1rem', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', color: 'var(--card-title)', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--highlight-bg)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              📝 Markdown (.md)
            </button>
            <button onClick={exportarPDF} style={{ width: '100%', padding: '0.65rem 1rem', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', color: 'var(--card-title)', display: 'flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--highlight-bg)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              📄 PDF (imprimir)
            </button>
          </div>
        </>
      )}

      {/* ── MODAL TAREA ── */}
      {taskModal && (
        <Modal onClose={() => setTaskModal(false)}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 300, color: '#2F2840', margin: '0 0 1.25rem' }}>Nueva tarea</h2>

          <input value={taskTitulo} onChange={e => setTaskTitulo(e.target.value)} placeholder="Título de la tarea..." autoFocus
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '0.5px solid #E4DCF4', backgroundColor: '#F6F4FB', fontSize: '0.95rem', color: '#2F2840', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '1rem' }} />

          {/* Estado */}
          <p style={{ fontSize: '0.8rem', color: '#B0A0C0', margin: '0 0 0.5rem', fontWeight: 300 }}>Estado</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {(['pendiente', 'en_proceso', 'finalizada'] as const).map(s => (
              <button key={s} onClick={() => setTaskEstado(s)} style={{ padding: '5px 12px', borderRadius: '20px', border: `1.5px solid ${taskEstado === s ? statusColors[s].color : '#E4DCF4'}`, backgroundColor: taskEstado === s ? statusColors[s].bg : '#FFFFFF', color: taskEstado === s ? statusColors[s].color : '#B0A0C0', fontSize: '0.8rem', cursor: 'pointer', fontWeight: taskEstado === s ? 500 : 300 }}>
                {statusLabel[s]}
              </button>
            ))}
          </div>

          {/* Asignación (solo colaborativa) */}
          {esColaborativa && (
            <>
              <p style={{ fontSize: '0.8rem', color: '#B0A0C0', margin: '0 0 0.5rem', fontWeight: 300 }}>
                {miRol === 'admin' ? 'Asignar a' : 'Asignar (solo a ti mismo)'}
              </p>
              <select value={taskAsignado} onChange={e => setTaskAsignado(e.target.value)} disabled={miRol !== 'admin'}
                style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '10px', border: '0.5px solid #E4DCF4', backgroundColor: '#F6F4FB', color: '#2F2840', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem', cursor: miRol !== 'admin' ? 'not-allowed' : 'pointer' }}>
                <option value="">Sin asignar</option>
                {miRol === 'admin'
                  ? colaboradores.map(c => <option key={c.username} value={c.username}>{c.nombre} (@{c.username})</option>)
                  : <option value={user.username}>{user.nombre} (yo)</option>
                }
              </select>
            </>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button onClick={() => setTaskModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '0.5px solid #E4DCF4', backgroundColor: 'transparent', color: '#B0A0C0', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={crearTarea} disabled={!taskTitulo.trim()} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', backgroundColor: taskTitulo.trim() ? '#8070C8' : '#D8D0EC', color: '#FFFFFF', cursor: taskTitulo.trim() ? 'pointer' : 'not-allowed' }}>Agregar tarea</button>
          </div>
        </Modal>
      )}

      {/* ── MODAL RECORDATORIO (con descripción) ── */}
      {reminderModal && (
        <Modal onClose={() => setReminderModal(false)}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 300, color: '#2F2840', margin: '0 0 1.25rem' }}>Nuevo recordatorio</h2>

          <input value={remTitulo} onChange={e => setRemTitulo(e.target.value)} placeholder="¿Qué necesitas recordar?" autoFocus
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '0.5px solid #E4DCF4', backgroundColor: '#F6F4FB', fontSize: '0.95rem', color: '#2F2840', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: '0.75rem' }} />

          <textarea value={remDesc} onChange={e => setRemDesc(e.target.value)} placeholder="Descripción (opcional)..."
            style={{ width: '100%', padding: '0.65rem 1rem', borderRadius: '12px', border: '0.5px solid #E4DCF4', backgroundColor: '#F6F4FB', fontSize: '0.875rem', color: '#2F2840', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'none', minHeight: '70px', marginBottom: '0.75rem' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#B0A0C0', margin: '0 0 0.4rem', fontWeight: 300 }}>Fecha</p>
              <input type="date" value={remFecha} onChange={e => setRemFecha(e.target.value)} min={new Date().toISOString().slice(0, 10)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '0.5px solid #E4DCF4', backgroundColor: '#F6F4FB', color: '#2F2840', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: '#B0A0C0', margin: '0 0 0.4rem', fontWeight: 300 }}>Hora</p>
              <input type="time" value={remHora} onChange={e => setRemHora(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '0.5px solid #E4DCF4', backgroundColor: '#F6F4FB', color: '#2F2840', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          {noteTitle && (
            <div style={{ backgroundColor: '#F6F4FB', borderRadius: '10px', padding: '0.5rem 0.75rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#8070C8' }}>
              📄 Nota: <strong>{noteTitle}</strong>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setReminderModal(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '0.5px solid #E4DCF4', backgroundColor: 'transparent', color: '#B0A0C0', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={crearRecordatorio} disabled={!remTitulo.trim() || !remFecha || remCreando}
              style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', backgroundColor: (remTitulo.trim() && remFecha) ? '#8070C8' : '#D8D0EC', color: '#FFFFFF', cursor: (remTitulo.trim() && remFecha) ? 'pointer' : 'not-allowed' }}>
              {remCreando ? 'Creando...' : 'Crear recordatorio'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── PANEL LATERAL EQUIPO (GitHub-style) ── */}
      {addCollabModal && (() => {
        const miembrosActivos = colaboradores.filter((c: any) => !c.invitacion || c.invitacion === 'aceptada');
        const tareasSinAsignar = items.filter(i => i.type === 'task' && !i.asignadoA);
        const closePanel = () => { setAddCollabModal(false); setCollabBusqueda(''); setCollabResultados([]); };
        const taskDot: Record<string, { bg: string; border: string; icon: string }> = {
          pendiente:  { bg: '#FEF3C7', border: '#F59E0B', icon: '○' },
          en_proceso: { bg: '#EDE9FE', border: '#8070C8', icon: '◑' },
          finalizada: { bg: '#D1FAE5', border: '#059669', icon: '●' },
        };
        return (
          <>
            <div onClick={closePanel} style={{ position: 'fixed', inset: 0, zIndex: 1999, backgroundColor: 'rgba(47,40,64,0.18)' }} />
            <div style={{ position: 'fixed', right: 0, top: 0, height: '100vh', width: '380px', backgroundColor: '#FFFFFF', zIndex: 2000, boxShadow: '-8px 0 40px rgba(47,40,64,0.14)', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>

              {/* Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '0.5px solid #E8E4F4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                  <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500, color: '#2F2840' }}>👥 Equipo</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#B0A0C0', fontWeight: 300 }}>{noteTitle}</p>
                </div>
                <button onClick={closePanel} style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#B0A0C0', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#F0EBF8'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>✕</button>
              </div>

              {/* Body — scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
                {miembrosActivos.map(c => {
                  const colBg     = c.rol === 'admin' ? '#EDE9FE' : c.rol === 'editor' ? '#F9E8F3' : '#E8EFF9';
                  const colBorder = c.rol === 'admin' ? '#8070C8' : c.rol === 'editor' ? '#C070A0' : '#7090B8';
                  const rolName   = c.rol === 'admin' ? 'Administrador' : c.rol === 'editor' ? 'Editor' : 'Revisor';
                  const esYo = c.username === user.username;
                  const tareas = items.filter(i => i.type === 'task' && i.asignadoA === c.username);
                  return (
                    <div key={c.username} style={{ marginBottom: '1.5rem' }}>
                      {/* Colaborador header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: colBg, border: `2px solid ${colBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: colBorder, flexShrink: 0 }}>
                          {c.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500, color: '#2F2840', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {c.nombre}
                            {esYo && <span style={{ fontSize: '0.65rem', color: '#B0A0C0', fontWeight: 300 }}>tú</span>}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: '#B0A0C0' }}>@{c.username}</p>
                        </div>
                        {miRol === 'admin' && !esYo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            <select value={c.rol}
                              onChange={async e => {
                                await api.patch(`/notes/${noteId}/colaboradores/${c.username}/rol`, { rol: e.target.value });
                                setColaboradores(prev => prev.map(x => x.username === c.username ? { ...x, rol: e.target.value } : x));
                              }}
                              style={{ padding: '2px 6px', borderRadius: '6px', border: `0.5px solid ${colBorder}`, backgroundColor: colBg, color: colBorder, fontSize: '0.72rem', cursor: 'pointer', outline: 'none', fontWeight: 500 }}>
                              <option value="admin">Admin</option>
                              <option value="editor">Editor</option>
                              <option value="revisor">Revisor</option>
                            </select>
                            <button onClick={async () => {
                              if (!confirm(`¿Eliminar a @${c.username}?`)) return;
                              await api.delete(`/notes/${noteId}/colaboradores/${c.username}`);
                              setColaboradores(prev => prev.filter(x => x.username !== c.username));
                            }} style={{ width: '22px', height: '22px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#B0A0C0', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEE8EC'; e.currentTarget.style.color = '#C04060'; }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#B0A0C0'; }}>✕</button>
                          </div>
                        ) : (
                          <span style={{ padding: '2px 8px', borderRadius: '20px', backgroundColor: colBg, color: colBorder, fontSize: '0.7rem', fontWeight: 500, border: `0.5px solid ${colBorder}`, flexShrink: 0 }}>
                            {rolName}
                          </span>
                        )}
                      </div>

                      {/* Timeline de tareas */}
                      <div style={{ marginLeft: '17px', paddingLeft: '24px', position: 'relative', borderLeft: '1.5px solid #EAE4F4' }}>
                        {tareas.length === 0 ? (
                          <p style={{ margin: '0 0 0.25rem', fontSize: '0.75rem', color: '#C8B8D8', fontStyle: 'italic' }}>Sin tareas asignadas</p>
                        ) : tareas.map(t => {
                          const dot = taskDot[t.status || 'pendiente'];
                          return (
                            <div key={t.id} style={{ position: 'relative', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              {/* Dot sobre la línea */}
                              <div style={{ position: 'absolute', left: '-32px', top: '3px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: dot.bg, border: `1.5px solid ${dot.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: dot.border, flexShrink: 0 }}>
                                {dot.icon}
                              </div>
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: '#2F2840', fontWeight: 400, lineHeight: 1.3 }}>{t.content}</p>
                                <span style={{ fontSize: '0.65rem', color: dot.border, fontWeight: 500 }}>
                                  {t.status === 'finalizada' ? 'Finalizada' : t.status === 'en_proceso' ? 'En proceso' : 'Pendiente'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Tareas sin asignar */}
                {tareasSinAsignar.length > 0 && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '1rem', borderTop: '0.5px solid #EAE4F4' }}>
                    <p style={{ margin: '0 0 0.75rem', fontSize: '0.72rem', fontWeight: 600, color: '#B0A0C0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sin asignar</p>
                    <div style={{ marginLeft: '17px', paddingLeft: '24px', position: 'relative', borderLeft: '1.5px dashed #EAE4F4' }}>
                      {tareasSinAsignar.map(t => {
                        const dot = taskDot[t.status || 'pendiente'];
                        return (
                          <div key={t.id} style={{ position: 'relative', marginBottom: '0.5rem' }}>
                            <div style={{ position: 'absolute', left: '-32px', top: '3px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: dot.bg, border: `1.5px solid ${dot.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: dot.border }}>
                              {dot.icon}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#8070A8', fontWeight: 300, lineHeight: 1.3 }}>{t.content}</p>
                            <span style={{ fontSize: '0.65rem', color: dot.border }}>{t.status === 'finalizada' ? 'Finalizada' : t.status === 'en_proceso' ? 'En proceso' : 'Pendiente'}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer — agregar miembro (solo admin) */}
              {miRol === 'admin' && (
                <div style={{ padding: '1rem 1.5rem', borderTop: '0.5px solid #E8E4F4', flexShrink: 0 }}>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', color: '#B0A0C0', fontWeight: 400 }}>Agregar miembro</p>
                  <div style={{ position: 'relative' }}>
                    <input value={collabBusqueda} onChange={e => buscarColaboradores(e.target.value)}
                      placeholder="@usuario o nombre..."
                      style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '10px', border: '0.5px solid #E4DCF4', backgroundColor: '#F6F4FB', fontSize: '0.85rem', color: '#2F2840', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    {collabBuscando && <p style={{ color: '#B0A0C0', fontSize: '0.75rem', margin: '4px 0 0' }}>Buscando...</p>}
                    {collabResultados.length > 0 && (
                      <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF', border: '0.5px solid #E4DCF4', borderRadius: '10px', boxShadow: '0 -8px 24px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden', marginBottom: '4px' }}>
                        {collabResultados.map(u => (
                          <div key={u._id} style={{ padding: '0.55rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '0.5px solid #F0EBF8' }}>
                            <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#E0D8F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#8070C8', fontWeight: 600, flexShrink: 0 }}>
                              {u.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: '#2F2840', fontWeight: 400 }}>{u.nombre} {u.apellido}</p>
                              <p style={{ margin: 0, fontSize: '0.68rem', color: '#B0A0C0' }}>@{u.username}</p>
                            </div>
                            <select defaultValue="" onChange={e => e.target.value && agregarColaborador(u, e.target.value)}
                              style={{ padding: '2px 5px', borderRadius: '6px', border: '0.5px solid #E4DCF4', fontSize: '0.75rem', color: '#2F2840', cursor: 'pointer', outline: 'none' }}>
                              <option value="" disabled>Rol...</option>
                              <option value="editor">Editor</option>
                              <option value="revisor">Revisor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* ── MODAL COMPLETAR PROYECTO ── */}
      {completarConfirm && (
        <Modal onClose={() => setCompletarConfirm(false)}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 300, color: '#2F2840', margin: '0 0 0.75rem' }}>
            {noteEstado === 'completado' ? 'Reabrir proyecto' : 'Completar proyecto'}
          </h2>
          <p style={{ color: '#B0A0C0', fontSize: '0.875rem', margin: '0 0 1.5rem', fontWeight: 300 }}>
            {noteEstado === 'completado'
              ? '¿Quieres reabrir este proyecto y marcarlo como en progreso?'
              : '¿Confirmas que quieres marcar este proyecto como completado?'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setCompletarConfirm(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: '0.5px solid #E4DCF4', backgroundColor: 'transparent', color: '#B0A0C0', cursor: 'pointer' }}>Cancelar</button>
            <button onClick={completarNota} style={{ padding: '0.65rem 1.25rem', borderRadius: '10px', border: 'none', backgroundColor: noteEstado === 'completado' ? '#7090B8' : '#8070C8', color: '#FFFFFF', cursor: 'pointer' }}>
              {noteEstado === 'completado' ? 'Reabrir' : 'Completar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
