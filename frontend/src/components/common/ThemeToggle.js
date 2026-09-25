import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ size = 'default' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizes = {
    small:   { btn: 32, icon: 16, track: 48, trackH: 24 },
    default: { btn: 36, icon: 18, track: 56, trackH: 28 },
    large:   { btn: 40, icon: 20, track: 64, trackH: 32 },
  };

  const s = sizes[size] || sizes.default;

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        position: 'relative',
        width: s.track,
        height: s.trackH,
        borderRadius: s.trackH,
        background: isDark
          ? 'linear-gradient(135deg, #1e3a5f, #0f172a)'
          : 'linear-gradient(135deg, #60a5fa, #3b82f6)',
        border: `2px solid ${isDark ? '#2a3f5f' : '#93c5fd'}`,
        cursor: 'pointer',
        padding: 0,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
      }}
    >
      {isDark && (
        <>
          <div style={{
            position: 'absolute', width: 2, height: 2, borderRadius: '50%',
            background: 'white', top: 5, left: 8, opacity: 0.7,
            animation: 'pulse 2s ease infinite',
          }} />
          <div style={{
            position: 'absolute', width: 1.5, height: 1.5, borderRadius: '50%',
            background: 'white', top: 10, left: 14, opacity: 0.5,
            animation: 'pulse 3s ease infinite 0.5s',
          }} />
          <div style={{
            position: 'absolute', width: 2, height: 2, borderRadius: '50%',
            background: 'white', bottom: 6, left: 10, opacity: 0.6,
            animation: 'pulse 2.5s ease infinite 1s',
          }} />
        </>
      )}

      <div style={{
        position: 'absolute',
        top: 2,
        left: isDark ? `${s.track - s.trackH + 2}px` : '2px',
        width: s.trackH - 6,
        height: s.trackH - 6,
        borderRadius: '50%',
        background: isDark ? '#f8fafc' : '#fef3c7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        boxShadow: isDark
          ? '0 0 8px rgba(248, 250, 252, 0.3)'
          : '0 0 8px rgba(251, 191, 36, 0.4)',
      }}>
        <span className="material-icons-outlined" style={{
          fontSize: s.icon,
          color: isDark ? '#334155' : '#f59e0b',
          transition: 'transform 0.4s ease, color 0.3s ease',
          transform: isDark ? 'rotate(360deg)' : 'rotate(0deg)',
        }}>
          {isDark ? 'dark_mode' : 'light_mode'}
        </span>
      </div>
    </button>
  );
}
