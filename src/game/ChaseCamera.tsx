import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { liveState, vehicleRegistry } from './liveState';

export default function ChaseCamera() {
  const { camera } = useThree();
  const current = useRef(new THREE.Vector3(0, 6, 14));
  const lookCurrent = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    let focusX: number;
    let focusZ: number;
    let focusY: number;

    if (liveState.controlledVehicleId) {
      const v = vehicleRegistry.get(liveState.controlledVehicleId);
      focusX = v ? v.position.x : liveState.player.position.x;
      focusZ = v ? v.position.z : liveState.player.position.z;
      focusY = 1.1;
    } else {
      focusX = liveState.player.position.x;
      focusZ = liveState.player.position.z;
      focusY = 1.4;
    }

    const yaw = liveState.camera.yaw;
    const pitch = liveState.camera.pitch;
    const dist = liveState.camera.distance;

    const horiz = Math.cos(pitch) * dist;
    const offsetX = Math.sin(yaw) * horiz;
    const offsetZ = Math.cos(yaw) * horiz;
    const offsetY = Math.sin(pitch) * dist + 2.4;

    const target = new THREE.Vector3(focusX - offsetX, focusY + offsetY, focusZ - offsetZ);
    if (!initialized.current) {
      current.current.copy(target);
      initialized.current = true;
    } else {
      current.current.lerp(target, Math.min(1, dt * 7));
    }
    camera.position.copy(current.current);

    const lookTarget = new THREE.Vector3(focusX, focusY + 0.7, focusZ);
    lookCurrent.current.lerp(lookTarget, Math.min(1, dt * 10));
    camera.lookAt(lookCurrent.current);
  });

  return null;
}
