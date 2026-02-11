import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { MONSTERS } from '../data/monsters';
import { DUNGEON_TIERS } from '../data/milestones';
import { SkullIcon, CrownIcon, SwordIcon, ShieldIcon, SpeedIcon, HeartIcon } from './icons/ui';
import { MonsterIcon } from './icons/monsters';

// Format large numbers with K/M suffixes
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

// Get tier info for a monster
const getTierInfo = (tier) => {
  const tierData = DUNGEON_TIERS.find(t => t.id === tier);
  return tierData || { name: 'Unknown', color: '#888' };
};

const MonsterCard = ({ monster, killData, isDiscovered }) => {
  const tierInfo = getTierInfo(monster.tier);
  const isBoss = killData?.isBoss || false;

  if (!isDiscovered) {
    return (
      <div className="pixel-panel p-3 opacity-50">
        <div className="flex items-center gap-3">
          <div className="filter grayscale opacity-30">
            <MonsterIcon monsterId={monster.id} size={40} />
          </div>
          <div className="flex-1">
            <div className="font-medium text-[var(--color-text-dim)]">???</div>
            <div className="text-xs text-[var(--color-text-dim)]" style={{ color: tierInfo.color }}>
              {tierInfo.name}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`pixel-panel p-3 ${isBoss ? 'border-[var(--color-gold)]' : ''}`}
      style={isBoss ? { backgroundColor: 'rgba(255, 215, 0, 0.1)' } : {}}
    >
      <div className="flex items-center gap-3">
        <MonsterIcon monsterId={monster.id} size={40} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--color-text)] truncate">
              {monster.name}
            </span>
            {isBoss && <CrownIcon size={14} className="text-[var(--color-gold)]" />}
          </div>
          <div className="text-xs" style={{ color: tierInfo.color }}>
            {tierInfo.name}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 text-[var(--color-red)]">
            <SkullIcon size={14} />
            <span className="text-sm font-bold">{formatNumber(killData?.count || 0)}</span>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-2 pt-2 border-t border-[var(--color-border)] grid grid-cols-4 gap-1 text-xs">
        <div className="flex items-center gap-1 text-[var(--color-red)]" title="Attack">
          <SwordIcon size={12} />
          <span>{monster.baseStats.attack}</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--color-blue)]" title="Defense">
          <ShieldIcon size={12} />
          <span>{monster.baseStats.defense}</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--color-green)]" title="HP">
          <HeartIcon size={12} />
          <span>{monster.baseStats.maxHp}</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--color-purple)]" title="Speed">
          <SpeedIcon size={12} />
          <span>{monster.baseStats.speed}</span>
        </div>
      </div>
    </div>
  );
};

const BestiaryScreen = () => {
  const monsterKills = useGameStore(state => state.stats?.monsterKills || {});
  const [selectedTier, setSelectedTier] = useState('all');

  // Organize monsters by tier
  const monstersByTier = useMemo(() => {
    const byTier = {};
    Object.values(MONSTERS).forEach(monster => {
      const tier = monster.tier;
      if (!byTier[tier]) byTier[tier] = [];
      byTier[tier].push(monster);
    });
    // Sort each tier by name
    Object.keys(byTier).forEach(tier => {
      byTier[tier].sort((a, b) => a.name.localeCompare(b.name));
    });
    return byTier;
  }, []);

  // Calculate discovery stats
  const discoveryStats = useMemo(() => {
    const total = Object.keys(MONSTERS).length;
    const discovered = Object.keys(monsterKills).length;
    const totalKills = Object.values(monsterKills).reduce((sum, m) => sum + (m.count || 0), 0);
    const bossKills = Object.values(monsterKills).filter(m => m.isBoss).reduce((sum, m) => sum + (m.count || 0), 0);
    return { total, discovered, totalKills, bossKills };
  }, [monsterKills]);

  // Filter monsters based on selected tier
  const displayedMonsters = useMemo(() => {
    if (selectedTier === 'all') {
      return Object.entries(monstersByTier).sort(([a], [b]) => parseInt(a) - parseInt(b));
    }
    const tier = parseInt(selectedTier);
    return [[tier, monstersByTier[tier] || []]];
  }, [selectedTier, monstersByTier]);

  // Get unique tiers for filter
  const availableTiers = useMemo(() => {
    return [...new Set(Object.values(MONSTERS).map(m => m.tier))].sort((a, b) => a - b);
  }, []);

  return (
    <div className="space-y-4">
      {/* Discovery Progress */}
      <div className="pixel-panel p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm text-[var(--color-text-dim)]">Discovery Progress</h3>
          <span className="text-lg font-bold text-[var(--color-gold)]">
            {discoveryStats.discovered}/{discoveryStats.total}
          </span>
        </div>
        <div className="w-full bg-[var(--color-bg-dark)] rounded h-2 overflow-hidden">
          <div
            className="h-full bg-[var(--color-gold)] transition-all duration-300"
            style={{ width: `${(discoveryStats.discovered / discoveryStats.total) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[var(--color-text-dim)]">
          <span>Total Kills: {formatNumber(discoveryStats.totalKills)}</span>
          <span>Boss Kills: {formatNumber(discoveryStats.bossKills)}</span>
        </div>
      </div>

      {/* Tier Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedTier('all')}
          className={`pixel-btn text-sm ${selectedTier === 'all' ? 'pixel-btn-primary' : ''}`}
        >
          All
        </button>
        {availableTiers.map(tier => {
          const tierInfo = getTierInfo(tier);
          return (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier.toString())}
              className={`pixel-btn text-sm ${selectedTier === tier.toString() ? 'pixel-btn-primary' : ''}`}
              style={selectedTier === tier.toString() ? {} : { borderColor: tierInfo.color, color: tierInfo.color }}
            >
              {tierInfo.name}
            </button>
          );
        })}
      </div>

      {/* Monster Grid */}
      {displayedMonsters.map(([tier, monsters]) => (
        <div key={tier}>
          {selectedTier === 'all' && (
            <h4
              className="text-sm font-medium mb-2 flex items-center gap-2"
              style={{ color: getTierInfo(parseInt(tier)).color }}
            >
              {getTierInfo(parseInt(tier)).name}
              <span className="text-[var(--color-text-dim)]">
                ({monsters.filter(m => monsterKills[m.id]).length}/{monsters.length})
              </span>
            </h4>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {monsters.map(monster => (
              <MonsterCard
                key={monster.id}
                monster={monster}
                killData={monsterKills[monster.id]}
                isDiscovered={!!monsterKills[monster.id]}
              />
            ))}
          </div>
        </div>
      ))}

      {discoveryStats.discovered === 0 && (
        <div className="text-center text-[var(--color-text-dim)] py-8">
          No monsters discovered yet. Start a dungeon to begin your collection!
        </div>
      )}
    </div>
  );
};

export default BestiaryScreen;
