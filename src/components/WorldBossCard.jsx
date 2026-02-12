import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { WorldBossIcon } from './icons/worldBosses';
import { getUniqueItem } from '../data/uniqueItems';
import { StarIcon, CheckIcon } from './icons/ui';
import LootPreviewCard from './LootPreviewCard';

const WorldBossCard = ({ boss, isDefeated = false, onEnter, compact = false }) => {
  const ownedUniques = useGameStore(state => state.ownedUniques);

  // Get unique drop info
  const uniqueDrop = useMemo(() => {
    if (!boss?.uniqueDrop) return null;
    const unique = getUniqueItem(boss.uniqueDrop);
    if (!unique) return null;
    return {
      ...unique,
      owned: ownedUniques.includes(boss.uniqueDrop),
    };
  }, [boss, ownedUniques]);

  if (!boss) return null;

  if (compact) {
    return (
      <div className={`pixel-panel p-3 ${isDefeated ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <WorldBossIcon bossId={boss.id} size={48} />
            {isDefeated && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                <CheckIcon size={24} className="text-green-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="text-[10px] text-gray-500 uppercase">World Boss:</div>
            <div className="pixel-text font-bold text-red-400">{boss.name}</div>
            <div className="text-xs text-gray-500">{boss.title}</div>
          </div>
          {isDefeated && (
            <span className="pixel-badge bg-green-600 text-white text-xs px-2 py-1">
              DEFEATED
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`pixel-panel p-4 ${isDefeated ? 'opacity-75' : ''}`}>
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-block px-3 py-1 bg-red-900/50 border border-red-600/50 rounded mb-2">
          <span className="text-red-400 text-xs font-bold uppercase tracking-wider">
            World Boss
          </span>
        </div>
      </div>

      {/* Boss portrait */}
      <div className="relative flex justify-center mb-4">
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: isDefeated
              ? 'none'
              : 'radial-gradient(circle, rgba(239, 68, 68, 0.2) 0%, transparent 70%)',
          }}
        />

        {/* Boss sprite */}
        <div
          className={`relative p-4 rounded-lg border-2 ${
            isDefeated
              ? 'border-gray-600 bg-gray-800/50'
              : 'border-red-600/50 bg-red-900/20'
          }`}
        >
          <WorldBossIcon bossId={boss.id} size={96} />

          {/* Defeated overlay */}
          {isDefeated && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
              <div className="text-center">
                <CheckIcon size={32} className="text-green-400 mx-auto mb-1" />
                <span className="text-green-400 text-sm font-bold">DEFEATED</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Boss info */}
      <div className="text-center mb-4">
        <div className="text-xs text-gray-500 uppercase mb-1">World Boss:</div>
        <h3 className="pixel-title text-xl text-red-400 mb-1">{boss.name}</h3>
        <div className="text-gray-400 text-sm italic">"{boss.title}"</div>
        <div className="text-gray-500 text-xs mt-1">Level {boss.level}</div>
      </div>

      {/* Lore */}
      {boss.lore && (
        <div className="text-sm text-gray-400 mb-4 px-2 text-center border-t border-b border-gray-700/50 py-2">
          {boss.lore}
        </div>
      )}

      {/* Unique drop preview */}
      {uniqueDrop && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <StarIcon size={12} className="text-amber-400" />
            <span>Unique Drop:</span>
          </div>
          <LootPreviewCard item={uniqueDrop} owned={uniqueDrop.owned} />
        </div>
      )}

      {/* Stats preview */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-center text-xs">
        <div className="pixel-panel-dark p-2">
          <div className="text-gray-500">HP</div>
          <div className="text-green-400 font-bold">{boss.baseStats?.maxHp?.toLocaleString()}</div>
        </div>
        <div className="pixel-panel-dark p-2">
          <div className="text-gray-500">ATK</div>
          <div className="text-red-400 font-bold">{boss.baseStats?.attack}</div>
        </div>
        <div className="pixel-panel-dark p-2">
          <div className="text-gray-500">DEF</div>
          <div className="text-blue-400 font-bold">{boss.baseStats?.defense}</div>
        </div>
        <div className="pixel-panel-dark p-2">
          <div className="text-gray-500">SPD</div>
          <div className="text-yellow-400 font-bold">{boss.baseStats?.speed}</div>
        </div>
      </div>

      {/* Enter button */}
      {!isDefeated && onEnter && (
        <button
          onClick={() => onEnter(boss.level)}
          className="w-full pixel-btn pixel-btn-primary"
        >
          Enter Dungeon
        </button>
      )}

      {/* Already defeated message */}
      {isDefeated && (
        <div className="text-center text-gray-500 text-sm">
          You have defeated this boss
        </div>
      )}
    </div>
  );
};

export default WorldBossCard;
