import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { liveState } from './liveState';

export default function Character({ color = '#2563eb' }: { color?: string }) {
  const group = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const phase = useRef(0);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const g = group.current;
    if (!g) return;

    const inVehicle = liveState.controlledVehicleId !== null;
    g.visible = !inVehicle;
    if (inVehicle) return;

    g.position.copy(liveState.player.position);
    g.position.y = 0;
    g.rotation.y = liveState.player.yaw;

    const speed = liveState.player.speed;
    const moving = Math.abs(speed) > 0.15;
    if (moving) {
      phase.current += dt * (4 + Math.abs(speed) * 1.6);
    } else {
      phase.current += dt * 1.2;
    }
    const swing = moving ? Math.sin(phase.current) * Math.min(1, Math.abs(speed) / 5 + 0.35) : Math.sin(phase.current) * 0.04;
    if (leftArm.current) leftArm.current.rotation.x = swing * 0.9;
    if (rightArm.current) rightArm.current.rotation.x = -swing * 0.9;
    if (leftLeg.current) leftLeg.current.rotation.x = -swing * 0.9;
    if (rightLeg.current) rightLeg.current.rotation.x = swing * 0.9;

    const bob = moving ? Math.abs(Math.sin(phase.current * 2)) * 0.06 : 0;
    g.position.y = liveState.player.grounded ? bob : 0;
  });

  return (
    <group ref={group}>
      {/* head */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.24, 12, 12]} />
        <meshStandardMaterial color="#f0c9a0" />
      </mesh>
      {/* torso */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <boxGeometry args={[0.5, 0.62, 0.28]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* hips */}
      <mesh position={[0, 0.84, 0]} castShadow>
        <boxGeometry args={[0.42, 0.2, 0.26]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      {/* arms */}
      <group ref={leftArm} position={[0.34, 1.42, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <boxGeometry args={[0.16, 0.56, 0.16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      <group ref={rightArm} position={[-0.34, 1.42, 0]}>
        <mesh position={[0, -0.28, 0]} castShadow>
          <boxGeometry args={[0.16, 0.56, 0.16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {/* legs */}
      <group ref={leftLeg} position={[0.15, 0.74, 0]}>
        <mesh position={[0, -0.33, 0]} castShadow>
          <boxGeometry args={[0.19, 0.66, 0.19]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
      </group>
      <group ref={rightLeg} position={[-0.15, 0.74, 0]}>
        <mesh position={[0, -0.33, 0]} castShadow>
          <boxGeometry args={[0.19, 0.66, 0.19]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
      </group>
    </group>
  );
}
