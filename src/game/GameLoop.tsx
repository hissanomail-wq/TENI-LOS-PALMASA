import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { liveState, isDown, vehicleRegistry, keysDown } from './liveState';
import { resolveBuildingCollision } from './world';
import { useGameStore } from './store';
import { checkMissionTriggers, isNearVaultForRobbery, completeRobbery } from './missions';
import { sfxClick, stopSiren } from './audio';

const WALK_SPEED = 3.4;
const RUN_SPEED = 7.2;
const ENTER_RANGE = 3.4;
const ROB_HOLD_TIME = 2.2;

export default function GameLoop() {
  const { gl } = useThree();
  const wasE = useRef(false);
  const lastPromptRef = useRef<string | null>(null);
  const lastPercentRef = useRef(-1);

  // Pointer lock + mouse look
  useEffect(() => {
    const canvas = gl.domElement;
    const onClick = () => {
      const s = useGameStore.getState();
      if (s.screen === 'game' && !s.paused && !s.dialog && !s.gameOverReason) {
        canvas.requestPointerLock();
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return;
      const s = useGameStore.getState().settings;
      const invert = s.invertY ? -1 : 1;
      liveState.camera.yaw -= e.movementX * 0.0022 * s.sensitivity;
      liveState.camera.pitch = THREE.MathUtils.clamp(
        liveState.camera.pitch + e.movementY * 0.0016 * s.sensitivity * invert,
        -0.35,
        0.9,
      );
    };
    const onLockChange = () => {
      liveState.pointerLocked = document.pointerLockElement === canvas;
    };
    canvas.addEventListener('click', onClick);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onLockChange);
    return () => {
      canvas.removeEventListener('click', onClick);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onLockChange);
    };
  }, [gl]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const store = useGameStore.getState();
    const blocked = store.paused || !!store.dialog || !!store.gameOverReason || !!store.endInfo;

    if (store.wantedLevel === 0) stopSiren();

    if (blocked) {
      liveState.player.speed = THREE.MathUtils.lerp(liveState.player.speed, 0, dt * 6);
      wasE.current = isDown('e');
      return;
    }

    const inVehicle = liveState.controlledVehicleId !== null;

    // ---- On-foot movement ----
    if (!inVehicle) {
      const forwardIn = (isDown('w', 'ArrowUp') ? 1 : 0) - (isDown('s', 'ArrowDown') ? 1 : 0);
      const strafeIn = (isDown('a', 'ArrowLeft') ? 1 : 0) - (isDown('d', 'ArrowRight') ? 1 : 0);
      const running = isDown('Shift');

      const camYaw = liveState.camera.yaw;
      const forwardVec = new THREE.Vector3(Math.sin(camYaw), 0, Math.cos(camYaw));
      const rightVec = new THREE.Vector3(Math.sin(camYaw + Math.PI / 2), 0, Math.cos(camYaw + Math.PI / 2));

      const moveVec = new THREE.Vector3();
      moveVec.addScaledVector(forwardVec, forwardIn);
      moveVec.addScaledVector(rightVec, strafeIn);

      const hasInput = moveVec.lengthSq() > 0.0001;
      const targetSpeed = hasInput ? (running ? RUN_SPEED : WALK_SPEED) : 0;
      liveState.player.speed = THREE.MathUtils.lerp(liveState.player.speed, targetSpeed, dt * 8);

      if (hasInput) {
        moveVec.normalize();
        const desiredYaw = Math.atan2(moveVec.x, moveVec.z);
        let diff = desiredYaw - liveState.player.yaw;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        liveState.player.yaw += diff * Math.min(1, dt * 10);
        liveState.player.position.addScaledVector(moveVec, liveState.player.speed * dt);
        resolveBuildingCollision(liveState.player.position, 0.5);
      }
    }

    // ---- Interaction (edge-triggered E) ----
    const eDown = isDown('e');
    const ePressed = eDown && !wasE.current;
    wasE.current = eDown;

    let prompt: string | null = null;

    if (inVehicle) {
      prompt = 'E — выйти из машины';
      if (ePressed) {
        const vId = liveState.controlledVehicleId;
        const v = vId ? vehicleRegistry.get(vId) : null;
        liveState.controlledVehicleId = null;
        store.setInVehicle(false);
        if (v) {
          liveState.player.position.set(v.position.x + 1.6, 0, v.position.z);
          liveState.player.yaw = v.yaw;
        }
        sfxClick();
      }
    } else {
      // find nearest enterable vehicle
      let nearest: string | null = null;
      let nearestDist = ENTER_RANGE;
      for (const v of vehicleRegistry.values()) {
        if (v.kind === 'police' && v.active) continue;
        const d = Math.hypot(v.position.x - liveState.player.position.x, v.position.z - liveState.player.position.z);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = v.id;
        }
      }
      if (nearest) {
        prompt = 'E — сесть в машину';
        if (ePressed) {
          liveState.controlledVehicleId = nearest;
          store.setInVehicle(true);
          sfxClick();
        }
      } else if (isNearVaultForRobbery()) {
        if (eDown) {
          liveState.interactHold += dt;
        } else {
          liveState.interactHold = Math.max(0, liveState.interactHold - dt * 2);
        }
        const pct = Math.min(100, Math.round((liveState.interactHold / ROB_HOLD_TIME) * 100));
        if (pct !== lastPercentRef.current) {
          lastPercentRef.current = pct;
          prompt = `Удерживайте E — вскрытие хранилища (${pct}%)`;
        } else {
          prompt = lastPromptRef.current;
        }
        if (liveState.interactHold >= ROB_HOLD_TIME) {
          liveState.interactHold = 0;
          lastPercentRef.current = -1;
          completeRobbery();
        }
      }
    }

    if (prompt !== lastPromptRef.current) {
      lastPromptRef.current = prompt;
      store.setInteractPrompt(prompt);
    }

    // ---- Police contact damage ----
    if (store.wantedLevel > 0) {
      for (const v of vehicleRegistry.values()) {
        if (v.kind !== 'police' || !v.active) continue;
        const targetPos = inVehicle ? vehicleRegistry.get(liveState.controlledVehicleId!)?.position : liveState.player.position;
        if (!targetPos) continue;
        const d = Math.hypot(v.position.x - targetPos.x, v.position.z - targetPos.z);
        if (d < 2.4) {
          store.addHealth(-14 * dt);
        }
      }
      liveState.wantedTimer += dt;
      if (liveState.wantedTimer > 16) {
        liveState.wantedTimer = 0;
        useGameStore.getState().setWanted(useGameStore.getState().wantedLevel - 1);
      }
      if (useGameStore.getState().health <= 0 && !store.gameOverReason) {
        useGameStore.getState().triggerGameOver('Тебя задержала полиция...');
      }
    }

    // ---- Mission triggers ----
    checkMissionTriggers();
  });

  // clear stray keys when window loses focus mid-game
  useEffect(() => {
    return () => {
      keysDown.clear();
    };
  }, []);

  return null;
}
