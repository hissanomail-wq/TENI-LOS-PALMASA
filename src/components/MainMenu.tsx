import { useState } from 'react';
import { useGameStore } from '../game/store';
import { startStory } from '../game/missions';
import { resetLiveState } from '../game/liveState';
import { sfxConfirm, sfxClick } from '../game/audio';
import SettingsPanel from './SettingsPanel';
import ControlsPanel from './ControlsPanel';

type View = 'main' | 'settings' | 'controls';

export default function MainMenu() {
  const [view, setView] = useState<View>('main');
  const startNewGame = useGameStore((s) => s.startNewGame);

  const handleStart = () => {
    sfxConfirm();
    resetLiveState();
    startNewGame();
    setTimeout(() => startStory(), 400);
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/menu-bg.jpg')" }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/40" />

      <div className="relative z-10 flex w-full max-w-6xl items-center justify-between px-10">
        <div className="hidden max-w-md flex-col lg:flex">
          <span className="text-sm uppercase tracking-[0.4em] text-amber-400">Криминальная драма с открытым миром</span>
          <h1 className="mt-3 text-6xl font-black italic tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            ТЕНИ
            <br />
            <span className="text-amber-400">ЛОС-ПАЛЬМАСА</span>
          </h1>
          <p className="mt-4 text-slate-300">
            Алекс возвращается в родной город спустя пять лет. Старые связи, новые проблемы и одно крупное ограбление,
            которое изменит всё.
          </p>
        </div>

        <div className="w-full max-w-sm">
          {view === 'main' && (
            <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl backdrop-blur">
              <h1 className="mb-1 text-3xl font-black italic text-white lg:hidden">
                ТЕНИ <span className="text-amber-400">ЛОС-ПАЛЬМАСА</span>
              </h1>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  onClick={handleStart}
                  className="rounded-lg bg-amber-500 py-3 text-lg font-bold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:scale-[1.02] hover:bg-amber-400 active:scale-95"
                >
                  Новая игра
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
                <button
                  onClick={() => {
                    sfxClick();
                    window.alert('Спасибо за игру! Закройте вкладку, чтобы выйти.');
                  }}
                  className="rounded-lg border border-white/10 bg-transparent py-3 font-semibold text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
                >
                  Выход
                </button>
              </div>
              <p className="mt-5 text-center text-xs text-slate-500">v1.0 · Прототип открытого мира на Three.js</p>
            </div>
          )}
          {view === 'settings' && <SettingsPanel onBack={() => setView('main')} />}
          {view === 'controls' && <ControlsPanel onBack={() => setView('main')} />}
        </div>
      </div>
    </div>
  );
}
