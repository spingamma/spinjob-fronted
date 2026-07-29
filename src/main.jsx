import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 👈 El semáforo mágico
import { GoogleOAuthProvider } from '@react-oauth/google'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

// Capturar el evento de instalación lo antes posible para evitar perderlo al navegar
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPromptEvent = e;
});

// Se asume que el CLIENT ID se definirá en el env o en su defecto un placeholder
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "EL_CLIENT_ID_DE_GOOGLE";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={clientId}>
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
)