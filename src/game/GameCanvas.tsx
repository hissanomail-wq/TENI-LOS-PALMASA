import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import City from './City';
import Character from './Character';
import Vehicle from './Vehicle';
import GameLoop from './GameLoop';
import ChaseCamera from './ChaseCamera';
import Markers from './Markers';
import { MISSION_CAR_SPAWN, GETAWAY_CAR_SPAWN, BANK, TRAFFIC_PATHS } from './world';
import { useGameStore } from './store';

const TRAFFIC_COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'];

export default function GameCanvas() {
  const quality = useGameStore((s) => s.settings.quality);
  const shadows = quality !== 'low';
  const dpr: [number, number] | number = quality === 'high' ? [1, 2] : quality === 'medium' ? [1, 1.4] : 1;

  return (
    <Canvas shadows={shadows} dpr={dpr} camera={{ fov: 62, near: 0.1, far: 600 }}>
      <color attach="background" args={['#0b1120']} />
      <fog attach="fog" args={['#0b1120', 70, 260]} />
      <hemisphereLight args={['#7dd3fc', '#1f2937', 0.55]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[80, 120, 40]}
        intensity={1.3}
        castShadow={shadows}
        shadow-mapSize-width={shadows ? 2048 : 512}
        shadow-mapSize-height={shadows ? 2048 : 512}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
      />
      <Stars radius={300} depth={60} count={2000} factor={4} fade speed={0.4} />

      <City />
      <Character />
      <Markers />

      <Vehicle id="missionCar1" kind="mission" color="#facc15" startPos={[MISSION_CAR_SPAWN.x, 0, MISSION_CAR_SPAWN.z]} startYaw={0} />
      <Vehicle id="getawayCar" kind="getaway" color="#f97316" startPos={[GETAWAY_CAR_SPAWN.x, 0, GETAWAY_CAR_SPAWN.z]} startYaw={Math.PI / 2} />

      {TRAFFIC_PATHS.map((path, i) => (
        <Vehicle key={`traffic-${i}`} id={`traffic-${i}`} kind="traffic" color={TRAFFIC_COLORS[i % TRAFFIC_COLORS.length]} startPos={[path[0].x, 0, path[0].z]} path={path} />
      ))}
      <Vehicle
        id="traffic-extra1"
        kind="traffic"
        color={TRAFFIC_COLORS[3]}
        startPos={[TRAFFIC_PATHS[0][2].x, 0, TRAFFIC_PATHS[0][2].z]}
        path={TRAFFIC_PATHS[0]}
      />

      <Vehicle id="police-1" kind="police" color="#0f172a" startPos={[BANK.x + 45, 0, BANK.z - 45]} />
      <Vehicle id="police-2" kind="police" color="#0f172a" startPos={[BANK.x - 55, 0, BANK.z + 35]} />
      <Vehicle id="police-3" kind="police" color="#0f172a" startPos={[BANK.x + 15, 0, BANK.z - 70]} />
      <Vehicle id="police-4" kind="police" color="#0f172a" startPos={[BANK.x - 35, 0, BANK.z - 60]} />

      <ChaseCamera />
      <GameLoop />
    </Canvas>
  );
}
