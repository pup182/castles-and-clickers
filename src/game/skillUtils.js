/**
 * Skill Utilities - Shared helpers used by multiple skill modules.
 * Extracted from skillEngine.js to break circular imports
 * (skillEngine ↔ skillAI / skillExecution).
 */

import { getSkillById, SKILL_TYPE } from '../data/skillTrees';
import {
  DEFENSE_REDUCTION_MULTIPLIER, DAMAGE_VARIANCE_MIN, DAMAGE_VARIANCE_RANGE,
  BASE_CRIT_MULTIPLIER,
} from './balanceConstants';

/**
 * Calculate damage for a skill attack
 * Returns { damage, isCrit }
 */
export const calculateSkillDamage = (attacker, defender, multiplier, options = {}) => {
  // Apply armor penetration - reduces effective defense
  const armorPen = options.armorPen || 0;
  const effectiveDefense = defender.stats.defense * (1 - armorPen);
  const baseDamage = attacker.stats.attack - effectiveDefense * DEFENSE_REDUCTION_MULTIPLIER;
  let damage = Math.max(1, Math.floor(baseDamage * multiplier * (DAMAGE_VARIANCE_MIN + Math.random() * DAMAGE_VARIANCE_RANGE)));
  let isCrit = false;

  // Apply crit
  if (options.alwaysCrit || (options.critChance && Math.random() < options.critChance)) {
    damage = Math.floor(damage * BASE_CRIT_MULTIPLIER);
    isCrit = true;
  }

  // Apply execute bonus
  if (options.executeThreshold && defender.stats.hp / defender.stats.maxHp <= options.executeThreshold) {
    if (options.executeMultiplier) {
      damage = Math.floor(damage * (options.executeMultiplier / multiplier));
    }
  }

  return { damage, isCrit };
};

/**
 * Get all available active skills for a hero (unlocked and off cooldown)
 */
export const getAvailableSkills = (hero, cooldowns = {}) => {
  const skills = hero.skills || [];
  const availableSkills = [];

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.ACTIVE) continue;

    const cooldownRemaining = cooldowns[skillId] || 0;
    if (cooldownRemaining <= 0) {
      availableSkills.push(skill);
    }
  }

  return availableSkills;
};
