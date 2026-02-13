# Hero Skill System Audit

## 1. Files Involved

| File | Lines | Description |
|------|-------|-------------|
| `src/data/skillTrees.js` | ~1,931 | All 170 skill definitions across 10 classes |
| `src/game/skillEngine.js` | ~2,011 | Skill execution, passive processing, 42 exported functions |
| `src/hooks/useCombat.js` | ~3,300 | Combat loop - consumes skill engine functions |
| `src/store/gameStore.js` | ~2,600 | Skill unlock/respec, stat calculation with passive bonuses |
| `src/data/statusEffects.js` | ~226 | Status effects referenced by skills (stun, poison, etc.) |
| `src/data/classes.js` | ~320 | Class definitions with base stats |
| `src/components/SkillTreeScreen.jsx` | ~315 | Skill tree UI component |
| `src/components/SkillNode.jsx` | ~137 | Individual skill node display |
| `src/components/icons/skills.jsx` | ~807 | 39 unique SVG pixel-art icons, mapped to 120+ skill IDs |
| `src/canvas/SkillSprites.js` | ~738 | Canvas-based icon rendering for combat animations |
| `src/canvas/AnimationManager.js` | ~1,076 | Combat visual effects including skill activation |

---

## 2. Status Summary

### Passive Skill Types (41 types)

| Status | Count | Types |
|--------|-------|-------|
| **Working** | 32 | stat_bonus, damage_reduction, damage_bonus, crit_bonus, crit_damage_bonus, lifesteal, double_attack_chance, dodge_chance, reflect_damage, reflect_flat, threat_bonus, healing_bonus, dual_bonus, high_hp_bonus, high_hp_reduction, low_hp_bonus, on_kill_heal, on_kill_heal_percent, on_kill_bonus, counter_attack, on_hit_heal_percent, attack_dot, party_regen, damage_heals, beacon_heal, party_stat_bonus, damage_sharing, cheat_death, auto_revive, cooldown_reduction, summon_pet, shadow_clone, taunt_party_bonus, reactive_taunt, martyr, redirect_damage, vengeance, avenger_rage, execute, raise_dead, dot_lifesteal, armor_vs_dot, heal_shield, living_seed, cleave, opener_bonus (handler only), range_bonus, priority_target_bonus, hp_for_damage |
| **Partially Working** | 2 | conditional_cheat_death (threshold unchecked), stacking_hp (return value ignored) |
| **Completely Broken** | 7 | reactive_heal, save_ally, low_hp_heal, hot_bloom, hot_stacking, cc_immunity, first_turn_speed |
| **Dead/Unreachable** | 2 | displacement_immunity (no mechanics exist), first_skill_bonus (context never passed) |

### Active Skills

All active skill types (DAMAGE, HEAL, SHIELD, BUFF, DEBUFF, DOT, HOT) are **Working** through `executeSkillAbility()`.

### Icons & Animations

| Feature | Status |
|---------|--------|
| SVG skill tree icons (39 unique) | Working - all mapped |
| Canvas combat icons | Working - displayed on skill activation |
| Skill activation animation (1500ms) | Working - icon + name label shown |
| Skill-specific visual effects | Missing - all skills share generic animation |
| Unique per-skill animations | Missing - same skillActivation effect for all |

---

## 3. Root Causes

### A. Functions exported but never imported/called (5 functions, 7 skills)

| Function | File:Line | Affected Skills |
|----------|-----------|-----------------|
| `checkReactiveHeal()` | skillEngine.js:1662 | Warrior Second Wind, Cleric Guardian Angel, Paladin Divine Intervention |
| `getHotBonuses()` | skillEngine.js:1711 | Druid Lifebloom, Druid Overgrowth |
| `hasCCImmunity()` | skillEngine.js:1353 | Warrior Unstoppable |
| `getFirstTurnSpeedBonus()` | skillEngine.js:1764 | Shaman Spirit Walk |
| `hasDisplacementImmunity()` | skillEngine.js:1643 | Knight Stand Firm |

### B. Return values populated but caller ignores them (1 function, 1 skill)

| Function | Return Field | File:Line | Affected Skill |
|----------|-------------|-----------|----------------|
| `getOnKillEffects()` | `stackingHp` | skillEngine.js:1236 | Necromancer Soul Harvest |

### C. Context properties expected but never passed (1 case, 1 skill)

| Context Property | Expected By | File:Line | Affected Skill |
|-----------------|-------------|-----------|----------------|
| `isFirstSkillUse` | `first_skill_bonus` case | skillEngine.js:1099 | Mage Arcane Surge |

### D. Condition defined in data but not validated in code (1 case)

| Condition | Data Field | File:Line | Affected Skill |
|-----------|-----------|-----------|----------------|
| HP threshold check | `threshold: 0.5` | skillEngine.js:1325 | Necromancer Undying |

### E. Data field stored with no code path (1 case)

| Field | Data Location | Affected Skill |
|-------|--------------|----------------|
| `openerDamageBonus: 15` | skillTrees.js:1549 | Ranger Steady Aim |

---

## 4. Per-Item Detailed Audit

### BROKEN SKILLS

---

#### Warrior: Second Wind (Tier 1)
- **Claims:** "Heal 10% HP when dropping below 30%."
- **Data:** `skillTrees.js:132` — `{ type: 'low_hp_heal', threshold: 0.3, healPercent: 0.1 }`
- **Engine:** `checkReactiveHeal()` at `skillEngine.js:1693` checks `low_hp_heal` type, compares HP ratio to threshold, returns `{ triggered, healPercent, selfOnly: true }`
- **Combat integration:** `checkReactiveHeal` is NOT imported in `useCombat.js` (lines 5-32). No code checks for reactive heals during the damage-taken phase.
- **Verdict:** **BROKEN** — Handler exists but is never called. Spending a skill point on this does nothing.
- **Fix:** Import `checkReactiveHeal` in useCombat.js and call it in the hero damage-taken block (~line 2060) for each ally/self.

---

#### Cleric: Guardian Angel (Tier 2)
- **Claims:** "Auto-heal lowest ally 10% when they drop below 40%."
- **Data:** `skillTrees.js:708` — `{ type: 'reactive_heal', threshold: 0.4, healPercent: 0.1 }`
- **Engine:** `checkReactiveHeal()` at `skillEngine.js:1672` checks `reactive_heal` type, compares ally HP ratio to threshold, returns `{ triggered, healPercent }`
- **Combat integration:** Same as above — `checkReactiveHeal` never imported or called.
- **Verdict:** **BROKEN** — Handler exists but is never called.
- **Fix:** Same fix as Second Wind — import and call in damage-taken block.

---

#### Paladin: Divine Intervention (Tier 3 CAPSTONE)
- **Claims:** "When ally would die, heal them 50% instead. Once per room."
- **Data:** `skillTrees.js:375` — `{ type: 'save_ally', healPercent: 0.5 }`
- **Engine:** `checkReactiveHeal()` at `skillEngine.js:1682` checks `save_ally` type, triggers when `ally.stats.hp <= 0`, returns `{ triggered, healPercent, preventDeath: true }`
- **Combat integration:** `checkReactiveHeal` never imported or called.
- **Verdict:** **BROKEN** — A capstone skill that does nothing. This is the highest-impact broken skill.
- **Fix:** Import and call `checkReactiveHeal` in the hero-death check block (~line 2164) before `checkCheatDeath`.

---

#### Druid: Lifebloom (Tier 2)
- **Claims:** "Your HoTs heal +25% on final tick."
- **Data:** `skillTrees.js:902` — `{ type: 'hot_bloom', bonusPercent: 25 }`
- **Engine:** `getHotBonuses()` at `skillEngine.js:1723` checks `hot_bloom`, adds `bonusPercent/100` to `hotMultiplier`. Returns `{ hotMultiplier, maxStacks }`.
- **Combat integration:** `getHotBonuses` is NOT imported in `useCombat.js`. HOT tick processing (~line 700+) does not check for bloom bonuses.
- **Verdict:** **BROKEN** — Handler exists but is never called.
- **Fix:** Import `getHotBonuses` and call it when processing HOT final tick to multiply healing.

---

#### Druid: Overgrowth (Tier 2)
- **Claims:** "HoTs can stack twice."
- **Data:** `skillTrees.js:911` — `{ type: 'hot_stacking', maxStacks: 2 }`
- **Engine:** `getHotBonuses()` at `skillEngine.js:1726` checks `hot_stacking`, sets `maxStacks`. Returns `{ hotMultiplier, maxStacks }`.
- **Combat integration:** Same as Lifebloom — `getHotBonuses` never imported. HOT application does not check for stacking limits.
- **Verdict:** **BROKEN** — Handler exists but is never called.
- **Fix:** Same as Lifebloom fix — call `getHotBonuses` when applying HOT buffs.

---

#### Warrior: Unstoppable (Tier 2)
- **Claims:** "Immune to stun and slow effects."
- **Data:** `skillTrees.js:174` — `{ type: 'cc_immunity', stun: true, slow: true }`
- **Engine:** `hasCCImmunity()` at `skillEngine.js:1353` checks for `cc_immunity` passive, returns `true` if matching CC type.
- **Combat integration:** `hasCCImmunity` is NOT imported in `useCombat.js`. Stun application at `useCombat.js:1277` calls `applyStatusEffect` directly with no immunity check. No slow immunity check exists either.
- **Verdict:** **BROKEN** — Handler exists but is never called. Stuns and slows always apply regardless of this skill.
- **Fix:** Import `hasCCImmunity` and call it before `applyStatusEffect` for stun/slow at line 1277 and wherever slow is applied.

---

#### Shaman: Spirit Walk (Tier 2)
- **Claims:** "First turn of combat: +50% speed."
- **Data:** `skillTrees.js:1096` — `{ type: 'first_turn_speed', percent: 50 }`
- **Engine:** `getFirstTurnSpeedBonus()` at `skillEngine.js:1764` returns speed bonus percentage. In `applyPassiveEffects` at line 1106, the case just has `break` with comment "Handled in initiative calculation".
- **Combat integration:** `getFirstTurnSpeedBonus` is NOT imported in `useCombat.js`. Turn order/initiative calculation does not check for first-turn speed bonuses. The comment "Handled in initiative calculation" is incorrect — no such handling exists.
- **Verdict:** **BROKEN** — Handler exists, misleading comment, never called anywhere.
- **Fix:** Import `getFirstTurnSpeedBonus` and apply it to the hero's speed during initial turn order calculation in combat setup.

---

#### Knight: Stand Firm (Tier 1)
- **Claims:** "Immune to knockback and displacement."
- **Data:** `skillTrees.js:492` — `{ type: 'displacement_immunity' }`
- **Engine:** `hasDisplacementImmunity()` at `skillEngine.js:1643` checks for the passive type.
- **Combat integration:** NOT imported. No displacement/knockback mechanics exist in the combat system.
- **Verdict:** **BROKEN (Dead Code)** — Both the handler and the mechanic it guards are unimplemented. The skill does nothing because the threat it protects against doesn't exist.
- **Fix:** Either implement displacement mechanics OR redesign this skill to do something useful (e.g., immunity to forced movement from monster abilities).

---

### PARTIALLY BROKEN SKILLS

---

#### Mage: Arcane Surge (Tier 1)
- **Claims:** "First skill each combat deals +100% damage."
- **Data:** `skillTrees.js:1230` — `{ type: 'first_skill_bonus', damageBonus: 1.0 }`
- **Engine:** `applyPassiveEffects` at `skillEngine.js:1099` handles `first_skill_bonus`, checks `context.isFirstSkillUse`, adds `damageBonus` to multiplier.
- **Combat integration:** At `useCombat.js:1646`, `applyPassiveEffects` is called with context `{ target, killBonusStacks }` — `isFirstSkillUse` is NEVER set in the context object.
- **Verdict:** **BROKEN** — Code path exists in engine but combat loop never sets the required context flag.
- **Fix:** Track first skill use per hero per combat, pass `isFirstSkillUse: true` in context for the first skill activation.

---

#### Necromancer: Soul Harvest (Tier 1)
- **Claims:** "+15 max HP per enemy killed (dungeon)."
- **Data:** `skillTrees.js:1791` — `{ type: 'stacking_hp', hpPerKill: 15 }`
- **Engine:** `getOnKillEffects()` at `skillEngine.js:1256` populates `effects.stackingHp += passive.hpPerKill` and returns it.
- **Combat integration:** At `useCombat.js:2666`, `getOnKillEffects(actor)` is called but only `healAmount` and `healPercent` are consumed (lines 2667-2683). The `stackingHp` field is completely ignored.
- **Verdict:** **PARTIALLY BROKEN** — Handler correctly returns the value but the combat loop ignores it.
- **Fix:** After line 2683, check `skillOnKillEffects.stackingHp` and increase the hero's `maxHp` by that amount, also healing for the same amount.

---

#### Necromancer: Undying (Tier 2)
- **Claims:** "If would die above 50% HP, survive at 1 HP once."
- **Data:** `skillTrees.js:1824` — `{ type: 'conditional_cheat_death', threshold: 0.5 }`
- **Engine:** `checkCheatDeath()` at `skillEngine.js:1325` checks `conditional_cheat_death` type BUT does not validate the `threshold` condition. It triggers regardless of current HP ratio.
- **Combat integration:** `checkCheatDeath` IS properly called at `useCombat.js:2164` during death checks.
- **Verdict:** **PARTIALLY BROKEN** — Triggers correctly but ignores the HP threshold condition. Currently works identically to regular `cheat_death` (always triggers once).
- **Fix:** Add threshold check at `skillEngine.js:1327`: `if (passive.type === 'conditional_cheat_death' && hero.stats.hp / hero.stats.maxHp < passive.threshold) continue;` — but this needs pre-death HP, which requires passing the hero's HP before the killing blow.

---

#### Ranger: Steady Aim (Tier 0)
- **Claims:** Description says +15% crit chance. Data also contains `openerDamageBonus: 15`.
- **Data:** `skillTrees.js:1549` — `{ type: 'crit_bonus', percent: 15, openerDamageBonus: 15 }`
- **Engine:** The `crit_bonus` handler at `skillEngine.js:1068` reads `passive.percent` but NOT `passive.openerDamageBonus`. No code path reads this field.
- **Combat integration:** Crit bonus works. Opener damage bonus is dead data.
- **Verdict:** **PARTIALLY BROKEN** — The crit bonus works correctly, but the opener damage bonus is a dead field doing nothing.
- **Fix:** Either remove the dead field or process it (add opener_bonus logic that reads `openerDamageBonus` from crit_bonus passives).

---

### WORKING SKILLS (Verified)

All other passive types have complete chains from definition → engine → combat loop:

| Passive Type | Example Skill | Engine Function | Combat Call Site |
|---|---|---|---|
| stat_bonus | Warrior: Thick Skin | gameStore.js stat calc | Stats applied at hero creation |
| damage_reduction | Warrior: Iron Will | applyPassiveEffects | useCombat.js:1872 |
| damage_bonus | Mage: Elemental Mastery | applyPassiveEffects | useCombat.js:1646 |
| crit_bonus | Rogue: Precision | applyPassiveEffects | useCombat.js:1646 |
| lifesteal | Necromancer: Soul Rend | applyPassiveEffects | useCombat.js:1646 |
| double_attack_chance | Shaman: Wind Fury | applyPassiveEffects | useCombat.js:1646 |
| dodge_chance | Rogue: Quick Feet | applyPassiveEffects | useCombat.js:1460/1851 |
| reflect_damage/flat | Knight: Retaliation | getOnDamageTakenEffects | useCombat.js:1894 |
| counter_attack | Knight: Counter | getOnDamageTakenEffects | useCombat.js:1894 |
| on_kill_heal | Necromancer: Soul Siphon | getOnKillEffects | useCombat.js:2666 |
| on_hit_heal_percent | Warrior: Juggernaut | getOnHitEffects | useCombat.js:2372 |
| attack_dot | Mage: Ignite | getOnHitEffects | useCombat.js:2372 |
| party_regen | Paladin: Blessed Ground | getPerTurnEffects | useCombat.js:634 |
| damage_heals | Druid: Nature's Wrath | getPerTurnEffects | useCombat.js:634 |
| beacon_heal | Paladin: Beacon of Light | getBeaconHealInfo | useCombat.js:1308 |
| heal_shield | Cleric: Radiance | getHealShieldBonus | useCombat.js:1299 |
| living_seed | Druid: Living Seed | getLivingSeedInfo | useCombat.js:1333 + trigger at 2075 |
| dot_lifesteal | Necromancer: Necrosis | getDotLifestealPercent | useCombat.js:855 |
| armor_vs_dot | Knight: Armor Master | hasArmorVsDot | useCombat.js:775 |
| cheat_death | Warrior: Unbreakable | checkCheatDeath | useCombat.js:2164 |
| auto_revive | Druid: Rebirth | checkCheatDeath | useCombat.js:2164 |
| damage_sharing | Shaman: Spirit Link Totem | calculateDamageSharing | useCombat.js:1975 |
| reactive_taunt | Paladin: Righteous Defense | checkReactiveTaunt | useCombat.js:2050+ |
| martyr | Cleric: Martyr | checkMartyrIntercept | useCombat.js:1995 |
| redirect_damage | Knight: Fortress | checkDamageRedirect | useCombat.js:1958 |
| vengeance | Cleric: Retribution | checkVengeanceTrigger | useCombat.js:2209 |
| cooldown_reduction | Cleric: Meditation | getEffectiveCooldown | useCombat.js:1395 |
| summon_pet | Ranger: Beast Master | getSummonData/createPetUnit | useCombat.js:385/401 |
| shadow_clone | Rogue: Shadow Clone | getSummonData/createShadowClone | useCombat.js:385/407 |
| raise_dead | Necromancer: Raise Dead | checkRaiseDead/createRaisedUndead | useCombat.js:2695/1242 |
| taunt_party_bonus | Warrior: Warlord | getTauntPartyBonus | useCombat.js:1686 |

---

## 5. Task List

### Task 1: Import and integrate `checkReactiveHeal()` (HIGH IMPACT)
- **Unblocks:** Warrior Second Wind, Cleric Guardian Angel, Paladin Divine Intervention (3 skills, including 1 capstone)
- **Effort:** Medium
- **Approach:**
  1. Add `checkReactiveHeal` to imports in `useCombat.js:5-32`
  2. In the hero damage-taken block (~line 2060), after damage is applied to a hero, iterate all alive heroes and call `checkReactiveHeal(healer, damagedHero)`. If triggered with `preventDeath`, heal the ally to `healPercent * maxHp` before death processing. If triggered without `preventDeath`, heal the target. Track a `reactiveHealUsed` set per combat for `save_ally` once-per-room.
  3. Also call in the death-check block (~line 2164) before `checkCheatDeath` for the `save_ally` case.
- **Dependencies:** None

### Task 2: Import and integrate `getHotBonuses()` (MEDIUM IMPACT)
- **Unblocks:** Druid Lifebloom, Druid Overgrowth (2 skills)
- **Effort:** Medium
- **Approach:**
  1. Add `getHotBonuses` to imports in `useCombat.js:5-32`
  2. When processing HOT ticks (buff duration handling ~line 700+), call `getHotBonuses(hero)`. Apply `hotMultiplier` to the final tick's healing amount when `hotDuration === 1`. Use `maxStacks` when applying new HOTs to allow stacking instead of replacing.
- **Dependencies:** None

### Task 3: Import and integrate `hasCCImmunity()` (MEDIUM IMPACT)
- **Unblocks:** Warrior Unstoppable (1 skill)
- **Effort:** Small
- **Approach:**
  1. Add `hasCCImmunity` to imports in `useCombat.js:5-32`
  2. Before `applyStatusEffect(mockTarget, 'stun', ...)` at line 1277, check `if (hasCCImmunity(target, 'stun'))` and skip application if true. Log "Immune!" message.
  3. Add similar check wherever slow effects are applied.
- **Dependencies:** None

### Task 4: Consume `stackingHp` from `getOnKillEffects()` (SMALL IMPACT)
- **Unblocks:** Necromancer Soul Harvest (1 skill)
- **Effort:** Small
- **Approach:**
  1. After line 2683 in `useCombat.js`, check `skillOnKillEffects.stackingHp > 0`
  2. Increase the hero's `maxHp` and current `hp` by `stackingHp` amount
  3. Add combat log and heal effect
- **Dependencies:** None

### Task 5: Pass `isFirstSkillUse` context in combat loop (SMALL IMPACT)
- **Unblocks:** Mage Arcane Surge (1 skill)
- **Effort:** Small
- **Approach:**
  1. Add a per-hero tracking object `firstSkillUsed = {}` in the combat tick
  2. When `executeSkillAbility` is called (~line 1018), check if `!firstSkillUsed[actor.id]`
  3. If first skill use, set `firstSkillUsed[actor.id] = true` and include `isFirstSkillUse: true` in the passive context when calling `applyPassiveEffects` at line 1646
- **Dependencies:** None

### Task 6: Fix `conditional_cheat_death` threshold check (SMALL IMPACT)
- **Unblocks:** Necromancer Undying working correctly (1 skill fix)
- **Effort:** Small
- **Approach:**
  1. In `checkCheatDeath` at `skillEngine.js:1325`, add threshold check:
     ```javascript
     if (passive.type === 'conditional_cheat_death') {
       // Need pre-death HP ratio - must be passed in combatState
       const preDeathHpRatio = combatState.preDeathHpRatio || 0;
       if (preDeathHpRatio < passive.threshold) continue;
     }
     ```
  2. In `useCombat.js` where `checkCheatDeath` is called (~line 2164), pass the hero's HP ratio before the killing blow in `combatState.preDeathHpRatio`.
- **Dependencies:** None

### Task 7: Import and integrate `getFirstTurnSpeedBonus()` (SMALL IMPACT)
- **Unblocks:** Shaman Spirit Walk (1 skill)
- **Effort:** Small
- **Approach:**
  1. Add `getFirstTurnSpeedBonus` to imports in `useCombat.js:5-32`
  2. In combat setup / turn order initialization (~line 330+), when building the initial turn order, apply `getFirstTurnSpeedBonus(hero)` to each hero's speed for the initial sort. Only affects first round's initiative.
- **Dependencies:** None

### Task 8: Redesign Knight Stand Firm (LOW PRIORITY)
- **Unblocks:** Knight Stand Firm (1 skill)
- **Effort:** Medium-Large (requires designing new mechanic or implementing displacement)
- **Approach:** Either:
  - (A) Implement knockback/push mechanics on certain monster abilities, then call `hasDisplacementImmunity()` to block them
  - (B) Redesign the skill to something useful (e.g., "Cannot be moved from position, +10% defense" as a positional bonus)
- **Dependencies:** Game design decision needed

### Task 9: Clean up dead data field (LOW PRIORITY)
- **Unblocks:** Clarity only
- **Effort:** Small
- **Approach:** Remove `openerDamageBonus: 15` from `skillTrees.js:1549` since it's on a `crit_bonus` type passive and never read. Or convert the skill to use `opener_bonus` type if intended.
- **Dependencies:** None

---

## 6. Agent Reference Sections

### Import Context

**`src/hooks/useCombat.js` (lines 5-32) — Current imports from skillEngine:**
```javascript
import {
  chooseBestSkill,
  executeSkillAbility,
  applyPassiveEffects,
  getEffectiveCooldown,
  getOnHitEffects,
  getOnKillEffects,
  getOnDamageTakenEffects,
  checkCheatDeath,
  getPerTurnEffects,
  checkMartyrIntercept,
  getSummonData,
  createPetUnit,
  createShadowClone,
  checkRaiseDead,
  createRaisedUndead,
  checkVengeanceTrigger,
  getPartyAuraEffects,
  getTauntPartyBonus,
  checkReactiveTaunt,
  checkDamageRedirect,
  calculateDamageSharing,
  getBeaconHealInfo,
  getHealShieldBonus,
  getLivingSeedInfo,
  getDotLifestealPercent,
  hasArmorVsDot,
} from '../game/skillEngine';
```

**Functions that need to be ADDED to this import:**
- `checkReactiveHeal` (Task 1)
- `getHotBonuses` (Task 2)
- `hasCCImmunity` (Task 3)
- `getFirstTurnSpeedBonus` (Task 7)

### Code Patterns to Copy

**Pattern A: "Import function, call on damage taken, apply result"**
Working example — Living Seed trigger (`useCombat.js:2073-2094`):
```javascript
// Check for living seed trigger (Druid Living Seed - heal when hit)
const targetBuffs = newBuffs[target.id] || {};
if (targetBuffs.livingSeed) {
  let seedHeal = Math.floor(target.stats.maxHp * targetBuffs.livingSeed);
  // ... apply heal, log, effect
  delete newBuffs[target.id].livingSeed;
}
```

**Pattern B: "Import function, check before status effect application"**
Working example — Armor vs DoT (`useCombat.js:775-778`):
```javascript
if (hasArmorVsDot(actor)) {
  const reduction = Math.floor(actor.stats.defense * 0.5);
  dotDamage = Math.max(1, dotDamage - reduction);
}
```

**Pattern C: "Import function, call after kill, consume return values"**
Working example — On-kill effects (`useCombat.js:2666-2683`):
```javascript
const skillOnKillEffects = getOnKillEffects(actor);
if (skillOnKillEffects.healAmount > 0 || skillOnKillEffects.healPercent > 0) {
  const actorHeroIdx = findHeroIndex(actor.id);
  if (actorHeroIdx !== -1) {
    let healAmount = skillOnKillEffects.healAmount + Math.floor(maxHp * skillOnKillEffects.healPercent);
    // ... apply heal
  }
}
```

**Pattern D: "Import function, call on heal, apply bonus"**
Working example — Heal Shield (`useCombat.js:1299-1305`):
```javascript
const healShieldInfo = getHealShieldBonus(actor);
if (healShieldInfo.hasHealShield) {
  const shieldAmount = Math.floor(result.amount * healShieldInfo.percent);
  if (!newBuffs[result.targetId]) newBuffs[result.targetId] = {};
  newBuffs[result.targetId].shield = (newBuffs[result.targetId].shield || 0) + shieldAmount;
  addCombatLog({ type: 'system', message: `${healShieldInfo.skillName}! ${h.name} gains ${shieldAmount} shield` });
}
```

### Task Dependencies

```
Independent (can be done in any order / parallel):
  Task 1: checkReactiveHeal     ─── 3 skills fixed
  Task 2: getHotBonuses         ─── 2 skills fixed
  Task 3: hasCCImmunity         ─── 1 skill fixed
  Task 4: stackingHp            ─── 1 skill fixed
  Task 5: isFirstSkillUse       ─── 1 skill fixed
  Task 6: conditional threshold ─── 1 skill fixed
  Task 7: firstTurnSpeed        ─── 1 skill fixed

Deferred:
  Task 8: Stand Firm redesign   ─── 1 skill, needs design decision
  Task 9: Dead data cleanup     ─── cosmetic
```

**Recommended execution order (quick wins first):**
1. Phase 1 (Quick Wins): Tasks 3, 4, 5, 6, 7 — all Small effort, each fixes 1 skill
2. Phase 2 (High Impact): Task 1 — fixes 3 skills including a capstone
3. Phase 3 (Medium): Task 2 — fixes 2 Druid skills, requires HOT system changes
4. Phase 4 (Deferred): Tasks 8, 9 — design decisions and cleanup

### File Conflict Zones

All tasks primarily modify `useCombat.js`. Line regions touched:

| Task | File | Lines Affected | Action |
|------|------|---------------|--------|
| 1, 2, 3, 7 | useCombat.js | 5-32 | Add imports (append to existing block) |
| 3 | useCombat.js | ~1277 | Add CC immunity check before stun application |
| 1 | useCombat.js | ~2060-2100 | Add reactive heal check in damage-taken block |
| 1 | useCombat.js | ~2164 | Add save_ally check before cheat death |
| 4 | useCombat.js | ~2683 | Add stackingHp consumption after on-kill heal |
| 5 | useCombat.js | ~1018, 1646 | Track first skill use, pass context |
| 2 | useCombat.js | ~700 | Modify HOT tick processing |
| 7 | useCombat.js | ~330 | Modify turn order initialization |
| 6 | skillEngine.js | ~1325 | Add threshold check |

**Low conflict risk:** Most tasks touch different line regions of useCombat.js. The only shared zone is the import block (lines 5-32), which can be modified once for all tasks.

### Testing

The project has no automated tests. To verify fixes:

1. **Manual testing approach:** Start a dungeon run with a hero who has the fixed skill unlocked. Observe combat logs for the expected skill trigger messages.
2. **For each fix, verify:**
   - Skill triggers at the correct time (on damage taken, on kill, on first turn, etc.)
   - The effect is applied correctly (heal amount, immunity, speed bonus, etc.)
   - Combat log message appears confirming the trigger
   - No errors in browser console
3. **Combat simulator:** `src/game/combatSimulator.js` can be used for automated balance testing — it already calls some skill engine functions. Could be extended to test the newly integrated functions.
4. **Quick smoke test per task:**
   - Task 1: Take a Cleric with Guardian Angel to a dungeon. Watch for "Guardian Angel! X heals Y HP" in logs when an ally drops below 40%.
   - Task 2: Take a Druid with Lifebloom. Apply a HOT and watch for enhanced final tick healing.
   - Task 3: Take a Warrior with Unstoppable against stunning enemies. Should see "Immune!" in logs.
   - Task 4: Take a Necromancer with Soul Harvest. Kill enemies and check maxHp increases.
   - Task 5: Take a Mage with Arcane Surge. First skill should show double damage.
   - Task 6: Take a Necromancer with Undying. Should only trigger cheat death when above 50% HP.
   - Task 7: Take a Shaman with Spirit Walk. Should act earlier in first round.
