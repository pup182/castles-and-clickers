# TODO

## Bugs
- [x] Units can shoot through walls (projectiles should respect line of sight)
- [ ] Dungeon transition screen appears on top of modals (should be behind)
- [ ] Investigate: what is the little question mark that sometimes pops up?
- [x] Homestead shouldn't be unlocked at game start (gate behind progression) - unlocks at D3, shows NEW badge until visited
- [x] Welcome back screen/offline progress system is inaccurate - needs full rework
- [x] Verify stats are being tracked consistently across all sources (fixed: skill dmg out, chain dmg, bonus attacks, AOE cleave, dmg taken from DOTs/redirects/sharing/martyr/monster skills)
- [x] "INVENTORY FULL" message appearing in combat log even when inventory isn't full
- [ ] Followers can get stuck when going around corners
- [ ] Rogues with bows should either have ranged attacks or bows removed from rogue item pool

## Visual/Animation Improvements
- [ ] Unique icons for every skill (no duplicates) - try creative variations first, fallback to recolors/sprite flips
- [ ] Skill animations (icon + name display) should linger for less time
- [ ] Consider uncapping animations on screen (currently stuff gets cut off before animation finishes)
- [ ] Unique animations for each skill (not just icon display)
- [ ] Dungeon select and dungeon overview screens need redesign (look more like a map, better visual overview, clearer progression outlook)
- [x] "No active dungeon" screen should have a one-click button to start next dungeon

## AI/Combat Improvements
- [x] Smarter ability decision making (e.g., don't use AoE spells on single enemies)

## Boss Enhancements
- [x] Unique names for bosses (generated or from name pool)
- [x] Unique boss sprites (distinct from regular monsters)
- [x] Boss-specific visual flair (auras, size, colors, etc.)

## Bestiary
- [x] Monster collection/log showing all encountered creatures (uses in-game sprites)
- [x] Track stats per monster type (kill count, base stats display)
- [x] Discovery progress bar and tier filtering
- [ ] Unlock lore/details as you fight more of each type
- [ ] Monster descriptions/flavor text for each creature
- [ ] Make kill count display bigger/more prominent
- [ ] Need more monsters for later levels (no unique monsters for Void and Volcanic Caverns)

## Milestones Rework
- [ ] Rethink milestones system completely

## Branding
- [ ] New game name
- [ ] New branding/logo
- [ ] Art style refresh

## Progression Gating
- [x] Auto dungeon run unlocks after first full party (permanently unlocked, toggle in header)
- [ ] Auto-run button needs a notification/badge when it first becomes available
- [ ] Auto-run button should be visible but disabled before unlocking

## Hero Management
- [ ] Consider why players would switch classes or retire a hero

---

## 1. Stats Page
- [x] Create stats screen showing aggregate game statistics
- [x] Damage done (total, per hero)
- [x] Monsters killed (by type, boss tracking)
- [x] Deaths and defeats
- [x] Gold earned/spent
- [x] Break down stats by individual hero
- [x] Track healing done, damage taken
- [x] Track additional hero stats (crits, dodges, mitigation)

## 2. Raids and Unique Weapons
- [ ] Implement raid system (weekly lockouts?)
- [ ] Design raid encounters with mechanics
- [ ] Create unique/legendary weapon drops
- [ ] Raid-specific loot tables
- [ ] Boss mechanics beyond normal combat

## 3. Shop Redesign
- [ ] Rework shop UI/UX
- [ ] Better item previews and comparisons
- [ ] More interesting items to buy
- [ ] Rotating stock improvements
- [ ] Consider removing or reworking refresh timer

## 4. Homestead Redesign
- [ ] Revamp building system
- [ ] More meaningful upgrade choices
- [ ] Visual representation of homestead?
- [ ] New buildings with unique effects
- [ ] Building synergies

## 5. Gold Economy Rework
- [ ] Audit gold income sources
- [ ] Add more gold sinks
- [ ] Balance gold rewards vs costs
- [ ] New things to spend gold on
- [ ] Consider scaling costs with progression

## 6. Game Ending and Prestiging
- [ ] Define end-game goal/boss
- [ ] Design prestige system
- [ ] Prestige rewards and bonuses
- [ ] What resets vs what persists
- [ ] Multiple prestige tiers?

## 7. Unlockable Classes
- [ ] Lock some classes behind achievements/progression
- [ ] Class unlock requirements (dungeon level, gold, milestones)
- [ ] Prestige-only classes?
- [ ] Class upgrade paths or promotions

## 8. Camera Fixes
- [ ] Fix camera getting confused on position
- [ ] Smoother camera transitions
- [ ] Better viewport tracking of party

## 9. Item Drop Animation Improvements
- [ ] Show actual item icon when loot drops
- [ ] Different animations for rarity tiers
- [ ] Equipment slot indicator on drop

## 10. Inventory Redesign
- [ ] Rethink how items, equipment, and inventory work in the context of game flow
- [ ] Rework inventory UI/UX
- [ ] Better sorting and filtering
- [ ] Item comparison tooltips
- [ ] Bulk sell/salvage options
- [ ] Equipment loadouts or sets

---

# Stretch Goals

## 1. Hash-Based Multiplayer
- [ ] Shareable party/hero hash codes
- [ ] PvP arena using hash imports
- [ ] Co-op raids with hash-shared parties
- [ ] Leaderboards based on hash submissions
- [ ] Async battles (fight someone's exported party)
