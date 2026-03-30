// Archivo: src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

window.onerror = function(message) {
  if (message.includes('initialization') || message.includes('loading chunk')) {
    console.warn("Detectado error de caché. Limpiando Service Workers...");
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
      }
      // Forzar recarga limpia desde el servidor
      window.location.reload(true);
    });
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)