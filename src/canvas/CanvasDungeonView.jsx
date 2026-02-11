// React wrapper for the Canvas-based dungeon renderer
// Manages canvas lifecycle and integrates with React effect system

import { useRef, useEffect, useCallback, memo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CanvasRenderer, TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './CanvasRenderer';
import { getThemeForLevel } from '../data/dungeonThemes';
import { MILESTONES, DUNGEON_TIERS } from '../data/milestones';
import { CrownIcon, TrophyIcon, StarIcon, ScrollIcon } from '../components/icons/ui';
import { MonsterIcon } from '../components/icons/monsters';

// Throttled state hook - only updates UI when meaningful changes occur
// Default 509ms (offset from other 500ms intervals to prevent batching)
function useThrottledCombatState(interval = 509) {
  const [state, setState] = useState(() => {
    const roomCombat = useGameStore.getState().roomCombat;
    return {
      dungeon: roomCombat?.dungeon,
      monsters: roomCombat?.monsters || [],
      partyPosition: roomCombat?.partyPosition || { x: 0, y: 0 },
      phase: roomCombat?.phase,
      bossUnlocked: roomCombat?.bossUnlocked || false,
    };
  });

  const lastRef = useRef({
    phase: null,
    bossUnlocked: false,
    aliveCount: 0,
    bossHp: 0,
    partyX: 0,
    partyY: 0,
    hasDungeon: false,
  });

  useEffect(() => {
    const update = () => {
      const roomCombat = useGameStore.getState().roomCombat;
      const last = lastRef.current;

      // Quick checks for changes
      const hasDungeon = !!roomCombat?.dungeon;
      const phase = roomCombat?.phase;
      const bossUnlocked = roomCombat?.bossUnlocked || false;
      const monsters = roomCombat?.monsters || [];
      const aliveCount = monsters.filter(m => m.stats.hp > 0).length;
      const boss = monsters.find(m => m.isBoss);
      const bossHp = boss?.stats?.hp || 0;
      const partyX = roomCombat?.partyPosition?.x || 0;
      const partyY = roomCombat?.partyPosition?.y || 0;

      // Only update if something meaningful changed (including boss HP)
      if (
        phase !== last.phase ||
        bossUnlocked !== last.bossUnlocked ||
        aliveCount !== last.aliveCount ||
        bossHp !== last.bossHp ||
        partyX !== last.partyX ||
        partyY !== last.partyY ||
        hasDungeon !== last.hasDungeon
      ) {
        lastRef.current = { phase, bossUnlocked, aliveCount, bossHp, partyX, partyY, hasDungeon };
        setState({
          dungeon: roomCombat?.dungeon,
          monsters,
          partyPosition: roomCombat?.partyPosition || { x: 0, y: 0 },
          phase,
          bossUnlocked,
        });
      }
    };

    const id = setInterval(update, interval);
    return () => clearInterval(id);
  }, [interval]);

  return state;
}

// Minimap component - reused from DungeonView
const Minimap = memo(({ dungeon, partyPosition, monsters }) => {
  const canvasRef = useRef(null);
  const bgCanvasRef = useRef(null);

  const { grid, width, height, bossRoom, level } = dungeon;
  const theme = getThemeForLevel(level || 1);
  const colors = theme.colors;

  const scale = Math.min(140 / width, 105 / height);
  const mapWidth = Math.ceil(width * scale);
  const mapHeight = Math.ceil(height * scale);

  // Draw static grid to offscreen canvas
  useEffect(() => {
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = mapWidth;
    bgCanvas.height = mapHeight;
    const ctx = bgCanvas.getContext('2d');

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = grid[y][x];
        if (tile === 0) continue; // WALL

        let color = colors.floor;
        if (x >= bossRoom.x && x < bossRoom.x + bossRoom.width &&
            y >= bossRoom.y && y < bossRoom.y + bossRoom.height) {
          color = '#7f1d1d';
        } else if (tile === 6) { // TREASURE
          color = '#ca8a04';
        } else if (tile === 4) { // ENTRANCE
          color = '#1d4ed8';
        } else if (tile === 2) { // CORRIDOR
          color = '#4a5568';
        }

        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, Math.max(1, scale), Math.max(1, scale));
      }
    }

    bgCanvasRef.current = bgCanvas;
  }, [grid, width, height, bossRoom, scale, mapWidth, mapHeight, colors]);

  // Draw units
  useEffect(() => {
    const canvas = canvasRef.current;
    const bgCanvas = bgCanvasRef.current;
    if (!canvas || !bgCanvas) return;

    const ctx = canvas.getContext('2d');
    // Clear canvas before redrawing to prevent trail artifacts
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgCanvas, 0, 0);

    for (const m of monsters) {
      if (m.stats.hp <= 0) continue;
      ctx.fillStyle = m.isBoss ? '#fbbf24' : '#ef4444';
      ctx.beginPath();
      ctx.arc(m.position.x * scale, m.position.y * scale, m.isBoss ? 2 : 1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#4ade80';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(partyPosition.x * scale, partyPosition.y * scale, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }, [monsters, partyPosition, scale]);

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-2">
      <div className="text-xs text-gray-400 mb-1">{theme.name}</div>
      <canvas
        ref={canvasRef}
        width={mapWidth}
        height={mapHeight}
        className="rounded"
        style={{ backgroundColor: colors.floorAlt }}
      />
    </div>
  );
});

// Boss panel component
const BossPanel = memo(({ boss, bossUnlocked }) => {
  if (!boss || boss.stats.hp <= 0) return null;

  const hpPercent = (boss.stats.hp / boss.stats.maxHp) * 100;
  const hpColor = hpPercent > 50 ? '#22c55e' : hpPercent > 25 ? '#eab308' : '#ef4444';

  return (
    <div className="pixel-panel-dark p-3 w-[160px]">
      <div className="text-center mb-2">
        <div className="text-red-500 font-bold text-sm tracking-wider flex items-center justify-center gap-1">
          <CrownIcon size={16} />
          BOSS
          <CrownIcon size={16} />
        </div>
      </div>

      <div className="flex flex-col items-center mb-3">
        <div className="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg mb-1 border-2 border-red-600">
          <MonsterIcon monsterId={boss.templateId} size={40} />
        </div>
        <span className="text-yellow-400 font-bold text-sm truncate max-w-full">{boss.name}</span>
        {boss.title && <span className="text-gray-400 text-xs">{boss.title}</span>}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">HP</span>
          <span className="text-white">{Math.floor(boss.stats.hp)}/{boss.stats.maxHp}</span>
        </div>
        <div className="h-3 bg-gray-800 rounded overflow-hidden">
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${hpPercent}%`, backgroundColor: hpColor }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center bg-gray-800/50 rounded p-1">
          <div className="text-red-400 font-bold">{boss.stats.attack}</div>
          <div className="text-gray-500 text-[10px]">ATK</div>
        </div>
        <div className="text-center bg-gray-800/50 rounded p-1">
          <div className="text-blue-400 font-bold">{boss.stats.defense}</div>
          <div className="text-gray-500 text-[10px]">DEF</div>
        </div>
        <div className="text-center bg-gray-800/50 rounded p-1">
          <div className="text-green-400 font-bold">{boss.stats.speed}</div>
          <div className="text-gray-500 text-[10px]">SPD</div>
        </div>
      </div>

      {!bossUnlocked && (
        <div className="mt-3 text-center text-xs text-gray-500 bg-gray-800/50 rounded p-1">
          Clear monsters to unlock
        </div>
      )}
    </div>
  );
});

// Milestone rewards
const STAT_LABELS = {
  goldFind: 'Gold Find',
  xpGain: 'XP Gain',
  critChance: 'Crit Chance',
  damage: 'Damage',
  defense: 'Defense',
  allStats: 'All Stats',
};

// Progression tracker component
const ProgressionTracker = ({ currentLevel, highestCleared, claimedMilestones }) => {
  const claimMilestone = useCallback((id) => useGameStore.getState().claimMilestone(id), []);
  const addGold = useCallback((amount) => useGameStore.getState().addGold(amount), []);
  const applyMilestoneBonus = useCallback((stat, value) => useGameStore.getState().applyMilestoneBonus(stat, value), []);

  const currentTier = DUNGEON_TIERS.find(t => currentLevel >= t.minLevel && currentLevel <= t.maxLevel) || DUNGEON_TIERS[0];
  const nextTier = DUNGEON_TIERS.find(t => t.minLevel > currentTier.maxLevel);

  const tierProgress = currentLevel - currentTier.minLevel;
  const tierTotal = currentTier.maxLevel - currentTier.minLevel + 1;

  const milestoneLevels = Object.keys(MILESTONES).map(Number).sort((a, b) => a - b);
  const nextMilestoneLevel = milestoneLevels.find(l => l > highestCleared);
  const nextMilestone = nextMilestoneLevel ? MILESTONES[nextMilestoneLevel] : null;
  const levelsToMilestone = nextMilestoneLevel ? nextMilestoneLevel - highestCleared : 0;

  const unclaimedMilestoneLevel = milestoneLevels.find(l => l <= highestCleared && !claimedMilestones.includes(`milestone_${l}`));
  const unclaimedMilestone = unclaimedMilestoneLevel ? MILESTONES[unclaimedMilestoneLevel] : null;

  const handleClaimMilestone = () => {
    if (!unclaimedMilestone) return;
    const rewards = unclaimedMilestone.rewards;
    claimMilestone(unclaimedMilestone.id);
    if (rewards.gold) addGold(rewards.gold);
    if (rewards.permanentBonus) {
      for (const [stat, value] of Object.entries(rewards.permanentBonus)) {
        applyMilestoneBonus(stat, value);
      }
    }
  };

  const formatMilestoneRewards = (milestone) => {
    if (!milestone?.rewards) return null;
    const { gold, permanentBonus, unlocks } = milestone.rewards;
    const parts = [];
    if (gold) parts.push(`${gold.toLocaleString()} gold`);
    if (permanentBonus) {
      Object.entries(permanentBonus).forEach(([stat, val]) => {
        parts.push(`+${Math.round(val * 100)}% ${STAT_LABELS[stat] || stat}`);
      });
    }
    if (unlocks?.length > 0) {
      const unlockNames = unlocks.map(u => {
        if (u === 'elite_dungeons') return 'Elite Mode';
        if (u === 'raids') return 'Raids';
        if (u === 'ascension_mode') return 'Ascension';
        return u;
      });
      parts.push(`Unlocks: ${unlockNames.join(', ')}`);
    }
    return parts;
  };

  return (
    <div className="bg-gray-800/80 rounded-lg px-3 py-2 mb-2 border border-gray-700">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentTier.color }} />
          <div>
            <div className="text-white font-medium text-sm">{currentTier.name}</div>
            <div className="text-gray-400 text-xs">
              Level {currentLevel} of {currentTier.minLevel}-{currentTier.maxLevel}
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-40">
          <div className="flex justify-between text-xs text-gray-500 mb-0.5">
            <span>Tier Progress</span>
            <span>{tierProgress + 1}/{tierTotal}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full transition-all rounded-full"
              style={{
                width: `${Math.min(100, ((tierProgress + 1) / tierTotal) * 100)}%`,
                backgroundColor: currentTier.color
              }}
            />
          </div>
        </div>

        <div className="flex-1">
          {unclaimedMilestone ? (
            <button
              onClick={handleClaimMilestone}
              className="w-full bg-yellow-600/20 hover:bg-yellow-600/40 border border-yellow-500 rounded-lg px-3 py-1.5 transition-all group"
            >
              <div className="flex items-center gap-2">
                <div className="animate-pulse text-yellow-400">
                  <TrophyIcon size={20} />
                </div>
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-medium text-sm">
                      D{unclaimedMilestoneLevel}: {unclaimedMilestone.name}
                    </span>
                    <span className="text-yellow-300 text-xs bg-yellow-600/30 px-1.5 rounded">CLAIM</span>
                  </div>
                  <div className="text-yellow-200/70 text-xs truncate">
                    {formatMilestoneRewards(unclaimedMilestone)?.slice(0, 2).join(' • ')}
                  </div>
                </div>
              </div>
            </button>
          ) : nextMilestone ? (
            <div className="bg-gray-900/50 rounded-lg px-3 py-1.5 border border-gray-700">
              <div className="flex items-center gap-2">
                <div className="opacity-60 text-gray-400">
                  <StarIcon size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300 font-medium text-sm">
                      D{nextMilestoneLevel}: {nextMilestone.name}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {levelsToMilestone} {levelsToMilestone === 1 ? 'level' : 'levels'} away
                    </span>
                  </div>
                  <div className="text-gray-500 text-xs truncate">
                    {formatMilestoneRewards(nextMilestone)?.slice(0, 2).join(' • ')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-purple-900/30 rounded-lg px-3 py-1.5 border border-purple-700 text-center flex items-center justify-center gap-2">
              <TrophyIcon size={16} />
              <span className="text-purple-400 font-medium text-sm">All Milestones Complete!</span>
            </div>
          )}
        </div>

        {nextTier && (
          <div className="border-l border-gray-600 pl-3">
            <div className="text-gray-500 text-xs">Next Area</div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: nextTier.color }} />
              <span className="text-gray-300 text-sm">{nextTier.name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Canvas Dungeon View component
const CanvasDungeonView = ({ effects = [], onEffectComplete }) => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);

  // Get static state (doesn't change during dungeon)
  const highestDungeonCleared = useGameStore(state => state.highestDungeonCleared);
  const claimedMilestones = useGameStore(state => state.claimedMilestones);
  const consumables = useGameStore(state => state.consumables);

  // Get throttled combat state (updates every 250ms instead of every tick)
  const { dungeon, monsters, partyPosition, phase, bossUnlocked } = useThrottledCombatState();

  // Initialize renderer on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    rendererRef.current = new CanvasRenderer(canvas, {
      onEffectComplete,
    });
    rendererRef.current.start();

    return () => {
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [onEffectComplete]);

  // Update effects when they change
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.addEffects(effects);
    }
  }, [effects]);

  // Find boss monster
  const bossMonster = monsters.find(m => m.isBoss);

  // Count monsters
  const aliveNonBoss = monsters.filter(m => m.stats.hp > 0 && !m.isBoss).length;
  const bossAlive = bossMonster && bossMonster.stats.hp > 0;

  // Get phase display
  const phaseDisplay = (() => {
    switch (phase) {
      case 'exploring': return 'Exploring...';
      case 'combat': return 'Combat!';
      case 'clearing': return 'Victory!';
      case 'transitioning': return 'Moving...';
      case 'complete': return 'Dungeon Complete!';
      case 'defeat': return 'Defeated';
      default: return '';
    }
  })();

  if (!dungeon) return null;

  const theme = getThemeForLevel(dungeon.level);

  return (
    <div className="flex flex-col items-center">
      {/* Meta Progression Tracker */}
      <ProgressionTracker
        currentLevel={dungeon.level}
        highestCleared={highestDungeonCleared}
        claimedMilestones={claimedMilestones}
      />

      {/* Header with theme name */}
      <div className="mb-2 flex items-center justify-between w-full">
        <div>
          <h3 className="text-lg font-bold text-white">
            {theme.name} - Level {dungeon.level}
          </h3>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-400">
              Monsters: <span className="text-red-400">{aliveNonBoss}</span>
            </span>
            <span className={bossUnlocked ? 'text-yellow-400' : 'text-gray-600'}>
              Boss: {bossUnlocked ? (bossAlive ? 'FIGHT!' : 'Defeated') : 'Locked'}
            </span>
            <span className="text-gray-500">{phaseDisplay}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Main canvas viewport */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            className={`rounded-lg border-2 ${
              phase === 'combat' ? 'border-red-600' : 'border-gray-700'
            }`}
            style={{
              width: VIEWPORT_WIDTH * TILE_SIZE,
              height: VIEWPORT_HEIGHT * TILE_SIZE,
              imageRendering: 'pixelated',
            }}
          />

          {/* Resurrection Scroll indicator */}
          <div
            className={`absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded ${
              consumables?.length > 0
                ? 'bg-purple-900/80 border border-purple-500/50'
                : 'bg-gray-900/60 border border-gray-700/50'
            }`}
            title={consumables?.length > 0 ? 'Resurrection Scroll ready - auto-revives at 50% HP' : 'No resurrection scroll'}
          >
            <ScrollIcon size={16} />
            <span className={`text-sm font-bold ${consumables?.length > 0 ? 'text-purple-300' : 'text-gray-500'}`}>
              x{consumables?.length || 0}
            </span>
          </div>
        </div>

        {/* Sidebar: Minimap and Boss Panel */}
        <div className="flex flex-col gap-2">
          <Minimap
            dungeon={dungeon}
            partyPosition={partyPosition}
            monsters={monsters}
          />
          {bossMonster && <BossPanel boss={bossMonster} bossUnlocked={bossUnlocked} />}
        </div>
      </div>
    </div>
  );
};

export default memo(CanvasDungeonView);
