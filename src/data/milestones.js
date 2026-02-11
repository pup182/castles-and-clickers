// Dungeon milestone definitions with rewards

// Dungeon tiers as an array for easy iteration
// Must match dungeonThemes.js level ranges
export const DUNGEON_TIERS = [
  { id: 1, name: 'Crystal Caves', minLevel: 1, maxLevel: 5, theme: 'cave', color: '#06b6d4' },
  { id: 2, name: 'Ancient Crypt', minLevel: 6, maxLevel: 10, theme: 'crypt', color: '#84cc16' },
  { id: 3, name: 'Dark Forest', minLevel: 11, maxLevel: 15, theme: 'forest', color: '#22c55e' },
  { id: 4, name: 'Ruined Castle', minLevel: 16, maxLevel: 20, theme: 'castle', color: '#f59e0b' },
  { id: 5, name: 'Volcanic Depths', minLevel: 21, maxLevel: 25, theme: 'volcano', color: '#ef4444' },
  { id: 6, name: 'The Void', minLevel: 26, maxLevel: 30, theme: 'void', color: '#a855f7' },
];

// Legacy tier lookup by ID
export const DUNGEON_TIERS_BY_ID = {
  1: { name: 'Crystal Caves', levels: [1, 5], theme: 'cave', color: '#06b6d4' },
  2: { name: 'Ancient Crypt', levels: [6, 10], theme: 'crypt', color: '#84cc16' },
  3: { name: 'Dark Forest', levels: [11, 15], theme: 'forest', color: '#22c55e' },
  4: { name: 'Ruined Castle', levels: [16, 20], theme: 'castle', color: '#f59e0b' },
  5: { name: 'Volcanic Depths', levels: [21, 25], theme: 'volcano', color: '#ef4444' },
  6: { name: 'The Void', levels: [26, 30], theme: 'void', color: '#a855f7' },
};

export const MILESTONES = {
  5: {
    id: 'milestone_5',
    level: 5,
    name: 'Goblin Slayer',
    description: 'Defeat the Goblin Overlord',
    emoji: '👺',
    challengeBoss: {
      id: 'goblin_overlord',
      name: 'Goblin Overlord',
      emoji: '👹',
      baseStats: { maxHp: 300, attack: 18, defense: 8, speed: 8 },
      abilities: ['war_cry', 'power_attack', 'summon_minions'],
      aiType: 'boss',
      phases: [
        { hpPercent: 100, abilities: ['power_attack', 'war_cry'] },
        { hpPercent: 50, abilities: ['power_attack', 'summon_minions'] },
      ],
    },
    rewards: {
      gold: 500,
      permanentBonus: { goldFind: 0.05 },
      unlocks: [],
    },
    firstTimeOnly: true,
  },

  10: {
    id: 'milestone_10',
    level: 10,
    name: 'Crypt Clearer',
    description: 'Defeat the Undead General',
    emoji: '💀',
    challengeBoss: {
      id: 'undead_general',
      name: 'Undead General',
      emoji: '⚔️',
      baseStats: { maxHp: 600, attack: 22, defense: 15, speed: 7 },
      abilities: ['death_coil', 'raise_dead', 'intimidate'],
      aiType: 'boss',
      phases: [
        { hpPercent: 100, abilities: ['death_coil', 'intimidate'] },
        { hpPercent: 60, abilities: ['raise_dead', 'death_coil'] },
        { hpPercent: 30, abilities: ['death_coil', 'soul_drain'], enraged: true },
      ],
    },
    rewards: {
      gold: 1500,
      permanentBonus: { xpGain: 0.10 },
      unlocks: ['tier2_affixes'],
      partySlot: true, // +1 party size (up to 5)
    },
    firstTimeOnly: true,
  },

  15: {
    id: 'milestone_15',
    level: 15,
    name: 'Forest Guardian',
    description: 'Defeat the Ancient Treant',
    emoji: '🌳',
    challengeBoss: {
      id: 'ancient_treant',
      name: 'Ancient Treant',
      emoji: '🌲',
      baseStats: { maxHp: 900, attack: 35, defense: 20, speed: 3 },
      abilities: ['entangle', 'regenerate', 'tail_swipe', 'shield_wall'],
      aiType: 'boss',
      phases: [
        { hpPercent: 100, abilities: ['entangle', 'tail_swipe'] },
        { hpPercent: 60, abilities: ['regenerate', 'entangle', 'tail_swipe'] },
        { hpPercent: 30, abilities: ['tail_swipe', 'shield_wall'], enraged: true },
      ],
    },
    rewards: {
      gold: 3000,
      permanentBonus: { critChance: 0.05 },
      unlocks: ['raids', 'tier3_affixes'],
    },
    firstTimeOnly: true,
  },

  20: {
    id: 'milestone_20',
    level: 20,
    name: 'Demon Vanquisher',
    description: 'Defeat the Demon Prince',
    emoji: '😈',
    challengeBoss: {
      id: 'demon_prince',
      name: 'Demon Prince',
      emoji: '👿',
      baseStats: { maxHp: 1200, attack: 50, defense: 25, speed: 10 },
      abilities: ['fire_breath', 'terrifying_roar', 'dark_heal', 'inferno_breath'],
      aiType: 'boss',
      phases: [
        { hpPercent: 100, abilities: ['fire_breath', 'terrifying_roar'] },
        { hpPercent: 50, abilities: ['inferno_breath', 'dark_heal'] },
        { hpPercent: 25, abilities: ['inferno_breath', 'soul_drain'], enraged: true },
      ],
    },
    rewards: {
      gold: 5000,
      permanentBonus: { damage: 0.10 },
      unlocks: ['raid_dragon_sanctum'],
    },
    firstTimeOnly: true,
  },

  25: {
    id: 'milestone_25',
    level: 25,
    name: 'Dragonslayer',
    description: 'Defeat the Ancient Dragon',
    emoji: '🐉',
    challengeBoss: {
      id: 'ancient_dragon_milestone',
      name: 'Ancient Dragon',
      emoji: '🐲',
      baseStats: { maxHp: 2000, attack: 65, defense: 35, speed: 8 },
      abilities: ['fire_breath', 'tail_swipe', 'wing_buffet', 'inferno_breath', 'terrifying_roar'],
      aiType: 'boss',
      phases: [
        { hpPercent: 100, abilities: ['fire_breath', 'tail_swipe'] },
        { hpPercent: 70, abilities: ['wing_buffet', 'fire_breath'] },
        { hpPercent: 40, abilities: ['inferno_breath', 'terrifying_roar'] },
        { hpPercent: 20, abilities: ['inferno_breath', 'tail_swipe'], enraged: true },
      ],
    },
    rewards: {
      gold: 10000,
      permanentBonus: { defense: 0.10 },
      unlocks: ['raid_lich_throne'],
    },
    firstTimeOnly: true,
  },

  30: {
    id: 'milestone_30',
    level: 30,
    name: 'Lich King Slayer',
    description: 'Defeat the Empowered Lich King',
    emoji: '👑',
    challengeBoss: {
      id: 'lich_king_empowered',
      name: 'Empowered Lich King',
      emoji: '💀',
      baseStats: { maxHp: 3000, attack: 80, defense: 40, speed: 12 },
      abilities: ['death_coil', 'soul_drain', 'raise_dead', 'frost_bolt', 'phase_shift', 'curse'],
      aiType: 'boss',
      phases: [
        { hpPercent: 100, abilities: ['death_coil', 'frost_bolt'] },
        { hpPercent: 75, abilities: ['raise_dead', 'curse'] },
        { hpPercent: 50, abilities: ['soul_drain', 'phase_shift'] },
        { hpPercent: 25, abilities: ['soul_drain', 'death_coil', 'frost_bolt'], enraged: true },
      ],
    },
    rewards: {
      gold: 25000,
      permanentBonus: { allStats: 0.15 },
      unlocks: ['ascension_mode'],
    },
    firstTimeOnly: true,
  },
};

// Get milestone for a dungeon level
export const getMilestone = (level) => MILESTONES[level];

// Alias for getMilestone
export const getMilestoneForLevel = getMilestone;

// Check if a level is a milestone level
export const isMilestoneLevel = (level) => !!MILESTONES[level];

// Get tier for a dungeon level
export const getDungeonTier = (level) => {
  for (const [tier, data] of Object.entries(DUNGEON_TIERS)) {
    if (level >= data.levels[0] && level <= data.levels[1]) {
      return { tier: parseInt(tier), ...data };
    }
  }
  return { tier: 6, ...DUNGEON_TIERS[6] }; // Default to max tier
};

// Get all unclaimed milestone rewards
export const getUnclaimedMilestones = (highestCleared, claimedMilestones = []) => {
  return Object.values(MILESTONES).filter(m =>
    m.level <= highestCleared && !claimedMilestones.includes(m.id)
  );
};

// Calculate total permanent bonuses from milestones
export const calculateMilestoneBonuses = (claimedMilestones = []) => {
  const bonuses = {
    goldFind: 0,
    xpGain: 0,
    critChance: 0,
    damage: 0,
    defense: 0,
    allStats: 0,
  };

  for (const milestoneId of claimedMilestones) {
    const milestone = Object.values(MILESTONES).find(m => m.id === milestoneId);
    if (milestone?.rewards?.permanentBonus) {
      for (const [stat, value] of Object.entries(milestone.rewards.permanentBonus)) {
        if (bonuses[stat] !== undefined) {
          bonuses[stat] += value;
        }
      }
    }
  }

  return bonuses;
};

// Check what's unlocked based on claimed milestones
export const getUnlocks = (claimedMilestones = []) => {
  const unlocks = new Set();

  for (const milestoneId of claimedMilestones) {
    const milestone = Object.values(MILESTONES).find(m => m.id === milestoneId);
    if (milestone?.rewards?.unlocks) {
      milestone.rewards.unlocks.forEach(u => unlocks.add(u));
    }
  }

  return unlocks;
};

// Check if elite dungeons are unlocked
export const hasEliteDungeonsUnlocked = (claimedMilestones) =>
  getUnlocks(claimedMilestones).has('elite_dungeons');

// Check if raids are unlocked
export const hasRaidsUnlocked = (claimedMilestones) =>
  getUnlocks(claimedMilestones).has('raids');

// Check if ascension mode is unlocked
export const hasAscensionUnlocked = (claimedMilestones) =>
  getUnlocks(claimedMilestones).has('ascension_mode');

// Get max party size based on milestones
export const getMaxPartySize = (claimedMilestones = []) => {
  let size = 4; // Base party size
  for (const milestoneId of claimedMilestones) {
    const milestone = Object.values(MILESTONES).find(m => m.id === milestoneId);
    if (milestone?.rewards?.partySlot) {
      size += 1;
    }
  }
  return Math.min(size, 6); // Cap at 6
};
