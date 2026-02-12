// Room-based dungeon system
// Simpler, clearer progression: room by room, clear monsters, move on

import { getMonstersByTier, getBossByTier } from '../data/monsters';
import { getThemeForLevel } from '../data/dungeonThemes';

// Room types
export const ROOM_TYPES = {
  ENTRANCE: 'entrance',
  COMBAT: 'combat',
  TREASURE: 'treasure',
  BOSS: 'boss',
};

// Generate a simple room layout (15x11 grid per room)
export const generateRoom = (roomType, dungeonLevel) => {
  const width = 15;
  const height = 11;
  const theme = getThemeForLevel(dungeonLevel);

  // Create floor grid
  const grid = Array(height).fill(null).map(() => Array(width).fill('floor'));

  // Add walls around edges
  for (let x = 0; x < width; x++) {
    grid[0][x] = 'wall';
    grid[height - 1][x] = 'wall';
  }
  for (let y = 0; y < height; y++) {
    grid[y][0] = 'wall';
    grid[y][width - 1] = 'wall';
  }

  // Add some random obstacles (pillars)
  const obstacleCount = roomType === 'boss' ? 3 : 2 + Math.floor(Math.random() * 4);
  const pillarPositions = [];
  for (let i = 0; i < obstacleCount; i++) {
    const ox = 3 + Math.floor(Math.random() * (width - 6));
    const oy = 3 + Math.floor(Math.random() * (height - 6));
    grid[oy][ox] = 'pillar';
    pillarPositions.push({ x: ox, y: oy });
  }

  // Door positions
  grid[Math.floor(height / 2)][0] = 'door_left';
  grid[Math.floor(height / 2)][width - 1] = 'door_right';

  // Generate decorative props based on theme
  const decorations = [];
  const decorCount = roomType === 'boss' ? 4 : 2 + Math.floor(Math.random() * 4);
  const usedPositions = new Set(pillarPositions.map(p => `${p.x},${p.y}`));
  usedPositions.add(`${Math.floor(height / 2)},0`); // Left door
  usedPositions.add(`${Math.floor(height / 2)},${width - 1}`); // Right door

  for (let i = 0; i < decorCount; i++) {
    // Find a valid floor position not too close to spawn points
    let attempts = 0;
    while (attempts < 20) {
      const dx = 1 + Math.floor(Math.random() * (width - 2));
      const dy = 1 + Math.floor(Math.random() * (height - 2));
      const key = `${dx},${dy}`;

      // Avoid hero spawn area (left side) and monster area (right side)
      if (dx >= 5 && dx <= width - 5 && !usedPositions.has(key) && grid[dy][dx] === 'floor') {
        const propType = theme.props[Math.floor(Math.random() * theme.props.length)];
        decorations.push({ x: dx, y: dy, type: propType });
        usedPositions.add(key);
        break;
      }
      attempts++;
    }
  }

  // Add corner decorations (cobwebs for crypt, vines for forest, etc.)
  const cornerProps = {
    cave: 'stalactite',
    crypt: 'cobweb',
    forest: 'vine',
    castle: 'chains',
    volcano: 'ember',
    void: 'rune',
  };
  const cornerProp = cornerProps[theme.id];
  if (cornerProp && Math.random() > 0.3) {
    decorations.push({ x: 1, y: 1, type: cornerProp, isCorner: true });
  }
  if (cornerProp && Math.random() > 0.3) {
    decorations.push({ x: width - 2, y: 1, type: cornerProp, isCorner: true });
  }

  return {
    grid,
    width,
    height,
    type: roomType,
    theme,
    decorations,
  };
};

// Generate monsters for a room
export const generateRoomMonsters = (roomType, dungeonLevel, roomNumber) => {
  const tier = Math.min(6, Math.ceil(dungeonLevel / 5));
  // Exponential scaling: 1.08x per level for balanced progression
  // Level 1: 1.0x, Level 5: 1.36x, Level 10: 2.0x, Level 15: 2.9x, Level 20: 4.3x
  const scaleFactor = Math.pow(1.08, dungeonLevel - 1);
  // Speed scales at 25% of other stats - keeps monsters relevant at high levels
  const speedScaleFactor = 1 + (scaleFactor - 1) * 0.25;

  if (roomType === ROOM_TYPES.BOSS) {
    const boss = getBossByTier(tier);
    if (!boss) return [];

    // Generate random color variation for visual distinction
    const colorVariation = {
      hueShift: Math.floor(Math.random() * 30) - 15,    // -15 to +15 degrees
      saturationMod: 0.9 + Math.random() * 0.2,          // 90-110%
      brightnessMod: 0.95 + Math.random() * 0.1,         // 95-105%
    };

    return [{
      id: `boss_${Date.now()}`,
      templateId: boss.id,
      name: boss.name,
      emoji: boss.emoji,
      isBoss: true,
      colorVariation,
      position: { x: 11, y: 5 }, // Right side of larger room
      stats: {
        maxHp: Math.floor(boss.baseStats.maxHp * scaleFactor),
        hp: Math.floor(boss.baseStats.maxHp * scaleFactor),
        attack: Math.floor(boss.baseStats.attack * scaleFactor),
        defense: Math.floor(boss.baseStats.defense * scaleFactor),
        speed: Math.floor(boss.baseStats.speed * speedScaleFactor),
      },
      xpReward: Math.floor(boss.xpReward * scaleFactor),
      goldReward: {
        min: Math.floor(boss.goldReward.min * scaleFactor),
        max: Math.floor(boss.goldReward.max * scaleFactor),
      },
    }];
  }

  if (roomType === ROOM_TYPES.ENTRANCE) {
    return []; // No monsters in entrance
  }

  // Regular combat or treasure room
  const possibleMonsters = getMonstersByTier(tier);
  if (possibleMonsters.length === 0) return [];

  const monsterCount = roomType === ROOM_TYPES.TREASURE
    ? 1 + Math.floor(Math.random() * 2)
    : 2 + Math.floor(Math.random() * 2) + Math.floor(roomNumber / 2);

  const monsters = [];
  const positions = [
    { x: 10, y: 3 },
    { x: 11, y: 5 },
    { x: 10, y: 7 },
    { x: 12, y: 4 },
    { x: 12, y: 6 },
    { x: 13, y: 5 },
  ];

  for (let i = 0; i < Math.min(monsterCount, positions.length); i++) {
    const template = possibleMonsters[Math.floor(Math.random() * possibleMonsters.length)];

    monsters.push({
      id: `monster_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      templateId: template.id,
      name: template.name,
      emoji: template.emoji,
      isBoss: false,
      position: { ...positions[i] },
      stats: {
        maxHp: Math.floor(template.baseStats.maxHp * scaleFactor),
        hp: Math.floor(template.baseStats.maxHp * scaleFactor),
        attack: Math.floor(template.baseStats.attack * scaleFactor),
        defense: Math.floor(template.baseStats.defense * scaleFactor),
        speed: Math.floor(template.baseStats.speed * speedScaleFactor),
      },
      xpReward: Math.floor(template.xpReward * scaleFactor),
      goldReward: {
        min: Math.floor(template.goldReward.min * scaleFactor),
        max: Math.floor(template.goldReward.max * scaleFactor),
      },
    });
  }

  return monsters;
};

// Generate dungeon structure (list of rooms)
export const generateDungeonRooms = (dungeonLevel) => {
  const roomCount = 4 + Math.floor(dungeonLevel / 2); // More rooms at higher levels

  const rooms = [];

  // First room is entrance
  rooms.push({
    index: 0,
    type: ROOM_TYPES.ENTRANCE,
    cleared: false,
  });

  // Middle rooms
  for (let i = 1; i < roomCount - 1; i++) {
    // Chance for treasure room
    const isTreasure = Math.random() < 0.2;
    rooms.push({
      index: i,
      type: isTreasure ? ROOM_TYPES.TREASURE : ROOM_TYPES.COMBAT,
      cleared: false,
    });
  }

  // Last room is boss
  rooms.push({
    index: roomCount - 1,
    type: ROOM_TYPES.BOSS,
    cleared: false,
  });

  return rooms;
};

// Get hero starting positions (left side of room)
export const getHeroPositions = (heroCount) => {
  const positions = [
    { x: 3, y: 4 },
    { x: 3, y: 6 },
    { x: 2, y: 5 },
    { x: 4, y: 5 },
  ];
  return positions.slice(0, heroCount);
};

// Calculate Manhattan distance
export const getDistance = (a, b) => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

// Check if position is walkable
export const isWalkable = (grid, x, y) => {
  if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) return false;
  const tile = grid[y][x];
  return tile === 'floor' || tile === 'door_left' || tile === 'door_right';
};

// Find path between two points (simple A* for small grid)
export const findPath = (grid, start, end, occupiedPositions = []) => {
  const occupied = new Set(occupiedPositions.map(p => `${p.x},${p.y}`));

  const openSet = [{ ...start, g: 0, h: getDistance(start, end), path: [start] }];
  const closedSet = new Set();

  while (openSet.length > 0) {
    // Get node with lowest f score
    openSet.sort((a, b) => (a.g + a.h) - (b.g + b.h));
    const current = openSet.shift();

    if (current.x === end.x && current.y === end.y) {
      return current.path;
    }

    closedSet.add(`${current.x},${current.y}`);

    // Check neighbors
    const neighbors = [
      { x: current.x, y: current.y - 1 },
      { x: current.x + 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x - 1, y: current.y },
    ];

    for (const neighbor of neighbors) {
      const key = `${neighbor.x},${neighbor.y}`;

      if (closedSet.has(key)) continue;
      if (!isWalkable(grid, neighbor.x, neighbor.y)) continue;
      if (occupied.has(key) && !(neighbor.x === end.x && neighbor.y === end.y)) continue;

      const g = current.g + 1;
      const h = getDistance(neighbor, end);
      const existing = openSet.find(n => n.x === neighbor.x && n.y === neighbor.y);

      if (!existing) {
        openSet.push({
          x: neighbor.x,
          y: neighbor.y,
          g,
          h,
          path: [...current.path, { x: neighbor.x, y: neighbor.y }],
        });
      } else if (g < existing.g) {
        existing.g = g;
        existing.path = [...current.path, { x: neighbor.x, y: neighbor.y }];
      }
    }
  }

  return null; // No path found
};
