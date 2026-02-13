// Canvas-based dungeon renderer - replaces React DungeonView for better performance
// Uses RAF loop at 60 FPS, reads state imperatively from Zustand

import { useGameStore } from '../store/gameStore';
import { Camera } from './Camera';
import { SpriteManager } from './SpriteManager';
import { TerrainLayer } from './layers/TerrainLayer';
import { UnitLayer } from './layers/UnitLayer';
import { UILayer } from './layers/UILayer';
import { EffectsLayer } from './layers/EffectsLayer';
import { getThemeForLevel, getThemeForRaid } from '../data/dungeonThemes';

// Rendering constants
export const TILE_SIZE = 36;
export const VIEWPORT_WIDTH = 20;
export const VIEWPORT_HEIGHT = 14;

export class CanvasRenderer {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.options = options;
    this.disabled = !this.ctx;

    if (this.disabled) {
      console.warn('CanvasRenderer: could not get 2d context');
      return;
    }

    // Set canvas dimensions
    this.width = VIEWPORT_WIDTH * TILE_SIZE;
    this.height = VIEWPORT_HEIGHT * TILE_SIZE;
    canvas.width = this.width;
    canvas.height = this.height;

    // Disable image smoothing for crisp pixel art
    this.ctx.imageSmoothingEnabled = false;

    // Initialize subsystems
    this.camera = new Camera(VIEWPORT_WIDTH, VIEWPORT_HEIGHT, TILE_SIZE);
    this.spriteManager = new SpriteManager();

    // Initialize layers
    this.terrainLayer = new TerrainLayer(this.spriteManager, TILE_SIZE);
    this.unitLayer = new UnitLayer(this.spriteManager, TILE_SIZE);
    this.uiLayer = new UILayer(TILE_SIZE);
    this.effectsLayer = new EffectsLayer(TILE_SIZE);

    // State tracking for dirty detection
    this.lastState = null;
    this.lastDungeonId = null;
    this.lastLevel = null;
    this.lastGrid = null; // Track grid reference to detect treasure collection

    // Animation frame tracking
    this.animationId = null;
    this.isRunning = false;
    this.lastFrameTime = 0;
    this.frameCount = 0;

    // FPS throttling - use 30 FPS when not in active combat
    this.targetFPS = 60;
    this.minFrameTime = 1000 / 60;

    // Effect callback
    this.onEffectComplete = options.onEffectComplete || (() => {});

    // Bind render loop
    this.render = this.render.bind(this);
  }

  // Start the render loop
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.animationId = requestAnimationFrame(this.render);
  }

  // Stop the render loop
  stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Add effects from React (via useCombatEffects hook)
  addEffects(effects) {
    this.effectsLayer.setEffects(effects, this.onEffectComplete);
  }

  // Main render loop - adaptive FPS
  render(timestamp) {
    if (!this.isRunning || this.disabled) return;

    const deltaTime = timestamp - this.lastFrameTime;

    // Skip frame if we're ahead of target FPS (throttle when not in combat)
    if (deltaTime < this.minFrameTime) {
      this.animationId = requestAnimationFrame(this.render);
      return;
    }

    this.lastFrameTime = timestamp;
    this.frameCount++;

    // Get current state imperatively (no React overhead)
    const state = useGameStore.getState();
    const roomCombat = state.roomCombat;

    // Skip rendering if no dungeon
    if (!roomCombat?.dungeon) {
      this.ctx.fillStyle = '#1a1a2e';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.animationId = requestAnimationFrame(this.render);
      return;
    }

    const dungeon = roomCombat.dungeon;
    const heroes = roomCombat.heroes || [];
    const monsters = roomCombat.monsters || [];
    const partyPosition = roomCombat.partyPosition || { x: 0, y: 0 };
    const viewport = roomCombat.viewport || { x: 0, y: 0 };
    const phase = roomCombat.phase;
    const currentActorId = roomCombat.turnOrder?.[roomCombat.currentTurnIndex];
    const bossUnlocked = roomCombat.bossUnlocked || false;
    const statusEffects = roomCombat.statusEffects || {};

    // Adaptive FPS: 60 FPS during combat/effects, 30 FPS otherwise
    const hasActiveEffects = this.effectsLayer.getCount() > 0;
    const needsHighFPS = phase === 'combat' || hasActiveEffects;
    this.minFrameTime = needsHighFPS ? (1000 / 60) : (1000 / 30);

    // Check if dungeon changed (need to rebuild terrain cache)
    // Also check grid reference to detect treasure collection or other tile changes
    const dungeonId = dungeon.id || `${dungeon.level}-${dungeon.seed}`;
    const gridChanged = dungeon.grid !== this.lastGrid;
    if (dungeonId !== this.lastDungeonId || dungeon.level !== this.lastLevel || gridChanged) {
      // Use raid theme for raid dungeons, otherwise use level-based theme
      const theme = dungeon.isRaid && dungeon.raidId
        ? getThemeForRaid(dungeon.raidId)
        : getThemeForLevel(dungeon.level);
      this.terrainLayer.buildCache(dungeon, theme);
      this.unitLayer.clearPositionCache(); // Clear stale position data
      this.lastDungeonId = dungeonId;
      this.lastLevel = dungeon.level;
      this.lastGrid = dungeon.grid;
    }

    // Update camera with smooth scrolling
    this.camera.setTarget(viewport.x, viewport.y);
    this.camera.update(deltaTime);

    // Clear canvas
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render layers in order
    const cameraPos = this.camera.getPosition();

    // 1. Terrain (uses cached offscreen canvas)
    this.terrainLayer.render(this.ctx, cameraPos, this.width, this.height);

    // 2. Units (heroes and monsters) - returns interpolated positions for UI sync
    const unitPositions = this.unitLayer.render(this.ctx, cameraPos, heroes, monsters, phase);

    // 3. UI overlays (health bars, status effects, current actor) - use synced positions
    this.uiLayer.render(this.ctx, cameraPos, heroes, monsters, currentActorId, bossUnlocked, statusEffects, unitPositions);

    // 4. Combat effects (damage numbers, beams, etc.)
    this.effectsLayer.render(this.ctx, cameraPos, deltaTime);

    // Combat phase border indicator
    if (phase === 'combat') {
      this.ctx.strokeStyle = '#dc2626';
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(2, 2, this.width - 4, this.height - 4);
    }

    // Continue the loop
    this.animationId = requestAnimationFrame(this.render);
  }

  // Handle resize
  resize(width, height) {
    // Keep fixed viewport size for now
    // Could implement dynamic viewport later
  }

  // Cleanup
  destroy() {
    this.stop();
    this.terrainLayer.destroy();
    this.spriteManager.clear();
  }
}
