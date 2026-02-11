import { useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { getDistance } from '../game/roomBasedDungeon';
import { findPath, isWalkable, hasLineOfSight } from '../game/mazeGenerator';
import {
  chooseBestSkill,
  executeSkillAbility,
  applyPassiveEffects,
  getEffectiveCooldown,
  getOnHitEffects,
  getOnKillEffects,
  getOnDamageTakenEffects,
  checkCheatDeath,
  getPerTurnEffects,
  checkMartyrIntercept,
  getSummonData,
  createPetUnit,
  createShadowClone,
  checkRaiseDead,
  createRaisedUndead,
  checkVengeanceTrigger,
  getPartyAuraEffects,
  getTauntPartyBonus,
  checkReactiveTaunt,
  checkDamageRedirect,
  calculateDamageSharing,
  getBeaconHealInfo,
  getHealShieldBonus,
  getLivingSeedInfo,
  getDotLifestealPercent,
  hasArmorVsDot,
} from '../game/skillEngine';
import { generateEquipment, generateConsumableDrop } from '../data/equipment';
import {
  PHASES,
  calculateDodgeChance,
  calculateDoubleAttackChance,
  calculateMoveDistance,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
} from '../game/constants';
import {
  processStatusEffectsOnTurnStart,
  applyStatusEffect,
  checkStatusBreaks,
  hasStatusEffect,
} from '../game/statusEngine';
import { STATUS_EFFECTS } from '../data/statusEffects';
import { chooseMonsterAbility, executeMonsterAbility } from '../game/monsterAI';
import { MONSTER_ABILITIES } from '../data/monsterAbilities';
import { MONSTERS } from '../data/monsters';
import {
  getPassiveAffixBonuses,
  processOnHitAffixes,
  processOnCritAffixes,
  processOnKillAffixes,
  processOnDamageTakenAffixes,
  processOnTurnStartAffixes,
  getExecuteBonus,
  getBerserkerBonus,
  checkPhoenixRevive,
} from '../game/affixEngine';

// OPTIMIZATION: Build hero HP map without intermediate arrays (avoids Object.fromEntries + map)
const buildHeroHpMap = (heroes) => {
  const map = {};
  for (let i = 0; i < heroes.length; i++) {
    const h = heroes[i];
    map[h.id] = h.stats.hp;
  }
  return map;
};

/**
 * Hook for combat phase logic
 * OPTIMIZATION: Uses imperative state access to avoid subscribing to store changes
 */
export const useCombat = ({ addEffect }) => {
  // OPTIMIZATION: Get state/actions imperatively to avoid re-renders on every state change
  const getState = useCallback(() => useGameStore.getState(), []);
  const addGold = useCallback((amount) => useGameStore.getState().addGold(amount), []);
  const addXpToHero = useCallback((heroId, xp) => useGameStore.getState().addXpToHero(heroId, xp), []);
  const processLootDrop = useCallback((level, isBoss, dungeonType) => useGameStore.getState().processLootDrop(level, isBoss, dungeonType), []);
  const incrementStat = useCallback((stat, amount = 1, options = {}) => useGameStore.getState().incrementStat(stat, amount, options), []);
  const addCombatLog = useCallback((log) => useGameStore.getState().addCombatLog(log), []);
  const updateRoomCombat = useCallback((updates) => useGameStore.getState().updateRoomCombat(updates), []);
  const syncHeroHp = useCallback((hpMap) => useGameStore.getState().syncHeroHp(hpMap), []);
  const hasResurrectionScroll = useCallback(() => useGameStore.getState().hasResurrectionScroll(), []);
  const useResurrectionScroll = useCallback(() => useGameStore.getState().useResurrectionScroll(), []);
  const addConsumable = useCallback((consumable) => useGameStore.getState().addConsumable(consumable), []);

  const lastProcessedTurnRef = useRef(null);

  // OPTIMIZATION: Reusable data structures to reduce GC pressure
  const unitHpMapRef = useRef(new Map());
  const heroIndexMapRef = useRef(new Map());
  const monsterIndexMapRef = useRef(new Map());
  const combatMonsterIdSetRef = useRef(new Set());

  // Get current actor from turn order (uses imperative state access)
  const getCurrentActor = useCallback((roomCombatOverride = null) => {
    const roomCombat = roomCombatOverride || useGameStore.getState().roomCombat;
    if (!roomCombat) return null;

    const { turnOrder, currentTurnIndex, heroes: combatHeroes, monsters } = roomCombat;
    if (!turnOrder || turnOrder.length === 0) return null;

    const currentId = turnOrder[currentTurnIndex];
    const hero = combatHeroes.find(h => h.id === currentId && h.stats.hp > 0);
    if (hero) return { ...hero, isHero: true };

    const monster = monsters.find(m => m.id === currentId && m.stats.hp > 0);
    if (monster) return { ...monster, isHero: false };

    return null;
  }, []);

  // OPTIMIZATION: Calculate next turn state without updating (for batching)
  const getNextTurnState = useCallback((roomCombatOverride, heroesOverride = null, monstersOverride = null) => {
    const roomCombat = roomCombatOverride || useGameStore.getState().roomCombat;
    if (!roomCombat) return null;

    const { turnOrder, currentTurnIndex, round } = roomCombat;
    const combatHeroes = heroesOverride || roomCombat.heroes;
    const monsters = monstersOverride || roomCombat.monsters;

    // OPTIMIZATION: Build ID->HP maps for O(1) lookups instead of O(n) .find() per unit
    const unitHpMap = new Map();
    for (let i = 0; i < combatHeroes.length; i++) {
      const h = combatHeroes[i];
      unitHpMap.set(h.id, h.stats.hp);
    }
    for (let i = 0; i < monsters.length; i++) {
      const m = monsters[i];
      unitHpMap.set(m.id, m.stats.hp);
    }

    let nextIndex = (currentTurnIndex + 1) % turnOrder.length;
    let newRound = round;
    let attempts = 0;

    // Skip dead units - now O(1) lookup per unit
    while (attempts < turnOrder.length) {
      const id = turnOrder[nextIndex];
      const hp = unitHpMap.get(id);

      if (hp !== undefined && hp > 0) {
        break;
      }

      nextIndex = (nextIndex + 1) % turnOrder.length;
      attempts++;
    }

    // Check for new round
    if (nextIndex <= currentTurnIndex) {
      newRound = round + 1;
    }

    return { currentTurnIndex: nextIndex, round: newRound };
  }, []);

  // Legacy advanceTurn (still used for early returns)
  const advanceTurn = useCallback(() => {
    const roomCombat = useGameStore.getState().roomCombat;
    const nextState = getNextTurnState(roomCombat);
    if (nextState) {
      updateRoomCombat(nextState);
    }
  }, [getNextTurnState, updateRoomCombat]);

  // Reset the last processed turn ref
  const resetLastProcessedTurn = useCallback(() => {
    lastProcessedTurnRef.current = null;
  }, []);

  // Handle combat phase tick
  const handleCombatTick = useCallback(() => {
    // OPTIMIZATION: Get all state imperatively at start of tick
    const state = useGameStore.getState();
    const { roomCombat, heroes, heroHp, dungeon } = state;
    const homesteadBonuses = state.getHomesteadBonuses();

    if (!roomCombat || roomCombat.phase !== PHASES.COMBAT) return false;

    const { heroes: combatHeroes, monsters, combatMonsters, dungeon: mazeDungeon } = roomCombat;

    // OPTIMIZATION: Clone arrays using for loops instead of .map() to reduce callback overhead
    // Pre-allocate arrays for better performance
    const heroCount = combatHeroes.length;
    const monsterCount = monsters.length;
    const newHeroes = new Array(heroCount);
    const newMonsters = new Array(monsterCount);

    for (let i = 0; i < heroCount; i++) {
      const h = combatHeroes[i];
      // Sync skills from store heroes (in case skills were unlocked mid-dungeon)
      const storeHero = heroes.find(sh => sh.id === h.id);
      const syncedSkills = storeHero?.skills || h.skills || [];
      newHeroes[i] = { ...h, stats: { ...h.stats }, skills: syncedSkills };
    }
    for (let i = 0; i < monsterCount; i++) {
      const m = monsters[i];
      newMonsters[i] = { ...m, stats: { ...m.stats } };
    }

    // OPTIMIZATION: Reuse Maps/Sets to reduce GC pressure (clear and refill instead of new)
    const heroIndexMap = heroIndexMapRef.current;
    const monsterIndexMap = monsterIndexMapRef.current;
    heroIndexMap.clear();
    monsterIndexMap.clear();
    for (let i = 0; i < newHeroes.length; i++) heroIndexMap.set(newHeroes[i].id, i);
    for (let i = 0; i < newMonsters.length; i++) monsterIndexMap.set(newMonsters[i].id, i);

    let aliveHeroes = newHeroes.filter(h => h.stats.hp > 0);

    // Check for dead heroes that can be revived with resurrection scroll
    // This handles heroes that were already dead when combat tick starts
    const deadHeroes = newHeroes.filter(h => h.stats.hp <= 0);
    if (deadHeroes.length > 0 && aliveHeroes.length > 0) {
      // Only use scroll if at least one hero is still alive (not total wipe)
      const resScroll = hasResurrectionScroll();
      if (resScroll) {
        const heroToRevive = deadHeroes[0];
        const heroIdx = heroIndexMap.get(heroToRevive.id) ?? -1;
        if (heroIdx !== -1) {
          const scroll = useResurrectionScroll();
          const reviveHp = Math.floor(heroToRevive.stats.maxHp * scroll.reviveHpPercent);
          newHeroes[heroIdx].stats.hp = reviveHp;
          addCombatLog({ type: 'system', message: `Resurrection Scroll! ${heroToRevive.name} is restored with ${reviveHp} HP!` });
          addEffect({ type: 'healBurst', position: heroToRevive.position });
          syncHeroHp(buildHeroHpMap(newHeroes));
          // Recompute aliveHeroes after resurrection
          aliveHeroes = newHeroes.filter(h => h.stats.hp > 0);
        }
      }
    }

    // Get homestead bonuses for rewards
    const goldMultiplier = 1 + (homesteadBonuses.goldFind || 0);
    const xpMultiplier = 1 + (homesteadBonuses.xpGain || 0);
    const damageBonus = 1;
    const defenseBonus = 1;
    const critBonus = 0;

    // Get monsters currently in combat - reuse Set to reduce GC pressure
    const combatMonsterIds = combatMonsters || [];
    const combatMonsterIdSet = combatMonsterIdSetRef.current;
    combatMonsterIdSet.clear();
    for (let i = 0; i < combatMonsterIds.length; i++) combatMonsterIdSet.add(combatMonsterIds[i]);
    const activeCombatMonsters = newMonsters.filter(m => combatMonsterIdSet.has(m.id) && m.stats.hp > 0);

    const skillCooldowns = roomCombat.skillCooldowns || {};
    const newKillBonusStacks = { ...(roomCombat.killBonusStacks || {}) };
    const newBuffs = { ...(roomCombat.buffs || {}) };
    const newStatusEffects = { ...(roomCombat.statusEffects || {}) };
    const newSkillCooldowns = { ...skillCooldowns };
    const newMonsterCooldowns = { ...(roomCombat.monsterCooldowns || {}) };
    const newTurnOrder = [...roomCombat.turnOrder];
    const newCombatMonsters = [...combatMonsterIds];
    const newUsedPhoenixRevives = { ...(roomCombat.usedPhoenixRevives || {}) };
    let summonsSpawned = roomCombat.summonsSpawned || false;

    // Spawn pets and clones at combat start (first tick of first round)
    if (!summonsSpawned && roomCombat.round <= 1 && roomCombat.currentTurnIndex === 0) {
      for (const hero of newHeroes) {
        if (hero.stats.hp <= 0) continue;

        const summonData = getSummonData(hero);
        for (const summon of summonData) {
          // Find a position near the hero for the summon
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
      summonsSpawned = true;
    }

    // OPTIMIZATION: O(1) lookup helpers using maps
    const findHeroIndex = (id) => heroIndexMap.get(id) ?? -1;
    const findMonsterIndex = (id) => monsterIndexMap.get(id) ?? -1;

    // Helper to handle unit death - clears buffs/debuffs and adds ghost status
    const handleUnitDeath = (unitId) => {
      // Clear all buffs and status effects, replace with ghost debuff
      newBuffs[unitId] = { ghost: true };
      newStatusEffects[unitId] = [];
    };

    // Helper to update viewport to keep combat units visible
    const calculateCombatViewport = (heroesArr, monstersArr) => {
      const currentViewport = roomCombat.viewport || { x: 0, y: 0 };
      if (!mazeDungeon) return currentViewport;

      // Get all alive combat units
      const aliveUnits = [
        ...heroesArr.filter(h => h.stats.hp > 0),
        ...monstersArr.filter(m => combatMonsterIdSet.has(m.id) && m.stats.hp > 0)
      ];

      if (aliveUnits.length === 0) return currentViewport;

      // Find bounding box of all units
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const unit of aliveUnits) {
        minX = Math.min(minX, unit.position.x);
        maxX = Math.max(maxX, unit.position.x);
        minY = Math.min(minY, unit.position.y);
        maxY = Math.max(maxY, unit.position.y);
      }

      // Calculate center of combat
      const centerX = Math.floor((minX + maxX) / 2);
      const centerY = Math.floor((minY + maxY) / 2);

      // Center viewport on combat, with bounds checking
      let newX = centerX - Math.floor(VIEWPORT_WIDTH / 2);
      let newY = centerY - Math.floor(VIEWPORT_HEIGHT / 2);

      // Clamp to dungeon bounds
      newX = Math.max(0, Math.min(mazeDungeon.width - VIEWPORT_WIDTH, newX));
      newY = Math.max(0, Math.min(mazeDungeon.height - VIEWPORT_HEIGHT, newY));

      return { x: newX, y: newY };
    };

    // Check defeat
    if (aliveHeroes.length === 0) {
      // Clear status effects and buffs on defeat
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

    // Check victory - all combat monsters dead
    if (activeCombatMonsters.length === 0) {
      // Mark room as cleared if in a room
      if (mazeDungeon) {
        const currentRoom = mazeDungeon.rooms.find(r =>
          roomCombat.partyPosition.x >= r.x && roomCombat.partyPosition.x < r.x + r.width &&
          roomCombat.partyPosition.y >= r.y && roomCombat.partyPosition.y < r.y + r.height
        );

        if (currentRoom && !currentRoom.cleared) {
          const updatedRooms = mazeDungeon.rooms.map(r =>
            r.index === currentRoom.index ? { ...r, cleared: true } : r
          );
          updateRoomCombat({
            dungeon: { ...mazeDungeon, rooms: updatedRooms },
          });
        }
      }

      // Clear status effects and combat buffs from heroes when room combat ends
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

    // Get current actor from TURN ORDER
    const actor = getCurrentActor(roomCombat);

    if (!actor) {
      // OPTIMIZATION: Batch turn advance instead of calling advanceTurn()
      const nextTurn = getNextTurnState(roomCombat, newHeroes, newMonsters);
      if (nextTurn) {
        updateRoomCombat(nextTurn);
      }
      return true;
    }

    // Prevent duplicate processing of the same turn (React StrictMode workaround)
    const turnKey = `combat-${roomCombat.round}-${roomCombat.currentTurnIndex}`;
    if (lastProcessedTurnRef.current === turnKey) {
      return true;
    }
    lastProcessedTurnRef.current = turnKey;

    // Decrement cooldowns at start of actor's turn
    if (actor.isHero && newSkillCooldowns[actor.id]) {
      // OPTIMIZATION: Mutate in place
      if (!newSkillCooldowns[actor.id]) newSkillCooldowns[actor.id] = {};
      for (const skillId in newSkillCooldowns[actor.id]) {
        if (newSkillCooldowns[actor.id][skillId] > 0) {
          newSkillCooldowns[actor.id][skillId]--;
        }
      }
    }

    // Track regen heal to apply at end of turn (to avoid state update loop)
    let regenHealAmount = 0;
    let regenHeroId = null;
    let regenHeroPosition = null;
    let regenHeroName = null;

    // Track damage dealt this turn for damage_heals effect and stats
    let totalDamageDealtThisTurn = 0;
    // Track damage taken by heroes this turn for stats (per-hero)
    const damageTakenByHero = {};
    // Track healing done by heroes this turn for stats (per-hero, includes heals from different heroes' effects)
    const healingDoneByHero = {};
    // Track healing received by heroes this turn for stats (per-hero)
    const healingReceivedByHero = {};

    // Apply party-wide per-turn effects at the start of each round (first actor's turn)
    if (roomCombat.currentTurnIndex === 0) {
      const perTurnEffects = getPerTurnEffects(aliveHeroes);

      // Party regen: heal all heroes by a percentage of max HP
      if (perTurnEffects.partyRegenPercent > 0) {
        for (let i = 0; i < newHeroes.length; i++) {
          const hero = newHeroes[i];
          if (hero.stats.hp > 0 && hero.stats.hp < hero.stats.maxHp) {
            const healAmount = Math.floor(hero.stats.maxHp * perTurnEffects.partyRegenPercent);
            const actualHeal = Math.min(healAmount, hero.stats.maxHp - hero.stats.hp);
            if (actualHeal > 0) {
              newHeroes[i].stats.hp += actualHeal;
              addEffect({ type: 'damage', position: hero.position, damage: actualHeal, isHeal: true });
              healingReceivedByHero[hero.id] = (healingReceivedByHero[hero.id] || 0) + actualHeal;
            }
          }
        }
        addCombatLog({ type: 'system', message: `Party regenerates ${Math.round(perTurnEffects.partyRegenPercent * 100)}% HP` });
      }
    }

    // Process ON_TURN_START affixes (regeneration) for heroes
    if (actor.isHero) {
      const heroData = heroes.find(h => h.id === actor.id);
      if (heroData) {
        const heroWithEquipment = { ...heroData, stats: actor.stats };
        const turnStartResult = processOnTurnStartAffixes(heroWithEquipment);

        if (turnStartResult.healAmount > 0 && actor.stats.hp < actor.stats.maxHp) {
          regenHealAmount = Math.min(turnStartResult.healAmount, actor.stats.maxHp - actor.stats.hp);
          regenHeroId = actor.id;
          regenHeroPosition = actor.position;
          regenHeroName = actor.name;
          // Don't update state here - will be applied at end of turn to avoid loop
        }
      }
    }

    // Decrement buffs at start of each unit's turn
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
      ];

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
        // This is handled by not calling getNextTurnState for this actor
      }
    }

    // Handle undead minion expiration
    if (actor.isUndead && actor.turnsRemaining !== undefined) {
      const heroIdx = findHeroIndex(actor.id);
      if (heroIdx !== -1) {
        newHeroes[heroIdx].turnsRemaining--;
        if (newHeroes[heroIdx].turnsRemaining <= 0) {
          newHeroes[heroIdx].stats.hp = 0;
          addCombatLog({ type: 'system', message: `${actor.name} crumbles to dust!` });
          addEffect({ type: 'death', position: actor.position, isHero: false });
          handleUnitDeath(actor.id);
        }
      }
    }

    // Process status effects at start of turn
    const actorEffects = newStatusEffects[actor.id] || [];

    if (actorEffects.length > 0) {
      // Create unit object with status effects for processing
      const actorWithEffects = { ...actor, statusEffects: actorEffects };
      const statusResult = processStatusEffectsOnTurnStart(actorWithEffects, { movedLastTurn: actor.movedLastTurn });

      // Apply DOT damage
      if (statusResult.damage > 0) {
        let dotDamage = statusResult.damage;

        if (actor.isHero) {
          // Check for armor vs DoT (Knight Armor Master)
          if (hasArmorVsDot(actor)) {
            const reduction = Math.floor(actor.stats.defense * 0.5);
            dotDamage = Math.max(1, dotDamage - reduction);
          }

          // HP synced at end of tick via syncHeroHp
          // OPTIMIZATION: Mutate in place instead of creating new array
          const heroIdx = findHeroIndex(actor.id);
          if (heroIdx !== -1) {
            newHeroes[heroIdx].stats.hp = Math.max(0, newHeroes[heroIdx].stats.hp - dotDamage);
            // Track DOT damage taken
            damageTakenByHero[actor.id] = (damageTakenByHero[actor.id] || 0) + dotDamage;
          }

          // Check for death from DOT (use updated HP from newHeroes, not stale heroHp)
          const updatedHeroHp = heroIdx !== -1 ? newHeroes[heroIdx].stats.hp : 0;
          if (updatedHeroHp <= 0) {
            // Check for resurrection scroll first (consumes the scroll)
            const resScroll = hasResurrectionScroll();
            if (resScroll) {
              const scroll = useResurrectionScroll();
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
              // HP synced at end of tick via syncHeroHp
              if (heroIdx !== -1) {
                newHeroes[heroIdx].stats.hp = reviveHp;
              }
              newUsedPhoenixRevives[actor.id] = true;
              addCombatLog({ type: 'system', message: `Phoenix Feather! ${actor.name} rises from the ashes with ${reviveHp} HP!` });
              addEffect({ type: 'healBurst', position: actor.position });
              // Update state and continue (don't return - hero is now alive)
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
              handleUnitDeath(actor.id);
              // OPTIMIZATION: Single batched update including turn advance
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
          // OPTIMIZATION: Mutate in place instead of creating new array
          const monsterIdx = findMonsterIndex(actor.id);
          if (monsterIdx !== -1) {
            newMonsters[monsterIdx].stats.hp = Math.max(0, newMonsters[monsterIdx].stats.hp - dotDamage);
          }

          // Check for DOT lifesteal (Necromancer Necrosis) - heal heroes who have this passive
          for (const hero of aliveHeroes) {
            const dotLifesteal = getDotLifestealPercent(hero);
            if (dotLifesteal > 0) {
              const healAmount = Math.floor(dotDamage * dotLifesteal);
              const heroIdx = findHeroIndex(hero.id);
              if (heroIdx !== -1 && healAmount > 0) {
                const actualHeal = Math.min(healAmount, newHeroes[heroIdx].stats.maxHp - newHeroes[heroIdx].stats.hp);
                if (actualHeal > 0) {
                  newHeroes[heroIdx].stats.hp += actualHeal;
                  addEffect({ type: 'damage', position: hero.position, damage: actualHeal, isHeal: true });
                  healingReceivedByHero[hero.id] = (healingReceivedByHero[hero.id] || 0) + actualHeal;
                }
              }
            }
          }

          // Check for death from DOT
          if (actor.stats.hp - dotDamage <= 0) {
            addCombatLog({ type: 'death', target: { name: actor.name }, isHero: false });
            addEffect({ type: 'death', position: actor.position, isHero: false, monsterId: actor.templateId });
            handleUnitDeath(actor.id);
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

      // Apply HOT healing
      if (statusResult.healing > 0 && actor.isHero) {
        // HP synced at end of tick via syncHeroHp
        // OPTIMIZATION: Mutate in place instead of creating new array
        const heroIdx = findHeroIndex(actor.id);
        if (heroIdx !== -1) {
          const actualHeal = Math.min(statusResult.healing, newHeroes[heroIdx].stats.maxHp - newHeroes[heroIdx].stats.hp);
          newHeroes[heroIdx].stats.hp = Math.min(newHeroes[heroIdx].stats.maxHp, newHeroes[heroIdx].stats.hp + statusResult.healing);
          if (actualHeal > 0) {
            healingReceivedByHero[actor.id] = (healingReceivedByHero[actor.id] || 0) + actualHeal;
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
    }

    // Find target
    const enemies = actor.isHero ? activeCombatMonsters : aliveHeroes;
    let target = enemies[0];
    let minDist = Infinity;

    // Monsters must attack taunting heroes
    if (!actor.isHero) {
      const tauntingHero = aliveHeroes.find(h => newBuffs[h.id]?.taunt > 0);
      if (tauntingHero) {
        target = tauntingHero;
        minDist = getDistance(actor.position, target.position);
      } else {
        for (const e of enemies) {
          const d = getDistance(actor.position, e.position);
          if (d < minDist) { minDist = d; target = e; }
        }
      }
    } else {
      for (const e of enemies) {
        const d = getDistance(actor.position, e.position);
        if (d < minDist) { minDist = d; target = e; }
      }
    }

    const range = actor.attackRange || 1;

    // Check line of sight for ranged attacks (melee range 1 doesn't need LOS check)
    const grid = mazeDungeon?.grid;
    const canSeeTarget = range <= 1 || !grid || hasLineOfSight(grid, actor.position, target.position);

    if (minDist <= range && canSeeTarget) {
      // In range and has line of sight - attack or use skill
      let usedSkill = false;

      if (actor.isHero && actor.skills && actor.skills.length > 0) {
        const heroCooldowns = newSkillCooldowns[actor.id] || {};
        const skill = chooseBestSkill(actor, activeCombatMonsters, aliveHeroes, heroCooldowns);

        if (skill) {
          // Execute the skill
          const { results, logs } = executeSkillAbility(
            actor,
            skill,
            activeCombatMonsters,
            aliveHeroes,
            heroHp,
            addEffect
          );

          // Log skill use
          for (const log of logs) {
            if (log.type === 'skill') {
              addCombatLog({
                type: 'skill',
                actor: log.actor,
                target: log.target,
                skill: log.skill,
                damage: log.damage,
              });
            } else if (log.type === 'heal') {
              addCombatLog({
                type: 'heal',
                actor: log.actor,
                target: log.target,
                skill: log.skill,
                amount: log.amount,
              });
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
                totalDamageDealtThisTurn += result.damage;

                if (newHp <= 0 && oldHp > 0) {
                  addCombatLog({ type: 'death', target: { name: m.name }, isHero: false });
                  addEffect({ type: 'death', position: m.position, isHero: false, monsterId: m.templateId });
                  handleUnitDeath(m.id);

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

                  // Award XP with bonus for underleveled heroes (10% per level below dungeon)
                  const baseXpPerHero = Math.floor((m.xpReward / heroes.length) * xpMultiplier);
                  heroes.forEach(h => {
                    const levelDiff = dungeon.level - h.level;
                    const catchUpBonus = levelDiff > 0 ? 1 + (levelDiff * 0.10) : 1;
                    const xpForHero = Math.floor(baseXpPerHero * catchUpBonus);
                    addXpToHero(h.id, xpForHero);
                  });
                  incrementStat('totalMonstersKilled', 1, { heroId: actor.id, monsterId: m.templateId, isBoss: m.isBoss });

                  // Visual gold drop effect
                  if (gold > 0) {
                    addEffect({
                      type: 'goldDrop',
                      position: m.position,
                      amount: gold,
                    });
                  }

                  newKillBonusStacks[actor.id] = (newKillBonusStacks[actor.id] || 0) + 1;

                  if (Math.random() < (m.isBoss ? 0.9 : 0.25)) {
                    const item = generateEquipment(dungeon.level);
                    const lootResult = processLootDrop(item);

                    // Visual loot drop effect
                    addEffect({
                      type: 'lootDrop',
                      position: m.position,
                      slot: item.slot,
                      rarityColor: item.rarityColor || '#9ca3af',
                    });

                    if (lootResult.action === 'sold') {
                      addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${lootResult.gold}g)` });
                    } else if (lootResult.action === 'looted') {
                      addCombatLog({ type: 'system', message: `Loot: ${item.name}${lootResult.upgradeFor ? ' [Upgrade]' : ''}` });
                    } else {
                      addCombatLog({ type: 'system', message: `${item.name} (inventory full!)` });
                    }
                  }

                  // Chance to drop resurrection scroll (rare, boosted if party has dead member)
                  const hasDeadPartyMember = newHeroes.some(h => h && h.stats.hp <= 0);
                  const consumable = generateConsumableDrop(dungeon.level, hasDeadPartyMember);
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
            } else if (result.type === 'raiseEnemy') {
              // Handle Raise Dead active skill - raise strongest dead enemy
              const deadMonsters = newMonsters.filter(m => m.stats.hp <= 0);
              if (deadMonsters.length > 0) {
                // Find strongest dead monster by max HP
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
              // Remove all debuffs/status effects from target
              newStatusEffects[result.targetId] = [];
              const targetHero = newHeroes.find(h => h.id === result.targetId);
              if (targetHero) {
                addCombatLog({ type: 'system', message: `${targetHero.name} is cleansed of all debuffs!` });
              }
            } else if (result.type === 'dispel') {
              // Remove all buffs from enemy
              newBuffs[result.targetId] = {};
              const targetMonster = newMonsters.find(m => m.id === result.targetId);
              if (targetMonster) {
                addCombatLog({ type: 'system', message: `${targetMonster.name}'s buffs are dispelled!` });
              }
            } else if (result.type === 'debuff') {
              // Apply debuff to target
              if (!newBuffs[result.targetId]) newBuffs[result.targetId] = {};
              const debuff = result.debuff;
              if (debuff.type === 'damageAmp') {
                newBuffs[result.targetId].damageAmp = debuff.percent;
                newBuffs[result.targetId].damageAmpDuration = debuff.duration;
              } else if (debuff.type === 'weakness') {
                newBuffs[result.targetId].weakness = debuff.percent;
                newBuffs[result.targetId].weaknessDuration = debuff.duration;
              } else if (debuff.type === 'stun') {
                // Apply stun as status effect
                const mockTarget = { statusEffects: newStatusEffects[result.targetId] || [] };
                const statusResult = applyStatusEffect(mockTarget, 'stunned', actor, { duration: debuff.duration });
                newStatusEffects[result.targetId] = statusResult.effects;
              }
            } else if (result.type === 'heal') {
              const heroIdx = findHeroIndex(result.targetId);
              if (heroIdx !== -1) {
                const h = newHeroes[heroIdx];
                const actualHealAmount = Math.min(result.amount, h.stats.maxHp - h.stats.hp);
                h.stats.hp = Math.min(h.stats.maxHp, h.stats.hp + result.amount);
                // HP synced at end of tick via syncHeroHp
                if (actualHealAmount > 0) {
                  healingReceivedByHero[result.targetId] = (healingReceivedByHero[result.targetId] || 0) + actualHealAmount;
                  healingDoneByHero[actor.id] = (healingDoneByHero[actor.id] || 0) + actualHealAmount;
                }

                // Check for heal_shield (Cleric Radiance - heals grant shields)
                const healShieldInfo = getHealShieldBonus(actor);
                if (healShieldInfo.hasHealShield) {
                  const shieldAmount = Math.floor(result.amount * healShieldInfo.percent);
                  if (!newBuffs[result.targetId]) newBuffs[result.targetId] = {};
                  newBuffs[result.targetId].shield = (newBuffs[result.targetId].shield || 0) + shieldAmount;
                  addCombatLog({ type: 'system', message: `${healShieldInfo.skillName}! ${h.name} gains ${shieldAmount} shield` });
                }

                // Check for beacon heal (Paladin Beacon of Light - heals spread to lowest ally)
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
                        healingReceivedByHero[lowestAlly.id] = (healingReceivedByHero[lowestAlly.id] || 0) + actualBeaconHeal;
                        healingDoneByHero[actor.id] = (healingDoneByHero[actor.id] || 0) + actualBeaconHeal;
                      }
                    }
                  }
                }

                // Check for living seed (Druid Living Seed - plant seed on heal target)
                const livingSeedInfo = getLivingSeedInfo(actor);
                if (livingSeedInfo.hasLivingSeed) {
                  if (!newBuffs[result.targetId]) newBuffs[result.targetId] = {};
                  newBuffs[result.targetId].livingSeed = livingSeedInfo.healPercent;
                  newBuffs[result.targetId].livingSeedCaster = actor.id;
                }
              }
            } else if (result.type === 'buff') {
              // Accumulate buffs for each target
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
              if (buff.type === 'shield') {
                newBuffs[result.targetId].shield = buff.amount || 0;
                newBuffs[result.targetId].blockNextHit = buff.blockNextHit || false;
              }
              if (buff.type === 'hot') {
                newBuffs[result.targetId].hot = buff.percentage;
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

          usedSkill = true;
        }
      }

      // If no skill used, do basic attack (or monster ability)
      if (!usedSkill) {
        // Check if monster should use an ability
        const monsterCooldowns = roomCombat.monsterCooldowns || {};
        let usedMonsterAbility = false;

        if (!actor.isHero && actor.abilities && actor.abilities.length > 0) {
          const cooldowns = monsterCooldowns[actor.id] || {};
          const allies = activeCombatMonsters.filter(m => m.id !== actor.id);
          const context = {
            round: roomCombat.round,
            hpPercent: actor.stats.hp / actor.stats.maxHp,
            bossFight: actor.isBoss || false,
            currentPhase: actor.currentPhase || 0,
          };

          const aiResult = chooseMonsterAbility(actor, aliveHeroes, allies, cooldowns, context);

          if (aiResult && aiResult.ability && !aiResult.useBasicAttack) {
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

            // Apply results - OPTIMIZATION: Use the already-cloned arrays
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
                        continue; // Skip this damage result
                      }

                      // Calculate dodge chance for ability damage
                      let abilityDodgeChance = calculateDodgeChance(targetHero.stats.speed, actor.stats.speed);
                      const targetDefenderBonuses = applyPassiveEffects(targetHero, 'on_defend', {});
                      abilityDodgeChance += targetDefenderBonuses.dodgeChance || 0;

                      if (Math.random() < abilityDodgeChance) {
                        incrementStat('totalDodges', 1, { heroId: targetHero.id });
                        addCombatLog({ type: 'system', message: `${targetHero.name} dodged ${ability.name}!` });
                        continue; // Skip this damage result
                      }

                      const wasAlive = targetHero.stats.hp > 0;
                      // HP synced at end of tick via syncHeroHp
                      targetHero.stats.hp = Math.max(0, targetHero.stats.hp - actionResult.damage);
                      // Track monster skill damage taken
                      damageTakenByHero[actionResult.targetId] = (damageTakenByHero[actionResult.targetId] || 0) + actionResult.damage;

                      // Only trigger death if hero was alive before this hit
                      if (wasAlive && targetHero.stats.hp <= 0) {
                        // Check for resurrection scroll first
                        const resScroll = hasResurrectionScroll();
                        if (resScroll) {
                          const scroll = useResurrectionScroll();
                          const reviveHp = Math.floor(targetHero.stats.maxHp * scroll.reviveHpPercent);
                          targetHero.stats.hp = reviveHp;
                          addCombatLog({ type: 'system', message: `Resurrection Scroll! ${targetHero.name} is restored with ${reviveHp} HP!` });
                          addEffect({ type: 'healBurst', position: targetHero.position });
                        } else {
                          // Check for phoenix revive
                          const targetHeroData = heroes.find(h => h.id === actionResult.targetId);
                          const phoenixRevive = targetHeroData ? checkPhoenixRevive(targetHeroData, newUsedPhoenixRevives) : null;

                          if (phoenixRevive) {
                            const reviveHp = Math.floor(targetHero.stats.maxHp * phoenixRevive.hpPercent);
                            // HP synced at end of tick via syncHeroHp
                            targetHero.stats.hp = reviveHp;
                            newUsedPhoenixRevives[actionResult.targetId] = true;
                            addCombatLog({ type: 'system', message: `Phoenix Feather! ${targetHero.name} rises from the ashes with ${reviveHp} HP!` });
                            addEffect({ type: 'healBurst', position: targetHero.position });
                          } else {
                            addCombatLog({ type: 'death', target: { name: targetHero.name }, isHero: true });
                            addEffect({ type: 'death', position: targetHero.position, isHero: true, classId: targetHero.classId });
                            handleUnitDeath(targetHero.id);
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
                    // Create mock target with current status effects for applyStatusEffect
                    const mockTarget = {
                      ...statusTarget,
                      statusEffects: newStatusEffects[actionResult.targetId] || [],
                    };

                    // Apply debuff duration reduction for heroes (from passive affixes like of_warding)
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
                      mockTarget,
                      actionResult.status.id,
                      actor,
                      { duration: effectiveDuration, stacks: actionResult.status.stacks }
                    );

                    newStatusEffects[actionResult.targetId] = statusResult.effects;

                    const statusDef = STATUS_EFFECTS[actionResult.status.id];
                    if (statusDef && statusResult.applied) {
                      addCombatLog({
                        type: 'system',
                        message: `${statusTarget.name} is ${statusDef.name.toLowerCase()}!`,
                      });
                    }
                  }
                  break;
                }

                case 'heal': {
                  const monsterIdx = findMonsterIndex(actionResult.targetId);
                  if (monsterIdx !== -1) {
                    const healTarget = newMonsters[monsterIdx];
                    // OPTIMIZATION: Mutate in place
                    healTarget.stats.hp = Math.min(healTarget.stats.maxHp, healTarget.stats.hp + actionResult.amount);
                    addCombatLog({
                      type: 'heal',
                      actor: { name: actor.name, emoji: actor.emoji },
                      target: { name: healTarget.name, emoji: healTarget.emoji },
                      skill: { name: ability.name },
                      amount: actionResult.amount,
                    });
                  }
                  break;
                }

                case 'summon': {
                  // Create summoned monsters
                  const summonType = actionResult.summonType || actor.summonType;
                  const summonCount = actionResult.summonCount || 1;

                  if (summonType) {
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
                          id: summonId,  // Must come AFTER spread to override template.id
                          position: spawnPos,
                          stats: {
                            ...summonTemplate.baseStats,
                            hp: summonTemplate.baseStats.maxHp,
                          },
                        };

                        newMonsters.push(summonedMonster);
                        newTurnOrder.push(summonId);
                        newCombatMonsters.push(summonId);

                        addCombatLog({
                          type: 'system',
                          message: `${actor.name} summons ${summonedMonster.name}!`,
                        });
                        addEffect({ type: 'summon', position: spawnPos, monsterId: summonType });
                      }
                    }
                  }
                  break;
                }
              }
            }

            usedMonsterAbility = true;
          }
        }

        // Fall back to basic attack if no ability used
        if (!usedMonsterAbility) {
        const passiveBonuses = actor.isHero
          ? applyPassiveEffects(actor, 'on_attack', { target, killBonusStacks: newKillBonusStacks[actor.id] || 0 })
          : { damageMultiplier: 1.0, damageReduction: 0 };

        // Get affix bonuses for heroes
        const heroData = actor.isHero ? heroes.find(h => h.id === actor.id) : null;
        const affixBonuses = heroData ? getPassiveAffixBonuses(heroData) : { critChanceBonus: 0 };

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

        // Check for taunt party bonus (Warlord - allies deal more damage while someone taunts)
        const tauntPartyBonus = actor.isHero ? getTauntPartyBonus(aliveHeroes, newBuffs) : 0;
        const tauntPartyMultiplier = 1 + tauntPartyBonus;

        // Check for buff-based damage bonus (Rallying Cry, Bloodlust, etc.)
        const buffDamageBonus = actorBuffs.damageBonus || 0;
        const buffAttackBonus = actorBuffs.attackBonus || 0;
        const buffDamageMultiplier = 1 + buffDamageBonus + buffAttackBonus;

        // Check for weakness debuff (Curse of Weakness) - reduces attacker's damage
        const weaknessDebuff = actorBuffs.weakness || 0;
        const weaknessMultiplier = 1 - weaknessDebuff;

        let baseDmg = Math.max(1, Math.floor(
          (actor.stats.attack * actorDamageBonus + (passiveBonuses.attackBonus || 0) - target.stats.defense * targetDefenseBonus * 0.5) * (0.85 + Math.random() * 0.3)
        ));

        let dmg = Math.floor(baseDmg * passiveBonuses.damageMultiplier * executeMultiplier * berserkerMultiplier * vengeanceMultiplier * tauntPartyMultiplier * buffDamageMultiplier * weaknessMultiplier);
        let isCrit = false;

        // Base crit chance: 5% for tanks/healers, 10% for DPS classes
        const dpsClasses = ['mage', 'ranger', 'rogue', 'necromancer', 'bard'];
        const baseCritChance = actor.isHero && dpsClasses.includes(actor.classId) ? 0.10 : 0.05;

        // Total crit chance includes base, skill passives, permanent bonuses, and affix bonuses
        const totalCritChance = baseCritChance + (passiveBonuses.critChance || 0) + actorCritBonus + affixBonuses.critChanceBonus;
        if (Math.random() < totalCritChance) {
          // Process ON_CRIT affixes for bonus crit damage
          let critMultiplier = 1.5 + (passiveBonuses.critDamageBonus || 0);
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

        addCombatLog({
          type: 'attack',
          actor: { name: actor.name, emoji: actor.emoji },
          target: { name: target.name, emoji: target.emoji },
          damage: dmg,
          isCrit,
        });

        // Add attack effect
        const isRogueDart = actor.isHero && actor.classId === 'rogue' && minDist > 1;
        if (isRogueDart) {
          addEffect({
            type: 'dart',
            from: actor.position,
            to: target.position,
            classId: actor.classId,
          });
        } else {
          addEffect({
            type: 'beam',
            from: actor.position,
            to: target.position,
            attackerClass: actor.isHero ? actor.classId : 'monster',
          });
        }

        // Use crit effect for critical hits
        if (isCrit) {
          addEffect({
            type: 'crit',
            position: target.position,
            damage: dmg,
          });
        } else {
          addEffect({
            type: 'damage',
            position: target.position,
            damage: dmg,
            isHeal: false,
          });
        }

        addEffect({
          type: 'impact',
          position: target.position,
          color: actor.isHero ? '#22c55e' : '#ef4444',
        });

        // Check for evasion buff
        const targetBuffs = newBuffs[target.id] || {};
        if (targetBuffs.evasion > 0) {
          addCombatLog({
            type: 'system',
            message: `${target.name} evades in smoke!`,
          });
        } else if (targetBuffs.blockNextHit) {
          // OPTIMIZATION: Mutate in place
          if (!newBuffs[target.id]) newBuffs[target.id] = { ...targetBuffs };
          newBuffs[target.id].blockNextHit = false;
          addCombatLog({
            type: 'system',
            message: `${target.name}'s shield blocks the attack!`,
          });
        } else {
          // Calculate dodge chance including skill-based bonuses
          let baseDodgeChance = calculateDodgeChance(target.stats.speed, actor.stats.speed);
          if (target.isHero) {
            const targetDefenderBonuses = applyPassiveEffects(target, 'on_defend', {});
            baseDodgeChance += targetDefenderBonuses.dodgeChance || 0;
          }
          const dodged = Math.random() < baseDodgeChance;

          if (dodged) {
            if (target.isHero) {
              incrementStat('totalDodges', 1, { heroId: target.id });
            }
            addCombatLog({
              type: 'system',
              message: `${target.name} dodged!`,
            });
          } else {
            if (target.isHero) {
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
                  { ...targetHeroData, stats: target.stats },
                  dmg,
                  actor
                );
                totalDamageReduction += onDamageTakenResult.damageReduction;
                reflectDamage = onDamageTakenResult.reflectDamage;

                // Apply skill-based damage reduction and reflect
                const skillOnDamageTaken = getOnDamageTakenEffects(target, dmg, actor);
                totalDamageReduction += skillOnDamageTaken.damageReduction;
                reflectDamage += skillOnDamageTaken.reflectDamage;
                shouldCounterAttack = skillOnDamageTaken.counterAttack;

                // Apply damageTakenMultiplier from passive affixes (e.g., of_the_titan)
                const passiveAffixBonuses = getPassiveAffixBonuses(targetHeroData);
                damageTakenMultiplier = passiveAffixBonuses.damageTakenMultiplier || 1;
              }

              // Apply damage taken multiplier first, then reduction
              const modifiedDmg = Math.floor(dmg * damageTakenMultiplier);
              let reducedDmg = Math.max(1, Math.floor(modifiedDmg * (1 - totalDamageReduction)));

              // Track damage mitigated by skills/abilities
              const skillMitigated = modifiedDmg - reducedDmg;
              if (skillMitigated > 0) {
                incrementStat('totalMitigated', skillMitigated, { heroId: target.id });
              }

              // Check for damage redirect (Knight Fortress - all damage redirected to tank)
              const damageRedirect = checkDamageRedirect(aliveHeroes, target, reducedDmg);
              if (damageRedirect) {
                const redirectIdx = findHeroIndex(damageRedirect.redirectHero.id);
                if (redirectIdx !== -1) {
                  newHeroes[redirectIdx].stats.hp = Math.max(0, newHeroes[redirectIdx].stats.hp - damageRedirect.redirectedDamage);
                  // Track redirected damage taken
                  damageTakenByHero[damageRedirect.redirectHero.id] = (damageTakenByHero[damageRedirect.redirectHero.id] || 0) + damageRedirect.redirectedDamage;
                  addCombatLog({ type: 'system', message: `${damageRedirect.skillName}! ${damageRedirect.redirectHero.name} intercepts ${damageRedirect.redirectedDamage} damage for ${target.name}!` });
                  addEffect({ type: 'beam', from: damageRedirect.redirectHero.position, to: target.position, attackerClass: 'knight' });
                  addEffect({ type: 'damage', position: damageRedirect.redirectHero.position, damage: damageRedirect.redirectedDamage });
                  reducedDmg = 0; // All damage redirected
                }
              }

              // Check for damage sharing (Spirit Link Totem)
              const partyAuras = getPartyAuraEffects(aliveHeroes);
              if (partyAuras.damageSharing && reducedDmg > 0) {
                const sharing = calculateDamageSharing(aliveHeroes, target, reducedDmg, partyAuras.damageSharingReduction);
                if (sharing) {
                  for (const heroId of sharing.affectedHeroes) {
                    const heroIdx = findHeroIndex(heroId);
                    if (heroIdx !== -1) {
                      newHeroes[heroIdx].stats.hp = Math.max(0, newHeroes[heroIdx].stats.hp - sharing.damagePerHero);
                      // Track shared damage taken
                      damageTakenByHero[heroId] = (damageTakenByHero[heroId] || 0) + sharing.damagePerHero;
                      if (heroId !== target.id) {
                        addEffect({ type: 'damage', position: newHeroes[heroIdx].position, damage: sharing.damagePerHero });
                      }
                    }
                  }
                  addCombatLog({ type: 'system', message: `Spirit Link! Damage shared among allies (${sharing.damagePerHero} each)` });
                  reducedDmg = 0; // Already distributed
                }
              }

              // Check for martyr intercept (another hero takes part of the damage)
              if (reducedDmg > 0) {
                const martyrIntercept = checkMartyrIntercept(aliveHeroes, target, reducedDmg);
                if (martyrIntercept && martyrIntercept.martyrHero.id !== target.id) {
                  const interceptedDmg = Math.floor(reducedDmg * martyrIntercept.interceptPercent);
                  reducedDmg = reducedDmg - interceptedDmg;

                  // Apply intercepted damage to martyr
                  const martyrIdx = findHeroIndex(martyrIntercept.martyrHero.id);
                  if (martyrIdx !== -1 && interceptedDmg > 0) {
                    newHeroes[martyrIdx].stats.hp = Math.max(0, newHeroes[martyrIdx].stats.hp - interceptedDmg);
                    // Track martyr intercepted damage taken
                    damageTakenByHero[martyrIntercept.martyrHero.id] = (damageTakenByHero[martyrIntercept.martyrHero.id] || 0) + interceptedDmg;
                    addCombatLog({ type: 'system', message: `${martyrIntercept.skillName}! ${martyrIntercept.martyrHero.name} absorbs ${interceptedDmg} damage for ${target.name}!` });
                    addEffect({ type: 'beam', from: martyrIntercept.martyrHero.position, to: target.position, attackerClass: 'cleric' });
                    addEffect({ type: 'damage', position: martyrIntercept.martyrHero.position, damage: interceptedDmg });
                  }
                }
              }

              // HP synced at end of tick via syncHeroHp
              const targetHeroIdx = findHeroIndex(target.id);
              if (targetHeroIdx !== -1 && reducedDmg > 0) {
                newHeroes[targetHeroIdx].stats.hp = Math.max(0, newHeroes[targetHeroIdx].stats.hp - reducedDmg);
                // Track damage taken per hero for stats
                damageTakenByHero[target.id] = (damageTakenByHero[target.id] || 0) + reducedDmg;
              }

              // Check for reactive taunt (Righteous Defense - chance to taunt attacker when ally hit)
              if (reducedDmg > 0) {
                const reactiveTaunt = checkReactiveTaunt(aliveHeroes, target.id);
                if (reactiveTaunt.triggered) {
                  if (!newBuffs[reactiveTaunt.heroId]) newBuffs[reactiveTaunt.heroId] = {};
                  newBuffs[reactiveTaunt.heroId].taunt = 2;
                  addCombatLog({ type: 'system', message: `${reactiveTaunt.skillName}! ${reactiveTaunt.heroName} taunts the attacker!` });
                  addEffect({ type: 'buffAura', position: newHeroes.find(h => h.id === reactiveTaunt.heroId)?.position, color: '#ef4444' });
                }

                // Check for living seed trigger (Druid Living Seed - heal when hit)
                const targetBuffs = newBuffs[target.id] || {};
                if (targetBuffs.livingSeed) {
                  const seedHeal = Math.floor(target.stats.maxHp * targetBuffs.livingSeed);
                  if (targetHeroIdx !== -1 && seedHeal > 0) {
                    const actualSeedHeal = Math.min(seedHeal, newHeroes[targetHeroIdx].stats.maxHp - newHeroes[targetHeroIdx].stats.hp);
                    if (actualSeedHeal > 0) {
                      newHeroes[targetHeroIdx].stats.hp += actualSeedHeal;
                      addEffect({ type: 'damage', position: target.position, damage: actualSeedHeal, isHeal: true });
                      addCombatLog({ type: 'system', message: `Living Seed! ${target.name} heals ${actualSeedHeal} HP` });
                      healingReceivedByHero[target.id] = (healingReceivedByHero[target.id] || 0) + actualSeedHeal;
                      // Track healing done by the caster
                      if (targetBuffs.livingSeedCaster) {
                        healingDoneByHero[targetBuffs.livingSeedCaster] = (healingDoneByHero[targetBuffs.livingSeedCaster] || 0) + actualSeedHeal;
                      }
                    }
                  }
                  // Remove the seed after triggering
                  delete newBuffs[target.id].livingSeed;
                  delete newBuffs[target.id].livingSeedCaster;
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
                const counterDmg = Math.max(1, Math.floor(target.stats.attack * 0.5));
                const actorMonsterIdx = findMonsterIndex(actor.id);
                if (actorMonsterIdx !== -1) {
                  newMonsters[actorMonsterIdx].stats.hp = Math.max(0, newMonsters[actorMonsterIdx].stats.hp - counterDmg);
                }
                addCombatLog({ type: 'system', message: `Counter! ${target.name} strikes back for ${counterDmg}!` });
                addEffect({ type: 'beam', from: target.position, to: actor.position, attackerClass: target.classId });
                addEffect({ type: 'damage', position: actor.position, damage: counterDmg });
              }

              // Check for death or phoenix revive (use local HP, not store)
              const targetNewHp = targetHeroIdx !== -1 ? newHeroes[targetHeroIdx].stats.hp : 0;
              if (targetNewHp <= 0) {
                // Check for resurrection scroll first
                const resScroll = hasResurrectionScroll();
                if (resScroll) {
                  const scroll = useResurrectionScroll();
                  const reviveHp = Math.floor(target.stats.maxHp * scroll.reviveHpPercent);
                  if (targetHeroIdx !== -1) {
                    newHeroes[targetHeroIdx].stats.hp = reviveHp;
                  }
                  addCombatLog({ type: 'system', message: `Resurrection Scroll! ${target.name} is restored with ${reviveHp} HP!` });
                  addEffect({ type: 'healBurst', position: target.position });
                } else {
                  // Check for phoenix revive (equipment affix)
                  const phoenixRevive = targetHeroData ? checkPhoenixRevive(targetHeroData, newUsedPhoenixRevives) : null;
                  if (phoenixRevive) {
                    const reviveHp = Math.floor(target.stats.maxHp * phoenixRevive.hpPercent);
                    // HP synced at end of tick via syncHeroHp
                    if (targetHeroIdx !== -1) {
                      newHeroes[targetHeroIdx].stats.hp = reviveHp;
                    }
                    newUsedPhoenixRevives[target.id] = true;
                    addCombatLog({ type: 'system', message: `Phoenix Feather! ${target.name} rises from the ashes with ${reviveHp} HP!` });
                    addEffect({ type: 'healBurst', position: target.position });
                  } else {
                    // Check for skill-based cheat death
                    const skillCheatDeath = checkCheatDeath(target, { cheatDeathUsed: new Set(Object.keys(newUsedPhoenixRevives)) });
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
                      addCombatLog({ type: 'death', target: { name: target.name }, isHero: true });
                      addEffect({
                        type: 'death',
                        position: target.position,
                        isHero: true,
                        classId: target.classId,
                      });
                      handleUnitDeath(target.id);

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
            } else {
              // Check for damage amplification debuff (Hunter's Mark)
              const targetDebuffs = newBuffs[target.id] || {};
              let finalDmg = dmg;
              if (targetDebuffs.damageAmp) {
                finalDmg = Math.floor(dmg * (1 + targetDebuffs.damageAmp));
              }

              // Check for weakness debuff (Curse of Weakness) - reduce attack damage
              // This affects the target's outgoing damage, not incoming, so skip here

              // OPTIMIZATION: Mutate in place
              const targetMonsterIdx = findMonsterIndex(target.id);
              const oldMonsterHp = targetMonsterIdx !== -1 ? newMonsters[targetMonsterIdx].stats.hp : 0;
              if (targetMonsterIdx !== -1) {
                newMonsters[targetMonsterIdx].stats.hp = Math.max(0, oldMonsterHp - finalDmg);
              }

              // Track damage dealt for damage_heals effect
              totalDamageDealtThisTurn += finalDmg;

              // Only count as killed if monster was alive and is now dead
              const newMonsterHp = targetMonsterIdx !== -1 ? newMonsters[targetMonsterIdx].stats.hp : 0;
              const targetKilled = oldMonsterHp > 0 && newMonsterHp <= 0;

              // Process ON_HIT affixes for heroes
              if (heroData) {
                const onHitResult = processOnHitAffixes(heroData, dmg, target, isCrit);

                // Apply affix-based lifesteal
                let totalLifesteal = onHitResult.lifestealAmount || 0;

                // Apply skill-based on-hit effects (lifesteal, etc.)
                const skillOnHitEffects = getOnHitEffects(actor, dmg);
                totalLifesteal += skillOnHitEffects.healAmount;

                // Apply total lifesteal
                if (totalLifesteal > 0) {
                  const actorHeroIdx = findHeroIndex(actor.id);
                  const currentHp = actorHeroIdx !== -1 ? newHeroes[actorHeroIdx].stats.hp : 0;
                  const maxHp = actorHeroIdx !== -1 ? newHeroes[actorHeroIdx].stats.maxHp : 0;
                  const healAmount = Math.min(totalLifesteal, maxHp - currentHp);
                  if (healAmount > 0 && actorHeroIdx !== -1) {
                    // HP synced at end of tick via syncHeroHp
                    newHeroes[actorHeroIdx].stats.hp = Math.min(maxHp, currentHp + healAmount);
                    addCombatLog({ type: 'system', message: `Lifesteal! ${actor.name} drains ${healAmount} HP` });
                    healingDoneByHero[actor.id] = (healingDoneByHero[actor.id] || 0) + healAmount;
                    healingReceivedByHero[actor.id] = (healingReceivedByHero[actor.id] || 0) + healAmount;
                  }
                }

                // Apply status effects from on-hit procs
                for (const statusToApply of onHitResult.statusesToApply) {
                  const mockTarget = { ...target, statusEffects: newStatusEffects[target.id] || [] };
                  const statusResult = applyStatusEffect(mockTarget, statusToApply.id, actor, {
                    duration: statusToApply.duration,
                    stacks: statusToApply.stacks,
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
                      // Track chain damage
                      totalDamageDealtThisTurn += chainDmg;
                    }
                    addCombatLog({ type: 'system', message: `Lightning chains to ${chainTarget.name} for ${chainDmg}!` });
                    addEffect({ type: 'beam', from: target.position, to: chainTarget.position, attackerClass: 'mage' });
                    addEffect({ type: 'damage', position: chainTarget.position, damage: chainDmg });
                  }
                }

                // Process ON_CRIT status effects (e.g., Savage - bleed on crit)
                if (isCrit) {
                  const critAffixResult = processOnCritAffixes(heroData, dmg, target);
                  for (const statusToApply of critAffixResult.statusesToApply) {
                    const mockTarget = { ...target, statusEffects: newStatusEffects[target.id] || [] };
                    const statusResult = applyStatusEffect(mockTarget, statusToApply.id, actor, {
                      duration: statusToApply.duration,
                      stacks: statusToApply.stacks,
                    });
                    newStatusEffects[target.id] = statusResult.effects;
                    const statusDef = STATUS_EFFECTS[statusToApply.id];
                    if (statusDef) {
                      addCombatLog({ type: 'system', message: `Critical hit causes ${statusDef.name.toLowerCase()}!` });
                    }
                  }
                }
              }

              if (targetKilled) {
                newKillBonusStacks[actor.id] = (newKillBonusStacks[actor.id] || 0) + 1;
              }

              if (targetKilled) {
                addCombatLog({ type: 'death', target: { name: target.name }, isHero: false });
                addEffect({
                  type: 'death',
                  position: target.position,
                  isHero: false,
                  monsterId: target.templateId,
                });
                handleUnitDeath(target.id);

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

                  // Process skill-based ON_KILL effects
                  const skillOnKillEffects = getOnKillEffects(actor);
                  if (skillOnKillEffects.healAmount > 0 || skillOnKillEffects.healPercent > 0) {
                    const actorHeroIdx = findHeroIndex(actor.id);
                    if (actorHeroIdx !== -1) {
                      const currentHp = newHeroes[actorHeroIdx].stats.hp;
                      const maxHp = newHeroes[actorHeroIdx].stats.maxHp;
                      const healAmount = skillOnKillEffects.healAmount + Math.floor(maxHp * skillOnKillEffects.healPercent);
                      const actualHeal = Math.min(healAmount, maxHp - currentHp);
                      if (actualHeal > 0) {
                        newHeroes[actorHeroIdx].stats.hp = Math.min(maxHp, currentHp + actualHeal);
                        addCombatLog({ type: 'system', message: `${actor.name} heals ${actualHeal} HP on kill!` });
                        addEffect({ type: 'damage', position: actor.position, damage: actualHeal, isHeal: true });
                        healingDoneByHero[actor.id] = (healingDoneByHero[actor.id] || 0) + actualHeal;
                        healingReceivedByHero[actor.id] = (healingReceivedByHero[actor.id] || 0) + actualHeal;
                      }
                    }
                  }

                  // Check for raise_dead - raise the killed monster as a temporary ally
                  const raiseDeadData = checkRaiseDead(actor);
                  if (raiseDeadData.canRaise) {
                    const raisedUndead = createRaisedUndead(target, raiseDeadData.duration, target.position);
                    newHeroes.push(raisedUndead);
                    // Add to turn order
                    newTurnOrder.push(raisedUndead.id);
                    addCombatLog({ type: 'system', message: `${raiseDeadData.skillName}! ${target.name} rises as an undead ally!` });
                    addEffect({ type: 'healBurst', position: target.position });
                  }
                }

                const baseGold = target.goldReward.min + Math.floor(Math.random() * (target.goldReward.max - target.goldReward.min));
                const gold = Math.floor(baseGold * goldMultiplier);
                addGold(gold);
                const xpPerHero = Math.floor((target.xpReward / heroes.length) * xpMultiplier);
                heroes.forEach(h => addXpToHero(h.id, xpPerHero));
                incrementStat('totalMonstersKilled', 1, { heroId: actor.id, monsterId: target.templateId, isBoss: target.isBoss });

                // Visual gold drop effect
                if (gold > 0) {
                  addEffect({
                    type: 'goldDrop',
                    position: target.position,
                    amount: gold,
                  });
                }

                if (Math.random() < (target.isBoss ? 0.9 : 0.25)) {
                  const item = generateEquipment(dungeon.level);
                  const result = processLootDrop(item);

                  // Visual loot drop effect
                  addEffect({
                    type: 'lootDrop',
                    position: target.position,
                    slot: item.slot,
                    rarityColor: item.rarityColor || '#9ca3af',
                  });

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

                // Chance to drop resurrection scroll (rare, boosted if party has dead member)
                const hasDeadPartyMember = newHeroes.some(h => h && h.stats.hp <= 0);
                const consumable = generateConsumableDrop(dungeon.level, hasDeadPartyMember);
                if (consumable && addConsumable(consumable)) {
                  addCombatLog({ type: 'system', message: `Found: ${consumable.name}!` });
                }
              }

              // Check for double attack - only if target survived the first hit
              const currentMonsterHp = targetMonsterIdx !== -1 ? newMonsters[targetMonsterIdx].stats.hp : 0;
              if (currentMonsterHp > 0) {
                // Include skill-based double attack bonus
                const baseDoubleChance = calculateDoubleAttackChance(actor.stats.speed, target.stats.speed);
                const skillDoubleBonus = passiveBonuses.doubleAttackChance || 0;
                const doubleChance = baseDoubleChance + skillDoubleBonus;
                if (Math.random() < doubleChance) {
                  const bonusDmg = Math.max(1, Math.floor(dmg * 0.6));
                  addCombatLog({
                    type: 'system',
                    message: `\u26A1 ${actor.name} strikes again! -${bonusDmg}`,
                  });

                  // Track HP before and after bonus damage
                  const hpBeforeBonus = currentMonsterHp;
                  if (targetMonsterIdx !== -1) {
                    newMonsters[targetMonsterIdx].stats.hp = Math.max(0, hpBeforeBonus - bonusDmg);
                    // Track bonus attack damage
                    totalDamageDealtThisTurn += bonusDmg;
                  }
                  const hpAfterBonus = targetMonsterIdx !== -1 ? newMonsters[targetMonsterIdx].stats.hp : 0;

                  addEffect({
                    type: 'damage',
                    position: target.position,
                    damage: bonusDmg,
                    isHeal: false,
                  });

                  // Only trigger death if bonus hit killed (was alive, now dead)
                  if (hpBeforeBonus > 0 && hpAfterBonus <= 0) {
                    addCombatLog({ type: 'death', target: { name: target.name }, isHero: false });
                    addEffect({ type: 'death', position: target.position, isHero: false, monsterId: target.templateId });
                    handleUnitDeath(target.id);
                    incrementStat('totalMonstersKilled', 1, { heroId: actor.id, monsterId: target.templateId, isBoss: target.isBoss });
                  }
                }
              }

              // Check for AOE attacks buff (Shaman Ascendance) - hit other enemies too
              const actorAoeBuff = newBuffs[actor.id] || {};
              if (actorAoeBuff.aoeAttacks && actor.isHero) {
                const otherEnemies = activeCombatMonsters.filter(m => m.id !== target.id && m.stats.hp > 0);
                for (const otherTarget of otherEnemies) {
                  const aoeDmg = Math.max(1, Math.floor(dmg * 0.8)); // 80% damage to other targets
                  const otherIdx = findMonsterIndex(otherTarget.id);
                  if (otherIdx !== -1) {
                    const oldHp = newMonsters[otherIdx].stats.hp;
                    newMonsters[otherIdx].stats.hp = Math.max(0, oldHp - aoeDmg);
                    const newHp = newMonsters[otherIdx].stats.hp;
                    // Track AOE cleave damage
                    totalDamageDealtThisTurn += aoeDmg;

                    addEffect({ type: 'beam', from: actor.position, to: otherTarget.position, attackerClass: actor.classId });
                    addEffect({ type: 'damage', position: otherTarget.position, damage: aoeDmg });

                    if (oldHp > 0 && newHp <= 0) {
                      addCombatLog({ type: 'death', target: { name: otherTarget.name }, isHero: false });
                      addEffect({ type: 'death', position: otherTarget.position, isHero: false, monsterId: otherTarget.templateId });
                      handleUnitDeath(otherTarget.id);
                      incrementStat('totalMonstersKilled', 1, { heroId: actor.id, monsterId: otherTarget.templateId, isBoss: otherTarget.isBoss });
                    }
                  }
                }
              }
            }
          }
        }
        } // End of if (!usedMonsterAbility)
      }
    } else {
      // MOVE toward target
      const moveDistance = calculateMoveDistance(actor.stats.speed);
      const allUnits = [...newHeroes, ...activeCombatMonsters].filter(u => u.id !== actor.id && u.stats.hp > 0);
      const occupied = allUnits.map(u => u.position);
      let currentOccupied = new Set(occupied.map(p => `${p.x},${p.y}`));

      const grid = mazeDungeon ? mazeDungeon.grid : null;
      if (!grid) {
        // OPTIMIZATION: Single batched update including turn advance
        const nextTurn = getNextTurnState(roomCombat, newHeroes, newMonsters);
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
          ...(nextTurn || {}),
        });
        syncHeroHp(buildHeroHpMap(newHeroes));
        return true;
      }

      const path = findPath(grid, actor.position, target.position, occupied);

      let newPosition = actor.position;
      let tilesMovedCount = 0;

      if (path && path.length > 1) {
        for (let i = 1; i < path.length && tilesMovedCount < moveDistance; i++) {
          const nextPos = path[i];
          const distToTarget = getDistance(nextPos, target.position);
          if (distToTarget === 0) break;
          if (distToTarget <= range) {
            newPosition = nextPos;
            tilesMovedCount++;
            break;
          }
          newPosition = nextPos;
          tilesMovedCount++;
        }
      } else {
        for (let step = 0; step < moveDistance; step++) {
          const dx = target.position.x - newPosition.x;
          const dy = target.position.y - newPosition.y;

          if (dx === 0 && dy === 0) break;

          const moves = [];
          if (dx !== 0) {
            moves.push({ x: newPosition.x + Math.sign(dx), y: newPosition.y });
          }
          if (dy !== 0) {
            moves.push({ x: newPosition.x, y: newPosition.y + Math.sign(dy) });
          }
          if (Math.abs(dy) > Math.abs(dx)) {
            moves.reverse();
          }

          let moved = false;
          for (const move of moves) {
            const key = `${move.x},${move.y}`;
            const walkable = isWalkable(grid, move.x, move.y);
            const distToTarget = getDistance(move, target.position);
            if (walkable && !currentOccupied.has(key) && distToTarget > 0) {
              newPosition = move;
              tilesMovedCount++;
              moved = true;
              break;
            }
          }
          if (!moved) break;
        }
      }

      if (tilesMovedCount > 0) {
        // OPTIMIZATION: Mutate in place
        if (actor.isHero) {
          const heroIdx = findHeroIndex(actor.id);
          if (heroIdx !== -1) {
            newHeroes[heroIdx].position = newPosition;
          }
        } else {
          const monsterIdx = findMonsterIndex(actor.id);
          if (monsterIdx !== -1) {
            newMonsters[monsterIdx].position = newPosition;
          }
        }
      }
    }

    // Apply deferred regen heal at end of turn
    if (regenHealAmount > 0 && regenHeroId) {
      // HP synced at end of tick via syncHeroHp
      const heroIdx = findHeroIndex(regenHeroId);
      if (heroIdx !== -1) {
        newHeroes[heroIdx].stats.hp = Math.min(newHeroes[heroIdx].stats.maxHp, newHeroes[heroIdx].stats.hp + regenHealAmount);
        healingReceivedByHero[regenHeroId] = (healingReceivedByHero[regenHeroId] || 0) + regenHealAmount;
      }
      addCombatLog({ type: 'system', message: `${regenHeroName} regenerates ${regenHealAmount} HP` });
      addEffect({ type: 'healBurst', position: regenHeroPosition });
    }

    // Apply damage_heals effect: heroes dealing damage heals the party
    if (totalDamageDealtThisTurn > 0 && actor.isHero) {
      const perTurnEffects = getPerTurnEffects(aliveHeroes);
      if (perTurnEffects.damageToHealingPercent > 0) {
        const partyHealAmount = Math.floor(totalDamageDealtThisTurn * perTurnEffects.damageToHealingPercent);
        if (partyHealAmount > 0) {
          for (let i = 0; i < newHeroes.length; i++) {
            const hero = newHeroes[i];
            if (hero.stats.hp > 0 && hero.stats.hp < hero.stats.maxHp) {
              const healPerHero = Math.floor(partyHealAmount / aliveHeroes.length);
              const actualHeal = Math.min(healPerHero, hero.stats.maxHp - hero.stats.hp);
              if (actualHeal > 0) {
                newHeroes[i].stats.hp += actualHeal;
                addEffect({ type: 'damage', position: hero.position, damage: actualHeal, isHeal: true });
                healingReceivedByHero[hero.id] = (healingReceivedByHero[hero.id] || 0) + actualHeal;
              }
            }
          }
          addCombatLog({ type: 'system', message: `${actor.name}'s damage heals the party for ${partyHealAmount}!` });
        }
      }
    }

    // Track combat stats (damage dealt only when actor is a hero to avoid duplicate counting)
    if (actor.isHero) {
      if (totalDamageDealtThisTurn > 0) {
        incrementStat('totalDamageDealt', totalDamageDealtThisTurn, { heroId: actor.id });
      }
    }
    // Track damage taken per hero
    for (const [heroId, damage] of Object.entries(damageTakenByHero)) {
      if (damage > 0) {
        incrementStat('totalDamageTaken', damage, { heroId });
      }
    }
    // Track healing done per hero
    for (const [heroId, healing] of Object.entries(healingDoneByHero)) {
      if (healing > 0) {
        incrementStat('totalHealingDone', healing, { heroId });
      }
    }
    // Track healing received per hero
    for (const [heroId, healing] of Object.entries(healingReceivedByHero)) {
      if (healing > 0) {
        incrementStat('totalHealingReceived', healing, { heroId });
      }
    }

    // OPTIMIZATION: Get next turn state to include in batch
    const nextTurnState = getNextTurnState(roomCombat, newHeroes, newMonsters);

    // Update viewport to keep combat units visible
    const newViewport = calculateCombatViewport(newHeroes, newMonsters);

    // OPTIMIZATION: Single batched state update at end of tick (includes turn advance)
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
      summonsSpawned,
      viewport: newViewport,
      ...(nextTurnState || {}),
    });

    // OPTIMIZATION: Batch sync all hero HPs to store in one call
    const heroHpSync = {};
    for (const hero of newHeroes) {
      heroHpSync[hero.id] = hero.stats.hp;
    }
    syncHeroHp(heroHpSync);

    return true;
  }, [getCurrentActor, getNextTurnState, updateRoomCombat, addCombatLog, addGold, addXpToHero, processLootDrop, incrementStat, syncHeroHp, addEffect]);

  return {
    getCurrentActor,
    advanceTurn,
    handleCombatTick,
    resetLastProcessedTurn,
  };
};
