// Skill Sprites - Canvas versions of the pixel art skill icons
// Original icons are 16x16 pixel art, rendered with rectangles

// Cache for rendered skill icons
const skillIconCache = new Map();

// Helper to draw a pixel (rectangle) at scaled position
const P = (ctx, x, y, c, w = 1, h = 1, scale) => {
  ctx.fillStyle = c;
  ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
};

// Skill icon drawing functions - each draws a 16x16 icon scaled to size
const SKILL_ICON_DRAWERS = {
  // === COMBAT SKILLS ===
  power_strike: (ctx, scale) => {
    // Sword
    P(ctx, 3, 2, '#fbbf24', 2, 2, scale);
    P(ctx, 5, 4, '#9ca3af', 2, 2, scale);
    P(ctx, 7, 6, '#9ca3af', 2, 2, scale);
    P(ctx, 9, 8, '#9ca3af', 2, 2, scale);
    P(ctx, 11, 10, '#78350f', 2, 4, scale);
    // Impact lines
    P(ctx, 1, 4, '#fbbf24', 2, 1, scale);
    P(ctx, 2, 6, '#fbbf24', 1, 1, scale);
    P(ctx, 6, 2, '#fbbf24', 1, 2, scale);
  },

  cleave: (ctx, scale) => {
    // Axe blade
    P(ctx, 2, 3, '#9ca3af', 6, 1, scale);
    P(ctx, 3, 4, '#9ca3af', 5, 1, scale);
    P(ctx, 4, 5, '#9ca3af', 4, 1, scale);
    P(ctx, 5, 6, '#9ca3af', 3, 1, scale);
    P(ctx, 6, 7, '#6b7280', 2, 1, scale);
    // Handle
    P(ctx, 7, 8, '#78350f', 2, 6, scale);
    // Arc effect
    P(ctx, 1, 5, '#ef4444', 1, 3, scale);
    P(ctx, 9, 2, '#ef4444', 1, 3, scale);
    P(ctx, 10, 4, '#ef4444', 1, 2, scale);
  },

  shield_bash: (ctx, scale) => {
    // Shield
    P(ctx, 3, 2, '#3b82f6', 8, 10, scale);
    P(ctx, 4, 3, '#60a5fa', 6, 8, scale);
    P(ctx, 6, 5, '#fbbf24', 2, 4, scale);
    // Impact
    P(ctx, 11, 4, '#fbbf24', 2, 1, scale);
    P(ctx, 12, 6, '#fbbf24', 2, 1, scale);
    P(ctx, 11, 8, '#fbbf24', 2, 1, scale);
  },

  taunt: (ctx, scale) => {
    // Angry face
    P(ctx, 3, 3, '#ef4444', 10, 10, scale);
    P(ctx, 4, 4, '#fca5a5', 8, 8, scale);
    // Angry eyebrows
    P(ctx, 4, 5, '#1f2937', 3, 1, scale);
    P(ctx, 9, 5, '#1f2937', 3, 1, scale);
    // Eyes
    P(ctx, 5, 6, '#1f2937', 2, 2, scale);
    P(ctx, 9, 6, '#1f2937', 2, 2, scale);
    // Mouth
    P(ctx, 6, 9, '#1f2937', 4, 2, scale);
  },

  // === MAGIC SKILLS ===
  fireball: (ctx, scale) => {
    // Flame core
    P(ctx, 6, 4, '#ef4444', 4, 6, scale);
    P(ctx, 5, 6, '#ef4444', 6, 4, scale);
    // Inner flame
    P(ctx, 7, 6, '#fbbf24', 2, 4, scale);
    P(ctx, 6, 7, '#f97316', 4, 2, scale);
    // Outer flames
    P(ctx, 5, 3, '#f97316', 2, 2, scale);
    P(ctx, 9, 3, '#f97316', 2, 2, scale);
    P(ctx, 4, 5, '#f97316', 1, 3, scale);
    P(ctx, 11, 5, '#f97316', 1, 3, scale);
    // Trail
    P(ctx, 6, 11, '#fbbf24', 4, 2, scale);
    P(ctx, 7, 13, '#f97316', 2, 1, scale);
  },

  frost_nova: (ctx, scale) => {
    // Center crystal
    P(ctx, 6, 5, '#06b6d4', 4, 6, scale);
    P(ctx, 7, 4, '#22d3ee', 2, 1, scale);
    P(ctx, 7, 11, '#22d3ee', 2, 1, scale);
    // Ice spikes
    P(ctx, 3, 7, '#67e8f9', 3, 2, scale);
    P(ctx, 10, 7, '#67e8f9', 3, 2, scale);
    P(ctx, 7, 2, '#67e8f9', 2, 3, scale);
    P(ctx, 4, 4, '#a5f3fc', 2, 2, scale);
    P(ctx, 10, 4, '#a5f3fc', 2, 2, scale);
    P(ctx, 4, 10, '#a5f3fc', 2, 2, scale);
    P(ctx, 10, 10, '#a5f3fc', 2, 2, scale);
  },

  meteor: (ctx, scale) => {
    // Meteor body
    P(ctx, 8, 2, '#78350f', 5, 5, scale);
    P(ctx, 9, 3, '#92400e', 3, 3, scale);
    // Fire trail
    P(ctx, 5, 5, '#ef4444', 3, 2, scale);
    P(ctx, 3, 6, '#f97316', 3, 2, scale);
    P(ctx, 1, 7, '#fbbf24', 3, 2, scale);
    P(ctx, 6, 7, '#ef4444', 2, 2, scale);
    // Impact zone
    P(ctx, 9, 10, '#dc2626', 4, 3, scale);
    P(ctx, 10, 11, '#fbbf24', 2, 2, scale);
  },

  lightning_bolt: (ctx, scale) => {
    P(ctx, 8, 1, '#fbbf24', 3, 2, scale);
    P(ctx, 6, 3, '#fbbf24', 4, 2, scale);
    P(ctx, 5, 5, '#fef08a', 5, 2, scale);
    P(ctx, 7, 7, '#fbbf24', 3, 2, scale);
    P(ctx, 6, 9, '#fef08a', 4, 2, scale);
    P(ctx, 4, 11, '#fbbf24', 4, 2, scale);
    P(ctx, 3, 13, '#fbbf24', 3, 2, scale);
  },

  chain_lightning: (ctx, scale) => {
    P(ctx, 2, 2, '#fbbf24', 2, 3, scale);
    P(ctx, 4, 4, '#fef08a', 2, 2, scale);
    P(ctx, 6, 5, '#fbbf24', 2, 2, scale);
    P(ctx, 8, 6, '#fef08a', 2, 2, scale);
    P(ctx, 10, 7, '#fbbf24', 2, 2, scale);
    P(ctx, 12, 8, '#fbbf24', 2, 3, scale);
    // Branch
    P(ctx, 6, 8, '#fbbf24', 2, 2, scale);
    P(ctx, 4, 10, '#fef08a', 2, 2, scale);
    P(ctx, 2, 12, '#fbbf24', 2, 2, scale);
  },

  inferno: (ctx, scale) => {
    // Central inferno
    P(ctx, 5, 3, '#dc2626', 6, 10, scale);
    P(ctx, 6, 4, '#ef4444', 4, 8, scale);
    P(ctx, 7, 5, '#fbbf24', 2, 6, scale);
    // Side flames
    P(ctx, 2, 5, '#f97316', 3, 6, scale);
    P(ctx, 11, 5, '#f97316', 3, 6, scale);
    P(ctx, 3, 3, '#ef4444', 2, 3, scale);
    P(ctx, 11, 3, '#ef4444', 2, 3, scale);
    // Top flames
    P(ctx, 6, 1, '#fbbf24', 1, 2, scale);
    P(ctx, 8, 1, '#f97316', 2, 2, scale);
  },

  // === ROGUE SKILLS ===
  backstab: (ctx, scale) => {
    // Dagger
    P(ctx, 7, 1, '#9ca3af', 2, 4, scale);
    P(ctx, 6, 5, '#78350f', 4, 2, scale);
    P(ctx, 7, 7, '#78350f', 2, 2, scale);
    // Shadow figure
    P(ctx, 2, 6, '#1f2937', 4, 6, scale);
    P(ctx, 3, 4, '#1f2937', 2, 2, scale);
    // Blood
    P(ctx, 10, 8, '#dc2626', 2, 2, scale);
    P(ctx, 11, 10, '#dc2626', 2, 2, scale);
  },

  smoke_bomb: (ctx, scale) => {
    // Smoke cloud
    P(ctx, 3, 4, '#6b7280', 10, 8, scale);
    P(ctx, 4, 3, '#9ca3af', 8, 1, scale);
    P(ctx, 5, 2, '#9ca3af', 6, 1, scale);
    P(ctx, 2, 6, '#9ca3af', 2, 4, scale);
    P(ctx, 12, 6, '#9ca3af', 2, 4, scale);
    // Bomb
    P(ctx, 6, 10, '#1f2937', 4, 3, scale);
    P(ctx, 7, 9, '#78350f', 2, 1, scale);
  },

  fan_of_knives: (ctx, scale) => {
    // Multiple knives
    P(ctx, 7, 2, '#9ca3af', 2, 5, scale);
    P(ctx, 3, 4, '#9ca3af', 4, 1, scale);
    P(ctx, 2, 5, '#9ca3af', 3, 1, scale);
    P(ctx, 9, 4, '#9ca3af', 4, 1, scale);
    P(ctx, 11, 5, '#9ca3af', 3, 1, scale);
    P(ctx, 4, 7, '#9ca3af', 3, 1, scale);
    P(ctx, 9, 7, '#9ca3af', 3, 1, scale);
    // Center
    P(ctx, 6, 8, '#1f2937', 4, 4, scale);
  },

  assassinate: (ctx, scale) => {
    // Skull
    P(ctx, 4, 2, '#e5e7eb', 8, 7, scale);
    P(ctx, 5, 3, '#1f2937', 2, 3, scale);
    P(ctx, 9, 3, '#1f2937', 2, 3, scale);
    P(ctx, 6, 7, '#1f2937', 4, 1, scale);
    // Crossed daggers
    P(ctx, 2, 9, '#9ca3af', 5, 1, scale);
    P(ctx, 9, 9, '#9ca3af', 5, 1, scale);
    P(ctx, 1, 10, '#9ca3af', 3, 1, scale);
    P(ctx, 12, 10, '#9ca3af', 3, 1, scale);
    P(ctx, 6, 11, '#dc2626', 4, 1, scale);
  },

  deadly_poison: (ctx, scale) => {
    // Poison bottle
    P(ctx, 5, 2, '#78350f', 6, 2, scale);
    P(ctx, 6, 1, '#78350f', 4, 1, scale);
    P(ctx, 4, 4, '#22c55e', 8, 8, scale);
    P(ctx, 5, 5, '#4ade80', 6, 6, scale);
    // Skull symbol
    P(ctx, 6, 6, '#1f2937', 4, 3, scale);
    P(ctx, 7, 7, '#22c55e', 1, 1, scale);
    P(ctx, 9, 7, '#22c55e', 1, 1, scale);
    // Drips
    P(ctx, 4, 12, '#22c55e', 2, 2, scale);
    P(ctx, 10, 12, '#22c55e', 2, 2, scale);
  },

  // === HEALER SKILLS ===
  heal: (ctx, scale) => {
    // Heart
    P(ctx, 3, 4, '#22c55e', 4, 4, scale);
    P(ctx, 9, 4, '#22c55e', 4, 4, scale);
    P(ctx, 4, 3, '#22c55e', 2, 1, scale);
    P(ctx, 10, 3, '#22c55e', 2, 1, scale);
    P(ctx, 3, 8, '#22c55e', 10, 2, scale);
    P(ctx, 4, 10, '#22c55e', 8, 2, scale);
    P(ctx, 5, 12, '#22c55e', 6, 1, scale);
    P(ctx, 6, 13, '#22c55e', 4, 1, scale);
    P(ctx, 7, 14, '#22c55e', 2, 1, scale);
    // Glow
    P(ctx, 7, 6, '#4ade80', 2, 4, scale);
    P(ctx, 6, 7, '#4ade80', 4, 2, scale);
  },

  revitalize: (ctx, scale) => {
    // Multiple hearts
    P(ctx, 2, 3, '#f472b6', 3, 3, scale);
    P(ctx, 3, 2, '#f472b6', 1, 1, scale);
    P(ctx, 2, 6, '#f472b6', 3, 2, scale);
    P(ctx, 3, 8, '#f472b6', 1, 1, scale);
    // Main heart
    P(ctx, 6, 5, '#22c55e', 4, 4, scale);
    P(ctx, 7, 4, '#22c55e', 2, 1, scale);
    P(ctx, 6, 9, '#22c55e', 4, 2, scale);
    P(ctx, 7, 11, '#22c55e', 2, 1, scale);
    // Sparkles
    P(ctx, 11, 3, '#fbbf24', 2, 2, scale);
    P(ctx, 12, 7, '#fbbf24', 2, 2, scale);
    P(ctx, 10, 11, '#fbbf24', 2, 2, scale);
  },

  divine_shield: (ctx, scale) => {
    // Shield
    P(ctx, 3, 2, '#3b82f6', 10, 11, scale);
    P(ctx, 4, 3, '#60a5fa', 8, 9, scale);
    // Cross
    P(ctx, 7, 4, '#fbbf24', 2, 7, scale);
    P(ctx, 5, 6, '#fbbf24', 6, 2, scale);
    // Glow
    P(ctx, 4, 13, '#93c5fd', 2, 1, scale);
    P(ctx, 10, 13, '#93c5fd', 2, 1, scale);
  },

  smite: (ctx, scale) => {
    // Holy light beam
    P(ctx, 6, 1, '#fef08a', 4, 3, scale);
    P(ctx, 5, 4, '#fbbf24', 6, 4, scale);
    P(ctx, 4, 8, '#f59e0b', 8, 3, scale);
    // Impact
    P(ctx, 3, 11, '#fbbf24', 10, 2, scale);
    P(ctx, 5, 13, '#fef08a', 6, 1, scale);
    // Side rays
    P(ctx, 2, 6, '#fef08a', 2, 1, scale);
    P(ctx, 12, 6, '#fef08a', 2, 1, scale);
  },

  holy_nova: (ctx, scale) => {
    // Central burst
    P(ctx, 6, 6, '#fef08a', 4, 4, scale);
    // Rays
    P(ctx, 7, 2, '#fbbf24', 2, 4, scale);
    P(ctx, 7, 10, '#fbbf24', 2, 4, scale);
    P(ctx, 2, 7, '#fbbf24', 4, 2, scale);
    P(ctx, 10, 7, '#fbbf24', 4, 2, scale);
    // Diagonal rays
    P(ctx, 3, 3, '#f59e0b', 3, 3, scale);
    P(ctx, 10, 3, '#f59e0b', 3, 3, scale);
    P(ctx, 3, 10, '#f59e0b', 3, 3, scale);
    P(ctx, 10, 10, '#f59e0b', 3, 3, scale);
  },

  resurrection: (ctx, scale) => {
    // Angel wings
    P(ctx, 1, 4, '#e5e7eb', 3, 6, scale);
    P(ctx, 12, 4, '#e5e7eb', 3, 6, scale);
    P(ctx, 2, 3, '#d1d5db', 2, 2, scale);
    P(ctx, 12, 3, '#d1d5db', 2, 2, scale);
    // Figure
    P(ctx, 6, 2, '#fef08a', 4, 4, scale);
    P(ctx, 5, 6, '#fbbf24', 6, 6, scale);
    // Halo
    P(ctx, 6, 0, '#fbbf24', 4, 1, scale);
    P(ctx, 5, 1, '#fef08a', 1, 1, scale);
    P(ctx, 10, 1, '#fef08a', 1, 1, scale);
    // Rising effect
    P(ctx, 4, 12, '#a5f3fc', 2, 2, scale);
    P(ctx, 10, 12, '#a5f3fc', 2, 2, scale);
  },

  // === RANGER SKILLS ===
  aimed_shot: (ctx, scale) => {
    // Target reticle
    P(ctx, 5, 5, '#ef4444', 6, 6, scale);
    P(ctx, 6, 6, '#1f2937', 4, 4, scale);
    P(ctx, 7, 7, '#ef4444', 2, 2, scale);
    // Crosshairs
    P(ctx, 7, 2, '#ef4444', 2, 3, scale);
    P(ctx, 7, 11, '#ef4444', 2, 3, scale);
    P(ctx, 2, 7, '#ef4444', 3, 2, scale);
    P(ctx, 11, 7, '#ef4444', 3, 2, scale);
    // Arrow
    P(ctx, 12, 3, '#78350f', 2, 1, scale);
    P(ctx, 13, 2, '#78350f', 1, 3, scale);
  },

  multishot: (ctx, scale) => {
    // Multiple arrows
    P(ctx, 2, 4, '#78350f', 8, 1, scale);
    P(ctx, 1, 3, '#9ca3af', 2, 3, scale);
    P(ctx, 2, 7, '#78350f', 8, 1, scale);
    P(ctx, 1, 6, '#9ca3af', 2, 3, scale);
    P(ctx, 2, 10, '#78350f', 8, 1, scale);
    P(ctx, 1, 9, '#9ca3af', 2, 3, scale);
    // Fletching
    P(ctx, 9, 3, '#dc2626', 3, 1, scale);
    P(ctx, 9, 5, '#dc2626', 3, 1, scale);
    P(ctx, 9, 6, '#dc2626', 3, 1, scale);
    P(ctx, 9, 8, '#dc2626', 3, 1, scale);
    P(ctx, 9, 9, '#dc2626', 3, 1, scale);
    P(ctx, 9, 11, '#dc2626', 3, 1, scale);
  },

  trap: (ctx, scale) => {
    // Bear trap
    P(ctx, 2, 8, '#78716c', 12, 2, scale);
    P(ctx, 3, 6, '#9ca3af', 2, 2, scale);
    P(ctx, 5, 5, '#9ca3af', 2, 3, scale);
    P(ctx, 7, 4, '#9ca3af', 2, 4, scale);
    P(ctx, 9, 5, '#9ca3af', 2, 3, scale);
    P(ctx, 11, 6, '#9ca3af', 2, 2, scale);
    // Teeth
    P(ctx, 4, 7, '#ef4444', 1, 2, scale);
    P(ctx, 6, 7, '#ef4444', 1, 2, scale);
    P(ctx, 8, 7, '#ef4444', 1, 2, scale);
    P(ctx, 10, 7, '#ef4444', 1, 2, scale);
    // Chain
    P(ctx, 6, 10, '#78716c', 4, 1, scale);
    P(ctx, 7, 11, '#57534e', 2, 2, scale);
  },

  rapid_fire: (ctx, scale) => {
    // Speed lines
    P(ctx, 1, 4, '#fbbf24', 4, 1, scale);
    P(ctx, 1, 7, '#fbbf24', 3, 1, scale);
    P(ctx, 1, 10, '#fbbf24', 4, 1, scale);
    // Arrows
    P(ctx, 5, 3, '#78350f', 6, 1, scale);
    P(ctx, 4, 2, '#9ca3af', 2, 3, scale);
    P(ctx, 5, 6, '#78350f', 7, 1, scale);
    P(ctx, 4, 5, '#9ca3af', 2, 3, scale);
    P(ctx, 5, 9, '#78350f', 6, 1, scale);
    P(ctx, 4, 8, '#9ca3af', 2, 3, scale);
    // Bow
    P(ctx, 12, 4, '#78350f', 2, 6, scale);
  },

  volley: (ctx, scale) => {
    // Rain of arrows
    P(ctx, 2, 1, '#78350f', 1, 4, scale);
    P(ctx, 5, 2, '#78350f', 1, 4, scale);
    P(ctx, 8, 1, '#78350f', 1, 4, scale);
    P(ctx, 11, 2, '#78350f', 1, 4, scale);
    P(ctx, 3, 5, '#78350f', 1, 4, scale);
    P(ctx, 6, 6, '#78350f', 1, 4, scale);
    P(ctx, 9, 5, '#78350f', 1, 4, scale);
    P(ctx, 12, 6, '#78350f', 1, 4, scale);
    // Arrowheads
    P(ctx, 1, 5, '#9ca3af', 3, 1, scale);
    P(ctx, 4, 6, '#9ca3af', 3, 1, scale);
    P(ctx, 7, 5, '#9ca3af', 3, 1, scale);
    P(ctx, 10, 6, '#9ca3af', 3, 1, scale);
    // Ground impact
    P(ctx, 2, 12, '#78716c', 12, 2, scale);
  },

  // === NECROMANCER SKILLS ===
  drain_life: (ctx, scale) => {
    // Dark energy stream
    P(ctx, 2, 6, '#7f1d1d', 3, 3, scale);
    P(ctx, 5, 7, '#dc2626', 3, 2, scale);
    P(ctx, 8, 6, '#dc2626', 3, 3, scale);
    P(ctx, 11, 6, '#ef4444', 3, 3, scale);
    // Source (victim)
    P(ctx, 12, 3, '#e5e7eb', 3, 3, scale);
    // Destination (caster)
    P(ctx, 1, 3, '#581c87', 3, 3, scale);
    // Blood drops
    P(ctx, 6, 10, '#dc2626', 2, 2, scale);
    P(ctx, 9, 11, '#dc2626', 2, 2, scale);
  },

  corpse_explosion: (ctx, scale) => {
    // Explosion
    P(ctx, 5, 4, '#dc2626', 6, 6, scale);
    P(ctx, 6, 5, '#f97316', 4, 4, scale);
    P(ctx, 7, 6, '#fbbf24', 2, 2, scale);
    // Debris
    P(ctx, 2, 3, '#e5e7eb', 2, 2, scale);
    P(ctx, 12, 3, '#e5e7eb', 2, 2, scale);
    P(ctx, 2, 11, '#e5e7eb', 2, 2, scale);
    P(ctx, 12, 11, '#e5e7eb', 2, 2, scale);
    P(ctx, 4, 1, '#d1d5db', 2, 2, scale);
    P(ctx, 10, 1, '#d1d5db', 2, 2, scale);
  },

  plague: (ctx, scale) => {
    // Plague cloud
    P(ctx, 3, 4, '#22c55e', 10, 8, scale);
    P(ctx, 4, 3, '#4ade80', 8, 1, scale);
    P(ctx, 5, 2, '#4ade80', 6, 1, scale);
    // Skulls
    P(ctx, 4, 6, '#e5e7eb', 3, 3, scale);
    P(ctx, 5, 7, '#1f2937', 1, 1, scale);
    P(ctx, 9, 6, '#e5e7eb', 3, 3, scale);
    P(ctx, 10, 7, '#1f2937', 1, 1, scale);
    // Drips
    P(ctx, 3, 12, '#22c55e', 2, 2, scale);
    P(ctx, 7, 12, '#22c55e', 2, 3, scale);
    P(ctx, 11, 12, '#22c55e', 2, 2, scale);
  },

  lich_form: (ctx, scale) => {
    // Skull
    P(ctx, 4, 2, '#e5e7eb', 8, 6, scale);
    P(ctx, 5, 3, '#a855f7', 2, 2, scale);
    P(ctx, 9, 3, '#a855f7', 2, 2, scale);
    P(ctx, 6, 6, '#1f2937', 4, 1, scale);
    // Crown
    P(ctx, 4, 0, '#fbbf24', 8, 2, scale);
    // Robe
    P(ctx, 3, 8, '#581c87', 10, 6, scale);
    P(ctx, 4, 9, '#7c3aed', 8, 4, scale);
  },

  // === DRUID/SHAMAN SKILLS ===
  rejuvenation: (ctx, scale) => {
    // Leaf
    P(ctx, 4, 3, '#22c55e', 8, 8, scale);
    P(ctx, 5, 4, '#4ade80', 6, 6, scale);
    // Vein
    P(ctx, 7, 4, '#16a34a', 2, 6, scale);
    P(ctx, 5, 6, '#16a34a', 6, 2, scale);
    // Sparkles
    P(ctx, 2, 2, '#fef08a', 2, 2, scale);
    P(ctx, 12, 2, '#fef08a', 2, 2, scale);
    P(ctx, 2, 11, '#fef08a', 2, 2, scale);
    P(ctx, 12, 11, '#fef08a', 2, 2, scale);
  },

  wild_growth: (ctx, scale) => {
    // Tree
    P(ctx, 5, 2, '#22c55e', 6, 8, scale);
    P(ctx, 4, 4, '#4ade80', 8, 4, scale);
    P(ctx, 3, 6, '#22c55e', 10, 2, scale);
    // Trunk
    P(ctx, 7, 10, '#78350f', 2, 4, scale);
    // Roots
    P(ctx, 5, 13, '#78350f', 2, 1, scale);
    P(ctx, 9, 13, '#78350f', 2, 1, scale);
    // Growth sparkles
    P(ctx, 2, 3, '#fbbf24', 2, 2, scale);
    P(ctx, 12, 3, '#fbbf24', 2, 2, scale);
  },

  tree_of_life: (ctx, scale) => {
    // Large tree
    P(ctx, 4, 1, '#22c55e', 8, 9, scale);
    P(ctx, 3, 3, '#4ade80', 10, 5, scale);
    P(ctx, 5, 2, '#86efac', 6, 2, scale);
    // Trunk
    P(ctx, 6, 10, '#78350f', 4, 5, scale);
    // Healing aura
    P(ctx, 2, 5, '#fef08a', 2, 3, scale);
    P(ctx, 12, 5, '#fef08a', 2, 3, scale);
    // Roots
    P(ctx, 4, 14, '#78350f', 2, 1, scale);
    P(ctx, 10, 14, '#78350f', 2, 1, scale);
  },

  spirit_link: (ctx, scale) => {
    // Spirits
    P(ctx, 2, 4, '#a5b4fc', 4, 5, scale);
    P(ctx, 3, 3, '#c7d2fe', 2, 1, scale);
    P(ctx, 10, 4, '#a5b4fc', 4, 5, scale);
    P(ctx, 11, 3, '#c7d2fe', 2, 1, scale);
    // Link chain
    P(ctx, 6, 5, '#fbbf24', 4, 2, scale);
    P(ctx, 7, 7, '#fbbf24', 2, 2, scale);
    // Eyes
    P(ctx, 3, 5, '#1f2937', 1, 1, scale);
    P(ctx, 11, 5, '#1f2937', 1, 1, scale);
  },

  bloodlust: (ctx, scale) => {
    // Blood drops
    P(ctx, 3, 3, '#dc2626', 3, 4, scale);
    P(ctx, 4, 2, '#dc2626', 1, 1, scale);
    P(ctx, 7, 4, '#dc2626', 3, 5, scale);
    P(ctx, 8, 3, '#dc2626', 1, 1, scale);
    P(ctx, 11, 5, '#dc2626', 3, 4, scale);
    P(ctx, 12, 4, '#dc2626', 1, 1, scale);
    // Energy effect
    P(ctx, 2, 10, '#f97316', 12, 2, scale);
    P(ctx, 4, 12, '#fbbf24', 8, 1, scale);
    P(ctx, 6, 13, '#fef08a', 4, 1, scale);
  },

  // === PASSIVE ICONS ===
  fortitude: (ctx, scale) => {
    // Heart with armor
    P(ctx, 3, 4, '#ef4444', 4, 4, scale);
    P(ctx, 9, 4, '#ef4444', 4, 4, scale);
    P(ctx, 4, 3, '#ef4444', 2, 1, scale);
    P(ctx, 10, 3, '#ef4444', 2, 1, scale);
    P(ctx, 3, 8, '#ef4444', 10, 2, scale);
    P(ctx, 4, 10, '#ef4444', 8, 2, scale);
    P(ctx, 6, 12, '#ef4444', 4, 1, scale);
    P(ctx, 7, 13, '#ef4444', 2, 1, scale);
    // Armor plate
    P(ctx, 6, 5, '#9ca3af', 4, 4, scale);
    P(ctx, 7, 6, '#d1d5db', 2, 2, scale);
  },

  precision: (ctx, scale) => {
    // Target
    P(ctx, 3, 3, '#ef4444', 10, 10, scale);
    P(ctx, 4, 4, '#1f2937', 8, 8, scale);
    P(ctx, 5, 5, '#ef4444', 6, 6, scale);
    P(ctx, 6, 6, '#1f2937', 4, 4, scale);
    P(ctx, 7, 7, '#fbbf24', 2, 2, scale);
  },

  spell_mastery: (ctx, scale) => {
    // Open book
    P(ctx, 2, 4, '#fef3c7', 6, 8, scale);
    P(ctx, 8, 4, '#fef3c7', 6, 8, scale);
    P(ctx, 7, 3, '#78350f', 2, 10, scale);
    // Text lines
    P(ctx, 3, 5, '#374151', 4, 1, scale);
    P(ctx, 3, 7, '#374151', 4, 1, scale);
    P(ctx, 3, 9, '#374151', 4, 1, scale);
    P(ctx, 9, 5, '#374151', 4, 1, scale);
    P(ctx, 9, 7, '#374151', 4, 1, scale);
    P(ctx, 9, 9, '#374151', 4, 1, scale);
    // Magic glow
    P(ctx, 6, 1, '#a855f7', 4, 2, scale);
  },
};

// Mapping from skill IDs to icon drawer keys
const SKILL_ICON_MAP = {
  // Warrior
  warrior_fortitude: 'fortitude',
  warrior_power_strike: 'power_strike',
  warrior_thick_skin: 'divine_shield',
  warrior_shield_bash: 'shield_bash',
  warrior_cleave: 'cleave',
  warrior_iron_will: 'fortitude',
  warrior_taunt: 'taunt',
  warrior_bloodlust: 'bloodlust',
  warrior_veteran: 'fortitude',
  warrior_last_stand: 'fortitude',

  // Mage
  mage_arcane_mind: 'spell_mastery',
  mage_fireball: 'fireball',
  mage_glass_cannon: 'fireball',
  mage_frost_nova: 'frost_nova',
  mage_meteor: 'meteor',
  mage_mana_shield: 'divine_shield',
  mage_chain_lightning: 'chain_lightning',
  mage_spell_mastery: 'spell_mastery',
  mage_arcane_barrier: 'divine_shield',
  mage_inferno: 'inferno',

  // Rogue
  rogue_quick_feet: 'rapid_fire',
  rogue_backstab: 'backstab',
  rogue_precision: 'precision',
  rogue_smoke_bomb: 'smoke_bomb',
  rogue_fan_of_knives: 'fan_of_knives',
  rogue_opportunist: 'precision',
  rogue_assassinate: 'assassinate',
  rogue_shadow_dance: 'smoke_bomb',
  rogue_deadly_poison: 'deadly_poison',
  rogue_death_blossom: 'fan_of_knives',

  // Cleric
  cleric_blessed: 'heal',
  cleric_heal: 'heal',
  cleric_holy_aura: 'holy_nova',
  cleric_smite: 'smite',
  cleric_revitalize: 'revitalize',
  cleric_divine_shield: 'divine_shield',
  cleric_holy_nova: 'holy_nova',
  cleric_sanctuary: 'divine_shield',
  cleric_martyr: 'heal',
  cleric_resurrection: 'resurrection',

  // Ranger
  ranger_eagle_eye: 'precision',
  ranger_aimed_shot: 'aimed_shot',
  ranger_swift_quiver: 'rapid_fire',
  ranger_multishot: 'multishot',
  ranger_trap: 'trap',
  ranger_evasive_maneuvers: 'smoke_bomb',
  ranger_piercing_arrow: 'aimed_shot',
  ranger_rapid_fire: 'rapid_fire',
  ranger_hunters_mark: 'precision',
  ranger_volley: 'volley',

  // Necromancer
  necromancer_dark_pact: 'drain_life',
  necromancer_drain_life: 'drain_life',
  necromancer_bone_armor: 'divine_shield',
  necromancer_corpse_explosion: 'corpse_explosion',
  necromancer_curse_of_weakness: 'plague',
  necromancer_soul_harvest: 'drain_life',
  necromancer_life_tap: 'drain_life',
  necromancer_plague: 'plague',
  necromancer_death_coil: 'drain_life',
  necromancer_lich_form: 'lich_form',

  // Paladin
  paladin_holy_strength: 'fortitude',
  paladin_divine_shield: 'divine_shield',
  paladin_blessed_armor: 'divine_shield',
  paladin_consecration: 'holy_nova',
  paladin_lay_on_hands: 'heal',
  paladin_aura_of_protection: 'divine_shield',
  paladin_judgment: 'smite',
  paladin_righteous_fury: 'fireball',
  paladin_bulwark: 'divine_shield',
  paladin_divine_intervention: 'resurrection',

  // Knight
  knight_heavy_armor: 'divine_shield',
  knight_shield_bash: 'shield_bash',
  knight_constitution: 'fortitude',
  knight_wall_of_steel: 'divine_shield',
  knight_aggro: 'taunt',
  knight_vitality: 'fortitude',
  knight_shield_wall: 'divine_shield',
  knight_punish: 'power_strike',
  knight_stalwart: 'fortitude',
  knight_unbreakable: 'divine_shield',

  // Druid
  druid_natural_healing: 'rejuvenation',
  druid_rejuvenation: 'rejuvenation',
  druid_thorns: 'deadly_poison',
  druid_regrowth: 'rejuvenation',
  druid_wild_growth: 'wild_growth',
  druid_wrath: 'lightning_bolt',
  druid_natures_swiftness: 'rapid_fire',
  druid_lifebloom: 'rejuvenation',
  druid_barkskin: 'divine_shield',
  druid_tree_of_life: 'tree_of_life',

  // Shaman
  shaman_ancestral_power: 'spirit_link',
  shaman_spirit_link: 'spirit_link',
  shaman_elemental_focus: 'lightning_bolt',
  shaman_lightning_bolt: 'lightning_bolt',
  shaman_healing_stream: 'rejuvenation',
  shaman_wind_fury: 'rapid_fire',
  shaman_chain_lightning: 'chain_lightning',
  shaman_mana_tide: 'frost_nova',
  shaman_totemic_power: 'spirit_link',
  shaman_bloodlust: 'bloodlust',
};

// Get or create cached icon canvas
function getSkillIconCanvas(skillId, size) {
  const iconKey = SKILL_ICON_MAP[skillId] || 'power_strike';
  const cacheKey = `${iconKey}_${size}`;

  if (skillIconCache.has(cacheKey)) {
    return skillIconCache.get(cacheKey);
  }

  // Create offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Scale factor (icons are 16x16)
  const scale = size / 16;

  // Draw the icon
  const drawer = SKILL_ICON_DRAWERS[iconKey];
  if (drawer) {
    drawer(ctx, scale);
  } else {
    // Fallback to power_strike
    SKILL_ICON_DRAWERS.power_strike(ctx, scale);
  }

  skillIconCache.set(cacheKey, canvas);
  return canvas;
}

// Draw skill icon at position
export function drawSkillIcon(ctx, skillId, x, y, size) {
  const iconCanvas = getSkillIconCanvas(skillId, size);
  ctx.drawImage(iconCanvas, x, y);
}

// Clear cache (call if memory becomes an issue)
export function clearSkillIconCache() {
  skillIconCache.clear();
}
