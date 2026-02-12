// Unique Item Effect Engine
// Processes unique item special powers during combat

import { UNIQUE_TRIGGER, getUniqueItem } from '../data/uniqueItems';
import { applyStatusEffect } from './statusEngine';

// Track unique item state per hero during dungeon
// Map<heroId, UniqueState>
const uniqueStates = new Map();

// Initialize or get unique state for a hero
export const getUniqueState = (heroId) => {
  if (!uniqueStates.has(heroId)) {
    uniqueStates.set(heroId, {
      attackCounter: 0,         // For "every Nth attack" effects
      soulStacks: 0,            // Soul stack counter
      killStacks: 0,            // Permanent kill stacks (Abyssal Maw)
      damageStored: 0,          // Stored damage (Void Heart)
      usedCheatDeath: false,    // One-time cheat death used
      usedVengeance: false,     // Vengeance triggered this room
      hasPhaseBonus: false,     // Bonus damage after phasing
      isInvisible: false,       // Stealth status
      invisibleTurns: 0,        // Turns remaining invisible
      usedFirstAttackBonus: false, // First attack bonus used
    });
  }
  return uniqueStates.get(heroId);
};

// Reset unique states for a new dungeon
export const resetUniqueStates = () => {
  uniqueStates.clear();
};

// Reset per-room unique states
export const resetRoomUniqueStates = (heroId) => {
  const state = getUniqueState(heroId);
  state.damageStored = 0;
  state.usedVengeance = false;
  state.hasPhaseBonus = false;
  state.usedFirstAttackBonus = false;
  // Note: killStacks persist through dungeon
  // Note: usedCheatDeath persists through dungeon
};

// Get all unique items equipped by a hero
export const getHeroUniqueItems = (hero) => {
  const uniques = [];
  for (const slot of ['weapon', 'armor', 'accessory']) {
    const item = hero.equipment?.[slot];
    if (item?.isUnique && item.uniquePower) {
      uniques.push(item);
    }
  }
  return uniques;
};

// Check if hero has a specific unique power
export const hasUniquePower = (hero, powerId) => {
  const uniques = getHeroUniqueItems(hero);
  return uniques.some(item => item.uniquePower?.id === powerId);
};

// Get all passive stat bonuses from unique items
export const getUniquePassiveBonuses = (hero) => {
  const bonuses = {
    speedMultiplier: 1.0,
    maxHpMultiplier: 1.0,
    damageMultiplier: 1.0,
    damageReduction: 0,
    lifesteal: 0,
    armorPenetration: 0,
    dodgeChance: 0,
    critChance: 0,
    movementBonus: 0,
  };

  const uniques = getHeroUniqueItems(hero);
  const state = getUniqueState(hero.id);

  for (const item of uniques) {
    const power = item.uniquePower;
    if (power.trigger !== UNIQUE_TRIGGER.PASSIVE) continue;

    const effect = power.effect;

    // Eye of the Storm - speed doubler
    if (effect.speedMultiplier) {
      bonuses.speedMultiplier *= effect.speedMultiplier;
    }

    // Leviathan's Heart - HP doubler with damage reduction
    if (effect.maxHpMultiplier) {
      bonuses.maxHpMultiplier *= effect.maxHpMultiplier;
    }
    if (effect.damageReduction) {
      bonuses.damageReduction += effect.damageReduction;
    }

    // Vampire's Embrace - lifesteal
    if (effect.lifesteal) {
      bonuses.lifesteal += effect.lifesteal;
    }

    // Nullblade - armor penetration
    if (effect.armorPenetration) {
      bonuses.armorPenetration += effect.armorPenetration;
    }

    // Reality Shard - double hit chance
    if (effect.doubleHitChance) {
      bonuses.critChance += effect.doubleHitChance; // Reuse crit for double hit
    }

    // Shadow Cloak - dodge chance
    if (effect.dodgeChance) {
      bonuses.dodgeChance += effect.dodgeChance;
    }

    // Boots - movement bonus
    if (effect.movementBonus) {
      bonuses.movementBonus += effect.movementBonus;
    }

    // Party stat bonus (Crown of Command)
    if (effect.partyStatBonus) {
      bonuses.damageMultiplier *= (1 + effect.partyStatBonus);
    }
  }

  // Add kill stacks bonus (Abyssal Maw)
  if (state.killStacks > 0 && hasUniquePower(hero, 'endless_hunger')) {
    bonuses.damageMultiplier *= (1 + state.killStacks * 0.05);
  }

  // Add soul stacks bonus (Banshee's Wail)
  if (state.soulStacks > 0 && hasUniquePower(hero, 'soul_stacks')) {
    bonuses.damageMultiplier *= (1 + state.soulStacks * 0.10);
  }

  // Phase bonus (Phantom Cloak)
  if (state.hasPhaseBonus && hasUniquePower(hero, 'phase_out')) {
    bonuses.damageMultiplier *= 2.0;
  }

  return bonuses;
};

// Process ON_HIT effects
export const processOnHitUniques = (hero, target, damage, context) => {
  const uniques = getHeroUniqueItems(hero);
  const state = getUniqueState(hero.id);
  const results = {
    bonusDamage: 0,
    healing: 0,
    statusToApply: [],
    chainTargets: [],
    chainDamage: 0,
    maxHpReduction: 0,
  };

  for (const item of uniques) {
    const power = item.uniquePower;
    if (power.trigger !== UNIQUE_TRIGGER.ON_HIT) continue;

    const effect = power.effect;

    // Tidal Pendant - every 3rd attack
    if (effect.everyNthAttack) {
      state.attackCounter++;
      if (state.attackCounter >= effect.everyNthAttack) {
        state.attackCounter = 0;
        results.bonusDamage += damage * (effect.damageMultiplier - 1);
        if (effect.lifestealOnProc) {
          results.healing += damage * effect.damageMultiplier * effect.lifestealOnProc;
        }
      }
    }

    // Magma Core / Flamebreaker - apply burn
    if (effect.appliesStatus) {
      results.statusToApply.push(effect.appliesStatus);
    }

    // Bonus damage percent
    if (effect.bonusDamagePercent) {
      results.bonusDamage += damage * effect.bonusDamagePercent;
    }

    // Stormcaller's Rod - chain lightning
    if (effect.chainTargets && context.otherEnemies) {
      const chainsTo = Math.min(effect.chainTargets, context.otherEnemies.length);
      for (let i = 0; i < chainsTo; i++) {
        results.chainTargets.push(context.otherEnemies[i]);
      }
      results.chainDamage = damage * effect.chainDamage;
      if (effect.appliesStatus) {
        // Apply status to chain targets
        for (const chainTarget of results.chainTargets) {
          results.statusToApply.push({ ...effect.appliesStatus, target: chainTarget });
        }
      }
    }

    // Entropy - max HP reduction
    if (effect.maxHpReduction) {
      const reduction = target.isBoss ? effect.bossMaxHpReduction : effect.maxHpReduction;
      results.maxHpReduction += reduction;
    }
  }

  // Store damage for Void Heart
  if (hasUniquePower(hero, 'void_absorption')) {
    state.damageStored += damage * 0.20;
  }

  // Clear phase bonus after attack
  if (state.hasPhaseBonus) {
    state.hasPhaseBonus = false;
  }

  // Clear stealth bonus after first attack
  if (state.isInvisible && hasUniquePower(hero, 'void_stealth')) {
    state.isInvisible = false;
    state.invisibleTurns = 0;
    // Bonus was already applied via getUniquePassiveBonuses
  }

  return results;
};

// Process ON_CRIT effects
export const processOnCritUniques = (hero, target, damage, context) => {
  const uniques = getHeroUniqueItems(hero);
  const results = {
    bonusDamage: 0,
    chainAttack: null,
    statusToApply: [],
    buffsToApply: [],
  };

  for (const item of uniques) {
    const power = item.uniquePower;
    if (power.trigger !== UNIQUE_TRIGGER.ON_CRIT) continue;

    const effect = power.effect;

    // Serpent's Fang - chain strike
    if (effect.chainAttackChance) {
      if (Math.random() < effect.chainAttackChance) {
        results.chainAttack = {
          target,
          damage: damage * effect.chainDamage,
          canChain: effect.canChainInfinite,
        };
      }
    }

    // Shadowfang - crit bonus + invisibility
    if (effect.critBonusDamage) {
      results.bonusDamage += damage * effect.critBonusDamage;
    }
    if (effect.grantsBuff) {
      results.buffsToApply.push(effect.grantsBuff);
    }
  }

  return results;
};

// Process ON_KILL effects
export const processOnKillUniques = (hero, target, context) => {
  const uniques = getHeroUniqueItems(hero);
  const state = getUniqueState(hero.id);
  const results = {
    extraTurn: false,
    resetCooldowns: false,
    stacksGained: 0,
  };

  for (const item of uniques) {
    const power = item.uniquePower;
    if (power.trigger !== UNIQUE_TRIGGER.ON_KILL) continue;

    const effect = power.effect;

    // Windrunner - extra turn
    if (effect.extraTurn) {
      if (!context.usedExtraTurnThisRound || !effect.oncePerRound) {
        results.extraTurn = true;
      }
    }

    // Ring of Archmage - reset cooldowns
    if (effect.resetCooldowns) {
      results.resetCooldowns = true;
    }

    // Soul Harvester - stacking buff
    if (effect.stackingBuff) {
      const maxStacks = effect.stackingBuff.maxStacks;
      // Track this separately based on item
      results.stacksGained++;
    }

    // Banshee's Wail - soul stacks
    if (effect.stackingBuff?.id === 'soul_stack') {
      if (state.soulStacks < effect.stackingBuff.maxStacks) {
        state.soulStacks++;
      }
    }

    // Abyssal Maw - permanent dungeon stacks
    if (effect.permanentStackingBuff?.persistsInDungeon) {
      state.killStacks++;
    }
  }

  return results;
};

// Process ON_DAMAGE_TAKEN effects
export const processOnDamageTakenUniques = (hero, attacker, damage, context) => {
  const uniques = getHeroUniqueItems(hero);
  const state = getUniqueState(hero.id);
  const results = {
    damageBlocked: 0,
    reflectDamage: 0,
    phased: false,
  };

  for (const item of uniques) {
    const power = item.uniquePower;
    if (power.trigger !== UNIQUE_TRIGGER.ON_DAMAGE_TAKEN) continue;

    const effect = power.effect;

    // Phantom Cloak - phase through
    if (effect.phaseChance) {
      if (Math.random() < effect.phaseChance) {
        results.phased = true;
        results.damageBlocked = damage;
        state.hasPhaseBonus = true;
      }
    }

    // Shadow Cloak - dodge
    if (effect.dodgeChance) {
      if (Math.random() < effect.dodgeChance) {
        results.damageBlocked = damage;
      }
    }

    // Amulet of Reflection - reflect damage
    if (effect.reflectDamage) {
      results.reflectDamage += damage * effect.reflectDamage;
    }

    // Thunder Guard - retaliation
    if (effect.retaliationDamageFromDefense && effect.procChance) {
      if (Math.random() < effect.procChance) {
        const heroDefense = hero.stats?.defense || 10;
        results.reflectDamage += heroDefense * effect.retaliationDamageFromDefense;
      }
    }
  }

  // Reset soul stacks on damage (Banshee's Wail)
  if (state.soulStacks > 0 && hasUniquePower(hero, 'soul_stacks')) {
    // Only reset if we actually took damage
    if (results.damageBlocked < damage) {
      state.soulStacks = 0;
    }
  }

  return results;
};

// Process ON_COMBAT_START effects
export const processOnCombatStartUniques = (hero, enemies, context) => {
  const uniques = getHeroUniqueItems(hero);
  const state = getUniqueState(hero.id);
  const results = {
    rootEnemies: null,
    invisibleTurns: 0,
  };

  for (const item of uniques) {
    const power = item.uniquePower;
    if (power.trigger !== UNIQUE_TRIGGER.ON_COMBAT_START) continue;

    const effect = power.effect;

    // Kraken's Grasp - root all enemies
    if (effect.rootAllEnemies) {
      results.rootEnemies = {
        duration: effect.rootAllEnemies.duration,
        targets: enemies,
      };
    }

    // Cloak of Nothing - start invisible
    if (effect.invisibleDuration) {
      state.isInvisible = true;
      state.invisibleTurns = effect.invisibleDuration;
      results.invisibleTurns = effect.invisibleDuration;
    }
  }

  return results;
};

// Process ON_ROOM_START effects
export const processOnRoomStartUniques = (hero, context) => {
  const uniques = getHeroUniqueItems(hero);
  resetRoomUniqueStates(hero.id);
  const results = {
    shieldAmount: 0,
  };

  for (const item of uniques) {
    const power = item.uniquePower;
    if (power.trigger !== UNIQUE_TRIGGER.ON_ROOM_START) continue;

    const effect = power.effect;

    // Ancient Bark - shield on room start
    if (effect.shieldPercent) {
      const maxHp = hero.stats?.maxHp || 100;
      results.shieldAmount += Math.floor(maxHp * effect.shieldPercent);
    }
  }

  return results;
};

// Process ON_DEATH (cheat death) effects
export const processOnDeathUniques = (hero, context) => {
  const uniques = getHeroUniqueItems(hero);
  const state = getUniqueState(hero.id);
  const results = {
    preventDeath: false,
    healAmount: 0,
    invulnerableTurns: 0,
  };

  // Check if already used cheat death this dungeon
  if (state.usedCheatDeath) {
    return results;
  }

  for (const item of uniques) {
    const power = item.uniquePower;
    if (power.trigger !== UNIQUE_TRIGGER.ON_DEATH && power.trigger !== UNIQUE_TRIGGER.ON_LETHAL) continue;

    const effect = power.effect;

    // Void Heart - heal from stored damage
    if (effect.healOnDeathFromStored && state.damageStored > 0) {
      results.preventDeath = true;
      results.healAmount = state.damageStored;
      state.damageStored = 0;
      if (effect.oncePerDungeon || effect.resetsPerRoom) {
        // For Void Heart, it resets per room, so we don't mark usedCheatDeath
      }
    }

    // Void God's Crown - heal to full + invulnerable
    if (effect.preventDeath && effect.healToFull) {
      results.preventDeath = true;
      results.healAmount = hero.stats?.maxHp || 100;
      results.invulnerableTurns = effect.invulnerableDuration || 0;
      if (effect.oncePerDungeon) {
        state.usedCheatDeath = true;
      }
    }

    // Armor of Undying - survive with 1 HP
    if (effect.preventDeath && !effect.healToFull) {
      results.preventDeath = true;
      results.healAmount = 1;
      if (effect.grantsImmunity) {
        results.invulnerableTurns = effect.grantsImmunity;
      }
      if (effect.oncePerDungeon) {
        state.usedCheatDeath = true;
      }
    }
  }

  return results;
};

// Process ON_LOW_HP effects
export const processOnLowHpUniques = (hero, currentHp, maxHp, context) => {
  const uniques = getHeroUniqueItems(hero);
  const state = getUniqueState(hero.id);
  const results = {
    buffsToApply: [],
  };

  // Check if already triggered this room
  if (state.usedVengeance) {
    return results;
  }

  const hpPercent = currentHp / maxHp;

  for (const item of uniques) {
    const power = item.uniquePower;
    if (power.trigger !== UNIQUE_TRIGGER.ON_LOW_HP) continue;

    const effect = power.effect;

    // Crown of the Fallen - vengeance at low HP
    if (effect.hpThreshold && hpPercent <= effect.hpThreshold) {
      results.buffsToApply.push({
        id: 'vengeance',
        damageBonus: effect.damageBonus,
        lifesteal: effect.lifesteal,
        duration: effect.duration,
      });
      if (effect.oncePerRoom) {
        state.usedVengeance = true;
      }
    }
  }

  return results;
};

// Check if hero should get stealth bonus damage
export const getStealthBonusDamage = (hero) => {
  const state = getUniqueState(hero.id);
  if (!state.isInvisible) return 0;

  const uniques = getHeroUniqueItems(hero);
  for (const item of uniques) {
    const power = item.uniquePower;
    if (power.effect?.stealthBonusDamage) {
      return power.effect.stealthBonusDamage;
    }
  }
  return 0;
};

// Check if hero should get bonus damage vs rooted
export const getRootedBonusDamage = (hero, target) => {
  const state = getUniqueState(hero.id);

  // Check if target is rooted and we haven't used first attack
  const targetIsRooted = target.statusEffects?.some(e => e.id === 'root');
  if (!targetIsRooted || state.usedFirstAttackBonus) return 1.0;

  const uniques = getHeroUniqueItems(hero);
  for (const item of uniques) {
    const power = item.uniquePower;
    if (power.effect?.bonusDamageVsRooted && power.effect?.firstAttackOnly) {
      state.usedFirstAttackBonus = true;
      return power.effect.bonusDamageVsRooted;
    }
  }
  return 1.0;
};

// Tick down invisibility turns
export const tickUniqueEffects = (hero) => {
  const state = getUniqueState(hero.id);

  if (state.invisibleTurns > 0) {
    state.invisibleTurns--;
    if (state.invisibleTurns <= 0) {
      state.isInvisible = false;
    }
  }
};

// Check if hero should be ignored by enemies (invisible)
export const isHeroInvisible = (hero) => {
  const state = getUniqueState(hero.id);
  return state.isInvisible && state.invisibleTurns > 0;
};

// Get damage multiplier that includes shield bonus (Ancient Bark)
export const getShieldBonusDamage = (hero) => {
  if (!hero.shield || hero.shield <= 0) return 1.0;

  const uniques = getHeroUniqueItems(hero);
  for (const item of uniques) {
    const power = item.uniquePower;
    if (power.effect?.bonusDamageWhileShielded) {
      return 1.0 + power.effect.bonusDamageWhileShielded;
    }
  }
  return 1.0;
};
