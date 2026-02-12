// Monster definitions by tier with abilities and AI types

// AI types (must match monsterAI.js AI_TYPE values)
const AI = {
  AGGRESSIVE: 'aggressive',
  TANK: 'tank',
  ASSASSIN: 'assassin',
  DEBUFFER: 'debuffer',
  SUPPORT: 'support',
  BOSS: 'boss',
};

export const MONSTERS = {
  // Tier 1 - Dungeon levels 1-5
  goblin: {
    id: 'goblin',
    name: 'Goblin',
    emoji: '👺',
    tier: 1,
    baseStats: { maxHp: 40, attack: 6, defense: 2, speed: 7 },
    xpReward: 10,
    goldReward: { min: 5, max: 15 },
    abilities: ['quick_strike'],
    aiType: AI.AGGRESSIVE,
  },
  rat: {
    id: 'rat',
    name: 'Giant Rat',
    emoji: '🐀',
    tier: 1,
    baseStats: { maxHp: 28, attack: 4, defense: 1, speed: 10 },
    xpReward: 5,
    goldReward: { min: 2, max: 8 },
    abilities: ['venomous_bite'],
    aiType: AI.AGGRESSIVE,
  },
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton',
    emoji: '💀',
    tier: 1,
    baseStats: { maxHp: 45, attack: 8, defense: 3, speed: 6 },
    xpReward: 12,
    goldReward: { min: 8, max: 20 },
    abilities: ['power_attack'],
    aiType: AI.AGGRESSIVE,
  },
  slime: {
    id: 'slime',
    name: 'Slime',
    emoji: '🟢',
    tier: 1,
    baseStats: { maxHp: 35, attack: 3, defense: 5, speed: 6 },
    xpReward: 6,
    goldReward: { min: 3, max: 10 },
    abilities: ['venomous_bite'],
    aiType: AI.TANK,
    passive: { reflectDamage: 0.1 }, // Slimes reflect 10% damage
  },
  giant_bat: {
    id: 'giant_bat',
    name: 'Giant Bat',
    emoji: '🦇',
    tier: 1,
    baseStats: { maxHp: 25, attack: 5, defense: 1, speed: 14 },
    xpReward: 7,
    goldReward: { min: 4, max: 12 },
    abilities: ['quick_strike'],
    aiType: AI.ASSASSIN,
    attackRange: 2, // Flying
  },

  // Tier 2 - Dungeon levels 6-10
  orc: {
    id: 'orc',
    name: 'Orc',
    emoji: '👹',
    tier: 2,
    baseStats: { maxHp: 75, attack: 14, defense: 6, speed: 7 },
    xpReward: 25,
    goldReward: { min: 15, max: 35 },
    abilities: ['cleave', 'war_cry'],
    aiType: AI.TANK,
  },
  wolf: {
    id: 'wolf',
    name: 'Dire Wolf',
    emoji: '🐺',
    tier: 2,
    baseStats: { maxHp: 55, attack: 12, defense: 4, speed: 12 },
    xpReward: 20,
    goldReward: { min: 10, max: 25 },
    abilities: ['quick_strike', 'rending_claws'],
    aiType: AI.ASSASSIN,
  },
  zombie: {
    id: 'zombie',
    name: 'Zombie',
    emoji: '🧟',
    tier: 2,
    baseStats: { maxHp: 100, attack: 10, defense: 8, speed: 5 },
    xpReward: 22,
    goldReward: { min: 12, max: 30 },
    abilities: ['venomous_bite', 'enrage'],
    aiType: AI.TANK,
    passive: { regenPercent: 0.02 }, // Zombies regenerate
  },
  giant_spider: {
    id: 'giant_spider',
    name: 'Giant Spider',
    emoji: '🕷️',
    tier: 2,
    baseStats: { maxHp: 70, attack: 16, defense: 5, speed: 9 },
    xpReward: 28,
    goldReward: { min: 18, max: 40 },
    abilities: ['venomous_bite', 'web_trap'],
    aiType: AI.DEBUFFER,
    attackRange: 2, // Web attacks
  },
  harpy: {
    id: 'harpy',
    name: 'Harpy',
    emoji: '🦅',
    tier: 2,
    baseStats: { maxHp: 50, attack: 18, defense: 3, speed: 14 },
    xpReward: 24,
    goldReward: { min: 14, max: 32 },
    abilities: ['quick_strike', 'blinding_dust'],
    aiType: AI.ASSASSIN,
    attackRange: 2, // Flying
  },

  // Tier 3 - Dungeon levels 11-15
  troll: {
    id: 'troll',
    name: 'Troll',
    emoji: '🧌',
    tier: 3,
    baseStats: { maxHp: 150, attack: 20, defense: 10, speed: 6 },
    xpReward: 50,
    goldReward: { min: 30, max: 60 },
    abilities: ['power_attack', 'regenerate', 'enrage'],
    aiType: AI.TANK,
    passive: { regenPercent: 0.05 }, // Trolls regenerate faster
  },
  ghost: {
    id: 'ghost',
    name: 'Ghost',
    emoji: '👻',
    tier: 3,
    baseStats: { maxHp: 75, attack: 25, defense: 2, speed: 15 },
    xpReward: 45,
    goldReward: { min: 25, max: 50 },
    abilities: ['curse', 'phase_shift', 'drain_life'],
    aiType: AI.DEBUFFER,
    attackRange: 3, // Ethereal
  },
  dark_knight: {
    id: 'dark_knight',
    name: 'Dark Knight',
    emoji: '🖤',
    tier: 3,
    baseStats: { maxHp: 130, attack: 22, defense: 15, speed: 7 },
    xpReward: 55,
    goldReward: { min: 35, max: 65 },
    abilities: ['power_attack', 'shield_wall', 'intimidate'],
    aiType: AI.TANK,
  },
  minotaur: {
    id: 'minotaur',
    name: 'Minotaur',
    emoji: '🐂',
    tier: 3,
    baseStats: { maxHp: 175, attack: 24, defense: 12, speed: 7 },
    xpReward: 60,
    goldReward: { min: 40, max: 75 },
    abilities: ['cleave', 'stunning_blow', 'enrage'],
    aiType: AI.AGGRESSIVE,
  },
  vampire: {
    id: 'vampire',
    name: 'Vampire',
    emoji: '🧛',
    tier: 3,
    baseStats: { maxHp: 110, attack: 28, defense: 8, speed: 12 },
    xpReward: 52,
    goldReward: { min: 35, max: 68 },
    abilities: ['drain_life', 'charm', 'phase_shift'],
    aiType: AI.ASSASSIN,
    passive: { lifesteal: 0.25 },
  },

  // Tier 4 - Dungeon levels 16+
  demon: {
    id: 'demon',
    name: 'Demon',
    emoji: '😈',
    tier: 4,
    baseStats: { maxHp: 205, attack: 35, defense: 13, speed: 10 },
    xpReward: 80,
    goldReward: { min: 50, max: 100 },
    abilities: ['fire_breath', 'intimidate', 'dark_heal'],
    aiType: AI.AGGRESSIVE,
    attackRange: 2, // Fire breath
  },
  golem: {
    id: 'golem',
    name: 'Stone Golem',
    emoji: '🗿',
    tier: 4,
    baseStats: { maxHp: 250, attack: 28, defense: 14, speed: 5 },
    xpReward: 85,
    goldReward: { min: 55, max: 110 },
    abilities: ['power_attack', 'shield_wall', 'stunning_blow'],
    aiType: AI.TANK,
    passive: { reflectDamage: 0.08 },
  },
  wraith: {
    id: 'wraith',
    name: 'Wraith',
    emoji: '👤',
    tier: 4,
    baseStats: { maxHp: 130, attack: 40, defense: 5, speed: 18 },
    xpReward: 75,
    goldReward: { min: 45, max: 90 },
    abilities: ['drain_life', 'curse', 'phase_shift'],
    aiType: AI.ASSASSIN,
    passive: { lifesteal: 0.15 },
    attackRange: 3, // Ethereal
  },
  lich: {
    id: 'lich',
    name: 'Lich',
    emoji: '🧙‍♂️',
    tier: 4,
    baseStats: { maxHp: 190, attack: 45, defense: 10, speed: 9 },
    xpReward: 90,
    goldReward: { min: 60, max: 120 },
    abilities: ['death_coil', 'raise_dead', 'frost_bolt', 'curse'],
    aiType: AI.DEBUFFER,
    attackRange: 3, // Caster
  },
  titan: {
    id: 'titan',
    name: 'Titan',
    emoji: '🗿',
    tier: 4,
    baseStats: { maxHp: 380, attack: 32, defense: 30, speed: 5 },
    xpReward: 95,
    goldReward: { min: 70, max: 130 },
    abilities: ['cleave', 'stunning_blow', 'shield_wall', 'enrage'],
    aiType: AI.TANK,
  },

  // Tier 5 - Volcanic Depths (Dungeon levels 21-25)
  magma_elemental: {
    id: 'magma_elemental',
    name: 'Magma Elemental',
    emoji: '🔥',
    tier: 5,
    baseStats: { maxHp: 280, attack: 30, defense: 16, speed: 7 },
    xpReward: 120,
    goldReward: { min: 80, max: 160 },
    abilities: ['magma_burst', 'molten_armor', 'fire_breath'],
    aiType: AI.TANK,
    passive: { reflectDamage: 0.12 },
  },
  fire_imp: {
    id: 'fire_imp',
    name: 'Fire Imp',
    emoji: '👿',
    tier: 5,
    baseStats: { maxHp: 160, attack: 36, defense: 7, speed: 15 },
    xpReward: 100,
    goldReward: { min: 65, max: 130 },
    abilities: ['fire_breath', 'quick_strike', 'haste_aura'],
    aiType: AI.AGGRESSIVE,
    attackRange: 2,
  },
  lava_serpent: {
    id: 'lava_serpent',
    name: 'Lava Serpent',
    emoji: '🐍',
    tier: 5,
    baseStats: { maxHp: 200, attack: 34, defense: 10, speed: 13 },
    xpReward: 110,
    goldReward: { min: 70, max: 145 },
    abilities: ['venomous_bite', 'rending_claws', 'heat_wave'],
    aiType: AI.ASSASSIN,
    passive: { lifesteal: 0.15 },
  },
  obsidian_golem: {
    id: 'obsidian_golem',
    name: 'Obsidian Golem',
    emoji: '⬛',
    tier: 5,
    baseStats: { maxHp: 360, attack: 28, defense: 22, speed: 5 },
    xpReward: 130,
    goldReward: { min: 90, max: 175 },
    abilities: ['volcanic_slam', 'shield_wall', 'power_attack'],
    aiType: AI.TANK,
    passive: { reflectDamage: 0.15 },
  },
  ember_wraith: {
    id: 'ember_wraith',
    name: 'Ember Wraith',
    emoji: '🧡',
    tier: 5,
    baseStats: { maxHp: 180, attack: 32, defense: 5, speed: 14 },
    xpReward: 105,
    goldReward: { min: 68, max: 135 },
    abilities: ['fire_breath', 'curse', 'phase_shift'],
    aiType: AI.DEBUFFER,
    attackRange: 3,
  },

  // Tier 6 - The Void (Dungeon levels 26-30)
  void_stalker: {
    id: 'void_stalker',
    name: 'Void Stalker',
    emoji: '🟣',
    tier: 6,
    baseStats: { maxHp: 250, attack: 42, defense: 10, speed: 16 },
    xpReward: 160,
    goldReward: { min: 110, max: 220 },
    abilities: ['void_bolt', 'phase_shift', 'consume'],
    aiType: AI.ASSASSIN,
    attackRange: 2,
    passive: { lifesteal: 0.2 },
  },
  eldritch_horror: {
    id: 'eldritch_horror',
    name: 'Eldritch Horror',
    emoji: '🐙',
    tier: 6,
    baseStats: { maxHp: 400, attack: 36, defense: 18, speed: 6 },
    xpReward: 180,
    goldReward: { min: 130, max: 250 },
    abilities: ['cleave', 'void_aura', 'consume', 'intimidate'],
    aiType: AI.TANK,
    passive: { regenPercent: 0.03 },
  },
  null_shade: {
    id: 'null_shade',
    name: 'Null Shade',
    emoji: '👤',
    tier: 6,
    baseStats: { maxHp: 220, attack: 38, defense: 7, speed: 15 },
    xpReward: 150,
    goldReward: { min: 100, max: 200 },
    abilities: ['void_bolt', 'entropy', 'drain_life', 'phase_shift'],
    aiType: AI.DEBUFFER,
    attackRange: 3,
  },
  reality_ripper: {
    id: 'reality_ripper',
    name: 'Reality Ripper',
    emoji: '🌀',
    tier: 6,
    baseStats: { maxHp: 300, attack: 40, defense: 12, speed: 11 },
    xpReward: 170,
    goldReward: { min: 120, max: 235 },
    abilities: ['reality_tear', 'dimensional_rift', 'power_attack'],
    aiType: AI.AGGRESSIVE,
  },
  void_spawn: {
    id: 'void_spawn',
    name: 'Void Spawn',
    emoji: '⚫',
    tier: 6,
    baseStats: { maxHp: 180, attack: 36, defense: 8, speed: 13 },
    xpReward: 140,
    goldReward: { min: 95, max: 190 },
    abilities: ['void_bolt', 'quick_strike', 'curse'],
    aiType: AI.AGGRESSIVE,
  },

  // Bosses
  goblin_king: {
    id: 'goblin_king',
    name: 'Goblin King',
    emoji: '👑',
    tier: 1,
    isBoss: true,
    baseStats: { maxHp: 100, attack: 15, defense: 8, speed: 6 },
    xpReward: 50,
    goldReward: { min: 40, max: 80 },
    abilities: ['war_cry', 'power_attack', 'summon_minions'],
    aiType: AI.BOSS,
    phases: [
      { hpPercent: 100, abilities: ['power_attack', 'war_cry'] },
      { hpPercent: 50, abilities: ['summon_minions', 'power_attack'] },
    ],
  },
  orc_warlord: {
    id: 'orc_warlord',
    name: 'Orc Warlord',
    emoji: '⚔️',
    tier: 2,
    isBoss: true,
    baseStats: { maxHp: 200, attack: 25, defense: 12, speed: 5 },
    xpReward: 100,
    goldReward: { min: 80, max: 150 },
    abilities: ['cleave', 'war_cry', 'intimidate', 'enrage'],
    aiType: AI.BOSS,
    phases: [
      { hpPercent: 100, abilities: ['cleave', 'war_cry'] },
      { hpPercent: 60, abilities: ['intimidate', 'cleave'] },
      { hpPercent: 30, abilities: ['cleave', 'war_cry'], enraged: true },
    ],
  },
  spider_queen: {
    id: 'spider_queen',
    name: 'Spider Queen',
    emoji: '🕸️',
    tier: 2,
    isBoss: true,
    baseStats: { maxHp: 250, attack: 28, defense: 14, speed: 8 },
    xpReward: 120,
    goldReward: { min: 100, max: 180 },
    abilities: ['venomous_bite', 'web_trap', 'summon_minions', 'call_swarm'],
    aiType: AI.BOSS,
    attackRange: 2, // Web attacks
    phases: [
      { hpPercent: 100, abilities: ['venomous_bite', 'web_trap'] },
      { hpPercent: 60, abilities: ['call_swarm', 'venomous_bite'] },
      { hpPercent: 30, abilities: ['summon_minions', 'venomous_bite'] },
    ],
    summonType: 'giant_spider',
  },
  dragon: {
    id: 'dragon',
    name: 'Dragon',
    emoji: '🐉',
    tier: 3,
    isBoss: true,
    baseStats: { maxHp: 400, attack: 35, defense: 20, speed: 8 },
    xpReward: 250,
    goldReward: { min: 200, max: 400 },
    abilities: ['fire_breath', 'tail_swipe', 'wing_buffet', 'terrifying_roar'],
    aiType: AI.BOSS,
    attackRange: 3, // Fire breath
    phases: [
      { hpPercent: 100, abilities: ['fire_breath', 'tail_swipe'] },
      { hpPercent: 60, abilities: ['wing_buffet', 'fire_breath'] },
      { hpPercent: 30, abilities: ['inferno_breath', 'terrifying_roar'], enraged: true },
    ],
  },
  demon_lord: {
    id: 'demon_lord',
    name: 'Demon Lord',
    emoji: '👿',
    tier: 4,
    isBoss: true,
    baseStats: { maxHp: 600, attack: 45, defense: 25, speed: 12 },
    xpReward: 400,
    goldReward: { min: 350, max: 600 },
    abilities: ['fire_breath', 'intimidate', 'dark_heal', 'inferno_breath', 'summon_minions'],
    aiType: AI.BOSS,
    attackRange: 3, // Fire breath
    phases: [
      { hpPercent: 100, abilities: ['fire_breath', 'intimidate'] },
      { hpPercent: 60, abilities: ['summon_minions', 'fire_breath'] },
      { hpPercent: 30, abilities: ['inferno_breath', 'dark_heal'], enraged: true },
    ],
    summonType: 'demon',
  },
  lich_king: {
    id: 'lich_king',
    name: 'Lich King',
    emoji: '👑',
    tier: 4,
    isBoss: true,
    baseStats: { maxHp: 800, attack: 48, defense: 30, speed: 10 },
    xpReward: 500,
    goldReward: { min: 450, max: 750 },
    abilities: ['death_coil', 'soul_drain', 'raise_dead', 'frost_bolt', 'phase_shift'],
    aiType: AI.BOSS,
    attackRange: 4, // Powerful caster
    phases: [
      { hpPercent: 100, abilities: ['death_coil', 'frost_bolt'] },
      { hpPercent: 70, abilities: ['raise_dead', 'death_coil'] },
      { hpPercent: 40, abilities: ['soul_drain', 'phase_shift'] },
      { hpPercent: 20, abilities: ['soul_drain', 'death_coil'], enraged: true },
    ],
  },

  // Tier 5 Boss - Volcanic Depths
  inferno_titan: {
    id: 'inferno_titan',
    name: 'Inferno Titan',
    emoji: '🌋',
    tier: 5,
    isBoss: true,
    baseStats: { maxHp: 950, attack: 48, defense: 28, speed: 7 },
    xpReward: 700,
    goldReward: { min: 600, max: 1000 },
    abilities: ['eruption', 'volcanic_slam', 'magma_burst', 'molten_armor', 'inferno_breath'],
    aiType: AI.BOSS,
    attackRange: 3,
    phases: [
      { hpPercent: 100, abilities: ['magma_burst', 'volcanic_slam'] },
      { hpPercent: 70, abilities: ['eruption', 'molten_armor'] },
      { hpPercent: 40, abilities: ['inferno_breath', 'volcanic_slam'] },
      { hpPercent: 20, abilities: ['eruption', 'inferno_breath'], enraged: true },
    ],
  },

  // Tier 6 Boss - The Void
  the_nameless_one: {
    id: 'the_nameless_one',
    name: 'The Nameless One',
    emoji: '👁️',
    tier: 6,
    isBoss: true,
    baseStats: { maxHp: 1400, attack: 55, defense: 32, speed: 10 },
    xpReward: 1000,
    goldReward: { min: 800, max: 1500 },
    abilities: ['annihilate', 'dimensional_rift', 'entropy', 'void_aura', 'consume', 'phase_shift'],
    aiType: AI.BOSS,
    attackRange: 4,
    phases: [
      { hpPercent: 100, abilities: ['void_bolt', 'dimensional_rift'] },
      { hpPercent: 75, abilities: ['entropy', 'consume'] },
      { hpPercent: 50, abilities: ['dimensional_rift', 'void_aura'] },
      { hpPercent: 25, abilities: ['annihilate', 'entropy'], enraged: true },
    ],
  },
};

export const MONSTER_LIST = Object.values(MONSTERS);

export const getMonstersByTier = (tier) =>
  MONSTER_LIST.filter(m => m.tier === tier && !m.isBoss);

// Get all bosses for a tier
export const getBossesByTier = (tier) =>
  MONSTER_LIST.filter(m => m.tier === tier && m.isBoss);

// Get a random boss for a tier
export const getBossByTier = (tier) => {
  const bosses = getBossesByTier(tier);
  if (bosses.length === 0) return null;
  return bosses[Math.floor(Math.random() * bosses.length)];
};

// Get monster by ID
export const getMonster = (id) => MONSTERS[id];

// Get monster abilities
export const getMonsterAbilities = (monsterId) => {
  const monster = MONSTERS[monsterId];
  return monster?.abilities || [];
};
