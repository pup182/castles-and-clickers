/**
 * Skill Engine - Core skill utilities and re-exports.
 *
 * chooseBestSkill → ./skillAI.js
 * executeSkillAbility → ./skillExecution.js
 * applyPassiveEffects → ./passiveEffects.js
 *
 * All helper functions remain here. Re-exports preserve the public API
 * so no consumer imports need to change.
 */

import { getSkillById, SKILL_TYPE } from '../data/skillTrees';
import {
  PET_DODGE_BONUS, SHADOW_CLONE_HP_PERCENT, SHADOW_CLONE_DEFENSE_PERCENT,
  RAISED_UNDEAD_HP_PERCENT, RAISED_UNDEAD_ATTACK_PERCENT, RAISED_UNDEAD_DEFENSE_PERCENT,
} from './balanceConstants';

// Re-export extracted modules — preserves existing import paths
export { chooseBestSkill } from './skillAI';
export { executeSkillAbility } from './skillExecution';
export { applyPassiveEffects } from './passiveEffects';
export { calculateSkillDamage, getAvailableSkills } from './skillUtils';

/**
 * Get passive bonuses that apply to healing output
 */
export const getHealingBonuses = (hero) => {
  const skills = hero.skills || [];
  let healingMultiplier = 1.0;

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (!passive) continue;

    if (passive.type === 'healing_bonus') {
      healingMultiplier += passive.percent / 100;
    }
    if (passive.type === 'dual_bonus' && passive.healingBonus) {
      healingMultiplier += passive.healingBonus;
    }
  }

  return { healingMultiplier };
};

/**
 * Check for on-damage-taken triggers
 * Returns effects to apply when hero takes damage
 */
export const getOnDamageTakenEffects = (hero, damage, _attacker) => {
  const skills = hero.skills || [];
  const effects = {
    reflectDamage: 0,
    counterAttack: false,
    damageReduction: 0,
  };

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (!passive) continue;

    switch (passive.type) {
      case 'reflect_damage':
        effects.reflectDamage += Math.floor(damage * passive.percent / 100);
        break;

      case 'reflect_flat':
        effects.reflectDamage += passive.amount;
        break;

      case 'counter_attack':
        if (Math.random() < passive.chance / 100) {
          effects.counterAttack = true;
        }
        break;

      case 'damage_reduction':
        effects.damageReduction += passive.percent / 100;
        break;

      case 'high_hp_reduction':
        if (hero.stats.hp / hero.stats.maxHp >= passive.threshold) {
          effects.damageReduction += passive.reduction / 100;
        }
        break;

      case 'stand_firm':
        if (hero.stats.hp / hero.stats.maxHp >= passive.threshold) {
          effects.damageReduction += passive.damageReduction / 100;
        }
        break;

      default:
        break;
    }
  }

  return effects;
};

/**
 * Check for on-kill triggers
 * Returns effects to apply when hero kills an enemy
 */
export const getOnKillEffects = (hero) => {
  const skills = hero.skills || [];
  const effects = {
    healAmount: 0,
    healPercent: 0,
    stackingHp: 0,
    resetCooldowns: false,
  };

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (!passive) continue;

    switch (passive.type) {
      case 'on_kill_heal':
        effects.healAmount += passive.amount;
        break;

      case 'on_kill_heal_percent':
        effects.healPercent += passive.percent / 100;
        break;

      case 'stacking_hp':
        effects.stackingHp += passive.hpPerKill;
        break;

      default:
        break;
    }
  }

  return effects;
};

/**
 * Check for on-hit triggers (when hero successfully attacks)
 * Returns effects to apply
 */
export const getOnHitEffects = (hero, damage) => {
  const skills = hero.skills || [];
  const effects = {
    healAmount: 0,
    applyDot: null,
  };

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (!passive) continue;

    switch (passive.type) {
      case 'lifesteal':
        effects.healAmount += Math.floor(damage * passive.percent / 100);
        break;

      case 'on_hit_heal_percent':
        effects.healAmount += Math.floor(hero.stats.maxHp * passive.percent / 100);
        break;

      case 'attack_dot':
        effects.applyDot = {
          percent: passive.percent,
          duration: passive.duration,
        };
        break;

      default:
        break;
    }
  }

  return effects;
};

/**
 * Check for cheat death passives
 * Returns whether hero should survive lethal damage
 */
export const checkCheatDeath = (hero, combatState = {}) => {
  const skills = hero.skills || [];
  const heroCheatDeathUsed = combatState.cheatDeathUsed || new Set();

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (!passive) continue;

    if (passive.type === 'cheat_death') {
      // Check if already used this combat
      if (!heroCheatDeathUsed.has(hero.id)) {
        return {
          triggered: true,
          immuneDuration: passive.immuneDuration || passive.duration || 1,
          skillName: skill.name,
        };
      }
    }

    if (passive.type === 'conditional_cheat_death') {
      // Only trigger if hero was above HP threshold before the killing blow
      const preDeathHpRatio = combatState.preDeathHpRatio || 0;
      if (!heroCheatDeathUsed.has(hero.id) && preDeathHpRatio >= passive.threshold) {
        return {
          triggered: true,
          immuneDuration: passive.immuneDuration || passive.duration || 1,
          skillName: skill.name,
        };
      }
    }

    if (passive.type === 'auto_revive') {
      if (!heroCheatDeathUsed.has(hero.id)) {
        return {
          triggered: true,
          healPercent: passive.healPercent,
          skillName: skill.name,
        };
      }
    }
  }

  return { triggered: false };
};

/**
 * Check for CC immunity
 */
export const hasCCImmunity = (hero, ccType) => {
  const skills = hero.skills || [];

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (passive?.type === 'cc_immunity') {
      if (ccType === 'stun' && passive.stun) return true;
      if (ccType === 'slow' && passive.slow) return true;
    }
    // Stand Firm also grants slow immunity
    if (passive?.type === 'stand_firm' && passive.slowImmunity && ccType === 'slow') {
      return true;
    }
  }

  return false;
};

/**
 * Get party-wide passive effects (auras)
 */
export const getPartyAuraEffects = (heroes) => {
  const effects = {
    regenPercent: 0,
    damageToHealing: 0,
    partyStatBonuses: { attack: 0, defense: 0, speed: 0, maxHp: 0 },
  };

  for (const hero of heroes) {
    if (!hero || hero.stats.hp <= 0) continue;

    const skills = hero.skills || [];
    for (const skillId of skills) {
      const skill = getSkillById(skillId);
      if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

      const passive = skill.passive;
      if (!passive) continue;

      switch (passive.type) {
        case 'party_regen':
          effects.regenPercent += passive.percent / 100;
          break;

        case 'damage_heals':
          effects.damageToHealing += passive.percent / 100;
          break;

        case 'beacon_heal':
          // Heals from this hero are spread to party
          effects.beaconHealPercent = (effects.beaconHealPercent || 0) + passive.percent / 100;
          effects.beaconHealerId = hero.id;
          break;

        case 'party_stat_bonus':
          // Aura that gives stats to all allies
          if (passive.stats) {
            for (const stat in passive.stats) {
              effects.partyStatBonuses[stat] = (effects.partyStatBonuses[stat] || 0) + passive.stats[stat];
            }
          }
          break;

        case 'damage_sharing':
          // Spirit Link Totem - share damage equally
          effects.damageSharing = true;
          effects.damageSharingReduction = passive.reduction / 100;
          break;

        default:
          break;
      }
    }
  }

  return effects;
};

/**
 * Check for taunt party bonus (Warlord - allies deal more damage while you're taunting)
 */
export const getTauntPartyBonus = (heroes, buffs = {}) => {
  let damageBonus = 0;

  for (const hero of heroes) {
    if (!hero || hero.stats.hp <= 0) continue;

    // Check if this hero is taunting
    const heroBuff = buffs[hero.id] || {};
    if (!heroBuff.taunt || heroBuff.taunt <= 0) continue;

    const skills = hero.skills || [];
    for (const skillId of skills) {
      const skill = getSkillById(skillId);
      if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

      const passive = skill.passive;
      if (passive?.type === 'taunt_party_bonus') {
        damageBonus += passive.damageBonus || 0;
      }
    }
  }

  return damageBonus;
};

/**
 * Check for reactive taunt (when ally is hit, chance to taunt the attacker)
 */
export const checkReactiveTaunt = (heroes, excludeHeroId) => {
  for (const hero of heroes) {
    if (!hero || hero.stats.hp <= 0 || hero.id === excludeHeroId) continue;

    const skills = hero.skills || [];
    for (const skillId of skills) {
      const skill = getSkillById(skillId);
      if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

      const passive = skill.passive;
      if (passive?.type === 'reactive_taunt') {
        if (Math.random() < passive.chance / 100) {
          return {
            triggered: true,
            heroId: hero.id,
            heroName: hero.name,
            skillName: skill.name,
          };
        }
      }
    }
  }

  return { triggered: false };
};

/**
 * Check for redirect damage (Knight Fortress - all damage to allies redirected to you)
 */
export const checkDamageRedirect = (heroes, targetHero, damage) => {
  for (const hero of heroes) {
    if (!hero || hero.stats.hp <= 0 || hero.id === targetHero.id) continue;

    const skills = hero.skills || [];
    for (const skillId of skills) {
      const skill = getSkillById(skillId);
      if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

      const passive = skill.passive;
      if (passive?.type === 'redirect_damage') {
        const reduction = passive.reduction / 100;
        return {
          triggered: true,
          redirectHero: hero,
          redirectedDamage: Math.floor(damage * (1 - reduction)),
          skillName: skill.name,
        };
      }
    }
  }

  return null;
};

/**
 * Calculate damage sharing (Spirit Link Totem)
 */
export const calculateDamageSharing = (heroes, targetHero, damage, reduction) => {
  const aliveHeroes = heroes.filter(h => h && h.stats.hp > 0);
  if (aliveHeroes.length <= 1) return null;

  const reducedDamage = Math.floor(damage * (1 - reduction));
  const damagePerHero = Math.floor(reducedDamage / aliveHeroes.length);

  return {
    totalDamage: reducedDamage,
    damagePerHero,
    affectedHeroes: aliveHeroes.map(h => h.id),
  };
};

/**
 * Get beacon heal info (healer that spreads healing to lowest ally)
 */
export const getBeaconHealInfo = (hero) => {
  const skills = hero.skills || [];

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (passive?.type === 'beacon_heal') {
      return {
        hasBeacon: true,
        percent: passive.percent / 100,
        skillName: skill.name,
      };
    }
  }

  return { hasBeacon: false };
};

/**
 * Check for heal shield (heals grant shield equal to X% of heal)
 */
export const getHealShieldBonus = (hero) => {
  const skills = hero.skills || [];

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (passive?.type === 'heal_shield') {
      return {
        hasHealShield: true,
        percent: passive.percent / 100,
        skillName: skill.name,
      };
    }
  }

  return { hasHealShield: false };
};

/**
 * Check for living seed (heals plant a seed that triggers on damage)
 */
export const getLivingSeedInfo = (hero) => {
  const skills = hero.skills || [];

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (passive?.type === 'living_seed') {
      return {
        hasLivingSeed: true,
        healPercent: passive.healPercent,
        skillName: skill.name,
      };
    }
  }

  return { hasLivingSeed: false };
};

/**
 * Check for DoT lifesteal (your DoTs heal you)
 */
export const getDotLifestealPercent = (hero) => {
  const skills = hero.skills || [];
  let lifestealPercent = 0;

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (passive?.type === 'dot_lifesteal') {
      lifestealPercent += passive.percent / 100;
    }
  }

  return lifestealPercent;
};

/**
 * Check if hero has armor vs DoT (defense reduces DoT damage)
 */
export const hasArmorVsDot = (hero) => {
  const skills = hero.skills || [];

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (passive?.type === 'armor_vs_dot') {
      return true;
    }
  }

  return false;
};

/**
 * Check if hero has displacement immunity
 */
export const hasDisplacementImmunity = (hero) => {
  const skills = hero.skills || [];

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (passive?.type === 'displacement_immunity') {
      return true;
    }
  }

  return false;
};

/**
 * Check for reactive heal triggers (ally drops below threshold)
 */
export const checkReactiveHeal = (healer, ally) => {
  const skills = healer.skills || [];

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (!passive) continue;

    if (passive.type === 'reactive_heal') {
      if (ally.stats.hp / ally.stats.maxHp <= passive.threshold) {
        return {
          triggered: true,
          healPercent: passive.healPercent,
          skillName: skill.name,
        };
      }
    }

    if (passive.type === 'save_ally') {
      if (ally.stats.hp <= 0) {
        return {
          triggered: true,
          healPercent: passive.healPercent,
          skillName: skill.name,
          preventDeath: true,
        };
      }
    }

    if (passive.type === 'low_hp_heal') {
      if (healer.stats.hp / healer.stats.maxHp <= passive.threshold) {
        return {
          triggered: true,
          healPercent: passive.healPercent,
          skillName: skill.name,
          selfOnly: true,
        };
      }
    }
  }

  return { triggered: false };
};

/**
 * Get HOT (heal over time) bonuses
 */
export const getHotBonuses = (hero) => {
  const skills = hero.skills || [];
  let hotMultiplier = 1.0;
  let maxStacks = 1;

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (!passive) continue;

    if (passive.type === 'hot_bloom') {
      hotMultiplier += passive.bonusPercent / 100;
    }
    if (passive.type === 'hot_stacking') {
      maxStacks = Math.max(maxStacks, passive.maxStacks);
    }
  }

  return { hotMultiplier, maxStacks };
};

/**
 * Check for vengeance/avenger triggers (ally death)
 */
export const checkVengeanceTrigger = (hero, deadAllyCount) => {
  const skills = hero.skills || [];

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (!passive) continue;

    if (passive.type === 'vengeance' || passive.type === 'avenger_rage') {
      if (deadAllyCount > 0) {
        return {
          triggered: true,
          damageBonus: passive.damageBonus * deadAllyCount,
          duration: passive.duration || 999,
        };
      }
    }
  }

  return { triggered: false };
};

/**
 * Get first turn speed bonus
 */
export const getFirstTurnSpeedBonus = (hero) => {
  const skills = hero.skills || [];
  let speedBonus = 0;

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (passive?.type === 'first_turn_speed') {
      speedBonus += passive.percent / 100;
    }
  }

  return speedBonus;
};

/**
 * Get effective cooldown for a skill (accounting for Spell Mastery etc.)
 */
export const getEffectiveCooldown = (skill, heroSkills) => {
  let cooldown = skill.cooldown || 0;

  // Check for cooldown reduction passives
  for (const skillId of heroSkills) {
    const s = getSkillById(skillId);
    if (s?.passive?.type === 'cooldown_reduction') {
      cooldown = Math.max(1, cooldown - s.passive.amount);
    }
  }

  return cooldown;
};

/**
 * Get per-turn passive effects for all heroes
 * Called at the start of each combat turn
 */
export const getPerTurnEffects = (heroes) => {
  const effects = {
    partyRegenPercent: 0,
    damageToHealingPercent: 0,
  };

  for (const hero of heroes) {
    if (!hero || hero.stats.hp <= 0) continue;

    const skills = hero.skills || [];
    for (const skillId of skills) {
      const skill = getSkillById(skillId);
      if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

      const passive = skill.passive;
      if (!passive) continue;

      if (passive.type === 'party_regen') {
        effects.partyRegenPercent += passive.percent / 100;
      }
      if (passive.type === 'damage_heals') {
        effects.damageToHealingPercent += passive.percent / 100;
      }
    }
  }

  return effects;
};

/**
 * Check for martyr passive (intercept damage for allies)
 * Returns the hero who will take damage instead
 */
export const checkMartyrIntercept = (heroes, targetHero, _damage) => {
  for (const hero of heroes) {
    if (!hero || hero.id === targetHero.id || hero.stats.hp <= 0) continue;

    const skills = hero.skills || [];
    for (const skillId of skills) {
      const skill = getSkillById(skillId);
      if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

      const passive = skill.passive;
      if (passive?.type === 'martyr') {
        // Martyr takes a percentage of the damage instead
        const interceptPercent = passive.percent || 0.3;
        return {
          martyrHero: hero,
          interceptPercent,
          skillName: skill.name,
        };
      }
    }
  }

  return null;
};

/**
 * Get summon data for a hero (pets, clones)
 * Called at combat start to spawn summons
 */
export const getSummonData = (hero) => {
  const skills = hero.skills || [];
  const summons = [];

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (!passive) continue;

    if (passive.type === 'summon_pet') {
      summons.push({
        type: 'pet',
        petType: passive.petType || 'wolf',
        statPercent: passive.statPercent || 50,
        ownerId: hero.id,
        ownerName: hero.name,
        skillName: skill.name,
      });
    }

    if (passive.type === 'shadow_clone') {
      summons.push({
        type: 'clone',
        damagePercent: passive.damagePercent || 50,
        ownerId: hero.id,
        ownerName: hero.name,
        skillName: skill.name,
      });
    }
  }

  return summons;
};

/**
 * Check for raise dead passive
 * Returns data if hero can raise a dead enemy
 */
export const checkRaiseDead = (hero) => {
  const skills = hero.skills || [];

  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.PASSIVE) continue;

    const passive = skill.passive;
    if (passive?.type === 'raise_dead') {
      return {
        canRaise: true,
        duration: passive.duration || 3,
        skillName: skill.name,
      };
    }
  }

  return { canRaise: false };
};

/**
 * Create a pet unit from hero stats
 */
export const createPetUnit = (hero, summonData, position) => {
  const statMultiplier = summonData.statPercent / 100;

  const petEmojis = {
    wolf: '🐺',
    bear: '🐻',
    eagle: '🦅',
    spider: '🕷️',
  };

  const petNames = {
    wolf: 'Spirit Wolf',
    bear: 'War Bear',
    eagle: 'Battle Eagle',
    spider: 'Shadow Spider',
  };

  return {
    id: `pet_${hero.id}_${Date.now()}`,
    name: petNames[summonData.petType] || 'Pet',
    emoji: petEmojis[summonData.petType] || '🐾',
    isHero: true,
    isPet: true,
    ownerId: hero.id,
    classId: 'pet',
    position,
    bonusDodge: PET_DODGE_BONUS,
    stats: {
      hp: Math.floor(hero.stats.maxHp * statMultiplier),
      maxHp: Math.floor(hero.stats.maxHp * statMultiplier),
      attack: Math.floor(hero.stats.attack * statMultiplier),
      defense: Math.floor(hero.stats.defense * statMultiplier),
      speed: hero.stats.speed,
    },
  };
};

/**
 * Create a shadow clone from hero
 */
export const createShadowClone = (hero, summonData, position) => {
  return {
    id: `clone_${hero.id}_${Date.now()}`,
    name: `${hero.name}'s Shadow`,
    emoji: '👤',
    isHero: true,
    isClone: true,
    ownerId: hero.id,
    classId: hero.classId,
    damagePercent: summonData.damagePercent,
    position,
    stats: {
      hp: Math.floor(hero.stats.maxHp * SHADOW_CLONE_HP_PERCENT),
      maxHp: Math.floor(hero.stats.maxHp * SHADOW_CLONE_HP_PERCENT),
      attack: hero.stats.attack,
      defense: Math.floor(hero.stats.defense * SHADOW_CLONE_DEFENSE_PERCENT),
      speed: hero.stats.speed,
    },
  };
};

/**
 * Create a raised undead from a dead monster
 */
export const createRaisedUndead = (monster, raiseDuration, position) => {
  return {
    id: `undead_${monster.id}_${Date.now()}`,
    name: `Risen ${monster.name}`,
    emoji: '💀',
    isHero: true,
    isUndead: true,
    classId: 'undead',  // Use undead sprite
    turnsRemaining: raiseDuration,
    originalMonsterId: monster.id,
    position,
    stats: {
      hp: Math.floor(monster.stats.maxHp * RAISED_UNDEAD_HP_PERCENT),
      maxHp: Math.floor(monster.stats.maxHp * RAISED_UNDEAD_HP_PERCENT),
      attack: Math.floor(monster.stats.attack * RAISED_UNDEAD_ATTACK_PERCENT),
      defense: Math.floor(monster.stats.defense * RAISED_UNDEAD_DEFENSE_PERCENT),
      speed: monster.stats.speed,
    },
  };
};
