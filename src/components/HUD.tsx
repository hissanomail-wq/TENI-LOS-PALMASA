import { useEffect, useRef } from 'react';
import { useGameStore } from '../game/store';
import { liveState, vehicleRegistry } from '../game/liveState';

function Radar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const SIZE = 168;
    const RADIUS = SIZE / 2;
    const SCALE = 1.1;

    const draw = () => {
      raf = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.save();
      ctx.beginPath();
      ctx.arc(RADIUS, RADIUS, RADIUS - 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(10, 14, 22, 0.72)';
      ctx.fill();
      ctx.clip();

      const px = liveState.player.position.x;
      const pz = liveState.player.position.z;

      // grid
      ctx.strokeStyle = 'rgba(148,163,184,0.18)';
      ctx.lineWidth = 1;
      for (let i = -4; i <= 4; i++) {
        const off = i * 24 * SCALE + RADIUS;
        ctx.beginPath();
        ctx.moveTo(off, 0);
        ctx.lineTo(off, SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, off);
        ctx.lineTo(SIZE, off);
        ctx.stroke();
      }

      const marker = useGameStore.getState().marker;
      if (marker) {
        const dx = (marker.position[0] - px) * SCALE;
        const dz = (marker.position[2] - pz) * SCALE;
        ctx.beginPath();
        ctx.arc(RADIUS + dx, RADIUS + dz, 6, 0, Math.PI * 2);
        ctx.fillStyle = marker.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      vehicleRegistry.forEach((v) => {
        if (v.kind === 'police' && v.active) {
          const dx = (v.position.x - px) * SCALE;
          const dz = (v.position.z - pz) * SCALE;
          ctx.beginPath();
          ctx.arc(RADIUS + dx, RADIUS + dz, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.fill();
        }
      });

      ctx.restore();

      // border ring
      ctx.beginPath();
      ctx.arc(RADIUS, RADIUS, RADIUS - 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(251,191,36,0.7)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // player arrow (always centered, points camera/movement yaw)
      const yaw = liveState.controlledVehicleId
        ? (vehicleRegistry.get(liveState.controlledVehicleId)?.yaw ?? liveState.player.yaw)
        : liveState.player.yaw;
      ctx.save();
      ctx.translate(RADIUS, RADIUS);
      ctx.rotate(yaw);
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(5, 6);
      ctx.lineTo(-5, 6);
      ctx.closePath();
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.restore();
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none absolute left-4 top-4 rounded-full ring-2 ring-black/40">
      <canvas ref={canvasRef} width={168} height={168} className="rounded-full" />
    </div>
  );
}

function WantedStars() {
  const wanted = useGameStore((s) => s.wantedLevel);
  if (wanted <= 0) return null;
  return (
    <div className="flex gap-0.5 rounded-lg bg-black/50 px-2 py-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-lg ${i < wanted ? 'text-amber-400' : 'text-slate-600'}`}>
          ★
        </span>
      ))}
    </div>
  );
}

function HealthBar() {
  const health = useGameStore((s) => s.health);
  return (
    <div className="w-40 rounded-full bg-black/50 p-1">
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${health}%`,
            backgroundColor: health > 50 ? '#22c55e' : health > 25 ? '#eab308' : '#ef4444',
          }}
        />
      </div>
    </div>
  );
}

export default function HUD() {
  const money = useGameStore((s) => s.money);
  const objective = useGameStore((s) => s.objective);
  const objectiveHint = useGameStore((s) => s.objectiveHint);
  const interactPrompt = useGameStore((s) => s.interactPrompt);
  const banner = useGameStore((s) => s.banner);

  return (
    <div className="pointer-events-none absolute inset-0 select-none font-sans">
      <Radar />

      <div className="absolute right-4 top-4 flex flex-col items-end gap-2">
        <div className="rounded-lg bg-black/50 px-3 py-1.5 font-mono text-lg font-bold text-emerald-400">
          ${money.toLocaleString('ru-RU')}
        </div>
        <WantedStars />
        <HealthBar />
      </div>

      {objective && (
        <div className="absolute left-1/2 top-4 w-full max-w-md -translate-x-1/2 text-center">
          <div className="rounded-lg bg-black/55 px-4 py-2 shadow-lg backdrop-blur-sm">
            <div className="text-[11px] uppercase tracking-widest text-amber-400">Задание</div>
            <div className="text-sm font-semibold text-white">{objective}</div>
            {objectiveHint && <div className="text-xs text-slate-400">{objectiveHint}</div>}
          </div>
        </div>
      )}

      {banner && (
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 animate-[pulse_2s_ease-in-out] text-center">
          <div className="rounded-md bg-black/60 px-6 py-3 text-2xl font-black italic tracking-wide text-amber-400 shadow-xl">
            {banner}
          </div>
        </div>
      )}

      {interactPrompt && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <div className="rounded-full border border-amber-400/60 bg-black/60 px-4 py-2 text-sm font-medium text-amber-300 shadow-lg">
            {interactPrompt}
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-xs text-slate-400">
        Клик по экрану — захват камеры · Esc — пауза
      </div>
    </div>
  );
}
