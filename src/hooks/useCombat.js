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
  checkReactiveHeal,
  getHotBonuses,
  hasCCImmunity,
} from '../game/skillEngine';
import { generateEquipment, generateConsumableDrop, RARITY } from '../data/equipment';
import { createUniqueItemInstance, getUniqueItem } from '../data/uniqueItems';
import { ELITE_CONFIG } from '../data/monsters';
import {
  getWorldBossLoot,
  checkPhaseTransition,
  processPhaseStartActions,
  isBossImmune,
  isBossEnraged,
  setBossEnraged,
  getBossPhaseDamageBonus,
  getBossPhaseDamageReduction,
  getEnrageDamageBonus,
  initBossState,
  getBossState,
  resetBossStates,
} from '../game/bossEngine';
import { rollRaidDrop, getWingBoss } from '../data/raids';
import {
  resetUniqueStates,
  resetRoomUniqueStates,
  getHeroUniqueItems,
  getUniquePassiveBonuses,
  processOnHitUniques,
  processOnCritUniques,
  processOnKillUniques,
  processOnDamageTakenUniques,
  processOnCombatStartUniques,
  processOnRoomStartUniques,
  processOnDeathUniques,
  processOnLowHpUniques,
  getStealthBonusDamage,
  getRootedBonusDamage,
  getShieldBonusDamage,
  tickUniqueEffects,
  isHeroInvisible,
  getPartyUniqueBonuses,
  getHeroHealingReduction,
  isHeroImmuneToStatus,
  getUniqueStateSnapshot,
  getUniqueState,
  processOnPartyDamageUniques,
} from '../game/uniqueEngine';
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
    // Skip summons (pets, clones, undead) - they don't persist between dungeons
    if (h.isPet || h.isClone || h.isUndead) continue;
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
  const processLootDrop = useCallback((item) => useGameStore.getState().processLootDrop(item), []);
  const processUniqueDrop = useCallback((item) => useGameStore.getState().processUniqueDrop(item), []);

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
    const { roomCombat, heroes, heroHp, dungeon, dungeonProgress } = state;
    const homesteadBonuses = state.getHomesteadBonuses();

    if (!roomCombat || roomCombat.phase !== PHASES.COMBAT) return false;

    const { heroes: combatHeroes, monsters, combatMonsters, dungeon: mazeDungeon } = roomCombat;

    // OPTIMIZATION: Clone arrays using for loops instead of .map() to reduce callback overhead
    // Pre-allocate arrays for better performance
    const heroCount = combatHeroes.length;
    const monsterCount = monsters.length;
    const newHeroes = new Array(heroCount);
    const newMonsters = new Array(monsterCount);

    // Get current heroHp from store (handles resurrection scroll, etc. that may have synced HP)
    const storedHeroHp = useGameStore.getState().heroHp;

    for (let i = 0; i < heroCount; i++) {
      const h = combatHeroes[i];
      // Sync skills from store heroes (in case skills were unlocked mid-dungeon)
      const storeHero = heroes.find(sh => sh.id === h.id);
      const syncedSkills = storeHero?.skills || h.skills || [];
      // Use stored HP if available (handles resurrection scroll syncing HP before roomCombat update)
      const currentHp = storedHeroHp[h.id] !== undefined ? storedHeroHp[h.id] : h.stats.hp;
      newHeroes[i] = { ...h, stats: { ...h.stats, hp: currentHp }, skills: syncedSkills };
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
    const newReactiveHealUsed = { ...(roomCombat.reactiveHealUsed || {}) };
    let lastSummonRoomIndex = roomCombat.lastSummonRoomIndex ?? -1;

    // Find current room index based on party position
    let currentRoomIndex = -1;
    if (mazeDungeon && roomCombat.partyPosition) {
      const currentRoom = mazeDungeon.rooms.find(r =>
        roomCombat.partyPosition.x >= r.x && roomCombat.partyPosition.x < r.x + r.width &&
        roomCombat.partyPosition.y >= r.y && roomCombat.partyPosition.y < r.y + r.height
      );
      if (currentRoom) currentRoomIndex = currentRoom.index;
    }

    // Spawn pets/clones on first combat, or respawn dead ones when entering a NEW room
    const isNewRoom = currentRoomIndex !== lastSummonRoomIndex;
    if (isNewRoom && roomCombat.round <= 1 && roomCombat.currentTurnIndex === 0) {
      // First, respawn any dead pets/clones (if owner is alive)
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

            // Clear ghost debuff
            newBuffs[summon.id] = {};
            newStatusEffects[summon.id] = [];

            // Add back to turn order if not already there
            if (!newTurnOrder.includes(summon.id)) {
              newTurnOrder.push(summon.id);
            }

            addCombatLog({ type: 'system', message: `${summon.name} returns to battle!` });
            addEffect({ type: 'healBurst', position: respawnPosition });
          }
        }
      }

      // Then spawn NEW pets/clones for heroes that don't have one yet
      for (const hero of newHeroes) {
        if (hero.stats.hp <= 0) continue;

        const summonData = getSummonData(hero);
        for (const summon of summonData) {
          // Check if this hero already has a pet/clone
          const existingSummon = newHeroes.find(h =>
            h.ownerId === hero.id &&
            ((summon.type === 'pet' && h.isPet) || (summon.type === 'clone' && h.isClone))
          );
          if (existingSummon) continue; // Already has one, skip

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

      lastSummonRoomIndex = currentRoomIndex;
    }

    // OPTIMIZATION: O(1) lookup helpers using maps
    const findHeroIndex = (id) => heroIndexMap.get(id) ?? -1;
    const findMonsterIndex = (id) => monsterIndexMap.get(id) ?? -1;

    // Helper to handle unit death - clears buffs/debuffs and adds ghost status
    // Also handles death explosion affix for monsters
    const handleUnitDeath = (unitId, monster = null) => {
      // Check if this is an undead summon - they don't leave ghosts, just disappear
      const hero = newHeroes.find(h => h.id === unitId);
      const isUndeadSummon = hero?.isUndead;

      // Clear all buffs and status effects
      // Only add ghost debuff for real heroes and pets, not undead summons
      newBuffs[unitId] = isUndeadSummon ? {} : { ghost: true };
      newStatusEffects[unitId] = [];

      // Handle death explosion affix (Explosive dungeon affix or elite affix)
      // Support both number format (dungeon affix) and object format (elite affix)
      const explosionData = monster?.deathExplosion;
      const hasExplosion = explosionData && (
        typeof explosionData === 'number' ? explosionData > 0 : explosionData.damage > 0
      );
      if (monster && hasExplosion) {
        const explosionPercent = typeof explosionData === 'number' ? explosionData : explosionData.damage;
        const explosionDamage = Math.floor(monster.stats.maxHp * explosionPercent);
        const explosionRange = typeof explosionData === 'object' && explosionData.range ? explosionData.range : 3;

        // Damage nearby heroes
        for (const hero of newHeroes) {
          if (hero.stats.hp <= 0) continue;
          const dist = Math.abs(hero.position.x - monster.position.x) + Math.abs(hero.position.y - monster.position.y);
          if (dist <= explosionRange) {
            const heroIdx = findHeroIndex(hero.id);
            if (heroIdx !== -1) {
              newHeroes[heroIdx].stats.hp = Math.max(1, newHeroes[heroIdx].stats.hp - explosionDamage);
              addCombatLog({ type: 'system', message: `${monster.name} explodes! ${hero.name} takes ${explosionDamage} damage!` });
              addEffect({ type: 'damage', position: hero.position, damage: explosionDamage });
            }
          }
        }

        // Add explosion visual
        addEffect({ type: 'aoeGround', position: monster.position, color: '#ef4444' });
      }

      // Handle Bolstering affix - surviving monsters gain attack when ally dies
      if (monster && monster.onDeathAllyBuff) {
        const attackBonus = monster.onDeathAllyBuff.attack || 0;
        if (attackBonus > 0) {
          // Buff all surviving monsters
          for (let i = 0; i < newMonsters.length; i++) {
            const m = newMonsters[i];
            if (m.stats.hp > 0 && m.id !== monster.id) {
              const bonusAmount = Math.floor(m.stats.attack * attackBonus);
              newMonsters[i].stats.attack += bonusAmount;
              addCombatLog({ type: 'system', message: `${m.name} is emboldened! +${bonusAmount} attack` });
            }
          }
          addEffect({ type: 'buffAura', position: monster.position, color: '#f97316' });
        }
      }
    };

    // Helper to handle on_damage triggers for monsters (e.g., Enrage)
    const handleMonsterDamageTriggers = (monster, monsterIdx) => {
      if (!monster.abilities || monster.abilities.length === 0) return;

      for (const abilityId of monster.abilities) {
        const ability = MONSTER_ABILITIES[abilityId];
        if (!ability || ability.trigger !== 'on_damage') continue;

        // Apply the ability effect
        if (ability.effect?.attackBonus) {
          const bonusAmount = Math.floor(newMonsters[monsterIdx].stats.attack * ability.effect.attackBonus);
          newMonsters[monsterIdx].stats.attack += bonusAmount;
          addCombatLog({ type: 'system', message: `${monster.name} enrages! +${bonusAmount} attack` });
          addEffect({ type: 'buffAura', position: monster.position, color: '#ef4444' });
        }
      }
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

    // Crown of Command party-wide bonus (+10% all stats from any hero with Crown)
    const crownBonus = getPartyUniqueBonuses(heroes);
    const crownMultiplier = crownBonus.statMultiplier;

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
            let healAmount = Math.floor(hero.stats.maxHp * perTurnEffects.partyRegenPercent);
            const regenHealReduction = getHeroHealingReduction(heroes.find(hr => hr.id === hero.id) || {});
            if (regenHealReduction > 0) healAmount = Math.floor(healAmount * (1 - regenHealReduction));
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
          let affixRegenAmount = turnStartResult.healAmount;
          const affixRegenReduction = getHeroHealingReduction(heroData);
          if (affixRegenReduction > 0) affixRegenAmount = Math.floor(affixRegenAmount * (1 - affixRegenReduction));
          regenHealAmount = Math.min(affixRegenAmount, actor.stats.maxHp - actor.stats.hp);
          regenHeroId = actor.id;
          regenHeroPosition = actor.position;
          regenHeroName = actor.name;
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
            healingReceivedByHero[actor.id] = (healingReceivedByHero[actor.id] || 0) + actualHeal;
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
        // This is handled by not calling getNextTurnState for this actor
      }
    }

    // Tick unique item effects at start of turn (Cloak of Nothing invisibility countdown)
    if (actor.isHero) {
      tickUniqueEffects(actor);
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
            handleUnitDeath(actor.id, actor);

            // Track raid boss defeat from DOT damage
            if (actor.wingBossId) {
              const { defeatWingBoss } = useGameStore.getState();
              defeatWingBoss(actor.wingBossId);
              addCombatLog({ type: 'system', message: `Wing Boss defeated: ${actor.name}!` });
            }
            if (actor.finalBossId) {
              const { defeatWingBoss, completeRaid } = useGameStore.getState();
              defeatWingBoss(actor.finalBossId);
              addCombatLog({ type: 'system', message: `FINAL BOSS DEFEATED: ${actor.name}! Raid Complete!` });
              setTimeout(() => completeRaid(), 2000);
            }

            // Handle raid boss drops from DOT death
            const isRaidDungeonDot = dungeonProgress?.currentType === 'raid';
            if (isRaidDungeonDot && actor.isBoss) {
              const targetBossIdDot = actor.wingBossId || actor.finalBossId;
              const raidBossDot = getWingBoss(dungeonProgress.currentRaidId, targetBossIdDot);
              const ownedUniquesDot = useGameStore.getState().ownedUniques || [];
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
        // HP synced at end of tick via syncHeroHp
        // OPTIMIZATION: Mutate in place instead of creating new array
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
      // Filter out invisible heroes from monster targeting (Cloak of Nothing)
      const visibleHeroes = aliveHeroes.filter(h => !isHeroInvisible(h));
      const targetableHeroes = visibleHeroes.length > 0 ? visibleHeroes : aliveHeroes;

      const tauntingHero = targetableHeroes.find(h => newBuffs[h.id]?.taunt > 0);
      if (tauntingHero) {
        target = tauntingHero;
        minDist = getDistance(actor.position, target.position);
      } else {
        for (const e of targetableHeroes) {
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
          // Track first skill use for Arcane Surge (first_skill_bonus)
          const isFirstSkill = !newBuffs[actor.id]?.usedFirstSkill;
          if (isFirstSkill) {
            if (!newBuffs[actor.id]) newBuffs[actor.id] = {};
            newBuffs[actor.id].usedFirstSkill = true;
          }

          // Execute the skill
          const { results, logs } = executeSkillAbility(
            actor,
            skill,
            activeCombatMonsters,
            aliveHeroes,
            heroHp,
            addEffect,
            newBuffs
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

                // Trigger on_damage abilities (Enrage) if monster survived
                if (newHp > 0) {
                  handleMonsterDamageTriggers(m, monsterIdx);
                }

                // Apply monster reflectDamage passive (Thorny affix) - reflects damage back to attacker
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
                  handleUnitDeath(m.id, m);

                  // Track raid boss defeat from skill damage
                  if (m.wingBossId) {
                    const { defeatWingBoss } = useGameStore.getState();
                    defeatWingBoss(m.wingBossId);
                    addCombatLog({ type: 'system', message: `Wing Boss defeated: ${m.name}!` });
                  }
                  if (m.finalBossId) {
                    const { defeatWingBoss, completeRaid } = useGameStore.getState();
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

                  // Award XP with bonus for underleveled heroes (10% per level below dungeon)
                  const baseXpPerHero = Math.floor((m.xpReward / heroes.length) * xpMultiplier);
                  heroes.forEach(h => {
                    const levelDiff = dungeon.level - h.level;
                    const catchUpBonus = levelDiff > 0 ? 1 + (levelDiff * 0.10) : 1;
                    const xpForHero = Math.floor(baseXpPerHero * catchUpBonus);
                    addXpToHero(h.id, xpForHero);
                  });
                  incrementStat('totalMonstersKilled', 1, { heroId: actor.ownerId || actor.id, monsterId: m.templateId, isBoss: m.isBoss });

                  // Visual gold drop effect
                  if (gold > 0) {
                    addEffect({
                      type: 'goldDrop',
                      position: m.position,
                      amount: gold,
                    });
                  }

                  newKillBonusStacks[actor.id] = (newKillBonusStacks[actor.id] || 0) + 1;

                  // Handle unique drops from world bosses
                  if (m.isWorldBoss && m.uniqueDrop) {
                    const ownedUniques = useGameStore.getState().ownedUniques || [];
                    if (!ownedUniques.includes(m.uniqueDrop)) {
                      handleUniqueDrop(m.uniqueDrop, m.position);
                    }
                  }

                  // Handle raid boss drops
                  const isRaidDungeon = dungeonProgress?.currentType === 'raid';
                  if (isRaidDungeon && m.isBoss) {
                    const targetBossId = m.wingBossId || m.finalBossId;
                    const raidBoss = getWingBoss(dungeonProgress.currentRaidId, targetBossId);
                    const ownedUniques = useGameStore.getState().ownedUniques || [];
                    const raidDrop = rollRaidDrop(raidBoss?.dropTable, ownedUniques);

                    if (raidDrop?.type === 'unique') {
                      handleUniqueDrop(raidDrop.itemId, m.position);
                    } else if (raidDrop) {
                      // Random gear drop with guaranteed rarity from raid
                      const item = generateEquipment(dungeon.level, { guaranteedRarity: raidDrop.rarity || 'epic' });
                      const lootResult = processLootDrop(item);

                      addEffect({
                        type: 'lootDrop',
                        position: m.position,
                        slot: item.slot,
                        rarityColor: item.rarityColor || '#9ca3af',
                      });

                      if (lootResult.action === 'sold') {
                        addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${lootResult.gold}g)` });
                      } else if (lootResult.action === 'looted') {
                        addCombatLog({ type: 'system', message: `Loot: ${item.name}` });
                      }
                    }
                  }

                  // Calculate drop chance and minimum rarity (skip for raid bosses - they use drop tables)
                  const skipNormalDrop = isRaidDungeon && m.isBoss;
                  let dropChance = skipNormalDrop ? 0 : (m.isBoss ? 0.95 : 0.25);
                  let minRarity = null;

                  // Elite mobs have guaranteed rare+ drops
                  if (m.isElite) {
                    dropChance = 1.0;
                    minRarity = ELITE_CONFIG.guaranteedMinRarity;
                  }

                  // World bosses have guaranteed drops at their tier
                  if (m.isWorldBoss) {
                    dropChance = 1.0;
                    minRarity = m.guaranteedRarity || 'epic';
                  }

                  if (Math.random() < dropChance) {
                    const item = generateEquipment(dungeon.level, { guaranteedRarity: minRarity });
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

                  // Chance to drop resurrection scroll (rare, boosted if party has dead member, higher in raids)
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
              // Handle selfDamage - caster takes damage (e.g., Death Coil HP cost)
              const heroIdx = findHeroIndex(result.targetId);
              if (heroIdx !== -1) {
                newHeroes[heroIdx].stats.hp = Math.max(1, newHeroes[heroIdx].stats.hp - result.damage);
              }
            } else if (result.type === 'raiseEnemy') {
              // Handle Raise Dead active skill - raise strongest dead enemy
              const deadMonsters = newMonsters.filter(m => m.stats.hp <= 0 && !m.preventResurrection);
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
                const statusResult = applyStatusEffect(mockTarget, 'stun', actor, { duration: debuff.duration });
                newStatusEffects[result.targetId] = statusResult.effects;
              }
            } else if (result.type === 'heal') {
              const heroIdx = findHeroIndex(result.targetId);
              if (heroIdx !== -1) {
                const h = newHeroes[heroIdx];
                // Vampire's Embrace: reduce non-lifesteal healing
                const targetHealReduction = getHeroHealingReduction(heroes.find(hr => hr.id === result.targetId) || {});
                // Lich Form: additional healing reduction from skill buffs
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
                // Check for hot_stacking (Druid Overgrowth - HoTs can stack)
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
                      // Add bonus dodge for pets
                      if (targetHero.bonusDodge) {
                        abilityDodgeChance += targetHero.bonusDodge;
                      }

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
                    // Dragonscale Mantle: check status immunity for heroes
                    if (actionResult.isHero) {
                      const immuneHeroData = heroes.find(h => h.id === actionResult.targetId);
                      if (immuneHeroData && isHeroImmuneToStatus(immuneHeroData, actionResult.status.id)) {
                        addCombatLog({ type: 'system', message: `${statusTarget.name} is immune! (Dragon's Resilience)` });
                        addEffect({ type: 'status', position: statusTarget.position || target.position, status: 'buff' });
                        break;
                      }
                      // Check for CC immunity (Warrior Unstoppable, Knight Stand Firm)
                      if (hasCCImmunity(statusTarget, actionResult.status.id)) {
                        addCombatLog({ type: 'system', message: `${statusTarget.name} is immune to ${actionResult.status.id}!` });
                        break;
                      }
                    }

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
                    const actualHeal = Math.min(actionResult.amount, healTarget.stats.maxHp - healTarget.stats.hp);
                    // OPTIMIZATION: Mutate in place
                    healTarget.stats.hp = Math.min(healTarget.stats.maxHp, healTarget.stats.hp + actionResult.amount);
                    addCombatLog({
                      type: 'heal',
                      actor: { name: actor.name, emoji: actor.emoji },
                      target: { name: healTarget.name, emoji: healTarget.emoji },
                      skill: { name: ability.name },
                      amount: actualHeal,
                    });
                    // Add visual effect for monster lifesteal/heal
                    if (actualHeal > 0) {
                      addEffect({ type: 'damage', position: healTarget.position, damage: actualHeal, isHeal: true });
                      addEffect({ type: 'healBurst', position: healTarget.position });
                    }
                  }
                  break;
                }

                case 'summon': {
                  // Create summoned monsters
                  let summonType = actionResult.summonType || actor.summonType;
                  const summonCount = actionResult.summonCount || 1;

                  if (summonType) {
                    // Handle 'tier_1_random' - pick a random tier 1 monster
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

        // Check for boss phase damage bonuses
        let bossDamageMultiplier = 1;
        if (!actor.isHero && (actor.isBoss || actor.isWorldBoss) && actor.phases) {
          const phaseDamageBonus = getBossPhaseDamageBonus(actor);
          const enrageDamageBonus = getEnrageDamageBonus(actor);
          bossDamageMultiplier = 1 + phaseDamageBonus + enrageDamageBonus;
        }

        // Stealth bonus damage (Cloak of Nothing - +200% from stealth)
        let stealthMultiplier = 1;
        if (actor.isHero && heroData) {
          const stealthBonus = getStealthBonusDamage({ ...heroData, stats: actor.stats });
          if (stealthBonus > 0) {
            stealthMultiplier = 1 + stealthBonus;
            addCombatLog({ type: 'system', message: `Cloak of Nothing! ${actor.name} strikes from the shadows for ${Math.round(stealthBonus * 100)}% bonus damage!` });
          }
        }

        // Rooted target bonus damage (Kraken's Grasp - 3x vs rooted)
        let rootedMultiplier = 1;
        if (actor.isHero && heroData) {
          const targetEffects = newStatusEffects[target.id] || [];
          rootedMultiplier = getRootedBonusDamage({ ...heroData, stats: actor.stats }, { ...target, statusEffects: targetEffects });
          if (rootedMultiplier > 1) {
            addCombatLog({ type: 'system', message: `Kraken's Grasp! ${actor.name} deals ${rootedMultiplier}x damage to rooted ${target.name}!` });
          }
        }

        // Shield bonus damage (Ancient Bark - +15% while shielded)
        let shieldBonusMultiplier = 1;
        if (actor.isHero && heroData) {
          const heroShield = newBuffs[actor.id]?.shield || 0;
          if (heroShield > 0) {
            shieldBonusMultiplier = getShieldBonusDamage({ ...heroData, shield: heroShield, stats: actor.stats });
          }
        }

        // Crown of Command: +10% attack for heroes, +10% defense when hero is targeted
        const crownAttackBonus = actor.isHero ? crownMultiplier : 1;
        const crownDefenseBonus = target.isHero ? crownMultiplier : 1;
        let baseDmg = Math.max(1, Math.floor(
          (actor.stats.attack * actorDamageBonus * crownAttackBonus + (passiveBonuses.attackBonus || 0) + (uniqueBonuses.attackBonus || 0) - target.stats.defense * crownDefenseBonus * (1 - (uniqueBonuses.armorPenetration || 0)) * targetDefenseBonus * 0.5) * (0.85 + Math.random() * 0.3)
        ));

        // Apply unique damageReduction as self-nerf (Leviathan's Heart -25% damage)
        const uniqueDamageReductionMultiplier = 1 - (uniqueBonuses.damageReduction || 0);
        let dmg = Math.floor(baseDmg * passiveBonuses.damageMultiplier * uniqueBonuses.damageMultiplier * uniqueDamageReductionMultiplier * executeMultiplier * berserkerMultiplier * vengeanceMultiplier * tauntPartyMultiplier * buffDamageMultiplier * weaknessMultiplier * bossDamageMultiplier * stealthMultiplier * rootedMultiplier * shieldBonusMultiplier);
        let isCrit = false;

        // Base crit chance: 5% for tanks/healers, 10% for DPS classes
        const dpsClasses = ['mage', 'ranger', 'rogue', 'necromancer', 'bard'];
        const baseCritChance = actor.isHero && dpsClasses.includes(actor.classId) ? 0.10 : 0.05;

        // Total crit chance includes base, skill passives, permanent bonuses, affix bonuses, and unique item bonuses
        const totalCritChance = baseCritChance + (passiveBonuses.critChance || 0) + actorCritBonus + affixBonuses.critChanceBonus + (uniqueBonuses.critChance || 0);
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
          // Apply unique speed multiplier (Eye of the Storm) to effective speed
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
          if (actor.isHero && heroData) {
            attackerEffectiveSpeed = Math.floor(actor.stats.speed * (uniqueBonuses.speedMultiplier || 1));
          }
          let baseDodgeChance = calculateDodgeChance(defenderEffectiveSpeed, attackerEffectiveSpeed);
          if (target.isHero) {
            const targetDefenderBonuses = applyPassiveEffects(target, 'on_defend', {});
            baseDodgeChance += targetDefenderBonuses.dodgeChance || 0;
          }
          // Add bonus dodge for pets (they're nimble)
          if (target.bonusDodge) {
            baseDodgeChance += target.bonusDodge;
          }
          // Add unique item dodge bonuses (Eye of the Storm accuracy reduction, Reality Shard miss chance)
          baseDodgeChance += targetUniqueAccuracyReduction + targetUniqueMissChance;
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

                // Process unique item ON_DAMAGE_TAKEN effects (Phantom Cloak phase, Thunder Guard reflect)
                const uniqueOnDamageTakenResult = processOnDamageTakenUniques(
                  { ...targetHeroData, stats: target.stats },
                  actor,
                  dmg,
                  {}
                );

                // Check if damage was phased through (Phantom Cloak)
                if (uniqueOnDamageTakenResult.phased) {
                  totalDamageReduction = 1.0; // 100% reduction - phased through
                  addCombatLog({ type: 'system', message: `${target.name} phases through the attack!` });
                  addEffect({ type: 'status', position: target.position, status: 'phase' });
                }

                // Add unique reflect damage (Thunder Guard)
                if (uniqueOnDamageTakenResult.reflectDamage > 0) {
                  reflectDamage += uniqueOnDamageTakenResult.reflectDamage;
                  addEffect({ type: 'beam', from: target.position, to: actor.position, attackerClass: 'knight' });
                  addEffect({ type: 'damage', position: actor.position, damage: Math.floor(uniqueOnDamageTakenResult.reflectDamage) });
                }

                // Block damage from unique effects
                if (uniqueOnDamageTakenResult.damageBlocked > 0 && !uniqueOnDamageTakenResult.phased) {
                  totalDamageReduction += uniqueOnDamageTakenResult.damageBlocked / dmg;
                }
              }

              // Apply damage taken multiplier first, then reduction
              const modifiedDmg = Math.floor(dmg * damageTakenMultiplier);
              let reducedDmg = Math.max(1, Math.floor(modifiedDmg * (1 - totalDamageReduction)));

              // Track damage mitigated by skills/abilities
              const skillMitigated = modifiedDmg - reducedDmg;
              if (skillMitigated > 0) {
                incrementStat('totalMitigated', skillMitigated, { heroId: target.id });
              }

              // Hero shield absorption (Ancient Bark unique item)
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

                // Check for low HP unique triggers (Crown of the Fallen vengeance)
                if (target.isHero && targetHeroData) {
                  const currentHpAfterDmg = newHeroes[targetHeroIdx].stats.hp;
                  const targetMaxHp = newHeroes[targetHeroIdx].stats.maxHp;
                  if (currentHpAfterDmg > 0) {
                    const lowHpResult = processOnLowHpUniques(
                      { ...targetHeroData, stats: target.stats },
                      currentHpAfterDmg,
                      targetMaxHp,
                      {}
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
                  let seedHeal = Math.floor(target.stats.maxHp * targetBuffs.livingSeed);
                  const seedHealReduction = targetHeroData ? getHeroHealingReduction(targetHeroData) : 0;
                  if (seedHealReduction > 0) seedHeal = Math.floor(seedHeal * (1 - seedHealReduction));
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

                // Check reactive heals after hero takes damage (Warrior Second Wind, Cleric Guardian Angel)
                if (targetHeroIdx !== -1 && newHeroes[targetHeroIdx].stats.hp > 0) {
                  for (const healer of aliveHeroes) {
                    if (healer.stats.hp <= 0) continue;
                    const healerHeroIdx = findHeroIndex(healer.id);
                    if (healerHeroIdx === -1) continue;
                    const reactiveResult = checkReactiveHeal(newHeroes[healerHeroIdx], newHeroes[targetHeroIdx]);
                    if (reactiveResult.triggered) {
                      if (reactiveResult.selfOnly && healer.id !== target.id) continue;
                      if (reactiveResult.preventDeath) continue; // save_ally handled in death check
                      const healAmount = Math.floor(newHeroes[targetHeroIdx].stats.maxHp * reactiveResult.healPercent);
                      const actualHeal = Math.min(healAmount, newHeroes[targetHeroIdx].stats.maxHp - newHeroes[targetHeroIdx].stats.hp);
                      if (actualHeal > 0) {
                        newHeroes[targetHeroIdx].stats.hp += actualHeal;
                        addCombatLog({ type: 'system', message: `${reactiveResult.skillName}! ${newHeroes[targetHeroIdx].name} heals ${actualHeal} HP` });
                        addEffect({ type: 'damage', position: target.position, damage: actualHeal, isHeal: true });
                        healingDoneByHero[healer.id] = (healingDoneByHero[healer.id] || 0) + actualHeal;
                        healingReceivedByHero[target.id] = (healingReceivedByHero[target.id] || 0) + actualHeal;
                      }
                      break; // Only one reactive heal per damage instance
                    }
                  }
                }

                // Apply onHitStatus from monster (Venomous, Burning, Chilling, Cursing affixes)
                if (!actor.isHero && actor.onHitStatus) {
                  const statusToApply = actor.onHitStatus;
                  // Check for CC immunity (Warrior Unstoppable, Knight Stand Firm)
                  if (hasCCImmunity(target, statusToApply.id)) {
                    addCombatLog({ type: 'system', message: `${target.name} is immune to ${statusToApply.id}!` });
                  } else {
                    if (!newStatusEffects[target.id]) newStatusEffects[target.id] = [];
                    const existingStatus = newStatusEffects[target.id].find(s => s.id === statusToApply.id);
                    if (existingStatus) {
                      existingStatus.duration = Math.max(existingStatus.duration, statusToApply.duration);
                    } else {
                      newStatusEffects[target.id].push({
                        ...statusToApply,
                        appliedBy: actor.id,
                      });
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
                // Check for save_ally (Paladin Divine Intervention) before other death saves
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
                    healingDoneByHero[healer.id] = (healingDoneByHero[healer.id] || 0) + healAmount;
                    healingReceivedByHero[target.id] = (healingReceivedByHero[target.id] || 0) + healAmount;
                    savedByAlly = true;
                    break;
                  }
                }
                if (!savedByAlly) {
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
                      // Check for unique item cheat death (Void Heart, Void God's Crown)
                      const uniqueCheatDeath = processOnDeathUniques(
                        { ...targetHeroData, stats: target.stats },
                        {}
                      );
                      if (uniqueCheatDeath.preventDeath) {
                        const reviveHp = uniqueCheatDeath.healAmount || 1;
                        if (targetHeroIdx !== -1) {
                          newHeroes[targetHeroIdx].stats.hp = Math.min(reviveHp, target.stats.maxHp);
                        }
                        addCombatLog({ type: 'system', message: `Unique power saves ${target.name}! Restored to ${reviveHp} HP!` });
                        addEffect({ type: 'healBurst', position: target.position });

                        // Apply invulnerability if granted
                        if (uniqueCheatDeath.invulnerableTurns > 0) {
                          if (!newBuffs[target.id]) newBuffs[target.id] = {};
                          newBuffs[target.id].invulnerable = uniqueCheatDeath.invulnerableTurns;
                          addCombatLog({ type: 'system', message: `${target.name} becomes invulnerable for ${uniqueCheatDeath.invulnerableTurns} turns!` });
                        }
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
                } // end if (!savedByAlly)
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

              // Check boss immunity and damage reduction before applying damage
              let actualDmg = finalDmg;
              if ((target.isBoss || target.isWorldBoss) && target.phases) {
                const bossState = getBossState(target.id);
                if (bossState && isBossImmune(target, roomCombat.turn || 0)) {
                  actualDmg = 0;
                  addCombatLog({ type: 'system', message: `${target.name} is immune to damage!` });
                } else {
                  // Apply boss phase damage reduction
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

                  // Pause combat for dramatic effect (2.5 seconds, matches animation duration)
                  useGameStore.getState().pauseCombat(2500);

                  // Dramatic phase transition canvas effect
                  addEffect({
                    type: 'phaseTransition',
                    position: target.position,
                    message: phaseResult.message,
                    bossName: target.name,
                    enraged: phaseResult.enraged || false,
                    passive: phaseResult.newPhase?.passive || null,
                  });

                  // Set enraged if phase triggers enrage
                  if (phaseResult.enraged) {
                    setBossEnraged(target, true);
                    addCombatLog({ type: 'system', message: `${target.name} becomes ENRAGED!` });
                  }

                  // Process phase start actions (summon adds, immunity)
                  if (phaseResult.onPhaseStart) {
                    const phaseActions = processPhaseStartActions(target, phaseResult.onPhaseStart, {
                      scaleFactor: dungeon.level * 0.5,
                      currentTurn: roomCombat.turn || 0,
                    });

                    // Add summoned monsters to the fight
                    if (phaseActions.summonedMonsters.length > 0) {
                      for (const add of phaseActions.summonedMonsters) {
                        newMonsters.push(add);
                        newTurnOrder.push(add.id);
                        addCombatLog({ type: 'system', message: `${target.name} summons ${add.name}!` });
                        addEffect({ type: 'healBurst', position: add.position });
                      }
                    }

                    // Apply immunity
                    if (phaseActions.immunityGranted) {
                      addCombatLog({ type: 'system', message: phaseActions.immunityMessage });
                    }
                  }
                }
              }

              // Trigger on_damage abilities (Enrage) if monster survived
              if (currentMonsterHpAfterDmg > 0 && targetMonsterIdx !== -1) {
                handleMonsterDamageTriggers(newMonsters[targetMonsterIdx], targetMonsterIdx);
              }

              // Apply monster reflectDamage passive (Thorny affix) - reflects damage back to attacker
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

              // Track damage dealt for damage_heals effect
              totalDamageDealtThisTurn += finalDmg;

              // Apply hpCostPerAttack (Life Tap passive) - costs HP to deal bonus damage
              if (actor.isHero && passiveBonuses.hpCostPerAttack > 0) {
                const actorHeroIdx = findHeroIndex(actor.id);
                if (actorHeroIdx !== -1) {
                  const hpCost = Math.floor(actor.stats.maxHp * (passiveBonuses.hpCostPerAttack / 100));
                  // Don't let it kill the attacker - minimum 1 HP
                  const actualCost = Math.min(hpCost, newHeroes[actorHeroIdx].stats.hp - 1);
                  if (actualCost > 0) {
                    newHeroes[actorHeroIdx].stats.hp -= actualCost;
                    addCombatLog({ type: 'system', message: `Life Tap! ${actor.name} sacrifices ${actualCost} HP` });
                  }
                }
              }

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

                // Process unique item ON_HIT effects
                const otherEnemies = activeCombatMonsters.filter(m => m.id !== target.id && m.stats.hp > 0);
                const uniqueOnHitResult = processOnHitUniques(
                  { ...heroData, stats: actor.stats },
                  target,
                  dmg,
                  { otherEnemies }
                );

                // Apply unique lifesteal (from Vampire's Embrace, etc.)
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
                        healingDoneByHero[actor.id] = (healingDoneByHero[actor.id] || 0) + healAmount;
                        healingReceivedByHero[actor.id] = (healingReceivedByHero[actor.id] || 0) + healAmount;
                      }
                    }
                  }
                }

                // Apply unique bonus damage
                if (uniqueOnHitResult.bonusDamage > 0 && targetMonsterIdx !== -1) {
                  const bonusDmg = Math.floor(uniqueOnHitResult.bonusDamage);
                  newMonsters[targetMonsterIdx].stats.hp = Math.max(0, newMonsters[targetMonsterIdx].stats.hp - bonusDmg);
                  totalDamageDealtThisTurn += bonusDmg;
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

                // Apply Blood Pendant party lifesteal (heal wielder when any party member deals damage)
                if (totalDamageDealtThisTurn > 0) {
                  for (const hero of heroes) {
                    if (hero.id === actor.id) continue; // Skip attacker - they have their own healing
                    const partyDmgResult = processOnPartyDamageUniques(hero, totalDamageDealtThisTurn, {});
                    if (partyDmgResult.healing > 0) {
                      const heroIdx = findHeroIndex(hero.id);
                      if (heroIdx !== -1) {
                        const currentHp = newHeroes[heroIdx].stats.hp;
                        const maxHp = newHeroes[heroIdx].stats.maxHp;
                        const healAmount = Math.min(Math.floor(partyDmgResult.healing), maxHp - currentHp);
                        if (healAmount > 0) {
                          newHeroes[heroIdx].stats.hp = Math.min(maxHp, currentHp + healAmount);
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
                      totalDamageDealtThisTurn += chainDmg;
                      addCombatLog({ type: 'system', message: `Chain lightning hits ${chainTarget.name} for ${chainDmg}!` });
                      addEffect({ type: 'beam', from: target.position, to: chainTarget.position, attackerClass: 'mage' });
                      addEffect({ type: 'damage', position: chainTarget.position, damage: chainDmg });
                    }
                  }
                }

                // Apply status effects from unique on-hit (Magma Core burn, Stormcaller's Rod shock, Flamebreaker burn)
                if (uniqueOnHitResult.statusToApply.length > 0) {
                  for (const statusEntry of uniqueOnHitResult.statusToApply) {
                    // Skip chain target entries (they have a .target property) — only apply to primary target
                    if (statusEntry.target) continue;
                    const mockTarget = { ...target, statusEffects: newStatusEffects[target.id] || [] };
                    const statusResult = applyStatusEffect(mockTarget, statusEntry.id, actor, {
                      duration: statusEntry.duration,
                    });
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

                // Apply freeze-all-enemies from unique on-hit (Staff of Eternal Frost)
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

                  // Process unique item ON_CRIT effects (e.g., Serpent's Fang chain strikes)
                  const uniqueCritResult = processOnCritUniques(
                    { ...heroData, stats: actor.stats },
                    target,
                    dmg,
                    {}
                  );

                  // Apply chain attack (Serpent's Fang - 50% chance to strike again, can chain infinitely)
                  if (uniqueCritResult.chainAttack && targetMonsterIdx !== -1) {
                    let currentChainDmg = Math.floor(uniqueCritResult.chainAttack.damage);
                    let chainCount = 0;
                    const maxChains = 10; // Safety cap
                    const canChainInfinite = uniqueCritResult.chainAttack.canChain;

                    while (currentChainDmg > 0 && newMonsters[targetMonsterIdx].stats.hp > 0 && chainCount < maxChains) {
                      newMonsters[targetMonsterIdx].stats.hp = Math.max(0, newMonsters[targetMonsterIdx].stats.hp - currentChainDmg);
                      totalDamageDealtThisTurn += currentChainDmg;
                      chainCount++;
                      addCombatLog({ type: 'system', message: `Chain Strike x${chainCount}! ${actor.name} hits for ${currentChainDmg}!` });
                      addEffect({ type: 'beam', from: actor.position, to: target.position, attackerClass: actor.classId });
                      addEffect({ type: 'damage', position: target.position, damage: currentChainDmg });

                      // Roll for next chain (50% chance, damage halves each time)
                      if (!canChainInfinite || Math.random() >= 0.50) break;
                      currentChainDmg = Math.floor(currentChainDmg * 0.50);
                    }
                  }

                  // Apply crit bonus damage
                  if (uniqueCritResult.bonusDamage > 0 && targetMonsterIdx !== -1) {
                    const bonusDmg = Math.floor(uniqueCritResult.bonusDamage);
                    newMonsters[targetMonsterIdx].stats.hp = Math.max(0, newMonsters[targetMonsterIdx].stats.hp - bonusDmg);
                    totalDamageDealtThisTurn += bonusDmg;
                  }

                  // Apply buffs from unique on-crit (Shadowfang invisibility)
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
                addEffect({
                  type: 'death',
                  position: target.position,
                  isHero: false,
                  monsterId: target.templateId,
                });
                handleUnitDeath(target.id, target);

                // Magma Core: burning enemy explodes on death for 25% maxHp AoE
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
                          totalDamageDealtThisTurn += explosionDmg;
                          addCombatLog({ type: 'system', message: `Explosion hits ${nearbyEnemy.name} for ${explosionDmg}!` });
                          addEffect({ type: 'damage', position: nearbyEnemy.position, damage: explosionDmg });
                          // Check if explosion killed this enemy
                          if (newMonsters[nearbyIdx].stats.hp <= 0) {
                            addCombatLog({ type: 'death', target: { name: nearbyEnemy.name }, isHero: false });
                            addEffect({ type: 'death', position: nearbyEnemy.position, isHero: false, monsterId: nearbyEnemy.templateId });
                            handleUnitDeath(nearbyEnemy.id, nearbyEnemy);
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

                  // Process skill-based ON_KILL effects
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
                        healingDoneByHero[actor.id] = (healingDoneByHero[actor.id] || 0) + actualHeal;
                        healingReceivedByHero[actor.id] = (healingReceivedByHero[actor.id] || 0) + actualHeal;
                      }
                    }
                  }

                  // Process stacking HP (Necromancer Soul Harvest)
                  if (skillOnKillEffects.stackingHp > 0) {
                    const actorHeroIdx = findHeroIndex(actor.id);
                    if (actorHeroIdx !== -1) {
                      newHeroes[actorHeroIdx].stats.maxHp += skillOnKillEffects.stackingHp;
                      newHeroes[actorHeroIdx].stats.hp += skillOnKillEffects.stackingHp;
                      addCombatLog({ type: 'system', message: `Soul Harvest! ${actor.name} gains ${skillOnKillEffects.stackingHp} max HP` });
                      addEffect({ type: 'damage', position: actor.position, damage: skillOnKillEffects.stackingHp, isHeal: true });
                    }
                  }

                  // Check if killer has Nullblade (prevents resurrection of killed target)
                  const killerUniques = getHeroUniqueItems(heroData);
                  const hasNullblade = killerUniques.some(item => item.uniquePower?.effect?.preventsResurrection);
                  if (hasNullblade && targetMonsterIdx !== -1) {
                    newMonsters[targetMonsterIdx].preventResurrection = true;
                    addCombatLog({ type: 'system', message: `Nullblade severs ${target.name}'s soul — it cannot be resurrected!` });
                  }

                  // Check for raise_dead - raise the killed monster as a temporary ally
                  const raiseDeadData = checkRaiseDead(actor);
                  if (raiseDeadData.canRaise && !hasNullblade) {
                    const raisedUndead = createRaisedUndead(target, raiseDeadData.duration, target.position);
                    newHeroes.push(raisedUndead);
                    // Add to turn order
                    newTurnOrder.push(raisedUndead.id);
                    addCombatLog({ type: 'system', message: `${raiseDeadData.skillName}! ${target.name} rises as an undead ally!` });
                    addEffect({ type: 'healBurst', position: target.position });
                  }

                  // Process unique item ON_KILL effects (Abyssal Maw stacks, extra turns, etc.)
                  const uniqueOnKillResult = processOnKillUniques(
                    { ...heroData, stats: actor.stats },
                    target,
                    { usedExtraTurnThisRound: false }
                  );

                  // Handle extra turn from unique (Windrunner)
                  if (uniqueOnKillResult.extraTurn) {
                    addCombatLog({ type: 'system', message: `${actor.name}'s Windrunner grants an extra action!` });
                    addEffect({ type: 'buffAura', position: actor.position, color: '#22c55e' });
                    if (!newBuffs[actor.id]) newBuffs[actor.id] = {};
                    newBuffs[actor.id].extraTurn = true;
                  }

                  // Handle Soul Harvester stacks gained
                  if (uniqueOnKillResult.stacksGained > 0) {
                    addCombatLog({ type: 'system', message: `Soul Harvester! ${actor.name} gains power from the kill!` });
                    addEffect({ type: 'status', position: actor.position, status: 'buff' });
                    // Update hero maxHP to reflect new stacks
                    const actorIdx = findHeroIndex(actor.id);
                    if (actorIdx !== -1) {
                      const soulReapBonus = 1 + uniqueOnKillResult.stacksGained * 0.05;
                      const oldMaxHp = newHeroes[actorIdx].stats.maxHp;
                      newHeroes[actorIdx].stats.maxHp = Math.floor(oldMaxHp * soulReapBonus);
                      newHeroes[actorIdx].stats.hp += Math.floor(oldMaxHp * (soulReapBonus - 1));
                    }
                  }

                  // Handle cooldown reset
                  if (uniqueOnKillResult.resetCooldowns) {
                    // Reset all cooldowns for this hero
                    if (!newSkillCooldowns[actor.id]) newSkillCooldowns[actor.id] = {};
                    for (const skill in newSkillCooldowns[actor.id]) {
                      newSkillCooldowns[actor.id][skill] = 0;
                    }
                    addCombatLog({ type: 'system', message: `${actor.name}'s cooldowns reset!` });
                    addEffect({ type: 'buffAura', position: actor.position, color: '#8b5cf6' });
                  }
                }

                const baseGold = target.goldReward.min + Math.floor(Math.random() * (target.goldReward.max - target.goldReward.min));
                const gold = Math.floor(baseGold * goldMultiplier);
                addGold(gold);
                const xpPerHero = Math.floor((target.xpReward / heroes.length) * xpMultiplier);
                heroes.forEach(h => addXpToHero(h.id, xpPerHero));
                incrementStat('totalMonstersKilled', 1, { heroId: actor.ownerId || actor.id, monsterId: target.templateId, isBoss: target.isBoss });

                // Track wing boss defeat for raid dungeons
                // Just check for wingBossId - if set, it's a wing boss
                if (target.wingBossId) {
                  const { defeatWingBoss } = useGameStore.getState();
                  defeatWingBoss(target.wingBossId);
                  addCombatLog({ type: 'system', message: `Wing Boss defeated: ${target.name}!` });
                }

                // Track final boss defeat and complete the raid
                // Just check for finalBossId - if set, it's the final boss
                if (target.finalBossId) {
                  const { defeatWingBoss, completeRaid } = useGameStore.getState();
                  // Add final boss to defeated list for UI to show as defeated
                  defeatWingBoss(target.finalBossId);
                  addCombatLog({ type: 'system', message: `FINAL BOSS DEFEATED: ${target.name}! Raid Complete!` });
                  // Complete the raid after a short delay to allow effects to play
                  setTimeout(() => {
                    completeRaid();
                  }, 2000);
                }

                // Visual gold drop effect
                if (gold > 0) {
                  addEffect({
                    type: 'goldDrop',
                    position: target.position,
                    amount: gold,
                  });
                }

                // Handle loot drops - special handling for raid bosses
                const isRaid = dungeonProgress?.currentType === 'raid';
                const isRaidBoss = isRaid && target.isBoss;

                if (isRaidBoss) {
                  // Raid boss always drops - use drop table
                  // Get the boss ID from the target (wingBossId for wing bosses, finalBossId for final boss)
                  const targetBossId = target.wingBossId || target.finalBossId;
                  const raidBoss = getWingBoss(dungeonProgress.currentRaidId, targetBossId);
                  const ownedUniques = useGameStore.getState().ownedUniques || [];
                  const raidDrop = rollRaidDrop(raidBoss?.dropTable, ownedUniques);

                  if (raidDrop?.type === 'unique') {
                    handleUniqueDrop(raidDrop.itemId, target.position);
                  } else {
                    // Random gear drop with guaranteed rarity
                    const item = generateEquipment(dungeon.level, { guaranteedRarity: raidDrop?.rarity || 'epic' });
                    const result = processLootDrop(item);

                    addEffect({
                      type: 'lootDrop',
                      position: target.position,
                      slot: item.slot,
                      rarityColor: item.rarityColor || '#9ca3af',
                    });

                    if (result.action === 'sold') {
                      addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${result.gold}g)` });
                    } else if (result.action === 'looted') {
                      addCombatLog({ type: 'system', message: `Loot: ${item.name}` });
                    } else {
                      addCombatLog({ type: 'system', message: `${item.name} (inventory full!)` });
                    }
                  }
                } else if (target.isWorldBoss) {
                  // World boss always drops - check for unique
                  const worldBossLoot = getWorldBossLoot(target);

                  if (worldBossLoot.uniqueItemId) {
                    handleUniqueDrop(worldBossLoot.uniqueItemId, target.position);
                  }

                  // World boss also drops guaranteed epic+ gear
                  const item = generateEquipment(dungeon.level, { guaranteedRarity: worldBossLoot.guaranteedRarity });
                  const result = processLootDrop(item);

                  addEffect({
                    type: 'lootDrop',
                    position: target.position,
                    slot: item.slot,
                    rarityColor: item.rarityColor || '#9ca3af',
                  });

                  if (result.action === 'sold') {
                    addCombatLog({ type: 'system', message: `Sold: ${item.name} (+${result.gold}g)` });
                  } else if (result.action === 'looted') {
                    addCombatLog({ type: 'system', message: `Loot: ${item.name}` });
                  } else {
                    addCombatLog({ type: 'system', message: `${item.name} (inventory full!)` });
                  }
                } else if (target.isElite) {
                  // Elite mob always drops rare+ gear
                  const item = generateEquipment(dungeon.level, { guaranteedRarity: ELITE_CONFIG.guaranteedMinRarity });
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
                    addCombatLog({ type: 'system', message: `Loot: ${item.name}` });
                  } else {
                    addCombatLog({ type: 'system', message: `${item.name} (inventory full!)` });
                  }
                } else if (Math.random() < (target.isBoss ? 0.9 : 0.25)) {
                  // Normal dungeon loot
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

                // Chance to drop resurrection scroll (rare, boosted if party has dead member, higher in raids)
                const hasDeadPartyMember = newHeroes.some(h => h && h.stats.hp <= 0);
                const consumable = generateConsumableDrop(dungeon.level, hasDeadPartyMember, dungeon.isRaid);
                if (consumable && addConsumable(consumable)) {
                  addCombatLog({ type: 'system', message: `Found: ${consumable.name}!` });
                }
              }

              // Check for double attack - only if target survived the first hit
              const currentMonsterHp = targetMonsterIdx !== -1 ? newMonsters[targetMonsterIdx].stats.hp : 0;
              if (currentMonsterHp > 0) {
                // Include skill-based double attack bonus
                // Apply unique speed multiplier (Eye of the Storm) to attacker speed
                const attackerSpeedForDouble = actor.isHero && uniqueBonuses.speedMultiplier ? Math.floor(actor.stats.speed * uniqueBonuses.speedMultiplier) : actor.stats.speed;
                const baseDoubleChance = calculateDoubleAttackChance(attackerSpeedForDouble, target.stats.speed);
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
                    handleUnitDeath(target.id, target);
                    incrementStat('totalMonstersKilled', 1, { heroId: actor.ownerId || actor.id, monsterId: target.templateId, isBoss: target.isBoss });

                    // Track raid boss defeat from bonus damage
                    if (target.wingBossId) {
                      const { defeatWingBoss } = useGameStore.getState();
                      defeatWingBoss(target.wingBossId);
                      addCombatLog({ type: 'system', message: `Wing Boss defeated: ${target.name}!` });
                    }
                    if (target.finalBossId) {
                      const { defeatWingBoss, completeRaid } = useGameStore.getState();
                      defeatWingBoss(target.finalBossId);
                      addCombatLog({ type: 'system', message: `FINAL BOSS DEFEATED: ${target.name}! Raid Complete!` });
                      setTimeout(() => completeRaid(), 2000);
                    }

                    // Handle raid boss drops from bonus damage death
                    const isRaidBonusDmg = dungeonProgress?.currentType === 'raid';
                    if (isRaidBonusDmg && target.isBoss) {
                      const targetBossIdBonus = target.wingBossId || target.finalBossId;
                      const raidBossBonus = getWingBoss(dungeonProgress.currentRaidId, targetBossIdBonus);
                      const ownedUniquesBonus = useGameStore.getState().ownedUniques || [];
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
                }
              }

              // Reality Shard double hit - separate full attack (not speed-based double attack)
              if (actor.isHero && uniqueBonuses.doubleHitChance > 0 && targetMonsterIdx !== -1 && newMonsters[targetMonsterIdx].stats.hp > 0) {
                if (Math.random() < uniqueBonuses.doubleHitChance) {
                  const doubleHitDmg = Math.max(1, Math.floor(dmg));
                  newMonsters[targetMonsterIdx].stats.hp = Math.max(0, newMonsters[targetMonsterIdx].stats.hp - doubleHitDmg);
                  totalDamageDealtThisTurn += doubleHitDmg;
                  addCombatLog({ type: 'system', message: `Reality Shard! ${actor.name}'s attack hits twice for ${doubleHitDmg}!` });
                  addEffect({ type: 'beam', from: actor.position, to: target.position, attackerClass: actor.classId });
                  addEffect({ type: 'damage', position: target.position, damage: doubleHitDmg });

                  // Check if double hit killed the target
                  if (newMonsters[targetMonsterIdx].stats.hp <= 0) {
                    addCombatLog({ type: 'death', target: { name: target.name }, isHero: false });
                    addEffect({ type: 'death', position: target.position, isHero: false, monsterId: target.templateId });
                    handleUnitDeath(target.id, target);
                    incrementStat('totalMonstersKilled', 1, { heroId: actor.ownerId || actor.id, monsterId: target.templateId, isBoss: target.isBoss });
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
                      handleUnitDeath(otherTarget.id, otherTarget);
                      incrementStat('totalMonstersKilled', 1, { heroId: actor.ownerId || actor.id, monsterId: otherTarget.templateId, isBoss: otherTarget.isBoss });

                      // Track raid boss defeat from AOE damage
                      if (otherTarget.wingBossId) {
                        const { defeatWingBoss } = useGameStore.getState();
                        defeatWingBoss(otherTarget.wingBossId);
                        addCombatLog({ type: 'system', message: `Wing Boss defeated: ${otherTarget.name}!` });
                      }
                      if (otherTarget.finalBossId) {
                        const { defeatWingBoss, completeRaid } = useGameStore.getState();
                        defeatWingBoss(otherTarget.finalBossId);
                        addCombatLog({ type: 'system', message: `FINAL BOSS DEFEATED: ${otherTarget.name}! Raid Complete!` });
                        setTimeout(() => completeRaid(), 2000);
                      }

                      // Handle raid boss drops from AOE death
                      const isRaidAoe = dungeonProgress?.currentType === 'raid';
                      if (isRaidAoe && otherTarget.isBoss) {
                        const targetBossIdAoe = otherTarget.wingBossId || otherTarget.finalBossId;
                        const raidBossAoe = getWingBoss(dungeonProgress.currentRaidId, targetBossIdAoe);
                        const ownedUniquesAoe = useGameStore.getState().ownedUniques || [];
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
              }
            }
          }
        }
        } // End of if (!usedMonsterAbility)
      }
    } else {
      // MOVE toward target
      // Apply unique item movement bonus (Boots of Blinding Speed +2)
      let moveDistance = calculateMoveDistance(actor.stats.speed);
      if (actor.isHero) {
        const moveHeroData = heroes.find(h => h.id === actor.id);
        if (moveHeroData) {
          const moveUniqueBonuses = getUniquePassiveBonuses({ ...moveHeroData, stats: actor.stats });
          if (moveUniqueBonuses.movementBonus > 0) {
            moveDistance += moveUniqueBonuses.movementBonus;
          }
        }
      }
      const allUnits = [...newHeroes, ...activeCombatMonsters].filter(u => u.id !== actor.id && u.stats.hp > 0);
      const occupied = allUnits.map(u => u.position);
      let currentOccupied = new Set(occupied.map(p => `${p.x},${p.y}`));

      const grid = mazeDungeon ? mazeDungeon.grid : null;
      if (!grid) {
        // OPTIMIZATION: Single batched update including turn advance
        const noGridUniqueSnapshots = {};
        for (const h of newHeroes) {
          if (h.isPet || h.isClone || h.isUndead) continue;
          const snap = getUniqueStateSnapshot(h.id);
          if (snap) noGridUniqueSnapshots[h.id] = snap;
        }
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
          reactiveHealUsed: newReactiveHealUsed,
          uniqueStates: noGridUniqueSnapshots,
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
              let healPerHero = Math.floor(partyHealAmount / aliveHeroes.length);
              const d2hReduction = getHeroHealingReduction(heroes.find(hr => hr.id === hero.id) || {});
              if (d2hReduction > 0) healPerHero = Math.floor(healPerHero * (1 - d2hReduction));
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

    // Blood Pendant: heal heroes with Blood Pendant for 5% of total party damage this turn
    if (totalDamageDealtThisTurn > 0 && actor.isHero) {
      for (let i = 0; i < newHeroes.length; i++) {
        const hero = newHeroes[i];
        if (hero.stats.hp <= 0 || hero.isPet || hero.isClone || hero.isUndead) continue;
        const pendantHeroData = heroes.find(h => h.id === hero.id);
        if (!pendantHeroData) continue;
        const pendantItems = getHeroUniqueItems(pendantHeroData);
        const bloodPendant = pendantItems.find(item => item.uniquePower?.effect?.partyLifesteal);
        if (bloodPendant) {
          const partyLifestealPercent = bloodPendant.uniquePower.effect.partyLifesteal;
          const pendantHeal = Math.floor(totalDamageDealtThisTurn * partyLifestealPercent);
          if (pendantHeal > 0 && hero.stats.hp < hero.stats.maxHp) {
            const actualPendantHeal = Math.min(pendantHeal, hero.stats.maxHp - hero.stats.hp);
            if (actualPendantHeal > 0) {
              newHeroes[i].stats.hp += actualPendantHeal;
              addCombatLog({ type: 'system', message: `Blood Pendant! ${hero.name} drains ${actualPendantHeal} HP from party damage!` });
              addEffect({ type: 'damage', position: hero.position, damage: actualPendantHeal, isHeal: true });
              healingReceivedByHero[hero.id] = (healingReceivedByHero[hero.id] || 0) + actualPendantHeal;
            }
          }
        }
      }
    }

    // Track combat stats (damage dealt only when actor is a hero to avoid duplicate counting)
    // For summons (pets, clones, undead), credit damage to the owner
    if (actor.isHero) {
      if (totalDamageDealtThisTurn > 0) {
        const statHeroId = actor.ownerId || actor.id;
        incrementStat('totalDamageDealt', totalDamageDealtThisTurn, { heroId: statHeroId });
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

    // Remove dead undead summons - they "crumble to dust" and shouldn't persist/render
    for (let i = newHeroes.length - 1; i >= 0; i--) {
      if (newHeroes[i].isUndead && newHeroes[i].stats.hp <= 0) {
        const undeadId = newHeroes[i].id;
        newHeroes.splice(i, 1);
        const turnIdx = newTurnOrder.indexOf(undeadId);
        if (turnIdx !== -1) newTurnOrder.splice(turnIdx, 1);
      }
    }

    // OPTIMIZATION: Get next turn state to include in batch
    const nextTurnState = getNextTurnState(roomCombat, newHeroes, newMonsters);

    // Update viewport to keep combat units visible
    const newViewport = calculateCombatViewport(newHeroes, newMonsters);

    // Sync unique item state snapshots for sidebar display
    const uniqueStateSnapshots = {};
    for (const hero of newHeroes) {
      if (hero.isPet || hero.isClone || hero.isUndead) continue;
      const snapshot = getUniqueStateSnapshot(hero.id);
      if (snapshot) uniqueStateSnapshots[hero.id] = snapshot;
    }

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
      reactiveHealUsed: newReactiveHealUsed,
      lastSummonRoomIndex,
      viewport: newViewport,
      uniqueStates: uniqueStateSnapshots,
      ...(nextTurnState || {}),
    });

    // OPTIMIZATION: Batch sync all hero HPs to store in one call
    // Skip summons (pets, clones, undead) - they don't persist between dungeons
    const heroHpSync = {};
    for (const hero of newHeroes) {
      if (hero.isPet || hero.isClone || hero.isUndead) continue;
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
