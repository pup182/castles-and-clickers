// Dungeon tier definitions

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

// Get tier for a dungeon level
export const getDungeonTier = (level) => {
  return DUNGEON_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel) || DUNGEON_TIERS[5];
};

// Get max party size (base 4, increases at certain dungeon clears)
export const getMaxPartySize = (highestDungeonCleared = 0) => {
  let size = 4;
  if (highestDungeonCleared >= 10) size = 5;
  if (highestDungeonCleared >= 20) size = 6;
  return size;
};
