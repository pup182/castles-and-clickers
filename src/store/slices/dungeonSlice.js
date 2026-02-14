import { RAIDS, isRaidUnlocked } from '../../data/raids';
import throttledStorage from '../helpers/throttledStorage';

export const createDungeonSlice = (set, get) => ({
  // State
  dungeon: null,
  highestDungeonCleared: 0,
  dungeonUnlocked: 1,
  lastDungeonSuccess: null,
  dungeonProgress: {
    currentType: 'normal',
    currentRaidId: null,
    currentRaidWing: 0,
    completedRaidWings: [],
    weeklyRaidCompletions: [],
    lastWeeklyReset: Date.now(),
    activeAffixes: [],
  },
  dungeonSettings: {
    type: 'normal',
    autoAdvance: false,
    targetLevel: null,
  },
  featureUnlocks: {
    autoAdvance: false,
    homesteadSeen: false,
    lastSeenRaidsAt: 0,
  },
  ascension: {
    level: 0,
    unlocked: false,
    highestLevel: 0,
  },
  maxDungeonLevel: 30,
  raidState: {
    active: false,
    raidId: null,
    defeatedWingBosses: [],
    heroHpSnapshot: {},
  },
  pendingRaidRecap: null,

  // Actions
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
    const { maxDungeonLevel, processPendingRecruits } = get();

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

    // Immediate save on dungeon completion
    throttledStorage.flush();
  },

  abandonDungeon: () => {
    const { processPendingRecruits, raidState } = get();

    // Clear raid state if abandoning a raid
    const raidCleanup = raidState.active ? {
      raidState: {
        active: false,
        raidId: null,
        defeatedWingBosses: [],
        heroHpSnapshot: {},
      },
    } : {};

    set(state => ({
      dungeon: null,
      combat: null,
      roomCombat: null,
      isRunning: false,
      dungeonProgress: {
        ...state.dungeonProgress,
        currentType: 'normal',
        currentRaidId: null,
        activeAffixes: [],
      },
      ...raidCleanup,
    }));

    // Still process pending recruits and party changes even on abandon
    processPendingRecruits();
    get().processPendingPartyChanges();

    // Reset HP for any new heroes
    get().resetHeroHp();
  },

  setDungeonSettings: (settings) => {
    set(state => ({
      dungeonSettings: {
        ...state.dungeonSettings,
        ...settings,
      },
    }));
  },

  markFeatureSeen: (feature) => {
    const { highestDungeonCleared } = get();
    set(state => ({
      featureUnlocks: {
        ...state.featureUnlocks,
        // For raids, store the dungeon level to track when new raids unlock
        [feature]: feature === 'lastSeenRaidsAt' ? highestDungeonCleared : true,
      },
    }));
  },

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

  // ========================================
  // MULTI-BOSS RAID DUNGEON ACTIONS
  // ========================================

  enterRaid: (raidId) => {
    const { heroes, highestDungeonCleared, heroHp, initializeHeroHp } = get();
    if (heroes.filter(Boolean).length === 0) return false;

    const raid = RAIDS[raidId];
    if (!raid) return false;

    // Check if raid is unlocked
    if (!isRaidUnlocked(raidId, highestDungeonCleared)) return false;

    // Snapshot hero HP at raid start
    const hpSnapshot = {};
    heroes.filter(Boolean).forEach(hero => {
      const maxHp = hero.stats?.maxHp || 100;
      hpSnapshot[hero.id] = heroHp[hero.id] ?? maxHp;
    });

    initializeHeroHp();

    set(state => ({
      raidState: {
        active: true,
        raidId,
        defeatedWingBosses: [],
        heroHpSnapshot: hpSnapshot,
      },
      dungeonProgress: {
        ...state.dungeonProgress,
        currentType: 'raid',
        currentRaidId: raidId,
      },
      dungeon: {
        level: raid.requiredLevel,
        isRaid: true,
        raidId,
      },
      roomCombat: null,
      combatLog: [],
      isRunning: true,
    }));

    return true;
  },

  defeatWingBoss: (bossId) => {
    if (!bossId) return; // Defensive check for null/undefined bossId

    const { raidState } = get();
    if (!raidState.active) return;

    if (raidState.defeatedWingBosses.includes(bossId)) return;

    set(state => ({
      raidState: {
        ...state.raidState,
        defeatedWingBosses: [...state.raidState.defeatedWingBosses, bossId],
      },
    }));
  },

  isFinalBossUnlocked: () => {
    const { raidState } = get();
    if (!raidState.active) return false;

    const raid = RAIDS[raidState.raidId];
    if (!raid) return false;

    return raid.wingBosses.every(
      wb => raidState.defeatedWingBosses.includes(wb.id)
    );
  },

  completeRaid: () => {
    const { raidState, combatLog } = get();
    if (!raidState.active) return;

    const raid = RAIDS[raidState.raidId];
    if (!raid) return;

    // Record completion
    const completionKey = `${raidState.raidId}:complete`;

    // Collect loot info from combat log
    const lootDrops = combatLog
      .filter(log => log.type === 'system' && (log.message?.includes('UNIQUE DROP') || log.message?.includes('Loot:')))
      .map(log => log.message);

    set(state => ({
      // Store recap info before clearing
      pendingRaidRecap: {
        raidId: raidState.raidId,
        raidName: raid.name,
        defeatedBosses: [...raidState.defeatedWingBosses],
        totalBosses: raid.wingBosses.length + 1,
        lootDrops,
        completedAt: Date.now(),
      },
      raidState: {
        active: false,
        raidId: null,
        defeatedWingBosses: [],
        heroHpSnapshot: {},
      },
      dungeonProgress: {
        ...state.dungeonProgress,
        currentType: 'normal',
        currentRaidId: null,
        completedRaidWings: [...state.dungeonProgress.completedRaidWings, completionKey],
      },
      stats: {
        ...state.stats,
        raidRuns: {
          ...state.stats.raidRuns,
          [raidState.raidId]: (state.stats.raidRuns?.[raidState.raidId] || 0) + 1,
        },
      },
      dungeon: null,
      roomCombat: null,
      isRunning: false,
    }));

    // Immediate save on raid completion
    throttledStorage.flush();
  },

  clearRaidRecap: () => {
    set({ pendingRaidRecap: null });
    get().showPendingMilestone();
  },

  abandonRaid: () => {
    set(state => ({
      raidState: {
        active: false,
        raidId: null,
        defeatedWingBosses: [],
        heroHpSnapshot: {},
      },
      dungeonProgress: {
        ...state.dungeonProgress,
        currentType: 'normal',
        currentRaidId: null,
      },
      dungeon: null,
      roomCombat: null,
      isRunning: false,
    }));
  },

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
});
