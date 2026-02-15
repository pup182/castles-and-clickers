/**
 * Skill Execution - Executes active skill abilities and resolves their effects.
 * Extracted from skillEngine.js (Phase 2C).
 */

import { SKILL_TYPE, EFFECT_TYPE, TARGET_TYPE } from '../data/skillTrees';
import { calculateSkillDamage } from './skillUtils';

/**
 * Execute an active skill ability
 * Returns { results: [], logs: [] }
 */
export const executeSkillAbility = (actor, skill, enemies, allies, heroHp, addEffect, buffs = {}) => {
  const results = [];
  const logs = [];

  if (!skill || skill.type !== SKILL_TYPE.ACTIVE) {
    return { results, logs };
  }

  const effect = skill.effect;
  const aliveEnemies = enemies.filter(e => e.stats.hp > 0);
  const aliveAllies = allies.filter(a => a.stats.hp > 0);

  // Handle different effect types
  switch (effect.type) {
    case EFFECT_TYPE.DAMAGE: {
      // Check requiresCorpse - skill needs a dead enemy to cast
      if (effect.requiresCorpse) {
        const deadEnemies = enemies.filter(e => e.stats.hp <= 0);
        if (deadEnemies.length === 0) {
          // No corpses available, skill fizzles
          logs.push({
            type: 'system',
            message: `${skill.name} requires a corpse!`,
          });
          return { results, logs };
        }
      }

      const targets = skill.targetType === TARGET_TYPE.ALL_ENEMIES
        ? aliveEnemies
        : skill.targetType === TARGET_TYPE.SINGLE_ENEMY
          ? [aliveEnemies[0]] // Target closest/first enemy
          : [];

      // Handle chain lightning max targets
      const maxTargets = effect.maxTargets || targets.length;
      const actualTargets = targets.slice(0, maxTargets);
      const isAOE = actualTargets.length > 1;

      // Add skill activation effect
      if (addEffect) {
        addEffect({
          type: 'skillActivation',
          position: actor.position,
          skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
        });
      }

      for (const target of actualTargets) {
        if (!target) continue;

        // Calculate effective multiplier - bonusIfTaunting doubles damage when actor has taunt
        let effectiveMultiplier = effect.multiplier;
        const actorBuffs = buffs[actor.id];
        const hasTauntBonus = effect.bonusIfTaunting && actorBuffs?.taunt > 0;
        if (hasTauntBonus) {
          effectiveMultiplier *= effect.bonusIfTaunting;
        }

        const { damage, isCrit } = calculateSkillDamage(actor, target, effectiveMultiplier, {
          alwaysCrit: effect.alwaysCrit,
          executeThreshold: effect.executeThreshold,
          executeMultiplier: effect.executeMultiplier,
          armorPen: effect.armorPen || 0,
        });

        results.push({
          type: 'damage',
          targetId: target.id,
          damage,
          isHero: false,
          isCrit,
          resetOnKill: effect.resetOnKill || false,
          skillId: skill.id,
        });

        logs.push({
          type: 'skill',
          actor: { name: actor.name, emoji: actor.emoji },
          target: { name: target.name, emoji: target.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          damage,
          isCrit,
          hasTauntBonus,
        });

        // Add visual effects
        if (addEffect) {
          addEffect({
            type: 'beam',
            from: actor.position,
            to: target.position,
            attackerClass: actor.classId,
            isSkill: true,
            skillEmoji: skill.emoji,
          });

          // Use crit effect for critical hits, normal damage otherwise
          if (isCrit) {
            addEffect({
              type: 'crit',
              position: target.position,
              damage,
            });
          } else {
            addEffect({
              type: 'damage',
              position: target.position,
              damage,
              isHeal: false,
            });
          }

          // Add AOE ground effect for multi-target skills
          if (isAOE) {
            addEffect({
              type: 'aoeGround',
              position: target.position,
              color: '#f59e0b',
            });
          } else {
            addEffect({
              type: 'impact',
              position: target.position,
              color: '#f59e0b', // Yellow for skills
            });
          }
        }
      }

      // Handle Holy Nova's heal component
      if (effect.alsoDamage) {
        // This is actually Holy Nova (heal + damage combo)
        // The damage part is handled above, now handle healing
      }

      // Handle selfDamagePercent - skill costs HP to cast (e.g., Death Coil)
      if (effect.selfDamagePercent && effect.selfDamagePercent > 0) {
        const selfDamage = Math.floor(actor.stats.hp * effect.selfDamagePercent);
        // Don't let it kill the caster - minimum 1 HP remains
        const actualSelfDamage = Math.min(selfDamage, actor.stats.hp - 1);

        if (actualSelfDamage > 0) {
          results.push({
            type: 'selfDamage',
            targetId: actor.id,
            damage: actualSelfDamage,
            isHero: true,
          });

          logs.push({
            type: 'system',
            message: `${actor.name} sacrifices ${actualSelfDamage} HP for ${skill.name}!`,
          });

          if (addEffect) {
            addEffect({
              type: 'damage',
              position: actor.position,
              damage: actualSelfDamage,
              isHeal: false,
            });
          }
        }
      }
      break;
    }

    case EFFECT_TYPE.HEAL: {
      // Handle revive (Resurrection skill)
      if (effect.revive) {
        // Add skill activation effect
        if (addEffect) {
          addEffect({
            type: 'skillActivation',
            position: actor.position,
            skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
          });
        }

        results.push({
          type: 'revive',
          actorId: actor.id,
          healPercent: effect.percentage || 0.5,
        });

        logs.push({
          type: 'heal',
          actor: { name: actor.name, emoji: actor.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          buffType: 'revive',
        });
        break;
      }

      const targets = skill.targetType === TARGET_TYPE.ALL_ALLIES
        ? aliveAllies
        : skill.targetType === TARGET_TYPE.LOWEST_HP_ALLY
          ? [aliveAllies.reduce((lowest, a) =>
              a.stats.hp / a.stats.maxHp < lowest.stats.hp / lowest.stats.maxHp ? a : lowest
            , aliveAllies[0])]
          : skill.targetType === TARGET_TYPE.SELF
            ? [actor]
            : [];

      // Add skill activation effect
      if (addEffect) {
        addEffect({
          type: 'skillActivation',
          position: actor.position,
          skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
        });
      }

      for (const target of targets) {
        if (!target) continue;

        // Support both 'percentage' and 'percentOfMax' for heal calculations
        const healPercent = effect.percentage ?? effect.percentOfMax ?? 0;
        const healAmount = Math.floor(target.stats.maxHp * healPercent);

        results.push({
          type: 'heal',
          targetId: target.id,
          amount: healAmount,
          isHero: true,
        });

        logs.push({
          type: 'heal',
          actor: { name: actor.name, emoji: actor.emoji },
          target: { name: target.name, emoji: target.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          amount: healAmount,
        });

        if (addEffect) {
          // Healing number
          addEffect({
            type: 'damage',
            position: target.position,
            damage: healAmount,
            isHeal: true,
          });
          // Healing burst particles
          addEffect({
            type: 'healBurst',
            position: target.position,
            amount: healAmount,
          });
        }
      }

      // Handle Holy Nova's damage to enemies
      if (effect.alsoDamage && effect.damageMultiplier) {
        for (const enemy of aliveEnemies) {
          const { damage } = calculateSkillDamage(actor, enemy, effect.damageMultiplier);
          results.push({
            type: 'damage',
            targetId: enemy.id,
            damage,
            isHero: false,
          });

          if (addEffect) {
            addEffect({
              type: 'damage',
              position: enemy.position,
              damage,
              isHeal: false,
            });
          }
        }
      }

      // Handle Spirit Link's attack buff for allies
      if (effect.attackBuff) {
        for (const target of targets) {
          if (!target) continue;
          results.push({
            type: 'buff',
            targetId: target.id,
            buff: {
              attackBonus: effect.attackBuff,
              duration: effect.duration || 2,
            },
          });

          if (addEffect) {
            addEffect({
              type: 'buffAura',
              position: target.position,
              color: '#ef4444',
            });
          }
        }

        logs.push({
          type: 'buff',
          actor: { name: actor.name, emoji: actor.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          buffType: 'attackBuff',
        });
      }
      break;
    }

    case EFFECT_TYPE.SHIELD: {
      const target = skill.targetType === TARGET_TYPE.SELF
        ? actor
        : skill.targetType === TARGET_TYPE.LOWEST_HP_ALLY
          ? aliveAllies.reduce((lowest, a) =>
              a.stats.hp / a.stats.maxHp < lowest.stats.hp / lowest.stats.maxHp ? a : lowest
            , aliveAllies[0])
          : null;

      // Add skill activation effect
      if (addEffect) {
        addEffect({
          type: 'skillActivation',
          position: actor.position,
          skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
        });
      }

      if (target) {
        results.push({
          type: 'buff',
          targetId: target.id,
          buff: {
            type: 'shield',
            amount: effect.amount || 0,
            blockNextHit: effect.blockNextHit || false,
          },
        });

        logs.push({
          type: 'buff',
          actor: { name: actor.name, emoji: actor.emoji },
          target: { name: target.name, emoji: target.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          buffType: 'shield',
        });

        // Add shield aura visual
        if (addEffect) {
          addEffect({
            type: 'buffAura',
            position: target.position,
            color: '#fbbf24', // Gold for shields
          });
        }
      }
      break;
    }

    case EFFECT_TYPE.BUFF: {
      // Handle cleanse (remove debuffs from allies)
      if (effect.cleanse) {
        const targets = skill.targetType === TARGET_TYPE.ALL_ALLIES ? aliveAllies : [actor];

        if (addEffect) {
          addEffect({
            type: 'skillActivation',
            position: actor.position,
            skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
          });
        }

        for (const target of targets) {
          results.push({
            type: 'cleanse',
            targetId: target.id,
            isHero: true,
          });

          if (addEffect) {
            addEffect({
              type: 'buffAura',
              position: target.position,
              color: '#fbbf24',
            });
          }
        }

        logs.push({
          type: 'buff',
          actor: { name: actor.name, emoji: actor.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          buffType: 'cleanse',
        });
        break;
      }

      // Handle extra turn (Time Warp)
      if (effect.extraTurn) {
        if (addEffect) {
          addEffect({
            type: 'skillActivation',
            position: actor.position,
            skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
          });
        }

        for (const ally of aliveAllies) {
          results.push({
            type: 'buff',
            targetId: ally.id,
            buff: {
              extraTurn: true,
              duration: 1,
            },
          });

          if (addEffect) {
            addEffect({
              type: 'buffAura',
              position: ally.position,
              color: '#8b5cf6',
            });
          }
        }

        logs.push({
          type: 'buff',
          actor: { name: actor.name, emoji: actor.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          buffType: 'extraTurn',
        });
        break;
      }

      // Handle raise enemy (Necromancer active skill)
      if (effect.raiseEnemy) {
        if (addEffect) {
          addEffect({
            type: 'skillActivation',
            position: actor.position,
            skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
          });
        }

        results.push({
          type: 'raiseEnemy',
          actorId: actor.id,
        });

        logs.push({
          type: 'buff',
          actor: { name: actor.name, emoji: actor.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          buffType: 'raiseEnemy',
        });
        break;
      }

      // Handle AOE attacks buff (Ascendance)
      if (effect.aoeAttacks) {
        if (addEffect) {
          addEffect({
            type: 'skillActivation',
            position: actor.position,
            skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
          });
        }

        results.push({
          type: 'buff',
          targetId: actor.id,
          buff: {
            aoeAttacks: true,
            damageBonus: effect.damageBonus || 0,
            duration: effect.duration || 1,
          },
        });

        logs.push({
          type: 'buff',
          actor: { name: actor.name, emoji: actor.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          buffType: 'ascendance',
        });

        if (addEffect) {
          addEffect({
            type: 'buffAura',
            position: actor.position,
            color: '#f97316',
          });
        }
        break;
      }

      // Standard buff handling
      const targets = skill.targetType === TARGET_TYPE.SELF
        ? [actor]
        : skill.targetType === TARGET_TYPE.ALL_ALLIES
          ? aliveAllies
          : [];

      // Add skill activation effect
      if (addEffect) {
        addEffect({
          type: 'skillActivation',
          position: actor.position,
          skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
        });
      }

      for (const target of targets) {
        results.push({
          type: 'buff',
          targetId: target.id,
          buff: {
            evasion: effect.evasion,
            speedBonus: effect.speedBonus,
            damageReduction: effect.damageReduction,
            damageBonus: effect.damageBonus,
            attackBonus: effect.attackBonus,
            healingBonus: effect.healingBonus,
            taunt: effect.taunt,
            dotImmune: effect.dotImmune,
            healingReduction: effect.healingReduction,
            duration: effect.duration || 1,
          },
        });

        logs.push({
          type: 'buff',
          actor: { name: actor.name, emoji: actor.emoji },
          target: { name: target.name, emoji: target.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          buffType: Object.keys(effect).filter(k => k !== 'type' && k !== 'duration')[0],
        });

        // Add buff aura visual
        if (addEffect) {
          addEffect({
            type: 'buffAura',
            position: target.position,
            color: effect.taunt ? '#ef4444' : effect.evasion ? '#22c55e' : '#3b82f6',
          });
        }
      }
      break;
    }

    case EFFECT_TYPE.DOT: {
      const target = aliveEnemies[0];

      // Add skill activation effect
      if (addEffect) {
        addEffect({
          type: 'skillActivation',
          position: actor.position,
          skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
        });
      }

      if (target) {
        results.push({
          type: 'debuff',
          targetId: target.id,
          debuff: {
            type: 'dot',
            multiplier: effect.multiplier,
            duration: effect.duration,
            attackerAttack: actor.stats.attack,
          },
        });

        logs.push({
          type: 'debuff',
          actor: { name: actor.name, emoji: actor.emoji },
          target: { name: target.name, emoji: target.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          debuffType: 'poison',
        });

        // Add status icon for poison/dot
        if (addEffect) {
          addEffect({
            type: 'status',
            position: target.position,
            status: 'poison',
          });
        }
      }
      break;
    }

    case EFFECT_TYPE.HOT: {
      const targets = skill.targetType === TARGET_TYPE.ALL_ALLIES
        ? aliveAllies
        : skill.targetType === TARGET_TYPE.LOWEST_HP_ALLY
          ? [aliveAllies.reduce((lowest, a) =>
              a.stats.hp / a.stats.maxHp < lowest.stats.hp / lowest.stats.maxHp ? a : lowest
            , aliveAllies[0])]
          : [];

      // Add skill activation effect
      if (addEffect) {
        addEffect({
          type: 'skillActivation',
          position: actor.position,
          skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
        });
      }

      // Support both 'percentage' and 'percentPerTurn' for HOT effects
      const hotPercent = effect.percentage ?? effect.percentPerTurn ?? 0;

      for (const target of targets) {
        if (!target) continue;

        results.push({
          type: 'buff',
          targetId: target.id,
          buff: {
            type: 'hot',
            percentage: hotPercent,
            duration: effect.duration,
          },
        });
      }

      logs.push({
        type: 'buff',
        actor: { name: actor.name, emoji: actor.emoji },
        skill: { name: skill.name, emoji: skill.emoji },
        buffType: 'regen',
      });
      break;
    }

    case EFFECT_TYPE.DEBUFF: {
      const target = aliveEnemies[0];

      // Add skill activation effect
      if (addEffect) {
        addEffect({
          type: 'skillActivation',
          position: actor.position,
          skill: { id: skill.id, name: skill.name, emoji: skill.emoji },
        });
      }

      // Handle dispel (remove buffs from enemy - Shaman Purge)
      if (effect.dispel && target) {
        results.push({
          type: 'dispel',
          targetId: target.id,
          isHero: false,
        });

        logs.push({
          type: 'debuff',
          actor: { name: actor.name, emoji: actor.emoji },
          target: { name: target.name, emoji: target.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          debuffType: 'dispel',
        });

        if (addEffect) {
          addEffect({
            type: 'status',
            position: target.position,
            status: 'dispel',
          });
        }
        break;
      }

      // Handle stun debuff (Ranger Trap)
      if (effect.stun && target) {
        results.push({
          type: 'debuff',
          targetId: target.id,
          debuff: { type: 'stun', duration: effect.stun },
        });

        logs.push({
          type: 'debuff',
          actor: { name: actor.name, emoji: actor.emoji },
          target: { name: target.name, emoji: target.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          debuffType: 'stun',
        });

        if (addEffect) {
          addEffect({
            type: 'status',
            position: target.position,
            status: 'stun',
          });
        }
        break;
      }

      // Handle damage amplification debuff (Hunter's Mark)
      if (effect.damageAmp && target) {
        results.push({
          type: 'debuff',
          targetId: target.id,
          debuff: {
            type: 'damageAmp',
            percent: effect.damageAmp,
            duration: effect.duration || 3,
          },
        });

        logs.push({
          type: 'debuff',
          actor: { name: actor.name, emoji: actor.emoji },
          target: { name: target.name, emoji: target.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          debuffType: 'marked',
        });

        if (addEffect) {
          addEffect({
            type: 'status',
            position: target.position,
            status: 'marked',
          });
        }
        break;
      }

      // Handle attack reduction debuff (Curse of Weakness)
      if (effect.attackReduction && target) {
        results.push({
          type: 'debuff',
          targetId: target.id,
          debuff: {
            type: 'weakness',
            percent: effect.attackReduction,
            duration: effect.duration || 3,
          },
        });

        logs.push({
          type: 'debuff',
          actor: { name: actor.name, emoji: actor.emoji },
          target: { name: target.name, emoji: target.emoji },
          skill: { name: skill.name, emoji: skill.emoji },
          debuffType: 'weakness',
        });

        if (addEffect) {
          addEffect({
            type: 'status',
            position: target.position,
            status: 'weakness',
          });
        }
        break;
      }

      break;
    }

    default:
      break;
  }

  // Handle stun effect (added to damage skills)
  if (effect.stun && results.length > 0) {
    const damageResult = results.find(r => r.type === 'damage');
    if (damageResult) {
      results.push({
        type: 'debuff',
        targetId: damageResult.targetId,
        debuff: { type: 'stun', duration: effect.stun },
      });
    }
  }

  // Handle slow effect (added to damage skills)
  if (effect.slow && results.length > 0) {
    for (const result of results.filter(r => r.type === 'damage')) {
      results.push({
        type: 'debuff',
        targetId: result.targetId,
        debuff: { type: 'slow', duration: effect.slow },
      });
    }
  }

  return { results, logs };
};
