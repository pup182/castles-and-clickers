# Unique Items Audit

Full audit of all 33 unique items: whether their described effects actually work in-game.

**Files involved:**
- `src/data/uniqueItems.js` — Item definitions, trigger types, effect data (881 lines)
- `src/game/uniqueEngine.js` — Effect processing engine (597 lines)
- `src/hooks/useCombat.js` — Combat loop integration points
- `src/hooks/useDungeon.js` — Dungeon/room lifecycle
- `src/game/constants.js` — Initiative, movement, dodge formulas
- `src/game/statusEngine.js` — Status effect application
- `src/components/Sidebar.jsx` — Hero buff/status display

---

## Status Summary

| Status | Count | Items |
|--------|-------|-------|
| Working | 8 | Tidal Pendant, Phantom Cloak, Banshee's Wail, Thunder Guard, Abyssal Maw, Amulet of Reflection, Ring of Archmage, Armor of Undying |
| Partially Working | 7 | Vampire's Embrace, Stormcaller's Rod, Magma Core, Flamebreaker, Serpent's Fang, Shadowfang, Void Heart |
| Completely Broken | 18 | Crown of the Fallen, Eye of the Storm, Leviathan's Heart, Reality Shard, Nullblade, Cloak of Nothing, Kraken's Grasp, Ancient Bark, Entropy, Windrunner, Soul Harvester, Staff of Eternal Frost, Dragonscale Mantle, Boots of Blinding Speed, Blood Pendant, Crown of Command, Shadow Cloak, Void God's Crown |

---

## Root Causes

### 1. Functions imported but never called

Six engine functions are imported into `useCombat.js` (lines 52-69) but never invoked anywhere in the combat loop or dungeon hooks:

| Function | What it does | Items affected |
|----------|-------------|----------------|
| `processOnCombatStartUniques()` | Roots enemies, starts stealth | Kraken's Grasp, Cloak of Nothing |
| `processOnRoomStartUniques()` | Grants shields, resets per-room state | Ancient Bark |
| `processOnLowHpUniques()` | Triggers vengeance buffs below HP threshold | Crown of the Fallen |
| `tickUniqueEffects()` | Decrements invisibility turn counter | Cloak of Nothing |
| `isHeroInvisible()` | Checks if enemies should skip targeting a hero | Cloak of Nothing |
| `getStealthBonusDamage()` | Returns +200% stealth damage multiplier | Cloak of Nothing |
| `getRootedBonusDamage()` | Returns 3x damage vs rooted targets | Kraken's Grasp |
| `getShieldBonusDamage()` | Returns +15% damage while shielded | Ancient Bark |
| `resetRoomUniqueStates()` | Resets per-room state (stored damage, vengeance, phase bonus) | Void Heart, Crown of the Fallen |

### 2. Return values populated but never consumed

The engine functions return data that the combat loop ignores:

| Return field | Source function | Items affected |
|-------------|----------------|----------------|
| `statusToApply[]` | `processOnHitUniques()` | Magma Core (burn), Stormcaller's Rod (shock), Flamebreaker (burn) |
| `maxHpReduction` | `processOnHitUniques()` | Entropy |
| `buffsToApply[]` | `processOnCritUniques()` | Shadowfang (invisibility on crit) |

### 3. Passive bonuses calculated but never used

`getUniquePassiveBonuses()` computes these values, but the combat code at line 1611-1612 only destructures `damageMultiplier`, `lifesteal`, `armorPenetration` (unused), and `critChance`:

| Bonus field | Where it should apply | Items affected |
|-------------|----------------------|----------------|
| `speedMultiplier` | Initiative roll, dodge chance, double attack chance | Eye of the Storm |
| `maxHpMultiplier` | Hero max HP calculation | Leviathan's Heart |
| `damageReduction` | Damage output reduction (self-nerf) | Leviathan's Heart |
| `armorPenetration` | Target defense in damage formula | Nullblade |
| `dodgeChance` | Dodge calculation (hero passive dodge, not ON_DAMAGE_TAKEN) | Shadow Cloak (has double-path issue) |
| `movementBonus` | `calculateMoveDistance()` result | Boots of Blinding Speed |

### 4. Effect properties defined in data but no code path exists

| Property | Item | Problem |
|----------|------|---------|
| `alwaysFirst` | Boots of Blinding Speed | Never checked in `rollInitiative()` or `createTurnOrder()` |
| `enemyAccuracyReduction` | Eye of the Storm | Never checked in dodge/miss calculation |
| `enemyMissChance` | Reality Shard | Never checked in dodge/miss calculation |
| `doubleHitChance` | Reality Shard | Misrouted to `critChance` bonus — should trigger second attack |
| `healingReduction` | Vampire's Embrace | Defined in data, never plumbed through passive bonuses or heal code |
| `immuneToStatus` | Dragonscale Mantle | Never checked in `applyStatusEffect()` |
| `elementalResistance` | Dragonscale Mantle | Never checked in damage calculation |
| `preventsResurrection` | Nullblade | Never checked in necromancer raise dead logic |
| `partyLifesteal` | Blood Pendant | `ON_PARTY_DAMAGE` trigger has no handler anywhere |
| `onBurnDeathExplosion` | Magma Core | Explosion on burning enemy death never implemented |
| `partyStatBonus` | Crown of Command | Only applied to wearer's `damageMultiplier`, not party-wide |
| ACTIVE trigger | Staff of Eternal Frost | No activation mechanism or UI exists |

### 5. No UI display for unique stacking state

All unique state lives in a module-level `Map` (`uniqueStates`) inside `uniqueEngine.js`, completely outside React/Zustand. No component can subscribe to it.

Items with displayable stacking state:

| Item | State field | What player should see |
|------|------------|----------------------|
| Banshee's Wail | `soulStacks` (0-5) | Stack count + damage bonus % |
| Abyssal Maw | `killStacks` (0-∞) | Stack count + attack bonus % |
| Soul Harvester | stacks (0-10) | Stack count + stat bonuses |
| Void Heart | `damageStored` | Stored damage amount |
| Tidal Pendant | `attackCounter` (0-2) | Progress toward next proc (2/3) |
| Ancient Bark | shield amount | Shield HP remaining |
| Cloak of Nothing | `invisibleTurns` | Turns of stealth remaining |

---

## Per-Item Detailed Audit

### WORKING CORRECTLY

#### 1. Tidal Pendant — "Every 3rd attack deals 2x damage + 10% lifesteal"
- **Engine:** `processOnHitUniques()` tracks `attackCounter`, applies `bonusDamage` and `healing` on 3rd hit
- **Combat:** Consumed at lines 2311-2330 — bonus damage subtracted from monster HP, healing added to hero HP
- **Verdict:** Working. No display for attack counter progress.

#### 2. Phantom Cloak — "25% phase through attacks; next attack +100% damage"
- **Engine:** `processOnDamageTakenUniques()` rolls `phaseChance`, sets `hasPhaseBonus` flag; `getUniquePassiveBonuses()` applies 2x `damageMultiplier` when `hasPhaseBonus` is true; `processOnHitUniques()` clears the flag after attacking
- **Combat:** Phase dodge at line 1816 sets `totalDamageReduction = 1.0`; damage bonus applied via `uniqueBonuses.damageMultiplier` at line 1667
- **Verdict:** Working.

#### 3. Banshee's Wail — "Kill = Soul Stack (max 5, +10% dmg each). Reset on damage taken."
- **Engine:** `processOnKillUniques()` increments `soulStacks`; `getUniquePassiveBonuses()` multiplies damage by `1 + stacks * 0.10`; `processOnDamageTakenUniques()` resets stacks to 0 when damage received
- **Combat:** Kill path at line 2453; damage path at line 1808; passive at line 1611
- **Verdict:** Working mechanically. No stack display.

#### 4. Thunder Guard — "30% chance to zap attacker for 50% defense as damage"
- **Engine:** `processOnDamageTakenUniques()` rolls `procChance`, returns `reflectDamage` based on hero defense
- **Combat:** Consumed at line 1823 — added to `reflectDamage` which is applied to attacker
- **Verdict:** Working.

#### 5. Abyssal Maw — "+5% attack per kill, persists through dungeon"
- **Engine:** `processOnKillUniques()` increments `killStacks`; `getUniquePassiveBonuses()` multiplies damage by `1 + stacks * 0.05`; stacks survive room resets
- **Combat:** Kill path at line 2453; passive at line 1611
- **Verdict:** Working mechanically. No stack display.

#### 6. Amulet of Reflection — "Reflect 30% of damage taken"
- **Engine:** `processOnDamageTakenUniques()` returns `reflectDamage = damage * 0.30`
- **Combat:** Consumed at line 1823
- **Verdict:** Working.

#### 7. Ring of the Archmage — "Kills reset all skill cooldowns"
- **Engine:** `processOnKillUniques()` returns `resetCooldowns: true`
- **Combat:** Consumed at lines 2466-2473 — iterates all cooldowns and sets to 0
- **Verdict:** Working.

#### 8. Armor of the Undying — "Once per dungeon, survive lethal damage with 1 HP"
- **Engine:** `processOnDeathUniques()` returns `preventDeath: true`, `healAmount: 1`, `invulnerableTurns: 1`; sets `usedCheatDeath = true`
- **Combat:** Consumed at lines 2035-2052
- **Verdict:** Working.

---

### PARTIALLY WORKING

#### 9. Vampire's Embrace — "25% lifesteal. Healing from other sources reduced by 50%."
- **Working:** Lifesteal — `getUniquePassiveBonuses()` returns `lifesteal: 0.25`, consumed at line 2292
- **Broken:** `healingReduction: 0.50` is defined in item data but never read by the engine or checked during healing. The downside doesn't exist — pure upside only.

#### 10. Stormcaller's Rod — "Chain to 2 enemies for 40% damage. Shocked targets."
- **Working:** Chain damage — `processOnHitUniques()` populates `chainTargets[]` and `chainDamage`, consumed at lines 2333-2344
- **Broken:** Shock status — added to `statusToApply[]` in the engine (line 197-202) but the combat loop never reads `uniqueOnHitResult.statusToApply`. The affix system has identical working code at lines 2249-2260 that could be copied.

#### 11. Magma Core — "Attacks apply Burn. Burning enemies explode for 25% max HP on death."
- **Broken (burn):** Burn status added to `statusToApply[]` but never consumed (same issue as Stormcaller's Rod)
- **Broken (explosion):** `onBurnDeathExplosion: 0.25` defined in data but no explosion logic exists in the kill section of combat
- **Verdict:** Only the +35 attack base stat works.

#### 12. Flamebreaker — "+20% fire damage, attacks apply burn"
- **Working:** +20% bonus damage — `bonusDamagePercent: 0.20` processed by engine, consumed at line 2311
- **Broken:** Burn status — same `statusToApply` issue

#### 13. Serpent's Fang — "Crits chain strike 50% chance, 50% damage, infinite chain"
- **Working:** Single chain — `processOnCritUniques()` rolls chance, returns `chainAttack`, consumed at lines 2372-2379
- **Broken:** "Can chain infinitely" — combat code does one chain hit and stops. No recursive loop. `canChainInfinite` flag is stored but never checked.

#### 14. Shadowfang — "Crits deal +100% damage and grant invisibility"
- **Working:** +100% crit bonus — `critBonusDamage: 1.0` returned by engine, consumed at lines 2382-2386
- **Broken:** Invisibility buff — `grantsBuff: { id: 'invisible', duration: 1 }` returned in `buffsToApply[]` but never consumed by combat code

#### 15. Void Heart — "Store 20% damage dealt. Heal from stored on death. Resets per room."
- **Working:** Storage — `processOnHitUniques()` adds `damage * 0.20` to `damageStored` (line 213-215)
- **Working:** Cheat death — `processOnDeathUniques()` heals from stored damage (line 459-466)
- **Issue:** Because `resetsPerRoom` skips setting `usedCheatDeath`, cheat death can trigger every room. The room state reset (`resetRoomUniqueStates`) is also never called since the function is imported but not invoked — so `damageStored` actually persists across rooms instead of resetting.

#### 16. Void God's Crown — "Once per dungeon, cheat death + invulnerable 2 turns + heal to full"
- **Working:** Cheat death, heal, invulnerability all work via `processOnDeathUniques()` at lines 2035-2052
- **Issue:** Shares `usedCheatDeath` flag with Armor of Undying. If a hero has both items equipped, only the first cheat death triggers; the flag blocks the other.

---

### COMPLETELY BROKEN

#### 17. Crown of the Fallen — "Below 30% HP: +50% dmg, +25% lifesteal for 3 turns"
- **Engine:** `processOnLowHpUniques()` is fully implemented (lines 494-530) — checks HP threshold, returns vengeance buff with damage bonus and lifesteal
- **Problem:** Function is imported but **never called** anywhere. No code checks hero HP against the threshold after taking damage.
- **Fix:** Call after hero takes damage in the damage-received section (~line 1835), apply returned buffs to `newBuffs`.

#### 18. Eye of the Storm — "Speed doubled. Enemies have 30% reduced accuracy."
- **Engine:** `getUniquePassiveBonuses()` returns `speedMultiplier: 2.0` (line 88-90)
- **Problem 1:** `speedMultiplier` is calculated but **never applied** to hero speed. Not used in initiative, dodge, double attack, or movement calculations.
- **Problem 2:** `enemyAccuracyReduction: 0.30` defined in item data but never read by engine or checked in combat.
- **Fix:** Apply `speedMultiplier` to actor speed before initiative/dodge/double-attack calcs. Add `enemyAccuracyReduction` to dodge chance when this hero is the target.

#### 19. Leviathan's Heart — "Max HP doubled. Damage reduced by 25%."
- **Engine:** `getUniquePassiveBonuses()` returns `maxHpMultiplier: 2.0` and `damageReduction: 0.25`
- **Problem 1:** `maxHpMultiplier` calculated but **never applied** to hero max HP anywhere.
- **Problem 2:** `damageReduction` calculated but **never used**. The damage formula at line 1667 only uses `uniqueBonuses.damageMultiplier`.
- **Fix:** Apply `maxHpMultiplier` to hero stats at dungeon initialization. Apply `damageReduction` as `* (1 - damageReduction)` in the damage formula.

#### 20. Reality Shard — "15% double hit. 15% enemy miss."
- **Engine:** `getUniquePassiveBonuses()` adds `doubleHitChance` to `critChance` (line 112) — **this is wrong**, it should trigger a second attack, not increase crit
- **Problem 1:** Double hit is misrouted to crit chance instead of triggering a second full attack
- **Problem 2:** `enemyMissChance: 0.15` defined in item data but never read or checked
- **Fix:** Separate `doubleHitChance` from `critChance`. After dealing damage, roll for double hit and repeat the attack. Add `enemyMissChance` to dodge calculation when hero is targeted.

#### 21. Nullblade — "Ignore 50% enemy defense. Killed enemies can't be resurrected."
- **Engine:** `getUniquePassiveBonuses()` returns `armorPenetration: 0.50` (line 106-108)
- **Problem 1:** `armorPenetration` is in the passive bonuses but **never applied** in the damage formula. At line 1664, `target.stats.defense` is used at full value.
- **Problem 2:** `preventsResurrection: true` defined in data but never checked in the necromancer raise dead logic
- **Fix:** In damage formula, reduce target defense by `armorPenetration` fraction: `target.stats.defense * (1 - armorPenetration)`. Check `preventsResurrection` before allowing undead summons from killed targets.

#### 22. Cloak of Nothing — "Start combat invisible 2 turns. First stealth attack +200% damage."
- **Engine:** All pieces built — `processOnCombatStartUniques()` sets `isInvisible` and `invisibleTurns`; `isHeroInvisible()` checks stealth status; `getStealthBonusDamage()` returns +200%; `tickUniqueEffects()` decrements turns; `processOnHitUniques()` clears stealth on attack
- **Problem:** `processOnCombatStartUniques()`, `isHeroInvisible()`, `getStealthBonusDamage()`, and `tickUniqueEffects()` are all imported but **never called**
- **Fix:** Call `processOnCombatStartUniques()` in `startLocalCombat()`. Call `isHeroInvisible()` in monster target selection. Call `getStealthBonusDamage()` in damage calc. Call `tickUniqueEffects()` at end of hero turns.

#### 23. Kraken's Grasp — "Root all enemies 1 turn at combat start. 3x first attack vs rooted."
- **Engine:** `processOnCombatStartUniques()` returns root data; `getRootedBonusDamage()` returns 3x multiplier for first attack vs rooted targets
- **Problem:** `processOnCombatStartUniques()` and `getRootedBonusDamage()` are imported but **never called**
- **Fix:** Call at combat start, apply root status to enemies. Call `getRootedBonusDamage()` in damage calc and multiply.

#### 24. Ancient Bark — "Shield = 20% max HP on room start. +15% damage while shielded."
- **Engine:** `processOnRoomStartUniques()` calculates shield amount; `getShieldBonusDamage()` returns 1.15x multiplier
- **Problem 1:** `processOnRoomStartUniques()` imported but **never called**
- **Problem 2:** `getShieldBonusDamage()` imported but **never called**
- **Problem 3:** Hero shield absorption doesn't exist in the damage-taken path. Monster shields are absorbed at line 2114 but there's no equivalent for heroes. The `buffs.shield` exists from Cleric Radiance but only blocks via `blockNextHit` (binary), not as an HP absorb shield.
- **Fix:** Call room start function during exploration when entering rooms. Call shield bonus in damage calc. Add hero shield absorption in the damage-taken section (copy monster pattern from lines 2114-2125).

#### 25. Entropy — "Attacks reduce enemy max HP by 5% (2% for bosses)"
- **Engine:** `processOnHitUniques()` calculates `maxHpReduction` (lines 206-209)
- **Problem:** `uniqueOnHitResult.maxHpReduction` is returned but **never consumed** in combat code
- **Fix:** After processing on-hit results, reduce target monster's `stats.maxHp` by the percentage and clamp `stats.hp` to new max.

#### 26. Windrunner — "After killing an enemy, immediately take another turn"
- **Engine:** `processOnKillUniques()` returns `extraTurn: true`
- **Problem:** Combat code has literal `// TODO: Implement extra turn logic` at line 2462. The flag is set, a log message fires, but nothing happens.
- **Fix:** Set `newBuffs[actor.id].extraTurn = true` — the existing Time Warp system at line 722 already handles `extraTurn` buffs by not advancing the turn index.

#### 27. Soul Harvester — "Kills grant +5% max HP and +3 attack (max 10 stacks)"
- **Engine:** `processOnKillUniques()` increments `results.stacksGained` (line 303) but the actual `maxHpPercent` and `attack` values from the stacking buff are **never applied** to the hero's stats. There's no code that reads these values and modifies the hero.
- **Problem:** The engine only counts a generic counter. No stat modification logic exists.
- **Fix:** Track Soul Harvester stacks in unique state (like `killStacks`). Apply `+5% maxHp` and `+3 attack` per stack in `getUniquePassiveBonuses()`.

#### 28. Staff of Eternal Frost — "Active: Freeze all enemies 2 turns (10 turn CD)"
- **Engine:** Defined with `trigger: UNIQUE_TRIGGER.ACTIVE` and `cooldown: 10`
- **Problem:** The `ACTIVE` trigger type has **no handler anywhere**. No UI to activate item powers, no cooldown tracking for items, no activation code in the combat loop.
- **Fix:** Large effort — needs item activation UI, item cooldown tracking system, and active effect processing in combat. Consider deferring or converting to a passive/proc-based trigger.

#### 29. Dragonscale Mantle — "Immune to burn and freeze. +15% fire/ice resistance."
- **Engine:** Defined with `immuneToStatus: ['burn', 'freeze']` and `elementalResistance: 0.15` as a PASSIVE effect
- **Problem 1:** `getUniquePassiveBonuses()` has **no handling** for `immuneToStatus` or `elementalResistance` — these properties are simply ignored
- **Problem 2:** `applyStatusEffect()` in statusEngine.js has no check for hero equipment granting immunity
- **Fix:** Add immunity check before applying status effects — query hero's unique items for `immuneToStatus` arrays. Elemental resistance would need a damage type system (doesn't exist yet) or could be simplified to flat damage reduction vs burning/frozen enemies.

#### 30. Boots of Blinding Speed — "Always act first. +2 movement range."
- **Engine:** `getUniquePassiveBonuses()` returns `movementBonus: 2`. `alwaysFirst` defined in data.
- **Problem 1:** `alwaysFirst` never checked in `rollInitiative()` or `createTurnOrder()` (constants.js lines 24-75)
- **Problem 2:** `movementBonus` calculated but never added to `calculateMoveDistance()` result
- **Fix:** In `rollInitiative()`, return `Infinity` if hero has `alwaysFirst`. In combat movement code at line 2770, add `movementBonus` to the result of `calculateMoveDistance()`.

#### 31. Blood Pendant — "Heal 5% of all damage dealt by the party"
- **Engine:** Defined with `trigger: ON_PARTY_DAMAGE` and `partyLifesteal: 0.05`
- **Problem:** `ON_PARTY_DAMAGE` trigger type has **no handler** anywhere in the codebase. No code tracks total party damage to apply lifesteal.
- **Fix:** At end of combat tick, sum `totalDamageDealtThisTurn` from all heroes, find heroes with Blood Pendant, heal them for 5% of total party damage.

#### 32. Crown of Command — "Party gains +10% all stats"
- **Engine:** `getUniquePassiveBonuses()` applies `partyStatBonus` as `damageMultiplier *= (1 + 0.10)` (line 127-128)
- **Problem:** Only affects the **wearer's** damage multiplier. Description says "Party gains +10% all stats" but it doesn't affect other heroes and doesn't affect defense, HP, or speed.
- **Fix:** Need to check all heroes for Crown of Command and apply the bonus to each hero's stats. Either apply during stat calculation or as a party aura (similar to existing `getPartyAuraEffects()`).

#### 33. Shadow Cloak — "25% chance to completely avoid attacks"
- **Engine:** Has **two dodge paths** — `ON_DAMAGE_TAKEN` trigger with `dodgeChance: 0.25` (processed in `processOnDamageTakenUniques()`) AND a PASSIVE `dodgeChance` field (but `getUniquePassiveBonuses()` only processes PASSIVE trigger items, and Shadow Cloak is ON_DAMAGE_TAKEN so the passive path is skipped)
- **Problem:** The ON_DAMAGE_TAKEN dodge works but uses `damageBlocked` which is a damage reduction, not a true dodge (no miss animation, still triggers on-hit effects). The PASSIVE dodge path doesn't fire because the trigger type is wrong.
- **Verdict:** Functionally works as damage negation but not as a true dodge. Minor issue.

---

## Display Issues

### No unique stack/state indicators in sidebar

The sidebar (`Sidebar.jsx` lines 70-95) displays skill buffs (shield, taunt, evasion, haste, regen, might, speed) and status effects (burn, poison, etc.) but has zero awareness of unique item state.

The unique state Map in `uniqueEngine.js` is module-scoped and invisible to React. To display stacks:

1. Add a snapshot function to `uniqueEngine.js`:
```js
export const getUniqueStateSnapshot = (heroId) => {
  if (!uniqueStates.has(heroId)) return null;
  return { ...uniqueStates.get(heroId) };
};
```

2. After each combat tick in `useCombat.js`, sync snapshots into `roomCombat` state (which Zustand manages):
```js
const uniqueStateSnapshots = {};
for (const hero of newHeroes) {
  uniqueStateSnapshots[hero.id] = getUniqueStateSnapshot(hero.id);
}
updateRoomCombat({ ...otherUpdates, uniqueStates: uniqueStateSnapshots });
```

3. In `Sidebar.jsx`, read from `roomCombat.uniqueStates[hero.id]` and display relevant indicators alongside existing skill buffs.

### Items needing stack display

| Item | State | Display format |
|------|-------|---------------|
| Banshee's Wail | `soulStacks` 0-5 | Icon + "x3" count badge |
| Abyssal Maw | `killStacks` 0-∞ | Icon + "x12" count badge |
| Soul Harvester | stacks 0-10 | Icon + "x5" count badge |
| Void Heart | `damageStored` 0-∞ | Icon + stored amount |
| Tidal Pendant | `attackCounter` 0-2 | 3 dots, filled based on progress |
| Cloak of Nothing | `invisibleTurns` 0-2 | Stealth icon + turns remaining |
| Ancient Bark | shield HP | Shield bar overlay or icon + amount |

---

## Task List

Tasks are ordered by impact (how many items each fix unblocks) and grouped by approach.

### Task 1: Wire up `statusToApply` from unique on-hit results
**Unblocks:** Magma Core (burn), Stormcaller's Rod (shock), Flamebreaker (burn)
**Effort:** Small
**Approach:** After `processOnHitUniques()` at line 2284, iterate `uniqueOnHitResult.statusToApply` and call `applyStatusEffect()` exactly like the affix system does at lines 2249-2260.
**Where:** `useCombat.js` ~line 2344 (after chain attacks, before crit section)

### Task 2: Wire up `processOnCombatStartUniques()`
**Unblocks:** Kraken's Grasp (root enemies), Cloak of Nothing (stealth start)
**Effort:** Medium
**Approach:** In `startLocalCombat()` (useDungeon.js line 156), after creating turn order, loop through combat heroes and call `processOnCombatStartUniques()`. Apply root status to enemies. Set invisible state for stealth heroes.
**Where:** `useDungeon.js` ~line 165

### Task 3: Wire up stealth system (Cloak of Nothing full fix)
**Unblocks:** Cloak of Nothing (enemy ignore, stealth damage, turn countdown)
**Depends on:** Task 2
**Effort:** Medium
**Approach:**
- In monster target selection, call `isHeroInvisible()` to skip invisible heroes
- In damage calc, call `getStealthBonusDamage()` and multiply
- At end of hero turn, call `tickUniqueEffects()` to decrement invisibility
**Where:** `useCombat.js` — monster targeting (~line 1540), damage calc (~line 1667), end of turn (~line 720)

### Task 4: Wire up `processOnRoomStartUniques()` + hero shield system
**Unblocks:** Ancient Bark (shield + bonus damage while shielded)
**Effort:** Medium
**Approach:**
- Call `processOnRoomStartUniques()` when party enters a new room during exploration
- Store shield as `newBuffs[hero.id].shield = shieldAmount` (buff field already exists)
- Add hero shield absorption in damage-taken path (copy monster shield pattern from lines 2114-2125)
- Call `getShieldBonusDamage()` in damage calc and multiply
**Where:** `useDungeon.js` exploration tick, `useCombat.js` damage-taken section and damage calc

### Task 5: Wire up `processOnLowHpUniques()`
**Unblocks:** Crown of the Fallen (vengeance buff)
**Effort:** Small
**Approach:** After hero takes damage (~line 1835), check if HP dropped below threshold. Call `processOnLowHpUniques()`. Apply returned buffs (damageBonus, lifesteal) to `newBuffs[target.id]` with duration.
**Where:** `useCombat.js` ~line 1840

### Task 6: Consume `maxHpReduction` from on-hit results
**Unblocks:** Entropy
**Effort:** Small
**Approach:** After processing unique on-hit results, if `maxHpReduction > 0`, reduce `newMonsters[idx].stats.maxHp` by percentage and clamp `hp` to new max.
**Where:** `useCombat.js` ~line 2344

### Task 7: Apply `armorPenetration` in damage formula
**Unblocks:** Nullblade (50% defense ignore)
**Effort:** Small
**Approach:** In damage formula at line 1664, replace `target.stats.defense` with `target.stats.defense * (1 - (uniqueBonuses.armorPenetration || 0))`.
**Where:** `useCombat.js` line 1664

### Task 8: Apply `speedMultiplier` to combat speed calculations
**Unblocks:** Eye of the Storm (2x speed)
**Effort:** Small
**Approach:** When computing dodge chance, double attack chance, and initiative, multiply hero speed by `uniqueBonuses.speedMultiplier`.
**Where:** `useCombat.js` lines where speed is used in dodge/double-attack calcs; `constants.js` `rollInitiative()` or the call site in `useDungeon.js`

### Task 9: Apply `maxHpMultiplier` and `damageReduction`
**Unblocks:** Leviathan's Heart (2x HP, -25% damage)
**Effort:** Medium
**Approach:**
- `maxHpMultiplier`: Apply when initializing combat hero stats in dungeon setup. Double `maxHp` and `hp`.
- `damageReduction`: Multiply damage output by `(1 - uniqueBonuses.damageReduction)` in the damage formula at line 1667.
**Where:** `useDungeon.js` dungeon initialization, `useCombat.js` line 1667

### Task 10: Fix Windrunner extra turn
**Unblocks:** Windrunner
**Effort:** Small
**Approach:** Replace the TODO at line 2462 with `if (!newBuffs[actor.id]) newBuffs[actor.id] = {}; newBuffs[actor.id].extraTurn = true;` — the existing Time Warp buff system at line 722 already handles this.
**Where:** `useCombat.js` line 2462

### Task 11: Consume `buffsToApply` from on-crit results
**Unblocks:** Shadowfang (invisibility on crit)
**Effort:** Small
**Approach:** After processing unique crit results (~line 2387), iterate `uniqueCritResult.buffsToApply` and apply each buff to `newBuffs[actor.id]`.
**Where:** `useCombat.js` ~line 2387

### Task 12: Fix Reality Shard double hit
**Unblocks:** Reality Shard (15% double hit)
**Effort:** Medium
**Approach:** Remove `doubleHitChance` from `critChance` routing. After dealing damage, roll separately for double hit. If triggered, repeat the attack (deal damage again, apply on-hit effects again). Add `enemyMissChance` to dodge calc when hero is targeted.
**Where:** `uniqueEngine.js` line 112, `useCombat.js` after damage application

### Task 13: Add `enemyAccuracyReduction` and `enemyMissChance` to dodge calc
**Unblocks:** Eye of the Storm (30% reduced accuracy), Reality Shard (15% miss)
**Effort:** Small
**Approach:** When calculating dodge chance for a hero target, add these bonuses from the target's unique passive bonuses. Need to compute unique bonuses for the defender, not just the attacker.
**Where:** `useCombat.js` dodge calculation section (~line 1755)

### Task 14: Implement `alwaysFirst` and `movementBonus`
**Unblocks:** Boots of Blinding Speed
**Effort:** Small
**Approach:**
- `alwaysFirst`: In `createTurnOrder()` or its call site, check hero equipment for this flag and assign max initiative.
- `movementBonus`: At line 2770, add `uniqueBonuses.movementBonus` to `moveDistance`.
**Where:** `constants.js` or `useDungeon.js` (initiative), `useCombat.js` line 2770 (movement)

### Task 15: Fix Crown of Command to be party-wide
**Unblocks:** Crown of Command
**Effort:** Medium
**Approach:** Integrate with existing `getPartyAuraEffects()` system or check all heroes for Crown of Command during stat computation and apply +10% to each hero's attack, defense, maxHp, and speed.
**Where:** `useCombat.js` party aura section or `getUniquePassiveBonuses()` rework

### Task 16: Implement Soul Harvester stacking
**Unblocks:** Soul Harvester
**Effort:** Medium
**Approach:** Add `soulReapStacks` to unique state (like `killStacks`). In `processOnKillUniques()`, increment stacks (max 10). In `getUniquePassiveBonuses()`, add `+3 attack per stack` to a new `attackBonus` field and `+5% maxHp per stack` to `maxHpMultiplier`. Wire `attackBonus` into the damage formula.
**Where:** `uniqueEngine.js`, `useCombat.js` damage formula

### Task 17: Add Serpent's Fang infinite chain loop
**Unblocks:** Serpent's Fang (infinite chain)
**Effort:** Small
**Approach:** After the first chain hit at line 2372-2379, wrap in a `while` loop: keep rolling `Math.random() < 0.50` and dealing `damage * 0.50` of the previous chain's damage until the roll fails or a sanity cap (e.g. 10 chains).
**Where:** `useCombat.js` lines 2372-2379

### Task 18: Implement Vampire's Embrace healing reduction
**Unblocks:** Vampire's Embrace downside
**Effort:** Medium
**Approach:** Add `healingReduction` to `getUniquePassiveBonuses()` return value. In all heal application code, check for this modifier and reduce non-lifesteal healing by the percentage.
**Where:** `uniqueEngine.js`, `useCombat.js` all heal sections

### Task 19: Implement Dragonscale Mantle status immunity
**Unblocks:** Dragonscale Mantle
**Effort:** Medium
**Approach:** Before calling `applyStatusEffect()` on a hero, check hero's unique items for `immuneToStatus` arrays. If the status being applied is in the immunity list, skip it and log "immune". `elementalResistance` could be deferred (no damage type system exists) or simplified to damage reduction vs burning/freezing enemies.
**Where:** `useCombat.js` all `applyStatusEffect()` call sites, or add check inside `statusEngine.js`

### Task 20: Implement Blood Pendant party lifesteal
**Unblocks:** Blood Pendant
**Effort:** Medium
**Approach:** At end of combat tick, check if any hero has Blood Pendant equipped. If so, heal that hero for 5% of `totalDamageDealtThisTurn` (already tracked).
**Where:** `useCombat.js` end of tick, before state update

### Task 21: Implement Magma Core burn explosion
**Unblocks:** Magma Core (explosion on burning enemy death)
**Effort:** Medium
**Approach:** In the kill section, check if killed monster had burn status. If killer has Magma Core, deal 25% of monster's maxHp as AoE damage to nearby enemies (check distance, apply to all within range).
**Where:** `useCombat.js` kill section (~line 2400)

### Task 22: Implement Nullblade prevents resurrection
**Unblocks:** Nullblade (anti-resurrect)
**Effort:** Small
**Approach:** In the necromancer raise dead logic, check if the killing hero had Nullblade equipped. If so, skip the raise dead proc. Mark killed targets with a flag.
**Where:** `useCombat.js` raise dead section (~line 2440)

### Task 23: Add unique state display to sidebar
**Unblocks:** Visual feedback for all stacking uniques
**Effort:** Medium
**Approach:**
1. Export `getUniqueStateSnapshot()` from `uniqueEngine.js`
2. At end of combat tick, sync snapshots into `roomCombat.uniqueStates`
3. In `Sidebar.jsx`, add unique stack indicators section — show icon + stack count for active unique effects
4. Create SVG icons for each unique stack type (soul, hunger, tidal, stealth, shield, stored damage)
**Where:** `uniqueEngine.js`, `useCombat.js` end of tick, `Sidebar.jsx`

### Task 24: Staff of Eternal Frost activation system
**Unblocks:** Staff of Eternal Frost
**Effort:** Large — consider deferring
**Approach:** This requires a new system: item activation UI in the sidebar, item cooldown tracking alongside skill cooldowns, and active effect processing in the combat loop. Could alternatively convert to a proc-based trigger (e.g. "every 10 attacks, freeze all enemies") to avoid building an activation system.
**Where:** New UI component, `useCombat.js`, `uniqueEngine.js`

---

## Agent Reference: Import Context

### Already imported in `useCombat.js` (lines 51-69)

All of these are imported and available — do NOT add duplicate imports:

```js
import {
  resetUniqueStates,         // ← never called here (called in useDungeon.js)
  resetRoomUniqueStates,     // ← never called
  getHeroUniqueItems,        // ← never called
  getUniquePassiveBonuses,   // ← CALLED at line ~1611
  processOnHitUniques,       // ← CALLED at line ~2284
  processOnCritUniques,      // ← CALLED at line ~2364
  processOnKillUniques,      // ← CALLED at line ~2453
  processOnDamageTakenUniques, // ← CALLED at line ~1808
  processOnCombatStartUniques, // ← never called
  processOnRoomStartUniques,   // ← never called
  processOnDeathUniques,       // ← CALLED at line ~2035
  processOnLowHpUniques,       // ← never called
  getStealthBonusDamage,       // ← never called
  getRootedBonusDamage,        // ← never called
  getShieldBonusDamage,        // ← never called
  tickUniqueEffects,           // ← never called
  isHeroInvisible,             // ← never called
} from '../game/uniqueEngine';
```

Also imported: `applyStatusEffect` from `../game/statusEngine` (used at lines ~1249, ~1502, ~2251), `STATUS_EFFECTS` from `../data/statusEffects`.

### Already imported in `useDungeon.js` (line 25)

```js
import { resetUniqueStates } from '../game/uniqueEngine';
```

Only `resetUniqueStates` is imported here. Tasks that add calls to `processOnCombatStartUniques` or `processOnRoomStartUniques` in this file will need new imports.

---

## Agent Reference: Code Patterns to Copy

### Pattern A: Applying status effects from on-hit results (affix system)

This is the working pattern at `useCombat.js` lines 2248-2260. Copy this pattern for Task 1 (unique on-hit statuses):

```js
// Apply status effects from on-hit procs
for (const statusToApply of onHitResult.statusesToApply) {
  const mockTarget = { ...target, statusEffects: newStatusEffects[target.id] || [] };
  const statusResult = applyStatusEffect(mockTarget, statusToApply.id, actor, {
    duration: statusToApply.duration,
    stacks: statusToApply.stacks,
  });
  newStatusEffects[target.id] = statusResult.effects;
  const statusDef = STATUS_EFFECTS[statusToApply.id];
  if (statusDef) {
    addCombatLog({ type: 'system', message: `${target.name} is ${statusDef.name.toLowerCase()}!` });
  }
}
```

For unique items, `uniqueOnHitResult.statusToApply` uses a slightly different shape — each entry is `{ id, duration }` (not `statusesToApply`). Adapt accordingly.

### Pattern B: Extra turn buff (Time Warp system)

The extra turn mechanism at `useCombat.js` lines 721-726:

```js
// Handle extra turn (Time Warp) - grant an extra action
if (actorBuffs.extraTurn) {
  delete actorBuffs.extraTurn;
  // Don't advance turn - actor gets another action
  // This is handled by not calling getNextTurnState for this actor
}
```

To grant an extra turn (Task 10 — Windrunner), set the buff:
```js
if (!newBuffs[actor.id]) newBuffs[actor.id] = {};
newBuffs[actor.id].extraTurn = true;
```

### Pattern C: Monster shield absorption

The working monster shield pattern at `useCombat.js` lines 2113-2126. Copy for Task 4 (hero shield absorption for Ancient Bark):

```js
// Handle elite monster shield absorption
if (targetMonsterIdx !== -1 && actualDmg > 0 && newMonsters[targetMonsterIdx].shield > 0) {
  const shieldAmount = newMonsters[targetMonsterIdx].shield;
  const shieldAbsorbed = Math.min(shieldAmount, actualDmg);
  newMonsters[targetMonsterIdx].shield = shieldAmount - shieldAbsorbed;
  actualDmg = actualDmg - shieldAbsorbed;
  if (shieldAbsorbed > 0) {
    addCombatLog({ type: 'system', message: `${target.name}'s shield absorbs ${shieldAbsorbed} damage!` });
    if (newMonsters[targetMonsterIdx].shield <= 0) {
      addCombatLog({ type: 'system', message: `${target.name}'s shield is broken!` });
      addEffect({ type: 'buffAura', position: target.position, color: '#6495ed' });
    }
  }
}
```

For heroes, use `newBuffs[target.id].shield` instead of `newMonsters[idx].shield`. Place in the hero damage-taken section (after line ~1830, before `reducedDmg` is computed).

### Pattern D: Monster target selection (for stealth/invisibility)

Monster targeting at `useCombat.js` lines 950-972:

```js
// Find target
const enemies = actor.isHero ? activeCombatMonsters : aliveHeroes;
let target = enemies[0];
let minDist = Infinity;

// Monsters must attack taunting heroes
if (!actor.isHero) {
  const tauntingHero = aliveHeroes.find(h => newBuffs[h.id]?.taunt > 0);
  if (tauntingHero) {
    target = tauntingHero;
    minDist = getDistance(actor.position, target.position);
  } else {
    for (const e of enemies) {
      const d = getDistance(actor.position, e.position);
      if (d < minDist) { minDist = d; target = e; }
    }
  }
}
```

For Task 3 (Cloak of Nothing), filter invisible heroes from `aliveHeroes` before target selection:
```js
// Filter out invisible heroes from monster targeting (unless all invisible)
const visibleHeroes = aliveHeroes.filter(h => !isHeroInvisible(h));
const targetableHeroes = visibleHeroes.length > 0 ? visibleHeroes : aliveHeroes;
```
Then use `targetableHeroes` instead of `aliveHeroes` in the non-taunt branch.

### Pattern E: Dodge calculation (for accuracy/miss effects)

Dodge calculation at `useCombat.js` lines 1754-1764:

```js
// Calculate dodge chance including skill-based bonuses
let baseDodgeChance = calculateDodgeChance(target.stats.speed, actor.stats.speed);
if (target.isHero) {
  const targetDefenderBonuses = applyPassiveEffects(target, 'on_defend', {});
  baseDodgeChance += targetDefenderBonuses.dodgeChance || 0;
}
// Add bonus dodge for pets (they're nimble)
if (target.bonusDodge) {
  baseDodgeChance += target.bonusDodge;
}
const dodged = Math.random() < baseDodgeChance;
```

For Task 13 (Eye of the Storm accuracy reduction, Reality Shard miss chance), add after the pet dodge check:
```js
// Add unique item dodge bonuses (Eye of the Storm, Reality Shard)
if (target.isHero) {
  const targetHeroData = heroes.find(h => h.id === target.id);
  if (targetHeroData) {
    const targetUniqueBonuses = getUniquePassiveBonuses({ ...targetHeroData, stats: target.stats });
    baseDodgeChance += targetUniqueBonuses.enemyAccuracyReduction || 0;
    baseDodgeChance += targetUniqueBonuses.enemyMissChance || 0;
  }
}
```
Note: `enemyAccuracyReduction` and `enemyMissChance` need to be added to `getUniquePassiveBonuses()` return value in `uniqueEngine.js` first.

### Pattern F: Damage formula (where armor pen, damage reduction, multipliers go)

The damage formula at `useCombat.js` lines 1663-1667:

```js
let baseDmg = Math.max(1, Math.floor(
  (actor.stats.attack * actorDamageBonus + (passiveBonuses.attackBonus || 0) - target.stats.defense * targetDefenseBonus * 0.5) * (0.85 + Math.random() * 0.3)
));

let dmg = Math.floor(baseDmg * passiveBonuses.damageMultiplier * uniqueBonuses.damageMultiplier * executeMultiplier * berserkerMultiplier * vengeanceMultiplier * tauntPartyMultiplier * buffDamageMultiplier * weaknessMultiplier * bossDamageMultiplier);
```

- **Armor penetration** (Task 7): Change `target.stats.defense * targetDefenseBonus * 0.5` to `target.stats.defense * (1 - (uniqueBonuses.armorPenetration || 0)) * targetDefenseBonus * 0.5`
- **Damage reduction** (Task 9): Append `* (1 - (uniqueBonuses.damageReduction || 0))` to the `dmg` line
- **Stealth bonus** (Task 3): Append `* (1 + getStealthBonusDamage({...heroData, stats: actor.stats}))` or compute before
- **Rooted bonus** (Task 2): Append `* getRootedBonusDamage({...heroData, stats: actor.stats}, target)`
- **Shield bonus** (Task 4): Append `* getShieldBonusDamage({...heroData, stats: actor.stats})`

### Pattern G: Combat start hook point

In `useDungeon.js`, `startLocalCombat()` at lines 156-175:

```js
const startLocalCombat = useCallback((nearbyMonsters) => {
  const roomCombat = useGameStore.getState().roomCombat;
  if (!roomCombat) return;

  const { heroes: combatHeroes } = roomCombat;
  const turnOrder = createTurnOrder(combatHeroes.filter(h => h.stats.hp > 0), nearbyMonsters);

  addCombatLog({ type: 'system', message: `${nearbyMonsters.length} enemies!` });

  updateRoomCombat({
    phase: PHASES.COMBAT,
    combatMonsters: nearbyMonsters.map(m => m.id),
    turnOrder,
    currentTurnIndex: 0,
    round: 1,
  });
}, [addCombatLog, updateRoomCombat]);
```

For Task 2, add combat start processing BEFORE `updateRoomCombat`:
```js
// Process unique ON_COMBAT_START effects
const aliveHeroes = combatHeroes.filter(h => h.stats.hp > 0);
for (const hero of aliveHeroes) {
  const heroData = heroes.find(h => h.id === hero.id); // need heroes from store
  if (heroData) {
    const combatStartResult = processOnCombatStartUniques(
      { ...heroData, stats: hero.stats },
      nearbyMonsters,
      {}
    );
    // Apply root to enemies, set stealth state, etc.
  }
}
```
Note: `processOnCombatStartUniques` needs to be imported in `useDungeon.js` (currently only `resetUniqueStates` is imported).

### Pattern H: Room entry hook point

In `useDungeon.js`, `handleExplorationTick()` at line 325-327:

```js
if (nearbyMonsters.length > 0) {
  startLocalCombat(nearbyMonsters);
  return true;
}
```

Room start processing (Task 4 — Ancient Bark shield) should happen when the party enters a new room. Detect this by checking if `partyPosition` is in a different room than the previous tick. The room data is in `mazeDungeon.rooms` — each room has `{ x, y, width, height, index, cleared }`. Call `processOnRoomStartUniques()` for each hero when the room changes.

### Pattern I: Sidebar buff display

In `Sidebar.jsx` lines 70-95, skill buffs are displayed:

```jsx
const skillBuffs = useMemo(() => {
  if (isDead || !buffs) return [];
  const result = [];
  if (buffs.damageReduction && buffs.damageReductionDuration > 0) {
    result.push({ Icon: ShieldBuffIcon, name: 'Protected', duration: buffs.damageReductionDuration });
  }
  if (buffs.isTaunting && buffs.tauntDuration > 0) {
    result.push({ Icon: TauntIcon, name: 'Taunting', duration: buffs.tauntDuration });
  }
  // ... more buff checks ...
  return result;
}, [isDead, buffs]);
```

For Task 23, add a similar `uniqueBuffs` memo that reads from `roomCombat.uniqueStates[hero.id]` and generates indicators. The component receives `buffs` from the parent — unique state would need to be passed the same way, or read directly from the store.

---

## Agent Reference: Task Dependencies

```
Task 1  (statusToApply)          — standalone, do first (fixes 3 items)
Task 10 (Windrunner extraTurn)   — standalone, trivial (1 line)
Task 7  (armorPenetration)       — standalone
Task 6  (Entropy maxHpReduction) — standalone
Task 11 (Shadowfang buffs)       — standalone
Task 5  (Crown low HP)           — standalone
Task 17 (Serpent chain loop)     — standalone
Task 22 (Nullblade anti-rez)     — standalone

Task 2  (combat start)           — standalone, but unlock Tasks 3 and partial 14
  └→ Task 3  (stealth system)    — depends on Task 2
Task 4  (room start + shields)   — standalone (multi-part: room start hook, shield absorption, shield bonus)
Task 8  (speed multiplier)       — standalone
Task 9  (maxHp multiplier + dmg reduction) — standalone (2 parts)
Task 12 (Reality Shard double hit) — standalone but complex
Task 13 (accuracy/miss)          — standalone, but needs uniqueEngine changes
Task 14 (alwaysFirst + movement) — `alwaysFirst` partially depends on Task 8 (speed context)
Task 15 (Crown of Command party) — standalone
Task 16 (Soul Harvester stacks)  — standalone
Task 18 (healing reduction)      — standalone but touches many heal sites
Task 19 (status immunity)        — standalone
Task 20 (Blood Pendant)          — standalone
Task 21 (Magma Core explosion)   — depends on Task 1 (burn must be applied first)
Task 23 (sidebar display)        — do last (needs unique state synced from combat tick)
Task 24 (Staff of Frost active)  — standalone, consider deferring
```

### Recommended execution order

**Phase 1 — Quick wins (standalone, small effort, high impact):**
1. Task 1 (statusToApply — 3 items)
2. Task 10 (Windrunner — 1 line)
3. Task 7 (Nullblade armor pen)
4. Task 6 (Entropy maxHp reduction)
5. Task 11 (Shadowfang crit buffs)
6. Task 5 (Crown of the Fallen low HP)
7. Task 22 (Nullblade anti-resurrect)
8. Task 17 (Serpent's Fang chain loop)

**Phase 2 — Wiring up never-called functions:**
9. Task 2 (combat start hook)
10. Task 3 (stealth system — depends on Task 2)
11. Task 4 (room start + hero shields)

**Phase 3 — Passive bonus plumbing:**
12. Task 8 (speed multiplier)
13. Task 9 (maxHp multiplier + damage reduction)
14. Task 13 (accuracy/miss bonuses)
15. Task 14 (alwaysFirst + movement)

**Phase 4 — Medium-effort new logic:**
16. Task 12 (Reality Shard double hit)
17. Task 15 (Crown of Command party-wide)
18. Task 16 (Soul Harvester stacks)
19. Task 18 (healing reduction)
20. Task 19 (status immunity)
21. Task 20 (Blood Pendant party lifesteal)
22. Task 21 (Magma Core explosion — needs Task 1 done)

**Phase 5 — Display + deferred:**
23. Task 23 (sidebar display)
24. Task 24 (Staff of Frost active — defer or redesign)

---

## Agent Reference: File Conflict Zones

Many tasks modify the same regions of `useCombat.js`. If doing multiple tasks, be aware of line shifts.

### Hot zones in `useCombat.js`:

| Region | Lines (approx) | Tasks that touch it |
|--------|----------------|---------------------|
| Monster target selection | ~950-972 | Task 3 (stealth filter) |
| Damage formula | ~1663-1667 | Tasks 7, 8, 9, 3, 4 (armor pen, speed, dmg reduction, stealth bonus, shield bonus) |
| Dodge calculation | ~1754-1764 | Task 13 (accuracy/miss) |
| Hero damage-taken section | ~1775-1840 | Tasks 4 (shield absorb), 5 (low HP check) |
| On-hit results processing | ~2284-2344 | Tasks 1 (statusToApply), 6 (maxHpReduction) |
| On-crit results processing | ~2364-2387 | Tasks 11 (buffsToApply), 17 (chain loop) |
| On-kill results processing | ~2452-2473 | Tasks 10 (extraTurn), 21 (explosion), 22 (anti-rez) |
| Movement calculation | ~2770 | Task 14 (movementBonus) |

### Files modified per task:

| Task | Files modified |
|------|---------------|
| 1 | `useCombat.js` |
| 2 | `useDungeon.js` (add import + call) |
| 3 | `useCombat.js` (3 locations) |
| 4 | `useDungeon.js` (room start), `useCombat.js` (shield absorb + shield bonus) |
| 5 | `useCombat.js` |
| 6 | `useCombat.js` |
| 7 | `useCombat.js` |
| 8 | `useCombat.js` (or `constants.js` for initiative) |
| 9 | `useDungeon.js` (maxHp at dungeon init) + `useCombat.js` (dmg reduction) |
| 10 | `useCombat.js` |
| 11 | `useCombat.js` |
| 12 | `uniqueEngine.js` + `useCombat.js` |
| 13 | `uniqueEngine.js` + `useCombat.js` |
| 14 | `constants.js` (or `useDungeon.js`) + `useCombat.js` |
| 15 | `uniqueEngine.js` + `useCombat.js` |
| 16 | `uniqueEngine.js` + `useCombat.js` |
| 17 | `useCombat.js` |
| 18 | `uniqueEngine.js` + `useCombat.js` |
| 19 | `statusEngine.js` or `useCombat.js` |
| 20 | `useCombat.js` |
| 21 | `useCombat.js` |
| 22 | `useCombat.js` |
| 23 | `uniqueEngine.js` + `useCombat.js` + `Sidebar.jsx` + `icons/ui.jsx` |
| 24 | `uniqueEngine.js` + `useCombat.js` + new UI component |

---

## Agent Reference: Testing

- **No unit tests exist.** All testing is manual via `npm run dev` (localhost:5173).
- After making changes, verify with `npm run build` to catch compile errors.
- `npm run lint` catches ESLint issues.
- To test unique items in-game, you need a hero with the item equipped entering a dungeon. There's no debug/cheat console to spawn items.
- Combat log messages (`addCombatLog({ type: 'system', message: ... })`) are the primary way to verify effects are firing — they appear in the sidebar during dungeon runs.
