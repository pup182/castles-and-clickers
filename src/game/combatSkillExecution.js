/**
 * Combat skill/ability execution - hero skills and monster abilities.
 * Extracted from useCombat.js to reduce file size.
 */

import {
  chooseBestSkill, executeSkillAbility, applyPassiveEffects,
  getEffectiveCooldown, getHotBonuses, createRaisedUndead,
  getHealShieldBonus, getBeaconHealInfo, getLivingSeedInfo,
  hasCCImmunity,
} from './skillEngine';
import { getHeroHealingReduction, isHeroImmuneToStatus } from './uniqueEngine';
import { applyStatusEffect } from './statusEngine';
import { STATUS_EFFECTS } from '../data/statusEffects';
import { getPassiveAffixBonuses, checkPhoenixRevive } from './affixEngine';
import { chooseMonsterAbility, executeMonsterAbility } from './monsterAI';
import { MONSTERS } from '../data/monsters';
import { ELITE_CONFIG } from '../data/monsters';
import { generateEquipment, generateConsumableDrop } from '../data/equipment';
import { rollRaidDrop, getWingBoss } from '../data/raids';
import { calculateDodgeChance } from './constants';
import { handleUnitDeath, handleMonsterDamageTriggers } from './combatHelpers';

/**
 * Execute a hero skill action if one is available.
 * Mutates ctx. Returns true if a skill was used, false otherwise.
 */
export const executeHeroSkillAction = (ctx, actor) => {
  const {
    newHeroes, newMonsters, newBuffs, newStatusEffects,
    newSkillCooldowns, newKillBonusStacks, newTurnOrder,
    aliveHeroes, activeCombatMonsters,
    heroes, heroHp, dungeon, dungeonProgress, homesteadBonuses,
    findHeroIndex, findMonsterIndex,
    addCombatLog, addEffect, incrementStat,
    addGold, addXpToHero, processLootDrop, handleUniqueDrop, addConsumable,
    goldMultiplier, xpMultiplier,
    defeatWingBoss, completeRaid, getOwnedUniques,
  } = ctx;

  if (!actor.isHero || !actor.skills || actor.skills.length === 0) return false;

  const heroCooldowns = newSkillCooldowns[actor.id] || {};
  const skill = chooseBestSkill(actor, activeCombatMonsters, aliveHeroes, heroCooldowns);
  if (!skill) return false;

  // Track first skill use for Arcane Surge (first_skill_bonus)
  const isFirstSkill = !newBuffs[actor.id]?.usedFirstSkill;
  if (isFirstSkill) {
    if (!newBuffs[actor.id]) newBuffs[actor.id] = {};
    newBuffs[actor.id].usedFirstSkill = true;
  }

  // Execute the skill
  const { results, logs } = executeSkillAbility(
    actor, skill, activeCombatMonsters, aliveHeroes, heroHp, ctx.addEffect, newBuffs
  );

  // Apply first skill bonus (Mage Arcane Surge)
  if (isFirstSkill) {
    const firstSkillBonuses = applyPassiveEffects(actor, 'on_attack', { isFirstSkillUse: true });
    if (firstSkillBonuses.damageMultiplier > 1.0) {
      for (const result of results) {
        if (result.type === 'damage') {
          result.damage = Math.floor(result.damage * firstSkillBonuses.damageMultiplier);
        }
      }
      addCombatLog({ type: 'system', message: `Arcane Surge! ${actor.name}'s first skill deals bonus damage!` });
    }
  }

  // Log skill use
  for (const log of logs) {
    if (log.type === 'skill') {
      addCombatLog({ type: 'skill', actor: log.actor, target: log.target, skill: log.skill, damage: log.damage });
    } else if (log.type === 'heal') {
      addCombatLog({ type: 'heal', actor: log.actor, target: log.target, skill: log.skill, amount: log.amount });
    } else if (log.type === 'buff' || log.type === 'debuff') {
      addCombatLog(log);
    }
  }

  // Apply results - OPTIMIZATION: Mutate arrays in place
  for (const result of results) {
    if (result.type === 'damage' && !result.isHero) {
      const monsterIdx = findMonsterIndex(result.targetId);
      if (monsterIdx !== -1) {
        const m = newMonsters[monsterIdx];
        const oldHp = m.stats.hp;
        const newHp = Math.max(0, oldHp - result.damage);
        m.stats.hp = newHp;

        // Track skill damage dealt
        ctx.totalDamageDealtThisTurn += result.damage;

        // Trigger on_damage abilities (Enrage) if monster survived
        if (newHp > 0) {
          handleMonsterDamageTriggers(ctx, m, monsterIdx);
        }

        // Apply monster reflectDamage passive (Thorny affix)
        if (m.passive?.reflectDamage && actor.isHero && newHp > 0) {
          const reflectedDmg = Math.floor(result.damage * m.passive.reflectDamage);
          if (reflectedDmg > 0) {
            const attackerHeroIdx = findHeroIndex(actor.id);
            if (attackerHeroIdx !== -1) {
              newHeroes[attackerHeroIdx].stats.hp = Math.max(1, newHeroes[attackerHeroIdx].stats.hp - reflectedDmg);
              addCombatLog({ type: 'system', message: `${m.name}'s thorns reflect ${reflectedDmg} damage to ${actor.name}!` });
              addEffect({ type: 'damage', position: actor.position, damage: reflectedDmg });
            }
          }
        }

        if (newHp <= 0 && oldHp > 0) {
          addCombatLog({ type: 'death', target: { name: m.name }, isHero: false });
          addEffect({ type: 'death', position: m.position, isHero: false, monsterId: m.templateId });
          handleUnitDeath(ctx, m.id, m);

          // Track raid boss defeat from skill damage
          if (m.wingBossId) {
            defeatWingBoss(m.wingBossId);
            addCombatLog({ type: 'system', message: `Wing Boss defeated: ${m.name}!` });
          }
          if (m.finalBossId) {
            defeatWingBoss(m.finalBossId);
            addCombatLog({ type: 'system', message: `FINAL BOSS DEFEATED: ${m.name}! Raid Complete!` });
            setTimeout(() => completeRaid(), 2000);
          }

          // Handle resetOnKill - reset the skill's cooldown
          if (result.resetOnKill && result.skillId) {
            if (newSkillCooldowns[actor.id]) {
              newSkillCooldowns[actor.id][result.skillId] = 0;
            }
            addCombatLog({ type: 'system', message: `${skill.name} cooldown reset!` });
          }

          const baseGold = m.goldReward.min + Math.floor(Math.random() * (m.goldReward.max - m.goldReward.min));
          const gold = Math.floor(baseGold * goldMultiplier);
          addGold(gold);

          // Award XP with bonus for underleveled heroes
          const baseXpPerHero = Math.floor((m.xpReward / heroes.length) * xpMultiplier);
          heroes.forEach(h => {
            const levelDiff = dungeon.level - h.level;
            const catchUpBonus = levelDiff > 0 ? 1 + (levelDiff * 0.10) : 1;
            const xpForHero = Math.floor(baseXpPerHero * catchUpBonus);
            addXpToHero(h.id, xpForHero);
          });
          incrementStat('totalMonstersKilled', 1, { heroId: actor.ownerId || actor.id, monsterId: m.templateId, isBoss: m.isBoss });

          if (gold > 0) {
            addEffect({ type: 'goldDrop', position: m.position, amount: gold });
          }

          newKillBonusStacks[actor.id] = (newKillBonusStacks[actor.id] || 0) + 1;

          // Handle unique drops from world bosses
          if (m.isWorldBoss && m.uniqueDrop) {
            const ownedUniques = getOwnedUniques();
            if (!ownedUniques.includes(m.uniqueDrop)) {
              handleUniqueDrop(m.uniqueDrop, m.position);
            }
          }

          // Handle raid boss drops
          const isRaidDungeon = dungeonProgress?.currentType === 'raid';
          if (isRaidDungeon && m.isBoss) {
            const targetBossId = m.wingBossId || m.finalBossId;
            const raidBoss = getWingBoss(dungeonProgress.currentRaidId, targetBossId);
            const ownedUniques = getOwnedUniques();
            const raidDrop = rollRaidDrop(raidBoss?.dropTable, ownedUniques);

            if (raidDrop?.type === 'unique') {
              handleUniqueDrop(raidDrop.itemId, m.position);
            } else if (raidDrop) {
              const item = generateEquipment(dungeon.level, { guaranteedRarity: raidDrop.rarity || 'epic' });
              const lootResult = processLootDrop(item);
              addEffect({ type: 'lootDrop', position: m.position, slot: item.slot, rarityColor: item.rarityColor || '#9ca3af' });
              if (lootResult.action === 'sold') {
                addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${lootResult.gold}g)` });
              } else if (lootResult.action === 'looted') {
                addCombatLog({ type: 'system', message: `Loot: ${item.name}` });
              }
            }
          }

          // Calculate drop chance and minimum rarity
          const skipNormalDrop = isRaidDungeon && m.isBoss;
          let dropChance = skipNormalDrop ? 0 : (m.isBoss ? 0.95 : 0.25);
          let minRarity = null;

          if (m.isElite) {
            dropChance = 1.0;
            minRarity = ELITE_CONFIG.guaranteedMinRarity;
          }
          if (m.isWorldBoss) {
            dropChance = 1.0;
            minRarity = m.guaranteedRarity || 'epic';
          }

          if (Math.random() < dropChance) {
            const item = generateEquipment(dungeon.level, { guaranteedRarity: minRarity });
            const lootResult = processLootDrop(item);
            addEffect({ type: 'lootDrop', position: m.position, slot: item.slot, rarityColor: item.rarityColor || '#9ca3af' });
            if (lootResult.action === 'sold') {
              addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${lootResult.gold}g)` });
            } else if (lootResult.action === 'looted') {
              addCombatLog({ type: 'system', message: `Loot: ${item.name}${lootResult.upgradeFor ? ' [Upgrade]' : ''}` });
            } else {
              addCombatLog({ type: 'system', message: `${item.name} (inventory full!)` });
            }
          }

          // Chance to drop resurrection scroll
          const hasDeadPartyMember = newHeroes.some(h => h && h.stats.hp <= 0);
          const consumable = generateConsumableDrop(dungeon.level, hasDeadPartyMember, dungeon.isRaid);
          if (consumable && addConsumable(consumable)) {
            addCombatLog({ type: 'system', message: `Found: ${consumable.name}!` });
          }
        }
      }
    } else if (result.type === 'revive') {
      // Handle Resurrection skill - revive a dead ally
      const deadHeroes = newHeroes.filter(h => h.stats.hp <= 0 && !h.isPet && !h.isClone && !h.isUndead);
      if (deadHeroes.length > 0) {
        const targetHero = deadHeroes[0];
        const heroIdx = findHeroIndex(targetHero.id);
        if (heroIdx !== -1) {
          const reviveHp = Math.floor(targetHero.stats.maxHp * result.healPercent);
          newHeroes[heroIdx].stats.hp = reviveHp;
          addCombatLog({ type: 'system', message: `${actor.name} resurrects ${targetHero.name} with ${reviveHp} HP!` });
          addEffect({ type: 'healBurst', position: targetHero.position });
        }
      } else {
        addCombatLog({ type: 'system', message: 'No fallen allies to resurrect!' });
      }
    } else if (result.type === 'selfDamage') {
      const heroIdx = findHeroIndex(result.targetId);
      if (heroIdx !== -1) {
        newHeroes[heroIdx].stats.hp = Math.max(1, newHeroes[heroIdx].stats.hp - result.damage);
      }
    } else if (result.type === 'raiseEnemy') {
      const deadMonsters = newMonsters.filter(m => m.stats.hp <= 0 && !m.preventResurrection);
      if (deadMonsters.length > 0) {
        const strongest = deadMonsters.reduce((best, m) =>
          m.stats.maxHp > best.stats.maxHp ? m : best, deadMonsters[0]);
        const raisedUndead = createRaisedUndead(strongest, 3, strongest.position);
        newHeroes.push(raisedUndead);
        newTurnOrder.push(raisedUndead.id);
        addCombatLog({ type: 'system', message: `${actor.name} raises ${strongest.name} from the dead!` });
        addEffect({ type: 'healBurst', position: strongest.position });
      } else {
        addCombatLog({ type: 'system', message: 'No corpses to raise!' });
      }
    } else if (result.type === 'cleanse') {
      newStatusEffects[result.targetId] = [];
      const targetHero = newHeroes.find(h => h.id === result.targetId);
      if (targetHero) {
        addCombatLog({ type: 'system', message: `${targetHero.name} is cleansed of all debuffs!` });
      }
    } else if (result.type === 'dispel') {
      newBuffs[result.targetId] = {};
      const targetMonster = newMonsters.find(m => m.id === result.targetId);
      if (targetMonster) {
        addCombatLog({ type: 'system', message: `${targetMonster.name}'s buffs are dispelled!` });
      }
    } else if (result.type === 'debuff') {
      if (!newBuffs[result.targetId]) newBuffs[result.targetId] = {};
      const debuff = result.debuff;
      if (debuff.type === 'damageAmp') {
        newBuffs[result.targetId].damageAmp = debuff.percent;
        newBuffs[result.targetId].damageAmpDuration = debuff.duration;
      } else if (debuff.type === 'weakness') {
        newBuffs[result.targetId].weakness = debuff.percent;
        newBuffs[result.targetId].weaknessDuration = debuff.duration;
      } else if (debuff.type === 'stun') {
        const mockTarget = { statusEffects: newStatusEffects[result.targetId] || [] };
        const statusResult = applyStatusEffect(mockTarget, 'stun', actor, { duration: debuff.duration });
        newStatusEffects[result.targetId] = statusResult.effects;
      }
    } else if (result.type === 'heal') {
      const heroIdx = findHeroIndex(result.targetId);
      if (heroIdx !== -1) {
        const h = newHeroes[heroIdx];
        const targetHealReduction = getHeroHealingReduction(heroes.find(hr => hr.id === result.targetId) || {});
        const buffHealReduction = (newBuffs[result.targetId] || {}).healingReduction || 0;
        const totalHealReduction = Math.min(1, targetHealReduction + buffHealReduction);
        const reducedHealAmount = totalHealReduction > 0 ? Math.floor(result.amount * (1 - totalHealReduction)) : result.amount;
        const actualHealAmount = Math.min(reducedHealAmount, h.stats.maxHp - h.stats.hp);
        h.stats.hp = Math.min(h.stats.maxHp, h.stats.hp + reducedHealAmount);
        if (targetHealReduction > 0) {
          addCombatLog({ type: 'system', message: `Vampire's Embrace reduces ${h.name}'s healing by ${Math.round(targetHealReduction * 100)}%` });
        }
        if (buffHealReduction > 0) {
          addCombatLog({ type: 'system', message: `Lich Form reduces ${h.name}'s healing by ${Math.round(buffHealReduction * 100)}%` });
        }
        if (actualHealAmount > 0) {
          ctx.healingReceivedByHero[result.targetId] = (ctx.healingReceivedByHero[result.targetId] || 0) + actualHealAmount;
          ctx.healingDoneByHero[actor.id] = (ctx.healingDoneByHero[actor.id] || 0) + actualHealAmount;
        }

        // Check for heal_shield (Cleric Radiance)
        const healShieldInfo = getHealShieldBonus(actor);
        if (healShieldInfo.hasHealShield) {
          const shieldAmount = Math.floor(result.amount * healShieldInfo.percent);
          if (!newBuffs[result.targetId]) newBuffs[result.targetId] = {};
          newBuffs[result.targetId].shield = (newBuffs[result.targetId].shield || 0) + shieldAmount;
          addCombatLog({ type: 'system', message: `${healShieldInfo.skillName}! ${h.name} gains ${shieldAmount} shield` });
        }

        // Check for beacon heal (Paladin Beacon of Light)
        const beaconInfo = getBeaconHealInfo(actor);
        if (beaconInfo.hasBeacon) {
          const lowestAlly = aliveHeroes
            .filter(a => a.id !== result.targetId && a.stats.hp > 0)
            .reduce((lowest, a) =>
              a.stats.hp / a.stats.maxHp < lowest.stats.hp / lowest.stats.maxHp ? a : lowest
            , aliveHeroes.find(a => a.id !== result.targetId) || null);

          if (lowestAlly) {
            const beaconHeal = Math.floor(result.amount * beaconInfo.percent);
            const lowestIdx = findHeroIndex(lowestAlly.id);
            if (lowestIdx !== -1 && beaconHeal > 0) {
              const actualBeaconHeal = Math.min(beaconHeal, newHeroes[lowestIdx].stats.maxHp - newHeroes[lowestIdx].stats.hp);
              if (actualBeaconHeal > 0) {
                newHeroes[lowestIdx].stats.hp += actualBeaconHeal;
                addEffect({ type: 'damage', position: lowestAlly.position, damage: actualBeaconHeal, isHeal: true });
                addCombatLog({ type: 'system', message: `${beaconInfo.skillName}! ${lowestAlly.name} receives ${actualBeaconHeal} healing` });
                ctx.healingReceivedByHero[lowestAlly.id] = (ctx.healingReceivedByHero[lowestAlly.id] || 0) + actualBeaconHeal;
                ctx.healingDoneByHero[actor.id] = (ctx.healingDoneByHero[actor.id] || 0) + actualBeaconHeal;
              }
            }
          }
        }

        // Check for living seed (Druid Living Seed)
        const livingSeedInfo = getLivingSeedInfo(actor);
        if (livingSeedInfo.hasLivingSeed) {
          if (!newBuffs[result.targetId]) newBuffs[result.targetId] = {};
          newBuffs[result.targetId].livingSeed = livingSeedInfo.healPercent;
          newBuffs[result.targetId].livingSeedCaster = actor.id;
        }
      }
    } else if (result.type === 'buff') {
      if (!newBuffs[result.targetId]) newBuffs[result.targetId] = {};

      const buff = result.buff;
      if (buff.taunt) {
        newBuffs[result.targetId].taunt = buff.taunt;
        addCombatLog({ type: 'system', message: `${actor.name} taunts all enemies!` });
      }
      if (buff.evasion) {
        newBuffs[result.targetId].evasion = buff.evasion;
        addCombatLog({ type: 'system', message: `${actor.name} becomes evasive!` });
      }
      if (buff.speedBonus) {
        newBuffs[result.targetId].speedBonus = (newBuffs[result.targetId].speedBonus || 0) + buff.speedBonus;
        newBuffs[result.targetId].speedBonusDuration = buff.duration || 1;
      }
      if (buff.damageReduction) {
        newBuffs[result.targetId].damageReduction = buff.damageReduction;
        newBuffs[result.targetId].damageReductionDuration = buff.duration || 1;
      }
      if (buff.damageBonus) {
        newBuffs[result.targetId].damageBonus = (newBuffs[result.targetId].damageBonus || 0) + buff.damageBonus;
        newBuffs[result.targetId].damageBonusDuration = buff.duration || 1;
      }
      if (buff.attackBonus) {
        newBuffs[result.targetId].attackBonus = (newBuffs[result.targetId].attackBonus || 0) + buff.attackBonus;
        newBuffs[result.targetId].attackBonusDuration = buff.duration || 1;
      }
      if (buff.healingBonus) {
        newBuffs[result.targetId].healingBonus = (newBuffs[result.targetId].healingBonus || 0) + buff.healingBonus;
        newBuffs[result.targetId].healingBonusDuration = buff.duration || 1;
      }
      if (buff.extraTurn) {
        newBuffs[result.targetId].extraTurn = true;
        addCombatLog({ type: 'system', message: `Time Warp! All allies will act twice!` });
      }
      if (buff.aoeAttacks) {
        newBuffs[result.targetId].aoeAttacks = true;
        newBuffs[result.targetId].aoeAttacksDuration = buff.duration || 1;
        newBuffs[result.targetId].damageBonus = (newBuffs[result.targetId].damageBonus || 0) + (buff.damageBonus || 0);
        addCombatLog({ type: 'system', message: `${actor.name} ascends! Attacks now hit all enemies!` });
      }
      if (buff.dotImmune) {
        newBuffs[result.targetId].dotImmune = true;
        newBuffs[result.targetId].dotImmuneDuration = buff.duration || 1;
      }
      if (buff.healingReduction) {
        newBuffs[result.targetId].healingReduction = buff.healingReduction;
        newBuffs[result.targetId].healingReductionDuration = buff.duration || 1;
      }
      if (buff.type === 'shield') {
        newBuffs[result.targetId].shield = buff.amount || 0;
        newBuffs[result.targetId].blockNextHit = buff.blockNextHit || false;
      }
      if (buff.type === 'hot') {
        const hotBonuses = getHotBonuses(actor);
        const existingHot = newBuffs[result.targetId].hot || 0;
        if (hotBonuses.maxStacks > 1 && existingHot > 0) {
          newBuffs[result.targetId].hot = Math.min(existingHot + buff.percentage, buff.percentage * hotBonuses.maxStacks);
        } else {
          newBuffs[result.targetId].hot = buff.percentage;
        }
        newBuffs[result.targetId].hotDuration = buff.duration || 1;
      }
    }
  }

  // Set cooldown for used skill (apply homestead reduction)
  const baseCooldown = getEffectiveCooldown(skill, actor.skills);
  const cooldownReduction = homesteadBonuses.cooldownReduction || 0;
  const effectiveCooldown = Math.max(1, baseCooldown - cooldownReduction);
  if (!newSkillCooldowns[actor.id]) newSkillCooldowns[actor.id] = {};
  newSkillCooldowns[actor.id][skill.id] = effectiveCooldown;

  return true;
};

/**
 * Execute a monster ability action if one is available.
 * Mutates ctx. Returns true if an ability was used, false otherwise.
 */
export const executeMonsterAbilityAction = (ctx, actor, target) => {
  const {
    newHeroes, newMonsters, newBuffs, newStatusEffects,
    newMonsterCooldowns, newTurnOrder, newCombatMonsters,
    newUsedPhoenixRevives,
    aliveHeroes, activeCombatMonsters, heroes,
    findHeroIndex, findMonsterIndex,
    addCombatLog, addEffect, incrementStat,
    hasResurrectionScroll, consumeResurrectionScroll,
    roomCombat,
  } = ctx;

  if (actor.isHero || !actor.abilities || actor.abilities.length === 0) return false;

  const monsterCooldowns = roomCombat.monsterCooldowns || {};
  const cooldowns = monsterCooldowns[actor.id] || {};
  const allies = activeCombatMonsters.filter(m => m.id !== actor.id);
  const context = {
    round: roomCombat.round,
    hpPercent: actor.stats.hp / actor.stats.maxHp,
    bossFight: actor.isBoss || false,
    currentPhase: actor.currentPhase || 0,
  };

  const aiResult = chooseMonsterAbility(actor, aliveHeroes, allies, cooldowns, context);
  if (!aiResult || !aiResult.ability || aiResult.useBasicAttack) return false;

  const ability = aiResult.ability;
  const aiTarget = aiResult.target || target;

  // Execute the monster ability
  const { results } = executeMonsterAbility(actor, ability, aiTarget, aliveHeroes, allies, addEffect);

  // Log ability use
  addCombatLog({
    type: 'skill',
    actor: { name: actor.name, emoji: actor.emoji },
    target: aiTarget ? { name: aiTarget.name, emoji: aiTarget.emoji } : null,
    skill: { name: ability.name, emoji: ability.emoji },
  });

  // Set ability cooldown
  if (!newMonsterCooldowns[actor.id]) newMonsterCooldowns[actor.id] = {};
  newMonsterCooldowns[actor.id][ability.id] = ability.cooldown || 3;

  // Apply results
  for (const actionResult of results) {
    switch (actionResult.type) {
      case 'damage': {
        if (actionResult.isHero) {
          const heroIdx = findHeroIndex(actionResult.targetId);
          if (heroIdx !== -1) {
            const targetHero = newHeroes[heroIdx];

            // Check for dodge (monster abilities can be dodged too)
            const targetBuffs = newBuffs[targetHero.id] || {};
            if (targetBuffs.evasion > 0) {
              addCombatLog({ type: 'system', message: `${targetHero.name} evades in smoke!` });
              continue;
            }

            // Calculate dodge chance for ability damage
            let abilityDodgeChance = calculateDodgeChance(targetHero.stats.speed, actor.stats.speed);
            const targetDefenderBonuses = applyPassiveEffects(targetHero, 'on_defend', {});
            abilityDodgeChance += targetDefenderBonuses.dodgeChance || 0;
            if (targetHero.bonusDodge) {
              abilityDodgeChance += targetHero.bonusDodge;
            }

            if (Math.random() < abilityDodgeChance) {
              incrementStat('totalDodges', 1, { heroId: targetHero.id });
              addCombatLog({ type: 'system', message: `${targetHero.name} dodged ${ability.name}!` });
              continue;
            }

            const wasAlive = targetHero.stats.hp > 0;
            targetHero.stats.hp = Math.max(0, targetHero.stats.hp - actionResult.damage);
            ctx.damageTakenByHero[actionResult.targetId] = (ctx.damageTakenByHero[actionResult.targetId] || 0) + actionResult.damage;

            if (wasAlive && targetHero.stats.hp <= 0) {
              const resScroll = hasResurrectionScroll();
              if (resScroll) {
                const scroll = consumeResurrectionScroll();
                const reviveHp = Math.floor(targetHero.stats.maxHp * scroll.reviveHpPercent);
                targetHero.stats.hp = reviveHp;
                addCombatLog({ type: 'system', message: `Resurrection Scroll! ${targetHero.name} is restored with ${reviveHp} HP!` });
                addEffect({ type: 'healBurst', position: targetHero.position });
              } else {
                const targetHeroData = heroes.find(h => h.id === actionResult.targetId);
                const phoenixRevive = targetHeroData ? checkPhoenixRevive(targetHeroData, newUsedPhoenixRevives) : null;

                if (phoenixRevive) {
                  const reviveHp = Math.floor(targetHero.stats.maxHp * phoenixRevive.hpPercent);
                  targetHero.stats.hp = reviveHp;
                  newUsedPhoenixRevives[actionResult.targetId] = true;
                  addCombatLog({ type: 'system', message: `Phoenix Feather! ${targetHero.name} rises from the ashes with ${reviveHp} HP!` });
                  addEffect({ type: 'healBurst', position: targetHero.position });
                } else {
                  addCombatLog({ type: 'death', target: { name: targetHero.name }, isHero: true });
                  addEffect({ type: 'death', position: targetHero.position, isHero: true, classId: targetHero.classId });
                  handleUnitDeath(ctx, targetHero.id);
                }
              }
            }
          }
        }
        break;
      }

      case 'apply_status': {
        const statusTarget = actionResult.isHero
          ? newHeroes.find(h => h.id === actionResult.targetId)
          : newMonsters.find(m => m.id === actionResult.targetId);

        if (statusTarget && actionResult.status) {
          // Dragonscale Mantle: check status immunity for heroes
          if (actionResult.isHero) {
            const immuneHeroData = heroes.find(h => h.id === actionResult.targetId);
            if (immuneHeroData && isHeroImmuneToStatus(immuneHeroData, actionResult.status.id)) {
              addCombatLog({ type: 'system', message: `${statusTarget.name} is immune! (Dragon's Resilience)` });
              addEffect({ type: 'status', position: statusTarget.position || target.position, status: 'buff' });
              break;
            }
            if (hasCCImmunity(statusTarget, actionResult.status.id)) {
              addCombatLog({ type: 'system', message: `${statusTarget.name} is immune to ${actionResult.status.id}!` });
              break;
            }
          }

          const mockTarget = {
            ...statusTarget,
            statusEffects: newStatusEffects[actionResult.targetId] || [],
          };

          // Apply debuff duration reduction for heroes
          let effectiveDuration = actionResult.status.duration;
          if (actionResult.isHero) {
            const heroData = heroes.find(h => h.id === actionResult.targetId);
            if (heroData) {
              const passiveAffixBonuses = getPassiveAffixBonuses(heroData);
              const durationReduction = passiveAffixBonuses.debuffDurationReduction || 0;
              effectiveDuration = Math.max(1, Math.ceil(effectiveDuration * (1 - durationReduction)));
            }
          }

          const statusResult = applyStatusEffect(
            mockTarget, actionResult.status.id, actor,
            { duration: effectiveDuration, stacks: actionResult.status.stacks }
          );

          newStatusEffects[actionResult.targetId] = statusResult.effects;

          const statusDef = STATUS_EFFECTS[actionResult.status.id];
          if (statusDef && statusResult.applied) {
            addCombatLog({ type: 'system', message: `${statusTarget.name} is ${statusDef.name.toLowerCase()}!` });
          }
        }
        break;
      }

      case 'heal': {
        const monsterIdx = findMonsterIndex(actionResult.targetId);
        if (monsterIdx !== -1) {
          const healTarget = newMonsters[monsterIdx];
          const actualHeal = Math.min(actionResult.amount, healTarget.stats.maxHp - healTarget.stats.hp);
          healTarget.stats.hp = Math.min(healTarget.stats.maxHp, healTarget.stats.hp + actionResult.amount);
          addCombatLog({
            type: 'heal',
            actor: { name: actor.name, emoji: actor.emoji },
            target: { name: healTarget.name, emoji: healTarget.emoji },
            skill: { name: ability.name },
            amount: actualHeal,
          });
          if (actualHeal > 0) {
            addEffect({ type: 'damage', position: healTarget.position, damage: actualHeal, isHeal: true });
            addEffect({ type: 'healBurst', position: healTarget.position });
          }
        }
        break;
      }

      case 'summon': {
        let summonType = actionResult.summonType || actor.summonType;
        const summonCount = actionResult.summonCount || 1;

        if (summonType) {
          if (summonType === 'tier_1_random') {
            const tier1Monsters = Object.keys(MONSTERS).filter(
              key => MONSTERS[key].tier === 1 && !MONSTERS[key].isBoss
            );
            summonType = tier1Monsters[Math.floor(Math.random() * tier1Monsters.length)];
          }

          const summonTemplate = MONSTERS[summonType];

          if (summonTemplate) {
            for (let i = 0; i < summonCount; i++) {
              const summonId = `${summonType}_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 5)}`;
              const spawnPos = {
                x: actor.position.x + (i % 2 === 0 ? -1 : 1),
                y: actor.position.y + (i < 2 ? -1 : 1),
              };

              const summonedMonster = {
                ...summonTemplate,
                id: summonId,
                position: spawnPos,
                stats: {
                  ...summonTemplate.baseStats,
                  hp: summonTemplate.baseStats.maxHp,
                },
              };

              newMonsters.push(summonedMonster);
              newTurnOrder.push(summonId);
              newCombatMonsters.push(summonId);

              addCombatLog({ type: 'system', message: `${actor.name} summons ${summonedMonster.name}!` });
              addEffect({ type: 'summon', position: spawnPos, monsterId: summonType });
            }
          }
        }
        break;
      }
    }
  }

  return true;
};
