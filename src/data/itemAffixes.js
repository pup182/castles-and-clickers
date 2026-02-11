// Item affix definitions for equipment special effects

export const AFFIX_TYPE = {
  PREFIX: 'prefix',   // Goes before item name
  SUFFIX: 'suffix',   // Goes after item name
};

export const AFFIX_TRIGGER = {
  ON_HIT: 'on_hit',               // When dealing damage
  ON_CRIT: 'on_crit',             // When landing a critical hit
  ON_KILL: 'on_kill',             // When killing an enemy
  ON_DAMAGE_TAKEN: 'on_damage_taken', // When taking damage
  PASSIVE: 'passive',             // Always active
  ON_TURN_START: 'on_turn_start', // At start of turn
};

export const ITEM_AFFIXES = {
  // === PREFIXES (Offensive) ===

  // Tier 1 Prefixes
  blazing: {
    id: 'blazing',
    name: 'Blazing',
    type: AFFIX_TYPE.PREFIX,
    trigger: AFFIX_TRIGGER.ON_HIT,
    description: '15% chance to burn enemies',
    effect: {
      procChance: 0.15,
      appliesStatus: { id: 'burn', duration: 2 },
    },
    slots: ['weapon'],
    minTier: 1,
  },
  venomous: {
    id: 'venomous',
    name: 'Venomous',
    type: AFFIX_TYPE.PREFIX,
    trigger: AFFIX_TRIGGER.ON_HIT,
    description: '20% chance to poison enemies',
    effect: {
      procChance: 0.20,
      appliesStatus: { id: 'poison', duration: 3 },
    },
    slots: ['weapon'],
    minTier: 1,
  },
  keen: {
    id: 'keen',
    name: 'Keen',
    type: AFFIX_TYPE.PREFIX,
    trigger: AFFIX_TRIGGER.PASSIVE,
    description: '+10% critical hit chance',
    effect: {
      critChanceBonus: 0.10,
    },
    slots: ['weapon'],
    minTier: 1,
  },

  // Tier 2 Prefixes
  vampiric: {
    id: 'vampiric',
    name: 'Vampiric',
    type: AFFIX_TYPE.PREFIX,
    trigger: AFFIX_TRIGGER.ON_HIT,
    description: 'Heal 10% of damage dealt',
    effect: {
      lifesteal: 0.10,
    },
    slots: ['weapon'],
    minTier: 2,
  },
  thundering: {
    id: 'thundering',
    name: 'Thundering',
    type: AFFIX_TYPE.PREFIX,
    trigger: AFFIX_TRIGGER.ON_HIT,
    description: '10% chance to chain lightning',
    effect: {
      procChance: 0.10,
      chainDamage: 0.5,
      chainTargets: 2,
    },
    slots: ['weapon'],
    minTier: 2,
  },
  savage: {
    id: 'savage',
    name: 'Savage',
    type: AFFIX_TYPE.PREFIX,
    trigger: AFFIX_TRIGGER.ON_CRIT,
    description: 'Crits cause bleeding',
    effect: {
      appliesStatus: { id: 'bleed', duration: 3, stacks: 2 },
    },
    slots: ['weapon'],
    minTier: 2,
  },
  freezing: {
    id: 'freezing',
    name: 'Freezing',
    type: AFFIX_TYPE.PREFIX,
    trigger: AFFIX_TRIGGER.ON_HIT,
    description: '8% chance to freeze enemies',
    effect: {
      procChance: 0.08,
      appliesStatus: { id: 'freeze', duration: 1 },
    },
    slots: ['weapon'],
    minTier: 2,
  },

  // Tier 3 Prefixes
  executioner: {
    id: 'executioner',
    name: 'Executioner\'s',
    type: AFFIX_TYPE.PREFIX,
    trigger: AFFIX_TRIGGER.PASSIVE,
    description: '+50% damage to enemies below 25% HP',
    effect: {
      executeBonus: 0.5,
      executeThreshold: 0.25,
    },
    slots: ['weapon'],
    minTier: 3,
  },
  berserker: {
    id: 'berserker',
    name: 'Berserker\'s',
    type: AFFIX_TYPE.PREFIX,
    trigger: AFFIX_TRIGGER.PASSIVE,
    description: '+1% damage per 1% HP missing',
    effect: {
      missingHpDamage: 0.01,
    },
    slots: ['weapon'],
    minTier: 3,
  },
  devastating: {
    id: 'devastating',
    name: 'Devastating',
    type: AFFIX_TYPE.PREFIX,
    trigger: AFFIX_TRIGGER.ON_CRIT,
    description: 'Critical hits deal +75% damage',
    effect: {
      critDamageBonus: 0.75,
    },
    slots: ['weapon'],
    minTier: 3,
  },

  // === SUFFIXES (Defensive/Utility) ===

  // Tier 1 Suffixes
  of_thorns: {
    id: 'of_thorns',
    name: 'of Thorns',
    type: AFFIX_TYPE.SUFFIX,
    trigger: AFFIX_TRIGGER.ON_DAMAGE_TAKEN,
    description: 'Reflect 15% of damage taken',
    effect: {
      reflectDamage: 0.15,
    },
    slots: ['armor'],
    minTier: 1,
  },
  of_vitality: {
    id: 'of_vitality',
    name: 'of Vitality',
    type: AFFIX_TYPE.SUFFIX,
    trigger: AFFIX_TRIGGER.PASSIVE,
    description: '+15% max HP',
    effect: {
      maxHpBonus: 0.15,
    },
    slots: ['armor', 'accessory'],
    minTier: 1,
  },
  of_haste: {
    id: 'of_haste',
    name: 'of Haste',
    type: AFFIX_TYPE.SUFFIX,
    trigger: AFFIX_TRIGGER.PASSIVE,
    description: '+2 speed',
    effect: {
      speedBonus: 2,
    },
    slots: ['weapon', 'accessory'],
    minTier: 1,
  },

  // Tier 2 Suffixes
  of_regeneration: {
    id: 'of_regeneration',
    name: 'of Regeneration',
    type: AFFIX_TYPE.SUFFIX,
    trigger: AFFIX_TRIGGER.ON_TURN_START,
    description: 'Heal 2% max HP per turn',
    effect: {
      regenPercent: 0.02,
    },
    slots: ['armor', 'accessory'],
    minTier: 2,
  },
  of_swiftness: {
    id: 'of_swiftness',
    name: 'of Swiftness',
    type: AFFIX_TYPE.SUFFIX,
    trigger: AFFIX_TRIGGER.ON_KILL,
    description: '+3 speed for 2 turns on kill',
    effect: {
      onKillBuff: { stat: 'speed', amount: 3, duration: 2 },
    },
    slots: ['weapon', 'accessory'],
    minTier: 2,
  },
  of_warding: {
    id: 'of_warding',
    name: 'of Warding',
    type: AFFIX_TYPE.SUFFIX,
    trigger: AFFIX_TRIGGER.PASSIVE,
    description: '25% reduced duration from debuffs',
    effect: {
      debuffDurationReduction: 0.25,
    },
    slots: ['armor', 'accessory'],
    minTier: 2,
  },
  of_fortitude: {
    id: 'of_fortitude',
    name: 'of Fortitude',
    type: AFFIX_TYPE.SUFFIX,
    trigger: AFFIX_TRIGGER.ON_DAMAGE_TAKEN,
    description: '10% damage reduction when below 50% HP',
    effect: {
      lowHpDamageReduction: 0.10,
      lowHpThreshold: 0.5,
    },
    slots: ['armor'],
    minTier: 2,
  },

  // Tier 3 Suffixes
  of_the_phoenix: {
    id: 'of_the_phoenix',
    name: 'of the Phoenix',
    type: AFFIX_TYPE.SUFFIX,
    trigger: AFFIX_TRIGGER.PASSIVE,
    description: 'Once per dungeon, revive with 25% HP',
    effect: {
      reviveOnce: true,
      reviveHpPercent: 0.25,
    },
    slots: ['armor', 'accessory'],
    minTier: 3,
  },
  of_slaying: {
    id: 'of_slaying',
    name: 'of Slaying',
    type: AFFIX_TYPE.SUFFIX,
    trigger: AFFIX_TRIGGER.ON_KILL,
    description: '+20% attack for 3 turns on kill',
    effect: {
      onKillBuff: { stat: 'attack', percent: 0.20, duration: 3 },
    },
    slots: ['weapon'],
    minTier: 3,
  },
  of_the_titan: {
    id: 'of_the_titan',
    name: 'of the Titan',
    type: AFFIX_TYPE.SUFFIX,
    trigger: AFFIX_TRIGGER.PASSIVE,
    description: '+25% HP, +15% damage taken',
    effect: {
      maxHpBonus: 0.25,
      damageTakenIncrease: 0.15,
    },
    slots: ['armor'],
    minTier: 3,
  },
};

// Get affix by ID
export const getAffix = (id) => ITEM_AFFIXES[id];

// Get affixes by type (prefix/suffix)
export const getAffixesByType = (type) =>
  Object.values(ITEM_AFFIXES).filter(a => a.type === type);

// Get affixes available for a slot and tier
export const getAvailableAffixes = (slot, tier, type = null) => {
  return Object.values(ITEM_AFFIXES).filter(a => {
    if (type && a.type !== type) return false;
    if (!a.slots.includes(slot)) return false;
    if (a.minTier > tier) return false;
    return true;
  });
};

// Roll a random affix for a slot/tier
export const rollAffix = (slot, tier, type = null) => {
  const available = getAvailableAffixes(slot, tier, type);
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
};

// Build item name with affixes
export const buildAffixedName = (baseName, affixes) => {
  const prefix = affixes.find(a => ITEM_AFFIXES[a]?.type === AFFIX_TYPE.PREFIX);
  const suffix = affixes.find(a => ITEM_AFFIXES[a]?.type === AFFIX_TYPE.SUFFIX);

  const parts = [];
  if (prefix) parts.push(ITEM_AFFIXES[prefix].name);
  parts.push(baseName);
  if (suffix) parts.push(ITEM_AFFIXES[suffix].name);

  return parts.join(' ');
};
