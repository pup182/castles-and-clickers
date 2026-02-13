// Terrain layer - renders dungeon tiles using offscreen caching
// Detailed pixel art tiles matching the React SVG components

import { TILE } from '../../game/mazeGenerator';

// Build terrain in chunks to avoid blocking
// Each tile does 10-20 fillRect calls, so keep chunks small for 60fps target (16ms budget)
const CHUNK_SIZE = 50; // tiles per chunk - ~1ms per chunk

export class TerrainLayer {
  constructor(spriteManager, tileSize) {
    this.spriteManager = spriteManager;
    this.tileSize = tileSize;

    // Offscreen canvas for the entire dungeon
    this.offscreenCanvas = null;
    this.offscreenCtx = null;

    // Current dungeon dimensions
    this.dungeonWidth = 0;
    this.dungeonHeight = 0;

    // Cache validity
    this.cacheValid = false;
    this.cacheBuilding = false;
    this.currentTheme = null;

    // Cached theme colors for faster access
    this.colors = null;
    this.themeId = null;
    this.bossRoom = null;
    this.grid = null;
  }

  // Build the terrain cache for a dungeon (chunked to avoid blocking)
  buildCache(dungeon, theme) {
    if (!dungeon || !dungeon.grid) return;
    if (this.cacheBuilding) return; // Already building

    const { grid, width, height, bossRoom } = dungeon;
    const colors = theme.colors;
    const themeId = theme.id;

    // Check if this is the same dungeon with just a grid update (e.g., treasure collected)
    const isSameDungeon = this.offscreenCanvas &&
      this.dungeonWidth === width &&
      this.dungeonHeight === height &&
      this.themeId === themeId;

    // Store for incremental building
    this.grid = grid;
    this.colors = colors;
    this.themeId = themeId;
    this.bossRoom = bossRoom;

    // Create or resize offscreen canvas
    if (!this.offscreenCanvas || this.dungeonWidth !== width || this.dungeonHeight !== height) {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = width * this.tileSize;
      this.offscreenCanvas.height = height * this.tileSize;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d');
      if (!this.offscreenCtx) return;
      this.offscreenCtx.imageSmoothingEnabled = false;
    }

    this.dungeonWidth = width;
    this.dungeonHeight = height;
    this.currentTheme = themeId;
    this.cacheValid = false;
    this.cacheBuilding = true;

    // Only clear canvas for new dungeons, not grid updates (avoids flash when collecting treasure)
    if (!isSameDungeon) {
      this.offscreenCtx.fillStyle = '#1a1a2e';
      this.offscreenCtx.fillRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    }

    // Build in chunks using requestIdleCallback or setTimeout
    this.buildChunked(0, width, height);
  }

  // Build tiles in chunks using requestIdleCallback for better scheduling
  buildChunked(startIndex, width, height) {
    const totalTiles = width * height;

    // Use requestIdleCallback if available for smarter scheduling
    const scheduleChunk = (callback) => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback((deadline) => {
          // Process multiple small chunks while we have idle time
          let currentIndex = startIndex;
          while (deadline.timeRemaining() > 1 && currentIndex < totalTiles) {
            const endIndex = Math.min(currentIndex + CHUNK_SIZE, totalTiles);
            this.processChunk(currentIndex, endIndex, width);
            currentIndex = endIndex;
          }

          if (currentIndex < totalTiles) {
            this.buildChunked(currentIndex, width, height);
          } else {
            this.cacheBuilding = false;
            this.cacheValid = true;
          }
        }, { timeout: 100 }); // Max 100ms delay
      } else {
        // Fallback: use setTimeout with yielding
        setTimeout(() => {
          const endIndex = Math.min(startIndex + CHUNK_SIZE, totalTiles);
          this.processChunk(startIndex, endIndex, width);

          if (endIndex < totalTiles) {
            this.buildChunked(endIndex, width, height);
          } else {
            this.cacheBuilding = false;
            this.cacheValid = true;
          }
        }, 0);
      }
    };

    scheduleChunk();
  }

  // Process a chunk of tiles
  processChunk(startIndex, endIndex, width) {
    for (let i = startIndex; i < endIndex; i++) {
      const x = i % width;
      const y = Math.floor(i / width);
      const tile = this.grid[y]?.[x];
      if (tile !== undefined) {
        this.renderTile(x, y, tile);
      }
    }
  }

  // Render a single tile to the offscreen canvas
  renderTile(x, y, tile) {
    const ctx = this.offscreenCtx;
    const size = this.tileSize;
    const px = x * size;
    const py = y * size;
    const colors = this.colors;
    const themeId = this.themeId;

    // Hash for variations
    const hash = (x * 31 + y * 17) % 100;

    // Check if in boss room
    const bossRoom = this.bossRoom;
    const inBossRoom = bossRoom &&
      x >= bossRoom.x && x < bossRoom.x + bossRoom.width &&
      y >= bossRoom.y && y < bossRoom.y + bossRoom.height;

    // Scale factor for 16x16 pixel art to tile size
    const scale = size / 16;

    switch (tile) {
      case TILE.WALL:
        if (themeId === 'forest') {
          this.drawForestWall(ctx, px, py, scale, colors);
        } else {
          this.drawWall(ctx, px, py, scale, colors);
        }
        break;

      case TILE.FLOOR:
      case TILE.CORRIDOR:
        if (inBossRoom && tile === TILE.FLOOR) {
          // Boss room floor - darker red tint
          this.drawBossFloor(ctx, px, py, scale, hash);
        } else if (themeId === 'forest') {
          // Forest floor variants
          if (hash < 10) {
            this.drawForestFloorLeaves(ctx, px, py, scale, colors);
          } else if (hash < 20) {
            this.drawForestFloorRoots(ctx, px, py, scale, colors);
          } else if (hash < 50) {
            this.drawForestFloor(ctx, px, py, scale, colors);
          } else {
            this.drawFloor(ctx, px, py, scale, colors, hash);
          }
        } else {
          // Standard dungeon floor variants
          if (hash < 5) {
            this.drawFloorCracked(ctx, px, py, scale, colors);
          } else if (hash < 10) {
            this.drawFloorDebris(ctx, px, py, scale, colors);
          } else if (hash < 15) {
            this.drawFloorMoss(ctx, px, py, scale, colors);
          } else if (hash < 40) {
            this.drawFloorAlt(ctx, px, py, scale, colors);
          } else {
            this.drawFloor(ctx, px, py, scale, colors, hash);
          }
        }
        break;

      case TILE.ENTRANCE:
        this.drawEntrance(ctx, px, py, scale);
        break;

      case TILE.EXIT:
        this.drawExit(ctx, px, py, scale, colors);
        break;

      case TILE.TREASURE:
        this.drawFloor(ctx, px, py, scale, colors, hash);
        this.drawTreasure(ctx, px, py, scale);
        break;

      case TILE.DOOR:
        ctx.fillStyle = colors.accent;
        ctx.fillRect(px, py, size, size);
        break;

      default:
        ctx.fillStyle = colors.floor;
        ctx.fillRect(px, py, size, size);
    }
  }

  // Helper to draw a pixel
  P(ctx, px, py, x, y, c, w, h, scale) {
    ctx.fillStyle = c;
    ctx.fillRect(px + x * scale, py + y * scale, w * scale, h * scale);
  }

  // Standard wall tile with brick pattern
  drawWall(ctx, px, py, scale, colors) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    // Base wall
    P(0, 0, colors.wall, 16, 16);
    // Brick pattern
    P(0, 0, colors.wallHighlight, 8, 4);
    P(8, 0, colors.wall, 8, 4);
    P(4, 4, colors.wallHighlight, 8, 4);
    P(0, 8, colors.wall, 8, 4);
    P(8, 8, colors.wallHighlight, 8, 4);
    P(4, 12, colors.wall, 8, 4);
    // Mortar lines
    P(0, 4, colors.floorAlt, 16, 1);
    P(0, 8, colors.floorAlt, 16, 1);
    P(0, 12, colors.floorAlt, 16, 1);
    P(8, 0, colors.floorAlt, 1, 4);
    P(4, 4, colors.floorAlt, 1, 4);
    P(12, 4, colors.floorAlt, 1, 4);
    P(8, 8, colors.floorAlt, 1, 4);
    P(4, 12, colors.floorAlt, 1, 4);
  }

  // Forest wall - dense trees
  drawForestWall(ctx, px, py, scale, colors) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    // Dense forest background
    P(0, 0, colors.wall, 16, 16);
    // Tree trunks
    P(2, 8, '#3d2817', 3, 8);
    P(11, 6, '#2d1f12', 3, 10);
    P(7, 10, '#3d2817', 2, 6);
    // Dense foliage layers
    P(0, 0, colors.wall, 7, 10);
    P(9, 0, colors.wallHighlight, 7, 8);
    P(5, 2, colors.wall, 6, 8);
    // Leaf clusters
    P(1, 1, colors.wallHighlight, 4, 5);
    P(4, 0, '#15803d', 5, 4);
    P(10, 1, colors.wallHighlight, 4, 4);
    P(6, 4, '#16a34a', 4, 4);
    P(0, 5, '#15803d', 3, 4);
    P(12, 3, '#16a34a', 4, 5);
    // Highlights
    P(2, 2, '#22c55e', 2, 2);
    P(11, 2, '#22c55e', 2, 2);
    P(7, 5, '#22c55e', 2, 2);
  }

  // Standard floor tile
  drawFloor(ctx, px, py, scale, colors, hash) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    // Base floor
    P(0, 0, colors.floor, 16, 16);
    // Random texture spots
    P(2, 3, colors.floorAlt, 2, 1);
    P(8, 7, colors.floorAlt, 1, 2);
    P(12, 2, colors.floorAlt, 2, 1);
    P(5, 11, colors.floorAlt, 1, 1);
    P(14, 13, colors.floorAlt, 1, 1);
  }

  // Alternate floor pattern
  drawFloorAlt(ctx, px, py, scale, colors) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    P(0, 0, colors.floor, 16, 16);
    P(1, 8, colors.floorAlt, 1, 2);
    P(6, 2, colors.floorAlt, 2, 1);
    P(11, 12, colors.floorAlt, 1, 1);
    P(4, 6, colors.floorAlt, 1, 1);
    P(13, 4, colors.floorAlt, 2, 1);
  }

  // Cracked floor
  drawFloorCracked(ctx, px, py, scale, colors) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    P(0, 0, colors.floor, 16, 16);
    // Crack lines
    P(4, 3, colors.floorAlt, 1, 4);
    P(5, 6, colors.floorAlt, 3, 1);
    P(7, 6, colors.floorAlt, 1, 5);
    P(8, 10, colors.floorAlt, 4, 1);
    // Small debris
    P(10, 4, colors.floorAlt, 2, 1);
    P(2, 11, colors.floorAlt, 1, 1);
  }

  // Floor with debris
  drawFloorDebris(ctx, px, py, scale, colors) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    P(0, 0, colors.floor, 16, 16);
    // Small rocks/debris
    P(3, 10, colors.floorAlt, 2, 2);
    P(10, 5, colors.floorAlt, 3, 2);
    P(6, 12, colors.floorAlt, 1, 1);
    P(12, 11, colors.floorAlt, 2, 1);
    P(2, 4, colors.floorAlt, 1, 1);
  }

  // Floor with moss
  drawFloorMoss(ctx, px, py, scale, colors) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    P(0, 0, colors.floor, 16, 16);
    // Moss patches
    P(2, 7, colors.floorAlt, 4, 3);
    P(3, 8, colors.accent || colors.floorAlt, 2, 1);
    P(10, 11, colors.floorAlt, 3, 2);
  }

  // Forest floor
  drawForestFloor(ctx, px, py, scale, colors) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    // Grass base
    P(0, 0, colors.floor, 16, 16);
    // Dirt patches
    P(3, 5, colors.floorAlt, 4, 3);
    P(9, 10, colors.floorAlt, 5, 4);
    // Grass tufts
    P(1, 2, '#22c55e', 1, 2);
    P(6, 1, '#16a34a', 1, 2);
    P(12, 3, '#22c55e', 1, 2);
    P(2, 12, '#16a34a', 1, 2);
    P(14, 8, '#22c55e', 1, 2);
  }

  // Forest floor with leaves
  drawForestFloorLeaves(ctx, px, py, scale, colors) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    P(0, 0, colors.floor, 16, 16);
    // Fallen leaves
    P(2, 4, '#854d0e', 2, 1);
    P(7, 7, '#a16207', 2, 1);
    P(11, 3, '#854d0e', 2, 1);
    P(4, 11, '#ca8a04', 2, 1);
    P(13, 12, '#a16207', 2, 1);
    // Small twigs
    P(5, 2, '#78350f', 3, 1);
    P(9, 9, '#78350f', 2, 1);
  }

  // Forest floor with roots
  drawForestFloorRoots(ctx, px, py, scale, colors) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    P(0, 0, colors.floor, 16, 16);
    // Exposed roots
    P(0, 6, '#78350f', 5, 2);
    P(4, 7, '#78350f', 2, 4);
    P(10, 3, '#78350f', 6, 2);
    P(11, 4, '#78350f', 2, 5);
    // Root highlights
    P(1, 6, '#92400e', 3, 1);
    P(11, 3, '#92400e', 4, 1);
  }

  // Boss room floor
  drawBossFloor(ctx, px, py, scale, hash) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    P(0, 0, '#2a1515', 16, 16);
    // Texture
    if (hash < 30) {
      P(3, 5, '#1f1010', 2, 1);
      P(10, 9, '#1f1010', 1, 2);
    }
  }

  // Entrance tile
  drawEntrance(ctx, px, py, scale) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    P(0, 0, '#1d4ed8', 16, 16);
    P(5, 3, '#60a5fa', 6, 10);
    // Door frame
    P(4, 2, '#1e40af', 1, 12);
    P(11, 2, '#1e40af', 1, 12);
    P(4, 2, '#1e40af', 8, 1);
  }

  // Exit tile
  drawExit(ctx, px, py, scale, colors) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    P(0, 0, colors.accent, 16, 16);
    // Glow effect
    ctx.globalAlpha = 0.6;
    P(6, 5, '#ffffff', 4, 6);
    ctx.globalAlpha = 0.8;
    P(7, 6, '#ffffff', 2, 4);
    ctx.globalAlpha = 1;
  }

  // Treasure on floor
  drawTreasure(ctx, px, py, scale) {
    const P = (x, y, c, w = 1, h = 1) => this.P(ctx, px, py, x, y, c, w, h, scale);

    // Chest
    P(4, 6, '#78350f', 8, 6);
    P(5, 7, '#92400e', 6, 4);
    // Chest lid
    P(4, 5, '#92400e', 8, 2);
    // Gold trim
    P(5, 6, '#fbbf24', 6, 1);
    // Keyhole
    P(7, 8, '#fbbf24', 2, 2);
  }

  // Render visible portion to main canvas
  render(ctx, cameraPos, viewportWidth, viewportHeight) {
    if (!this.offscreenCanvas) return;

    // Calculate source rectangle (in offscreen canvas)
    const srcX = Math.max(0, cameraPos.x * this.tileSize);
    const srcY = Math.max(0, cameraPos.y * this.tileSize);

    // Calculate offset for when camera is negative
    const offsetX = cameraPos.x < 0 ? -cameraPos.x * this.tileSize : 0;
    const offsetY = cameraPos.y < 0 ? -cameraPos.y * this.tileSize : 0;

    // Draw the visible portion
    ctx.drawImage(
      this.offscreenCanvas,
      srcX, srcY, viewportWidth, viewportHeight,
      offsetX, offsetY, viewportWidth, viewportHeight
    );
  }

  // Invalidate cache
  invalidate() {
    this.cacheValid = false;
  }

  // Update a single tile without rebuilding the entire cache
  // Used when treasure is collected to avoid screen flash
  updateTile(x, y, newTile) {
    if (!this.offscreenCtx || !this.grid) return;

    // Update the grid reference
    this.grid = this.grid.map((row, rowY) =>
      rowY === y ? row.map((tile, colX) => (colX === x ? newTile : tile)) : row
    );

    // Redraw just this tile
    this.renderTile(x, y, newTile);
  }

  // Cleanup
  destroy() {
    this.offscreenCanvas = null;
    this.offscreenCtx = null;
    this.cacheValid = false;
    this.grid = null;
  }
}
