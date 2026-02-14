// Shop consumable definitions

export const CONSUMABLE_CATEGORIES = {
  healing: { name: 'Healing', color: '#ef4444' },
  xp: { name: 'XP Boost', color: '#a855f7' },
  buff: { name: 'Elixir', color: '#3b82f6' },
};

export const SHOP_CONSUMABLES = {
  healingPotion: {
    id: 'healingPotion',
    name: 'Healing Potion',
    category: 'healing',
    description: 'Heal 30% max HP (one hero)',
    effect: { type: 'heal', percent: 0.3 },
    costBase: 25,
    costPerLevel: 5,
    unlockDungeon: 5,
    maxStack: 5,
  },
  greaterHealingPotion: {
    id: 'greaterHealingPotion',
    name: 'Greater Healing Potion',
    category: 'healing',
    description: 'Heal 60% max HP (one hero)',
    effect: { type: 'heal', percent: 0.6 },
    costBase: 75,
    costPerLevel: 10,
    unlockDungeon: 15,
    maxStack: 3,
  },
  xpScroll: {
    id: 'xpScroll',
    name: 'XP Scroll',
    category: 'xp',
    description: '+25% XP next dungeon',
    effect: { type: 'xpBuff', multiplier: 0.25 },
    costBase: 100,
    costPerLevel: 8,
    unlockDungeon: 5,
    maxStack: 3,
  },
  greaterXpScroll: {
    id: 'greaterXpScroll',
    name: 'Greater XP Scroll',
    category: 'xp',
    description: '+50% XP next dungeon',
    effect: { type: 'xpBuff', multiplier: 0.5 },
    costBase: 250,
    costPerLevel: 15,
    unlockDungeon: 15,
    maxStack: 2,
  },
  attackElixir: {
    id: 'attackElixir',
    name: 'Elixir of Might',
    category: 'buff',
    description: '+15% attack next dungeon',
    effect: { type: 'statBuff', stat: 'attack', multiplier: 0.15 },
    costBase: 80,
    costPerLevel: 6,
    unlockDungeon: 10,
    maxStack: 2,
  },
  defenseElixir: {
    id: 'defenseElixir',
    name: 'Elixir of Fortitude',
    category: 'buff',
    description: '+15% defense & HP next dungeon',
    effect: { type: 'statBuff', stat: 'defense', multiplier: 0.15 },
    costBase: 80,
    costPerLevel: 6,
    unlockDungeon: 10,
    maxStack: 2,
  },
  speedElixir: {
    id: 'speedElixir',
    name: 'Elixir of Haste',
    category: 'buff',
    description: '+15% speed next dungeon',
    effect: { type: 'statBuff', stat: 'speed', multiplier: 0.15 },
    costBase: 80,
    costPerLevel: 6,
    unlockDungeon: 10,
    maxStack: 2,
  },
};

/** Cost scales with dungeon progress */
export const getConsumableCost = (id, highestDungeonCleared) => {
  const template = SHOP_CONSUMABLES[id];
  if (!template) return 0;
  return template.costBase + template.costPerLevel * highestDungeonCleared;
};

/** Filter consumables by unlock level */
export const getAvailableConsumables = (highestDungeonCleared) => {
  return Object.values(SHOP_CONSUMABLES).filter(
    c => highestDungeonCleared >= c.unlockDungeon
  );
};
