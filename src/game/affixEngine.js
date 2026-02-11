// Affix processing engine for equipment special effects

import { ITEM_AFFIXES, AFFIX_TRIGGER } from '../data/itemAffixes';

/**
 * Get all affixes from a hero's equipped items
 */
export const getHeroAffixes = (hero) => {
  const affixes = [];
  if (!hero?.equipment) return affixes;

  for (const slot of ['weapon', 'armor', 'accessory']) {
    const item = hero.equipment[slot];
    if (item?.affixes) {
      for (const affixId of item.affixes) {
        const affix = ITEM_AFFIXES[affixId];
        if (affix) {
          affixes.push({ ...affix, sourceItem: item, sourceSlot: slot });
        }
      }
    }
  }

  return affixes;
};

/**
 * Get affixes by trigger type
 */
export const getAffixesByTrigger = (hero, trigger) => {
  return getHeroAffixes(hero).filter(a => a.trigger === trigger);
};

/**
 * Process PASSIVE affixes - returns stat modifiers
 */
export const getPassiveAffixBonuses = (hero) => {
  const bonuses = {
    critChanceBonus: 0,
    maxHpBonus: 0,
    speedBonus: 0,
    damageMultiplier: 1,
    damageTakenMultiplier: 1,
    debuffDurationReduction: 0,
  };

  const passiveAffixes = getAffixesByTrigger(hero, AFFIX_TRIGGER.PASSIVE);

  for (const affix of passiveAffixes) {
    const effect = affix.effect;

    if (effect.critChanceBonus) {
      bonuses.critChanceBonus += effect.critChanceBonus;
    }
    if (effect.maxHpBonus) {
      bonuses.maxHpBonus += effect.maxHpBonus;
    }
    if (effect.speedBonus) {
      bonuses.speedBonus += effect.speedBonus;
    }
    if (effect.debuffDurationReduction) {
      bonuses.debuffDurationReduction += effect.debuffDurationReduction;
    }
    // Titan affix: more HP but take more damage
    if (effect.damageTakenIncrease) {
      bonuses.damageTakenMultiplier += effect.damageTakenIncrease;
    }
  }

  return bonuses;
};

/**
 * Process ON_HIT affixes - called when hero deals damage
 * Returns: { lifestealAmount, statusesToApply, chainDamage }
 */
export const processOnHitAffixes = (hero, damage, target, isCrit) => {
  const results = {
    lifestealAmount: 0,
    statusesToApply: [],
    chainDamage: null,
    logs: [],
  };

  const onHitAffixes = getAffixesByTrigger(hero, AFFIX_TRIGGER.ON_HIT);

  for (const affix of onHitAffixes) {
    const effect = affix.effect;

    // Lifesteal
    if (effect.lifesteal) {
      results.lifestealAmount += Math.floor(damage * effect.lifesteal);
      results.logs.push({
        type: 'lifesteal',
        amount: Math.floor(damage * effect.lifesteal),
        affix: affix.name,
      });
    }

    // Status effect application with proc chance
    if (effect.appliesStatus && effect.procChance) {
      if (Math.random() < effect.procChance) {
        results.statusesToApply.push({
          id: effect.appliesStatus.id,
          duration: effect.appliesStatus.duration || 2,
          stacks: effect.appliesStatus.stacks || 1,
          affixName: affix.name,
        });
        results.logs.push({
          type: 'status_proc',
          status: effect.appliesStatus.id,
          affix: affix.name,
        });
      }
    }

    // Chain lightning
    if (effect.chainDamage && effect.procChance) {
      if (Math.random() < effect.procChance) {
        results.chainDamage = {
          damagePercent: effect.chainDamage,
          targets: effect.chainTargets || 2,
          affix: affix.name,
        };
        results.logs.push({
          type: 'chain_lightning',
          affix: affix.name,
        });
      }
    }
  }

  return results;
};

/**
 * Process ON_CRIT affixes - called when hero lands a critical hit
 */
export const processOnCritAffixes = (hero, baseDamage, target) => {
  const results = {
    bonusDamageMultiplier: 1,
    statusesToApply: [],
    logs: [],
  };

  const onCritAffixes = getAffixesByTrigger(hero, AFFIX_TRIGGER.ON_CRIT);

  for (const affix of onCritAffixes) {
    const effect = affix.effect;

    // Bonus crit damage (Devastating)
    if (effect.critDamageBonus) {
      results.bonusDamageMultiplier += effect.critDamageBonus;
      results.logs.push({
        type: 'crit_bonus',
        bonus: effect.critDamageBonus,
        affix: affix.name,
      });
    }

    // Apply status on crit (Savage - bleed)
    if (effect.appliesStatus) {
      results.statusesToApply.push({
        id: effect.appliesStatus.id,
        duration: effect.appliesStatus.duration || 3,
        stacks: effect.appliesStatus.stacks || 1,
        affixName: affix.name,
      });
      results.logs.push({
        type: 'status_on_crit',
        status: effect.appliesStatus.id,
        affix: affix.name,
      });
    }
  }

  return results;
};

/**
 * Process ON_KILL affixes - called when hero kills an enemy
 */
export const processOnKillAffixes = (hero) => {
  const results = {
    buffs: [],
    logs: [],
  };

  const onKillAffixes = getAffixesByTrigger(hero, AFFIX_TRIGGER.ON_KILL);

  for (const affix of onKillAffixes) {
    const effect = affix.effect;

    if (effect.onKillBuff) {
      results.buffs.push({
        stat: effect.onKillBuff.stat,
        amount: effect.onKillBuff.amount || 0,
        percent: effect.onKillBuff.percent || 0,
        duration: effect.onKillBuff.duration || 2,
        affixName: affix.name,
      });
      results.logs.push({
        type: 'on_kill_buff',
        buff: effect.onKillBuff,
        affix: affix.name,
      });
    }
  }

  return results;
};

/**
 * Process ON_DAMAGE_TAKEN affixes - called when hero takes damage
 */
export const processOnDamageTakenAffixes = (hero, damage, attacker) => {
  const results = {
    reflectDamage: 0,
    damageReduction: 0,
    logs: [],
  };

  const passiveAffixes = getAffixesByTrigger(hero, AFFIX_TRIGGER.PASSIVE);
  const onDamageTakenAffixes = getAffixesByTrigger(hero, AFFIX_TRIGGER.ON_DAMAGE_TAKEN);

  // Check passive low HP damage reduction (of Fortitude)
  for (const affix of passiveAffixes) {
    const effect = affix.effect;
    if (effect.lowHpDamageReduction && effect.lowHpThreshold) {
      const hpPercent = hero.stats.hp / hero.stats.maxHp;
      if (hpPercent < effect.lowHpThreshold) {
        results.damageReduction += effect.lowHpDamageReduction;
        results.logs.push({
          type: 'low_hp_reduction',
          reduction: effect.lowHpDamageReduction,
          affix: affix.name,
        });
      }
    }
  }

  // Process on damage taken triggers
  for (const affix of onDamageTakenAffixes) {
    const effect = affix.effect;

    // Reflect damage (of Thorns)
    if (effect.reflectDamage) {
      results.reflectDamage += Math.floor(damage * effect.reflectDamage);
      results.logs.push({
        type: 'reflect',
        amount: Math.floor(damage * effect.reflectDamage),
        affix: affix.name,
      });
    }

    // Low HP damage reduction
    if (effect.lowHpDamageReduction && effect.lowHpThreshold) {
      const hpPercent = hero.stats.hp / hero.stats.maxHp;
      if (hpPercent < effect.lowHpThreshold) {
        results.damageReduction += effect.lowHpDamageReduction;
      }
    }
  }

  return results;
};

/**
 * Process ON_TURN_START affixes - called at start of hero's turn
 */
export const processOnTurnStartAffixes = (hero) => {
  const results = {
    healAmount: 0,
    logs: [],
  };

  const allAffixes = getHeroAffixes(hero);
  const onTurnStartAffixes = allAffixes.filter(a => a.trigger === AFFIX_TRIGGER.ON_TURN_START);

  for (const affix of onTurnStartAffixes) {
    const effect = affix.effect;

    // Regeneration
    if (effect.regenPercent) {
      const healAmount = Math.floor(hero.stats.maxHp * effect.regenPercent);
      results.healAmount += healAmount;
      results.logs.push({
        type: 'regen',
        amount: healAmount,
        affix: affix.name,
      });
    }
  }

  return results;
};

/**
 * Calculate execute bonus damage (Executioner's)
 */
export const getExecuteBonus = (hero, target) => {
  const passiveAffixes = getAffixesByTrigger(hero, AFFIX_TRIGGER.PASSIVE);

  for (const affix of passiveAffixes) {
    const effect = affix.effect;
    if (effect.executeBonus && effect.executeThreshold) {
      const targetHpPercent = target.stats.hp / target.stats.maxHp;
      if (targetHpPercent <= effect.executeThreshold) {
        return {
          bonus: effect.executeBonus,
          affixName: affix.name,
        };
      }
    }
  }

  return null;
};

/**
 * Calculate berserker bonus damage based on missing HP
 */
export const getBerserkerBonus = (hero) => {
  const passiveAffixes = getAffixesByTrigger(hero, AFFIX_TRIGGER.PASSIVE);

  for (const affix of passiveAffixes) {
    const effect = affix.effect;
    if (effect.missingHpDamage) {
      const missingHpPercent = 1 - (hero.stats.hp / hero.stats.maxHp);
      return {
        bonus: missingHpPercent * effect.missingHpDamage * 100, // Convert to percentage
        affixName: affix.name,
      };
    }
  }

  return null;
};

/**
 * Check if hero has phoenix revive available
 */
export const checkPhoenixRevive = (hero, usedPhoenixRevives = {}) => {
  if (usedPhoenixRevives[hero.id]) return null;

  const passiveAffixes = getAffixesByTrigger(hero, AFFIX_TRIGGER.PASSIVE);

  for (const affix of passiveAffixes) {
    const effect = affix.effect;
    if (effect.reviveOnce) {
      return {
        hpPercent: effect.reviveHpPercent || 0.25,
        affixName: affix.name,
      };
    }
  }

  return null;
};
