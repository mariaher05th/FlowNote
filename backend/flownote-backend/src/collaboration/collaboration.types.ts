/** Sala de colaboración: siempre ligada a una nota o un espacio */
export type RoomType = 'nota' | 'espacio';

export interface RoomRef {
  roomType: RoomType;
  roomId: string;
}

/** Tipos de recurso bloqueables en tiempo real */
export type LockResourceType =
  | 'board'
  | 'flow_node'
  | 'flow_edge'
  | 'widget'
  | 'note_title'
  | 'note_content'
  | 'note_metadata'
  | 'drawing_canvas'
  | 'drawing_stroke'
  | 'comment'
  | 'comment_anchor';

export const LOCK_RESOURCE_TYPES: LockResourceType[] = [
  'board',
  'flow_node',
  'flow_edge',
  'widget',
  'note_title',
  'note_content',
  'note_metadata',
  'drawing_canvas',
  'drawing_stroke',
  'comment',
  'comment_anchor',
];

/** Eventos WS que el cliente puede emitir / escuchar */
export const COLLABORATION_EVENTS = {
  // Sistema
  connected: 'connected',
  joined: 'joined',
  join_result: 'join_result',
  join_denied: 'join_denied',
  left: 'left',
  presence_joined: 'presence_joined',
  presence_left: 'presence_left',
  presence: 'presence',
  locks_snapshot: 'locks_snapshot',
  // Locks
  lock_granted: 'lock_granted',
  lock_result: 'lock_result',
  lock_denied: 'lock_denied',
  lock_acquired: 'lock_acquired',
  lock_released: 'lock_released',
  lock_renewed: 'lock_renewed',
  lock_expired: 'lock_expired',
  locks_released: 'locks_released',
  // Nota
  note_updated: 'note_updated',
  note_cursor: 'note_cursor',
  // Kanban / estado
  kanban_updated: 'kanban_updated',
  // Dibujo / canvas
  drawing_updated: 'drawing_updated',
  drawing_stroke_added: 'drawing_stroke_added',
  drawing_cleared: 'drawing_cleared',
  // Comentarios
  comment_added: 'comment_added',
  comment_updated: 'comment_updated',
  comment_deleted: 'comment_deleted',
  // Flujo y widgets
  flow_updated: 'flow_updated',
  widget_updated: 'widget_updated',
} as const;
