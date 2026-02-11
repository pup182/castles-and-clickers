// Reusable progress bar component with animations

const ProgressIndicator = ({
  value,
  max,
  size = 'md',
  color = 'blue',
  showLabel = false,
  label = '',
  animated = true,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Size configurations
  const sizes = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  // Color configurations
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    // Dynamic color based on percentage
    health: percentage > 50 ? 'bg-green-500' : percentage > 25 ? 'bg-yellow-500' : 'bg-red-500',
    xp: 'bg-gradient-to-r from-blue-500 to-purple-500',
    dungeon: 'bg-gradient-to-r from-green-500 to-emerald-400',
  };

  const barColor = colors[color] || colors.blue;
  const heightClass = sizes[size] || sizes.md;

  return (
    <div className={`w-full ${className}`}>
      {/* Label */}
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400">{label}</span>
          <span className="text-xs text-gray-300">{value} / {max}</span>
        </div>
      )}

      {/* Progress bar container */}
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full ${barColor} ${
            animated ? 'transition-all duration-300 ease-out' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// HP Bar variant with color based on health percentage
export const HPBar = ({ current, max, size = 'sm', showLabel = false, className = '' }) => (
  <ProgressIndicator
    value={current}
    max={max}
    size={size}
    color="health"
    showLabel={showLabel}
    label="HP"
    className={className}
  />
);

// XP Bar variant
export const XPBar = ({ current, max, showLabel = false, className = '' }) => (
  <ProgressIndicator
    value={current}
    max={max}
    size="sm"
    color="xp"
    showLabel={showLabel}
    label="XP"
    className={className}
  />
);

// Dungeon progress variant
export const DungeonProgressBar = ({ current, total, showLabel = true, className = '' }) => (
  <ProgressIndicator
    value={current}
    max={total}
    size="md"
    color="dungeon"
    showLabel={showLabel}
    label="Progress"
    className={className}
  />
);

export default ProgressIndicator;
