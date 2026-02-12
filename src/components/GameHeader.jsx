import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const GameHeader = () => {
  const { gold, stats, gameSpeed, setGameSpeed, isRunning, toggleRunning, dungeon, resetGame, inventory, maxInventory } = useGameStore();
  const inventoryPercent = (inventory.length / maxInventory) * 100;
  const inventoryWarning = inventoryPercent >= 80;
  const inventoryFull = inventoryPercent >= 100;
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
      {/* Game Title */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🏰</span>
        <div>
          <h1 className="text-xl font-bold text-white">Castles & Clickers</h1>
          <p className="text-gray-400 text-sm">Idle Dungeon Crawler <span className="text-gray-500">v0.0.4</span></p>
        </div>
      </div>

      {/* Resources */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-yellow-400 font-bold text-lg flex items-center gap-1">
            <span>💰</span>
            {gold.toLocaleString()}
          </div>
          <div className="text-gray-500 text-xs">Gold</div>
        </div>

        <div className="text-center">
          <div className="text-green-400 font-bold text-lg">
            {stats.totalDungeonsCleared}
          </div>
          <div className="text-gray-500 text-xs">Dungeons</div>
        </div>

        <div className="text-center">
          <div className="text-red-400 font-bold text-lg">
            {stats.totalMonstersKilled}
          </div>
          <div className="text-gray-500 text-xs">Monsters</div>
        </div>

        <div className="text-center">
          <div className={`font-bold text-lg flex items-center gap-1 ${
            inventoryFull ? 'text-red-400' : inventoryWarning ? 'text-yellow-400' : 'text-blue-400'
          }`}>
            <span>🎒</span>
            {inventory.length}/{maxInventory}
            {inventoryFull && <span className="text-xs">⚠️</span>}
          </div>
          <div className="text-gray-500 text-xs">Inventory</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Speed control */}
        <div className="flex bg-gray-900 rounded-lg">
          {[1, 2, 3].map(speed => (
            <button
              key={speed}
              onClick={() => setGameSpeed(speed)}
              className={`
                px-3 py-1 text-sm font-medium transition-all
                ${gameSpeed === speed
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'}
                ${speed === 1 ? 'rounded-l-lg' : ''}
                ${speed === 3 ? 'rounded-r-lg' : ''}
              `}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Pause/Play */}
        {dungeon && (
          <button
            onClick={toggleRunning}
            className={`
              px-4 py-1 rounded-lg font-medium transition-all
              ${isRunning
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white'
                : 'bg-green-600 hover:bg-green-500 text-white'}
            `}
          >
            {isRunning ? '⏸️ Pause' : '▶️ Play'}
          </button>
        )}

        {/* Reset Button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-3 py-1 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700 transition-all"
          title="Reset Game"
        >
          🔄
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-xl font-bold text-white mb-2">Reset Game?</h3>
            <p className="text-gray-400 mb-4">
              This will delete all progress: heroes, gold, inventory, and stats. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetGame();
                  setShowResetConfirm(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all"
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
