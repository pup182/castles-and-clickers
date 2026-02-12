// World Boss definitions
// World bosses appear at dungeon levels 5, 10, 15, 20, 25, 30
// They have unique mechanics, multiple phases, and drop special rewards

export const WORLD_BOSS_LEVELS = [5, 10, 15, 20, 25, 30];

// AI type for world bosses
const AI = {
  BOSS: 'boss',
};

export const WORLD_BOSSES = {
  // Level 5 - Crystal Guardian (Cave theme)
  crystal_guardian: {
    id: 'crystal_guardian',
    name: 'Crystal Guardian',
    title: 'Warden of the Deep',
    spriteId: 'world_boss_crystal',
    level: 5,
    tier: 1,
    isBoss: true,
    isWorldBoss: true,
    baseStats: { maxHp: 300, attack: 18, defense: 12, speed: 6 },
    xpReward: 150,
    goldReward: { min: 150, max: 300 },
    abilities: ['power_attack', 'shield_wall', 'crystal_shards'],
    aiType: AI.BOSS,
    attackRange: 2,
    passive: { reflectDamage: 0.15 },
    phases: [
      {
        hpPercent: 100,
        abilities: ['power_attack', 'shield_wall'],
        passive: null,
      },
      {
        hpPercent: 50,
        abilities: ['crystal_shards', 'shield_wall'],
        passive: { damageReduction: 0.2 },
        phaseTransitionMessage: 'The Crystal Guardian\'s form hardens!',
      },
    ],
    uniqueDrop: null, // Level 5 world boss doesn't drop unique
    guaranteedRarity: 'epic',
    lore: 'An ancient construct awakened by the miners who dug too deep.',
  },

  // Level 10 - Crypt Lord (Crypt theme)
  crypt_lord: {
    id: 'crypt_lord',
    name: 'Crypt Lord',
    title: 'Master of the Undead',
    spriteId: 'world_boss_crypt',
    level: 10,
    tier: 2,
    isBoss: true,
    isWorldBoss: true,
    baseStats: { maxHp: 500, attack: 28, defense: 15, speed: 7 },
    xpReward: 300,
    goldReward: { min: 300, max: 500 },
    abilities: ['death_coil', 'raise_dead', 'curse', 'drain_life'],
    aiType: AI.BOSS,
    attackRange: 3,
    passive: { lifesteal: 0.15 },
    phases: [
      {
        hpPercent: 100,
        abilities: ['death_coil', 'curse'],
        passive: null,
      },
      {
        hpPercent: 60,
        abilities: ['raise_dead', 'death_coil'],
        passive: null,
        phaseTransitionMessage: 'The Crypt Lord summons his fallen minions!',
        onPhaseStart: { summonAdds: { type: 'skeleton', count: 2 } },
      },
      {
        hpPercent: 30,
        abilities: ['drain_life', 'death_coil'],
        passive: { lifesteal: 0.30 },
        phaseTransitionMessage: 'The Crypt Lord drains the life from the air itself!',
      },
    ],
    summonType: 'skeleton',
    uniqueDrop: null, // Level 10 world boss doesn't drop unique
    guaranteedRarity: 'epic',
    lore: 'Once a noble king, now cursed to rule over the dead for eternity.',
  },

  // Level 15 - Forest Ancient (Forest theme)
  forest_ancient: {
    id: 'forest_ancient',
    name: 'Forest Ancient',
    title: 'Guardian of the Grove',
    spriteId: 'world_boss_forest',
    level: 15,
    tier: 3,
    isBoss: true,
    isWorldBoss: true,
    baseStats: { maxHp: 800, attack: 35, defense: 25, speed: 5 },
    xpReward: 500,
    goldReward: { min: 500, max: 800 },
    abilities: ['power_attack', 'regenerate', 'entangle', 'nature_wrath'],
    aiType: AI.BOSS,
    attackRange: 2,
    passive: { regenPercent: 0.03 },
    phases: [
      {
        hpPercent: 100,
        abilities: ['power_attack', 'entangle'],
        passive: { regenPercent: 0.03 },
      },
      {
        hpPercent: 60,
        abilities: ['regenerate', 'nature_wrath'],
        passive: { regenPercent: 0.05 },
        phaseTransitionMessage: 'The Forest Ancient draws power from the earth!',
      },
      {
        hpPercent: 30,
        abilities: ['nature_wrath', 'entangle'],
        passive: { regenPercent: 0.08, damageBonus: 0.25 },
        phaseTransitionMessage: 'The forest itself rises in fury!',
      },
    ],
    uniqueDrop: 'ancient_bark',
    guaranteedRarity: 'legendary',
    lore: 'The oldest tree in the forest, awakened to defend against invaders.',
  },

  // Level 20 - The Fallen King (Castle theme)
  fallen_king: {
    id: 'fallen_king',
    name: 'The Fallen King',
    title: 'Betrayer of Kingdoms',
    spriteId: 'world_boss_fallen',
    level: 20,
    tier: 4,
    isBoss: true,
    isWorldBoss: true,
    baseStats: { maxHp: 1200, attack: 50, defense: 35, speed: 8 },
    xpReward: 800,
    goldReward: { min: 800, max: 1200 },
    abilities: ['power_attack', 'cleave', 'intimidate', 'royal_decree', 'last_stand'],
    aiType: AI.BOSS,
    attackRange: 2,
    passive: null,
    phases: [
      {
        hpPercent: 100,
        abilities: ['power_attack', 'shield_wall'],
        passive: null,
      },
      {
        hpPercent: 50,
        abilities: ['cleave', 'summon_minions'],
        passive: { damageBonus: 0.25 },
        phaseTransitionMessage: 'The Fallen King enters a rage!',
        onPhaseStart: { summonAdds: { type: 'dark_knight', count: 2 } },
      },
      {
        hpPercent: 25,
        abilities: ['cleave', 'last_stand'],
        passive: { damageBonus: 0.50, damageReduction: 0.25 },
        phaseTransitionMessage: 'The Fallen King fights with desperate fury!',
      },
    ],
    summonType: 'dark_knight',
    uniqueDrop: 'crown_of_the_fallen',
    guaranteedRarity: 'legendary',
    lore: 'A once-noble king corrupted by ambition, now risen from death to reclaim his throne.',
  },

  // Level 25 - Inferno Lord (Volcano theme)
  inferno_lord: {
    id: 'inferno_lord',
    name: 'Inferno Lord',
    title: 'Master of Flames',
    spriteId: 'world_boss_inferno',
    level: 25,
    tier: 5,
    isBoss: true,
    isWorldBoss: true,
    baseStats: { maxHp: 1800, attack: 65, defense: 30, speed: 10 },
    xpReward: 1200,
    goldReward: { min: 1200, max: 1800 },
    abilities: ['fire_breath', 'inferno_breath', 'eruption', 'molten_armor', 'summon_minions'],
    aiType: AI.BOSS,
    attackRange: 3,
    passive: { reflectDamage: 0.10 },
    phases: [
      {
        hpPercent: 100,
        abilities: ['fire_breath', 'molten_armor'],
        passive: { reflectDamage: 0.10 },
      },
      {
        hpPercent: 70,
        abilities: ['inferno_breath', 'eruption'],
        passive: { reflectDamage: 0.15 },
        phaseTransitionMessage: 'The Inferno Lord\'s flames intensify!',
      },
      {
        hpPercent: 40,
        abilities: ['eruption', 'summon_minions'],
        passive: { reflectDamage: 0.20, damageBonus: 0.30 },
        phaseTransitionMessage: 'The Inferno Lord calls forth his burning servants!',
        onPhaseStart: { summonAdds: { type: 'fire_imp', count: 3 } },
      },
      {
        hpPercent: 15,
        abilities: ['inferno_breath', 'eruption'],
        passive: { damageBonus: 0.50 },
        phaseTransitionMessage: 'The Inferno Lord unleashes his full fury!',
      },
    ],
    summonType: 'fire_imp',
    uniqueDrop: 'magma_core',
    guaranteedRarity: 'legendary',
    lore: 'Born from the heart of the volcano, he seeks to engulf the world in flames.',
  },

  // Level 30 - Void Emperor (Void theme)
  void_emperor: {
    id: 'void_emperor',
    name: 'Void Emperor',
    title: 'Lord of Nothing',
    spriteId: 'world_boss_void',
    level: 30,
    tier: 6,
    isBoss: true,
    isWorldBoss: true,
    baseStats: { maxHp: 2500, attack: 80, defense: 40, speed: 12 },
    xpReward: 2000,
    goldReward: { min: 2000, max: 3000 },
    abilities: ['annihilate', 'dimensional_rift', 'entropy', 'void_aura', 'consume', 'phase_shift'],
    aiType: AI.BOSS,
    attackRange: 4,
    passive: { lifesteal: 0.15 },
    phases: [
      {
        hpPercent: 100,
        abilities: ['void_bolt', 'dimensional_rift'],
        passive: null,
      },
      {
        hpPercent: 75,
        abilities: ['entropy', 'consume'],
        passive: { lifesteal: 0.20 },
        phaseTransitionMessage: 'The Void Emperor begins to consume reality!',
      },
      {
        hpPercent: 50,
        abilities: ['dimensional_rift', 'void_aura'],
        passive: { damageReduction: 0.20 },
        phaseTransitionMessage: 'Reality warps around the Void Emperor!',
        onPhaseStart: { immunityPhase: { duration: 2, message: 'The Void Emperor becomes intangible!' } },
      },
      {
        hpPercent: 25,
        abilities: ['annihilate', 'entropy'],
        passive: { damageBonus: 0.50, lifesteal: 0.30 },
        phaseTransitionMessage: 'The Void Emperor transcends mortal limits!',
      },
    ],
    uniqueDrop: 'void_heart',
    guaranteedRarity: 'legendary',
    lore: 'A being from beyond the stars, seeking to unmake existence itself.',
  },
};

// Get world boss for a specific level
export const getWorldBossForLevel = (level) => {
  for (const boss of Object.values(WORLD_BOSSES)) {
    if (boss.level === level) {
      return boss;
    }
  }
  return null;
};

// Check if a level has a world boss
export const isWorldBossLevel = (level) => {
  return WORLD_BOSS_LEVELS.includes(level);
};

// Get all world bosses
export const getAllWorldBosses = () => Object.values(WORLD_BOSSES);

// Get world boss by ID
export const getWorldBoss = (id) => WORLD_BOSSES[id];

// Get world boss for a tier (1-6)
export const getWorldBossForTier = (tierId) => {
  for (const boss of Object.values(WORLD_BOSSES)) {
    if (boss.tier === tierId) {
      return boss;
    }
  }
  return null;
};

// Get world boss for any level in a zone (not just the boss level)
export const getZoneWorldBoss = (level) => {
  const tier = Math.ceil(level / 5);
  return getWorldBossForTier(tier);
};
