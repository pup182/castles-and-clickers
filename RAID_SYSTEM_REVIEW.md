# Raid, World Boss & Unique Items System Review

Comprehensive review of the endgame content systems, their interactions, and recommended improvements.

**Last Updated**: Session complete
**Status**: Phase 1-3 COMPLETE, Phase 4 remaining items need design decisions

---

## Work Completed This Session

### Dead Code Removal ✅
- Deleted 3 obsolete hub-based components (RaidHubView, RaidWingView, RaidProgressBar)
- Cleaned up unused functions from useRaid.js, useDungeon.js, raids.js, GameLayout.jsx
- See [Dead Code Removed](#dead-code-removed) for full list

### Bug Fixes ✅
- Fixed `abandonDungeon()` not clearing raid state (gameStore.js)
- See [Bugs Fixed](#bugs-fixed) for details

### Phase 1 Polish Items
| Item | Status | Details |
|------|--------|---------|
| 1.1 Replace emoji icons with pixel art | ✅ DONE | 20 icons added to ItemIcon.jsx with EQUIPMENT_ICONS mapping |
| 1.2 Add "NEW" badge for raids | ✅ DONE | Added `raidsSeen` to featureUnlocks, badge shows at D12 |
| 1.3 Replace checkmark emoji | ✅ DONE | RaidSelectorModal.jsx, BestiaryScreen.jsx |
| 1.4 Rename "Wing Bosses" | ✅ DONE | Now called "Guardians" |
| 1.5 Consolidate WorldBossCard | ✅ DONE | Kept both (different purposes), fixed emoji |
| 1.6 Add difficulty/length metadata | ✅ DONE | Added to all 5 raids in raids.js |
| 1.7 Add Resume Raid button | ✅ DONE | Prominent button with progress in RaidSelectorModal |

### Files Modified This Session
- `src/store/gameStore.js` - Added raidsSeen, fixed abandonDungeon
- `src/components/GameLayout.jsx` - Removed dead code, mark raidsSeen on open, added UniqueCollectionScreen modal
- `src/components/NavBar.jsx` - Added raidsNewlyAvailable badge logic, "Uniques" button, raid-in-progress badge
- `src/components/RaidSelectorModal.jsx` - CheckIcon, "Guardians" rename, Resume button, difficulty display, direct Enter button
- `src/components/BestiaryScreen.jsx` - CheckIcon fix
- `src/components/icons/ItemIcon.jsx` - Added 20 unique item pixel art icons + EQUIPMENT_ICONS mapping
- `src/components/DungeonMap.jsx` - Added unique drop indicators, raid teaser at D10-11
- `src/components/UniqueCollectionScreen.jsx` - NEW: Full collection screen with progress tracking and detail panel
- `src/components/EquipmentScreen.jsx` - Added unique item highlighting, tooltips with power descriptions
- `src/hooks/useRaid.js` - Removed dead code
- `src/hooks/useDungeon.js` - Removed unused variables
- `src/data/raids.js` - Removed unused helpers, added difficulty/estimatedRooms/recommendedLevel metadata

### Files Deleted This Session
- `src/components/RaidHubView.jsx`
- `src/components/RaidWingView.jsx`
- `src/components/RaidProgressBar.jsx`

---

## Table of Contents

1. [Current State Summary](#current-state-summary)
2. [Dead Code Removed](#dead-code-removed)
3. [Bugs Fixed](#bugs-fixed)
4. [CTA & Discoverability Issues](#cta--discoverability-issues)
5. [UI/UX Friction](#uiux-friction)
6. [Unique Items Issues](#unique-items-issues)
7. [World Boss Issues](#world-boss-issues)
8. [System Interaction Problems](#system-interaction-problems)
9. [Terminology & Style Issues](#terminology--style-issues)
10. [Enhancement Recommendations](#enhancement-recommendations)
11. [Implementation Priority](#implementation-priority)

---

## Current State Summary

### Raids
- **Location**: Accessed via NavBar "Raids" button (unlocks at dungeon 12)
- **Flow**: RaidSelectorModal → enterRaid() → continuous dungeon with multiple bosses
- **Structure**: Wing bosses throughout dungeon → final boss at end
- **Rewards**: Each boss has drop table with unique items and guaranteed rarity gear

### World Bosses
- **Location**: Appear at dungeon levels 5, 10, 15, 20, 25, 30
- **Flow**: Part of normal dungeon progression
- **Rewards**: Levels 15+ drop unique legendary items

### Unique Items
- **Storage**: `ownedUniques[]` tracks collected template IDs
- **Display**: Celebration popup on drop, shown in RaidSelectorModal collection progress
- **Problem**: No dedicated viewing/management UI

---

## Dead Code Removed

The following obsolete hub-based navigation code was removed:

### Deleted Files
- [x] `src/components/RaidHubView.jsx` - Hub room UI (obsolete)
- [x] `src/components/RaidWingView.jsx` - Wing progress UI (obsolete)
- [x] `src/components/RaidProgressBar.jsx` - Hub progress bar (obsolete)

### Removed from GameLayout.jsx
- [x] `import RaidHubView from './RaidHubView'`
- [x] `import RaidWingView from './RaidWingView'`
- [x] `const startRaid = useGameStore(state => state.startRaid)` - never existed
- [x] `handleStartRaid` callback - never called
- [x] `onStart={handleStartRaid}` prop on RaidSelectorModal

### Removed from raids.js
- [x] `getRaidWingCount()` - unused helper
- [x] `areAllWingBossesDefeated()` - unused helper
- [x] `getWingUniqueDrops()` - unused legacy helper
- [x] Updated file header comment (was "hub-based navigation")

### Removed from useRaid.js
- [x] `enterWing` action reference (never implemented)
- [x] `enterFinalBoss` action reference (never implemented)
- [x] `returnToHub` action reference (never implemented)
- [x] `currentWingBoss` computed value (used non-existent state)
- [x] `isInHub`, `isInWing`, `isInFinalBoss` location helpers
- [x] `wingProgress` computed value
- [x] `canEnterWing`, `canEnterFinal` helpers

### Removed from useDungeon.js
- [x] Unused `raidState` destructuring (line 45)
- [x] Unused `raidState` fetch (line 374)
- [x] Unused `aliveRegularBosses` variable

---

## Bugs Fixed

### Critical: abandonDungeon didn't clear raid state
**File**: `src/store/gameStore.js`
**Problem**: When abandoning a raid dungeon, `raidState` remained active, causing state inconsistency.
**Fix**: Added raid cleanup to `abandonDungeon()`:
```js
// Clear raid state if abandoning a raid
const raidCleanup = raidState.active ? {
  raidState: {
    active: false,
    raidId: null,
    defeatedWingBosses: [],
    heroHpSnapshot: {},
  },
} : {};
```

---

## CTA & Discoverability Issues

### Issue 1: Silent Raid Unlock ✅ RESOLVED
**Location**: `src/components/NavBar.jsx:107-113`
**Problem**: When raids unlock at dungeon 12, there's no "NEW" badge like homestead gets.
**Solution Applied**:
- Added `raidsSeen: false` to `featureUnlocks` in gameStore.js
- Added `raidsNewlyAvailable` check in NavBar.jsx
- Badge shows "NEW" when `highestDungeonCleared >= 12 && !featureUnlocks?.raidsSeen`
- `raidsSeen` marked true when raids modal opened (GameLayout.jsx)

### Issue 2: No Pre-Unlock Teaser
**Problem**: Players grinding towards dungeon 12 have zero awareness raids exist.
**Impact**: No anticipation building, feature feels sudden.
**Solution**: Show "Raids unlock at Level 12" preview in DungeonMap around level 10-11.

### Issue 3: No Urgency/Status Indicators on Raids Button
**Problem**: Raids button never shows badges for:
- First available raid
- Uncollected uniques available
- Raid currently in progress
**Solution**: Add contextual badges based on state.

### Issue 4: No World Boss Level Indicators
**Location**: `src/components/DungeonMap.jsx`
**Problem**: World boss presence is subtle - small mascot in corner.
**Impact**: Players might not realize level 15 has a special boss with unique loot.
**Solution**: Add prominent "WORLD BOSS" indicator on boss levels.

---

## UI/UX Friction

### Issue 5: Two Clicks to Enter Raid
**Location**: `src/components/RaidSelectorModal.jsx`
**Problem**: Players must: expand raid card → scroll → click "Enter Raid"
**Comparison**: DungeonMap allows direct level clicks.
**Solution**: Make raid card directly clickable, move details to tooltip or secondary panel.

### Issue 6: Weak Active Raid Handling
**Location**: `src/components/RaidSelectorModal.jsx:204-210`
**Current**:
```jsx
{raidState.active && (
  <div className="pixel-panel text-sm p-3">
    Raid in progress: <strong>{RAIDS[raidState.raidId]?.name}</strong>
    <br />
    <span className="text-xs text-gray-400">Return to your raid from the game view.</span>
  </div>
)}
```
**Problem**: Passive message instead of action button.
**Solution**: Add prominent "RESUME RAID" button.

### Issue 7: No Difficulty/Time Indication
**Problem**: "3 bosses" tells players nothing about:
- Difficulty compared to same-level dungeon
- Expected completion time
- Recommended hero level
**Solution**: Add difficulty stars, estimated length, or recommended level.

### Issue 8: Enter Raid Button Buried
**Location**: `src/components/RaidSelectorModal.jsx:132-144`
**Problem**: Button at bottom of expanded card, requires scrolling.
**Solution**: Either make whole card clickable or put button in header.

---

## Unique Items Issues

### Issue 9: ALL Unique Items Use Emoji Icons
**Location**: `src/data/uniqueItems.js`
**Problem**: Every unique item uses emoji for icon:
```js
iconId: '🌲',  // Ancient Bark
iconId: '👑',  // Crown of the Fallen
iconId: '🔥',  // Magma Core
iconId: '💜',  // Void Heart
iconId: '🌊',  // Tidal Pendant
iconId: '🐍',  // Serpent's Fang
iconId: '👻',  // Phantom Cloak
iconId: '💀',  // Banshee's Wail
iconId: '🧛',  // Vampire's Embrace
iconId: '⚡',  // Stormcaller's Rod
iconId: '🛡️',  // Thunder Guard
iconId: '🌀',  // Eye of the Storm
iconId: '🦷',  // Abyssal Maw
iconId: '🐙',  // Kraken's Grasp
iconId: '💙',  // Leviathan's Heart
iconId: '💎',  // Reality Shard
iconId: '🗡️',  // Nullblade
iconId: '🌑',  // Cloak of Nothing
iconId: '👁️',  // Void God's Crown
iconId: '⚫',  // Entropy Accessory
```
**Violation**: CLAUDE.md states "NEVER use emojis in the UI"
**Solution**: Create SVG pixel art icons for each unique item in `src/components/icons/uniqueItems.jsx`

### Issue 10: No Dedicated Unique Collection UI
**Problem**:
- `ownedUniques[]` tracks collected items
- RaidSelectorModal shows "3/5 uniques" progress count
- But NO screen exists to view actual items, stats, or powers
**Impact**: Players get celebration popup, then can never review what they got.
**Solution**: Create UniqueCollectionScreen component.

### Issue 11: Uniques Mixed Into Regular Inventory
**Location**: `src/components/EquipmentScreen.jsx`
**Problem**: No special handling for unique/legendary items:
- Not highlighted differently
- No filter option
- No "Unique" section
**Solution**: Add unique item filtering and visual distinction.

### Issue 12: Unique Power Descriptions Hidden
**Problem**: `uniquePower` objects have detailed descriptions:
```js
uniquePower: {
  id: 'forest_shield',
  name: 'Living Armor',
  description: 'At the start of each room, gain a shield equal to 20% of your max HP...',
}
```
These are only shown in drop celebration popup, never accessible again.
**Solution**: Show in equipment tooltips and collection screen.

### Issue 13: No Unique Item Tooltips
**Location**: `src/components/ui/UniqueItemTooltip.jsx` exists but may not be integrated
**Problem**: Need to verify tooltip integration in EquipmentScreen.
**Solution**: Ensure unique items show full power descriptions on hover.

---

## World Boss Issues

### Issue 14: WorldBossCard Defined Twice ✅ ADDRESSED
**Locations**:
- `src/components/WorldBossCard.jsx` - Standalone component (157 lines)
- `src/components/BestiaryScreen.jsx:96` - Inline definition
**Problem**: Duplication, potential inconsistency.
**Analysis**: The two versions serve different purposes:
- Standalone: Preview card with "Enter Dungeon" action, unique drop preview
- BestiaryScreen inline: Collection view with kill data, unlock status
**Resolution**:
- Kept both versions (different use cases)
- Fixed emoji checkmark in BestiaryScreen version (now uses CheckIcon)
- Standalone may be useful for future world boss preview feature

### Issue 15: Early World Bosses Don't Drop Uniques
**Location**: `src/data/worldBosses.js`
```js
// Level 5 - Crystal Guardian
uniqueDrop: null,

// Level 10 - Crypt Lord
uniqueDrop: null,
```
**Problem**: First two "special" bosses give nothing special. Sets wrong expectations.
**Solution**: Either add unique drops or other special rewards (cosmetics, titles, consumables).

### Issue 16: World Boss Levels Not Prominent in UI
**Location**: `src/components/DungeonMap.jsx`
**Problem**: World boss mascot is small and in corner, easy to miss.
**Solution**: Add "WORLD BOSS" label, larger icon, glow effect on boss levels.

### Issue 17: No World Boss Preview Before Fight
**Problem**: Unlike raids which show boss stats and abilities, world bosses just appear.
**Solution**: Show WorldBossCard preview when selecting a world boss level.

---

## System Interaction Problems

### Issue 18: Confusing Progression Timeline
```
Level 5  → World Boss (no unique)
Level 10 → World Boss (no unique)
Level 12 → RAIDS UNLOCK (have uniques)
Level 15 → World Boss (has unique) ← Easy to miss!
Level 18 → Raid 2 unlocks
Level 20 → World Boss (has unique)
Level 24 → Raid 3 unlocks
Level 25 → World Boss (has unique)
Level 30 → World Boss (has unique) + Raid 5 unlocks
```
**Problem**: Players discover raids at 12, get excited about uniques, may skip world boss at 15.
**Solution**: Unified "Endgame Content" view showing both systems.

### Issue 19: Three Separate Collection Views
**Current State**:
- RaidSelectorModal: Shows raid uniques only
- BestiaryScreen: Shows world boss info (including unique drops)
- EquipmentScreen: Shows equipped/inventory items
**Problem**: No unified "all uniques and what I've collected" view.
**Solution**: Create comprehensive Collection screen.

### Issue 20: No Incentive to Replay Content
**Problem**:
- World bosses: Unique already collected, why replay?
- Raids: No incentive to replay after collecting uniques
**Solution**: Add challenge modes or increased rewards for replays.

### Issue 21: Raid and World Boss Uniques Feel Disconnected
**Problem**: Both systems drop uniques but presented as completely separate.
**Solution**: Unified loot/collection system presentation.

---

## Terminology & Style Issues

### Issue 22: "Wing Bosses" Legacy Terminology ✅ RESOLVED
**Location**: `src/components/RaidSelectorModal.jsx`
**Problem**: "Wings" made sense for hub navigation, not for continuous dungeon.
**Solution Applied**: Renamed to "Guardians" throughout RaidSelectorModal:
- "Wing Bosses (2)" → "Guardians (2)"
- "Defeat wing bosses to unlock..." → "Defeat the guardians to unlock..."
- "Final Boss (unlocks after wing bosses)" → "Final Boss (unlocks after guardians)"

### Issue 23: Emoji Checkmark in BossPreview ✅ RESOLVED
**Locations**:
- `src/components/RaidSelectorModal.jsx:49`
- `src/components/BestiaryScreen.jsx:108`
**Problem**: Used text checkmark `✓` instead of icon.
**Solution Applied**:
- Imported `CheckIcon` from './icons/ui'
- Replaced `{owned && '✓'}` with `{owned && <CheckIcon size={10} />}`
- Replaced `<span>✓</span>` with `<CheckIcon size={14} />`

### Issue 24: Inconsistent Boss Terminology
**Current Terms**:
- "Wing Boss" (raids)
- "Final Boss" (raids)
- "World Boss" (dungeons)
- "Boss" (generic)
**Solution**: Establish clear hierarchy: Boss < Elite Boss < World Boss < Raid Boss

---

## Enhancement Recommendations

### Priority 1: Critical (Style/Bug Fixes)

#### 1.1 Replace Emoji Icons with Pixel Art
**Files**:
- `src/data/uniqueItems.js` - Update iconId references (remove emoji, use templateId)
- `src/components/icons/ItemIcon.jsx` - Add unique item icons to EQUIPMENT_ICONS mapping

**Unique Items to Create Icons For** (20 items):

**World Boss Uniques (4):**
| Item | Current Emoji | Slot | Visual Concept |
|------|---------------|------|----------------|
| ancient_bark | 🌲 | accessory | Tree bark shield with green glow |
| crown_of_the_fallen | 👑 | accessory | Dark crown with red gems |
| magma_core | 🔥 | weapon | Flaming orb/crystal |
| void_heart | 💜 | accessory | Purple void crystal/heart |

**Sunken Temple Uniques (2):**
| Item | Current Emoji | Slot | Visual Concept |
|------|---------------|------|----------------|
| tidal_pendant | 🌊 | accessory | Blue wave amulet |
| serpents_fang | 🐍 | weapon | Green snake fang dagger |

**Cursed Manor Uniques (3):**
| Item | Current Emoji | Slot | Visual Concept |
|------|---------------|------|----------------|
| phantom_cloak | 👻 | armor | Ghostly white/gray cloak |
| banshees_wail | 💀 | weapon | Skull-topped staff |
| vampires_embrace | 🧛 | accessory | Red bat-wing amulet |

**Sky Fortress Uniques (3):**
| Item | Current Emoji | Slot | Visual Concept |
|------|---------------|------|----------------|
| stormcallers_rod | ⚡ | weapon | Lightning bolt staff |
| thunder_guard | 🛡️ | armor | Electric blue shield armor |
| eye_of_the_storm | 🌀 | accessory | Swirling blue eye orb |

**The Abyss Uniques (3):**
| Item | Current Emoji | Slot | Visual Concept |
|------|---------------|------|----------------|
| abyssal_maw | 🦷 | weapon | Dark teeth/jaw weapon |
| krakens_grasp | 🐙 | accessory | Tentacle ring |
| leviathans_heart | 💙 | accessory | Deep blue pulsing heart |

**Void Throne Uniques (5):**
| Item | Current Emoji | Slot | Visual Concept |
|------|---------------|------|----------------|
| reality_shard | 💎 | accessory | Fractured purple crystal |
| nullblade | 🗡️ | weapon | Black void sword |
| cloak_of_nothing | 🌑 | armor | Black hole cloak |
| void_gods_crown | 👁️ | accessory | Eye-centered dark crown |
| entropy_accessory | ⚫ | accessory | Swirling black orb |

**Implementation Steps:**
1. Create icon SVGs in `ItemIcon.jsx` following existing pattern (16x16 grid, pixelated)
2. Add each unique item to EQUIPMENT_ICONS mapping
3. Remove `iconId` emoji field from uniqueItems.js (ItemIcon uses templateId)
4. Test that unique items render correctly in:
   - UniqueDropCelebration popup
   - Equipment screen
   - RaidSelectorModal (if shown there)

**Design Guidelines:**
- Use Tailwind color palette hex values
- Legendary items should have gold (#f59e0b) accents
- Add highlights/shading for depth
- Keep readable at 16px and 24px sizes
- Slot-appropriate silhouettes (weapons look like weapons, etc.)

#### 1.2 Add "NEW" Badge for Raids
**File**: `src/components/NavBar.jsx`
**Work**:
```jsx
// Add state tracking
const raidsNewlyAvailable = highestDungeonCleared >= 12 && !featureUnlocks?.raidsSeen;

// Add badge
{
  id: 'raids',
  Icon: CrownIcon,
  label: 'Raids',
  badge: raidsNewlyAvailable ? 'NEW' : null,
  unlockAt: 12,
}
```
**Also**: Add `raidsSeen` to featureUnlocks in gameStore.

#### 1.3 Replace Checkmark Emoji
**File**: `src/components/RaidSelectorModal.jsx:49`
**Change**: `{owned && '✓'}` → `{owned && <CheckIcon size={12} />}`

#### 1.4 Rename "Wing Bosses"
**Files**:
- `src/components/RaidSelectorModal.jsx`
- `src/data/raids.js` (comments)
- `src/hooks/useRaid.js` (comments)
**Change**: "Wing Bosses" → "Guardians" or "Bosses"

### Priority 2: High (UX Improvements)

#### 2.1 Create Unique Collection Screen
**New File**: `src/components/UniqueCollectionScreen.jsx`
**Features**:
- Grid of all unique items in game
- Grouped by source (World Boss / each Raid)
- Greyed out silhouette if not owned
- Full color with stats if owned
- Click to see detailed power description
- Progress bars per category

#### 2.2 Add Resume Raid Button
**File**: `src/components/RaidSelectorModal.jsx`
**Change**: Replace passive message with action button:
```jsx
{raidState.active && (
  <button
    onClick={onClose}
    className="w-full pixel-btn pixel-btn-primary mb-4"
  >
    Resume: {RAIDS[raidState.raidId]?.name}
  </button>
)}
```

#### 2.3 Make Raid Cards Directly Clickable
**File**: `src/components/RaidSelectorModal.jsx`
**Work**:
- Single click on unlocked raid → enter raid
- Expansion shows details but isn't required
- Or: hover for details, click to enter

#### 2.4 Add Difficulty/Length Indicators to Raids
**File**: `src/data/raids.js`
**Add to each raid**:
```js
difficulty: 3,  // 1-5 stars
estimatedRooms: 12,
recommendedLevel: 14,
```
**Display** in RaidSelectorModal.

#### 2.5 Prominent World Boss Indicators
**File**: `src/components/DungeonMap.jsx`
**Work**:
- Add "WORLD BOSS" label on levels 5, 10, 15, 20, 25, 30
- Larger boss icon
- Glow/pulse effect
- Show unique drop preview for levels 15+

### Priority 3: Medium (System Improvements)

#### 3.1 Unique Item Tooltips in Equipment
**File**: `src/components/EquipmentScreen.jsx`
**Work**:
- Detect unique items (check `templateId` against UNIQUE_ITEMS)
- Show special border/glow
- Display unique power in tooltip
- Add "Unique" filter option

#### 3.2 Consolidate WorldBossCard
**Files**:
- Keep `src/components/WorldBossCard.jsx`
- Update `src/components/BestiaryScreen.jsx` to import and use it
- Remove inline WorldBossCard definition from BestiaryScreen

#### 3.3 Add Raid Teaser Before Unlock
**File**: `src/components/DungeonMap.jsx`
**Work**:
- When player is level 10-11, show "Raids unlock at Level 12!" teaser
- Maybe show locked raid preview

#### 3.4 Unify Endgame Content Navigation
**Concept**: Single "Challenges" or "Endgame" button that shows:
- Available Raids
- World Boss status
- Unique collection progress
**Work**: New component or restructure existing modals.

### Priority 4: Lower (Nice to Have)

#### 4.1 Early World Boss Rewards
**File**: `src/data/worldBosses.js`
**Options**:
- Add unique consumables for levels 5, 10
- Add cosmetic titles
- Add achievement badges

#### 4.2 Raid Difficulty Tiers
**Concept**: Normal / Hard / Nightmare versions
**Work**:
- Add difficulty selection to raid entry
- Scale stats based on difficulty
- Better drop rates at higher difficulties

#### 4.3 World Boss Preview Card
**Work**: Show WorldBossCard when selecting a world boss level in DungeonMap, similar to raid boss previews.

#### 4.4 Unified Loot Log
**Concept**: History of unique drops with timestamps
**Work**: Track drop history in state, create viewable log.

---

## Implementation Priority

### Phase 1: Polish (Do First) ✅ COMPLETE
1. [x] Replace all emoji icons with pixel art (Issue 9) - **DONE** (20 icons in ItemIcon.jsx)
2. [x] Add "NEW" badge for raids (Issue 1) - **DONE**
3. [x] Replace checkmark emoji (Issue 23) - **DONE** (RaidSelectorModal + BestiaryScreen)
4. [x] Rename "Wing Bosses" terminology (Issue 22) - **DONE** (now "Guardians")
5. [x] Consolidate WorldBossCard (Issue 14) - **KEPT BOTH** (serve different purposes, fixed emoji in BestiaryScreen)
6. [x] Add difficulty/length indicators (Issue 7) - **DONE** (added to raids.js, displayed in RaidSelectorModal)
7. [x] Add Resume Raid button (Issue 6) - **DONE** (prominent button with guardian progress)

### Phase 2: Core UX ✅ COMPLETE
6. [x] Create Unique Collection Screen (Issue 10) - **DONE** (new UniqueCollectionScreen.jsx, NavBar button, GameLayout modal)
7. [x] Add Resume Raid button (Issue 6) - **DONE** (moved to Phase 1)
8. [x] Simplify raid entry (Issue 5, 8) - **DONE** (direct Enter button on card, toggle for details)
9. [x] Add difficulty/length indicators (Issue 7) - **DONE** (moved to Phase 1)
10. [x] Prominent world boss indicators (Issue 4, 16) - **DONE** (added unique drop indicators in DungeonMap)

---

## Detailed Plans

### Plan: Unique Collection Screen (Phase 2, Item 6)

**Purpose**: Dedicated screen to view all unique items in the game and track collection progress.

**New File**: `src/components/UniqueCollectionScreen.jsx`

**UI Layout**:
```
┌─────────────────────────────────────────────────────┐
│  UNIQUE COLLECTION                    12/20 (60%)   │
│  ═══════════════════════════════════════════════    │
│                                                     │
│  ┌─ WORLD BOSSES ──────────────────────── 2/4 ─┐   │
│  │ [Ancient Bark ✓] [Crown ✓] [Magma ○] [Void ○] │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ SUNKEN TEMPLE (Lv 12) ─────────────── 1/2 ─┐   │
│  │ [Tidal Pendant ✓] [Serpent's Fang ○]         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─ CURSED MANOR (Lv 18) ──────────────── 3/3 ─┐   │
│  │ [Phantom Cloak ✓] [Banshee's ✓] [Vampire ✓]  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ... more raids ...                                 │
│                                                     │
│  ─────────────────────────────────────────────────  │
│  [Selected Item Detail Panel]                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ ANCIENT BARK          Legendary Accessory    │   │
│  │ "The forest remembers."                      │   │
│  │                                              │   │
│  │ +15 Defense  +40 HP                          │   │
│  │                                              │   │
│  │ ◆ LIVING ARMOR                               │   │
│  │ At the start of each room, gain a shield     │   │
│  │ equal to 20% of your max HP. While shielded, │   │
│  │ your attacks deal 15% bonus damage.          │   │
│  │                                              │   │
│  │ Source: Forest Ancient (World Boss Lv 15)    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Features**:
- Grid of all unique items grouped by source
- Owned items: full color with checkmark
- Unowned items: greyed silhouette, shows name but "???" for stats
- Click item to show detail panel with:
  - Full stats
  - Unique power name and description
  - Flavor text
  - Drop source (which boss)
- Overall progress bar at top
- Per-section progress bars

**Data Structure** (derived from existing data):
```js
// Group uniques by source
const UNIQUE_SOURCES = [
  {
    id: 'world_bosses',
    name: 'World Bosses',
    items: ['ancient_bark', 'crown_of_the_fallen', 'magma_core', 'void_heart'],
  },
  {
    id: 'sunken_temple',
    name: 'Sunken Temple',
    requiredLevel: 12,
    items: ['tidal_pendant', 'serpents_fang'],
  },
  // ... etc
];
```

**Integration**:
- Add to NavBar as "Collection" button (or under existing button)
- Or add as tab within Equipment screen
- Use existing `ownedUniques` from gameStore

**Components to Create**:
- `UniqueCollectionScreen` - main screen
- `UniqueItemCard` - individual item display (owned vs unowned states)
- `UniqueDetailPanel` - expanded item info

**Files to Modify**:
- `src/components/GameLayout.jsx` - add modal case
- `src/components/NavBar.jsx` - add button (optional, could be under Gear)

---

### Plan: Resume Raid Button (Phase 2, Item 7)

**File**: `src/components/RaidSelectorModal.jsx`

**Current** (lines 204-210):
```jsx
{raidState.active && (
  <div className="pixel-panel text-sm p-3" style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>
    Raid in progress: <strong>{RAIDS[raidState.raidId]?.name}</strong>
    <br />
    <span className="text-xs text-gray-400">Return to your raid from the game view.</span>
  </div>
)}
```

**Proposed**:
```jsx
{raidState.active && (
  <div className="mb-4">
    <button
      onClick={onClose}
      className="w-full pixel-btn pixel-btn-primary py-3 flex items-center justify-center gap-2"
    >
      <CrownIcon size={20} />
      <span>Resume: {RAIDS[raidState.raidId]?.name}</span>
      <span className="text-xs opacity-70">
        ({raidState.defeatedWingBosses.length}/{RAIDS[raidState.raidId]?.wingBosses.length} guardians)
      </span>
    </button>
  </div>
)}
```

**Behavior**: Clicking closes modal, returning to active raid gameplay.

---

### Plan: Difficulty/Length Indicators (Phase 2, Item 9)

**File**: `src/data/raids.js`

**Add to each raid definition**:
```js
sunken_temple: {
  // ... existing fields ...
  difficulty: 2,        // 1-5 scale
  estimatedRooms: 10,   // Total rooms in dungeon
  recommendedLevel: 14, // Suggested hero level
}
```

**Display in RaidSelectorModal**:
```jsx
<div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
  <span title="Difficulty">
    {Array.from({ length: 5 }).map((_, i) => (
      <StarIcon key={i} size={12} className={i < raid.difficulty ? 'text-amber-400' : 'text-gray-600'} />
    ))}
  </span>
  <span>~{raid.estimatedRooms} rooms</span>
  <span>Recommended Lv {raid.recommendedLevel}+</span>
</div>
```

---

### Plan: Prominent World Boss Indicators (Phase 2, Item 10)

**File**: `src/components/DungeonMap.jsx`

**Current**: Small world boss mascot in corner of tier card.

**Proposed Changes**:

1. **On world boss levels (5, 10, 15, 20, 25, 30)**, show prominent indicator:
```jsx
{isWorldBossLevel(level) && (
  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded animate-pulse">
    BOSS
  </div>
)}
```

2. **Show unique drop preview** for levels 15+ that have uniques:
```jsx
{worldBoss?.uniqueDrop && (
  <div className="flex items-center gap-1 text-amber-400 text-xs mt-1">
    <StarIcon size={10} />
    <span>Drops: {getUniqueItem(worldBoss.uniqueDrop)?.name}</span>
  </div>
)}
```

3. **Add "World Boss" section** to dungeon selection showing upcoming boss:
```jsx
{/* Next World Boss Preview */}
{nextWorldBoss && !nextWorldBossDefeated && (
  <div className="pixel-panel-dark p-3 mb-4 border-red-600/50">
    <div className="text-xs text-red-400 mb-2">NEXT WORLD BOSS</div>
    <div className="flex items-center gap-3">
      <WorldBossIcon bossId={nextWorldBoss.id} size={48} />
      <div>
        <div className="font-bold text-red-400">{nextWorldBoss.name}</div>
        <div className="text-xs text-gray-400">Level {nextWorldBoss.level}</div>
        {nextWorldBoss.uniqueDrop && (
          <div className="text-xs text-amber-400">Drops unique item!</div>
        )}
      </div>
    </div>
  </div>
)}
```

### Phase 3: Integration
11. [x] Unique tooltips in equipment (Issue 11, 12) - **DONE** (EquipmentScreen shows unique power info)
12. [x] Raid teaser before unlock (Issue 2) - **DONE** (DungeonMap shows teaser at D10-11)
13. [ ] Unified endgame navigation (Issue 18, 19) - **DEFERRED** (larger architectural change)
14. [x] Contextual badges on raids button (Issue 3) - **DONE** (shows "!" when raid in progress)

### Phase 4: Depth (Future Work)
15. [ ] Early world boss rewards (Issue 15) - **DESIGN NEEDED** (decide what rewards for D5, D10 bosses)
16. [ ] Raid difficulty tiers (Issue 20) - **FUTURE** (Normal/Hard/Nightmare modes)
17. [x] World boss preview cards (Issue 17) - **DONE** (existing preview in DungeonMap is sufficient, WorldBossCard available for future use)

---

## Files to Modify Summary

### New Files to Create
- `src/components/icons/uniqueItems.jsx` - Pixel art icons for all unique items
- `src/components/UniqueCollectionScreen.jsx` - Collection viewing UI

### Files to Modify
- `src/data/uniqueItems.js` - Replace emoji iconIds
- `src/components/NavBar.jsx` - Add raids badge
- `src/components/RaidSelectorModal.jsx` - Multiple UX improvements
- `src/components/DungeonMap.jsx` - World boss prominence
- `src/components/EquipmentScreen.jsx` - Unique item handling
- `src/components/BestiaryScreen.jsx` - Use shared WorldBossCard
- `src/components/GameLayout.jsx` - Add UniqueCollectionScreen modal
- `src/store/gameStore.js` - Add raidsSeen tracking
- `src/data/raids.js` - Add difficulty/length metadata

---

## Appendix: Current File Structure

```
src/
├── components/
│   ├── RaidSelectorModal.jsx    # Raid selection UI
│   ├── WorldBossCard.jsx        # Standalone (partially used)
│   ├── BestiaryScreen.jsx       # Has inline WorldBossCard
│   ├── EquipmentScreen.jsx      # No unique handling
│   ├── UniqueDropCelebration.jsx # Drop popup
│   ├── DungeonMap.jsx           # Level selection
│   ├── NavBar.jsx               # Navigation buttons
│   ├── GameLayout.jsx           # Main layout
│   └── icons/
│       ├── ui.jsx               # General icons
│       ├── raidBosses.jsx       # Raid boss sprites
│       └── worldBosses.jsx      # World boss sprites
├── data/
│   ├── raids.js                 # Raid definitions
│   ├── worldBosses.js           # World boss definitions
│   └── uniqueItems.js           # Unique item definitions
├── hooks/
│   ├── useRaid.js               # Raid state hook
│   ├── useCombat.js             # Combat logic
│   └── useDungeon.js            # Dungeon exploration
└── store/
    └── gameStore.js             # Central state
```
