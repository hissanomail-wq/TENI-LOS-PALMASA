import * as THREE from 'three';

export const keysDown = new Set<string>();

function normalizeKey(e: KeyboardEvent) {
  return e.key.length === 1 ? e.key.toLowerCase() : e.key;
}

let listenersAttached = false;
export function attachInputListeners() {
  if (listenersAttached || typeof window === 'undefined') return;
  listenersAttached = true;
  window.addEventListener('keydown', (e) => {
    keysDown.add(normalizeKey(e));
  });
  window.addEventListener('keyup', (e) => {
    keysDown.delete(normalizeKey(e));
  });
  window.addEventListener('blur', () => keysDown.clear());
}

export function isDown(...keys: string[]) {
  return keys.some((k) => keysDown.has(k));
}

export interface PlayerLive {
  position: THREE.Vector3;
  yaw: number;
  vy: number;
  grounded: boolean;
  speed: number;
  bobPhase: number;
}

export interface CameraLive {
  yaw: number;
  pitch: number;
  distance: number;
}

export const liveState = {
  player: {
    position: new THREE.Vector3(6, 0, 14),
    yaw: Math.PI,
    vy: 0,
    grounded: true,
    speed: 0,
    bobPhase: 0,
  } as PlayerLive,
  camera: {
    yaw: Math.PI,
    pitch: 0.24,
    distance: 8.5,
  } as CameraLive,
  controlledVehicleId: null as string | null,
  interactHold: 0,
  pointerLocked: false,
  wantedTimer: 0,
};

export type VehicleKind = 'traffic' | 'police' | 'mission' | 'getaway';

export interface VehicleLive {
  id: string;
  kind: VehicleKind;
  color: string;
  position: THREE.Vector3;
  yaw: number;
  speed: number;
  steer: number;
  active: boolean;
  wheelSpin: number;
}

export const vehicleRegistry = new Map<string, VehicleLive>();

export function resetLiveState() {
  liveState.player.position.set(6, 0, 14);
  liveState.player.yaw = Math.PI;
  liveState.player.vy = 0;
  liveState.player.grounded = true;
  liveState.player.speed = 0;
  liveState.camera.yaw = Math.PI;
  liveState.camera.pitch = 0.24;
  liveState.controlledVehicleId = null;
  liveState.interactHold = 0;
  liveState.wantedTimer = 0;
}
