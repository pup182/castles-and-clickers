// Monster AI system for ability selection and targeting
import { MONSTER_ABILITIES, ABILITY_TYPE, TARGET_TYPE, getReadyAbilities } from '../data/monsterAbilities';
import { getDistance } from './roomBasedDungeon';
import { CLASSES, ROLES } from '../data/classes';

// Threat multipliers by role - tanks draw more aggro
const ROLE_THREAT = {
  [ROLES.TANK]: 2.5,    // Tanks are 2.5x more likely to be targeted
  [ROLES.HEALER]: 1.0,  // Healers are normal priority
  [ROLES.DPS]: 0.6,     // DPS are less likely to be targeted
};

export const AI_TYPE = {
  AGGRESSIVE: 'aggressive',   // Focuses on damage
  TANK: 'tank',               // Protects allies, uses buffs
  ASSASSIN: 'assassin',       // Targets low HP enemies
  DEBUFFER: 'debuffer',       // Prioritizes status effects
  SUPPORT: 'support',         // Heals and buffs allies
  BOSS: 'boss',               // Uses rotation/phases
};

const AI_PRIORITIES = {
  [AI_TYPE.AGGRESSIVE]: {
    targetPriority: 'highest_damage',
    abilityPriority: [ABILITY_TYPE.ATTACK, ABILITY_TYPE.BUFF],
    rushes: true,
  },
  [AI_TYPE.TANK]: {
    targetPriority: 'nearest',
    // Tanks now attack first, buff when hurt or when allies need protection
    abilityPriority: [ABILITY_TYPE.ATTACK, ABILITY_TYPE.BUFF, ABILITY_TYPE.DEBUFF],
    protectsAllies: true,
    buffsWhenHurt: true, // New flag: only use buffs when HP < 50%
  },
  [AI_TYPE.ASSASSIN]: {
    targetPriority: 'lowest_hp',
    abilityPriority: [ABILITY_TYPE.ATTACK, ABILITY_TYPE.DEBUFF],
    flanks: true,
  },
  [AI_TYPE.DEBUFFER]: {
    targetPriority: 'highest_threat',
    // Debuffers now prioritize attacks (especially those that apply status), then pure debuffs
    abilityPriority: [ABILITY_TYPE.ATTACK, ABILITY_TYPE.DEBUFF],
    prioritizesStatusAttacks: true, // New flag: prefer attacks that also apply debuffs
  },
  [AI_TYPE.SUPPORT]: {
    targetPriority: 'ally_lowest_hp',
    abilityPriority: [ABILITY_TYPE.HEAL, ABILITY_TYPE.BUFF, ABILITY_TYPE.ATTACK],
    healsFirst: true,
  },
  [AI_TYPE.BOSS]: {
    targetPriority: 'rotation',
    abilityPriority: [ABILITY_TYPE.SPECIAL, ABILITY_TYPE.ATTACK, ABILITY_TYPE.BUFF, ABILITY_TYPE.DEBUFF],
    usesRotation: true,
  },
};

/**
 * Get threat weight for a hero based on their role
 */
const getHeroThreat = (hero) => {
  const classData = CLASSES[hero.classId];
  if (!classData) return 1.0;
  return ROLE_THREAT[classData.role] || 1.0;
};

/**
 * Weighted random selection based on threat values
 * Returns a hero with probability proportional to their threat weight
 */
const selectByThreatWeight = (heroes) => {
  const weights = heroes.map(h => getHeroThreat(h));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < heroes.length; i++) {
    random -= weights[i];
    if (random <= 0) return heroes[i];
  }
  return heroes[heroes.length - 1];
};

/**
 * Select the best target based on AI type
 * Most targeting modes now factor in role-based threat
 */
const selectTarget = (monster, heroes, aiConfig) => {
  const aliveHeroes = heroes.filter(h => h.stats.hp > 0);
  if (aliveHeroes.length === 0) return null;

  switch (aiConfig.targetPriority) {
    case 'highest_damage':
      // Target hero with highest attack, weighted by threat
      // Sort by attack, then use threat-weighted selection from top candidates
      const byAttack = [...aliveHeroes].sort((a, b) => b.stats.attack - a.stats.attack);
      // Consider top 2 attackers if available, weighted by threat
      const topAttackers = byAttack.slice(0, Math.min(2, byAttack.length));
      return selectByThreatWeight(topAttackers);

    case 'lowest_hp':
      // Assassins ignore threat - they always go for the kill
      return aliveHeroes.reduce((best, h) =>
        h.stats.hp < best.stats.hp ? h : best
      );

    case 'lowest_hp_percent':
      // Target hero with lowest HP percentage (assassins)
      return aliveHeroes.reduce((best, h) => {
        const hPercent = h.stats.hp / h.stats.maxHp;
        const bestPercent = best.stats.hp / best.stats.maxHp;
        return hPercent < bestPercent ? h : best;
      });

    case 'highest_threat':
      // Target hero with highest threat (tanks naturally score higher)
      return aliveHeroes.reduce((best, h) => {
        const hThreat = (h.level || 1) * h.stats.attack * getHeroThreat(h);
        const bestThreat = (best.level || 1) * best.stats.attack * getHeroThreat(best);
        return hThreat > bestThreat ? h : best;
      });

    case 'nearest':
    default:
      // Target nearest hero, but weighted by threat
      // Find heroes within close range and pick by threat weight
      const distances = aliveHeroes.map(h => ({
        hero: h,
        dist: getDistance(monster.position, h.position),
      }));
      const minDist = Math.min(...distances.map(d => d.dist));
      // Consider heroes within 2 tiles of the nearest as "close enough"
      const nearbyHeroes = distances
        .filter(d => d.dist <= minDist + 2)
        .map(d => d.hero);
      return selectByThreatWeight(nearbyHeroes);
  }
};

/**
 * Select the best ally target for support abilities
 */
const selectAllyTarget = (monster, allies, aiConfig) => {
  const aliveAllies = allies.filter(a => a.stats.hp > 0 && a.id !== monster.id);
  if (aliveAllies.length === 0) return monster; // Target self if no allies

  switch (aiConfig.targetPriority) {
    case 'ally_lowest_hp':
      // Support lowest HP ally
      return aliveAllies.reduce((best, a) =>
        a.stats.hp < best.stats.hp ? a : best
      );

    default:
      return aliveAllies[0];
  }
};

/**
 * Choose the best ability for a monster to use
 */
export const chooseMonsterAbility = (monster, heroes, allies, cooldowns = {}, context = {}) => {
  const aiType = monster.aiType || AI_TYPE.AGGRESSIVE;
  const aiConfig = AI_PRIORITIES[aiType] || AI_PRIORITIES[AI_TYPE.AGGRESSIVE];

  // Get monster's abilities that are ready
  const monsterAbilities = monster.abilities || [];
  const readyAbilities = getReadyAbilities(monsterAbilities, cooldowns);

  if (readyAbilities.length === 0) {
    // No abilities ready, use basic attack
    return {
      ability: null,
      target: selectTarget(monster, heroes, aiConfig),
      useBasicAttack: true,
    };
  }

  // Boss phase handling
  if (aiType === AI_TYPE.BOSS && monster.phases) {
    const hpPercent = monster.stats.hp / monster.stats.maxHp * 100;
    const currentPhase = monster.phases.find(p => hpPercent <= p.hpPercent) || monster.phases[0];

    // Filter to phase-specific abilities
    const phaseAbilities = readyAbilities.filter(a =>
      currentPhase.abilities?.includes(a.id)
    );

    if (phaseAbilities.length > 0) {
      // Pick from phase abilities based on priority
      const ability = selectAbilityByPriority(phaseAbilities, aiConfig, monster, heroes, allies);
      return {
        ability,
        target: getAbilityTarget(ability, monster, heroes, allies, aiConfig),
        useBasicAttack: false,
        phaseChanged: context.lastPhase !== currentPhase,
        currentPhase,
      };
    }
  }

  // Support AI: prioritize healing if allies are hurt
  if (aiConfig.healsFirst) {
    const hurtAllies = allies.filter(a => a.stats.hp > 0 && a.stats.hp < a.stats.maxHp * 0.5);
    if (hurtAllies.length > 0) {
      const healAbility = readyAbilities.find(a => a.type === ABILITY_TYPE.HEAL);
      if (healAbility) {
        return {
          ability: healAbility,
          target: selectAllyTarget(monster, hurtAllies, aiConfig),
          useBasicAttack: false,
        };
      }
    }
  }

  // Debuffer AI: handled in selectAbilityByPriority with prioritizesStatusAttacks flag
  // This prefers ATTACKS that apply status effects, dealing damage while debuffing

  // Select ability based on priority
  const ability = selectAbilityByPriority(readyAbilities, aiConfig, monster, heroes, allies);

  if (ability) {
    return {
      ability,
      target: getAbilityTarget(ability, monster, heroes, allies, aiConfig),
      useBasicAttack: false,
    };
  }

  // Fallback to basic attack
  return {
    ability: null,
    target: selectTarget(monster, heroes, aiConfig),
    useBasicAttack: true,
  };
};

/**
 * Select ability based on AI priority order
 * Returns null if no good ability found (caller should use basic attack)
 */
const selectAbilityByPriority = (abilities, aiConfig, monster, heroes, allies) => {
  const aliveHeroCount = heroes.filter(h => h.stats.hp > 0).length;
  const monsterHpPercent = monster.stats.hp / monster.stats.maxHp;

  // For tanks with buffsWhenHurt: skip buffs if at high HP
  let effectivePriority = [...aiConfig.abilityPriority];
  if (aiConfig.buffsWhenHurt && monsterHpPercent > 0.5) {
    // Remove BUFF from priority when healthy - attack instead
    effectivePriority = effectivePriority.filter(t => t !== ABILITY_TYPE.BUFF);
  }

  // For debuffers with prioritizesStatusAttacks: prefer attacks that apply status
  if (aiConfig.prioritizesStatusAttacks) {
    // Check for attacks that also apply debuffs first
    const statusAttacks = abilities.filter(a =>
      a.type === ABILITY_TYPE.ATTACK && (a.appliesStatus || a.appliesMultipleStatus)
    );
    if (statusAttacks.length > 0) {
      // Prefer highest damage among status-applying attacks
      return statusAttacks.reduce((best, a) =>
        (a.damageMultiplier || 1) > (best.damageMultiplier || 1) ? a : best
      );
    }

    // If no status attacks, check for ANY attack ability (like drain_life)
    const anyAttacks = abilities.filter(a => a.type === ABILITY_TYPE.ATTACK);
    if (anyAttacks.length > 0) {
      return anyAttacks.reduce((best, a) =>
        (a.damageMultiplier || 1) > (best.damageMultiplier || 1) ? a : best
      );
    }

    // No attack abilities ready - return null to trigger basic attack
    // This prevents debuffers from wasting turns on pure utility when they could deal damage
    return null;
  }

  for (const abilityType of effectivePriority) {
    const matchingAbilities = abilities.filter(a => a.type === abilityType);
    if (matchingAbilities.length > 0) {
      // For attacks, prefer higher damage multiplier but avoid wasting AoE on single targets
      if (abilityType === ABILITY_TYPE.ATTACK) {
        let candidates = matchingAbilities;

        // When only 1 hero alive, prefer single-target attacks over AoE
        if (aliveHeroCount === 1) {
          const singleTargetAbilities = matchingAbilities.filter(a =>
            a.targetType !== TARGET_TYPE.ALL_ENEMIES && a.targetType !== TARGET_TYPE.CLEAVE
          );
          if (singleTargetAbilities.length > 0) {
            candidates = singleTargetAbilities;
          }
        }

        return candidates.reduce((best, a) =>
          (a.damageMultiplier || 1) > (best.damageMultiplier || 1) ? a : best
        );
      }
      // For others, pick the first available
      return matchingAbilities[0];
    }
  }

  // No matching abilities in priority - return null to use basic attack
  // This is better than picking a random utility ability
  return null;
};

/**
 * Get the appropriate target for an ability
 */
const getAbilityTarget = (ability, monster, heroes, allies, aiConfig) => {
  if (!ability) return selectTarget(monster, heroes, aiConfig);

  switch (ability.targetType) {
    case TARGET_TYPE.SELF:
      return monster;

    case TARGET_TYPE.ALL_ENEMIES:
    case TARGET_TYPE.CLEAVE:
      // Still need a primary target for positioning
      return selectTarget(monster, heroes, aiConfig);

    case TARGET_TYPE.ALL_ALLIES:
      return monster; // Self as anchor point

    case TARGET_TYPE.LOWEST_HP:
      return heroes.filter(h => h.stats.hp > 0).reduce((best, h) =>
        h.stats.hp < best.stats.hp ? h : best
      );

    case TARGET_TYPE.RANDOM:
      const aliveHeroes = heroes.filter(h => h.stats.hp > 0);
      return aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];

    case TARGET_TYPE.SINGLE:
    default:
      return selectTarget(monster, heroes, aiConfig);
  }
};

/**
 * Execute a monster ability
 */
export const executeMonsterAbility = (monster, ability, target, heroes, allies, addEffect) => {
  const results = [];
  const logs = [];

  // Calculate base damage
  const baseDamage = monster.stats.attack;
  const damageMultiplier = ability.damageMultiplier || 1.0;

  // Determine targets based on ability type
  let targets = [];
  switch (ability.targetType) {
    case TARGET_TYPE.ALL_ENEMIES:
      targets = heroes.filter(h => h.stats.hp > 0);
      break;
    case TARGET_TYPE.ALL_ALLIES:
      targets = allies.filter(a => a.stats.hp > 0);
      break;
    case TARGET_TYPE.CLEAVE:
      // Primary target + nearby targets
      targets = [target];
      const nearbyHeroes = heroes.filter(h =>
        h.stats.hp > 0 &&
        h.id !== target.id &&
        getDistance(h.position, target.position) <= 2
      );
      targets.push(...nearbyHeroes.slice(0, (ability.maxTargets || 2) - 1));
      break;
    case TARGET_TYPE.SELF:
      targets = [monster];
      break;
    default:
      targets = [target];
  }

  // Process based on ability type
  switch (ability.type) {
    case ABILITY_TYPE.ATTACK:
      for (const t of targets) {
        const damage = Math.floor(baseDamage * damageMultiplier * (0.9 + Math.random() * 0.2));
        const hitCount = ability.hitCount || 1;

        for (let i = 0; i < hitCount; i++) {
          results.push({
            type: 'damage',
            targetId: t.id,
            isHero: t.isHero !== false,
            damage,
          });

          // Add visual effect
          if (addEffect) {
            addEffect({
              type: 'beam',
              from: monster.position,
              to: t.position,
              attackerClass: 'monster',
            });
            addEffect({
              type: 'damage',
              position: t.position,
              damage,
            });
          }
        }

        // Apply status effect if ability has one
        if (ability.appliesStatus) {
          results.push({
            type: 'apply_status',
            targetId: t.id,
            isHero: t.isHero !== false,
            status: ability.appliesStatus,
          });

          if (addEffect) {
            addEffect({
              type: 'status',
              position: t.position,
              statusId: ability.appliesStatus.id,
            });
          }
        }

        // Apply multiple status effects if specified
        if (ability.appliesMultipleStatus) {
          for (const status of ability.appliesMultipleStatus) {
            results.push({
              type: 'apply_status',
              targetId: t.id,
              isHero: t.isHero !== false,
              status,
            });
          }
        }

        // Handle lifesteal
        if (ability.lifesteal) {
          const healAmount = Math.floor(damage * ability.lifesteal);
          results.push({
            type: 'heal',
            targetId: monster.id,
            isHero: false,
            amount: healAmount,
          });
        }

        logs.push({
          type: 'monster_ability',
          actor: { name: monster.name, emoji: monster.emoji },
          target: { name: t.name, emoji: t.emoji },
          ability,
          damage,
        });
      }
      break;

    case ABILITY_TYPE.DEBUFF:
      for (const t of targets) {
        if (ability.appliesStatus) {
          results.push({
            type: 'apply_status',
            targetId: t.id,
            isHero: t.isHero !== false,
            status: ability.appliesStatus,
          });

          if (addEffect) {
            addEffect({
              type: 'status',
              position: t.position,
              statusId: ability.appliesStatus.id,
            });
          }
        }

        logs.push({
          type: 'monster_ability',
          actor: { name: monster.name, emoji: monster.emoji },
          target: { name: t.name, emoji: t.emoji },
          ability,
        });
      }
      break;

    case ABILITY_TYPE.BUFF:
      for (const t of targets) {
        if (ability.appliesStatus) {
          results.push({
            type: 'apply_status',
            targetId: t.id,
            isHero: false,
            status: ability.appliesStatus,
          });

          if (addEffect) {
            addEffect({
              type: 'buffAura',
              position: t.position,
              color: '#22c55e',
            });
          }
        }

        logs.push({
          type: 'monster_ability',
          actor: { name: monster.name, emoji: monster.emoji },
          target: { name: t.name, emoji: t.emoji },
          ability,
        });
      }
      break;

    case ABILITY_TYPE.HEAL:
      for (const t of targets) {
        const healAmount = ability.healPercent
          ? Math.floor(t.stats.maxHp * ability.healPercent)
          : Math.floor(baseDamage * 0.5);

        results.push({
          type: 'heal',
          targetId: t.id,
          isHero: false,
          amount: healAmount,
        });

        if (addEffect) {
          addEffect({
            type: 'healBurst',
            position: t.position,
          });
          addEffect({
            type: 'damage',
            position: t.position,
            damage: healAmount,
            isHeal: true,
          });
        }

        logs.push({
          type: 'monster_heal',
          actor: { name: monster.name, emoji: monster.emoji },
          target: { name: t.name, emoji: t.emoji },
          ability,
          amount: healAmount,
        });
      }
      break;

    case ABILITY_TYPE.SUMMON:
      results.push({
        type: 'summon',
        summonType: ability.summonType,
        summonCount: ability.summonCount,
        position: monster.position,
      });

      logs.push({
        type: 'monster_summon',
        actor: { name: monster.name, emoji: monster.emoji },
        ability,
      });
      break;
  }

  return { results, logs };
};

export default {
  AI_TYPE,
  chooseMonsterAbility,
  executeMonsterAbility,
};
