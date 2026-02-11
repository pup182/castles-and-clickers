// Pixel Art SVG Icon System
// Each icon is designed on a 16x16 pixel grid for crisp rendering

const IconWrapper = ({ children, size = 24, className = '' }) => (
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

// Helper for pixel rectangles
const P = ({ x, y, c, w = 1, h = 1 }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} />
);

// === CLASS ICONS ===

export const WarriorIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Helmet */}
    <P x={5} y={1} w={6} h={1} c="#6b7280" />
    <P x={4} y={2} w={8} h={2} c="#9ca3af" />
    <P x={5} y={2} w={6} h={1} c="#d1d5db" />
    {/* Face */}
    <P x={5} y={4} w={6} h={3} c="#fbbf24" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    {/* Armor */}
    <P x={4} y={7} w={8} h={4} c="#6b7280" />
    <P x={5} y={8} w={6} h={2} c="#9ca3af" />
    <P x={7} y={7} w={2} h={1} c="#fbbf24" />
    {/* Sword */}
    <P x={12} y={3} w={1} h={6} c="#9ca3af" />
    <P x={12} y={2} w={1} h={1} c="#d1d5db" />
    <P x={11} y={8} w={3} h={1} c="#78350f" />
    {/* Legs */}
    <P x={5} y={11} w={2} h={3} c="#4b5563" />
    <P x={9} y={11} w={2} h={3} c="#4b5563" />
    {/* Feet */}
    <P x={4} y={14} w={3} h={2} c="#78350f" />
    <P x={9} y={14} w={3} h={2} c="#78350f" />
  </IconWrapper>
);

export const MageIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Hat */}
    <P x={7} y={0} w={2} h={1} c="#7c3aed" />
    <P x={6} y={1} w={4} h={1} c="#7c3aed" />
    <P x={5} y={2} w={6} h={1} c="#8b5cf6" />
    <P x={4} y={3} w={8} h={1} c="#a78bfa" />
    {/* Star on hat */}
    <P x={7} y={1} w={2} h={1} c="#fbbf24" />
    {/* Face */}
    <P x={5} y={4} w={6} h={3} c="#fbbf24" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    {/* Robe */}
    <P x={4} y={7} w={8} h={5} c="#7c3aed" />
    <P x={5} y={8} w={6} h={3} c="#8b5cf6" />
    {/* Staff */}
    <P x={13} y={2} w={1} h={10} c="#78350f" />
    <P x={12} y={1} w={3} h={2} c="#3b82f6" />
    <P x={13} y={0} w={1} h={1} c="#60a5fa" />
    {/* Feet */}
    <P x={5} y={12} w={2} h={2} c="#5b21b6" />
    <P x={9} y={12} w={2} h={2} c="#5b21b6" />
  </IconWrapper>
);

export const RogueIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Hood */}
    <P x={5} y={1} w={6} h={2} c="#1f2937" />
    <P x={4} y={3} w={8} h={1} c="#374151" />
    {/* Face (shadowed) */}
    <P x={5} y={4} w={6} h={3} c="#d97706" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    {/* Mask */}
    <P x={5} y={6} w={6} h={1} c="#1f2937" />
    {/* Cloak */}
    <P x={3} y={7} w={10} h={4} c="#374151" />
    <P x={5} y={8} w={6} h={2} c="#4b5563" />
    {/* Daggers */}
    <P x={1} y={6} w={1} h={4} c="#9ca3af" />
    <P x={1} y={5} w={1} h={1} c="#d1d5db" />
    <P x={14} y={6} w={1} h={4} c="#9ca3af" />
    <P x={14} y={5} w={1} h={1} c="#d1d5db" />
    {/* Legs */}
    <P x={5} y={11} w={2} h={3} c="#1f2937" />
    <P x={9} y={11} w={2} h={3} c="#1f2937" />
    {/* Feet */}
    <P x={4} y={14} w={3} h={2} c="#374151" />
    <P x={9} y={14} w={3} h={2} c="#374151" />
  </IconWrapper>
);

export const ClericIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Halo */}
    <P x={6} y={0} w={4} h={1} c="#fbbf24" />
    {/* Hood */}
    <P x={5} y={1} w={6} h={2} c="#f3f4f6" />
    <P x={4} y={3} w={8} h={1} c="#e5e7eb" />
    {/* Face */}
    <P x={5} y={4} w={6} h={3} c="#fbbf24" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    {/* Robe */}
    <P x={4} y={7} w={8} h={5} c="#f3f4f6" />
    <P x={5} y={8} w={6} h={3} c="#e5e7eb" />
    {/* Cross emblem */}
    <P x={7} y={8} w={2} h={3} c="#fbbf24" />
    <P x={6} y={9} w={4} h={1} c="#fbbf24" />
    {/* Staff */}
    <P x={13} y={3} w={1} h={9} c="#78350f" />
    <P x={12} y={2} w={3} h={2} c="#fbbf24" />
    {/* Feet */}
    <P x={5} y={12} w={2} h={2} c="#d1d5db" />
    <P x={9} y={12} w={2} h={2} c="#d1d5db" />
  </IconWrapper>
);

export const PaladinIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Crown/Helmet */}
    <P x={6} y={0} w={4} h={1} c="#fbbf24" />
    <P x={5} y={1} w={6} h={2} c="#fbbf24" />
    <P x={4} y={2} w={8} h={2} c="#9ca3af" />
    {/* Face */}
    <P x={5} y={4} w={6} h={3} c="#fbbf24" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    {/* Armor */}
    <P x={4} y={7} w={8} h={4} c="#fbbf24" />
    <P x={5} y={8} w={6} h={2} c="#fcd34d" />
    {/* Cross on chest */}
    <P x={7} y={7} w={2} h={3} c="#f3f4f6" />
    <P x={6} y={8} w={4} h={1} c="#f3f4f6" />
    {/* Shield */}
    <P x={0} y={5} w={3} h={5} c="#3b82f6" />
    <P x={1} y={6} w={1} h={3} c="#fbbf24" />
    {/* Sword */}
    <P x={13} y={2} w={1} h={7} c="#d1d5db" />
    <P x={12} y={8} w={3} h={1} c="#fbbf24" />
    {/* Legs */}
    <P x={5} y={11} w={2} h={3} c="#d97706" />
    <P x={9} y={11} w={2} h={3} c="#d97706" />
    {/* Feet */}
    <P x={4} y={14} w={3} h={2} c="#92400e" />
    <P x={9} y={14} w={3} h={2} c="#92400e" />
  </IconWrapper>
);

export const KnightIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Helmet with plume */}
    <P x={7} y={0} w={2} h={1} c="#dc2626" />
    <P x={5} y={1} w={6} h={3} c="#6b7280" />
    <P x={6} y={2} w={4} h={1} c="#9ca3af" />
    {/* Visor */}
    <P x={5} y={4} w={6} h={2} c="#4b5563" />
    <P x={6} y={4} w={4} h={1} c="#1f2937" />
    {/* Neck */}
    <P x={6} y={6} w={4} h={1} c="#6b7280" />
    {/* Armor */}
    <P x={4} y={7} w={8} h={4} c="#6b7280" />
    <P x={5} y={8} w={6} h={2} c="#9ca3af" />
    {/* Shield */}
    <P x={0} y={5} w={4} h={6} c="#6b7280" />
    <P x={1} y={6} w={2} h={4} c="#9ca3af" />
    {/* Sword */}
    <P x={13} y={3} w={1} h={6} c="#d1d5db" />
    <P x={12} y={8} w={3} h={2} c="#78350f" />
    {/* Legs */}
    <P x={5} y={11} w={2} h={3} c="#4b5563" />
    <P x={9} y={11} w={2} h={3} c="#4b5563" />
    {/* Feet */}
    <P x={4} y={14} w={3} h={2} c="#374151" />
    <P x={9} y={14} w={3} h={2} c="#374151" />
  </IconWrapper>
);

export const DruidIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Antlers */}
    <P x={3} y={0} w={1} h={2} c="#78350f" />
    <P x={4} y={1} w={1} h={1} c="#78350f" />
    <P x={12} y={0} w={1} h={2} c="#78350f" />
    <P x={11} y={1} w={1} h={1} c="#78350f" />
    {/* Hood with leaves */}
    <P x={5} y={2} w={6} h={2} c="#166534" />
    <P x={4} y={3} w={8} h={1} c="#15803d" />
    {/* Face */}
    <P x={5} y={4} w={6} h={3} c="#fbbf24" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    {/* Robe */}
    <P x={4} y={7} w={8} h={5} c="#166534" />
    <P x={5} y={8} w={6} h={3} c="#15803d" />
    {/* Leaf emblem */}
    <P x={7} y={8} w={2} h={2} c="#22c55e" />
    {/* Staff with crystals */}
    <P x={13} y={2} w={1} h={10} c="#78350f" />
    <P x={12} y={1} w={3} h={2} c="#22c55e" />
    {/* Feet */}
    <P x={5} y={12} w={2} h={2} c="#14532d" />
    <P x={9} y={12} w={2} h={2} c="#14532d" />
  </IconWrapper>
);

export const ShamanIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Headdress */}
    <P x={4} y={0} w={2} h={2} c="#60a5fa" />
    <P x={10} y={0} w={2} h={2} c="#60a5fa" />
    <P x={5} y={1} w={6} h={2} c="#78350f" />
    <P x={4} y={3} w={8} h={1} c="#92400e" />
    {/* Face with markings */}
    <P x={5} y={4} w={6} h={3} c="#fbbf24" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    <P x={5} y={5} w={1} h={1} c="#3b82f6" />
    <P x={10} y={5} w={1} h={1} c="#3b82f6" />
    {/* Robe */}
    <P x={4} y={7} w={8} h={5} c="#1e40af" />
    <P x={5} y={8} w={6} h={3} c="#2563eb" />
    {/* Lightning emblem */}
    <P x={7} y={8} w={1} h={1} c="#fbbf24" />
    <P x={8} y={9} w={1} h={1} c="#fbbf24" />
    <P x={7} y={10} w={1} h={1} c="#fbbf24" />
    {/* Totem staff */}
    <P x={13} y={2} w={1} h={10} c="#78350f" />
    <P x={12} y={1} w={3} h={2} c="#ef4444" />
    <P x={12} y={3} w={3} h={1} c="#22c55e" />
    {/* Feet */}
    <P x={5} y={12} w={2} h={2} c="#1e3a8a" />
    <P x={9} y={12} w={2} h={2} c="#1e3a8a" />
  </IconWrapper>
);

export const RangerIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Hood */}
    <P x={5} y={1} w={6} h={2} c="#166534" />
    <P x={4} y={3} w={8} h={1} c="#15803d" />
    {/* Face */}
    <P x={5} y={4} w={6} h={3} c="#fbbf24" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    {/* Cloak */}
    <P x={3} y={7} w={10} h={4} c="#166534" />
    <P x={5} y={8} w={6} h={2} c="#15803d" />
    {/* Bow */}
    <P x={0} y={3} w={1} h={8} c="#78350f" />
    <P x={1} y={2} w={1} h={1} c="#78350f" />
    <P x={1} y={11} w={1} h={1} c="#78350f" />
    <P x={1} y={3} w={1} h={8} c="#fbbf24" />
    {/* Arrow */}
    <P x={2} y={7} w={4} h={1} c="#78350f" />
    <P x={1} y={7} w={1} h={1} c="#9ca3af" />
    {/* Quiver */}
    <P x={13} y={4} w={2} h={6} c="#78350f" />
    <P x={13} y={3} w={1} h={1} c="#9ca3af" />
    <P x={14} y={3} w={1} h={1} c="#9ca3af" />
    {/* Legs */}
    <P x={5} y={11} w={2} h={3} c="#14532d" />
    <P x={9} y={11} w={2} h={3} c="#14532d" />
    {/* Feet */}
    <P x={4} y={14} w={3} h={2} c="#78350f" />
    <P x={9} y={14} w={3} h={2} c="#78350f" />
  </IconWrapper>
);

export const NecromancerIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Hood */}
    <P x={5} y={1} w={6} h={2} c="#1f2937" />
    <P x={4} y={3} w={8} h={1} c="#374151" />
    {/* Skull face */}
    <P x={5} y={4} w={6} h={3} c="#e5e7eb" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    <P x={7} y={6} w={2} h={1} c="#1f2937" />
    {/* Robe */}
    <P x={4} y={7} w={8} h={5} c="#1f2937" />
    <P x={5} y={8} w={6} h={3} c="#374151" />
    {/* Skull emblem */}
    <P x={7} y={8} w={2} h={2} c="#a855f7" />
    {/* Staff with skull */}
    <P x={13} y={3} w={1} h={9} c="#4b5563" />
    <P x={12} y={1} w={3} h={3} c="#e5e7eb" />
    <P x={13} y={2} w={1} h={1} c="#1f2937" />
    {/* Green glow */}
    <P x={12} y={4} w={1} h={1} c="#22c55e" />
    <P x={14} y={4} w={1} h={1} c="#22c55e" />
    {/* Feet */}
    <P x={5} y={12} w={2} h={2} c="#111827" />
    <P x={9} y={12} w={2} h={2} c="#111827" />
  </IconWrapper>
);

// === ROLE ICONS ===

export const TankIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Shield shape */}
    <P x={3} y={2} w={10} h={2} c="#6b7280" />
    <P x={2} y={4} w={12} h={6} c="#6b7280" />
    <P x={3} y={10} w={10} h={2} c="#6b7280" />
    <P x={4} y={12} w={8} h={1} c="#6b7280" />
    <P x={5} y={13} w={6} h={1} c="#6b7280" />
    <P x={6} y={14} w={4} h={1} c="#6b7280" />
    {/* Inner shield */}
    <P x={4} y={4} w={8} h={5} c="#9ca3af" />
    {/* Cross emblem */}
    <P x={7} y={4} w={2} h={7} c="#fbbf24" />
    <P x={5} y={6} w={6} h={2} c="#fbbf24" />
  </IconWrapper>
);

export const HealerIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Heart shape */}
    <P x={2} y={3} w={3} h={3} c="#ef4444" />
    <P x={11} y={3} w={3} h={3} c="#ef4444" />
    <P x={1} y={4} w={5} h={4} c="#ef4444" />
    <P x={10} y={4} w={5} h={4} c="#ef4444" />
    <P x={2} y={6} w={12} h={3} c="#ef4444" />
    <P x={3} y={9} w={10} h={2} c="#ef4444" />
    <P x={4} y={11} w={8} h={1} c="#ef4444" />
    <P x={5} y={12} w={6} h={1} c="#ef4444" />
    <P x={6} y={13} w={4} h={1} c="#ef4444" />
    <P x={7} y={14} w={2} h={1} c="#ef4444" />
    {/* Cross */}
    <P x={7} y={5} w={2} h={5} c="#fef2f2" />
    <P x={5} y={7} w={6} h={2} c="#fef2f2" />
  </IconWrapper>
);

export const DPSIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Sword blade */}
    <P x={7} y={1} w={2} h={8} c="#d1d5db" />
    <P x={6} y={1} w={1} h={7} c="#9ca3af" />
    <P x={9} y={1} w={1} h={7} c="#f3f4f6" />
    <P x={7} y={0} w={2} h={1} c="#f3f4f6" />
    {/* Guard */}
    <P x={4} y={9} w={8} h={2} c="#fbbf24" />
    <P x={5} y={9} w={6} h={1} c="#fcd34d" />
    {/* Handle */}
    <P x={7} y={11} w={2} h={3} c="#78350f" />
    {/* Pommel */}
    <P x={6} y={14} w={4} h={2} c="#fbbf24" />
  </IconWrapper>
);

// === UI ICONS ===

export const GoldIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Coin outer */}
    <P x={4} y={2} w={8} h={1} c="#d97706" />
    <P x={3} y={3} w={10} h={1} c="#f59e0b" />
    <P x={2} y={4} w={12} h={8} c="#fbbf24" />
    <P x={3} y={12} w={10} h={1} c="#f59e0b" />
    <P x={4} y={13} w={8} h={1} c="#d97706" />
    {/* Shine */}
    <P x={4} y={5} w={2} h={2} c="#fcd34d" />
    {/* Dollar sign */}
    <P x={7} y={5} w={2} h={1} c="#92400e" />
    <P x={6} y={6} w={1} h={1} c="#92400e" />
    <P x={7} y={7} w={2} h={1} c="#92400e" />
    <P x={9} y={8} w={1} h={1} c="#92400e" />
    <P x={7} y={9} w={2} h={1} c="#92400e" />
  </IconWrapper>
);

export const HealthIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Heart */}
    <P x={2} y={4} w={3} h={2} c="#dc2626" />
    <P x={11} y={4} w={3} h={2} c="#dc2626" />
    <P x={1} y={5} w={5} h={3} c="#dc2626" />
    <P x={10} y={5} w={5} h={3} c="#dc2626" />
    <P x={2} y={7} w={12} h={2} c="#dc2626" />
    <P x={3} y={9} w={10} h={2} c="#dc2626" />
    <P x={4} y={11} w={8} h={1} c="#dc2626" />
    <P x={5} y={12} w={6} h={1} c="#dc2626" />
    <P x={6} y={13} w={4} h={1} c="#dc2626" />
    <P x={7} y={14} w={2} h={1} c="#dc2626" />
    {/* Shine */}
    <P x={3} y={5} w={2} h={2} c="#ef4444" />
  </IconWrapper>
);

export const AttackIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Sword */}
    <P x={11} y={1} w={2} h={2} c="#f3f4f6" />
    <P x={9} y={3} w={2} h={2} c="#d1d5db" />
    <P x={7} y={5} w={2} h={2} c="#d1d5db" />
    <P x={5} y={7} w={2} h={2} c="#d1d5db" />
    <P x={3} y={9} w={3} h={3} c="#78350f" />
    <P x={2} y={11} w={2} h={2} c="#fbbf24" />
    {/* Slash effect */}
    <P x={13} y={3} w={1} h={1} c="#fbbf24" />
    <P x={12} y={5} w={1} h={1} c="#fbbf24" />
    <P x={14} y={4} w={1} h={1} c="#fcd34d" />
  </IconWrapper>
);

export const DefenseIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Shield */}
    <P x={3} y={1} w={10} h={2} c="#3b82f6" />
    <P x={2} y={3} w={12} h={6} c="#3b82f6" />
    <P x={3} y={9} w={10} h={2} c="#3b82f6" />
    <P x={4} y={11} w={8} h={2} c="#3b82f6" />
    <P x={5} y={13} w={6} h={1} c="#3b82f6" />
    <P x={6} y={14} w={4} h={1} c="#3b82f6" />
    <P x={7} y={15} w={2} h={1} c="#3b82f6" />
    {/* Inner */}
    <P x={4} y={3} w={8} h={5} c="#60a5fa" />
    {/* Star */}
    <P x={7} y={5} w={2} h={3} c="#fbbf24" />
    <P x={6} y={6} w={4} h={1} c="#fbbf24" />
  </IconWrapper>
);

export const SpeedIcon = ({ size, className }) => (
  <IconWrapper size={size} className={className}>
    {/* Lightning bolt */}
    <P x={9} y={1} w={3} h={2} c="#fbbf24" />
    <P x={7} y={3} w={4} h={2} c="#fbbf24" />
    <P x={5} y={5} w={5} h={2} c="#fbbf24" />
    <P x={6} y={7} w={5} h={2} c="#fbbf24" />
    <P x={8} y={9} w={4} h={2} c="#fbbf24" />
    <P x={6} y={11} w={4} h={2} c="#fbbf24" />
    <P x={4} y={13} w={3} h={2} c="#fbbf24" />
    {/* Highlight */}
    <P x={10} y={2} w={1} h={1} c="#fcd34d" />
    <P x={8} y={4} w={1} h={1} c="#fcd34d" />
  </IconWrapper>
);

// Icon mapping for easy lookup
export const CLASS_ICONS = {
  warrior: WarriorIcon,
  mage: MageIcon,
  rogue: RogueIcon,
  cleric: ClericIcon,
  paladin: PaladinIcon,
  knight: KnightIcon,
  druid: DruidIcon,
  shaman: ShamanIcon,
  ranger: RangerIcon,
  necromancer: NecromancerIcon,
};

export const ROLE_ICONS = {
  tank: TankIcon,
  healer: HealerIcon,
  dps: DPSIcon,
};

export const STAT_ICONS = {
  hp: HealthIcon,
  maxHp: HealthIcon,
  attack: AttackIcon,
  defense: DefenseIcon,
  speed: SpeedIcon,
};

// Generic Icon component that looks up by name
export const Icon = ({ name, size = 24, className = '' }) => {
  const IconComponent = CLASS_ICONS[name] || ROLE_ICONS[name] || STAT_ICONS[name];
  if (!IconComponent) {
    console.warn(`Icon not found: ${name}`);
    return null;
  }
  return <IconComponent size={size} className={className} />;
};

export default Icon;
