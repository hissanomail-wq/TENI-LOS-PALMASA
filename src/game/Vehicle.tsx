import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { liveState, vehicleRegistry, isDown, type VehicleLive, type VehicleKind } from './liveState';
import { resolveBuildingCollision } from './world';

const MAX_SPEED = 26;
const POLICE_MAX_SPEED = 24;
const ACCEL = 16;
const BRAKE = 26;
const FRICTION = 8;
const TURN_RATE = 2.1;

export interface VehicleProps {
  id: string;
  kind: VehicleKind;
  color: string;
  startPos: [number, number, number];
  startYaw?: number;
  path?: THREE.Vector3[];
}

function CarBody({ color, isPolice }: { color: string; isPolice?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.8, 4.2]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.55} />
      </mesh>
      <mesh position={[0, 1.15, -0.2]} castShadow>
        <boxGeometry args={[1.6, 0.55, 2.1]} />
        <meshStandardMaterial color="#111827" roughness={0.15} metalness={0.6} transparent opacity={0.85} />
      </mesh>
      {/* headlights */}
      <mesh position={[0.6, 0.62, 2.05]}>
        <boxGeometry args={[0.35, 0.2, 0.1]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-0.6, 0.62, 2.05]}>
        <boxGeometry args={[0.35, 0.2, 0.1]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={1.5} />
      </mesh>
      {/* taillights */}
      <mesh position={[0.6, 0.62, -2.05]}>
        <boxGeometry args={[0.35, 0.2, 0.1]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isPolice ? 2.5 : 1} />
      </mesh>
      <mesh position={[-0.6, 0.62, -2.05]}>
        <boxGeometry args={[0.35, 0.2, 0.1]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isPolice ? 2.5 : 1} />
      </mesh>
      {isPolice && (
        <mesh position={[0, 1.48, -0.2]}>
          <boxGeometry args={[1.2, 0.22, 0.5]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      )}
    </group>
  );
}

function Wheel({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    // spin animation applied externally via userData
  });
  return (
    <mesh ref={ref} position={[x, 0.36, z]} rotation={[0, 0, Math.PI / 2]} castShadow userData={{ wheel: true }}>
      <cylinderGeometry args={[0.36, 0.36, 0.3, 14]} />
      <meshStandardMaterial color="#0f0f0f" roughness={0.9} />
    </mesh>
  );
}

export default function Vehicle({ id, kind, color, startPos, startYaw = 0, path }: VehicleProps) {
  const group = useRef<THREE.Group>(null);
  const frontLeft = useRef<THREE.Group>(null);
  const frontRight = useRef<THREE.Group>(null);
  const wheelSpinRef = useRef(0);
  const pathIndexRef = useRef(0);
  const sirenRef = useRef<THREE.Mesh>(null);

  const live = useMemo<VehicleLive>(
    () => ({
      id,
      kind,
      color,
      position: new THREE.Vector3(...startPos),
      yaw: startYaw,
      speed: 0,
      steer: 0,
      active: kind !== 'police',
      wheelSpin: 0,
    }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    vehicleRegistry.set(id, live);
    return () => {
      vehicleRegistry.delete(id);
    };
  }, [id, live]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const g = group.current;
    if (!g) return;
    const controlled = liveState.controlledVehicleId === id;

    if (controlled) {
      const forward = isDown('w', 'ArrowUp') ? 1 : isDown('s', 'ArrowDown') ? -1 : 0;
      const steerInput = isDown('a', 'ArrowLeft') ? 1 : isDown('d', 'ArrowRight') ? -1 : 0;
      const braking = isDown(' ');

      if (forward !== 0) {
        live.speed += forward * ACCEL * dt;
      } else {
        const sign = Math.sign(live.speed);
        live.speed -= sign * FRICTION * dt;
        if (Math.sign(live.speed) !== sign) live.speed = 0;
      }
      if (braking) {
        const sign = Math.sign(live.speed);
        live.speed -= sign * BRAKE * dt;
        if (Math.sign(live.speed) !== sign) live.speed = 0;
      }
      const maxS = kind === 'police' ? POLICE_MAX_SPEED : MAX_SPEED;
      live.speed = THREE.MathUtils.clamp(live.speed, -maxS * 0.5, maxS);

      const speedFactor = THREE.MathUtils.clamp(Math.abs(live.speed) / 6, 0, 1);
      live.steer = THREE.MathUtils.lerp(live.steer, steerInput, 0.15);
      live.yaw += live.steer * TURN_RATE * dt * speedFactor * Math.sign(live.speed || 1);

      const dir = new THREE.Vector3(Math.sin(live.yaw), 0, Math.cos(live.yaw));
      live.position.addScaledVector(dir, live.speed * dt);
      resolveBuildingCollision(live.position, 1.6);
    } else if (kind === 'traffic' && path && path.length > 1) {
      live.active = true;
      const target = path[pathIndexRef.current];
      const toTarget = new THREE.Vector3().subVectors(target, live.position);
      toTarget.y = 0;
      const dist = toTarget.length();
      if (dist < 3) {
        pathIndexRef.current = (pathIndexRef.current + 1) % path.length;
      }
      const desiredYaw = Math.atan2(toTarget.x, toTarget.z);
      let yawDiff = desiredYaw - live.yaw;
      yawDiff = Math.atan2(Math.sin(yawDiff), Math.cos(yawDiff));
      live.yaw += yawDiff * Math.min(1, dt * 2.2);
      live.speed = THREE.MathUtils.lerp(live.speed, 9, dt);
      const dir = new THREE.Vector3(Math.sin(live.yaw), 0, Math.cos(live.yaw));
      live.position.addScaledVector(dir, live.speed * dt);
    } else if (kind === 'police') {
      if (!live.active) {
        // parked out of sight
        g.visible = false;
        return;
      }
      g.visible = true;
      const targetPos = liveState.controlledVehicleId
        ? vehicleRegistry.get(liveState.controlledVehicleId)?.position ?? liveState.player.position
        : liveState.player.position;
      const toTarget = new THREE.Vector3().subVectors(targetPos, live.position);
      toTarget.y = 0;
      const dist = toTarget.length();
      const desiredYaw = Math.atan2(toTarget.x, toTarget.z);
      let yawDiff = desiredYaw - live.yaw;
      yawDiff = Math.atan2(Math.sin(yawDiff), Math.cos(yawDiff));
      live.yaw += yawDiff * Math.min(1, dt * 2.6);
      const desiredSpeed = dist > 6 ? POLICE_MAX_SPEED : Math.max(4, dist * 1.5);
      live.speed = THREE.MathUtils.lerp(live.speed, desiredSpeed, dt * 1.5);
      const dir = new THREE.Vector3(Math.sin(live.yaw), 0, Math.cos(live.yaw));
      live.position.addScaledVector(dir, live.speed * dt);
      resolveBuildingCollision(live.position, 1.6);
    } else {
      // idle mission car
      live.speed = THREE.MathUtils.lerp(live.speed, 0, dt * 4);
    }

    // Commit transform
    g.position.copy(live.position);
    g.position.y = 0;
    g.rotation.y = live.yaw;

    wheelSpinRef.current += live.speed * dt * 2;
    g.traverse((obj) => {
      if (obj.userData.wheel) {
        obj.rotation.x = wheelSpinRef.current;
      }
    });
    if (frontLeft.current) frontLeft.current.rotation.y = live.steer * 0.5;
    if (frontRight.current) frontRight.current.rotation.y = live.steer * 0.5;

    if (sirenRef.current && kind === 'police' && live.active) {
      const flash = Math.floor(state.clock.elapsedTime * 6) % 2 === 0;
      const mat = sirenRef.current.material as THREE.MeshStandardMaterial;
      mat.color.set(flash ? '#ef4444' : '#3b82f6');
      mat.emissive.set(flash ? '#ef4444' : '#3b82f6');
    }
  });

  return (
    <group ref={group} position={startPos} rotation={[0, startYaw, 0]}>
      <CarBody color={color} isPolice={kind === 'police'} />
      {kind === 'police' && (
        <mesh ref={sirenRef} position={[0, 1.62, -0.2]}>
          <boxGeometry args={[0.3, 0.15, 0.3]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>
      )}
      <group ref={frontLeft} position={[0.85, 0, 1.3]}>
        <Wheel x={0} z={0} />
      </group>
      <group ref={frontRight} position={[-0.85, 0, 1.3]}>
        <Wheel x={0} z={0} />
      </group>
      <Wheel x={0.85} z={-1.3} />
      <Wheel x={-0.85} z={-1.3} />
      {kind === 'police' && <pointLight position={[0, 2, 0]} intensity={2} distance={10} color="#3b82f6" />}
    </group>
  );
}
