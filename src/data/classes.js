// Role definitions for party composition
export const ROLES = {
  TANK: 'tank',
  HEALER: 'healer',
  DPS: 'dps',
};

// Party slot configuration: 1 tank, 1 healer, 2 DPS
export const PARTY_SLOTS = [
  { slot: 1, role: ROLES.TANK, cost: 0, dungeonRequired: 0 },
  { slot: 2, role: ROLES.HEALER, cost: 75, dungeonRequired: 1 },
  { slot: 3, role: ROLES.DPS, cost: 1000, dungeonRequired: 3 },
  { slot: 4, role: ROLES.DPS, cost: 5000, dungeonRequired: 4 },
];

// Hero classes with base stats and abilities
export const CLASSES = {
  // === TANK CLASSES ===
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    emoji: '⚔️',
    role: ROLES.TANK,
    description: 'A sturdy fighter who excels in melee combat',
    baseStats: {
      maxHp: 100,
      attack: 12,
      defense: 8,
      speed: 5,
    },
    growthPerLevel: {
      maxHp: 15,
      attack: 3,
      defense: 2,
      speed: 1,
    },
    abilities: [
      {
        id: 'power_strike',
        name: 'Power Strike',
        description: 'A powerful blow dealing 150% damage',
        cooldown: 3,
        effect: { type: 'damage', multiplier: 1.5 },
      },
    ],
  },
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    emoji: '🛡️',
    role: ROLES.TANK,
    description: 'A holy knight who protects allies with divine power',
    baseStats: {
      maxHp: 110,
      attack: 10,
      defense: 10,
      speed: 4,
    },
    growthPerLevel: {
      maxHp: 14,
      attack: 2,
      defense: 3,
      speed: 1,
    },
    abilities: [
      {
        id: 'divine_shield',
        name: 'Divine Shield',
        description: 'Reduces all damage taken by 50% for 2 turns',
        cooldown: 5,
        effect: { type: 'buff', stat: 'defense', multiplier: 2.0, duration: 2 },
      },
    ],
  },
  knight: {
    id: 'knight',
    name: 'Knight',
    emoji: '🏰',
    role: ROLES.TANK,
    description: 'An armored defender with unmatched resilience',
    baseStats: {
      maxHp: 120,
      attack: 8,
      defense: 12,
      speed: 3,
    },
    growthPerLevel: {
      maxHp: 18,
      attack: 2,
      defense: 3,
      speed: 0,
    },
    abilities: [
      {
        id: 'shield_bash',
        name: 'Shield Bash',
        description: 'Stuns target for 1 turn and deals 100% damage',
        cooldown: 4,
        effect: { type: 'stun', duration: 1, multiplier: 1.0 },
      },
    ],
  },
  // === DPS CLASSES ===
  mage: {
    id: 'mage',
    name: 'Mage',
    emoji: '🧙',
    role: ROLES.DPS,
    description: 'A powerful spellcaster with devastating magic',
    attackRange: 4,   // Buffed from 3 - casters stay at range for safety
    baseStats: {
      maxHp: 70,
      attack: 18,
      defense: 4,
      speed: 6,
    },
    growthPerLevel: {
      maxHp: 10,      // Buffed from 8
      attack: 5,
      defense: 1,
      speed: 1,
    },
    abilities: [
      {
        id: 'fireball',
        name: 'Fireball',
        description: 'Deals 200% damage to all enemies',
        cooldown: 5,
        effect: { type: 'aoe_damage', multiplier: 2.0 },
      },
    ],
  },
  rogue: {
    id: 'rogue',
    name: 'Rogue',
    emoji: '🗡️',
    role: ROLES.DPS,
    description: 'A swift fighter who strikes from the shadows',
    baseStats: {
      maxHp: 80,      // Buffed from 70
      attack: 15,
      defense: 5,     // Buffed from 4
      speed: 12,
    },
    growthPerLevel: {
      maxHp: 11,      // Buffed from 10
      attack: 4,
      defense: 1,
      speed: 2,
    },
    abilities: [
      {
        id: 'backstab',
        name: 'Backstab',
        description: 'Critical hit dealing 250% damage',
        cooldown: 4,
        effect: { type: 'damage', multiplier: 2.5 },
      },
    ],
  },
  // === HEALER CLASSES ===
  cleric: {
    id: 'cleric',
    name: 'Cleric',
    emoji: '✨',
    role: ROLES.HEALER,
    description: 'A holy healer who supports the party',
    attackRange: 2,
    baseStats: {
      maxHp: 65,
      attack: 8,
      defense: 5,
      speed: 4,
    },
    growthPerLevel: {
      maxHp: 9,
      attack: 2,
      defense: 1,
      speed: 1,
    },
    abilities: [
      {
        id: 'heal',
        name: 'Heal',
        description: 'Restores 20% HP to all allies',
        cooldown: 5,
        effect: { type: 'heal_all', percentage: 0.2 },
      },
    ],
  },
  druid: {
    id: 'druid',
    name: 'Druid',
    emoji: '🌿',
    role: ROLES.HEALER,
    description: 'A nature mage who heals and empowers allies',
    attackRange: 2,
    baseStats: {
      maxHp: 70,
      attack: 10,
      defense: 4,
      speed: 5,
    },
    growthPerLevel: {
      maxHp: 10,
      attack: 3,
      defense: 1,
      speed: 1,
    },
    abilities: [
      {
        id: 'rejuvenation',
        name: 'Rejuvenation',
        description: 'Heals lowest HP ally for 40% of their max HP',
        cooldown: 4,
        effect: { type: 'heal_single', percentage: 0.4 },
      },
    ],
  },
  shaman: {
    id: 'shaman',
    name: 'Shaman',
    emoji: '🔮',
    role: ROLES.HEALER,
    description: 'A spiritual healer who communes with ancestors',
    attackRange: 2,
    baseStats: {
      maxHp: 75,
      attack: 12,
      defense: 4,
      speed: 5,
    },
    growthPerLevel: {
      maxHp: 11,
      attack: 3,
      defense: 1,
      speed: 1,
    },
    abilities: [
      {
        id: 'spirit_link',
        name: 'Spirit Link',
        description: 'Heals all allies for 15% and buffs attack by 20%',
        cooldown: 5,
        effect: { type: 'heal_buff', healPercent: 0.15, attackBuff: 1.2, duration: 2 },
      },
    ],
  },
  ranger: {
    id: 'ranger',
    name: 'Ranger',
    emoji: '🏹',
    role: ROLES.DPS,
    description: 'A swift skirmisher with deadly precision',
    attackRange: 3,   // Reduced from 4 - ranger is mobile skirmisher, uses dodge
    baseStats: {
      maxHp: 85,
      attack: 14,
      defense: 5,
      speed: 9,
    },
    growthPerLevel: {
      maxHp: 11,      // Buffed from 10
      attack: 4,
      defense: 1,
      speed: 2,
    },
    abilities: [
      {
        id: 'aimed_shot',
        name: 'Aimed Shot',
        description: 'A precisely aimed arrow dealing 200% damage',
        cooldown: 3,
        effect: { type: 'damage', multiplier: 2.0 },
      },
    ],
  },
  necromancer: {
    id: 'necromancer',
    name: 'Necromancer',
    emoji: '💀',
    role: ROLES.DPS,
    description: 'A dark mage who drains life from enemies',
    attackRange: 4,   // Buffed from 3 - casters stay at range for safety
    baseStats: {
      maxHp: 85,      // Buffed from 75 - compensates for no dodge
      attack: 16,
      defense: 4,
      speed: 5,
    },
    growthPerLevel: {
      maxHp: 12,      // Buffed from 10 - better HP scaling
      attack: 5,
      defense: 1,
      speed: 1,
    },
    abilities: [
      {
        id: 'drain_life',
        name: 'Drain Life',
        description: 'Deals 150% damage and heals for 50% of damage dealt',
        cooldown: 4,
        effect: { type: 'drain', multiplier: 1.5, healPercent: 0.5 },
      },
    ],
  },
};

export const CLASS_LIST = Object.values(CLASSES);

// Get classes filtered by role
export const getClassesByRole = (role) => CLASS_LIST.filter(cls => cls.role === role);

// Role display info
export const ROLE_INFO = {
  [ROLES.TANK]: { name: 'Tank', emoji: '🛡️', description: 'Frontline defender who absorbs damage' },
  [ROLES.HEALER]: { name: 'Healer', emoji: '💚', description: 'Support who keeps the party alive' },
  [ROLES.DPS]: { name: 'DPS', emoji: '⚡', description: 'Damage dealer who eliminates enemies' },
};
