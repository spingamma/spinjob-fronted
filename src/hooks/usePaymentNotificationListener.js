import { useEffect } from 'react';
import { playCashRegisterSound, initAudioUnlock } from '../utils/soundEffects';

/**
 * Global hook to listen for incoming payment Web Push notifications
 * from the Service Worker and trigger the cash register sound effect.
 */
export function usePaymentNotificationListener() {
  useEffect(() => {
    // Prepare audio context for instant playback upon user gesture
    initAudioUnlock();

    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleMessage = (event) => {
      if (!event.data) return;

      if (event.data.type === 'PUSH_PAYMENT_RECEIVED') {
        // Play cash register sound
        playCashRegisterSound();

        // Dispatch a custom window event for pages (like BusinessOrders) to auto-reload
        window.dispatchEvent(
          new CustomEvent('tarjetoso:payment-received', {
            detail: event.data.data
          })
        );
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);
}
