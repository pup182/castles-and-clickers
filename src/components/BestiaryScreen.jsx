import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { MONSTERS } from '../data/monsters';
import { WORLD_BOSSES } from '../data/worldBosses';
import { RAIDS } from '../data/raids';
import { DUNGEON_TIERS } from '../data/milestones';
import { SkullIcon, CrownIcon, SwordIcon, ShieldIcon, SpeedIcon, HeartIcon, LockIcon, CheckIcon } from './icons/ui';
import { MonsterIcon } from './icons/monsters';
import { WorldBossIcon } from './icons/worldBosses';
import { RaidBossIcon } from './icons/raidBosses';

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

// World Boss Card component
const WorldBossCard = ({ boss, killData, isDefeated, isUnlocked }) => {
  return (
    <div
      className={`pixel-panel p-4 ${isDefeated ? 'border-green-500' : isUnlocked ? 'border-amber-500' : 'opacity-60'}`}
      style={isDefeated ? { backgroundColor: 'rgba(34, 197, 94, 0.1)' } : {}}
    >
      <div className="flex items-start gap-4">
        {/* Boss portrait */}
        <div className={`relative ${!isUnlocked ? 'filter grayscale' : ''}`}>
          <WorldBossIcon bossId={boss.id} size={64} />
          {isDefeated && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon size={14} className="text-white" />
            </div>
          )}
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
              <LockIcon size={24} className="text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1">
          {/* Name and title */}
          <div className="flex items-center gap-2 mb-1">
            <CrownIcon size={16} className="text-amber-400" />
            <h3 className="font-bold text-amber-400">{isUnlocked ? boss.name : '???'}</h3>
          </div>
          {isUnlocked && (
            <p className="text-xs text-gray-400 italic mb-2">"{boss.title}"</p>
          )}

          {/* Level requirement */}
          <div className="text-xs text-gray-500 mb-2">
            Dungeon Level {boss.level}
          </div>

          {/* Stats */}
          {isUnlocked && (
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-1 text-red-400">
                <SwordIcon size={12} />
                <span>{boss.baseStats.attack}</span>
              </div>
              <div className="flex items-center gap-1 text-blue-400">
                <ShieldIcon size={12} />
                <span>{boss.baseStats.defense}</span>
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <HeartIcon size={12} />
                <span>{boss.baseStats.maxHp}</span>
              </div>
              <div className="flex items-center gap-1 text-purple-400">
                <SpeedIcon size={12} />
                <span>{boss.baseStats.speed}</span>
              </div>
            </div>
          )}

          {/* Abilities */}
          {isUnlocked && boss.abilities && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Abilities:</div>
              <div className="flex flex-wrap gap-1">
                {boss.abilities.slice(0, 4).map((ability, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 text-xs bg-gray-800 border border-gray-600 rounded text-gray-300"
                  >
                    {ability.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Lore */}
          {isUnlocked && isDefeated && boss.lore && (
            <p className="mt-2 text-xs text-gray-500 italic">
              {boss.lore}
            </p>
          )}

          {/* Kill count */}
          {isDefeated && killData && (
            <div className="mt-2 flex items-center gap-1 text-green-400 text-sm">
              <SkullIcon size={14} />
              <span>Defeated {killData.count}x</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Raid Boss Card component - matches WorldBossCard style
const RaidBossCard = ({ boss, raidName, isFinal, isDiscovered, killData }) => {
  const isDefeated = !!killData;

  return (
    <div
      className={`pixel-panel p-4 ${isDefeated ? 'border-green-500' : isFinal ? 'border-red-500' : 'border-amber-500'} ${!isDiscovered ? 'opacity-60' : ''}`}
      style={isDefeated ? { backgroundColor: 'rgba(34, 197, 94, 0.1)' } : isFinal ? { backgroundColor: 'rgba(239, 68, 68, 0.1)' } : {}}
    >
      <div className="flex items-start gap-4">
        {/* Boss portrait */}
        <div className={`relative ${!isDiscovered ? 'filter grayscale' : ''}`}>
          <RaidBossIcon spriteId={boss.spriteId} size={64} />
          {isDefeated && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <CheckIcon size={14} className="text-white" />
            </div>
          )}
          {!isDiscovered && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
              <LockIcon size={24} className="text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1">
          {/* Name and title */}
          <div className="flex items-center gap-2 mb-1">
            <CrownIcon size={16} className={isFinal ? 'text-red-400' : 'text-amber-400'} />
            <h3 className={`font-bold ${isFinal ? 'text-red-400' : 'text-amber-400'}`}>
              {isDiscovered ? boss.name : '???'}
            </h3>
            {isFinal && <span className="text-xs bg-red-900/50 px-1.5 py-0.5 rounded text-red-300">FINAL</span>}
          </div>
          <p className="text-xs text-gray-500 mb-2">{raidName}</p>

          {/* Stats */}
          {isDiscovered && boss.baseStats && (
            <div className="grid grid-cols-4 gap-2 text-xs mb-2">
              <div className="flex items-center gap-1 text-red-400">
                <SwordIcon size={12} />
                <span>{boss.baseStats.attack}</span>
              </div>
              <div className="flex items-center gap-1 text-blue-400">
                <ShieldIcon size={12} />
                <span>{boss.baseStats.defense}</span>
              </div>
              <div className="flex items-center gap-1 text-green-400">
                <HeartIcon size={12} />
                <span>{boss.baseStats.maxHp}</span>
              </div>
              <div className="flex items-center gap-1 text-purple-400">
                <SpeedIcon size={12} />
                <span>{boss.baseStats.speed}</span>
              </div>
            </div>
          )}

          {/* Abilities */}
          {isDiscovered && boss.abilities && (
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">Abilities:</div>
              <div className="flex flex-wrap gap-1">
                {boss.abilities.slice(0, 4).map((ability, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 text-xs bg-gray-800 border border-gray-600 rounded text-gray-300"
                  >
                    {ability.replace(/_/g, ' ')}
                  </span>
                ))}
                {boss.abilities.length > 4 && (
                  <span className="px-1.5 py-0.5 text-xs text-gray-500">
                    +{boss.abilities.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Lore */}
          {isDiscovered && isDefeated && boss.lore && (
            <p className="text-xs text-gray-500 italic mb-2">
              {boss.lore}
            </p>
          )}

          {/* Kill count */}
          {isDefeated && (
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <SkullIcon size={14} />
              <span>Defeated {killData.count}x</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const BestiaryScreen = () => {
  const monsterKills = useGameStore(state => state.stats?.monsterKills || {});
  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);
  const [activeTab, setActiveTab] = useState('monsters');
  const [selectedTier, setSelectedTier] = useState('all');

  // Organize monsters by tier
  const monstersByTier = useMemo(() => {
    const byTier = {};
    Object.values(MONSTERS).forEach(monster => {
      const tier = monster.tier;
      if (!byTier[tier]) byTier[tier] = [];
      byTier[tier].push(monster);
    });
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

  // World boss stats
  const worldBossStats = useMemo(() => {
    const allBosses = Object.values(WORLD_BOSSES);
    const unlocked = allBosses.filter(b => highestDungeonCleared >= b.level - 1);
    const defeated = allBosses.filter(b => monsterKills[b.id]);
    return {
      total: allBosses.length,
      unlocked: unlocked.length,
      defeated: defeated.length,
    };
  }, [highestDungeonCleared, monsterKills]);

  // Raid boss stats
  const raidBossStats = useMemo(() => {
    let total = 0;
    let discovered = 0;
    Object.values(RAIDS).forEach(raid => {
      raid.wingBosses.forEach(boss => {
        total++;
        if (monsterKills[boss.id]) discovered++;
      });
      total++; // final boss
      if (monsterKills[raid.finalBoss.id]) discovered++;
    });
    return { total, discovered };
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

  // Render tabs
  const tabs = [
    { id: 'monsters', label: 'Monsters', count: `${discoveryStats.discovered}/${discoveryStats.total}` },
    { id: 'worldBosses', label: 'World Bosses', count: `${worldBossStats.defeated}/${worldBossStats.total}` },
    { id: 'raidBosses', label: 'Raid Bosses', count: `${raidBossStats.discovered}/${raidBossStats.total}` },
  ];

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pixel-btn text-sm flex items-center gap-2 ${
              activeTab === tab.id ? 'pixel-btn-primary' : ''
            }`}
          >
            {tab.label}
            <span className="text-xs text-gray-400">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Monsters Tab */}
      {activeTab === 'monsters' && (
        <>
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
        </>
      )}

      {/* World Bosses Tab */}
      {activeTab === 'worldBosses' && (
        <>
          {/* Progress */}
          <div className="pixel-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-amber-400">World Boss Progress</h3>
              <span className="text-lg font-bold text-amber-400">
                {worldBossStats.defeated}/{worldBossStats.total}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded h-2 overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${(worldBossStats.defeated / worldBossStats.total) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Unlocked: {worldBossStats.unlocked}/{worldBossStats.total}
            </div>
          </div>

          {/* World Boss List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.values(WORLD_BOSSES).sort((a, b) => a.level - b.level).map(boss => (
              <WorldBossCard
                key={boss.id}
                boss={boss}
                killData={monsterKills[boss.id]}
                isDefeated={!!monsterKills[boss.id]}
                isUnlocked={highestDungeonCleared >= boss.level - 1}
              />
            ))}
          </div>
        </>
      )}

      {/* Raid Bosses Tab */}
      {activeTab === 'raidBosses' && (
        <>
          {/* Progress */}
          <div className="pixel-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-red-400">Raid Boss Progress</h3>
              <span className="text-lg font-bold text-red-400">
                {raidBossStats.discovered}/{raidBossStats.total}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded h-2 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all duration-300"
                style={{ width: `${(raidBossStats.discovered / raidBossStats.total) * 100}%` }}
              />
            </div>
          </div>

          {/* Raid Boss List - Grouped by Raid */}
          {Object.values(RAIDS).sort((a, b) => a.requiredLevel - b.requiredLevel).map(raid => {
            const isRaidUnlocked = highestDungeonCleared >= raid.requiredLevel;
            return (
              <div key={raid.id} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <CrownIcon size={18} className={isRaidUnlocked ? 'text-blue-400' : 'text-gray-500'} />
                  <h4 className={`font-bold ${isRaidUnlocked ? 'text-blue-400' : 'text-gray-500'}`}>
                    {raid.name}
                  </h4>
                  <span className="text-xs text-gray-500">
                    (Level {raid.requiredLevel}+)
                  </span>
                  {!isRaidUnlocked && (
                    <LockIcon size={14} className="text-gray-500" />
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ml-4">
                  {/* Wing bosses */}
                  {raid.wingBosses.map(boss => (
                    <RaidBossCard
                      key={boss.id}
                      boss={boss}
                      raidName={raid.name}
                      isFinal={false}
                      isDiscovered={!!monsterKills[boss.id] || isRaidUnlocked}
                      killData={monsterKills[boss.id]}
                    />
                  ))}
                  {/* Final boss */}
                  <RaidBossCard
                    boss={raid.finalBoss}
                    raidName={raid.name}
                    isFinal={true}
                    isDiscovered={!!monsterKills[raid.finalBoss.id] || isRaidUnlocked}
                    killData={monsterKills[raid.finalBoss.id]}
                  />
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default BestiaryScreen;
