import { useGameStore } from './store';

let ctx: AudioContext | null = null;

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function envGain(base: number, kind: 'sfx' | 'music') {
  const s = useGameStore.getState().settings;
  const vol = kind === 'sfx' ? s.sfxVolume : s.musicVolume;
  return base * vol * s.masterVolume;
}

export function playTone(freq: number, duration = 0.15, type: OscillatorType = 'sine', gainMul = 0.2) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = envGain(gainMul, 'sfx');
    osc.connect(gain);
    gain.connect(c.destination);
    const now = c.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch {
    /* ignore audio errors */
  }
}

export function sfxClick() {
  playTone(520, 0.08, 'triangle', 0.25);
}
export function sfxConfirm() {
  playTone(660, 0.12, 'triangle', 0.3);
  setTimeout(() => playTone(880, 0.14, 'triangle', 0.25), 90);
}
export function sfxCash() {
  playTone(988, 0.08, 'square', 0.2);
  setTimeout(() => playTone(1318, 0.1, 'square', 0.2), 80);
}
export function sfxAlert() {
  playTone(220, 0.25, 'sawtooth', 0.3);
}
export function sfxHit() {
  playTone(120, 0.15, 'sawtooth', 0.35);
}
export function sfxEngine() {
  playTone(90, 0.1, 'square', 0.05);
}

let sirenInterval: ReturnType<typeof setInterval> | null = null;
export function startSiren() {
  if (sirenInterval) return;
  let hi = false;
  sirenInterval = setInterval(() => {
    playTone(hi ? 880 : 660, 0.28, 'sine', 0.12);
    hi = !hi;
  }, 300);
}
export function stopSiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
}
