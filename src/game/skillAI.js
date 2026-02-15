/**
 * Skill AI - Chooses the best skill for a hero to use based on combat situation.
 * Extracted from skillEngine.js (Phase 2C).
 */

import { EFFECT_TYPE, TARGET_TYPE } from '../data/skillTrees';
import { getAvailableSkills } from './skillUtils';
import { HP_CRITICAL, HP_LOW, HP_HURT } from './balanceConstants';

/**
 * Choose the best skill to use based on situation
 * Enhanced priority system:
 * 1. Emergency heal (ally < 25% HP)
 * 2. Defensive buffs (2+ allies hurt)
 * 3. Execute skills (enemy < 25% HP)
 * 4. AOE (3+ enemies)
 * 5. Standard heal (ally < 50% HP)
 * 6. Debuffs on bosses
 * 7. Highest damage skill
 */
export const chooseBestSkill = (hero, enemies, allies, cooldowns = {}) => {
  const availableSkills = getAvailableSkills(hero, cooldowns);
  if (availableSkills.length === 0) return null;

  // OPTIMIZATION: Single pass to calculate all ally/enemy states
  // Avoids creating 5+ intermediate arrays per skill selection
  let criticalAllyCount = 0;
  let lowHpAllyCount = 0;
  let hurtAllyCount = 0;
  let _aliveAllyCount = 0;

  for (let i = 0; i < allies.length; i++) {
    const a = allies[i];
    if (a.stats.hp > 0) {
      _aliveAllyCount++;
      const hpRatio = a.stats.hp / a.stats.maxHp;
      if (hpRatio < HP_CRITICAL) criticalAllyCount++;
      if (hpRatio < HP_LOW) lowHpAllyCount++;
      if (hpRatio < HP_HURT) hurtAllyCount++;
    }
  }

  let lowHpEnemyCount = 0;
  let bossCount = 0;
  let aliveEnemyCount = 0;

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (e.stats.hp > 0) {
      aliveEnemyCount++;
      if (e.stats.hp / e.stats.maxHp < HP_CRITICAL) lowHpEnemyCount++;
      if (e.isBoss) bossCount++;
    }
  }

  // Helper to find skills by type
  const findSkillByType = (condition) => availableSkills.find(condition);
  const findHealingSkill = () => findSkillByType(s =>
    s.effect?.type === EFFECT_TYPE.HEAL || s.effect?.type === EFFECT_TYPE.HOT
  );
  const findDefensiveSkill = () => findSkillByType(s =>
    s.effect?.type === EFFECT_TYPE.BUFF &&
    (s.effect?.damageReduction || s.effect?.evasion || s.targetType === TARGET_TYPE.ALL_ALLIES)
  );
  const findShieldSkill = () => findSkillByType(s => s.effect?.type === EFFECT_TYPE.SHIELD);

  // 1. EMERGENCY HEAL - Ally below 25% HP
  if (criticalAllyCount > 0) {
    const healSkill = findHealingSkill();
    if (healSkill) return healSkill;

    const shieldSkill = findShieldSkill();
    if (shieldSkill) return shieldSkill;
  }

  // 2. DEFENSIVE BUFFS - 2+ allies hurt
  if (hurtAllyCount >= 2) {
    const defSkill = findDefensiveSkill();
    if (defSkill) return defSkill;
  }

  // 3. EXECUTE SKILLS - Enemy below 25% HP
  if (lowHpEnemyCount > 0) {
    const executeSkill = findSkillByType(s =>
      s.effect?.type === EFFECT_TYPE.DAMAGE &&
      (s.effect?.executeThreshold || s.effect?.executeMultiplier || s.effect?.resetOnKill)
    );
    if (executeSkill) return executeSkill;
  }

  // 4. AOE - 3+ enemies
  if (aliveEnemyCount >= 3) {
    const aoeSkill = findSkillByType(s =>
      s.targetType === TARGET_TYPE.ALL_ENEMIES &&
      s.effect?.type === EFFECT_TYPE.DAMAGE
    );
    if (aoeSkill) return aoeSkill;
  }

  // 5. STANDARD HEAL - Ally below 50% HP
  if (lowHpAllyCount > 0) {
    const healSkill = findHealingSkill();
    if (healSkill) return healSkill;
  }

  // 6. DEBUFFS ON BOSSES
  if (bossCount > 0) {
    const debuffSkill = findSkillByType(s =>
      s.effect?.type === EFFECT_TYPE.DEBUFF &&
      (s.effect?.attackReduction || s.effect?.damageAmp || s.effect?.stun)
    );
    if (debuffSkill) return debuffSkill;
  }

  // 7. AOE for 2+ enemies
  if (aliveEnemyCount >= 2) {
    const aoeSkill = findSkillByType(s =>
      s.targetType === TARGET_TYPE.ALL_ENEMIES &&
      s.effect?.type === EFFECT_TYPE.DAMAGE
    );
    if (aoeSkill) return aoeSkill;
  }

  // 8. HIGHEST DAMAGE SKILL
  // Prefer single-target skills when only 1 enemy (don't waste AoE)
  const allDamageSkills = availableSkills.filter(s =>
    s.effect?.type === EFFECT_TYPE.DAMAGE
  );

  if (allDamageSkills.length > 0) {
    // Sort by effective damage (multiplier * hits)
    const sortByDamage = (a, b) => {
      const aMulti = (a.effect?.multiplier || 1) * (a.effect?.hits || 1);
      const bMulti = (b.effect?.multiplier || 1) * (b.effect?.hits || 1);
      return bMulti - aMulti;
    };

    // When only 1 enemy, prefer single-target skills
    if (aliveEnemyCount === 1) {
      const singleTargetSkills = allDamageSkills.filter(s =>
        s.targetType !== TARGET_TYPE.ALL_ENEMIES
      );
      if (singleTargetSkills.length > 0) {
        singleTargetSkills.sort(sortByDamage);
        return singleTargetSkills[0];
      }
    }

    // Fall back to any damage skill (including AoE)
    allDamageSkills.sort(sortByDamage);
    return allDamageSkills[0];
  }

  // 9. DOT skills if nothing else
  const dotSkill = findSkillByType(s => s.effect?.type === EFFECT_TYPE.DOT);
  if (dotSkill) return dotSkill;

  // Use any available skill as fallback
  return availableSkills[0];
};
