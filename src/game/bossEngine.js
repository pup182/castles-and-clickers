// Boss Phase and Mechanic Engine
// Handles world boss and raid boss phase transitions and special mechanics

import { getWorldBossForLevel } from '../data/worldBosses';
import { MONSTERS } from '../data/monsters';

// Track boss state during combat
// Map<bossId, BossState>
const bossStates = new Map();

// Initialize boss state
export const initBossState = (boss) => {
  const state = {
    currentPhaseIndex: 0,
    lastHpThreshold: 100,
    immuneUntilTurn: 0,
    summonedAdds: [],
    enraged: false,
    phasesTriggered: [true], // First phase is always active
  };
  bossStates.set(boss.id, state);
  return state;
};

// Get boss state
export const getBossState = (bossId) => {
  return bossStates.get(bossId);
};

// Reset all boss states (new dungeon)
export const resetBossStates = () => {
  bossStates.clear();
};

// Get current phase for a boss
export const getCurrentPhase = (boss) => {
  const state = getBossState(boss.id);
  if (!state || !boss.phases) return null;

  return boss.phases[state.currentPhaseIndex];
};

// Check if boss should transition to a new phase
export const checkPhaseTransition = (boss, currentHp, maxHp) => {
  const state = getBossState(boss.id);
  if (!state || !boss.phases) return null;

  const hpPercent = (currentHp / maxHp) * 100;

  // Find the next phase we haven't triggered yet
  for (let i = state.currentPhaseIndex + 1; i < boss.phases.length; i++) {
    const phase = boss.phases[i];
    if (hpPercent <= phase.hpPercent && !state.phasesTriggered[i]) {
      // Trigger this phase
      state.currentPhaseIndex = i;
      state.phasesTriggered[i] = true;
      state.lastHpThreshold = phase.hpPercent;

      return {
        newPhase: phase,
        phaseIndex: i,
        message: phase.phaseTransitionMessage || `${boss.name} enters a new phase!`,
        onPhaseStart: phase.onPhaseStart || null,
        enraged: phase.enraged || false,
      };
    }
  }

  return null;
};

// Get boss abilities for current phase
export const getBossAbilities = (boss) => {
  const phase = getCurrentPhase(boss);
  if (phase) {
    return phase.abilities;
  }
  return boss.abilities || [];
};

// Get boss passive bonuses for current phase
export const getBossPhasePassive = (boss) => {
  const state = getBossState(boss.id);
  if (!state || !boss.phases) return null;

  const phase = boss.phases[state.currentPhaseIndex];
  return phase?.passive || null;
};

// Check if boss is immune
export const isBossImmune = (boss, currentTurn) => {
  const state = getBossState(boss.id);
  if (!state) return false;

  return state.immuneUntilTurn > currentTurn;
};

// Set boss immunity
export const setBossImmunity = (boss, duration, currentTurn) => {
  const state = getBossState(boss.id);
  if (!state) return;

  state.immuneUntilTurn = currentTurn + duration;
};

// Check if boss is enraged
export const isBossEnraged = (boss) => {
  const state = getBossState(boss.id);
  if (!state) return false;

  return state.enraged;
};

// Set boss enraged status
export const setBossEnraged = (boss, enraged = true) => {
  const state = getBossState(boss.id);
  if (!state) return;

  state.enraged = enraged;
};

// Process phase start actions (summon adds, immunity, etc.)
export const processPhaseStartActions = (boss, phaseAction, context) => {
  const results = {
    summonedMonsters: [],
    immunityGranted: false,
    immunityMessage: null,
  };

  if (!phaseAction) return results;

  // Summon adds
  if (phaseAction.summonAdds) {
    const { type, count } = phaseAction.summonAdds;
    const monsterTemplate = MONSTERS[type];

    if (monsterTemplate) {
      for (let i = 0; i < count; i++) {
        // Create a scaled add based on boss level
        const scaleFactor = context.scaleFactor || 1;
        const add = {
          id: `add_${boss.id}_${Date.now()}_${i}`,
          templateId: type,
          name: `${monsterTemplate.name}`,
          emoji: monsterTemplate.emoji,
          isBoss: false,
          isAdd: true, // Mark as summoned add
          summonedBy: boss.id,
          position: {
            x: boss.position.x + (Math.random() > 0.5 ? 1 : -1) * (i + 1),
            y: boss.position.y + (Math.random() > 0.5 ? 1 : -1) * (i % 2 === 0 ? 1 : 0),
          },
          roomIndex: boss.roomIndex,
          stats: {
            maxHp: Math.floor(monsterTemplate.baseStats.maxHp * scaleFactor * 0.5), // Adds are weaker
            hp: Math.floor(monsterTemplate.baseStats.maxHp * scaleFactor * 0.5),
            attack: Math.floor(monsterTemplate.baseStats.attack * scaleFactor * 0.5),
            defense: Math.floor(monsterTemplate.baseStats.defense * scaleFactor * 0.5),
            speed: monsterTemplate.baseStats.speed,
          },
          abilities: monsterTemplate.abilities || [],
          aiType: monsterTemplate.aiType || 'aggressive',
          passive: monsterTemplate.passive || null,
          xpReward: Math.floor(monsterTemplate.xpReward * scaleFactor * 0.25),
          goldReward: {
            min: Math.floor(monsterTemplate.goldReward.min * scaleFactor * 0.25),
            max: Math.floor(monsterTemplate.goldReward.max * scaleFactor * 0.25),
          },
        };

        results.summonedMonsters.push(add);

        // Track in boss state
        const state = getBossState(boss.id);
        if (state) {
          state.summonedAdds.push(add.id);
        }
      }
    }
  }

  // Immunity phase
  if (phaseAction.immunityPhase) {
    const { duration, message } = phaseAction.immunityPhase;
    setBossImmunity(boss, duration, context.currentTurn || 0);
    results.immunityGranted = true;
    results.immunityMessage = message || `${boss.name} becomes immune to damage!`;
  }

  return results;
};

// Calculate boss damage bonus from phase
export const getBossPhaseDamageBonus = (boss) => {
  const passive = getBossPhasePassive(boss);
  if (!passive) return 0;

  return passive.damageBonus || 0;
};

// Calculate boss damage reduction from phase
export const getBossPhaseDamageReduction = (boss) => {
  const passive = getBossPhasePassive(boss);
  if (!passive) return 0;

  return passive.damageReduction || 0;
};

// Calculate boss lifesteal from phase
export const getBossPhaseLifesteal = (boss) => {
  const passive = getBossPhasePassive(boss);
  if (!passive) return boss.passive?.lifesteal || 0;

  return passive.lifesteal || boss.passive?.lifesteal || 0;
};

// Get enrage damage bonus
export const getEnrageDamageBonus = (boss) => {
  const state = getBossState(boss.id);
  if (!state || !state.enraged) return 0;

  // Standard enrage bonus is 50%
  return 0.5;
};

// Check if this dungeon level has a world boss
export const shouldSpawnWorldBoss = (level) => {
  const worldBoss = getWorldBossForLevel(level);
  return worldBoss !== null;
};

// Create world boss monster instance
export const createWorldBossInstance = (level, scaleFactor = 1) => {
  const template = getWorldBossForLevel(level);
  if (!template) return null;

  const boss = {
    id: `world_boss_${template.id}_${Date.now()}`,
    templateId: template.id,
    name: template.name,
    title: template.title,
    emoji: template.emoji,
    isBoss: true,
    isWorldBoss: true,
    position: { x: 0, y: 0 }, // Will be set by caller
    roomIndex: -1, // Will be set by caller
    stats: {
      maxHp: Math.floor(template.baseStats.maxHp * scaleFactor),
      hp: Math.floor(template.baseStats.maxHp * scaleFactor),
      attack: Math.floor(template.baseStats.attack * scaleFactor),
      defense: Math.floor(template.baseStats.defense * scaleFactor),
      speed: template.baseStats.speed,
    },
    abilities: template.abilities || [],
    aiType: template.aiType || 'boss',
    passive: template.passive || null,
    phases: template.phases || null,
    summonType: template.summonType || null,
    attackRange: template.attackRange || 1,
    xpReward: Math.floor(template.xpReward * scaleFactor),
    goldReward: {
      min: Math.floor(template.goldReward.min * scaleFactor),
      max: Math.floor(template.goldReward.max * scaleFactor),
    },
    uniqueDrop: template.uniqueDrop,
    guaranteedRarity: template.guaranteedRarity,
    lore: template.lore,
  };

  // Initialize boss state
  initBossState(boss);

  return boss;
};

// Create raid boss monster instance
export const createRaidBossInstance = (bossTemplate, scaleFactor = 1, statMultiplier = 1) => {
  const totalMultiplier = scaleFactor * statMultiplier;

  const boss = {
    id: `raid_boss_${bossTemplate.id}_${Date.now()}`,
    templateId: bossTemplate.id,
    name: bossTemplate.name,
    emoji: bossTemplate.emoji,
    isBoss: true,
    isRaidBoss: true,
    position: { x: 0, y: 0 }, // Will be set by caller
    roomIndex: -1, // Will be set by caller
    stats: {
      maxHp: Math.floor(bossTemplate.baseStats.maxHp * totalMultiplier),
      hp: Math.floor(bossTemplate.baseStats.maxHp * totalMultiplier),
      attack: Math.floor(bossTemplate.baseStats.attack * totalMultiplier),
      defense: Math.floor(bossTemplate.baseStats.defense * totalMultiplier),
      speed: bossTemplate.baseStats.speed,
    },
    abilities: bossTemplate.abilities || [],
    aiType: bossTemplate.aiType || 'boss',
    passive: bossTemplate.passive || null,
    phases: bossTemplate.phases || null,
    summonType: bossTemplate.summonType || null,
    attackRange: bossTemplate.attackRange || 1,
    xpReward: Math.floor(200 * totalMultiplier), // Base raid boss XP
    goldReward: {
      min: Math.floor(500 * totalMultiplier),
      max: Math.floor(1000 * totalMultiplier),
    },
  };

  // Initialize boss state
  initBossState(boss);

  return boss;
};

// Get world boss loot
export const getWorldBossLoot = (boss) => {
  const results = {
    uniqueItemId: null,
    guaranteedRarity: 'epic',
  };

  if (boss.uniqueDrop) {
    results.uniqueItemId = boss.uniqueDrop;
    results.guaranteedRarity = 'legendary';
  } else {
    results.guaranteedRarity = boss.guaranteedRarity || 'epic';
  }

  return results;
};
