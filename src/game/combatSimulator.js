// Combat Simulator - Headless dungeon run simulation for balance testing
// Run simulations via browser console: window.runSimulation()

import { CLASSES } from '../data/classes';
import { MONSTERS, getMonstersByTier, getBossByTier } from '../data/monsters';
import { SKILL_TREES, SKILL_TYPE, EFFECT_TYPE, TARGET_TYPE, getSkillById } from '../data/skillTrees';
import { MONSTER_ABILITIES, ABILITY_TYPE, TARGET_TYPE as MONSTER_TARGET_TYPE } from '../data/monsterAbilities';
import { chooseMonsterAbility } from './monsterAI';
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

  // Apply stat bonuses from passive skills (stats can be on any passive type)
  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (skill?.type === SKILL_TYPE.PASSIVE && skill.passive?.stats) {
      const bonusStats = skill.passive.stats;
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
    tauntDuration: 0,
    position: { x: 5, y: 10 }, // Mock position for AI distance calcs
  };
}

// Create a standard party (tank, healer, 2 DPS)
function createParty(level = 10, dpsClasses = ['mage', 'rogue'], skillTier = 2) {
  const party = [
    createHero('warrior', level, skillTier),
    createHero('cleric', level, skillTier),
    createHero(dpsClasses[0], level, skillTier),
    createHero(dpsClasses[1], level, skillTier),
  ].filter(Boolean);

  // Give each hero a slightly different position
  party.forEach((hero, i) => {
    hero.position = { x: 5 + i, y: 10 };
  });

  return party;
}

// Speed scaling factor (0.25 = 25% of other stat scaling)
const SPEED_SCALE_FACTOR = 0.25;

// Create monsters for a simulated encounter
function createMonsters(dungeonLevel, count = 3) {
  const tier = Math.min(6, Math.ceil(dungeonLevel / 5));
  const scaleFactor = Math.pow(1.10, dungeonLevel - 1);
  const speedScaleFactor = 1 + (scaleFactor - 1) * SPEED_SCALE_FACTOR; // Partial speed scaling
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
        speed: Math.floor(template.baseStats.speed * speedScaleFactor),
      },
      abilities: template.abilities || [],
      cooldowns: {},
    });
  }

  return monsters;
}

// Create a boss monster
function createBoss(dungeonLevel) {
  const tier = Math.min(6, Math.ceil(dungeonLevel / 5));
  const scaleFactor = Math.pow(1.10, dungeonLevel - 1);
  const speedScaleFactor = 1 + (scaleFactor - 1) * SPEED_SCALE_FACTOR;
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
      speed: Math.floor(boss.baseStats.speed * speedScaleFactor),
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
function simulateAttack(attacker, defender, attackerStats, context = {}, defenderStats = null) {
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
    // Track dodge on the DEFENDER (the one who dodged)
    if (defenderStats) {
      defenderStats.dodges++;
    }
    return { dodged: true, damage: 0 };
  }

  // Check crit
  const didCrit = Math.random() < totalCritChance;
  const critMultiplier = didCrit ? (1.5 + (passiveBonuses.critDamageBonus || 0)) : 1.0;

  const damage = calculateDamage(attacker, defender, critMultiplier, passiveBonuses);
  defender.stats.hp -= damage;

  if (didCrit) attackerStats.crits++;
  attackerStats.damageDealt += damage;

  // Lifesteal from passives
  if (attacker.isHero && passiveBonuses.lifestealPercent > 0) {
    const healAmount = Math.floor(damage * passiveBonuses.lifestealPercent / 100);
    attacker.stats.hp = Math.min(attacker.stats.maxHp, attacker.stats.hp + healAmount);
    attackerStats.healingDone += healAmount;
  }

  // On-hit effects
  if (attacker.isHero && attacker.skills) {
    const onHitEffects = getOnHitEffects(attacker, damage);
    if (onHitEffects.healAmount > 0) {
      attacker.stats.hp = Math.min(attacker.stats.maxHp, attacker.stats.hp + onHitEffects.healAmount);
      attackerStats.healingDone += onHitEffects.healAmount;
    }
  }

  // Check double attack (speed-based + passive bonus)
  const baseDoubleChance = calculateDoubleAttackChance(attacker.stats.speed, defender.stats.speed);
  const totalDoubleChance = baseDoubleChance + (passiveBonuses.doubleAttackChance || 0);

  if (Math.random() < totalDoubleChance) {
    attackerStats.doubleAttacks++;
    const bonusDamage = calculateDamage(attacker, defender, 1.0, passiveBonuses);
    defender.stats.hp -= bonusDamage;
    attackerStats.damageDealt += bonusDamage;
  }

  // Check if killed
  if (defender.stats.hp <= 0 && attacker.isHero && attacker.skills) {
    const onKillEffects = getOnKillEffects(attacker);
    if (onKillEffects.healAmount > 0 || onKillEffects.healPercent > 0) {
      const healAmount = onKillEffects.healAmount + Math.floor(attacker.stats.maxHp * onKillEffects.healPercent);
      attacker.stats.hp = Math.min(attacker.stats.maxHp, attacker.stats.hp + healAmount);
      attackerStats.healingDone += healAmount;
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

      let totalDamageDealt = 0;
      for (const target of targets) {
        if (!target) continue;
        const damage = calculateDamage(actor, target, effect.multiplier, passiveBonuses);
        target.stats.hp -= damage;
        stats.damageDealt += damage;
        stats.skillDamage += damage;
        totalDamageDealt += damage;

        // Check crit for skills
        if (effect.alwaysCrit || Math.random() < 0.1) {
          stats.crits++;
        }
      }

      // Handle lifesteal on damage skills (e.g., Drain Life)
      if (effect.lifesteal && totalDamageDealt > 0) {
        const healAmount = Math.floor(totalDamageDealt * effect.lifesteal);
        actor.stats.hp = Math.min(actor.stats.maxHp, actor.stats.hp + healAmount);
        stats.healingDone += healAmount;
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

    case EFFECT_TYPE.BUFF: {
      // Handle taunt effect
      if (effect.taunt) {
        actor.tauntDuration = effect.taunt;
      }
      // Other buffs tracked but not fully simulated
      break;
    }

    case EFFECT_TYPE.DEBUFF:
    case EFFECT_TYPE.SHIELD:
      // Simplified: debuffs/shields are tracked but not fully simulated
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

  // Check if this hero is a healer class
  const healerClasses = ['cleric', 'druid', 'shaman'];
  const isHealer = healerClasses.includes(hero.classId);

  // Check if this hero is a tank class
  const tankClasses = ['warrior', 'paladin', 'knight'];
  const isTank = tankClasses.includes(hero.classId);

  // Find allies at different HP thresholds
  const criticalHpAllies = aliveAllies.filter(a => a.stats.hp / a.stats.maxHp < 0.3);
  const lowHpAllies = aliveAllies.filter(a => a.stats.hp / a.stats.maxHp < 0.5);
  const hurtAllies = aliveAllies.filter(a => a.stats.hp / a.stats.maxHp < 0.8);

  // Find heal skills
  const healSkill = available.find(s =>
    s.effect?.type === EFFECT_TYPE.HEAL || s.effect?.type === EFFECT_TYPE.HOT
  );

  // Find taunt skill
  const tauntSkill = available.find(s => s.effect?.taunt);

  // 1. CRITICAL: Emergency heal if ally below 30%
  if (criticalHpAllies.length > 0 && healSkill) {
    return healSkill;
  }

  // 2. Tank priority: Use taunt if no one is taunting
  if (isTank && tauntSkill) {
    const anyoneTaunting = aliveAllies.some(a => a.tauntDuration > 0);
    if (!anyoneTaunting) {
      return tauntSkill;
    }
  }

  // 3. Heal if ally below 50%
  if (lowHpAllies.length > 0 && healSkill) {
    return healSkill;
  }

  // 4. Healer maintenance: Heal if any ally below 80%
  if (isHealer && hurtAllies.length > 0 && healSkill) {
    return healSkill;
  }

  // 5. AOE damage if 2+ enemies
  if (aliveEnemies.length >= 2) {
    const aoeSkill = available.find(s =>
      s.targetType === TARGET_TYPE.ALL_ENEMIES && s.effect?.type === EFFECT_TYPE.DAMAGE
    );
    if (aoeSkill) return aoeSkill;
  }

  // 6. Any damage skill
  const damageSkill = available.find(s => s.effect?.type === EFFECT_TYPE.DAMAGE);
  if (damageSkill) return damageSkill;

  // 7. DOT skill
  const dotSkill = available.find(s => s.effect?.type === EFFECT_TYPE.DOT);
  if (dotSkill) return dotSkill;

  // 8. Any available skill
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

    // Reduce taunt durations at start of round
    for (const hero of aliveHeroes) {
      if (hero.tauntDuration > 0) {
        hero.tauntDuration--;
      }
    }

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
        let target;

        // Monsters prioritize taunting heroes
        if (!isHero) {
          const tauntingHeroes = enemyList.filter(h => h.tauntDuration > 0);
          if (tauntingHeroes.length > 0) {
            target = tauntingHeroes[Math.floor(Math.random() * tauntingHeroes.length)];
          } else {
            target = enemyList[Math.floor(Math.random() * enemyList.length)];
          }
        } else {
          target = enemyList[Math.floor(Math.random() * enemyList.length)];
        }
        // Pass defender stats so we can track hero dodges when monsters attack
        const defenderStats = target.isHero ? heroStats[target.classId] : null;
        simulateAttack(unit, target, stats, { isFirstAttack: turn === 1 }, defenderStats);
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

  // Tank comparison - test with full party (Tank + Cleric + Mage + Rogue)
  console.log('TANK CLASS COMPARISON (Party: Tank + Cleric + Mage + Rogue)');
  console.log('-'.repeat(90));
  console.log(
    'Class'.padEnd(12) +
    'Win%'.padStart(8) +
    'TankDeath'.padStart(11) +
    'PartyDeath'.padStart(12) +
    'AvgDmg'.padStart(10) +
    'Dodges'.padStart(8)
  );
  console.log('-'.repeat(90));

  const tankClasses = ['warrior', 'paladin', 'knight'];
  const tankResults = {};

  for (const tankClass of tankClasses) {
    const classResults = {
      wins: 0,
      losses: 0,
      totalDamage: 0,
      totalDeaths: 0,
      totalPartyDeaths: 0,
      totalDodges: 0,
    };

    for (let run = 0; run < cfg.runsPerClass; run++) {
      const party = [
        createHero(tankClass, cfg.heroLevel, cfg.skillTier),
        createHero('cleric', cfg.heroLevel, cfg.skillTier),
        createHero('mage', cfg.heroLevel, cfg.skillTier),
        createHero('rogue', cfg.heroLevel, cfg.skillTier),
      ];
      const result = simulateDungeonRun(party, cfg.dungeonLevel);

      if (result.success) classResults.wins++;
      else classResults.losses++;

      // Track tank stats
      const tankStats = result.heroStats[tankClass];
      if (tankStats) {
        classResults.totalDamage += tankStats.damageDealt;
        classResults.totalDeaths += tankStats.deaths;
        classResults.totalDodges += tankStats.dodges;
      }

      // Track party deaths (non-tank)
      for (const [classId, stats] of Object.entries(result.heroStats)) {
        if (classId !== tankClass) {
          classResults.totalPartyDeaths += stats.deaths;
        }
      }
    }

    classResults.winRate = (classResults.wins / cfg.runsPerClass * 100).toFixed(1);
    classResults.avgDamage = Math.floor(classResults.totalDamage / cfg.runsPerClass);
    classResults.tankDeathRate = (classResults.totalDeaths / cfg.runsPerClass).toFixed(2);
    classResults.partyDeathRate = (classResults.totalPartyDeaths / cfg.runsPerClass).toFixed(2);
    classResults.avgDodges = (classResults.totalDodges / cfg.runsPerClass).toFixed(1);
    tankResults[tankClass] = classResults;

    console.log(
      tankClass.padEnd(12) +
      `${classResults.winRate}%`.padStart(8) +
      classResults.tankDeathRate.padStart(11) +
      classResults.partyDeathRate.padStart(12) +
      classResults.avgDamage.toString().padStart(10) +
      classResults.avgDodges.padStart(8)
    );
  }

  console.log('-'.repeat(90));
  console.log('\n');

  // Healer comparison - test with full party (Warrior + Healer + Mage + Rogue)
  console.log('HEALER CLASS COMPARISON (Party: Warrior + Healer + Mage + Rogue)');
  console.log('-'.repeat(90));
  console.log(
    'Class'.padEnd(12) +
    'Win%'.padStart(8) +
    'AvgHeal'.padStart(10) +
    'HealerDeath'.padStart(13) +
    'PartyDeath'.padStart(12) +
    'AvgDmg'.padStart(10)
  );
  console.log('-'.repeat(90));

  const healerClasses = ['cleric', 'druid', 'shaman'];
  const healerResults = {};

  for (const healerClass of healerClasses) {
    const classResults = {
      wins: 0,
      losses: 0,
      totalHealing: 0,
      totalDamage: 0,
      totalDeaths: 0,
      totalPartyDeaths: 0,
    };

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
        classResults.totalDeaths += stats.deaths;
      }

      // Track party deaths (non-healer)
      for (const [classId, stats] of Object.entries(result.heroStats)) {
        if (classId !== healerClass) {
          classResults.totalPartyDeaths += stats.deaths;
        }
      }
    }

    classResults.winRate = (classResults.wins / cfg.runsPerClass * 100).toFixed(1);
    classResults.avgHealing = Math.floor(classResults.totalHealing / cfg.runsPerClass);
    classResults.avgDamage = Math.floor(classResults.totalDamage / cfg.runsPerClass);
    classResults.healerDeathRate = (classResults.totalDeaths / cfg.runsPerClass).toFixed(2);
    classResults.partyDeathRate = (classResults.totalPartyDeaths / cfg.runsPerClass).toFixed(2);
    healerResults[healerClass] = classResults;

    console.log(
      healerClass.padEnd(12) +
      `${classResults.winRate}%`.padStart(8) +
      classResults.avgHealing.toString().padStart(10) +
      classResults.healerDeathRate.padStart(13) +
      classResults.partyDeathRate.padStart(12) +
      classResults.avgDamage.toString().padStart(10)
    );
  }

  console.log(`\n${'='.repeat(70)}\n`);

  return { dps: results, tanks: tankResults, healers: healerResults };
}

// Monster simulation configuration
const MONSTER_SIM_CONFIG = {
  heroLevel: 10,
  dungeonLevel: 10,
  runsPerMonster: 30,
  skillTier: 2,
  monstersPerEncounter: 3, // How many of each monster type to spawn
};

// Create monsters of a specific type for testing
function createMonstersOfType(monsterId, dungeonLevel, count = 3) {
  const template = MONSTERS[monsterId];
  if (!template) return [];

  const scaleFactor = Math.pow(1.10, dungeonLevel - 1);
  const speedScaleFactor = 1 + (scaleFactor - 1) * SPEED_SCALE_FACTOR;
  const monsters = [];

  for (let i = 0; i < count; i++) {
    monsters.push({
      id: `monster_${monsterId}_${i}_${Date.now()}`,
      templateId: monsterId,
      name: template.name,
      isBoss: template.isBoss || false,
      isHero: false,
      aiType: template.aiType,
      stats: {
        maxHp: Math.floor(template.baseStats.maxHp * scaleFactor),
        hp: Math.floor(template.baseStats.maxHp * scaleFactor),
        attack: Math.floor(template.baseStats.attack * scaleFactor),
        defense: Math.floor(template.baseStats.defense * scaleFactor),
        speed: Math.floor(template.baseStats.speed * speedScaleFactor), // Partial speed scaling
      },
      baseStats: template.baseStats,
      abilities: template.abilities || [],
      passive: template.passive || {},
      attackRange: template.attackRange || 1,
      cooldowns: {},
      position: { x: 10 + i * 2, y: 10 }, // Mock position for AI distance calcs
      phases: template.phases || null,
    });
  }

  return monsters;
}

// Execute a single monster attack (basic or ability-based)
function executeMonsterAttack(monster, target, multiplier, monsterStats, hitCount = 1) {
  let totalDamage = 0;

  for (let i = 0; i < hitCount; i++) {
    // Calculate damage with defense reduction
    const baseDamage = monster.stats.attack * multiplier;
    const defense = target.stats.defense;
    const reduction = defense / (defense + 50);
    const variance = 0.9 + Math.random() * 0.2;
    const damage = Math.max(1, Math.floor(baseDamage * (1 - reduction) * variance));

    // Check dodge
    const dodgeChance = calculateDodgeChance(target.stats.speed, monster.stats.speed);
    if (Math.random() < dodgeChance) {
      continue; // Dodged
    }

    target.stats.hp -= damage;
    totalDamage += damage;
    monsterStats.damageDealt += damage;

    if (target.stats.hp <= 0) {
      monsterStats.kills++;
    }
  }

  return totalDamage;
}

// Check if an ability is a passive/triggered ability (not actively usable)
function isPassiveAbility(ability) {
  if (!ability) return true;
  // Abilities with triggers are passive reactions, not active choices
  if (ability.trigger) return true;
  // enrage specifically is passive
  if (ability.id === 'enrage') return true;
  return false;
}

// Get the best damaging ability for a monster (fallback when AI picks non-damage)
function getBestDamagingAbility(monster) {
  const abilities = monster.abilities || [];
  for (const abilityId of abilities) {
    const ability = MONSTER_ABILITIES[abilityId];
    if (ability &&
        ability.type === ABILITY_TYPE.ATTACK &&
        !isPassiveAbility(ability) &&
        (!monster.cooldowns[abilityId] || monster.cooldowns[abilityId] <= 0)) {
      return ability;
    }
  }
  return null;
}

// Execute a monster ability in simulation
function executeMonsterAbilityInSim(monster, ability, target, heroes, allies, monsterStats) {
  // Skip passive/triggered abilities - they shouldn't be actively used
  if (isPassiveAbility(ability)) {
    return false; // Signal that no real action was taken
  }

  const aliveHeroes = heroes.filter(h => h.stats.hp > 0);
  const aliveAllies = allies.filter(a => a.stats.hp > 0);

  // Determine targets based on ability target type
  let targets = [];
  switch (ability.targetType) {
    case MONSTER_TARGET_TYPE.ALL_ENEMIES:
      targets = aliveHeroes;
      break;
    case MONSTER_TARGET_TYPE.ALL_ALLIES:
      targets = aliveAllies;
      break;
    case MONSTER_TARGET_TYPE.CLEAVE:
      targets = target ? [target] : [];
      // Add additional nearby targets (simplified - just add 1 more random hero)
      const others = aliveHeroes.filter(h => h !== target);
      if (others.length > 0 && (ability.maxTargets || 2) > 1) {
        targets.push(others[Math.floor(Math.random() * others.length)]);
      }
      break;
    case MONSTER_TARGET_TYPE.SELF:
      targets = [monster];
      break;
    case MONSTER_TARGET_TYPE.LOWEST_HP:
      if (aliveHeroes.length > 0) {
        targets = [aliveHeroes.reduce((best, h) => h.stats.hp < best.stats.hp ? h : best)];
      }
      break;
    default:
      targets = target ? [target] : (aliveHeroes.length > 0 ? [aliveHeroes[0]] : []);
  }

  // Execute based on ability type
  switch (ability.type) {
    case ABILITY_TYPE.ATTACK: {
      const multiplier = ability.damageMultiplier || 1.0;
      const hitCount = ability.hitCount || 1;
      let totalDamageDealt = 0;

      for (const t of targets) {
        const damage = executeMonsterAttack(monster, t, multiplier, monsterStats, hitCount);
        totalDamageDealt += damage;
      }

      // Handle lifesteal on ability
      if (ability.lifesteal && totalDamageDealt > 0) {
        const healAmount = Math.floor(totalDamageDealt * ability.lifesteal);
        monster.stats.hp = Math.min(monster.stats.maxHp, monster.stats.hp + healAmount);
        monsterStats.healingDone += healAmount;
      }

      // Apply passive lifesteal too
      if (monster.passive?.lifesteal && totalDamageDealt > 0) {
        const healAmount = Math.floor(totalDamageDealt * monster.passive.lifesteal);
        monster.stats.hp = Math.min(monster.stats.maxHp, monster.stats.hp + healAmount);
        monsterStats.healingDone += healAmount;
      }
      return true;
    }

    case ABILITY_TYPE.HEAL: {
      const healPercent = ability.healPercent || 0.2;
      for (const t of targets) {
        const healAmount = Math.floor(t.stats.maxHp * healPercent);
        const actualHeal = Math.min(healAmount, t.stats.maxHp - t.stats.hp);
        t.stats.hp += actualHeal;
        monsterStats.healingDone += actualHeal;
      }
      return true;
    }

    case ABILITY_TYPE.BUFF:
    case ABILITY_TYPE.DEBUFF:
      // Status effects are simplified - we don't track them fully in simulation
      // These still count as valid actions
      monsterStats.abilitiesUsed = (monsterStats.abilitiesUsed || 0) + 1;
      return true;

    case ABILITY_TYPE.SUMMON:
      // Summoning is complex - simplified by just counting it
      monsterStats.abilitiesUsed = (monsterStats.abilitiesUsed || 0) + 1;
      return true;
  }

  return false;
}

// Simulate combat with detailed monster tracking
function simulateCombatWithMonsterStats(heroes, monsters, heroStats, monsterStats) {
  const maxTurns = 100;
  let turn = 0;

  // Reset cooldowns
  for (const hero of heroes) {
    hero.cooldowns = {};
  }
  for (const monster of monsters) {
    monster.cooldowns = {};
    // Track starting HP for damage taken calculation
    monster._startHp = monster.stats.hp;
  }

  while (turn < maxTurns) {
    turn++;

    const aliveHeroes = heroes.filter(h => h.stats.hp > 0);
    const aliveMonsters = monsters.filter(m => m.stats.hp > 0);

    if (aliveMonsters.length === 0) {
      // Heroes won - record monster deaths
      for (const monster of monsters) {
        monsterStats.deaths++;
        monsterStats.damageTaken += monster._startHp; // Took full HP as damage
      }
      return { victory: true, turns: turn, heroesAlive: aliveHeroes.length };
    }
    if (aliveHeroes.length === 0) {
      // Monsters won - record surviving monster HP
      for (const monster of monsters) {
        if (monster.stats.hp > 0) {
          monsterStats.survivals++;
          monsterStats.damageTaken += (monster._startHp - monster.stats.hp);
        } else {
          monsterStats.deaths++;
          monsterStats.damageTaken += monster._startHp;
        }
      }
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

    // Reduce taunt durations
    for (const hero of aliveHeroes) {
      if (hero.tauntDuration > 0) {
        hero.tauntDuration--;
      }
    }

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

      if (isHero) {
        // Hero turn - use existing logic
        const stats = heroStats[unit.classId];
        let usedSkill = false;
        const skill = chooseBestSkill(unit, enemyList, allyList);
        if (skill) {
          executeSkillAbility(unit, skill, enemyList, allyList, stats);
          usedSkill = true;
        }
        if (!usedSkill && enemyList.length > 0) {
          const target = enemyList[Math.floor(Math.random() * enemyList.length)];
          simulateAttack(unit, target, stats, {});
        }
      } else {
        // Monster turn - use proper AI and abilities
        // Apply passive regen at start of turn
        if (unit.passive?.regenPercent) {
          const regenAmount = Math.floor(unit.stats.maxHp * unit.passive.regenPercent);
          unit.stats.hp = Math.min(unit.stats.maxHp, unit.stats.hp + regenAmount);
          monsterStats.healingDone += regenAmount;
        }

        // Use monster AI to choose ability
        const decision = chooseMonsterAbility(unit, enemyList, allyList, unit.cooldowns, {});

        // Helper function to do basic attack
        const doBasicAttack = () => {
          const tauntingHeroes = enemyList.filter(h => h.tauntDuration > 0);
          const target = tauntingHeroes.length > 0
            ? tauntingHeroes[Math.floor(Math.random() * tauntingHeroes.length)]
            : decision.target || enemyList[Math.floor(Math.random() * enemyList.length)];

          if (target) {
            monsterStats.attacks++;
            const damageDealt = executeMonsterAttack(unit, target, 1.0, monsterStats);

            // Apply passive lifesteal on basic attacks
            if (unit.passive?.lifesteal && damageDealt > 0) {
              const healAmount = Math.floor(damageDealt * unit.passive.lifesteal);
              unit.stats.hp = Math.min(unit.stats.maxHp, unit.stats.hp + healAmount);
              monsterStats.healingDone += healAmount;
            }
          }
        };

        if (decision.useBasicAttack || !decision.ability) {
          doBasicAttack();
        } else {
          // Check if the chosen ability is passive/triggered (shouldn't be used actively)
          if (isPassiveAbility(decision.ability)) {
            // AI picked a passive ability - try to find a real damaging ability instead
            const damageAbility = getBestDamagingAbility(unit);
            if (damageAbility) {
              monsterStats.attacks++;
              unit.cooldowns[damageAbility.id] = damageAbility.cooldown;
              executeMonsterAbilityInSim(unit, damageAbility, decision.target, enemyList, allyList, monsterStats);
            } else {
              // No damage ability available, do basic attack
              doBasicAttack();
            }
          } else {
            // Use the chosen ability
            const ability = decision.ability;
            const target = decision.target;

            // Set cooldown
            unit.cooldowns[ability.id] = ability.cooldown;

            // Execute ability - track attacks only for damage-dealing abilities
            if (ability.type === ABILITY_TYPE.ATTACK) {
              monsterStats.attacks++;
            }
            executeMonsterAbilityInSim(unit, ability, target, enemyList, allyList, monsterStats);
          }
        }
      }
    }
  }

  // Timeout
  for (const monster of monsters) {
    if (monster.stats.hp > 0) {
      monsterStats.survivals++;
      monsterStats.damageTaken += (monster._startHp - monster.stats.hp);
    } else {
      monsterStats.deaths++;
      monsterStats.damageTaken += monster._startHp;
    }
  }
  return { victory: false, turns: maxTurns, heroesAlive: heroes.filter(h => h.stats.hp > 0).length };
}

// Run monster-focused simulations
export function runMonsterSimulations(config = {}) {
  const cfg = { ...MONSTER_SIM_CONFIG, ...config };

  // Import monster list
  const allMonsters = Object.values(MONSTERS);
  const regularMonsters = allMonsters.filter(m => !m.isBoss);
  const bosses = allMonsters.filter(m => m.isBoss);

  console.log(`\n${'='.repeat(80)}`);
  console.log(`MONSTER BALANCE SIMULATION - Level ${cfg.heroLevel} Heroes vs Level ${cfg.dungeonLevel} Dungeon`);
  console.log(`Runs per monster: ${cfg.runsPerMonster} | Monsters per encounter: ${cfg.monstersPerEncounter}`);
  console.log(`${'='.repeat(80)}\n`);

  const results = {};
  const scaleFactor = Math.pow(1.10, cfg.dungeonLevel - 1);

  // Test each regular monster type
  for (const monster of regularMonsters) {
    const monsterStats = {
      damageDealt: 0,
      damageTaken: 0,
      healingDone: 0,
      attacks: 0,
      kills: 0,
      deaths: 0,
      survivals: 0,
      partyWipes: 0,
      encounters: 0,
    };

    for (let run = 0; run < cfg.runsPerMonster; run++) {
      // Create fresh party
      const party = createParty(cfg.heroLevel, ['mage', 'rogue'], cfg.skillTier);

      // Create monsters of this specific type
      const monsters = createMonstersOfType(monster.id, cfg.dungeonLevel, cfg.monstersPerEncounter);

      // Initialize hero stats tracking
      const heroStats = {};
      for (const hero of party) {
        heroStats[hero.classId] = {
          damageDealt: 0, healingDone: 0, crits: 0, dodges: 0, skillDamage: 0, doubleAttacks: 0, deaths: 0,
        };
      }

      const result = simulateCombatWithMonsterStats(party, monsters, heroStats, monsterStats);
      monsterStats.encounters++;

      if (!result.victory) {
        monsterStats.partyWipes++;
      }
    }

    // Calculate scaled stats for display
    const scaledStats = {
      maxHp: Math.floor(monster.baseStats.maxHp * scaleFactor),
      attack: Math.floor(monster.baseStats.attack * scaleFactor),
      defense: Math.floor(monster.baseStats.defense * scaleFactor),
      speed: monster.baseStats.speed,
    };

    results[monster.id] = {
      name: monster.name,
      tier: monster.tier,
      aiType: monster.aiType,
      baseStats: monster.baseStats,
      scaledStats,
      passive: monster.passive,
      attackRange: monster.attackRange || 1,
      // Performance metrics
      avgDamageDealt: Math.floor(monsterStats.damageDealt / cfg.runsPerMonster),
      avgDamageTaken: Math.floor(monsterStats.damageTaken / cfg.runsPerMonster),
      avgHealing: Math.floor(monsterStats.healingDone / cfg.runsPerMonster),
      avgAttacks: (monsterStats.attacks / cfg.runsPerMonster).toFixed(1),
      avgKills: (monsterStats.kills / cfg.runsPerMonster).toFixed(2),
      survivalRate: ((monsterStats.survivals / (cfg.runsPerMonster * cfg.monstersPerEncounter)) * 100).toFixed(1),
      partyWipeRate: ((monsterStats.partyWipes / cfg.runsPerMonster) * 100).toFixed(1),
      // Efficiency metrics
      damagePerHp: (monsterStats.damageDealt / monsterStats.damageTaken).toFixed(2),
      killsPerEncounter: (monsterStats.kills / cfg.runsPerMonster).toFixed(2),
    };
  }

  // Print results by tier
  for (let tier = 1; tier <= 4; tier++) {
    const tierMonsters = Object.entries(results).filter(([_, data]) => data.tier === tier);
    if (tierMonsters.length === 0) continue;

    console.log(`\nTIER ${tier} MONSTERS (Dungeon Levels ${(tier-1)*5 + 1}-${tier*5})`);
    console.log('-'.repeat(120));
    console.log(
      'Monster'.padEnd(14) +
      'AI'.padEnd(11) +
      'HP'.padStart(6) +
      'ATK'.padStart(6) +
      'DEF'.padStart(5) +
      'SPD'.padStart(5) +
      '│' +
      'AvgDmg'.padStart(8) +
      'AvgTkn'.padStart(8) +
      'Heal'.padStart(6) +
      'Kills'.padStart(7) +
      'Surv%'.padStart(7) +
      'Wipe%'.padStart(7) +
      'Dmg/HP'.padStart(8)
    );
    console.log('-'.repeat(120));

    // Sort by party wipe rate descending (most dangerous first)
    tierMonsters.sort((a, b) => parseFloat(b[1].partyWipeRate) - parseFloat(a[1].partyWipeRate));

    for (const [id, data] of tierMonsters) {
      const s = data.scaledStats;
      const passiveNote = data.passive ?
        (data.passive.lifesteal ? ` [${(data.passive.lifesteal*100)}%LS]` :
         data.passive.regenPercent ? ` [${(data.passive.regenPercent*100)}%Rg]` :
         data.passive.reflectDamage ? ` [${(data.passive.reflectDamage*100)}%Rf]` : '') : '';

      console.log(
        (data.name + passiveNote).padEnd(14).slice(0, 14) +
        data.aiType.padEnd(11) +
        s.maxHp.toString().padStart(6) +
        s.attack.toString().padStart(6) +
        s.defense.toString().padStart(5) +
        s.speed.toString().padStart(5) +
        '│' +
        data.avgDamageDealt.toString().padStart(8) +
        data.avgDamageTaken.toString().padStart(8) +
        data.avgHealing.toString().padStart(6) +
        data.avgKills.padStart(7) +
        (data.survivalRate + '%').padStart(7) +
        (data.partyWipeRate + '%').padStart(7) +
        data.damagePerHp.padStart(8)
      );
    }
  }

  // Boss summary
  console.log(`\n\nBOSS MONSTERS`);
  console.log('-'.repeat(100));
  console.log(
    'Boss'.padEnd(16) +
    'Tier'.padStart(5) +
    'HP'.padStart(7) +
    'ATK'.padStart(6) +
    'DEF'.padStart(5) +
    'SPD'.padStart(5) +
    '│ Abilities'
  );
  console.log('-'.repeat(100));

  for (const boss of bosses) {
    const scaledHp = Math.floor(boss.baseStats.maxHp * scaleFactor);
    const scaledAtk = Math.floor(boss.baseStats.attack * scaleFactor);
    const scaledDef = Math.floor(boss.baseStats.defense * scaleFactor);

    console.log(
      boss.name.padEnd(16) +
      boss.tier.toString().padStart(5) +
      scaledHp.toString().padStart(7) +
      scaledAtk.toString().padStart(6) +
      scaledDef.toString().padStart(5) +
      boss.baseStats.speed.toString().padStart(5) +
      '│ ' + (boss.abilities || []).slice(0, 4).join(', ')
    );
  }

  console.log(`\n${'='.repeat(80)}`);
  console.log('LEGEND: AvgDmg=damage dealt, AvgTkn=damage taken, Surv%=monster survival rate');
  console.log('        Wipe%=party wipe rate, Dmg/HP=damage efficiency (higher=more dangerous)');
  console.log('        [LS]=Lifesteal, [Rg]=Regen, [Rf]=Reflect');
  console.log(`${'='.repeat(80)}\n`);

  return results;
}

// Run comparison at multiple dungeon levels
export function runMonsterScalingAnalysis(levels = [5, 10, 15, 20]) {
  console.log(`\n${'='.repeat(80)}`);
  console.log('MONSTER SCALING ANALYSIS - How monsters perform across dungeon levels');
  console.log(`${'='.repeat(80)}\n`);

  const allResults = {};

  for (const level of levels) {
    console.log(`\n>>> Testing at Dungeon Level ${level}...`);
    allResults[level] = runMonsterSimulations({
      dungeonLevel: level,
      heroLevel: level,
      runsPerMonster: 20,
    });
  }

  // Summary comparison
  console.log(`\n${'='.repeat(80)}`);
  console.log('SCALING SUMMARY - Party Wipe Rate by Dungeon Level');
  console.log('-'.repeat(80));

  const header = 'Monster'.padEnd(14) + levels.map(l => `D${l}`.padStart(8)).join('');
  console.log(header);
  console.log('-'.repeat(80));

  // Get all monster IDs
  const monsterIds = Object.keys(allResults[levels[0]] || {});

  for (const id of monsterIds) {
    const row = (allResults[levels[0]][id]?.name || id).padEnd(14);
    const wipeRates = levels.map(l => {
      const data = allResults[l]?.[id];
      return data ? (data.partyWipeRate + '%').padStart(8) : 'N/A'.padStart(8);
    }).join('');
    console.log(row + wipeRates);
  }

  console.log(`${'='.repeat(80)}\n`);

  return allResults;
}

// Test monsters at their appropriate tier levels
export function runTierBalanceTest(config = {}) {
  const cfg = {
    runsPerMonster: config.runsPerMonster || 50,
    skillTier: config.skillTier || 2,
    monstersPerEncounter: config.monstersPerEncounter || 3,
  };

  // Map tiers to appropriate dungeon levels (middle of tier range)
  const tierLevels = {
    1: 3,   // Tier 1: D1-5, test at D3
    2: 8,   // Tier 2: D6-10, test at D8
    3: 13,  // Tier 3: D11-15, test at D13
    4: 18,  // Tier 4: D16+, test at D18
  };

  console.log(`\n${'='.repeat(90)}`);
  console.log('TIER-APPROPRIATE BALANCE TEST');
  console.log('Testing each monster at the dungeon level where they naturally appear');
  console.log(`Runs per monster: ${cfg.runsPerMonster} | Monsters per encounter: ${cfg.monstersPerEncounter}`);
  console.log(`${'='.repeat(90)}\n`);

  const allMonsters = Object.values(MONSTERS).filter(m => !m.isBoss);
  const results = {};

  for (let tier = 1; tier <= 4; tier++) {
    const dungeonLevel = tierLevels[tier];
    const heroLevel = dungeonLevel;
    const tierMonsters = allMonsters.filter(m => m.tier === tier);
    const scaleFactor = Math.pow(1.10, dungeonLevel - 1);

    console.log(`\n${'─'.repeat(90)}`);
    console.log(`TIER ${tier} - Testing at Dungeon Level ${dungeonLevel} (Hero Level ${heroLevel})`);
    console.log(`${'─'.repeat(90)}`);
    console.log(
      'Monster'.padEnd(14) +
      'AI'.padEnd(10) +
      'HP'.padStart(5) +
      'ATK'.padStart(5) +
      'DEF'.padStart(5) +
      'SPD'.padStart(4) +
      ' │' +
      'Damage'.padStart(7) +
      'Taken'.padStart(7) +
      'Heal'.padStart(6) +
      'Kills'.padStart(6) +
      'Surv%'.padStart(7) +
      'Wipe%'.padStart(7) +
      'Eff'.padStart(6)
    );
    console.log('─'.repeat(90));

    for (const monster of tierMonsters) {
      const monsterStats = {
        damageDealt: 0,
        damageTaken: 0,
        healingDone: 0,
        attacks: 0,
        kills: 0,
        deaths: 0,
        survivals: 0,
        partyWipes: 0,
        encounters: 0,
      };

      for (let run = 0; run < cfg.runsPerMonster; run++) {
        const party = createParty(heroLevel, ['mage', 'rogue'], cfg.skillTier);
        const monsters = createMonstersOfType(monster.id, dungeonLevel, cfg.monstersPerEncounter);

        const heroStats = {};
        for (const hero of party) {
          heroStats[hero.classId] = {
            damageDealt: 0, healingDone: 0, crits: 0, dodges: 0, skillDamage: 0, doubleAttacks: 0, deaths: 0,
          };
        }

        const result = simulateCombatWithMonsterStats(party, monsters, heroStats, monsterStats);
        monsterStats.encounters++;

        if (!result.victory) {
          monsterStats.partyWipes++;
        }
      }

      const scaledStats = {
        maxHp: Math.floor(monster.baseStats.maxHp * scaleFactor),
        attack: Math.floor(monster.baseStats.attack * scaleFactor),
        defense: Math.floor(monster.baseStats.defense * scaleFactor),
        speed: monster.baseStats.speed,
      };

      const avgDamage = Math.floor(monsterStats.damageDealt / cfg.runsPerMonster);
      const avgTaken = Math.floor(monsterStats.damageTaken / cfg.runsPerMonster);
      const avgHealing = Math.floor(monsterStats.healingDone / cfg.runsPerMonster);
      const avgKills = (monsterStats.kills / cfg.runsPerMonster).toFixed(2);
      const survivalRate = ((monsterStats.survivals / (cfg.runsPerMonster * cfg.monstersPerEncounter)) * 100).toFixed(0);
      const partyWipeRate = ((monsterStats.partyWipes / cfg.runsPerMonster) * 100).toFixed(0);
      const efficiency = avgTaken > 0 ? (avgDamage / avgTaken).toFixed(2) : '0.00';

      results[monster.id] = {
        tier,
        dungeonLevel,
        name: monster.name,
        aiType: monster.aiType,
        scaledStats,
        avgDamage,
        avgTaken,
        avgHealing,
        avgKills: parseFloat(avgKills),
        survivalRate: parseFloat(survivalRate),
        partyWipeRate: parseFloat(partyWipeRate),
        efficiency: parseFloat(efficiency),
      };

      // Color code based on performance
      const wipeNum = parseFloat(partyWipeRate);
      const indicator = wipeNum >= 10 ? '🔥' : wipeNum >= 1 ? '⚡' : '  ';

      console.log(
        monster.name.padEnd(14).slice(0, 14) +
        monster.aiType.slice(0, 9).padEnd(10) +
        scaledStats.maxHp.toString().padStart(5) +
        scaledStats.attack.toString().padStart(5) +
        scaledStats.defense.toString().padStart(5) +
        scaledStats.speed.toString().padStart(4) +
        ' │' +
        avgDamage.toString().padStart(7) +
        avgTaken.toString().padStart(7) +
        avgHealing.toString().padStart(6) +
        avgKills.padStart(6) +
        (survivalRate + '%').padStart(7) +
        (partyWipeRate + '%').padStart(7) +
        efficiency.padStart(6) +
        indicator
      );
    }
  }

  // Summary analysis
  console.log(`\n${'='.repeat(90)}`);
  console.log('BALANCE ANALYSIS');
  console.log(`${'='.repeat(90)}`);

  for (let tier = 1; tier <= 4; tier++) {
    const tierResults = Object.values(results).filter(r => r.tier === tier);
    if (tierResults.length === 0) continue;

    const avgWipeRate = tierResults.reduce((sum, r) => sum + r.partyWipeRate, 0) / tierResults.length;
    const avgEfficiency = tierResults.reduce((sum, r) => sum + r.efficiency, 0) / tierResults.length;
    const bestPerformer = tierResults.reduce((best, r) => r.partyWipeRate > best.partyWipeRate ? r : best);
    const worstPerformer = tierResults.reduce((worst, r) => r.partyWipeRate < worst.partyWipeRate ? r : worst);

    console.log(`\nTier ${tier} (D${tierLevels[tier]}):`);
    console.log(`  Avg Wipe Rate: ${avgWipeRate.toFixed(1)}% | Avg Efficiency: ${avgEfficiency.toFixed(2)}`);
    console.log(`  Best:  ${bestPerformer.name} (${bestPerformer.partyWipeRate}% wipes)`);
    console.log(`  Worst: ${worstPerformer.name} (${worstPerformer.partyWipeRate}% wipes)`);

    // Flag large disparities
    const spread = bestPerformer.partyWipeRate - worstPerformer.partyWipeRate;
    if (spread > 10) {
      console.log(`  ⚠️  Large spread (${spread.toFixed(0)}%) - balance needed within tier`);
    }
  }

  console.log(`\n${'='.repeat(90)}`);
  console.log('Legend: Eff = Damage Efficiency (damage dealt / damage taken)');
  console.log('        🔥 = 10%+ wipe rate (very dangerous)');
  console.log('        ⚡ = 1-9% wipe rate (threatening)');
  console.log(`${'='.repeat(90)}\n`);

  return results;
}

// Expose to window for console access
if (typeof window !== 'undefined') {
  window.runSimulation = (config) => runClassSimulations(config);
  window.runMonsterSim = (config) => runMonsterSimulations(config);
  window.runMonsterScaling = (levels) => runMonsterScalingAnalysis(levels);
  window.runTierBalance = (config) => runTierBalanceTest(config);
  window.simConfig = SIM_CONFIG;
  window.monsterSimConfig = MONSTER_SIM_CONFIG;

  console.log('Combat Simulator loaded!');
  console.log('  window.runSimulation()     - Test hero class balance');
  console.log('  window.runMonsterSim()     - Test monster balance (fixed dungeon level)');
  console.log('  window.runTierBalance()    - Test monsters at their appropriate tier levels ⭐');
  console.log('  window.runMonsterScaling() - Test monster scaling across levels');
  console.log('');
  console.log('Options: { runsPerMonster, skillTier, monstersPerEncounter }');
}

export default runClassSimulations;
