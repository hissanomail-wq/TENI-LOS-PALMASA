import { useEffect } from 'react';
import { useGameStore } from '../game/store';
import { sfxClick } from '../game/audio';

export default function DialogOverlay() {
  const dialog = useGameStore((s) => s.dialog);
  const advanceDialog = useGameStore((s) => s.advanceDialog);

  useEffect(() => {
    if (dialog && document.pointerLockElement) document.exitPointerLock();
  }, [dialog]);

  useEffect(() => {
    if (!dialog) return;
    const handler = (e: KeyboardEvent) => {
      if (['Enter', ' ', 'e', 'E'].includes(e.key)) {
        sfxClick();
        advanceDialog();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dialog, advanceDialog]);

  if (!dialog) return null;
  const line = dialog.queue[dialog.index];

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/30 pb-16">
      <div
        className="w-full max-w-xl cursor-pointer rounded-xl border border-amber-500/30 bg-slate-950/90 p-5 shadow-2xl transition hover:border-amber-500/60"
        onClick={() => {
          sfxClick();
          advanceDialog();
        }}
      >
        <div className="mb-1 text-sm font-bold uppercase tracking-widest text-amber-400">{line.speaker}</div>
        <p className="text-lg text-white">{line.text}</p>
        <div className="mt-3 text-right text-xs text-slate-500">
          {dialog.index + 1}/{dialog.queue.length} · нажмите, чтобы продолжить
        </div>
      </div>
    </div>
  );
}
