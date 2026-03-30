// Archivo: src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// 🚀 LIMPIEZA DE SERVICE WORKER EN CASO DE BUCLE O ERROR
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      // Si el dominio cambió o hay error de carga, forzamos actualización
      registration.update();
    }
  });
}

// Capturar errores de carga de trozos (chunks) para limpiar caché
window.addEventListener('error', (e) => {
  if (e.message.includes('Loading chunk') || e.message.includes('initialization')) {
    console.warn("Error de inicialización detectado. Limpiando...");
    location.reload(true);
  }
}, true);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)