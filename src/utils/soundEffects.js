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
 * Plays the official cash register sound of Tarjetoso (Variación C2: Cascada con Remate de Moneda de Oro).
 * Synthesizes 4 organic physical layers via Web Audio API (with automatic fallback to /sounds/cash-register.wav):
 *  1. Smooth mechanical cash drawer sliding open (0.00s - 0.10s)
 *  2. Fluid wave of silver coins sliding along the till (0.04s - 0.27s)
 *  3. Heavy gold coin settling in the center ("Plink!", 0.28s)
 *  4. Shimmering vintage brass bell chime in B6 with acoustic beating (~1.25s sustain)
 */
export function playCashRegisterSound(options = {}) {
  const volume = (typeof options === 'object' && options !== null && typeof options.volume === 'number')
    ? options.volume
    : 1.0;
  const clampedVolume = Math.max(0, Math.min(1.5, volume));

  // Trigger rhythmic haptic feedback on supported mobile devices
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([150, 60, 200, 80, 450]);
    } catch {
      // Ignore vibration errors if blocked
    }
  }

  try {
    const ctx = getAudioContext();
    if (!ctx) {
      playAudioFallback(clampedVolume);
      return true;
    }

    const now = ctx.currentTime;

    // Master gain staging
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85 * clampedVolume, now);
    masterGain.connect(ctx.destination);

    // =========================================================================
    // LAYER 1: Gaveta de Caja Registradora Rodando hacia afuera (0.00s - 0.10s)
    // =========================================================================
    const drawerOsc = ctx.createOscillator();
    const drawerGain = ctx.createGain();
    drawerOsc.type = 'sine';
    drawerOsc.frequency.setValueAtTime(600, now);
    drawerOsc.frequency.exponentialRampToValueAtTime(180, now + 0.10);

    drawerGain.gain.setValueAtTime(0.35, now);
    drawerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);

    drawerOsc.connect(drawerGain);
    drawerGain.connect(masterGain);
    drawerOsc.start(now);
    drawerOsc.stop(now + 0.105);

    // Fricción de riel metálico
    const noiseLength = Math.floor(ctx.sampleRate * 0.08);
    const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
    const noiseChannel = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      const windowCurve = Math.sin((Math.PI * i) / noiseLength);
      noiseChannel[i] = (Math.random() * 2 - 1) * windowCurve;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1200, now);
    noiseFilter.Q.setValueAtTime(2.0, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start(now);
    noiseSource.stop(now + 0.085);

    // =========================================================================
    // LAYER 2: Cascada Fluida de Monedas Corriendo en el Cajón (0.04s - 0.27s)
    // =========================================================================
    const playCoin = (startTime, f1, f2, duration, coinVol) => {
      const coinGain = ctx.createGain();
      coinGain.gain.setValueAtTime(0.0001, now);
      coinGain.gain.setValueAtTime(coinVol, startTime);
      coinGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      coinGain.connect(masterGain);

      const oscA = ctx.createOscillator();
      oscA.type = 'sine';
      oscA.frequency.setValueAtTime(f1, startTime);
      oscA.connect(coinGain);
      oscA.start(startTime);
      oscA.stop(startTime + duration + 0.005);

      const oscB = ctx.createOscillator();
      oscB.type = 'sine';
      oscB.frequency.setValueAtTime(f2, startTime);
      oscB.connect(coinGain);
      oscB.start(startTime);
      oscB.stop(startTime + duration + 0.005);
    };

    // 6 impactos suaves progresivos de monedas en la bandeja
    playCoin(now + 0.04, 2900, 4350, 0.07, 0.28);
    playCoin(now + 0.08, 3300, 4950, 0.08, 0.35);
    playCoin(now + 0.12, 2800, 4200, 0.08, 0.42);
    playCoin(now + 0.16, 3500, 5250, 0.09, 0.45);
    playCoin(now + 0.21, 3100, 4650, 0.10, 0.48);
    playCoin(now + 0.26, 3600, 5400, 0.11, 0.40);

    // =========================================================================
    // LAYER 3: Remate de Moneda de Oro al final del deslizamiento ("Plink!", 0.28s)
    // =========================================================================
    const goldTime = now + 0.28;
    const goldGain = ctx.createGain();
    goldGain.gain.setValueAtTime(0.0001, now);
    goldGain.gain.setValueAtTime(0.48, goldTime);
    goldGain.gain.exponentialRampToValueAtTime(0.0001, goldTime + 0.25);
    goldGain.connect(masterGain);

    const goldOscA = ctx.createOscillator();
    goldOscA.type = 'sine';
    goldOscA.frequency.setValueAtTime(2616.26, goldTime); // C7 nota cristalina
    goldOscA.connect(goldGain);
    goldOscA.start(goldTime);
    goldOscA.stop(goldTime + 0.26);

    const goldOscB = ctx.createOscillator();
    goldOscB.type = 'sine';
    goldOscB.frequency.setValueAtTime(5232.50, goldTime); // Armónico C8
    goldOscB.connect(goldGain);
    goldOscB.start(goldTime);
    goldOscB.stop(goldTime + 0.26);

    // =========================================================================
    // LAYER 4: Campana de Bronce Vintage en B6 con Shimmer (~1.25s)
    // =========================================================================
    const bellTime = now + 0.09;
    const bellGain = ctx.createGain();
    bellGain.gain.setValueAtTime(0.0001, now);
    bellGain.gain.setValueAtTime(0.0001, bellTime);
    bellGain.gain.linearRampToValueAtTime(0.50, bellTime + 0.006);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, bellTime + 1.25);
    bellGain.connect(masterGain);

    const f0 = 1975.53; // B6
    const bellPartials = [
      { freq: f0, gain: 0.45 },
      { freq: f0 + 4.5, gain: 0.45 }, // Shimmer acústico de batido
      { freq: f0 * 2.0, gain: 0.30 }, // Octave ring (3951 Hz)
      { freq: f0 * 0.5, gain: 0.18 }  // Warm hum tone
    ];

    bellPartials.forEach((partial) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(partial.freq, bellTime);

      const partialGain = ctx.createGain();
      partialGain.gain.setValueAtTime(partial.gain, bellTime);
      osc.connect(partialGain);
      partialGain.connect(bellGain);

      osc.start(bellTime);
      osc.stop(bellTime + 1.28);
    });

    return true;
  } catch (err) {
    console.warn('[SoundEffects] Web Audio synthesis failed, using audio fallback:', err);
    playAudioFallback(clampedVolume);
    return true;
  }
}

/**
 * Fallback to pre-rendered HTML5 Audio asset if Web Audio context is unavailable
 */
function playAudioFallback(volume = 1.0) {
  try {
    const audio = new Audio('/sounds/cash-register.wav');
    audio.volume = Math.max(0, Math.min(1.0, volume));
    audio.play().catch(() => {});
  } catch {
    // Ignore fallback errors
  }
}
