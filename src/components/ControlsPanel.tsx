import { sfxClick } from '../game/audio';

const rows: [string, string][] = [
  ['W A S D', 'Движение / газ, тормоз, руль'],
  ['Shift', 'Бег (пешком)'],
  ['Мышь', 'Обзор камеры'],
  ['Клик по экрану', 'Захват курсора для обзора'],
  ['E', 'Сесть / выйти из машины, взаимодействие'],
  ['Удерживать E', 'Вскрыть хранилище во время ограбления'],
  ['Пробел', 'Ручной тормоз (в машине)'],
  ['Esc', 'Пауза / отпустить курсор'],
];

export default function ControlsPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl backdrop-blur">
      <h2 className="mb-5 text-2xl font-bold tracking-wide text-white">Управление</h2>
      <div className="mb-6 space-y-2">
        {rows.map(([key, desc]) => (
          <div key={key} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
            <span className="rounded bg-slate-800 px-2 py-1 font-mono text-xs text-amber-400">{key}</span>
            <span className="text-sm text-slate-300">{desc}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          sfxClick();
          onBack();
        }}
        className="w-full rounded-md bg-amber-500 py-2.5 font-semibold text-slate-950 transition hover:bg-amber-400"
      >
        Назад
      </button>
    </div>
  );
}
