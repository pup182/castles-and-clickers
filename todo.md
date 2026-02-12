# TODO - Unimplemented Features

This file tracks skills, passives, affixes, and special effects that are defined in data files but not yet implemented in game logic.

## Critical Priority (Completely Non-Functional)

### Skill Effects
_None remaining_

### Dungeon Affixes
_None remaining_

### Monster Abilities
_None remaining_

## High Priority (Partially Implemented)

### Dungeon Affixes
_None remaining_

### Monster Abilities
_None remaining_

### Skill Effects
_None remaining_

## Medium Priority

_None remaining_

## Completed

- [x] **bonusIfTaunting** - Knight "Punish" skill deals bonus damage when hero is taunting
- [x] **requiresCorpse** - Necromancer "Corpse Explosion" only works with dead enemies
- [x] **resetOnKill** - Necromancer "Death Coil" resets cooldown on kill
- [x] **selfDamagePercent** - Necromancer "Death Coil" costs 30% HP to cast
- [x] **hpCostPerAttack** - Necromancer "Life Tap" costs 10% HP per attack for +30% damage
- [x] **deathExplosion** - "Explosive" affix: monsters explode for 20% max HP on death
- [x] **armorPen** - Ranger "Piercing Arrow" penetrates enemy defense
- [x] **onDeathAllyBuff** - "Bolstering" affix: surviving monsters gain attack when ally dies
- [x] **regenPercent** - "Regenerating" affix: monsters regen HP per turn
- [x] **trigger (on_damage)** - Monster passive abilities like "Enrage" now trigger when damaged
- [x] **hitCount** - Monster "Quick Strike" already works (was implemented in monsterAI.js)
- [x] **summonType** - Monster summons now work (fixed tier_1_random handling)
- [x] **onHitStatus** - Enemies now apply status effects on hit (Venomous, Burning, etc.)
- [x] **reflectDamage** - "Thorny" affix: monsters now reflect damage back to attackers
- [x] **lifesteal** - Monster abilities like "Soul Drain", "Drain Life" now heal the monster (added visual effect)
- [x] **heal_shield** - Cleric "Radiance" already works (was implemented in useCombat.js)
- [x] **party_stat_bonus** - Auras now also benefit the caster (Paladin/Cleric get their own buff)

---

## Notes

### File Locations
- **Skill definitions:** `src/data/skillTrees.js`
- **Monster abilities:** `src/data/monsterAbilities.js`
- **Dungeon affixes:** `src/data/dungeonTypes.js`
- **Equipment affixes:** `src/data/itemAffixes.js`

### Logic Files
- **Skill execution:** `src/game/skillEngine.js`
- **Monster AI:** `src/game/monsterAI.js`
- **Combat loop:** `src/hooks/useCombat.js`
- **Affix processing:** `src/game/affixEngine.js`
