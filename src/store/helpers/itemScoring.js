// Stat priority weights for auto-equip decisions
export const STAT_PRIORITIES = {
  tank:     { maxHp: 2.0, defense: 1.5, attack: 0.5, speed: 0.3 },
  damage:   { attack: 2.0, speed: 1.0, maxHp: 0.3, defense: 0.3 },
  balanced: { attack: 1.0, defense: 1.0, maxHp: 1.0, speed: 1.0 },
  speed:    { speed: 2.0, attack: 1.0, maxHp: 0.5, defense: 0.3 },
};

// Default stat priority per class
export const DEFAULT_CLASS_PRIORITY = {
  warrior: 'tank',
  paladin: 'tank',
  knight: 'tank',
  mage: 'damage',
  rogue: 'speed',
  cleric: 'balanced',
  druid: 'balanced',
  shaman: 'balanced',
  ranger: 'speed',
  necromancer: 'damage',
};

// Calculate weighted item score based on priority
export const calculateItemScore = (item, priority) => {
  const weights = STAT_PRIORITIES[priority] || STAT_PRIORITIES.balanced;
  return Object.entries(item.stats).reduce(
    (sum, [stat, val]) => sum + val * (weights[stat] || 0.5), 0
  );
};

// Calculate sell value for an item
export const calculateSellValue = (item) => {
  const statTotal = Object.values(item.stats).reduce((a, b) => a + b, 0);
  const rarityMultiplier = { common: 1, uncommon: 2, rare: 4, epic: 8, legendary: 16 };
  return Math.max(1, Math.floor(statTotal * (rarityMultiplier[item.rarity] || 1)));
};

// Rarity ordering for comparisons
export const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
