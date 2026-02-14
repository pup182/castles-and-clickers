// Procedural maze dungeon generator
// Uses BSP (Binary Space Partitioning) for room placement with corridor connections

import { getMonstersByTier, getBossByTier, ELITE_CONFIG, createEliteMonster, getEliteSpawnCount } from '../data/monsters';
import { getThemeForLevel, getThemeForRaid } from '../data/dungeonThemes';
import { isWorldBossLevel, getWorldBossForLevel } from '../data/worldBosses';
import { createWorldBossInstance, initBossState } from './bossEngine';
import { RAIDS } from '../data/raids';

// Tile types for the dungeon grid
export const TILE = {
  WALL: 0,
  FLOOR: 1,
  CORRIDOR: 2,
  DOOR: 3,
  ENTRANCE: 4,
  EXIT: 5,
  TREASURE: 6,
};

// Boss name generation
const BOSS_NAME_PREFIXES = [
  'Grim', 'Vex', 'Mor', 'Zal', 'Kra', 'Dra', 'Gor', 'Thal', 'Nex', 'Sar',
  'Mal', 'Vor', 'Rath', 'Kael', 'Bel', 'Xar', 'Zy', 'Az', 'Ul', 'Sha',
];

const BOSS_NAME_SUFFIXES = [
  'goth', 'rax', 'morn', 'fang', 'claw', 'bane', 'rok', 'zul', 'thos', 'rak',
  'gor', 'moth', 'reth', 'zar', 'koth', 'mus', 'dros', 'vex', 'nar', 'gul',
];

const BOSS_TITLES = [
  'the Destroyer', 'the Terrible', 'the Vile', 'the Cursed', 'the Eternal',
  'the Undying', 'the Merciless', 'the Dread', 'the Wicked', 'the Forsaken',
  'Doomharbinger', 'Worldbreaker', 'Soulrender', 'Fleshweaver', 'Bonecrusher',
];

// Generate a unique boss name from the base monster type
function generateBossName(baseName) {
  const prefix = BOSS_NAME_PREFIXES[Math.floor(Math.random() * BOSS_NAME_PREFIXES.length)];
  const suffix = BOSS_NAME_SUFFIXES[Math.floor(Math.random() * BOSS_NAME_SUFFIXES.length)];
  const title = BOSS_TITLES[Math.floor(Math.random() * BOSS_TITLES.length)];

  const uniqueName = prefix + suffix;

  // 50% chance to use title format, 50% to use "the [BaseName]" format
  if (Math.random() < 0.5) {
    return `${uniqueName} ${title}`;
  } else {
    return `${uniqueName}, ${baseName}`;
  }
}

// Room size configurations (bigger rooms)
const ROOM_SIZES = {
  tiny:   { minW: 7, maxW: 9, minH: 7, maxH: 9 },
  small:  { minW: 9, maxW: 12, minH: 9, maxH: 12 },
  medium: { minW: 12, maxW: 16, minH: 12, maxH: 16 },
  large:  { minW: 16, maxW: 20, minH: 14, maxH: 18 },
  boss:   { minW: 18, maxW: 24, minH: 16, maxH: 20 },
};

// Corridor width
const CORRIDOR_WIDTH = 3;

// Room types
export const MAZE_ROOM_TYPES = {
  ENTRANCE: 'entrance',
  COMBAT: 'combat',
  TREASURE: 'treasure',
  BOSS: 'boss',
  WING_BOSS: 'wing_boss',      // Raid wing boss room
  FINAL_BOSS: 'final_boss',    // Raid final boss room (locked until wing bosses dead)
};

// Get room size based on dungeon level
function getRoomSizeConfig(dungeonLevel, isBoss) {
  if (isBoss) return ROOM_SIZES.boss;
  if (dungeonLevel > 15) return ROOM_SIZES.large;
  if (dungeonLevel > 10) return ROOM_SIZES.medium;
  if (dungeonLevel > 5) return ROOM_SIZES.small;
  return ROOM_SIZES.tiny;
}

// Generate random integer between min and max (inclusive)
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Calculate dungeon size based on level (bigger to fit larger rooms)
function getDungeonSize(level) {
  const baseWidth = 60;
  const baseHeight = 45;
  const levelBonus = Math.min(30, Math.floor(level / 2));

  return {
    width: baseWidth + levelBonus,
    height: baseHeight + Math.floor(levelBonus * 0.75),
  };
}

// Calculate number of rooms based on level
function getRoomCount(level) {
  return Math.min(10, 5 + Math.floor(level / 4));
}

// Check if a position is within bounds
function inBounds(grid, x, y) {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length;
}

// Check if a room overlaps with existing rooms (with padding)
function roomOverlaps(rooms, newRoom, padding = 2) {
  for (const room of rooms) {
    if (newRoom.x - padding < room.x + room.width + padding &&
        newRoom.x + newRoom.width + padding > room.x - padding &&
        newRoom.y - padding < room.y + room.height + padding &&
        newRoom.y + newRoom.height + padding > room.y - padding) {
      return true;
    }
  }
  return false;
}

// Carve a room into the grid
function carveRoom(grid, room) {
  for (let y = room.y; y < room.y + room.height; y++) {
    for (let x = room.x; x < room.x + room.width; x++) {
      if (inBounds(grid, x, y)) {
        grid[y][x] = TILE.FLOOR;
      }
    }
  }
}

// Get center of a room
function getRoomCenter(room) {
  return {
    x: Math.floor(room.x + room.width / 2),
    y: Math.floor(room.y + room.height / 2),
  };
}

// Carve a horizontal corridor
function carveHorizontalCorridor(grid, x1, x2, y) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);

  for (let x = minX; x <= maxX; x++) {
    // Carve corridor with CORRIDOR_WIDTH tiles
    for (let offset = 0; offset < CORRIDOR_WIDTH; offset++) {
      if (inBounds(grid, x, y + offset) && grid[y + offset][x] === TILE.WALL) {
        grid[y + offset][x] = TILE.CORRIDOR;
      }
    }
  }
}

// Carve a vertical corridor
function carveVerticalCorridor(grid, y1, y2, x) {
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  for (let y = minY; y <= maxY; y++) {
    // Carve corridor with CORRIDOR_WIDTH tiles
    for (let offset = 0; offset < CORRIDOR_WIDTH; offset++) {
      if (inBounds(grid, x + offset, y) && grid[y][x + offset] === TILE.WALL) {
        grid[y][x + offset] = TILE.CORRIDOR;
      }
    }
  }
}

// Connect two rooms with L-shaped corridor
function connectRooms(grid, room1, room2) {
  const center1 = getRoomCenter(room1);
  const center2 = getRoomCenter(room2);

  // Randomly choose horizontal-first or vertical-first
  if (Math.random() < 0.5) {
    carveHorizontalCorridor(grid, center1.x, center2.x, center1.y);
    carveVerticalCorridor(grid, center1.y, center2.y, center2.x);
  } else {
    carveVerticalCorridor(grid, center1.y, center2.y, center1.x);
    carveHorizontalCorridor(grid, center1.x, center2.x, center2.y);
  }
}

// Add dead end branches with treasure
function addDeadEnds(grid, rooms, dungeonLevel) {
  const numDeadEnds = Math.min(3, Math.floor(dungeonLevel / 5));

  for (let i = 0; i < numDeadEnds; i++) {
    // Pick a random corridor tile
    const corridorTiles = [];
    for (let y = 2; y < grid.length - 2; y++) {
      for (let x = 2; x < grid[0].length - 2; x++) {
        if (grid[y][x] === TILE.CORRIDOR) {
          corridorTiles.push({ x, y });
        }
      }
    }

    if (corridorTiles.length === 0) continue;

    const start = corridorTiles[randInt(0, corridorTiles.length - 1)];

    // Try to extend in a random direction
    const directions = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
    ];

    const dir = directions[randInt(0, 3)];
    const length = randInt(3, 6);
    let endX = start.x;
    let endY = start.y;

    for (let step = 0; step < length; step++) {
      const nx = endX + dir.dx;
      const ny = endY + dir.dy;

      if (!inBounds(grid, nx, ny) || grid[ny][nx] !== TILE.WALL) break;

      // Carve corridor with CORRIDOR_WIDTH tiles
      grid[ny][nx] = TILE.CORRIDOR;
      for (let offset = 1; offset < CORRIDOR_WIDTH; offset++) {
        if (dir.dx === 0 && inBounds(grid, nx + offset, ny)) {
          grid[ny][nx + offset] = TILE.CORRIDOR;
        }
        if (dir.dy === 0 && inBounds(grid, nx, ny + offset)) {
          grid[ny + offset][nx] = TILE.CORRIDOR;
        }
      }

      endX = nx;
      endY = ny;
    }

    // Place treasure at the end
    if (grid[endY][endX] === TILE.CORRIDOR) {
      grid[endY][endX] = TILE.TREASURE;
    }
  }
}

// Generate the maze dungeon
export function generateMazeDungeon(level) {
  const { width, height } = getDungeonSize(level);
  const roomCount = getRoomCount(level);

  // Initialize grid with walls
  const grid = Array(height).fill(null).map(() => Array(width).fill(TILE.WALL));

  const rooms = [];
  const maxAttempts = 100;

  // Generate rooms with random placement
  for (let i = 0; i < roomCount && rooms.length < roomCount; i++) {
    const isBoss = rooms.length === roomCount - 1 || i === roomCount - 1;
    const sizeConfig = getRoomSizeConfig(level, isBoss);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const roomWidth = randInt(sizeConfig.minW, sizeConfig.maxW);
      const roomHeight = randInt(sizeConfig.minH, sizeConfig.maxH);

      const x = randInt(2, width - roomWidth - 2);
      const y = randInt(2, height - roomHeight - 2);

      const newRoom = {
        x, y,
        width: roomWidth,
        height: roomHeight,
        type: MAZE_ROOM_TYPES.COMBAT,
        cleared: false,
        index: rooms.length,
      };

      // For boss room, try to place far from entrance and REQUIRE edge/corner placement
      if (isBoss && rooms.length > 0) {
        const entrance = rooms[0];
        const entranceCenter = getRoomCenter(entrance);
        const roomCenterX = x + roomWidth / 2;
        const roomCenterY = y + roomHeight / 2;

        // Manhattan distance from entrance
        const dist = Math.abs(roomCenterX - entranceCenter.x) + Math.abs(roomCenterY - entranceCenter.y);
        if (dist < width / 2) continue; // Too close to entrance

        // Prefer opposite quadrant from entrance
        const entranceInLeftHalf = entranceCenter.x < width / 2;
        const entranceInTopHalf = entranceCenter.y < height / 2;
        const bossInLeftHalf = roomCenterX < width / 2;
        const bossInTopHalf = roomCenterY < height / 2;

        // Skip if boss is in same quadrant as entrance (prefer opposite) - relax after many attempts
        if (attempt < maxAttempts * 0.7 && bossInLeftHalf === entranceInLeftHalf && bossInTopHalf === entranceInTopHalf) {
          continue;
        }

        // REQUIRE edge placement - boss room MUST be near dungeon edges
        const distFromLeftEdge = x;
        const distFromRightEdge = width - (x + roomWidth);
        const distFromTopEdge = y;
        const distFromBottomEdge = height - (y + roomHeight);
        const minEdgeDist = Math.min(distFromLeftEdge, distFromRightEdge, distFromTopEdge, distFromBottomEdge);

        // First 80% of attempts: must be within 3 tiles of edge (corner preferred)
        // Last 20% of attempts: allow within 6 tiles of edge
        const edgeThreshold = attempt < maxAttempts * 0.8 ? 3 : 6;
        if (minEdgeDist > edgeThreshold) {
          continue;
        }

        // Bonus: prefer corners (near 2 edges) for first 60% of attempts
        if (attempt < maxAttempts * 0.6) {
          const nearLeftOrRight = distFromLeftEdge <= 4 || distFromRightEdge <= 4;
          const nearTopOrBottom = distFromTopEdge <= 4 || distFromBottomEdge <= 4;
          if (!(nearLeftOrRight && nearTopOrBottom)) {
            continue; // Not in a corner area
          }
        }
      }

      if (!roomOverlaps(rooms, newRoom)) {
        rooms.push(newRoom);
        carveRoom(grid, newRoom);
        break;
      }
    }
  }

  // Assign room types
  if (rooms.length > 0) {
    rooms[0].type = MAZE_ROOM_TYPES.ENTRANCE;
    grid[Math.floor(rooms[0].y + rooms[0].height / 2)][rooms[0].x] = TILE.ENTRANCE;
  }

  if (rooms.length > 1) {
    rooms[rooms.length - 1].type = MAZE_ROOM_TYPES.BOSS;

    // Add some treasure rooms
    const treasureCount = Math.min(2, Math.floor(rooms.length / 3));
    const middleRooms = rooms.slice(1, -1);
    for (let i = 0; i < treasureCount && middleRooms.length > 0; i++) {
      const idx = randInt(0, middleRooms.length - 1);
      if (middleRooms[idx].type !== MAZE_ROOM_TYPES.TREASURE) {
        middleRooms[idx].type = MAZE_ROOM_TYPES.TREASURE;
      }
    }
  }

  // Connect rooms using minimum spanning tree approach
  // IMPORTANT: Connect boss room LAST so it's always a dead-end, not a through-path
  const bossRoomIndex = rooms.length - 1;
  const connected = new Set([0]);
  const unconnected = new Set(
    rooms.slice(1).map((_, i) => i + 1).filter(i => i !== bossRoomIndex)
  );

  // First, connect all non-boss rooms
  while (unconnected.size > 0) {
    let bestDist = Infinity;
    let bestPair = null;

    for (const connIdx of connected) {
      for (const unconnIdx of unconnected) {
        const center1 = getRoomCenter(rooms[connIdx]);
        const center2 = getRoomCenter(rooms[unconnIdx]);
        const dist = Math.abs(center1.x - center2.x) + Math.abs(center1.y - center2.y);

        if (dist < bestDist) {
          bestDist = dist;
          bestPair = [connIdx, unconnIdx];
        }
      }
    }

    if (bestPair) {
      connectRooms(grid, rooms[bestPair[0]], rooms[bestPair[1]]);
      connected.add(bestPair[1]);
      unconnected.delete(bestPair[1]);
    } else {
      break;
    }
  }

  // Finally, connect boss room to the DEEPEST room (furthest path from entrance)
  // This ensures boss room is always at the end of the dungeon, not in the middle
  if (rooms.length > 1) {
    // Calculate path distance from entrance (room 0) to each room using BFS on room graph
    const roomDistances = new Array(bossRoomIndex).fill(Infinity);
    roomDistances[0] = 0;

    // Build adjacency list from the corridors we've created
    // Check which rooms are connected by seeing if there's a walkable path between their centers
    const roomConnections = new Map();
    for (let i = 0; i < bossRoomIndex; i++) {
      roomConnections.set(i, []);
    }

    // Check each pair of non-boss rooms for connectivity
    for (let i = 0; i < bossRoomIndex; i++) {
      for (let j = i + 1; j < bossRoomIndex; j++) {
        const center1 = getRoomCenter(rooms[i]);
        const center2 = getRoomCenter(rooms[j]);
        // Rooms are connected if their centers are reasonably close (connected by corridor)
        const dist = Math.abs(center1.x - center2.x) + Math.abs(center1.y - center2.y);
        // If rooms were connected by MST, they should have a corridor between them
        // Use a heuristic: if Manhattan distance is reasonable, check if path exists
        if (dist < width / 2) {
          // Simple check: see if there's a floor/corridor path
          const path = findPath(grid, center1, center2, []);
          if (path && path.length < dist * 2) {
            roomConnections.get(i).push(j);
            roomConnections.get(j).push(i);
          }
        }
      }
    }

    // BFS from entrance to find path distances
    const queue = [0];
    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = roomConnections.get(current) || [];
      for (const neighbor of neighbors) {
        if (roomDistances[neighbor] === Infinity) {
          roomDistances[neighbor] = roomDistances[current] + 1;
          queue.push(neighbor);
        }
      }
    }

    // Find the room with maximum path distance from entrance
    let deepestRoom = 0;
    let maxPathDist = 0;
    for (let i = 0; i < bossRoomIndex; i++) {
      if (roomDistances[i] !== Infinity && roomDistances[i] > maxPathDist) {
        maxPathDist = roomDistances[i];
        deepestRoom = i;
      }
    }

    // If no path found (disconnected graph), fall back to furthest Manhattan distance
    if (maxPathDist === 0) {
      const entranceCenter = getRoomCenter(rooms[0]);
      let maxDist = 0;
      for (let i = 1; i < bossRoomIndex; i++) {
        const center = getRoomCenter(rooms[i]);
        const dist = Math.abs(center.x - entranceCenter.x) + Math.abs(center.y - entranceCenter.y);
        if (dist > maxDist) {
          maxDist = dist;
          deepestRoom = i;
        }
      }
    }

    connectRooms(grid, rooms[deepestRoom], rooms[bossRoomIndex]);
  }

  // Add some extra connections for variety (loops)
  // IMPORTANT: Exclude boss room from extra connections to prevent shortcuts
  const extraConnections = Math.floor(rooms.length / 4);
  for (let i = 0; i < extraConnections; i++) {
    const idx1 = randInt(0, rooms.length - 2); // Exclude boss room
    const idx2 = randInt(0, rooms.length - 2); // Exclude boss room
    if (idx1 !== idx2) {
      connectRooms(grid, rooms[idx1], rooms[idx2]);
    }
  }

  // Add dead ends with treasure
  addDeadEnds(grid, rooms, level);

  // Find entrance position
  const entranceRoom = rooms[0];
  const entrance = {
    x: Math.floor(entranceRoom.x + entranceRoom.width / 2),
    y: Math.floor(entranceRoom.y + entranceRoom.height / 2),
  };

  // Find boss room
  const bossRoom = rooms.length > 1 ? rooms[rooms.length - 1] : rooms[0];

  // Generate decorations based on theme
  const decorations = generateDecorations(grid, rooms, level);

  return {
    grid,
    width,
    height,
    rooms,
    entrance,
    bossRoom: {
      x: bossRoom.x,
      y: bossRoom.y,
      width: bossRoom.width,
      height: bossRoom.height,
    },
    explored: [`${entrance.x},${entrance.y}`], // Array instead of Set for state compatibility
    level,
    decorations,
  };
}

// Generate a raid dungeon with multiple boss rooms
// Returns a dungeon with wing boss rooms and a final boss room
export function generateRaidDungeon(raidId) {
  const raid = RAIDS[raidId];
  if (!raid) return null;

  const level = raid.requiredLevel;
  const wingBossCount = raid.wingBosses.length;
  const totalBossRooms = wingBossCount + 1; // Wing bosses + final boss

  // Raids are larger to accommodate multiple boss rooms
  // Base size + extra for each boss
  const baseWidth = 80;
  const baseHeight = 60;
  const bonusPerBoss = 15;

  const width = baseWidth + (totalBossRooms * bonusPerBoss);
  const height = baseHeight + Math.floor(totalBossRooms * bonusPerBoss * 0.6);

  // More rooms for raids
  const roomCount = 8 + (wingBossCount * 2); // 8 base + 2 per wing boss

  // Initialize grid with walls
  const grid = Array(height).fill(null).map(() => Array(width).fill(TILE.WALL));

  const rooms = [];
  const maxAttempts = 150;

  // Generate rooms - entrance, combat rooms, wing boss rooms, final boss room
  // Room order: entrance (0), combat rooms (1 to N-totalBossRooms-1), wing boss rooms, final boss room (last)

  for (let i = 0; i < roomCount && rooms.length < roomCount; i++) {
    // Determine if this should be a boss room
    const roomsRemaining = roomCount - rooms.length;
    const isWingBossRoom = roomsRemaining <= totalBossRooms && roomsRemaining > 1;
    const isFinalBossRoom = roomsRemaining === 1;
    const isBossRoom = isWingBossRoom || isFinalBossRoom;

    const sizeConfig = isBossRoom ? ROOM_SIZES.boss : getRoomSizeConfig(level, false);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const roomWidth = randInt(sizeConfig.minW, sizeConfig.maxW);
      const roomHeight = randInt(sizeConfig.minH, sizeConfig.maxH);

      const x = randInt(2, width - roomWidth - 2);
      const y = randInt(2, height - roomHeight - 2);

      const newRoom = {
        x, y,
        width: roomWidth,
        height: roomHeight,
        type: MAZE_ROOM_TYPES.COMBAT,
        cleared: false,
        index: rooms.length,
      };

      // Boss rooms should be spread out and near edges
      if (isBossRoom && rooms.length > 0) {
        const entranceCenter = getRoomCenter(rooms[0]);
        const roomCenterX = x + roomWidth / 2;
        const roomCenterY = y + roomHeight / 2;

        // Check distance from all existing boss rooms
        const existingBossRooms = rooms.filter(r =>
          r.type === MAZE_ROOM_TYPES.WING_BOSS ||
          r.type === MAZE_ROOM_TYPES.FINAL_BOSS ||
          r.type === MAZE_ROOM_TYPES.BOSS
        );

        // Boss rooms should be far from each other
        let tooCloseToOtherBoss = false;
        for (const br of existingBossRooms) {
          const brCenter = getRoomCenter(br);
          const dist = Math.abs(roomCenterX - brCenter.x) + Math.abs(roomCenterY - brCenter.y);
          if (dist < width / 4) {
            tooCloseToOtherBoss = true;
            break;
          }
        }
        if (tooCloseToOtherBoss && attempt < maxAttempts * 0.8) continue;

        // Final boss should be in a corner, far from entrance
        if (isFinalBossRoom) {
          const distFromEntrance = Math.abs(roomCenterX - entranceCenter.x) + Math.abs(roomCenterY - entranceCenter.y);
          if (distFromEntrance < width / 2 && attempt < maxAttempts * 0.7) continue;

          // Prefer corner placement
          const distFromLeftEdge = x;
          const distFromRightEdge = width - (x + roomWidth);
          const distFromTopEdge = y;
          const distFromBottomEdge = height - (y + roomHeight);
          const nearLeftOrRight = distFromLeftEdge <= 5 || distFromRightEdge <= 5;
          const nearTopOrBottom = distFromTopEdge <= 5 || distFromBottomEdge <= 5;

          if (!(nearLeftOrRight && nearTopOrBottom) && attempt < maxAttempts * 0.6) continue;
        }
      }

      if (!roomOverlaps(rooms, newRoom)) {
        rooms.push(newRoom);
        carveRoom(grid, newRoom);
        break;
      }
    }
  }

  // Assign room types
  if (rooms.length > 0) {
    rooms[0].type = MAZE_ROOM_TYPES.ENTRANCE;
    grid[Math.floor(rooms[0].y + rooms[0].height / 2)][rooms[0].x] = TILE.ENTRANCE;
  }

  // Assign boss room types from the end
  const wingBossRooms = [];
  let finalBossRoomData = null;

  if (rooms.length > totalBossRooms) {
    // Final boss room is the last room
    const finalBossRoom = rooms[rooms.length - 1];
    finalBossRoom.type = MAZE_ROOM_TYPES.FINAL_BOSS;
    finalBossRoom.bossId = raid.finalBoss.id;
    finalBossRoom.bossData = raid.finalBoss;
    finalBossRoomData = {
      x: finalBossRoom.x,
      y: finalBossRoom.y,
      width: finalBossRoom.width,
      height: finalBossRoom.height,
      bossId: raid.finalBoss.id,
    };

    // Wing boss rooms are the ones before final boss
    for (let i = 0; i < wingBossCount; i++) {
      const roomIndex = rooms.length - 2 - i; // Work backwards from final boss
      if (roomIndex > 0) { // Don't use entrance
        const wingBossRoom = rooms[roomIndex];
        wingBossRoom.type = MAZE_ROOM_TYPES.WING_BOSS;
        wingBossRoom.bossId = raid.wingBosses[wingBossCount - 1 - i].id;
        wingBossRoom.bossData = raid.wingBosses[wingBossCount - 1 - i];
        wingBossRooms.push({
          x: wingBossRoom.x,
          y: wingBossRoom.y,
          width: wingBossRoom.width,
          height: wingBossRoom.height,
          bossId: wingBossRoom.bossId,
        });
      }
    }

    // Add some treasure rooms in the remaining combat rooms
    const combatRooms = rooms.filter(r => r.type === MAZE_ROOM_TYPES.COMBAT);
    const treasureCount = Math.min(3, Math.floor(combatRooms.length / 3));
    for (let i = 0; i < treasureCount && i < combatRooms.length; i++) {
      const idx = randInt(0, combatRooms.length - 1);
      if (combatRooms[idx].type === MAZE_ROOM_TYPES.COMBAT) {
        combatRooms[idx].type = MAZE_ROOM_TYPES.TREASURE;
      }
    }
  }

  // Connect rooms using minimum spanning tree approach
  // Connect non-boss rooms first, then wing bosses, then final boss last
  const finalBossIndex = rooms.length - 1;
  const wingBossIndices = [];
  for (let i = 0; i < wingBossCount && rooms.length - 2 - i > 0; i++) {
    wingBossIndices.push(rooms.length - 2 - i);
  }

  const connected = new Set([0]);
  const regularRoomIndices = new Set(
    rooms.map((_, i) => i).filter(i =>
      i !== 0 &&
      i !== finalBossIndex &&
      !wingBossIndices.includes(i)
    )
  );

  // Connect regular rooms first
  while (regularRoomIndices.size > 0) {
    let bestDist = Infinity;
    let bestPair = null;

    for (const connIdx of connected) {
      for (const unconnIdx of regularRoomIndices) {
        const center1 = getRoomCenter(rooms[connIdx]);
        const center2 = getRoomCenter(rooms[unconnIdx]);
        const dist = Math.abs(center1.x - center2.x) + Math.abs(center1.y - center2.y);

        if (dist < bestDist) {
          bestDist = dist;
          bestPair = [connIdx, unconnIdx];
        }
      }
    }

    if (bestPair) {
      connectRooms(grid, rooms[bestPair[0]], rooms[bestPair[1]]);
      connected.add(bestPair[1]);
      regularRoomIndices.delete(bestPair[1]);
    } else {
      break;
    }
  }

  // Connect wing boss rooms to the network
  for (const wingIdx of wingBossIndices) {
    let bestDist = Infinity;
    let bestConnIdx = 0;

    for (const connIdx of connected) {
      const center1 = getRoomCenter(rooms[connIdx]);
      const center2 = getRoomCenter(rooms[wingIdx]);
      const dist = Math.abs(center1.x - center2.x) + Math.abs(center1.y - center2.y);

      if (dist < bestDist) {
        bestDist = dist;
        bestConnIdx = connIdx;
      }
    }

    connectRooms(grid, rooms[bestConnIdx], rooms[wingIdx]);
    connected.add(wingIdx);
  }

  // Connect final boss room to the deepest point
  if (rooms.length > 1) {
    // Find the room furthest from entrance that's already connected
    const entranceCenter = getRoomCenter(rooms[0]);
    let deepestRoom = 0;
    let maxDist = 0;

    for (const connIdx of connected) {
      if (connIdx === finalBossIndex) continue;
      const center = getRoomCenter(rooms[connIdx]);
      const dist = Math.abs(center.x - entranceCenter.x) + Math.abs(center.y - entranceCenter.y);
      if (dist > maxDist) {
        maxDist = dist;
        deepestRoom = connIdx;
      }
    }

    connectRooms(grid, rooms[deepestRoom], rooms[finalBossIndex]);
  }

  // Add some extra connections for variety (excluding final boss)
  const extraConnections = Math.floor(rooms.length / 4);
  for (let i = 0; i < extraConnections; i++) {
    const idx1 = randInt(0, rooms.length - 2);
    const idx2 = randInt(0, rooms.length - 2);
    if (idx1 !== idx2) {
      connectRooms(grid, rooms[idx1], rooms[idx2]);
    }
  }

  // Add dead ends with treasure
  addDeadEnds(grid, rooms, level);

  // Find entrance position
  const entranceRoom = rooms[0];
  const entrance = {
    x: Math.floor(entranceRoom.x + entranceRoom.width / 2),
    y: Math.floor(entranceRoom.y + entranceRoom.height / 2),
  };

  // Generate decorations with raid-specific theme
  const decorations = generateDecorations(grid, rooms, level, raidId);

  return {
    grid,
    width,
    height,
    rooms,
    entrance,
    bossRoom: finalBossRoomData, // Final boss room (for compatibility)
    wingBossRooms, // Wing boss room locations
    explored: [`${entrance.x},${entrance.y}`],
    level,
    decorations,
    isRaid: true,
    raidId,
    raidData: raid,
    wingBossIds: raid.wingBosses.map(wb => wb.id),
    finalBossId: raid.finalBoss.id,
    defeatedBosses: [], // Track which bosses have been killed
  };
}

// Generate decorations for rooms based on theme
function generateDecorations(grid, rooms, level, raidId = null) {
  // Use raid theme for raid dungeons
  const theme = raidId ? getThemeForRaid(raidId) : getThemeForLevel(level);
  const decorations = [];
  const usedPositions = new Set();

  for (const room of rooms) {
    // Number of decorations based on room size
    const roomArea = room.width * room.height;
    const decorCount = Math.floor(roomArea / 30) + randInt(1, 3);

    // Props specific to room types
    let roomProps = [...theme.props];
    if (room.type === MAZE_ROOM_TYPES.TREASURE) {
      // Treasure rooms get extra special props
      roomProps = [...theme.props, ...theme.props.slice(0, 2)];
    } else if (room.type === MAZE_ROOM_TYPES.BOSS) {
      // Boss rooms get more dramatic props
      roomProps = [...theme.props];
    }

    for (let i = 0; i < decorCount; i++) {
      let attempts = 0;
      while (attempts < 15) {
        // Place inside room with 2-tile margin from walls
        const dx = room.x + 2 + randInt(0, room.width - 5);
        const dy = room.y + 2 + randInt(0, room.height - 5);
        const key = `${dx},${dy}`;

        // Check if position is valid floor tile and not used
        if (!usedPositions.has(key) &&
            inBounds(grid, dx, dy) &&
            (grid[dy][dx] === TILE.FLOOR || grid[dy][dx] === TILE.CORRIDOR)) {
          const propType = roomProps[randInt(0, roomProps.length - 1)];
          decorations.push({ x: dx, y: dy, type: propType });
          usedPositions.add(key);
          break;
        }
        attempts++;
      }
    }

    // Add corner decorations
    const cornerProps = {
      cave: 'stalactite',
      crypt: 'cobweb',
      forest: 'vine',
      castle: 'chains',
      volcano: 'ember',
      void: 'rune',
    };
    const cornerProp = cornerProps[theme.id];

    // Top-left corner
    if (cornerProp && Math.random() > 0.5) {
      const cx = room.x + 1;
      const cy = room.y + 1;
      if (inBounds(grid, cx, cy) && grid[cy][cx] === TILE.FLOOR) {
        decorations.push({ x: cx, y: cy, type: cornerProp, isCorner: true });
      }
    }
    // Top-right corner
    if (cornerProp && Math.random() > 0.5) {
      const cx = room.x + room.width - 2;
      const cy = room.y + 1;
      if (inBounds(grid, cx, cy) && grid[cy][cx] === TILE.FLOOR) {
        decorations.push({ x: cx, y: cy, type: cornerProp, isCorner: true });
      }
    }
  }

  return decorations;
}

// Get monster count for a room
function getMonsterCount(roomType, roomSize, dungeonLevel) {
  const baseCount = Math.max(1, Math.floor(roomSize / 25)); // 1 per 25 tiles
  const levelBonus = Math.floor(dungeonLevel / 3);

  // Level 1 has fewer monsters to help new players
  const earlyGameReduction = dungeonLevel === 1 ? -1 : 0;

  switch (roomType) {
    case MAZE_ROOM_TYPES.ENTRANCE:
      return 0;
    case MAZE_ROOM_TYPES.TREASURE:
      return Math.max(1, baseCount + 1 + earlyGameReduction);
    case MAZE_ROOM_TYPES.BOSS:
    case MAZE_ROOM_TYPES.WING_BOSS:
    case MAZE_ROOM_TYPES.FINAL_BOSS:
      return 1; // Just the boss
    default:
      return Math.max(1, Math.min(6, baseCount + levelBonus + 1 + earlyGameReduction));
  }
}

// Place monsters in the dungeon
// options: { dungeonType: 'normal'|'elite'|'raid', affixes: [], statMultiplier: 1.0 }
export function placeMonsters(dungeon, level, options = {}) {
  const monsters = [];
  const tier = Math.min(6, Math.ceil(level / 5));
  // Exponential scaling: 1.09x per level for balanced progression
  // Level 1: 1.0x, Level 5: 1.41x, Level 10: 2.17x, Level 15: 3.34x, Level 20: 5.14x
  const scaleFactor = Math.pow(1.09, level - 1);
  // Speed scales at 25% of other stats - keeps monsters relevant at high levels
  const speedScaleFactor = 1 + (scaleFactor - 1) * 0.25;

  // Level 1 is easier to help new players with solo tank
  const earlyGameMultiplier = level === 1 ? 0.7 : 1.0;

  // Apply dungeon type multiplier (elite = 1.5x, raid = 2.0x)
  const typeMultiplier = (options.statMultiplier || 1.0) * earlyGameMultiplier;
  const affixes = options.affixes || [];

  // Helper to apply affixes to a monster
  const applyAffixes = (monster) => {
    if (affixes.length === 0) return monster;

    const modified = { ...monster, stats: { ...monster.stats } };

    for (const affix of affixes) {
      const effect = affix.effect;
      if (effect.hpMultiplier) {
        modified.stats.maxHp = Math.floor(modified.stats.maxHp * effect.hpMultiplier);
        modified.stats.hp = modified.stats.maxHp;
      }
      if (effect.damageMultiplier) {
        modified.stats.attack = Math.floor(modified.stats.attack * effect.damageMultiplier);
      }
      if (effect.defenseMultiplier) {
        modified.stats.defense = Math.floor(modified.stats.defense * effect.defenseMultiplier);
      }
      if (effect.speedBonus) {
        modified.stats.speed += effect.speedBonus;
      }
      if (effect.lifesteal) {
        modified.passive = { ...(modified.passive || {}), lifesteal: effect.lifesteal };
      }
      if (effect.onHitStatus) {
        modified.onHitStatus = effect.onHitStatus;
      }
      if (effect.reflectDamage) {
        modified.passive = { ...(modified.passive || {}), reflectDamage: effect.reflectDamage };
      }
      if (effect.regenPercent) {
        modified.passive = { ...(modified.passive || {}), regenPercent: effect.regenPercent };
      }
      if (effect.startingShield) {
        modified.shield = Math.floor(modified.stats.maxHp * effect.startingShield);
      }
      if (effect.deathExplosion) {
        modified.deathExplosion = effect.deathExplosion;
      }
      if (effect.onDeathAllyBuff) {
        modified.onDeathAllyBuff = effect.onDeathAllyBuff;
      }
    }

    return modified;
  };

  for (const room of dungeon.rooms) {
    const roomSize = room.width * room.height;
    const monsterCount = getMonsterCount(room.type, roomSize, level);

    if (room.type === MAZE_ROOM_TYPES.BOSS) {
      // Check if this is a raid - use raid boss (wing boss or final boss)
      if (options.raidId && options.wingBossId) {
        const raid = RAIDS[options.raidId];
        // Find the boss data - either a wing boss or the final boss
        let raidBoss = null;
        if (options.isFinalBoss) {
          raidBoss = raid?.finalBoss;
        } else {
          raidBoss = raid?.wingBosses?.find(wb => wb.id === options.wingBossId);
        }
        if (raidBoss) {
          const center = getRoomCenter(room);
          const bossMonster = {
            id: `raid_boss_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            templateId: raidBoss.id,
            name: raidBoss.name,
            spriteId: raidBoss.spriteId,
            isBoss: true,
            isRaidBoss: true,
            isWingBoss: !options.isFinalBoss,
            isFinalBoss: !!options.isFinalBoss,
            wingBossId: !options.isFinalBoss ? options.wingBossId : null,
            finalBossId: options.isFinalBoss ? raid?.finalBoss?.id : null,
            position: { x: center.x, y: center.y },
            roomIndex: room.index,
            stats: {
              maxHp: Math.floor(raidBoss.baseStats.maxHp * scaleFactor * typeMultiplier),
              hp: Math.floor(raidBoss.baseStats.maxHp * scaleFactor * typeMultiplier),
              attack: Math.floor(raidBoss.baseStats.attack * scaleFactor * typeMultiplier),
              defense: Math.floor(raidBoss.baseStats.defense * scaleFactor * typeMultiplier),
              speed: Math.floor(raidBoss.baseStats.speed * speedScaleFactor),
            },
            abilities: raidBoss.abilities || [],
            aiType: raidBoss.aiType || 'boss',
            passive: raidBoss.passive || null,
            phases: raidBoss.phases || null,
            attackRange: raidBoss.attackRange || 1,
            xpReward: Math.floor(200 * scaleFactor * typeMultiplier),
            goldReward: {
              min: Math.floor(raidBoss.rewards?.gold * 0.8 || 500 * scaleFactor),
              max: Math.floor(raidBoss.rewards?.gold || 1000 * scaleFactor),
            },
            dropTable: raidBoss.dropTable || [],
          };
          // Initialize boss state for phase tracking
          if (bossMonster.phases) {
            initBossState(bossMonster);
          }
          monsters.push(applyAffixes(bossMonster));
          continue;
        }
      }

      // Check if this level has a world boss
      if (isWorldBossLevel(level)) {
        const worldBoss = createWorldBossInstance(level, scaleFactor * typeMultiplier);
        if (worldBoss) {
          const center = getRoomCenter(room);
          worldBoss.position = { x: center.x, y: center.y };
          worldBoss.roomIndex = room.index;
          monsters.push(applyAffixes(worldBoss));
          continue;
        }
      }

      // Place regular boss with unique generated name
      const boss = getBossByTier(tier);
      if (boss) {
        const center = getRoomCenter(room);
        const baseMonster = {
          id: `boss_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          templateId: boss.id,
          name: generateBossName(boss.name),
          title: boss.name, // Original monster type shown as subtitle
          emoji: boss.emoji,
          isBoss: true,
          position: { x: center.x, y: center.y },
          roomIndex: room.index,
          stats: {
            maxHp: Math.floor(boss.baseStats.maxHp * scaleFactor * typeMultiplier),
            hp: Math.floor(boss.baseStats.maxHp * scaleFactor * typeMultiplier),
            attack: Math.floor(boss.baseStats.attack * scaleFactor * typeMultiplier),
            defense: Math.floor(boss.baseStats.defense * scaleFactor * typeMultiplier),
            speed: Math.floor(boss.baseStats.speed * speedScaleFactor),
          },
          abilities: boss.abilities || [],
          aiType: boss.aiType || 'boss',
          passive: boss.passive || null,
          phases: boss.phases || null,
          summonType: boss.summonType || null,
          xpReward: Math.floor(boss.xpReward * scaleFactor),
          goldReward: {
            min: Math.floor(boss.goldReward.min * scaleFactor),
            max: Math.floor(boss.goldReward.max * scaleFactor),
          },
        };
        monsters.push(applyAffixes(baseMonster));
      }
      continue;
    }

    // Handle WING_BOSS room type (raid wing bosses)
    if (room.type === MAZE_ROOM_TYPES.WING_BOSS && room.bossData) {
      const raidBoss = room.bossData;
      const center = getRoomCenter(room);
      const bossMonster = {
        id: `wing_boss_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        templateId: raidBoss.id,
        name: raidBoss.name,
        spriteId: raidBoss.spriteId,
        isBoss: true,
        isRaidBoss: true,
        isWingBoss: true,
        wingBossId: raidBoss.id,
        position: { x: center.x, y: center.y },
        roomIndex: room.index,
        stats: {
          maxHp: Math.floor(raidBoss.baseStats.maxHp * scaleFactor * typeMultiplier),
          hp: Math.floor(raidBoss.baseStats.maxHp * scaleFactor * typeMultiplier),
          attack: Math.floor(raidBoss.baseStats.attack * scaleFactor * typeMultiplier),
          defense: Math.floor(raidBoss.baseStats.defense * scaleFactor * typeMultiplier),
          speed: Math.floor(raidBoss.baseStats.speed * speedScaleFactor),
        },
        abilities: raidBoss.abilities || [],
        aiType: raidBoss.aiType || 'boss',
        passive: raidBoss.passive || null,
        phases: raidBoss.phases || null,
        attackRange: raidBoss.attackRange || 1,
        xpReward: Math.floor(200 * scaleFactor * typeMultiplier),
        goldReward: {
          min: Math.floor(raidBoss.rewards?.gold * 0.8 || 500 * scaleFactor),
          max: Math.floor(raidBoss.rewards?.gold || 1000 * scaleFactor),
        },
        dropTable: raidBoss.dropTable || [],
        lore: raidBoss.lore || null,
      };
      if (bossMonster.phases) {
        initBossState(bossMonster);
      }
      monsters.push(applyAffixes(bossMonster));
      continue;
    }

    // Handle FINAL_BOSS room type (raid final boss)
    if (room.type === MAZE_ROOM_TYPES.FINAL_BOSS && room.bossData) {
      const raidBoss = room.bossData;
      const center = getRoomCenter(room);
      const bossMonster = {
        id: `final_boss_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        templateId: raidBoss.id,
        name: raidBoss.name,
        spriteId: raidBoss.spriteId,
        isBoss: true,
        isRaidBoss: true,
        isFinalBoss: true,
        finalBossId: raidBoss.id,
        position: { x: center.x, y: center.y },
        roomIndex: room.index,
        stats: {
          maxHp: Math.floor(raidBoss.baseStats.maxHp * scaleFactor * typeMultiplier),
          hp: Math.floor(raidBoss.baseStats.maxHp * scaleFactor * typeMultiplier),
          attack: Math.floor(raidBoss.baseStats.attack * scaleFactor * typeMultiplier),
          defense: Math.floor(raidBoss.baseStats.defense * scaleFactor * typeMultiplier),
          speed: Math.floor(raidBoss.baseStats.speed * speedScaleFactor),
        },
        abilities: raidBoss.abilities || [],
        aiType: raidBoss.aiType || 'boss',
        passive: raidBoss.passive || null,
        phases: raidBoss.phases || null,
        attackRange: raidBoss.attackRange || 1,
        xpReward: Math.floor(400 * scaleFactor * typeMultiplier),
        goldReward: {
          min: Math.floor(raidBoss.rewards?.gold * 0.8 || 1000 * scaleFactor),
          max: Math.floor(raidBoss.rewards?.gold || 2000 * scaleFactor),
        },
        dropTable: raidBoss.dropTable || [],
        lore: raidBoss.lore || null,
      };
      if (bossMonster.phases) {
        initBossState(bossMonster);
      }
      monsters.push(applyAffixes(bossMonster));
      continue;
    }

    if (room.type === MAZE_ROOM_TYPES.ENTRANCE) {
      continue;
    }

    const possibleMonsters = getMonstersByTier(tier);
    if (possibleMonsters.length === 0) continue;

    // Generate positions within the room
    const positions = [];
    for (let y = room.y + 1; y < room.y + room.height - 1; y++) {
      for (let x = room.x + 1; x < room.x + room.width - 1; x++) {
        if (dungeon.grid[y][x] === TILE.FLOOR) {
          positions.push({ x, y });
        }
      }
    }

    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    for (let i = 0; i < Math.min(monsterCount, positions.length); i++) {
      const template = possibleMonsters[randInt(0, possibleMonsters.length - 1)];

      const baseMonster = {
        id: `monster_${room.index}_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        templateId: template.id,
        name: template.name,
        emoji: template.emoji,
        isBoss: false,
        position: { ...positions[i] },
        roomIndex: room.index,
        stats: {
          maxHp: Math.floor(template.baseStats.maxHp * scaleFactor * typeMultiplier),
          hp: Math.floor(template.baseStats.maxHp * scaleFactor * typeMultiplier),
          attack: Math.floor(template.baseStats.attack * scaleFactor * typeMultiplier),
          defense: Math.floor(template.baseStats.defense * scaleFactor * typeMultiplier),
          speed: Math.floor(template.baseStats.speed * speedScaleFactor),
        },
        abilities: template.abilities || [],
        aiType: template.aiType || 'aggressive',
        passive: template.passive || null,
        xpReward: Math.floor(template.xpReward * scaleFactor),
        goldReward: {
          min: Math.floor(template.goldReward.min * scaleFactor),
          max: Math.floor(template.goldReward.max * scaleFactor),
        },
      };
      monsters.push(applyAffixes(baseMonster));
    }
  }

  // Add corridor patrol monsters at higher levels
  if (level >= 5) {
    const corridorMonsterCount = Math.floor(level / 5);
    const corridorTiles = [];

    for (let y = 0; y < dungeon.height; y++) {
      for (let x = 0; x < dungeon.width; x++) {
        if (dungeon.grid[y][x] === TILE.CORRIDOR) {
          corridorTiles.push({ x, y });
        }
      }
    }

    // Shuffle and pick positions
    for (let i = corridorTiles.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [corridorTiles[i], corridorTiles[j]] = [corridorTiles[j], corridorTiles[i]];
    }

    const possibleMonsters = getMonstersByTier(tier);
    for (let i = 0; i < Math.min(corridorMonsterCount, corridorTiles.length); i++) {
      const template = possibleMonsters[randInt(0, possibleMonsters.length - 1)];

      const baseMonster = {
        id: `corridor_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        templateId: template.id,
        name: template.name,
        emoji: template.emoji,
        isBoss: false,
        position: { ...corridorTiles[i] },
        roomIndex: -1, // Corridor patrol
        stats: {
          maxHp: Math.floor(template.baseStats.maxHp * scaleFactor * typeMultiplier),
          hp: Math.floor(template.baseStats.maxHp * scaleFactor * typeMultiplier),
          attack: Math.floor(template.baseStats.attack * scaleFactor * typeMultiplier),
          defense: Math.floor(template.baseStats.defense * scaleFactor * typeMultiplier),
          speed: Math.floor(template.baseStats.speed * speedScaleFactor),
        },
        abilities: template.abilities || [],
        aiType: template.aiType || 'aggressive',
        passive: template.passive || null,
        xpReward: Math.floor(template.xpReward * scaleFactor),
        goldReward: {
          min: Math.floor(template.goldReward.min * scaleFactor),
          max: Math.floor(template.goldReward.max * scaleFactor),
        },
      };
      monsters.push(applyAffixes(baseMonster));
    }
  }

  // Spawn elite mobs at level 8+ (or in raids regardless of level)
  const isRaidDungeon = options.dungeonType === 'raid' || dungeon.isRaid;
  const shouldSpawnElites = level >= ELITE_CONFIG.minLevel || isRaidDungeon;

  if (shouldSpawnElites) {
    // Raids get 2-3x more elites
    let eliteCount = getEliteSpawnCount(tier);
    if (isRaidDungeon) {
      eliteCount = Math.max(4, Math.floor(eliteCount * 2.5)); // At least 4 elites in raids, 2.5x normal rate
    }

    // Get all non-boss monsters that could become elites (exclude wing/final bosses)
    const eligibleMonsters = monsters.filter(m =>
      !m.isBoss && !m.isWorldBoss && !m.isElite && !m.isWingBoss && !m.isFinalBoss
    );

    // Randomly select monsters to make elite
    const shuffled = [...eligibleMonsters];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const toMakeElite = shuffled.slice(0, Math.min(eliteCount, shuffled.length));

    for (const monster of toMakeElite) {
      // Find and replace in monsters array
      const idx = monsters.indexOf(monster);
      if (idx !== -1) {
        monsters[idx] = createEliteMonster(monster);
      }
    }
  }

  return monsters;
}

// Check if a tile is walkable
export function isWalkable(grid, x, y) {
  if (!inBounds(grid, x, y)) return false;
  const tile = grid[y][x];
  return tile === TILE.FLOOR || tile === TILE.CORRIDOR || tile === TILE.DOOR ||
         tile === TILE.ENTRANCE || tile === TILE.EXIT || tile === TILE.TREASURE;
}

// Calculate Manhattan distance
export function getDistance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Check if there is a clear line of sight between two positions (no walls blocking)
// Uses Bresenham's line algorithm to trace tiles between from and to
export function hasLineOfSight(grid, from, to) {
  let x0 = from.x;
  let y0 = from.y;
  const x1 = to.x;
  const y1 = to.y;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;

  while (true) {
    // Check if current tile is a wall (skip start and end positions)
    if (!(x0 === from.x && y0 === from.y) && !(x0 === to.x && y0 === to.y)) {
      if (!inBounds(grid, x0, y0) || grid[y0][x0] === TILE.WALL) {
        return false;
      }
    }

    // Reached the target
    if (x0 === x1 && y0 === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }
  }

  return true;
}

// OPTIMIZATION: Binary min-heap for A* pathfinding (O(log n) vs O(n log n) for sort)
class MinHeap {
  constructor() {
    this.heap = [];
    this.positions = new Map(); // Track positions for O(1) lookup
  }

  push(node) {
    const key = `${node.x},${node.y}`;
    this.heap.push(node);
    this.positions.set(key, this.heap.length - 1);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    if (this.heap.length === 0) return null;
    const min = this.heap[0];
    const last = this.heap.pop();
    this.positions.delete(`${min.x},${min.y}`);

    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.positions.set(`${last.x},${last.y}`, 0);
      this._bubbleDown(0);
    }
    return min;
  }

  find(x, y) {
    const key = `${x},${y}`;
    const idx = this.positions.get(key);
    return idx !== undefined ? this.heap[idx] : null;
  }

  update(node) {
    const key = `${node.x},${node.y}`;
    const idx = this.positions.get(key);
    if (idx !== undefined) {
      this.heap[idx] = node;
      this._bubbleUp(idx);
    }
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  _getScore(node) {
    return node.g + node.h;
  }

  _bubbleUp(idx) {
    while (idx > 0) {
      const parentIdx = Math.floor((idx - 1) / 2);
      if (this._getScore(this.heap[idx]) >= this._getScore(this.heap[parentIdx])) break;

      // Swap
      [this.heap[idx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[idx]];
      this.positions.set(`${this.heap[idx].x},${this.heap[idx].y}`, idx);
      this.positions.set(`${this.heap[parentIdx].x},${this.heap[parentIdx].y}`, parentIdx);
      idx = parentIdx;
    }
  }

  _bubbleDown(idx) {
    const length = this.heap.length;
    while (true) {
      const leftIdx = 2 * idx + 1;
      const rightIdx = 2 * idx + 2;
      let smallest = idx;

      if (leftIdx < length && this._getScore(this.heap[leftIdx]) < this._getScore(this.heap[smallest])) {
        smallest = leftIdx;
      }
      if (rightIdx < length && this._getScore(this.heap[rightIdx]) < this._getScore(this.heap[smallest])) {
        smallest = rightIdx;
      }

      if (smallest === idx) break;

      // Swap
      [this.heap[idx], this.heap[smallest]] = [this.heap[smallest], this.heap[idx]];
      this.positions.set(`${this.heap[idx].x},${this.heap[idx].y}`, idx);
      this.positions.set(`${this.heap[smallest].x},${this.heap[smallest].y}`, smallest);
      idx = smallest;
    }
  }
}

// Find path using A* algorithm with binary heap optimization
export function findPath(grid, start, end, occupiedPositions = []) {
  const occupied = new Set(occupiedPositions.map(p => `${p.x},${p.y}`));

  // OPTIMIZATION: Use binary heap instead of sorted array
  const openSet = new MinHeap();
  openSet.push({ ...start, g: 0, h: getDistance(start, end), path: [start] });
  const closedSet = new Set();

  while (!openSet.isEmpty()) {
    const current = openSet.pop();

    if (current.x === end.x && current.y === end.y) {
      return current.path;
    }

    closedSet.add(`${current.x},${current.y}`);

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
      const existing = openSet.find(neighbor.x, neighbor.y);

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
        openSet.update(existing);
      }
    }
  }

  return null;
}

// Find the nearest unexplored walkable tile using BFS
export function findExplorationTarget(dungeon, partyPosition, monsters = []) {
  const { grid, rooms, bossRoom } = dungeon;
  // Convert explored array to Set for efficient lookups
  const explored = new Set(Array.isArray(dungeon.explored) ? dungeon.explored : []);

  // Get alive monsters
  const aliveMonsters = monsters.filter(m => m.stats.hp > 0);
  const aliveNonBoss = aliveMonsters.filter(m => !m.isBoss);
  const bossUnlocked = aliveNonBoss.length === 0;

  // Helper to check if a position is in the boss room
  const isInBossRoom = (x, y) => {
    return x >= bossRoom.x && x < bossRoom.x + bossRoom.width &&
           y >= bossRoom.y && y < bossRoom.y + bossRoom.height;
  };

  // If all non-boss monsters dead, head to boss room
  if (bossUnlocked) {
    // Find center of boss room
    return {
      x: Math.floor(bossRoom.x + bossRoom.width / 2),
      y: Math.floor(bossRoom.y + bossRoom.height / 2),
    };
  }

  // BFS for nearest unexplored tile, prioritizing rooms
  const queue = [{ ...partyPosition, dist: 0 }];
  const visited = new Set([`${partyPosition.x},${partyPosition.y}`]);

  let nearestUnexplored = null;
  let nearestDist = Infinity;
  let nearestInRoom = false;

  while (queue.length > 0) {
    const current = queue.shift();
    const key = `${current.x},${current.y}`;

    // Skip boss room tiles until boss is unlocked
    if (!bossUnlocked && isInBossRoom(current.x, current.y)) {
      continue;
    }

    // Check if this tile is unexplored
    if (!explored.has(key) && isWalkable(grid, current.x, current.y)) {
      // Check if tile is in a non-boss room
      const inRoom = rooms.some(r =>
        r.type !== MAZE_ROOM_TYPES.BOSS &&
        current.x >= r.x && current.x < r.x + r.width &&
        current.y >= r.y && current.y < r.y + r.height
      );

      // Prefer room tiles over corridor tiles
      if (inRoom && !nearestInRoom) {
        nearestUnexplored = { x: current.x, y: current.y };
        nearestDist = current.dist;
        nearestInRoom = true;
      } else if ((!nearestUnexplored || current.dist < nearestDist) && (inRoom === nearestInRoom)) {
        nearestUnexplored = { x: current.x, y: current.y };
        nearestDist = current.dist;
        nearestInRoom = inRoom;
      }
    }

    // Continue BFS
    const neighbors = [
      { x: current.x, y: current.y - 1 },
      { x: current.x + 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x - 1, y: current.y },
    ];

    for (const neighbor of neighbors) {
      const nkey = `${neighbor.x},${neighbor.y}`;
      if (visited.has(nkey)) continue;
      if (!isWalkable(grid, neighbor.x, neighbor.y)) continue;

      visited.add(nkey);
      queue.push({ ...neighbor, dist: current.dist + 1 });
    }
  }

  return nearestUnexplored;
}

// Mark tiles as explored within vision range
// Returns array for React state compatibility
export function markExplored(explored, position, visionRange = 4) {
  const exploredSet = new Set(Array.isArray(explored) ? explored : []);

  for (let dy = -visionRange; dy <= visionRange; dy++) {
    for (let dx = -visionRange; dx <= visionRange; dx++) {
      const dist = Math.abs(dx) + Math.abs(dy);
      if (dist <= visionRange) {
        exploredSet.add(`${position.x + dx},${position.y + dy}`);
      }
    }
  }

  return Array.from(exploredSet);
}

// OPTIMIZATION: Spatial index for efficient monster lookups
const SPATIAL_CELL_SIZE = 10;

// Create spatial index from monster list
export function createSpatialIndex(monsters, cellSize = SPATIAL_CELL_SIZE) {
  const index = new Map();
  for (const monster of monsters) {
    if (monster.stats.hp <= 0) continue;
    const cellX = Math.floor(monster.position.x / cellSize);
    const cellY = Math.floor(monster.position.y / cellSize);
    const key = `${cellX},${cellY}`;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(monster);
  }
  return index;
}

// Find monsters within detection range using spatial index (O(1) average case)
export function findMonstersInRangeFast(spatialIndex, position, range, cellSize = SPATIAL_CELL_SIZE) {
  const results = [];
  const cellRange = Math.ceil(range / cellSize);
  const centerCellX = Math.floor(position.x / cellSize);
  const centerCellY = Math.floor(position.y / cellSize);

  for (let dx = -cellRange; dx <= cellRange; dx++) {
    for (let dy = -cellRange; dy <= cellRange; dy++) {
      const key = `${centerCellX + dx},${centerCellY + dy}`;
      const monsters = spatialIndex.get(key) || [];
      for (const m of monsters) {
        if (m.stats.hp > 0 && getDistance(position, m.position) <= range) {
          results.push(m);
        }
      }
    }
  }
  return results;
}

// Original function (fallback for smaller monster counts)
export function findMonstersInRange(monsters, partyPosition, detectionRange = 5) {
  // For small lists, linear scan is fine
  if (monsters.length < 20) {
    return monsters.filter(m =>
      m.stats.hp > 0 && getDistance(m.position, partyPosition) <= detectionRange
    );
  }

  // For larger lists, use spatial indexing
  const spatialIndex = createSpatialIndex(monsters);
  return findMonstersInRangeFast(spatialIndex, partyPosition, detectionRange);
}

// Check if a room is fully explored
export function isRoomExplored(room, exploredArray) {
  const explored = new Set(Array.isArray(exploredArray) ? exploredArray : []);
  let exploredCount = 0;
  let totalTiles = 0;

  for (let y = room.y; y < room.y + room.height; y++) {
    for (let x = room.x; x < room.x + room.width; x++) {
      totalTiles++;
      if (explored.has(`${x},${y}`)) {
        exploredCount++;
      }
    }
  }

  return exploredCount / totalTiles > 0.5; // Consider explored if >50% visible
}

// Get initial hero positions near entrance (checks walkability)
export function getHeroStartPositions(entrance, heroCount, grid) {
  const positions = [entrance];
  const occupied = new Set([`${entrance.x},${entrance.y}`]);

  // Check adjacent tiles for other party members
  const offsets = [
    { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 },
    { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: 1 },
  ];

  for (let i = 1; i < heroCount; i++) {
    let placed = false;
    for (const offset of offsets) {
      const pos = { x: entrance.x + offset.x, y: entrance.y + offset.y };
      const key = `${pos.x},${pos.y}`;
      if (!occupied.has(key) && (!grid || isWalkable(grid, pos.x, pos.y))) {
        positions.push(pos);
        occupied.add(key);
        placed = true;
        break;
      }
    }
    // If no valid adjacent tile, just use entrance position
    if (!placed) {
      positions.push(entrance);
    }
  }

  return positions;
}
