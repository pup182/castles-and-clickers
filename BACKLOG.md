# Backlog

Tracked items for future implementation.

## Affix System (Partial)

- [x] ~~`damageTakenMultiplier`~~ (Fixed - of_the_titan's +15% damage taken now applied in combat)
- [x] ~~`debuffDurationReduction`~~ (Fixed - of_warding's 25% reduced debuff duration now applied to status effects)

## Features

- [x] ~~DPS classes still die too fast~~ (Fixed - reworked dodge formula with speed threshold, buffed DPS armor HP, casters get range 4, ranger gets dodge)
- [ ] Shop enhancement - currently not useful
- [ ] Economy balance - gold too abundant
- [x] ~~"Retrying" text on dungeon retry transition~~ (Fixed)
- [x] ~~Empty dungeon screen between dungeons~~ (Fixed - shows "Victory!" transition)
- [ ] Skill tree redesign - remove forced lane pathing requirement
- [ ] Raids and unique items
- [x] ~~Party changes during dungeon~~ (Fixed - class changes and retires now queue during dungeon, apply after)
- [ ] Meta progression and milestones pass
- [x] ~~Sprites not updating based on gear~~ (Fixed - canvas now reads equipment from store instead of combat snapshot)
- [x] ~~Items need to drop in the world (visual)~~ (Fixed - added lootDrop and goldDrop visual effects on monster death)

## Bugs

- [x] ~~Home screen crash~~ (Fixed - tavern building not defined)
- [x] ~~Item affixes not spawning~~ (Fixed - incomplete affix pool)
- [x] ~~Passive affix bonuses not applied~~ (Fixed - added to calculateHeroStats)
- [x] ~~Skills unlocked mid-dungeon not available~~ (Fixed - added skill sync)
- [x] ~~Skill usage decision making~~ (Verified - AI correctly chooses skills based on situation)
- [x] ~~Boss health bar doesn't sync with boss overview panel~~ (Fixed - throttled state now tracks boss HP changes)
- [x] ~~Units can get stuck on corners~~ (Fixed - follower movement now tries all 4 directions as fallback)
- [x] ~~Pending party changes breaks game between dungeons~~ (Fixed - processPendingPartyChanges was calling non-existent generateHeroName(), now uses createHero)
- [x] ~~Boss room still sometimes spawns in middle of dungeon~~ (Fixed - now requires edge/corner placement with stricter thresholds)
- [x] ~~Weird white line on minimap~~ (Fixed - added clearRect before drawing units)
- [x] ~~Treasure sprites in world don't disappear once picked up~~ (Fixed - CanvasRenderer now tracks grid reference to rebuild terrain cache on tile changes)
- [x] ~~Failed dungeon still shows "Victory!" screen instead of defeat~~ (Fixed - added lastDungeonSuccess state, transition now shows "Defeat" on failure)

## UX Issues

- [x] ~~Heroes modal requires scrolling when adding DPS~~ (Fixed - compact class selection grid)
- [x] ~~Enemy death animation is just a weird simple white face~~ (Fixed - replaced with pixel art skull that rises and fades with red glowing eyes)
- [x] ~~Add XP bars to party info sidebar~~ (Done - purple XP bar below HP bar in HeroCard)
- [ ] More unique spell and skill animations and icons
- [x] ~~Passive healing in exploration mode~~ (Done - base 1% HP regen per tick while exploring, stacks with infirmary bonus)

## Balance/Design

- [x] ~~Remove elite mode - tie into dungeon scaling instead~~ (Done - removed elite toggle, raids still get 1.5x multiplier)
- [x] ~~Enemy rebalance - some monsters too strong, possible scaling issues~~ (Done - nerfed Stone Golem stats/reflect, reduced scaling from 1.12x to 1.08x per level, shield_wall cooldown 6→9)
- [ ] Replace Knight class - consider alternatives: Monk, Death Knight, Berserker, or other tank archetypes
- [ ] Healers are OP - can survive alone against many mobs
