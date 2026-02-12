import { getSkillById, SKILL_TYPE, TARGET_TYPE, EFFECT_TYPE } from '../data/skillTrees';

/**
 * Calculate damage for a skill attack
 * Returns { damage, isCrit }
 */
export const calculateSkillDamage = (attacker, defender, multiplier, options = {}) => {
  // Apply armor penetration - reduces effective defense
  const armorPen = options.armorPen || 0;
  const effectiveDefense = defender.stats.defense * (1 - armorPen);
  const baseDamage = attacker.stats.attack - effectiveDefense * 0.5;
  let damage = Math.max(1, Math.floor(baseDamage * multiplier * (0.85 + Math.random() * 0.3)));
  let isCrit = false;

  // Apply crit
  if (options.alwaysCrit || (options.critChance && Math.random() < options.critChance)) {
    damage = Math.floor(damage * 1.5);
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
      if (hpRatio < 0.25) criticalAllyCount++;
      if (hpRatio < 0.5) lowHpAllyCount++;
      if (hpRatio < 0.75) hurtAllyCount++;
    }
  }

  let lowHpEnemyCount = 0;
  let bossCount = 0;
  let aliveEnemyCount = 0;

  for (let i = 0; i < enemies.length; i++) {
    const e = enemies[i];
    if (e.stats.hp > 0) {
      aliveEnemyCount++;
      if (e.stats.hp / e.stats.maxHp < 0.25) lowHpEnemyCount++;
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

    switch (passive.type) {
      case 'damage_reduction':
        bonuses.damageReduction += passive.percent / 100;
        break;

      case 'low_hp_bonus':
        // Check if hero is below HP threshold
        if (hero.stats.hp / hero.stats.maxHp <= passive.threshold) {
          bonuses.damageMultiplier += passive.damageBonus || 0;
          if (passive.evasionBonus) {
            bonuses.dodgeChance += passive.evasionBonus / 100;
          }
        }
        break;

      case 'high_hp_bonus':
        // Bonus when above HP threshold
        if (hero.stats.hp / hero.stats.maxHp >= passive.threshold) {
          bonuses.damageMultiplier += passive.damageBonus || 0;
        }
        break;

      case 'high_hp_reduction':
        // Damage reduction when above HP threshold
        if (hero.stats.hp / hero.stats.maxHp >= passive.threshold) {
          bonuses.damageReduction += passive.reduction / 100;
        }
        break;

      case 'execute_bonus':
      case 'execute':
        // Check if target is below HP threshold
        if (context.target && context.target.stats.hp / context.target.stats.maxHp <= passive.threshold) {
          bonuses.damageMultiplier += passive.damageBonus || 1.0;
        }
        bonuses.executeThreshold = Math.max(bonuses.executeThreshold, passive.threshold || 0);
        break;

      case 'on_kill_bonus':
        // Stacking damage bonus per kill
        if (context.killBonusStacks) {
          bonuses.damageMultiplier += (passive.damagePercent || 10) / 100 * context.killBonusStacks;
        }
        break;

      case 'crit_bonus':
        bonuses.critChance += passive.percent / 100;
        break;

      case 'crit_damage_bonus':
        bonuses.critDamageBonus += passive.percent / 100;
        break;

      case 'stat_bonus':
        if (passive.damageBonus) {
          bonuses.damageMultiplier += passive.damageBonus;
        }
        break;

      case 'damage_bonus':
        bonuses.damageMultiplier += passive.percent / 100;
        break;

      case 'lifesteal':
        bonuses.lifestealPercent += passive.percent;
        break;

      case 'double_attack_chance':
        bonuses.doubleAttackChance += passive.percent / 100;
        break;

      case 'cleave':
        bonuses.cleavePercent += passive.percent;
        break;

      case 'dodge_chance':
        bonuses.dodgeChance += passive.percent / 100;
        break;

      case 'reflect_damage':
        bonuses.reflectPercent += passive.percent;
        break;

      case 'reflect_flat':
        bonuses.reflectFlat += passive.amount;
        break;

      case 'healing_bonus':
        bonuses.healingBonus += passive.percent / 100;
        break;

      case 'threat_bonus':
        bonuses.threatBonus += passive.percent;
        break;

      case 'opener_bonus':
        // First attack of combat deals bonus damage
        if (context.isFirstAttack) {
          bonuses.damageMultiplier += passive.damageBonus / 100;
        }
        break;

      case 'first_skill_bonus':
        // First skill use deals bonus damage
        if (context.isFirstSkillUse) {
          bonuses.damageMultiplier += passive.damageBonus || 0;
        }
        break;

      case 'first_turn_speed':
        // Handled in initiative calculation
        break;

      case 'range_bonus':
        // Bonus damage at range
        if (context.distance && context.distance >= passive.minRange) {
          bonuses.damageMultiplier += passive.damageBonus / 100;
        }
        break;

      case 'priority_target_bonus':
        // Bonus damage against priority targets (lowest HP)
        if (context.isPriorityTarget) {
          bonuses.damageMultiplier += passive.damageBonus / 100;
        }
        break;

      case 'hp_for_damage':
        // Trade HP for damage (handled in attack resolution)
        bonuses.hpCostPerAttack = passive.hpCost;
        bonuses.damageMultiplier += passive.damageBonus / 100;
        break;

      case 'dual_bonus':
        if (passive.damageBonus) {
          bonuses.damageMultiplier += passive.damageBonus;
        }
        if (passive.attackBonus) {
          bonuses.damageMultiplier += passive.attackBonus;
        }
        if (passive.healingBonus) {
          bonuses.healingBonus += passive.healingBonus;
        }
        break;

      default:
        break;
    }
  }

  return bonuses;
};

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

    if (passive.type === 'cheat_death' || passive.type === 'conditional_cheat_death') {
      // Check if already used this combat
      if (!heroCheatDeathUsed.has(hero.id)) {
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
      hp: Math.floor(hero.stats.maxHp * 0.3),
      maxHp: Math.floor(hero.stats.maxHp * 0.3),
      attack: hero.stats.attack,
      defense: Math.floor(hero.stats.defense * 0.5),
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
      hp: Math.floor(monster.stats.maxHp * 0.5),
      maxHp: Math.floor(monster.stats.maxHp * 0.5),
      attack: Math.floor(monster.stats.attack * 0.7),
      defense: Math.floor(monster.stats.defense * 0.5),
      speed: monster.stats.speed,
    },
  };
};
