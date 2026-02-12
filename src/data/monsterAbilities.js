// Monster ability definitions

export const ABILITY_TYPE = {
  ATTACK: 'attack',       // Deals damage
  BUFF: 'buff',           // Helps self or allies
  DEBUFF: 'debuff',       // Hurts enemies
  SUMMON: 'summon',       // Creates minions
  HEAL: 'heal',           // Restores HP
  SPECIAL: 'special',     // Unique mechanics
};

export const TARGET_TYPE = {
  SINGLE: 'single',           // Single target
  CLEAVE: 'cleave',           // Multiple adjacent targets
  ALL_ENEMIES: 'all_enemies', // All heroes
  ALL_ALLIES: 'all_allies',   // All monsters
  SELF: 'self',               // Self only
  LOWEST_HP: 'lowest_hp',     // Lowest HP target
  RANDOM: 'random',           // Random target
};

export const MONSTER_ABILITIES = {
  // === BASIC ATTACKS ===
  cleave: {
    id: 'cleave',
    name: 'Cleave',
    emoji: '⚔️',
    type: ABILITY_TYPE.ATTACK,
    description: 'Swings weapon hitting multiple targets',
    cooldown: 0,
    damageMultiplier: 0.8,
    targetType: TARGET_TYPE.CLEAVE,
    maxTargets: 2,
  },
  power_attack: {
    id: 'power_attack',
    name: 'Power Attack',
    emoji: '💥',
    type: ABILITY_TYPE.ATTACK,
    description: 'A devastating blow',
    cooldown: 3,
    damageMultiplier: 1.5,
    targetType: TARGET_TYPE.SINGLE,
  },
  quick_strike: {
    id: 'quick_strike',
    name: 'Quick Strike',
    emoji: '⚡',
    type: ABILITY_TYPE.ATTACK,
    description: 'A fast attack that strikes twice',
    cooldown: 2,
    damageMultiplier: 0.6,
    hitCount: 2,
    targetType: TARGET_TYPE.SINGLE,
  },

  // === STATUS APPLYING ATTACKS ===
  venomous_bite: {
    id: 'venomous_bite',
    name: 'Venomous Bite',
    emoji: '🐍',
    type: ABILITY_TYPE.ATTACK,
    description: 'Bites and injects venom',
    cooldown: 3,
    damageMultiplier: 0.8,
    targetType: TARGET_TYPE.SINGLE,
    appliesStatus: { id: 'poison', duration: 3, stacks: 2 },
  },
  fire_breath: {
    id: 'fire_breath',
    name: 'Fire Breath',
    emoji: '🔥',
    type: ABILITY_TYPE.ATTACK,
    description: 'Breathes fire on all enemies',
    cooldown: 4,
    damageMultiplier: 0.6,
    targetType: TARGET_TYPE.ALL_ENEMIES,
    appliesStatus: { id: 'burn', duration: 2 },
  },
  frost_bolt: {
    id: 'frost_bolt',
    name: 'Frost Bolt',
    emoji: '❄️',
    type: ABILITY_TYPE.ATTACK,
    description: 'Hurls ice that freezes the target',
    cooldown: 4,
    damageMultiplier: 1.0,
    targetType: TARGET_TYPE.SINGLE,
    appliesStatus: { id: 'freeze', duration: 1 },
  },
  rending_claws: {
    id: 'rending_claws',
    name: 'Rending Claws',
    emoji: '🩸',
    type: ABILITY_TYPE.ATTACK,
    description: 'Tears flesh causing bleeding',
    cooldown: 3,
    damageMultiplier: 1.0,
    targetType: TARGET_TYPE.SINGLE,
    appliesStatus: { id: 'bleed', duration: 4, stacks: 2 },
  },
  stunning_blow: {
    id: 'stunning_blow',
    name: 'Stunning Blow',
    emoji: '💫',
    type: ABILITY_TYPE.ATTACK,
    description: 'A heavy strike that stuns',
    cooldown: 5,
    damageMultiplier: 0.8,
    targetType: TARGET_TYPE.SINGLE,
    appliesStatus: { id: 'stun', duration: 1 },
  },

  // === DEBUFF ABILITIES ===
  intimidate: {
    id: 'intimidate',
    name: 'Intimidate',
    emoji: '😱',
    type: ABILITY_TYPE.DEBUFF,
    description: 'Roars to weaken enemies',
    cooldown: 6,
    targetType: TARGET_TYPE.ALL_ENEMIES,
    appliesStatus: { id: 'weakness', duration: 2 },
  },
  web_trap: {
    id: 'web_trap',
    name: 'Web Trap',
    emoji: '🕸️',
    type: ABILITY_TYPE.DEBUFF,
    description: 'Shoots webs to slow a target',
    cooldown: 4,
    targetType: TARGET_TYPE.SINGLE,
    appliesStatus: { id: 'slow', duration: 2 },
  },
  curse: {
    id: 'curse',
    name: 'Curse',
    emoji: '💜',
    type: ABILITY_TYPE.DEBUFF,
    description: 'Places a curse reducing healing',
    cooldown: 5,
    targetType: TARGET_TYPE.SINGLE,
    appliesStatus: { id: 'cursed', duration: 3 },
  },
  blinding_dust: {
    id: 'blinding_dust',
    name: 'Blinding Dust',
    emoji: '🌑',
    type: ABILITY_TYPE.DEBUFF,
    description: 'Throws dust to blind targets',
    cooldown: 5,
    targetType: TARGET_TYPE.ALL_ENEMIES,
    appliesStatus: { id: 'blind', duration: 2 },
  },
  expose_weakness: {
    id: 'expose_weakness',
    name: 'Expose Weakness',
    emoji: '🎯',
    type: ABILITY_TYPE.DEBUFF,
    description: 'Marks target to take more damage',
    cooldown: 4,
    targetType: TARGET_TYPE.SINGLE,
    appliesStatus: { id: 'vulnerable', duration: 3 },
  },
  entangle: {
    id: 'entangle',
    name: 'Entangle',
    emoji: '🌿',
    type: ABILITY_TYPE.DEBUFF,
    description: 'Roots target in place',
    cooldown: 4,
    targetType: TARGET_TYPE.SINGLE,
    appliesStatus: { id: 'root', duration: 2 },
  },

  // === BUFF ABILITIES ===
  war_cry: {
    id: 'war_cry',
    name: 'War Cry',
    emoji: '📯',
    type: ABILITY_TYPE.BUFF,
    description: 'Rallies allies to attack harder',
    cooldown: 5,
    targetType: TARGET_TYPE.ALL_ALLIES,
    appliesStatus: { id: 'might', duration: 3 },
  },
  shield_wall: {
    id: 'shield_wall',
    name: 'Shield Wall',
    emoji: '🛡️',
    type: ABILITY_TYPE.BUFF,
    description: 'Raises defenses for all',
    cooldown: 9,
    targetType: TARGET_TYPE.ALL_ALLIES,
    appliesStatus: { id: 'fortify', duration: 2 },
  },
  enrage: {
    id: 'enrage',
    name: 'Enrage',
    emoji: '😤',
    type: ABILITY_TYPE.BUFF,
    description: 'Enters a rage, boosting attack',
    cooldown: 0, // Passive trigger
    trigger: 'on_damage', // Triggered when taking damage
    targetType: TARGET_TYPE.SELF,
    effect: { attackBonus: 0.1 }, // Stacks each time hit
  },
  haste_aura: {
    id: 'haste_aura',
    name: 'Haste Aura',
    emoji: '⚡',
    type: ABILITY_TYPE.BUFF,
    description: 'Speeds up all allies',
    cooldown: 6,
    targetType: TARGET_TYPE.ALL_ALLIES,
    appliesStatus: { id: 'haste', duration: 2 },
  },

  // === HEAL ABILITIES ===
  dark_heal: {
    id: 'dark_heal',
    name: 'Dark Heal',
    emoji: '💀',
    type: ABILITY_TYPE.HEAL,
    description: 'Heals self using dark magic',
    cooldown: 4,
    targetType: TARGET_TYPE.SELF,
    healPercent: 0.2, // Heals 20% max HP
  },
  drain_life: {
    id: 'drain_life',
    name: 'Drain Life',
    emoji: '🧛',
    type: ABILITY_TYPE.ATTACK,
    description: 'Steals life from target',
    cooldown: 4,
    damageMultiplier: 1.0,
    targetType: TARGET_TYPE.SINGLE,
    lifesteal: 0.5, // Heals 50% of damage dealt
  },
  regenerate: {
    id: 'regenerate',
    name: 'Regenerate',
    emoji: '💚',
    type: ABILITY_TYPE.BUFF,
    description: 'Grants regeneration to self',
    cooldown: 5,
    targetType: TARGET_TYPE.SELF,
    appliesStatus: { id: 'regeneration', duration: 3 },
  },

  // === SUMMON ABILITIES ===
  summon_minions: {
    id: 'summon_minions',
    name: 'Summon Minions',
    emoji: '👥',
    type: ABILITY_TYPE.SUMMON,
    description: 'Calls forth reinforcements',
    cooldown: 8,
    summonCount: 2,
    summonType: 'tier_1_random', // Summons random tier 1 monsters
  },
  raise_dead: {
    id: 'raise_dead',
    name: 'Raise Dead',
    emoji: '💀',
    type: ABILITY_TYPE.SUMMON,
    description: 'Raises fallen as undead',
    cooldown: 10,
    summonCount: 1,
    summonType: 'skeleton', // Always summons skeleton
  },
  call_swarm: {
    id: 'call_swarm',
    name: 'Call Swarm',
    emoji: '🦇',
    type: ABILITY_TYPE.SUMMON,
    description: 'Calls a swarm of bats',
    cooldown: 6,
    summonCount: 3,
    summonType: 'giant_bat',
  },

  // === SPECIAL BOSS ABILITIES ===
  tail_swipe: {
    id: 'tail_swipe',
    name: 'Tail Swipe',
    emoji: '🐲',
    type: ABILITY_TYPE.ATTACK,
    description: 'Sweeps tail hitting all',
    cooldown: 3,
    damageMultiplier: 0.7,
    targetType: TARGET_TYPE.ALL_ENEMIES,
  },
  wing_buffet: {
    id: 'wing_buffet',
    name: 'Wing Buffet',
    emoji: '🌪️',
    type: ABILITY_TYPE.ATTACK,
    description: 'Powerful wing gust',
    cooldown: 4,
    damageMultiplier: 0.5,
    targetType: TARGET_TYPE.ALL_ENEMIES,
    appliesStatus: { id: 'slow', duration: 1 },
  },
  inferno_breath: {
    id: 'inferno_breath',
    name: 'Inferno Breath',
    emoji: '🌋',
    type: ABILITY_TYPE.ATTACK,
    description: 'Devastating fire attack',
    cooldown: 6,
    damageMultiplier: 1.2,
    targetType: TARGET_TYPE.ALL_ENEMIES,
    appliesStatus: { id: 'burn', duration: 3, stacks: 2 },
  },
  terrifying_roar: {
    id: 'terrifying_roar',
    name: 'Terrifying Roar',
    emoji: '🦁',
    type: ABILITY_TYPE.DEBUFF,
    description: 'A roar that weakens and slows',
    cooldown: 6,
    targetType: TARGET_TYPE.ALL_ENEMIES,
    appliesMultipleStatus: [
      { id: 'weakness', duration: 2 },
      { id: 'slow', duration: 1 },
    ],
  },
  death_coil: {
    id: 'death_coil',
    name: 'Death Coil',
    emoji: '☠️',
    type: ABILITY_TYPE.ATTACK,
    description: 'Dark magic that curses',
    cooldown: 4,
    damageMultiplier: 1.3,
    targetType: TARGET_TYPE.SINGLE,
    appliesStatus: { id: 'cursed', duration: 3 },
  },
  soul_drain: {
    id: 'soul_drain',
    name: 'Soul Drain',
    emoji: '👻',
    type: ABILITY_TYPE.ATTACK,
    description: 'Drains life from all enemies',
    cooldown: 8,
    damageMultiplier: 0.4,
    targetType: TARGET_TYPE.ALL_ENEMIES,
    lifesteal: 1.0, // Full heal from damage
  },
  charm: {
    id: 'charm',
    name: 'Charm',
    emoji: '💕',
    type: ABILITY_TYPE.SPECIAL,
    description: 'Charms a target to skip turn',
    cooldown: 6,
    targetType: TARGET_TYPE.SINGLE,
    appliesStatus: { id: 'stun', duration: 1 }, // Acts like stun
  },
  phase_shift: {
    id: 'phase_shift',
    name: 'Phase Shift',
    emoji: '👻',
    type: ABILITY_TYPE.BUFF,
    description: 'Becomes untargetable briefly',
    cooldown: 5,
    targetType: TARGET_TYPE.SELF,
    appliesStatus: { id: 'invisible', duration: 1 },
  },

  // === TIER 5 - VOLCANIC ABILITIES ===
  magma_burst: {
    id: 'magma_burst',
    name: 'Magma Burst',
    emoji: '🌋',
    type: ABILITY_TYPE.ATTACK,
    description: 'Erupts with molten rock',
    cooldown: 4,
    damageMultiplier: 1.1,
    targetType: TARGET_TYPE.CLEAVE,
    maxTargets: 3,
    appliesStatus: { id: 'burn', duration: 3 },
  },
  volcanic_slam: {
    id: 'volcanic_slam',
    name: 'Volcanic Slam',
    emoji: '🔨',
    type: ABILITY_TYPE.ATTACK,
    description: 'Smashes the ground with fiery force',
    cooldown: 5,
    damageMultiplier: 1.4,
    targetType: TARGET_TYPE.SINGLE,
    appliesStatus: { id: 'stun', duration: 1 },
  },
  heat_wave: {
    id: 'heat_wave',
    name: 'Heat Wave',
    emoji: '🔥',
    type: ABILITY_TYPE.DEBUFF,
    description: 'Intense heat weakens all enemies',
    cooldown: 6,
    targetType: TARGET_TYPE.ALL_ENEMIES,
    appliesMultipleStatus: [
      { id: 'burn', duration: 2 },
      { id: 'weakness', duration: 2 },
    ],
  },
  molten_armor: {
    id: 'molten_armor',
    name: 'Molten Armor',
    emoji: '🛡️',
    type: ABILITY_TYPE.BUFF,
    description: 'Coats self in protective magma',
    cooldown: 8,
    targetType: TARGET_TYPE.SELF,
    appliesStatus: { id: 'fortify', duration: 3 },
  },
  eruption: {
    id: 'eruption',
    name: 'Eruption',
    emoji: '🌋',
    type: ABILITY_TYPE.ATTACK,
    description: 'Massive volcanic explosion',
    cooldown: 7,
    damageMultiplier: 0.9,
    targetType: TARGET_TYPE.ALL_ENEMIES,
    appliesStatus: { id: 'burn', duration: 4, stacks: 2 },
  },

  // === TIER 6 - VOID ABILITIES ===
  void_bolt: {
    id: 'void_bolt',
    name: 'Void Bolt',
    emoji: '🟣',
    type: ABILITY_TYPE.ATTACK,
    description: 'Fires a bolt of pure void energy',
    cooldown: 3,
    damageMultiplier: 1.3,
    targetType: TARGET_TYPE.SINGLE,
    appliesStatus: { id: 'cursed', duration: 2 },
  },
  reality_tear: {
    id: 'reality_tear',
    name: 'Reality Tear',
    emoji: '🌀',
    type: ABILITY_TYPE.ATTACK,
    description: 'Tears through the fabric of reality',
    cooldown: 5,
    damageMultiplier: 1.5,
    targetType: TARGET_TYPE.SINGLE,
  },
  void_aura: {
    id: 'void_aura',
    name: 'Void Aura',
    emoji: '💜',
    type: ABILITY_TYPE.DEBUFF,
    description: 'Emanates void energy that weakens all',
    cooldown: 6,
    targetType: TARGET_TYPE.ALL_ENEMIES,
    appliesMultipleStatus: [
      { id: 'weakness', duration: 3 },
      { id: 'slow', duration: 2 },
    ],
  },
  consume: {
    id: 'consume',
    name: 'Consume',
    emoji: '👁️',
    type: ABILITY_TYPE.ATTACK,
    description: 'Devours life force from target',
    cooldown: 5,
    damageMultiplier: 1.2,
    targetType: TARGET_TYPE.SINGLE,
    lifesteal: 0.6,
  },
  dimensional_rift: {
    id: 'dimensional_rift',
    name: 'Dimensional Rift',
    emoji: '🕳️',
    type: ABILITY_TYPE.ATTACK,
    description: 'Opens a rift that damages all enemies',
    cooldown: 8,
    damageMultiplier: 0.8,
    targetType: TARGET_TYPE.ALL_ENEMIES,
    appliesStatus: { id: 'cursed', duration: 3 },
  },
  entropy: {
    id: 'entropy',
    name: 'Entropy',
    emoji: '⚫',
    type: ABILITY_TYPE.DEBUFF,
    description: 'Accelerates decay in all enemies',
    cooldown: 7,
    targetType: TARGET_TYPE.ALL_ENEMIES,
    appliesMultipleStatus: [
      { id: 'cursed', duration: 3 },
      { id: 'poison', duration: 4, stacks: 3 },
    ],
  },
  annihilate: {
    id: 'annihilate',
    name: 'Annihilate',
    emoji: '💀',
    type: ABILITY_TYPE.ATTACK,
    description: 'Utterly destroys a single target',
    cooldown: 10,
    damageMultiplier: 2.0,
    targetType: TARGET_TYPE.SINGLE,
  },
};

// Get ability by ID
export const getMonsterAbility = (id) => MONSTER_ABILITIES[id];

// Get all abilities of a type
export const getAbilitiesByType = (type) =>
  Object.values(MONSTER_ABILITIES).filter(a => a.type === type);

// Check if ability is ready (cooldown = 0)
export const isAbilityReady = (abilityId, cooldowns = {}) => {
  return !cooldowns[abilityId] || cooldowns[abilityId] <= 0;
};

// Get all ready abilities for a monster
export const getReadyAbilities = (abilityIds, cooldowns = {}) => {
  return abilityIds.filter(id => isAbilityReady(id, cooldowns)).map(id => MONSTER_ABILITIES[id]);
};
