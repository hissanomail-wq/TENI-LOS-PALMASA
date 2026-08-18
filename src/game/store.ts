import { create } from 'zustand';

export interface Settings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  sensitivity: number;
  invertY: boolean;
  quality: 'low' | 'medium' | 'high';
  showFps: boolean;
}

const SETTINGS_KEY = 'shadows-city-settings-v1';

const defaultSettings: Settings = {
  masterVolume: 0.8,
  musicVolume: 0.6,
  sfxVolume: 0.8,
  sensitivity: 1,
  invertY: false,
  quality: 'high',
  showFps: false,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

function saveSettings(s: Settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export interface DialogLine {
  speaker: string;
  text: string;
}

export interface Marker {
  id: string;
  position: [number, number, number];
  radius: number;
  color: string;
  label: string;
}

export type Screen = 'menu' | 'settings' | 'controls' | 'game';

interface EndInfo {
  title: string;
  money: number;
  time: number;
}

interface GameStore {
  screen: Screen;
  paused: boolean;
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;

  sessionStarted: boolean;
  missionStage: number;
  objective: string;
  objectiveHint: string;
  marker: Marker | null;
  money: number;
  wantedLevel: number;
  health: number;
  inVehicle: boolean;
  dialog: { queue: DialogLine[]; index: number } | null;
  banner: string | null;
  interactPrompt: string | null;
  gameOverReason: string | null;
  endInfo: EndInfo | null;
  sessionStartTime: number;

  goToScreen: (s: Screen) => void;
  setPaused: (p: boolean) => void;

  startNewGame: () => void;
  exitToMenu: () => void;
  respawn: () => void;

  setMissionStage: (n: number, objective: string, marker: Marker | null, hint?: string) => void;
  addMoney: (n: number) => void;
  setWanted: (n: number) => void;
  addHealth: (delta: number) => void;
  setInVehicle: (b: boolean) => void;
  showDialog: (lines: DialogLine[]) => void;
  advanceDialog: () => void;
  showBanner: (t: string) => void;
  setInteractPrompt: (s: string | null) => void;
  triggerGameOver: (reason: string) => void;
  finishGame: (title: string) => void;
  dismissEnd: () => void;
  clearGameOver: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'menu',
  paused: false,
  settings: loadSettings(),
  updateSettings: (s) =>
    set((state) => {
      const merged = { ...state.settings, ...s };
      saveSettings(merged);
      return { settings: merged };
    }),

  sessionStarted: false,
  missionStage: 0,
  objective: '',
  objectiveHint: '',
  marker: null,
  money: 500,
  wantedLevel: 0,
  health: 100,
  inVehicle: false,
  dialog: null,
  banner: null,
  interactPrompt: null,
  gameOverReason: null,
  endInfo: null,
  sessionStartTime: 0,

  goToScreen: (s) => set({ screen: s }),
  setPaused: (p) => set({ paused: p }),

  startNewGame: () =>
    set({
      screen: 'game',
      paused: false,
      sessionStarted: true,
      missionStage: 0,
      objective: '',
      objectiveHint: '',
      marker: null,
      money: 500,
      wantedLevel: 0,
      health: 100,
      inVehicle: false,
      dialog: null,
      banner: null,
      interactPrompt: null,
      gameOverReason: null,
      endInfo: null,
      sessionStartTime: Date.now(),
    }),

  exitToMenu: () =>
    set({
      screen: 'menu',
      paused: false,
      sessionStarted: false,
    }),

  respawn: () =>
    set({
      health: 100,
      wantedLevel: 0,
      gameOverReason: null,
      paused: false,
    }),

  setMissionStage: (n, objective, marker, hint) =>
    set({ missionStage: n, objective, marker, objectiveHint: hint ?? '' }),

  addMoney: (n) => set((s) => ({ money: Math.max(0, s.money + n) })),
  setWanted: (n) => set({ wantedLevel: Math.max(0, Math.min(5, n)) }),
  addHealth: (delta) =>
    set((s) => {
      const h = Math.max(0, Math.min(100, s.health + delta));
      return { health: h };
    }),
  setInVehicle: (b) => set({ inVehicle: b }),

  showDialog: (lines) => set({ dialog: { queue: lines, index: 0 }, paused: false }),
  advanceDialog: () =>
    set((s) => {
      if (!s.dialog) return {};
      const nextIndex = s.dialog.index + 1;
      if (nextIndex >= s.dialog.queue.length) return { dialog: null };
      return { dialog: { ...s.dialog, index: nextIndex } };
    }),

  showBanner: (t) => {
    set({ banner: t });
    setTimeout(() => {
      if (get().banner === t) set({ banner: null });
    }, 3200);
  },

  setInteractPrompt: (s) => set({ interactPrompt: s }),

  triggerGameOver: (reason) => set({ gameOverReason: reason }),

  finishGame: (title) =>
    set((s) => ({
      endInfo: { title, money: s.money, time: Date.now() - s.sessionStartTime },
    })),

  dismissEnd: () => set({ endInfo: null }),
  clearGameOver: () => set({ gameOverReason: null }),
}));
