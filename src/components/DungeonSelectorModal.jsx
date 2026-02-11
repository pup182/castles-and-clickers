import { useGameStore } from '../store/gameStore';
import { DUNGEON_TIERS } from '../data/milestones';

const DungeonSelectorModal = ({ onStart, onClose }) => {
  const {
    dungeonUnlocked,
    highestDungeonCleared,
    heroes,
    maxDungeonLevel,
    dungeonSettings,
    dungeon,
  } = useGameStore();

  // Show at least up to current dungeon level (in case state got out of sync)
  const effectiveUnlocked = Math.min(
    Math.max(dungeonUnlocked, dungeon?.level || 0, highestDungeonCleared + 1),
    maxDungeonLevel || 30
  );

  const dungeons = Array.from({ length: effectiveUnlocked }, (_, i) => {
    const level = i + 1;
    const tier = DUNGEON_TIERS.find(t => level >= t.minLevel && level <= t.maxLevel);

    return {
      level,
      cleared: level <= highestDungeonCleared,
      tier: tier?.id || 1,
      tierName: tier?.name || 'Unknown',
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

      {/* Dungeon grid */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="pixel-subtitle">Select Dungeon</h4>
          <span className="text-[var(--color-text-dim)] text-sm">
            {highestDungeonCleared}/{maxDungeonLevel} cleared
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {dungeons.map(d => (
            <button
              key={d.level}
              onClick={() => handleStartDungeon(d.level)}
              disabled={!canStart}
              className={`
                pixel-panel p-2 text-center relative
                ${d.cleared ? 'border-[var(--color-green)]' : ''}
                ${canStart ? 'hover:border-[var(--color-blue)] cursor-pointer' : 'opacity-50 cursor-not-allowed'}
              `}
              style={d.cleared ? { backgroundColor: 'rgba(68, 255, 68, 0.1)' } : {}}
            >
              <div className="text-[var(--color-text)] font-bold">{d.level}</div>
              <div className="text-[var(--color-text-dark)] text-xs truncate">{d.tierName}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DungeonSelectorModal;
