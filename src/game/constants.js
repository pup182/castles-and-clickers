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
// Vision range for fog of war
export const VISION_RANGE = 4;
// Viewport dimensions
export const VIEWPORT_WIDTH = 20;
export const VIEWPORT_HEIGHT = 15;

// Roll initiative for a unit
export const rollInitiative = (unit) => {
  const d20 = Math.floor(Math.random() * 20) + 1;
  return (unit.stats?.speed || 5) + d20;
};

// Speed mechanics calculations
export const calculateDodgeChance = (defenderSpeed, attackerSpeed) => {
  // Speed threshold system - slow classes don't dodge, fast classes are evasive
  // Threshold of 6 means tanks/casters don't dodge, rogues/rangers do
  // Base: 5% per point above threshold
  // Bonus: 4% per point of speed advantage
  // Cap: 60%
  const SPEED_THRESHOLD = 6;

  // Guard against undefined/NaN values
  const dSpeed = defenderSpeed || 0;
  const aSpeed = attackerSpeed || 0;

  if (dSpeed <= SPEED_THRESHOLD) return 0;

  const baseDodge = (dSpeed - SPEED_THRESHOLD) * 0.05;
  const speedDiff = dSpeed - aSpeed;
  const speedBonus = Math.max(0, speedDiff * 0.04);
  return Math.min(0.60, baseDodge + speedBonus);
};

export const calculateDoubleAttackChance = (attackerSpeed, defenderSpeed) => {
  // 3% per speed advantage, max 30%
  const speedDiff = attackerSpeed - defenderSpeed;
  return Math.min(0.3, Math.max(0, speedDiff * 0.03));
};

export const calculateMoveDistance = (speed) => {
  // Base 1 tile, +1 tile per 8 speed, max 3 tiles
  return Math.min(3, 1 + Math.floor(speed / 8));
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
