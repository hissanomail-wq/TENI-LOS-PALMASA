import { useEffect } from 'react';
import GameCanvas from '../game/GameCanvas';
import HUD from './HUD';
import DialogOverlay from './DialogOverlay';
import PauseMenu from './PauseMenu';
import { GameOverOverlay, EndScreenOverlay } from './StatusOverlays';
import { useGameStore } from '../game/store';
import { attachInputListeners } from '../game/liveState';
import { sfxClick } from '../game/audio';

export default function GameScreen() {
  const paused = useGameStore((s) => s.paused);
  const dialog = useGameStore((s) => s.dialog);
  const gameOverReason = useGameStore((s) => s.gameOverReason);
  const setPaused = useGameStore((s) => s.setPaused);

  useEffect(() => {
    attachInputListeners();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const s = useGameStore.getState();
        if (s.dialog || s.gameOverReason || s.endInfo) return;
        sfxClick();
        if (document.pointerLockElement) document.exitPointerLock();
        setPaused(!s.paused);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setPaused]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      <GameCanvas />
      <HUD />
      {dialog && <DialogOverlay />}
      {paused && !dialog && <PauseMenu />}
      {!paused && <GameOverOverlay />}
      {!paused && !gameOverReason && !dialog && <EndScreenOverlay />}
    </div>
  );
}
