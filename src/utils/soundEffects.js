// Utility for synthesized and responsive sound effects in Tarjetoso
let sharedAudioContext = null;
let isAudioUnlocked = false;

/**
 * Returns the singleton AudioContext, creating it if needed.
 */
function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioCtx();
  }

  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume().catch(() => {});
  }

  return sharedAudioContext;
}

/**
 * Unlocks the Web Audio context on the first user interaction (click, touch, keydown)
 * to comply with browser Autoplay policies (especially Safari iOS and Chrome).
 */
export function initAudioUnlock() {
  if (typeof window === 'undefined' || isAudioUnlocked) return;

  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          isAudioUnlocked = true;
        }).catch(() => {});
      } else {
        isAudioUnlocked = true;
      }
    }
    window.removeEventListener('click', unlock, true);
    window.removeEventListener('touchstart', unlock, true);
    window.removeEventListener('keydown', unlock, true);
  };

  window.addEventListener('click', unlock, { once: true, capture: true });
  window.addEventListener('touchstart', unlock, { once: true, capture: true });
  window.addEventListener('keydown', unlock, { once: true, capture: true });
}

/**
 * Plays a crisp cash register "cha-ching" sound (~0.4s) using the Web Audio API.
 * Uses dual chime harmonics and mechanical attack for instant, zero-latency feedback.
 */
export function playCashRegisterSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return false;

    // Trigger vibration on supported devices (Android)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([250, 100, 250, 100, 500]);
      } catch {
        // Ignore vibration errors if blocked
      }
    }

    const now = ctx.currentTime;

    // --- 1. Mechanical Clink ("Cha" - 0.0s to 0.08s) ---
    const clinkOsc = ctx.createOscillator();
    const clinkGain = ctx.createGain();
    clinkOsc.type = 'triangle';
    clinkOsc.frequency.setValueAtTime(987.77, now); // B5 note
    clinkOsc.frequency.exponentialRampToValueAtTime(800, now + 0.06);

    clinkGain.gain.setValueAtTime(0.25, now);
    clinkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    clinkOsc.connect(clinkGain);
    clinkGain.connect(ctx.destination);

    clinkOsc.start(now);
    clinkOsc.stop(now + 0.08);

    // --- 2. Cash Register Bell Chime ("Ching!" - 0.07s to 0.42s) ---
    const bellTime = now + 0.07;
    const bellOsc1 = ctx.createOscillator();
    const bellOsc2 = ctx.createOscillator();
    const bellGain = ctx.createGain();

    // Primary bell tone (E6 ~1318.5 Hz) and high metallic overtone (E7 ~2637 Hz)
    bellOsc1.type = 'sine';
    bellOsc1.frequency.setValueAtTime(1318.5, bellTime);

    bellOsc2.type = 'sine';
    bellOsc2.frequency.setValueAtTime(2637.0, bellTime);

    // Shimmer envelope (~0.35s decay)
    bellGain.gain.setValueAtTime(0.001, bellTime);
    bellGain.gain.linearRampToValueAtTime(0.4, bellTime + 0.015);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, bellTime + 0.35);

    bellOsc1.connect(bellGain);
    bellOsc2.connect(bellGain);
    bellGain.connect(ctx.destination);

    bellOsc1.start(bellTime);
    bellOsc2.start(bellTime);
    bellOsc1.stop(bellTime + 0.36);
    bellOsc2.stop(bellTime + 0.36);

    return true;
  } catch (err) {
    console.warn('[SoundEffects] Could not play cash sound:', err);
    return false;
  }
}
