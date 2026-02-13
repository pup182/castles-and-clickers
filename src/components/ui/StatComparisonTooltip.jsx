// Side-by-side stat comparison component
import { HeartIcon, SwordIcon, ShieldIcon, SpeedIcon } from '../icons/ui';

const STAT_CONFIG = {
  maxHp: { label: 'HP', color: 'text-green-400', Icon: HeartIcon },
  attack: { label: 'ATK', color: 'text-red-400', Icon: SwordIcon },
  defense: { label: 'DEF', color: 'text-blue-400', Icon: ShieldIcon },
  speed: { label: 'SPD', color: 'text-yellow-400', Icon: SpeedIcon },
};

const StatComparisonTooltip = ({
  currentStats,
  newStats,
  title = 'Stat Changes',
  showIcons = false,
}) => {
  if (!currentStats || !newStats) return null;

  const stats = Object.keys(STAT_CONFIG);

  return (
    <div className="min-w-[220px]">
      {title && (
        <div className="text-sm font-bold text-white mb-2 pb-1 border-b border-gray-700">
          {title}
        </div>
      )}

      <div className="space-y-1">
        {/* Header row */}
        <div className="grid grid-cols-4 gap-1 text-xs text-gray-500 pb-1">
          <div>Stat</div>
          <div className="text-center">Current</div>
          <div className="text-center">New</div>
          <div className="text-right">Diff</div>
        </div>

        {/* Stat rows */}
        {stats.map(stat => {
          const config = STAT_CONFIG[stat];
          const current = currentStats[stat] || 0;
          const next = newStats[stat] || 0;
          const diff = next - current;

          if (current === 0 && next === 0) return null;

          return (
            <div key={stat} className="grid grid-cols-4 gap-1 text-sm items-center">
              <div className={`${config.color} flex items-center gap-1`}>
                {showIcons && <config.Icon size={14} />}
                {config.label}
              </div>
              <div className="text-center text-gray-400">{current}</div>
              <div className="text-center text-white font-medium">{next}</div>
              <div className={`text-right font-bold ${
                diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-500'
              }`}>
                {diff !== 0 && (diff > 0 ? '+' : '')}{diff !== 0 ? diff : '-'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total change indicator */}
      {(() => {
        const totalDiff = stats.reduce((sum, stat) => {
          const current = currentStats[stat] || 0;
          const next = newStats[stat] || 0;
          return sum + (next - current);
        }, 0);

        if (totalDiff === 0) return null;

        return (
          <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between items-center">
            <span className="text-xs text-gray-500">Net Change</span>
            <span className={`font-bold ${totalDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalDiff > 0 ? '+' : ''}{totalDiff}
            </span>
          </div>
        );
      })()}
    </div>
  );
};

export default StatComparisonTooltip;
