import { CLASSES } from '../../data/classes';
import { getPassiveAffixBonuses } from '../../game/affixEngine';
import { scaleUniqueStats } from '../../data/uniqueItems';
import { getSkillById, SKILL_TYPE } from '../../data/skillTrees';

// Helper to calculate XP needed for next level
export const xpForLevel = (level) => Math.floor(100 * Math.pow(1.25, level - 1));

// OPTIMIZATION: Memoization cache for hero stats
export const statCache = new Map();

// OPTIMIZATION: Secondary index for O(1) cache invalidation
export const heroCacheKeys = new Map(); // heroId -> Set of cache keys

// OPTIMIZATION: Pre-computed party skill bonus cache
// Maps hero ID to array of party-affecting skill IDs they have
let partySkillBonusCache = new Map();
let partySkillBonusCacheVersion = 0;

// Update party skill bonus cache when skills change
const updatePartySkillBonusCache = (allHeroes) => {
  partySkillBonusCache.clear();
  for (const hero of allHeroes) {
    if (!hero) continue;
    const partySkills = [];
    for (const skillId of (hero.skills || [])) {
      const skill = getSkillById(skillId);
      if (skill?.passive?.type === 'party_stat_bonus') {
        partySkills.push(skillId);
      }
    }
    if (partySkills.length > 0) {
      partySkillBonusCache.set(hero.id, partySkills);
    }
  }
  partySkillBonusCacheVersion++;
};

// Generate a cache key for hero stats - OPTIMIZED: no .sort(), pre-computed party skills
const getStatCacheKey = (hero, allHeroes = [], homesteadBonuses = null) => {
  // Key components: hero id, level, equipment ids, skills, homestead bonuses, party skills version, highest party level
  const equipmentHash = [
    hero.equipment.weapon?.id || 'null',
    hero.equipment.armor?.id || 'null',
    hero.equipment.accessory?.id || 'null',
  ].join(',');

  // Skills hash - join in order (no sort needed, order is stable)
  const skillsHash = (hero.skills || []).join(',');

  // Use cached party skill bonus version instead of recalculating
  const homesteadHash = homesteadBonuses
    ? `${homesteadBonuses.hp || 0},${homesteadBonuses.attack || 0},${homesteadBonuses.defense || 0}`
    : 'null';

  // Include highest party level for unique item scaling
  const highestPartyLevel = allHeroes.length > 0
    ? Math.max(...allHeroes.map(h => h.level))
    : hero.level;

  return `${hero.id}:${hero.level}:${equipmentHash}:${skillsHash}:${partySkillBonusCacheVersion}:${homesteadHash}:${highestPartyLevel}`;
};

// Helper to calculate hero stats including equipment, passive skills, and homestead bonuses
export const calculateHeroStats = (hero, allHeroes = [], homesteadBonuses = null) => {
  // OPTIMIZATION: Update party skill bonus cache if needed (only when party is provided)
  if (allHeroes.length > 0 && partySkillBonusCache.size === 0) {
    updatePartySkillBonusCache(allHeroes);
  }

  // OPTIMIZATION: Check cache first
  const cacheKey = getStatCacheKey(hero, allHeroes, homesteadBonuses);
  if (statCache.has(cacheKey)) {
    return statCache.get(cacheKey);
  }

  const classData = CLASSES[hero.classId];
  const baseStats = { ...classData.baseStats };
  const growth = classData.growthPerLevel;

  // Apply level growth
  let stats = {
    maxHp: baseStats.maxHp + growth.maxHp * (hero.level - 1),
    attack: baseStats.attack + growth.attack * (hero.level - 1),
    defense: baseStats.defense + growth.defense * (hero.level - 1),
    speed: baseStats.speed + growth.speed * (hero.level - 1),
  };

  // Apply homestead percentage bonuses (before equipment for multiplicative effect)
  if (homesteadBonuses) {
    if (homesteadBonuses.hp > 0) {
      stats.maxHp = Math.floor(stats.maxHp * (1 + homesteadBonuses.hp));
    }
    if (homesteadBonuses.attack > 0) {
      stats.attack = Math.floor(stats.attack * (1 + homesteadBonuses.attack));
    }
    if (homesteadBonuses.defense > 0) {
      stats.defense = Math.floor(stats.defense * (1 + homesteadBonuses.defense));
    }
  }

  // Calculate highest party level for unique item scaling
  const highestPartyLevel = allHeroes.length > 0
    ? Math.max(...allHeroes.map(h => h.level))
    : hero.level;

  // Apply equipment bonuses
  for (const slot of ['weapon', 'armor', 'accessory']) {
    const item = hero.equipment[slot];
    if (item) {
      // For unique items with baseStats, rescale based on highest party level
      const itemStats = (item.isUnique && item.baseStats)
        ? scaleUniqueStats(item.baseStats, highestPartyLevel)
        : item.stats;
      for (const [stat, value] of Object.entries(itemStats)) {
        if (stats[stat] !== undefined) {
          stats[stat] += value;
        }
      }
    }
  }

  // Apply passive affix bonuses from equipment
  const affixBonuses = getPassiveAffixBonuses(hero);
  if (affixBonuses.maxHpBonus > 0) {
    stats.maxHp = Math.floor(stats.maxHp * (1 + affixBonuses.maxHpBonus));
  }
  if (affixBonuses.speedBonus > 0) {
    stats.speed += affixBonuses.speedBonus;
  }

  // Apply passive skill bonuses
  const skills = hero.skills || [];
  for (const skillId of skills) {
    const skill = getSkillById(skillId);
    if (skill && skill.type === SKILL_TYPE.PASSIVE && skill.passive) {
      const passive = skill.passive;

      // Direct stat bonuses
      if (passive.type === 'stat_bonus' && passive.stats) {
        for (const [stat, value] of Object.entries(passive.stats)) {
          if (stats[stat] !== undefined) {
            stats[stat] += value;
          }
        }
      }

      // Dodge/evasion bonuses
      if (passive.type === 'dodge_chance') {
        stats.speed += Math.floor(passive.percent / 5); // Convert dodge to speed bonus
      }

      // Threat bonus (affects targeting priority)
      if (passive.type === 'threat_bonus') {
        stats.threat = (stats.threat || 0) + passive.percent;
      }
    }
  }

  // Apply party-wide passive bonuses from all party members (like Cleric's Holy Aura)
  // This includes the hero's own auras - "All allies" includes the caster
  // OPTIMIZATION: Use pre-computed party skill bonus cache
  for (const ally of allHeroes) {
    if (!ally) continue; // Skip undefined
    const partySkills = partySkillBonusCache.get(ally.id);
    if (partySkills) {
      for (const skillId of partySkills) {
        const skill = getSkillById(skillId);
        if (skill?.passive?.stats) {
          for (const [stat, value] of Object.entries(skill.passive.stats)) {
            if (stats[stat] !== undefined) {
              stats[stat] += value;
            }
          }
        }
      }
    }
  }

  // OPTIMIZATION: Limit cache size to prevent memory leaks
  // Use smaller cache (32 entries) and full clear when exceeded for simplicity
  if (statCache.size >= 32) {
    statCache.clear();
    heroCacheKeys.clear();
  }
  statCache.set(cacheKey, stats);

  // OPTIMIZATION: Track cache key in secondary index for O(1) invalidation
  if (!heroCacheKeys.has(hero.id)) {
    heroCacheKeys.set(hero.id, new Set());
  }
  heroCacheKeys.get(hero.id).add(cacheKey);

  return stats;
};

// Invalidate stat cache for a specific hero (call when equipment/level/skills change)
export const invalidateStatCache = (heroId) => {
  const keys = heroCacheKeys.get(heroId);
  if (keys) {
    for (const key of keys) {
      statCache.delete(key);
    }
    heroCacheKeys.delete(heroId);
  }
};

// Clear entire stat cache (call on major changes like party composition)
export const clearStatCache = () => {
  statCache.clear();
  heroCacheKeys.clear();
  partySkillBonusCache.clear(); // Clear party skill cache so it rebuilds
  partySkillBonusCacheVersion++; // Invalidate cache keys
};

// Calculate skill points earned from level
// L1=0, L2=1, L3=2, then +1 every 3 levels (L6=3, L9=4, etc.)
export const calculateSkillPoints = (level) => {
  if (level < 2) return 0;
  if (level < 3) return 1;
  return 1 + Math.floor(level / 3);
};

// Calculate used skill points (all learned skills cost a point)
export const calculateUsedSkillPoints = (hero) => {
  return (hero.skills || []).length;
};
