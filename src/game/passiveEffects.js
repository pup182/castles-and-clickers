/**
 * Passive Effects - Applies passive skill effects during combat.
 * Extracted from skillEngine.js (Phase 2C).
 * Refactored from switch statement to handler map for maintainability.
 */

import { getSkillById, SKILL_TYPE } from '../data/skillTrees';

/**
 * Handler map for passive effect types.
 * Each handler receives (bonuses, passive, context) and mutates bonuses.
 */
const passiveHandlers = {
  damage_reduction: (bonuses, passive) => {
    bonuses.damageReduction += passive.percent / 100;
  },

  low_hp_bonus: (bonuses, passive, _ctx, hero) => {
    if (hero.stats.hp / hero.stats.maxHp <= passive.threshold) {
      bonuses.damageMultiplier += passive.damageBonus || 0;
      if (passive.evasionBonus) {
        bonuses.dodgeChance += passive.evasionBonus / 100;
      }
    }
  },

  high_hp_bonus: (bonuses, passive, _ctx, hero) => {
    if (hero.stats.hp / hero.stats.maxHp >= passive.threshold) {
      bonuses.damageMultiplier += passive.damageBonus || 0;
    }
  },

  high_hp_reduction: (bonuses, passive, _ctx, hero) => {
    if (hero.stats.hp / hero.stats.maxHp >= passive.threshold) {
      bonuses.damageReduction += passive.reduction / 100;
    }
  },

  execute_bonus: (bonuses, passive, context) => {
    if (context.target && context.target.stats.hp / context.target.stats.maxHp <= passive.threshold) {
      bonuses.damageMultiplier += passive.damageBonus || 1.0;
    }
    bonuses.executeThreshold = Math.max(bonuses.executeThreshold, passive.threshold || 0);
  },

  execute: (bonuses, passive, context) => {
    // Same logic as execute_bonus
    passiveHandlers.execute_bonus(bonuses, passive, context);
  },

  on_kill_bonus: (bonuses, passive, context) => {
    if (context.killBonusStacks) {
      bonuses.damageMultiplier += (passive.damagePercent || 10) / 100 * context.killBonusStacks;
    }
  },

  crit_bonus: (bonuses, passive, context) => {
    bonuses.critChance += passive.percent / 100;
    if (passive.openerDamageBonus && context.target && context.target.stats.hp >= context.target.stats.maxHp) {
      bonuses.damageMultiplier += passive.openerDamageBonus / 100;
    }
  },

  crit_damage_bonus: (bonuses, passive) => {
    bonuses.critDamageBonus += passive.percent / 100;
  },

  stat_bonus: (bonuses, passive) => {
    if (passive.damageBonus) {
      bonuses.damageMultiplier += passive.damageBonus;
    }
  },

  damage_bonus: (bonuses, passive) => {
    bonuses.damageMultiplier += passive.percent / 100;
  },

  lifesteal: (bonuses, passive) => {
    bonuses.lifestealPercent += passive.percent;
  },

  double_attack_chance: (bonuses, passive) => {
    bonuses.doubleAttackChance += passive.percent / 100;
  },

  cleave: (bonuses, passive) => {
    bonuses.cleavePercent += passive.percent;
  },

  dodge_chance: (bonuses, passive) => {
    bonuses.dodgeChance += passive.percent / 100;
  },

  reflect_damage: (bonuses, passive) => {
    bonuses.reflectPercent += passive.percent;
  },

  reflect_flat: (bonuses, passive) => {
    bonuses.reflectFlat += passive.amount;
  },

  healing_bonus: (bonuses, passive) => {
    bonuses.healingBonus += passive.percent / 100;
  },

  threat_bonus: (bonuses, passive) => {
    bonuses.threatBonus += passive.percent;
  },

  opener_bonus: (bonuses, passive, context) => {
    if (context.isFirstAttack) {
      bonuses.damageMultiplier += passive.damageBonus / 100;
    }
  },

  first_skill_bonus: (bonuses, passive, context) => {
    if (context.isFirstSkillUse) {
      bonuses.damageMultiplier += passive.damageBonus || 0;
    }
  },

  first_turn_speed: () => {
    // Handled in initiative calculation
  },

  range_bonus: (bonuses, passive, context) => {
    if (context.distance && context.distance >= passive.minRange) {
      bonuses.damageMultiplier += passive.damageBonus / 100;
    }
  },

  priority_target_bonus: (bonuses, passive, context) => {
    if (context.isPriorityTarget) {
      bonuses.damageMultiplier += passive.damageBonus / 100;
    }
  },

  hp_for_damage: (bonuses, passive) => {
    bonuses.hpCostPerAttack = passive.hpCost;
    bonuses.damageMultiplier += passive.damageBonus / 100;
  },

  dual_bonus: (bonuses, passive) => {
    if (passive.damageBonus) {
      bonuses.damageMultiplier += passive.damageBonus;
    }
    if (passive.attackBonus) {
      bonuses.damageMultiplier += passive.attackBonus;
    }
    if (passive.healingBonus) {
      bonuses.healingBonus += passive.healingBonus;
    }
  },
};

/**
 * Apply passive effects during combat
 * Called at specific triggers (on_attack, on_hit, on_kill, etc.)
 */
export const applyPassiveEffects = (hero, trigger, context = {}) => {
  const skills = hero.skills || [];
  const bonuses = {
    damageMultiplier: 1.0,
    damageReduction: 0,
    attackBonus: 0,
    critChance: 0,
    critDamageBonus: 0,
    lifestealPercent: 0,
    doubleAttackChance: 0,
    cleavePercent: 0,
    dodgeChance: 0,
    reflectPercent: 0,
    reflectFlat: 0,
    healingBonus: 0,
    threatBonus: 0,
    executeThreshold: 0,
  };

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (!passive) continue;

    const handler = passiveHandlers[passive.type];
    if (handler) {
      handler(bonuses, passive, context, hero);
    }
  }

  return bonuses;
};
