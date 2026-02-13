import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { CastleIcon, GoldIcon, BagIcon, WarningIcon, PauseIcon, PlayIcon, ResetIcon } from './icons/ui';

const GameHeader = () => {
  const { gold, stats, gameSpeed, setGameSpeed, isRunning, toggleRunning, dungeon, resetGame, inventory, maxInventory } = useGameStore();
  const inventoryPercent = (inventory.length / maxInventory) * 100;
  const inventoryWarning = inventoryPercent >= 80;
  const inventoryFull = inventoryPercent >= 100;
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="pixel-panel p-4 flex items-center justify-between">
      {/* Game Title */}
      <div className="flex items-center gap-3">
        <CastleIcon size={32} />
        <div>
          <h1 className="text-xl font-bold text-white">Castles & Clickers</h1>
          <p className="text-[var(--color-text-dim)] text-sm">Idle Dungeon Crawler <span className="text-[var(--color-text-dark)]">v0.0.5</span></p>
        </div>
      </div>

      {/* Resources */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-[var(--color-gold)] font-bold text-lg flex items-center gap-1">
            <GoldIcon size={18} />
            {gold.toLocaleString()}
          </div>
          <div className="text-[var(--color-text-dark)] text-xs">Gold</div>
        </div>

        <div className="text-center">
          <div className="text-green-400 font-bold text-lg">
            {stats.totalDungeonsCleared}
          </div>
          <div className="text-[var(--color-text-dark)] text-xs">Dungeons</div>
        </div>

        <div className="text-center">
          <div className="text-red-400 font-bold text-lg">
            {stats.totalMonstersKilled}
          </div>
          <div className="text-[var(--color-text-dark)] text-xs">Monsters</div>
        </div>

        <div className="text-center">
          <div className={`font-bold text-lg flex items-center gap-1 ${
            inventoryFull ? 'text-red-400' : inventoryWarning ? 'text-yellow-400' : 'text-blue-400'
          }`}>
            <BagIcon size={18} />
            {inventory.length}/{maxInventory}
            {inventoryFull && <WarningIcon size={14} />}
          </div>
          <div className="text-[var(--color-text-dark)] text-xs">Inventory</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Speed control */}
        <div className="flex pixel-panel-dark" style={{ padding: 0 }}>
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
        {dungeon && (
          <button
            onClick={toggleRunning}
            className={`pixel-btn ${isRunning ? 'pixel-btn-danger' : 'pixel-btn-success'} flex items-center gap-1`}
          >
            {isRunning ? <><PauseIcon size={16} /> Pause</> : <><PlayIcon size={16} /> Play</>}
          </button>
        )}

        {/* Reset Button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="pixel-btn text-sm"
          title="Reset Game"
        >
          <ResetIcon size={18} />
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="pixel-panel p-6 max-w-sm mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Reset Game?</h3>
            <p className="text-[var(--color-text-dim)] mb-4">
              This will delete all progress: heroes, gold, inventory, and stats. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 pixel-btn"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetGame();
                  setShowResetConfirm(false);
                }}
                className="flex-1 pixel-btn pixel-btn-danger"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHeader;
