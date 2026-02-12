import { calculateHeroStats } from '../store/gameStore';
import { CLASSES } from '../data/classes';

// Initialize combat state
export const initializeCombat = (heroes, monsters) => {
  const heroUnits = heroes.map(hero => {
    const stats = calculateHeroStats(hero, heroes);
    const classData = CLASSES[hero.classId];
    return {
      id: hero.id,
      name: hero.name,
      emoji: classData.emoji,
      isHero: true,
      stats: {
        ...stats,
        hp: stats.maxHp,
      },
      abilities: classData.abilities.map(a => ({
        ...a,
        currentCooldown: 0,
      })),
      level: hero.level,
    };
  });

  const monsterUnits = monsters.map(monster => ({
    id: monster.id,
    name: monster.name,
    emoji: monster.emoji,
    isHero: false,
    isBoss: monster.isBoss,
    stats: { ...monster.stats },
    xpReward: monster.xpReward,
    goldReward: monster.goldReward,
  }));

  // Determine turn order by speed
  const allUnits = [...heroUnits, ...monsterUnits].sort(
    (a, b) => b.stats.speed - a.stats.speed
  );

  return {
    heroes: heroUnits,
    monsters: monsterUnits,
    turnOrder: allUnits.map(u => u.id),
    currentTurnIndex: 0,
    round: 1,
    isComplete: false,
    victory: false,
  };
};

// Process one combat tick
export const processCombatTick = (combat) => {
  if (combat.isComplete) return { combat, logs: [] };

  const logs = [];
  const allUnits = [...combat.heroes, ...combat.monsters];

  // Get current actor
  const currentActorId = combat.turnOrder[combat.currentTurnIndex];
  let actor = allUnits.find(u => u.id === currentActorId);

  // Skip dead units
  while (actor && actor.stats.hp <= 0) {
    combat.currentTurnIndex = (combat.currentTurnIndex + 1) % combat.turnOrder.length;
    if (combat.currentTurnIndex === 0) {
      combat.round++;
    }
    const nextActorId = combat.turnOrder[combat.currentTurnIndex];
    actor = allUnits.find(u => u.id === nextActorId);
  }

  if (!actor) {
    // All units somehow dead?
    combat.isComplete = true;
    return { combat, logs };
  }

  // Determine targets
  const isHeroActor = actor.isHero;
  const enemies = isHeroActor
    ? combat.monsters.filter(m => m.stats.hp > 0)
    : combat.heroes.filter(h => h.stats.hp > 0);
  const allies = isHeroActor
    ? combat.heroes.filter(h => h.stats.hp > 0)
    : combat.monsters.filter(m => m.stats.hp > 0);

  if (enemies.length === 0) {
    combat.isComplete = true;
    combat.victory = isHeroActor || actor.isHero;
    return { combat, logs };
  }

  // Check for ability use (heroes only)
  let usedAbility = null;
  if (actor.isHero && actor.abilities) {
    for (const ability of actor.abilities) {
      if (ability.currentCooldown === 0) {
        usedAbility = ability;
        ability.currentCooldown = ability.cooldown;
        break;
      }
    }
    // Reduce cooldowns
    actor.abilities.forEach(a => {
      if (a.currentCooldown > 0) a.currentCooldown--;
    });
  }

  // Execute action
  if (usedAbility) {
    const result = executeAbility(actor, usedAbility, enemies, allies);
    logs.push(...result.logs);
  } else {
    // Basic attack
    const target = enemies[Math.floor(Math.random() * enemies.length)];
    const damage = calculateDamage(actor.stats.attack, target.stats.defense);
    target.stats.hp = Math.max(0, target.stats.hp - damage);

    logs.push({
      type: 'attack',
      actor: { name: actor.name, emoji: actor.emoji },
      target: { name: target.name, emoji: target.emoji },
      damage,
      targetHp: target.stats.hp,
      targetMaxHp: target.stats.maxHp,
    });

    if (target.stats.hp <= 0) {
      logs.push({
        type: 'death',
        target: { name: target.name, emoji: target.emoji },
        isHero: target.isHero,
      });
    }
  }

  // Check for victory/defeat
  const heroesAlive = combat.heroes.filter(h => h.stats.hp > 0).length;
  const monstersAlive = combat.monsters.filter(m => m.stats.hp > 0).length;

  if (monstersAlive === 0) {
    combat.isComplete = true;
    combat.victory = true;
    logs.push({ type: 'victory' });
  } else if (heroesAlive === 0) {
    combat.isComplete = true;
    combat.victory = false;
    logs.push({ type: 'defeat' });
  }

  // Next turn
  combat.currentTurnIndex = (combat.currentTurnIndex + 1) % combat.turnOrder.length;
  if (combat.currentTurnIndex === 0) {
    combat.round++;
  }

  return { combat: { ...combat }, logs };
};

// Calculate damage with defense reduction
const calculateDamage = (attack, defense) => {
  const baseDamage = Math.max(1, attack - defense * 0.5);
  const variance = 0.8 + Math.random() * 0.4; // 80-120% variance
  return Math.floor(baseDamage * variance);
};

// Execute ability effects
const executeAbility = (actor, ability, enemies, allies) => {
  const logs = [];
  const { effect } = ability;

  logs.push({
    type: 'ability',
    actor: { name: actor.name, emoji: actor.emoji },
    abilityName: ability.name,
  });

  switch (effect.type) {
    case 'damage': {
      const target = enemies[Math.floor(Math.random() * enemies.length)];
      const damage = Math.floor(calculateDamage(actor.stats.attack, target.stats.defense) * effect.multiplier);
      target.stats.hp = Math.max(0, target.stats.hp - damage);
      logs.push({
        type: 'attack',
        actor: { name: actor.name, emoji: actor.emoji },
        target: { name: target.name, emoji: target.emoji },
        damage,
        targetHp: target.stats.hp,
        targetMaxHp: target.stats.maxHp,
        isAbility: true,
      });
      if (target.stats.hp <= 0) {
        logs.push({
          type: 'death',
          target: { name: target.name, emoji: target.emoji },
          isHero: target.isHero,
        });
      }
      break;
    }

    case 'aoe_damage': {
      enemies.forEach(target => {
        const damage = Math.floor(calculateDamage(actor.stats.attack, target.stats.defense) * effect.multiplier);
        target.stats.hp = Math.max(0, target.stats.hp - damage);
        logs.push({
          type: 'attack',
          actor: { name: actor.name, emoji: actor.emoji },
          target: { name: target.name, emoji: target.emoji },
          damage,
          targetHp: target.stats.hp,
          targetMaxHp: target.stats.maxHp,
          isAbility: true,
        });
        if (target.stats.hp <= 0) {
          logs.push({
            type: 'death',
            target: { name: target.name, emoji: target.emoji },
            isHero: target.isHero,
          });
        }
      });
      break;
    }

    case 'heal_all': {
      allies.forEach(ally => {
        const healAmount = Math.floor(ally.stats.maxHp * effect.percentage);
        const oldHp = ally.stats.hp;
        ally.stats.hp = Math.min(ally.stats.maxHp, ally.stats.hp + healAmount);
        const actualHeal = ally.stats.hp - oldHp;
        if (actualHeal > 0) {
          logs.push({
            type: 'heal',
            actor: { name: actor.name, emoji: actor.emoji },
            target: { name: ally.name, emoji: ally.emoji },
            amount: actualHeal,
            targetHp: ally.stats.hp,
            targetMaxHp: ally.stats.maxHp,
          });
        }
      });
      break;
    }
  }

  return { logs };
};
