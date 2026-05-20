import type { PresenceUser, ActiveLock } from '../../services/collaboration.service';

interface CollaborationBarProps {
  connected: boolean;
  roomReady?: boolean;
  joinError?: string | null;
  presencia: PresenceUser[];
  locks: ActiveLock[];
  drawingLock?: ActiveLock;
  lockMsg?: string | null;
  esColaborativa?: boolean;
}

export function CollaborationBar({
  connected,
  roomReady,
  joinError,
  presencia,
  locks,
  drawingLock,
  lockMsg,
  esColaborativa,
}: CollaborationBarProps) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = String(user.id || user._id || '');
  const otros = presencia.filter(p => p.userId && String(p.userId) !== currentUserId);

  const boardLocks = locks.filter(l => l.resourceType === 'board');
  const statusColor = joinError || lockMsg
    ? '#F87171'
    : roomReady
      ? '#34D399'
      : connected
        ? '#F59E0B'
        : '#9CA3AF';

  const statusText = joinError
    ? joinError
    : lockMsg
      ? lockMsg
      : roomReady
        ? (esColaborativa ? 'En vivo' : 'Sincronizado')
        : connected
          ? 'Conectando...'
          : 'Offline';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 10px',
        borderRadius: '20px',
        backgroundColor: 'var(--highlight-bg)',
        border: '0.5px solid var(--card-border)',
        marginRight: '8px',
        maxWidth: '420px',
      }}
    >
      <span
        title={statusText}
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: statusColor,
          flexShrink: 0,
        }}
      />
      <span style={{
        fontSize: '0.72rem',
        color: joinError || lockMsg ? '#C04060' : 'var(--muted-fg)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '180px',
      }}>
        {statusText}
      </span>

      {drawingLock && drawingLock.holderId !== currentUserId && (
        <span style={{ fontSize: '0.68rem', color: '#8070C8', whiteSpace: 'nowrap' }}>
          ✏️ {drawingLock.holderNombre}
        </span>
      )}

      {otros.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {otros.slice(0, 5).map(p => (
            <span
              key={p.socketId}
              title={p.nombre || 'Colaborador'}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#fff',
                fontSize: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: -4,
              }}
            >
              {(p.nombre || '?').slice(0, 2).toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {boardLocks.length > 0 && (
        <span style={{ fontSize: '0.65rem', color: 'var(--muted-fg)', whiteSpace: 'nowrap' }} title="Elementos bloqueados">
          🔒 {boardLocks.length}
        </span>
      )}
    </div>
  );
}

