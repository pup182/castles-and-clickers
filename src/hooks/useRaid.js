import { useMemo, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { RAIDS, isRaidUnlocked } from '../data/raids';

/**
 * Hook for managing raid state and interactions
 * Raids are large continuous dungeons with multiple bosses
 */
export const useRaid = () => {
  // State selectors
  const raidState = useGameStore(state => state.raidState);
  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);
  const dungeon = useGameStore(state => state.dungeon);

  // Actions
  const enterRaid = useGameStore(state => state.enterRaid);
  const defeatWingBoss = useGameStore(state => state.defeatWingBoss);
  const abandonRaid = useGameStore(state => state.abandonRaid);
  const completeRaid = useGameStore(state => state.completeRaid);

  // Current raid data
  const raid = useMemo(() => {
    if (!raidState.raidId) return null;
    return RAIDS[raidState.raidId] || null;
  }, [raidState.raidId]);

  // Available raids (unlocked based on dungeon progress)
  const availableRaids = useMemo(() => {
    return Object.values(RAIDS).filter(r =>
      isRaidUnlocked(r.id, highestDungeonCleared)
    );
  }, [highestDungeonCleared]);

  // All raids with their locked status
  const allRaids = useMemo(() => {
    return Object.values(RAIDS).map(r => ({
      ...r,
      isUnlocked: isRaidUnlocked(r.id, highestDungeonCleared),
    }));
  }, [highestDungeonCleared]);

  // Progress calculations
  const progress = useMemo(() => {
    if (!raid) {
      return {
        defeatedCount: 0,
        totalWings: 0,
        progress: 0,
        allWingsDefeated: false,
        finalBossUnlocked: false,
      };
    }

    const totalWings = raid.wingBosses.length;
    const defeatedCount = raidState.defeatedWingBosses.length;
    const allWingsDefeated = defeatedCount >= totalWings;

    return {
      defeatedCount,
      totalWings,
      progress: totalWings > 0 ? (defeatedCount / totalWings) * 100 : 0,
      allWingsDefeated,
      finalBossUnlocked: allWingsDefeated,
    };
  }, [raid, raidState.defeatedWingBosses]);

  // Dungeon progress within the raid
  const dungeonProgress = useMemo(() => {
    return {
      currentRoom: dungeon?.currentRoom ?? 0,
      totalRooms: dungeon?.totalRooms || 0,
      isLastRoom: dungeon ? dungeon.currentRoom >= dungeon.totalRooms - 1 : false,
    };
  }, [dungeon]);

  // Get remaining wing bosses (not yet defeated)
  const remainingWingBosses = useMemo(() => {
    if (!raid) return [];
    return raid.wingBosses.filter(
      wb => !raidState.defeatedWingBosses.includes(wb.id)
    );
  }, [raid, raidState.defeatedWingBosses]);

  // Get defeated wing bosses
  const defeatedWingBosses = useMemo(() => {
    if (!raid) return [];
    return raid.wingBosses.filter(
      wb => raidState.defeatedWingBosses.includes(wb.id)
    );
  }, [raid, raidState.defeatedWingBosses]);

  // Check if a specific wing boss is defeated
  const isWingBossDefeated = useCallback((bossId) => {
    return raidState.defeatedWingBosses.includes(bossId);
  }, [raidState.defeatedWingBosses]);

  return {
    // State
    raidState,
    raid,
    isRaidActive: raidState.active,

    // Raid lists
    availableRaids,
    allRaids,

    // Progress
    progress,
    dungeonProgress,
    remainingWingBosses,
    defeatedWingBosses,

    // Helpers
    isWingBossDefeated,

    // Actions
    enterRaid,
    defeatWingBoss,
    abandonRaid,
    completeRaid,
  };
};

export default useRaid;
