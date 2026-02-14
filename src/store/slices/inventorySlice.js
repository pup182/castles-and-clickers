import { canClassUseEquipment } from '../../data/equipment';
import { calculateItemScore, calculateSellValue } from '../helpers/itemScoring';
import { invalidateStatCache } from '../helpers/statCalculator';
import { getCollectionForUnique } from '../helpers/heroGenerator';
import throttledStorage from '../helpers/throttledStorage';

export const createInventorySlice = (set, get) => ({
  // State
  inventory: [],
  maxInventory: 50,
  consumables: [],
  equipmentSettings: {
    autoSellJunk: true,
    autoEquipUpgrades: true,
    classPriority: {},  // Will be populated with DEFAULT_CLASS_PRIORITY from gameStore.js
  },
  ownedUniques: [],
  unreadUniques: [],
  pendingUniqueCelebration: null,
  pendingCollectionMilestone: null,
  lootNotifications: [],

  // Actions
  equipItem: (heroId, item) => {
    set(state => {
      const hero = state.heroes.find(h => h.id === heroId);
      if (!hero) return state;

      // Check class restriction
      if (!canClassUseEquipment(hero.classId, item)) return state;

      const oldItem = hero.equipment[item.slot];
      let newInventory = state.inventory.filter(i => i.id !== item.id);

      // Handle old item - never sell uniques
      let goldGain = 0;
      if (oldItem) {
        if (oldItem.isUnique) {
          // Unique items go to inventory instead of being sold
          if (newInventory.length >= state.maxInventory) {
            // Can't swap - inventory full and unique can't be sold
            return state;
          }
          newInventory = [...newInventory, oldItem];
        } else {
          // Auto-sell non-unique old items
          goldGain = calculateSellValue(oldItem);
        }
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
    const { inventory } = get();
    const item = inventory.find(i => i.id === itemId);
    // Prevent deletion of unique items
    if (item?.isUnique) return;

    set(state => ({
      inventory: state.inventory.filter(i => i.id !== itemId),
    }));
  },

  sellItem: (itemId) => {
    const { inventory } = get();
    const item = inventory.find(i => i.id === itemId);
    if (!item) return 0;

    // Prevent selling unique items
    if (item.isUnique) return 0;

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

  sellAllJunk: () => {
    const { inventory, isUpgradeForAnyHero } = get();
    let totalGold = 0;
    const itemsToKeep = [];
    const itemsToSell = [];

    for (const item of inventory) {
      // Never sell unique items
      if (item.isUnique) {
        itemsToKeep.push(item);
        continue;
      }

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
    // Never auto-replace unique items - they're too valuable
    if (equipmentSettings.autoEquipUpgrades && upgradeCheck.isUpgrade && upgradeCheck.hero && !upgradeCheck.hero.equipment[item.slot]?.isUnique) {
      const hero = upgradeCheck.hero;
      const oldItem = hero.equipment[item.slot];
      let goldGain = 0;

      // Handle old item - never sell uniques, sell if autoSellJunk, otherwise add to inventory
      if (oldItem) {
        // Never auto-sell unique items - always keep them
        if (oldItem.isUnique) {
          if (inventory.length < maxInventory) {
            set(state => ({
              inventory: [...state.inventory, oldItem],
            }));
          }
          // If inventory full, unique stays in inventory (don't lose it)
        } else if (equipmentSettings.autoSellJunk) {
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

    // If auto-sell junk is on and item is not an upgrade, sell it (but never sell uniques)
    if (equipmentSettings.autoSellJunk && !upgradeCheck.isUpgrade && !item.isUnique) {
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

  // Process a unique item drop - handles duplicates, tracking, etc.
  processUniqueDrop: (uniqueItem) => {
    const { ownedUniques, inventory, maxInventory } = get();

    // Check if we already own this unique
    const templateId = uniqueItem.templateId || uniqueItem.id;
    if (ownedUniques.includes(templateId)) {
      // Duplicate - convert to gold
      const goldValue = 500 + Math.floor(
        Object.values(uniqueItem.stats || {}).reduce((a, b) => a + Math.abs(b), 0) * 25
      );

      set(state => ({
        gold: state.gold + goldValue,
        stats: {
          ...state.stats,
          totalGoldEarned: state.stats.totalGoldEarned + goldValue,
        },
      }));

      get().addLootNotification({
        type: 'unique-duplicate',
        item: uniqueItem,
        gold: goldValue,
      });

      return { action: 'duplicate', gold: goldValue };
    }

    // New unique - add to collection and inventory
    if (inventory.length < maxInventory) {
      set(state => ({
        ownedUniques: [...state.ownedUniques, templateId],
        unreadUniques: [...state.unreadUniques, uniqueItem.id],
        inventory: [...state.inventory, uniqueItem],
        stats: {
          ...state.stats,
          totalItemsLooted: (state.stats.totalItemsLooted || 0) + 1,
        },
      }));

      // Immediate save on unique item drop
      throttledStorage.flush();

      get().addLootNotification({
        type: 'unique-drop',
        item: uniqueItem,
      });

      // Trigger celebration modal for new unique
      get().triggerUniqueCelebration(uniqueItem);
      get().checkCollectionMilestone(templateId);

      return { action: 'unique-looted', item: uniqueItem };
    } else {
      // Inventory full but still track ownership
      set(state => ({
        ownedUniques: [...state.ownedUniques, templateId],
        unreadUniques: [...state.unreadUniques, uniqueItem.id],
        inventory: [...state.inventory.slice(1), uniqueItem], // Remove oldest item
        stats: {
          ...state.stats,
          totalItemsLooted: (state.stats.totalItemsLooted || 0) + 1,
        },
      }));

      // Immediate save on unique item drop
      throttledStorage.flush();

      get().addLootNotification({
        type: 'unique-drop',
        item: uniqueItem,
      });

      // Trigger celebration modal for new unique
      get().triggerUniqueCelebration(uniqueItem);
      get().checkCollectionMilestone(templateId);

      return { action: 'unique-looted', item: uniqueItem };
    }
  },

  markUniqueRead: (itemId) => {
    set(state => ({
      unreadUniques: state.unreadUniques.filter(id => id !== itemId),
    }));
  },

  markAllUniquesRead: () => {
    set({ unreadUniques: [] });
  },

  triggerUniqueCelebration: (item) => {
    set({ pendingUniqueCelebration: item });
  },

  clearUniqueCelebration: () => {
    const { pendingRaidRecap } = get();
    set({ pendingUniqueCelebration: null });
    // Show milestone if no raid recap waiting
    if (!pendingRaidRecap) {
      get().showPendingMilestone();
    }
  },

  checkCollectionMilestone: (templateId) => {
    const { ownedUniques } = get();
    const collection = getCollectionForUnique(templateId);
    if (!collection) return;

    const ownedCount = collection.uniques.filter(id => ownedUniques.includes(id)).length;
    const isComplete = ownedCount === collection.uniques.length;

    set({
      pendingCollectionMilestone: {
        collectionName: collection.name,
        owned: ownedCount,
        total: collection.uniques.length,
        isComplete,
      },
    });
  },

  showPendingMilestone: () => {
    const { pendingCollectionMilestone } = get();
    if (!pendingCollectionMilestone) return;

    get().addLootNotification({
      type: 'collection-milestone',
      ...pendingCollectionMilestone,
    });
    set({ pendingCollectionMilestone: null });
  },

  ownsUnique: (templateId) => {
    const { ownedUniques } = get();
    return ownedUniques.includes(templateId);
  },

  getItemScoreForHero: (item, heroId) => {
    const { heroes, equipmentSettings } = get();
    const hero = heroes.find(h => h.id === heroId);
    if (!hero) return 0;
    const priority = equipmentSettings.classPriority[hero.classId] || 'balanced';
    return calculateItemScore(item, priority);
  },

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

  removeLootNotification: (id) => {
    set(state => ({
      lootNotifications: state.lootNotifications.filter(n => n.id !== id),
    }));
  },

  clearOldNotifications: () => {
    const now = Date.now();
    set(state => ({
      lootNotifications: state.lootNotifications.filter(
        n => now - n.timestamp < 5000
      ),
    }));
  },
});
