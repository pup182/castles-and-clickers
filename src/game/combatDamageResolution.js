/**
 * Combat damage resolution - basic attack calculation, application, on-hit/on-kill effects.
 * Extracted from useCombat.js to reduce file size.
 */

import {
  applyPassiveEffects, getOnHitEffects, getOnKillEffects,
  getOnDamageTakenEffects, checkCheatDeath, checkMartyrIntercept,
  getPartyAuraEffects, getTauntPartyBonus, checkReactiveTaunt,
  checkDamageRedirect, calculateDamageSharing, checkRaiseDead,
  createRaisedUndead, checkVengeanceTrigger, checkReactiveHeal,
  hasCCImmunity,
} from './skillEngine';
import {
  getPassiveAffixBonuses, processOnHitAffixes, processOnCritAffixes,
  processOnKillAffixes, processOnDamageTakenAffixes,
  getExecuteBonus, getBerserkerBonus, checkPhoenixRevive,
} from './affixEngine';
import {
  getUniquePassiveBonuses, processOnHitUniques, processOnCritUniques,
  processOnKillUniques, processOnDamageTakenUniques, processOnDeathUniques,
  processOnLowHpUniques, getStealthBonusDamage, getRootedBonusDamage,
  getShieldBonusDamage, getHeroUniqueItems, getHeroHealingReduction,
  getUniqueState, processOnPartyDamageUniques,
} from './uniqueEngine';
import {
  checkPhaseTransition, processPhaseStartActions, isBossImmune,
  setBossEnraged, getBossPhaseDamageBonus, getBossPhaseDamageReduction,
  getEnrageDamageBonus, getBossState, getWorldBossLoot,
} from './bossEngine';
import { applyStatusEffect } from './statusEngine';
import { STATUS_EFFECTS } from '../data/statusEffects';
import {
  calculateDodgeChance, calculateDoubleAttackChance,
} from './constants';
import { getDistance } from './roomBasedDungeon';
import { ELITE_CONFIG } from '../data/monsters';
import { generateEquipment, generateConsumableDrop } from '../data/equipment';
import { rollRaidDrop, getWingBoss } from '../data/raids';
import { handleUnitDeath, handleMonsterDamageTriggers } from './combatHelpers';
import {
  DEFENSE_REDUCTION_MULTIPLIER, DAMAGE_VARIANCE_MIN, DAMAGE_VARIANCE_RANGE,
  BASE_CRIT_MULTIPLIER, BASE_CRIT_CHANCE_DPS, BASE_CRIT_CHANCE_OTHER, DPS_CLASSES,
  BOSS_LOOT_DROP_CHANCE, NORMAL_LOOT_DROP_CHANCE,
  CHAIN_ATTACK_MAX, CHAIN_ATTACK_CONTINUE_CHANCE, CHAIN_ATTACK_DECAY,
  DOUBLE_ATTACK_DAMAGE, AOE_BUFF_DAMAGE, COUNTER_ATTACK_DAMAGE,
  SOUL_REAP_BONUS_PER_STACK,
} from './balanceConstants';

/**
 * Calculate basic attack damage with all multipliers.
 * Returns { dmg, isCrit, passiveBonuses, uniqueBonuses, heroData, affixBonuses }.
 */
export const calculateBasicAttackDamage = (ctx, actor, target) => {
  const {
    newBuffs, newStatusEffects, newKillBonusStacks,
    aliveHeroes, heroes,
    damageBonus, defenseBonus, critBonus, crownMultiplier,
    incrementStat, addCombatLog,
  } = ctx;

  const passiveBonuses = actor.isHero
    ? applyPassiveEffects(actor, 'on_attack', { target, killBonusStacks: newKillBonusStacks[actor.id] || 0 })
    : { damageMultiplier: 1.0, damageReduction: 0 };

  // Get affix bonuses for heroes
  const heroData = actor.isHero ? heroes.find(h => h.id === actor.id) : null;
  const affixBonuses = heroData ? getPassiveAffixBonuses(heroData) : { critChanceBonus: 0 };

  // Get unique item passive bonuses for heroes
  const uniqueBonuses = heroData ? getUniquePassiveBonuses({ ...heroData, stats: actor.stats }) : {
    damageMultiplier: 1.0, lifesteal: 0, armorPenetration: 0, critChance: 0
  };

  // Apply permanent bonuses for heroes
  const actorDamageBonus = actor.isHero ? damageBonus : 1;
  const targetDefenseBonus = target.isHero ? defenseBonus : 1;
  const actorCritBonus = actor.isHero ? critBonus : 0;

  // Check for execute bonus (Executioner's affix)
  let executeMultiplier = 1;
  if (heroData) {
    const executeBonus = getExecuteBonus(heroData, target);
    if (executeBonus) {
      executeMultiplier = 1 + executeBonus.bonus;
    }
  }

  // Check for berserker bonus (Berserker's affix)
  let berserkerMultiplier = 1;
  if (heroData) {
    const berserkerBonus = getBerserkerBonus({ ...heroData, stats: actor.stats });
    if (berserkerBonus) {
      berserkerMultiplier = 1 + (berserkerBonus.bonus / 100);
    }
  }

  // Check for vengeance buff (from dead allies)
  const actorBuffs = newBuffs[actor.id] || {};
  const vengeanceMultiplier = 1 + (actorBuffs.vengeanceDamageBonus || 0);

  // Check for taunt party bonus (Warlord)
  const tauntPartyBonus = actor.isHero ? getTauntPartyBonus(aliveHeroes, newBuffs) : 0;
  const tauntPartyMultiplier = 1 + tauntPartyBonus;

  // Check for buff-based damage bonus
  const buffDamageBonus = actorBuffs.damageBonus || 0;
  const buffAttackBonus = actorBuffs.attackBonus || 0;
  const buffDamageMultiplier = 1 + buffDamageBonus + buffAttackBonus;

  // Check for weakness debuff
  const weaknessDebuff = actorBuffs.weakness || 0;
  const weaknessMultiplier = 1 - weaknessDebuff;

  // Check for boss phase damage bonuses
  let bossDamageMultiplier = 1;
  if (!actor.isHero && (actor.isBoss || actor.isWorldBoss) && actor.phases) {
    const phaseDamageBonus = getBossPhaseDamageBonus(actor);
    const enrageDamageBonus = getEnrageDamageBonus(actor);
    bossDamageMultiplier = 1 + phaseDamageBonus + enrageDamageBonus;
  }

  // Stealth bonus damage (Cloak of Nothing)
  let stealthMultiplier = 1;
  if (actor.isHero && heroData) {
    const stealthBonus = getStealthBonusDamage({ ...heroData, stats: actor.stats });
    if (stealthBonus > 0) {
      stealthMultiplier = 1 + stealthBonus;
      addCombatLog({ type: 'system', message: `Cloak of Nothing! ${actor.name} strikes from the shadows for ${Math.round(stealthBonus * 100)}% bonus damage!` });
    }
  }

  // Rooted target bonus damage (Kraken's Grasp)
  let rootedMultiplier = 1;
  if (actor.isHero && heroData) {
    const targetEffects = newStatusEffects[target.id] || [];
    rootedMultiplier = getRootedBonusDamage({ ...heroData, stats: actor.stats }, { ...target, statusEffects: targetEffects });
    if (rootedMultiplier > 1) {
      addCombatLog({ type: 'system', message: `Kraken's Grasp! ${actor.name} deals ${rootedMultiplier}x damage to rooted ${target.name}!` });
    }
  }

  // Shield bonus damage (Ancient Bark)
  let shieldBonusMultiplier = 1;
  if (actor.isHero && heroData) {
    const heroShield = newBuffs[actor.id]?.shield || 0;
    if (heroShield > 0) {
      shieldBonusMultiplier = getShieldBonusDamage({ ...heroData, shield: heroShield, stats: actor.stats });
    }
  }

  // Crown of Command
  const crownAttackBonus = actor.isHero ? crownMultiplier : 1;
  const crownDefenseBonus = target.isHero ? crownMultiplier : 1;
  let baseDmg = Math.max(1, Math.floor(
    (actor.stats.attack * actorDamageBonus * crownAttackBonus + (passiveBonuses.attackBonus || 0) + (uniqueBonuses.attackBonus || 0) - target.stats.defense * crownDefenseBonus * (1 - (uniqueBonuses.armorPenetration || 0)) * targetDefenseBonus * DEFENSE_REDUCTION_MULTIPLIER) * (DAMAGE_VARIANCE_MIN + Math.random() * DAMAGE_VARIANCE_RANGE)
  ));

  // Apply unique damageReduction as self-nerf (Leviathan's Heart)
  const uniqueDamageReductionMultiplier = 1 - (uniqueBonuses.damageReduction || 0);
  let dmg = Math.floor(baseDmg * passiveBonuses.damageMultiplier * uniqueBonuses.damageMultiplier * uniqueDamageReductionMultiplier * executeMultiplier * berserkerMultiplier * vengeanceMultiplier * tauntPartyMultiplier * buffDamageMultiplier * weaknessMultiplier * bossDamageMultiplier * stealthMultiplier * rootedMultiplier * shieldBonusMultiplier);
  let isCrit = false;

  // Base crit chance
  const baseCritChance = actor.isHero && DPS_CLASSES.includes(actor.classId) ? BASE_CRIT_CHANCE_DPS : BASE_CRIT_CHANCE_OTHER;

  const totalCritChance = baseCritChance + (passiveBonuses.critChance || 0) + actorCritBonus + affixBonuses.critChanceBonus + (uniqueBonuses.critChance || 0);
  if (Math.random() < totalCritChance) {
    let critMultiplier = BASE_CRIT_MULTIPLIER + (passiveBonuses.critDamageBonus || 0);
    if (heroData) {
      const critAffixResult = processOnCritAffixes(heroData, dmg, target);
      critMultiplier *= critAffixResult.bonusDamageMultiplier;
    }
    dmg = Math.floor(dmg * critMultiplier);
    isCrit = true;
    if (actor.isHero) {
      incrementStat('totalCriticalHits', 1, { heroId: actor.id });
    }
  }

  return { dmg, isCrit, passiveBonuses, uniqueBonuses, heroData, affixBonuses };
};

/**
 * Add visual effects for a basic attack.
 */
export const addAttackVisualEffects = (ctx, actor, target, dmg, isCrit, minDist) => {
  const { addCombatLog, addEffect } = ctx;

  addCombatLog({
    type: 'attack',
    actor: { name: actor.name, emoji: actor.emoji },
    target: { name: target.name, emoji: target.emoji },
    damage: dmg,
    isCrit,
  });

  const isRogueDart = actor.isHero && actor.classId === 'rogue' && minDist > 1;
  if (isRogueDart) {
    addEffect({ type: 'dart', from: actor.position, to: target.position, classId: actor.classId });
  } else {
    addEffect({ type: 'beam', from: actor.position, to: target.position, attackerClass: actor.isHero ? actor.classId : 'monster' });
  }

  if (isCrit) {
    addEffect({ type: 'crit', position: target.position, damage: dmg });
  } else {
    addEffect({ type: 'damage', position: target.position, damage: dmg, isHeal: false });
  }

  addEffect({ type: 'impact', position: target.position, color: actor.isHero ? '#22c55e' : '#ef4444' });
};

/**
 * Resolve damage when a hero is the target of a basic attack.
 * Handles dodge, damage reduction, shields, redirect, sharing, martyr, death cascade, vengeance.
 * Mutates ctx.
 */
export const resolveHeroTargetDamage = (ctx, actor, target, attackResult) => {
  const {
    newHeroes, newMonsters, newBuffs, newStatusEffects,
    newUsedPhoenixRevives, newReactiveHealUsed,
    aliveHeroes, heroes,
    findHeroIndex, findMonsterIndex,
    addCombatLog, addEffect, incrementStat,
    hasResurrectionScroll, consumeResurrectionScroll,
  } = ctx;
  const { dmg, uniqueBonuses } = attackResult;

  // Check for evasion buff
  const targetBuffs = newBuffs[target.id] || {};
  if (targetBuffs.evasion > 0) {
    addCombatLog({ type: 'system', message: `${target.name} evades in smoke!` });
    return;
  }

  if (targetBuffs.blockNextHit) {
    if (!newBuffs[target.id]) newBuffs[target.id] = { ...targetBuffs };
    newBuffs[target.id].blockNextHit = false;
    addCombatLog({ type: 'system', message: `${target.name}'s shield blocks the attack!` });
    return;
  }

  // Calculate dodge chance
  let defenderEffectiveSpeed = target.stats.speed;
  let attackerEffectiveSpeed = actor.stats.speed;
  let targetUniqueAccuracyReduction = 0;
  let targetUniqueMissChance = 0;
  if (target.isHero) {
    const targetHeroForSpeed = heroes.find(h => h.id === target.id);
    if (targetHeroForSpeed) {
      const targetUniqueBonuses = getUniquePassiveBonuses({ ...targetHeroForSpeed, stats: target.stats });
      defenderEffectiveSpeed = Math.floor(target.stats.speed * (targetUniqueBonuses.speedMultiplier || 1));
      targetUniqueAccuracyReduction = targetUniqueBonuses.enemyAccuracyReduction || 0;
      targetUniqueMissChance = targetUniqueBonuses.enemyMissChance || 0;
    }
  }
  if (actor.isHero && attackResult.heroData) {
    attackerEffectiveSpeed = Math.floor(actor.stats.speed * (uniqueBonuses.speedMultiplier || 1));
  }
  let baseDodgeChance = calculateDodgeChance(defenderEffectiveSpeed, attackerEffectiveSpeed);
  if (target.isHero) {
    const targetDefenderBonuses = applyPassiveEffects(target, 'on_defend', {});
    baseDodgeChance += targetDefenderBonuses.dodgeChance || 0;
  }
  if (target.bonusDodge) {
    baseDodgeChance += target.bonusDodge;
  }
  baseDodgeChance += targetUniqueAccuracyReduction + targetUniqueMissChance;
  const dodged = Math.random() < baseDodgeChance;

  if (dodged) {
    if (target.isHero) {
      incrementStat('totalDodges', 1, { heroId: target.id });
    }
    addCombatLog({ type: 'system', message: `${target.name} dodged!` });
    return;
  }

  // --- Hit connected ---
  const targetBonuses = applyPassiveEffects(target, 'on_hit', {});
  let totalDamageReduction = targetBonuses.damageReduction;

  if (targetBuffs.damageReduction) {
    totalDamageReduction += targetBuffs.damageReduction;
  }

  // Process ON_DAMAGE_TAKEN affixes (thorns, fortitude)
  const targetHeroData = heroes.find(h => h.id === target.id);
  let reflectDamage = 0;
  let damageTakenMultiplier = 1;
  let shouldCounterAttack = false;
  if (targetHeroData) {
    const onDamageTakenResult = processOnDamageTakenAffixes(
      { ...targetHeroData, stats: target.stats }, dmg, actor
    );
    totalDamageReduction += onDamageTakenResult.damageReduction;
    reflectDamage = onDamageTakenResult.reflectDamage;

    const skillOnDamageTaken = getOnDamageTakenEffects(target, dmg, actor);
    totalDamageReduction += skillOnDamageTaken.damageReduction;
    reflectDamage += skillOnDamageTaken.reflectDamage;
    shouldCounterAttack = skillOnDamageTaken.counterAttack;

    const passiveAffixBonuses = getPassiveAffixBonuses(targetHeroData);
    damageTakenMultiplier = passiveAffixBonuses.damageTakenMultiplier || 1;

    const uniqueOnDamageTakenResult = processOnDamageTakenUniques(
      { ...targetHeroData, stats: target.stats }, actor, dmg, {}
    );

    if (uniqueOnDamageTakenResult.phased) {
      totalDamageReduction = 1.0;
      addCombatLog({ type: 'system', message: `${target.name} phases through the attack!` });
      addEffect({ type: 'status', position: target.position, status: 'phase' });
    }

    if (uniqueOnDamageTakenResult.reflectDamage > 0) {
      reflectDamage += uniqueOnDamageTakenResult.reflectDamage;
      addEffect({ type: 'beam', from: target.position, to: actor.position, attackerClass: 'knight' });
      addEffect({ type: 'damage', position: actor.position, damage: Math.floor(uniqueOnDamageTakenResult.reflectDamage) });
    }

    if (uniqueOnDamageTakenResult.damageBlocked > 0 && !uniqueOnDamageTakenResult.phased) {
      totalDamageReduction += uniqueOnDamageTakenResult.damageBlocked / dmg;
    }
  }

  // Apply damage taken multiplier then reduction
  const modifiedDmg = Math.floor(dmg * damageTakenMultiplier);
  let reducedDmg = Math.max(1, Math.floor(modifiedDmg * (1 - totalDamageReduction)));

  const skillMitigated = modifiedDmg - reducedDmg;
  if (skillMitigated > 0) {
    incrementStat('totalMitigated', skillMitigated, { heroId: target.id });
  }

  // Hero shield absorption (Ancient Bark)
  const heroTargetBuffs = newBuffs[target.id] || {};
  if (heroTargetBuffs.shield > 0 && reducedDmg > 0) {
    if (!newBuffs[target.id]) newBuffs[target.id] = {};
    const shieldAbsorbed = Math.min(newBuffs[target.id].shield || heroTargetBuffs.shield, reducedDmg);
    newBuffs[target.id].shield = (newBuffs[target.id].shield || heroTargetBuffs.shield) - shieldAbsorbed;
    reducedDmg -= shieldAbsorbed;
    if (shieldAbsorbed > 0) {
      addCombatLog({ type: 'system', message: `${target.name}'s bark shield absorbs ${shieldAbsorbed} damage!` });
      incrementStat('totalMitigated', shieldAbsorbed, { heroId: target.id });
      if (newBuffs[target.id].shield <= 0) {
        delete newBuffs[target.id].shield;
        addCombatLog({ type: 'system', message: `${target.name}'s bark shield is broken!` });
        addEffect({ type: 'buffAura', position: target.position, color: '#6495ed' });
      }
    }
  }

  // Damage redirect (Knight Fortress)
  const damageRedirect = checkDamageRedirect(aliveHeroes, target, reducedDmg);
  if (damageRedirect) {
    const redirectIdx = findHeroIndex(damageRedirect.redirectHero.id);
    if (redirectIdx !== -1) {
      newHeroes[redirectIdx].stats.hp = Math.max(0, newHeroes[redirectIdx].stats.hp - damageRedirect.redirectedDamage);
      ctx.damageTakenByHero[damageRedirect.redirectHero.id] = (ctx.damageTakenByHero[damageRedirect.redirectHero.id] || 0) + damageRedirect.redirectedDamage;
      addCombatLog({ type: 'system', message: `${damageRedirect.skillName}! ${damageRedirect.redirectHero.name} intercepts ${damageRedirect.redirectedDamage} damage for ${target.name}!` });
      addEffect({ type: 'beam', from: damageRedirect.redirectHero.position, to: target.position, attackerClass: 'knight' });
      addEffect({ type: 'damage', position: damageRedirect.redirectHero.position, damage: damageRedirect.redirectedDamage });
      reducedDmg = 0;
    }
  }

  // Damage sharing (Spirit Link Totem)
  const partyAuras = getPartyAuraEffects(aliveHeroes);
  if (partyAuras.damageSharing && reducedDmg > 0) {
    const sharing = calculateDamageSharing(aliveHeroes, target, reducedDmg, partyAuras.damageSharingReduction);
    if (sharing) {
      for (const heroId of sharing.affectedHeroes) {
        const heroIdx = findHeroIndex(heroId);
        if (heroIdx !== -1) {
          newHeroes[heroIdx].stats.hp = Math.max(0, newHeroes[heroIdx].stats.hp - sharing.damagePerHero);
          ctx.damageTakenByHero[heroId] = (ctx.damageTakenByHero[heroId] || 0) + sharing.damagePerHero;
          if (heroId !== target.id) {
            addEffect({ type: 'damage', position: newHeroes[heroIdx].position, damage: sharing.damagePerHero });
          }
        }
      }
      addCombatLog({ type: 'system', message: `Spirit Link! Damage shared among allies (${sharing.damagePerHero} each)` });
      reducedDmg = 0;
    }
  }

  // Martyr intercept
  if (reducedDmg > 0) {
    const martyrIntercept = checkMartyrIntercept(aliveHeroes, target, reducedDmg);
    if (martyrIntercept && martyrIntercept.martyrHero.id !== target.id) {
      const interceptedDmg = Math.floor(reducedDmg * martyrIntercept.interceptPercent);
      reducedDmg = reducedDmg - interceptedDmg;

      const martyrIdx = findHeroIndex(martyrIntercept.martyrHero.id);
      if (martyrIdx !== -1 && interceptedDmg > 0) {
        newHeroes[martyrIdx].stats.hp = Math.max(0, newHeroes[martyrIdx].stats.hp - interceptedDmg);
        ctx.damageTakenByHero[martyrIntercept.martyrHero.id] = (ctx.damageTakenByHero[martyrIntercept.martyrHero.id] || 0) + interceptedDmg;
        addCombatLog({ type: 'system', message: `${martyrIntercept.skillName}! ${martyrIntercept.martyrHero.name} absorbs ${interceptedDmg} damage for ${target.name}!` });
        addEffect({ type: 'beam', from: martyrIntercept.martyrHero.position, to: target.position, attackerClass: 'cleric' });
        addEffect({ type: 'damage', position: martyrIntercept.martyrHero.position, damage: interceptedDmg });
      }
    }
  }

  // Apply damage to target
  const targetHeroIdx = findHeroIndex(target.id);
  if (targetHeroIdx !== -1 && reducedDmg > 0) {
    newHeroes[targetHeroIdx].stats.hp = Math.max(0, newHeroes[targetHeroIdx].stats.hp - reducedDmg);
    ctx.damageTakenByHero[target.id] = (ctx.damageTakenByHero[target.id] || 0) + reducedDmg;

    // Check for low HP unique triggers (Crown of the Fallen vengeance)
    if (target.isHero && targetHeroData) {
      const currentHpAfterDmg = newHeroes[targetHeroIdx].stats.hp;
      const targetMaxHp = newHeroes[targetHeroIdx].stats.maxHp;
      if (currentHpAfterDmg > 0) {
        const lowHpResult = processOnLowHpUniques(
          { ...targetHeroData, stats: target.stats }, currentHpAfterDmg, targetMaxHp, {}
        );
        if (lowHpResult.buffsToApply.length > 0) {
          if (!newBuffs[target.id]) newBuffs[target.id] = {};
          for (const buff of lowHpResult.buffsToApply) {
            if (buff.id === 'vengeance') {
              newBuffs[target.id].vengeanceDamageBonus = buff.damageBonus;
              newBuffs[target.id].vengeanceLifesteal = buff.lifesteal;
              newBuffs[target.id].vengeanceDuration = buff.duration;
              addCombatLog({ type: 'system', message: `${target.name} is filled with vengeance! +${Math.round(buff.damageBonus * 100)}% damage, +${Math.round(buff.lifesteal * 100)}% lifesteal!` });
              addEffect({ type: 'buffAura', position: target.position, color: '#ef4444' });
            }
          }
        }
      }
    }

    // Elite monster lifesteal (Vampiric affix)
    if (!actor.isHero && actor.passive?.lifesteal > 0) {
      const actorMonsterIdx = findMonsterIndex(actor.id);
      if (actorMonsterIdx !== -1 && newMonsters[actorMonsterIdx].stats.hp > 0) {
        const lifestealAmount = Math.floor(reducedDmg * actor.passive.lifesteal);
        if (lifestealAmount > 0) {
          const actualHeal = Math.min(lifestealAmount, newMonsters[actorMonsterIdx].stats.maxHp - newMonsters[actorMonsterIdx].stats.hp);
          if (actualHeal > 0) {
            newMonsters[actorMonsterIdx].stats.hp += actualHeal;
            addCombatLog({ type: 'system', message: `${actor.name} drains ${actualHeal} HP!` });
            addEffect({ type: 'damage', position: actor.position, damage: actualHeal, isHeal: true });
          }
        }
      }
    }
  }

  // Reactive taunt (Righteous Defense)
  if (reducedDmg > 0) {
    const reactiveTaunt = checkReactiveTaunt(aliveHeroes, target.id);
    if (reactiveTaunt.triggered) {
      if (!newBuffs[reactiveTaunt.heroId]) newBuffs[reactiveTaunt.heroId] = {};
      newBuffs[reactiveTaunt.heroId].taunt = 2;
      addCombatLog({ type: 'system', message: `${reactiveTaunt.skillName}! ${reactiveTaunt.heroName} taunts the attacker!` });
      addEffect({ type: 'buffAura', position: newHeroes.find(h => h.id === reactiveTaunt.heroId)?.position, color: '#ef4444' });
    }

    // Living seed trigger (Druid Living Seed)
    const lsTargetBuffs = newBuffs[target.id] || {};
    if (lsTargetBuffs.livingSeed) {
      let seedHeal = Math.floor(target.stats.maxHp * lsTargetBuffs.livingSeed);
      const seedHealReduction = targetHeroData ? getHeroHealingReduction(targetHeroData) : 0;
      if (seedHealReduction > 0) seedHeal = Math.floor(seedHeal * (1 - seedHealReduction));
      if (targetHeroIdx !== -1 && seedHeal > 0) {
        const actualSeedHeal = Math.min(seedHeal, newHeroes[targetHeroIdx].stats.maxHp - newHeroes[targetHeroIdx].stats.hp);
        if (actualSeedHeal > 0) {
          newHeroes[targetHeroIdx].stats.hp += actualSeedHeal;
          addEffect({ type: 'damage', position: target.position, damage: actualSeedHeal, isHeal: true });
          addCombatLog({ type: 'system', message: `Living Seed! ${target.name} heals ${actualSeedHeal} HP` });
          ctx.healingReceivedByHero[target.id] = (ctx.healingReceivedByHero[target.id] || 0) + actualSeedHeal;
          if (lsTargetBuffs.livingSeedCaster) {
            ctx.healingDoneByHero[lsTargetBuffs.livingSeedCaster] = (ctx.healingDoneByHero[lsTargetBuffs.livingSeedCaster] || 0) + actualSeedHeal;
          }
        }
      }
      delete newBuffs[target.id].livingSeed;
      delete newBuffs[target.id].livingSeedCaster;
    }

    // Reactive heals after hero takes damage
    if (targetHeroIdx !== -1 && newHeroes[targetHeroIdx].stats.hp > 0) {
      for (const healer of aliveHeroes) {
        if (healer.stats.hp <= 0) continue;
        const healerHeroIdx = findHeroIndex(healer.id);
        if (healerHeroIdx === -1) continue;
        const reactiveResult = checkReactiveHeal(newHeroes[healerHeroIdx], newHeroes[targetHeroIdx]);
        if (reactiveResult.triggered) {
          if (reactiveResult.selfOnly && healer.id !== target.id) continue;
          if (reactiveResult.preventDeath) continue;
          const healAmount = Math.floor(newHeroes[targetHeroIdx].stats.maxHp * reactiveResult.healPercent);
          const actualHeal = Math.min(healAmount, newHeroes[targetHeroIdx].stats.maxHp - newHeroes[targetHeroIdx].stats.hp);
          if (actualHeal > 0) {
            newHeroes[targetHeroIdx].stats.hp += actualHeal;
            addCombatLog({ type: 'system', message: `${reactiveResult.skillName}! ${newHeroes[targetHeroIdx].name} heals ${actualHeal} HP` });
            addEffect({ type: 'damage', position: target.position, damage: actualHeal, isHeal: true });
            ctx.healingDoneByHero[healer.id] = (ctx.healingDoneByHero[healer.id] || 0) + actualHeal;
            ctx.healingReceivedByHero[target.id] = (ctx.healingReceivedByHero[target.id] || 0) + actualHeal;
          }
          break;
        }
      }
    }

    // Apply onHitStatus from monster (Venomous, Burning, etc.)
    if (!actor.isHero && actor.onHitStatus) {
      const statusToApply = actor.onHitStatus;
      if (hasCCImmunity(target, statusToApply.id)) {
        addCombatLog({ type: 'system', message: `${target.name} is immune to ${statusToApply.id}!` });
      } else {
        if (!newStatusEffects[target.id]) newStatusEffects[target.id] = [];
        const existingStatus = newStatusEffects[target.id].find(s => s.id === statusToApply.id);
        if (existingStatus) {
          existingStatus.duration = Math.max(existingStatus.duration, statusToApply.duration);
        } else {
          newStatusEffects[target.id].push({ ...statusToApply, appliedBy: actor.id });
        }
        addCombatLog({ type: 'system', message: `${target.name} is afflicted with ${statusToApply.id}!` });
        addEffect({ type: 'status', position: target.position, statusId: statusToApply.id });
      }
    }
  }

  // Apply thorns damage reflection
  if (reflectDamage > 0) {
    const actorMonsterIdx = findMonsterIndex(actor.id);
    if (actorMonsterIdx !== -1) {
      newMonsters[actorMonsterIdx].stats.hp = Math.max(0, newMonsters[actorMonsterIdx].stats.hp - reflectDamage);
    }
    addCombatLog({ type: 'system', message: `Thorns! ${actor.name} takes ${reflectDamage} damage!` });
    addEffect({ type: 'damage', position: actor.position, damage: reflectDamage });
  }

  // Counter-attack from skill passive
  if (shouldCounterAttack && actor.stats.hp > 0) {
    const counterDmg = Math.max(1, Math.floor(target.stats.attack * COUNTER_ATTACK_DAMAGE));
    const actorMonsterIdx = findMonsterIndex(actor.id);
    if (actorMonsterIdx !== -1) {
      newMonsters[actorMonsterIdx].stats.hp = Math.max(0, newMonsters[actorMonsterIdx].stats.hp - counterDmg);
    }
    addCombatLog({ type: 'system', message: `Counter! ${target.name} strikes back for ${counterDmg}!` });
    addEffect({ type: 'beam', from: target.position, to: actor.position, attackerClass: target.classId });
    addEffect({ type: 'damage', position: actor.position, damage: counterDmg });
  }

  // Check for death or phoenix revive
  const targetNewHp = targetHeroIdx !== -1 ? newHeroes[targetHeroIdx].stats.hp : 0;
  if (targetNewHp <= 0) {
    // Check for save_ally (Paladin Divine Intervention)
    let savedByAlly = false;
    for (const healer of aliveHeroes) {
      if (healer.stats.hp <= 0 || healer.id === target.id) continue;
      const saveResult = checkReactiveHeal(healer, newHeroes[targetHeroIdx]);
      if (saveResult.triggered && saveResult.preventDeath && !newReactiveHealUsed[healer.id]) {
        newReactiveHealUsed[healer.id] = true;
        const healAmount = Math.floor(target.stats.maxHp * saveResult.healPercent);
        if (targetHeroIdx !== -1) {
          newHeroes[targetHeroIdx].stats.hp = healAmount;
        }
        addCombatLog({ type: 'system', message: `${saveResult.skillName}! ${healer.name} saves ${target.name} with ${healAmount} HP!` });
        addEffect({ type: 'damage', position: target.position, damage: healAmount, isHeal: true });
        ctx.healingDoneByHero[healer.id] = (ctx.healingDoneByHero[healer.id] || 0) + healAmount;
        ctx.healingReceivedByHero[target.id] = (ctx.healingReceivedByHero[target.id] || 0) + healAmount;
        savedByAlly = true;
        break;
      }
    }
    if (!savedByAlly) {
      const resScroll = hasResurrectionScroll();
      if (resScroll) {
        const scroll = consumeResurrectionScroll();
        const reviveHp = Math.floor(target.stats.maxHp * scroll.reviveHpPercent);
        if (targetHeroIdx !== -1) {
          newHeroes[targetHeroIdx].stats.hp = reviveHp;
        }
        addCombatLog({ type: 'system', message: `Resurrection Scroll! ${target.name} is restored with ${reviveHp} HP!` });
        addEffect({ type: 'healBurst', position: target.position });
      } else {
        const phoenixRevive = targetHeroData ? checkPhoenixRevive(targetHeroData, newUsedPhoenixRevives) : null;
        if (phoenixRevive) {
          const reviveHp = Math.floor(target.stats.maxHp * phoenixRevive.hpPercent);
          if (targetHeroIdx !== -1) {
            newHeroes[targetHeroIdx].stats.hp = reviveHp;
          }
          newUsedPhoenixRevives[target.id] = true;
          addCombatLog({ type: 'system', message: `Phoenix Feather! ${target.name} rises from the ashes with ${reviveHp} HP!` });
          addEffect({ type: 'healBurst', position: target.position });
        } else {
          const preDeathHpRatio = (targetNewHp + reducedDmg) / target.stats.maxHp;
          const skillCheatDeath = checkCheatDeath(target, { cheatDeathUsed: new Set(Object.keys(newUsedPhoenixRevives)), preDeathHpRatio });
          if (skillCheatDeath.triggered) {
            const reviveHp = skillCheatDeath.healPercent
              ? Math.floor(target.stats.maxHp * skillCheatDeath.healPercent)
              : 1;
            if (targetHeroIdx !== -1) {
              newHeroes[targetHeroIdx].stats.hp = reviveHp;
            }
            newUsedPhoenixRevives[target.id] = true;
            addCombatLog({ type: 'system', message: `${skillCheatDeath.skillName}! ${target.name} refuses to fall!` });
            addEffect({ type: 'healBurst', position: target.position });
          } else {
            const uniqueCheatDeath = processOnDeathUniques(
              { ...targetHeroData, stats: target.stats }, {}
            );
            if (uniqueCheatDeath.preventDeath) {
              const reviveHp = uniqueCheatDeath.healAmount || 1;
              if (targetHeroIdx !== -1) {
                newHeroes[targetHeroIdx].stats.hp = Math.min(reviveHp, target.stats.maxHp);
              }
              addCombatLog({ type: 'system', message: `Unique power saves ${target.name}! Restored to ${reviveHp} HP!` });
              addEffect({ type: 'healBurst', position: target.position });

              if (uniqueCheatDeath.invulnerableTurns > 0) {
                if (!newBuffs[target.id]) newBuffs[target.id] = {};
                newBuffs[target.id].invulnerable = uniqueCheatDeath.invulnerableTurns;
                addCombatLog({ type: 'system', message: `${target.name} becomes invulnerable for ${uniqueCheatDeath.invulnerableTurns} turns!` });
              }
            } else {
              addCombatLog({ type: 'death', target: { name: target.name }, isHero: true });
              addEffect({ type: 'death', position: target.position, isHero: true, classId: target.classId });
              handleUnitDeath(ctx, target.id);

              // Check for vengeance triggers on surviving heroes
              const deadHeroCount = newHeroes.filter(h => h.stats.hp <= 0).length;
              for (const hero of newHeroes) {
                if (hero.stats.hp > 0 && hero.id !== target.id) {
                  const vengeance = checkVengeanceTrigger(hero, deadHeroCount);
                  if (vengeance.triggered) {
                    if (!newBuffs[hero.id]) newBuffs[hero.id] = {};
                    newBuffs[hero.id].vengeanceDamageBonus = vengeance.damageBonus;
                    newBuffs[hero.id].vengeanceDuration = vengeance.duration;
                    addCombatLog({ type: 'system', message: `${hero.name} is filled with vengeance! +${Math.round(vengeance.damageBonus * 100)}% damage!` });
                    addEffect({ type: 'buffAura', position: hero.position, color: '#ef4444' });
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

/**
 * Resolve damage when a monster is the target of a basic attack.
 * Handles damage amp, boss immunity/shields, phase transitions, on-hit effects, lifesteal, kill rewards.
 * Mutates ctx.
 */
export const resolveMonsterTargetDamage = (ctx, actor, target, attackResult) => {
  const {
    newHeroes, newMonsters, newBuffs, newStatusEffects,
    newSkillCooldowns, newKillBonusStacks, newTurnOrder,
    activeCombatMonsters, heroes,
    dungeon, dungeonProgress, roomCombat,
    findHeroIndex, findMonsterIndex,
    addCombatLog, addEffect, incrementStat,
    addGold, addXpToHero, processLootDrop, handleUniqueDrop, addConsumable,
    goldMultiplier, xpMultiplier,
    defeatWingBoss, completeRaid, pauseCombat, getOwnedUniques,
  } = ctx;
  const { dmg, isCrit, passiveBonuses, uniqueBonuses, heroData } = attackResult;

  // Check for damage amplification debuff (Hunter's Mark)
  const targetDebuffs = newBuffs[target.id] || {};
  let finalDmg = dmg;
  if (targetDebuffs.damageAmp) {
    finalDmg = Math.floor(dmg * (1 + targetDebuffs.damageAmp));
  }

  const targetMonsterIdx = findMonsterIndex(target.id);
  const oldMonsterHp = targetMonsterIdx !== -1 ? newMonsters[targetMonsterIdx].stats.hp : 0;

  // Check boss immunity and damage reduction
  let actualDmg = finalDmg;
  if ((target.isBoss || target.isWorldBoss) && target.phases) {
    const bossState = getBossState(target.id);
    if (bossState && isBossImmune(target, roomCombat.turn || 0)) {
      actualDmg = 0;
      addCombatLog({ type: 'system', message: `${target.name} is immune to damage!` });
    } else {
      const phaseDamageReduction = getBossPhaseDamageReduction(target);
      if (phaseDamageReduction > 0) {
        actualDmg = Math.floor(actualDmg * (1 - phaseDamageReduction));
      }
    }
  }

  // Handle elite monster shield absorption
  if (targetMonsterIdx !== -1 && actualDmg > 0 && newMonsters[targetMonsterIdx].shield > 0) {
    const shieldAmount = newMonsters[targetMonsterIdx].shield;
    const shieldAbsorbed = Math.min(shieldAmount, actualDmg);
    newMonsters[targetMonsterIdx].shield = shieldAmount - shieldAbsorbed;
    actualDmg = actualDmg - shieldAbsorbed;
    if (shieldAbsorbed > 0) {
      addCombatLog({ type: 'system', message: `${target.name}'s shield absorbs ${shieldAbsorbed} damage!` });
      if (newMonsters[targetMonsterIdx].shield <= 0) {
        addCombatLog({ type: 'system', message: `${target.name}'s shield is broken!` });
        addEffect({ type: 'buffAura', position: target.position, color: '#6495ed' });
      }
    }
  }

  if (targetMonsterIdx !== -1 && actualDmg > 0) {
    newMonsters[targetMonsterIdx].stats.hp = Math.max(0, oldMonsterHp - actualDmg);
  }
  const currentMonsterHpAfterDmg = targetMonsterIdx !== -1 ? newMonsters[targetMonsterIdx].stats.hp : 0;

  // Check boss phase transitions
  if ((target.isBoss || target.isWorldBoss) && target.phases && currentMonsterHpAfterDmg > 0 && targetMonsterIdx !== -1) {
    const phaseResult = checkPhaseTransition(target, currentMonsterHpAfterDmg, target.stats.maxHp);
    if (phaseResult) {
      addCombatLog({ type: 'system', message: phaseResult.message });
      pauseCombat(2500);
      addEffect({
        type: 'phaseTransition', position: target.position, message: phaseResult.message,
        bossName: target.name, enraged: phaseResult.enraged || false, passive: phaseResult.newPhase?.passive || null,
      });

      if (phaseResult.enraged) {
        setBossEnraged(target, true);
        addCombatLog({ type: 'system', message: `${target.name} becomes ENRAGED!` });
      }

      if (phaseResult.onPhaseStart) {
        const phaseActions = processPhaseStartActions(target, phaseResult.onPhaseStart, {
          scaleFactor: dungeon.level * 0.5, currentTurn: roomCombat.turn || 0,
        });
        if (phaseActions.summonedMonsters.length > 0) {
          for (const add of phaseActions.summonedMonsters) {
            newMonsters.push(add);
            newTurnOrder.push(add.id);
            addCombatLog({ type: 'system', message: `${target.name} summons ${add.name}!` });
            addEffect({ type: 'healBurst', position: add.position });
          }
        }
        if (phaseActions.immunityGranted) {
          addCombatLog({ type: 'system', message: phaseActions.immunityMessage });
        }
      }
    }
  }

  // Trigger on_damage abilities (Enrage) if monster survived
  if (currentMonsterHpAfterDmg > 0 && targetMonsterIdx !== -1) {
    handleMonsterDamageTriggers(ctx, newMonsters[targetMonsterIdx], targetMonsterIdx);
  }

  // Apply monster reflectDamage passive (Thorny affix)
  if (target.passive?.reflectDamage && actor.isHero) {
    const reflectedDmg = Math.floor(finalDmg * target.passive.reflectDamage);
    if (reflectedDmg > 0) {
      const attackerHeroIdx = findHeroIndex(actor.id);
      if (attackerHeroIdx !== -1) {
        newHeroes[attackerHeroIdx].stats.hp = Math.max(1, newHeroes[attackerHeroIdx].stats.hp - reflectedDmg);
        addCombatLog({ type: 'system', message: `${target.name}'s thorns reflect ${reflectedDmg} damage to ${actor.name}!` });
        addEffect({ type: 'damage', position: actor.position, damage: reflectedDmg });
      }
    }
  }

  // Track damage dealt
  ctx.totalDamageDealtThisTurn += finalDmg;

  // Apply hpCostPerAttack (Life Tap passive)
  if (actor.isHero && passiveBonuses.hpCostPerAttack > 0) {
    const actorHeroIdx = findHeroIndex(actor.id);
    if (actorHeroIdx !== -1) {
      const hpCost = Math.floor(actor.stats.maxHp * (passiveBonuses.hpCostPerAttack / 100));
      const actualCost = Math.min(hpCost, newHeroes[actorHeroIdx].stats.hp - 1);
      if (actualCost > 0) {
        newHeroes[actorHeroIdx].stats.hp -= actualCost;
        addCombatLog({ type: 'system', message: `Life Tap! ${actor.name} sacrifices ${actualCost} HP` });
      }
    }
  }

  const newMonsterHp = targetMonsterIdx !== -1 ? newMonsters[targetMonsterIdx].stats.hp : 0;
  const targetKilled = oldMonsterHp > 0 && newMonsterHp <= 0;

  // Process ON_HIT affixes for heroes
  if (heroData) {
    const onHitResult = processOnHitAffixes(heroData, dmg, target, isCrit);
    let totalLifesteal = onHitResult.lifestealAmount || 0;

    const skillOnHitEffects = getOnHitEffects(actor, dmg);
    totalLifesteal += skillOnHitEffects.healAmount;

    if (totalLifesteal > 0) {
      const actorHeroIdx = findHeroIndex(actor.id);
      const currentHp = actorHeroIdx !== -1 ? newHeroes[actorHeroIdx].stats.hp : 0;
      const maxHp = actorHeroIdx !== -1 ? newHeroes[actorHeroIdx].stats.maxHp : 0;
      const healAmount = Math.min(totalLifesteal, maxHp - currentHp);
      if (healAmount > 0 && actorHeroIdx !== -1) {
        newHeroes[actorHeroIdx].stats.hp = Math.min(maxHp, currentHp + healAmount);
        addCombatLog({ type: 'system', message: `Lifesteal! ${actor.name} drains ${healAmount} HP` });
        ctx.healingDoneByHero[actor.id] = (ctx.healingDoneByHero[actor.id] || 0) + healAmount;
        ctx.healingReceivedByHero[actor.id] = (ctx.healingReceivedByHero[actor.id] || 0) + healAmount;
      }
    }

    // Apply status effects from on-hit procs
    for (const statusToApply of onHitResult.statusesToApply) {
      const mockTarget = { ...target, statusEffects: newStatusEffects[target.id] || [] };
      const statusResult = applyStatusEffect(mockTarget, statusToApply.id, actor, {
        duration: statusToApply.duration, stacks: statusToApply.stacks,
      });
      newStatusEffects[target.id] = statusResult.effects;
      const statusDef = STATUS_EFFECTS[statusToApply.id];
      if (statusDef) {
        addCombatLog({ type: 'system', message: `${target.name} is ${statusDef.name.toLowerCase()}!` });
      }
    }

    // Process chain lightning
    if (onHitResult.chainDamage) {
      const chainTargets = activeCombatMonsters
        .filter(m => m.id !== target.id && m.stats.hp > 0)
        .slice(0, onHitResult.chainDamage.targets);
      const chainDmg = Math.floor(dmg * onHitResult.chainDamage.damagePercent);

      for (const chainTarget of chainTargets) {
        const chainIdx = findMonsterIndex(chainTarget.id);
        if (chainIdx !== -1) {
          newMonsters[chainIdx].stats.hp = Math.max(0, newMonsters[chainIdx].stats.hp - chainDmg);
          ctx.totalDamageDealtThisTurn += chainDmg;
        }
        addCombatLog({ type: 'system', message: `Lightning chains to ${chainTarget.name} for ${chainDmg}!` });
        addEffect({ type: 'beam', from: target.position, to: chainTarget.position, attackerClass: 'mage' });
        addEffect({ type: 'damage', position: chainTarget.position, damage: chainDmg });
      }
    }

    // Process unique item ON_HIT effects
    const actorBuffs = newBuffs[actor.id] || {};
    const otherEnemies = activeCombatMonsters.filter(m => m.id !== target.id && m.stats.hp > 0);
    const uniqueOnHitResult = processOnHitUniques(
      { ...heroData, stats: actor.stats }, target, dmg, { otherEnemies }
    );

    // Apply unique lifesteal
    const totalUniqueLifesteal = (uniqueBonuses.lifesteal || 0) + (actorBuffs.vengeanceLifesteal || 0);
    if (totalUniqueLifesteal > 0) {
      const uniqueLifestealAmount = Math.floor(dmg * totalUniqueLifesteal);
      if (uniqueLifestealAmount > 0) {
        const actorHeroIdx = findHeroIndex(actor.id);
        if (actorHeroIdx !== -1) {
          const currentHp = newHeroes[actorHeroIdx].stats.hp;
          const maxHp = newHeroes[actorHeroIdx].stats.maxHp;
          const healAmount = Math.min(uniqueLifestealAmount, maxHp - currentHp);
          if (healAmount > 0) {
            newHeroes[actorHeroIdx].stats.hp = Math.min(maxHp, currentHp + healAmount);
            addCombatLog({ type: 'system', message: `${actorBuffs.vengeanceLifesteal ? 'Vengeance drain' : "Vampire's Embrace"}! ${actor.name} drains ${healAmount} HP` });
            ctx.healingDoneByHero[actor.id] = (ctx.healingDoneByHero[actor.id] || 0) + healAmount;
            ctx.healingReceivedByHero[actor.id] = (ctx.healingReceivedByHero[actor.id] || 0) + healAmount;
          }
        }
      }
    }

    // Apply unique bonus damage
    if (uniqueOnHitResult.bonusDamage > 0 && targetMonsterIdx !== -1) {
      const bonusDmg = Math.floor(uniqueOnHitResult.bonusDamage);
      newMonsters[targetMonsterIdx].stats.hp = Math.max(0, newMonsters[targetMonsterIdx].stats.hp - bonusDmg);
      ctx.totalDamageDealtThisTurn += bonusDmg;
      addCombatLog({ type: 'system', message: `Unique power deals ${bonusDmg} bonus damage!` });
    }

    // Apply unique healing
    if (uniqueOnHitResult.healing > 0) {
      const actorHeroIdx = findHeroIndex(actor.id);
      if (actorHeroIdx !== -1) {
        const currentHp = newHeroes[actorHeroIdx].stats.hp;
        const maxHp = newHeroes[actorHeroIdx].stats.maxHp;
        const healAmount = Math.min(Math.floor(uniqueOnHitResult.healing), maxHp - currentHp);
        if (healAmount > 0) {
          newHeroes[actorHeroIdx].stats.hp = Math.min(maxHp, currentHp + healAmount);
          addEffect({ type: 'damage', position: actor.position, damage: healAmount, isHeal: true });
        }
      }
    }

    // Apply Blood Pendant party lifesteal
    if (ctx.totalDamageDealtThisTurn > 0) {
      for (const hero of heroes) {
        if (hero.id === actor.id) continue;
        const partyDmgResult = processOnPartyDamageUniques(hero, ctx.totalDamageDealtThisTurn, {});
        if (partyDmgResult.healing > 0) {
          const hIdx = findHeroIndex(hero.id);
          if (hIdx !== -1) {
            const currentHp = newHeroes[hIdx].stats.hp;
            const maxHp = newHeroes[hIdx].stats.maxHp;
            const healAmount = Math.min(Math.floor(partyDmgResult.healing), maxHp - currentHp);
            if (healAmount > 0) {
              newHeroes[hIdx].stats.hp = Math.min(maxHp, currentHp + healAmount);
              addEffect({ type: 'damage', position: hero.position || actor.position, damage: healAmount, isHeal: true });
            }
          }
        }
      }
    }

    // Apply unique chain attacks (Stormcaller's Rod)
    if (uniqueOnHitResult.chainTargets.length > 0 && uniqueOnHitResult.chainDamage > 0) {
      for (const chainTarget of uniqueOnHitResult.chainTargets) {
        const chainIdx = findMonsterIndex(chainTarget.id);
        if (chainIdx !== -1) {
          const chainDmg = Math.floor(uniqueOnHitResult.chainDamage);
          newMonsters[chainIdx].stats.hp = Math.max(0, newMonsters[chainIdx].stats.hp - chainDmg);
          ctx.totalDamageDealtThisTurn += chainDmg;
          addCombatLog({ type: 'system', message: `Chain lightning hits ${chainTarget.name} for ${chainDmg}!` });
          addEffect({ type: 'beam', from: target.position, to: chainTarget.position, attackerClass: 'mage' });
          addEffect({ type: 'damage', position: chainTarget.position, damage: chainDmg });
        }
      }
    }

    // Apply status effects from unique on-hit
    if (uniqueOnHitResult.statusToApply.length > 0) {
      for (const statusEntry of uniqueOnHitResult.statusToApply) {
        if (statusEntry.target) continue;
        const mockTarget = { ...target, statusEffects: newStatusEffects[target.id] || [] };
        const statusResult = applyStatusEffect(mockTarget, statusEntry.id, actor, { duration: statusEntry.duration });
        newStatusEffects[target.id] = statusResult.effects;
        const statusDef = STATUS_EFFECTS[statusEntry.id];
        if (statusDef) {
          addCombatLog({ type: 'system', message: `${target.name} is ${statusDef.name.toLowerCase()}!` });
        }
      }
    }

    // Apply max HP reduction from unique on-hit (Entropy)
    if (uniqueOnHitResult.maxHpReduction > 0 && targetMonsterIdx !== -1) {
      const reduction = Math.floor(newMonsters[targetMonsterIdx].stats.maxHp * uniqueOnHitResult.maxHpReduction);
      if (reduction > 0) {
        newMonsters[targetMonsterIdx].stats.maxHp -= reduction;
        newMonsters[targetMonsterIdx].stats.hp = Math.min(newMonsters[targetMonsterIdx].stats.hp, newMonsters[targetMonsterIdx].stats.maxHp);
        addCombatLog({ type: 'system', message: `Entropy reduces ${target.name}'s max HP by ${reduction}!` });
        addEffect({ type: 'status', position: target.position, status: 'debuff' });
      }
    }

    // Apply freeze-all-enemies (Staff of Eternal Frost)
    if (uniqueOnHitResult.freezeAllEnemies) {
      const freezeDuration = uniqueOnHitResult.freezeAllEnemies.duration;
      for (const monster of activeCombatMonsters) {
        if (monster.stats.hp <= 0) continue;
        const mockMonster = { ...monster, statusEffects: newStatusEffects[monster.id] || [] };
        const freezeResult = applyStatusEffect(mockMonster, 'freeze', actor, { duration: freezeDuration });
        newStatusEffects[monster.id] = freezeResult.effects;
      }
      addCombatLog({ type: 'system', message: `Absolute Zero! All enemies are frozen for ${freezeDuration} turns!` });
      addEffect({ type: 'buffAura', position: actor.position, color: '#93c5fd' });
    }

    // Process ON_CRIT effects
    if (isCrit) {
      const critAffixResult = processOnCritAffixes(heroData, dmg, target);
      for (const statusToApply of critAffixResult.statusesToApply) {
        const mockTarget = { ...target, statusEffects: newStatusEffects[target.id] || [] };
        const statusResult = applyStatusEffect(mockTarget, statusToApply.id, actor, {
          duration: statusToApply.duration, stacks: statusToApply.stacks,
        });
        newStatusEffects[target.id] = statusResult.effects;
        const statusDef = STATUS_EFFECTS[statusToApply.id];
        if (statusDef) {
          addCombatLog({ type: 'system', message: `Critical hit causes ${statusDef.name.toLowerCase()}!` });
        }
      }

      const uniqueCritResult = processOnCritUniques({ ...heroData, stats: actor.stats }, target, dmg, {});

      // Apply chain attack (Serpent's Fang)
      if (uniqueCritResult.chainAttack && targetMonsterIdx !== -1) {
        let currentChainDmg = Math.floor(uniqueCritResult.chainAttack.damage);
        let chainCount = 0;
        const canChainInfinite = uniqueCritResult.chainAttack.canChain;

        while (currentChainDmg > 0 && newMonsters[targetMonsterIdx].stats.hp > 0 && chainCount < CHAIN_ATTACK_MAX) {
          newMonsters[targetMonsterIdx].stats.hp = Math.max(0, newMonsters[targetMonsterIdx].stats.hp - currentChainDmg);
          ctx.totalDamageDealtThisTurn += currentChainDmg;
          chainCount++;
          addCombatLog({ type: 'system', message: `Chain Strike x${chainCount}! ${actor.name} hits for ${currentChainDmg}!` });
          addEffect({ type: 'beam', from: actor.position, to: target.position, attackerClass: actor.classId });
          addEffect({ type: 'damage', position: target.position, damage: currentChainDmg });

          if (!canChainInfinite || Math.random() >= CHAIN_ATTACK_CONTINUE_CHANCE) break;
          currentChainDmg = Math.floor(currentChainDmg * CHAIN_ATTACK_DECAY);
        }
      }

      if (uniqueCritResult.bonusDamage > 0 && targetMonsterIdx !== -1) {
        const bonusDmg = Math.floor(uniqueCritResult.bonusDamage);
        newMonsters[targetMonsterIdx].stats.hp = Math.max(0, newMonsters[targetMonsterIdx].stats.hp - bonusDmg);
        ctx.totalDamageDealtThisTurn += bonusDmg;
      }

      if (uniqueCritResult.buffsToApply.length > 0) {
        if (!newBuffs[actor.id]) newBuffs[actor.id] = {};
        for (const buff of uniqueCritResult.buffsToApply) {
          if (buff.id === 'invisible') {
            newBuffs[actor.id].invisible = true;
            newBuffs[actor.id].invisibleDuration = buff.duration || 1;
            const sfState = getUniqueState(actor.id);
            sfState.isInvisible = true;
            sfState.invisibleTurns = buff.duration || 1;
            addCombatLog({ type: 'system', message: `${actor.name} vanishes into the shadows!` });
            addEffect({ type: 'buffAura', position: actor.position, color: '#374151' });
          }
        }
      }
    }
  }

  if (targetKilled) {
    newKillBonusStacks[actor.id] = (newKillBonusStacks[actor.id] || 0) + 1;
  }

  if (targetKilled) {
    addCombatLog({ type: 'death', target: { name: target.name }, isHero: false });
    addEffect({ type: 'death', position: target.position, isHero: false, monsterId: target.templateId });
    handleUnitDeath(ctx, target.id, target);

    // Magma Core: burning enemy explodes on death
    if (heroData) {
      const killerUniquesForExplosion = getHeroUniqueItems(heroData);
      const hasMagmaCore = killerUniquesForExplosion.some(item => item.uniquePower?.effect?.onBurnDeathExplosion);
      const targetBurning = (newStatusEffects[target.id] || []).some(e => e.id === 'burn');
      if (hasMagmaCore && targetBurning) {
        const magmaCoreItem = killerUniquesForExplosion.find(item => item.uniquePower?.effect?.onBurnDeathExplosion);
        const explosionPercent = magmaCoreItem.uniquePower.effect.onBurnDeathExplosion;
        const explosionRange = magmaCoreItem.uniquePower.effect.explosionRange || 2;
        const explosionDmg = Math.floor(target.stats.maxHp * explosionPercent);
        const nearbyEnemies = activeCombatMonsters.filter(m =>
          m.id !== target.id && m.stats.hp > 0 &&
          getDistance(target.position, m.position) <= explosionRange
        );
        if (nearbyEnemies.length > 0 && explosionDmg > 0) {
          addCombatLog({ type: 'system', message: `Magma Core! ${target.name} explodes for ${explosionDmg} damage!` });
          addEffect({ type: 'buffAura', position: target.position, color: '#ef4444' });
          for (const nearbyEnemy of nearbyEnemies) {
            const nearbyIdx = findMonsterIndex(nearbyEnemy.id);
            if (nearbyIdx !== -1) {
              newMonsters[nearbyIdx].stats.hp = Math.max(0, newMonsters[nearbyIdx].stats.hp - explosionDmg);
              ctx.totalDamageDealtThisTurn += explosionDmg;
              addCombatLog({ type: 'system', message: `Explosion hits ${nearbyEnemy.name} for ${explosionDmg}!` });
              addEffect({ type: 'damage', position: nearbyEnemy.position, damage: explosionDmg });
              if (newMonsters[nearbyIdx].stats.hp <= 0) {
                addCombatLog({ type: 'death', target: { name: nearbyEnemy.name }, isHero: false });
                addEffect({ type: 'death', position: nearbyEnemy.position, isHero: false, monsterId: nearbyEnemy.templateId });
                handleUnitDeath(ctx, nearbyEnemy.id, nearbyEnemy);
                incrementStat('totalMonstersKilled', 1, { heroId: actor.ownerId || actor.id, monsterId: nearbyEnemy.templateId, isBoss: nearbyEnemy.isBoss });
              }
            }
          }
        }
      }
    }

    // Process ON_KILL affixes
    if (heroData) {
      const onKillResult = processOnKillAffixes(heroData);
      if (onKillResult.buffs.length > 0) {
        if (!newBuffs[actor.id]) newBuffs[actor.id] = {};
        for (const buff of onKillResult.buffs) {
          if (buff.stat === 'speed') {
            newBuffs[actor.id].affixSpeedBonus = (newBuffs[actor.id].affixSpeedBonus || 0) + buff.amount;
            newBuffs[actor.id].affixSpeedDuration = buff.duration;
            addCombatLog({ type: 'system', message: `${actor.name} gains speed from the kill!` });
          } else if (buff.stat === 'attack') {
            newBuffs[actor.id].affixAttackBonus = buff.percent;
            newBuffs[actor.id].affixAttackDuration = buff.duration;
            addCombatLog({ type: 'system', message: `${actor.name} gains attack from the kill!` });
          }
        }
      }

      const skillOnKillEffects = getOnKillEffects(actor);
      if (skillOnKillEffects.healAmount > 0 || skillOnKillEffects.healPercent > 0) {
        const actorHeroIdx = findHeroIndex(actor.id);
        if (actorHeroIdx !== -1) {
          const currentHp = newHeroes[actorHeroIdx].stats.hp;
          const maxHp = newHeroes[actorHeroIdx].stats.maxHp;
          let healAmount = skillOnKillEffects.healAmount + Math.floor(maxHp * skillOnKillEffects.healPercent);
          const killHealReduction = getHeroHealingReduction(heroData);
          if (killHealReduction > 0) healAmount = Math.floor(healAmount * (1 - killHealReduction));
          const actualHeal = Math.min(healAmount, maxHp - currentHp);
          if (actualHeal > 0) {
            newHeroes[actorHeroIdx].stats.hp = Math.min(maxHp, currentHp + actualHeal);
            addCombatLog({ type: 'system', message: `${actor.name} heals ${actualHeal} HP on kill!` });
            addEffect({ type: 'damage', position: actor.position, damage: actualHeal, isHeal: true });
            ctx.healingDoneByHero[actor.id] = (ctx.healingDoneByHero[actor.id] || 0) + actualHeal;
            ctx.healingReceivedByHero[actor.id] = (ctx.healingReceivedByHero[actor.id] || 0) + actualHeal;
          }
        }
      }

      if (skillOnKillEffects.stackingHp > 0) {
        const actorHeroIdx = findHeroIndex(actor.id);
        if (actorHeroIdx !== -1) {
          newHeroes[actorHeroIdx].stats.maxHp += skillOnKillEffects.stackingHp;
          newHeroes[actorHeroIdx].stats.hp += skillOnKillEffects.stackingHp;
          addCombatLog({ type: 'system', message: `Soul Harvest! ${actor.name} gains ${skillOnKillEffects.stackingHp} max HP` });
          addEffect({ type: 'damage', position: actor.position, damage: skillOnKillEffects.stackingHp, isHeal: true });
        }
      }

      const killerUniques = getHeroUniqueItems(heroData);
      const hasNullblade = killerUniques.some(item => item.uniquePower?.effect?.preventsResurrection);
      if (hasNullblade && targetMonsterIdx !== -1) {
        newMonsters[targetMonsterIdx].preventResurrection = true;
        addCombatLog({ type: 'system', message: `Nullblade severs ${target.name}'s soul — it cannot be resurrected!` });
      }

      const raiseDeadData = checkRaiseDead(actor);
      if (raiseDeadData.canRaise && !hasNullblade) {
        const raisedUndead = createRaisedUndead(target, raiseDeadData.duration, target.position);
        newHeroes.push(raisedUndead);
        newTurnOrder.push(raisedUndead.id);
        addCombatLog({ type: 'system', message: `${raiseDeadData.skillName}! ${target.name} rises as an undead ally!` });
        addEffect({ type: 'healBurst', position: target.position });
      }

      const uniqueOnKillResult = processOnKillUniques(
        { ...heroData, stats: actor.stats }, target, { usedExtraTurnThisRound: false }
      );

      if (uniqueOnKillResult.extraTurn) {
        addCombatLog({ type: 'system', message: `${actor.name}'s Windrunner grants an extra action!` });
        addEffect({ type: 'buffAura', position: actor.position, color: '#22c55e' });
        if (!newBuffs[actor.id]) newBuffs[actor.id] = {};
        newBuffs[actor.id].extraTurn = true;
      }

      if (uniqueOnKillResult.stacksGained > 0) {
        addCombatLog({ type: 'system', message: `Soul Harvester! ${actor.name} gains power from the kill!` });
        addEffect({ type: 'status', position: actor.position, status: 'buff' });
        const actorIdx = findHeroIndex(actor.id);
        if (actorIdx !== -1) {
          const soulReapBonus = 1 + uniqueOnKillResult.stacksGained * SOUL_REAP_BONUS_PER_STACK;
          const oldMaxHp = newHeroes[actorIdx].stats.maxHp;
          newHeroes[actorIdx].stats.maxHp = Math.floor(oldMaxHp * soulReapBonus);
          newHeroes[actorIdx].stats.hp += Math.floor(oldMaxHp * (soulReapBonus - 1));
        }
      }

      if (uniqueOnKillResult.resetCooldowns) {
        if (!newSkillCooldowns[actor.id]) newSkillCooldowns[actor.id] = {};
        for (const skillId in newSkillCooldowns[actor.id]) {
          newSkillCooldowns[actor.id][skillId] = 0;
        }
        addCombatLog({ type: 'system', message: `${actor.name}'s cooldowns reset!` });
        addEffect({ type: 'buffAura', position: actor.position, color: '#8b5cf6' });
      }
    }

    // Gold and XP rewards
    const baseGold = target.goldReward.min + Math.floor(Math.random() * (target.goldReward.max - target.goldReward.min));
    const gold = Math.floor(baseGold * goldMultiplier);
    addGold(gold);
    const xpPerHero = Math.floor((target.xpReward / heroes.length) * xpMultiplier);
    heroes.forEach(h => addXpToHero(h.id, xpPerHero));
    incrementStat('totalMonstersKilled', 1, { heroId: actor.ownerId || actor.id, monsterId: target.templateId, isBoss: target.isBoss });

    if (target.wingBossId) {
      defeatWingBoss(target.wingBossId);
      addCombatLog({ type: 'system', message: `Wing Boss defeated: ${target.name}!` });
    }
    if (target.finalBossId) {
      defeatWingBoss(target.finalBossId);
      addCombatLog({ type: 'system', message: `FINAL BOSS DEFEATED: ${target.name}! Raid Complete!` });
      setTimeout(() => completeRaid(), 2000);
    }

    if (gold > 0) {
      addEffect({ type: 'goldDrop', position: target.position, amount: gold });
    }

    // Handle loot drops
    const isRaid = dungeonProgress?.currentType === 'raid';
    const isRaidBoss = isRaid && target.isBoss;

    if (isRaidBoss) {
      const targetBossId = target.wingBossId || target.finalBossId;
      const raidBoss = getWingBoss(dungeonProgress.currentRaidId, targetBossId);
      const ownedUniques = getOwnedUniques();
      const raidDrop = rollRaidDrop(raidBoss?.dropTable, ownedUniques);

      if (raidDrop?.type === 'unique') {
        handleUniqueDrop(raidDrop.itemId, target.position);
      } else {
        const item = generateEquipment(dungeon.level, { guaranteedRarity: raidDrop?.rarity || 'epic' });
        const result = processLootDrop(item);
        addEffect({ type: 'lootDrop', position: target.position, slot: item.slot, rarityColor: item.rarityColor || '#9ca3af' });
        if (result.action === 'sold') {
          addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${result.gold}g)` });
        } else if (result.action === 'looted') {
          addCombatLog({ type: 'system', message: `Loot: ${item.name}` });
        } else {
          addCombatLog({ type: 'system', message: `${item.name} (inventory full!)` });
        }
      }
    } else if (target.isWorldBoss) {
      const worldBossLoot = getWorldBossLoot(target);
      if (worldBossLoot.uniqueItemId) {
        handleUniqueDrop(worldBossLoot.uniqueItemId, target.position);
      }
      const item = generateEquipment(dungeon.level, { guaranteedRarity: worldBossLoot.guaranteedRarity });
      const result = processLootDrop(item);
      addEffect({ type: 'lootDrop', position: target.position, slot: item.slot, rarityColor: item.rarityColor || '#9ca3af' });
      if (result.action === 'sold') {
        addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${result.gold}g)` });
      } else if (result.action === 'looted') {
        addCombatLog({ type: 'system', message: `Loot: ${item.name}` });
      } else {
        addCombatLog({ type: 'system', message: `${item.name} (inventory full!)` });
      }
    } else if (target.isElite) {
      const item = generateEquipment(dungeon.level, { guaranteedRarity: ELITE_CONFIG.guaranteedMinRarity });
      const result = processLootDrop(item);
      addEffect({ type: 'lootDrop', position: target.position, slot: item.slot, rarityColor: item.rarityColor || '#9ca3af' });
      if (result.action === 'sold') {
        addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${result.gold}g)` });
      } else if (result.action === 'looted') {
        addCombatLog({ type: 'system', message: `Loot: ${item.name}` });
      } else {
        addCombatLog({ type: 'system', message: `${item.name} (inventory full!)` });
      }
    } else if (Math.random() < (target.isBoss ? BOSS_LOOT_DROP_CHANCE : NORMAL_LOOT_DROP_CHANCE)) {
      const item = generateEquipment(dungeon.level);
      const result = processLootDrop(item);
      addEffect({ type: 'lootDrop', position: target.position, slot: item.slot, rarityColor: item.rarityColor || '#9ca3af' });
      if (result.action === 'sold') {
        addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${result.gold}g)` });
      } else if (result.action === 'looted') {
        if (result.upgradeFor) {
          addCombatLog({ type: 'system', message: `Loot: ${item.name} [Upgrade]` });
        } else {
          addCombatLog({ type: 'system', message: `Loot: ${item.name}` });
        }
      } else {
        addCombatLog({ type: 'system', message: `${item.name} (inventory full!)` });
      }
    }

    // Consumable drops
    const hasDeadPartyMember = newHeroes.some(h => h && h.stats.hp <= 0);
    const consumable = generateConsumableDrop(dungeon.level, hasDeadPartyMember, dungeon.isRaid);
    if (consumable && addConsumable(consumable)) {
      addCombatLog({ type: 'system', message: `Found: ${consumable.name}!` });
    }
  }
};

/**
 * Process double attack - speed-based extra hit against surviving target.
 * Mutates ctx.
 */
export const processDoubleAttack = (ctx, actor, target, attackResult) => {
  const {
    newMonsters,
    dungeon, dungeonProgress,
    findMonsterIndex,
    addCombatLog, addEffect, incrementStat,
    processLootDrop, handleUniqueDrop,
    defeatWingBoss, completeRaid, getOwnedUniques,
  } = ctx;
  const { dmg, passiveBonuses, uniqueBonuses } = attackResult;

  const targetMonsterIdx = findMonsterIndex(target.id);
  const currentMonsterHp = targetMonsterIdx !== -1 ? newMonsters[targetMonsterIdx].stats.hp : 0;
  if (currentMonsterHp <= 0) return;

  const attackerSpeedForDouble = actor.isHero && uniqueBonuses.speedMultiplier ? Math.floor(actor.stats.speed * uniqueBonuses.speedMultiplier) : actor.stats.speed;
  const baseDoubleChance = calculateDoubleAttackChance(attackerSpeedForDouble, target.stats.speed);
  const skillDoubleBonus = passiveBonuses.doubleAttackChance || 0;
  const doubleChance = baseDoubleChance + skillDoubleBonus;
  if (Math.random() >= doubleChance) return;

  const bonusDmg = Math.max(1, Math.floor(dmg * DOUBLE_ATTACK_DAMAGE));
  addCombatLog({ type: 'system', message: `\u26A1 ${actor.name} strikes again! -${bonusDmg}` });

  const hpBeforeBonus = currentMonsterHp;
  if (targetMonsterIdx !== -1) {
    newMonsters[targetMonsterIdx].stats.hp = Math.max(0, hpBeforeBonus - bonusDmg);
    ctx.totalDamageDealtThisTurn += bonusDmg;
  }
  const hpAfterBonus = targetMonsterIdx !== -1 ? newMonsters[targetMonsterIdx].stats.hp : 0;

  addEffect({ type: 'damage', position: target.position, damage: bonusDmg, isHeal: false });

  if (hpBeforeBonus > 0 && hpAfterBonus <= 0) {
    addCombatLog({ type: 'death', target: { name: target.name }, isHero: false });
    addEffect({ type: 'death', position: target.position, isHero: false, monsterId: target.templateId });
    handleUnitDeath(ctx, target.id, target);
    incrementStat('totalMonstersKilled', 1, { heroId: actor.ownerId || actor.id, monsterId: target.templateId, isBoss: target.isBoss });

    if (target.wingBossId) {
      defeatWingBoss(target.wingBossId);
      addCombatLog({ type: 'system', message: `Wing Boss defeated: ${target.name}!` });
    }
    if (target.finalBossId) {
      defeatWingBoss(target.finalBossId);
      addCombatLog({ type: 'system', message: `FINAL BOSS DEFEATED: ${target.name}! Raid Complete!` });
      setTimeout(() => completeRaid(), 2000);
    }

    const isRaidBonusDmg = dungeonProgress?.currentType === 'raid';
    if (isRaidBonusDmg && target.isBoss) {
      const targetBossIdBonus = target.wingBossId || target.finalBossId;
      const raidBossBonus = getWingBoss(dungeonProgress.currentRaidId, targetBossIdBonus);
      const ownedUniquesBonus = getOwnedUniques();
      const raidDropBonus = rollRaidDrop(raidBossBonus?.dropTable, ownedUniquesBonus);

      if (raidDropBonus?.type === 'unique') {
        handleUniqueDrop(raidDropBonus.itemId, target.position);
      } else if (raidDropBonus) {
        const item = generateEquipment(dungeon.level, { guaranteedRarity: raidDropBonus.rarity || 'epic' });
        const lootResult = processLootDrop(item);
        addEffect({ type: 'lootDrop', position: target.position, slot: item.slot, rarityColor: item.rarityColor || '#9ca3af' });
        if (lootResult.action === 'sold') {
          addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${lootResult.gold}g)` });
        } else if (lootResult.action === 'looted') {
          addCombatLog({ type: 'system', message: `Loot: ${item.name}` });
        }
      }
    }
  }

  // Reality Shard double hit
  if (actor.isHero && uniqueBonuses.doubleHitChance > 0 && targetMonsterIdx !== -1 && newMonsters[targetMonsterIdx].stats.hp > 0) {
    if (Math.random() < uniqueBonuses.doubleHitChance) {
      const doubleHitDmg = Math.max(1, Math.floor(dmg));
      newMonsters[targetMonsterIdx].stats.hp = Math.max(0, newMonsters[targetMonsterIdx].stats.hp - doubleHitDmg);
      ctx.totalDamageDealtThisTurn += doubleHitDmg;
      addCombatLog({ type: 'system', message: `Reality Shard! ${actor.name}'s attack hits twice for ${doubleHitDmg}!` });
      addEffect({ type: 'beam', from: actor.position, to: target.position, attackerClass: actor.classId });
      addEffect({ type: 'damage', position: target.position, damage: doubleHitDmg });

      if (newMonsters[targetMonsterIdx].stats.hp <= 0) {
        addCombatLog({ type: 'death', target: { name: target.name }, isHero: false });
        addEffect({ type: 'death', position: target.position, isHero: false, monsterId: target.templateId });
        handleUnitDeath(ctx, target.id, target);
        incrementStat('totalMonstersKilled', 1, { heroId: actor.ownerId || actor.id, monsterId: target.templateId, isBoss: target.isBoss });
      }
    }
  }
};

/**
 * Process AOE attacks (Shaman Ascendance) - hit other enemies.
 * Mutates ctx.
 */
export const processAscendanceAOE = (ctx, actor, target, attackResult) => {
  const {
    newMonsters, newBuffs,
    activeCombatMonsters,
    dungeon, dungeonProgress,
    findMonsterIndex,
    addCombatLog, addEffect, incrementStat,
    processLootDrop, handleUniqueDrop,
    defeatWingBoss, completeRaid, getOwnedUniques,
  } = ctx;
  const { dmg } = attackResult;

  const actorAoeBuff = newBuffs[actor.id] || {};
  if (!actorAoeBuff.aoeAttacks || !actor.isHero) return;

  const otherEnemies = activeCombatMonsters.filter(m => m.id !== target.id && m.stats.hp > 0);
  for (const otherTarget of otherEnemies) {
    const aoeDmg = Math.max(1, Math.floor(dmg * AOE_BUFF_DAMAGE));
    const otherIdx = findMonsterIndex(otherTarget.id);
    if (otherIdx !== -1) {
      const oldHp = newMonsters[otherIdx].stats.hp;
      newMonsters[otherIdx].stats.hp = Math.max(0, oldHp - aoeDmg);
      const newHp = newMonsters[otherIdx].stats.hp;
      ctx.totalDamageDealtThisTurn += aoeDmg;

      addEffect({ type: 'beam', from: actor.position, to: otherTarget.position, attackerClass: actor.classId });
      addEffect({ type: 'damage', position: otherTarget.position, damage: aoeDmg });

      if (oldHp > 0 && newHp <= 0) {
        addCombatLog({ type: 'death', target: { name: otherTarget.name }, isHero: false });
        addEffect({ type: 'death', position: otherTarget.position, isHero: false, monsterId: otherTarget.templateId });
        handleUnitDeath(ctx, otherTarget.id, otherTarget);
        incrementStat('totalMonstersKilled', 1, { heroId: actor.ownerId || actor.id, monsterId: otherTarget.templateId, isBoss: otherTarget.isBoss });

        if (otherTarget.wingBossId) {
          defeatWingBoss(otherTarget.wingBossId);
          addCombatLog({ type: 'system', message: `Wing Boss defeated: ${otherTarget.name}!` });
        }
        if (otherTarget.finalBossId) {
          defeatWingBoss(otherTarget.finalBossId);
          addCombatLog({ type: 'system', message: `FINAL BOSS DEFEATED: ${otherTarget.name}! Raid Complete!` });
          setTimeout(() => completeRaid(), 2000);
        }

        const isRaidAoe = dungeonProgress?.currentType === 'raid';
        if (isRaidAoe && otherTarget.isBoss) {
          const targetBossIdAoe = otherTarget.wingBossId || otherTarget.finalBossId;
          const raidBossAoe = getWingBoss(dungeonProgress.currentRaidId, targetBossIdAoe);
          const ownedUniquesAoe = getOwnedUniques();
          const raidDropAoe = rollRaidDrop(raidBossAoe?.dropTable, ownedUniquesAoe);

          if (raidDropAoe?.type === 'unique') {
            handleUniqueDrop(raidDropAoe.itemId, otherTarget.position);
          } else if (raidDropAoe) {
            const item = generateEquipment(dungeon.level, { guaranteedRarity: raidDropAoe.rarity || 'epic' });
            const lootResult = processLootDrop(item);
            addEffect({ type: 'lootDrop', position: otherTarget.position, slot: item.slot, rarityColor: item.rarityColor || '#9ca3af' });
            if (lootResult.action === 'sold') {
              addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${lootResult.gold}g)` });
            } else if (lootResult.action === 'looted') {
              addCombatLog({ type: 'system', message: `Loot: ${item.name}` });
            }
          }
        }
      }
    }
  }
};
