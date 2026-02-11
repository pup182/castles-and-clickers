import { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

// Poll at ~2 FPS for display updates - only tracks major state changes
// Offset from other 500ms intervals to prevent batching
const POLL_INTERVAL = 517;

/**
 * Hook for accessing room combat display state with polling.
 *
 * With Canvas renderer enabled, this is mainly used to check if dungeon exists.
 * HP/damage changes are rendered by Canvas imperatively, so we only track
 * phase changes and dungeon existence here.
 */
export const useThrottledDisplay = () => {
  const [displayState, setDisplayState] = useState(() => useGameStore.getState().roomCombat);
  const lastPhaseRef = useRef(null);
  const hadDungeonRef = useRef(false);

  useEffect(() => {
    // Poll for changes at fixed interval
    const intervalId = setInterval(() => {
      const current = useGameStore.getState().roomCombat;
      const hasDungeon = !!current?.dungeon;
      const phase = current?.phase;

      // Only update on phase change or dungeon existence change
      // HP changes are handled by Canvas, not React
      if (phase !== lastPhaseRef.current || hasDungeon !== hadDungeonRef.current) {
        lastPhaseRef.current = phase;
        hadDungeonRef.current = hasDungeon;
        setDisplayState(current);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return displayState;
};
