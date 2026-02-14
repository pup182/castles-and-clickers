import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Helpers
import { validationMiddleware } from './helpers/validation';
import throttledStorage from './helpers/throttledStorage';
import { DEFAULT_CLASS_PRIORITY } from './helpers/itemScoring';
import { clearStatCache } from './helpers/statCalculator';
import { getMaxPartySize } from '../data/milestones';
import { resetCombatLogState } from './slices/combatSlice';

// Slices
import { createHeroSlice } from './slices/heroSlice';
import { createInventorySlice } from './slices/inventorySlice';
import { createCombatSlice } from './slices/combatSlice';
import { createDungeonSlice } from './slices/dungeonSlice';
import { createEconomySlice } from './slices/economySlice';

export const useGameStore = create(
  validationMiddleware(
    persist(
      (set, get) => ({
        // Compose all slices
        ...createHeroSlice(set, get),
        ...createInventorySlice(set, get),
        ...createCombatSlice(set, get),
        ...createDungeonSlice(set, get),
        ...createEconomySlice(set, get),

        // Override equipmentSettings to include DEFAULT_CLASS_PRIORITY
        // (inventorySlice initializes with empty classPriority, we fill it here)
        equipmentSettings: {
          autoSellJunk: true,
          autoEquipUpgrades: true,
          classPriority: { ...DEFAULT_CLASS_PRIORITY },
        },

        // Reset game (touches all slices' state)
        resetGame: () => {
          // OPTIMIZATION: Clear all caches on reset to prevent memory leaks
          clearStatCache();
          // Reset combat log flush function to prevent stale closure references
          resetCombatLogState();

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
            ownedUniques: [],
            unreadUniques: [],
            pendingUniqueCelebration: null,
            pendingCollectionMilestone: null,
            combatPauseUntil: 0,
            shopConsumables: [],
            pendingDungeonBuffs: [],
            shop: {
              items: [],
              lastRefresh: 0,
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
              lastSeenRaidsAt: 0,
              lastSeenVersion: null,
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
            raidState: {
              active: false,
              raidId: null,
              defeatedWingBosses: [],
              heroHpSnapshot: {},
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
        merge: (persistedState, currentState) => {
          // Derive maxPartySize from progress so existing saves get correct value
          const derivedMaxPartySize = getMaxPartySize(persistedState?.highestDungeonCleared || 0);
          // Sanitize heroes array - ensure it doesn't exceed maxPartySize
          const maxPartySize = Math.max(derivedMaxPartySize, persistedState?.maxPartySize || currentState.maxPartySize || 4);
          let heroes = persistedState?.heroes || [];

          // If heroes array is too long, truncate it
          if (heroes.length > maxPartySize) {
            console.warn(`[GameState] Heroes array (${heroes.length}) exceeded maxPartySize (${maxPartySize}), truncating`);
            heroes = heroes.slice(0, maxPartySize);
          }

          // If there are more actual heroes than slots, keep only the first maxPartySize
          const actualHeroes = heroes.filter(Boolean);
          if (actualHeroes.length > maxPartySize) {
            console.warn(`[GameState] Too many heroes (${actualHeroes.length}), keeping first ${maxPartySize}`);
            let kept = 0;
            heroes = heroes.map(h => {
              if (h && kept < maxPartySize) {
                kept++;
                return h;
              }
              return h ? null : h; // Convert excess heroes to null, keep existing nulls
            }).slice(0, maxPartySize);
          }

          return {
            ...currentState,
            ...persistedState,
            heroes, // Use sanitized heroes
            maxPartySize, // Use derived value from dungeon progress
            shopConsumables: persistedState?.shopConsumables || [],
            pendingDungeonBuffs: persistedState?.pendingDungeonBuffs || [],
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
          };
        },
      }
    ))
);

// Re-export helpers (preserves identical import API for all consumers)
export { calculateHeroStats, xpForLevel, calculateSkillPoints, calculateUsedSkillPoints, invalidateStatCache, clearStatCache } from './helpers/statCalculator';
export { calculateItemScore, calculateSellValue, STAT_PRIORITIES, RARITY_ORDER } from './helpers/itemScoring';
