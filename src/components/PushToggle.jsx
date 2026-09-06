import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, BellOff } from 'lucide-react';
import fetchAuth from '../utils/fetchAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  if (!base64String) return new Uint8Array();
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PushToggle = ({ className }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSoftPrompt, setShowSoftPrompt] = useState(false);

  const checkSubscription = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkSubscription();
  }, []);

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || typeof Notification === 'undefined') {
        alert("Tu dispositivo o navegador no soporta notificaciones Push.");
        return;
      }
      setShowSoftPrompt(true);
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetchAuth(`${API_URL}/usuarios/push/unsubscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: 'POST'
        });
        setIsSubscribed(false);
      }
    } catch (e) {
      console.error("Error unsubscribing", e);
    }
  };

  const subscribe = async () => {
    setShowSoftPrompt(false);
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      const subJSON = subscription.toJSON();
      await fetchAuth(`${API_URL}/usuarios/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint: subJSON.endpoint,
          keys: subJSON.keys
        })
      });
      
      setIsSubscribed(true);
    } catch (e) {
      console.error("Error subscribing", e);
      if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
        alert("Las notificaciones están bloqueadas en tu navegador. Por favor, habilítalas en la configuración de permisos.");
      } else {
        alert("No se pudieron activar las notificaciones. Es posible que tu dispositivo no lo soporte.");
      }
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className={className || "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-primary hover:bg-gray-50 rounded-xl transition-colors"}
      >
        {isSubscribed ? <Bell size={18} className="text-secondary" /> : <BellOff size={18} className="text-gray-400" />}
        <span>Notificaciones</span>
      </button>

      {showSoftPrompt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Bell size={24} className="text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-center text-primary mb-2">Notificaciones de Pedidos</h3>
            <p className="text-sm text-center text-gray-600 mb-6">
              Activa las notificaciones para saber cuando tienes pedidos nuevos. 
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSoftPrompt(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Bloquear
              </button>
              <button
                onClick={subscribe}
                className="flex-1 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Permitir
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default PushToggle;
