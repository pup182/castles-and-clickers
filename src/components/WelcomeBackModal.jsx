const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const WelcomeBackModal = ({ progress, onClose }) => {
  if (!progress) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="pixel-panel p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4" style={{ imageRendering: 'pixelated' }}>
            <svg width="64" height="64" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
              <rect x="3" y="8" width="10" height="8" fill="#4a4a6a"/>
              <rect x="4" y="6" width="8" height="2" fill="#5a5a7a"/>
              <rect x="5" y="4" width="6" height="2" fill="#6a6a8a"/>
              <rect x="7" y="2" width="2" height="2" fill="#ffd700"/>
              <rect x="6" y="10" width="4" height="6" fill="#2a2a4a"/>
              <rect x="7" y="11" width="2" height="3" fill="#8b4513"/>
            </svg>
          </div>
          <h2 className="pixel-title text-2xl mb-2">Welcome Back!</h2>
          <p className="text-[var(--color-text-dim)] mb-6">
            You were away for {formatDuration(progress.elapsedSeconds)}
          </p>
        </div>

        <div className="pixel-panel-dark p-4 mb-6">
          <h3 className="text-sm text-[var(--color-text-dim)] mb-3 text-center">
            While you were away, your heroes earned:
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[var(--color-gold)]">
                Gold
              </span>
              <span className="text-[var(--color-text)] font-bold text-xl">
                +{progress.goldEarned.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-purple-400">
                Experience
              </span>
              <span className="text-[var(--color-text)] font-bold text-xl">
                +{progress.xpEarned.toLocaleString()}
              </span>
            </div>

            {progress.runsCompleted !== undefined && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-blue-400">
                  Dungeons Cleared
                </span>
                <span className="text-[var(--color-text)] font-bold text-xl">
                  {progress.runsCompleted}
                </span>
              </div>
            )}

            {progress.levelsProgressed > 0 && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-green-400">
                  Dungeon Progress
                </span>
                <span className="text-[var(--color-text)] font-bold">
                  Level {progress.startingLevel + 1} → {progress.newHighestLevel}
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full pixel-btn pixel-btn-primary"
        >
          Continue Adventuring
        </button>
      </div>
    </div>
  );
};

export default WelcomeBackModal;
