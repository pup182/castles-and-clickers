# Castles & Clickers - Developer Guide

A comprehensive reference for AI agents and developers working on this idle dungeon crawler.

## Table of Contents

1. [Project Structure](#project-structure)
2. [State Management](#state-management)
3. [Game Loop Architecture](#game-loop-architecture)
4. [Combat System](#combat-system)
5. [Dungeon Generation](#dungeon-generation)
6. [Canvas Rendering](#canvas-rendering)
7. [Hero System](#hero-system)
8. [Skills & Abilities](#skills--abilities)
9. [Status Effects](#status-effects)
10. [Equipment & Affixes](#equipment--affixes)
11. [Monster System](#monster-system)
12. [Homestead System](#homestead-system)
13. [Performance Patterns](#performance-patterns)
14. [Data Flow Examples](#data-flow-examples)
15. [File Reference](#file-reference)
16. [Conventions](#conventions)

---

## Project Structure

```
src/
├── canvas/                    # Canvas-based dungeon rendering (60 FPS)
│   ├── CanvasRenderer.js     # Main renderer with RAF loop
│   ├── Camera.js             # Viewport with smooth scrolling
│   ├── AnimationManager.js   # Combat effect animation pool (max 8)
│   ├── CanvasDungeonView.jsx # React wrapper component
│   ├── SpriteManager.js      # Sprite asset caching
│   ├── layers/
│   │   ├── TerrainLayer.js   # Offscreen-cached dungeon tiles
│   │   ├── UnitLayer.js      # Heroes/monsters with interpolation
│   │   ├── UILayer.js        # Health bars, status icons
│   │   └── EffectsLayer.js   # Combat effects wrapper
│   └── sprites/
│       ├── HeroSprites.js    # Pixel art hero rendering
│       ├── MonsterSprites.js # Pixel art monster rendering
│       └── SkillSprites.js   # Skill effect icons
│
├── components/               # React UI components
│   ├── icons/               # SVG icon components
│   ├── ui/                  # Reusable widgets (tooltips, etc.)
│   ├── GameLayout.jsx       # Main game container
│   ├── Sidebar.jsx          # Party status, dungeon info
│   ├── CombatLog.jsx        # Combat message display
│   ├── HeroManagement.jsx   # Party composition UI
│   ├── EquipmentScreen.jsx  # Item management
│   ├── SkillTreeScreen.jsx  # Skill unlocking
│   ├── HomesteadScreen.jsx  # Building upgrades
│   └── ShopScreen.jsx       # Item purchasing
│
├── data/                     # Game definitions (balance, content)
│   ├── classes.js           # 15 hero classes with stats
│   ├── skillTrees.js        # Skill trees per class
│   ├── equipment.js         # Equipment templates
│   ├── itemAffixes.js       # 40+ equipment affixes
│   ├── monsters.js          # 25+ monster types by tier
│   ├── monsterAbilities.js  # Monster attack definitions
│   ├── statusEffects.js     # Status effect mechanics
│   ├── dungeonThemes.js     # 6 visual themes by level
│   ├── dungeonTypes.js      # Difficulty modifiers
│   ├── homestead.js         # Building definitions
│   ├── raids.js             # Special encounters
│   ├── uniqueItems.js       # Legendary items
│   └── milestones.js        # Achievements
│
├── game/                     # Core mechanics
│   ├── combatEngine.js      # Combat initialization
│   ├── skillEngine.js       # Skill selection & execution
│   ├── statusEngine.js      # Status effect processing
│   ├── affixEngine.js       # Equipment affix triggers
│   ├── monsterAI.js         # 6 AI behavior types
│   ├── mazeGenerator.js     # BSP dungeon generation (29KB)
│   ├── roomBasedDungeon.js  # Room placement logic
│   └── constants.js         # Game balance formulas
│
├── hooks/                    # React hooks
│   ├── useGameLoop.js       # Main tick orchestration
│   ├── useCombat.js         # Combat execution (53KB)
│   ├── useDungeon.js        # Dungeon setup/exploration
│   ├── useCombatEffects.js  # Effect queue with batching
│   └── useThrottledDisplay.js # Render throttling
│
├── store/
│   └── gameStore.js         # Zustand state (1355 lines)
│
└── main.jsx / App.jsx       # Entry points
```

---

## State Management

Single Zustand store (`gameStore.js`) with localStorage persistence.

### Core State Structure

```javascript
{
  // Meta
  isRunning: boolean,
  gameSpeed: 1-4,              // Tick rate multiplier

  // Active Dungeon
  dungeon: { level, type },
  roomCombat: {
    phase: 'setup'|'exploring'|'combat'|'clearing'|'complete'|'defeat',
    tick: number,
    dungeon: mazeDungeonObject,
    heroes: [combatHero],
    monsters: [combatMonster],
    partyPosition: { x, y },
    viewport: { x, y },
    targetPosition: { x, y },
    turnOrder: [unitId, ...],
    currentTurnIndex: number,
    combatMonsters: [activeMonster],
    statusEffects: { unitId: [effects] },
    bossUnlocked: boolean,
  },

  // Persistent
  heroes: [heroDefinition],
  heroHp: { heroId: currentHp },  // Persists between rooms
  gold: number,
  inventory: [item],
  maxDungeonLevel: number,
  buildings: { buildingId: level },
  permanentBonuses: { ... },
  stats: { totalDungeonsCleared, totalMonstersKilled, ... },
}
```

### Key Actions

```javascript
// Hero Management
addHero(hero), removeHero(id), updateHero(id, updates)
addXpToHero(heroId, xp)        // Auto-levels when threshold crossed
equipItem(heroId, slot, item)
syncHeroHp(hpMap)              // Persist HP between rooms

// Dungeon
startDungeon(level, options)
endDungeon(success)
setRoomCombat(state), updateRoomCombat(updates), clearRoomCombat()

// Resources
addGold(amount), addInventoryItem(item)
processLootDrop(level, isBoss)

// Homestead
upgradeBuilding(buildingId)
getHomesteadBonuses()          // Returns cumulative bonuses
```

### Selector Pattern (Critical for Performance)

```javascript
// GOOD - Only re-renders on isRunning change
const isRunning = useGameStore(state => state.isRunning);

// BAD - Re-renders on ANY state change
const { isRunning, dungeon } = useGameStore();
```

---

## Game Loop Architecture

### Phase Flow

```
SETUP → EXPLORING → COMBAT → CLEARING → COMPLETE
         ↑______________|                    ↓
                                    (next dungeon)
```

### useGameLoop (250-500ms tick rate)

Located in `src/hooks/useGameLoop.js`.

| Phase | Duration | Action |
|-------|----------|--------|
| SETUP | 1 tick | Generate maze, place monsters, init heroes |
| EXPLORING | Variable | Move party, detect enemies in range |
| COMBAT | Variable | Process turns until all enemies dead |
| CLEARING | 2 ticks | Pause, check for remaining monsters |
| COMPLETE | 3 ticks | Award gold/XP, auto-advance |
| DEFEAT | 3 ticks | Increment deaths, auto-retry |

### Tick Rate Calculation

```javascript
const tickRate = 250 / gameSpeed;  // 250ms at 1x, 62.5ms at 4x
```

---

## Combat System

### Initiative & Turn Order

```javascript
// Initiative = speed + d20 (1-20)
// Ties: heroes win
// Sorted descending

const rollInitiative = (unit) =>
  (unit.stats.speed || 5) + Math.floor(Math.random() * 20) + 1;
```

### Speed Mechanics

```javascript
// Dodge chance: 3% per speed advantage
calculateDodgeChance(defenderSpeed, attackerSpeed)

// Double attack: 3% per speed advantage, max 30%
calculateDoubleAttackChance(attackerSpeed, defenderSpeed)

// Movement: 1 + floor(speed/8), max 3 tiles
calculateMoveDistance(speed)
```

### Damage Formula

```javascript
baseDamage = attacker.attack - defender.defense * 0.5
damage = max(1, floor(baseDamage × multiplier × (0.85 + random(0.3))))
if (crit) damage *= 1.5
```

### Combat Flow (useCombat.js)

1. `getCurrentActor()` - Get unit from turnOrder[currentTurnIndex]
2. If hero: `chooseBestSkill()` → `executeSkillAbility()`
3. If monster: `chooseMonsterAbility()` → `executeMonsterAbility()`
4. Apply damage, trigger affixes, apply status effects
5. Check for deaths, update turn order
6. `advanceTurn()` - Move to next actor
7. Check victory/defeat conditions

### Hero Skill Priority (chooseBestSkill)

1. Emergency heal (ally < 25% HP)
2. Defensive buffs (2+ hurt allies)
3. Execute skills (enemy < 25% HP)
4. AOE (3+ enemies)
5. Standard heal (ally < 50% HP)
6. Debuffs on bosses
7. Highest damage skill

### Line of Sight

Ranged attacks (range > 1) require clear line of sight via `hasLineOfSight(grid, from, to)` in `mazeGenerator.js`. Uses Bresenham's line algorithm to trace tiles between attacker and target. Melee attacks (range 1) bypass this check since units are adjacent. Units without LOS will pathfind toward their target instead of attacking.

---

## Dungeon Generation

### Algorithm: BSP + L-Shaped Corridors

Located in `src/game/mazeGenerator.js` (29KB).

### Tile Types

```javascript
TILE = {
  WALL: 0,       // Solid
  FLOOR: 1,      // Room floor
  CORRIDOR: 2,   // Hallway
  DOOR: 3,       // Transition
  ENTRANCE: 4,   // Party spawn
  EXIT: 5,       // Boss exit
  TREASURE: 6,   // Chest
}
```

### Dungeon Scaling

```javascript
// Dimensions: 60×45 base + level bonus
width = 60 + min(30, floor(level / 2))
height = 45 + min(20, floor(level / 3))

// Room count: 5 base + level bonus
rooms = 5 + floor(level / 4)  // max 10
```

### Key Functions

```javascript
generateMazeDungeon(level)              // Create full dungeon
placeMonsters(dungeon, level, options)  // Distribute monsters
findExplorationTarget(dungeon, pos, monsters)  // Next objective
findMonstersInRange(dungeon, pos, range)       // Detection
findPath(grid, start, goal)             // A* pathfinding
markExplored(dungeon, pos, range)       // Fog of war
```

### Dungeon Types

| Type | Stat Multiplier | Notes |
|------|-----------------|-------|
| normal | 1.0x | Baseline |
| elite | 1.5x | Better loot |
| raid | 2.0x | Rare drops |
| ascension | 1.0 + level×0.15 | Endgame scaling |

### Themes (by level)

| Theme | Levels | Primary Color |
|-------|--------|---------------|
| Cave | 1-5 | Cyan |
| Crypt | 6-10 | Green |
| Forest | 11-15 | Bright Green |
| Castle | 16-20 | Orange |
| Volcano | 21-25 | Red |
| Abyss | 26+ | Purple |

---

## Canvas Rendering

### Layer Stack (bottom to top)

1. **TerrainLayer** - Offscreen-cached dungeon tiles
2. **UnitLayer** - Heroes/monsters with position interpolation
3. **UILayer** - Health bars, status icons, boss crown
4. **EffectsLayer** - Damage numbers, beams, impacts

### Adaptive FPS

```javascript
// 60 FPS during combat or effects
// 30 FPS during exploration
minFrameTime = needsHighFPS ? (1000/60) : (1000/30);
```

### TerrainLayer Optimization

- Builds entire dungeon to offscreen canvas
- Chunked building (50 tiles/chunk) via requestIdleCallback
- Only blits visible viewport each frame

### UnitLayer Interpolation

```javascript
// Smooth movement without per-frame state updates
interpPos.x += (targetPos.x - interpPos.x) * 0.2;
interpPos.y += (targetPos.y - interpPos.y) * 0.2;
```

### Effect Limits

- Max 8 concurrent effects (AnimationManager)
- Skippable effects: buffAura, aoeGround, status
- Non-skippable: beam, impact, damage (core visuals)

---

## Hero System

### Classes (15 total)

**Tanks**: Warrior, Paladin, Knight
**Healers**: Cleric, Druid, Shaman
**Damage**: Mage, Rogue, Ranger, Necromancer, Sorcerer, Berserker

### Stat Growth Example

```javascript
// Warrior
baseHp: 100,    hpPerLevel: 15
baseAtk: 12,    atkPerLevel: 3
baseDef: 8,     defPerLevel: 2
baseSpd: 5,     spdPerLevel: 1
```

### Stat Calculation Order

1. Base class stats + level growth
2. Homestead % bonuses (multiplicative)
3. Equipment flat bonuses
4. Passive skill bonuses
5. Party skill bonuses (from allies)
6. Affix passive bonuses

### Stat Caching

Cache key: `${id}:${level}:${equipHash}:${skillHash}:${partyVersion}:${homesteadHash}`

---

## Skills & Abilities

### Skill Structure

```javascript
{
  id: 'warrior_cleave',
  type: 'active',              // or 'passive'
  targetType: 'all_enemies',   // targeting mode
  cooldown: 3,                 // turns
  effect: {
    type: 'damage',
    multiplier: 0.8,           // of base attack
    // ... other effect properties
  }
}
```

### Target Types

- SINGLE_ENEMY, ALL_ENEMIES
- SELF, SINGLE_ALLY, ALL_ALLIES
- LOWEST_HP_ALLY

### Effect Types

- DAMAGE, HEAL, SHIELD
- BUFF, DEBUFF
- DOT (damage over time), HOT (heal over time)

### Key Functions

```javascript
getAvailableSkills(hero, cooldowns)     // Filter ready skills
chooseBestSkill(hero, enemies, allies)  // AI selection
executeSkillAbility(actor, skill, target)
getEffectiveCooldown(skill)             // With affix reduction
```

---

## Status Effects

### Categories

**DOT (Damage Over Time)**
- `poison`: 10% attack/stack, max 5 stacks, 3 turns
- `burn`: 15% attack/stack, max 3 stacks, 2 turns
- `bleed`: 8% attack/stack, max 3 stacks, 4 turns

**Control (Diminishing Returns)**
- `stun`: Skip turn, 1 turn, immune after 3 applications
- `slow`: -50% speed, 2 turns
- `freeze`: +70% dodge, 3 turns

**Buffs**
- `regen`: Heal at turn start
- `shield`: Damage reduction
- `haste`: +50% speed

**Debuffs**
- `weakness`: -30% damage
- `shattered`: -50% defense

### Key Functions

```javascript
applyStatusEffect(target, statusId, source, options)
processStatusEffectsOnTurnStart(unit, effects)
checkStatusBreaks(target)  // Damage breaks freeze, etc.
```

---

## Equipment & Affixes

### Rarities

| Rarity | Multiplier | Color |
|--------|------------|-------|
| Common | 1.0x | Gray |
| Uncommon | 1.3x | Green |
| Rare | 1.6x | Blue |
| Epic | 2.0x | Purple |
| Legendary | 2.5x | Orange |

### Equipment Slots

- **Weapon**: Sword, Axe, Staff, Wand, Dagger, Bow, etc.
- **Armor**: Plate, Leather, Robes, Shield
- **Accessory**: Ring, Amulet, Cloak

### Affix Triggers (40+ affixes)

**On-Hit**
- `blazing`: 15% burn chance
- `venomous`: 20% poison chance
- `vampiric`: 10% lifesteal

**On-Crit**
- `mortal_strike`: 20% execute bonus

**On-Kill**
- `devouring`: Heal 30% max HP

**Passive**
- `titan`: +20% HP, +10% damage taken
- `swift`: +3 speed

---

## Monster System

### Tiers

| Tier | Levels | Examples |
|------|--------|----------|
| 1 | 1-5 | Goblin, Giant Rat, Skeleton, Slime |
| 2 | 6-10 | Orc, Vampire, Gargoyle, Dragon (boss) |
| 3 | 11-15 | Elemental, Golem, Lich |
| 4+ | 16+ | Demons, Elder Dragons |

### AI Types

| Type | Behavior |
|------|----------|
| Aggressive | Target highest-damage hero |
| Tank | Protect allies, use buffs |
| Assassin | Target lowest-HP hero |
| Debuffer | Apply status effects |
| Support | Heal allies first |
| Boss | Rotate through abilities |

---

## Homestead System

### Buildings

| Building | Bonus per Level | Max |
|----------|-----------------|-----|
| Barracks | +5% HP | 10 |
| Armory | +5% Attack | 10 |
| Training Grounds | +10% XP | 10 |
| Treasury | +10% Gold | 10 |
| Infirmary | +2% heal between dungeons | 5 |
| Fortress | +5% Defense | 10 |

### Upgrade Cost

```javascript
cost = baseCost × costMultiplier ^ level
```

---

## Performance Patterns

### 1. Imperative State Access

```javascript
// In game loop - no subscriptions
const state = useGameStore.getState();
```

### 2. Batched Updates

```javascript
// Single update instead of multiple
updateRoomCombat({
  phase: PHASES.COMBAT,
  turnOrder,
  combatMonsters
});
```

### 3. Object Reuse

```javascript
// Mutate in place to reduce GC
interpPos.x = newX;  // Not: interpPos = { x: newX, ... }
```

### 4. Chunked Processing

```javascript
// TerrainLayer: 50 tiles per chunk via requestIdleCallback
```

### 5. Effect Limits

```javascript
// Max 8 effects, skip less important during heavy combat
const SKIPPABLE_EFFECTS = new Set(['buffAura', 'aoeGround', 'status']);
```

---

## Data Flow Examples

### Starting a Dungeon

```
User clicks Start → startDungeon(level)
  ↓
setRoomCombat({ phase: SETUP })
  ↓
gameTick() detects SETUP phase
  ↓
setupDungeon():
  ├─ generateMazeDungeon(level)
  ├─ placeMonsters()
  └─ setRoomCombat({ phase: EXPLORING })
```

### Combat Encounter

```
handleExplorationTick():
  ├─ Move party toward target
  ├─ findMonstersInRange() → enemies detected
  └─ setRoomCombat({ phase: COMBAT, turnOrder, combatMonsters })
```

### Combat Turn

```
handleCombatTick():
  ├─ getCurrentActor()
  ├─ chooseBestSkill() / chooseMonsterAbility()
  ├─ executeSkillAbility() → damage, effects
  ├─ Check deaths, update turnOrder
  ├─ advanceTurn()
  └─ Check victory → CLEARING or continue
```

---

## File Reference

| File | Size | Purpose |
|------|------|---------|
| `store/gameStore.js` | 1355 lines | All state and actions |
| `hooks/useCombat.js` | 53KB | Combat tick execution |
| `game/mazeGenerator.js` | 29KB | Dungeon generation |
| `canvas/CanvasRenderer.js` | 186 lines | Main render loop |
| `data/classes.js` | 400+ lines | Hero class definitions |
| `data/skillTrees.js` | 1000+ lines | All skill trees |
| `game/skillEngine.js` | 400 lines | Skill execution |
| `game/statusEngine.js` | 300+ lines | Status processing |
| `game/affixEngine.js` | 400+ lines | Affix triggers |
| `game/monsterAI.js` | 300+ lines | AI behaviors |
| `data/monsters.js` | 600+ lines | Monster definitions |
| `data/itemAffixes.js` | 800+ lines | Affix definitions |

---

## Conventions

### Naming

- `calculateXxx()` - Pure utility function
- `getXxx()` - Fetch from data/state
- `processXxx()` - Stateful with side effects
- `xxxId` / `xxxIds` - Identifiers
- `xxx.isBoss` - Boolean properties

### Coordinates

- Position objects: `{ x, y }` (integers)
- Dungeon grid: `grid[y][x]` (row-major)

### Combat Terms

- **Actor**: Current unit taking turn
- **Target**: Unit receiving action
- **Enemies**: Opposing faction
- **Allies**: Same faction

### Status Effects

- **Stackable**: Multiple applications accumulate
- **Diminishing**: Control effects weaken on reapply
- **Soft CC**: Can act but weakened (slow, debuff)
- **Hard CC**: Cannot act (stun)
