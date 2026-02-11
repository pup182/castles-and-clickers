// Homestead buildings and their upgrade effects

export const BUILDINGS = {
  barracks: {
    id: 'barracks',
    name: 'Barracks',
    emoji: '🛡️',
    description: 'Strengthens your heroes\' constitution',
    maxLevel: 10,
    effect: {
      type: 'hp',
      valuePerLevel: 0.05, // +5% HP per level
    },
    baseCost: 100,
    costMultiplier: 2.5,
  },
  armory: {
    id: 'armory',
    name: 'Armory',
    emoji: '⚔️',
    description: 'Improves weapon quality and training',
    maxLevel: 10,
    effect: {
      type: 'attack',
      valuePerLevel: 0.05, // +5% Attack per level
    },
    baseCost: 100,
    costMultiplier: 2.5,
  },
  trainingGrounds: {
    id: 'trainingGrounds',
    name: 'Training Grounds',
    emoji: '🎯',
    description: 'Heroes learn faster from combat',
    maxLevel: 10,
    effect: {
      type: 'xpGain',
      valuePerLevel: 0.10, // +10% XP per level
    },
    baseCost: 150,
    costMultiplier: 2.5,
  },
  treasury: {
    id: 'treasury',
    name: 'Treasury',
    emoji: '💰',
    description: 'Better at finding and appraising loot',
    maxLevel: 10,
    effect: {
      type: 'goldFind',
      valuePerLevel: 0.10, // +10% Gold per level
    },
    baseCost: 150,
    costMultiplier: 2.5,
  },
  infirmary: {
    id: 'infirmary',
    name: 'Infirmary',
    emoji: '🏥',
    description: 'Heals heroes while exploring',
    maxLevel: 5,
    effect: {
      type: 'healBetweenDungeons',
      valuePerLevel: 0.02, // +2% HP per exploration tick per level
    },
    baseCost: 250,
    costMultiplier: 2.5,
  },
  fortress: {
    id: 'fortress',
    name: 'Fortress',
    emoji: '🏰',
    description: 'Reinforces armor and shields',
    maxLevel: 10,
    effect: {
      type: 'defense',
      valuePerLevel: 0.05, // +5% Defense per level
    },
    baseCost: 100,
    costMultiplier: 2.5,
  },
  academy: {
    id: 'academy',
    name: 'Academy',
    emoji: '📚',
    description: 'Reduces skill cooldowns',
    maxLevel: 5,
    effect: {
      type: 'cooldownReduction',
      valuePerLevel: 1, // -1 turn cooldown per level
    },
    baseCost: 300,
    costMultiplier: 3,
  },
};

// Calculate upgrade cost for a building at a given level
export const getUpgradeCost = (building, currentLevel) => {
  return Math.floor(building.baseCost * Math.pow(building.costMultiplier, currentLevel));
};

// Calculate total bonus from a building at a given level
export const getBuildingBonus = (building, level) => {
  return building.effect.valuePerLevel * level;
};

// Get all homestead bonuses from current levels
export const calculateHomesteadBonuses = (buildingLevels) => {
  const bonuses = {
    hp: 0,
    attack: 0,
    defense: 0,
    xpGain: 0,
    goldFind: 0,
    healBetweenDungeons: 0,
    cooldownReduction: 0,
  };

  for (const [buildingId, level] of Object.entries(buildingLevels)) {
    const building = BUILDINGS[buildingId];
    if (building && level > 0) {
      const effectType = building.effect.type;
      bonuses[effectType] += getBuildingBonus(building, level);
    }
  }

  return bonuses;
};

// Get building list in display order
export const getBuildingList = () => {
  return [
    BUILDINGS.barracks,
    BUILDINGS.armory,
    BUILDINGS.fortress,
    BUILDINGS.trainingGrounds,
    BUILDINGS.treasury,
    BUILDINGS.academy,
    BUILDINGS.infirmary,
  ];
};
