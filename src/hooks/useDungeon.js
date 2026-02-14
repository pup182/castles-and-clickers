import { useCallback } from 'react';
import { useGameStore, calculateHeroStats } from '../store/gameStore';
import {
  generateMazeDungeon,
  generateRaidDungeon,
  placeMonsters,
  findExplorationTarget,
  markExplored,
  findMonstersInRange,
  getHeroStartPositions,
  findPath,
  TILE,
  MAZE_ROOM_TYPES,
} from '../game/mazeGenerator';
import { CLASSES } from '../data/classes';
import {
  PHASES,
  DETECTION_RANGE,
  BOSS_ENGAGE_RANGE,
  VISION_RANGE,
  VIEWPORT_WIDTH,
  VIEWPORT_HEIGHT,
  createTurnOrder,
} from '../game/constants';
import { resetUniqueStates, processOnCombatStartUniques, processOnRoomStartUniques, getUniquePassiveBonuses } from '../game/uniqueEngine';
import { applyStatusEffect } from '../game/statusEngine';
import { resetBossStates } from '../game/bossEngine';

/**
 * Hook for dungeon setup and exploration phase logic
 * OPTIMIZATION: Uses imperative state access to avoid subscribing to store changes
 */
export const useDungeon = ({ addEffect }) => {
  // OPTIMIZATION: Get actions imperatively to avoid re-renders
  const addGold = useCallback((amount) => useGameStore.getState().addGold(amount), []);
  const incrementStat = useCallback((stat) => useGameStore.getState().incrementStat(stat), []);
  const addCombatLog = useCallback((log) => useGameStore.getState().addCombatLog(log), []);
  const setRoomCombat = useCallback((state) => useGameStore.getState().setRoomCombat(state), []);
  const updateRoomCombat = useCallback((updates) => useGameStore.getState().updateRoomCombat(updates), []);
  const syncHeroHp = useCallback((hpMap) => useGameStore.getState().syncHeroHp(hpMap), []);

  // Setup the maze dungeon
  const setupDungeon = useCallback(() => {
    // OPTIMIZATION: Get state imperatively
    const state = useGameStore.getState();
    const { dungeon, heroes, heroHp, dungeonProgress } = state;
    const homesteadBonuses = state.getHomesteadBonuses();

    if (!dungeon) return;

    // Reset unique item and boss states for new dungeon
    resetUniqueStates();
    resetBossStates();

    // Generate maze dungeon - use raid dungeon generator for raids
    let mazeDungeon;
    const isRaid = dungeon.isRaid && dungeon.raidId;

    if (isRaid) {
      mazeDungeon = generateRaidDungeon(dungeon.raidId);
      if (!mazeDungeon) {
        console.error('Failed to generate raid dungeon for:', dungeon.raidId);
        return;
      }
    } else {
      mazeDungeon = generateMazeDungeon(dungeon.level);
    }

    // Raid multiplier for raid dungeons (15% bonus over normal scaling)
    const dungeonType = dungeonProgress?.currentType || 'normal';
    const raidMultiplier = dungeonType === 'raid' ? 1.15 : 1.0;

    // Place monsters (base scaling is 1.12^(level-1) in placeMonsters)
    const allMonsters = placeMonsters(mazeDungeon, dungeon.level, {
      dungeonType,
      statMultiplier: raidMultiplier,
      affixes: dungeonProgress?.activeAffixes || [],
    });

    // Setup heroes with PERSISTED HP from store
    const positionPriority = { warrior: 0, rogue: 1, cleric: 2, mage: 3 };
    const sortedHeroes = [...heroes].sort((a, b) =>
      (positionPriority[a.classId] ?? 2) - (positionPriority[b.classId] ?? 2)
    );

    // Get hero positions near entrance (on walkable tiles)
    const heroPositions = getHeroStartPositions(mazeDungeon.entrance, sortedHeroes.length, mazeDungeon.grid);

    // Compute elixir buff multipliers from active dungeon buffs
    const elixirBuffs = { attack: 0, defense: 0, speed: 0 };
    const activeBuffs = useGameStore.getState().dungeon?.activeBuffs || [];
    for (const buff of activeBuffs) {
      if (buff.effect?.type === 'statBuff') {
        elixirBuffs[buff.effect.stat] = (elixirBuffs[buff.effect.stat] || 0) + buff.effect.multiplier;
      }
    }

    const combatHeroes = sortedHeroes.map((hero, i) => {
      const classData = CLASSES[hero.classId];
      const stats = calculateHeroStats(hero, heroes, homesteadBonuses);

      // Apply elixir stat buffs
      if (elixirBuffs.attack > 0) stats.attack = Math.floor(stats.attack * (1 + elixirBuffs.attack));
      if (elixirBuffs.defense > 0) {
        stats.defense = Math.floor(stats.defense * (1 + elixirBuffs.defense));
        stats.maxHp = Math.floor(stats.maxHp * (1 + elixirBuffs.defense));
      }
      if (elixirBuffs.speed > 0) stats.speed = Math.floor(stats.speed * (1 + elixirBuffs.speed));

      // Apply unique item maxHpMultiplier (Leviathan's Heart - 2x HP)
      const uniqueBonuses = getUniquePassiveBonuses({ ...hero, stats });
      if (uniqueBonuses.maxHpMultiplier && uniqueBonuses.maxHpMultiplier !== 1) {
        stats.maxHp = Math.floor(stats.maxHp * uniqueBonuses.maxHpMultiplier);
        addCombatLog({ type: 'system', message: `Leviathan's Heart! ${hero.name}'s max HP doubled to ${stats.maxHp}!` });
      }

      const currentHp = heroHp[hero.id] !== undefined ? Math.min(heroHp[hero.id], stats.maxHp) : stats.maxHp;

      return {
        id: hero.id,
        name: hero.name,
        classId: hero.classId,
        equipment: hero.equipment || {},
        position: heroPositions[i] || { ...mazeDungeon.entrance },
        stats: { ...stats, hp: currentHp },
        attackRange: classData.attackRange || 1,
        isHero: true,
        skills: hero.skills || [],
      };
    });

    // Calculate initial viewport centered on party
    const partyPosition = { ...mazeDungeon.entrance };
    const viewport = {
      x: Math.max(0, partyPosition.x - Math.floor(VIEWPORT_WIDTH / 2)),
      y: Math.max(0, partyPosition.y - Math.floor(VIEWPORT_HEIGHT / 2)),
    };

    // Find first exploration target
    const targetPosition = findExplorationTarget(mazeDungeon, partyPosition, allMonsters);

    // Mark initial vision area as explored
    mazeDungeon.explored = markExplored(mazeDungeon.explored, partyPosition, VISION_RANGE);

    // Initialize skill cooldowns
    const skillCooldowns = {};
    for (const hero of combatHeroes) {
      skillCooldowns[hero.id] = {};
    }

    if (isRaid && mazeDungeon.raidData) {
      addCombatLog({ type: 'system', message: `Raid: ${mazeDungeon.raidData.name}` });
      addCombatLog({ type: 'system', message: `${mazeDungeon.wingBossIds?.length || 0} wing bosses + final boss` });
    } else {
      addCombatLog({ type: 'system', message: `Dungeon Level ${dungeon.level}` });
      addCombatLog({ type: 'system', message: `${mazeDungeon.rooms.length} rooms to explore` });
    }

    // Set initial state
    setRoomCombat({
      phase: PHASES.EXPLORING,
      dungeon: mazeDungeon,
      heroes: combatHeroes,
      monsters: allMonsters,
      partyPosition,
      targetPosition,
      viewport,
      turnOrder: [],
      currentTurnIndex: 0,
      round: 1,
      tick: 0,
      skillCooldowns,
      killBonusStacks: {},
      buffs: {},
      combatMonsters: [],
      statusEffects: {},
      usedPhoenixRevives: {},  // Reset phoenix revives for new dungeon
    });
  }, [addCombatLog, setRoomCombat]);

  // Start combat with nearby monsters
  const startLocalCombat = useCallback((nearbyMonsters) => {
    // OPTIMIZATION: Get state imperatively
    const roomCombat = useGameStore.getState().roomCombat;
    if (!roomCombat) return;

    const { heroes: combatHeroes } = roomCombat;

    // Create turn order for this combat
    const turnOrder = createTurnOrder(combatHeroes.filter(h => h.stats.hp > 0), nearbyMonsters);

    addCombatLog({ type: 'system', message: `${nearbyMonsters.length} enemies!` });

    // Process unique ON_COMBAT_START effects (Kraken's Grasp root, Cloak of Nothing stealth)
    const aliveHeroes = combatHeroes.filter(h => h.stats.hp > 0);
    const initialStatusEffects = { ...(roomCombat.statusEffects || {}) };
    for (const hero of aliveHeroes) {
      const combatStartResult = processOnCombatStartUniques(hero, nearbyMonsters, {});

      // Kraken's Grasp - root all enemies at combat start
      if (combatStartResult.rootEnemies) {
        for (const enemy of nearbyMonsters) {
          const mockEnemy = { ...enemy, statusEffects: initialStatusEffects[enemy.id] || [] };
          const statusResult = applyStatusEffect(mockEnemy, 'root', hero, {
            duration: combatStartResult.rootEnemies.duration,
          });
          initialStatusEffects[enemy.id] = statusResult.effects;
        }
        addCombatLog({ type: 'system', message: `Kraken's Grasp! ${hero.name} roots all enemies!` });
      }

      // Cloak of Nothing - start combat invisible
      if (combatStartResult.invisibleTurns > 0) {
        addCombatLog({ type: 'system', message: `Cloak of Nothing! ${hero.name} vanishes into the shadows!` });
        addEffect({ type: 'buffAura', position: hero.position, color: '#6b7280' });
      }
    }

    updateRoomCombat({
      phase: PHASES.COMBAT,
      combatMonsters: nearbyMonsters.map(m => m.id),
      turnOrder,
      currentTurnIndex: 0,
      round: 1,
      statusEffects: initialStatusEffects,
    });
  }, [addCombatLog, updateRoomCombat]);

  // Maximum distance a follower can be from leader before teleporting
  const MAX_FOLLOWER_DISTANCE = 6;

  // Find a valid position adjacent to the target for teleporting stragglers
  const findTeleportPosition = (target, taken, grid) => {
    // Try positions in expanding rings around target
    const offsets = [
      // Adjacent (distance 1)
      { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
      { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 },
      // Distance 2
      { x: 2, y: 0 }, { x: -2, y: 0 }, { x: 0, y: 2 }, { x: 0, y: -2 },
      { x: 2, y: 1 }, { x: 2, y: -1 }, { x: -2, y: 1 }, { x: -2, y: -1 },
      { x: 1, y: 2 }, { x: -1, y: 2 }, { x: 1, y: -2 }, { x: -1, y: -2 },
    ];

    for (const offset of offsets) {
      const pos = { x: target.x + offset.x, y: target.y + offset.y };
      const key = `${pos.x},${pos.y}`;
      const tile = grid[pos.y]?.[pos.x];
      const isWalkable = tile === TILE.FLOOR || tile === TILE.CORRIDOR || tile === TILE.DOOR || tile === TILE.ENTRANCE || tile === TILE.TREASURE;
      if (!taken.has(key) && isWalkable) {
        return pos;
      }
    }
    return null;
  };

  // OPTIMIZATION: Simple greedy movement for followers (avoids expensive A* pathfinding)
  // Improved to try all 4 directions as fallback to avoid getting stuck on corners
  const moveFollowerToward = (follower, target, taken, grid) => {
    const dx = target.x - follower.x;
    const dy = target.y - follower.y;

    // Already adjacent or at target
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) return null;

    // Helper to check if a position is valid
    const isValidMove = (pos) => {
      const key = `${pos.x},${pos.y}`;
      const tile = grid[pos.y]?.[pos.x];
      const isWalkable = tile === TILE.FLOOR || tile === TILE.CORRIDOR || tile === TILE.DOOR || tile === TILE.ENTRANCE || tile === TILE.TREASURE;
      return !taken.has(key) && isWalkable;
    };

    // Primary moves: directly toward target
    const primaryMoves = [];
    if (Math.abs(dx) >= Math.abs(dy)) {
      if (dx !== 0) primaryMoves.push({ x: follower.x + Math.sign(dx), y: follower.y });
      if (dy !== 0) primaryMoves.push({ x: follower.x, y: follower.y + Math.sign(dy) });
    } else {
      if (dy !== 0) primaryMoves.push({ x: follower.x, y: follower.y + Math.sign(dy) });
      if (dx !== 0) primaryMoves.push({ x: follower.x + Math.sign(dx), y: follower.y });
    }

    // Try primary moves first
    for (const move of primaryMoves) {
      if (isValidMove(move)) return move;
    }

    // Fallback: try perpendicular/opposite directions to get unstuck from corners
    const fallbackMoves = [
      { x: follower.x + 1, y: follower.y },  // right
      { x: follower.x - 1, y: follower.y },  // left
      { x: follower.x, y: follower.y + 1 },  // down
      { x: follower.x, y: follower.y - 1 },  // up
    ].filter(move => {
      // Exclude moves we already tried
      return !primaryMoves.some(pm => pm.x === move.x && pm.y === move.y);
    });

    for (const move of fallbackMoves) {
      if (isValidMove(move)) return move;
    }

    return null;
  };

  // Helper to find which room index a position is in (-1 if in corridor)
  const findRoomIndex = (rooms, pos) => {
    if (!rooms || !pos) return -1;
    for (let i = 0; i < rooms.length; i++) {
      const r = rooms[i];
      if (pos.x >= r.x && pos.x < r.x + r.width && pos.y >= r.y && pos.y < r.y + r.height) {
        return i;
      }
    }
    return -1;
  };

  // Handle exploration phase tick
  const handleExplorationTick = useCallback(() => {
    // OPTIMIZATION: Get state imperatively
    const state = useGameStore.getState();
    const { roomCombat, dungeon } = state;
    const homesteadBonuses = state.getHomesteadBonuses();

    if (!roomCombat || roomCombat.phase !== PHASES.EXPLORING) return false;

    const { heroes: combatHeroes, monsters, dungeon: mazeDungeon, partyPosition } = roomCombat;

    if (!mazeDungeon || !partyPosition) return false;

    const aliveHeroes = combatHeroes.filter(h => h.stats.hp > 0);
    const aliveMonsters = monsters.filter(m => m.stats.hp > 0);

    // Detect room change for ON_ROOM_START unique effects (Ancient Bark shield)
    const currentRoomIndex = findRoomIndex(mazeDungeon.rooms, partyPosition);
    const lastRoomIndex = roomCombat.lastExploreRoomIndex ?? -1;
    if (currentRoomIndex !== -1 && currentRoomIndex !== lastRoomIndex) {
      const newBuffs = { ...(roomCombat.buffs || {}) };
      for (const hero of aliveHeroes) {
        const roomStartResult = processOnRoomStartUniques(hero, {});
        if (roomStartResult.shieldAmount > 0) {
          if (!newBuffs[hero.id]) newBuffs[hero.id] = {};
          newBuffs[hero.id].shield = roomStartResult.shieldAmount;
          addCombatLog({ type: 'system', message: `Ancient Bark! ${hero.name} gains a ${roomStartResult.shieldAmount} HP shield!` });
        }
      }
      updateRoomCombat({ lastExploreRoomIndex: currentRoomIndex, buffs: newBuffs });
    }
    const aliveBoss = aliveMonsters.find(m => m.isBoss);
    const aliveNonBoss = aliveMonsters.filter(m => !m.isBoss);

    // Check defeat
    if (aliveHeroes.length === 0) {
      updateRoomCombat({ phase: PHASES.DEFEAT, tick: 0 });
      addCombatLog({ type: 'system', message: 'Party Defeated!' });
      return true;
    }

    // Passive healing during exploration (base 0.5% + infirmary bonus)
    const baseHealPercent = 0.005;
    const infirmaryBonus = homesteadBonuses.healBetweenDungeons || 0;
    const totalHealPercent = baseHealPercent + infirmaryBonus;

    // Apply passive healing and track which heroes were healed
    let currentHeroes = combatHeroes;
    const hpUpdates = {};

    if (totalHealPercent > 0) {
      let anyHealed = false;

      currentHeroes = combatHeroes.map(h => {
        if (h.stats.hp > 0 && h.stats.hp < h.stats.maxHp) {
          const healAmount = Math.max(1, Math.floor(h.stats.maxHp * totalHealPercent));
          const newHp = Math.min(h.stats.maxHp, h.stats.hp + healAmount);
          if (newHp > h.stats.hp) {
            anyHealed = true;
            hpUpdates[h.id] = newHp;
            return { ...h, stats: { ...h.stats, hp: newHp } };
          }
        }
        return h;
      });

      if (anyHealed) {
        // Sync HP to persistent store
        syncHeroHp(hpUpdates);
      }
    }

    // Check for nearby monsters to fight
    // IMPORTANT: Exclude boss until bossUnlocked AND heroes are very close
    // This prevents the boss from auto-aggroing across the dungeon when unlocked
    // Wing bosses can be fought at any time (they unlock the final boss)
    const nearbyMonsters = findMonstersInRange(monsters, partyPosition, DETECTION_RANGE)
      .filter(m => {
        if (!m.isBoss) return true; // Regular monsters use normal detection range
        if (m.isWingBoss) return true; // Wing bosses can be fought without unlock
        if (!roomCombat.bossUnlocked) return false; // Final/main boss locked until all others dead
        // Boss requires heroes to be very close before engaging
        const dist = Math.abs(m.position.x - partyPosition.x) + Math.abs(m.position.y - partyPosition.y);
        return dist <= BOSS_ENGAGE_RANGE;
      });

    if (nearbyMonsters.length > 0) {
      startLocalCombat(nearbyMonsters);
      return true;
    }

    // Helper to find nearby treasure tiles in explored areas
    const findNearbyTreasure = () => {
      const explored = new Set(Array.isArray(mazeDungeon.explored) ? mazeDungeon.explored : []);
      let nearestTreasure = null;
      let nearestDist = Infinity;

      // Search explored tiles for treasure
      for (const key of explored) {
        const [tx, ty] = key.split(',').map(Number);
        if (mazeDungeon.grid[ty] && mazeDungeon.grid[ty][tx] === TILE.TREASURE) {
          const dist = Math.abs(tx - partyPosition.x) + Math.abs(ty - partyPosition.y);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestTreasure = { x: tx, y: ty };
          }
        }
      }
      return nearestTreasure;
    };

    // After clearing combat, check for nearby treasure before moving to next monster
    const nearbyTreasure = findNearbyTreasure();
    if (nearbyTreasure) {
      // Path to treasure
      const leadHero = aliveHeroes[0];
      const treasurePath = findPath(mazeDungeon.grid, leadHero.position, nearbyTreasure, []);

      if (treasurePath && treasurePath.length > 1) {
        const newLeadPosition = treasurePath[1];

        const takenPositions = new Set([`${newLeadPosition.x},${newLeadPosition.y}`]);
        const newHeroes = currentHeroes.map(h => {
          if (h.id === leadHero.id) {
            return { ...h, position: newLeadPosition };
          }
          // OPTIMIZATION: Use greedy movement instead of A* pathfinding
          const nextPos = moveFollowerToward(h.position, newLeadPosition, takenPositions, mazeDungeon.grid);
          if (nextPos) {
            const key = `${nextPos.x},${nextPos.y}`;
            takenPositions.add(key);
            return { ...h, position: nextPos };
          }
          return h;
        });

        // Teleport stragglers who got too far from leader
        const finalHeroes = newHeroes.map(h => {
          if (h.id === leadHero.id) return h;
          const dist = Math.abs(h.position.x - newLeadPosition.x) + Math.abs(h.position.y - newLeadPosition.y);
          if (dist > MAX_FOLLOWER_DISTANCE) {
            const teleportPos = findTeleportPosition(newLeadPosition, takenPositions, mazeDungeon.grid);
            if (teleportPos) {
              takenPositions.add(`${teleportPos.x},${teleportPos.y}`);
              return { ...h, position: teleportPos };
            }
          }
          return h;
        });

        const newExplored = markExplored(mazeDungeon.explored, newLeadPosition, VISION_RANGE);

        // Check for treasure pickup at new position
        let updatedGrid = mazeDungeon.grid;
        for (const hero of finalHeroes) {
          const { x, y } = hero.position;
          if (updatedGrid[y] && updatedGrid[y][x] === TILE.TREASURE) {
            const treasureGold = 50 + dungeon.level * 25 + Math.floor(Math.random() * 50);
            addGold(treasureGold);
            addCombatLog({ type: 'system', message: `Found treasure! +${treasureGold} gold` });
            updatedGrid = updatedGrid.map((row, rowY) =>
              rowY === y ? row.map((tile, colX) => (colX === x ? TILE.FLOOR : tile)) : row
            );
          }
        }

        updateRoomCombat({
          partyPosition: newLeadPosition,
          heroes: finalHeroes,
          dungeon: { ...mazeDungeon, grid: updatedGrid, explored: newExplored },
        });
        return true;
      }
    }

    // For raids: separate wing bosses from the final boss
    const isRaidDungeon = mazeDungeon.isRaid;

    // Categorize monsters for targeting
    const aliveWingBosses = aliveMonsters.filter(m => m.isWingBoss);
    const aliveFinalBoss = aliveMonsters.find(m => m.isFinalBoss);
    const aliveRegularMonsters = aliveMonsters.filter(m => !m.isBoss && !m.isWingBoss && !m.isFinalBoss);

    // Check if final boss is unlocked (all wing bosses dead)
    // Use direct check of alive wing bosses - more reliable than state tracking
    let finalBossUnlocked = false;
    if (isRaidDungeon) {
      // Final boss unlocks when no wing bosses remain alive in the dungeon
      finalBossUnlocked = aliveWingBosses.length === 0;
    }

    // Find next target based on dungeon type
    let targetMonster = null;

    if (isRaidDungeon) {
      // Raid dungeon targeting:
      // Target nearest enemy (regular monsters AND wing bosses can be fought as encountered)
      // Final boss only when all wing bosses are dead

      // Combine regular monsters and wing bosses - fight whatever is nearest
      const targetableMonsters = [...aliveRegularMonsters, ...aliveWingBosses];

      if (targetableMonsters.length > 0) {
        let minDist = Infinity;
        for (const m of targetableMonsters) {
          const dist = Math.abs(m.position.x - partyPosition.x) + Math.abs(m.position.y - partyPosition.y);
          if (dist < minDist) {
            minDist = dist;
            targetMonster = m;
          }
        }
      } else if (aliveFinalBoss) {
        if (!finalBossUnlocked) {
          // Still waiting for wing bosses to be defeated
          addCombatLog({ type: 'system', message: 'Final boss locked - defeat all wing bosses first!' });
          return true;
        }
        if (!roomCombat.bossUnlocked) {
          addCombatLog({ type: 'system', message: 'Final boss door unlocked!' });
          updateRoomCombat({ bossUnlocked: true });
        }
        targetMonster = aliveFinalBoss;
      }
    } else {
      // Normal dungeon targeting
      if (aliveNonBoss.length > 0) {
        let minDist = Infinity;
        for (const m of aliveNonBoss) {
          const dist = Math.abs(m.position.x - partyPosition.x) + Math.abs(m.position.y - partyPosition.y);
          if (dist < minDist) {
            minDist = dist;
            targetMonster = m;
          }
        }
      } else if (aliveBoss) {
        if (!roomCombat.bossUnlocked) {
          addCombatLog({ type: 'system', message: 'Boss door unlocked!' });
          updateRoomCombat({ bossUnlocked: true });
        }
        targetMonster = aliveBoss;
      }
    }

    if (!targetMonster) {
      // All monsters dead including boss - transition to CLEARING phase
      // The actual dungeon completion (gold, stats) is handled in useGameLoop CLEARING phase
      // to ensure goldMultiplier bonuses are applied correctly
      updateRoomCombat({ phase: PHASES.CLEARING, tick: 0 });
      return true;
    }

    if (targetMonster) {
      const monsterPositions = aliveMonsters.map(m => m.position);
      const leadHero = aliveHeroes[0];
      const followers = aliveHeroes.slice(1);

      // Leader pathfinds to monster
      const cachedPath = roomCombat.cachedLeadPath;
      const cachedTarget = roomCombat.cachedTargetPos;
      const lastLeadPos = roomCombat.lastLeadPosition;
      const targetChanged = !cachedTarget ||
        cachedTarget.x !== targetMonster.position.x ||
        cachedTarget.y !== targetMonster.position.y;
      const heroMoved = !lastLeadPos ||
        lastLeadPos.x !== leadHero.position.x ||
        lastLeadPos.y !== leadHero.position.y;

      let leadPath;
      if (!targetChanged && !heroMoved && cachedPath && cachedPath.length > 1) {
        leadPath = cachedPath;
      } else {
        leadPath = findPath(mazeDungeon.grid, leadHero.position, targetMonster.position, monsterPositions);
      }

      // Move leader
      let newLeadPosition = leadHero.position;
      if (leadPath && leadPath.length > 1) {
        newLeadPosition = leadPath[1];
      }

      // Followers: pathfind to leader's position (they'll naturally stay close)
      const takenPositions = new Set([
        `${newLeadPosition.x},${newLeadPosition.y}`,
        ...monsterPositions.map(p => `${p.x},${p.y}`)
      ]);

      const newHeroes = currentHeroes.map(h => {
        if (h.id === leadHero.id) {
          return { ...h, position: newLeadPosition };
        }

        // Follower: use simple greedy movement toward leader (no pathfinding)
        const nextPos = moveFollowerToward(h.position, newLeadPosition, takenPositions, mazeDungeon.grid);
        if (nextPos) {
          const key = `${nextPos.x},${nextPos.y}`;
          takenPositions.add(key);
          return { ...h, position: nextPos };
        }

        return h;
      });

      // Teleport stragglers who got too far from leader
      const finalHeroes = newHeroes.map(h => {
        if (h.id === leadHero.id) return h;
        const dist = Math.abs(h.position.x - newLeadPosition.x) + Math.abs(h.position.y - newLeadPosition.y);
        if (dist > MAX_FOLLOWER_DISTANCE) {
          const teleportPos = findTeleportPosition(newLeadPosition, takenPositions, mazeDungeon.grid);
          if (teleportPos) {
            takenPositions.add(`${teleportPos.x},${teleportPos.y}`);
            return { ...h, position: teleportPos };
          }
        }
        return h;
      });

      const leadPos = newLeadPosition;
      const newExplored = markExplored(mazeDungeon.explored, leadPos, VISION_RANGE);

      // Check for treasure pickup - any hero stepping on a treasure tile collects it
      let updatedGrid = mazeDungeon.grid;
      for (const hero of finalHeroes) {
        const { x, y } = hero.position;
        if (updatedGrid[y] && updatedGrid[y][x] === TILE.TREASURE) {
          // Award gold based on dungeon level
          const treasureGold = 50 + dungeon.level * 25 + Math.floor(Math.random() * 50);
          addGold(treasureGold);
          addCombatLog({ type: 'system', message: `Found treasure! +${treasureGold} gold` });

          // Convert treasure tile to floor so it can't be collected again
          updatedGrid = updatedGrid.map((row, rowY) =>
            rowY === y
              ? row.map((tile, colX) => (colX === x ? TILE.FLOOR : tile))
              : row
          );
        }
      }

      // Update viewport
      const currentViewport = roomCombat.viewport || { x: 0, y: 0 };
      const edgeBuffer = 5;
      let newViewport = { ...currentViewport };
      const heroScreenX = leadPos.x - currentViewport.x;
      const heroScreenY = leadPos.y - currentViewport.y;

      if (heroScreenX < edgeBuffer) {
        newViewport.x = Math.max(0, leadPos.x - edgeBuffer);
      } else if (heroScreenX > VIEWPORT_WIDTH - edgeBuffer) {
        newViewport.x = Math.min(mazeDungeon.width - VIEWPORT_WIDTH, leadPos.x - VIEWPORT_WIDTH + edgeBuffer);
      }
      if (heroScreenY < edgeBuffer) {
        newViewport.y = Math.max(0, leadPos.y - edgeBuffer);
      } else if (heroScreenY > VIEWPORT_HEIGHT - edgeBuffer) {
        newViewport.y = Math.min(mazeDungeon.height - VIEWPORT_HEIGHT, leadPos.y - VIEWPORT_HEIGHT + edgeBuffer);
      }

      const leaderMoved = newLeadPosition.x !== leadHero.position.x || newLeadPosition.y !== leadHero.position.y;
      const newCachedPath = leadPath && leaderMoved ? leadPath.slice(1) : leadPath;

      updateRoomCombat({
        partyPosition: leadPos,
        heroes: finalHeroes,
        dungeon: { ...mazeDungeon, grid: updatedGrid, explored: newExplored },
        viewport: newViewport,
        lastLeadPosition: leadPos,
        cachedLeadPath: newCachedPath,
        cachedTargetPos: targetMonster.position,
      });
    }

    return true;
  }, [addCombatLog, updateRoomCombat, addGold, incrementStat, syncHeroHp, startLocalCombat]);

  return {
    setupDungeon,
    startLocalCombat,
    handleExplorationTick,
  };
};
