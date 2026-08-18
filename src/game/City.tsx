import { useMemo } from 'react';
import { buildings, BANK, VIC_HOUSE, GARAGE, SAFEHOUSE, CITY_HALF, BLOCK } from './world';

function Building({ x, z, w, d, h, color, roof, windows = true, entrance = false }: { x: number; z: number; w: number; d: number; h: number; color: string; roof: string; windows?: boolean; entrance?: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.05} />
      </mesh>
      {/* Entrance / Door */}
      {entrance && (
        <mesh position={[0, 2, d / 2 + 0.05]}>
          <boxGeometry args={[4, 4, 0.3]} />
          <meshStandardMaterial color="#171717" />
        </mesh>
      )}
      <mesh position={[0, h + 0.3, 0]} castShadow>
        <boxGeometry args={[w * 1.02, 0.6, d * 1.02]} />
        <meshStandardMaterial color={roof} roughness={0.9} />
      </mesh>
      {windows &&
        Array.from({ length: Math.max(1, Math.floor(h / 4)) }).map((_, row) => (
          <mesh key={row} position={[0, 2.5 + row * 4, d / 2 + 0.02]}>
            <planeGeometry args={[w * 0.82, 1.4]} />
            <meshStandardMaterial color="#fef08a" emissive="#fde68a" emissiveIntensity={0.25} transparent opacity={0.5} />
          </mesh>
        ))}
    </group>
  );
}

function RoadLines() {
  const lines = useMemo(() => {
    const arr: { x: number; z: number; rotY: number; len: number }[] = [];
    for (let i = -4; i <= 4; i++) {
      arr.push({ x: i * BLOCK, z: 0, rotY: 0, len: CITY_HALF * 2 });
      arr.push({ x: 0, z: i * BLOCK, rotY: Math.PI / 2, len: CITY_HALF * 2 });
    }
    return arr;
  }, []);
  return (
    <group>
      {lines.map((l, i) => (
        <group key={i} position={[l.x, 0.02, l.z]} rotation={[-Math.PI / 2, 0, l.rotY]}>
          {Array.from({ length: Math.floor(l.len / 8) }).map((_, j) => (
            <mesh key={j} position={[0, -CITY_HALF + j * 8 + 2, 0]}>
              <planeGeometry args={[0.35, 3]} />
              <meshBasicMaterial color="#f4e04d" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function City() {
  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[CITY_HALF * 2 + 40, CITY_HALF * 2 + 40]} />
        <meshStandardMaterial color="#4b5259" roughness={1} />
      </mesh>
      {/* Grass ring outside */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[CITY_HALF, CITY_HALF + 60, 64]} />
        <meshStandardMaterial color="#3f5b3a" roughness={1} />
      </mesh>
      <RoadLines />

      {buildings.map((b, i) => (
        <Building key={i} {...b} />
      ))}

      {/* Landmarks */}
      <Building x={VIC_HOUSE.x} z={VIC_HOUSE.z} w={VIC_HOUSE.w} d={VIC_HOUSE.d} h={VIC_HOUSE.h} color={VIC_HOUSE.color} roof={VIC_HOUSE.roof} windows={false} />
      <Building x={BANK.x} z={BANK.z} w={BANK.w} d={BANK.d} h={BANK.h} color={BANK.color} roof={BANK.roof} entrance={true} />
      <Building x={GARAGE.x} z={GARAGE.z} w={GARAGE.w} d={GARAGE.d} h={GARAGE.h} color={GARAGE.color} roof={GARAGE.roof} windows={false} />
      <Building x={SAFEHOUSE.x} z={SAFEHOUSE.z} w={SAFEHOUSE.w} d={SAFEHOUSE.d} h={SAFEHOUSE.h} color={SAFEHOUSE.color} roof={SAFEHOUSE.roof} windows={false} />

      {/* Bank sign */}
      <mesh position={[BANK.x, BANK.h + 2, BANK.z + BANK.d / 2 + 0.1]}>
        <boxGeometry args={[10, 2, 0.3]} />
        <meshStandardMaterial color="#1d4ed8" emissive="#1d4ed8" emissiveIntensity={0.6} />
      </mesh>

      {/* Streetlights */}
      {Array.from({ length: 9 }).map((_, i) => (
        <group key={i} position={[((i % 3) - 1) * 80, 0, (Math.floor(i / 3) - 1) * 80]}>
          <mesh position={[0, 4, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 8, 8]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          <mesh position={[0, 8, 0]}>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshStandardMaterial color="#fef9c3" emissive="#fde68a" emissiveIntensity={1.2} />
          </mesh>
          <pointLight position={[0, 7.6, 0]} intensity={8} distance={22} color="#ffedad" decay={2} />
        </group>
      ))}
    </group>
  );
}

export { CITY_HALF };
