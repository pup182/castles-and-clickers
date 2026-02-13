import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { RAIDS, getAllRaids, isRaidUnlocked, getRaidUniqueIds } from '../data/raids';
import { getUniqueItem } from '../data/uniqueItems';
import { CLASSES } from '../data/classes';
import { CrownIcon, LockIcon, SkullIcon, CheckIcon } from './icons/ui';
import { RaidBossIcon } from './icons/raidBosses';
import ItemIcon from './icons/ItemIcon';

// Helper to format class restrictions
const formatClassRestrictions = (classes) => {
  if (!classes || classes.length === 0) return 'All Classes';
  return classes.map(c => CLASSES[c]?.name || c).join(', ');
};

// Rarity colors for display
const RARITY_COLORS = {
  unique: '#06b6d4',
  legendary: '#f59e0b',
  epic: '#a855f7',
  rare: '#3b82f6',
  uncommon: '#22c55e',
  common: '#9ca3af',
};

// Boss preview component - shows boss sprite, name, and unique drops with details
const BossPreview = ({ boss, isOwned, isFinal = false }) => {
  const uniqueDropIds = useMemo(() => {
    if (!boss.dropTable) return [];
    return boss.dropTable
      .filter(drop => drop.type === 'unique')
      .map(drop => drop.itemId);
  }, [boss.dropTable]);

  return (
    <div className={`p-3 rounded ${isFinal ? 'bg-red-900/20 border border-red-900/30' : 'bg-gray-800/50'}`}>
      {/* Boss header with sprite */}
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-12 h-12 rounded border flex items-center justify-center ${
          isFinal ? 'border-red-500/50 bg-red-900/30' : 'border-gray-600 bg-gray-800'
        }`}>
          <RaidBossIcon spriteId={boss.spriteId} size={40} />
        </div>
        <div>
          <span className={`text-sm font-medium ${isFinal ? 'text-red-300' : 'text-gray-200'}`}>
            {boss.name}
          </span>
        </div>
      </div>
      {/* Unique drops with icons and descriptions */}
      {uniqueDropIds.length > 0 && (
        <div className="space-y-2 ml-2">
          {uniqueDropIds.map(itemId => {
            const item = getUniqueItem(itemId);
            if (!item) return null;
            const owned = isOwned(itemId);
            return (
              <div
                key={itemId}
                className={`flex items-start gap-2 p-2 rounded border ${
                  owned
                    ? 'bg-cyan-900/20'
                    : 'bg-gray-900/50'
                }`}
                style={{ borderColor: owned ? RARITY_COLORS.unique : `${RARITY_COLORS.unique}40` }}
              >
                <div className="flex-shrink-0">
                  <ItemIcon
                    item={{ templateId: itemId, slot: item.slot, rarity: 'unique' }}
                    size={28}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium flex items-center gap-1" style={{ color: RARITY_COLORS.unique }}>
                    {item.name}
                    {owned && <CheckIcon size={12} className="text-green-400" />}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    <span style={{ color: RARITY_COLORS.unique }}>{item.uniquePower?.name}:</span> {item.uniquePower?.description}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {formatClassRestrictions(item.classes)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Raid icon mapping - each raid gets a unique icon
const RAID_ICONS = {
  sunken_temple: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="2" width="10" height="2" fill="currentColor" />
      <rect x="4" y="4" width="2" height="8" fill="currentColor" />
      <rect x="10" y="4" width="2" height="8" fill="currentColor" />
      <rect x="6" y="6" width="4" height="4" fill="currentColor" opacity="0.6" />
      <rect x="3" y="12" width="10" height="2" fill="currentColor" />
    </svg>
  ),
  cursed_manor: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="10" width="12" height="4" fill="currentColor" />
      <rect x="4" y="6" width="8" height="4" fill="currentColor" />
      <rect x="6" y="2" width="4" height="4" fill="currentColor" />
      <rect x="7" y="1" width="2" height="2" fill="currentColor" />
      <rect x="5" y="11" width="2" height="3" fill="currentColor" opacity="0.3" />
      <rect x="9" y="11" width="2" height="3" fill="currentColor" opacity="0.3" />
    </svg>
  ),
  sky_fortress: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="1" width="4" height="3" fill="currentColor" />
      <rect x="4" y="4" width="8" height="2" fill="currentColor" />
      <rect x="3" y="6" width="10" height="4" fill="currentColor" />
      <rect x="2" y="10" width="12" height="2" fill="currentColor" />
      <rect x="1" y="12" width="3" height="2" fill="currentColor" />
      <rect x="12" y="12" width="3" height="2" fill="currentColor" />
    </svg>
  ),
  the_abyss: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="6" y="2" width="4" height="2" fill="currentColor" />
      <rect x="4" y="4" width="8" height="2" fill="currentColor" />
      <rect x="2" y="6" width="12" height="3" fill="currentColor" />
      <rect x="3" y="9" width="10" height="2" fill="currentColor" />
      <rect x="5" y="11" width="6" height="2" fill="currentColor" />
      <rect x="7" y="13" width="2" height="2" fill="currentColor" />
    </svg>
  ),
  void_throne: ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="10" width="12" height="4" fill="currentColor" />
      <rect x="2" y="6" width="3" height="4" fill="currentColor" />
      <rect x="11" y="6" width="3" height="4" fill="currentColor" />
      <rect x="5" y="8" width="6" height="6" fill="currentColor" />
      <rect x="6" y="3" width="4" height="5" fill="currentColor" />
      <rect x="7" y="1" width="2" height="3" fill="currentColor" />
    </svg>
  ),
};

// Raid theme colors
const RAID_COLORS = {
  sunken_temple: '#0ea5e9',
  cursed_manor: '#a855f7',
  sky_fortress: '#3b82f6',
  the_abyss: '#1e3a8a',
  void_throne: '#6d28d9',
};

// Raid card component - Multi-boss dungeon system
const RaidCard = ({ raid, isUnlocked, ownedUniques, runCount, onEnterRaid, isExpanded, onToggle }) => {
  const raidUniqueIds = useMemo(() => getRaidUniqueIds(raid.id), [raid.id]);
  const ownedCount = raidUniqueIds.filter(id => ownedUniques.includes(id)).length;

  const isOwned = (itemId) => ownedUniques.includes(itemId);

  const totalBosses = raid.wingBosses.length + 1; // +1 for final boss
  const RaidIcon = RAID_ICONS[raid.id] || CrownIcon;
  const raidColor = RAID_COLORS[raid.id] || '#3b82f6';

  return (
    <div className="mb-4">
      {/* Raid header */}
      <div
        className={`pixel-panel p-3 transition-all ${
          isUnlocked
            ? 'hover:border-blue-400'
            : 'opacity-60'
        }`}
        style={isUnlocked ? { borderColor: raidColor } : {}}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`w-12 h-12 rounded border-2 flex items-center justify-center ${
                isUnlocked ? '' : 'border-gray-600 bg-gray-800'
              }`}
              style={isUnlocked ? { borderColor: raidColor, backgroundColor: `${raidColor}20` } : {}}
            >
              <RaidIcon size={28} className={isUnlocked ? '' : 'text-gray-500'} style={isUnlocked ? { color: raidColor } : {}} />
            </div>
            <div className="flex-1">
              <h3 className="pixel-subtitle">{raid.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{raid.description}</p>
              <div className="text-xs text-gray-500 mt-1">
                <span className="text-yellow-500">Lv {raid.recommendedLevel}</span> · {totalBosses} bosses
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            {/* Stats */}
            <div className="text-right">
              <div className="text-xs" style={{ color: RARITY_COLORS.unique }}>
                {ownedCount}/{raidUniqueIds.length} uniques
              </div>
              {runCount > 0 && (
                <div className="text-xs text-gray-500">
                  {runCount} run{runCount !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            {/* Quick Enter Button */}
            {isUnlocked ? (
              <button
                onClick={() => onEnterRaid(raid.id)}
                className="pixel-btn pixel-btn-primary px-4 py-2 text-sm whitespace-nowrap"
              >
                Enter
              </button>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-1">
                <LockIcon size={12} /> Lv {raid.requiredLevel}
              </div>
            )}
          </div>
        </div>
        {/* Expand/collapse toggle */}
        <button
          onClick={onToggle}
          className="w-full mt-2 pt-2 border-t border-gray-700/50 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {isExpanded ? '▲ Hide details' : '▼ Show bosses & drops'}
        </button>
      </div>

      {/* Expanded raid details */}
      {isExpanded && (
        <div className="mt-2 ml-4 pixel-panel p-3">
          {/* Guardians (intermediate bosses) */}
          <div className="mb-3">
            <div className="text-xs text-gray-400 mb-2">Guardians ({raid.wingBosses.length})</div>
            <div className="space-y-2">
              {raid.wingBosses.map(boss => (
                <BossPreview key={boss.id} boss={boss} isOwned={isOwned} />
              ))}
            </div>
          </div>

          {/* Final boss */}
          <div>
            <div className="text-xs text-red-400 mb-2">Final Boss</div>
            <BossPreview boss={raid.finalBoss} isOwned={isOwned} isFinal />
          </div>
        </div>
      )}
    </div>
  );
};

// Stable empty objects for selectors
const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];

const RaidSelectorModal = ({ onClose }) => {
  const [expandedRaid, setExpandedRaid] = useState(null);

  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);
  const ownedUniques = useGameStore(state => state.ownedUniques) || EMPTY_ARRAY;
  const heroes = useGameStore(state => state.heroes);
  const dungeon = useGameStore(state => state.dungeon);
  const raidState = useGameStore(state => state.raidState);
  const raidRuns = useGameStore(state => state.stats?.raidRuns) || EMPTY_OBJECT;
  const enterRaid = useGameStore(state => state.enterRaid);

  const raids = useMemo(() => getAllRaids(), []);

  const canStart = heroes.filter(Boolean).length > 0;

  const handleEnterRaid = (raidId) => {
    if (!canStart) return;
    const success = enterRaid(raidId);
    if (success) {
      onClose();
    }
  };

  const toggleRaid = (raidId) => {
    setExpandedRaid(expandedRaid === raidId ? null : raidId);
  };

  // Calculate total collection progress
  const collectionStats = useMemo(() => {
    let total = 0;
    let owned = 0;
    for (const raid of raids) {
      const raidUniques = getRaidUniqueIds(raid.id);
      total += raidUniques.length;
      owned += raidUniques.filter(id => ownedUniques.includes(id)).length;
    }
    return { total, owned };
  }, [raids, ownedUniques]);

  return (
    <div className="space-y-4">
      {/* Warnings */}
      {!canStart && (
        <div className="pixel-panel text-sm p-3" style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)' }}>
          You need at least one hero to enter a raid!
        </div>
      )}

      {dungeon && !raidState.active && (
        <div className="pixel-panel text-sm p-3" style={{ borderColor: '#ff8844', color: '#ff8844' }}>
          Starting a raid will abandon your current dungeon (Level {dungeon.level})
        </div>
      )}

      {raidState.active && (
        <div className="pixel-panel p-3 mb-2 flex items-center gap-3" style={{ borderColor: RAID_COLORS[raidState.raidId] || '#3b82f6' }}>
          <CrownIcon size={20} style={{ color: RAID_COLORS[raidState.raidId] || '#3b82f6' }} />
          <div className="flex-1">
            <div className="text-sm font-bold" style={{ color: RAID_COLORS[raidState.raidId] || '#3b82f6' }}>
              Currently in: {RAIDS[raidState.raidId]?.name || 'Unknown'}
            </div>
            <div className="text-xs text-gray-400">
              {raidState.defeatedWingBosses?.length || 0}/{RAIDS[raidState.raidId]?.wingBosses?.length || 0} guardians defeated
            </div>
          </div>
        </div>
      )}

      {/* Collection progress */}
      <div className="pixel-panel-dark p-3">
        <div className="flex justify-between items-center mb-2">
          <span className="pixel-subtitle">Unique Collection</span>
          <span style={{ color: RARITY_COLORS.unique }}>
            {collectionStats.owned}/{collectionStats.total}
          </span>
        </div>
        <div className="pixel-bar h-2">
          <div
            className="pixel-bar-fill"
            style={{
              width: `${collectionStats.total > 0 ? (collectionStats.owned / collectionStats.total) * 100 : 0}%`,
              backgroundColor: RARITY_COLORS.unique,
            }}
          />
        </div>
      </div>

      {/* Info hint */}
      <div className="text-xs text-gray-500 px-1">
        Defeat the guardians to unlock the final boss. Each boss can drop unique legendary items!
      </div>

      {/* Raid list */}
      <div>
        {raids.map(raid => (
          <RaidCard
            key={raid.id}
            raid={raid}
            isUnlocked={isRaidUnlocked(raid.id, highestDungeonCleared)}
            ownedUniques={ownedUniques}
            runCount={raidRuns[raid.id] || 0}
            onEnterRaid={handleEnterRaid}
            isExpanded={expandedRaid === raid.id}
            onToggle={() => toggleRaid(raid.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default RaidSelectorModal;
