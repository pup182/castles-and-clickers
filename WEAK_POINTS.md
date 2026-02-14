# Castles & Clickers — Weak Points Analysis

**Version:** v0.1.15 | **Date:** February 2026

This document catalogs every verified weakness in the game across code quality, game balance, player experience, and accessibility. Each finding includes exact file locations, code evidence, and severity ratings.

---

## Table of Contents

1. [Error Handling & Resilience](#1-error-handling--resilience)
2. [Shop System](#2-shop-system)
3. [Gold Economy](#3-gold-economy)
4. [Progression Pacing](#4-progression-pacing)
5. [Class & Combat Balance](#5-class--combat-balance)
6. [Technical Debt](#6-technical-debt)
7. [Accessibility](#7-accessibility)
8. [Player Experience Gaps](#8-player-experience-gaps)
9. [Minor Polish Issues](#9-minor-polish-issues)
10. [What's Working Well](#10-whats-working-well)

---

## 1. Error Handling & Resilience

**Severity: Critical** → **Partially resolved in v0.1.17**

~~The game has almost no defensive error handling.~~ Core error handling was added in v0.1.17: ErrorBoundary, localStorage protection, save flush on unload, canvas null guards. Some items remain open.

### 1.1 ~~No React Error Boundary~~ — **FIXED (v0.1.17)**

~~Neither `App.jsx` nor `main.jsx` wraps the component tree in an ErrorBoundary.~~ ErrorBoundary now wraps `<GameLayout />` in `App.jsx`.

### 1.2 Only Two Try-Catch Blocks in the Entire Codebase

| File | Lines | What It Protects |
|------|-------|------------------|
| `src/hooks/useGameLoop.js` | 257–261 | Game tick execution (try-finally, no catch — exceptions are silently swallowed, game loop stops) |
| `src/canvas/SpriteManager.js` | 45–71 | SVG-to-bitmap rendering (promise rejection, but no application-level handler) |

Everything else — combat calculations, equipment generation, state persistence, canvas rendering — runs without protection.

### 1.3 ~~Unprotected localStorage~~ — **FIXED (v0.1.17)**

~~No try-catch around localStorage calls.~~ `throttledStorage` now has try-catch protection and a `flush()` method. `beforeunload` handler flushes pending saves on page close.

### 1.4 ~~Throttled Saves Risk Data Loss~~ — **FIXED (v0.1.17)**

~~No immediate save on critical events.~~ All critical game events (level-ups, rare drops, skill unlocks) now call `throttledStorage.flush()` for immediate saves.

### 1.5 ~~Canvas Null Checks Missing~~ — **FIXED (v0.1.17)**

~~Multiple canvas context acquisitions happen without null checks.~~ Canvas `getContext('2d')` null guards added to 7 locations across canvas files.

### 1.6 NaN Propagation Risks

- `src/data/equipment.js` line 708: If `getEquipmentByTier(tier)` returns an empty array, `possibleItems[0]` is undefined → `Object.entries(template.baseStats)` throws.
- `src/data/equipment.js` line 736: If `RARITY[rarity]` is undefined, `rarityData.multiplier` is undefined → NaN propagates into item stats.
- `src/hooks/useCombat.js` line 92: If `dungeon.level` is undefined, `Math.floor(100 * dungeon.level * goldMultiplier)` produces NaN gold.

### 1.7 Grid Access Without Bounds Check

`src/canvas/CanvasDungeonView.jsx` line 120:

```javascript
const tile = grid[y][x];  // Direct access, no optional chaining
```

If `grid[y]` is undefined (malformed dungeon data), this crashes with "Cannot read property 'x' of undefined." Compare with `TerrainLayer.js` line 128 which correctly uses `this.grid[y]?.[x]`.

---

## 2. Shop System

**Severity: Major**

The shop becomes irrelevant by mid-game and has no late-game purpose.

### 2.1 Forced Rarity Cap

`src/store/gameStore.js` lines 1388–1399:

```javascript
if (['rare', 'epic', 'legendary'].includes(item.rarity)) {
  item.rarity = Math.random() < 0.6 ? 'common' : 'uncommon';
  const rarityMult = item.rarity === 'common' ? 1.0 : 1.3;
  // Recalculate stats for lower rarity...
}
```

Any item generated above Uncommon is forcibly downgraded. This means the shop **can never sell Rare, Epic, or Legendary items**, regardless of player progression.

### 2.2 Pricing Doesn't Scale

- Shop price = 1.75× sell value (line 1403)
- Only 4 items per refresh
- 4-hour auto-refresh timer
- Manual refresh costs a flat 50 gold (line 702) — trivial by dungeon 10

### 2.3 Outpaced by Dungeon Loot

By dungeon level 10, the rarity distribution for dungeon drops shifts dramatically:

| Rarity | D1 Drop Rate | D10 Drop Rate | D20 Drop Rate |
|--------|-------------|---------------|---------------|
| Common | ~50% | ~20% | ~5% |
| Uncommon | ~25% | ~35% | ~25% |
| Rare | ~15% | ~25% | ~35% |
| Epic | ~8% | ~15% | ~25% |
| Legendary | ~2% | ~5% | ~10% |

The shop's Common/Uncommon-only inventory becomes useless once dungeon drops routinely produce Rare+ gear. Elite mobs (which start at dungeon 10) guarantee drops, accelerating this further.

### 2.4 What's Missing

- No rarity scaling with dungeon progress
- No rotating "featured item" slot with higher rarity
- No consumables, scrolls, or non-equipment purchases
- No bulk buy/sell interface
- No shop specialization or themed inventories

---

## 3. Gold Economy

**Severity: Major**

The economy is well-balanced through mid-game but has a significant late-game sink problem.

### 3.1 Income Sources

| Source | Formula | Example (D15) | Example (D30) |
|--------|---------|---------------|---------------|
| Monster kills | Base gold × 1.09^(level-1) × (1 + Treasury bonus) | ~80 gold/kill | ~400 gold/kill |
| Dungeon completion | 100 × level × (1 + goldFind) | 1,950 gold | 6,000 gold |
| Equipment sells | Sum of stats × rarity multiplier | ~50–200 gold | ~200–800 gold |
| **Total per clear** | | **~5,400 gold** | **~46,000 gold** |

### 3.2 Gold Sinks

| Sink | Formula | Scaling |
|------|---------|---------|
| Homestead upgrades | baseCost × 2.5^level (or 3.0^ for Academy) | Exponential |
| Hero recruitment | 50 + (level × 30) + equipment + traits | Linear |
| Skill respec | 50 × 2^(usedSkillPoints - 1) | Exponential |
| Shop purchases | 1.75× sell value | Flat |
| Shop refresh | 50 gold | Flat |

### 3.3 Total Homestead Cost to Max

| Building | Max Level | Total Gold to Max |
|----------|-----------|-------------------|
| Barracks (+5% HP/lv) | 10 | 635,064 |
| Armory (+5% ATK/lv) | 10 | 635,064 |
| Fortress (+5% DEF/lv) | 10 | 635,064 |
| Training Grounds (+10% XP/lv) | 10 | 952,589 |
| Treasury (+10% Gold/lv) | 10 | 952,589 |
| Academy (-1 CD/lv) | 5 | 36,300 |
| Infirmary (+2% heal/lv) | 5 | 16,109 |
| **Total** | | **~4,263,779 gold** |

### 3.4 Economy By Stage

| Stage | Income/Clear | Typical Upgrade Cost | Clears to Afford | State |
|-------|-------------|---------------------|-------------------|-------|
| D5 (Early) | ~1,100 | 100–250 | 0.1–0.2 | **Surplus** |
| D15 (Mid) | ~5,400 | 3,000–5,000 | 0.6–1 | **Balanced** |
| D25 (Late) | ~23,400 | 60,000+ | 2.5–4 | **Deficit** |
| D30 (Endgame) | ~46,000 | 300,000+ | 6–8 | **Severe grind** |

### 3.5 The Post-Homestead Void

Once all 7 buildings are maxed (~30 dungeon clears at D30), gold has **no remaining sink**:

- Shop purchases are worthless (Common/Uncommon only)
- Recruitment costs are trivial compared to income
- Skill respecs are the only scaling cost, but players rarely respec repeatedly
- No consumables, cosmetics, or prestige system to absorb excess

**Result:** Gold piles up infinitely with nothing to spend it on.

---

## 4. Progression Pacing

**Severity: Major**

### 4.1 XP Curve

Formula: `xpForLevel(level) = floor(100 × 1.25^(level-1))`

| Level | XP Required | Cumulative XP |
|-------|------------|---------------|
| 1→2 | 100 | 100 |
| 5→6 | 244 | 820 |
| 10→11 | 745 | 3,323 |
| 15→16 | 2,273 | 10,964 |
| 20→21 | 6,938 | 34,287 |
| 25→26 | 21,175 | 105,469 |
| 30→31 | 64,623 | 322,705 |

The 1.25× multiplier creates a steep wall after level 20. Getting from level 20 to 30 requires ~288,000 XP — nearly 10× the total needed to reach level 10.

### 4.2 Skill Points Come Slowly

~~Formula: `calculateSkillPoints(level) = floor(level / 3)`~~ **Fixed in v0.1.20.**

Formula: `level < 2 → 0; level < 3 → 1; else 1 + floor(level / 3)`

- First skill point at level 2, second at level 3
- Heroes no longer auto-unlock a starter skill — players choose their first skill
- 5 points at level 12
- 11 points at level 30 (max meaningful count)
- **17 skills available per class**, but only 11 can be unlocked at level 30

### 4.3 Party Size Milestones Are Sparse

| Party Size | Unlock Condition | Approx. Playtime |
|-----------|-----------------|-------------------|
| 4 heroes | Default | 0 min |
| 5 heroes | Clear dungeon level 10 | ~90 min |
| 6 heroes | Clear dungeon level 20 | ~4+ hours |

Only 2 party expansion moments across 30 dungeon levels. Between dungeon 10 and 20, there's no party-related progression for potentially hours of play.

### 4.4 Elite Mob Difficulty Spike

~~Elite mobs begin spawning at dungeon level 10~~ **Changed to D8 in v0.1.20.** Elite mobs begin spawning at dungeon level 8 with:
- 1.5× HP, Attack, Defense over normal monsters
- 2× XP and Gold rewards
- Special affixes (+25–50% damage, lifesteal, reflect damage)

This represents a sharp difficulty jump that can wall players who haven't invested in gear upgrades.

### 4.5 Raid Unlock Gaps

| Raid | Unlock Level | Gap from Previous |
|------|-------------|-------------------|
| Sunken Temple | D12 | — |
| Shadowkeep | D18 | 6 levels |
| Abyssal Citadel | D24 | 6 levels |
| World's End | D30 | 6 levels |
| Eternal Nexus | D35 | 5 levels (beyond dungeon cap?) |

Raids are evenly spaced but each 6-level gap represents significant grind time at higher levels. The Eternal Nexus at D35 may be unreachable if dungeons cap at 30.

### 4.6 Respec Costs Lock In Builds

~~Exponential formula `50 × 2^(n-1)`.~~ **Fixed in v0.1.20 — now linear: `250 × usedSkillPoints`.**

| Skill Points Used | Old Cost | New Cost (v0.1.20) |
|-------------------|----------|---------------------|
| 1 | 50 gold | 250 gold |
| 3 | 200 gold | 750 gold |
| 5 | 800 gold | 1,250 gold |
| 7 | 3,200 gold | 1,750 gold |
| 10 | 25,600 gold | 2,500 gold |

Linear scaling encourages build experimentation while still being meaningful early on.

---

## 5. Class & Combat Balance

**Severity: Medium**

### 5.1 Speed Stat Dominance

Speed controls three separate mechanics, making it disproportionately powerful:

| Mechanic | Formula | Impact |
|----------|---------|--------|
| Dodge chance | (speed - 4) × 6% (cap 70%) | Survivability |
| Double attack | speedDiff × 3% (cap 30%) | DPS multiplier |
| Move distance | min(3, 1 + floor(speed/8)) | Positioning |

A Rogue (speed 12) vs a Knight (speed 3) gets:
- 48% base dodge
- Up to 27% double attack chance
- 2 tiles movement vs 1

This creates a DPS hierarchy where fast classes significantly outperform slow ones, even accounting for the slow class's higher raw stats.

### 5.2 Class Speed Spread

| Class | Base Speed | Role | Dodge at Base |
|-------|-----------|------|---------------|
| Knight | 3 | Tank | 0% |
| Warrior | 5 | Tank | 6% |
| Paladin | 4 | Tank | 0% |
| Cleric | 5 | Healer | 6% |
| Druid | 6 | Healer | 12% |
| Shaman | 7 | Healer | 18% |
| Necromancer | 4 | DPS | 0% |
| Mage | 6 | DPS | 12% |
| Ranger | 8 | DPS | 24% |
| Rogue | 12 | DPS | 48% |

Knights and Paladins can **never dodge** at base speed. Necromancers — a DPS class — also can't dodge, creating a glass cannon without any evasion safety net.

### 5.3 Mage Range Advantage

Mages have range 4 (highest) with AoE damage skills. Combined with speed 6 (decent dodge) and 18 base attack (highest DPS base), they can deal multi-target damage from safety. No other class combines this range + AoE + raw attack.

### 5.4 Tank Damage Irrelevance

All tanks deal low damage by design, but the game's idle nature means combat resolves automatically. Tanks that can't contribute damage just extend fight duration without meaningfully changing outcomes. Paladin's hybrid heal helps, but Knight and Warrior become pure HP sponges with no secondary value.

---

## 6. Technical Debt

**Severity: Major (maintainability), Low (player-facing)**

### 6.1 Oversized Files

| File | Lines | Responsibility | Status |
|------|-------|----------------|--------|
| ~~`src/hooks/useCombat.js`~~ | ~~3,508~~ → 560 | ~~Combat tick, damage calc, loot, status effects, death handling, XP/gold, viewport — all in one function~~ | **FIXED in v0.1.18** — Split into 6 files (orchestrator + 5 game modules) |
| ~~`src/store/gameStore.js`~~ | ~~2,929~~ → 218 | ~~46+ action methods, state init, validation, helpers, persistence — single Zustand store~~ | **FIXED in v0.1.19** — Split into 5 slices + 5 helpers |
| `src/components/icons/skills.jsx` | 2,697 | 143 SVG icon component exports |
| `src/game/skillEngine.js` | 2,067 | Skill execution, passive effects (185-line switch), AI selection, effect handlers |
| `src/data/skillTrees.js` | 1,930 | Skill tree definitions (data file — acceptable) |
| `src/canvas/sprites/MonsterSprites.js` | 1,701 | Monster sprite data |
| `src/game/mazeGenerator.js` | 1,687 | Maze generation + A* pathfinding |
| `src/game/combatSimulator.js` | 1,657 | Balance testing tool |

The top 3 files (`useCombat.js`, `gameStore.js`, `skillEngine.js`) each contain multiple concerns that should be separate modules. `useCombat.js` in particular has a single function (`handleCombatTick`) spanning ~3,250 lines.

### 6.2 Splitting Opportunities

**useCombat.js** — **COMPLETED (v0.1.18)**. Split into:
- `src/hooks/useCombat.js` — Thin orchestrator (~560 lines)
- `src/game/combatHelpers.js` — Pure utilities, targeting, death handling (~210 lines)
- `src/game/combatDamageResolution.js` — Basic attack damage + on-hit/kill/crit effects (~1100 lines)
- `src/game/combatSkillExecution.js` — Hero skill and monster ability execution (~530 lines)
- `src/game/combatStatusEffects.js` — DOT/stun/buff per-turn processing (~310 lines)
- `src/game/combatMovement.js` — A* pathfinding and directional movement (~140 lines)

All functions share a mutable `ctx` object passed from the orchestrator. Game files never import `useGameStore` directly — store actions are wrapped as callbacks on `ctx`.

**gameStore.js** — **COMPLETED (v0.1.19)**. Split into:
- `src/store/gameStore.js` — Slim composition file, persist config, resetGame (~218 lines)
- `src/store/slices/heroSlice.js` — Hero CRUD, bench, tavern, XP, skills (~480 lines)
- `src/store/slices/inventorySlice.js` — Inventory, equipment, consumables, uniques, loot (~530 lines)
- `src/store/slices/combatSlice.js` — Combat state, heroHp, combatLog (~170 lines)
- `src/store/slices/dungeonSlice.js` — Dungeon lifecycle, raids, ascension (~330 lines)
- `src/store/slices/economySlice.js` — Gold, homestead, shop, stats, game speed (~310 lines)
- `src/store/helpers/throttledStorage.js` — Throttled localStorage IIFE (~60 lines)
- `src/store/helpers/statCalculator.js` — calculateHeroStats, caches, xpForLevel (~210 lines)
- `src/store/helpers/itemScoring.js` — STAT_PRIORITIES, calculateItemScore, calculateSellValue (~40 lines)
- `src/store/helpers/heroGenerator.js` — Name lists, generateTavernHero, createHero (~170 lines)
- `src/store/helpers/validation.js` — validateState, validationMiddleware (~85 lines)

All imports remain through `gameStore.js` — zero consumer changes required.

**skillEngine.js** could split:
- `skillExecution.js` — executeSkillAbility refactored
- `passiveEffects.js` — 185-line switch → handler map
- `skillAI.js` — chooseBestSkill, selection logic

### 6.3 Magic Numbers

Balance-critical values are hardcoded throughout the codebase rather than centralized:

| Value | Appears | Purpose |
|-------|---------|---------|
| 0.25 | 20+ times | HP threshold (execute range, critical health) |
| 0.50 | 15+ times | HP threshold (low health, heal triggers) |
| 0.06 | 1 time | Dodge chance per speed point |
| 0.05 | 1 time | Dodge bonus per speed advantage |
| 0.03 | 1 time | Double attack per speed advantage |
| 0.70 | 1 time | Dodge cap |
| 0.30 | 1 time | Double attack cap |
| 1.5 | 2 times | Crit damage multiplier |
| 0.85/0.30 | 1 time | Damage variance range |
| 100 | 70+ times | Percentage divisor |

These should live in a centralized `balanceConstants.js` for easy tuning.

### 6.4 Zero Test Coverage

No test files exist (`*.test.*`, `*.spec.*`, `__tests__/`). No jest or vitest configuration. The combat simulator (`window.runSimulation()`) provides manual balance testing but no automated regression safety.

### 6.5 Console Logging in Production

| File | Count | Type |
|------|-------|------|
| `src/game/combatSimulator.js` | 60+ | Intentional simulation output (ships to production) |
| `src/store/gameStore.js` | 3 | Validation warnings |
| `src/hooks/useDungeon.js` | 1 | Error log |
| `src/game/statusEngine.js` | 1 | Warning |
| `src/components/icons/index.jsx` | 1 | Missing icon warning |

The combat simulator's 60+ logs are intentional dev tooling but shouldn't ship in production builds.

### 6.6 Unused TypeScript Packages

`@types/react` and `@types/react-dom` are installed in `package.json` but the project is pure JavaScript with zero `.ts`/`.tsx` files and no `tsconfig.json`.

### 6.7 No Circular Dependencies

Architecture is clean — dependencies flow one-way: `components/ → hooks/ → game/ → data/` and `components/ → store/ → data/`. No circular imports detected.

---

## 7. Accessibility

**Severity: Critical (compliance), Medium (player impact for this genre)**

### 7.1 Zero ARIA Support

No `aria-*` attributes found across any component file. Screen reader users cannot access semantic information about interactive elements, modals, or dynamic content.

### 7.2 Keyboard Navigation Gaps

**Working:**
- Escape key closes modals (`ModalOverlay.jsx` lines 6–13)
- Native button focus works

**Missing:**
- No tabIndex management for complex components
- No visible `:focus-visible` styling in CSS
- Skill tree nodes not keyboard navigable
- Canvas dungeon view has no keyboard alternative
- No keyboard shortcuts for game speed, dungeon selection, or navigation
- No roving tabindex pattern anywhere

### 7.3 Focus Management in Modals

- No focus trap — focus can escape to background content
- No focus restoration — closing a modal returns focus to body, not the trigger
- No `inert` attribute on background while modals are open
- No auto-focus on modal open

### 7.4 Color Contrast Failures

| Element | Location | Ratio | WCAG AA (4.5:1) |
|---------|----------|-------|------------------|
| `.pixel-label` | index.css:224 | ~3.9:1 | Fail |
| `.pixel-speed-btn` | index.css:305 | ~3.2:1 | Fail |
| Level text (gray-400 on gray-900) | PartyStatus.jsx | ~3.5:1 | Fail |
| Dimmed stats | EquipmentScreen.jsx | <4.5:1 | Fail |
| Secondary stats | StatsScreen.jsx | <4.5:1 | Fail |

The global `--color-text-dim: #a0a0b0` value is used throughout and likely fails contrast on dark backgrounds.

### 7.5 No Motion Safety

Zero instances of `@media (prefers-reduced-motion)` in the codebase. Problematic animations include:

| Animation | Duration | Risk |
|-----------|----------|------|
| `animate-screen-shake` | 0.4s | Vestibular disorder trigger |
| `animate-pixel-blink` | 1s infinite | Flashing content |
| `unique-glow-pulse` | 2.5s infinite | Repetitive motion |
| `skill-glow-pulse` | 2.5s infinite | Repetitive motion |
| `animate-damage-flash` | 0.3s | Flashing content |

### 7.6 Screen Reader Blind Spots

- Icon-only buttons lack `aria-label`
- Combat log updates have no `aria-live` region
- Loot notifications have no `role="status"`
- Hero recruitment input has no associated `<label>`
- Buff/debuff icons rely solely on `title` tooltips

---

## 8. Player Experience Gaps

**Severity: Medium**

### 8.1 No Onboarding or Tutorial

No first-time player guidance exists:
- No welcome tutorial explaining the game loop
- No contextual help for combat, skills, equipment, or raids
- No feature unlock explanations
- Limited guidance exists via NavBar badges ("!" and "NEW") and locked feature title text

Players must discover mechanics entirely through trial and error.

### 8.2 No Save Feedback

- Auto-save runs on a 2-second throttle, completely invisible to the player
- No "Game saved" indicator, timestamp, or confirmation
- `lastSaveTime` exists in state but is not displayed anywhere in the UI
- No warning when the game is in an unsaved state
- No manual save/export option

### 8.3 Silent Error States

Most failure conditions produce no user-facing feedback:
- Insufficient gold for purchases — silently rejected
- Full inventory — only shows red stat text
- Skill prerequisites not met — button disabled with no explanation
- Failed equipment generation — silently skipped
- localStorage write failure — completely invisible

### 8.4 No Loading States

No loading spinners, skeleton screens, or progress indicators for:
- Initial game startup (offline progress calculation)
- Dungeon generation
- Raid state transitions
- Large state calculations

If any async operation takes time, the UI freezes with no feedback.

---

## 9. Minor Polish Issues

**Severity: Low**

### 9.1 Unicode Symbols Instead of SVG Icons

6 instances remain where Unicode symbols are used instead of the pixel-art SVG system:

| File | Line | Symbol | Context |
|------|------|--------|---------|
| `EquipmentScreen.jsx` | 51 | `★` | Unique power indicator |
| `EquipmentScreen.jsx` | 143 | `▲` | "Item is better" indicator |
| `EquipmentScreen.jsx` | 145 | `✦` | Affix indicator |
| `RaidSelectorModal.jsx` | 230 | `▲▼` | Expand/collapse toggle |
| `StatsScreen.jsx` | 329 | `✓` | Milestone completion |
| `ui/EquipmentTooltip.jsx` | 96 | `▲▼` | Upgrade/downgrade (has text fallback) |

### 9.2 Inline Style Inconsistency

Most components correctly use `pixel-panel` classes + Tailwind, but some use inline styles:

| File | Inline Style Count |
|------|-------------------|
| `RaidSelectorModal.jsx` | 18 |
| `GameLayout.jsx` | 12 |
| `BestiaryScreen.jsx` | 10 |
| `DungeonMap.jsx` | 8 |
| `CurrentZoneIndicator.jsx` | 7 |

Most inline styles are for dynamic values (tier colors, damage numbers) which is acceptable. A few could be converted to Tailwind utilities.

### 9.3 Canvas Skill Icon Gap

All 170 skills have SVG icons (100% coverage), but only 119 have canvas-optimized sprite implementations. The remaining 51 fall back to a generic `power_strike` sprite in the canvas dungeon view. This is a visual-only issue — functionality is unaffected.

---

## 10. What's Working Well

For context, these systems are solid and should be preserved:

| System | Why It Works |
|--------|-------------|
| **Combat engine** | Initiative-based turns, A* pathfinding, status effects — complex and functional |
| **Canvas renderer** | 4-layer architecture, adaptive FPS (60→30), terrain caching, excellent performance |
| **Skill system** | 170 skills, 58 passive types, 26 handler functions, zero dead code |
| **Unique items** | 37 dedicated icons, 6 CSS animations, celebration modal, collection screen |
| **SVG icon library** | 143+ custom 16×16 pixel-art icons with consistent style |
| **Mobile support** | Media queries, hamburger menu, touch handlers, responsive modals, 2-tap skill tree |
| **State management** | Smart stat caching with O(1) invalidation, batched updates, imperative access |
| **Architecture** | Clean one-way dependency flow, no circular imports, well-separated concerns at the module level |
| **Affix system** | Prefix/suffix generation, stat modification, visual display — complete pipeline |
| **Monster scaling** | Exponential difficulty with elite affixes creates natural progression gates |

---

## Priority Matrix

| # | Issue | Severity | Player Impact | Effort |
|---|-------|----------|---------------|--------|
| 1 | ~~No ErrorBoundary~~ | ~~Critical~~ | ~~White screen crashes~~ | **DONE (v0.1.17)** |
| 2 | ~~Unprotected localStorage~~ | ~~Critical~~ | ~~Silent data loss~~ | **DONE (v0.1.17)** |
| 3 | ~~No save flush on page unload~~ | ~~Critical~~ | ~~Lost progress~~ | **DONE (v0.1.17)** |
| 4 | Shop rarity cap | Major | Entire system irrelevant | Medium |
| 5 | Post-homestead gold void | Major | No late-game progression | Medium |
| 6 | Slow early skill unlocks | Major | New player retention | Low |
| 7 | Speed stat dominance | Major | Class balance | Medium |
| 8 | No onboarding | Medium | New player confusion | High |
| 9 | Accessibility (ARIA, keyboard) | Medium–Critical | Excludes disabled players | High |
| 10 | ~~File splitting (useCombat + gameStore)~~ **DONE** | ~~Major~~ | ~~Maintainability~~ | **DONE (v0.1.18 + v0.1.19)** |
| 11 | Magic numbers | Medium | Balance tuning difficulty | Medium |
| 12 | Unicode → SVG icons | Low | Art consistency | Low |
| 13 | Zero test coverage | Major | Regression risk | Very High |
| 14 | Motion safety | Medium | Vestibular/seizure risk | Low |
| 15 | Console logs in production | Low | Performance/noise | Low |
