// React wrapper for the Canvas-based dungeon renderer
// Manages canvas lifecycle and integrates with React effect system

import { useRef, useEffect, memo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CanvasRenderer, TILE_SIZE, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './CanvasRenderer';
import { getThemeForLevel, getThemeForRaid } from '../data/dungeonThemes';
import { CrownIcon, ScrollIcon, SkullIcon, CheckIcon, LockIcon, ChestIcon } from '../components/icons/ui';
import { MonsterIcon } from '../components/icons/monsters';
import { WorldBossIcon } from '../components/icons/worldBosses';
import { RaidBossIcon } from '../components/icons/raidBosses';
import { RAIDS } from '../data/raids';
import { getUniqueItem } from '../data/uniqueItems';
import { RAID_BOSS_SPRITE_MAP, getRaidBossSpriteId } from '../data/raidBossSpriteMap';

// Stable reference to prevent re-renders
const EMPTY_ARRAY = [];

// Raid boss sprite mapping imported from shared module

// Throttled state hook - only updates UI when meaningful changes occur
// Default 509ms (offset from other 500ms intervals to prevent batching)
function useThrottledCombatState(interval = 509) {
  const [state, setState] = useState(() => {
    const roomCombat = useGameStore.getState().roomCombat;
    return {
      dungeon: roomCombat?.dungeon,
      monsters: roomCombat?.monsters || [],
      combatMonsterIds: roomCombat?.combatMonsters || [],
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
    combatMonsterCount: 0,
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
      const combatMonsterIds = roomCombat?.combatMonsters || [];
      const aliveCount = monsters.filter(m => m.stats.hp > 0).length;
      const boss = monsters.find(m => m.isBoss);
      const bossHp = boss?.stats?.hp || 0;
      const partyX = roomCombat?.partyPosition?.x || 0;
      const partyY = roomCombat?.partyPosition?.y || 0;
      const combatMonsterCount = combatMonsterIds.length;

      // Only update if something meaningful changed (including boss HP and combat monsters)
      if (
        phase !== last.phase ||
        bossUnlocked !== last.bossUnlocked ||
        aliveCount !== last.aliveCount ||
        bossHp !== last.bossHp ||
        partyX !== last.partyX ||
        partyY !== last.partyY ||
        hasDungeon !== last.hasDungeon ||
        combatMonsterCount !== last.combatMonsterCount
      ) {
        lastRef.current = { phase, bossUnlocked, aliveCount, bossHp, partyX, partyY, hasDungeon, combatMonsterCount };
        setState({
          dungeon: roomCombat?.dungeon,
          monsters,
          combatMonsterIds,
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

  const { grid, width, height, bossRoom, level, isRaid, raidId } = dungeon;
  // Use raid theme for raid dungeons
  const theme = isRaid && raidId
    ? getThemeForRaid(raidId)
    : getThemeForLevel(level || 1);
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
    if (!ctx) return;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const tile = grid[y]?.[x];
        if (tile == null || tile === 0) continue; // null/undefined/WALL

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
    if (!ctx) return;
    // Clear canvas before redrawing to prevent trail artifacts
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bgCanvas, 0, 0);

    for (const m of monsters) {
      if (m.stats.hp <= 0) continue;
      // Boss: gold, Elite: orange, Regular: red
      ctx.fillStyle = m.isBoss ? '#fbbf24' : m.isElite ? '#f97316' : '#ef4444';
      ctx.beginPath();
      const radius = m.isBoss ? 2 : m.isElite ? 1.5 : 1;
      ctx.arc(m.position.x * scale, m.position.y * scale, radius, 0, Math.PI * 2);
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

  // Determine boss type for styling
  const isRaidBoss = boss.isRaidBoss || boss.isWingBoss || boss.isFinalBoss;
  const borderColor = boss.isWorldBoss ? 'border-amber-500' : isRaidBoss ? 'border-purple-500' : 'border-red-600';
  const nameColor = boss.isWorldBoss ? 'text-amber-400' : isRaidBoss ? 'text-purple-400' : 'text-yellow-400';
  const labelText = boss.isWorldBoss ? 'WORLD BOSS' : boss.isFinalBoss ? 'FINAL BOSS' : boss.isWingBoss ? 'WING BOSS' : 'BOSS';
  const labelColor = boss.isWorldBoss ? 'text-amber-500' : isRaidBoss ? 'text-purple-500' : 'text-red-500';

  return (
    <div className="pixel-panel-dark p-3 w-[160px]">
      <div className="text-center mb-2">
        <div className={`${labelColor} font-bold text-sm tracking-wider flex items-center justify-center gap-1`}>
          <CrownIcon size={16} />
          {labelText}
          <CrownIcon size={16} />
        </div>
      </div>

      <div className="flex flex-col items-center mb-3">
        <div className={`w-12 h-12 flex items-center justify-center bg-gray-800 rounded-lg mb-1 border-2 ${borderColor}`}>
          {boss.isWorldBoss ? (
            <WorldBossIcon bossId={boss.templateId} size={40} />
          ) : isRaidBoss ? (
            <RaidBossIcon spriteId={getRaidBossSpriteId(boss.templateId)} size={40} />
          ) : (
            <MonsterIcon monsterId={boss.templateId} size={40} />
          )}
        </div>
        <span className={`font-bold text-sm truncate max-w-full ${nameColor}`}>{boss.name}</span>
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
          {boss.isFinalBoss ? 'Defeat all wing bosses' : 'Clear monsters to unlock'}
        </div>
      )}
    </div>
  );
});

// Raid Boss Overview - shows all raid bosses with their status and drops
// Not using memo() here to ensure re-renders when defeatedBosses updates
const RaidBossOverview = ({ raidId, defeatedBosses, monsters, combatMonsterIds = [] }) => {
  const raid = RAIDS[raidId];
  if (!raid) return null;

  const allBosses = [...raid.wingBosses, { ...raid.finalBoss, isFinalBoss: true }];
  const allWingsDefeated = raid.wingBosses.every(wb => defeatedBosses.includes(wb.id));

  // Check if a boss is currently in active combat (party is fighting them)
  const isBossInCombat = (bossId) => {
    // Find the boss monster by matching wingBossId or finalBossId
    const bossMonster = monsters.find(m =>
      (m.wingBossId === bossId || m.finalBossId === bossId) && m.stats.hp > 0
    );
    // Check if the boss monster is in the current combat
    return bossMonster && combatMonsterIds.includes(bossMonster.id);
  };

  return (
    <div className="pixel-panel-dark p-2 w-[200px]">
      <div className="text-center mb-2">
        <div className="text-purple-400 font-bold text-xs tracking-wider">
          RAID BOSSES
        </div>
        <div className="text-[10px] text-gray-500">
          {defeatedBosses.length}/{allBosses.length} defeated
        </div>
      </div>

      <div className="space-y-2">
        {allBosses.map((boss, idx) => {
          const isDefeated = defeatedBosses.includes(boss.id);
          // Final boss is only locked if not all wing bosses are defeated AND final boss isn't defeated yet
          const isLocked = boss.isFinalBoss && !allWingsDefeated && !isDefeated;
          const isInCombat = isBossInCombat(boss.id);

          // Get unique drops from drop table
          const uniqueDrops = (boss.dropTable || [])
            .filter(drop => drop.type === 'unique')
            .map(drop => getUniqueItem(drop.itemId))
            .filter(Boolean);

          return (
            <div
              key={boss.id}
              className={`p-2 rounded border transition-all ${
                isDefeated
                  ? 'border-green-600/60 bg-green-900/30'
                  : isLocked
                  ? 'border-gray-600/40 bg-gray-800/30 opacity-60'
                  : isInCombat
                  ? 'border-red-500/60 bg-red-900/30 animate-pulse'
                  : boss.isFinalBoss
                  ? 'border-amber-500/50 bg-amber-900/20'
                  : 'border-purple-500/40 bg-purple-900/20'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Boss icon - always show sprite (except when locked) */}
                <div className={`w-10 h-10 flex items-center justify-center rounded border ${
                  isDefeated
                    ? 'border-green-600/50 bg-green-900/40'
                    : isLocked
                    ? 'border-gray-600 bg-gray-800'
                    : boss.isFinalBoss
                    ? 'border-amber-500/60 bg-amber-900/40'
                    : 'border-purple-500/50 bg-purple-900/40'
                }`}>
                  {isLocked ? (
                    <LockIcon size={20} className="text-gray-500" />
                  ) : (
                    <RaidBossIcon spriteId={getRaidBossSpriteId(boss.id)} size={32} />
                  )}
                </div>

                {/* Boss info */}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-bold flex items-center gap-1 ${
                    isDefeated
                      ? 'text-green-400'
                      : isLocked
                      ? 'text-gray-500'
                      : boss.isFinalBoss
                      ? 'text-amber-400'
                      : 'text-purple-300'
                  }`}>
                    {boss.isFinalBoss && <CrownIcon size={10} className="flex-shrink-0" />}
                    <span className="truncate">{boss.name}</span>
                  </div>

                  {/* Status text */}
                  <div className={`text-[10px] font-bold mt-0.5 ${
                    isDefeated
                      ? 'text-green-400'
                      : isInCombat
                      ? 'text-red-400'
                      : isLocked
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  }`}>
                    {isDefeated ? (
                      <span className="flex items-center gap-1 bg-green-600/50 px-1 rounded">
                        <CheckIcon size={10} className="text-white" /> DEFEATED
                      </span>
                    ) : isInCombat ? (
                      <span className="bg-red-600/50 px-1 rounded">⚔ IN COMBAT!</span>
                    ) : isLocked ? (
                      <span className="opacity-70">🔒 LOCKED</span>
                    ) : (
                      'AWAITING'
                    )}
                  </div>

                  {/* Boss stats - only show for unlocked */}
                  {!isLocked && !isDefeated && boss.baseStats && (
                    <div className="text-[9px] text-gray-500 mt-0.5 flex gap-2">
                      <span>HP: {boss.baseStats.maxHp}</span>
                      <span>ATK: {boss.baseStats.attack}</span>
                    </div>
                  )}

                  {/* Drops - only show for non-locked */}
                  {!isLocked && uniqueDrops.length > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <ChestIcon size={10} className={isDefeated ? 'text-gray-500' : 'text-amber-400'} />
                      <span className={`text-[9px] truncate ${isDefeated ? 'text-gray-500' : 'text-amber-300'}`}>
                        {uniqueDrops.map(u => u.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main Canvas Dungeon View component
const CanvasDungeonView = ({ effects = [], onEffectComplete }) => {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);

  // Get static state (doesn't change during dungeon)
  const consumables = useGameStore(state => state.consumables);
  // Use specific selector for defeatedWingBosses to ensure re-renders on updates
  const defeatedWingBosses = useGameStore(state => state.raidState?.defeatedWingBosses);
  const raidState = useGameStore(state => state.raidState);

  // Get throttled combat state (updates every 250ms instead of every tick)
  const { dungeon, monsters, combatMonsterIds, partyPosition, phase, bossUnlocked } = useThrottledCombatState();

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

  if (!dungeon) return null;

  return (
    <div className="flex flex-col items-center">
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
          {/* Show raid boss overview for raids, single boss panel for regular dungeons */}
          {dungeon.isRaid && dungeon.raidId ? (
            <RaidBossOverview
              raidId={dungeon.raidId}
              defeatedBosses={defeatedWingBosses || EMPTY_ARRAY}
              monsters={monsters}
              combatMonsterIds={combatMonsterIds}
            />
          ) : (
            bossMonster && <BossPanel boss={bossMonster} bossUnlocked={bossUnlocked} />
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(CanvasDungeonView);
