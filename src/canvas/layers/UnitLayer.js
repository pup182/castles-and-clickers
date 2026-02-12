// Unit layer - renders heroes and monsters on the dungeon grid
// Uses pixel art sprite data for authentic visuals

import { drawMonsterSprite, MONSTER_SPRITE_DATA } from '../sprites/MonsterSprites';
import { drawHeroSprite, HERO_SPRITE_DATA } from '../sprites/HeroSprites';
import { useGameStore } from '../../store/gameStore';

// Boss-specific aura colors
const BOSS_AURA_COLORS = {
  goblin_king: { primary: '#22c55e', secondary: '#16a34a' },   // Green
  orc_warlord: { primary: '#dc2626', secondary: '#b91c1c' },   // Red
  spider_queen: { primary: '#7c3aed', secondary: '#6d28d9' },  // Purple
  dragon: { primary: '#f97316', secondary: '#ea580c' },        // Orange
  demon_lord: { primary: '#991b1b', secondary: '#7f1d1d' },    // Dark red
  lich_king: { primary: '#3b82f6', secondary: '#2563eb' },     // Ice blue
};

// Elite mob aura colors (golden/red themed)
const ELITE_AURA_COLOR = { primary: '#fbbf24', secondary: '#f59e0b' }; // Gold

// Raid boss sprite mapping - maps raid boss templateIds to custom raid boss sprites
// IMPORTANT: Keep this in sync with CanvasDungeonView.jsx RAID_BOSS_SPRITE_MAP
const RAID_BOSS_SPRITE_MAP = {
  // Sunken Temple
  corrupted_priest: 'boss_corrupted_priest',
  naga_queen: 'boss_naga_queen',
  sea_serpent: 'boss_sea_serpent',
  // Cursed Manor
  phantom_butler: 'boss_phantom_butler',
  banshee_queen: 'boss_banshee',
  flesh_golem: 'boss_flesh_golem',
  vampire_lord: 'boss_vampire_lord',
  // Sky Fortress
  wind_elemental_lord: 'boss_wind_elemental',
  lightning_golem: 'boss_lightning_golem',
  storm_hawk: 'boss_storm_hawk',
  storm_lord: 'boss_storm_lord',
  // The Abyss
  abyssal_horror: 'boss_abyssal_horror',
  kraken: 'boss_kraken',
  deep_one_prophet: 'boss_deep_one_prophet',
  leviathan: 'boss_leviathan',
  // Void Throne
  void_stalker_prime: 'boss_void_stalker_prime',
  reality_ripper_alpha: 'boss_reality_ripper',
  null_shade_omega: 'boss_null_shade',
  entropy_avatar: 'boss_entropy_avatar',
  void_god: 'boss_void_god',
};

export class UnitLayer {
  constructor(spriteManager, tileSize) {
    this.spriteManager = spriteManager;
    this.tileSize = tileSize;

    // Cache for store hero equipment lookup
    this.equipmentCache = new Map();

    // Position interpolation tracking
    this.lastPositions = new Map();
    this.interpolatedPositions = new Map();

    // Interpolation factor (lower = smoother but laggier)
    this.interpFactor = 0.2;

    // Animation time tracking for boss auras
    this.animTime = 0;
    this.lastFrameTime = performance.now();
  }

  // Render all units and return interpolated positions for UI layer
  render(ctx, cameraPos, heroes, monsters, phase) {
    // Update animation time
    const now = performance.now();
    this.animTime += (now - this.lastFrameTime) / 1000;
    this.lastFrameTime = now;

    // Track interpolated positions for UI layer sync
    const unitPositions = new Map();

    // Dead heroes only (monsters disappear when dead)
    for (const hero of heroes) {
      if (hero.stats.hp <= 0) {
        this.renderDeadHero(ctx, cameraPos, hero);
        unitPositions.set(hero.id, hero.position);
      }
    }

    // Render living monsters
    for (const monster of monsters) {
      if (monster.stats.hp > 0) {
        const interpPos = this.renderMonster(ctx, cameraPos, monster, phase);
        unitPositions.set(monster.id, interpPos);
      }
    }

    // Render living heroes on top
    for (const hero of heroes) {
      if (hero.stats.hp > 0) {
        const interpPos = this.renderHero(ctx, cameraPos, hero, phase);
        unitPositions.set(hero.id, interpPos);
      }
    }

    return unitPositions;
  }

  // Get interpolated position for smooth movement
  // Optimized: reuses objects to avoid garbage collection pressure
  getInterpolatedPosition(unitId, targetPos) {
    let lastPos = this.lastPositions.get(unitId);
    let interpPos = this.interpolatedPositions.get(unitId);

    if (!lastPos) {
      // First frame - create reusable objects
      lastPos = { x: targetPos.x, y: targetPos.y };
      this.lastPositions.set(unitId, lastPos);
    }

    if (!interpPos) {
      interpPos = { x: targetPos.x, y: targetPos.y };
      this.interpolatedPositions.set(unitId, interpPos);
      return interpPos;
    }

    // Update last position in-place if target changed
    if (lastPos.x !== targetPos.x || lastPos.y !== targetPos.y) {
      lastPos.x = targetPos.x;
      lastPos.y = targetPos.y;
    }

    // Lerp towards target
    interpPos.x += (targetPos.x - interpPos.x) * this.interpFactor;
    interpPos.y += (targetPos.y - interpPos.y) * this.interpFactor;

    // Snap if very close
    if (Math.abs(interpPos.x - targetPos.x) < 0.01) interpPos.x = targetPos.x;
    if (Math.abs(interpPos.y - targetPos.y) < 0.01) interpPos.y = targetPos.y;

    return interpPos;
  }

  // Render a monster - returns interpolated position
  renderMonster(ctx, cameraPos, monster, phase) {
    const pos = this.getInterpolatedPosition(monster.id, monster.position);
    const baseSize = this.tileSize - 8;
    const isBoss = monster.isBoss;
    const isElite = monster.isElite;

    // Boss size scaling (1.4x larger), elite slightly larger (1.15x)
    let size = baseSize;
    if (isBoss) {
      size = Math.floor(baseSize * 1.4);
    } else if (isElite) {
      size = Math.floor(baseSize * 1.15);
    }

    // Adjust offset to center larger sprite
    const offsetX = (isBoss || isElite) ? 4 - (size - baseSize) / 2 : 4;
    const offsetY = (isBoss || isElite) ? 2 - (size - baseSize) / 2 : 2;

    const screenX = (pos.x - cameraPos.x) * this.tileSize + offsetX;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + offsetY;

    // Skip if off screen (but still return position)
    if (screenX < -this.tileSize * 1.5 || screenX > ctx.canvas.width + this.tileSize ||
        screenY < -this.tileSize * 1.5 || screenY > ctx.canvas.height + this.tileSize) {
      return pos;
    }

    // Get sprite ID - use mapping for raid bosses
    const isRaidBoss = monster.isWingBoss || monster.isFinalBoss || monster.isRaidBoss;
    const spriteId = isRaidBoss ? (RAID_BOSS_SPRITE_MAP[monster.templateId] || monster.templateId) : monster.templateId;

    // Animated boss aura effect
    if (isBoss) {
      this.renderBossAura(ctx, screenX, screenY, size, spriteId, monster.colorVariation);
    } else if (isElite) {
      // Elite monsters get a golden aura
      this.renderEliteAura(ctx, screenX, screenY, size);
    }

    // Draw the monster sprite (with color variation for bosses)
    drawMonsterSprite(ctx, spriteId, screenX, screenY, size, false, monster.colorVariation);

    // Draw skull icon above elite monsters
    if (isElite) {
      this.renderEliteSkullIcon(ctx, screenX, screenY, size);
    }

    return pos;
  }

  // Render animated pulsing boss aura
  renderBossAura(ctx, screenX, screenY, size, templateId, colorVariation) {
    const centerX = screenX + size / 2;
    const centerY = screenY + size / 2;

    // Get boss-specific colors or default to red
    const colors = BOSS_AURA_COLORS[templateId] || { primary: '#dc2626', secondary: '#b91c1c' };

    // Apply color variation hue shift if present
    let primaryColor = colors.primary;
    let secondaryColor = colors.secondary;
    if (colorVariation && colorVariation.hueShift !== 0) {
      primaryColor = this.shiftHue(colors.primary, colorVariation.hueShift);
      secondaryColor = this.shiftHue(colors.secondary, colorVariation.hueShift);
    }

    // Pulsing animation (sine wave)
    const pulsePhase = Math.sin(this.animTime * 3) * 0.5 + 0.5; // 0 to 1
    const pulseRadius = size / 2 + 6 + pulsePhase * 4;

    ctx.save();

    // Outer pulsing ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 2 + pulsePhase;
    ctx.globalAlpha = 0.4 + pulsePhase * 0.3;
    ctx.stroke();

    // Inner radial gradient glow
    const gradient = ctx.createRadialGradient(
      centerX, centerY, size / 4,
      centerX, centerY, size / 2 + 4
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.5, this.hexToRgba(secondaryColor, 0.2));
    gradient.addColorStop(1, this.hexToRgba(primaryColor, 0.4));

    ctx.globalAlpha = 0.6 + pulsePhase * 0.2;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2 + 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Render animated pulsing elite aura (golden)
  renderEliteAura(ctx, screenX, screenY, size) {
    const centerX = screenX + size / 2;
    const centerY = screenY + size / 2;

    const colors = ELITE_AURA_COLOR;

    // Faster pulsing for elites
    const pulsePhase = Math.sin(this.animTime * 4) * 0.5 + 0.5;
    const pulseRadius = size / 2 + 3 + pulsePhase * 2;

    ctx.save();

    // Outer pulsing ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.5 + pulsePhase * 0.5;
    ctx.globalAlpha = 0.5 + pulsePhase * 0.3;
    ctx.stroke();

    // Inner radial gradient glow
    const gradient = ctx.createRadialGradient(
      centerX, centerY, size / 4,
      centerX, centerY, size / 2 + 2
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.6, this.hexToRgba(colors.secondary, 0.15));
    gradient.addColorStop(1, this.hexToRgba(colors.primary, 0.3));

    ctx.globalAlpha = 0.5 + pulsePhase * 0.2;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2 + 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Render skull icon above elite monsters
  renderEliteSkullIcon(ctx, screenX, screenY, size) {
    const iconSize = 8;
    const iconX = screenX + size / 2 - iconSize / 2;
    const iconY = screenY - iconSize - 2;

    ctx.save();

    // Skull icon (simple pixel art)
    ctx.fillStyle = '#fbbf24'; // Gold
    // Skull shape
    ctx.fillRect(iconX + 1, iconY, 6, 1);     // Top
    ctx.fillRect(iconX, iconY + 1, 8, 4);      // Head
    ctx.fillRect(iconX + 1, iconY + 5, 6, 2);  // Jaw

    // Eyes (dark)
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(iconX + 1, iconY + 2, 2, 2);  // Left eye
    ctx.fillRect(iconX + 5, iconY + 2, 2, 2);  // Right eye

    // Nose
    ctx.fillRect(iconX + 3, iconY + 4, 2, 1);

    ctx.restore();
  }

  // Convert hex color to rgba string
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Shift hue of a hex color by degrees
  shiftHue(hex, degrees) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
      // Achromatic - just return original
      return hex;
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let h;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;

    // Shift hue
    h = (h + degrees / 360) % 1;
    if (h < 0) h += 1;

    // Convert back to RGB
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const newR = Math.round(hue2rgb(p, q, h + 1/3) * 255);
    const newG = Math.round(hue2rgb(p, q, h) * 255);
    const newB = Math.round(hue2rgb(p, q, h - 1/3) * 255);

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  // Render a dead monster
  renderDeadMonster(ctx, cameraPos, monster) {
    const pos = monster.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + 4;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + 2;
    const size = this.tileSize - 8;

    if (screenX < -this.tileSize || screenX > ctx.canvas.width + this.tileSize ||
        screenY < -this.tileSize || screenY > ctx.canvas.height + this.tileSize) {
      return;
    }

    // Use cached dead sprite (grayscale computed at cache time)
    drawMonsterSprite(ctx, monster.templateId, screenX, screenY, size, true);
  }

  // Get current equipment from store (stays in sync with equipment changes)
  getHeroEquipment(heroId) {
    const storeHeroes = useGameStore.getState().heroes || [];
    const storeHero = storeHeroes.find(h => h?.id === heroId);
    return storeHero?.equipment || {};
  }

  // Render a hero - returns interpolated position
  renderHero(ctx, cameraPos, hero, phase) {
    const pos = this.getInterpolatedPosition(hero.id, hero.position);
    const screenX = (pos.x - cameraPos.x) * this.tileSize + 4;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + 2;
    const size = this.tileSize - 8;

    if (screenX < -this.tileSize || screenX > ctx.canvas.width + this.tileSize ||
        screenY < -this.tileSize || screenY > ctx.canvas.height + this.tileSize) {
      return pos;
    }

    // Get current equipment from store (not snapshot) so sprites update when gear changes
    const equipment = this.getHeroEquipment(hero.id);

    // Check if this is a shadow clone
    const isClone = hero.isClone || hero.id.startsWith('clone_');

    if (isClone) {
      // Draw shadow clone as solid purple silhouette
      this.renderSilhouette(ctx, hero.classId, screenX, screenY, size, '#7c3aed', 0.7, equipment);
    } else {
      drawHeroSprite(ctx, hero.classId, screenX, screenY, size, false, equipment);
    }

    return pos;
  }

  // Render a hero as a solid color silhouette
  renderSilhouette(ctx, classId, x, y, size, color, alpha, equipment) {
    // Create temp canvas to draw sprite then colorize
    if (!this.silhouetteCanvas) {
      this.silhouetteCanvas = document.createElement('canvas');
      this.silhouetteCtx = this.silhouetteCanvas.getContext('2d');
    }

    this.silhouetteCanvas.width = size;
    this.silhouetteCanvas.height = size;
    this.silhouetteCtx.clearRect(0, 0, size, size);

    // Draw the sprite to temp canvas
    drawHeroSprite(this.silhouetteCtx, classId, 0, 0, size, false, equipment);

    // Colorize: draw solid color using source-in composite
    this.silhouetteCtx.globalCompositeOperation = 'source-in';
    this.silhouetteCtx.fillStyle = color;
    this.silhouetteCtx.fillRect(0, 0, size, size);
    this.silhouetteCtx.globalCompositeOperation = 'source-over';

    // Draw to main canvas
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(this.silhouetteCanvas, x, y);
    ctx.restore();
  }

  // Render a dead hero
  renderDeadHero(ctx, cameraPos, hero) {
    const pos = hero.position;
    const screenX = (pos.x - cameraPos.x) * this.tileSize + 4;
    const screenY = (pos.y - cameraPos.y) * this.tileSize + 2;
    const size = this.tileSize - 8;

    if (screenX < -this.tileSize || screenX > ctx.canvas.width + this.tileSize ||
        screenY < -this.tileSize || screenY > ctx.canvas.height + this.tileSize) {
      return;
    }

    // Check if this is a shadow clone
    const isClone = hero.isClone || hero.id.startsWith('clone_');

    if (isClone) {
      // Dead clone: darker purple silhouette, more transparent
      const equipment = this.getHeroEquipment(hero.id);
      this.renderSilhouette(ctx, hero.classId, screenX, screenY, size, '#4c1d95', 0.35, equipment);
    } else {
      // Get current equipment from store (not snapshot) so sprites update when gear changes
      const equipment = this.getHeroEquipment(hero.id);
      // Draw dead hero (grayed out) with equipment
      drawHeroSprite(ctx, hero.classId, screenX, screenY, size, true, equipment);
    }
  }

  // Clear position cache (call when dungeon changes)
  clearPositionCache() {
    this.lastPositions.clear();
    this.interpolatedPositions.clear();
  }
}
