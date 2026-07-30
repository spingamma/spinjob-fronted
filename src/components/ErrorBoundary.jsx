// Archivo: src/components/ErrorBoundary.jsx
// Captura crashes de React y muestra una UI de fallback amigable
// en lugar de pantalla en blanco.

import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Crash capturado:', error, info.componentStack);
  }

  handleReload = async () => {
    try {
      // 1. Limpiar Service Workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }
      // 2. Limpiar Caches Storage
      if ('caches' in window) {
        const keys = await caches.keys();
        for (let key of keys) {
          await caches.delete(key);
        }
      }
      // 3. Limpiar Local Storage y Session Storage (opcional, pero ayuda, aunque no borraremos el token para no desloguear agresivamente a menos que sea necesario)
      // Mejor solo borramos el caché de assets.
    } catch (e) {
      console.error('Error limpiando caches:', e);
    }
    
    this.setState({ hasError: false, error: null });
    // Force reload bypassing cache
    window.location.reload(true);
  };

  render() {
    if (!this.state.hasError) return this.props.children;

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
        data-testid="error-boundary"
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1 style={{ color: '#1A535C', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
          Algo salió mal
        </h1>
        <p style={{ color: '#757778', maxWidth: '400px', margin: '0 0 1.5rem' }}>
          Ocurrió un error inesperado. Por favor, recarga la página o vuelve al inicio.
        </p>
        <button
          onClick={this.handleReload}
          data-testid="error-boundary-reload-btn"
          style={{
            background: '#1A535C',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem 1.5rem',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.95rem',
          }}
        >
          Recargar página
        </button>
      </div>
    );
  }
}
