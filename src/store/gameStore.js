import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CLASSES, PARTY_SLOTS, getClassesByRole } from '../data/classes';
import { getPassiveAffixBonuses } from '../game/affixEngine';

// OPTIMIZATION: Throttled localStorage to prevent writes on every state change
// Only saves at most once every 2 seconds, reducing main thread blocking
const throttledStorage = (() => {
  let timeout = null;
  let pendingValue = null;
  let pendingName = null;
  const DELAY = 2000;

  return {
    getItem: (name) => {
      return localStorage.getItem(name);
    },
    setItem: (name, value) => {
      pendingName = name;
      pendingValue = value;
      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null;
          if (pendingValue !== null) {
            localStorage.setItem(pendingName, pendingValue);
          }
        }, DELAY);
      }
    },
    removeItem: (name) => {
      localStorage.removeItem(name);
    },
  };
})();
import { canClassUseEquipment, generateEquipment, getEquipmentForClass, getEquipmentByTier } from '../data/equipment';
import { getSkillById, getStarterSkill, arePrerequisitesMet, calculateRespecCost, SKILL_TYPE } from '../data/skillTrees';
import { BUILDINGS, getUpgradeCost, calculateHomesteadBonuses } from '../data/homestead';

// Random name generators for tavern heroes
const FIRST_NAMES = [
  'Aldric', 'Brynn', 'Cedric', 'Daria', 'Elric', 'Freya', 'Gareth', 'Helena',
  'Ivar', 'Jade', 'Kira', 'Lyra', 'Magnus', 'Nadia', 'Orin', 'Petra',
  'Quinn', 'Rhea', 'Sven', 'Thalia', 'Ulric', 'Vera', 'Wyatt', 'Xena',
  'Yuri', 'Zara', 'Ash', 'Brock', 'Cleo', 'Drake', 'Echo', 'Finn',
  'Gwen', 'Hugo', 'Iris', 'Jax', 'Kane', 'Luna', 'Milo', 'Nova',
];

const EPITHETS = [
  'the Bold', 'the Brave', 'the Swift', 'the Wise', 'the Strong',
  'the Fierce', 'the Cunning', 'the Valiant', 'the Stalwart', 'the Silent',
  'Ironhand', 'Shadowstep', 'Lightbringer', 'Stormborn', 'Frostbane',
  'Flameheart', 'Duskwalker', 'Dawnbreaker', 'Nightshade', 'Thornguard',
];

// Generate a random tavern hero
const generateTavernHero = (role, dungeonLevel = 1) => {
  // Get available classes for this role
  const availableClasses = getClassesByRole(role);
  const classData = availableClasses[Math.floor(Math.random() * availableClasses.length)];

  // Generate random name
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const hasEpithet = Math.random() > 0.6;
  const epithet = hasEpithet ? EPITHETS[Math.floor(Math.random() * EPITHETS.length)] : '';
  const name = hasEpithet ? `${firstName} ${epithet}` : firstName;

  // Level scales with highest dungeon cleared
  // Base level is roughly half of dungeon level, with ±1-2 variance
  const baseLevel = Math.max(1, Math.floor(dungeonLevel / 2));
  const variance = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
  const level = Math.max(1, baseLevel + variance);

  // Get starter skill
  const starterSkill = getStarterSkill(classData.id);

  // Generate equipment (chance based on dungeon progress)
  const equipment = { weapon: null, armor: null, accessory: null };
  const equipChance = Math.min(0.8, 0.3 + dungeonLevel * 0.05);

  ['weapon', 'armor', 'accessory'].forEach(slot => {
    if (Math.random() < equipChance) {
      // Get equipment usable by this class for this slot
      const availableEquip = getEquipmentForClass(classData.id, Math.ceil(dungeonLevel / 5))
        .filter(e => e.slot === slot);

      if (availableEquip.length > 0) {
        // Generate a random item of this type
        const template = availableEquip[Math.floor(Math.random() * availableEquip.length)];
        // Lower rarity for tavern heroes (mostly common/uncommon)
        const item = generateEquipment(Math.max(1, dungeonLevel - 2), {
          forceTemplate: template.id,
        });
        // Override to lower rarity for balance
        if (item && Math.random() < 0.7) {
          item.rarity = Math.random() < 0.6 ? 'common' : 'uncommon';
        }
        equipment[slot] = item;
      }
    }
  });

  // Calculate recruitment cost based on level and equipment
  let baseCost = 50 + level * 30;
  // Add cost for equipment
  Object.values(equipment).forEach(item => {
    if (item) {
      const rarityBonus = { common: 10, uncommon: 25, rare: 50, epic: 100, legendary: 200 };
      baseCost += rarityBonus[item.rarity] || 10;
    }
  });

  // Add a trait (special bonus)
  const traits = [
    { id: 'veteran', name: 'Veteran', description: '+10% XP gain', xpBonus: 0.1 },
    { id: 'lucky', name: 'Lucky', description: '+5% gold find', goldBonus: 0.05 },
    { id: 'hardy', name: 'Hardy', description: '+10 max HP', hpBonus: 10 },
    { id: 'quick', name: 'Quick Learner', description: 'Starts with +1 level', levelBonus: 1 },
    { id: 'equipped', name: 'Well-Equipped', description: 'Comes with better gear', gearBonus: true },
    { id: 'none', name: null, description: null },
  ];
  const trait = traits[Math.floor(Math.random() * traits.length)];

  // Apply trait effects
  let finalLevel = level;
  if (trait.id === 'quick') {
    finalLevel += 1;
    baseCost += 40;
  }
  if (trait.id === 'hardy') baseCost += 20;
  if (trait.id === 'veteran') baseCost += 30;

  return {
    id: `tavern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    classId: classData.id,
    level: finalLevel,
    xp: 0,
    equipment,
    skills: starterSkill ? [starterSkill.id] : [],
    trait: trait.id !== 'none' ? trait : null,
    recruitCost: Math.floor(baseCost),
    role,
  };
};

// OPTIMIZATION: Combat log batching to reduce state updates
let pendingCombatLogs = [];
let combatLogFlushScheduled = false;
let combatLogFlushFn = null;

const flushCombatLogs = () => {
  if (pendingCombatLogs.length > 0 && combatLogFlushFn) {
    const logs = pendingCombatLogs;
    pendingCombatLogs = [];
    combatLogFlushScheduled = false;
    combatLogFlushFn(logs);
  } else {
    combatLogFlushScheduled = false;
  }
};

// Helper to calculate XP needed for next level
const xpForLevel = (level) => Math.floor(100 * Math.pow(1.25, level - 1));

// Stat priority weights for auto-equip decisions
const STAT_PRIORITIES = {
  tank:     { maxHp: 2.0, defense: 1.5, attack: 0.5, speed: 0.3 },
  damage:   { attack: 2.0, speed: 1.0, maxHp: 0.3, defense: 0.3 },
  balanced: { attack: 1.0, defense: 1.0, maxHp: 1.0, speed: 1.0 },
  speed:    { speed: 2.0, attack: 1.0, maxHp: 0.5, defense: 0.3 },
};

// Default stat priority per class
const DEFAULT_CLASS_PRIORITY = {
  warrior: 'tank',
  paladin: 'tank',
  knight: 'tank',
  mage: 'damage',
  rogue: 'speed',
  cleric: 'balanced',
  druid: 'balanced',
  shaman: 'balanced',
  ranger: 'speed',
  necromancer: 'damage',
};

// Calculate weighted item score based on priority
const calculateItemScore = (item, priority) => {
  const weights = STAT_PRIORITIES[priority] || STAT_PRIORITIES.balanced;
  return Object.entries(item.stats).reduce(
    (sum, [stat, val]) => sum + val * (weights[stat] || 0.5), 0
  );
};

// Calculate sell value for an item
const calculateSellValue = (item) => {
  const statTotal = Object.values(item.stats).reduce((a, b) => a + b, 0);
  const rarityMultiplier = { common: 1, uncommon: 2, rare: 4, epic: 8, legendary: 16 };
  return Math.max(1, Math.floor(statTotal * (rarityMultiplier[item.rarity] || 1)));
};

// Rarity ordering for comparisons
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// OPTIMIZATION: Memoization cache for hero stats
const statCache = new Map();

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
  // Key components: hero id, level, equipment ids, skills, homestead bonuses, party skills version
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

  return `${hero.id}:${hero.level}:${equipmentHash}:${skillsHash}:${partySkillBonusCacheVersion}:${homesteadHash}`;
};

// Helper to calculate hero stats including equipment, passive skills, and homestead bonuses
const calculateHeroStats = (hero, allHeroes = [], homesteadBonuses = null) => {
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

  // Apply equipment bonuses
  for (const slot of ['weapon', 'armor', 'accessory']) {
    const item = hero.equipment[slot];
    if (item) {
      for (const [stat, value] of Object.entries(item.stats)) {
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

  // Apply party-wide passive bonuses from allies (like Cleric's Holy Aura)
  // OPTIMIZATION: Use pre-computed party skill bonus cache
  for (const ally of allHeroes) {
    if (!ally || ally.id === hero.id) continue; // Skip self and undefined
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

// OPTIMIZATION: Secondary index for O(1) cache invalidation
const heroCacheKeys = new Map(); // heroId -> Set of cache keys

// Invalidate stat cache for a specific hero (call when equipment/level/skills change)
const invalidateStatCache = (heroId) => {
  const keys = heroCacheKeys.get(heroId);
  if (keys) {
    for (const key of keys) {
      statCache.delete(key);
    }
    heroCacheKeys.delete(heroId);
  }
};

// Clear entire stat cache (call on major changes like party composition)
const clearStatCache = () => {
  statCache.clear();
  heroCacheKeys.clear();
  partySkillBonusCache.clear(); // Clear party skill cache so it rebuilds
  partySkillBonusCacheVersion++; // Invalidate cache keys
};

// Calculate skill points earned from level (1 point per 3 levels)
const calculateSkillPoints = (level) => Math.floor(level / 3);

// Calculate used skill points (excluding starter skill)
const calculateUsedSkillPoints = (hero) => {
  const skills = hero.skills || [];
  const starterSkill = getStarterSkill(hero.classId);
  return skills.filter(s => s !== starterSkill?.id).length;
};

// Create a new hero
const createHero = (classId, name, startingLevel = 1) => {
  const classData = CLASSES[classId];
  const starterSkill = getStarterSkill(classId);

  return {
    id: `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name || classData.name,
    classId,
    level: startingLevel,
    xp: 0,
    equipment: {
      weapon: null,
      armor: null,
      accessory: null,
    },
    skills: starterSkill ? [starterSkill.id] : [], // Start with class starter skill
  };
};

export const useGameStore = create(
  persist(
    (set, get) => ({
      // Resources
      gold: 100,

      // Heroes
      heroes: [],
      bench: [], // Benched heroes (inactive, preserves progress)
      maxBenchSize: 6,
      maxPartySize: 4,
      // Track which slots have had their "first recruit" discount used
      usedSlotDiscounts: [], // [0, 1, 2, 3] means all 4 slots have been recruited once

      // Heroes recruited during a dungeon (will be added when dungeon ends)
      pendingRecruits: [], // { hero, slotIndex, toBench }

      // Party changes queued during dungeon (applied when dungeon ends)
      pendingPartyChanges: [], // { type: 'retire' | 'classChange', heroId, slotIndex, newClassId, refundGold }

      // Tavern system
      tavern: {
        heroes: [], // Heroes available for recruitment
        lastRefresh: 0, // Timestamp of last refresh
        refreshCost: 25, // Gold cost to manually refresh
      },

      // Inventory
      inventory: [],
      maxInventory: 50,

      // Consumables (temporary items that clear on dungeon exit)
      consumables: [], // Array of consumable items like resurrection scrolls

      // Dungeon state
      dungeon: null, // Current dungeon run
      highestDungeonCleared: 0,
      dungeonUnlocked: 1,
      lastDungeonSuccess: null, // null = no dungeon run yet, true = victory, false = defeat

      // Combat state (full state machine)
      combat: null,
      // OPTIMIZATION: Circular buffer for combat log to avoid array slice allocations
      combatLog: [],
      combatLogIndex: 0,  // Write position in circular buffer
      combatLogCount: 0,  // Number of entries (max 50)

      // Persistent hero HP across rooms (not reset until dungeon ends)
      heroHp: {}, // { heroId: currentHp }

      // Room combat state (now used for maze exploration + combat)
      roomCombat: null, // { phase, turnOrder, currentTurnIndex, round, heroes, monsters, room/dungeon, partyPosition, targetPosition, viewport }

      // Game state
      isRunning: false,
      gameSpeed: 1, // 1x, 2x, 3x
      lastSaveTime: Date.now(),

      // Statistics
      stats: {
        totalGoldEarned: 0,
        totalGoldSpent: 0,
        totalItemsLooted: 0,
        totalMonstersKilled: 0,
        totalBossesKilled: 0,
        totalDungeonsCleared: 0,
        totalDeaths: 0,
        // Combat totals
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        totalHealingDone: 0,
        totalHealingReceived: 0,
        totalCriticalHits: 0,
        totalDodges: 0,
        totalMitigated: 0,
        // Breakdowns
        monsterKills: {},   // { goblin: { count: 5, isBoss: false } }
        heroStats: {},      // { heroId: { damageDealt, kills, damageTaken, healingDone } }
      },

      // Equipment settings
      equipmentSettings: {
        autoSellJunk: true,  // Auto-sell items that aren't upgrades for anyone
        autoEquipUpgrades: true, // Auto-equip items that are upgrades
        classPriority: { ...DEFAULT_CLASS_PRIORITY },
      },

      // Loot notifications (non-blocking toasts)
      lootNotifications: [],  // { id, type, item, hero?, gold?, timestamp }

      // Homestead - upgradeable buildings for permanent bonuses
      homestead: {
        barracks: 0,
        armory: 0,
        fortress: 0,
        trainingGrounds: 0,
        treasury: 0,
        academy: 0,
        infirmary: 0,
        tavern: 0,
      },

      // Dungeon meta-progression
      dungeonProgress: {
        currentType: 'normal', // 'normal', 'elite', 'raid'
        currentRaidId: null,   // Which raid is in progress
        currentRaidWing: 0,    // Current wing index
        completedRaidWings: [], // ['raid_id:wing_id', ...]
        weeklyRaidCompletions: [], // Track weekly lockouts
        lastWeeklyReset: Date.now(),
        activeAffixes: [],     // Active dungeon affixes for elite/raid
      },

      // Player's dungeon preferences (persists between runs)
      dungeonSettings: {
        type: 'normal', // 'normal' or 'elite'
        autoAdvance: false, // Auto-start next dungeon after completion (starts disabled)
        targetLevel: null, // If set, auto-advance stops at this level
      },

      // Feature unlock tracking
      featureUnlocks: {
        autoAdvance: false, // Unlocks when player clears Dungeon 5
        homesteadSeen: false, // Tracks if player has visited homestead after unlock
      },

      // Ascension mode (post dungeon 30)
      ascension: {
        level: 0,           // Current ascension level
        unlocked: false,    // Has beaten dungeon 30
        highestLevel: 0,    // Highest ascension level reached
      },

      // Max dungeon level (hard cap)
      maxDungeonLevel: 30,

      // Item Shop (unlocks at D5)
      shop: {
        items: [],           // Current shop inventory
        lastRefresh: 0,      // Timestamp of last refresh
        refreshCost: 50,     // Gold cost to manually refresh
      },

      // Actions
      addHero: (classId, name, slotIndex) => {
        const { heroes, maxPartySize, homestead, usedSlotDiscounts, dungeon, pendingRecruits } = get();

        // Find slot index if not provided (first empty slot)
        let targetSlot = slotIndex;
        if (targetSlot === undefined) {
          for (let i = 0; i < PARTY_SLOTS.length; i++) {
            if (!heroes[i]) {
              targetSlot = i;
              break;
            }
          }
        }

        if (targetSlot === undefined || targetSlot >= maxPartySize) return false;

        // Check if slot is already filled (or pending)
        const slotHasPending = pendingRecruits.some(p => p.slotIndex === targetSlot);
        if (heroes[targetSlot] || slotHasPending) return false;

        // Apply tavern bonus to starting level
        const tavernBonus = homestead.tavern || 0;
        const startingLevel = 1 + tavernBonus;
        const hero = createHero(classId, name, startingLevel);

        // Mark this slot's discount as used
        const newUsedDiscounts = usedSlotDiscounts.includes(targetSlot)
          ? usedSlotDiscounts
          : [...usedSlotDiscounts, targetSlot];

        // If in dungeon, add to pending recruits
        if (dungeon) {
          set({
            pendingRecruits: [...pendingRecruits, { hero, slotIndex: targetSlot, toBench: false }],
            usedSlotDiscounts: newUsedDiscounts,
          });
          return 'pending';
        }

        // OPTIMIZATION: Clear cache when party composition changes (affects party buffs)
        clearStatCache();

        // Insert hero at the correct slot position
        const newHeroes = [...heroes];
        newHeroes[targetSlot] = hero;

        set({
          heroes: newHeroes,
          usedSlotDiscounts: newUsedDiscounts,
        });

        return true;
      },

      // Check if a slot's first-recruit discount has been used
      isSlotDiscountUsed: (slotIndex) => {
        return get().usedSlotDiscounts.includes(slotIndex);
      },

      removeHero: (heroId) => {
        // OPTIMIZATION: Clear cache when party composition changes
        clearStatCache();

        set(state => ({
          heroes: state.heroes.filter(h => h.id !== heroId),
        }));
      },

      // Retire a hero permanently for gold
      retireHero: (heroId) => {
        const { heroes, bench, dungeon, pendingPartyChanges } = get();

        // Count total heroes (party + bench), minus any pending retirements
        const pendingRetires = pendingPartyChanges.filter(p => p.type === 'retire').length;
        const totalHeroes = heroes.filter(Boolean).length + bench.length - pendingRetires;

        // Can't retire last hero
        if (totalHeroes <= 1) return false;

        // Find hero in party or bench
        const heroInParty = heroes.filter(Boolean).find(h => h.id === heroId);
        const heroInBench = bench.find(h => h.id === heroId);
        const hero = heroInParty || heroInBench;

        if (!hero) return false;

        // Calculate retirement gold: base 25 + 25 per level
        const retireGold = 25 + (hero.level * 25);

        // If in dungeon, queue the retirement for after dungeon ends
        if (dungeon) {
          // Check if already pending
          if (pendingPartyChanges.some(p => p.heroId === heroId)) return false;

          set(state => ({
            pendingPartyChanges: [...state.pendingPartyChanges, {
              type: 'retire',
              heroId,
              refundGold: retireGold,
            }],
          }));
          return retireGold; // Return expected gold (will be added after dungeon)
        }

        clearStatCache();

        // Remove from heroes array properly
        let newHeroes = [...heroes];
        if (heroInParty) {
          const idx = newHeroes.findIndex(h => h?.id === heroId);
          if (idx !== -1) newHeroes[idx] = undefined;
          // Clean up trailing undefined
          while (newHeroes.length > 0 && newHeroes[newHeroes.length - 1] === undefined) {
            newHeroes.pop();
          }
        }

        set(state => ({
          heroes: heroInParty ? newHeroes : state.heroes,
          bench: heroInBench ? state.bench.filter(h => h.id !== heroId) : state.bench,
          gold: state.gold + retireGold,
        }));

        return retireGold;
      },

      // Move a hero from active party to bench
      benchHero: (heroId) => {
        const { heroes, bench, dungeon, maxBenchSize } = get();

        // Can't bench during active dungeon
        if (dungeon) return false;

        // Check bench capacity
        if (bench.length >= maxBenchSize) return false;

        const heroIndex = heroes.findIndex(h => h.id === heroId);
        if (heroIndex === -1) return false;

        const hero = heroes[heroIndex];

        // OPTIMIZATION: Clear cache when party composition changes
        clearStatCache();

        // Remove from heroes array but keep the slot structure
        const newHeroes = [...heroes];
        newHeroes[heroIndex] = undefined;
        // Clean up trailing undefined values
        while (newHeroes.length > 0 && newHeroes[newHeroes.length - 1] === undefined) {
          newHeroes.pop();
        }

        set({
          heroes: newHeroes,
          bench: [...bench, hero],
        });
        return true;
      },

      // Move a hero from bench to active party at a specific slot
      activateHero: (heroId, slotIndex) => {
        const { heroes, bench, dungeon, maxPartySize, maxBenchSize } = get();

        // Can't activate during active dungeon
        if (dungeon) return false;

        // Find the hero on bench
        const heroOnBench = bench.find(h => h.id === heroId);
        if (!heroOnBench) return false;

        // Check if slot is valid
        if (slotIndex < 0 || slotIndex >= maxPartySize) return false;

        // Get the hero's role
        const heroClass = CLASSES[heroOnBench.classId];
        const heroRole = heroClass?.role;

        // Check role requirement for the slot
        const slotRequirement = PARTY_SLOTS[slotIndex];

        // Verify role matches slot requirement
        if (slotRequirement && heroRole !== slotRequirement.role) return false;

        // OPTIMIZATION: Clear cache when party composition changes
        clearStatCache();

        // If there's already a hero in this slot, swap them
        const currentHeroInSlot = heroes[slotIndex];

        // Ensure heroes array is long enough
        let newHeroes = [...heroes];
        while (newHeroes.length <= slotIndex) {
          newHeroes.push(undefined);
        }

        let newBench = bench.filter(h => h.id !== heroId);

        if (currentHeroInSlot) {
          // Check bench capacity for swap
          if (newBench.length >= maxBenchSize) return false;
          // Swap: move current hero to bench
          newBench = [...newBench, currentHeroInSlot];
        }

        // Place hero in slot
        newHeroes[slotIndex] = heroOnBench;

        set({
          heroes: newHeroes,
          bench: newBench,
        });

        return true;
      },

      // Recruit a new hero directly to bench (for collecting heroes without using slots)
      recruitToBench: (classId, name) => {
        const { bench, homestead } = get();

        // Apply tavern bonus to starting level
        const tavernBonus = homestead.tavern || 0;
        const startingLevel = 1 + tavernBonus;
        const hero = createHero(classId, name, startingLevel);

        set({ bench: [...bench, hero] });
        return true;
      },

      // === TAVERN SYSTEM ===

      // Refresh the tavern with new heroes
      refreshTavern: (manual = false) => {
        const { tavern, gold, highestDungeonCleared, usedSlotDiscounts } = get();

        // Check if manual refresh and can afford
        if (manual && gold < tavern.refreshCost) return false;

        // Only show roles where the player has already recruited their first FREE hero
        // This encourages players to use their free recruits first
        const availableRoles = [];
        for (let i = 0; i < PARTY_SLOTS.length; i++) {
          const slot = PARTY_SLOTS[i];
          // Only add role if this slot's first-recruit discount has been used
          if (usedSlotDiscounts.includes(i)) {
            availableRoles.push(slot.role);
          }
        }

        // If no roles have been recruited yet, tavern is empty
        if (availableRoles.length === 0) {
          set(state => ({
            gold: manual ? state.gold - state.tavern.refreshCost : state.gold,
            tavern: {
              ...state.tavern,
              heroes: [],
              lastRefresh: Date.now(),
            },
          }));
          return true;
        }

        // Generate 3-4 heroes for the tavern
        const heroCount = Math.min(3 + (Math.random() > 0.5 ? 1 : 0), availableRoles.length + 2);
        const newHeroes = [];

        for (let i = 0; i < heroCount; i++) {
          const role = availableRoles[Math.floor(Math.random() * availableRoles.length)];
          newHeroes.push(generateTavernHero(role, highestDungeonCleared));
        }

        set(state => ({
          gold: manual ? state.gold - state.tavern.refreshCost : state.gold,
          tavern: {
            ...state.tavern,
            heroes: newHeroes,
            lastRefresh: Date.now(),
          },
        }));

        return true;
      },

      // Recruit a hero from the tavern
      recruitFromTavern: (tavernHeroId, slotIndex) => {
        const { tavern, heroes, bench, gold, maxPartySize, maxBenchSize, usedSlotDiscounts, dungeon, pendingRecruits } = get();

        // Find the tavern hero
        const tavernHero = tavern.heroes.find(h => h.id === tavernHeroId);
        if (!tavernHero) return false;

        // Check if can afford
        if (gold < tavernHero.recruitCost) return false;

        // Determine where to place the hero
        const targetSlot = slotIndex !== undefined ? slotIndex : null;
        let placingInParty = false;
        let actualSlotIndex = targetSlot;

        // Check pending recruits for slot availability
        const pendingSlots = pendingRecruits.filter(p => !p.toBench).map(p => p.slotIndex);
        const pendingBenchCount = pendingRecruits.filter(p => p.toBench).length;

        if (targetSlot !== null) {
          // Trying to place in party
          if (targetSlot >= maxPartySize) return false;

          // Check role matches slot
          const slotRole = PARTY_SLOTS[targetSlot]?.role;
          if (slotRole !== tavernHero.role) return false;

          // Check slot is empty (including pending)
          if (heroes[targetSlot] || pendingSlots.includes(targetSlot)) return false;

          placingInParty = true;
          actualSlotIndex = targetSlot;
        } else {
          // Try to find an empty party slot for this role
          for (let i = 0; i < PARTY_SLOTS.length; i++) {
            if (PARTY_SLOTS[i].role === tavernHero.role && !heroes[i] && !pendingSlots.includes(i)) {
              placingInParty = true;
              actualSlotIndex = i;
              break;
            }
          }

          // If no party slot, go to bench
          if (!placingInParty && (bench.length + pendingBenchCount) >= maxBenchSize) {
            return false; // No room
          }
        }

        // Create the actual hero from tavern hero data
        const newHero = {
          id: `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: tavernHero.name,
          classId: tavernHero.classId,
          level: tavernHero.level,
          xp: 0,
          equipment: tavernHero.equipment,
          skills: tavernHero.skills,
          trait: tavernHero.trait,
        };

        // If in dungeon, add to pending recruits
        if (dungeon) {
          const newUsedDiscounts = placingInParty && !usedSlotDiscounts.includes(actualSlotIndex)
            ? [...usedSlotDiscounts, actualSlotIndex]
            : usedSlotDiscounts;

          set(state => ({
            pendingRecruits: [...pendingRecruits, {
              hero: newHero,
              slotIndex: placingInParty ? actualSlotIndex : null,
              toBench: !placingInParty,
            }],
            usedSlotDiscounts: newUsedDiscounts,
            gold: state.gold - tavernHero.recruitCost,
            tavern: {
              ...state.tavern,
              heroes: state.tavern.heroes.filter(h => h.id !== tavernHeroId),
            },
          }));
          return 'pending';
        }

        clearStatCache();

        if (placingInParty) {
          // Place in party
          const newHeroes = [...heroes];
          while (newHeroes.length <= actualSlotIndex) {
            newHeroes.push(undefined);
          }
          newHeroes[actualSlotIndex] = newHero;

          // Mark slot discount as used
          const newUsedDiscounts = usedSlotDiscounts.includes(actualSlotIndex)
            ? usedSlotDiscounts
            : [...usedSlotDiscounts, actualSlotIndex];

          set(state => ({
            heroes: newHeroes,
            usedSlotDiscounts: newUsedDiscounts,
            gold: state.gold - tavernHero.recruitCost,
            tavern: {
              ...state.tavern,
              heroes: state.tavern.heroes.filter(h => h.id !== tavernHeroId),
            },
          }));
        } else {
          // Place on bench
          set(state => ({
            bench: [...state.bench, newHero],
            gold: state.gold - tavernHero.recruitCost,
            tavern: {
              ...state.tavern,
              heroes: state.tavern.heroes.filter(h => h.id !== tavernHeroId),
            },
          }));
        }

        return true;
      },

      // Check if tavern needs refresh (auto-refresh after dungeon or time)
      checkTavernRefresh: () => {
        const { tavern } = get();
        const timeSinceRefresh = Date.now() - tavern.lastRefresh;
        const refreshInterval = 5 * 60 * 1000; // 5 minutes

        if (tavern.heroes.length === 0 || timeSinceRefresh > refreshInterval) {
          get().refreshTavern(false);
        }
      },

      addXpToHero: (heroId, xp) => {
        set(state => {
          const heroes = state.heroes.map(hero => {
            if (hero.id !== heroId) return hero;

            let newXp = hero.xp + xp;
            let newLevel = hero.level;
            const oldLevel = hero.level;

            // Level up loop
            while (newXp >= xpForLevel(newLevel)) {
              newXp -= xpForLevel(newLevel);
              newLevel++;
            }

            // OPTIMIZATION: Invalidate stat cache on level up
            if (newLevel !== oldLevel) {
              invalidateStatCache(heroId);
            }

            return { ...hero, xp: newXp, level: newLevel };
          });
          return { heroes };
        });
      },

      equipItem: (heroId, item) => {
        set(state => {
          const hero = state.heroes.find(h => h.id === heroId);
          if (!hero) return state;

          // Check class restriction
          if (!canClassUseEquipment(hero.classId, item)) return state;

          const oldItem = hero.equipment[item.slot];
          const newInventory = state.inventory.filter(i => i.id !== item.id);

          // Auto-sell old item if there was one equipped
          let goldGain = 0;
          if (oldItem) {
            goldGain = calculateSellValue(oldItem);
          }

          // OPTIMIZATION: Invalidate stat cache when equipment changes
          invalidateStatCache(heroId);

          const heroes = state.heroes.map(h => {
            if (h.id !== heroId) return h;
            return {
              ...h,
              equipment: { ...h.equipment, [item.slot]: item },
            };
          });

          return {
            heroes,
            inventory: newInventory,
            gold: state.gold + goldGain,
          };
        });
      },

      unequipItem: (heroId, slot) => {
        set(state => {
          const hero = state.heroes.find(h => h.id === heroId);
          if (!hero || !hero.equipment[slot]) return state;

          const item = hero.equipment[slot];

          if (state.inventory.length >= state.maxInventory) {
            return state; // Inventory full
          }

          const heroes = state.heroes.map(h => {
            if (h.id !== heroId) return h;
            return {
              ...h,
              equipment: { ...h.equipment, [slot]: null },
            };
          });

          return {
            heroes,
            inventory: [...state.inventory, item],
          };
        });
      },

      addToInventory: (item) => {
        set(state => {
          if (state.inventory.length >= state.maxInventory) {
            return state;
          }
          return { inventory: [...state.inventory, item] };
        });
      },

      removeFromInventory: (itemId) => {
        set(state => ({
          inventory: state.inventory.filter(i => i.id !== itemId),
        }));
      },

      sellItem: (itemId) => {
        const { inventory } = get();
        const item = inventory.find(i => i.id === itemId);
        if (!item) return 0;

        const sellValue = calculateSellValue(item);

        set(state => ({
          inventory: state.inventory.filter(i => i.id !== itemId),
          gold: state.gold + sellValue,
          stats: {
            ...state.stats,
            totalGoldEarned: state.stats.totalGoldEarned + sellValue,
          },
        }));

        return sellValue;
      },

      // Sell all items that aren't upgrades for any hero
      sellAllJunk: () => {
        const { inventory, isUpgradeForAnyHero } = get();
        let totalGold = 0;
        const itemsToKeep = [];
        const itemsToSell = [];

        for (const item of inventory) {
          const upgradeCheck = isUpgradeForAnyHero(item);
          if (upgradeCheck.isUpgrade) {
            itemsToKeep.push(item);
          } else {
            itemsToSell.push(item);
            totalGold += calculateSellValue(item);
          }
        }

        if (itemsToSell.length === 0) return { count: 0, gold: 0 };

        set(state => ({
          inventory: itemsToKeep,
          gold: state.gold + totalGold,
          stats: {
            ...state.stats,
            totalGoldEarned: state.stats.totalGoldEarned + totalGold,
          },
        }));

        return { count: itemsToSell.length, gold: totalGold };
      },

      // Consumable actions
      addConsumable: (consumable) => {
        const { consumables } = get();
        // Check max stack (resurrection scroll has max 1)
        const existing = consumables.filter(c => c.templateId === consumable.templateId);
        const maxStack = consumable.maxStack || 1;
        if (existing.length >= maxStack) return false;

        set(state => ({
          consumables: [...state.consumables, consumable],
        }));
        return true;
      },

      removeConsumable: (consumableId) => {
        set(state => ({
          consumables: state.consumables.filter(c => c.id !== consumableId),
        }));
      },

      hasResurrectionScroll: () => {
        const { consumables } = get();
        return consumables.find(c => c.templateId === 'resurrectionScroll') || null;
      },

      useResurrectionScroll: () => {
        const { consumables } = get();
        const scroll = consumables.find(c => c.templateId === 'resurrectionScroll');
        if (!scroll) return null;

        set(state => ({
          consumables: state.consumables.filter(c => c.id !== scroll.id),
        }));

        return scroll;
      },

      clearConsumables: () => {
        set({ consumables: [] });
      },

      // Update equipment settings
      updateEquipmentSettings: (updates) => {
        set(state => ({
          equipmentSettings: { ...state.equipmentSettings, ...updates },
        }));
      },

      // Update class priority
      setClassPriority: (classId, priority) => {
        set(state => ({
          equipmentSettings: {
            ...state.equipmentSettings,
            classPriority: {
              ...state.equipmentSettings.classPriority,
              [classId]: priority,
            },
          },
        }));
      },

      // Item Shop actions
      refreshShop: (manual = false) => {
        const { gold, highestDungeonCleared, shop } = get();

        // Shop unlocks at D5
        if (highestDungeonCleared < 5) return false;

        // Check if manual refresh is affordable
        if (manual && gold < shop.refreshCost) return false;

        // Generate 4 shop items (common/uncommon only)
        const shopItems = [];
        for (let i = 0; i < 4; i++) {
          // Generate item at player's dungeon level but cap rarity
          const item = generateEquipment(highestDungeonCleared, {
            guaranteedRarity: null,
          });

          // Force common or uncommon only
          if (['rare', 'epic', 'legendary'].includes(item.rarity)) {
            item.rarity = Math.random() < 0.6 ? 'common' : 'uncommon';
            // Recalculate stats for lower rarity
            const rarityMult = item.rarity === 'common' ? 1.0 : 1.3;
            const template = getEquipmentByTier(99).find(e => e.id === item.templateId);
            if (template) {
              for (const [stat, val] of Object.entries(template.baseStats)) {
                item.stats[stat] = Math.round(val * rarityMult * (1 + highestDungeonCleared * 0.1));
              }
            }
          }

          // Calculate shop price (1.75x sell value)
          const sellValue = calculateSellValue(item);
          item.shopPrice = Math.floor(sellValue * 1.75);

          shopItems.push(item);
        }

        set(state => ({
          gold: manual ? state.gold - shop.refreshCost : state.gold,
          shop: {
            ...state.shop,
            items: shopItems,
            lastRefresh: Date.now(),
          },
        }));

        return true;
      },

      checkShopRefresh: () => {
        const { shop, highestDungeonCleared, refreshShop } = get();

        // Shop unlocks at D5
        if (highestDungeonCleared < 5) return;

        // Refresh every 4 hours
        const fourHours = 4 * 60 * 60 * 1000;
        if (Date.now() - shop.lastRefresh >= fourHours || shop.items.length === 0) {
          refreshShop(false);
        }
      },

      buyFromShop: (itemId) => {
        const { shop, gold, inventory, maxInventory } = get();

        const item = shop.items.find(i => i.id === itemId);
        if (!item) return false;

        if (gold < item.shopPrice) return false;
        if (inventory.length >= maxInventory) return false;

        // Remove shop price from item before adding to inventory
        const inventoryItem = { ...item };
        delete inventoryItem.shopPrice;

        set(state => ({
          gold: state.gold - item.shopPrice,
          inventory: [...state.inventory, inventoryItem],
          shop: {
            ...state.shop,
            items: state.shop.items.filter(i => i.id !== itemId),
          },
        }));

        return true;
      },

      // Add loot notification
      addLootNotification: (notification) => {
        const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        set(state => ({
          lootNotifications: [
            ...state.lootNotifications.slice(-9), // Keep last 10
            { ...notification, id, timestamp: Date.now() },
          ],
        }));
      },

      // Remove loot notification
      removeLootNotification: (id) => {
        set(state => ({
          lootNotifications: state.lootNotifications.filter(n => n.id !== id),
        }));
      },

      // Clear old notifications
      clearOldNotifications: () => {
        const now = Date.now();
        set(state => ({
          lootNotifications: state.lootNotifications.filter(
            n => now - n.timestamp < 5000
          ),
        }));
      },

      // Check if an item is an upgrade for any hero
      isUpgradeForAnyHero: (item) => {
        const { heroes, equipmentSettings } = get();

        for (const hero of heroes) {
          if (!canClassUseEquipment(hero.classId, item)) continue;

          const priority = equipmentSettings.classPriority[hero.classId] || 'balanced';
          const currentItem = hero.equipment[item.slot];
          const currentScore = currentItem ? calculateItemScore(currentItem, priority) : 0;
          const newScore = calculateItemScore(item, priority);

          if (newScore > currentScore) {
            return { isUpgrade: true, hero, improvement: newScore - currentScore };
          }
        }

        return { isUpgrade: false };
      },

      // Process a loot drop with smart auto-sell and auto-equip
      processLootDrop: (item) => {
        const {
          equipmentSettings,
          inventory,
          maxInventory,
        } = get();

        // Check if this item is an upgrade for anyone
        const upgradeCheck = get().isUpgradeForAnyHero(item);

        // If auto-equip is on and item is an upgrade, equip it immediately
        if (equipmentSettings.autoEquipUpgrades && upgradeCheck.isUpgrade && upgradeCheck.hero) {
          const hero = upgradeCheck.hero;
          const oldItem = hero.equipment[item.slot];
          let goldGain = 0;

          // Handle old item - sell if autoSellJunk, otherwise add to inventory
          if (oldItem) {
            if (equipmentSettings.autoSellJunk) {
              goldGain = calculateSellValue(oldItem);
            } else if (inventory.length < maxInventory) {
              set(state => ({
                inventory: [...state.inventory, oldItem],
              }));
            }
          }

          // Equip the new item
          set(state => ({
            heroes: state.heroes.map(h =>
              h.id === hero.id
                ? { ...h, equipment: { ...h.equipment, [item.slot]: item } }
                : h
            ),
            gold: state.gold + goldGain,
            stats: {
              ...state.stats,
              totalItemsLooted: (state.stats.totalItemsLooted || 0) + 1,
              totalGoldEarned: goldGain > 0 ? state.stats.totalGoldEarned + goldGain : state.stats.totalGoldEarned,
            },
          }));

          get().addLootNotification({
            type: 'auto-equipped',
            item,
            hero,
            oldItem,
            goldGain,
          });
          return { action: 'equipped', hero, oldItem };
        }

        // If auto-sell junk is on and item is not an upgrade, sell it
        if (equipmentSettings.autoSellJunk && !upgradeCheck.isUpgrade) {
          const goldValue = calculateSellValue(item);
          set(state => ({
            gold: state.gold + goldValue,
            stats: {
              ...state.stats,
              totalItemsLooted: (state.stats.totalItemsLooted || 0) + 1,
              totalGoldEarned: state.stats.totalGoldEarned + goldValue,
            },
          }));
          get().addLootNotification({
            type: 'auto-sold',
            item,
            gold: goldValue,
          });
          return { action: 'sold', gold: goldValue };
        }

        // Add to inventory if space available (use fresh state to avoid stale snapshot)
        if (get().inventory.length < maxInventory) {
          set(state => ({
            inventory: [...state.inventory, item],
            stats: {
              ...state.stats,
              totalItemsLooted: (state.stats.totalItemsLooted || 0) + 1,
            },
          }));
          get().addLootNotification({
            type: 'looted',
            item,
            upgradeFor: upgradeCheck.isUpgrade ? upgradeCheck.hero : null,
          });
          return { action: 'looted', upgradeFor: upgradeCheck.hero };
        }

        // Inventory full
        get().addLootNotification({ type: 'inventory-full', item });
        return { action: 'lost' };
      },

      // Get item score for a hero (for comparison UI)
      getItemScoreForHero: (item, heroId) => {
        const { heroes, equipmentSettings } = get();
        const hero = heroes.find(h => h.id === heroId);
        if (!hero) return 0;
        const priority = equipmentSettings.classPriority[hero.classId] || 'balanced';
        return calculateItemScore(item, priority);
      },

      // Compare item to currently equipped
      compareToEquipped: (item, heroId) => {
        const { heroes, equipmentSettings } = get();
        const hero = heroes.find(h => h.id === heroId);
        if (!hero) return null;

        const priority = equipmentSettings.classPriority[hero.classId] || 'balanced';
        const currentItem = hero.equipment[item.slot];
        const currentScore = currentItem ? calculateItemScore(currentItem, priority) : 0;
        const newScore = calculateItemScore(item, priority);

        // Calculate per-stat differences
        const statDiff = {};
        const allStats = new Set([
          ...Object.keys(item.stats),
          ...(currentItem ? Object.keys(currentItem.stats) : []),
        ]);

        for (const stat of allStats) {
          const newVal = item.stats[stat] || 0;
          const oldVal = currentItem?.stats[stat] || 0;
          if (newVal !== oldVal) {
            statDiff[stat] = newVal - oldVal;
          }
        }

        return {
          currentItem,
          scoreDiff: newScore - currentScore,
          statDiff,
          isBetter: newScore > currentScore,
        };
      },

      addGold: (amount) => {
        set(state => ({
          gold: state.gold + amount,
          stats: {
            ...state.stats,
            totalGoldEarned: state.stats.totalGoldEarned + amount,
          },
        }));
      },

      spendGold: (amount) => {
        const { gold } = get();
        if (gold < amount) return false;
        set(state => ({
          gold: state.gold - amount,
          stats: {
            ...state.stats,
            totalGoldSpent: (state.stats.totalGoldSpent || 0) + amount,
          },
        }));
        return true;
      },

      // Homestead actions
      upgradeBuilding: (buildingId) => {
        const { gold, homestead } = get();
        const building = BUILDINGS[buildingId];
        if (!building) return { success: false, error: 'Invalid building' };

        const currentLevel = homestead[buildingId] || 0;
        if (currentLevel >= building.maxLevel) {
          return { success: false, error: 'Max level reached' };
        }

        const cost = getUpgradeCost(building, currentLevel);
        if (gold < cost) {
          return { success: false, error: 'Not enough gold', cost };
        }

        // OPTIMIZATION: Clear stat cache when homestead bonuses change
        clearStatCache();

        set({
          gold: gold - cost,
          homestead: {
            ...homestead,
            [buildingId]: currentLevel + 1,
          },
        });

        return { success: true, newLevel: currentLevel + 1, cost };
      },

      getHomesteadBonuses: () => {
        const { homestead } = get();
        return calculateHomesteadBonuses(homestead);
      },

      // Dungeon actions
      startDungeon: (level, options = {}) => {
        const { heroes, dungeonUnlocked, maxDungeonLevel, initializeHeroHp, dungeonProgress } = get();
        if (heroes.length === 0 || level > dungeonUnlocked) return false;

        // Cap at max dungeon level (30)
        const cappedLevel = Math.min(level, maxDungeonLevel);

        // Initialize hero HP at full
        initializeHeroHp();

        // Set up dungeon type
        const dungeonType = options.type || 'normal';
        const affixes = options.affixes || [];

        set({
          dungeon: {
            level: cappedLevel,
            currentRoom: 0,
            totalRooms: 5 + Math.floor(cappedLevel / 2),
            completed: false,
            type: dungeonType,
          },
          dungeonProgress: {
            ...dungeonProgress,
            currentType: dungeonType,
            activeAffixes: affixes,
          },
          combat: null,
          roomCombat: { phase: 'setup', tick: 0 }, // Initialize so game loop can start
          combatLog: [],
          isRunning: true,
        });
        return true;
      },

      endDungeon: (success) => {
        const { resetHeroHp, maxDungeonLevel, processPendingRecruits } = get();

        set(state => {
          const updates = {
            dungeon: null,
            combat: null,
            roomCombat: null,
            isRunning: false,
            consumables: [], // Clear consumables on dungeon exit
            lastDungeonSuccess: success, // Track victory or defeat for transition screen
            dungeonProgress: {
              ...state.dungeonProgress,
              currentType: 'normal',
              activeAffixes: [],
            },
          };

          if (success && state.dungeon) {
            const clearedLevel = state.dungeon.level;

            updates.highestDungeonCleared = Math.max(
              state.highestDungeonCleared,
              clearedLevel
            );
            // Cap dungeonUnlocked at maxDungeonLevel
            updates.dungeonUnlocked = Math.min(
              Math.max(state.dungeonUnlocked, clearedLevel + 1),
              maxDungeonLevel
            );
            updates.stats = {
              ...state.stats,
              totalDungeonsCleared: state.stats.totalDungeonsCleared + 1,
            };

            // Milestones are NOT auto-claimed - player must claim them manually

            // Check for ascension unlock at level 30
            if (clearedLevel >= maxDungeonLevel && !state.ascension.unlocked) {
              updates.ascension = {
                ...state.ascension,
                unlocked: true,
              };
            }
          }

          return updates;
        });

        // Process any pending recruits and party changes first
        processPendingRecruits();
        get().processPendingPartyChanges();

        // Reset hero HP after all party changes are applied
        get().resetHeroHp();

        // Check if dungeon clear unlocks auto-advance (D5)
        get().checkAutoAdvanceUnlock();
      },

      // Process pending recruits (called after dungeon ends)
      processPendingRecruits: () => {
        const { pendingRecruits, heroes, bench, maxBenchSize } = get();

        if (pendingRecruits.length === 0) return;

        clearStatCache();

        let newHeroes = [...heroes];
        let newBench = [...bench];

        for (const pending of pendingRecruits) {
          if (pending.toBench) {
            // Add to bench if there's room
            if (newBench.length < maxBenchSize) {
              newBench.push(pending.hero);
            }
          } else if (pending.slotIndex !== null) {
            // Add to party slot
            while (newHeroes.length <= pending.slotIndex) {
              newHeroes.push(undefined);
            }
            if (!newHeroes[pending.slotIndex]) {
              newHeroes[pending.slotIndex] = pending.hero;
            }
          }
        }

        set({
          heroes: newHeroes,
          bench: newBench,
          pendingRecruits: [],
        });
      },

      // Queue a class change during dungeon (applied when dungeon ends)
      queueClassChange: (heroId, slotIndex, newClassId, cost) => {
        const { dungeon, pendingPartyChanges, gold } = get();

        if (!dungeon) return false; // Use normal flow if not in dungeon
        if (gold < cost) return false;

        // Check if already pending change for this slot
        if (pendingPartyChanges.some(p => p.slotIndex === slotIndex)) return false;

        set(state => ({
          gold: state.gold - cost, // Deduct cost immediately
          pendingPartyChanges: [...state.pendingPartyChanges, {
            type: 'classChange',
            heroId,
            slotIndex,
            newClassId,
          }],
        }));
        return true;
      },

      // Process pending party changes (called after dungeon ends)
      processPendingPartyChanges: () => {
        const { pendingPartyChanges, heroes, bench, homestead } = get();

        if (pendingPartyChanges.length === 0) return;

        clearStatCache();

        let newHeroes = [...heroes];
        let newBench = [...bench];
        let goldToAdd = 0;

        // Get tavern bonus for starting level
        const tavernBonus = homestead.tavern || 0;
        const startingLevel = 1 + tavernBonus;

        for (const change of pendingPartyChanges) {
          if (change.type === 'retire') {
            // Find and remove the hero
            const heroIdx = newHeroes.findIndex(h => h?.id === change.heroId);
            if (heroIdx !== -1) {
              newHeroes[heroIdx] = undefined;
            } else {
              // Check bench
              newBench = newBench.filter(h => h.id !== change.heroId);
            }
            goldToAdd += change.refundGold || 0;
          } else if (change.type === 'classChange') {
            // Remove old hero from slot and add new one
            const slotIdx = change.slotIndex;
            if (slotIdx !== null && slotIdx < newHeroes.length) {
              newHeroes[slotIdx] = undefined;
            }
            // Create new hero with the new class using createHero function
            const newHero = createHero(change.newClassId, null, startingLevel);
            while (newHeroes.length <= slotIdx) {
              newHeroes.push(undefined);
            }
            newHeroes[slotIdx] = newHero;
          }
        }

        // Clean up trailing undefined
        while (newHeroes.length > 0 && newHeroes[newHeroes.length - 1] === undefined) {
          newHeroes.pop();
        }

        set(state => ({
          heroes: newHeroes,
          bench: newBench,
          gold: state.gold + goldToAdd,
          pendingPartyChanges: [],
        }));
      },

      // Abandon current dungeon without rewards
      abandonDungeon: () => {
        const { processPendingRecruits } = get();

        set(state => ({
          dungeon: null,
          combat: null,
          roomCombat: null,
          isRunning: false,
          dungeonProgress: {
            ...state.dungeonProgress,
            currentType: 'normal',
            activeAffixes: [],
          },
        }));

        // Still process pending recruits and party changes even on abandon
        processPendingRecruits();
        get().processPendingPartyChanges();

        // Reset HP for any new heroes
        get().resetHeroHp();
      },

      // Update dungeon settings (persists between runs)
      setDungeonSettings: (settings) => {
        set(state => ({
          dungeonSettings: {
            ...state.dungeonSettings,
            ...settings,
          },
        }));
      },

      // Mark a feature as seen/unlocked
      markFeatureSeen: (feature) => {
        set(state => ({
          featureUnlocks: {
            ...state.featureUnlocks,
            [feature]: true,
          },
        }));
      },

      // Check and unlock auto-advance if player has cleared dungeon 5
      checkAutoAdvanceUnlock: () => {
        const { highestDungeonCleared, featureUnlocks } = get();
        if (featureUnlocks?.autoAdvance) return; // Already unlocked

        if (highestDungeonCleared >= 5) {
          set(state => ({
            featureUnlocks: {
              ...state.featureUnlocks,
              autoAdvance: true,
            },
          }));
        }
      },

      // Start a raid (player-triggered only)
      startRaid: (raidId, wingIndex = 0) => {
        const { heroes, highestDungeonCleared, initializeHeroHp, dungeonProgress } = get();
        if (heroes.length === 0) return false;

        // Check if raid is unlocked (requires clearing dungeon 15)
        if (highestDungeonCleared < 15) return false;

        // Check weekly lockout
        const lockoutKey = `${raidId}:${wingIndex}`;
        if (dungeonProgress.completedRaidWings.includes(lockoutKey)) {
          return false; // Already completed this wing this week
        }

        initializeHeroHp();

        set(state => ({
          dungeonProgress: {
            ...state.dungeonProgress,
            currentType: 'raid',
            currentRaidId: raidId,
            currentRaidWing: wingIndex,
          },
          isRunning: true,
          combatLog: [],
        }));

        return true;
      },

      // Complete a raid wing
      completeRaidWing: () => {
        set(state => {
          const { currentRaidId, currentRaidWing, completedRaidWings } = state.dungeonProgress;
          const lockoutKey = `${currentRaidId}:${currentRaidWing}`;

          return {
            dungeonProgress: {
              ...state.dungeonProgress,
              completedRaidWings: [...completedRaidWings, lockoutKey],
            },
          };
        });
      },

      // Reset weekly raid lockouts (call this on Monday)
      resetWeeklyLockouts: () => {
        set(state => ({
          dungeonProgress: {
            ...state.dungeonProgress,
            completedRaidWings: [],
            weeklyRaidCompletions: [],
            lastWeeklyReset: Date.now(),
          },
        }));
      },

      // Start ascension mode dungeon
      startAscensionDungeon: (level) => {
        const { ascension, heroes, initializeHeroHp } = get();
        if (!ascension.unlocked || heroes.length === 0) return false;

        initializeHeroHp();

        set({
          dungeon: {
            level,
            currentRoom: 0,
            totalRooms: 5 + Math.floor(level / 2),
            completed: false,
            type: 'ascension',
            ascensionLevel: ascension.level,
          },
          dungeonProgress: {
            currentType: 'ascension',
            activeAffixes: [],
          },
          combat: null,
          roomCombat: null,
          combatLog: [],
          isRunning: true,
        });

        return true;
      },

      advanceRoom: () => {
        set(state => {
          if (!state.dungeon) return state;
          const nextRoom = state.dungeon.currentRoom + 1;

          if (nextRoom >= state.dungeon.totalRooms) {
            return {
              dungeon: { ...state.dungeon, currentRoom: nextRoom, completed: true },
            };
          }

          return {
            dungeon: { ...state.dungeon, currentRoom: nextRoom },
            combat: null,
          };
        });
      },

      setCombat: (combat) => set({ combat }),

      // OPTIMIZATION: Batched combat log to reduce state updates (44+ calls per tick -> 1)
      addCombatLog: (message) => {
        pendingCombatLogs.push(message);

        // Initialize flush function if not set
        if (!combatLogFlushFn) {
          combatLogFlushFn = (logs) => {
            set(state => {
              const maxSize = 50;
              let newLog = [...state.combatLog, ...logs];
              if (newLog.length > maxSize) {
                newLog = newLog.slice(-maxSize);
              }
              return { combatLog: newLog };
            });
          };
        }

        // Schedule flush if not already scheduled
        // Use requestAnimationFrame to align with browser render cycle
        // instead of queueMicrotask which causes synchronous render bursts
        if (!combatLogFlushScheduled) {
          combatLogFlushScheduled = true;
          requestAnimationFrame(flushCombatLogs);
        }
      },

      clearCombatLog: () => set({ combatLog: [], combatLogIndex: 0, combatLogCount: 0 }),

      // Initialize hero HP at dungeon start
      initializeHeroHp: () => {
        const { heroes } = get();
        const heroHp = {};
        heroes.filter(Boolean).forEach(hero => {
          const stats = calculateHeroStats(hero);
          heroHp[hero.id] = stats.maxHp;
        });
        set({ heroHp });
      },

      // Get current HP for a hero (persisted across rooms)
      getHeroHp: (heroId) => {
        const { heroHp, heroes } = get();
        if (heroHp[heroId] !== undefined) return heroHp[heroId];
        // Fallback to max if not set
        const hero = heroes.filter(Boolean).find(h => h.id === heroId);
        if (hero) return calculateHeroStats(hero).maxHp;
        return 0;
      },

      // Damage a hero (persists across rooms)
      damageHero: (heroId, amount) => {
        set(state => ({
          heroHp: {
            ...state.heroHp,
            [heroId]: Math.max(0, (state.heroHp[heroId] || 0) - amount),
          },
        }));
      },

      // OPTIMIZATION: Batch sync all hero HPs at once (for end of combat tick)
      syncHeroHp: (heroHpMap) => {
        set(state => ({
          heroHp: { ...state.heroHp, ...heroHpMap },
        }));
      },

      // Heal a hero
      healHero: (heroId, amount) => {
        const { heroes } = get();
        const hero = heroes.filter(Boolean).find(h => h.id === heroId);
        if (!hero) return;
        const maxHp = calculateHeroStats(hero).maxHp;
        set(state => ({
          heroHp: {
            ...state.heroHp,
            [heroId]: Math.min(maxHp, (state.heroHp[heroId] || maxHp) + amount),
          },
        }));
      },

      // Reset hero HP to full (at dungeon end)
      resetHeroHp: () => {
        const { heroes } = get();
        const heroHp = {};
        heroes.filter(Boolean).forEach(hero => {
          heroHp[hero.id] = calculateHeroStats(hero).maxHp;
        });
        set({ heroHp });
      },

      // Set room combat state
      setRoomCombat: (roomCombat) => set({ roomCombat }),

      // Update room combat state
      updateRoomCombat: (updates) => set(state => ({
        roomCombat: state.roomCombat ? { ...state.roomCombat, ...updates } : null,
      })),

      // Clear room combat
      clearRoomCombat: () => set({ roomCombat: null }),

      setGameSpeed: (speed) => set({ gameSpeed: speed }),

      toggleRunning: () => set(state => ({ isRunning: !state.isRunning })),

      incrementStat: (stat, amount = 1, options = {}) => {
        set(state => {
          const stats = { ...state.stats };

          // Update main stat
          stats[stat] = (stats[stat] || 0) + amount;

          // Optional: per-hero tracking
          if (options.heroId && stat.startsWith('total')) {
            stats.heroStats = stats.heroStats || {};
            stats.heroStats[options.heroId] = stats.heroStats[options.heroId] || {};
            const heroKey = stat.replace('total', '');
            stats.heroStats[options.heroId][heroKey] =
              (stats.heroStats[options.heroId][heroKey] || 0) + amount;
          }

          // Optional: monster kill breakdown
          if (stat === 'totalMonstersKilled' && options.monsterId) {
            stats.monsterKills = stats.monsterKills || {};
            if (!stats.monsterKills[options.monsterId]) {
              stats.monsterKills[options.monsterId] = { count: 0, isBoss: options.isBoss || false };
            }
            stats.monsterKills[options.monsterId].count += 1;

            // Track boss kills separately
            if (options.isBoss) {
              stats.totalBossesKilled = (stats.totalBossesKilled || 0) + 1;
            }
          }

          return { stats };
        });
      },

      // Skill tree actions
      getSkillPoints: (heroId) => {
        const { heroes } = get();
        const hero = heroes.find(h => h.id === heroId);
        if (!hero) return { total: 0, used: 0, available: 0 };

        const total = calculateSkillPoints(hero.level);
        const used = calculateUsedSkillPoints(hero);
        return { total, used, available: total - used };
      },

      unlockSkill: (heroId, skillId) => {
        const { heroes } = get();
        const hero = heroes.find(h => h.id === heroId);
        if (!hero) return { success: false, error: 'Hero not found' };

        const skill = getSkillById(skillId);
        if (!skill) return { success: false, error: 'Skill not found' };

        // Check if already unlocked
        if (hero.skills?.includes(skillId)) {
          return { success: false, error: 'Skill already unlocked' };
        }

        // Check class match
        if (!skillId.startsWith(hero.classId)) {
          return { success: false, error: 'Wrong class' };
        }

        // Check prerequisites
        if (!arePrerequisitesMet(skill, hero.skills || [], hero.classId)) {
          return { success: false, error: 'Prerequisites not met' };
        }

        // Check skill points
        const { available } = get().getSkillPoints(heroId);
        if (available <= 0) {
          return { success: false, error: 'No skill points available' };
        }

        // OPTIMIZATION: Invalidate stat cache when skills change
        invalidateStatCache(heroId);
        // Also clear cache for all heroes if it's a party buff skill (skill is already defined above)
        if (skill?.passive?.type === 'party_stat_bonus') {
          clearStatCache();
        }

        // Unlock the skill
        set(state => ({
          heroes: state.heroes.map(h =>
            h.id === heroId
              ? { ...h, skills: [...(h.skills || []), skillId] }
              : h
          ),
        }));

        return { success: true };
      },

      respecHero: (heroId) => {
        const { heroes, gold } = get();
        const hero = heroes.find(h => h.id === heroId);
        if (!hero) return { success: false, error: 'Hero not found' };

        const usedPoints = calculateUsedSkillPoints(hero);
        if (usedPoints <= 0) {
          return { success: false, error: 'No skills to reset' };
        }

        const cost = calculateRespecCost(usedPoints);
        if (gold < cost) {
          return { success: false, error: 'Not enough gold', cost };
        }

        // OPTIMIZATION: Clear entire cache on respec (may affect party bonuses)
        clearStatCache();

        // Reset skills to just starter skill
        const starterSkill = getStarterSkill(hero.classId);

        set(state => ({
          gold: state.gold - cost,
          heroes: state.heroes.map(h =>
            h.id === heroId
              ? { ...h, skills: starterSkill ? [starterSkill.id] : [] }
              : h
          ),
        }));

        return { success: true, cost };
      },

      // Get hero stats with skill bonuses
      getHeroStatsWithSkills: (heroId) => {
        const { heroes } = get();
        const hero = heroes.find(h => h.id === heroId);
        if (!hero) return null;
        return calculateHeroStats(hero, heroes);
      },

      // Offline progression helpers

      // Estimate dungeon run duration in seconds by level
      // Level 1: ~3 min, Level 30: ~20 min
      _estimateDungeonDuration: (level) => {
        return (3 + (level - 1) * 0.6) * 60;
      },

      // Estimate rewards per dungeon run at given level
      _estimateDungeonRewards: (level, homesteadBonuses) => {
        const tier = Math.min(4, Math.ceil(level / 5));
        const tierRewards = {
          1: { gold: 10, xp: 8 },
          2: { gold: 25, xp: 24 },
          3: { gold: 50, xp: 52 },
          4: { gold: 80, xp: 85 },
        };

        const monsterCount = 12 + Math.floor(level / 3) * 2;
        const monsterGold = tierRewards[tier].gold * monsterCount;
        const monsterXp = tierRewards[tier].xp * monsterCount;
        const completionGold = 100 * level;

        const goldMult = 1 + (homesteadBonuses.goldFind || 0);
        const xpMult = 1 + (homesteadBonuses.xpGain || 0);

        return {
          gold: Math.floor((monsterGold + completionGold) * goldMult),
          xp: Math.floor(monsterXp * xpMult),
        };
      },

      // Offline progression - simulates dungeon runs during offline time
      calculateOfflineProgress: () => {
        const {
          lastSaveTime,
          heroes,
          highestDungeonCleared,
          homestead,
          maxDungeonLevel,
          dungeonSettings,
          _estimateDungeonDuration,
          _estimateDungeonRewards,
        } = get();

        const now = Date.now();
        const elapsedSeconds = Math.floor((now - lastSaveTime) / 1000);

        if (elapsedSeconds < 60) return null; // Minimum 1 minute away

        // No offline progress if auto-advance was disabled
        if (!dungeonSettings.autoAdvance) {
          set({ lastSaveTime: now });
          return null;
        }

        const activeHeroes = heroes.filter(Boolean);
        if (activeHeroes.length === 0) return null; // No heroes to run dungeons

        const homesteadBonuses = calculateHomesteadBonuses(homestead);

        const maxOfflineSeconds = 8 * 60 * 60; // Cap at 8 hours
        const cappedSeconds = Math.min(elapsedSeconds, maxOfflineSeconds);

        // Simulate dungeon runs with progression
        let remainingSeconds = cappedSeconds;
        // Start at next level to clear, but cap at max level for farming
        let currentLevel = Math.min(Math.max(1, highestDungeonCleared + 1), maxDungeonLevel);
        let totalGold = 0;
        let totalXp = 0;
        let runsCompleted = 0;
        let levelsProgressed = 0;
        const startingHighest = highestDungeonCleared;

        while (remainingSeconds > 0) {
          const duration = _estimateDungeonDuration(currentLevel);
          if (remainingSeconds < duration) break;

          remainingSeconds -= duration;
          const rewards = _estimateDungeonRewards(currentLevel, homesteadBonuses);
          totalGold += rewards.gold;
          totalXp += rewards.xp;
          runsCompleted++;

          // 90% chance to progress if running a level we haven't cleared before
          const isNewLevel = currentLevel > startingHighest + levelsProgressed;
          if (isNewLevel && Math.random() < 0.9) {
            levelsProgressed++;
            // Only advance to next level if not at max
            if (currentLevel < maxDungeonLevel) {
              currentLevel++;
            }
          }
        }

        // If no runs completed, give minimal rewards for time spent
        if (runsCompleted === 0) {
          totalGold = Math.floor(cappedSeconds * 0.5);
          totalXp = Math.floor(cappedSeconds * 0.25);
        }

        const newHighestCleared = startingHighest + levelsProgressed;

        // Apply state updates including dungeon progression
        set(state => ({
          gold: state.gold + totalGold,
          lastSaveTime: now,
          highestDungeonCleared: Math.max(state.highestDungeonCleared, newHighestCleared),
          dungeonUnlocked: Math.min(
            Math.max(state.dungeonUnlocked, newHighestCleared + 1),
            maxDungeonLevel
          ),
          stats: {
            ...state.stats,
            totalGoldEarned: state.stats.totalGoldEarned + totalGold,
            totalDungeonsCleared: state.stats.totalDungeonsCleared + runsCompleted,
          },
        }));

        // Distribute XP among heroes
        const xpPerHero = Math.floor(totalXp / Math.max(1, activeHeroes.length));
        activeHeroes.forEach(hero => {
          get().addXpToHero(hero.id, xpPerHero);
        });

        return {
          elapsedSeconds: cappedSeconds,
          goldEarned: totalGold,
          xpEarned: totalXp,
          runsCompleted,
          levelsProgressed,
          newHighestLevel: newHighestCleared,
          startingLevel: startingHighest,
        };
      },

      updateLastSaveTime: () => set({ lastSaveTime: Date.now() }),

      // Reset game
      resetGame: () => {
        // OPTIMIZATION: Clear all caches on reset to prevent memory leaks
        clearStatCache();
        // Reset combat log flush function to prevent stale closure references
        combatLogFlushFn = null;
        pendingCombatLogs = [];

        set({
          gold: 100,
          heroes: [],
          bench: [],
          usedSlotDiscounts: [],
          pendingRecruits: [],
          pendingPartyChanges: [],
          tavern: { heroes: [], lastRefresh: 0, refreshCost: 25 },
          inventory: [],
          consumables: [],
          dungeon: null,
          combat: null,
          combatLog: [],
          combatLogIndex: 0,
          combatLogCount: 0,
          isRunning: false,
          gameSpeed: 1,
          highestDungeonCleared: 0,
          dungeonUnlocked: 1,
          lastDungeonSuccess: null,
          lastSaveTime: Date.now(),
          stats: {
            totalGoldEarned: 0,
            totalGoldSpent: 0,
            totalItemsLooted: 0,
            totalMonstersKilled: 0,
            totalBossesKilled: 0,
            totalDungeonsCleared: 0,
            totalDeaths: 0,
            totalDamageDealt: 0,
            totalDamageTaken: 0,
            totalHealingDone: 0,
            totalHealingReceived: 0,
            totalCriticalHits: 0,
            totalDodges: 0,
            totalMitigated: 0,
            monsterKills: {},
            heroStats: {},
          },
          equipmentSettings: {
            autoSellJunk: true,
            autoEquipUpgrades: true,
            classPriority: { ...DEFAULT_CLASS_PRIORITY },
          },
          lootNotifications: [],
          homestead: {
            barracks: 0,
            armory: 0,
            fortress: 0,
            trainingGrounds: 0,
            treasury: 0,
            academy: 0,
            infirmary: 0,
          },
          shop: {
            items: [],
            lastRefresh: 0,
            refreshCost: 50,
          },
          heroHp: {},
          roomCombat: null,
          dungeonSettings: {
            type: 'normal',
            autoAdvance: false,
            targetLevel: null,
          },
          featureUnlocks: {
            autoAdvance: false,
            homesteadSeen: false,
          },
          dungeonProgress: {
            currentType: 'normal',
            currentRaidId: null,
            currentRaidWing: 0,
            completedRaidWings: [],
            weeklyRaidCompletions: [],
            lastWeeklyReset: Date.now(),
            activeAffixes: [],
          },
          ascension: {
            unlocked: false,
            level: 0,
          },
        });
      },
    }),
    {
      name: 'castles-and-clickers-save',
      version: 1,
      // OPTIMIZATION: Throttle writes to every 2 seconds instead of every state change
      storage: createJSONStorage(() => throttledStorage),
      // OPTIMIZATION: Exclude transient combat state from persistence
      // roomCombat changes every 250ms - persisting it causes major lag
      partialize: (state) => ({
        ...state,
        // Exclude rapidly-changing transient state
        roomCombat: null,
        combatLog: [],
        combatLogIndex: 0,
        combatLogCount: 0,
        lootNotifications: [],
        // These are recomputed on dungeon start
        heroHp: state.dungeon ? state.heroHp : {},
      }),
      // Ensure stats has all new fields even if old save doesn't
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
        stats: {
          totalGoldEarned: 0,
          totalGoldSpent: 0,
          totalItemsLooted: 0,
          totalMonstersKilled: 0,
          totalBossesKilled: 0,
          totalDungeonsCleared: 0,
          totalDeaths: 0,
          totalDamageDealt: 0,
          totalDamageTaken: 0,
          totalHealingDone: 0,
          totalHealingReceived: 0,
          totalCriticalHits: 0,
          totalDodges: 0,
          totalMitigated: 0,
          monsterKills: {},
          heroStats: {},
          ...persistedState?.stats,
        },
      }),
    }
  )
);

// Export helpers
export { calculateHeroStats, xpForLevel, calculateItemScore, calculateSellValue, STAT_PRIORITIES, RARITY_ORDER, calculateSkillPoints, calculateUsedSkillPoints, invalidateStatCache, clearStatCache };
