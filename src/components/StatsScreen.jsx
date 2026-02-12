import { useState, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { CLASSES } from '../data/classes';
import { MONSTERS } from '../data/monsters';
import { TrophyIcon, SkullIcon, GoldIcon, HeartIcon, SwordIcon, ShieldIcon, CrownIcon, ChestIcon, StarIcon, SpeedIcon } from './icons/ui';

// Journey milestone definitions
const JOURNEY_MILESTONES = [
  { id: 'slot1', name: 'First Hero', description: 'Recruit your first Tank', dungeonRequired: 0, type: 'hero' },
  { id: 'slot2', name: 'Healer Unlocked', description: 'Recruit a Healer (Slot 2)', dungeonRequired: 1, type: 'hero' },
  { id: 'homestead', name: 'Homestead', description: 'Unlock base upgrades', dungeonRequired: 3, type: 'feature' },
  { id: 'slot3', name: 'DPS Unlocked', description: 'Recruit a DPS (Slot 3)', dungeonRequired: 3, type: 'hero' },
  { id: 'shop', name: 'Item Shop', description: 'Buy equipment', dungeonRequired: 5, type: 'feature' },
  { id: 'slot4', name: 'Full Party', description: 'Recruit 4th hero (Slot 4)', dungeonRequired: 4, type: 'hero' },
  { id: 'autorun', name: 'Auto-Run', description: 'Unlock automatic dungeon runs', dungeonRequired: 5, type: 'feature' },
  { id: 'd10', name: 'Dungeon 10', description: 'Reach the deep dungeons', dungeonRequired: 10, type: 'progress' },
  { id: 'd20', name: 'Dungeon 20', description: 'Master the depths', dungeonRequired: 20, type: 'progress' },
  { id: 'd30', name: 'Dungeon 30', description: 'Conquer the final dungeon', dungeonRequired: 30, type: 'progress' },
];

// Format large numbers with K/M suffixes
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
};

const StatCard = ({ icon, label, value, color = 'text-[var(--color-text)]' }) => {
  const Icon = icon;
  return (
    <div className="pixel-panel p-3 flex items-center gap-3">
      <div className={`${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="text-xs text-[var(--color-text-dim)]">{label}</div>
        <div className={`text-lg font-bold ${color}`}>{value}</div>
      </div>
    </div>
  );
};

const StatsScreen = () => {
  const stats = useGameStore(state => state.stats);
  const heroes = useGameStore(state => state.heroes);
  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate journey milestone progress
  const journeyProgress = useMemo(() => {
    return JOURNEY_MILESTONES.map(milestone => {
      let isComplete = false;
      let progress = 0;

      if (milestone.type === 'hero') {
        // Hero slots unlock based on dungeon and recruitment
        const slotIndex = parseInt(milestone.id.replace('slot', '')) - 1;
        isComplete = highestDungeonCleared >= milestone.dungeonRequired && heroes[slotIndex];
        progress = highestDungeonCleared >= milestone.dungeonRequired ? (heroes[slotIndex] ? 100 : 50) :
          Math.min(50, (highestDungeonCleared / milestone.dungeonRequired) * 50);
      } else {
        // Features and progress milestones based on dungeon level
        isComplete = highestDungeonCleared >= milestone.dungeonRequired;
        progress = milestone.dungeonRequired > 0
          ? Math.min(100, (highestDungeonCleared / milestone.dungeonRequired) * 100)
          : 100;
      }

      return { ...milestone, isComplete, progress };
    });
  }, [heroes, highestDungeonCleared]);

  // Get monster names for kill breakdown
  const monsterKillsWithNames = useMemo(() => {
    if (!stats.monsterKills) return [];
    return Object.entries(stats.monsterKills)
      .map(([monsterId, data]) => {
        const monster = MONSTERS[monsterId];
        // Handle both old format (number) and new format ({ count, isBoss })
        const count = typeof data === 'number' ? data : data.count;
        const isBoss = typeof data === 'object' ? data.isBoss : false;
        return {
          id: monsterId,
          name: monster?.name || monsterId,
          count,
          isBoss,
        };
      })
      .sort((a, b) => {
        // Sort bosses first, then by count
        if (a.isBoss !== b.isBoss) return a.isBoss ? -1 : 1;
        return b.count - a.count;
      });
  }, [stats.monsterKills]);

  // Get hero stats with names
  const heroStatsWithNames = useMemo(() => {
    if (!stats.heroStats) return [];
    return Object.entries(stats.heroStats)
      .map(([heroId, heroStat]) => {
        const hero = heroes.find(h => h?.id === heroId);
        const classData = hero ? CLASSES[hero.classId] : null;
        return {
          id: heroId,
          name: hero?.name || 'Unknown Hero',
          className: classData?.name || 'Unknown',
          classId: hero?.classId,
          ...heroStat,
        };
      })
      .filter(h => h.MonstersKilled > 0 || h.DamageDealt > 0 || h.DamageTaken > 0 || h.HealingDone > 0 || h.HealingReceived > 0 || h.CriticalHits > 0 || h.Dodges > 0 || h.Mitigated > 0)
      .sort((a, b) => (b.DamageDealt || 0) - (a.DamageDealt || 0));
  }, [stats.heroStats, heroes]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'combat', label: 'Combat' },
    { id: 'heroes', label: 'Heroes' },
    { id: 'journey', label: 'Journey' },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--color-border)] pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pixel-btn text-sm ${activeTab === tab.id ? 'pixel-btn-primary' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <StatCard icon={TrophyIcon} label="Dungeons Cleared" value={formatNumber(stats.totalDungeonsCleared)} color="text-[var(--color-green)]" />
            <StatCard icon={SkullIcon} label="Monsters Slain" value={formatNumber(stats.totalMonstersKilled)} color="text-[var(--color-red)]" />
            <StatCard icon={CrownIcon} label="Bosses Slain" value={formatNumber(stats.totalBossesKilled || 0)} color="text-[var(--color-gold)]" />
            <StatCard icon={GoldIcon} label="Gold Earned" value={formatNumber(stats.totalGoldEarned)} color="text-[var(--color-gold)]" />
            <StatCard icon={GoldIcon} label="Gold Spent" value={formatNumber(stats.totalGoldSpent || 0)} color="text-[var(--color-text-dim)]" />
            <StatCard icon={ChestIcon} label="Items Looted" value={formatNumber(stats.totalItemsLooted || 0)} color="text-[var(--color-purple)]" />
            <StatCard icon={HeartIcon} label="Hero Deaths" value={formatNumber(stats.totalDeaths)} color="text-[var(--color-text-dim)]" />
          </div>

          {/* Progression */}
          <div className="pixel-panel p-4">
            <h3 className="text-sm text-[var(--color-text-dim)] mb-2">Progression</h3>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[var(--color-text-dim)]">Highest Dungeon: </span>
                <span className="text-lg font-bold text-[var(--color-gold)]">{highestDungeonCleared}</span>
              </div>
              <div>
                <span className="text-[var(--color-text-dim)]">Active Heroes: </span>
                <span className="text-lg font-bold">{heroes.filter(Boolean).length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Combat Tab */}
      {activeTab === 'combat' && (
        <div className="space-y-4">
          {/* Combat Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <StatCard icon={SwordIcon} label="Damage Dealt" value={formatNumber(stats.totalDamageDealt || 0)} color="text-[var(--color-red)]" />
            <StatCard icon={ShieldIcon} label="Damage Taken" value={formatNumber(stats.totalDamageTaken || 0)} color="text-[var(--color-blue)]" />
            <StatCard icon={HeartIcon} label="Healing Done" value={formatNumber(stats.totalHealingDone || 0)} color="text-[var(--color-green)]" />
            <StatCard icon={HeartIcon} label="Healing Received" value={formatNumber(stats.totalHealingReceived || 0)} color="text-[var(--color-purple)]" />
            <StatCard icon={StarIcon} label="Critical Hits" value={formatNumber(stats.totalCriticalHits || 0)} color="text-[var(--color-gold)]" />
            <StatCard icon={SpeedIcon} label="Dodges" value={formatNumber(stats.totalDodges || 0)} color="text-[var(--color-green)]" />
            <StatCard icon={ShieldIcon} label="Damage Mitigated" value={formatNumber(stats.totalMitigated || 0)} color="text-[var(--color-blue)]" />
          </div>

          {/* Monster Kills Breakdown */}
          <div>
            <h3 className="text-sm text-[var(--color-text-dim)] mb-2">Monster Kills</h3>
            <div className="pixel-panel p-3 max-h-64 overflow-y-auto">
              {monsterKillsWithNames.length > 0 ? (
                <div className="space-y-1">
                  {monsterKillsWithNames.slice(0, 20).map(monster => (
                    <div key={monster.id} className={`flex justify-between text-sm ${monster.isBoss ? 'text-[var(--color-gold)]' : ''}`}>
                      <span className="flex items-center gap-1">
                        {monster.isBoss && <CrownIcon size={14} />}
                        {monster.name}
                      </span>
                      <span className={monster.isBoss ? 'text-[var(--color-gold)]' : 'text-[var(--color-red)]'}>
                        {formatNumber(monster.count)}
                      </span>
                    </div>
                  ))}
                  {monsterKillsWithNames.length > 20 && (
                    <div className="text-xs text-[var(--color-text-dim)] pt-1">
                      ...and {monsterKillsWithNames.length - 20} more
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[var(--color-text-dim)] text-sm">No monsters slain yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Heroes Tab */}
      {activeTab === 'heroes' && (
        <div className="space-y-4">
          <div className="pixel-panel p-3">
            {heroStatsWithNames.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[var(--color-text-dim)] border-b border-[var(--color-border)]">
                    <th className="text-left pb-2">Hero</th>
                    <th className="text-right pb-2">Kills</th>
                    <th className="text-right pb-2">Dmg Out</th>
                    <th className="text-right pb-2">Dmg In</th>
                    <th className="text-right pb-2">Heal Out</th>
                    <th className="text-right pb-2">Crits</th>
                    <th className="text-right pb-2">Dodges</th>
                    <th className="text-right pb-2">Mitigated</th>
                  </tr>
                </thead>
                <tbody>
                  {heroStatsWithNames.map(hero => (
                    <tr key={hero.id} className="border-b border-[var(--color-border)]/30">
                      <td className="py-2">
                        <div>{hero.name}</div>
                        <div className="text-xs text-[var(--color-text-dim)]">{hero.className}</div>
                      </td>
                      <td className="text-right text-[var(--color-red)]">
                        {formatNumber(hero.MonstersKilled || 0)}
                      </td>
                      <td className="text-right text-[var(--color-gold)]">
                        {formatNumber(hero.DamageDealt || 0)}
                      </td>
                      <td className="text-right text-[var(--color-blue)]">
                        {formatNumber(hero.DamageTaken || 0)}
                      </td>
                      <td className="text-right text-[var(--color-green)]">
                        {formatNumber(hero.HealingDone || 0)}
                      </td>
                      <td className="text-right text-[var(--color-gold)]">
                        {formatNumber(hero.CriticalHits || 0)}
                      </td>
                      <td className="text-right text-[var(--color-green)]">
                        {formatNumber(hero.Dodges || 0)}
                      </td>
                      <td className="text-right text-[var(--color-blue)]">
                        {formatNumber(hero.Mitigated || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-[var(--color-text-dim)] text-center py-4">
                No hero statistics recorded yet. Start a dungeon to track hero performance!
              </div>
            )}
          </div>
        </div>
      )}

      {/* Journey Tab */}
      {activeTab === 'journey' && (
        <div className="space-y-4">
          {/* Progress Overview */}
          <div className="pixel-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-[var(--color-text-dim)]">Journey Progress</h3>
              <span className="text-[var(--color-gold)] font-bold">
                {journeyProgress.filter(m => m.isComplete).length} / {journeyProgress.length}
              </span>
            </div>
            <div className="w-full h-2 bg-[var(--color-surface)] rounded overflow-hidden">
              <div
                className="h-full bg-[var(--color-gold)] transition-all duration-500"
                style={{ width: `${(journeyProgress.filter(m => m.isComplete).length / journeyProgress.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Milestone List */}
          <div className="space-y-2">
            {journeyProgress.map((milestone, index) => {
              const isNext = !milestone.isComplete && (index === 0 || journeyProgress[index - 1].isComplete);
              return (
                <div
                  key={milestone.id}
                  className={`pixel-panel p-3 flex items-center gap-3 transition-all ${
                    milestone.isComplete
                      ? 'border-[var(--color-green)]/50'
                      : isNext
                      ? 'border-[var(--color-gold)]/50 bg-[var(--color-gold)]/5'
                      : 'opacity-60'
                  }`}
                >
                  {/* Completion indicator */}
                  <div className={`w-8 h-8 flex items-center justify-center rounded ${
                    milestone.isComplete
                      ? 'bg-[var(--color-green)]/20 text-[var(--color-green)]'
                      : isNext
                      ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-dim)]'
                  }`}>
                    {milestone.isComplete ? (
                      <span className="text-lg">✓</span>
                    ) : (
                      <span className="text-xs font-bold">D{milestone.dungeonRequired}</span>
                    )}
                  </div>

                  {/* Milestone info */}
                  <div className="flex-1">
                    <div className={`font-bold ${
                      milestone.isComplete
                        ? 'text-[var(--color-green)]'
                        : isNext
                        ? 'text-[var(--color-gold)]'
                        : 'text-[var(--color-text-dim)]'
                    }`}>
                      {milestone.name}
                    </div>
                    <div className="text-xs text-[var(--color-text-dim)]">
                      {milestone.description}
                    </div>
                  </div>

                  {/* Progress bar for incomplete milestones */}
                  {!milestone.isComplete && (
                    <div className="w-20">
                      <div className="w-full h-1 bg-[var(--color-surface)] rounded overflow-hidden">
                        <div
                          className={`h-full ${isNext ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-text-dim)]'}`}
                          style={{ width: `${milestone.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-center text-[var(--color-text-dim)] mt-0.5">
                        {Math.floor(milestone.progress)}%
                      </div>
                    </div>
                  )}

                  {/* Type badge */}
                  <div className={`text-xs px-2 py-0.5 rounded ${
                    milestone.type === 'hero'
                      ? 'bg-[var(--color-blue)]/20 text-[var(--color-blue)]'
                      : milestone.type === 'feature'
                      ? 'bg-[var(--color-purple)]/20 text-[var(--color-purple)]'
                      : 'bg-[var(--color-gold)]/20 text-[var(--color-gold)]'
                  }`}>
                    {milestone.type === 'hero' ? 'Hero' : milestone.type === 'feature' ? 'Feature' : 'Goal'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hint for next milestone */}
          {journeyProgress.some(m => !m.isComplete) && (
            <div className="pixel-panel p-3 bg-[var(--color-gold)]/5 border-[var(--color-gold)]/30">
              <div className="text-xs text-[var(--color-text-dim)]">Next Goal</div>
              {(() => {
                const nextMilestone = journeyProgress.find(m => !m.isComplete);
                if (!nextMilestone) return null;
                return (
                  <div className="text-sm text-[var(--color-gold)]">
                    {nextMilestone.requiresFullParty
                      ? `Recruit ${4 - heroes.filter(Boolean).length} more hero${4 - heroes.filter(Boolean).length !== 1 ? 'es' : ''} to unlock ${nextMilestone.name}`
                      : `Clear Dungeon ${nextMilestone.dungeonRequired} to unlock ${nextMilestone.name}`}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsScreen;
