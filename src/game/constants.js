import { getHeroUniqueItems, getUniquePassiveBonuses } from './uniqueEngine';
import { getFirstTurnSpeedBonus } from './skillEngine';
import {
  SPEED_THRESHOLD, BASE_DODGE_PER_SPEED, SPEED_BONUS_PER_DIFF, MAX_DODGE_CHANCE,
  DOUBLE_ATTACK_PER_SPEED, MAX_DOUBLE_ATTACK,
  MOVE_DISTANCE_PER_SPEED, MAX_MOVE_DISTANCE,
} from './balanceConstants';

// Combat phases
export const PHASES = {
  IDLE: 'idle',
  SETUP: 'setup',
  EXPLORING: 'exploring',
  COMBAT: 'combat',
  CLEARING: 'clearing',
  TRANSITIONING: 'transitioning',
  COMPLETE: 'complete',
  DEFEAT: 'defeat',
};

// Detection range for monsters (how far away they engage from)
export const DETECTION_RANGE = 7;
// Boss only engages when heroes are very close (prevents auto-aggro across dungeon)
export const BOSS_ENGAGE_RANGE = 3;
// Vision range for fog of war
export const VISION_RANGE = 4;
// Viewport dimensions
export const VIEWPORT_WIDTH = 20;
export const VIEWPORT_HEIGHT = 15;

// Roll initiative for a unit (applies unique speed multiplier and alwaysFirst for heroes)
export const rollInitiative = (unit) => {
  const d20 = Math.floor(Math.random() * 20) + 1;
  let speed = unit.stats?.speed || 5;
  // Apply unique item effects for heroes
  if (unit.isHero && unit.equipment) {
    const uniqueBonuses = getUniquePassiveBonuses(unit);
    // Eye of the Storm - speed multiplier
    speed = Math.floor(speed * (uniqueBonuses.speedMultiplier || 1));
    // Boots of Blinding Speed - always act first
    const uniques = getHeroUniqueItems(unit);
    if (uniques.some(item => item.uniquePower?.effect?.alwaysFirst)) {
      return Infinity;
    }
  }
  // Apply first turn speed bonus (Shaman Spirit Walk) - only applies at combat start
  if (unit.isHero && unit.skills) {
    const firstTurnBonus = getFirstTurnSpeedBonus(unit);
    if (firstTurnBonus > 0) {
      speed = Math.floor(speed * (1 + firstTurnBonus));
    }
  }
  return speed + d20;
};

// Speed mechanics calculations
export const calculateDodgeChance = (defenderSpeed, attackerSpeed) => {
  // Guard against undefined/NaN values
  const dSpeed = defenderSpeed || 0;
  const aSpeed = attackerSpeed || 0;

  if (dSpeed <= SPEED_THRESHOLD) return 0;

  const baseDodge = (dSpeed - SPEED_THRESHOLD) * BASE_DODGE_PER_SPEED;
  const speedDiff = dSpeed - aSpeed;
  const speedBonus = Math.max(0, speedDiff * SPEED_BONUS_PER_DIFF);
  return Math.min(MAX_DODGE_CHANCE, baseDodge + speedBonus);
};

export const calculateDoubleAttackChance = (attackerSpeed, defenderSpeed) => {
  const speedDiff = attackerSpeed - defenderSpeed;
  return Math.min(MAX_DOUBLE_ATTACK, Math.max(0, speedDiff * DOUBLE_ATTACK_PER_SPEED));
};

export const calculateMoveDistance = (speed) => {
  return Math.min(MAX_MOVE_DISTANCE, 1 + Math.floor(speed / MOVE_DISTANCE_PER_SPEED));
};

// Create sorted turn order from all units
export const createTurnOrder = (heroes, monsters) => {
  const allUnits = [
    ...heroes.map(h => ({ id: h.id, initiative: rollInitiative(h), isHero: true })),
    ...monsters.map(m => ({ id: m.id, initiative: rollInitiative(m), isHero: false })),
  ];

  // Sort by initiative descending, heroes win ties
  allUnits.sort((a, b) => {
    if (b.initiative !== a.initiative) return b.initiative - a.initiative;
    return a.isHero ? -1 : 1;
  });

  return allUnits.map(u => u.id);
};
