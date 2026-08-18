import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './store';

export default function Markers() {
  const marker = useGameStore((s) => s.marker);
  const ring = useRef<THREE.Mesh>(null);
  const beam = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ring.current) {
      ring.current.rotation.z = state.clock.elapsedTime * 1.4;
      const s = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
      ring.current.scale.set(s, s, 1);
    }
    if (beam.current) {
      beam.current.position.y = 2 + Math.sin(state.clock.elapsedTime * 2) * 0.4;
    }
  });

  if (!marker) return null;
  const [x, , z] = marker.position;

  return (
    <group position={[x, 0, z]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[marker.radius * 0.7, marker.radius * 0.9, 32]} />
        <meshBasicMaterial color={marker.color} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 10, 8, 1, true]} />
        <meshBasicMaterial color={marker.color} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={beam} position={[0, 2, 0]}>
        <coneGeometry args={[0.5, 0.9, 4]} />
        <meshBasicMaterial color={marker.color} />
      </mesh>
      <pointLight position={[0, 1.5, 0]} color={marker.color} intensity={4} distance={12} />
    </group>
  );
}
