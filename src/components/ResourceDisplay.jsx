import { GoldIcon, TrophyIcon } from './icons/ui';

const ResourceDisplay = ({ gold, dungeonLevel, compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="pixel-stat pixel-stat-gold">
          <GoldIcon size={14} /> {Math.floor(gold).toLocaleString()}
        </span>
        {dungeonLevel > 0 && (
          <span className="pixel-stat pixel-stat-green">
            <TrophyIcon size={14} /> {dungeonLevel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-900/30 border border-amber-600/30 rounded">
        <GoldIcon size={18} className="text-amber-400" />
        <span className="text-amber-300 font-bold text-sm">
          {Math.floor(gold).toLocaleString()}
        </span>
      </div>

      {dungeonLevel > 0 && (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-900/30 border border-green-600/30 rounded">
          <TrophyIcon size={18} className="text-green-400" />
          <span className="text-green-300 font-bold text-sm">
            Lv. {dungeonLevel}
          </span>
        </div>
      )}
    </div>
  );
};

export default ResourceDisplay;
