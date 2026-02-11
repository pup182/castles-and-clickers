import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { DUNGEON_TIERS, getMilestoneForLevel } from '../data/milestones';

// Theme icons for each tier
const TIER_ICONS = {
  cave: '💎',
  crypt: '💀',
  forest: '🌲',
  castle: '🏰',
  volcano: '🌋',
  void: '🌀',
};

// Milestone rewards data
const MILESTONE_REWARDS = {
  5: { gold: 500, bonus: 'Gold Find +5%' },
  10: { gold: 1500, bonus: 'XP Gain +10%' },
  15: { gold: 3000, bonus: 'Crit Chance +5%' },
  20: { gold: 5000, bonus: 'Damage +10%' },
  25: { gold: 10000, bonus: 'Defense +10%' },
  30: { gold: 25000, bonus: 'All Stats +15%' },
};

const DungeonMap = ({ onStart }) => {
  const {
    dungeonUnlocked,
    highestDungeonCleared,
    heroes,
    claimedMilestones,
    maxDungeonLevel,
    dungeonSettings,
    dungeon,
  } = useGameStore();

  const [hoveredNode, setHoveredNode] = useState(null);

  const effectiveUnlocked = Math.min(
    Math.max(dungeonUnlocked, dungeon?.level || 0, highestDungeonCleared + 1),
    maxDungeonLevel || 30
  );

  const canStart = heroes.length > 0;

  const handleStartDungeon = (level) => {
    if (!canStart || level > effectiveUnlocked) return;
    const options = { type: dungeonSettings?.type || 'normal' };
    onStart(level, options);
  };

  // Generate path positions for nodes (zigzag pattern)
  const getNodePosition = (levelInTier) => {
    // Alternate left/right for visual interest
    const isEven = levelInTier % 2 === 0;
    const baseX = isEven ? 30 : 70;
    const offset = (levelInTier - 1) * 8 - 16; // Spread vertically
    return {
      x: baseX + (isEven ? offset : -offset),
      y: 15 + (levelInTier - 1) * 17,
    };
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div>
          <h3 className="pixel-subtitle text-lg">Dungeon Map</h3>
          <p className="text-xs text-[var(--color-text-dim)]">
            Progress: {highestDungeonCleared}/{maxDungeonLevel} cleared
          </p>
        </div>
        {!canStart && (
          <div className="text-xs text-[var(--color-gold)]">
            Recruit heroes to begin!
          </div>
        )}
      </div>

      {/* Scrollable map */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 space-y-1">
        {DUNGEON_TIERS.map((tier, tierIndex) => {
          const tierLevels = [];
          for (let l = tier.minLevel; l <= tier.maxLevel; l++) {
            tierLevels.push(l);
          }

          const isTierUnlocked = tier.minLevel <= effectiveUnlocked;
          const isTierCleared = tier.maxLevel <= highestDungeonCleared;
          const milestoneLevel = tier.maxLevel;
          const milestone = getMilestoneForLevel(milestoneLevel);
          const isMilestoneClaimed = milestone && claimedMilestones.includes(milestone.id);

          return (
            <div
              key={tier.id}
              className={`pixel-panel p-3 relative transition-opacity ${
                !isTierUnlocked ? 'opacity-40' : ''
              }`}
              style={{
                borderColor: isTierCleared ? tier.color : 'var(--color-border)',
                background: isTierCleared
                  ? `linear-gradient(135deg, ${tier.color}15 0%, transparent 50%)`
                  : undefined,
              }}
            >
              {/* Tier header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{TIER_ICONS[tier.theme]}</span>
                <div>
                  <div className="font-bold text-sm" style={{ color: tier.color }}>
                    {tier.name}
                  </div>
                  <div className="text-xs text-[var(--color-text-dim)]">
                    Levels {tier.minLevel}-{tier.maxLevel}
                  </div>
                </div>
                {isTierCleared && (
                  <span className="ml-auto text-green-400 text-lg">✓</span>
                )}
              </div>

              {/* Dungeon nodes path */}
              <div className="relative" style={{ height: '100px' }}>
                {/* SVG path connecting nodes */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {tierLevels.slice(0, -1).map((level, i) => {
                    const pos1 = getNodePosition(i + 1);
                    const pos2 = getNodePosition(i + 2);
                    const isPathCleared = level < highestDungeonCleared;
                    return (
                      <line
                        key={level}
                        x1={`${pos1.x}%`}
                        y1={`${pos1.y}%`}
                        x2={`${pos2.x}%`}
                        y2={`${pos2.y}%`}
                        stroke={isPathCleared ? tier.color : 'var(--color-border)'}
                        strokeWidth="2"
                        strokeDasharray={isPathCleared ? '0' : '4 2'}
                        opacity={isPathCleared ? 0.8 : 0.4}
                      />
                    );
                  })}
                </svg>

                {/* Dungeon nodes */}
                {tierLevels.map((level, i) => {
                  const pos = getNodePosition(i + 1);
                  const isCleared = level <= highestDungeonCleared;
                  const isUnlocked = level <= effectiveUnlocked;
                  const isCurrent = level === highestDungeonCleared + 1;
                  const isMilestone = level === milestoneLevel;
                  const isHovered = hoveredNode === level;

                  return (
                    <button
                      key={level}
                      onClick={() => handleStartDungeon(level)}
                      onMouseEnter={() => setHoveredNode(level)}
                      onMouseLeave={() => setHoveredNode(null)}
                      disabled={!canStart || !isUnlocked}
                      className={`
                        absolute transform -translate-x-1/2 -translate-y-1/2
                        w-8 h-8 rounded-full flex items-center justify-center
                        text-xs font-bold transition-all duration-150
                        ${isCleared
                          ? 'bg-green-600 border-2 border-green-400 text-white'
                          : isCurrent
                          ? 'bg-blue-600 border-2 border-blue-400 text-white animate-pulse'
                          : isUnlocked
                          ? 'bg-[var(--color-panel)] border-2 border-[var(--color-border)] text-[var(--color-text)] hover:border-blue-400 hover:scale-110'
                          : 'bg-gray-800 border-2 border-gray-700 text-gray-600'
                        }
                        ${isMilestone ? 'w-10 h-10 ring-2 ring-[var(--color-gold)] ring-offset-1 ring-offset-[var(--color-bg)]' : ''}
                        ${isHovered && isUnlocked ? 'scale-125 z-10' : ''}
                      `}
                      style={{
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
                      }}
                      title={`Dungeon ${level}${isMilestone ? ' (Milestone)' : ''}`}
                    >
                      {isCleared ? '✓' : level}
                    </button>
                  );
                })}
              </div>

              {/* Milestone reward preview */}
              {MILESTONE_REWARDS[milestoneLevel] && (
                <div
                  className={`mt-2 text-xs p-2 rounded ${
                    isMilestoneClaimed
                      ? 'bg-green-900/30 text-green-400'
                      : highestDungeonCleared >= milestoneLevel
                      ? 'bg-[var(--color-gold)]/20 text-[var(--color-gold)] animate-pulse'
                      : 'bg-[var(--color-panel-dark)] text-[var(--color-text-dim)]'
                  }`}
                >
                  <span className="font-bold">D{milestoneLevel} Reward:</span>{' '}
                  {MILESTONE_REWARDS[milestoneLevel].gold.toLocaleString()} gold,{' '}
                  {MILESTONE_REWARDS[milestoneLevel].bonus}
                  {isMilestoneClaimed && ' ✓ Claimed'}
                  {!isMilestoneClaimed && highestDungeonCleared >= milestoneLevel && ' - Ready to claim!'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tooltip for hovered node */}
      {hoveredNode && (
        <div className="mt-3 pixel-panel-dark p-2 text-sm">
          <div className="flex justify-between">
            <span className="font-bold">Dungeon {hoveredNode}</span>
            <span className={
              hoveredNode <= highestDungeonCleared
                ? 'text-green-400'
                : hoveredNode <= effectiveUnlocked
                ? 'text-blue-400'
                : 'text-gray-500'
            }>
              {hoveredNode <= highestDungeonCleared
                ? 'Cleared'
                : hoveredNode <= effectiveUnlocked
                ? 'Available'
                : 'Locked'}
            </span>
          </div>
          {hoveredNode <= effectiveUnlocked && canStart && (
            <div className="text-xs text-[var(--color-text-dim)] mt-1">
              Click to start
            </div>
          )}
        </div>
      )}

      {/* Warning if dungeon in progress */}
      {dungeon && (
        <div className="mt-2 text-xs text-orange-400 text-center">
          Starting a new dungeon will abandon Level {dungeon.level}
        </div>
      )}
    </div>
  );
};

export default DungeonMap;
