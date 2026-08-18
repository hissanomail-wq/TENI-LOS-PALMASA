import { useGameStore } from '../game/store';
import { sfxClick } from '../game/audio';

export default function SettingsPanel({ onBack }: { onBack: () => void }) {
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);

  const Slider = ({
    label,
    value,
    onChange,
    min = 0,
    max = 1,
    step = 0.05,
    format,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min?: number;
    max?: number;
    step?: number;
    format?: (v: number) => string;
  }) => (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between text-sm text-slate-200">
        <span>{label}</span>
        <span className="font-mono text-amber-400">{format ? format(value) : Math.round(value * 100) + '%'}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-amber-500"
      />
    </div>
  );

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl backdrop-blur">
      <h2 className="mb-5 text-2xl font-bold tracking-wide text-white">Настройки</h2>

      <Slider label="Общая громкость" value={settings.masterVolume} onChange={(v) => updateSettings({ masterVolume: v })} />
      <Slider label="Громкость музыки" value={settings.musicVolume} onChange={(v) => updateSettings({ musicVolume: v })} />
      <Slider label="Громкость эффектов" value={settings.sfxVolume} onChange={(v) => updateSettings({ sfxVolume: v })} />
      <Slider
        label="Чувствительность мыши"
        value={settings.sensitivity}
        min={0.2}
        max={3}
        step={0.1}
        onChange={(v) => updateSettings({ sensitivity: v })}
        format={(v) => v.toFixed(1) + 'x'}
      />

      <div className="mb-5 flex items-center justify-between text-sm text-slate-200">
        <span>Инвертировать ось Y</span>
        <button
          onClick={() => {
            updateSettings({ invertY: !settings.invertY });
            sfxClick();
          }}
          className={`h-6 w-12 rounded-full transition ${settings.invertY ? 'bg-amber-500' : 'bg-slate-700'}`}
        >
          <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-white transition ${settings.invertY ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
      </div>

      <div className="mb-6">
        <div className="mb-2 text-sm text-slate-200">Качество графики</div>
        <div className="grid grid-cols-3 gap-2">
          {(['low', 'medium', 'high'] as const).map((q) => (
            <button
              key={q}
              onClick={() => {
                updateSettings({ quality: q });
                sfxClick();
              }}
              className={`rounded-md border px-2 py-1.5 text-sm font-medium transition ${
                settings.quality === q ? 'border-amber-500 bg-amber-500/20 text-amber-300' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {q === 'low' ? 'Низкое' : q === 'medium' ? 'Среднее' : 'Высокое'}
            </button>
          ))}
        </div>
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
