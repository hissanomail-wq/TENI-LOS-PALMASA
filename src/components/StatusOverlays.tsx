import { useGameStore } from '../game/store';
import { liveState } from '../game/liveState';
import { PLAYER_START } from '../game/world';
import { sfxConfirm, sfxClick, stopSiren } from '../game/audio';
import { resetLiveState } from '../game/liveState';

function formatTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function GameOverOverlay() {
  const reason = useGameStore((s) => s.gameOverReason);
  const respawn = useGameStore((s) => s.respawn);
  const clearGameOver = useGameStore((s) => s.clearGameOver);
  const exitToMenu = useGameStore((s) => s.exitToMenu);

  if (!reason) return null;

  const handleRespawn = () => {
    sfxConfirm();
    stopSiren();
    respawn();
    clearGameOver();
    liveState.player.position.copy(PLAYER_START);
    liveState.controlledVehicleId = null;
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-950/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-red-500/30 bg-slate-950/95 p-6 text-center shadow-2xl">
        <h2 className="mb-2 text-3xl font-black italic text-red-400">ПРОВАЛ</h2>
        <p className="mb-6 text-slate-300">{reason}</p>
        <div className="flex flex-col gap-3">
          <button onClick={handleRespawn} className="rounded-lg bg-amber-500 py-3 font-bold text-slate-950 transition hover:bg-amber-400">
            Попробовать снова
          </button>
          <button
            onClick={() => {
              sfxClick();
              stopSiren();
              resetLiveState();
              exitToMenu();
            }}
            className="rounded-lg border border-white/15 bg-white/5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Главное меню
          </button>
        </div>
      </div>
    </div>
  );
}

export function EndScreenOverlay() {
  const endInfo = useGameStore((s) => s.endInfo);
  const dismissEnd = useGameStore((s) => s.dismissEnd);
  const exitToMenu = useGameStore((s) => s.exitToMenu);

  if (!endInfo) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-slate-950/95 p-7 text-center shadow-2xl">
        <div className="mb-1 text-sm uppercase tracking-widest text-amber-400">История завершена</div>
        <h2 className="mb-4 text-3xl font-black italic text-white">{endInfo.title}</h2>
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-xs text-slate-400">Заработано</div>
            <div className="text-xl font-bold text-emerald-400">${endInfo.money.toLocaleString('ru-RU')}</div>
          </div>
          <div className="rounded-lg bg-white/5 p-3">
            <div className="text-xs text-slate-400">Время</div>
            <div className="text-xl font-bold text-sky-400">{formatTime(endInfo.time)}</div>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              sfxConfirm();
              dismissEnd();
            }}
            className="rounded-lg bg-amber-500 py-3 font-bold text-slate-950 transition hover:bg-amber-400"
          >
            Свободная прогулка по городу
          </button>
          <button
            onClick={() => {
              sfxClick();
              resetLiveState();
              exitToMenu();
              dismissEnd();
            }}
            className="rounded-lg border border-white/15 bg-white/5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            Главное меню
          </button>
        </div>
      </div>
    </div>
  );
}
