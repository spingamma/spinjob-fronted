import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertTriangle, X } from 'lucide-react';
import fetchAuth from '../utils/fetchAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  if (!base64String) return new Uint8Array();
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function OwnerPushBanner() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setChecking(false);
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

      if (isIOS && !isStandalone) {
        setErrorMessage("En iPhone, añade Tarjetoso a tu pantalla de inicio (Compartir > Añadir a pantalla de inicio) para recibir alertas.");
        setLoading(false);
        return;
      }

      if (!('serviceWorker' in navigator) || !('PushManager' in window) || typeof Notification === 'undefined') {
        setErrorMessage("Tu navegador o dispositivo no soporta notificaciones push.");
        setLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.register('/sw.js');
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      const subJSON = sub.toJSON();
      await fetchAuth(`${API_URL}/usuarios/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subJSON.endpoint,
          keys: subJSON.keys
        })
      });

      setIsSubscribed(true);
      setJustSubscribed(true);
    } catch (err) {
      console.error(err);
      if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        setErrorMessage("Las notificaciones están bloqueadas. Habilítalas en los permisos del navegador.");
      } else {
        setErrorMessage("No se pudieron activar las notificaciones en este dispositivo.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) return null;

  // Si recién las activó, mostramos confirmación amigable
  if (justSubscribed) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-6 flex items-center justify-between gap-3 animate-in fade-in">
        <div className="flex items-center gap-2.5">
          <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
          <p className="text-xs font-semibold text-emerald-900">
            ¡Listo! Te avisaremos al instante cada vez que recibas un pedido.
          </p>
        </div>
        <button
          onClick={() => setJustSubscribed(false)}
          className="text-gray-400 hover:text-gray-600 p-1"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  // Si ya tiene notificaciones activas, no mostramos ningún banner para no ocupar espacio
  if (isSubscribed) {
    return null;
  }

  // Banner amigable y corto cuando NO las tiene activas
  return (
    <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-3.5 sm:p-4 mb-6 shadow-sm animate-in fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Bell size={18} />
          </div>
          <div>
            <h4 className="font-bold text-sm text-primary">Recibe tus pedidos al instante</h4>
            <p className="text-xs text-gray-600 mt-0.5">
              Activa las notificaciones para enterarte cuando alguien compre en tu negocio.
            </p>
          </div>
        </div>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="px-4 py-2 bg-btn-cta hover:bg-btn-cta/90 text-white font-bold text-xs rounded-xl transition-colors shadow-sm self-end sm:self-center whitespace-nowrap disabled:opacity-50"
        >
          {loading ? "Activando..." : "Activar notificaciones"}
        </button>
      </div>

      {errorMessage && (
        <div className="mt-2.5 text-xs bg-red-50 text-red-700 p-2 rounded-lg border border-red-200 flex items-start gap-2">
          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
