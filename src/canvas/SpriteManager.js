// Sprite manager for converting SVG components to Canvas-ready ImageBitmaps
// Pre-caches sprites for efficient rendering

import { TILE } from '../game/mazeGenerator';

export class SpriteManager {
  constructor() {
    // Cache for rendered sprites
    this.cache = new Map();

    // Offscreen canvas for SVG rendering
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
  }

  // Generate cache key for a sprite
  static getCacheKey(type, id, colors = null, size = 36) {
    const colorKey = colors ? JSON.stringify(colors) : 'default';
    return `${type}:${id}:${colorKey}:${size}`;
  }

  // Check if sprite is cached
  has(key) {
    return this.cache.has(key);
  }

  // Get cached sprite
  get(key) {
    return this.cache.get(key);
  }

  // Render an SVG string to an ImageBitmap and cache it
  async renderSvgToCache(key, svgString, size = 36) {
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const bitmap = await this.renderSvgString(svgString, size);
    this.cache.set(key, bitmap);
    return bitmap;
  }

  // Render SVG string to ImageBitmap
  async renderSvgString(svgString, size) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        // Draw to offscreen canvas
        this.offscreenCanvas.width = size;
        this.offscreenCanvas.height = size;
        this.offscreenCtx.imageSmoothingEnabled = false;
        this.offscreenCtx.clearRect(0, 0, size, size);
        this.offscreenCtx.drawImage(img, 0, 0, size, size);

        URL.revokeObjectURL(url);

        // Create ImageBitmap for faster drawing
        createImageBitmap(this.offscreenCanvas).then(resolve).catch(reject);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG'));
      };

      img.src = url;
    });
  }

  // Generate tile sprite directly (avoids React overhead)
  getTileSprite(tileType, colors, x, y, size = 36) {
    // Use position-based hash for tile variations
    const hash = (x * 31 + y * 17) % 100;
    const variant = this.getTileVariant(tileType, hash);
    const key = SpriteManager.getCacheKey('tile', `${tileType}-${variant}`, colors, size);

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    // Generate SVG for tile synchronously and cache
    const svg = this.generateTileSvg(tileType, variant, colors, size);
    this.renderSvgToCache(key, svg, size);

    return null; // Will be available next frame
  }

  // Get tile variant based on hash
  getTileVariant(tileType, hash) {
    if (tileType === TILE.WALL) return 'wall';
    if (tileType === TILE.FLOOR || tileType === TILE.CORRIDOR) {
      if (hash < 5) return 'cracked';
      if (hash < 10) return 'debris';
      if (hash < 15) return 'moss';
      if (hash < 40) return 'alt';
      return 'base';
    }
    return 'base';
  }

  // Generate tile SVG string
  generateTileSvg(tileType, variant, colors, size) {
    const viewBox = '0 0 16 16';

    if (tileType === TILE.WALL) {
      return `<svg width="${size}" height="${size}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated">
        <rect x="0" y="0" width="16" height="16" fill="${colors.wall}"/>
        <rect x="0" y="0" width="8" height="4" fill="${colors.wallHighlight}"/>
        <rect x="4" y="4" width="8" height="4" fill="${colors.wallHighlight}"/>
        <rect x="8" y="8" width="8" height="4" fill="${colors.wallHighlight}"/>
        <rect x="4" y="12" width="8" height="4" fill="${colors.wall}"/>
        <rect x="0" y="4" width="16" height="1" fill="${colors.floorAlt}"/>
        <rect x="0" y="8" width="16" height="1" fill="${colors.floorAlt}"/>
        <rect x="0" y="12" width="16" height="1" fill="${colors.floorAlt}"/>
        <rect x="8" y="0" width="1" height="4" fill="${colors.floorAlt}"/>
        <rect x="4" y="4" width="1" height="4" fill="${colors.floorAlt}"/>
        <rect x="12" y="4" width="1" height="4" fill="${colors.floorAlt}"/>
        <rect x="8" y="8" width="1" height="4" fill="${colors.floorAlt}"/>
        <rect x="4" y="12" width="1" height="4" fill="${colors.floorAlt}"/>
      </svg>`;
    }

    // Floor variants
    switch (variant) {
      case 'cracked':
        return `<svg width="${size}" height="${size}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated">
          <rect x="0" y="0" width="16" height="16" fill="${colors.floor}"/>
          <rect x="4" y="3" width="1" height="4" fill="${colors.floorAlt}"/>
          <rect x="5" y="6" width="3" height="1" fill="${colors.floorAlt}"/>
          <rect x="7" y="6" width="1" height="5" fill="${colors.floorAlt}"/>
          <rect x="8" y="10" width="4" height="1" fill="${colors.floorAlt}"/>
        </svg>`;

      case 'debris':
        return `<svg width="${size}" height="${size}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated">
          <rect x="0" y="0" width="16" height="16" fill="${colors.floor}"/>
          <rect x="3" y="10" width="2" height="2" fill="${colors.floorAlt}"/>
          <rect x="10" y="5" width="3" height="2" fill="${colors.floorAlt}"/>
          <rect x="6" y="12" width="1" height="1" fill="${colors.floorAlt}"/>
        </svg>`;

      case 'moss':
        return `<svg width="${size}" height="${size}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated">
          <rect x="0" y="0" width="16" height="16" fill="${colors.floor}"/>
          <rect x="2" y="7" width="4" height="3" fill="${colors.floorAlt}"/>
          <rect x="3" y="8" width="2" height="1" fill="${colors.accent || colors.floorAlt}"/>
        </svg>`;

      case 'alt':
        return `<svg width="${size}" height="${size}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated">
          <rect x="0" y="0" width="16" height="16" fill="${colors.floor}"/>
          <rect x="1" y="8" width="1" height="2" fill="${colors.floorAlt}"/>
          <rect x="6" y="2" width="2" height="1" fill="${colors.floorAlt}"/>
          <rect x="11" y="12" width="1" height="1" fill="${colors.floorAlt}"/>
        </svg>`;

      default:
        return `<svg width="${size}" height="${size}" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="image-rendering: pixelated">
          <rect x="0" y="0" width="16" height="16" fill="${colors.floor}"/>
          <rect x="2" y="3" width="2" height="1" fill="${colors.floorAlt}"/>
          <rect x="8" y="7" width="1" height="2" fill="${colors.floorAlt}"/>
          <rect x="12" y="2" width="2" height="1" fill="${colors.floorAlt}"/>
        </svg>`;
    }
  }

  // Pre-render tiles for a theme
  async preloadThemeTiles(colors, size = 36) {
    const tileTypes = [TILE.WALL, TILE.FLOOR, TILE.CORRIDOR];
    const variants = ['wall', 'base', 'alt', 'cracked', 'debris', 'moss'];

    const promises = [];
    for (const tileType of tileTypes) {
      for (const variant of variants) {
        const key = SpriteManager.getCacheKey('tile', `${tileType}-${variant}`, colors, size);
        if (!this.cache.has(key)) {
          const svg = this.generateTileSvg(tileType, variant, colors, size);
          promises.push(this.renderSvgToCache(key, svg, size));
        }
      }
    }

    await Promise.all(promises);
  }

  // Draw a tile directly to canvas (fallback when not cached)
  drawTileFallback(ctx, tileType, colors, x, y, size) {
    const hash = (x * 31 + y * 17) % 100;

    if (tileType === TILE.WALL) {
      ctx.fillStyle = colors.wall;
      ctx.fillRect(x * size, y * size, size, size);
      // Simple brick pattern
      ctx.fillStyle = colors.wallHighlight;
      ctx.fillRect(x * size, y * size, size / 2, size / 4);
      ctx.fillRect(x * size + size / 4, y * size + size / 4, size / 2, size / 4);
    } else {
      // Floor
      ctx.fillStyle = colors.floor;
      ctx.fillRect(x * size, y * size, size, size);
      // Random spots
      if (hash < 40) {
        ctx.fillStyle = colors.floorAlt;
        ctx.fillRect(x * size + 4, y * size + 4, 4, 2);
      }
    }
  }

  // Clear the cache
  clear() {
    this.cache.clear();
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
    };
  }
}
