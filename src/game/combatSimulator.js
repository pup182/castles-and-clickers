// Combat Simulator - Headless dungeon run simulation for balance testing
// Run simulations via browser console: window.runSimulation()

import { CLASSES, CLASS_LIST } from '../data/classes';
import { getMonstersByTier, getBossByTier } from '../data/monsters';
import {
  rollInitiative,
  calculateDodgeChance,
  calculateDoubleAttackChance,
} from './constants';

// Simulation configuration
const SIM_CONFIG = {
  heroLevel: 10,
  dungeonLevel: 10,
  runsPerClass: 20,
  verbose: false,
};

// Create a hero of a given class at a given level
function createHero(classId, level = 10) {
  const classData = CLASSES[classId];
  if (!classData) return null;

  const stats = {
    maxHp: classData.baseStats.maxHp + (classData.growthPerLevel.maxHp * (level - 1)),
    attack: classData.baseStats.attack + (classData.growthPerLevel.attack * (level - 1)),
    defense: classData.baseStats.defense + (classData.growthPerLevel.defense * (level - 1)),
    speed: classData.baseStats.speed + (classData.growthPerLevel.speed * (level - 1)),
  };

  return {
    id: `hero_${classId}_${Date.now()}`,
    classId,
    name: classData.name,
    level,
    stats: { ...stats, hp: stats.maxHp },
    abilities: classData.abilities || [],
    cooldowns: {},
    isHero: true,
    attackRange: classData.attackRange || 1,
  };
}

// Create a standard party (tank, healer, 2 DPS)
function createParty(level = 10, dpsClasses = ['mage', 'rogue']) {
  return [
    createHero('warrior', level),
    createHero('cleric', level),
    createHero(dpsClasses[0], level),
    createHero(dpsClasses[1], level),
  ].filter(Boolean);
}

// Create monsters for a simulated encounter
function createMonsters(dungeonLevel, count = 3) {
  const tier = Math.min(4, Math.ceil(dungeonLevel / 5));
  const scaleFactor = Math.pow(1.08, dungeonLevel - 1);
  const possibleMonsters = getMonstersByTier(tier);

  if (possibleMonsters.length === 0) return [];

  const monsters = [];
  for (let i = 0; i < count; i++) {
    const template = possibleMonsters[Math.floor(Math.random() * possibleMonsters.length)];
    monsters.push({
      id: `monster_${i}_${Date.now()}`,
      name: template.name,
      isBoss: false,
      isHero: false,
      stats: {
        maxHp: Math.floor(template.baseStats.maxHp * scaleFactor),
        hp: Math.floor(template.baseStats.maxHp * scaleFactor),
        attack: Math.floor(template.baseStats.attack * scaleFactor),
        defense: Math.floor(template.baseStats.defense * scaleFactor),
        speed: template.baseStats.speed,
      },
      abilities: template.abilities || [],
      cooldowns: {},
    });
  }

  return monsters;
}

// Create a boss monster
function createBoss(dungeonLevel) {
  const tier = Math.min(4, Math.ceil(dungeonLevel / 5));
  const scaleFactor = Math.pow(1.08, dungeonLevel - 1);
  const boss = getBossByTier(tier);

  if (!boss) return null;

  return {
    id: `boss_${Date.now()}`,
    name: boss.name,
    isBoss: true,
    isHero: false,
    stats: {
      maxHp: Math.floor(boss.baseStats.maxHp * scaleFactor),
      hp: Math.floor(boss.baseStats.maxHp * scaleFactor),
      attack: Math.floor(boss.baseStats.attack * scaleFactor),
      defense: Math.floor(boss.baseStats.defense * scaleFactor),
      speed: boss.baseStats.speed,
    },
    abilities: boss.abilities || [],
    cooldowns: {},
  };
}

// Calculate damage with defense reduction
function calculateDamage(attacker, defender, multiplier = 1.0) {
  const baseDamage = attacker.stats.attack * multiplier;
  const defense = defender.stats.defense;
  // Damage reduction: defense / (defense + 50)
  const reduction = defense / (defense + 50);
  const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - reduction)));
  return finalDamage;
}

// Simulate a single attack
function simulateAttack(attacker, defender, stats, isCrit = false) {
  const dpsClasses = ['mage', 'ranger', 'rogue', 'necromancer', 'bard'];
  const baseCritChance = attacker.isHero && dpsClasses.includes(attacker.classId) ? 0.10 : 0.05;

  // Check dodge
  const dodgeChance = calculateDodgeChance(defender.stats.speed, attacker.stats.speed);
  if (Math.random() < dodgeChance) {
    stats.dodges++;
    return { dodged: true, damage: 0 };
  }

  // Check crit
  const didCrit = isCrit || Math.random() < baseCritChance;
  const critMultiplier = didCrit ? 1.5 : 1.0;

  const damage = calculateDamage(attacker, defender, critMultiplier);
  defender.stats.hp -= damage;

  if (didCrit) stats.crits++;
  stats.damageDealt += damage;

  // Check double attack
  const doubleChance = calculateDoubleAttackChance(attacker.stats.speed, defender.stats.speed);
  if (Math.random() < doubleChance) {
    stats.doubleAttacks++;
    const bonusDamage = calculateDamage(attacker, defender, 1.0);
    defender.stats.hp -= bonusDamage;
    stats.damageDealt += bonusDamage;
  }

  return { dodged: false, damage, crit: didCrit };
}

// Simulate healing
function simulateHeal(healer, target, percentage, stats) {
  const healAmount = Math.floor(target.stats.maxHp * percentage);
  const actualHeal = Math.min(healAmount, target.stats.maxHp - target.stats.hp);
  target.stats.hp += actualHeal;
  stats.healingDone += actualHeal;
  return actualHeal;
}

// Use an ability
function executeAbility(actor, ability, targets, allies, stats) {
  const effect = ability.effect;

  switch (effect.type) {
    case 'damage': {
      const target = targets[0];
      if (target && target.stats.hp > 0) {
        const damage = calculateDamage(actor, target, effect.multiplier);
        target.stats.hp -= damage;
        stats.damageDealt += damage;
        stats.skillDamage += damage;
      }
      break;
    }
    case 'aoe_damage': {
      for (const target of targets) {
        if (target.stats.hp > 0) {
          const damage = calculateDamage(actor, target, effect.multiplier);
          target.stats.hp -= damage;
          stats.damageDealt += damage;
          stats.skillDamage += damage;
        }
      }
      break;
    }
    case 'heal_all': {
      for (const ally of allies) {
        if (ally.stats.hp > 0) {
          simulateHeal(actor, ally, effect.percentage, stats);
        }
      }
      break;
    }
    case 'heal_single': {
      // Heal lowest HP ally
      const lowestHpAlly = allies
        .filter(a => a.stats.hp > 0)
        .sort((a, b) => (a.stats.hp / a.stats.maxHp) - (b.stats.hp / b.stats.maxHp))[0];
      if (lowestHpAlly) {
        simulateHeal(actor, lowestHpAlly, effect.percentage, stats);
      }
      break;
    }
    case 'drain': {
      const target = targets[0];
      if (target && target.stats.hp > 0) {
        const damage = calculateDamage(actor, target, effect.multiplier);
        target.stats.hp -= damage;
        stats.damageDealt += damage;
        stats.skillDamage += damage;
        const healAmount = Math.floor(damage * effect.healPercent);
        actor.stats.hp = Math.min(actor.stats.maxHp, actor.stats.hp + healAmount);
        stats.healingDone += healAmount;
      }
      break;
    }
    case 'heal_buff': {
      for (const ally of allies) {
        if (ally.stats.hp > 0) {
          simulateHeal(actor, ally, effect.healPercent, stats);
        }
      }
      break;
    }
    default:
      break;
  }

  actor.cooldowns[ability.id] = ability.cooldown;
}

// Simulate a single combat encounter
function simulateCombat(heroes, monsters, heroStats) {
  const maxTurns = 100;
  let turn = 0;

  // Reset cooldowns
  for (const hero of heroes) {
    hero.cooldowns = {};
  }
  for (const monster of monsters) {
    monster.cooldowns = {};
  }

  while (turn < maxTurns) {
    turn++;

    // Check win/lose conditions
    const aliveHeroes = heroes.filter(h => h.stats.hp > 0);
    const aliveMonsters = monsters.filter(m => m.stats.hp > 0);

    if (aliveMonsters.length === 0) {
      return { victory: true, turns: turn, heroesAlive: aliveHeroes.length };
    }
    if (aliveHeroes.length === 0) {
      return { victory: false, turns: turn, heroesAlive: 0 };
    }

    // Create turn order
    const allUnits = [...aliveHeroes, ...aliveMonsters];
    allUnits.sort((a, b) => {
      const initA = rollInitiative(a);
      const initB = rollInitiative(b);
      if (initB !== initA) return initB - initA;
      return a.isHero ? -1 : 1;
    });

    // Process each unit's turn
    for (const unit of allUnits) {
      if (unit.stats.hp <= 0) continue;

      // Reduce cooldowns
      for (const abilityId in unit.cooldowns) {
        if (unit.cooldowns[abilityId] > 0) {
          unit.cooldowns[abilityId]--;
        }
      }

      const isHero = unit.isHero;
      const enemies = isHero ? monsters.filter(m => m.stats.hp > 0) : heroes.filter(h => h.stats.hp > 0);
      const allies = isHero ? heroes.filter(h => h.stats.hp > 0) : monsters.filter(m => m.stats.hp > 0);

      if (enemies.length === 0) continue;

      // Get stats tracker for this unit
      const stats = isHero ? heroStats[unit.classId] : { damageDealt: 0, healingDone: 0, crits: 0, dodges: 0, skillDamage: 0, doubleAttacks: 0 };

      // Check if should use ability
      let usedAbility = false;
      for (const ability of unit.abilities || []) {
        if (!unit.cooldowns[ability.id] || unit.cooldowns[ability.id] <= 0) {
          // Simple AI: use healing abilities when allies are hurt, damage abilities otherwise
          const effect = ability.effect;
          const shouldUseHeal = effect.type?.includes('heal') &&
            allies.some(a => a.stats.hp < a.stats.maxHp * 0.7);
          const shouldUseDamage = effect.type?.includes('damage') || effect.type === 'drain';

          if (shouldUseHeal || shouldUseDamage) {
            executeAbility(unit, ability, enemies, allies, stats);
            usedAbility = true;
            break;
          }
        }
      }

      // Basic attack if no ability used
      if (!usedAbility && enemies.length > 0) {
        const target = enemies[Math.floor(Math.random() * enemies.length)];
        simulateAttack(unit, target, stats);

        // Track damage taken by heroes
        if (!isHero && target.isHero && heroStats[target.classId]) {
          // This is monster attacking hero - tracked separately
        }
      }
    }
  }

  // Timeout - count as defeat
  return { victory: false, turns: maxTurns, heroesAlive: heroes.filter(h => h.stats.hp > 0).length };
}

// Run a full dungeon simulation (multiple encounters + boss)
function simulateDungeonRun(party, dungeonLevel) {
  // Initialize stats for each hero
  const heroStats = {};
  for (const hero of party) {
    heroStats[hero.classId] = {
      damageDealt: 0,
      healingDone: 0,
      crits: 0,
      dodges: 0,
      skillDamage: 0,
      doubleAttacks: 0,
      deaths: 0,
    };
  }

  // Reset party HP
  for (const hero of party) {
    hero.stats.hp = hero.stats.maxHp;
  }

  const encounterCount = 3 + Math.floor(dungeonLevel / 5);

  // Run encounters
  for (let i = 0; i < encounterCount; i++) {
    const monsterCount = 2 + Math.floor(Math.random() * 2);
    const monsters = createMonsters(dungeonLevel, monsterCount);

    const result = simulateCombat(party, monsters, heroStats);

    if (!result.victory) {
      // Track deaths
      for (const hero of party) {
        if (hero.stats.hp <= 0) {
          heroStats[hero.classId].deaths++;
        }
      }
      return { success: false, heroStats, encounters: i + 1 };
    }

    // Partial HP recovery between encounters
    for (const hero of party) {
      if (hero.stats.hp > 0) {
        hero.stats.hp = Math.min(hero.stats.maxHp, hero.stats.hp + Math.floor(hero.stats.maxHp * 0.1));
      }
    }
  }

  // Boss fight
  const boss = createBoss(dungeonLevel);
  if (boss) {
    const bossResult = simulateCombat(party, [boss], heroStats);
    if (!bossResult.victory) {
      for (const hero of party) {
        if (hero.stats.hp <= 0) {
          heroStats[hero.classId].deaths++;
        }
      }
      return { success: false, heroStats, encounters: encounterCount + 1, bossReached: true };
    }
  }

  return { success: true, heroStats, encounters: encounterCount + 1 };
}

// Run simulations for all classes and report results
export function runClassSimulations(config = {}) {
  const cfg = { ...SIM_CONFIG, ...config };
  const results = {};

  console.log(`\n${'='.repeat(60)}`);
  console.log(`COMBAT SIMULATION - Level ${cfg.heroLevel} Heroes vs Level ${cfg.dungeonLevel} Dungeon`);
  console.log(`Running ${cfg.runsPerClass} simulations per class combination`);
  console.log(`${'='.repeat(60)}\n`);

  // Test each DPS class with standard party
  const dpsClasses = ['mage', 'rogue', 'ranger', 'necromancer'];

  for (const dpsClass of dpsClasses) {
    const classResults = {
      wins: 0,
      losses: 0,
      totalDamage: 0,
      totalHealing: 0,
      totalCrits: 0,
      totalDodges: 0,
      totalSkillDamage: 0,
      totalDoubleAttacks: 0,
      totalDeaths: 0,
      avgEncounters: 0,
    };

    for (let run = 0; run < cfg.runsPerClass; run++) {
      const party = createParty(cfg.heroLevel, [dpsClass, dpsClass]);
      const result = simulateDungeonRun(party, cfg.dungeonLevel);

      if (result.success) {
        classResults.wins++;
      } else {
        classResults.losses++;
      }

      classResults.avgEncounters += result.encounters;

      // Aggregate stats for the DPS class
      const dpsStats = result.heroStats[dpsClass];
      if (dpsStats) {
        classResults.totalDamage += dpsStats.damageDealt;
        classResults.totalHealing += dpsStats.healingDone;
        classResults.totalCrits += dpsStats.crits;
        classResults.totalDodges += dpsStats.dodges;
        classResults.totalSkillDamage += dpsStats.skillDamage;
        classResults.totalDoubleAttacks += dpsStats.doubleAttacks;
        classResults.totalDeaths += dpsStats.deaths;
      }
    }

    classResults.avgEncounters /= cfg.runsPerClass;
    classResults.winRate = (classResults.wins / cfg.runsPerClass * 100).toFixed(1);
    classResults.avgDamage = Math.floor(classResults.totalDamage / cfg.runsPerClass);
    classResults.avgHealing = Math.floor(classResults.totalHealing / cfg.runsPerClass);
    classResults.avgCrits = (classResults.totalCrits / cfg.runsPerClass).toFixed(1);
    classResults.avgDodges = (classResults.totalDodges / cfg.runsPerClass).toFixed(1);
    classResults.avgSkillDamage = Math.floor(classResults.totalSkillDamage / cfg.runsPerClass);
    classResults.avgDoubleAttacks = (classResults.totalDoubleAttacks / cfg.runsPerClass).toFixed(1);
    classResults.deathRate = (classResults.totalDeaths / cfg.runsPerClass).toFixed(2);

    results[dpsClass] = classResults;
  }

  // Print results table
  console.log('DPS CLASS COMPARISON (Party: Warrior + Cleric + 2x DPS)');
  console.log('-'.repeat(80));
  console.log(
    'Class'.padEnd(12) +
    'Win%'.padStart(8) +
    'AvgDmg'.padStart(10) +
    'SkillDmg'.padStart(10) +
    'Crits'.padStart(8) +
    'Dodges'.padStart(8) +
    'DblAtk'.padStart(8) +
    'Deaths'.padStart(8)
  );
  console.log('-'.repeat(80));

  for (const [classId, data] of Object.entries(results)) {
    console.log(
      classId.padEnd(12) +
      `${data.winRate}%`.padStart(8) +
      data.avgDamage.toString().padStart(10) +
      data.avgSkillDamage.toString().padStart(10) +
      data.avgCrits.padStart(8) +
      data.avgDodges.padStart(8) +
      data.avgDoubleAttacks.padStart(8) +
      data.deathRate.padStart(8)
    );
  }

  console.log('-'.repeat(80));
  console.log('\n');

  // Also test tank and healer classes
  console.log('TANK CLASS COMPARISON (Solo tank vs Level 5 Dungeon)');
  console.log('-'.repeat(60));

  const tankClasses = ['warrior', 'paladin', 'knight'];
  const tankResults = {};

  for (const tankClass of tankClasses) {
    const classResults = { wins: 0, losses: 0, totalDamage: 0, totalDeaths: 0 };

    for (let run = 0; run < cfg.runsPerClass; run++) {
      const party = [createHero(tankClass, cfg.heroLevel)];
      const result = simulateDungeonRun(party, 5); // Lower level for solo

      if (result.success) classResults.wins++;
      else classResults.losses++;

      const stats = result.heroStats[tankClass];
      if (stats) {
        classResults.totalDamage += stats.damageDealt;
        classResults.totalDeaths += stats.deaths;
      }
    }

    classResults.winRate = (classResults.wins / cfg.runsPerClass * 100).toFixed(1);
    classResults.avgDamage = Math.floor(classResults.totalDamage / cfg.runsPerClass);
    tankResults[tankClass] = classResults;

    console.log(`${tankClass.padEnd(12)} Win: ${classResults.winRate}%  AvgDmg: ${classResults.avgDamage}`);
  }

  console.log('\n');

  // Healer comparison
  console.log('HEALER CLASS COMPARISON (Party: Warrior + Healer + Mage + Rogue)');
  console.log('-'.repeat(60));

  const healerClasses = ['cleric', 'druid', 'shaman'];
  const healerResults = {};

  for (const healerClass of healerClasses) {
    const classResults = { wins: 0, losses: 0, totalHealing: 0, totalDamage: 0 };

    for (let run = 0; run < cfg.runsPerClass; run++) {
      const party = [
        createHero('warrior', cfg.heroLevel),
        createHero(healerClass, cfg.heroLevel),
        createHero('mage', cfg.heroLevel),
        createHero('rogue', cfg.heroLevel),
      ];
      const result = simulateDungeonRun(party, cfg.dungeonLevel);

      if (result.success) classResults.wins++;
      else classResults.losses++;

      const stats = result.heroStats[healerClass];
      if (stats) {
        classResults.totalHealing += stats.healingDone;
        classResults.totalDamage += stats.damageDealt;
      }
    }

    classResults.winRate = (classResults.wins / cfg.runsPerClass * 100).toFixed(1);
    classResults.avgHealing = Math.floor(classResults.totalHealing / cfg.runsPerClass);
    classResults.avgDamage = Math.floor(classResults.totalDamage / cfg.runsPerClass);
    healerResults[healerClass] = classResults;

    console.log(`${healerClass.padEnd(12)} Win: ${classResults.winRate}%  AvgHeal: ${classResults.avgHealing}  AvgDmg: ${classResults.avgDamage}`);
  }

  console.log(`\n${'='.repeat(60)}\n`);

  return { dps: results, tanks: tankResults, healers: healerResults };
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  window.runSimulation = (config) => runClassSimulations(config);
  window.simConfig = SIM_CONFIG;
  console.log('Combat Simulator loaded! Run window.runSimulation() to test class balance.');
  console.log('Options: window.runSimulation({ heroLevel: 15, dungeonLevel: 15, runsPerClass: 50 })');
}

export default runClassSimulations;
