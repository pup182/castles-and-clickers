/**
 * Combat status effect processing - per-turn buff/debuff/DOT/HOT logic.
 * Extracted from useCombat.js to reduce file size.
 */

import { processStatusEffectsOnTurnStart } from './statusEngine';
import { processOnTurnStartAffixes, checkPhoenixRevive } from './affixEngine';
import { getPerTurnEffects, getHotBonuses, getDotLifestealPercent, hasArmorVsDot } from './skillEngine';
import { getHeroHealingReduction, tickUniqueEffects } from './uniqueEngine';
import { rollRaidDrop, getWingBoss } from '../data/raids';
import { generateEquipment } from '../data/equipment';
import { buildHeroHpMap, getNextTurnState, handleUnitDeath } from './combatHelpers';

/**
 * Apply party-wide per-turn effects at the start of each round (first actor's turn).
 * Mutates ctx (hero HP, healing tracking).
 */
export const processPartyPerTurnEffects = (ctx) => {
  const { newHeroes, aliveHeroes, heroes, addEffect, addCombatLog } = ctx;

  const perTurnEffects = getPerTurnEffects(aliveHeroes);

  // Party regen: heal all heroes by a percentage of max HP
  if (perTurnEffects.partyRegenPercent > 0) {
    for (let i = 0; i < newHeroes.length; i++) {
      const hero = newHeroes[i];
      if (hero.stats.hp > 0 && hero.stats.hp < hero.stats.maxHp) {
        let healAmount = Math.floor(hero.stats.maxHp * perTurnEffects.partyRegenPercent);
        const regenHealReduction = getHeroHealingReduction(heroes.find(hr => hr.id === hero.id) || {});
        if (regenHealReduction > 0) healAmount = Math.floor(healAmount * (1 - regenHealReduction));
        const actualHeal = Math.min(healAmount, hero.stats.maxHp - hero.stats.hp);
        if (actualHeal > 0) {
          newHeroes[i].stats.hp += actualHeal;
          addEffect({ type: 'damage', position: hero.position, damage: actualHeal, isHeal: true });
          ctx.healingReceivedByHero[hero.id] = (ctx.healingReceivedByHero[hero.id] || 0) + actualHeal;
        }
      }
    }
    addCombatLog({ type: 'system', message: `Party regenerates ${Math.round(perTurnEffects.partyRegenPercent * 100)}% HP` });
  }
};

/**
 * Process ON_TURN_START affixes (regeneration) for heroes, or monster regen passive.
 * Mutates ctx (regen tracking for deferred application).
 */
export const processHeroTurnStartAffixes = (ctx, actor) => {
  const { heroes, newMonsters, findMonsterIndex, addCombatLog, addEffect } = ctx;

  if (actor.isHero) {
    const heroData = heroes.find(h => h.id === actor.id);
    if (heroData) {
      const heroWithEquipment = { ...heroData, stats: actor.stats };
      const turnStartResult = processOnTurnStartAffixes(heroWithEquipment);

      if (turnStartResult.healAmount > 0 && actor.stats.hp < actor.stats.maxHp) {
        let affixRegenAmount = turnStartResult.healAmount;
        const affixRegenReduction = getHeroHealingReduction(heroData);
        if (affixRegenReduction > 0) affixRegenAmount = Math.floor(affixRegenAmount * (1 - affixRegenReduction));
        ctx.regenHealAmount = Math.min(affixRegenAmount, actor.stats.maxHp - actor.stats.hp);
        ctx.regenHeroId = actor.id;
        ctx.regenHeroPosition = actor.position;
        ctx.regenHeroName = actor.name;
        // Don't update state here - will be applied at end of turn to avoid loop
      }
    }
  } else {
    // Process monster regen passive at turn start
    if (actor.passive?.regenPercent && actor.stats.hp < actor.stats.maxHp) {
      const regenAmount = Math.floor(actor.stats.maxHp * actor.passive.regenPercent);
      const monsterIdx = findMonsterIndex(actor.id);
      if (monsterIdx !== -1) {
        const actualHeal = Math.min(regenAmount, newMonsters[monsterIdx].stats.maxHp - newMonsters[monsterIdx].stats.hp);
        if (actualHeal > 0) {
          newMonsters[monsterIdx].stats.hp += actualHeal;
          addCombatLog({ type: 'system', message: `${actor.name} regenerates ${actualHeal} HP` });
          addEffect({ type: 'damage', position: actor.position, damage: actualHeal, isHeal: true });
        }
      }
    }
  }
};

/**
 * Decrement buffs at start of each unit's turn.
 * Processes HOT ticks, duration-based buffs, vengeance, extraTurn, unique effects.
 * Mutates ctx (buffs, hero HP, healing tracking).
 */
export const processBuffDurations = (ctx, actor) => {
  const { newBuffs, newHeroes, heroes, findHeroIndex, addCombatLog, addEffect } = ctx;

  if (newBuffs[actor.id]) {
    // OPTIMIZATION: Mutate in place
    if (!newBuffs[actor.id]) newBuffs[actor.id] = {};
    const actorBuffs = newBuffs[actor.id];

    // Handle duration-based buffs properly
    const durationBuffs = [
      { value: 'damageReduction', duration: 'damageReductionDuration', name: 'damage reduction' },
      { value: 'speedBonus', duration: 'speedBonusDuration', name: 'speed bonus' },
      { value: 'evasion', duration: 'evasion', name: 'evasion' },
      { value: 'taunt', duration: 'taunt', name: 'taunt' },
      { value: 'affixSpeedBonus', duration: 'affixSpeedDuration', name: 'speed bonus' },
      { value: 'affixAttackBonus', duration: 'affixAttackDuration', name: 'attack bonus' },
      { value: 'hot', duration: 'hotDuration', name: 'regeneration' },
      { value: 'damageBonus', duration: 'damageBonusDuration', name: 'damage bonus' },
      { value: 'attackBonus', duration: 'attackBonusDuration', name: 'attack bonus' },
      { value: 'healingBonus', duration: 'healingBonusDuration', name: 'healing bonus' },
      { value: 'aoeAttacks', duration: 'aoeAttacksDuration', name: 'ascendance' },
      { value: 'damageAmp', duration: 'damageAmpDuration', name: 'vulnerability' },
      { value: 'weakness', duration: 'weaknessDuration', name: 'weakness' },
      { value: 'dotImmune', duration: 'dotImmuneDuration', name: 'DoT immunity' },
      { value: 'healingReduction', duration: 'healingReductionDuration', name: 'healing reduction' },
    ];

    // Apply HOT buff healing tick before decrementing duration
    if (actor.isHero && actorBuffs.hot && actorBuffs.hotDuration > 0) {
      const heroIdx = findHeroIndex(actor.id);
      if (heroIdx !== -1 && newHeroes[heroIdx].stats.hp > 0) {
        let hotHealAmount = Math.floor(newHeroes[heroIdx].stats.maxHp * actorBuffs.hot);
        // Check for hot_bloom (Druid Lifebloom - final tick bonus)
        if (actorBuffs.hotDuration === 1) {
          const hotBonuses = getHotBonuses(actor);
          hotHealAmount = Math.floor(hotHealAmount * hotBonuses.hotMultiplier);
        }
        const hotHeroData = heroes.find(h => h.id === actor.id);
        if (hotHeroData) {
          const hotHealReduction = getHeroHealingReduction(hotHeroData);
          const hotBuffReduction = (newBuffs[actor.id] || {}).healingReduction || 0;
          const hotTotalReduction = Math.min(1, hotHealReduction + hotBuffReduction);
          if (hotTotalReduction > 0) hotHealAmount = Math.floor(hotHealAmount * (1 - hotTotalReduction));
        }
        const actualHeal = Math.min(hotHealAmount, newHeroes[heroIdx].stats.maxHp - newHeroes[heroIdx].stats.hp);
        if (actualHeal > 0) {
          newHeroes[heroIdx].stats.hp += actualHeal;
          addEffect({ type: 'damage', position: actor.position, damage: actualHeal, isHeal: true });
          ctx.healingReceivedByHero[actor.id] = (ctx.healingReceivedByHero[actor.id] || 0) + actualHeal;
        }
      }
    }

    for (const buff of durationBuffs) {
      if (actorBuffs[buff.duration] !== undefined && actorBuffs[buff.duration] > 0) {
        actorBuffs[buff.duration]--;
        if (actorBuffs[buff.duration] <= 0) {
          delete actorBuffs[buff.duration];
          delete actorBuffs[buff.value];
          addCombatLog({ type: 'system', message: `${actor.name}'s ${buff.name} fades` });
        }
      }
    }

    // Handle vengeance duration
    if (actorBuffs.vengeanceDuration !== undefined && actorBuffs.vengeanceDuration > 0) {
      actorBuffs.vengeanceDuration--;
      if (actorBuffs.vengeanceDuration <= 0) {
        delete actorBuffs.vengeanceDuration;
        delete actorBuffs.vengeanceDamageBonus;
        addCombatLog({ type: 'system', message: `${actor.name}'s vengeance fades` });
      }
    }

    // Handle extra turn (Time Warp) - grant an extra action
    if (actorBuffs.extraTurn) {
      delete actorBuffs.extraTurn;
      // Don't advance turn - actor gets another action
    }
  }

  // Tick unique item effects at start of turn (Cloak of Nothing invisibility countdown)
  if (actor.isHero) {
    tickUniqueEffects(actor);
  }
};

/**
 * Handle undead minion expiration.
 * Mutates ctx (hero HP, death handling).
 */
export const processUndeadExpiration = (ctx, actor) => {
  const { newHeroes, findHeroIndex, addCombatLog, addEffect } = ctx;

  if (actor.isUndead && actor.turnsRemaining !== undefined) {
    const heroIdx = findHeroIndex(actor.id);
    if (heroIdx !== -1) {
      newHeroes[heroIdx].turnsRemaining--;
      if (newHeroes[heroIdx].turnsRemaining <= 0) {
        newHeroes[heroIdx].stats.hp = 0;
        addCombatLog({ type: 'system', message: `${actor.name} crumbles to dust!` });
        addEffect({ type: 'death', position: actor.position, isHero: false });
        handleUnitDeath(ctx, actor.id);
      }
    }
  }
};

/**
 * Process status effects at start of turn (DOT damage, HOT healing, stun/skip).
 * Handles death-from-DOT with resurrection scroll, phoenix revive, etc.
 * Mutates ctx. Returns true if the orchestrator should early-return, false otherwise.
 */
export const processStatusEffectDamage = (ctx, actor) => {
  const {
    newHeroes, newMonsters, newBuffs, newStatusEffects,
    newUsedPhoenixRevives, aliveHeroes, heroes,
    findHeroIndex, findMonsterIndex,
    addCombatLog, addEffect,
    hasResurrectionScroll, consumeResurrectionScroll,
    updateRoomCombat, syncHeroHp,
    roomCombat, dungeon, dungeonProgress,
    processLootDrop, handleUniqueDrop, defeatWingBoss, completeRaid, getOwnedUniques,
  } = ctx;

  const actorEffects = newStatusEffects[actor.id] || [];
  if (actorEffects.length === 0) return false;

  // Create unit object with status effects for processing
  const actorWithEffects = { ...actor, statusEffects: actorEffects };
  const statusResult = processStatusEffectsOnTurnStart(actorWithEffects, { movedLastTurn: actor.movedLastTurn });

  // Apply DOT damage
  if (statusResult.damage > 0) {
    let dotDamage = statusResult.damage;

    // Check for Lich Form dotImmune buff
    const actorBuffs = newBuffs[actor.id] || {};
    if (actorBuffs.dotImmune) {
      addCombatLog({ type: 'system', message: `${actor.name} is immune to DoT damage (Lich Form)!` });
      dotDamage = 0;
    }

    if (dotDamage > 0) {
      if (actor.isHero) {
        // Check for armor vs DoT (Knight Armor Master)
        if (hasArmorVsDot(actor)) {
          const reduction = Math.floor(actor.stats.defense * 0.5);
          dotDamage = Math.max(1, dotDamage - reduction);
        }

        // OPTIMIZATION: Mutate in place
        const heroIdx = findHeroIndex(actor.id);
        if (heroIdx !== -1) {
          newHeroes[heroIdx].stats.hp = Math.max(0, newHeroes[heroIdx].stats.hp - dotDamage);
          // Track DOT damage taken
          ctx.damageTakenByHero[actor.id] = (ctx.damageTakenByHero[actor.id] || 0) + dotDamage;
        }

        // Check for death from DOT (use updated HP from newHeroes, not stale heroHp)
        const updatedHeroHp = heroIdx !== -1 ? newHeroes[heroIdx].stats.hp : 0;
        if (updatedHeroHp <= 0) {
          // Check for resurrection scroll first (consumes the scroll)
          const resScroll = hasResurrectionScroll();
          if (resScroll) {
            const scroll = consumeResurrectionScroll();
            const reviveHp = Math.floor(actor.stats.maxHp * scroll.reviveHpPercent);
            if (heroIdx !== -1) {
              newHeroes[heroIdx].stats.hp = reviveHp;
            }
            addCombatLog({ type: 'system', message: `Resurrection Scroll! ${actor.name} is restored with ${reviveHp} HP!` });
            addEffect({ type: 'healBurst', position: actor.position });
            const nextTurn = getNextTurnState(roomCombat, newHeroes, newMonsters);
            updateRoomCombat({
              heroes: newHeroes, monsters: newMonsters, buffs: newBuffs, statusEffects: newStatusEffects,
              usedPhoenixRevives: newUsedPhoenixRevives, ...(nextTurn || {})
            });
            syncHeroHp(buildHeroHpMap(newHeroes));
            return true;
          }

          // Check for phoenix revive
          const actorHeroData = heroes.find(h => h.id === actor.id);
          const phoenixRevive = actorHeroData ? checkPhoenixRevive(actorHeroData, newUsedPhoenixRevives) : null;

          if (phoenixRevive) {
            const reviveHp = Math.floor(actor.stats.maxHp * phoenixRevive.hpPercent);
            if (heroIdx !== -1) {
              newHeroes[heroIdx].stats.hp = reviveHp;
            }
            newUsedPhoenixRevives[actor.id] = true;
            addCombatLog({ type: 'system', message: `Phoenix Feather! ${actor.name} rises from the ashes with ${reviveHp} HP!` });
            addEffect({ type: 'healBurst', position: actor.position });
            const nextTurn = getNextTurnState(roomCombat, newHeroes, newMonsters);
            updateRoomCombat({
              heroes: newHeroes, monsters: newMonsters, buffs: newBuffs, statusEffects: newStatusEffects,
              usedPhoenixRevives: newUsedPhoenixRevives, ...(nextTurn || {})
            });
            syncHeroHp(buildHeroHpMap(newHeroes));
            return true;
          } else {
            addCombatLog({ type: 'death', target: { name: actor.name }, isHero: true });
            addEffect({ type: 'death', position: actor.position, isHero: true, classId: actor.classId });
            handleUnitDeath(ctx, actor.id);
            const nextTurn = getNextTurnState(roomCombat, newHeroes, newMonsters);
            updateRoomCombat({
              heroes: newHeroes, monsters: newMonsters, buffs: newBuffs, statusEffects: newStatusEffects,
              usedPhoenixRevives: newUsedPhoenixRevives, ...(nextTurn || {})
            });
            syncHeroHp(buildHeroHpMap(newHeroes));
            return true;
          }
        }
      } else {
        // OPTIMIZATION: Mutate in place
        const monsterIdx = findMonsterIndex(actor.id);
        if (monsterIdx !== -1) {
          newMonsters[monsterIdx].stats.hp = Math.max(0, newMonsters[monsterIdx].stats.hp - dotDamage);
        }

        // Check for DOT lifesteal (Necromancer Necrosis) - heal heroes who have this passive
        for (const hero of aliveHeroes) {
          const dotLifesteal = getDotLifestealPercent(hero);
          if (dotLifesteal > 0) {
            const healAmount = Math.floor(dotDamage * dotLifesteal);
            const hIdx = findHeroIndex(hero.id);
            if (hIdx !== -1 && healAmount > 0) {
              const actualHeal = Math.min(healAmount, newHeroes[hIdx].stats.maxHp - newHeroes[hIdx].stats.hp);
              if (actualHeal > 0) {
                newHeroes[hIdx].stats.hp += actualHeal;
                addEffect({ type: 'damage', position: hero.position, damage: actualHeal, isHeal: true });
                ctx.healingReceivedByHero[hero.id] = (ctx.healingReceivedByHero[hero.id] || 0) + actualHeal;
              }
            }
          }
        }

        // Check for death from DOT
        if (actor.stats.hp - dotDamage <= 0) {
          addCombatLog({ type: 'death', target: { name: actor.name }, isHero: false });
          addEffect({ type: 'death', position: actor.position, isHero: false, monsterId: actor.templateId });
          handleUnitDeath(ctx, actor.id, actor);

          // Track raid boss defeat from DOT damage
          if (actor.wingBossId) {
            defeatWingBoss(actor.wingBossId);
            addCombatLog({ type: 'system', message: `Wing Boss defeated: ${actor.name}!` });
          }
          if (actor.finalBossId) {
            defeatWingBoss(actor.finalBossId);
            addCombatLog({ type: 'system', message: `FINAL BOSS DEFEATED: ${actor.name}! Raid Complete!` });
            setTimeout(() => completeRaid(), 2000);
          }

          // Handle raid boss drops from DOT death
          const isRaidDungeonDot = dungeonProgress?.currentType === 'raid';
          if (isRaidDungeonDot && actor.isBoss) {
            const targetBossIdDot = actor.wingBossId || actor.finalBossId;
            const raidBossDot = getWingBoss(dungeonProgress.currentRaidId, targetBossIdDot);
            const ownedUniquesDot = getOwnedUniques();
            const raidDropDot = rollRaidDrop(raidBossDot?.dropTable, ownedUniquesDot);

            if (raidDropDot?.type === 'unique') {
              handleUniqueDrop(raidDropDot.itemId, actor.position);
            } else if (raidDropDot) {
              const item = generateEquipment(dungeon.level, { guaranteedRarity: raidDropDot.rarity || 'epic' });
              const lootResult = processLootDrop(item);
              addEffect({ type: 'lootDrop', position: actor.position, slot: item.slot, rarityColor: item.rarityColor || '#9ca3af' });
              if (lootResult.action === 'sold') {
                addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${lootResult.gold}g)` });
              } else if (lootResult.action === 'looted') {
                addCombatLog({ type: 'system', message: `Loot: ${item.name}` });
              }
            }
          }

          // OPTIMIZATION: Single batched update including turn advance
          const nextTurn = getNextTurnState(roomCombat, newHeroes, newMonsters);
          updateRoomCombat({
            heroes: newHeroes, monsters: newMonsters, buffs: newBuffs, statusEffects: newStatusEffects, ...(nextTurn || {})
          });
          syncHeroHp(buildHeroHpMap(newHeroes));
          return true;
        }
      }

      // Log DOT damage - OPTIMIZATION: Avoid creating intermediate filtered array
      for (let i = 0; i < statusResult.logs.length; i++) {
        const log = statusResult.logs[i];
        if (log.type === 'status_damage') {
          addCombatLog({
            type: 'system',
            message: `${actor.name} takes ${log.damage} ${log.status.name} damage`,
          });
          addEffect({ type: 'damage', position: actor.position, damage: log.damage });
        }
      }
    }
  }

  // Apply HOT healing
  if (statusResult.healing > 0 && actor.isHero) {
    const heroIdx = findHeroIndex(actor.id);
    if (heroIdx !== -1) {
      let hotHealAmount = statusResult.healing;
      const hotHeroData = heroes.find(h => h.id === actor.id);
      if (hotHeroData) {
        const hotHealReduction = getHeroHealingReduction(hotHeroData);
        const hotBuffReduction = (newBuffs[actor.id] || {}).healingReduction || 0;
        const hotTotalReduction = Math.min(1, hotHealReduction + hotBuffReduction);
        if (hotTotalReduction > 0) hotHealAmount = Math.floor(hotHealAmount * (1 - hotTotalReduction));
      }
      const actualHeal = Math.min(hotHealAmount, newHeroes[heroIdx].stats.maxHp - newHeroes[heroIdx].stats.hp);
      newHeroes[heroIdx].stats.hp = Math.min(newHeroes[heroIdx].stats.maxHp, newHeroes[heroIdx].stats.hp + hotHealAmount);
      if (actualHeal > 0) {
        ctx.healingReceivedByHero[actor.id] = (ctx.healingReceivedByHero[actor.id] || 0) + actualHeal;
      }
    }
    addEffect({ type: 'healBurst', position: actor.position });
  }

  // Update status effects (decremented durations, removed expired)
  newStatusEffects[actor.id] = statusResult.updatedEffects;

  // Check if actor should skip turn (stun, freeze)
  if (statusResult.skipTurn) {
    addCombatLog({
      type: 'system',
      message: `${actor.name} is unable to act!`,
    });
    // OPTIMIZATION: Batch turn advance with status effect update
    const nextTurn = getNextTurnState(roomCombat, newHeroes, newMonsters);
    updateRoomCombat({
      statusEffects: newStatusEffects,
      ...(nextTurn || {})
    });
    return true;
  }

  return false;
};
