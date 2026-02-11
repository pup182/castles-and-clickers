// Hero sprite data for canvas rendering
// Each sprite is a 16x16 grid, stored as [x, y, width, height, color] arrays

// Rarity colors for equipment
const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

// Default weapons by class
const DEFAULT_WEAPONS = {
  warrior: 'sword',
  paladin: 'sword',
  knight: 'sword',
  mage: 'staff',
  cleric: 'staff',
  druid: 'staff',
  shaman: 'totem',
  rogue: 'daggers',
  ranger: 'bow',
  necromancer: 'scythe',
};

// Armor part indices in sprite data (for color replacement)
// Only the MAIN armor piece is colored - highlight stays fixed for detail
// Indices must match the actual armor sections in HERO_SPRITE_DATA
const ARMOR_PARTS = {
  warrior: [6],         // Armor main only (highlight at index 7 stays fixed)
  paladin: [6],         // Armor main only
  knight: [6],          // Armor main only
  cleric: [6],          // Robe main only
  druid: [9],           // Robe main only (after antlers/hood/face)
  shaman: [9],          // Robe main only (after headdress/face/markings)
  mage: [8],            // Robe main only (after hat/star/face)
  rogue: [6],           // Cloak main only
  ranger: [5],          // Cloak main only (after hood/face)
  necromancer: [6],     // Robe main only
};

export const HERO_SPRITE_DATA = {
  warrior: [
    // Helmet
    [5, 1, 6, 1, '#6b7280'],
    [4, 2, 8, 2, '#9ca3af'],
    [5, 2, 6, 1, '#d1d5db'],
    // Face
    [5, 4, 6, 3, '#fbbf24'],
    [6, 5, 1, 1, '#1f2937'],
    [9, 5, 1, 1, '#1f2937'],
    // Armor
    [4, 7, 8, 4, '#6b7280'],
    [5, 8, 6, 2, '#9ca3af'],
    [7, 7, 2, 1, '#fbbf24'],
    // Legs
    [5, 11, 2, 3, '#4b5563'],
    [9, 11, 2, 3, '#4b5563'],
    // Feet
    [4, 14, 3, 2, '#78350f'],
    [9, 14, 3, 2, '#78350f'],
  ],

  paladin: [
    // Crown/Helmet
    [6, 0, 4, 1, '#fbbf24'],
    [5, 1, 6, 2, '#fbbf24'],
    [4, 2, 8, 2, '#9ca3af'],
    // Face
    [5, 4, 6, 3, '#fbbf24'],
    [6, 5, 1, 1, '#1f2937'],
    [9, 5, 1, 1, '#1f2937'],
    // Armor
    [4, 7, 8, 4, '#fbbf24'],
    [5, 8, 6, 2, '#fcd34d'],
    // Cross
    [7, 7, 2, 3, '#f3f4f6'],
    [6, 8, 4, 1, '#f3f4f6'],
    // Legs
    [5, 11, 2, 3, '#d97706'],
    [9, 11, 2, 3, '#d97706'],
    // Feet
    [4, 14, 3, 2, '#92400e'],
    [9, 14, 3, 2, '#92400e'],
  ],

  knight: [
    // Plume
    [7, 0, 2, 1, '#dc2626'],
    // Helmet
    [5, 1, 6, 3, '#6b7280'],
    [6, 2, 4, 1, '#9ca3af'],
    // Visor
    [5, 4, 6, 2, '#4b5563'],
    [6, 4, 4, 1, '#1f2937'],
    // Neck
    [6, 6, 4, 1, '#6b7280'],
    // Armor
    [4, 7, 8, 4, '#6b7280'],
    [5, 8, 6, 2, '#9ca3af'],
    // Legs
    [5, 11, 2, 3, '#4b5563'],
    [9, 11, 2, 3, '#4b5563'],
    // Feet
    [4, 14, 3, 2, '#374151'],
    [9, 14, 3, 2, '#374151'],
  ],

  cleric: [
    // Halo
    [6, 0, 4, 1, '#fbbf24'],
    // Hood
    [5, 1, 6, 2, '#f3f4f6'],
    [4, 3, 8, 1, '#e5e7eb'],
    // Face
    [5, 4, 6, 3, '#fbbf24'],
    [6, 5, 1, 1, '#1f2937'],
    [9, 5, 1, 1, '#1f2937'],
    // Robe
    [4, 7, 8, 5, '#f3f4f6'],
    [5, 8, 6, 3, '#e5e7eb'],
    // Cross emblem
    [7, 8, 2, 3, '#fbbf24'],
    [6, 9, 4, 1, '#fbbf24'],
    // Feet
    [5, 12, 2, 2, '#d1d5db'],
    [9, 12, 2, 2, '#d1d5db'],
  ],

  druid: [
    // Antlers
    [3, 0, 1, 2, '#78350f'],
    [4, 1, 1, 1, '#78350f'],
    [12, 0, 1, 2, '#78350f'],
    [11, 1, 1, 1, '#78350f'],
    // Hood
    [5, 2, 6, 2, '#166534'],
    [4, 3, 8, 1, '#15803d'],
    // Face
    [5, 4, 6, 3, '#fbbf24'],
    [6, 5, 1, 1, '#1f2937'],
    [9, 5, 1, 1, '#1f2937'],
    // Robe
    [4, 7, 8, 5, '#166534'],
    [5, 8, 6, 3, '#15803d'],
    // Leaf emblem
    [7, 8, 2, 2, '#22c55e'],
    // Feet
    [5, 12, 2, 2, '#14532d'],
    [9, 12, 2, 2, '#14532d'],
  ],

  shaman: [
    // Headdress
    [4, 0, 2, 2, '#60a5fa'],
    [10, 0, 2, 2, '#60a5fa'],
    [5, 1, 6, 2, '#78350f'],
    [4, 3, 8, 1, '#92400e'],
    // Face with markings
    [5, 4, 6, 3, '#fbbf24'],
    [6, 5, 1, 1, '#1f2937'],
    [9, 5, 1, 1, '#1f2937'],
    [5, 5, 1, 1, '#3b82f6'],
    [10, 5, 1, 1, '#3b82f6'],
    // Robe
    [4, 7, 8, 5, '#1e40af'],
    [5, 8, 6, 3, '#2563eb'],
    // Lightning emblem
    [7, 8, 1, 1, '#fbbf24'],
    [8, 9, 1, 1, '#fbbf24'],
    [7, 10, 1, 1, '#fbbf24'],
    // Feet
    [5, 12, 2, 2, '#1e3a8a'],
    [9, 12, 2, 2, '#1e3a8a'],
  ],

  mage: [
    // Hat
    [7, 0, 2, 1, '#7c3aed'],
    [6, 1, 4, 1, '#7c3aed'],
    [5, 2, 6, 1, '#8b5cf6'],
    [4, 3, 8, 1, '#a78bfa'],
    // Star on hat
    [7, 1, 2, 1, '#fbbf24'],
    // Face
    [5, 4, 6, 3, '#fbbf24'],
    [6, 5, 1, 1, '#1f2937'],
    [9, 5, 1, 1, '#1f2937'],
    // Robe
    [4, 7, 8, 5, '#7c3aed'],
    [5, 8, 6, 3, '#8b5cf6'],
    // Feet
    [5, 12, 2, 2, '#5b21b6'],
    [9, 12, 2, 2, '#5b21b6'],
  ],

  rogue: [
    // Hood
    [5, 1, 6, 2, '#1f2937'],
    [4, 3, 8, 1, '#374151'],
    // Face
    [5, 4, 6, 3, '#d97706'],
    [6, 5, 1, 1, '#1f2937'],
    [9, 5, 1, 1, '#1f2937'],
    // Mask
    [5, 6, 6, 1, '#1f2937'],
    // Cloak
    [3, 7, 10, 4, '#374151'],
    [5, 8, 6, 2, '#4b5563'],
    // Legs
    [5, 11, 2, 3, '#1f2937'],
    [9, 11, 2, 3, '#1f2937'],
    // Feet
    [4, 14, 3, 2, '#374151'],
    [9, 14, 3, 2, '#374151'],
  ],

  ranger: [
    // Hood
    [5, 1, 6, 2, '#166534'],
    [4, 3, 8, 1, '#15803d'],
    // Face
    [5, 4, 6, 3, '#fbbf24'],
    [6, 5, 1, 1, '#1f2937'],
    [9, 5, 1, 1, '#1f2937'],
    // Cloak
    [3, 7, 10, 4, '#166534'],
    [5, 8, 6, 2, '#15803d'],
    // Legs
    [5, 11, 2, 3, '#14532d'],
    [9, 11, 2, 3, '#14532d'],
    // Feet
    [4, 14, 3, 2, '#78350f'],
    [9, 14, 3, 2, '#78350f'],
  ],

  necromancer: [
    // Hood
    [5, 1, 6, 2, '#1f2937'],
    [4, 3, 8, 1, '#374151'],
    // Skull face
    [5, 4, 6, 3, '#e5e7eb'],
    [6, 5, 1, 1, '#1f2937'],
    [9, 5, 1, 1, '#1f2937'],
    [7, 6, 2, 1, '#1f2937'],
    // Robe
    [4, 7, 8, 5, '#1f2937'],
    [5, 8, 6, 3, '#374151'],
    // Skull emblem
    [7, 8, 2, 2, '#a855f7'],
    // Feet
    [5, 12, 2, 2, '#111827'],
    [9, 12, 2, 2, '#111827'],
  ],
};

// Sprite cache for pre-rendered sprites
const heroSpriteCache = new Map();

// Convert hex color to grayscale
function toGrayscale(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  return `#${gray.toString(16).padStart(2, '0').repeat(3)}`;
}

// Get weapon type from equipment
function getWeaponType(weapon, classId) {
  if (!weapon) return DEFAULT_WEAPONS[classId] || 'sword';
  const name = (weapon.name || '').toLowerCase();
  const baseType = (weapon.baseType || '').toLowerCase();
  if (baseType.includes('staff') || name.includes('staff')) return 'staff';
  if (baseType.includes('bow') || name.includes('bow')) return 'bow';
  if (baseType.includes('dagger') || name.includes('dagger')) return 'daggers';
  if (baseType.includes('axe') || name.includes('axe')) return 'axe';
  if (baseType.includes('mace') || name.includes('mace')) return 'mace';
  if (baseType.includes('scythe') || name.includes('scythe')) return 'scythe';
  return DEFAULT_WEAPONS[classId] || 'sword';
}

// Draw weapon overlay on canvas
function drawWeapon(ctx, weaponType, scale, color) {
  ctx.fillStyle = color;

  switch (weaponType) {
    case 'sword':
      // Blade
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(12 * scale, 2 * scale, scale, scale);
      ctx.fillStyle = color;
      ctx.fillRect(12 * scale, 3 * scale, scale, 5 * scale);
      // Guard
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(11 * scale, 8 * scale, 3 * scale, scale);
      // Handle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(12 * scale, 9 * scale, scale, 2 * scale);
      break;
    case 'staff':
      // Orb
      ctx.fillStyle = color;
      ctx.fillRect(12 * scale, 1 * scale, 2 * scale, 2 * scale);
      // Shaft
      ctx.fillStyle = '#78350f';
      ctx.fillRect(12 * scale, 3 * scale, scale, 8 * scale);
      break;
    case 'bow':
      // Bow curve
      ctx.fillStyle = '#78350f';
      ctx.fillRect(14 * scale, 2 * scale, scale, 8 * scale);
      ctx.fillRect(13 * scale, 3 * scale, scale, scale);
      ctx.fillRect(13 * scale, 8 * scale, scale, scale);
      // String
      ctx.fillStyle = '#d1d5db';
      ctx.fillRect(12 * scale, 4 * scale, scale, 4 * scale);
      break;
    case 'daggers':
      // Twin blades
      ctx.fillStyle = color;
      ctx.fillRect(11 * scale, 3 * scale, scale, 4 * scale);
      ctx.fillRect(14 * scale, 3 * scale, scale, 4 * scale);
      // Handles
      ctx.fillStyle = '#78350f';
      ctx.fillRect(11 * scale, 7 * scale, scale, 2 * scale);
      ctx.fillRect(14 * scale, 7 * scale, scale, 2 * scale);
      break;
    case 'axe':
      // Blade
      ctx.fillStyle = color;
      ctx.fillRect(11 * scale, 2 * scale, 3 * scale, scale);
      ctx.fillRect(12 * scale, 3 * scale, 3 * scale, 2 * scale);
      // Handle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(12 * scale, 5 * scale, scale, 5 * scale);
      break;
    case 'scythe':
      // Blade
      ctx.fillStyle = color;
      ctx.fillRect(10 * scale, 2 * scale, 4 * scale, scale);
      ctx.fillRect(13 * scale, 3 * scale, scale, 2 * scale);
      // Handle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(12 * scale, 3 * scale, scale, 8 * scale);
      break;
    default:
      // Default sword
      ctx.fillStyle = color;
      ctx.fillRect(12 * scale, 3 * scale, scale, 5 * scale);
      break;
  }
}

// Get or create cached sprite canvas
function getCachedHeroSprite(classId, size, isDead, armorRarity, weaponRarity, weaponType) {
  const cacheKey = `${classId}-${size}-${isDead}-${armorRarity}-${weaponRarity}-${weaponType}`;

  if (heroSpriteCache.has(cacheKey)) {
    return heroSpriteCache.get(cacheKey);
  }

  // Create offscreen canvas for this sprite
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  // Render sprite to cache
  const spriteData = HERO_SPRITE_DATA[classId] || HERO_SPRITE_DATA.warrior;
  const scale = size / 16;
  const armorColor = RARITY_COLORS[armorRarity] || RARITY_COLORS.common;
  const armorParts = ARMOR_PARTS[classId] || [];

  for (let i = 0; i < spriteData.length; i++) {
    const [px, py, pw, ph, baseColor] = spriteData[i];
    let color = baseColor;

    // Apply armor color to armor parts
    if (armorParts.includes(i)) {
      color = armorColor;
    }

    ctx.fillStyle = isDead ? toGrayscale(color) : color;
    ctx.fillRect(px * scale, py * scale, pw * scale, ph * scale);
  }

  // Draw weapon
  if (!isDead) {
    const weaponColor = RARITY_COLORS[weaponRarity] || RARITY_COLORS.common;
    drawWeapon(ctx, weaponType, scale, weaponColor);
  }

  heroSpriteCache.set(cacheKey, canvas);
  return canvas;
}

// Draw a hero sprite to canvas (uses cached sprite)
export function drawHeroSprite(ctx, classId, x, y, size, isDead = false, equipment = {}) {
  const armorRarity = equipment?.armor?.rarity || 'common';
  const weaponRarity = equipment?.weapon?.rarity || 'common';
  const weaponType = getWeaponType(equipment?.weapon, classId);

  const cachedSprite = getCachedHeroSprite(classId, size, isDead, armorRarity, weaponRarity, weaponType);
  if (isDead) {
    ctx.save();
    ctx.globalAlpha = 0.4;
  }
  ctx.drawImage(cachedSprite, x, y);
  if (isDead) {
    ctx.restore();
  }
}

// Clear sprite cache (call when needed)
export function clearHeroSpriteCache() {
  heroSpriteCache.clear();
}
