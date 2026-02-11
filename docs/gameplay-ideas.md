# Gameplay Improvement Ideas

## Implemented
- [x] Homestead system with 8 upgradeable buildings
- [x] Gold sink via building upgrades
- [x] Passive bonuses (HP, Attack, Defense, XP, Gold, Cooldown Reduction, Exploration Healing, Recruit Bonus)

---

## High Priority

### 1. Status Effects & Combat Depth
Add tactical depth with status effects:
- **Poison** - Damage over time (X% HP per turn for Y turns)
- **Burn** - Damage over time + reduced healing
- **Freeze** - Skip next turn, take bonus damage
- **Stun** - Skip next turn
- **Bleed** - Damage when moving
- **Curse** - Reduced stats for duration
- **Blind** - Reduced accuracy / increased dodge chance for enemies

**Implementation:** Add `statusEffects` array to units, process at turn start/end.

### 2. Prestige / Rebirth System
Long-term progression loop:
- Reset progress for **Legacy Points**
- Spend Legacy Points on permanent bonuses:
  - +X% base stats
  - +X% gold/XP gain
  - Unlock new hero classes
  - Unlock new skill branches
  - Cosmetic unlocks (hero skins, dungeon themes)
- Prestige milestones unlock new content

### 3. Renown System (Monster Kill Tracking)
Track kills per monster type for rewards:

| Kills | Reward |
|-------|--------|
| 50 | Bestiary entry (view stats, drops) |
| 100 | +5% damage vs this monster type |
| 250 | Unlock themed equipment drops |
| 500 | +10% gold from this monster |
| 1000 | Trophy decoration + small global buff |

**Total Renown** unlocks content tiers:
- 1,000 total kills → Tier 2 dungeons
- 5,000 → Tier 3 dungeons
- 10,000 → Endless mode
- 25,000 → Challenge dungeons

---

## Medium Priority

### 4. Dungeon Variety

#### Biomes/Themes
- **Crypt** - Undead enemies, dark atmosphere
- **Forest** - Beasts and nature spirits
- **Volcano** - Fire enemies, environmental damage
- **Ice Cavern** - Frozen enemies, slippery movement
- **Arcane Tower** - Magic users, spell hazards
- **Abyss** - Demons, corruption mechanics

#### Special Room Types
- **Treasure Vault** - Extra loot, trapped
- **Shrine** - Random buff for the dungeon
- **Trap Room** - Navigate hazards
- **Elite Room** - Mini-boss with guaranteed drops
- **Rest Area** - Full heal, save point
- **Shop** - Spend gold mid-dungeon
- **Secret Room** - Hidden, requires finding

#### Dungeon Modifiers
Weekly rotating modifiers:
- "Enemies have +50% HP"
- "Heroes deal +25% damage"
- "No healing allowed"
- "Double gold drops"
- "Fog of war reduced"
- "Speed run - time bonus"

### 5. Equipment Depth

#### Set Bonuses
Collect pieces for bonuses:
```
Dragon Set (3 pieces): +15% fire damage
Dragon Set (5 pieces): Attacks burn enemies
```

#### Equipment Upgrading
- Combine duplicates for +1 level
- Use materials to enhance stats
- Add sockets for gems
- Reroll stats with gold

#### Rarity Effects
- **Legendary** items have unique effects
- "On kill: heal 5% HP"
- "Critical hits stun for 1 turn"
- "Start combat with shield"

### 6. Hero Specialization

#### Subclasses (unlock at level 10)
| Class | Subclass A | Subclass B |
|-------|------------|------------|
| Warrior | Berserker (damage) | Paladin (tank/support) |
| Mage | Elementalist (AoE) | Archmage (single target) |
| Rogue | Assassin (burst) | Shadow (evasion) |
| Cleric | Priest (healing) | Inquisitor (damage) |

Each subclass unlocks unique skill branch.

### 7. Endless Mode
- Infinite scaling dungeon
- Leaderboard for highest floor
- Rewards based on progress
- Gets harder each floor
- Special endless-only drops

---

## Lower Priority / Polish

### 8. Quality of Life
- [ ] Auto-sell below rarity threshold
- [ ] Equipment comparison tooltips
- [ ] Detailed statistics page
- [ ] Combat log export/history
- [ ] Formation editor (choose positions)
- [ ] Skill loadouts (save/swap builds)
- [ ] Hotkeys for common actions

### 9. Visual Feedback
- [ ] Critical hit numbers (bigger, gold color)
- [ ] Combo counter for consecutive kills
- [ ] Screen shake on big hits
- [ ] Particle effects for elements
- [ ] Death animations
- [ ] Level up celebration
- [ ] Loot beam for rare drops

### 10. Audio (if adding sound)
- Background music per biome
- Combat sounds
- UI feedback sounds
- Victory/defeat jingles
- Skill sound effects

### 11. Social Features
- [ ] Leaderboards (highest dungeon, most kills, fastest clear)
- [ ] Weekly challenges with rewards
- [ ] Achievement system
- [ ] Share runs/builds

### 12. New Hero Classes
- **Ranger** - Long range, traps, pet companion
- **Necromancer** - Summons, lifesteal, undead theme
- **Bard** - Buffs, debuffs, party support
- **Monk** - Combo attacks, self-healing, speed
- **Paladin** - Hybrid tank/healer with holy damage

### 13. Companion/Pet System
- Collect pets from dungeons
- Pets provide passive bonuses
- Can level up pets
- Pet abilities in combat

### 14. Crafting System
- Collect materials from monsters
- Craft specific equipment
- Upgrade existing gear
- Create consumables (potions, scrolls)

### 15. Daily/Weekly Content
- **Daily Dungeon** - Special rewards, limited attempts
- **Weekly Boss** - Raid-style boss with unique mechanics
- **Events** - Limited time dungeons/rewards

---

## Technical Improvements

### Performance
- [ ] Virtualize long lists
- [ ] Optimize re-renders
- [ ] Lazy load components
- [ ] Web worker for pathfinding

### Save System
- [ ] Cloud save support
- [ ] Multiple save slots
- [ ] Import/export saves
- [ ] Save versioning/migration

---

## Ideas to Explore

1. **Roguelike elements** - Permanent death mode, run-based unlocks
2. **Base defense** - Monsters attack homestead, defend with heroes
3. **PvP Arena** - Async battles against other players' parties
4. **Guilds** - Cooperative goals, shared bonuses
5. **Seasons** - Periodic resets with exclusive rewards
6. **Story/Lore** - Quest chains, NPC dialogue, world building
7. **Map exploration** - World map with multiple dungeons to unlock
8. **Hero relationships** - Bonds that give combat bonuses when paired
9. **Weather/Time** - Day/night cycle affecting gameplay
10. **Mutations** - Random hero modifiers (positive and negative)

---

## Balance Considerations

- Gold economy - ensure meaningful choices
- Power curve - avoid trivializing content
- Skill ceiling - reward good play without punishing casual
- Time investment - respect player time
- RNG fairness - bad luck protection
- New player experience - good onboarding
- Late game depth - always something to work toward
