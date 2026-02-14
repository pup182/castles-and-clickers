import { calculateHeroStats } from '../helpers/statCalculator';

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

// Reset combat log module state (called from resetGame)
export const resetCombatLogState = () => {
  combatLogFlushFn = null;
  pendingCombatLogs = [];
};

export const createCombatSlice = (set, get) => ({
  // State
  combat: null,
  combatLog: [],
  combatLogIndex: 0,
  combatLogCount: 0,
  heroHp: {},
  roomCombat: null,
  combatPauseUntil: 0,

  // Actions
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
      const stats = calculateHeroStats(hero, heroes);
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
    if (hero) return calculateHeroStats(hero, heroes).maxHp;
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
    set(state => {
      // Clean existing heroHp of any summon IDs that leaked in
      const cleanedHeroHp = {};
      for (const id in state.heroHp) {
        if (!id.startsWith('pet_') && !id.startsWith('clone_') && !id.startsWith('undead_')) {
          cleanedHeroHp[id] = state.heroHp[id];
        }
      }
      return { heroHp: { ...cleanedHeroHp, ...heroHpMap } };
    });
  },

  // Heal a hero
  healHero: (heroId, amount) => {
    const { heroes } = get();
    const hero = heroes.filter(Boolean).find(h => h.id === heroId);
    if (!hero) return;
    const maxHp = calculateHeroStats(hero, heroes).maxHp;
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
      heroHp[hero.id] = calculateHeroStats(hero, heroes).maxHp;
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

  // Pause combat for a duration (for dramatic moments like phase transitions)
  pauseCombat: (durationMs) => {
    set({ combatPauseUntil: Date.now() + durationMs });
  },

  // Check if combat is currently paused
  isCombatPaused: () => {
    return Date.now() < get().combatPauseUntil;
  },
});
