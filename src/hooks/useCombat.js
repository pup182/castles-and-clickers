import { useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { hasLineOfSight } from '../game/mazeGenerator';
import {
  getSummonData, createPetUnit, createShadowClone,
  getPerTurnEffects,
} from '../game/skillEngine';
import { createUniqueItemInstance, getUniqueItem } from '../data/uniqueItems';
import {
  getUniqueStateSnapshot, getPartyUniqueBonuses,
  getHeroUniqueItems, getHeroHealingReduction,
} from '../game/uniqueEngine';
import { PHASES } from '../game/constants';

// Extracted combat modules
import {
  buildHeroHpMap, getCurrentActor, getNextTurnState,
  calculateCombatViewport, findTarget,
} from '../game/combatHelpers';
import { resolveMovement } from '../game/combatMovement';
import {
  processPartyPerTurnEffects, processHeroTurnStartAffixes,
  processBuffDurations, processUndeadExpiration, processStatusEffectDamage,
} from '../game/combatStatusEffects';
import {
  executeHeroSkillAction, executeMonsterAbilityAction,
} from '../game/combatSkillExecution';
import {
  calculateBasicAttackDamage, addAttackVisualEffects,
  resolveHeroTargetDamage, resolveMonsterTargetDamage,
  processDoubleAttack, processAscendanceAOE,
} from '../game/combatDamageResolution';

/**
 * Hook for combat phase logic
 * OPTIMIZATION: Uses imperative state access to avoid subscribing to store changes
 */
export const useCombat = ({ addEffect }) => {
  // OPTIMIZATION: Get state/actions imperatively to avoid re-renders on every state change
  const addGold = useCallback((amount) => useGameStore.getState().addGold(amount), []);
  const addXpToHero = useCallback((heroId, xp) => useGameStore.getState().addXpToHero(heroId, xp), []);
  const processLootDrop = useCallback((item) => useGameStore.getState().processLootDrop(item), []);

  // Helper for processing unique item drops - consolidates duplicate logic
  const handleUniqueDrop = useCallback((uniqueItemId, position) => {
    const uniqueTemplate = getUniqueItem(uniqueItemId);
    if (!uniqueTemplate) return null;

    const uniqueInstance = createUniqueItemInstance(uniqueItemId);
    if (!uniqueInstance) return null;

    const result = useGameStore.getState().processUniqueDrop(uniqueInstance);

    if (result.action === 'duplicate') {
      useGameStore.getState().addCombatLog({
        type: 'system',
        message: `UNIQUE DROP: ${uniqueTemplate.name} (duplicate - converted to ${result.gold}g)`
      });
    } else {
      addEffect({ type: 'legendaryDrop', position, itemName: uniqueTemplate.name });
      useGameStore.getState().addCombatLog({
        type: 'system',
        message: `UNIQUE DROP: ${uniqueTemplate.name}!`
      });
    }

    return result;
  }, [addEffect]);

  const incrementStat = useCallback((stat, amount = 1, options = {}) => useGameStore.getState().incrementStat(stat, amount, options), []);
  const addCombatLog = useCallback((log) => useGameStore.getState().addCombatLog(log), []);
  const updateRoomCombat = useCallback((updates) => useGameStore.getState().updateRoomCombat(updates), []);
  const syncHeroHp = useCallback((hpMap) => useGameStore.getState().syncHeroHp(hpMap), []);
  const hasResurrectionScroll = useCallback(() => useGameStore.getState().hasResurrectionScroll(), []);
  const consumeResurrectionScroll = useCallback(() => useGameStore.getState().useResurrectionScroll(), []);
  const addConsumable = useCallback((consumable) => useGameStore.getState().addConsumable(consumable), []);

  const lastProcessedTurnRef = useRef(null);

  // OPTIMIZATION: Reusable data structures to reduce GC pressure
  const heroIndexMapRef = useRef(new Map());
  const monsterIndexMapRef = useRef(new Map());
  const combatMonsterIdSetRef = useRef(new Set());

  // Legacy advanceTurn (still used for early returns)
  const advanceTurn = useCallback(() => {
    const roomCombat = useGameStore.getState().roomCombat;
    const nextState = getNextTurnState(roomCombat);
    if (nextState) {
      updateRoomCombat(nextState);
    }
  }, [updateRoomCombat]);

  // Reset the last processed turn ref
  const resetLastProcessedTurn = useCallback(() => {
    lastProcessedTurnRef.current = null;
  }, []);

  // Handle combat phase tick
  const handleCombatTick = useCallback(() => {
    // === 1. Get state, early return if not combat phase ===
    const state = useGameStore.getState();
    const { roomCombat, heroes, heroHp, dungeon, dungeonProgress } = state;
    const homesteadBonuses = state.getHomesteadBonuses();

    if (!roomCombat || roomCombat.phase !== PHASES.COMBAT) return false;
    if (!dungeon) return false;

    const { heroes: combatHeroes, monsters, combatMonsters, dungeon: mazeDungeon } = roomCombat;

    // === 2. Clone arrays, build index maps ===
    const heroCount = combatHeroes.length;
    const monsterCount = monsters.length;
    const newHeroes = new Array(heroCount);
    const newMonsters = new Array(monsterCount);

    const storedHeroHp = useGameStore.getState().heroHp;

    for (let i = 0; i < heroCount; i++) {
      const h = combatHeroes[i];
      const storeHero = heroes.find(sh => sh.id === h.id);
      const syncedSkills = storeHero?.skills || h.skills || [];
      const currentHp = storedHeroHp[h.id] !== undefined ? storedHeroHp[h.id] : h.stats.hp;
      newHeroes[i] = { ...h, stats: { ...h.stats, hp: currentHp }, skills: syncedSkills };
    }
    for (let i = 0; i < monsterCount; i++) {
      const m = monsters[i];
      newMonsters[i] = { ...m, stats: { ...m.stats } };
    }

    // OPTIMIZATION: Reuse Maps/Sets to reduce GC pressure
    const heroIndexMap = heroIndexMapRef.current;
    const monsterIndexMap = monsterIndexMapRef.current;
    heroIndexMap.clear();
    monsterIndexMap.clear();
    for (let i = 0; i < newHeroes.length; i++) heroIndexMap.set(newHeroes[i].id, i);
    for (let i = 0; i < newMonsters.length; i++) monsterIndexMap.set(newMonsters[i].id, i);

    let aliveHeroes = newHeroes.filter(h => h.stats.hp > 0);

    // Check for dead heroes that can be revived with resurrection scroll
    const deadHeroes = newHeroes.filter(h => h.stats.hp <= 0);
    if (deadHeroes.length > 0 && aliveHeroes.length > 0) {
      const resScroll = hasResurrectionScroll();
      if (resScroll) {
        const heroToRevive = deadHeroes[0];
        const heroIdx = heroIndexMap.get(heroToRevive.id) ?? -1;
        if (heroIdx !== -1) {
          const scroll = consumeResurrectionScroll();
          const reviveHp = Math.floor(heroToRevive.stats.maxHp * scroll.reviveHpPercent);
          newHeroes[heroIdx].stats.hp = reviveHp;
          addCombatLog({ type: 'system', message: `Resurrection Scroll! ${heroToRevive.name} is restored with ${reviveHp} HP!` });
          addEffect({ type: 'healBurst', position: heroToRevive.position });
          syncHeroHp(buildHeroHpMap(newHeroes));
          aliveHeroes = newHeroes.filter(h => h.stats.hp > 0);
        }
      }
    }

    // Derived constants
    const goldMultiplier = 1 + (homesteadBonuses.goldFind || 0);
    const xpMultiplier = 1 + (homesteadBonuses.xpGain || 0);
    const damageBonus = 1;
    const defenseBonus = 1;
    const critBonus = 0;

    // Get monsters currently in combat
    const combatMonsterIds = combatMonsters || [];
    const combatMonsterIdSet = combatMonsterIdSetRef.current;
    combatMonsterIdSet.clear();
    for (let i = 0; i < combatMonsterIds.length; i++) combatMonsterIdSet.add(combatMonsterIds[i]);
    const activeCombatMonsters = newMonsters.filter(m => combatMonsterIdSet.has(m.id) && m.stats.hp > 0);

    const newKillBonusStacks = { ...(roomCombat.killBonusStacks || {}) };
    const newBuffs = { ...(roomCombat.buffs || {}) };
    const newStatusEffects = { ...(roomCombat.statusEffects || {}) };
    const newSkillCooldowns = { ...(roomCombat.skillCooldowns || {}) };
    const newMonsterCooldowns = { ...(roomCombat.monsterCooldowns || {}) };
    const newTurnOrder = [...roomCombat.turnOrder];
    const newCombatMonsters = [...combatMonsterIds];
    const newUsedPhoenixRevives = { ...(roomCombat.usedPhoenixRevives || {}) };
    const newReactiveHealUsed = { ...(roomCombat.reactiveHealUsed || {}) };
    let lastSummonRoomIndex = roomCombat.lastSummonRoomIndex ?? -1;

    // Crown of Command party-wide bonus
    const crownBonus = getPartyUniqueBonuses(heroes);
    const crownMultiplier = crownBonus.statMultiplier;

    // === Build ctx object ===
    const ctx = {
      // Mutable state
      newHeroes, newMonsters, newBuffs, newStatusEffects,
      newSkillCooldowns, newMonsterCooldowns, newKillBonusStacks,
      newTurnOrder, newCombatMonsters, newUsedPhoenixRevives, newReactiveHealUsed,
      aliveHeroes, activeCombatMonsters, combatMonsterIdSet,
      // Index maps and helpers
      heroIndexMap, monsterIndexMap,
      findHeroIndex: (id) => heroIndexMap.get(id) ?? -1,
      findMonsterIndex: (id) => monsterIndexMap.get(id) ?? -1,
      // Callbacks
      addEffect, addCombatLog, incrementStat,
      addGold, addXpToHero, processLootDrop, handleUniqueDrop, addConsumable,
      syncHeroHp, hasResurrectionScroll, consumeResurrectionScroll, updateRoomCombat,
      defeatWingBoss: (id) => useGameStore.getState().defeatWingBoss(id),
      completeRaid: () => useGameStore.getState().completeRaid(),
      pauseCombat: (ms) => useGameStore.getState().pauseCombat(ms),
      getOwnedUniques: () => useGameStore.getState().ownedUniques || [],
      // Read-only game state
      heroes, dungeon, dungeonProgress, roomCombat, heroHp, homesteadBonuses, mazeDungeon,
      // Derived constants
      goldMultiplier, xpMultiplier, crownMultiplier, damageBonus, defenseBonus, critBonus,
      // Per-tick tracking (mutable)
      totalDamageDealtThisTurn: 0,
      damageTakenByHero: {},
      healingDoneByHero: {},
      healingReceivedByHero: {},
      regenHealAmount: 0,
      regenHeroId: null,
      regenHeroPosition: null,
      regenHeroName: null,
    };

    // === 3. Pet/clone spawning ===
    let currentRoomIndex = -1;
    if (mazeDungeon && roomCombat.partyPosition) {
      const currentRoom = mazeDungeon.rooms.find(r =>
        roomCombat.partyPosition.x >= r.x && roomCombat.partyPosition.x < r.x + r.width &&
        roomCombat.partyPosition.y >= r.y && roomCombat.partyPosition.y < r.y + r.height
      );
      if (currentRoom) currentRoomIndex = currentRoom.index;
    }

    const isNewRoom = currentRoomIndex !== lastSummonRoomIndex;
    if (isNewRoom && roomCombat.round <= 1 && roomCombat.currentTurnIndex === 0) {
      // Respawn dead pets/clones
      for (let i = 0; i < newHeroes.length; i++) {
        const summon = newHeroes[i];
        if ((summon.isPet || summon.isClone) && summon.stats.hp <= 0) {
          const owner = newHeroes.find(h => h.id === summon.ownerId && h.stats.hp > 0);
          if (owner) {
            const respawnPosition = {
              x: owner.position.x + (Math.random() < 0.5 ? -1 : 1),
              y: owner.position.y + (Math.random() < 0.5 ? -1 : 1),
            };
            newHeroes[i].stats.hp = newHeroes[i].stats.maxHp;
            newHeroes[i].position = respawnPosition;
            newBuffs[summon.id] = {};
            newStatusEffects[summon.id] = [];
            if (!newTurnOrder.includes(summon.id)) {
              newTurnOrder.push(summon.id);
            }
            addCombatLog({ type: 'system', message: `${summon.name} returns to battle!` });
            addEffect({ type: 'healBurst', position: respawnPosition });
          }
        }
      }

      // Spawn NEW pets/clones
      for (const hero of newHeroes) {
        if (hero.stats.hp <= 0) continue;
        const summonData = getSummonData(hero);
        for (const summon of summonData) {
          const existingSummon = newHeroes.find(h =>
            h.ownerId === hero.id &&
            ((summon.type === 'pet' && h.isPet) || (summon.type === 'clone' && h.isClone))
          );
          if (existingSummon) continue;

          const summonPosition = {
            x: hero.position.x + (Math.random() < 0.5 ? -1 : 1),
            y: hero.position.y + (Math.random() < 0.5 ? -1 : 1),
          };

          if (summon.type === 'pet') {
            const pet = createPetUnit(hero, summon, summonPosition);
            newHeroes.push(pet);
            newTurnOrder.push(pet.id);
            addCombatLog({ type: 'system', message: `${hero.name}'s ${pet.name} joins the battle!` });
            addEffect({ type: 'healBurst', position: summonPosition });
          } else if (summon.type === 'clone') {
            const clone = createShadowClone(hero, summon, summonPosition);
            newHeroes.push(clone);
            newTurnOrder.push(clone.id);
            addCombatLog({ type: 'system', message: `${hero.name}'s Shadow Clone appears!` });
            addEffect({ type: 'buffAura', position: summonPosition, color: '#6b21a8' });
          }
        }
      }

      lastSummonRoomIndex = currentRoomIndex;
    }

    // === 4. Check defeat ===
    if (aliveHeroes.length === 0) {
      const clearedStatusEffects = {};
      const clearedBuffs = {};
      for (const hero of newHeroes) {
        clearedStatusEffects[hero.id] = [];
        clearedBuffs[hero.id] = {};
      }
      updateRoomCombat({ phase: PHASES.DEFEAT, tick: 0, statusEffects: clearedStatusEffects, buffs: clearedBuffs });
      addCombatLog({ type: 'system', message: 'Party Defeated!' });
      return true;
    }

    // === 5. Check victory ===
    if (activeCombatMonsters.length === 0) {
      if (mazeDungeon) {
        const currentRoom = mazeDungeon.rooms.find(r =>
          roomCombat.partyPosition.x >= r.x && roomCombat.partyPosition.x < r.x + r.width &&
          roomCombat.partyPosition.y >= r.y && roomCombat.partyPosition.y < r.y + r.height
        );
        if (currentRoom && !currentRoom.cleared) {
          const updatedRooms = mazeDungeon.rooms.map(r =>
            r.index === currentRoom.index ? { ...r, cleared: true } : r
          );
          updateRoomCombat({ dungeon: { ...mazeDungeon, rooms: updatedRooms } });
        }
      }
      const clearedStatusEffects = { ...newStatusEffects };
      const clearedBuffs = { ...newBuffs };
      for (const hero of newHeroes) {
        clearedStatusEffects[hero.id] = [];
        clearedBuffs[hero.id] = {};
      }
      updateRoomCombat({ phase: PHASES.CLEARING, tick: 0, statusEffects: clearedStatusEffects, buffs: clearedBuffs });
      addCombatLog({ type: 'system', message: 'Victory!' });
      return true;
    }

    // === 6. Get current actor ===
    const actor = getCurrentActor(roomCombat);
    if (!actor) {
      const nextTurn = getNextTurnState(roomCombat, newHeroes, newMonsters);
      if (nextTurn) {
        updateRoomCombat(nextTurn);
      }
      return true;
    }

    // === 7. Duplicate turn guard ===
    const turnKey = `combat-${roomCombat.round}-${roomCombat.currentTurnIndex}`;
    if (lastProcessedTurnRef.current === turnKey) {
      return true;
    }
    lastProcessedTurnRef.current = turnKey;

    // === 8. Cooldown decrement ===
    if (actor.isHero && newSkillCooldowns[actor.id]) {
      if (!newSkillCooldowns[actor.id]) newSkillCooldowns[actor.id] = {};
      for (const skillId in newSkillCooldowns[actor.id]) {
        if (newSkillCooldowns[actor.id][skillId] > 0) {
          newSkillCooldowns[actor.id][skillId]--;
        }
      }
    }

    // === 9. Party per-turn effects (round start) ===
    if (roomCombat.currentTurnIndex === 0) {
      processPartyPerTurnEffects(ctx);
    }

    // === 10. Hero turn start affixes / Monster regen ===
    processHeroTurnStartAffixes(ctx, actor);

    // === 11. Buff durations + unique ticks ===
    processBuffDurations(ctx, actor);

    // === 12. Undead expiration ===
    processUndeadExpiration(ctx, actor);

    // === 13. Status effect damage (DOT/stun) → may early return ===
    if (processStatusEffectDamage(ctx, actor)) {
      return true;
    }

    // === 14. Find target ===
    const { target, minDist } = findTarget(actor, aliveHeroes, activeCombatMonsters, newBuffs);
    const range = actor.attackRange || 1;

    // Check line of sight for ranged attacks
    const grid = mazeDungeon?.grid;
    const canSeeTarget = range <= 1 || !grid || hasLineOfSight(grid, actor.position, target.position);

    // === 15. In range: attack or use skill ===
    if (minDist <= range && canSeeTarget) {
      let usedSkill = false;

      // 15a. Try hero skill
      usedSkill = executeHeroSkillAction(ctx, actor);

      // 15b. Try monster ability (only if no hero skill)
      let usedMonsterAbility = false;
      if (!usedSkill) {
        usedMonsterAbility = executeMonsterAbilityAction(ctx, actor, target);

        // 15c. Basic attack (if no skill or ability)
        if (!usedMonsterAbility) {
          const attackResult = calculateBasicAttackDamage(ctx, actor, target);
          addAttackVisualEffects(ctx, actor, target, attackResult.dmg, attackResult.isCrit, minDist);

          if (target.isHero) {
            resolveHeroTargetDamage(ctx, actor, target, attackResult);
          } else {
            resolveMonsterTargetDamage(ctx, actor, target, attackResult);
            processDoubleAttack(ctx, actor, target, attackResult);
            processAscendanceAOE(ctx, actor, target, attackResult);
          }
        }
      }
    } else {
      // === 16. Move toward target ===
      if (resolveMovement(ctx, actor, target, range)) {
        return true; // No-grid early return
      }
    }

    // === 17. End-of-turn cleanup ===

    // Apply deferred regen heal
    if (ctx.regenHealAmount > 0 && ctx.regenHeroId) {
      const heroIdx = ctx.findHeroIndex(ctx.regenHeroId);
      if (heroIdx !== -1) {
        newHeroes[heroIdx].stats.hp = Math.min(newHeroes[heroIdx].stats.maxHp, newHeroes[heroIdx].stats.hp + ctx.regenHealAmount);
        ctx.healingReceivedByHero[ctx.regenHeroId] = (ctx.healingReceivedByHero[ctx.regenHeroId] || 0) + ctx.regenHealAmount;
      }
      addCombatLog({ type: 'system', message: `${ctx.regenHeroName} regenerates ${ctx.regenHealAmount} HP` });
      addEffect({ type: 'healBurst', position: ctx.regenHeroPosition });
    }

    // Apply damage_heals effect
    if (ctx.totalDamageDealtThisTurn > 0 && actor.isHero) {
      const perTurnEffects = getPerTurnEffects(aliveHeroes);
      if (perTurnEffects.damageToHealingPercent > 0) {
        const partyHealAmount = Math.floor(ctx.totalDamageDealtThisTurn * perTurnEffects.damageToHealingPercent);
        if (partyHealAmount > 0) {
          for (let i = 0; i < newHeroes.length; i++) {
            const hero = newHeroes[i];
            if (hero.stats.hp > 0 && hero.stats.hp < hero.stats.maxHp) {
              let healPerHero = Math.floor(partyHealAmount / aliveHeroes.length);
              const d2hReduction = getHeroHealingReduction(heroes.find(hr => hr.id === hero.id) || {});
              if (d2hReduction > 0) healPerHero = Math.floor(healPerHero * (1 - d2hReduction));
              const actualHeal = Math.min(healPerHero, hero.stats.maxHp - hero.stats.hp);
              if (actualHeal > 0) {
                newHeroes[i].stats.hp += actualHeal;
                addEffect({ type: 'damage', position: hero.position, damage: actualHeal, isHeal: true });
                ctx.healingReceivedByHero[hero.id] = (ctx.healingReceivedByHero[hero.id] || 0) + actualHeal;
              }
            }
          }
          addCombatLog({ type: 'system', message: `${actor.name}'s damage heals the party for ${partyHealAmount}!` });
        }
      }
    }

    // Blood Pendant party lifesteal
    if (ctx.totalDamageDealtThisTurn > 0 && actor.isHero) {
      for (let i = 0; i < newHeroes.length; i++) {
        const hero = newHeroes[i];
        if (hero.stats.hp <= 0 || hero.isPet || hero.isClone || hero.isUndead) continue;
        const pendantHeroData = heroes.find(h => h.id === hero.id);
        if (!pendantHeroData) continue;
        const pendantItems = getHeroUniqueItems(pendantHeroData);
        const bloodPendant = pendantItems.find(item => item.uniquePower?.effect?.partyLifesteal);
        if (bloodPendant) {
          const partyLifestealPercent = bloodPendant.uniquePower.effect.partyLifesteal;
          const pendantHeal = Math.floor(ctx.totalDamageDealtThisTurn * partyLifestealPercent);
          if (pendantHeal > 0 && hero.stats.hp < hero.stats.maxHp) {
            const actualPendantHeal = Math.min(pendantHeal, hero.stats.maxHp - hero.stats.hp);
            if (actualPendantHeal > 0) {
              newHeroes[i].stats.hp += actualPendantHeal;
              addCombatLog({ type: 'system', message: `Blood Pendant! ${hero.name} drains ${actualPendantHeal} HP from party damage!` });
              addEffect({ type: 'damage', position: hero.position, damage: actualPendantHeal, isHeal: true });
              ctx.healingReceivedByHero[hero.id] = (ctx.healingReceivedByHero[hero.id] || 0) + actualPendantHeal;
            }
          }
        }
      }
    }

    // Track combat stats
    if (actor.isHero) {
      if (ctx.totalDamageDealtThisTurn > 0) {
        const statHeroId = actor.ownerId || actor.id;
        incrementStat('totalDamageDealt', ctx.totalDamageDealtThisTurn, { heroId: statHeroId });
      }
    }
    for (const [heroId, damage] of Object.entries(ctx.damageTakenByHero)) {
      if (damage > 0) {
        incrementStat('totalDamageTaken', damage, { heroId });
      }
    }
    for (const [heroId, healing] of Object.entries(ctx.healingDoneByHero)) {
      if (healing > 0) {
        incrementStat('totalHealingDone', healing, { heroId });
      }
    }
    for (const [heroId, healing] of Object.entries(ctx.healingReceivedByHero)) {
      if (healing > 0) {
        incrementStat('totalHealingReceived', healing, { heroId });
      }
    }

    // Remove dead undead summons
    for (let i = newHeroes.length - 1; i >= 0; i--) {
      if (newHeroes[i].isUndead && newHeroes[i].stats.hp <= 0) {
        const undeadId = newHeroes[i].id;
        newHeroes.splice(i, 1);
        const turnIdx = newTurnOrder.indexOf(undeadId);
        if (turnIdx !== -1) newTurnOrder.splice(turnIdx, 1);
      }
    }

    // === 18. Final batch state update ===
    const nextTurnState = getNextTurnState(roomCombat, newHeroes, newMonsters);
    const newViewport = calculateCombatViewport(newHeroes, newMonsters, combatMonsterIdSet, roomCombat.viewport, mazeDungeon);

    const uniqueStateSnapshots = {};
    for (const hero of newHeroes) {
      if (hero.isPet || hero.isClone || hero.isUndead) continue;
      const snapshot = getUniqueStateSnapshot(hero.id);
      if (snapshot) uniqueStateSnapshots[hero.id] = snapshot;
    }

    updateRoomCombat({
      heroes: newHeroes,
      monsters: newMonsters,
      buffs: newBuffs,
      statusEffects: newStatusEffects,
      skillCooldowns: newSkillCooldowns,
      monsterCooldowns: newMonsterCooldowns,
      killBonusStacks: newKillBonusStacks,
      turnOrder: newTurnOrder,
      combatMonsters: newCombatMonsters,
      usedPhoenixRevives: newUsedPhoenixRevives,
      reactiveHealUsed: newReactiveHealUsed,
      lastSummonRoomIndex,
      viewport: newViewport,
      uniqueStates: uniqueStateSnapshots,
      ...(nextTurnState || {}),
    });

    const heroHpSync = {};
    for (const hero of newHeroes) {
      if (hero.isPet || hero.isClone || hero.isUndead) continue;
      heroHpSync[hero.id] = hero.stats.hp;
    }
    syncHeroHp(heroHpSync);

    return true;
  }, [updateRoomCombat, addCombatLog, addGold, addXpToHero, processLootDrop, incrementStat, syncHeroHp, addEffect, addConsumable, handleUniqueDrop, hasResurrectionScroll, consumeResurrectionScroll]);

  return {
    getCurrentActor: useCallback((roomCombatOverride = null) => {
      return getCurrentActor(roomCombatOverride || useGameStore.getState().roomCombat);
    }, []),
    advanceTurn,
    handleCombatTick,
    resetLastProcessedTurn,
  };
};
