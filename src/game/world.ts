import * as THREE from 'three';

export const CITY_HALF = 130;
export const BLOCK = 32;
export const ROAD_WIDTH = 11;

export interface Building {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
  roof: string;
  windows: boolean;
}

export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  h: number;
}

// Reserved block indices (ix, iz) that get special landmark treatment / must stay clear.
const RESERVED = new Set(['-2,-1', '1,0', '-1,-2', '3,3', '0,0']);

function key(ix: number, iz: number) {
  return `${ix},${iz}`;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(1337);

const palette = ['#9aa5b1', '#8896a6', '#c9b79c', '#a9887a', '#7f8c9e', '#b7a08c', '#8f9aa8', '#6d7a8c'];
const roofPalette = ['#4b5563', '#374151', '#57534e', '#525252'];

export const buildings: Building[] = [];
export const buildingAABBs: AABB[] = [];

const RANGE = 4; // blocks from -4..4

for (let ix = -RANGE; ix <= RANGE; ix++) {
  for (let iz = -RANGE; iz <= RANGE; iz++) {
    if (RESERVED.has(key(ix, iz))) continue;
    const cx = ix * BLOCK;
    const cz = iz * BLOCK;
    if (Math.abs(cx) < 6 && Math.abs(cz) < 6) continue; // keep spawn area clear
    const footprint = BLOCK - ROAD_WIDTH - 4;
    const w = footprint * (0.55 + rand() * 0.4);
    const d = footprint * (0.55 + rand() * 0.4);
    const h = 6 + rand() * 26;
    const jitterX = (rand() - 0.5) * 3;
    const jitterZ = (rand() - 0.5) * 3;
    const b: Building = {
      x: cx + jitterX,
      z: cz + jitterZ,
      w,
      d,
      h,
      color: palette[Math.floor(rand() * palette.length)],
      roof: roofPalette[Math.floor(rand() * roofPalette.length)],
      windows: rand() > 0.15,
    };
    buildings.push(b);
    buildingAABBs.push({
      minX: b.x - b.w / 2,
      maxX: b.x + b.w / 2,
      minZ: b.z - b.d / 2,
      maxZ: b.z + b.d / 2,
      h: b.h,
    });
  }
}

// ---- Landmarks ----
export const VIC_HOUSE = { x: -2 * BLOCK, z: -1 * BLOCK, w: 20, d: 16, h: 9, color: '#b08968', roof: '#6b4226' };
export const BANK = { x: 1 * BLOCK, z: 0 * BLOCK, w: 24, d: 22, h: 20, color: '#dbe4ee', roof: '#334155' };
export const GARAGE = { x: -1 * BLOCK, z: -2 * BLOCK, w: 18, d: 16, h: 7, color: '#94a3b8', roof: '#1e293b' };
export const SAFEHOUSE = { x: 3 * BLOCK, z: 3 * BLOCK, w: 18, d: 16, h: 10, color: '#7c8b6f', roof: '#3f4a3a' };

buildingAABBs.push(
  { minX: VIC_HOUSE.x - VIC_HOUSE.w / 2, maxX: VIC_HOUSE.x + VIC_HOUSE.w / 2, minZ: VIC_HOUSE.z - VIC_HOUSE.d / 2, maxZ: VIC_HOUSE.z + VIC_HOUSE.d / 2, h: VIC_HOUSE.h },
  // Bank - with entrance gap at front (positive Z)
  { minX: BANK.x - BANK.w / 2, maxX: BANK.x + BANK.w / 2, minZ: BANK.z - BANK.d / 2, maxZ: BANK.z + BANK.d / 2 - 4, h: BANK.h },
  { minX: BANK.x - BANK.w / 2, maxX: BANK.x - 3, minZ: BANK.z + BANK.d / 2 - 4, maxZ: BANK.z + BANK.d / 2, h: BANK.h },
  { minX: BANK.x + 3, maxX: BANK.x + BANK.w / 2, minZ: BANK.z + BANK.d / 2 - 4, maxZ: BANK.z + BANK.d / 2, h: BANK.h },
  { minX: GARAGE.x - GARAGE.w / 2, maxX: GARAGE.x + GARAGE.w / 2, minZ: GARAGE.z - GARAGE.d / 2, maxZ: GARAGE.z + GARAGE.d / 2, h: GARAGE.h },
  { minX: SAFEHOUSE.x - SAFEHOUSE.w / 2, maxX: SAFEHOUSE.x + SAFEHOUSE.w / 2, minZ: SAFEHOUSE.z - SAFEHOUSE.d / 2, maxZ: SAFEHOUSE.z + SAFEHOUSE.d / 2, h: SAFEHOUSE.h },
);

// ---- Mission points ----
export const PLAYER_START = new THREE.Vector3(6, 0, 14);
export const VIC_HOUSE_POINT = new THREE.Vector3(VIC_HOUSE.x + 12, 0, VIC_HOUSE.z + 6);
export const MISSION_CAR_SPAWN = new THREE.Vector3(10, 0, 6);
export const GARAGE_POINT = new THREE.Vector3(GARAGE.x, 0, GARAGE.z + 13);
export const BANK_ENTRANCE_POINT = new THREE.Vector3(BANK.x, 0, BANK.z + 16);
export const BANK_VAULT_POINT = new THREE.Vector3(BANK.x, 0, BANK.z + 4);
export const GETAWAY_CAR_SPAWN = new THREE.Vector3(BANK.x + 18, 0, BANK.z + 16);
export const SAFEHOUSE_POINT = new THREE.Vector3(SAFEHOUSE.x, 0, SAFEHOUSE.z + 12);

export function resolveBuildingCollision(pos: THREE.Vector3, radius: number) {
  for (const b of buildingAABBs) {
    const minX = b.minX - radius;
    const maxX = b.maxX + radius;
    const minZ = b.minZ - radius;
    const maxZ = b.maxZ + radius;
    if (pos.x > minX && pos.x < maxX && pos.z > minZ && pos.z < maxZ) {
      const overlapLeft = pos.x - minX;
      const overlapRight = maxX - pos.x;
      const overlapTop = pos.z - minZ;
      const overlapBottom = maxZ - pos.z;
      const min = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
      if (min === overlapLeft) pos.x = minX;
      else if (min === overlapRight) pos.x = maxX;
      else if (min === overlapTop) pos.z = minZ;
      else pos.z = maxZ;
    }
  }
  const bound = CITY_HALF - 4;
  pos.x = THREE.MathUtils.clamp(pos.x, -bound, bound);
  pos.z = THREE.MathUtils.clamp(pos.z, -bound, bound);
}

// Traffic loop path (rectangle around the city core)
export const TRAFFIC_PATHS: THREE.Vector3[][] = [
  [
    new THREE.Vector3(-2 * BLOCK, 0, -3 * BLOCK),
    new THREE.Vector3(2 * BLOCK, 0, -3 * BLOCK),
    new THREE.Vector3(2 * BLOCK, 0, 3 * BLOCK),
    new THREE.Vector3(-2 * BLOCK, 0, 3 * BLOCK),
  ],
  [
    new THREE.Vector3(-3 * BLOCK, 0, -1 * BLOCK),
    new THREE.Vector3(3 * BLOCK, 0, -1 * BLOCK),
    new THREE.Vector3(3 * BLOCK, 0, 2 * BLOCK),
    new THREE.Vector3(-3 * BLOCK, 0, 2 * BLOCK),
  ],
];
