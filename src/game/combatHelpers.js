/**
 * Combat helper utilities - pure functions and shared helpers for combat tick processing.
 * Extracted from useCombat.js to reduce file size.
 */

import { getDistance } from './roomBasedDungeon';
import { isHeroInvisible } from './uniqueEngine';
import { MONSTER_ABILITIES } from '../data/monsterAbilities';
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './constants';

// OPTIMIZATION: Build hero HP map without intermediate arrays (avoids Object.fromEntries + map)
export const buildHeroHpMap = (heroes) => {
  const map = {};
  for (let i = 0; i < heroes.length; i++) {
    const h = heroes[i];
    // Skip summons (pets, clones, undead) - they don't persist between dungeons
    if (h.isPet || h.isClone || h.isUndead) continue;
    map[h.id] = h.stats.hp;
  }
  return map;
};

// Get current actor from turn order
export const getCurrentActor = (roomCombat) => {
  if (!roomCombat) return null;

  const { turnOrder, currentTurnIndex, heroes: combatHeroes, monsters } = roomCombat;
  if (!turnOrder || turnOrder.length === 0) return null;

  const currentId = turnOrder[currentTurnIndex];
  const hero = combatHeroes.find(h => h.id === currentId && h.stats.hp > 0);
  if (hero) return { ...hero, isHero: true };

  const monster = monsters.find(m => m.id === currentId && m.stats.hp > 0);
  if (monster) return { ...monster, isHero: false };

  return null;
};

// OPTIMIZATION: Calculate next turn state without updating (for batching)
export const getNextTurnState = (roomCombat, heroesOverride = null, monstersOverride = null) => {
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
};

// Helper to update viewport to keep combat units visible
export const calculateCombatViewport = (heroesArr, monstersArr, combatMonsterIdSet, viewport, mazeDungeon) => {
  const currentViewport = viewport || { x: 0, y: 0 };
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

// Helper to handle unit death - clears buffs/debuffs and adds ghost status
// Also handles death explosion affix for monsters
export const handleUnitDeath = (ctx, unitId, monster = null) => {
  const { newHeroes, newMonsters, newBuffs, newStatusEffects, findHeroIndex, addCombatLog, addEffect } = ctx;

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
    for (const h of newHeroes) {
      if (h.stats.hp <= 0) continue;
      const dist = Math.abs(h.position.x - monster.position.x) + Math.abs(h.position.y - monster.position.y);
      if (dist <= explosionRange) {
        const heroIdx = findHeroIndex(h.id);
        if (heroIdx !== -1) {
          newHeroes[heroIdx].stats.hp = Math.max(1, newHeroes[heroIdx].stats.hp - explosionDamage);
          addCombatLog({ type: 'system', message: `${monster.name} explodes! ${h.name} takes ${explosionDamage} damage!` });
          addEffect({ type: 'damage', position: h.position, damage: explosionDamage });
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
export const handleMonsterDamageTriggers = (ctx, monster, monsterIdx) => {
  const { newMonsters, addCombatLog, addEffect } = ctx;

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

// Find the best target for an actor. Returns { target, minDist }
export const findTarget = (actor, aliveHeroes, activeCombatMonsters, newBuffs) => {
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

  return { target, minDist };
};
