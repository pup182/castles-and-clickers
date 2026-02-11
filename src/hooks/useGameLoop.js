import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { findExplorationTarget } from '../game/mazeGenerator';
import { PHASES } from '../game/constants';

/**
 * Hook for game loop orchestration
 */
export const useGameLoop = ({
  setupDungeon,
  handleExplorationTick,
  handleCombatTick,
  clearEffects,
  resetLastProcessedTurn,
}) => {
  // OPTIMIZATION: Only subscribe to boolean/primitive values to avoid re-renders
  const dungeon = useGameStore(state => state.dungeon);
  const isRunning = useGameStore(state => state.isRunning);
  const gameSpeed = useGameStore(state => state.gameSpeed);
  // Only subscribe to WHETHER roomCombat exists, not the object itself
  const hasRoomCombat = useGameStore(state => !!state.roomCombat);

  // OPTIMIZATION: Get actions imperatively to avoid re-renders
  const addGold = useCallback((amount) => useGameStore.getState().addGold(amount), []);
  const incrementStat = useCallback((stat) => useGameStore.getState().incrementStat(stat), []);
  const addCombatLog = useCallback((log) => useGameStore.getState().addCombatLog(log), []);
  const clearCombatLog = useCallback(() => useGameStore.getState().clearCombatLog(), []);
  const endDungeon = useCallback((success) => useGameStore.getState().endDungeon(success), []);
  const startDungeon = useCallback((level, opts) => useGameStore.getState().startDungeon(level, opts), []);
  const setRoomCombat = useCallback((state) => useGameStore.getState().setRoomCombat(state), []);
  const updateRoomCombat = useCallback((updates) => useGameStore.getState().updateRoomCombat(updates), []);
  const clearRoomCombat = useCallback(() => useGameStore.getState().clearRoomCombat(), []);
  const updateLastSaveTime = useCallback(() => useGameStore.getState().updateLastSaveTime(), []);

  // OPTIMIZATION: Track auto-start timeout to prevent pile-up
  const autoStartTimeoutRef = useRef(null);

  // Main game tick
  const gameTick = useCallback(() => {
    // OPTIMIZATION: Get state imperatively at start of tick
    const state = useGameStore.getState();
    const { roomCombat, dungeon, dungeonSettings, maxDungeonLevel, permanentBonuses } = state;
    const homesteadBonuses = state.getHomesteadBonuses();

    if (!roomCombat || !dungeon) return;

    const { phase, monsters, tick, dungeon: mazeDungeon } = roomCombat;

    // Phase: SETUP - initialize maze dungeon
    if (phase === PHASES.SETUP) {
      clearCombatLog();
      setupDungeon();
      return;
    }

    // Phase: EXPLORING
    if (phase === PHASES.EXPLORING) {
      handleExplorationTick();
      return;
    }

    // Phase: COMBAT
    if (phase === PHASES.COMBAT) {
      handleCombatTick();
      return;
    }

    // Phase: CLEARING - wait then resume exploring
    if (phase === PHASES.CLEARING) {
      if (tick >= 2) {
        const aliveMonsters = monsters.filter(m => m.stats.hp > 0);

        if (aliveMonsters.length === 0) {
          // OPTIMIZATION: Single batched update
          updateRoomCombat({ phase: PHASES.COMPLETE, tick: 0 });
          const pb = permanentBonuses || {};
          const goldMultiplier = 1 + (homesteadBonuses.goldFind || 0) + (pb.goldFind || 0);
          const bonus = Math.floor(100 * dungeon.level * goldMultiplier);
          addGold(bonus);
          incrementStat('totalDungeonsCleared');
          addCombatLog({ type: 'system', message: `Dungeon Complete! +${bonus} gold!` });
        } else {
          clearEffects();
          resetLastProcessedTurn();

          const newTarget = findExplorationTarget(mazeDungeon, roomCombat.partyPosition, monsters);

          // OPTIMIZATION: Single batched update
          updateRoomCombat({
            phase: PHASES.EXPLORING,
            tick: 0,
            targetPosition: newTarget,
            combatMonsters: [],
            turnOrder: [],
          });
        }
      } else {
        updateRoomCombat({ tick: tick + 1 });
      }
      return;
    }

    // Phase: TRANSITIONING - brief pause
    if (phase === PHASES.TRANSITIONING) {
      if (tick >= 1) {
        clearEffects();
        resetLastProcessedTurn();
        // OPTIMIZATION: Single update instead of two
        updateRoomCombat({ phase: PHASES.EXPLORING, tick: 0 });
      } else {
        updateRoomCombat({ tick: tick + 1 });
      }
      return;
    }

    // Phase: COMPLETE - end dungeon, auto-advance to next level
    if (phase === PHASES.COMPLETE) {
      if (tick >= 3) {
        clearEffects();
        resetLastProcessedTurn();
        const nextLevel = Math.min(dungeon.level + 1, maxDungeonLevel);
        const shouldAutoAdvance = dungeonSettings?.autoAdvance === true;
        const atTargetLevel = dungeonSettings?.targetLevel && dungeon.level >= dungeonSettings.targetLevel;

        endDungeon(true);
        clearRoomCombat();

        // Auto-start next dungeon with player's settings
        if (shouldAutoAdvance && !atTargetLevel && nextLevel <= maxDungeonLevel) {
          const options = { type: dungeonSettings?.type || 'normal' };
          // Cancel any pending auto-start to prevent pile-up
          if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
          autoStartTimeoutRef.current = setTimeout(() => {
            autoStartTimeoutRef.current = null;
            startDungeon(nextLevel, options);
          }, 500);
        }
      } else {
        updateRoomCombat({ tick: tick + 1 });
      }
      return;
    }

    // Phase: DEFEAT - end dungeon, retry same level
    if (phase === PHASES.DEFEAT) {
      if (tick >= 3) {
        clearEffects();
        resetLastProcessedTurn();
        incrementStat('totalDeaths');
        const retryLevel = dungeon.level;

        endDungeon(false);
        clearRoomCombat();

        // Auto-retry with player's settings
        if (dungeonSettings?.autoAdvance === true) {
          const options = { type: dungeonSettings?.type || 'normal' };
          // Cancel any pending auto-start to prevent pile-up
          if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
          autoStartTimeoutRef.current = setTimeout(() => {
            autoStartTimeoutRef.current = null;
            startDungeon(retryLevel, options);
          }, 500);
        }
      } else {
        updateRoomCombat({ tick: tick + 1 });
      }
      return;
    }
  }, [
    setupDungeon, handleExplorationTick, handleCombatTick,
    clearEffects, resetLastProcessedTurn,
    updateRoomCombat, addCombatLog, clearCombatLog, addGold,
    incrementStat, endDungeon, clearRoomCombat, startDungeon,
  ]);

  // Start dungeon - trigger setup phase
  useEffect(() => {
    if (dungeon && !hasRoomCombat) {
      setRoomCombat({ phase: PHASES.SETUP, tick: 0 });
    }
    if (!dungeon && hasRoomCombat) {
      clearRoomCombat();
    }
  }, [dungeon, hasRoomCombat, setRoomCombat, clearRoomCombat]);

  // OPTIMIZATION: Use ref to avoid recreating interval on gameTick changes
  const gameTickRef = useRef(gameTick);
  useEffect(() => {
    gameTickRef.current = gameTick;
  }, [gameTick]);

  // OPTIMIZATION: Prevent tick pile-up with a lock
  const tickInProgressRef = useRef(false);

  // Game loop - only recreate interval when truly necessary
  useEffect(() => {
    if (!dungeon || !isRunning || !hasRoomCombat) return;

    const tickRate = 250 / gameSpeed;

    // Use RAF-synced timeout for smoother performance
    let timeoutId = null;
    let lastTickTime = performance.now();

    const scheduleTick = () => {
      const now = performance.now();
      const elapsed = now - lastTickTime;
      const delay = Math.max(0, tickRate - elapsed);

      timeoutId = setTimeout(() => {
        // Skip if previous tick still running (prevents pile-up)
        if (tickInProgressRef.current) {
          lastTickTime = performance.now();
          scheduleTick();
          return;
        }

        tickInProgressRef.current = true;
        lastTickTime = performance.now();

        try {
          gameTickRef.current();
        } finally {
          tickInProgressRef.current = false;
        }

        scheduleTick();
      }, delay);
    };

    scheduleTick();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      // Note: Don't cancel autoStartTimeoutRef here - it needs to survive
      // the dungeon transition to start the next dungeon
    };
  }, [dungeon, isRunning, gameSpeed, hasRoomCombat]); // Only recreate on these specific changes

  // Offline progress check is handled in Game.jsx

  // Periodic save
  useEffect(() => {
    const interval = setInterval(updateLastSaveTime, 30000);
    return () => clearInterval(interval);
  }, [updateLastSaveTime]);

  return {
    gameTick,
  };
};
