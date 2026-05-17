import { useState, useRef, useEffect } from 'react';
import { THEMES, useTheme } from './context/ThemeContext';

export function ThemePicker() {
  const { themeId, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cierra el popover al hacer click fuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = THEMES.find(t => t.id === themeId) ?? THEMES[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Botón que vive en el sidebar */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Cambiar tema"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '0.625rem 1rem',
          borderRadius: '10px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: open ? 'var(--sidebar-active-bg)' : 'transparent',
          color: open ? 'var(--sidebar-active-fg)' : 'var(--sidebar-inactive-fg)',
          fontSize: '0.9375rem',
          fontWeight: open ? 400 : 300,
          textAlign: 'left',
          transition: 'background 0.15s, color 0.15s',
        }}
      >
        {/* Mini preview del tema activo */}
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          flexShrink: 0,
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
        }}>
          {current.preview.map((color, i) => (
            <div key={i} style={{ flex: 1, backgroundColor: color }} />
          ))}
        </div>
        <span>Tema</span>
        <span style={{
          marginLeft: 'auto',
          fontSize: '0.7rem',
          opacity: 0.6,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          display: 'inline-block',
        }}>▼</span>
      </button>

      {/* Popover */}
      {open && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          backgroundColor: 'var(--card-bg)',
          border: '0.5px solid var(--card-border)',
          borderRadius: '16px',
          padding: '1rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          zIndex: 100,
          animation: 'fadeUp 0.15s ease',
        }}>
          <p style={{
            margin: '0 0 10px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--muted-fg)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Paleta de colores
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {THEMES.map(theme => {
              const isActive = theme.id === themeId;
              return (
                <button
                  key={theme.id}
                  onClick={() => { setTheme(theme.id); setOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'var(--highlight-bg)' : 'transparent',
                    transition: 'background 0.12s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'var(--highlight-bg)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  {/* Círculo de preview */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    flexShrink: 0,
                    boxShadow: isActive
                      ? '0 0 0 2px var(--primary), 0 0 0 4px var(--card-bg)'
                      : '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'box-shadow 0.15s',
                  }}>
                    {theme.preview.map((color, i) => (
                      <div key={i} style={{ flex: 1, backgroundColor: color }} />
                    ))}
                  </div>

                  <span style={{
                    fontSize: '0.875rem',
                    color: isActive ? 'var(--card-title)' : 'var(--subtle-fg)',
                    fontWeight: isActive ? 500 : 300,
                  }}>
                    {theme.name}
                  </span>

                  {isActive && (
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: '0.75rem',
                      color: 'var(--primary)',
                      fontWeight: 500,
                    }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}