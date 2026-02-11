// Unique legendary items with special powers
// These items ONLY drop from Raids

export const UNIQUE_ITEMS = {
  // === WEAPONS ===

  // Warrior Weapons
  flamebreaker: {
    id: 'flamebreaker',
    name: 'Flamebreaker',
    emoji: '🔥',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 25 },
    classes: ['warrior'],
    flavor: 'Forged in dragonfire, never cooled.',
    uniquePower: {
      name: 'Infernal Strike',
      description: '+20% fire damage, attacks apply burn',
      trigger: 'on_hit',
      effect: {
        bonusDamagePercent: 0.20,
        damageType: 'fire',
        appliesStatus: { id: 'burn', duration: 2 },
      },
    },
    dropSource: { raid: 'dragon_sanctum', wing: 2 },
  },

  worldsplitter: {
    id: 'worldsplitter',
    name: 'Worldsplitter',
    emoji: '⚔️',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 30 },
    classes: ['warrior'],
    flavor: 'The blade that cleaved mountains.',
    uniquePower: {
      name: 'Earthshatter',
      description: 'Attacks hit all adjacent enemies for 50% damage',
      trigger: 'on_hit',
      effect: {
        cleavePercent: 0.5,
        cleaveRange: 1,
      },
    },
    dropSource: { raid: 'titans_fortress', wing: 2 },
  },

  // Rogue Weapons
  shadowfang: {
    id: 'shadowfang',
    name: 'Shadowfang',
    emoji: '🗡️',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 18, speed: 8 },
    classes: ['rogue'],
    flavor: 'Drinks the shadows, thirsts for blood.',
    uniquePower: {
      name: 'Shadow Strike',
      description: 'Crits deal +100% damage and grant invisibility',
      trigger: 'on_crit',
      effect: {
        critBonusDamage: 1.0,
        grantsBuff: { id: 'invisible', duration: 1 },
      },
    },
    dropSource: { raid: 'shadow_realm', wing: 1 },
  },

  viper_fang: {
    id: 'viper_fang',
    name: 'Viper\'s Fang',
    emoji: '🐍',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 16, speed: 6 },
    classes: ['rogue'],
    flavor: 'One scratch is all it takes.',
    uniquePower: {
      name: 'Lethal Venom',
      description: 'Attacks apply 3 stacks of poison',
      trigger: 'on_hit',
      effect: {
        appliesStatus: { id: 'poison', duration: 4, stacks: 3 },
      },
    },
    dropSource: { raid: 'spider_queen_lair', wing: 2 },
  },

  // Mage Weapons
  staff_of_frost: {
    id: 'staff_of_frost',
    name: 'Staff of Eternal Frost',
    emoji: '❄️',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 30 },
    classes: ['mage'],
    flavor: 'The cold that stops time itself.',
    uniquePower: {
      name: 'Absolute Zero',
      description: 'Activate: Freeze all enemies for 2 turns (10 turn CD)',
      trigger: 'active',
      cooldown: 10,
      effect: {
        targetType: 'all_enemies',
        appliesStatus: { id: 'freeze', duration: 2 },
      },
    },
    dropSource: { raid: 'dragon_sanctum', wing: 1 },
  },

  inferno_rod: {
    id: 'inferno_rod',
    name: 'Inferno Rod',
    emoji: '🌋',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 35 },
    classes: ['mage'],
    flavor: 'Contains a fragment of a dying star.',
    uniquePower: {
      name: 'Meteor Strike',
      description: 'Skills have 25% chance to trigger a meteor dealing 100% AOE damage',
      trigger: 'on_skill',
      effect: {
        procChance: 0.25,
        bonusAoeDamage: 1.0,
        damageType: 'fire',
      },
    },
    dropSource: { raid: 'demon_citadel', wing: 2 },
  },

  // Cleric Weapons
  divine_scepter: {
    id: 'divine_scepter',
    name: 'Divine Scepter',
    emoji: '✨',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 15, defense: 5 },
    classes: ['cleric'],
    flavor: 'Light made manifest.',
    uniquePower: {
      name: 'Divine Intervention',
      description: 'Heals also grant a shield equal to 25% of healing',
      trigger: 'on_heal',
      effect: {
        healingShieldPercent: 0.25,
      },
    },
    dropSource: { raid: 'celestial_sanctuary', wing: 2 },
  },

  // Ranger Weapons
  windrunner: {
    id: 'windrunner',
    name: 'Windrunner',
    emoji: '🏹',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 20, speed: 10 },
    classes: ['ranger'],
    flavor: 'Faster than thought, deadlier than fate.',
    uniquePower: {
      name: 'Swift Death',
      description: 'After killing an enemy, immediately take another turn',
      trigger: 'on_kill',
      effect: {
        extraTurn: true,
        oncePerRound: true,
      },
    },
    dropSource: { raid: 'dragon_sanctum', wing: 2 },
  },

  // Necromancer Weapons
  soul_harvester: {
    id: 'soul_harvester',
    name: 'Soul Harvester',
    emoji: '💀',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 28, maxHp: -20 },
    classes: ['necromancer'],
    flavor: 'Every death feeds its hunger.',
    uniquePower: {
      name: 'Soul Reap',
      description: 'Kills grant +5% max HP and +3 attack (stacks up to 10 times)',
      trigger: 'on_kill',
      effect: {
        stackingBuff: {
          maxHpPercent: 0.05,
          attack: 3,
          maxStacks: 10,
        },
      },
    },
    dropSource: { raid: 'lich_throne', wing: 2 },
  },

  // === ARMOR ===

  armor_of_undying: {
    id: 'armor_of_undying',
    name: 'Armor of the Undying',
    emoji: '🛡️',
    slot: 'armor',
    rarity: 'legendary',
    baseStats: { defense: 15, maxHp: 50 },
    classes: ['warrior', 'cleric'],
    flavor: 'Death is merely an inconvenience.',
    uniquePower: {
      name: 'Defy Death',
      description: 'Once per dungeon, survive lethal damage with 1 HP',
      trigger: 'on_lethal',
      effect: {
        preventDeath: true,
        oneTimeUse: true,
        grantsImmunity: 1,
      },
    },
    dropSource: { raid: 'lich_throne', wing: 1 },
  },

  dragonscale_mantle: {
    id: 'dragonscale_mantle',
    name: 'Dragonscale Mantle',
    emoji: '🐉',
    slot: 'armor',
    rarity: 'legendary',
    baseStats: { defense: 20, maxHp: 30 },
    classes: null, // All classes
    flavor: 'Hewn from the hide of the Dragon King.',
    uniquePower: {
      name: 'Dragon\'s Resilience',
      description: 'Immune to burn and freeze. +15% fire and ice resistance',
      trigger: 'passive',
      effect: {
        immuneToStatus: ['burn', 'freeze'],
        elementalResistance: 0.15,
      },
    },
    dropSource: { raid: 'dragon_sanctum', wing: 2 },
  },

  shadow_cloak: {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    emoji: '🌑',
    slot: 'armor',
    rarity: 'legendary',
    baseStats: { defense: 8, speed: 5 },
    classes: ['rogue', 'ranger'],
    flavor: 'Woven from pure darkness.',
    uniquePower: {
      name: 'One with Shadows',
      description: '25% chance to completely avoid attacks',
      trigger: 'on_damage_taken',
      effect: {
        dodgeChance: 0.25,
      },
    },
    dropSource: { raid: 'shadow_realm', wing: 2 },
  },

  // === ACCESSORIES ===

  ring_of_archmage: {
    id: 'ring_of_archmage',
    name: 'Ring of the Archmage',
    emoji: '💍',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { attack: 10 },
    classes: ['mage', 'necromancer', 'cleric'],
    flavor: 'Contains the wisdom of a thousand mages.',
    uniquePower: {
      name: 'Arcane Surge',
      description: 'Kills reset all skill cooldowns',
      trigger: 'on_kill',
      effect: {
        resetCooldowns: true,
      },
    },
    dropSource: { raid: 'arcane_tower', wing: 2 },
  },

  blood_pendant: {
    id: 'blood_pendant',
    name: 'Blood Pendant',
    emoji: '❤️',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { attack: 8, maxHp: 25 },
    classes: null, // All classes
    flavor: 'Pulses with stolen life.',
    uniquePower: {
      name: 'Blood Bond',
      description: 'Heal 5% of all damage dealt by the party',
      trigger: 'on_party_damage',
      effect: {
        partyLifesteal: 0.05,
      },
    },
    dropSource: { raid: 'vampire_castle', wing: 2 },
  },

  boots_of_blinding_speed: {
    id: 'boots_of_blinding_speed',
    name: 'Boots of Blinding Speed',
    emoji: '👟',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { speed: 12 },
    classes: null, // All classes
    flavor: 'The world blurs when you run.',
    uniquePower: {
      name: 'Lightspeed',
      description: 'Always act first in combat. +2 movement range',
      trigger: 'passive',
      effect: {
        alwaysFirst: true,
        movementBonus: 2,
      },
    },
    dropSource: { raid: 'wind_temple', wing: 2 },
  },

  amulet_of_reflection: {
    id: 'amulet_of_reflection',
    name: 'Amulet of Reflection',
    emoji: '🔮',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { defense: 6, maxHp: 20 },
    classes: null, // All classes
    flavor: 'Returns what is given.',
    uniquePower: {
      name: 'Mirror Shield',
      description: 'Reflect 30% of damage taken back to attacker',
      trigger: 'on_damage_taken',
      effect: {
        reflectDamage: 0.30,
      },
    },
    dropSource: { raid: 'crystal_caverns', wing: 2 },
  },

  crown_of_command: {
    id: 'crown_of_command',
    name: 'Crown of Command',
    emoji: '👑',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { attack: 5, defense: 5, maxHp: 15 },
    classes: null, // All classes
    flavor: 'Worn by those who lead.',
    uniquePower: {
      name: 'Rally',
      description: 'Party gains +10% all stats',
      trigger: 'passive',
      effect: {
        partyStatBonus: 0.10,
      },
    },
    dropSource: { raid: 'fallen_kingdom', wing: 2 },
  },
};

// Get unique item by ID
export const getUniqueItem = (id) => UNIQUE_ITEMS[id];

// Get all unique items for a raid
export const getUniqueItemsForRaid = (raidId) =>
  Object.values(UNIQUE_ITEMS).filter(item =>
    item.dropSource?.raid === raidId
  );

// Get unique items a class can use
export const getUniqueItemsForClass = (classId) =>
  Object.values(UNIQUE_ITEMS).filter(item =>
    item.classes === null || item.classes.includes(classId)
  );

// Check if item is unique
export const isUniqueItem = (itemId) => !!UNIQUE_ITEMS[itemId];

// Create a unique item instance
export const createUniqueItemInstance = (uniqueId) => {
  const template = UNIQUE_ITEMS[uniqueId];
  if (!template) return null;

  return {
    id: `${uniqueId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: uniqueId,
    name: template.name,
    emoji: template.emoji,
    slot: template.slot,
    rarity: 'legendary',
    rarityColor: '#f59e0b',
    stats: { ...template.baseStats },
    classes: template.classes,
    isUnique: true,
    uniquePower: template.uniquePower,
    flavor: template.flavor,
  };
};
