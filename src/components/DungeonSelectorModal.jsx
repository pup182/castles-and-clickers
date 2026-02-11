import { useGameStore } from '../store/gameStore';
import { MILESTONES, getMilestoneForLevel, DUNGEON_TIERS } from '../data/milestones';

// Milestone data for rewards
const MILESTONE_DATA = {
  5: { name: 'Goblin Slayer', gold: 500, bonus: { goldFind: 0.05 }, unlocks: [] },
  10: { name: 'Forest Guardian', gold: 1500, bonus: { xpGain: 0.10 }, unlocks: [] },
  15: { name: 'Crypt Keeper', gold: 3000, bonus: { critChance: 0.05 }, unlocks: ['Raids'] },
  20: { name: 'Demon Vanquisher', gold: 5000, bonus: { damage: 0.10 }, unlocks: [] },
  25: { name: 'Dragonslayer', gold: 10000, bonus: { defense: 0.10 }, unlocks: [] },
  30: { name: 'Lich King Slayer', gold: 25000, bonus: { allStats: 0.15 }, unlocks: ['Ascension'] },
};

const STAT_LABELS = {
  goldFind: 'Gold Find',
  xpGain: 'XP Gain',
  critChance: 'Crit Chance',
  damage: 'Damage',
  defense: 'Defense',
  allStats: 'All Stats',
};

const DungeonSelectorModal = ({ onStart, onClose }) => {
  const {
    dungeonUnlocked,
    highestDungeonCleared,
    heroes,
    claimedMilestones,
    maxDungeonLevel,
    dungeonSettings,
    dungeon,
    claimMilestone,
    applyMilestoneBonus,
    addGold,
  } = useGameStore();

  // Show at least up to current dungeon level (in case state got out of sync)
  const effectiveUnlocked = Math.min(
    Math.max(dungeonUnlocked, dungeon?.level || 0, highestDungeonCleared + 1),
    maxDungeonLevel || 30
  );

  const dungeons = Array.from({ length: effectiveUnlocked }, (_, i) => {
    const level = i + 1;
    const milestone = getMilestoneForLevel(level);
    const tier = DUNGEON_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel);

    return {
      level,
      cleared: level <= highestDungeonCleared,
      tier: tier?.id || 1,
      tierName: tier?.name || 'Unknown',
      milestone,
      isMilestoneLevel: !!milestone,
    };
  });

  const canStart = heroes.length > 0;

  const handleStartDungeon = (level) => {
    if (!canStart) return;

    const options = {
      type: dungeonSettings?.type || 'normal',
    };

    onStart(level, options);
  };

  const handleClaimMilestone = (level) => {
    const milestoneId = `milestone_${level}`;
    const data = MILESTONE_DATA[level];
    if (!data) return;

    // Claim the milestone
    claimMilestone(milestoneId);

    // Add gold reward
    if (data.gold) {
      addGold(data.gold);
    }

    // Apply permanent bonuses
    if (data.bonus) {
      for (const [stat, value] of Object.entries(data.bonus)) {
        applyMilestoneBonus(stat, value);
      }
    }
  };

  // Get unclaimed milestones that are available (cleared but not claimed)
  const unclaimedMilestones = Object.entries(MILESTONE_DATA)
    .filter(([level]) => {
      const lvl = parseInt(level);
      const milestoneId = `milestone_${lvl}`;
      return lvl <= highestDungeonCleared && !claimedMilestones.includes(milestoneId);
    })
    .map(([level, data]) => ({ level: parseInt(level), ...data }));

  // Get claimed bonuses with their source
  const claimedBonuses = Object.entries(MILESTONE_DATA)
    .filter(([level]) => claimedMilestones.includes(`milestone_${level}`))
    .flatMap(([level, data]) =>
      Object.entries(data.bonus || {}).map(([stat, value]) => ({
        stat,
        value,
        source: `D${level}`,
        name: data.name,
      }))
    );

  return (
    <div className="space-y-4">
      {/* Warning if no heroes */}
      {!canStart && (
        <div className="pixel-panel text-sm p-3" style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)' }}>
          You need at least one hero to enter a dungeon!
        </div>
      )}

      {/* Warning if dungeon in progress */}
      {dungeon && (
        <div className="pixel-panel text-sm p-3" style={{ borderColor: '#ff8844', color: '#ff8844' }}>
          Starting a new dungeon will abandon your current run (Level {dungeon.level})
        </div>
      )}

      {/* Unclaimed milestones */}
      {unclaimedMilestones.length > 0 && (
        <div className="pixel-panel-gold p-3">
          <div className="pixel-subtitle text-sm mb-2" style={{ color: 'var(--color-gold)' }}>Unclaimed Rewards!</div>
          <div className="space-y-2">
            {unclaimedMilestones.map(m => (
              <div key={m.level} className="flex items-center justify-between pixel-panel-dark p-2">
                <div>
                  <div className="text-[var(--color-text)] text-sm font-medium">D{m.level}: {m.name}</div>
                  <div className="text-xs text-[var(--color-text-dim)]">
                    +{m.gold.toLocaleString()} gold
                    {Object.entries(m.bonus).map(([stat, val]) => (
                      <span key={stat} className="text-[var(--color-green)] ml-2">
                        +{Math.round(val * 100)}% {STAT_LABELS[stat]}
                      </span>
                    ))}
                    {m.unlocks.length > 0 && (
                      <span className="text-[var(--color-purple)] ml-2">
                        Unlocks: {m.unlocks.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleClaimMilestone(m.level)}
                  className="pixel-btn pixel-btn-primary text-sm"
                >
                  Claim
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claimed bonuses with source */}
      {claimedBonuses.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-gray-400">Bonuses:</span>
          {claimedBonuses.map((b, i) => (
            <span key={i} className="text-green-400 bg-green-900/30 px-2 py-0.5 rounded" title={b.name}>
              +{Math.round(b.value * 100)}% {STAT_LABELS[b.stat]} ({b.source})
            </span>
          ))}
        </div>
      )}

      {/* Dungeon grid */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="pixel-subtitle">Select Dungeon</h4>
          <span className="text-[var(--color-text-dim)] text-sm">
            {highestDungeonCleared}/{maxDungeonLevel} cleared
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {dungeons.map(d => {
            const isClaimed = d.milestone && claimedMilestones.includes(d.milestone.id);

            return (
              <button
                key={d.level}
                onClick={() => handleStartDungeon(d.level)}
                disabled={!canStart}
                className={`
                  pixel-panel p-2 text-center relative
                  ${d.cleared
                    ? 'border-[var(--color-green)]'
                    : ''
                  }
                  ${d.isMilestoneLevel ? 'border-[var(--color-gold)]' : ''}
                  ${canStart ? 'hover:border-[var(--color-blue)] cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                `}
                style={d.cleared ? { backgroundColor: 'rgba(68, 255, 68, 0.1)' } : {}}
              >
                {d.isMilestoneLevel && (
                  <span className="absolute -top-1 -right-1 text-xs">
                    {isClaimed ? '✓' : '*'}
                  </span>
                )}
                <div className="text-[var(--color-text)] font-bold">{d.level}</div>
                <div className="text-[var(--color-text-dark)] text-xs truncate">{d.tierName}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Next milestone preview */}
      {(() => {
        const nextMilestone = dungeons.find(d =>
          d.isMilestoneLevel &&
          !claimedMilestones.includes(d.milestone?.id) &&
          d.level > highestDungeonCleared
        );

        if (!nextMilestone) return null;

        const rewards = nextMilestone.milestone.rewards;
        const bonusText = rewards.permanentBonus
          ? Object.entries(rewards.permanentBonus)
              .map(([k, v]) => `+${Math.round(v * 100)}% ${k}`)
              .join(', ')
          : '';

        return (
          <div className="pixel-panel p-3" style={{ borderColor: 'var(--color-gold-dark)' }}>
            <div className="text-[var(--color-gold)] text-sm font-medium">
              Next Milestone: Dungeon {nextMilestone.level}
            </div>
            <div className="text-[var(--color-gold-dark)] text-xs">
              {nextMilestone.milestone.name} - {bonusText || 'Special rewards'}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default DungeonSelectorModal;
