import { BUILDINGS, getUpgradeCost, calculateHomesteadBonuses } from '../../data/homestead';
import { generateEquipment, getEquipmentByTier } from '../../data/equipment';
import { calculateSellValue } from '../helpers/itemScoring';
import { clearStatCache } from '../helpers/statCalculator';
import throttledStorage from '../helpers/throttledStorage';

export const createEconomySlice = (set, get) => ({
  // State
  gold: 100,
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
  shop: {
    items: [],
    lastRefresh: 0,
    refreshCost: 50,
  },
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
    raidRuns: {},
  },
  isRunning: false,
  gameSpeed: 1,
  lastSaveTime: Date.now(),

  // Actions
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

    // Immediate save on homestead upgrade
    throttledStorage.flush();

    return { success: true, newLevel: currentLevel + 1, cost };
  },

  getHomesteadBonuses: () => {
    const { homestead } = get();
    return calculateHomesteadBonuses(homestead);
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

  incrementStat: (stat, amount = 1, options = {}) => {
    set(state => {
      const stats = { ...state.stats };

      // Update main stat
      stats[stat] = (stats[stat] || 0) + amount;

      // Optional: per-hero tracking (skip summons - pets, clones, undead)
      const heroId = options.heroId;
      const isSummon = heroId && (heroId.startsWith('pet_') || heroId.startsWith('clone_') || heroId.startsWith('undead_'));
      if (heroId && stat.startsWith('total') && !isSummon) {
        stats.heroStats = stats.heroStats || {};
        stats.heroStats[heroId] = stats.heroStats[heroId] || {};
        const heroKey = stat.replace('total', '');
        stats.heroStats[heroId][heroKey] =
          (stats.heroStats[heroId][heroKey] || 0) + amount;
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

  setGameSpeed: (speed) => set({ gameSpeed: speed }),

  toggleRunning: () => set(state => ({ isRunning: !state.isRunning })),

  // Offline progression helpers
  _estimateDungeonDuration: (level) => {
    return (3 + (level - 1) * 0.6) * 60;
  },

  _estimateDungeonRewards: (level, homesteadBonuses) => {
    const tier = Math.min(6, Math.ceil(level / 5));
    const tierRewards = {
      1: { gold: 10, xp: 8 },
      2: { gold: 25, xp: 24 },
      3: { gold: 50, xp: 52 },
      4: { gold: 80, xp: 85 },
      5: { gold: 120, xp: 130 },
      6: { gold: 180, xp: 200 },
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
});
