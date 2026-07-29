// Archivo: src/pages/NotFound.jsx
// Página 404 — Mostrada cuando el usuario navega a una ruta desconocida.

import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F8F9FA',
        padding: '2rem',
        fontFamily: 'Inter, sans-serif',
        textAlign: 'center',
      }}
      data-testid="not-found-page"
    >
      <div style={{ fontSize: '5rem', lineHeight: 1, marginBottom: '1rem' }}>🔍</div>
      <h1
        style={{ color: '#1A535C', fontSize: '4rem', fontWeight: 900, margin: '0 0 0.25rem' }}
        data-testid="not-found-code"
      >
        404
      </h1>
      <p style={{ color: '#757778', fontSize: '1.1rem', maxWidth: '400px', margin: '0 0 2rem' }}>
        La página que buscas no existe o fue movida.
      </p>
      <button
        onClick={() => navigate('/')}
        data-testid="not-found-home-btn"
        style={{
          background: '#F9842C',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          padding: '0.85rem 2rem',
          fontWeight: 700,
          cursor: 'pointer',
          fontSize: '1rem',
          transition: 'opacity 0.2s',
        }}
        onMouseOver={e => (e.target.style.opacity = '0.85')}
        onMouseOut={e => (e.target.style.opacity = '1')}
      >
        Ir al directorio
      </button>
    </div>
  );
}
