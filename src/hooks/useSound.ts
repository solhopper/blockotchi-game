import { useCallback } from "react";

type SoundType = "feed" | "play" | "sleep" | "evolve" | "click" | "coin";

let sharedAudioContext: AudioContext | null = null;
const scheduledTimeouts = new Set<number>();
let listenersRegistered = false;

function clearScheduledTimeouts() {
  for (const id of scheduledTimeouts) {
    clearTimeout(id);
  }
  scheduledTimeouts.clear();
}

async function suspendAudio() {
  if (sharedAudioContext && sharedAudioContext.state === "running") {
    await sharedAudioContext.suspend();
  }
}

async function resumeAudio() {
  if (sharedAudioContext && sharedAudioContext.state === "suspended") {
    await sharedAudioContext.resume();
  }
}

function ensureLifecycleListeners() {
  if (listenersRegistered) return;
  listenersRegistered = true;

  const handleHidden = async () => {
    clearScheduledTimeouts();
    try {
      await suspendAudio();
    } catch {
      // ignore
    }
  };

  const handleVisible = async () => {
    try {
      await resumeAudio();
    } catch {
      // ignore
    }
  };

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      void handleHidden();
    } else {
      void handleVisible();
    }
  });

  window.addEventListener("pagehide", () => {
    void handleHidden();
  });
}

export const useSound = () => {
  const getAudioContext = useCallback(() => {
    ensureLifecycleListeners();
    if (!sharedAudioContext) {
      sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return sharedAudioContext;
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = "square",
    volume: number = 0.3
  ) => {
    if (document.hidden) return;
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [getAudioContext]);

  const playSequence = useCallback((
    notes: { freq: number; duration: number; delay: number }[],
    type: OscillatorType = "square",
    volume: number = 0.3
  ) => {
    notes.forEach(({ freq, duration, delay }) => {
      if (document.hidden) return;
      const id = window.setTimeout(() => {
        scheduledTimeouts.delete(id);
        playTone(freq, duration, type, volume);
      }, delay * 1000);
      scheduledTimeouts.add(id);
    });
  }, [playTone]);

  const playSound = useCallback((sound: SoundType) => {
    if (document.hidden) return;
    switch (sound) {
      case "feed":
        // Munching sound - quick alternating notes
        playSequence([
          { freq: 200, duration: 0.08, delay: 0 },
          { freq: 250, duration: 0.08, delay: 0.1 },
          { freq: 200, duration: 0.08, delay: 0.2 },
          { freq: 300, duration: 0.15, delay: 0.3 },
        ], "square", 0.2);
        break;

      case "play":
        // Happy playful melody
        playSequence([
          { freq: 523, duration: 0.1, delay: 0 },
          { freq: 659, duration: 0.1, delay: 0.1 },
          { freq: 784, duration: 0.1, delay: 0.2 },
          { freq: 1047, duration: 0.2, delay: 0.3 },
        ], "square", 0.25);
        break;

      case "sleep":
        // Gentle lullaby descending notes
        playSequence([
          { freq: 440, duration: 0.3, delay: 0 },
          { freq: 392, duration: 0.3, delay: 0.35 },
          { freq: 349, duration: 0.4, delay: 0.7 },
        ], "triangle", 0.15);
        break;

      case "evolve":
        // Epic level-up fanfare
        playSequence([
          { freq: 262, duration: 0.15, delay: 0 },
          { freq: 330, duration: 0.15, delay: 0.15 },
          { freq: 392, duration: 0.15, delay: 0.3 },
          { freq: 523, duration: 0.3, delay: 0.45 },
          { freq: 659, duration: 0.15, delay: 0.75 },
          { freq: 784, duration: 0.4, delay: 0.9 },
        ], "square", 0.3);
        break;

      case "click":
        // Quick button click
        playTone(800, 0.05, "square", 0.15);
        break;

      case "coin":
        // Coin collect sound
        playSequence([
          { freq: 988, duration: 0.1, delay: 0 },
          { freq: 1319, duration: 0.15, delay: 0.1 },
        ], "square", 0.2);
        break;
    }
  }, [playTone, playSequence]);

  return { playSound };
};
