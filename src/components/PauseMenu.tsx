import { useState } from 'react';
import { useGameStore } from '../game/store';
import { resetLiveState } from '../game/liveState';
import { sfxClick, sfxConfirm, stopSiren } from '../game/audio';
import SettingsPanel from './SettingsPanel';
import ControlsPanel from './ControlsPanel';

type View = 'main' | 'settings' | 'controls';

export default function PauseMenu() {
  const [view, setView] = useState<View>('main');
  const setPaused = useGameStore((s) => s.setPaused);
  const exitToMenu = useGameStore((s) => s.exitToMenu);
  const respawn = useGameStore((s) => s.respawn);

  const resume = () => {
    sfxConfirm();
    setPaused(false);
  };

  const quitToMenu = () => {
    sfxClick();
    stopSiren();
    resetLiveState();
    exitToMenu();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {view === 'main' && (
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl">
          <h2 className="mb-6 text-center text-2xl font-black italic tracking-wide text-amber-400">Пауза</h2>
          <div className="flex flex-col gap-3">
            <button onClick={resume} className="rounded-lg bg-amber-500 py-3 font-bold text-slate-950 transition hover:bg-amber-400">
              Продолжить
            </button>
            <button
              onClick={() => {
                sfxClick();
                respawn();
                setPaused(false);
              }}
              className="rounded-lg border border-white/15 bg-white/5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Восстановить здоровье / сбросить розыск
            </button>
            <button
              onClick={() => {
                sfxClick();
                setView('controls');
              }}
              className="rounded-lg border border-white/15 bg-white/5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Управление
            </button>
            <button
              onClick={() => {
                sfxClick();
                setView('settings');
              }}
              className="rounded-lg border border-white/15 bg-white/5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Настройки
            </button>
            <button onClick={quitToMenu} className="rounded-lg border border-red-500/30 bg-red-500/10 py-3 font-semibold text-red-300 transition hover:bg-red-500/20">
              Выйти в главное меню
            </button>
          </div>
        </div>
      )}
      {view === 'settings' && <SettingsPanel onBack={() => setView('main')} />}
      {view === 'controls' && <ControlsPanel onBack={() => setView('main')} />}
    </div>
  );
}
