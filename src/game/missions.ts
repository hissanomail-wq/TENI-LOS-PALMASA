import { useGameStore } from './store';
import { liveState, vehicleRegistry } from './liveState';
import {
  VIC_HOUSE_POINT,
  GARAGE_POINT,
  BANK_ENTRANCE_POINT,
  BANK_VAULT_POINT,
  SAFEHOUSE_POINT,
  GETAWAY_CAR_SPAWN,
} from './world';
import { sfxConfirm, sfxCash, sfxAlert, startSiren, stopSiren } from './audio';

export const STAGE = {
  INTRO: 0,
  GO_TO_VIC: 1,
  GET_CAR: 2,
  DRIVE_TO_GARAGE: 3,
  SCOUT_BANK: 4,
  APPROACH_HEIST: 5,
  ROB_VAULT: 6,
  ESCAPE_TO_CAR: 7,
  LOSE_COPS: 8,
  FREE_ROAM: 9,
};

function dist2D(a: { x: number; z: number }, b: { x: number; z: number }) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function startStory() {
  const store = useGameStore.getState();
  store.showDialog([
    { speaker: 'Алекс', text: 'Пять лет не был дома. Городок совсем не изменился...' },
    { speaker: 'Алекс', text: 'Вик писал, что у него есть для меня работа. Стоит зайти, узнать, что он задумал.' },
    { speaker: 'Система', text: 'Двигайтесь клавишами W A S D. Направление камеры — мышь. Дойдите до отметки на карте.' },
  ]);
  store.setMissionStage(
    STAGE.GO_TO_VIC,
    'Дойдите до дома Вика',
    { id: 'vic', position: [VIC_HOUSE_POINT.x, 0, VIC_HOUSE_POINT.z], radius: 5, color: '#facc15', label: 'Вик' },
    'Идите на жёлтую метку на радаре',
  );
}

function goToGetCar() {
  const store = useGameStore.getState();
  store.showDialog([
    { speaker: 'Вик', text: 'Смотри, кто вернулся! Как раз вовремя — есть дело.' },
    { speaker: 'Вик', text: 'Для начала пригони машину из центра в гараж. Проверим, не растерял ли ты навыки.' },
    { speaker: 'Система', text: 'Подойдите к жёлтой машине и нажмите E, чтобы сесть за руль.' },
  ]);
  store.setMissionStage(
    STAGE.GET_CAR,
    'Угоните машину и отгоните её в гараж',
    { id: 'car', position: [10, 0, 6], radius: 4, color: '#facc15', label: 'Машина' },
    'Нажмите E рядом с машиной',
  );
}

function goToGarage() {
  const store = useGameStore.getState();
  store.setMissionStage(
    STAGE.DRIVE_TO_GARAGE,
    'Отгоните машину в гараж',
    { id: 'garage', position: [GARAGE_POINT.x, 0, GARAGE_POINT.z], radius: 6, color: '#38bdf8', label: 'Гараж' },
    'W/S — газ/тормоз, A/D — руль',
  );
}

function goToScoutBank() {
  const store = useGameStore.getState();
  sfxConfirm();
  store.showDialog([
    { speaker: 'Вик', text: 'Неплохо. А теперь дело серьёзнее — банк на площади.' },
    { speaker: 'Вик', text: 'Сначала разведаем обстановку. Дуй ко входу, осмотрись.' },
  ]);
  store.setMissionStage(
    STAGE.SCOUT_BANK,
    'Осмотрите банк снаружи',
    { id: 'bank-scout', position: [BANK_ENTRANCE_POINT.x, 0, BANK_ENTRANCE_POINT.z], radius: 6, color: '#facc15', label: 'Банк' },
    'Подойдите ко входу в банк',
  );
}

function goToHeistApproach() {
  const store = useGameStore.getState();
  store.showDialog([
    { speaker: 'Вик', text: 'Охраны немного, камеры старые. План простой: заходим, вскрываем хранилище, уходим.' },
    { speaker: 'Вик', text: 'Как будешь готов — заходи внутрь и приступай.' },
  ]);
  store.setMissionStage(
    STAGE.APPROACH_HEIST,
    'Войдите в банк и доберитесь до хранилища',
    { id: 'bank-vault', position: [BANK_VAULT_POINT.x, 0, BANK_VAULT_POINT.z], radius: 5, color: '#f97316', label: 'Хранилище' },
    'Идите к хранилищу',
  );
}

function goToRobVault() {
  const store = useGameStore.getState();
  store.setMissionStage(
    STAGE.ROB_VAULT,
    'Вскройте хранилище (удерживайте E)',
    { id: 'bank-vault2', position: [BANK_VAULT_POINT.x, 0, BANK_VAULT_POINT.z], radius: 4, color: '#f97316', label: 'Хранилище' },
    'Удерживайте E рядом с хранилищем',
  );
}

export function completeRobbery() {
  const store = useGameStore.getState();
  store.addMoney(18500);
  store.setWanted(3);
  sfxCash();
  sfxAlert();
  startSiren();
  store.showBanner('Ограбление удалось! Полиция уже едет!');
  liveState.wantedTimer = 0;
  // activate a few police cars
  let activated = 0;
  for (const v of vehicleRegistry.values()) {
    if (v.kind === 'police' && activated < 3) {
      v.active = true;
      activated++;
    }
  }
  store.setMissionStage(
    STAGE.ESCAPE_TO_CAR,
    'Бегите к машине для отхода!',
    { id: 'getaway', position: [GETAWAY_CAR_SPAWN.x, 0, GETAWAY_CAR_SPAWN.z], radius: 5, color: '#f97316', label: 'Машина' },
    'Сядьте в машину и уезжайте',
  );
}

function goToLoseCops() {
  const store = useGameStore.getState();
  store.setMissionStage(
    STAGE.LOSE_COPS,
    'Оторвитесь от полиции и доберитесь до укрытия',
    { id: 'safehouse', position: [SAFEHOUSE_POINT.x, 0, SAFEHOUSE_POINT.z], radius: 7, color: '#22c55e', label: 'Укрытие' },
    'Не попадайтесь на глаза полиции',
  );
}

function finishHeist() {
  const store = useGameStore.getState();
  stopSiren();
  store.setWanted(0);
  for (const v of vehicleRegistry.values()) {
    if (v.kind === 'police') v.active = false;
  }
  store.showDialog([
    { speaker: 'Вик', text: 'Оторвались! Ты не растерял хватку, Алекс.' },
    { speaker: 'Алекс', text: 'Это было только начало... Город снова наш.' },
  ]);
  store.setMissionStage(STAGE.FREE_ROAM, 'Свободная прогулка по городу', null, 'История завершена. Исследуйте город!');
  store.finishGame('Ограбление банка удалось');
}

export function checkMissionTriggers() {
  const store = useGameStore.getState();
  const stage = store.missionStage;
  const p = liveState.player.position;
  const inVehicle = liveState.controlledVehicleId !== null;

  switch (stage) {
    case STAGE.GO_TO_VIC: {
      if (!inVehicle && dist2D(p, VIC_HOUSE_POINT) < 5) {
        goToGetCar();
      }
      break;
    }
    case STAGE.GET_CAR: {
      if (liveState.controlledVehicleId === 'missionCar1') {
        goToGarage();
      }
      break;
    }
    case STAGE.DRIVE_TO_GARAGE: {
      if (inVehicle && liveState.controlledVehicleId === 'missionCar1' && dist2D(p, GARAGE_POINT) < 7) {
        goToScoutBank();
      }
      break;
    }
    case STAGE.SCOUT_BANK: {
      if (!inVehicle && dist2D(p, BANK_ENTRANCE_POINT) < 6) {
        goToHeistApproach();
      }
      break;
    }
    case STAGE.APPROACH_HEIST: {
      if (!inVehicle && dist2D(p, BANK_VAULT_POINT) < 5) {
        goToRobVault();
      }
      break;
    }
    case STAGE.ESCAPE_TO_CAR: {
      if (liveState.controlledVehicleId === 'getawayCar') {
        goToLoseCops();
      }
      break;
    }
    case STAGE.LOSE_COPS: {
      if (inVehicle && dist2D(p, SAFEHOUSE_POINT) < 7) {
        finishHeist();
      }
      break;
    }
    default:
      break;
  }
}

export function isNearVaultForRobbery() {
  const store = useGameStore.getState();
  if (store.missionStage !== STAGE.ROB_VAULT) return false;
  return dist2D(liveState.player.position, BANK_VAULT_POINT) < 4;
}
