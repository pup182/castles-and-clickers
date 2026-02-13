# Unique Items Fix Prompt

You are fixing bugs and adding visual effects to the unique items system in a React idle dungeon crawler game. All work is documented in `UNIQUE_ITEMS_ANIMATION_AUDIT.md` — read it first.

## Context

This is a Vite + React 19 + Zustand game. The unique items system has:
- **Data layer:** `src/data/uniqueItems.js` — 28 item definitions with triggers and effects
- **Engine layer:** `src/game/uniqueEngine.js` — per-trigger processing functions that return result objects
- **Consumer layer:** `src/hooks/useCombat.js` (combat) and `src/hooks/useDungeon.js` (exploration/setup) — call the engine and apply results to game state
- **Visual layer:** `addEffect()` calls that feed `src/canvas/AnimationManager.js` for canvas-rendered animations

The engine is well-structured. Most items work. You are fixing the gaps.

## Execution Rules

1. **Read before you edit.** Always read the target file region before modifying it. Line numbers in the audit are approximate and may shift as you make changes.
2. **One task at a time.** Complete a task fully before starting the next.
3. **Follow existing patterns.** Every fix has a working example elsewhere in the codebase. The audit's "Code Patterns to Copy" section points to them. Match the style exactly.
4. **Don't refactor surrounding code.** Touch only what the task requires. Don't rename variables, add types, reorganize imports, or "improve" adjacent logic.
5. **useCombat.js is 3300 lines.** Use targeted reads (offset+limit or grep) instead of reading the whole file. The audit gives you the exact line regions.
6. **Verify the build compiles** after each task: `npm run build`
7. **Conflict zones matter.** Tasks that touch overlapping line regions in the same file must be done sequentially. The audit's "File Conflict Zones" table tells you which tasks conflict. Re-read the target region after any prior task that touched the same zone.

## Tasks — Execute in This Order

### Phase 1: Mechanical Bug Fixes

**Task 2 — Fix Shadow Cloak double-dipping dodge**
- **Problem:** Shadow Cloak gives 25% dodge via `getUniquePassiveBonuses()` AND a separate 25% block via `processOnDamageTakenUniques()`, resulting in ~44% avoidance instead of the described 25%.
- **Fix:** In `src/game/uniqueEngine.js`, in the `processOnDamageTakenUniques()` function, find the `effect.dodgeChance` block (~line 425-429). Remove or comment out this entire block. The passive dodge bonus in `getUniquePassiveBonuses()` (~line 163-164) already handles the 25% avoidance correctly. The ON_DAMAGE_TAKEN handler should NOT also roll for dodge.
- **Verify:** Only one code path provides shadow_cloak's dodge chance after the fix.

**Task 4 — Fix Shadowfang invisibility state sync**
- **Problem:** Shadowfang's ON_CRIT grants invisibility by setting `newBuffs[actor.id].invisible = true` in useCombat.js, but `isHeroInvisible()` checks the uniqueEngine's internal `uniqueStates` Map. The two systems don't communicate.
- **Fix:** In `src/hooks/useCombat.js`, add `getUniqueState` to the import from `../game/uniqueEngine` (~line 51-73). Then at the Shadowfang invisibility section (~line 2586-2589), after setting `newBuffs[actor.id].invisible`, also set:
  ```javascript
  const sfState = getUniqueState(actor.id);
  sfState.isInvisible = true;
  sfState.invisibleTurns = buff.duration || 1;
  ```
- **Verify:** After a Shadowfang crit, `isHeroInvisible()` returns true for that hero.

**Task 10 — Add world boss duplicate prevention**
- **Problem:** World boss drops don't check if the player already owns the unique. Raid drops do (via `rollRaidDrop`). Players see a drop celebration then immediate gold conversion.
- **Fix:** In `src/hooks/useCombat.js`, find the world boss unique drop check (~line 1134). Add an ownership check:
  ```javascript
  if (m.isWorldBoss && m.uniqueDrop) {
    const ownedUniques = useGameStore.getState().ownedUniques || [];
    if (!ownedUniques.includes(m.uniqueDrop)) {
      handleUniqueDrop(m.uniqueDrop, m.position);
    }
  }
  ```
- **Verify:** Killing the same world boss twice doesn't trigger a second unique drop.

### Phase 2: Missing Engine Function

**Task 1 — Create Blood Pendant ON_PARTY_DAMAGE processing**
- **Problem:** `UNIQUE_TRIGGER.ON_PARTY_DAMAGE` is defined in data but no engine function processes it. Blood Pendant is completely nonfunctional.
- **Fix (Part A — Engine):** In `src/game/uniqueEngine.js`, add a new exported function after `processOnKillUniques` (~line 397):
  ```javascript
  // Process ON_PARTY_DAMAGE effects
  export const processOnPartyDamageUniques = (hero, totalDamage, context) => {
    const uniques = getHeroUniqueItems(hero);
    const results = { healing: 0 };
    for (const item of uniques) {
      const power = item.uniquePower;
      if (power.trigger !== UNIQUE_TRIGGER.ON_PARTY_DAMAGE) continue;
      const effect = power.effect;
      if (effect.partyLifesteal) {
        results.healing += totalDamage * effect.partyLifesteal;
      }
    }
    return results;
  };
  ```
- **Fix (Part B — Consumer):** In `src/hooks/useCombat.js`:
  1. Add `processOnPartyDamageUniques` to the import from `../game/uniqueEngine`
  2. After hero attack damage is finalized (after the ON_HIT processing block, ~line 2460), iterate all party heroes and call `processOnPartyDamageUniques` for the Blood Pendant wielder, healing them for 5% of the damage dealt. Follow the pattern at useCombat.js:2462-2473 (unique healing from Tidal Pendant) for how to apply healing.
- **Verify:** A hero with Blood Pendant heals when ANY party member deals damage.

**Task 11 — Fix Soul Harvester maxHP not updating mid-dungeon**
- **Problem:** Soul Harvester stacks increase `maxHpMultiplier` via `getUniquePassiveBonuses()`, but maxHP is only set at dungeon setup. Mid-dungeon stack gains never increase actual maxHP.
- **Fix:** In `src/hooks/useCombat.js`, in the Soul Harvester stacks section (~line 2720), after the stack gain combat log, recalculate the hero's maxHP:
  ```javascript
  if (uniqueOnKillResult.stacksGained > 0) {
    addCombatLog({ type: 'system', message: `Soul Harvester! ${actor.name} gains power from the kill!` });
    // Update hero maxHP to reflect new stacks
    const actorIdx = findHeroIndex(actor.id);
    if (actorIdx !== -1) {
      const soulReapBonus = 1 + uniqueOnKillResult.stacksGained * 0.05;
      const oldMaxHp = newHeroes[actorIdx].stats.maxHp;
      newHeroes[actorIdx].stats.maxHp = Math.floor(oldMaxHp * soulReapBonus);
      newHeroes[actorIdx].stats.hp += Math.floor(oldMaxHp * (soulReapBonus - 1));
    }
  }
  ```
  Note: `stacksGained` reports new stacks from THIS kill only, so the multiplier is incremental.
- **Verify:** Hero maxHP increases visibly after kills with Soul Harvester equipped.

### Phase 3: Visual Effects

All tasks in this phase add `addEffect()` calls to existing code paths. The mechanics already work — you are adding visual feedback only. `addEffect` is already available as a callback in both useCombat and useDungeon hooks.

**Available effect types (from AnimationManager.js):**
- `damage` — floating number (pass `isHeal: true` for green heal number)
- `beam` — line from `from` to `to` with `attackerClass` color
- `buffAura` — pulsing circle at `position` with `color`
- `status` — floating status icon at `position` with `status` name
- `impact` — expanding ring at `position`
- `healBurst` — green radial expansion at `position`
- `skillActivation` — skill icon flash at `position`

**Task 5 — ON_KILL proc visuals (5 items)**
In `src/hooks/useCombat.js`, in the ON_KILL processing block (~lines 2712-2732):
- After Windrunner extra turn log (~line 2714): `addEffect({ type: 'buffAura', position: actor.position, color: '#22c55e' });`
- After Ring of Archmage cooldown reset log (~line 2731): `addEffect({ type: 'buffAura', position: actor.position, color: '#8b5cf6' });`
- After Soul Harvester stacks log (~line 2721): `addEffect({ type: 'status', position: actor.position, status: 'buff' });`

For Banshee's Wail and Abyssal Maw: stacks are modified inside uniqueEngine state (not exposed via return value beyond `stacksGained`). The existing combat log messages suffice, but you may add a `status` float if desired.

**Task 6 — Thunder Guard retaliation visual**
In `src/hooks/useCombat.js`, after the reflect damage check (~line 1919-1921), when `uniqueOnDamageTakenResult.reflectDamage > 0`:
```javascript
addEffect({ type: 'beam', from: target.position, to: actor.position, attackerClass: 'knight' });
addEffect({ type: 'damage', position: actor.position, damage: Math.floor(uniqueOnDamageTakenResult.reflectDamage) });
```
This shows a lightning beam from the hero back to the attacker, plus a damage number.

**Task 7 — Stealth/invisibility visuals (2 items)**
- In `src/hooks/useDungeon.js` after Cloak of Nothing log (~line 197): `addEffect({ type: 'buffAura', position: hero.position, color: '#6b7280' });`
- In `src/hooks/useCombat.js` after Shadowfang stealth log (~line 2589): `addEffect({ type: 'buffAura', position: actor.position, color: '#374151' });`

**Task 8 — Entropy maxHP reduction visual**
In `src/hooks/useCombat.js`, after the Entropy combat log (~line 2513):
```javascript
addEffect({ type: 'status', position: target.position, status: 'debuff' });
```

**Task 9 — Dragonscale Mantle immunity feedback**
In `src/hooks/useCombat.js`, find where `isHeroImmuneToStatus()` returns true (~line 1522). Add inside that block:
```javascript
addCombatLog({ type: 'system', message: `${target.name} is immune! (Dragon's Resilience)` });
addEffect({ type: 'status', position: target.position, status: 'buff' });
```

### Phase 4: Deferred / Optional

**Task 3 — Dragonscale Mantle elemental resistance**
The `elementalResistance: 0.15` property exists in data but has no code path. Implementing it properly requires a damage-type system (monster attacks would need `damageType: 'fire'` fields). This is a feature addition, not a bug fix. Skip unless explicitly requested.

**Task 12 — Crown of Command "all stats" accuracy**
Description says "+10% all stats" but implementation only boosts attack/defense. Either expand the implementation to also apply to speed/maxHP, or change the description in `src/data/uniqueItems.js` line ~800 to say "+10% attack and defense to party". The description fix is simpler and less risky.

## After All Tasks

1. Run `npm run build` to verify no compilation errors
2. Run `npm run lint` to check for issues
3. Briefly describe what was changed per task in your final summary
