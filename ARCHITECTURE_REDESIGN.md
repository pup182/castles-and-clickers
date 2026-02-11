# Architecture Redesign: Canvas + Game Engine

## Overview

Replace the current React-based dungeon rendering with a Canvas-based game engine while keeping React for UI components.

## Current Problems

1. **Object churn**: Every 250ms tick creates ~50+ new objects via spread operators
2. **DOM overhead**: ~300+ divs for tiles, ~15+ for units, plus effect divs
3. **React reconciliation**: Virtual DOM diffing on every tick
4. **GC pressure**: Constant object creation → garbage collection pauses

## New Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      GAME ENGINE                            │
│  src/game/engine/GameEngine.js                              │
│                                                             │
│  - Mutable game state (no spreading, no new objects)        │
│  - tick() mutates in place                                  │
│  - draw() renders to canvas                                 │
│  - Runs on requestAnimationFrame                            │
│  - Emits events for UI updates (gold, XP, loot)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────┐ ┌─────────────────────┐
│  Canvas         │ │  Zustand    │ │  React UI           │
│  (game view)    │ │  (persist)  │ │  (screens, menus)   │
│                 │ │             │ │                     │
│  - Tiles        │ │  - Gold     │ │  - EquipmentScreen  │
│  - Units        │ │  - Heroes   │ │  - SkillTreeScreen  │
│  - Effects      │ │  - Inventory│ │  - HomesteadScreen  │
│  - Animations   │ │  - Settings │ │  - PartyStatus      │
│                 │ │  - Progress │ │  - CombatLog        │
└─────────────────┘ └─────────────┘ └─────────────────────┘
```

## File Structure

```
src/
├── game/
│   └── engine/
│       ├── GameEngine.js        # Main engine class
│       ├── CombatSystem.js      # Combat logic (mutates state)
│       ├── ExplorationSystem.js # Movement logic (mutates state)
│       ├── EffectSystem.js      # Visual effects manager
│       ├── Renderer.js          # Canvas drawing
│       ├── SpriteManager.js     # Sprite/image loading & caching
│       └── State.js             # Mutable game state container
├── components/
│   └── DungeonCanvas.jsx        # React wrapper for canvas
└── hooks/
    └── useGameEngine.js         # Hook to connect engine to React
```

## Implementation Phases

### Phase 1: Game Engine Core
Create the mutable state container and basic engine loop.

**Files to create:**
- `src/game/engine/State.js` - Mutable state container
- `src/game/engine/GameEngine.js` - Main loop, tick orchestration

**State.js structure:**
```javascript
// Mutable state - NO spreading, NO new objects
class GameState {
  constructor() {
    this.phase = 'idle';
    this.dungeon = null;
    this.heroes = [];      // Mutable array of mutable hero objects
    this.monsters = [];    // Mutable array of mutable monster objects
    this.viewport = { x: 0, y: 0 };
    this.effects = [];
    // ... etc
  }

  // Methods mutate in place
  damageUnit(unitId, amount) {
    const unit = this.findUnit(unitId);
    unit.stats.hp -= amount; // Direct mutation!
  }
}
```

### Phase 2: Canvas Renderer
Draw the game state to canvas.

**Files to create:**
- `src/game/engine/Renderer.js` - Canvas drawing logic
- `src/game/engine/SpriteManager.js` - Load/cache sprite images

**Renderer responsibilities:**
- Draw tile grid (can cache static tiles to offscreen canvas)
- Draw units at their positions
- Draw health bars
- Draw effects/animations
- Handle viewport offset

### Phase 3: Combat & Exploration Systems
Port existing logic to mutable paradigm.

**Files to create:**
- `src/game/engine/CombatSystem.js` - Combat tick logic
- `src/game/engine/ExplorationSystem.js` - Movement logic

**Key change:** Instead of:
```javascript
// OLD: Creates new objects
const newHeroes = heroes.map(h => ({...h, stats: {...h.stats, hp: h.stats.hp - damage}}));
updateRoomCombat({ heroes: newHeroes });
```

We do:
```javascript
// NEW: Mutates in place
hero.stats.hp -= damage;
// No state update needed - renderer reads current state
```

### Phase 4: React Integration
Connect the engine to React UI.

**Files to create/modify:**
- `src/components/DungeonCanvas.jsx` - Canvas wrapper component
- `src/hooks/useGameEngine.js` - Engine lifecycle hook
- Modify `DungeonScreen.jsx` - Use canvas instead of DungeonView

**DungeonCanvas.jsx:**
```javascript
const DungeonCanvas = ({ engine }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    engine.setCanvas(canvasRef.current);
    engine.start();
    return () => engine.stop();
  }, [engine]);

  return <canvas ref={canvasRef} width={720} height={504} />;
};
```

### Phase 5: Event Bridge
Engine emits events for UI updates.

**Events from engine → React:**
- `gold-changed` → Update gold display
- `xp-gained` → Update hero XP
- `loot-dropped` → Show loot notification
- `combat-log` → Add to combat log
- `phase-changed` → Update phase indicator
- `dungeon-complete` → Trigger completion UI

**Commands from React → Engine:**
- `startDungeon(level, options)`
- `abandonDungeon()`
- `setGameSpeed(speed)`
- `pause()` / `resume()`

### Phase 6: Cleanup
Remove old code.

**Files to remove/gut:**
- `src/hooks/useCombat.js` - Logic moves to CombatSystem
- `src/hooks/useDungeon.js` - Logic moves to ExplorationSystem
- `src/hooks/useGameLoop.js` - Logic moves to GameEngine
- `src/hooks/useThrottledDisplay.js` - No longer needed
- `src/hooks/useCombatEffects.js` - Logic moves to EffectSystem
- `src/components/DungeonView.jsx` - Replaced by canvas
- `src/components/CombatEffects.jsx` - Replaced by canvas

**Zustand store changes:**
- Remove `roomCombat` entirely
- Remove `combatLog` (engine manages)
- Keep: gold, heroes, inventory, settings, progress

## Sprite Strategy

For canvas rendering, we need sprites instead of React icon components.

**Option A: Convert SVG icons to images**
- Export current icons as PNGs
- Load as Image objects for canvas

**Option B: Draw SVG to canvas**
- Create Image from SVG data URLs
- More complex but reuses existing icons

**Option C: Simple shapes**
- Draw colored rectangles/circles for units
- Fast, no loading, retro aesthetic

Recommend starting with Option C, upgrade later.

## Performance Expectations

**Before (current):**
- 250ms tick → ~50 object allocations → GC pressure
- ~300 DOM elements updated via React
- Style recalculation on every position change

**After (new):**
- 250ms tick → 0 object allocations (mutations)
- 1 canvas element, drawn via GPU
- No DOM changes during gameplay

Expected result: Smooth 60fps with no stuttering.

## Migration Strategy

1. Build new engine alongside existing code
2. Create feature flag to switch between old/new
3. Test new engine thoroughly
4. Remove old code once stable

## Risks & Mitigations

**Risk:** Canvas click handling more complex than DOM
**Mitigation:** Most interaction is automated; only need click-to-inspect

**Risk:** Existing icon components won't work
**Mitigation:** Start with simple shapes, add sprites incrementally

**Risk:** Large refactor, potential for bugs
**Mitigation:** Parallel implementation, feature flag, extensive testing

## Timeline Estimate

- Phase 1 (Core): Create State + GameEngine skeleton
- Phase 2 (Renderer): Basic canvas drawing
- Phase 3 (Systems): Port combat/exploration logic
- Phase 4 (Integration): Connect to React
- Phase 5 (Events): Wire up UI updates
- Phase 6 (Cleanup): Remove old code

## Next Steps

1. Create `src/game/engine/` directory
2. Implement `State.js` with mutable game state
3. Implement basic `GameEngine.js` loop
4. Implement `Renderer.js` with simple shape rendering
5. Create `DungeonCanvas.jsx` React wrapper
6. Test basic rendering works
7. Port exploration logic
8. Port combat logic
9. Add effects system
10. Wire up events to React
11. Remove old code
