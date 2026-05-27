export type RoomType = 'nota' | 'espacio';

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

export const COLLAB_EVENTS = {
  connected: 'connected',
  joined: 'joined',
  joinResult: 'join_result',
  noteUpdated: 'note_updated',
  drawingUpdated: 'drawing_updated',
  drawingStroke: 'drawing_stroke_added',
  drawingCleared: 'drawing_cleared',
  commentAdded: 'comment_added',
  commentUpdated: 'comment_updated',
  commentDeleted: 'comment_deleted',
  presenceJoined: 'presence_joined',
  presenceLeft: 'presence_left',
  lockAcquired: 'lock_acquired',
  lockReleased: 'lock_released',
  lockResult: 'lock_result',
  lockDenied: 'lock_denied',
  board_cursor: 'board_cursor',
} as const;
