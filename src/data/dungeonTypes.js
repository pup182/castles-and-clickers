// Dungeon type and affix definitions

export const DUNGEON_TYPE = {
  NORMAL: 'normal',
  ELITE: 'elite',
  RAID: 'raid',
};

export const DUNGEON_TYPES = {
  [DUNGEON_TYPE.NORMAL]: {
    id: 'normal',
    name: 'Normal',
    emoji: '🏰',
    description: 'Standard dungeon with normal difficulty',
    statMultiplier: 1.0,
    lootMultiplier: 1.0,
    xpMultiplier: 1.0,
    goldMultiplier: 1.0,
    hasAffix: false,
    unlockRequirement: null, // Always available
  },

  [DUNGEON_TYPE.ELITE]: {
    id: 'elite',
    name: 'Elite',
    emoji: '⚔️',
    description: 'Harder enemies with random modifiers, better rewards',
    statMultiplier: 1.5,
    lootMultiplier: 2.0,
    xpMultiplier: 1.5,
    goldMultiplier: 1.75,
    hasAffix: true,
    affixCount: 1, // Number of random affixes
    unlockRequirement: { dungeonLevel: 5 },
  },

  [DUNGEON_TYPE.RAID]: {
    id: 'raid',
    name: 'Raid',
    emoji: '🐉',
    description: 'Multi-wing challenge with unique rewards',
    statMultiplier: 2.0,
    lootMultiplier: 3.0,
    xpMultiplier: 2.0,
    goldMultiplier: 2.5,
    hasAffix: true,
    affixCount: 2,
    unlockRequirement: { dungeonLevel: 15 },
    playerTriggered: true, // Must be manually started by player
    weeklyLockout: true,
    guaranteedUnique: true, // Final boss drops unique item
  },
};

// Dungeon affixes that modify enemy stats/behavior
export const DUNGEON_AFFIXES = {
  // Stat Modifiers
  fortified: {
    id: 'fortified',
    name: 'Fortified',
    emoji: '🛡️',
    description: 'Enemies have +30% HP',
    effect: { hpMultiplier: 1.3 },
    tier: 1,
  },
  enraged: {
    id: 'enraged',
    name: 'Enraged',
    emoji: '😤',
    description: 'Enemies deal +25% damage',
    effect: { damageMultiplier: 1.25 },
    tier: 1,
  },
  swift: {
    id: 'swift',
    name: 'Swift',
    emoji: '⚡',
    description: 'Enemies have +5 speed',
    effect: { speedBonus: 5 },
    tier: 1,
  },
  armored: {
    id: 'armored',
    name: 'Armored',
    emoji: '🔰',
    description: 'Enemies have +20% defense',
    effect: { defenseMultiplier: 1.2 },
    tier: 1,
  },

  // Status Appliers
  venomous: {
    id: 'venomous',
    name: 'Venomous',
    emoji: '🟢',
    description: 'Enemy attacks apply poison',
    effect: { onHitStatus: { id: 'poison', duration: 2 } },
    tier: 2,
  },
  burning: {
    id: 'burning',
    name: 'Burning',
    emoji: '🔥',
    description: 'Enemy attacks apply burn',
    effect: { onHitStatus: { id: 'burn', duration: 2 } },
    tier: 2,
  },
  chilling: {
    id: 'chilling',
    name: 'Chilling',
    emoji: '❄️',
    description: 'Enemy attacks apply slow',
    effect: { onHitStatus: { id: 'slow', duration: 1 } },
    tier: 2,
  },
  cursing: {
    id: 'cursing',
    name: 'Cursing',
    emoji: '💜',
    description: 'Enemy attacks apply curse (reduced healing)',
    effect: { onHitStatus: { id: 'cursed', duration: 2 } },
    tier: 2,
  },

  // Special Mechanics
  vampiric: {
    id: 'vampiric',
    name: 'Vampiric',
    emoji: '🧛',
    description: 'Enemies heal 15% of damage dealt',
    effect: { lifesteal: 0.15 },
    tier: 2,
  },
  thorny: {
    id: 'thorny',
    name: 'Thorny',
    emoji: '🌵',
    description: 'Enemies reflect 10% damage taken',
    effect: { reflectDamage: 0.1 },
    tier: 2,
  },
  bolstering: {
    id: 'bolstering',
    name: 'Bolstering',
    emoji: '📯',
    description: 'When an enemy dies, others gain +10% attack',
    effect: { onDeathAllyBuff: { attack: 0.1 } },
    tier: 3,
  },
  shielded: {
    id: 'shielded',
    name: 'Shielded',
    emoji: '🛡️',
    description: 'Enemies start combat with a damage shield',
    effect: { startingShield: 0.2 }, // 20% max HP as shield
    tier: 3,
  },
  regenerating: {
    id: 'regenerating',
    name: 'Regenerating',
    emoji: '💚',
    description: 'Enemies heal 3% HP per turn',
    effect: { regenPercent: 0.03 },
    tier: 3,
  },
  explosive: {
    id: 'explosive',
    name: 'Explosive',
    emoji: '💥',
    description: 'Enemies explode on death, dealing 20% max HP damage',
    effect: { deathExplosion: 0.2 },
    tier: 3,
  },
};

// Get random affixes for an elite/raid dungeon
export const rollDungeonAffixes = (count, minTier = 1, maxTier = 3) => {
  const eligible = Object.values(DUNGEON_AFFIXES).filter(
    a => a.tier >= minTier && a.tier <= maxTier
  );

  const selected = [];
  const available = [...eligible];

  for (let i = 0; i < count && available.length > 0; i++) {
    const index = Math.floor(Math.random() * available.length);
    selected.push(available[index]);
    available.splice(index, 1);
  }

  return selected;
};

// Apply affix effects to monster stats
export const applyAffixesToMonster = (monster, affixes) => {
  const modified = { ...monster, stats: { ...monster.stats } };

  for (const affix of affixes) {
    const effect = affix.effect;

    if (effect.hpMultiplier) {
      modified.stats.maxHp = Math.floor(modified.stats.maxHp * effect.hpMultiplier);
      modified.stats.hp = modified.stats.maxHp;
    }
    if (effect.damageMultiplier) {
      modified.stats.attack = Math.floor(modified.stats.attack * effect.damageMultiplier);
    }
    if (effect.defenseMultiplier) {
      modified.stats.defense = Math.floor(modified.stats.defense * effect.defenseMultiplier);
    }
    if (effect.speedBonus) {
      modified.stats.speed += effect.speedBonus;
    }
    if (effect.lifesteal) {
      modified.passive = { ...(modified.passive || {}), lifesteal: effect.lifesteal };
    }
    if (effect.onHitStatus) {
      modified.onHitStatus = effect.onHitStatus;
    }
    if (effect.reflectDamage) {
      modified.passive = { ...(modified.passive || {}), reflectDamage: effect.reflectDamage };
    }
    if (effect.regenPercent) {
      modified.passive = { ...(modified.passive || {}), regenPercent: effect.regenPercent };
    }
    if (effect.startingShield) {
      modified.shield = Math.floor(modified.stats.maxHp * effect.startingShield);
    }
    if (effect.deathExplosion) {
      modified.deathExplosion = effect.deathExplosion;
    }
  }

  return modified;
};

// Get dungeon type info
export const getDungeonType = (typeId) => DUNGEON_TYPES[typeId];

// Check if dungeon type is unlocked
export const isDungeonTypeUnlocked = (typeId, highestDungeonCleared = 0) => {
  const type = DUNGEON_TYPES[typeId];
  if (!type) return false;
  if (!type.unlockRequirement) return true;

  const req = type.unlockRequirement;
  if (req.dungeonLevel) {
    return highestDungeonCleared >= req.dungeonLevel;
  }

  return false;
};
