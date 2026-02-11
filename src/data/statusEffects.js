// Status effect definitions for combat system

export const STATUS_TYPE = {
  DOT: 'dot',           // Damage over time
  CONTROL: 'control',   // Prevents/limits actions
  DEBUFF: 'debuff',     // Reduces stats
  BUFF: 'buff',         // Increases stats
};

export const STATUS_EFFECTS = {
  // === DAMAGE OVER TIME ===
  poison: {
    id: 'poison',
    name: 'Poison',
    emoji: '🟢',
    type: STATUS_TYPE.DOT,
    description: 'Takes poison damage each turn',
    color: '#22c55e',
    stackable: true,
    maxStacks: 5,
    duration: 3,
    tickDamage: (sourceAttack, stacks) => Math.floor(sourceAttack * 0.1 * stacks),
  },
  burn: {
    id: 'burn',
    name: 'Burn',
    emoji: '🔥',
    type: STATUS_TYPE.DOT,
    description: 'Takes fire damage each turn',
    color: '#ef4444',
    stackable: true,
    maxStacks: 3,
    duration: 2,
    tickDamage: (sourceAttack, stacks) => Math.floor(sourceAttack * 0.15 * stacks),
  },
  bleed: {
    id: 'bleed',
    name: 'Bleed',
    emoji: '🩸',
    type: STATUS_TYPE.DOT,
    description: 'Bleeds out, worse when moving',
    color: '#dc2626',
    stackable: true,
    maxStacks: 3,
    duration: 4,
    tickDamage: (sourceAttack, stacks, context = {}) => {
      const movePenalty = context.movedLastTurn ? 2 : 1;
      return Math.floor(sourceAttack * 0.08 * stacks * movePenalty);
    },
  },

  // === CONTROL EFFECTS ===
  stun: {
    id: 'stun',
    name: 'Stun',
    emoji: '💫',
    type: STATUS_TYPE.CONTROL,
    description: 'Cannot act this turn',
    color: '#fbbf24',
    stackable: false,
    duration: 1,
    skipTurn: true,
    diminishing: true, // Each application on same target is less effective
  },
  slow: {
    id: 'slow',
    name: 'Slow',
    emoji: '🐌',
    type: STATUS_TYPE.CONTROL,
    description: 'Movement and speed reduced by 50%',
    color: '#3b82f6',
    stackable: false,
    duration: 2,
    speedReduction: 0.5,
  },
  freeze: {
    id: 'freeze',
    name: 'Freeze',
    emoji: '❄️',
    type: STATUS_TYPE.CONTROL,
    description: 'Frozen solid, +50% damage taken',
    color: '#06b6d4',
    stackable: false,
    duration: 1,
    skipTurn: true,
    damageTakenMultiplier: 1.5,
    breaksOnDamage: true, // Removed when taking damage
  },
  root: {
    id: 'root',
    name: 'Root',
    emoji: '🌿',
    type: STATUS_TYPE.CONTROL,
    description: 'Cannot move but can still attack',
    color: '#16a34a',
    stackable: false,
    duration: 2,
    preventMovement: true,
  },

  // === DEBUFFS ===
  weakness: {
    id: 'weakness',
    name: 'Weakness',
    emoji: '😵',
    type: STATUS_TYPE.DEBUFF,
    description: 'Attack reduced by 30%',
    color: '#9ca3af',
    stackable: false,
    duration: 3,
    attackReduction: 0.3,
  },
  vulnerable: {
    id: 'vulnerable',
    name: 'Vulnerable',
    emoji: '🎯',
    type: STATUS_TYPE.DEBUFF,
    description: 'Takes 25% more damage',
    color: '#f97316',
    stackable: false,
    duration: 3,
    damageTakenMultiplier: 1.25,
  },
  blind: {
    id: 'blind',
    name: 'Blind',
    emoji: '🌑',
    type: STATUS_TYPE.DEBUFF,
    description: '50% chance to miss attacks',
    color: '#1f2937',
    stackable: false,
    duration: 2,
    missChance: 0.5,
  },
  cursed: {
    id: 'cursed',
    name: 'Cursed',
    emoji: '💜',
    type: STATUS_TYPE.DEBUFF,
    description: 'Healing received reduced by 50%',
    color: '#7c3aed',
    stackable: false,
    duration: 3,
    healingReduction: 0.5,
  },

  // === BUFFS ===
  regeneration: {
    id: 'regeneration',
    name: 'Regeneration',
    emoji: '💚',
    type: STATUS_TYPE.BUFF,
    description: 'Heals 5% max HP per turn',
    color: '#22c55e',
    stackable: false,
    duration: 3,
    tickHeal: (maxHp) => Math.floor(maxHp * 0.05),
  },
  fortify: {
    id: 'fortify',
    name: 'Fortify',
    emoji: '🛡️',
    type: STATUS_TYPE.BUFF,
    description: 'Damage taken reduced by 25%',
    color: '#6366f1',
    stackable: false,
    duration: 3,
    damageReduction: 0.25,
  },
  haste: {
    id: 'haste',
    name: 'Haste',
    emoji: '⚡',
    type: STATUS_TYPE.BUFF,
    description: 'Speed increased by 50%',
    color: '#eab308',
    stackable: false,
    duration: 3,
    speedMultiplier: 1.5,
  },
  might: {
    id: 'might',
    name: 'Might',
    emoji: '💪',
    type: STATUS_TYPE.BUFF,
    description: 'Attack increased by 25%',
    color: '#ef4444',
    stackable: false,
    duration: 3,
    attackMultiplier: 1.25,
  },
  invisible: {
    id: 'invisible',
    name: 'Invisible',
    emoji: '👻',
    type: STATUS_TYPE.BUFF,
    description: 'Cannot be targeted, breaks on attack',
    color: '#a1a1aa',
    stackable: false,
    duration: 1,
    untargetable: true,
    breaksOnAttack: true,
  },
};

// Helper to get status effect by ID
export const getStatusEffect = (id) => STATUS_EFFECTS[id];

// Get all status effects of a type
export const getStatusEffectsByType = (type) =>
  Object.values(STATUS_EFFECTS).filter(s => s.type === type);

// Check if a status effect is harmful
export const isHarmfulStatus = (id) => {
  const effect = STATUS_EFFECTS[id];
  return effect && (effect.type === STATUS_TYPE.DOT ||
                    effect.type === STATUS_TYPE.CONTROL ||
                    effect.type === STATUS_TYPE.DEBUFF);
};

// Check if a status effect is beneficial
export const isBeneficialStatus = (id) => {
  const effect = STATUS_EFFECTS[id];
  return effect && effect.type === STATUS_TYPE.BUFF;
};
