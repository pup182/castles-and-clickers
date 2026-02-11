// Combat Simulator - Headless dungeon run simulation for balance testing
// Run simulations via browser console: window.runSimulation()

import { CLASSES } from '../data/classes';
import { getMonstersByTier, getBossByTier } from '../data/monsters';
import { SKILL_TREES, SKILL_TYPE, EFFECT_TYPE, TARGET_TYPE, getSkillById } from '../data/skillTrees';
import {
  rollInitiative,
  calculateDodgeChance,
  calculateDoubleAttackChance,
} from './constants';
import {
  applyPassiveEffects,
  getOnHitEffects,
  getOnKillEffects,
  getHealingBonuses,
} from './skillEngine';

// Simulation configuration
const SIM_CONFIG = {
  heroLevel: 10,
  dungeonLevel: 10,
  runsPerClass: 20,
  skillTier: 2, // 0-3, how many tiers of skills to unlock
  verbose: false,
};

// Get skills for a class up to a certain tier
function getSkillsForClass(classId, maxTier = 2) {
  const tree = SKILL_TREES[classId];
  if (!tree) return [];

  const skills = [];
  const tierCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };

  // Add skills by tier, respecting prerequisites
  for (let tier = 0; tier <= maxTier; tier++) {
    const tierSkills = tree.skills.filter(s => s.tier === tier);

    // For simulation, take a reasonable number of skills per tier
    const maxSkillsPerTier = tier === 0 ? 4 : tier === 3 ? 1 : 3;
    const selectedSkills = tierSkills.slice(0, maxSkillsPerTier);

    for (const skill of selectedSkills) {
      skills.push(skill.id);
      tierCounts[tier]++;
    }
  }

  return skills;
}

// Create a hero of a given class at a given level with skills
function createHero(classId, level = 10, skillTier = 2) {
  const classData = CLASSES[classId];
  if (!classData) return null;

  const stats = {
    maxHp: classData.baseStats.maxHp + (classData.growthPerLevel.maxHp * (level - 1)),
    attack: classData.baseStats.attack + (classData.growthPerLevel.attack * (level - 1)),
    defense: classData.baseStats.defense + (classData.growthPerLevel.defense * (level - 1)),
    speed: classData.baseStats.speed + (classData.growthPerLevel.speed * (level - 1)),
  };

  // Get skills from skill tree
  const skills = getSkillsForClass(classId, skillTier);

  // Apply stat bonuses from passive skills
  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (skill?.type === SKILL_TYPE.PASSIVE && skill.passive?.type === 'stat_bonus') {
      const bonusStats = skill.passive.stats || {};
      if (bonusStats.maxHp) stats.maxHp += bonusStats.maxHp;
      if (bonusStats.attack) stats.attack += bonusStats.attack;
      if (bonusStats.defense) stats.defense += bonusStats.defense;
      if (bonusStats.speed) stats.speed += bonusStats.speed;
    }
  }

  return {
    id: `hero_${classId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    classId,
    name: classData.name,
    level,
    stats: { ...stats, hp: stats.maxHp },
    skills,
    cooldowns: {},
    isHero: true,
    attackRange: classData.attackRange || 1,
  };
}

// Create a standard party (tank, healer, 2 DPS)
function createParty(level = 10, dpsClasses = ['mage', 'rogue'], skillTier = 2) {
  return [
    createHero('warrior', level, skillTier),
    createHero('cleric', level, skillTier),
    createHero(dpsClasses[0], level, skillTier),
    createHero(dpsClasses[1], level, skillTier),
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
      id: `monster_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

// Calculate damage with defense reduction and passive bonuses
function calculateDamage(attacker, defender, multiplier = 1.0, passiveBonuses = {}) {
  const damageMultiplier = passiveBonuses.damageMultiplier || 1.0;
  const baseDamage = attacker.stats.attack * multiplier * damageMultiplier;
  const defense = defender.stats.defense;
  // Damage reduction: defense / (defense + 50)
  const reduction = defense / (defense + 50);
  const finalDamage = Math.max(1, Math.floor(baseDamage * (1 - reduction)));
  return finalDamage;
}

// Simulate a single attack with passive bonuses
function simulateAttack(attacker, defender, stats, context = {}) {
  // Get passive bonuses
  const passiveBonuses = attacker.isHero && attacker.skills
    ? applyPassiveEffects(attacker, 'on_attack', context)
    : { damageMultiplier: 1.0, critChance: 0, dodgeChance: 0, lifestealPercent: 0, doubleAttackChance: 0, cleavePercent: 0 };

  // Base crit chance
  const dpsClasses = ['mage', 'ranger', 'rogue', 'necromancer', 'bard'];
  const baseCritChance = attacker.isHero && dpsClasses.includes(attacker.classId) ? 0.10 : 0.05;
  const totalCritChance = baseCritChance + (passiveBonuses.critChance || 0);

  // Check dodge (defender's passive dodge + speed-based dodge)
  const defenderPassives = defender.isHero && defender.skills
    ? applyPassiveEffects(defender, 'on_defend', {})
    : { dodgeChance: 0 };
  const baseDodgeChance = calculateDodgeChance(defender.stats.speed, attacker.stats.speed);
  const totalDodgeChance = baseDodgeChance + (defenderPassives.dodgeChance || 0);

  if (Math.random() < totalDodgeChance) {
    stats.dodges++;
    return { dodged: true, damage: 0 };
  }

  // Check crit
  const didCrit = Math.random() < totalCritChance;
  const critMultiplier = didCrit ? (1.5 + (passiveBonuses.critDamageBonus || 0)) : 1.0;

  const damage = calculateDamage(attacker, defender, critMultiplier, passiveBonuses);
  defender.stats.hp -= damage;

  if (didCrit) stats.crits++;
  stats.damageDealt += damage;

  // Lifesteal from passives
  if (attacker.isHero && passiveBonuses.lifestealPercent > 0) {
    const healAmount = Math.floor(damage * passiveBonuses.lifestealPercent / 100);
    attacker.stats.hp = Math.min(attacker.stats.maxHp, attacker.stats.hp + healAmount);
    stats.healingDone += healAmount;
  }

  // On-hit effects
  if (attacker.isHero && attacker.skills) {
    const onHitEffects = getOnHitEffects(attacker, damage);
    if (onHitEffects.healAmount > 0) {
      attacker.stats.hp = Math.min(attacker.stats.maxHp, attacker.stats.hp + onHitEffects.healAmount);
      stats.healingDone += onHitEffects.healAmount;
    }
  }

  // Check double attack (speed-based + passive bonus)
  const baseDoubleChance = calculateDoubleAttackChance(attacker.stats.speed, defender.stats.speed);
  const totalDoubleChance = baseDoubleChance + (passiveBonuses.doubleAttackChance || 0);

  if (Math.random() < totalDoubleChance) {
    stats.doubleAttacks++;
    const bonusDamage = calculateDamage(attacker, defender, 1.0, passiveBonuses);
    defender.stats.hp -= bonusDamage;
    stats.damageDealt += bonusDamage;
  }

  // Check if killed
  if (defender.stats.hp <= 0 && attacker.isHero && attacker.skills) {
    const onKillEffects = getOnKillEffects(attacker);
    if (onKillEffects.healAmount > 0 || onKillEffects.healPercent > 0) {
      const healAmount = onKillEffects.healAmount + Math.floor(attacker.stats.maxHp * onKillEffects.healPercent);
      attacker.stats.hp = Math.min(attacker.stats.maxHp, attacker.stats.hp + healAmount);
      stats.healingDone += healAmount;
    }
  }

  return { dodged: false, damage, crit: didCrit };
}

// Simulate healing with passive bonuses
function simulateHeal(healer, target, percentage, stats) {
  // Get healing bonuses from passives
  const healingBonuses = healer.isHero && healer.skills
    ? getHealingBonuses(healer)
    : { healingMultiplier: 1.0 };

  const baseHeal = Math.floor(target.stats.maxHp * percentage);
  const healAmount = Math.floor(baseHeal * healingBonuses.healingMultiplier);
  const actualHeal = Math.min(healAmount, target.stats.maxHp - target.stats.hp);
  target.stats.hp += actualHeal;
  stats.healingDone += actualHeal;
  return actualHeal;
}

// Get available active skills for a hero
function getAvailableActiveSkills(hero, cooldowns) {
  if (!hero.skills) return [];

  const available = [];
  for (const skillId of hero.skills) {
    const skill = getSkillById(skillId);
    if (!skill || skill.type !== SKILL_TYPE.ACTIVE) continue;

    const cooldownRemaining = cooldowns[skillId] || 0;
    if (cooldownRemaining <= 0) {
      available.push(skill);
    }
  }
  return available;
}

// Execute a skill ability
function executeSkillAbility(actor, skill, enemies, allies, stats) {
  const effect = skill.effect;
  const aliveEnemies = enemies.filter(e => e.stats.hp > 0);
  const aliveAllies = allies.filter(a => a.stats.hp > 0);

  // Get passive bonuses for damage calculations
  const passiveBonuses = actor.isHero && actor.skills
    ? applyPassiveEffects(actor, 'on_skill', {})
    : { damageMultiplier: 1.0 };

  switch (effect.type) {
    case EFFECT_TYPE.DAMAGE: {
      const targets = skill.targetType === TARGET_TYPE.ALL_ENEMIES
        ? aliveEnemies
        : [aliveEnemies[0]];

      for (const target of targets) {
        if (!target) continue;
        const damage = calculateDamage(actor, target, effect.multiplier, passiveBonuses);
        target.stats.hp -= damage;
        stats.damageDealt += damage;
        stats.skillDamage += damage;

        // Check crit for skills
        if (effect.alwaysCrit || Math.random() < 0.1) {
          stats.crits++;
        }
      }
      break;
    }

    case EFFECT_TYPE.HEAL: {
      const targets = skill.targetType === TARGET_TYPE.ALL_ALLIES
        ? aliveAllies
        : skill.targetType === TARGET_TYPE.LOWEST_HP_ALLY
          ? [aliveAllies.reduce((lowest, a) =>
              a.stats.hp / a.stats.maxHp < lowest.stats.hp / lowest.stats.maxHp ? a : lowest
            , aliveAllies[0])]
          : skill.targetType === TARGET_TYPE.SELF
            ? [actor]
            : [];

      const healPercent = effect.percentage ?? effect.percentOfMax ?? 0.2;
      for (const target of targets) {
        if (!target) continue;
        simulateHeal(actor, target, healPercent, stats);
      }
      break;
    }

    case EFFECT_TYPE.HOT: {
      // Heal over time - simplified: apply immediate partial heal
      const targets = skill.targetType === TARGET_TYPE.ALL_ALLIES ? aliveAllies : [aliveAllies[0]];
      const hotPercent = (effect.percentage ?? effect.percentPerTurn ?? 0.05) * (effect.duration || 3);
      for (const target of targets) {
        if (!target) continue;
        simulateHeal(actor, target, hotPercent, stats);
      }
      break;
    }

    case EFFECT_TYPE.DOT: {
      // Damage over time - simplified: apply immediate partial damage
      const target = aliveEnemies[0];
      if (target) {
        const dotDamage = Math.floor(actor.stats.attack * (effect.multiplier || 0.3) * (effect.duration || 3));
        target.stats.hp -= dotDamage;
        stats.damageDealt += dotDamage;
        stats.skillDamage += dotDamage;
      }
      break;
    }

    case EFFECT_TYPE.BUFF:
    case EFFECT_TYPE.DEBUFF:
    case EFFECT_TYPE.SHIELD:
      // Simplified: buffs/debuffs/shields are tracked but not fully simulated
      break;

    default:
      break;
  }

  // Set cooldown
  actor.cooldowns[skill.id] = skill.cooldown;
}

// Choose best skill to use
function chooseBestSkill(hero, enemies, allies) {
  const available = getAvailableActiveSkills(hero, hero.cooldowns);
  if (available.length === 0) return null;

  const aliveEnemies = enemies.filter(e => e.stats.hp > 0);
  const aliveAllies = allies.filter(a => a.stats.hp > 0);

  // Priority: emergency heal > AOE damage > single target damage > buff
  const lowHpAllies = aliveAllies.filter(a => a.stats.hp / a.stats.maxHp < 0.5);

  // 1. Emergency heal if ally below 50%
  if (lowHpAllies.length > 0) {
    const healSkill = available.find(s =>
      s.effect?.type === EFFECT_TYPE.HEAL || s.effect?.type === EFFECT_TYPE.HOT
    );
    if (healSkill) return healSkill;
  }

  // 2. AOE damage if 2+ enemies
  if (aliveEnemies.length >= 2) {
    const aoeSkill = available.find(s =>
      s.targetType === TARGET_TYPE.ALL_ENEMIES && s.effect?.type === EFFECT_TYPE.DAMAGE
    );
    if (aoeSkill) return aoeSkill;
  }

  // 3. Any damage skill
  const damageSkill = available.find(s => s.effect?.type === EFFECT_TYPE.DAMAGE);
  if (damageSkill) return damageSkill;

  // 4. DOT skill
  const dotSkill = available.find(s => s.effect?.type === EFFECT_TYPE.DOT);
  if (dotSkill) return dotSkill;

  // 5. Any available skill
  return available[0];
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
      for (const skillId in unit.cooldowns) {
        if (unit.cooldowns[skillId] > 0) {
          unit.cooldowns[skillId]--;
        }
      }

      const isHero = unit.isHero;
      const enemyList = isHero ? monsters.filter(m => m.stats.hp > 0) : heroes.filter(h => h.stats.hp > 0);
      const allyList = isHero ? heroes.filter(h => h.stats.hp > 0) : monsters.filter(m => m.stats.hp > 0);

      if (enemyList.length === 0) continue;

      // Get stats tracker for this unit
      const stats = isHero ? heroStats[unit.classId] : { damageDealt: 0, healingDone: 0, crits: 0, dodges: 0, skillDamage: 0, doubleAttacks: 0 };

      // Check if should use skill
      let usedSkill = false;
      if (isHero) {
        const skill = chooseBestSkill(unit, enemyList, allyList);
        if (skill) {
          executeSkillAbility(unit, skill, enemyList, allyList, stats);
          usedSkill = true;
        }
      }

      // Basic attack if no skill used
      if (!usedSkill && enemyList.length > 0) {
        const target = enemyList[Math.floor(Math.random() * enemyList.length)];
        simulateAttack(unit, target, stats, { isFirstAttack: turn === 1 });
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

  console.log(`\n${'='.repeat(70)}`);
  console.log(`COMBAT SIMULATION - Level ${cfg.heroLevel} Heroes vs Level ${cfg.dungeonLevel} Dungeon`);
  console.log(`Skill Tier: ${cfg.skillTier} | Runs per class: ${cfg.runsPerClass}`);
  console.log(`${'='.repeat(70)}\n`);

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
      const party = createParty(cfg.heroLevel, [dpsClass, dpsClass], cfg.skillTier);
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
  console.log('-'.repeat(90));
  console.log(
    'Class'.padEnd(14) +
    'Win%'.padStart(8) +
    'AvgDmg'.padStart(10) +
    'SkillDmg'.padStart(10) +
    'Crits'.padStart(8) +
    'Dodges'.padStart(8) +
    'DblAtk'.padStart(8) +
    'Heal'.padStart(8) +
    'Deaths'.padStart(8)
  );
  console.log('-'.repeat(90));

  for (const [classId, data] of Object.entries(results)) {
    console.log(
      classId.padEnd(14) +
      `${data.winRate}%`.padStart(8) +
      data.avgDamage.toString().padStart(10) +
      data.avgSkillDamage.toString().padStart(10) +
      data.avgCrits.padStart(8) +
      data.avgDodges.padStart(8) +
      data.avgDoubleAttacks.padStart(8) +
      data.avgHealing.toString().padStart(8) +
      data.deathRate.padStart(8)
    );
  }

  console.log('-'.repeat(90));
  console.log('\n');

  // Also test tank and healer classes
  console.log('TANK CLASS COMPARISON (Solo tank vs Level 5 Dungeon)');
  console.log('-'.repeat(70));

  const tankClasses = ['warrior', 'paladin', 'knight'];
  const tankResults = {};

  for (const tankClass of tankClasses) {
    const classResults = { wins: 0, losses: 0, totalDamage: 0, totalDeaths: 0 };

    for (let run = 0; run < cfg.runsPerClass; run++) {
      const party = [createHero(tankClass, cfg.heroLevel, cfg.skillTier)];
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
  console.log('-'.repeat(70));

  const healerClasses = ['cleric', 'druid', 'shaman'];
  const healerResults = {};

  for (const healerClass of healerClasses) {
    const classResults = { wins: 0, losses: 0, totalHealing: 0, totalDamage: 0 };

    for (let run = 0; run < cfg.runsPerClass; run++) {
      const party = [
        createHero('warrior', cfg.heroLevel, cfg.skillTier),
        createHero(healerClass, cfg.heroLevel, cfg.skillTier),
        createHero('mage', cfg.heroLevel, cfg.skillTier),
        createHero('rogue', cfg.heroLevel, cfg.skillTier),
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

  console.log(`\n${'='.repeat(70)}\n`);

  return { dps: results, tanks: tankResults, healers: healerResults };
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  window.runSimulation = (config) => runClassSimulations(config);
  window.simConfig = SIM_CONFIG;
  console.log('Combat Simulator loaded! Run window.runSimulation() to test class balance.');
  console.log('Options: window.runSimulation({ heroLevel: 15, dungeonLevel: 15, runsPerClass: 50, skillTier: 3 })');
  console.log('skillTier: 0-3 (how many tiers of skills heroes have unlocked)');
}

export default runClassSimulations;
