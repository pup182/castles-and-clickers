# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**For comprehensive architecture documentation, see [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md).**

## Project Overview

Castles & Clickers is an idle dungeon crawler browser game built with React 19, Zustand, and Vite. Heroes explore procedurally generated dungeons, fight monsters with initiative-based combat, collect loot with affixes, and progress through skill trees and homestead upgrades.

## Development Commands

```bash
npm run dev       # Start Vite dev server (localhost:5173)
npm run build     # Production build to /dist
npm run lint      # ESLint on all .js/.jsx files
npm run preview   # Preview production build
```

## Architecture

### State Management
Single Zustand store in `src/store/gameStore.js` manages all game state with localStorage persistence for offline progress. Use individual selectors to prevent unnecessary re-renders:
```js
const heroes = useGameStore(state => state.heroes);  // Good
const { heroes, gold } = useGameStore();              // Avoid - re-renders on any change
```

### Game Loop
The game uses a hook-based loop architecture:
- `useGameLoop` - Main tick orchestration (~500ms intervals)
- `useCombat` - Combat phase resolution with initiative system
- `useDungeon` - Exploration and room navigation
- `useCombatEffects` - Visual effect queue management
- `useThrottledDisplay` - Render throttling (~15 FPS) to reduce component updates

### Combat Phases
`SETUP → EXPLORING → COMBAT → CLEARING → COMPLETE`

Combat uses initiative-based turn order with A* pathfinding for movement. Speed stat influences dodge chance and double attack probability.

## Key Directories

- `src/store/` - Zustand store (gameStore.js is 1355 lines, the central state authority)
- `src/game/` - Core mechanics: combat engine, monster AI, skill system, maze generation
- `src/data/` - Game definitions: classes, equipment, monsters, skill trees, raids, affixes
- `src/hooks/` - Custom hooks for game loop, combat, dungeon, effects
- `src/components/` - React UI components, with reusable pieces in `ui/` subdirectory
- `src/canvas/` - Canvas-based dungeon renderer with layered architecture (terrain, units, UI, effects)

## Critical Files

- `src/store/gameStore.js` - All state and actions (largest logic file)
- `src/game/mazeGenerator.js` - Room-based dungeon generation with A* pathfinding (29KB)
- `src/hooks/useCombat.js` - Combat loop and resolution logic (53KB)
- `src/game/constants.js` - Game balance values, formulas, and utility functions

## Performance Patterns

This codebase uses several optimization patterns:
- Zustand selector pattern for granular subscriptions
- `useThrottledDisplay` separates game tick rate from render rate
- `useCallback`/`useMemo` for stable references
- Stable default objects to prevent reference churn

## Art Style Guidelines

This game uses a **pixel art RPG aesthetic**. All visual elements must maintain this style.

### Icons - SVG Pixel Art

**NEVER use emojis in the UI.** Always use SVG pixel art icons from `src/components/icons/`.

Icon files:
- `ui.jsx` - General UI icons (gold, hearts, swords, shields, etc.)
- `monsters.jsx` - Monster sprites
- `weapons.jsx` - Equipment icons
- `skills.jsx` - Skill/ability icons
- `statusEffects.jsx` - Buff/debuff indicators
- `ClassIcon.jsx` - Hero class portraits

### Creating New Icons

Feel free to create new SVG icons that match the existing art style:

```jsx
// All icons use a 16x16 grid with pixelated rendering
const IconWrapper = ({ children, size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ imageRendering: 'pixelated' }}
  >
    {children}
  </svg>
);

// P helper places rectangular "pixels" at x,y coordinates
const P = ({ x, y, c, w = 1, h = 1 }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} />
);

// Example: Simple sword icon
export const SwordIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={12} y={2} w={2} h={2} c="#94a3b8" />  {/* Pommel */}
    <P x={10} y={4} w={2} h={2} c="#64748b" />  {/* Guard */}
    <P x={8} y={6} w={2} h={2} c="#e2e8f0" />   {/* Blade */}
    <P x={6} y={8} w={2} h={2} c="#e2e8f0" />
    <P x={4} y={10} w={2} h={2} c="#e2e8f0" />
    <P x={2} y={12} w={2} h={2} c="#f8fafc" />  {/* Tip highlight */}
  </IconWrapper>
);
```

Guidelines for new icons:
- Use the 16x16 grid system
- Use Tailwind color palette hex values for consistency
- Add highlights/shading for depth (lighter top-left, darker bottom-right)
- Keep designs simple and readable at small sizes
- Export from the appropriate file based on icon category

### CSS Classes

Use pixel-styled CSS classes for UI elements:
- `pixel-panel` / `pixel-panel-dark` - Bordered containers
- `pixel-btn` / `pixel-btn-primary` / `pixel-btn-secondary` - Buttons
- `pixel-bar` / `pixel-bar-fill` - Progress bars
- `pixel-text` / `pixel-label` / `pixel-title` / `pixel-subtitle` - Typography

## Known Technical Debt

See `CODE_REVIEW.md` for detailed analysis. Key issues:
- Large files need splitting (useCombat.js, gameStore.js)
- Magic numbers for game balance scattered in code
- No TypeScript despite @types packages installed
- No test coverage
