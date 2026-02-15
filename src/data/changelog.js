// Single source of truth for the app version
export const CURRENT_VERSION = '0.1.25';

// Changelog entries, newest first
// always write for player, not developer
export const CHANGELOG = [
  {
    version: '0.1.25',
    title: 'Under-the-Hood Improvements',
    date: '2026-02-14',
    changes: [
      { type: 'feature', text: 'Smaller download size — combat simulator no longer ships in the production build' },
      { type: 'feature', text: 'Internal code reorganization for faster future updates' },
    ],
  },
  {
    version: '0.1.23',
    title: 'Buff Refunds & Raid Polish',
    date: '2026-02-14',
    changes: [
      { type: 'feature', text: 'Consumable buffs (elixirs, XP scrolls) now apply to raids too' },
      { type: 'feature', text: 'Dungeon buffs are refunded if you fail or abandon a dungeon — no more wasted gold' },
      { type: 'fix', text: 'Offline progress now correctly unlocks auto-advance at D5' },
      { type: 'fix', text: 'Fixed shop items sometimes having mismatched stats after rarity capping' },
      { type: 'fix', text: 'Fixed healing potion "Use" button breaking when owning multiple potions' },
    ],
  },
  {
    version: '0.1.22',
    title: 'Shop Rework & Consumables',
    date: '2026-02-14',
    changes: [
      { type: 'feature', text: 'New Consumables tab in the shop — buy healing potions, XP scrolls, and stat elixirs' },
      { type: 'feature', text: 'Shop now scales with progress: higher rarities unlock at D10, D20, and D25' },
      { type: 'feature', text: 'Added "Sell Non-Upgrades" button to quickly clear junk from your inventory' },
      { type: 'balance', text: 'Respec cost is now linear (250g per point) instead of exponential' },
      { type: 'balance', text: 'Heroes earn their first skill point at level 2 and choose their own starter skill' },
      { type: 'balance', text: 'Elite mobs now appear starting at dungeon 8 instead of 10' },     
      { type: 'fix', text: 'Fixed healing potions healing for the wrong amount' },
      { type: 'fix', text: 'Fixed attack and defense elixirs applying their bonus twice' },
    ],
  },
  {
    version: '0.1.21',
    title: "What's New",
    date: '2026-02-14',
    changes: [
      { type: 'feature', text: 'Added a "What\'s New" popup so you can see what changed after each update' },
      { type: 'feature', text: 'Click the version number in the header to revisit the changelog anytime' },
    ],
  },
  {
    version: '0.1.20',
    title: 'Bug Fixes & Balance',
    date: '2026-02-13',
    changes: [
      { type: 'fix', text: 'Fixed combat log slowing down during very long dungeon runs' },
      { type: 'balance', text: 'Smoothed difficulty curve for dungeon levels 25–30' },
      { type: 'fix', text: 'Unique item drop celebration no longer gets stuck on fast clears' },
    ],
  },
  {
    version: '0.1.19',
    title: 'Performance Improvements',
    date: '2026-02-12',
    changes: [
      { type: 'feature', text: 'Significant performance boost — less lag during combat and menus' },
      { type: 'fix', text: 'Fixed old saves occasionally losing new feature flags on load' },
    ],
  },
  {
    version: '0.1.18',
    title: 'Combat Polish',
    date: '2026-02-11',
    changes: [
      { type: 'fix', text: 'Fixed turn order glitches when speed buffs expire mid-combat' },
      { type: 'balance', text: 'Healers now prioritize the lowest-HP ally more consistently' },
    ],
  },
  {
    version: '0.1.17',
    title: 'Stability & Saving',
    date: '2026-02-10',
    changes: [
      { type: 'feature', text: 'Game now auto-saves more frequently during raids' },
      { type: 'fix', text: 'Fixed a rare crash when abandoning a raid during a boss phase transition' },
      { type: 'fix', text: 'Improved recovery if something goes wrong mid-combat' },
    ],
  },
];

// Max entries to show in the changelog modal
const MAX_CHANGELOG_ENTRIES = 5;

/**
 * Returns changelog entries newer than the given version, capped at MAX_CHANGELOG_ENTRIES.
 * If lastSeenVersion is null/undefined, returns the most recent entries up to the limit.
 */
export function getChangesSince(lastSeenVersion) {
  if (!lastSeenVersion) return CHANGELOG.slice(0, MAX_CHANGELOG_ENTRIES);

  const result = [];
  for (const entry of CHANGELOG) {
    if (entry.version === lastSeenVersion) break;
    result.push(entry);
    if (result.length >= MAX_CHANGELOG_ENTRIES) break;
  }
  return result;
}
