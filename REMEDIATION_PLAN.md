# Remediation Plan — Castles & Clickers

This plan addresses all verified weaknesses from `WEAK_POINTS.md`, organized into 6 phases ordered by dependency and impact. Each phase is self-contained with enough context for an independent agent to execute.

**Excluded from this plan:**
| Item | Reason |
|------|--------|
| Gold economy / late-game sinks (WP §3) | Needs dedicated design session — could be prestige, new systems, or shop-driven |
| Combat & class balance (WP §5) | Speed buff is intentional — keeps DPS alive in dungeons, dodge/double-attack scaling working as designed |
| Test coverage (WP §6 partial) | Separate project, doesn't block gameplay improvements |

---

## ~~Phase 1: Error Handling & Resilience (Foundation)~~ DONE (v0.1.17)

> ~~Everything else builds on a stable base. Do this first.~~

### ~~1A. React ErrorBoundary~~ DONE

- ~~Create `src/components/ErrorBoundary.jsx` — class component with `componentDidCatch`~~
- ~~Show a pixel-styled recovery screen with "Something went wrong" + "Reload" button~~
- ~~Wrap the app root in `src/App.jsx`~~

### ~~1B. localStorage Protection~~ DONE

- ~~Wrap all 3 operations in `throttledStorage` (`getItem`, `setItem`, `removeItem`) in try-catch~~
- ~~On `setItem` failure: log warning, continue with in-memory state (no crash)~~
- ~~On `getItem` failure: return null (fresh game)~~
- ~~Add `window.addEventListener('beforeunload', ...)` to flush any pending save immediately~~

### ~~1C. Critical Event Saves~~ DONE

- ~~Add an `immediateSave()` function that bypasses the 2s throttle~~
- ~~Call it on: level up, skill unlock, unique item drop, dungeon completion, raid completion, homestead upgrade~~

### ~~1D. Canvas Null Checks~~ DONE

~~Add null guards on `getContext('2d')` in:~~
- ~~`src/canvas/CanvasRenderer.js:21`~~
- ~~`src/canvas/layers/TerrainLayer.js:62`~~
- ~~`src/canvas/CanvasDungeonView.jsx:116,149`~~
- ~~If null, skip rendering gracefully (no crash)~~

~~Also added guards in `SpriteManager.js`, `MonsterSprites.js`, and `HeroSprites.js`.~~

### ~~1E. NaN / Undefined Guards~~ DONE

- ~~`src/data/equipment.js:708` — check `possibleItems.length > 0` before access~~
- ~~`src/data/equipment.js:736` — validate `RARITY[rarity]` exists, fallback to common multiplier~~
- ~~`src/hooks/useCombat.js:92` — validate `dungeon.level` is a finite number~~
- ~~`src/canvas/CanvasDungeonView.jsx:120` — add optional chaining `grid[y]?.[x]`~~

### ~~Phase 1 Verification~~ DONE

1. ~~`npm run build` — no build errors~~
2. ~~`npm run lint` — no new lint warnings~~
3. Manual test: simulate localStorage failure (private browsing), verify ErrorBoundary catches render errors

---

## Phase 2: Technical Debt Cleanup

> Clean up the codebase before adding new features to it.

### ~~2A. Split `useCombat.js` (3,508 lines → 6 files)~~ DONE (v0.1.18)

| New File | Lines | Contents |
|----------|-------|----------|
| `src/hooks/useCombat.js` | ~560 | Thin orchestrator, builds shared `ctx` object |
| `src/game/combatHelpers.js` | ~210 | Targeting, death handling, viewport, utilities |
| `src/game/combatDamageResolution.js` | ~1100 | Basic attack damage, on-hit/kill/crit effects |
| `src/game/combatSkillExecution.js` | ~530 | Hero skill & monster ability execution |
| `src/game/combatStatusEffects.js` | ~310 | DOT/stun/buff per-turn processing |
| `src/game/combatMovement.js` | ~140 | A* pathfinding & directional movement |

All modules share a mutable `ctx` object. Game files never import `useGameStore` — store actions are wrapped as callbacks on `ctx`.

### 2B. Split `gameStore.js` (2,929 lines → slices)

| New File | Contents |
|----------|----------|
| `src/store/gameStore.js` | Main store composition + state init |
| `src/store/slices/heroSlice.js` | 14 hero management actions |
| `src/store/slices/inventorySlice.js` | 6 inventory actions |
| `src/store/slices/combatSlice.js` | 8 combat state actions |
| `src/store/slices/dungeonSlice.js` | 8 dungeon progression actions |
| `src/store/slices/homesteadSlice.js` | Homestead + shop actions |
| `src/store/helpers/` | `throttledStorage`, stat calc, name gen |

### 2C. Split `skillEngine.js` (2,067 lines → ~4 files)

| New File | Contents |
|----------|----------|
| `src/game/skillEngine.js` | Core exports, getAvailableSkills |
| `src/game/skillExecution.js` | executeSkillAbility refactored |
| `src/game/passiveEffects.js` | 185-line switch → handler map |
| `src/game/skillAI.js` | chooseBestSkill, selection logic |

### 2D. Centralize Magic Numbers

Create `src/game/balanceConstants.js` with named constants for:
- HP thresholds (0.25, 0.50, 0.75)
- Damage variance (0.85, 0.30)
- Crit multiplier (1.5)
- Speed/dodge/double-attack coefficients and caps
- XP curve base and exponent
- Gold formulas

Update all references across `constants.js`, `skillEngine.js`, `useCombat.js`.

### 2E. Console & Package Cleanup

- Wrap `combatSimulator.js` logs in `if (import.meta.env.DEV)` check
- Remove `@types/react` and `@types/react-dom` from `package.json`

### Phase 2 Verification

1. `npm run build` — no build errors
2. `npm run lint` — no new lint warnings
3. Manual test: verify all imports resolve, game functions identically after split

---

## Phase 3: Progression & Shop Rework

### 3A. Early Game Pacing Fixes

- **Free skill point at level 1:** Modify `calculateSkillPoints` in `gameStore.js` (or the new heroSlice)
- **Party size milestone at D15:** Add 6th hero unlock at dungeon 15 (currently: 5th at D8, 7th at D25). Modify `src/data/milestones.js`
- **Smooth elite introduction:** Start with 1 elite per dungeon at D8, ramp to current rate by D12. Modify `src/game/mazeGenerator.js` elite spawn logic

### 3B. Flat Respec Cost

Change formula in `src/data/skillTrees.js:1927-1930`:
- **From:** `50 * Math.pow(2, usedSkillPoints - 1)` (exponential, punishing)
- **To:** `500 * usedSkillPoints` (flat per-point — exact coefficient TBD during implementation, tune so it's meaningful but not punishing)

### 3C. Full Shop Rework

**Rarity scaling:**
- Unlock Rare items at D10, Epic at D20, Legendary at D25

**New consumables tab:**
- Healing potions, XP scrolls, temporary buffs
- Create new data file: `src/data/consumables.js`

**Featured item slot:**
- 1 rotating rare+ item slot that refreshes daily

**Refresh changes:**
- 2-hour auto-refresh
- Manual refresh cost scales with dungeon level

**UI overhaul:**
- Tabs for Equipment / Consumables / Featured
- Bulk buy/sell support

**Files touched:** `src/store/gameStore.js` (shop actions in homesteadSlice), `src/components/ShopScreen.jsx`, new `src/data/consumables.js`

### Phase 3 Verification

1. `npm run build` — no build errors
2. `npm run lint` — no new lint warnings
3. Manual test: shop at D1, D10, D20; respec cost at various skill point counts; verify free skill point at level 1

---

## Phase 4: Accessibility (WCAG AA)

### 4A. Motion Safety

Add to `src/index.css`:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4B. Color Contrast Fixes

- Update `--color-text-dim` from `#a0a0b0` to a value meeting 4.5:1 on dark backgrounds
- Fix `.pixel-label`, `.pixel-speed-btn`, and any gray-400-on-dark-bg instances
- Audit with browser dev tools contrast checker

### 4C. ARIA Labels & Roles

- Add `aria-label` to all icon-only buttons (NavBar, GameHUD, speed controls)
- Add `role="status"` + `aria-live="polite"` to combat log and loot notifications
- Add `aria-disabled` to locked/inactive buttons
- Add `<label>` to hero recruitment input
- Add `aria-expanded` to collapsible sections (RaidSelectorModal)

### 4D. Focus Management

- Add focus trap to `ModalOverlay.jsx` (trap tab within modal, restore focus on close)
- Add `inert` attribute to background content while modal is open
- Auto-focus first interactive element on modal open
- Add visible `:focus-visible` outline styles in CSS

### 4E. Keyboard Navigation

- Add `tabIndex` and `keydown` handlers to SkillTreeScreen nodes (arrow keys to navigate, Enter to unlock)
- Add keyboard shortcuts for game speed control
- Ensure all interactive elements are reachable via Tab

### Phase 4 Verification

1. `npm run build` — no build errors
2. `npm run lint` — no new lint warnings
3. Manual test: Tab through full UI, test with screen reader, check contrast ratios with dev tools

---

## Phase 5: Player Experience

### 5A. Save Indicator

- Add a small "Saved" indicator to `GameHUD.jsx` showing timestamp of last save
- Flash briefly on each save, then fade to subtle text
- Show warning icon if save failed (integrates with Phase 1B error handling)

### 5B. Error Toasts

- Create `src/components/ui/Toast.jsx` — pixel-styled notification component
- Create a toast queue in the store (or lightweight context)
- Trigger toasts for: insufficient gold, inventory full, prerequisites not met, save failure
- Auto-dismiss after 3 seconds, stackable

### 5C. In-Game Encyclopedia

- Create `src/components/EncyclopediaScreen.jsx` — accessible from NavBar
- Sections: Combat (initiative, dodge, damage), Equipment (rarities, affixes), Skills (tiers, prerequisites), Dungeons (scaling, elites), Raids, Homestead
- Searchable/filterable
- Content sourced from game constants where possible (self-documenting)
- Design philosophy: discovery-based learning, this is a **reference** not a tutorial

### 5D. Contextual Help Tooltips

- Create reusable `src/components/ui/HelpTooltip.jsx`
- Add small `?` icon buttons next to complex UI elements
- Click/hover expands a brief explanation
- Locations: skill tree header, equipment comparison, dodge/speed stats, homestead bonuses, shop pricing

### Phase 5 Verification

1. `npm run build` — no build errors
2. `npm run lint` — no new lint warnings
3. Manual test: verify save indicator updates, trigger error toasts, browse encyclopedia, check tooltips

---

## Phase 6: Polish

### 6A. Unicode → SVG Replacements

Replace 6 remaining Unicode symbols with pixel-art SVG icons:

| Location | Unicode | Replacement |
|----------|---------|-------------|
| `EquipmentScreen.jsx:51` | Star character | `StarIcon` |
| `EquipmentScreen.jsx:143` | Up triangle | `UpArrowIcon` |
| `EquipmentScreen.jsx:145` | Four-pointed star | `SparkleIcon` |
| `RaidSelectorModal.jsx:230` | Up/down triangles | `ChevronUpIcon` / `ChevronDownIcon` |
| `StatsScreen.jsx:329` | Checkmark | `CheckIcon` |
| `ui/EquipmentTooltip.jsx:96` | Up/down triangles | `UpArrowIcon` / `DownArrowIcon` |

Add new icons to `src/components/icons/ui.jsx` if they don't already exist. Follow the 16x16 grid pixel art style documented in `CLAUDE.md`.

### 6B. Inline Style Cleanup

Convert avoidable inline styles to Tailwind utilities in:
- `RaidSelectorModal.jsx` (18 instances)
- `GameLayout.jsx` (12 instances)
- `BestiaryScreen.jsx` (10 instances)

Keep inline styles for truly dynamic values (runtime colors, calculated positions).

### 6C. Canvas Skill Sprites (51 missing)

Add canvas sprite implementations to `src/canvas/sprites/SkillSprites.js` for the 51 skills currently falling back to `power_strike`.

Organized by class:
| Class | Missing Count |
|-------|--------------|
| Cleric | 7 |
| Druid | 7 |
| Knight | 7 |
| Mage | 7 |
| Necromancer | 7 |
| Paladin | 8 |
| Ranger | 7 |
| Rogue | 6 |
| Shaman | 8 |
| Warrior | 8 |

### Phase 6 Verification

1. `npm run build` — no build errors
2. `npm run lint` — no new lint warnings
3. Visual check: all replaced icons render correctly, canvas sprites display for all skills

---

## Usage Notes

- **Execute phases in order** — each phase builds on the previous
- **Each phase can be given to an independent agent** — all necessary context (file paths, line numbers, approach) is included
- **Bump version after each phase** — version is in `src/components/GameHUD.jsx` header
- **Line numbers are approximate** — they were accurate at time of audit but may shift after Phase 2 file splits
- **After Phase 2**, all file path references in later phases should be updated to reflect the new split file structure
