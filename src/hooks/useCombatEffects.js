import { useState, useCallback, useRef, useEffect } from 'react';

// OPTIMIZATION: Limit concurrent effects to prevent lag
// Canvas renderer handles effects efficiently, so we can allow more
const MAX_CONCURRENT_EFFECTS = 12;

// Effect types to skip during heavy combat (less important visual flourish)
// Note: beam, damage, skillActivation are NOT skippable - they're core attack visuals
const SKIPPABLE_EFFECTS = new Set(['buffAura', 'aoeGround', 'status']);

/**
 * Hook for managing combat visual effects
 * Provides state and callbacks for adding/removing combat effects
 * OPTIMIZED: Batches effect additions and limits concurrent effects
 */
export const useCombatEffects = () => {
  const [combatEffects, setCombatEffects] = useState([]);
  const nextEffectIdRef = useRef(0);

  // OPTIMIZATION: Batch effects and flush on next frame
  const pendingEffectsRef = useRef([]);
  const flushScheduledRef = useRef(false);

  // Flush pending effects to state
  const flushEffects = useCallback(() => {
    if (pendingEffectsRef.current.length > 0) {
      const toAdd = pendingEffectsRef.current;
      pendingEffectsRef.current = [];
      flushScheduledRef.current = false;

      setCombatEffects(prev => {
        const combined = [...prev, ...toAdd];
        // OPTIMIZATION: Limit total effects to prevent lag
        if (combined.length > MAX_CONCURRENT_EFFECTS) {
          return combined.slice(-MAX_CONCURRENT_EFFECTS);
        }
        return combined;
      });
    } else {
      flushScheduledRef.current = false;
    }
  }, []);

  // OPTIMIZATION: Track current effect count in ref to avoid dependency on combatEffects
  const effectCountRef = useRef(0);
  useEffect(() => {
    effectCountRef.current = combatEffects.length;
  }, [combatEffects.length]);

  // Add combat effect (batched) - OPTIMIZATION: No dependency on combatEffects.length
  const addEffect = useCallback((effect) => {
    // OPTIMIZATION: Skip less important effects when queue is getting full
    const currentTotal = pendingEffectsRef.current.length + effectCountRef.current;

    if (currentTotal >= MAX_CONCURRENT_EFFECTS - 1 && SKIPPABLE_EFFECTS.has(effect.type)) {
      return; // Skip this effect to prevent overload
    }

    const id = nextEffectIdRef.current++;
    pendingEffectsRef.current.push({ ...effect, id });

    // Schedule flush if not already scheduled
    // Use requestAnimationFrame to align with browser render cycle
    if (!flushScheduledRef.current) {
      flushScheduledRef.current = true;
      requestAnimationFrame(flushEffects);
    }
  }, [flushEffects]);

  // OPTIMIZATION: Batch effect removals
  const pendingRemovalsRef = useRef([]);
  const removalFlushScheduledRef = useRef(false);

  const flushRemovals = useCallback(() => {
    if (pendingRemovalsRef.current.length > 0) {
      const toRemove = new Set(pendingRemovalsRef.current);
      pendingRemovalsRef.current = [];
      removalFlushScheduledRef.current = false;
      setCombatEffects(prev => prev.filter(e => !toRemove.has(e.id)));
    } else {
      removalFlushScheduledRef.current = false;
    }
  }, []);

  // Remove completed effect (batched)
  const removeEffect = useCallback((effectId) => {
    pendingRemovalsRef.current.push(effectId);

    if (!removalFlushScheduledRef.current) {
      removalFlushScheduledRef.current = true;
      requestAnimationFrame(flushRemovals);
    }
  }, [flushRemovals]);

  // Clear all effects
  const clearEffects = useCallback(() => {
    pendingEffectsRef.current = [];
    pendingRemovalsRef.current = [];
    flushScheduledRef.current = false;
    removalFlushScheduledRef.current = false;
    // OPTIMIZATION: Reset effect ID counter to prevent unbounded growth
    nextEffectIdRef.current = 0;
    setCombatEffects([]);
  }, []);

  return {
    combatEffects,
    addEffect,
    removeEffect,
    clearEffects,
  };
};
