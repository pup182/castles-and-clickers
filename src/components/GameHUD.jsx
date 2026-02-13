import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import NavBar from './NavBar';
import { GoldIcon, TrophyIcon, SkullIcon, BagIcon } from './icons/ui';

// Throttled header stats hook - updates every 500ms
function useThrottledHeaderStats() {
  const [headerStats, setHeaderStats] = useState(() => {
    const state = useGameStore.getState();
    return {
      gold: state.gold || 0,
      totalDungeonsCleared: state.stats?.totalDungeonsCleared || 0,
      totalMonstersKilled: state.stats?.totalMonstersKilled || 0,
      inventoryCount: state.inventory?.length || 0,
      maxInventory: state.maxInventory || 20,
    };
  });

  const lastRef = useRef({ gold: 0, clears: 0, kills: 0, inv: 0 });

  useEffect(() => {
    const update = () => {
      const state = useGameStore.getState();
      const gold = state.gold || 0;
      const clears = state.stats?.totalDungeonsCleared || 0;
      const kills = state.stats?.totalMonstersKilled || 0;
      const inv = state.inventory?.length || 0;
      const last = lastRef.current;

      if (gold !== last.gold || clears !== last.clears || kills !== last.kills || inv !== last.inv) {
        lastRef.current = { gold, clears, kills, inv };
        setHeaderStats({
          gold,
          totalDungeonsCleared: clears,
          totalMonstersKilled: kills,
          inventoryCount: inv,
          maxInventory: state.maxInventory || 20,
        });
      }
    };
    const id = setInterval(update, 523);
    return () => clearInterval(id);
  }, []);

  return headerStats;
}

const GameHUD = ({
  activeModal,
  onOpenModal,
  gameSpeed,
  setGameSpeed,
  isRunning,
  toggleRunning,
  hasDungeon,
  dungeonSettings,
  setDungeonSettings,
  featureUnlocks,
  markFeatureSeen,
  onReset,
}) => {
  const headerStats = useThrottledHeaderStats();

  return (
    <header className="pixel-panel-dark" style={{ borderRadius: 0, boxShadow: '0 4px 0 rgba(0,0,0,0.5)' }}>
      {/* Top row: Title, Resources */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-700/50">
        {/* Left: Title */}
        <div>
          <h1 className="pixel-title text-lg">
            Castles & Clickers
          </h1>
          <span className="text-xs text-gray-500">v0.1.13</span>
        </div>

        {/* Right: Resources and Stats */}
        <div className="flex items-center gap-3 text-sm">
          <span className="pixel-stat pixel-stat-gold">
            <GoldIcon size={16} /> {Math.floor(headerStats.gold).toLocaleString()}
          </span>
          <span className="pixel-stat pixel-stat-green">
            <TrophyIcon size={16} /> {headerStats.totalDungeonsCleared}
          </span>
          <span className="pixel-stat pixel-stat-red">
            <SkullIcon size={16} /> {headerStats.totalMonstersKilled}
          </span>
          <span className={`pixel-stat ${headerStats.inventoryCount >= headerStats.maxInventory ? 'pixel-stat-red' : 'pixel-stat-blue'}`}>
            <BagIcon size={16} /> {headerStats.inventoryCount}/{headerStats.maxInventory}
          </span>
        </div>
      </div>

      {/* Bottom row: Navigation and Controls */}
      <div className="px-4 py-2 flex items-center justify-between">
        {/* Navigation */}
        <NavBar activeModal={activeModal} onOpenModal={onOpenModal} />

        {/* Game Controls */}
        <div className="flex items-center gap-2">
          {/* Auto-advance toggle */}
          {featureUnlocks?.autoAdvance && (
            <div className="relative">
              <button
                onClick={() => {
                  setDungeonSettings({ autoAdvance: !dungeonSettings?.autoAdvance });
                  if (!featureUnlocks?.autoAdvanceSeen) {
                    markFeatureSeen('autoAdvanceSeen');
                  }
                }}
                className={`pixel-btn text-xs ${
                  dungeonSettings?.autoAdvance ? 'pixel-btn-success' : ''
                }`}
                title="Auto-advance to next dungeon after completion"
              >
                AUTO {dungeonSettings?.autoAdvance ? 'ON' : 'OFF'}
              </button>
              {!featureUnlocks?.autoAdvanceSeen && (
                <span className="pixel-badge absolute -top-2 -right-2 animate-pixel-blink">
                  NEW
                </span>
              )}
            </div>
          )}

          {/* Speed control */}
          <div className="flex">
            {[1, 2, 3].map(speed => (
              <button
                key={speed}
                onClick={() => setGameSpeed(speed)}
                className={`pixel-speed-btn ${gameSpeed === speed ? 'active' : ''}`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Pause/Play */}
          {hasDungeon && (
            <button
              onClick={toggleRunning}
              className={`pixel-btn ${isRunning ? '' : 'pixel-btn-success'}`}
            >
              {isRunning ? 'PAUSE' : 'PLAY'}
            </button>
          )}

          {/* Reset */}
          <button
            onClick={onReset}
            className="pixel-btn text-[var(--color-text-dim)] hover:border-[var(--color-red)]"
            title="Reset Game"
          >
            RESET
          </button>
        </div>
      </div>
    </header>
  );
};

export default GameHUD;
