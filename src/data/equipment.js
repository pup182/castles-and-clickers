// Equipment definitions
import { rollAffix as rollAffixFromPool, buildAffixedName as buildAffixName, AFFIX_TYPE } from './itemAffixes';

export const RARITY = {
  common: { name: 'Common', color: '#9ca3af', multiplier: 1.0 },
  uncommon: { name: 'Uncommon', color: '#22c55e', multiplier: 1.3 },
  rare: { name: 'Rare', color: '#3b82f6', multiplier: 1.6 },
  epic: { name: 'Epic', color: '#a855f7', multiplier: 2.0 },
  legendary: { name: 'Legendary', color: '#f59e0b', multiplier: 2.5 },
  unique: { name: 'Unique', color: '#06b6d4', multiplier: 3.0 }, // Cyan - distinct from all others
};

export const EQUIPMENT_SLOTS = ['weapon', 'armor', 'accessory'];

// Class restrictions: which classes can use each equipment type
// null = all classes can use
export const EQUIPMENT_TEMPLATES = {
  // Warrior Weapons
  sword: {
    id: 'sword',
    name: 'Sword',
    emoji: '🗡️',
    slot: 'weapon',
    baseStats: { attack: 5 },
    tier: 1,
    classes: ['warrior', 'rogue'],
  },
  axe: {
    id: 'axe',
    name: 'Battle Axe',
    emoji: '🪓',
    slot: 'weapon',
    baseStats: { attack: 7 },
    tier: 1,
    classes: ['warrior'],
  },
  greatsword: {
    id: 'greatsword',
    name: 'Greatsword',
    emoji: '⚔️',
    slot: 'weapon',
    baseStats: { attack: 12 },
    tier: 2,
    classes: ['warrior'],
  },

  // Mage Weapons
  staff: {
    id: 'staff',
    name: 'Magic Staff',
    emoji: '🪄',
    slot: 'weapon',
    baseStats: { attack: 8 },
    tier: 1,
    classes: ['mage', 'cleric', 'necromancer'],
  },
  wand: {
    id: 'wand',
    name: 'Arcane Wand',
    emoji: '✨',
    slot: 'weapon',
    baseStats: { attack: 15 },
    tier: 2,
    classes: ['mage'],
  },
  orb: {
    id: 'orb',
    name: 'Crystal Orb',
    emoji: '🔮',
    slot: 'weapon',
    baseStats: { attack: 10, speed: 2 },
    tier: 2,
    classes: ['mage', 'cleric'],
  },

  // Rogue Weapons
  dagger: {
    id: 'dagger',
    name: 'Dagger',
    emoji: '🔪',
    slot: 'weapon',
    baseStats: { attack: 4, speed: 3 },
    tier: 1,
    classes: ['rogue'],
  },
  shortbow: {
    id: 'shortbow',
    name: 'Short Bow',
    emoji: '🏹',
    slot: 'weapon',
    baseStats: { attack: 6, speed: 2 },
    tier: 1,
    classes: ['rogue', 'ranger'],
  },
  assassinBlade: {
    id: 'assassinBlade',
    name: 'Assassin Blade',
    emoji: '⚔️',
    slot: 'weapon',
    baseStats: { attack: 11, speed: 4 },
    tier: 2,
    classes: ['rogue'],
  },

  // Cleric Weapons
  mace: {
    id: 'mace',
    name: 'Holy Mace',
    emoji: '🔨',
    slot: 'weapon',
    baseStats: { attack: 5, defense: 2 },
    tier: 1,
    classes: ['cleric', 'warrior'],
  },
  holySymbol: {
    id: 'holySymbol',
    name: 'Holy Symbol',
    emoji: '☀️',
    slot: 'weapon',
    baseStats: { attack: 8, maxHp: 20 },
    tier: 2,
    classes: ['cleric'],
  },

  // Heavy Armor (Warrior)
  chainmail: {
    id: 'chainmail',
    name: 'Chainmail',
    emoji: '🛡️',
    slot: 'armor',
    baseStats: { defense: 5, maxHp: 20 },
    tier: 1,
    classes: ['warrior', 'cleric'],
  },
  plate: {
    id: 'plate',
    name: 'Plate Armor',
    emoji: '🦾',
    slot: 'armor',
    baseStats: { defense: 8, maxHp: 35 },
    tier: 2,
    classes: ['warrior'],
  },

  // Light Armor (Rogue)
  leather: {
    id: 'leather',
    name: 'Leather Armor',
    emoji: '🥋',
    slot: 'armor',
    baseStats: { defense: 3, maxHp: 30, speed: 2 },  // HP buffed from 10
    tier: 1,
    classes: ['rogue', 'mage', 'ranger'],
  },
  shadowCloak: {
    id: 'shadowCloak',
    name: 'Shadow Cloak',
    emoji: '🧥',
    slot: 'armor',
    baseStats: { defense: 4, maxHp: 20, speed: 5 },  // Added 20 HP
    tier: 2,
    classes: ['rogue'],
  },

  // Robes (Mage/Cleric)
  robes: {
    id: 'robes',
    name: 'Magic Robes',
    emoji: '👘',
    slot: 'armor',
    baseStats: { defense: 2, maxHp: 35, attack: 3 },  // HP buffed from 15
    tier: 1,
    classes: ['mage', 'cleric', 'necromancer'],
  },
  arcaneVestments: {
    id: 'arcaneVestments',
    name: 'Arcane Vestments',
    emoji: '🧙',
    slot: 'armor',
    baseStats: { defense: 3, maxHp: 45, attack: 6 },  // HP buffed from 20
    tier: 2,
    classes: ['mage'],
  },
  holyRobes: {
    id: 'holyRobes',
    name: 'Holy Robes',
    emoji: '👼',
    slot: 'armor',
    baseStats: { defense: 4, maxHp: 30 },
    tier: 2,
    classes: ['cleric'],
  },

  // Accessories (all classes can use most)
  ring: {
    id: 'ring',
    name: 'Ring of Power',
    emoji: '💍',
    slot: 'accessory',
    baseStats: { attack: 3 },
    tier: 1,
    classes: null, // All classes
  },
  amulet: {
    id: 'amulet',
    name: 'Amulet of Protection',
    emoji: '📿',
    slot: 'accessory',
    baseStats: { defense: 3, maxHp: 15 },
    tier: 1,
    classes: null,
  },
  boots: {
    id: 'boots',
    name: 'Swift Boots',
    emoji: '👢',
    slot: 'accessory',
    baseStats: { speed: 5 },
    tier: 1,
    classes: null,
  },
  crown: {
    id: 'crown',
    name: 'Crown of Might',
    emoji: '👑',
    slot: 'accessory',
    baseStats: { attack: 5, defense: 5, maxHp: 25 },
    tier: 2,
    classes: null,
  },
  warriorBelt: {
    id: 'warriorBelt',
    name: 'Warrior Belt',
    emoji: '🥋',
    slot: 'accessory',
    baseStats: { attack: 4, defense: 4 },
    tier: 1,
    classes: ['warrior'],
  },
  thiefGloves: {
    id: 'thiefGloves',
    name: 'Thief Gloves',
    emoji: '🧤',
    slot: 'accessory',
    baseStats: { attack: 2, speed: 6 },
    tier: 1,
    classes: ['rogue'],
  },
  spellbook: {
    id: 'spellbook',
    name: 'Spellbook',
    emoji: '📖',
    slot: 'accessory',
    baseStats: { attack: 6 },
    tier: 1,
    classes: ['mage'],
  },
  holyRelic: {
    id: 'holyRelic',
    name: 'Holy Relic',
    emoji: '⭐',
    slot: 'accessory',
    baseStats: { maxHp: 25, defense: 3 },
    tier: 1,
    classes: ['cleric'],
  },

  // Ranger Weapons
  longbow: {
    id: 'longbow',
    name: 'Longbow',
    emoji: '🏹',
    slot: 'weapon',
    baseStats: { attack: 9, speed: 3 },
    tier: 2,
    classes: ['ranger'],
  },
  huntersBow: {
    id: 'huntersBow',
    name: "Hunter's Bow",
    emoji: '🎯',
    slot: 'weapon',
    baseStats: { attack: 14, speed: 4 },
    tier: 3,
    classes: ['ranger'],
  },

  // Ranger Armor
  huntersCloak: {
    id: 'huntersCloak',
    name: "Hunter's Cloak",
    emoji: '🧥',
    slot: 'armor',
    baseStats: { defense: 4, speed: 4, maxHp: 15 },
    tier: 2,
    classes: ['ranger'],
  },
  forestguardVest: {
    id: 'forestguardVest',
    name: 'Forestguard Vest',
    emoji: '🌲',
    slot: 'armor',
    baseStats: { defense: 6, speed: 5, maxHp: 25 },
    tier: 3,
    classes: ['ranger'],
  },

  // Ranger Accessories
  enchantedQuiver: {
    id: 'enchantedQuiver',
    name: 'Enchanted Quiver',
    emoji: '🎒',
    slot: 'accessory',
    baseStats: { attack: 4, speed: 4 },
    tier: 2,
    classes: ['ranger'],
  },
  hawkeyeAmulet: {
    id: 'hawkeyeAmulet',
    name: 'Hawkeye Amulet',
    emoji: '🦅',
    slot: 'accessory',
    baseStats: { attack: 6, speed: 6 },
    tier: 3,
    classes: ['ranger'],
  },

  // Necromancer Weapons
  soulStaff: {
    id: 'soulStaff',
    name: 'Soul Staff',
    emoji: '🦯',
    slot: 'weapon',
    baseStats: { attack: 12, maxHp: -10 },
    tier: 2,
    classes: ['necromancer'],
  },
  lichStaff: {
    id: 'lichStaff',
    name: 'Lich Staff',
    emoji: '⚰️',
    slot: 'weapon',
    baseStats: { attack: 18, maxHp: -15 },
    tier: 3,
    classes: ['necromancer'],
  },

  // Necromancer Armor
  deathRobes: {
    id: 'deathRobes',
    name: 'Death Robes',
    emoji: '🖤',
    slot: 'armor',
    baseStats: { defense: 3, attack: 5, maxHp: 10 },
    tier: 2,
    classes: ['necromancer'],
  },
  shroudOfShadows: {
    id: 'shroudOfShadows',
    name: 'Shroud of Shadows',
    emoji: '🌑',
    slot: 'armor',
    baseStats: { defense: 5, attack: 8, maxHp: 15 },
    tier: 3,
    classes: ['necromancer'],
  },

  // Necromancer Accessories
  skullAmulet: {
    id: 'skullAmulet',
    name: 'Skull Amulet',
    emoji: '💀',
    slot: 'accessory',
    baseStats: { attack: 5, defense: 2 },
    tier: 2,
    classes: ['necromancer'],
  },
  soulGem: {
    id: 'soulGem',
    name: 'Soul Gem',
    emoji: '💎',
    slot: 'accessory',
    baseStats: { attack: 8, defense: 3 },
    tier: 3,
    classes: ['necromancer'],
  },

  // Tier 3 Universal Items
  titanBlade: {
    id: 'titanBlade',
    name: 'Titan Blade',
    emoji: '⚔️',
    slot: 'weapon',
    baseStats: { attack: 18, maxHp: 30 },
    tier: 3,
    classes: ['warrior'],
  },
  archmageStaff: {
    id: 'archmageStaff',
    name: 'Archmage Staff',
    emoji: '🔮',
    slot: 'weapon',
    baseStats: { attack: 22 },
    tier: 3,
    classes: ['mage'],
  },
  dragonscaleArmor: {
    id: 'dragonscaleArmor',
    name: 'Dragonscale Armor',
    emoji: '🐉',
    slot: 'armor',
    baseStats: { defense: 12, maxHp: 50 },
    tier: 3,
    classes: ['warrior'],
  },
  phoenixFeather: {
    id: 'phoenixFeather',
    name: 'Phoenix Feather',
    emoji: '🔥',
    slot: 'accessory',
    baseStats: { attack: 8, speed: 8, maxHp: 20 },
    tier: 3,
    classes: null, // All classes
  },
  shadowDagger: {
    id: 'shadowDagger',
    name: 'Shadow Dagger',
    emoji: '🗡️',
    slot: 'weapon',
    baseStats: { attack: 15, speed: 8 },
    tier: 3,
    classes: ['rogue'],
  },
  divineVestments: {
    id: 'divineVestments',
    name: 'Divine Vestments',
    emoji: '👼',
    slot: 'armor',
    baseStats: { defense: 8, maxHp: 45, attack: 4 },
    tier: 3,
    classes: ['cleric'],
  },
  celestialOrb: {
    id: 'celestialOrb',
    name: 'Celestial Orb',
    emoji: '✨',
    slot: 'weapon',
    baseStats: { attack: 14, maxHp: 25 },
    tier: 3,
    classes: ['cleric'],
  },

  // Paladin Weapons
  holyBlade: {
    id: 'holyBlade',
    name: 'Holy Blade',
    emoji: '⚔️',
    slot: 'weapon',
    baseStats: { attack: 6, defense: 2 },
    tier: 1,
    classes: ['paladin'],
  },
  crusaderSword: {
    id: 'crusaderSword',
    name: 'Crusader Sword',
    emoji: '🗡️',
    slot: 'weapon',
    baseStats: { attack: 10, defense: 4, maxHp: 15 },
    tier: 2,
    classes: ['paladin'],
  },
  radiantBlade: {
    id: 'radiantBlade',
    name: 'Radiant Blade',
    emoji: '✨',
    slot: 'weapon',
    baseStats: { attack: 16, defense: 6, maxHp: 25 },
    tier: 3,
    classes: ['paladin'],
  },

  // Paladin Armor
  paladinPlate: {
    id: 'paladinPlate',
    name: 'Paladin Plate',
    emoji: '🛡️',
    slot: 'armor',
    baseStats: { defense: 6, maxHp: 25 },
    tier: 1,
    classes: ['paladin'],
  },
  crusaderArmor: {
    id: 'crusaderArmor',
    name: 'Crusader Armor',
    emoji: '⚜️',
    slot: 'armor',
    baseStats: { defense: 9, maxHp: 40, attack: 3 },
    tier: 2,
    classes: ['paladin'],
  },
  sanctifiedPlate: {
    id: 'sanctifiedPlate',
    name: 'Sanctified Plate',
    emoji: '🏅',
    slot: 'armor',
    baseStats: { defense: 12, maxHp: 55, attack: 5 },
    tier: 3,
    classes: ['paladin'],
  },

  // Knight Weapons
  knightsSword: {
    id: 'knightsSword',
    name: "Knight's Sword",
    emoji: '🗡️',
    slot: 'weapon',
    baseStats: { attack: 5, defense: 3 },
    tier: 1,
    classes: ['knight'],
  },
  towerShield: {
    id: 'towerShield',
    name: 'Tower Shield',
    emoji: '🛡️',
    slot: 'weapon',
    baseStats: { attack: 3, defense: 8, maxHp: 20 },
    tier: 2,
    classes: ['knight'],
  },
  bastionBlade: {
    id: 'bastionBlade',
    name: 'Bastion Blade',
    emoji: '⚔️',
    slot: 'weapon',
    baseStats: { attack: 8, defense: 10, maxHp: 30 },
    tier: 3,
    classes: ['knight'],
  },

  // Knight Armor
  knightsPlate: {
    id: 'knightsPlate',
    name: "Knight's Plate",
    emoji: '🦾',
    slot: 'armor',
    baseStats: { defense: 7, maxHp: 30 },
    tier: 1,
    classes: ['knight'],
  },
  fortressArmor: {
    id: 'fortressArmor',
    name: 'Fortress Armor',
    emoji: '🏰',
    slot: 'armor',
    baseStats: { defense: 11, maxHp: 50 },
    tier: 2,
    classes: ['knight'],
  },
  aegisPlate: {
    id: 'aegisPlate',
    name: 'Aegis Plate',
    emoji: '🔱',
    slot: 'armor',
    baseStats: { defense: 15, maxHp: 70 },
    tier: 3,
    classes: ['knight'],
  },

  // Druid Weapons
  natureScepter: {
    id: 'natureScepter',
    name: 'Nature Scepter',
    emoji: '🌿',
    slot: 'weapon',
    baseStats: { attack: 6, maxHp: 10 },
    tier: 1,
    classes: ['druid'],
  },
  oakStaff: {
    id: 'oakStaff',
    name: 'Oak Staff',
    emoji: '🌳',
    slot: 'weapon',
    baseStats: { attack: 10, maxHp: 20, defense: 2 },
    tier: 2,
    classes: ['druid'],
  },
  worldtreeStaff: {
    id: 'worldtreeStaff',
    name: 'Worldtree Staff',
    emoji: '🌲',
    slot: 'weapon',
    baseStats: { attack: 15, maxHp: 35, defense: 4 },
    tier: 3,
    classes: ['druid'],
  },

  // Druid Armor
  groveRobes: {
    id: 'groveRobes',
    name: 'Grove Robes',
    emoji: '🍃',
    slot: 'armor',
    baseStats: { defense: 3, maxHp: 20, speed: 1 },
    tier: 1,
    classes: ['druid'],
  },
  barkArmor: {
    id: 'barkArmor',
    name: 'Bark Armor',
    emoji: '🪵',
    slot: 'armor',
    baseStats: { defense: 5, maxHp: 30, speed: 2 },
    tier: 2,
    classes: ['druid'],
  },
  natureguardVest: {
    id: 'natureguardVest',
    name: 'Natureguard Vest',
    emoji: '🌺',
    slot: 'armor',
    baseStats: { defense: 7, maxHp: 45, speed: 3, attack: 3 },
    tier: 3,
    classes: ['druid'],
  },

  // Shaman Weapons
  totemStaff: {
    id: 'totemStaff',
    name: 'Totem Staff',
    emoji: '🪘',
    slot: 'weapon',
    baseStats: { attack: 7, speed: 1 },
    tier: 1,
    classes: ['shaman'],
  },
  spiritRod: {
    id: 'spiritRod',
    name: 'Spirit Rod',
    emoji: '🌀',
    slot: 'weapon',
    baseStats: { attack: 11, speed: 2, maxHp: 15 },
    tier: 2,
    classes: ['shaman'],
  },
  ancestralStaff: {
    id: 'ancestralStaff',
    name: 'Ancestral Staff',
    emoji: '⚡',
    slot: 'weapon',
    baseStats: { attack: 17, speed: 3, maxHp: 25 },
    tier: 3,
    classes: ['shaman'],
  },

  // Shaman Armor
  shamanRobes: {
    id: 'shamanRobes',
    name: 'Shaman Robes',
    emoji: '🪶',
    slot: 'armor',
    baseStats: { defense: 3, maxHp: 15, speed: 2 },
    tier: 1,
    classes: ['shaman'],
  },
  ancestralVest: {
    id: 'ancestralVest',
    name: 'Ancestral Vest',
    emoji: '🦴',
    slot: 'armor',
    baseStats: { defense: 5, maxHp: 25, speed: 3 },
    tier: 2,
    classes: ['shaman'],
  },
  spiritwalkerRobes: {
    id: 'spiritwalkerRobes',
    name: 'Spiritwalker Robes',
    emoji: '👻',
    slot: 'armor',
    baseStats: { defense: 7, maxHp: 40, speed: 4, attack: 4 },
    tier: 3,
    classes: ['shaman'],
  },
};

export const EQUIPMENT_LIST = Object.values(EQUIPMENT_TEMPLATES);

export const getEquipmentByTier = (tier) =>
  EQUIPMENT_LIST.filter(e => e.tier <= tier);

// Check if a class can use equipment
export const canClassUseEquipment = (classId, equipment) => {
  if (!equipment.classes) return true; // null means all classes
  return equipment.classes.includes(classId);
};

// Get equipment usable by a specific class
export const getEquipmentForClass = (classId, tier = 99) => {
  return EQUIPMENT_LIST.filter(e =>
    e.tier <= tier && canClassUseEquipment(classId, e)
  );
};

// Generate a random equipment drop
export const generateEquipment = (dungeonLevel, options = {}) => {
  const tier = Math.ceil(dungeonLevel / 5);
  const possibleItems = getEquipmentByTier(tier);
  const template = possibleItems[Math.floor(Math.random() * possibleItems.length)];

  // Determine rarity based on dungeon level (higher = better chances)
  // Elite/raid dungeons get bonus to rarity
  const rarityBonus = options.lootMultiplier ? (options.lootMultiplier - 1) * 20 : 0;
  const rarityRoll = Math.random() * 100 + dungeonLevel * 2 + rarityBonus;
  let rarity;
  if (rarityRoll > 98) rarity = 'legendary';
  else if (rarityRoll > 90) rarity = 'epic';
  else if (rarityRoll > 75) rarity = 'rare';
  else if (rarityRoll > 50) rarity = 'uncommon';
  else rarity = 'common';

  // Force minimum rarity if specified
  if (options.guaranteedRarity) {
    const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const minIndex = rarityOrder.indexOf(options.guaranteedRarity);
    const currentIndex = rarityOrder.indexOf(rarity);
    if (currentIndex < minIndex) {
      rarity = options.guaranteedRarity;
    }
  }

  const rarityData = RARITY[rarity];

  // Calculate final stats with rarity multiplier
  const stats = {};
  for (const [stat, value] of Object.entries(template.baseStats)) {
    stats[stat] = Math.round(value * rarityData.multiplier * (1 + dungeonLevel * 0.1));
  }

  // Roll for affixes based on rarity (rare and above)
  const affixes = [];
  if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
    // Rare: 1 affix, Epic: 2 affixes, Legendary: 2 affixes
    const affixCount = rarity === 'rare' ? 1 : 2;

    // Try to roll prefix first
    const prefix = rollAffix(template.slot, tier, 'prefix');
    if (prefix) affixes.push(prefix.id);

    // Try to roll suffix (always for epic/legendary, or if no prefix was available for rare)
    if (affixCount >= 2 || (affixCount === 1 && affixes.length === 0)) {
      const suffix = rollAffix(template.slot, tier, 'suffix');
      if (suffix) affixes.push(suffix.id);
    }
  }

  // Build name with affixes
  let itemName = `${rarityData.name} ${template.name}`;
  if (affixes.length > 0) {
    itemName = buildAffixedName(template.name, affixes);
  }

  return {
    id: `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: template.id,
    name: itemName,
    emoji: template.emoji,
    slot: template.slot,
    rarity,
    rarityColor: rarityData.color,
    stats,
    classes: template.classes,
    affixes: affixes.length > 0 ? affixes : undefined,
  };
};

// Helper to roll an affix - uses centralized affix definitions
const rollAffix = (slot, tier, type) => {
  const affix = rollAffixFromPool(slot, tier, type === 'prefix' ? AFFIX_TYPE.PREFIX : AFFIX_TYPE.SUFFIX);
  if (!affix) return null;
  return { id: affix.id, name: affix.name };
};

// Build item name with affixes - uses centralized affix definitions
const buildAffixedName = (baseName, affixIds) => {
  return buildAffixName(baseName, affixIds);
};

// Consumable items (one-time use, not equipment)
export const CONSUMABLE_TEMPLATES = {
  resurrectionScroll: {
    id: 'resurrectionScroll',
    name: 'Resurrection Scroll',
    description: 'Automatically revives a fallen hero with 50% HP. Consumed on use or dungeon exit.',
    icon: 'scroll',
    rarity: 'rare',
    reviveHpPercent: 0.5,
    maxStack: 1,
    dropWeight: 5, // Relative weight for loot tables
    minDungeonLevel: 5, // Only drops from dungeon level 5+
  },
};

// Generate a consumable drop (rare chance)
export const generateConsumableDrop = (dungeonLevel, hasDeadPartyMember = false) => {
  // Only resurrection scroll for now, can expand later
  const template = CONSUMABLE_TEMPLATES.resurrectionScroll;

  // Check minimum dungeon level requirement
  if (dungeonLevel < template.minDungeonLevel) return null;

  // Base drop chance: 2% at level 5, scaling up to 5% at level 30
  // Boosted to 15% if party has a dead member
  let dropChance = 0.02 + (dungeonLevel - 5) * 0.0012;
  if (hasDeadPartyMember) {
    dropChance = Math.max(dropChance, 0.15);
  }
  if (Math.random() > dropChance) return null;

  return {
    id: `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: template.id,
    name: template.name,
    description: template.description,
    icon: template.icon,
    rarity: template.rarity,
    reviveHpPercent: template.reviveHpPercent,
  };
};
