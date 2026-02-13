Perform a comprehensive audit of is the ui good? does it do its job? does it look cool? also do they have unique animations AND unique icons on the skill tree sheet or showcases in this codebase.

Audit every \[unit of the feature — e.g., "skill tree node", "homestead upgrade",
"affix", "monster ability", "raid mechanic"] and determine whether its described/intended
behavior actually works in-game.

## What to produce

### 1\. Files Involved

List every source file relevant to this feature with a one-line description and line count.

### 2\. Status Summary

Categorize every \[unit] into a table: **Working**, **Partially Working**,
or **Completely Broken**, with counts.

### 3\. Root Causes

Group all bugs into systemic categories (e.g., "functions imported but never called",
"return values never consumed", "data defined but no code path exists", "UI has no
awareness of this state"). For each category, list affected items in a table with the
specific function/field/property involved.

### 4\. Per-Item Detailed Audit

For EACH \[unit], document:

* **What it claims to do** (from data/definitions)
* **Engine/logic path** — trace exactly how the code processes it, with file:line references
* **Combat/game loop integration** — where results are consumed, with file:line references
* **Verdict** — Working / Partially Working (what works + what's broken) / Broken (why)
* For broken items: **one-line fix description**

### 5\. Task List

Create numbered tasks ordered by impact (how many items each fix unblocks), including:

* Which items it unblocks
* Effort estimate (Small / Medium / Large)
* Specific approach with file locations and approximate line numbers
* Dependencies on other tasks

### 6\. Agent Reference Sections

These sections are for AI agents that will implement the fixes:

* **Import Context** — What's already imported in each file (avoid duplicate imports)
* **Code Patterns to Copy** — Find WORKING examples of similar patterns elsewhere in the
  codebase and include them as labeled snippets with line references. These serve as
  templates for fixes.
* **Task Dependencies** — ASCII dependency graph + recommended phased execution order
  (quick wins first, display/polish last)
* **File Conflict Zones** — Table of which line regions in hot files are touched by
  which tasks (to manage line shifts during multi-task edits)
* **Testing** — How to verify changes given the project's testing situation

## Rules

* Trace ACTUAL code paths, not just intent. If a function exists but is never called,
  that's broken regardless of how correct the function's internals are.
* Check the full chain: data definition → engine processing → game loop consumption →
  UI display. A break at ANY point in this chain means the feature is broken.
* Include exact line numbers (approximate is fine, note they may shift).
* When a return value is populated but the caller ignores it, flag it explicitly.
* When data properties exist with no corresponding code path, flag them explicitly.
* Do NOT propose fixes inline — keep all fixes in the Task List section.
* Be exhaustive. Audit every single \[unit], not just the ones that look broken.
