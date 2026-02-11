// Status effect processing engine
import { STATUS_EFFECTS, STATUS_TYPE, isHarmfulStatus } from '../data/statusEffects';

/**
 * Apply a status effect to a target
 * @param {Object} target - The unit receiving the effect
 * @param {string} statusId - The status effect ID
 * @param {Object} source - The unit applying the effect
 * @param {Object} options - Additional options (duration override, stacks)
 * @returns {Object} Updated status effects array and log entry
 */
export const applyStatusEffect = (target, statusId, source, options = {}) => {
  const template = STATUS_EFFECTS[statusId];
  if (!template) {
    console.warn(`Unknown status effect: ${statusId}`);
    return { effects: target.statusEffects || [], applied: false };
  }

  const currentEffects = [...(target.statusEffects || [])];
  const existingIndex = currentEffects.findIndex(e => e.id === statusId);
  const duration = options.duration || template.duration;

  // Check for diminishing returns on control effects
  if (template.diminishing && existingIndex >= 0) {
    const existing = currentEffects[existingIndex];
    const diminishCount = (existing.diminishCount || 0) + 1;

    // After 3 applications, target becomes immune for this combat
    if (diminishCount >= 3) {
      return {
        effects: currentEffects,
        applied: false,
        immune: true,
        log: {
          type: 'status_immune',
          target: { name: target.name, emoji: target.emoji },
          status: template,
        },
      };
    }

    // Reduce duration by diminish count
    const reducedDuration = Math.max(1, duration - diminishCount);
    currentEffects[existingIndex] = {
      ...existing,
      duration: reducedDuration,
      diminishCount,
    };

    return {
      effects: currentEffects,
      applied: true,
      log: {
        type: 'status_applied',
        target: { name: target.name, emoji: target.emoji },
        status: template,
        duration: reducedDuration,
        diminished: true,
      },
    };
  }

  if (existingIndex >= 0 && template.stackable) {
    // Stack the effect
    const existing = currentEffects[existingIndex];
    const newStacks = Math.min((existing.stacks || 1) + (options.stacks || 1), template.maxStacks);
    currentEffects[existingIndex] = {
      ...existing,
      stacks: newStacks,
      duration: Math.max(existing.duration, duration),
      sourceAttack: source.stats?.attack || existing.sourceAttack,
    };

    return {
      effects: currentEffects,
      applied: true,
      stacked: true,
      log: {
        type: 'status_stacked',
        target: { name: target.name, emoji: target.emoji },
        status: template,
        stacks: newStacks,
      },
    };
  } else if (existingIndex >= 0) {
    // Refresh duration for non-stackable
    currentEffects[existingIndex] = {
      ...currentEffects[existingIndex],
      duration,
    };

    return {
      effects: currentEffects,
      applied: true,
      refreshed: true,
      log: {
        type: 'status_refreshed',
        target: { name: target.name, emoji: target.emoji },
        status: template,
      },
    };
  } else {
    // Apply new effect
    currentEffects.push({
      id: statusId,
      stacks: options.stacks || 1,
      duration,
      sourceAttack: source.stats?.attack || 0,
      sourceId: source.id,
      diminishCount: 0,
    });

    return {
      effects: currentEffects,
      applied: true,
      log: {
        type: 'status_applied',
        target: { name: target.name, emoji: target.emoji },
        status: template,
        duration,
      },
    };
  }
};

/**
 * Process status effects at the start of a unit's turn
 * @param {Object} unit - The unit whose turn it is
 * @param {Object} context - Additional context (e.g., movedLastTurn)
 * @returns {Object} Results including damage, healing, and updated effects
 */
export const processStatusEffectsOnTurnStart = (unit, context = {}) => {
  const effects = unit.statusEffects || [];
  const results = {
    damage: 0,
    healing: 0,
    skipTurn: false,
    preventMovement: false,
    logs: [],
    visualEffects: [],
    updatedEffects: [],
    expiredEffects: [],
  };

  for (const effect of effects) {
    const template = STATUS_EFFECTS[effect.id];
    if (!template) continue;

    // Process DOT effects
    if (template.type === STATUS_TYPE.DOT && template.tickDamage) {
      const damage = template.tickDamage(effect.sourceAttack, effect.stacks || 1, context);
      results.damage += damage;
      results.logs.push({
        type: 'status_damage',
        target: { name: unit.name, emoji: unit.emoji },
        status: template,
        damage,
      });
      results.visualEffects.push({
        type: 'status_tick',
        position: unit.position,
        statusId: effect.id,
        damage,
      });
    }

    // Process HOT effects (buffs that heal)
    if (template.type === STATUS_TYPE.BUFF && template.tickHeal) {
      const healing = template.tickHeal(unit.stats?.maxHp || 100);
      results.healing += healing;
      results.logs.push({
        type: 'status_heal',
        target: { name: unit.name, emoji: unit.emoji },
        status: template,
        amount: healing,
      });
      results.visualEffects.push({
        type: 'healBurst',
        position: unit.position,
      });
    }

    // Check for turn skip
    if (template.skipTurn) {
      results.skipTurn = true;
      results.logs.push({
        type: 'status_skip',
        target: { name: unit.name, emoji: unit.emoji },
        status: template,
      });
    }

    // Check for movement prevention
    if (template.preventMovement) {
      results.preventMovement = true;
    }

    // Decrement duration
    const newDuration = effect.duration - 1;
    if (newDuration > 0) {
      results.updatedEffects.push({ ...effect, duration: newDuration });
    } else {
      results.expiredEffects.push(effect);
      results.logs.push({
        type: 'status_expired',
        target: { name: unit.name, emoji: unit.emoji },
        status: template,
      });
    }
  }

  return results;
};

/**
 * Get stat modifiers from active status effects
 * @param {Array} effects - Array of active status effects
 * @returns {Object} Stat modifiers to apply
 */
export const getStatusStatModifiers = (effects = []) => {
  const modifiers = {
    attackMultiplier: 1.0,
    defenseMultiplier: 1.0,
    speedMultiplier: 1.0,
    damageTakenMultiplier: 1.0,
    healingMultiplier: 1.0,
    missChance: 0,
    untargetable: false,
  };

  for (const effect of effects) {
    const template = STATUS_EFFECTS[effect.id];
    if (!template) continue;

    // Attack modifiers
    if (template.attackReduction) {
      modifiers.attackMultiplier *= (1 - template.attackReduction);
    }
    if (template.attackMultiplier) {
      modifiers.attackMultiplier *= template.attackMultiplier;
    }

    // Speed modifiers
    if (template.speedReduction) {
      modifiers.speedMultiplier *= (1 - template.speedReduction);
    }
    if (template.speedMultiplier) {
      modifiers.speedMultiplier *= template.speedMultiplier;
    }

    // Damage taken modifiers
    if (template.damageTakenMultiplier) {
      modifiers.damageTakenMultiplier *= template.damageTakenMultiplier;
    }
    if (template.damageReduction) {
      modifiers.damageTakenMultiplier *= (1 - template.damageReduction);
    }

    // Healing modifiers
    if (template.healingReduction) {
      modifiers.healingMultiplier *= (1 - template.healingReduction);
    }

    // Miss chance
    if (template.missChance) {
      modifiers.missChance = Math.max(modifiers.missChance, template.missChance);
    }

    // Untargetable
    if (template.untargetable) {
      modifiers.untargetable = true;
    }
  }

  return modifiers;
};

/**
 * Handle status effects that break on certain conditions
 * @param {Array} effects - Current status effects
 * @param {string} trigger - What triggered the check ('damage', 'attack')
 * @returns {Object} Updated effects and any that were broken
 */
export const checkStatusBreaks = (effects = [], trigger) => {
  const updatedEffects = [];
  const brokenEffects = [];

  for (const effect of effects) {
    const template = STATUS_EFFECTS[effect.id];
    if (!template) {
      updatedEffects.push(effect);
      continue;
    }

    let shouldBreak = false;
    if (trigger === 'damage' && template.breaksOnDamage) {
      shouldBreak = true;
    }
    if (trigger === 'attack' && template.breaksOnAttack) {
      shouldBreak = true;
    }

    if (shouldBreak) {
      brokenEffects.push({ effect, template });
    } else {
      updatedEffects.push(effect);
    }
  }

  return { updatedEffects, brokenEffects };
};

/**
 * Remove a specific status effect
 * @param {Array} effects - Current status effects
 * @param {string} statusId - ID of effect to remove
 * @returns {Array} Updated effects array
 */
export const removeStatusEffect = (effects = [], statusId) => {
  return effects.filter(e => e.id !== statusId);
};

/**
 * Remove all harmful status effects (for cleanse abilities)
 * @param {Array} effects - Current status effects
 * @returns {Object} Updated effects and removed effects
 */
export const cleanseHarmfulEffects = (effects = []) => {
  const cleansed = [];
  const remaining = [];

  for (const effect of effects) {
    if (isHarmfulStatus(effect.id)) {
      cleansed.push(effect);
    } else {
      remaining.push(effect);
    }
  }

  return { remaining, cleansed };
};

/**
 * Check if unit has a specific status effect
 * @param {Array} effects - Status effects array
 * @param {string} statusId - Status ID to check for
 * @returns {boolean}
 */
export const hasStatusEffect = (effects = [], statusId) => {
  return effects.some(e => e.id === statusId);
};

/**
 * Get status effect instance from array
 * @param {Array} effects - Status effects array
 * @param {string} statusId - Status ID to find
 * @returns {Object|null}
 */
export const getActiveStatusEffect = (effects = [], statusId) => {
  return effects.find(e => e.id === statusId) || null;
};
