import { useGameStore } from './game/store';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';

export default function App() {
  const screen = useGameStore((s) => s.screen);

  return <div className="h-screen w-screen bg-black text-white">{screen === 'game' ? <GameScreen /> : <MainMenu />}</div>;
}
