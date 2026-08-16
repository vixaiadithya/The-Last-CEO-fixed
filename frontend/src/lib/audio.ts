// Shared Web Audio context for the whole app.
// Browsers start an AudioContext "suspended" until a user gesture. We attach
// capture-phase listeners at module load so the FIRST interaction anywhere
// (clicking "Enter", the intro, a key press) resumes it — long before the
// player reaches the 3D office.

let ctx: AudioContext | null = null;

export const getAudioCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
};

if (typeof window !== 'undefined') {
  const unlock = () => {
    const c = getAudioCtx();
    if (c && c.state === 'suspended') c.resume();
  };
  ['pointerdown', 'keydown', 'touchstart', 'click'].forEach((ev) =>
    window.addEventListener(ev, unlock, { capture: true })
  );
}
