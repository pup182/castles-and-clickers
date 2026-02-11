import { useGameStore } from '../store/gameStore';
import { DUNGEON_TIERS } from '../data/milestones';
import { GemIcon, SkullIcon, TreeIcon, CastleIcon, FireIcon, GhostIcon, SwordIcon } from './icons/ui';

// Theme icons for each tier - pixel art SVG components
const TIER_THEME_ICONS = {
  cave: GemIcon,
  crypt: SkullIcon,
  forest: TreeIcon,
  castle: CastleIcon,
  volcano: FireIcon,
  void: GhostIcon,
};

// Theme colors for each tier
const TIER_THEME_COLORS = {
  cave: '#06b6d4',
  crypt: '#84cc16',
  forest: '#22c55e',
  castle: '#f59e0b',
  volcano: '#ef4444',
  void: '#a855f7',
};

const CurrentZoneIndicator = ({ onStartDungeon, onSelectDungeon, onRecruitHeroes }) => {
  const {
    highestDungeonCleared,
    heroes,
    maxDungeonLevel,
    lastDungeonSuccess,
  } = useGameStore();

  // Find current tier
  const currentTier = DUNGEON_TIERS.find(
    t => highestDungeonCleared < t.maxLevel && highestDungeonCleared >= t.minLevel - 1
  ) || DUNGEON_TIERS[0];

  const TierIcon = TIER_THEME_ICONS[currentTier.theme];
  const tierColor = TIER_THEME_COLORS[currentTier.theme];

  // Calculate progress
  const progressInTier = Math.max(0, highestDungeonCleared - currentTier.minLevel + 1);
  const tierSize = currentTier.maxLevel - currentTier.minLevel + 1;
  const progressPercent = (progressInTier / tierSize) * 100;

  const nextDungeon = highestDungeonCleared + 1;
  const canStart = heroes.length > 0;

  return (
    <div className="w-full max-w-lg">
      {/* Current Zone Card */}
      <div
        className="pixel-panel-dark p-4"
        style={{ borderColor: tierColor }}
      >
        {/* Zone header */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="p-3 pixel-panel"
            style={{ borderColor: tierColor }}
          >
            <div style={{ color: tierColor }}>
              <TierIcon size={40} />
            </div>
          </div>
          <div className="flex-1">
            <div className="pixel-label uppercase tracking-wider mb-1">
              Current Zone
            </div>
            <h2 className="pixel-title" style={{ color: tierColor }}>
              {currentTier.name}
            </h2>
            <div className="pixel-label">
              Levels {currentTier.minLevel} - {currentTier.maxLevel}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: tierColor }}>
              {progressInTier}/{tierSize}
            </div>
            <div className="pixel-label">cleared</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="relative pixel-bar h-4">
            <div
              className="pixel-bar-fill h-full"
              style={{
                width: `${progressPercent}%`,
                background: tierColor,
              }}
            />
            {/* Level markers */}
            <div className="absolute inset-0 flex">
              {Array.from({ length: tierSize }, (_, i) => {
                const level = currentTier.minLevel + i;
                const isCleared = level <= highestDungeonCleared;
                return (
                  <div
                    key={level}
                    className="flex-1 border-r border-white/10 last:border-r-0 flex items-center justify-center"
                  >
                    <span className={`pixel-text text-xs font-bold ${isCleared ? 'text-white' : 'text-white/30'}`}>
                      {level}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {!canStart ? (
            <button
              onClick={onRecruitHeroes}
              className="w-full pixel-btn pixel-btn-primary py-3"
            >
              Recruit Heroes to Begin
            </button>
          ) : highestDungeonCleared === 0 && lastDungeonSuccess == null ? (
            <button
              onClick={() => onStartDungeon(1)}
              className="w-full pixel-btn pixel-btn-primary py-3 animate-pulse"
            >
              Begin Your Adventure!
            </button>
          ) : (
            <>
              {nextDungeon <= maxDungeonLevel && (
                <button
                  onClick={() => onStartDungeon(nextDungeon)}
                  className="w-full pixel-btn pixel-btn-primary py-3"
                  style={{
                    borderColor: tierColor,
                  }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <SwordIcon size={16} />
                    {lastDungeonSuccess === false ? 'Retry' : 'Continue to'} Dungeon {nextDungeon}
                  </span>
                </button>
              )}
              <button
                onClick={onSelectDungeon}
                className="w-full pixel-btn pixel-btn-secondary py-2 text-sm"
              >
                Select Different Dungeon
              </button>
            </>
          )}
        </div>

        {/* Total progress footer */}
        <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-center">
          <span className="pixel-label">
            Total Progress: {highestDungeonCleared}/{maxDungeonLevel} dungeons cleared
          </span>
        </div>
      </div>
    </div>
  );
};

export default CurrentZoneIndicator;
