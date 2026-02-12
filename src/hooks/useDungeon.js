import { useCallback } from 'react';
import { useGameStore, calculateHeroStats } from '../store/gameStore';
import {
  generateMazeDungeon,
  placeMonsters,
  findExplorationTarget,
  markExplored,
  findMonstersInRange,
  getHeroStartPositions,
  findPath,
  TILE,
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

    // Generate maze dungeon
    const mazeDungeon = generateMazeDungeon(dungeon.level);

    // Raid multiplier for raid dungeons
    const dungeonType = dungeonProgress?.currentType || 'normal';
    const raidMultiplier = dungeonType === 'raid' ? 1.5 : 1.0;

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

    const combatHeroes = sortedHeroes.map((hero, i) => {
      const classData = CLASSES[hero.classId];
      const stats = calculateHeroStats(hero, heroes, homesteadBonuses);
      const currentHp = heroHp[hero.id] !== undefined ? heroHp[hero.id] : stats.maxHp;

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

    addCombatLog({ type: 'system', message: `Dungeon Level ${dungeon.level}` });
    addCombatLog({ type: 'system', message: `${mazeDungeon.rooms.length} rooms to explore` });

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

    updateRoomCombat({
      phase: PHASES.COMBAT,
      combatMonsters: nearbyMonsters.map(m => m.id),
      turnOrder,
      currentTurnIndex: 0,
      round: 1,
    });
  }, [addCombatLog, updateRoomCombat]);

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
    const nearbyMonsters = findMonstersInRange(monsters, partyPosition, DETECTION_RANGE)
      .filter(m => {
        if (!m.isBoss) return true; // Regular monsters use normal detection range
        if (!roomCombat.bossUnlocked) return false; // Boss locked until all others dead
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

        const newExplored = markExplored(mazeDungeon.explored, newLeadPosition, VISION_RANGE);

        // Check for treasure pickup at new position
        let updatedGrid = mazeDungeon.grid;
        for (const hero of newHeroes) {
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
          heroes: newHeroes,
          dungeon: { ...mazeDungeon, grid: updatedGrid, explored: newExplored },
        });
        return true;
      }
    }

    // Find next target: non-boss monsters first, then boss when all others dead
    let targetMonster = null;

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
    } else {
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

      const leadPos = newLeadPosition;
      const newExplored = markExplored(mazeDungeon.explored, leadPos, VISION_RANGE);

      // Check for treasure pickup - any hero stepping on a treasure tile collects it
      let updatedGrid = mazeDungeon.grid;
      for (const hero of newHeroes) {
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
        heroes: newHeroes,
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
