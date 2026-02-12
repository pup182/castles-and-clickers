import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { DUNGEON_TIERS } from '../data/milestones';
import { GemIcon, SkullIcon, TreeIcon, CastleIcon, FireIcon, GhostIcon, CheckIcon, CrownIcon } from './icons/ui';
import { getWorldBossForLevel, isWorldBossLevel, getWorldBossForTier } from '../data/worldBosses';
import { WorldBossIcon } from './icons/worldBosses';
import { getUniqueItem } from '../data/uniqueItems';
import { StarIcon } from './icons/ui';

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

const DungeonMap = ({ onStart }) => {
  const {
    dungeonUnlocked,
    highestDungeonCleared,
    heroes,
    maxDungeonLevel,
    dungeonSettings,
    dungeon,
  } = useGameStore();

  const [expandedTier, setExpandedTier] = useState(null);

  const effectiveUnlocked = Math.min(
    Math.max(dungeonUnlocked, dungeon?.level || 0, highestDungeonCleared + 1),
    maxDungeonLevel || 30
  );

  const canStart = heroes.length > 0;

  // Find current tier (the one player is progressing through)
  const currentTier = DUNGEON_TIERS.find(
    t => highestDungeonCleared < t.maxLevel && highestDungeonCleared >= t.minLevel - 1
  ) || DUNGEON_TIERS[0];

  const handleStartDungeon = (level) => {
    if (!canStart || level > effectiveUnlocked) return;
    onStart(level, { type: dungeonSettings?.type || 'normal' });
  };

  // Calculate progress within current tier
  const progressInTier = Math.max(0, highestDungeonCleared - currentTier.minLevel + 1);
  const tierSize = currentTier.maxLevel - currentTier.minLevel + 1;
  const progressPercent = (progressInTier / tierSize) * 100;

  const TierIcon = TIER_THEME_ICONS[currentTier.theme];
  const tierColor = TIER_THEME_COLORS[currentTier.theme];

  return (
    <div className="flex flex-col h-full max-h-[75vh]">
      {/* Current Tier Hero Section */}
      {(() => {
        const zoneBoss = getWorldBossForTier(currentTier.id);
        const bossDefeated = zoneBoss && highestDungeonCleared >= zoneBoss.level;

        return (
          <div
            className="pixel-panel-dark p-4 mb-4 relative overflow-hidden"
            style={{ borderColor: tierColor }}
          >
            {/* World Boss Mascot - positioned in corner */}
            {zoneBoss && (
              <div className="absolute -right-2 -bottom-2 opacity-20 pointer-events-none">
                <WorldBossIcon bossId={zoneBoss.id} size={80} />
              </div>
            )}

            {/* Tier header */}
            <div className="flex items-center gap-3 mb-3 relative z-10">
              <div style={{ color: tierColor }}>
                <TierIcon size={32} />
              </div>
              <div className="flex-1">
                <h2 className="pixel-title" style={{ color: tierColor }}>
                  {currentTier.name}
                </h2>
                <p className="pixel-label">
                  Levels {currentTier.minLevel} - {currentTier.maxLevel}
                </p>
              </div>

              {/* World Boss indicator */}
              {zoneBoss && (
                <div className={`flex items-center gap-2 px-2 py-1 rounded border ${
                  bossDefeated
                    ? 'border-green-500/50 bg-green-900/20'
                    : 'border-amber-500/50 bg-amber-900/20'
                }`}>
                  <WorldBossIcon bossId={zoneBoss.id} size={28} />
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500">World Boss:</div>
                    <div className={`text-xs font-bold ${bossDefeated ? 'text-green-400' : 'text-amber-400'}`}>
                      {zoneBoss.name}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {bossDefeated ? 'Defeated' : `Lv ${zoneBoss.level}`}
                    </div>
                    {zoneBoss.uniqueDrop && !bossDefeated && (
                      <div className="text-[10px] text-yellow-300 flex items-center gap-0.5 justify-end">
                        <StarIcon size={8} />
                        Unique
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: tierColor }}>
                  {progressInTier}/{tierSize}
                </div>
                <div className="pixel-label">cleared</div>
              </div>
            </div>

        {/* Progress bar */}
        <div className="relative pixel-bar h-3 mb-3">
          <div
            className="pixel-bar-fill h-full"
            style={{
              width: `${progressPercent}%`,
              background: tierColor,
            }}
          />
        </div>

        {/* Dungeon nodes for current tier */}
        <div className="flex justify-between gap-1">
          {Array.from({ length: tierSize }, (_, i) => {
            const level = currentTier.minLevel + i;
            const isCleared = level <= highestDungeonCleared;
            const isUnlocked = level <= effectiveUnlocked;
            const isCurrent = level === highestDungeonCleared + 1;
            const worldBoss = getWorldBossForLevel(level);
            const hasWorldBoss = !!worldBoss;
            const hasUniqueReward = worldBoss?.uniqueDrop;

            return (
              <button
                key={level}
                onClick={() => handleStartDungeon(level)}
                disabled={!canStart || !isUnlocked}
                className={`
                  flex-1 py-2 pixel-text font-bold transition-all border relative
                  ${isCleared
                    ? 'bg-green-700 text-white border-green-500'
                    : isCurrent
                    ? 'bg-blue-700 text-white border-blue-400 animate-pulse'
                    : isUnlocked
                    ? 'bg-[var(--color-panel)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-panel-light)] cursor-pointer'
                    : 'bg-gray-800/50 text-gray-600 border-gray-700 cursor-not-allowed'
                  }
                  ${hasWorldBoss && !isCleared ? 'border-amber-500/60' : ''}
                  ${hasUniqueReward && !isCleared ? 'border-yellow-400' : ''}
                `}
              >
                {isCleared ? <CheckIcon size={14} /> : level}
                {hasWorldBoss && (
                  <CrownIcon size={10} className="absolute -top-1 -right-1 text-amber-400" />
                )}
                {hasUniqueReward && !isCleared && (
                  <StarIcon size={8} className="absolute -bottom-1 -right-1 text-yellow-300" />
                )}
              </button>
            );
          })}
        </div>

        {/* World Boss Preview for current target */}
        {(() => {
          const nextLevel = highestDungeonCleared + 1;
          const worldBoss = getWorldBossForLevel(nextLevel);
          if (!worldBoss || nextLevel > effectiveUnlocked) return null;

          return (
            <div className="mt-3 pixel-panel-dark p-3 border-amber-500/40">
              <div className="flex items-center gap-3">
                <WorldBossIcon bossId={worldBoss.id} size={48} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CrownIcon size={14} className="text-amber-400" />
                    <span className="text-amber-400 font-bold text-sm">WORLD BOSS</span>
                  </div>
                  <div className="text-white font-bold">{worldBoss.name}</div>
                  <div className="text-xs text-amber-400/70 italic">"{worldBoss.title}"</div>
                </div>
                <div className="text-right text-xs">
                  <div className="text-gray-400">Level {nextLevel}</div>
                  <div className="text-amber-400">{worldBoss.guaranteedRarity || 'epic'}+ loot</div>
                  {worldBoss.uniqueDrop && (
                    <div className="flex items-center gap-1 justify-end text-yellow-300">
                      <StarIcon size={10} />
                      <span>Unique Drop!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
          </div>
        );
      })()}

      {/* Raid Teaser - shows when close to unlocking raids */}
      {highestDungeonCleared >= 10 && highestDungeonCleared < 12 && (
        <div className="pixel-panel-dark p-3 mb-4 border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded border-2 border-amber-500/50 bg-amber-900/20 flex items-center justify-center">
              <CrownIcon size={24} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="text-amber-400 font-bold text-sm">Raids Unlocking Soon!</div>
              <div className="text-xs text-gray-400">
                Clear Dungeon 12 to unlock multi-boss raid dungeons with unique legendary drops
              </div>
              <div className="text-xs text-amber-400/70 mt-1">
                {12 - highestDungeonCleared} level{12 - highestDungeonCleared !== 1 ? 's' : ''} to go
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other tiers (collapsed) */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <div className="pixel-label uppercase tracking-wider mb-2">
          All Regions
        </div>

        {DUNGEON_TIERS.map((tier) => {
          const OtherTierIcon = TIER_THEME_ICONS[tier.theme];
          const otherTierColor = TIER_THEME_COLORS[tier.theme];
          const isCurrent = tier.id === currentTier.id;
          const isCleared = highestDungeonCleared >= tier.maxLevel;
          const isUnlocked = tier.minLevel <= effectiveUnlocked;
          const isExpanded = expandedTier === tier.id;
          const clearedInTier = Math.max(0, Math.min(
            highestDungeonCleared - tier.minLevel + 1,
            tier.maxLevel - tier.minLevel + 1
          ));
          const tierTotal = tier.maxLevel - tier.minLevel + 1;

          if (isCurrent) return null; // Skip current tier (shown above)

          const tierBoss = getWorldBossForTier(tier.id);
          const bossDefeated = tierBoss && highestDungeonCleared >= tierBoss.level;

          return (
            <div
              key={tier.id}
              className={`pixel-panel overflow-hidden transition-all ${
                !isUnlocked ? 'opacity-40' : ''
              }`}
              style={{
                borderColor: isCleared ? otherTierColor : 'var(--color-border)',
              }}
            >
              {/* Collapsed header */}
              <button
                onClick={() => setExpandedTier(isExpanded ? null : tier.id)}
                className="w-full flex items-center gap-2 p-2 hover:bg-white/5 transition-colors"
                disabled={!isUnlocked}
              >
                <div style={{ color: isCleared ? otherTierColor : 'var(--color-text-dim)' }}>
                  <OtherTierIcon size={20} />
                </div>
                <div className="flex-1 text-left">
                  <div className="pixel-text font-medium" style={{ color: isCleared ? otherTierColor : 'var(--color-text)' }}>
                    {tier.name}
                  </div>
                  <div className="pixel-label">
                    {clearedInTier}/{tierTotal} cleared
                  </div>
                </div>
                {/* World Boss mascot */}
                {tierBoss && (
                  <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                    bossDefeated ? 'bg-green-900/30' : 'bg-amber-900/30'
                  }`}>
                    <WorldBossIcon bossId={tierBoss.id} size={20} />
                    {bossDefeated && <CheckIcon size={10} className="text-green-400" />}
                  </div>
                )}
                {isCleared && <CheckIcon size={16} className="text-green-400" />}
                {isUnlocked && (
                  <span className="pixel-label">
                    {isExpanded ? 'v' : '>'}
                  </span>
                )}
              </button>

              {/* Expanded content */}
              {isExpanded && isUnlocked && (
                <div className="p-2 pt-0 border-t border-[var(--color-border)]">
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.from({ length: tierTotal }, (_, i) => {
                      const level = tier.minLevel + i;
                      const levelCleared = level <= highestDungeonCleared;
                      const levelUnlocked = level <= effectiveUnlocked;

                      return (
                        <button
                          key={level}
                          onClick={() => handleStartDungeon(level)}
                          disabled={!canStart || !levelUnlocked}
                          className={`
                            w-8 h-8 pixel-text font-bold transition-all border flex items-center justify-center
                            ${levelCleared
                              ? 'bg-green-700 text-white border-green-500'
                              : levelUnlocked
                              ? 'bg-[var(--color-panel-dark)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-panel-light)]'
                              : 'bg-gray-800/50 text-gray-600 border-gray-700'
                            }
                          `}
                        >
                          {levelCleared ? <CheckIcon size={12} /> : level}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="mt-3 pt-3 border-t border-[var(--color-border)] flex justify-between pixel-label">
        <span>Total Progress: {highestDungeonCleared}/{maxDungeonLevel}</span>
        {dungeon && (
          <span className="text-orange-400">
            Currently in D{dungeon.level}
          </span>
        )}
        {!canStart && (
          <span className="text-[var(--color-gold)]">Recruit heroes to begin!</span>
        )}
      </div>
    </div>
  );
};

export default DungeonMap;
