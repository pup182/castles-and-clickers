/**
 * Combat movement resolution - A* pathfinding with fallback directional movement.
 * Extracted from useCombat.js to reduce file size.
 */

import { getDistance } from './roomBasedDungeon';
import { findPath, isWalkable } from './mazeGenerator';
import { calculateMoveDistance } from './constants';
import { getUniquePassiveBonuses, getUniqueStateSnapshot } from './uniqueEngine';
import { buildHeroHpMap, getNextTurnState } from './combatHelpers';

/**
 * Resolve movement when target is out of range.
 * Mutates ctx (hero/monster positions).
 * Returns true if an early return was triggered (no grid case), false otherwise.
 */
export const resolveMovement = (ctx, actor, target, range) => {
  const {
    newHeroes, newMonsters, newBuffs, newStatusEffects,
    newSkillCooldowns, newMonsterCooldowns, newKillBonusStacks,
    newTurnOrder, newCombatMonsters, newUsedPhoenixRevives, newReactiveHealUsed,
    activeCombatMonsters, heroes, mazeDungeon, roomCombat,
    findHeroIndex, findMonsterIndex, updateRoomCombat, syncHeroHp,
  } = ctx;

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
  const currentOccupied = new Set(occupied.map(p => `${p.x},${p.y}`));

  const grid = mazeDungeon ? mazeDungeon.grid : null;
  if (!grid) {
    // No grid available - do batch update and early return
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

  return false;
};
