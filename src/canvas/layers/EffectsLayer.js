// Effects layer - manages and renders combat visual effects
// Wraps AnimationManager for integration with CanvasRenderer

import { AnimationManager } from '../AnimationManager';

export class EffectsLayer {
  constructor(tileSize) {
    this.tileSize = tileSize;
    this.animationManager = new AnimationManager(tileSize);

    // Track which effects we've already added (by id)
    this.addedEffectIds = new Set();

    // External effect callback
    this.onEffectComplete = null;
  }

  // Set effects from React (called each frame with current effects array)
  setEffects(effects, onComplete) {
    this.onEffectComplete = onComplete;

    // Set up callback on animation manager
    this.animationManager.setCallback((effectId) => {
      this.addedEffectIds.delete(effectId);
      if (this.onEffectComplete) {
        this.onEffectComplete(effectId);
      }
    });

    // Add any new effects
    for (const effect of effects) {
      if (!this.addedEffectIds.has(effect.id)) {
        this.addedEffectIds.add(effect.id);
        this.animationManager.addEffect(effect);
      }
    }

    // Clean up effects that were removed externally
    const currentIds = new Set(effects.map(e => e.id));
    for (const id of this.addedEffectIds) {
      if (!currentIds.has(id)) {
        this.addedEffectIds.delete(id);
      }
    }
  }

  // Render effects layer
  render(ctx, cameraPos, deltaTime) {
    // Update animation timings
    this.animationManager.update(deltaTime);

    // Render all active effects
    this.animationManager.render(ctx, cameraPos);
  }

  // Clear all effects
  clear() {
    this.animationManager.clear();
    this.addedEffectIds.clear();
  }

  // Get effect count
  getCount() {
    return this.animationManager.getCount();
  }
}
