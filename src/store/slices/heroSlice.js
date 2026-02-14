import { CLASSES, PARTY_SLOTS } from '../../data/classes';
import { getSkillById, getStarterSkill, arePrerequisitesMet, calculateRespecCost } from '../../data/skillTrees';
import { createHero, generateTavernHero } from '../helpers/heroGenerator';
import { calculateHeroStats, invalidateStatCache, clearStatCache, calculateSkillPoints, calculateUsedSkillPoints } from '../helpers/statCalculator';
import throttledStorage from '../helpers/throttledStorage';
import { xpForLevel } from '../helpers/statCalculator';

export const createHeroSlice = (set, get) => ({
  // State
  heroes: [],
  bench: [],
  maxBenchSize: 6,
  maxPartySize: 4,
  usedSlotDiscounts: [],
  pendingRecruits: [],
  pendingPartyChanges: [],
  tavern: {
    heroes: [],
    lastRefresh: 0,
    refreshCost: 25,
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

  refreshTavern: (manual = false) => {
    const { tavern, gold, highestDungeonCleared, usedSlotDiscounts } = get();

    // Check if manual refresh and can afford
    if (manual && gold < tavern.refreshCost) return false;

    // Only show roles where the player has already recruited their first FREE hero
    const availableRoles = [];
    for (let i = 0; i < PARTY_SLOTS.length; i++) {
      const slot = PARTY_SLOTS[i];
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

  checkTavernRefresh: () => {
    const { tavern } = get();
    const timeSinceRefresh = Date.now() - tavern.lastRefresh;
    const refreshInterval = 5 * 60 * 1000; // 5 minutes

    if (tavern.heroes.length === 0 || timeSinceRefresh > refreshInterval) {
      get().refreshTavern(false);
    }
  },

  addXpToHero: (heroId, xp) => {
    const oldLevel = get().heroes.find(h => h.id === heroId)?.level;
    set(state => {
      const heroes = state.heroes.map(hero => {
        if (hero.id !== heroId) return hero;

        let newXp = hero.xp + xp;
        let newLevel = hero.level;
        const oldLvl = hero.level;

        // Level up loop
        while (newXp >= xpForLevel(newLevel)) {
          newXp -= xpForLevel(newLevel);
          newLevel++;
        }

        // OPTIMIZATION: Invalidate stat cache on level up
        if (newLevel !== oldLvl) {
          invalidateStatCache(heroId);
        }

        return { ...hero, xp: newXp, level: newLevel };
      });
      return { heroes };
    });
    // Immediate save on level-up to prevent progress loss
    const newLevel = get().heroes.find(h => h.id === heroId)?.level;
    if (newLevel !== oldLevel) {
      throttledStorage.flush();
    }
  },

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
    // Also clear cache for all heroes if it's a party buff skill
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

    // Immediate save on skill unlock
    throttledStorage.flush();

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

  getHeroStatsWithSkills: (heroId) => {
    const { heroes } = get();
    const hero = heroes.find(h => h.id === heroId);
    if (!hero) return null;
    return calculateHeroStats(hero, heroes);
  },
});
