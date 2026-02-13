// UI SVG sprites - pixel art style
// All icons are 16x16 grid

const IconWrapper = ({ children, size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ imageRendering: 'pixelated' }}
  >
    {children}
  </svg>
);

const P = ({ x, y, c, w = 1, h = 1 }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} />
);

// === RESOURCES ===

export const GoldIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Coin stack */}
    <P x={3} y={10} w={10} h={3} c="#ca8a04" />
    <P x={4} y={9} w={8} h={1} c="#fbbf24" />
    <P x={3} y={7} w={10} h={3} c="#ca8a04" />
    <P x={4} y={6} w={8} h={1} c="#fbbf24" />
    <P x={3} y={4} w={10} h={3} c="#ca8a04" />
    <P x={4} y={3} w={8} h={1} c="#fbbf24" />
    {/* Shine */}
    <P x={5} y={4} w={2} h={1} c="#fef08a" />
    <P x={5} y={7} w={2} h={1} c="#fef08a" />
    <P x={5} y={10} w={2} h={1} c="#fef08a" />
    {/* $ symbols */}
    <P x={7} y={5} w={2} h={1} c="#ca8a04" />
    <P x={7} y={8} w={2} h={1} c="#ca8a04" />
    <P x={7} y={11} w={2} h={1} c="#ca8a04" />
  </IconWrapper>
);

export const XPIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Star */}
    <P x={7} y={1} w={2} h={3} c="#a855f7" />
    <P x={6} y={4} w={4} h={2} c="#a855f7" />
    <P x={2} y={5} w={12} h={3} c="#c084fc" />
    <P x={4} y={8} w={8} h={2} c="#a855f7" />
    <P x={3} y={10} w={3} h={4} c="#a855f7" />
    <P x={10} y={10} w={3} h={4} c="#a855f7" />
    {/* Center shine */}
    <P x={7} y={6} w={2} h={2} c="#e9d5ff" />
    {/* Sparkles */}
    <P x={1} y={2} w={2} h={2} c="#fef08a" />
    <P x={13} y={2} w={2} h={2} c="#fef08a" />
  </IconWrapper>
);

export const HeartIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Heart shape */}
    <P x={3} y={4} w={4} h={4} c="#ef4444" />
    <P x={9} y={4} w={4} h={4} c="#ef4444" />
    <P x={4} y={3} w={2} h={1} c="#ef4444" />
    <P x={10} y={3} w={2} h={1} c="#ef4444" />
    <P x={3} y={8} w={10} h={2} c="#ef4444" />
    <P x={4} y={10} w={8} h={2} c="#ef4444" />
    <P x={5} y={12} w={6} h={1} c="#ef4444" />
    <P x={6} y={13} w={4} h={1} c="#ef4444" />
    <P x={7} y={14} w={2} h={1} c="#ef4444" />
    {/* Highlight */}
    <P x={4} y={4} w={2} h={2} c="#fca5a5" />
  </IconWrapper>
);

export const HeartEmptyIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Heart outline */}
    <P x={3} y={4} w={4} h={1} c="#6b7280" />
    <P x={9} y={4} w={4} h={1} c="#6b7280" />
    <P x={4} y={3} w={2} h={1} c="#6b7280" />
    <P x={10} y={3} w={2} h={1} c="#6b7280" />
    <P x={3} y={5} w={1} h={3} c="#6b7280" />
    <P x={12} y={5} w={1} h={3} c="#6b7280" />
    <P x={7} y={5} w={2} h={1} c="#6b7280" />
    <P x={3} y={8} w={1} h={2} c="#6b7280" />
    <P x={12} y={8} w={1} h={2} c="#6b7280" />
    <P x={4} y={10} w={1} h={2} c="#6b7280" />
    <P x={11} y={10} w={1} h={2} c="#6b7280" />
    <P x={5} y={12} w={1} h={1} c="#6b7280" />
    <P x={10} y={12} w={1} h={1} c="#6b7280" />
    <P x={6} y={13} w={1} h={1} c="#6b7280" />
    <P x={9} y={13} w={1} h={1} c="#6b7280" />
    <P x={7} y={14} w={2} h={1} c="#6b7280" />
  </IconWrapper>
);

export const ShieldIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Shield */}
    <P x={3} y={2} w={10} h={11} c="#3b82f6" />
    <P x={4} y={3} w={8} h={9} c="#60a5fa" />
    {/* Cross/emblem */}
    <P x={7} y={4} w={2} h={7} c="#fbbf24" />
    <P x={5} y={6} w={6} h={2} c="#fbbf24" />
    {/* Bottom point */}
    <P x={4} y={13} w={2} h={1} c="#3b82f6" />
    <P x={10} y={13} w={2} h={1} c="#3b82f6" />
  </IconWrapper>
);

export const SwordIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Blade */}
    <P x={10} y={1} w={2} h={2} c="#9ca3af" />
    <P x={9} y={3} w={2} h={2} c="#9ca3af" />
    <P x={8} y={5} w={2} h={2} c="#d1d5db" />
    <P x={7} y={7} w={2} h={2} c="#9ca3af" />
    <P x={6} y={9} w={2} h={2} c="#9ca3af" />
    {/* Guard */}
    <P x={4} y={10} w={6} h={2} c="#fbbf24" />
    {/* Handle */}
    <P x={5} y={12} w={2} h={3} c="#78350f" />
    {/* Pommel */}
    <P x={4} y={14} w={4} h={1} c="#fbbf24" />
  </IconWrapper>
);

// === BUILDINGS ===

export const TavernIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Building */}
    <P x={2} y={6} w={12} h={8} c="#78350f" />
    <P x={3} y={7} w={10} h={6} c="#92400e" />
    {/* Roof */}
    <P x={1} y={4} w={14} h={2} c="#7f1d1d" />
    <P x={3} y={2} w={10} h={2} c="#991b1b" />
    <P x={5} y={1} w={6} h={1} c="#7f1d1d" />
    {/* Door */}
    <P x={6} y={10} w={4} h={4} c="#451a03" />
    <P x={9} y={11} w={1} h={1} c="#fbbf24" />
    {/* Sign */}
    <P x={10} y={7} w={4} h={3} c="#fbbf24" />
    <P x={11} y={8} w={2} h={1} c="#78350f" />
  </IconWrapper>
);

export const ForgeIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Anvil */}
    <P x={2} y={9} w={12} h={3} c="#374151" />
    <P x={4} y={8} w={8} h={1} c="#4b5563" />
    <P x={5} y={7} w={6} h={1} c="#6b7280" />
    {/* Hammer */}
    <P x={9} y={2} w={4} h={3} c="#78716c" />
    <P x={10} y={5} w={2} h={4} c="#78350f" />
    {/* Fire */}
    <P x={2} y={5} w={4} h={4} c="#ef4444" />
    <P x={3} y={4} w={2} h={2} c="#f97316" />
    <P x={3} y={3} w={2} h={1} c="#fbbf24" />
    {/* Sparks */}
    <P x={1} y={2} w={1} h={1} c="#fbbf24" />
    <P x={5} y={1} w={1} h={1} c="#f97316" />
    {/* Base */}
    <P x={3} y={12} w={3} h={2} c="#1f2937" />
    <P x={10} y={12} w={3} h={2} c="#1f2937" />
  </IconWrapper>
);

export const CastleIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Main structure */}
    <P x={3} y={6} w={10} h={8} c="#6b7280" />
    {/* Towers */}
    <P x={1} y={4} w={4} h={10} c="#9ca3af" />
    <P x={11} y={4} w={4} h={10} c="#9ca3af" />
    {/* Battlements */}
    <P x={1} y={2} w={2} h={2} c="#9ca3af" />
    <P x={4} y={4} w={2} h={2} c="#6b7280" />
    <P x={10} y={4} w={2} h={2} c="#6b7280" />
    <P x={13} y={2} w={2} h={2} c="#9ca3af" />
    {/* Center tower */}
    <P x={6} y={3} w={4} h={5} c="#78716c" />
    <P x={7} y={1} w={2} h={2} c="#78716c" />
    {/* Door */}
    <P x={6} y={10} w={4} h={4} c="#1f2937" />
    <P x={7} y={9} w={2} h={1} c="#1f2937" />
    {/* Windows */}
    <P x={2} y={7} w={2} h={2} c="#1f2937" />
    <P x={12} y={7} w={2} h={2} c="#1f2937" />
  </IconWrapper>
);

export const DungeonIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Cave entrance */}
    <P x={2} y={4} w={12} h={10} c="#374151" />
    <P x={3} y={3} w={10} h={1} c="#4b5563" />
    <P x={4} y={2} w={8} h={1} c="#6b7280" />
    {/* Dark interior */}
    <P x={4} y={6} w={8} h={8} c="#1f2937" />
    <P x={5} y={5} w={6} h={1} c="#1f2937" />
    {/* Stalactites */}
    <P x={5} y={5} w={1} h={2} c="#4b5563" />
    <P x={8} y={5} w={1} h={3} c="#4b5563" />
    <P x={10} y={5} w={1} h={2} c="#4b5563" />
    {/* Eyes in darkness */}
    <P x={6} y={9} w={1} h={1} c="#ef4444" />
    <P x={9} y={9} w={1} h={1} c="#ef4444" />
    {/* Bones */}
    <P x={4} y={12} w={3} h={1} c="#e5e7eb" />
    <P x={9} y={13} w={2} h={1} c="#e5e7eb" />
  </IconWrapper>
);

// === EQUIPMENT TYPES ===

export const HelmetIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Helmet */}
    <P x={3} y={4} w={10} h={8} c="#6b7280" />
    <P x={4} y={3} w={8} h={1} c="#9ca3af" />
    <P x={5} y={2} w={6} h={1} c="#9ca3af" />
    {/* Visor */}
    <P x={4} y={8} w={8} h={3} c="#374151" />
    <P x={5} y={9} w={6} h={1} c="#1f2937" />
    {/* Crest */}
    <P x={7} y={0} w={2} h={2} c="#ef4444" />
    <P x={6} y={1} w={4} h={2} c="#ef4444" />
    {/* Shine */}
    <P x={5} y={4} w={2} h={2} c="#d1d5db" />
  </IconWrapper>
);

export const ArmorIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Chest plate */}
    <P x={3} y={3} w={10} h={10} c="#6b7280" />
    <P x={4} y={4} w={8} h={8} c="#9ca3af" />
    {/* Shoulders */}
    <P x={1} y={4} w={3} h={4} c="#6b7280" />
    <P x={12} y={4} w={3} h={4} c="#6b7280" />
    {/* Neck */}
    <P x={6} y={2} w={4} h={2} c="#6b7280" />
    {/* Center detail */}
    <P x={7} y={5} w={2} h={6} c="#fbbf24" />
    <P x={6} y={7} w={4} h={2} c="#fbbf24" />
    {/* Shine */}
    <P x={5} y={5} w={2} h={2} c="#d1d5db" />
  </IconWrapper>
);

export const BootsIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Left boot */}
    <P x={1} y={4} w={4} h={8} c="#78350f" />
    <P x={1} y={12} w={6} h={2} c="#78350f" />
    <P x={2} y={5} w={2} h={3} c="#92400e" />
    {/* Right boot */}
    <P x={9} y={4} w={4} h={8} c="#78350f" />
    <P x={9} y={12} w={6} h={2} c="#78350f" />
    <P x={10} y={5} w={2} h={3} c="#92400e" />
    {/* Buckles */}
    <P x={2} y={9} w={2} h={1} c="#fbbf24" />
    <P x={10} y={9} w={2} h={1} c="#fbbf24" />
  </IconWrapper>
);

export const RingIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Ring band */}
    <P x={4} y={5} w={8} h={6} c="#fbbf24" />
    <P x={5} y={4} w={6} h={1} c="#fbbf24" />
    <P x={5} y={11} w={6} h={1} c="#fbbf24" />
    {/* Hollow center */}
    <P x={6} y={6} w={4} h={4} c="#1f2937" />
    {/* Gem */}
    <P x={6} y={3} w={4} h={3} c="#ef4444" />
    <P x={7} y={2} w={2} h={1} c="#ef4444" />
    <P x={7} y={4} w={2} h={1} c="#fca5a5" />
    {/* Shine */}
    <P x={4} y={6} w={2} h={2} c="#fef08a" />
  </IconWrapper>
);

export const AmuletIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Chain */}
    <P x={2} y={1} w={2} h={1} c="#fbbf24" />
    <P x={4} y={2} w={2} h={1} c="#fbbf24" />
    <P x={6} y={3} w={4} h={1} c="#fbbf24" />
    <P x={10} y={2} w={2} h={1} c="#fbbf24" />
    <P x={12} y={1} w={2} h={1} c="#fbbf24" />
    {/* Pendant */}
    <P x={5} y={5} w={6} h={8} c="#fbbf24" />
    <P x={6} y={4} w={4} h={1} c="#fbbf24" />
    <P x={6} y={13} w={4} h={1} c="#fbbf24" />
    {/* Gem */}
    <P x={6} y={6} w={4} h={5} c="#3b82f6" />
    <P x={7} y={7} w={2} h={3} c="#60a5fa" />
    <P x={7} y={8} w={1} h={1} c="#93c5fd" />
  </IconWrapper>
);

// === MISC ICONS ===

export const ChestIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Chest body */}
    <P x={2} y={6} w={12} h={8} c="#78350f" />
    <P x={3} y={7} w={10} h={6} c="#92400e" />
    {/* Lid */}
    <P x={2} y={4} w={12} h={3} c="#92400e" />
    <P x={3} y={5} w={10} h={1} c="#a16207" />
    {/* Lock */}
    <P x={6} y={7} w={4} h={3} c="#fbbf24" />
    <P x={7} y={8} w={2} h={1} c="#78350f" />
    {/* Metal bands */}
    <P x={2} y={6} w={12} h={1} c="#fbbf24" />
    <P x={2} y={10} w={12} h={1} c="#fbbf24" />
  </IconWrapper>
);

export const KeyIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Key head */}
    <P x={3} y={2} w={6} h={6} c="#fbbf24" />
    <P x={4} y={3} w={4} h={4} c="#1f2937" />
    <P x={5} y={4} w={2} h={2} c="#fbbf24" />
    {/* Key shaft */}
    <P x={7} y={8} w={2} h={6} c="#fbbf24" />
    {/* Key teeth */}
    <P x={9} y={10} w={2} h={1} c="#fbbf24" />
    <P x={9} y={12} w={3} h={1} c="#fbbf24" />
    <P x={9} y={14} w={2} h={1} c="#fbbf24" />
  </IconWrapper>
);

export const ScrollIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Scroll body */}
    <P x={3} y={3} w={10} h={10} c="#fef3c7" />
    {/* Top roll */}
    <P x={2} y={2} w={12} h={2} c="#fde68a" />
    <P x={3} y={1} w={10} h={1} c="#fbbf24" />
    {/* Bottom roll */}
    <P x={2} y={12} w={12} h={2} c="#fde68a" />
    <P x={3} y={14} w={10} h={1} c="#fbbf24" />
    {/* Text lines */}
    <P x={5} y={5} w={6} h={1} c="#374151" />
    <P x={5} y={7} w={6} h={1} c="#374151" />
    <P x={5} y={9} w={4} h={1} c="#374151" />
  </IconWrapper>
);

export const PotionIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Bottle neck */}
    <P x={6} y={1} w={4} h={2} c="#78350f" />
    <P x={7} y={3} w={2} h={2} c="#6b7280" />
    {/* Bottle body */}
    <P x={4} y={5} w={8} h={9} c="#6b7280" />
    <P x={5} y={6} w={6} h={7} c="#ef4444" />
    {/* Liquid */}
    <P x={5} y={8} w={6} h={5} c="#dc2626" />
    <P x={6} y={9} w={4} h={3} c="#b91c1c" />
    {/* Shine */}
    <P x={6} y={7} w={2} h={2} c="#fca5a5" />
    {/* Cork */}
    <P x={6} y={0} w={4} h={1} c="#78350f" />
  </IconWrapper>
);

export const CrownIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Crown base */}
    <P x={2} y={8} w={12} h={4} c="#fbbf24" />
    <P x={3} y={12} w={10} h={2} c="#ca8a04" />
    {/* Points */}
    <P x={2} y={4} w={2} h={4} c="#fbbf24" />
    <P x={7} y={2} w={2} h={6} c="#fbbf24" />
    <P x={12} y={4} w={2} h={4} c="#fbbf24" />
    <P x={4} y={5} w={2} h={3} c="#fbbf24" />
    <P x={10} y={5} w={2} h={3} c="#fbbf24" />
    {/* Gems */}
    <P x={3} y={9} w={2} h={2} c="#ef4444" />
    <P x={7} y={9} w={2} h={2} c="#3b82f6" />
    <P x={11} y={9} w={2} h={2} c="#22c55e" />
  </IconWrapper>
);

export const SkullIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Skull */}
    <P x={3} y={2} w={10} h={9} c="#e5e7eb" />
    <P x={4} y={1} w={8} h={1} c="#e5e7eb" />
    <P x={4} y={11} w={8} h={1} c="#e5e7eb" />
    {/* Eye sockets */}
    <P x={4} y={4} w={3} h={3} c="#1f2937" />
    <P x={9} y={4} w={3} h={3} c="#1f2937" />
    {/* Nose */}
    <P x={7} y={7} w={2} h={2} c="#1f2937" />
    {/* Teeth */}
    <P x={5} y={10} w={6} h={2} c="#e5e7eb" />
    <P x={5} y={11} w={1} h={1} c="#1f2937" />
    <P x={7} y={11} w={1} h={1} c="#1f2937" />
    <P x={9} y={11} w={1} h={1} c="#1f2937" />
    {/* Jaw */}
    <P x={4} y={12} w={8} h={2} c="#d1d5db" />
  </IconWrapper>
);

export const StarIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Star */}
    <P x={7} y={1} w={2} h={3} c="#fbbf24" />
    <P x={6} y={4} w={4} h={2} c="#fbbf24" />
    <P x={1} y={5} w={14} h={3} c="#fef08a" />
    <P x={4} y={8} w={8} h={2} c="#fbbf24" />
    <P x={3} y={10} w={3} h={4} c="#fbbf24" />
    <P x={10} y={10} w={3} h={4} c="#fbbf24" />
    {/* Center */}
    <P x={7} y={6} w={2} h={2} c="#fef9c3" />
  </IconWrapper>
);

export const ClockIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Clock face */}
    <P x={2} y={2} w={12} h={12} c="#6b7280" />
    <P x={3} y={3} w={10} h={10} c="#e5e7eb" />
    {/* Clock hands */}
    <P x={7} y={4} w={2} h={4} c="#1f2937" />
    <P x={7} y={7} w={4} h={2} c="#1f2937" />
    {/* Center */}
    <P x={7} y={7} w={2} h={2} c="#ef4444" />
    {/* Hour markers */}
    <P x={7} y={3} w={2} h={1} c="#374151" />
    <P x={7} y={12} w={2} h={1} c="#374151" />
    <P x={3} y={7} w={1} h={2} c="#374151" />
    <P x={12} y={7} w={1} h={2} c="#374151" />
  </IconWrapper>
);

export const CheckIcon = ({ size, className = '' }) => (
  <IconWrapper size={size} className={className}>
    {/* Checkmark - uses currentColor for flexibility */}
    <P x={2} y={8} w={2} h={2} c="currentColor" />
    <P x={4} y={10} w={2} h={2} c="currentColor" />
    <P x={6} y={8} w={2} h={2} c="currentColor" />
    <P x={8} y={6} w={2} h={2} c="currentColor" />
    <P x={10} y={4} w={2} h={2} c="currentColor" />
    <P x={12} y={2} w={2} h={2} c="currentColor" />
  </IconWrapper>
);

export const CrossIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* X mark */}
    <P x={2} y={2} w={2} h={2} c="#ef4444" />
    <P x={4} y={4} w={2} h={2} c="#ef4444" />
    <P x={6} y={6} w={4} h={4} c="#ef4444" />
    <P x={10} y={10} w={2} h={2} c="#ef4444" />
    <P x={12} y={12} w={2} h={2} c="#ef4444" />
    <P x={12} y={2} w={2} h={2} c="#ef4444" />
    <P x={10} y={4} w={2} h={2} c="#ef4444" />
    <P x={4} y={10} w={2} h={2} c="#ef4444" />
    <P x={2} y={12} w={2} h={2} c="#ef4444" />
  </IconWrapper>
);

export const WarningIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Triangle */}
    <P x={7} y={1} w={2} h={2} c="#fbbf24" />
    <P x={6} y={3} w={4} h={2} c="#fbbf24" />
    <P x={5} y={5} w={6} h={2} c="#fbbf24" />
    <P x={4} y={7} w={8} h={2} c="#fbbf24" />
    <P x={3} y={9} w={10} h={2} c="#fbbf24" />
    <P x={2} y={11} w={12} h={3} c="#fbbf24" />
    {/* Exclamation mark */}
    <P x={7} y={4} w={2} h={4} c="#1f2937" />
    <P x={7} y={10} w={2} h={2} c="#1f2937" />
  </IconWrapper>
);

// === NAVIGATION & UI ===

export const LockIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Lock body */}
    <P x={3} y={7} w={10} h={7} c="#6b7280" />
    <P x={4} y={8} w={8} h={5} c="#4b5563" />
    {/* Shackle */}
    <P x={5} y={3} w={6} h={5} c="#9ca3af" />
    <P x={6} y={4} w={4} h={3} c="#1f2937" />
    {/* Keyhole */}
    <P x={7} y={9} w={2} h={2} c="#fbbf24" />
    <P x={7} y={11} w={2} h={1} c="#fbbf24" />
  </IconWrapper>
);

export const TrophyIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Cup */}
    <P x={3} y={2} w={10} h={7} c="#fbbf24" />
    <P x={4} y={3} w={8} h={5} c="#fef08a" />
    {/* Handles */}
    <P x={1} y={3} w={2} h={4} c="#fbbf24" />
    <P x={13} y={3} w={2} h={4} c="#fbbf24" />
    {/* Stem */}
    <P x={6} y={9} w={4} h={3} c="#fbbf24" />
    {/* Base */}
    <P x={4} y={12} w={8} h={2} c="#ca8a04" />
    {/* Star detail */}
    <P x={7} y={4} w={2} h={2} c="#ca8a04" />
  </IconWrapper>
);

export const DoorIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Door frame */}
    <P x={2} y={1} w={12} h={14} c="#78350f" />
    <P x={3} y={2} w={10} h={12} c="#92400e" />
    {/* Door panels */}
    <P x={4} y={3} w={3} h={4} c="#78350f" />
    <P x={9} y={3} w={3} h={4} c="#78350f" />
    <P x={4} y={9} w={3} h={4} c="#78350f" />
    <P x={9} y={9} w={3} h={4} c="#78350f" />
    {/* Handle */}
    <P x={10} y={7} w={2} h={2} c="#fbbf24" />
    {/* Arch */}
    <P x={5} y={1} w={6} h={1} c="#a16207" />
  </IconWrapper>
);

export const GemIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Diamond shape */}
    <P x={7} y={1} w={2} h={2} c="#60a5fa" />
    <P x={5} y={3} w={6} h={2} c="#3b82f6" />
    <P x={3} y={5} w={10} h={3} c="#2563eb" />
    <P x={4} y={8} w={8} h={2} c="#3b82f6" />
    <P x={5} y={10} w={6} h={2} c="#60a5fa" />
    <P x={6} y={12} w={4} h={2} c="#93c5fd" />
    <P x={7} y={14} w={2} h={1} c="#bfdbfe" />
    {/* Shine */}
    <P x={5} y={5} w={2} h={2} c="#bfdbfe" />
    <P x={8} y={7} w={1} h={1} c="#93c5fd" />
  </IconWrapper>
);

export const MapIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Map paper */}
    <P x={2} y={2} w={12} h={12} c="#fef3c7" />
    <P x={3} y={3} w={10} h={10} c="#fde68a" />
    {/* Path/route */}
    <P x={4} y={5} w={2} h={2} c="#dc2626" />
    <P x={6} y={6} w={2} h={2} c="#dc2626" />
    <P x={7} y={8} w={2} h={2} c="#dc2626" />
    <P x={9} y={9} w={2} h={2} c="#dc2626" />
    {/* X marks the spot */}
    <P x={10} y={4} w={2} h={1} c="#991b1b" />
    <P x={11} y={5} w={1} h={1} c="#991b1b" />
    <P x={10} y={6} w={2} h={1} c="#991b1b" />
    {/* Border details */}
    <P x={2} y={2} w={1} h={12} c="#ca8a04" />
    <P x={13} y={2} w={1} h={12} c="#ca8a04" />
  </IconWrapper>
);

export const PartyIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Center person */}
    <P x={6} y={2} w={4} h={4} c="#fbbf24" />
    <P x={5} y={6} w={6} h={5} c="#3b82f6" />
    {/* Left person */}
    <P x={1} y={4} w={3} h={3} c="#a855f7" />
    <P x={0} y={7} w={5} h={4} c="#7c3aed" />
    {/* Right person */}
    <P x={12} y={4} w={3} h={3} c="#22c55e" />
    <P x={11} y={7} w={5} h={4} c="#16a34a" />
    {/* Heads */}
    <P x={7} y={3} w={2} h={2} c="#fde68a" />
    <P x={2} y={5} w={1} h={1} c="#fde68a" />
    <P x={13} y={5} w={1} h={1} c="#fde68a" />
  </IconWrapper>
);

export const TreeIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Trunk */}
    <P x={6} y={11} w={4} h={4} c="#78350f" />
    {/* Foliage layers */}
    <P x={5} y={8} w={6} h={3} c="#16a34a" />
    <P x={4} y={5} w={8} h={4} c="#22c55e" />
    <P x={5} y={2} w={6} h={4} c="#4ade80" />
    <P x={6} y={1} w={4} h={2} c="#86efac" />
    {/* Highlights */}
    <P x={6} y={3} w={2} h={2} c="#bbf7d0" />
    <P x={5} y={6} w={2} h={2} c="#86efac" />
  </IconWrapper>
);

export const BagIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Bag body */}
    <P x={3} y={5} w={10} h={9} c="#78350f" />
    <P x={4} y={6} w={8} h={7} c="#92400e" />
    {/* Bag top/opening */}
    <P x={4} y={3} w={8} h={3} c="#a16207" />
    <P x={5} y={2} w={6} h={1} c="#ca8a04" />
    {/* Strap */}
    <P x={7} y={1} w={2} h={2} c="#78350f" />
    {/* Buckle */}
    <P x={6} y={8} w={4} h={2} c="#fbbf24" />
    <P x={7} y={9} w={2} h={1} c="#78350f" />
    {/* Pocket */}
    <P x={5} y={11} w={6} h={2} c="#78350f" />
  </IconWrapper>
);

export const HomeIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Roof */}
    <P x={1} y={6} w={14} h={2} c="#991b1b" />
    <P x={3} y={4} w={10} h={2} c="#b91c1c" />
    <P x={5} y={2} w={6} h={2} c="#dc2626" />
    <P x={7} y={1} w={2} h={1} c="#ef4444" />
    {/* House body */}
    <P x={2} y={8} w={12} h={6} c="#fef3c7" />
    <P x={3} y={9} w={10} h={4} c="#fde68a" />
    {/* Door */}
    <P x={6} y={10} w={4} h={4} c="#78350f" />
    <P x={9} y={11} w={1} h={1} c="#fbbf24" />
    {/* Window */}
    <P x={10} y={9} w={2} h={2} c="#60a5fa" />
    {/* Chimney */}
    <P x={11} y={2} w={2} h={4} c="#6b7280" />
  </IconWrapper>
);

export const SpeedIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Lightning bolt */}
    <P x={8} y={1} w={4} h={2} c="#fbbf24" />
    <P x={6} y={3} w={4} h={2} c="#fbbf24" />
    <P x={4} y={5} w={6} h={2} c="#fef08a" />
    <P x={6} y={7} w={4} h={2} c="#fbbf24" />
    <P x={4} y={9} w={4} h={2} c="#fbbf24" />
    <P x={2} y={11} w={4} h={2} c="#fbbf24" />
    <P x={4} y={13} w={2} h={2} c="#ca8a04" />
    {/* Glow effect */}
    <P x={5} y={6} w={2} h={1} c="#fef9c3" />
  </IconWrapper>
);

export const GhostIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Ghost body */}
    <P x={3} y={2} w={10} h={10} c="#e5e7eb" />
    <P x={4} y={1} w={8} h={1} c="#f3f4f6" />
    {/* Wavy bottom */}
    <P x={3} y={12} w={2} h={2} c="#e5e7eb" />
    <P x={7} y={12} w={2} h={2} c="#e5e7eb" />
    <P x={11} y={12} w={2} h={2} c="#e5e7eb" />
    <P x={5} y={12} w={2} h={1} c="#e5e7eb" />
    <P x={9} y={12} w={2} h={1} c="#e5e7eb" />
    {/* Eyes */}
    <P x={5} y={5} w={2} h={3} c="#1f2937" />
    <P x={9} y={5} w={2} h={3} c="#1f2937" />
    {/* Mouth */}
    <P x={7} y={9} w={2} h={1} c="#1f2937" />
    {/* Highlight */}
    <P x={4} y={3} w={2} h={2} c="#f9fafb" />
  </IconWrapper>
);

export const FireIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Outer flame */}
    <P x={5} y={10} w={6} h={4} c="#ef4444" />
    <P x={4} y={7} w={8} h={4} c="#f97316" />
    <P x={5} y={4} w={6} h={4} c="#fbbf24" />
    <P x={6} y={2} w={4} h={3} c="#fde68a" />
    <P x={7} y={1} w={2} h={2} c="#fef9c3" />
    {/* Inner flame */}
    <P x={6} y={8} w={4} h={4} c="#fbbf24" />
    <P x={7} y={6} w={2} h={3} c="#fef08a" />
    {/* Core */}
    <P x={7} y={10} w={2} h={2} c="#fef9c3" />
  </IconWrapper>
);

export const ArrowUpIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Arrow pointing up */}
    <P x={7} y={2} w={2} h={2} c="#22c55e" />
    <P x={5} y={4} w={6} h={2} c="#22c55e" />
    <P x={3} y={6} w={10} h={2} c="#22c55e" />
    <P x={6} y={8} w={4} h={6} c="#22c55e" />
    {/* Highlight */}
    <P x={7} y={9} w={2} h={3} c="#4ade80" />
  </IconWrapper>
);

export const ArrowDownIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Arrow pointing down */}
    <P x={6} y={2} w={4} h={6} c="#ef4444" />
    <P x={3} y={8} w={10} h={2} c="#ef4444" />
    <P x={5} y={10} w={6} h={2} c="#ef4444" />
    <P x={7} y={12} w={2} h={2} c="#ef4444" />
    {/* Highlight */}
    <P x={7} y={3} w={2} h={3} c="#fca5a5" />
  </IconWrapper>
);

export const ChevronIcon = ({ size, className = '' }) => (
  <IconWrapper size={size} className={className}>
    {/* Simple chevron pointing up (rotate via CSS for other directions) */}
    <P x={7} y={4} w={2} h={2} c="#fbbf24" />
    <P x={5} y={6} w={2} h={2} c="#fbbf24" />
    <P x={9} y={6} w={2} h={2} c="#fbbf24" />
    <P x={3} y={8} w={2} h={2} c="#fbbf24" />
    <P x={11} y={8} w={2} h={2} c="#fbbf24" />
    {/* Highlight */}
    <P x={7} y={5} w={2} h={1} c="#fde68a" />
  </IconWrapper>
);

export const ShieldBuffIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Shield with + */}
    <P x={3} y={2} w={10} h={10} c="#3b82f6" />
    <P x={4} y={3} w={8} h={8} c="#60a5fa" />
    <P x={4} y={12} w={2} h={1} c="#3b82f6" />
    <P x={10} y={12} w={2} h={1} c="#3b82f6" />
    <P x={5} y={13} w={2} h={1} c="#3b82f6" />
    <P x={9} y={13} w={2} h={1} c="#3b82f6" />
    <P x={7} y={14} w={2} h={1} c="#3b82f6" />
    {/* Plus sign */}
    <P x={7} y={4} w={2} h={6} c="#22c55e" />
    <P x={5} y={6} w={6} h={2} c="#22c55e" />
  </IconWrapper>
);

export const TauntIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Angry face */}
    <P x={3} y={3} w={10} h={10} c="#ef4444" />
    <P x={4} y={4} w={8} h={8} c="#fca5a5" />
    {/* Angry eyebrows */}
    <P x={4} y={5} w={3} h={1} c="#1f2937" />
    <P x={9} y={5} w={3} h={1} c="#1f2937" />
    {/* Eyes */}
    <P x={5} y={6} w={2} h={2} c="#1f2937" />
    <P x={9} y={6} w={2} h={2} c="#1f2937" />
    {/* Mouth - angry */}
    <P x={6} y={10} w={4} h={1} c="#1f2937" />
    <P x={5} y={9} w={1} h={1} c="#1f2937" />
    <P x={10} y={9} w={1} h={1} c="#1f2937" />
  </IconWrapper>
);

export const EvasionIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Wind/speed lines */}
    <P x={2} y={3} w={6} h={2} c="#9ca3af" />
    <P x={4} y={6} w={8} h={2} c="#d1d5db" />
    <P x={6} y={9} w={6} h={2} c="#e5e7eb" />
    <P x={8} y={12} w={4} h={2} c="#f3f4f6" />
    {/* Figure dodging */}
    <P x={10} y={4} w={3} h={3} c="#3b82f6" />
    <P x={11} y={7} w={3} h={4} c="#60a5fa" />
  </IconWrapper>
);

export const HasteIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Clock with lightning */}
    <P x={2} y={2} w={10} h={10} c="#6b7280" />
    <P x={3} y={3} w={8} h={8} c="#e5e7eb" />
    {/* Clock hands */}
    <P x={6} y={4} w={2} h={3} c="#1f2937" />
    <P x={6} y={6} w={3} h={2} c="#1f2937" />
    {/* Lightning overlay */}
    <P x={10} y={1} w={3} h={2} c="#fbbf24" />
    <P x={9} y={3} w={3} h={2} c="#fbbf24" />
    <P x={11} y={5} w={3} h={2} c="#fbbf24" />
    <P x={10} y={7} w={3} h={2} c="#ca8a04" />
  </IconWrapper>
);

export const RegenIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Heart with + */}
    <P x={3} y={4} w={4} h={4} c="#22c55e" />
    <P x={9} y={4} w={4} h={4} c="#22c55e" />
    <P x={4} y={3} w={2} h={1} c="#22c55e" />
    <P x={10} y={3} w={2} h={1} c="#22c55e" />
    <P x={3} y={8} w={10} h={2} c="#22c55e" />
    <P x={4} y={10} w={8} h={2} c="#22c55e" />
    <P x={5} y={12} w={6} h={1} c="#22c55e" />
    <P x={6} y={13} w={4} h={1} c="#22c55e" />
    <P x={7} y={14} w={2} h={1} c="#22c55e" />
    {/* Plus sign */}
    <P x={7} y={5} w={2} h={4} c="#86efac" />
    <P x={6} y={6} w={4} h={2} c="#86efac" />
  </IconWrapper>
);

export const MightIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Flexed arm */}
    <P x={10} y={3} w={4} h={4} c="#fbbf24" />
    <P x={8} y={5} w={3} h={3} c="#fde68a" />
    <P x={5} y={7} w={4} h={3} c="#fbbf24" />
    <P x={3} y={9} w={3} h={4} c="#fde68a" />
    <P x={2} y={12} w={3} h={2} c="#fbbf24" />
    {/* Muscle bulge */}
    <P x={9} y={4} w={2} h={2} c="#f97316" />
    {/* Fist */}
    <P x={11} y={2} w={3} h={2} c="#fde68a" />
  </IconWrapper>
);

export const CompassIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Compass body */}
    <P x={2} y={2} w={12} h={12} c="#78350f" />
    <P x={3} y={3} w={10} h={10} c="#fef3c7" />
    {/* Compass needle */}
    <P x={7} y={3} w={2} h={5} c="#ef4444" />
    <P x={7} y={8} w={2} h={5} c="#e5e7eb" />
    {/* Center */}
    <P x={6} y={7} w={4} h={2} c="#1f2937" />
    {/* Direction markers */}
    <P x={7} y={2} w={2} h={1} c="#dc2626" />
    <P x={7} y={13} w={2} h={1} c="#6b7280" />
    <P x={2} y={7} w={1} h={2} c="#6b7280" />
    <P x={13} y={7} w={1} h={2} c="#6b7280" />
  </IconWrapper>
);

// === HOMESTEAD BUILDINGS ===

export const BarracksIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Building */}
    <P x={2} y={6} w={12} h={8} c="#6b7280" />
    <P x={3} y={7} w={10} h={6} c="#9ca3af" />
    {/* Roof */}
    <P x={1} y={4} w={14} h={2} c="#374151" />
    <P x={3} y={3} w={10} h={1} c="#4b5563" />
    {/* Door */}
    <P x={6} y={9} w={4} h={5} c="#1f2937" />
    {/* Windows */}
    <P x={3} y={8} w={2} h={2} c="#60a5fa" />
    <P x={11} y={8} w={2} h={2} c="#60a5fa" />
    {/* Heart symbol */}
    <P x={7} y={10} w={2} h={2} c="#ef4444" />
  </IconWrapper>
);

export const ArmoryIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Building */}
    <P x={3} y={5} w={10} h={9} c="#6b7280" />
    <P x={4} y={6} w={8} h={7} c="#9ca3af" />
    {/* Roof */}
    <P x={2} y={3} w={12} h={2} c="#374151" />
    <P x={4} y={2} w={8} h={1} c="#4b5563" />
    {/* Weapons display */}
    <P x={5} y={7} w={2} h={5} c="#fbbf24" />
    <P x={9} y={7} w={2} h={5} c="#d1d5db" />
    {/* Shield */}
    <P x={7} y={9} w={2} h={3} c="#3b82f6" />
  </IconWrapper>
);

export const FortressIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Main wall */}
    <P x={1} y={6} w={14} h={8} c="#6b7280" />
    {/* Towers */}
    <P x={1} y={3} w={4} h={11} c="#9ca3af" />
    <P x={11} y={3} w={4} h={11} c="#9ca3af" />
    {/* Battlements */}
    <P x={1} y={1} w={2} h={2} c="#9ca3af" />
    <P x={4} y={4} w={2} h={2} c="#6b7280" />
    <P x={10} y={4} w={2} h={2} c="#6b7280" />
    <P x={13} y={1} w={2} h={2} c="#9ca3af" />
    {/* Gate */}
    <P x={6} y={9} w={4} h={5} c="#1f2937" />
    {/* Shield emblem */}
    <P x={7} y={6} w={2} h={2} c="#3b82f6" />
  </IconWrapper>
);

export const TrainingIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Training dummy */}
    <P x={7} y={2} w={2} h={3} c="#78350f" />
    <P x={5} y={5} w={6} h={2} c="#78350f" />
    <P x={4} y={4} w={2} h={4} c="#78350f" />
    <P x={10} y={4} w={2} h={4} c="#78350f" />
    <P x={7} y={7} w={2} h={5} c="#78350f" />
    {/* Stand */}
    <P x={6} y={12} w={4} h={2} c="#92400e" />
    {/* Target */}
    <P x={6} y={5} w={4} h={2} c="#ef4444" />
    <P x={7} y={5} w={2} h={2} c="#fbbf24" />
  </IconWrapper>
);

export const TreasuryIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Building */}
    <P x={2} y={6} w={12} h={8} c="#78350f" />
    <P x={3} y={7} w={10} h={6} c="#92400e" />
    {/* Roof */}
    <P x={1} y={4} w={14} h={2} c="#ca8a04" />
    <P x={3} y={3} w={10} h={1} c="#fbbf24" />
    {/* Columns */}
    <P x={4} y={7} w={2} h={6} c="#fbbf24" />
    <P x={10} y={7} w={2} h={6} c="#fbbf24" />
    {/* Coin symbol */}
    <P x={7} y={9} w={2} h={2} c="#fef08a" />
  </IconWrapper>
);

export const AcademyIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Building */}
    <P x={2} y={6} w={12} h={8} c="#1e3a5f" />
    <P x={3} y={7} w={10} h={6} c="#2563eb" />
    {/* Roof */}
    <P x={3} y={3} w={10} h={3} c="#1e40af" />
    <P x={5} y={1} w={6} h={2} c="#1e3a8a" />
    <P x={7} y={0} w={2} h={1} c="#1e40af" />
    {/* Window */}
    <P x={6} y={8} w={4} h={4} c="#60a5fa" />
    {/* Star */}
    <P x={7} y={9} w={2} h={2} c="#fbbf24" />
  </IconWrapper>
);

export const InfirmaryIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Building */}
    <P x={2} y={5} w={12} h={9} c="#e5e7eb" />
    <P x={3} y={6} w={10} h={7} c="#f3f4f6" />
    {/* Roof */}
    <P x={3} y={3} w={10} h={2} c="#dc2626" />
    <P x={5} y={2} w={6} h={1} c="#ef4444" />
    {/* Cross */}
    <P x={7} y={7} w={2} h={5} c="#22c55e" />
    <P x={5} y={9} w={6} h={2} c="#22c55e" />
    {/* Door */}
    <P x={6} y={11} w={4} h={3} c="#9ca3af" />
  </IconWrapper>
);

export const ChartIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Chart background */}
    <P x={2} y={2} w={12} h={12} c="#1f2937" />
    {/* Axis */}
    <P x={3} y={3} w={1} h={10} c="#6b7280" />
    <P x={3} y={12} w={10} h={1} c="#6b7280" />
    {/* Bars */}
    <P x={5} y={8} w={2} h={4} c="#22c55e" />
    <P x={8} y={6} w={2} h={6} c="#3b82f6" />
    <P x={11} y={4} w={2} h={8} c="#a855f7" />
    {/* Trend line */}
    <P x={5} y={7} w={2} h={1} c="#fbbf24" />
    <P x={7} y={6} w={2} h={1} c="#fbbf24" />
    <P x={9} y={4} w={2} h={1} c="#fbbf24" />
    <P x={11} y={3} w={2} h={1} c="#fbbf24" />
  </IconWrapper>
);

export const SettingsIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Gear shape */}
    <P x={6} y={1} w={4} h={2} c="#9ca3af" />
    <P x={6} y={13} w={4} h={2} c="#9ca3af" />
    <P x={1} y={6} w={2} h={4} c="#9ca3af" />
    <P x={13} y={6} w={2} h={4} c="#9ca3af" />
    {/* Diagonal teeth */}
    <P x={2} y={2} w={3} h={3} c="#9ca3af" />
    <P x={11} y={2} w={3} h={3} c="#9ca3af" />
    <P x={2} y={11} w={3} h={3} c="#9ca3af" />
    <P x={11} y={11} w={3} h={3} c="#9ca3af" />
    {/* Center circle */}
    <P x={5} y={5} w={6} h={6} c="#6b7280" />
    <P x={6} y={6} w={4} h={4} c="#4b5563" />
    {/* Inner hole */}
    <P x={7} y={7} w={2} h={2} c="#1f2937" />
  </IconWrapper>
);

// UI icon mapping
export const UI_ICONS = {
  gold: GoldIcon,
  xp: XPIcon,
  heart: HeartIcon,
  heart_empty: HeartEmptyIcon,
  shield: ShieldIcon,
  sword: SwordIcon,
  tavern: TavernIcon,
  forge: ForgeIcon,
  castle: CastleIcon,
  dungeon: DungeonIcon,
  helmet: HelmetIcon,
  armor: ArmorIcon,
  boots: BootsIcon,
  ring: RingIcon,
  amulet: AmuletIcon,
  chest: ChestIcon,
  key: KeyIcon,
  scroll: ScrollIcon,
  potion: PotionIcon,
  crown: CrownIcon,
  skull: SkullIcon,
  star: StarIcon,
  clock: ClockIcon,
  check: CheckIcon,
  cross: CrossIcon,
  lock: LockIcon,
  trophy: TrophyIcon,
  door: DoorIcon,
  gem: GemIcon,
  map: MapIcon,
  party: PartyIcon,
  tree: TreeIcon,
  bag: BagIcon,
  home: HomeIcon,
  speed: SpeedIcon,
  ghost: GhostIcon,
  fire: FireIcon,
  arrow_up: ArrowUpIcon,
  arrow_down: ArrowDownIcon,
  shield_buff: ShieldBuffIcon,
  taunt: TauntIcon,
  evasion: EvasionIcon,
  haste: HasteIcon,
  regen: RegenIcon,
  might: MightIcon,
  compass: CompassIcon,
  barracks: BarracksIcon,
  armory: ArmoryIcon,
  fortress: FortressIcon,
  training: TrainingIcon,
  treasury: TreasuryIcon,
  academy: AcademyIcon,
  infirmary: InfirmaryIcon,
  chart: ChartIcon,
};

// === UNIQUE ITEM STATE ICONS ===

export const SoulStackIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Ghostly soul wisp */}
    <P x={5} y={2} w={6} h={4} c="#a855f7" />
    <P x={6} y={1} w={4} h={1} c="#c084fc" />
    <P x={4} y={6} w={8} h={4} c="#7c3aed" />
    <P x={5} y={10} w={6} h={2} c="#a855f7" />
    {/* Inner glow */}
    <P x={6} y={4} w={4} h={3} c="#e9d5ff" />
    <P x={7} y={3} w={2} h={1} c="#f3e8ff" />
    {/* Wispy tail */}
    <P x={4} y={12} w={2} h={2} c="#7c3aed" />
    <P x={8} y={12} w={2} h={2} c="#7c3aed" />
    <P x={6} y={13} w={4} h={1} c="#a855f7" />
  </IconWrapper>
);

export const HungerStackIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Open maw/jaw */}
    <P x={3} y={2} w={10} h={4} c="#991b1b" />
    <P x={4} y={6} w={8} h={2} c="#1f2937" />
    <P x={3} y={8} w={10} h={4} c="#991b1b" />
    {/* Teeth top */}
    <P x={4} y={5} w={2} h={2} c="#e5e7eb" />
    <P x={7} y={5} w={2} h={2} c="#e5e7eb" />
    <P x={10} y={5} w={2} h={2} c="#e5e7eb" />
    {/* Teeth bottom */}
    <P x={5} y={7} w={2} h={2} c="#e5e7eb" />
    <P x={9} y={7} w={2} h={2} c="#e5e7eb" />
    {/* Eyes */}
    <P x={5} y={3} w={2} h={2} c="#ef4444" />
    <P x={9} y={3} w={2} h={2} c="#ef4444" />
    {/* Highlight */}
    <P x={5} y={3} w={1} h={1} c="#fca5a5" />
    <P x={9} y={3} w={1} h={1} c="#fca5a5" />
  </IconWrapper>
);

export const VoidStorageIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Dark void sphere */}
    <P x={4} y={3} w={8} h={10} c="#4c1d95" />
    <P x={5} y={2} w={6} h={1} c="#5b21b6" />
    <P x={5} y={13} w={6} h={1} c="#5b21b6" />
    <P x={3} y={5} w={1} h={6} c="#5b21b6" />
    <P x={12} y={5} w={1} h={6} c="#5b21b6" />
    {/* Inner swirl */}
    <P x={6} y={5} w={4} h={6} c="#6d28d9" />
    <P x={7} y={6} w={3} h={2} c="#8b5cf6" />
    <P x={6} y={8} w={3} h={2} c="#8b5cf6" />
    {/* Center glow */}
    <P x={7} y={7} w={2} h={2} c="#c4b5fd" />
  </IconWrapper>
);

export const TidalIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Water wave */}
    <P x={2} y={5} w={4} h={3} c="#3b82f6" />
    <P x={6} y={4} w={4} h={3} c="#60a5fa" />
    <P x={10} y={5} w={4} h={3} c="#3b82f6" />
    {/* Lower wave */}
    <P x={1} y={8} w={4} h={3} c="#2563eb" />
    <P x={5} y={9} w={4} h={3} c="#3b82f6" />
    <P x={9} y={8} w={5} h={3} c="#2563eb" />
    {/* Foam/highlights */}
    <P x={3} y={5} w={2} h={1} c="#bfdbfe" />
    <P x={7} y={4} w={2} h={1} c="#dbeafe" />
    <P x={11} y={5} w={2} h={1} c="#bfdbfe" />
    {/* Droplet */}
    <P x={7} y={1} w={2} h={2} c="#93c5fd" />
    <P x={7} y={2} w={2} h={1} c="#60a5fa" />
  </IconWrapper>
);

export const StealthIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Hooded figure */}
    <P x={4} y={2} w={8} h={4} c="#374151" />
    <P x={5} y={1} w={6} h={1} c="#4b5563" />
    <P x={3} y={6} w={10} h={6} c="#1f2937" />
    <P x={4} y={12} w={8} h={2} c="#374151" />
    {/* Hood shadow */}
    <P x={5} y={4} w={6} h={3} c="#111827" />
    {/* Eyes in darkness */}
    <P x={6} y={5} w={2} h={1} c="#a78bfa" />
    <P x={10} y={5} w={2} h={1} c="#a78bfa" />
    {/* Cloak edges */}
    <P x={3} y={7} w={1} h={4} c="#4b5563" />
    <P x={12} y={7} w={1} h={4} c="#4b5563" />
  </IconWrapper>
);

export const SoulReapIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Scythe blade */}
    <P x={7} y={1} w={6} h={2} c="#9ca3af" />
    <P x={10} y={3} w={4} h={2} c="#d1d5db" />
    <P x={11} y={5} w={3} h={2} c="#9ca3af" />
    <P x={12} y={7} w={2} h={1} c="#6b7280" />
    {/* Blade edge highlight */}
    <P x={8} y={1} w={4} h={1} c="#e5e7eb" />
    {/* Handle */}
    <P x={7} y={3} w={2} h={10} c="#78350f" />
    <P x={6} y={13} w={4} h={2} c="#92400e" />
    {/* Soul wisp on blade */}
    <P x={12} y={2} w={2} h={2} c="#a855f7" />
  </IconWrapper>
);

export const PhaseIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Ghostly silhouette - phasing through */}
    <P x={3} y={3} w={4} h={10} c="#6366f1" />
    <P x={4} y={2} w={2} h={1} c="#818cf8" />
    {/* Phased copy */}
    <P x={9} y={3} w={4} h={10} c="#a5b4fc" />
    <P x={10} y={2} w={2} h={1} c="#c7d2fe" />
    {/* Connection lines */}
    <P x={7} y={5} w={2} h={1} c="#818cf8" />
    <P x={7} y={8} w={2} h={1} c="#818cf8" />
    <P x={7} y={11} w={2} h={1} c="#818cf8" />
  </IconWrapper>
);

export const PauseIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={4} y={3} w={3} h={10} c="#e2e8f0" />
    <P x={4} y={3} w={1} h={10} c="#f8fafc" />
    <P x={9} y={3} w={3} h={10} c="#e2e8f0" />
    <P x={9} y={3} w={1} h={10} c="#f8fafc" />
  </IconWrapper>
);

export const PlayIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={5} y={3} w={2} h={10} c="#4ade80" />
    <P x={7} y={4} w={2} h={8} c="#22c55e" />
    <P x={9} y={5} w={2} h={6} c="#16a34a" />
    <P x={11} y={6} w={1} h={4} c="#15803d" />
  </IconWrapper>
);

export const ResetIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={7} y={2} w={4} h={2} c="#94a3b8" />
    <P x={11} y={4} w={2} h={3} c="#94a3b8" />
    <P x={3} y={4} w={2} h={3} c="#94a3b8" />
    <P x={3} y={7} w={2} h={3} c="#94a3b8" />
    <P x={5} y={10} w={6} h={2} c="#94a3b8" />
    <P x={11} y={7} w={2} h={3} c="#94a3b8" />
    <P x={7} y={12} w={4} h={2} c="#94a3b8" />
    <P x={10} y={1} w={2} h={2} c="#cbd5e1" />
    <P x={12} y={2} w={2} h={2} c="#cbd5e1" />
  </IconWrapper>
);

// === MOBILE UI ===

export const MenuIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Hamburger menu - 3 horizontal bars */}
    <P x={2} y={3} w={12} h={2} c="#e5e7eb" />
    <P x={2} y={7} w={12} h={2} c="#e5e7eb" />
    <P x={2} y={11} w={12} h={2} c="#e5e7eb" />
  </IconWrapper>
);

export const CloseIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* X close button */}
    <P x={2} y={2} w={2} h={2} c="#e5e7eb" />
    <P x={4} y={4} w={2} h={2} c="#e5e7eb" />
    <P x={6} y={6} w={4} h={4} c="#e5e7eb" />
    <P x={10} y={10} w={2} h={2} c="#e5e7eb" />
    <P x={12} y={12} w={2} h={2} c="#e5e7eb" />
    <P x={12} y={2} w={2} h={2} c="#e5e7eb" />
    <P x={10} y={4} w={2} h={2} c="#e5e7eb" />
    <P x={2} y={12} w={2} h={2} c="#e5e7eb" />
    <P x={4} y={10} w={2} h={2} c="#e5e7eb" />
  </IconWrapper>
);

// Helper component to render UI icon by ID
export const UIIcon = ({ iconId, size = 32, className = '' }) => {
  const IconComponent = UI_ICONS[iconId];
  if (!IconComponent) {
    return <StarIcon size={size} className={className} />;
  }
  return <IconComponent size={size} className={className} />;
};

export default UIIcon;
