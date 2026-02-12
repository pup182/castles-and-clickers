// Monster SVG sprites - pixel art style
// All monsters are 16x16 grid

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

// === TIER 1 MONSTERS ===

export const GoblinSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body */}
    <P x={5} y={6} w={6} h={6} c="#22c55e" />
    <P x={6} y={5} w={4} h={1} c="#22c55e" />
    {/* Eyes */}
    <P x={6} y={7} w={2} h={2} c="#fef3c7" />
    <P x={9} y={7} w={2} h={2} c="#fef3c7" />
    <P x={7} y={8} w={1} h={1} c="#1f2937" />
    <P x={10} y={8} w={1} h={1} c="#1f2937" />
    {/* Ears */}
    <P x={3} y={6} w={2} h={3} c="#22c55e" />
    <P x={11} y={6} w={2} h={3} c="#22c55e" />
    {/* Mouth */}
    <P x={7} y={10} w={3} h={1} c="#1f2937" />
    {/* Legs */}
    <P x={6} y={12} w={2} h={2} c="#22c55e" />
    <P x={9} y={12} w={2} h={2} c="#22c55e" />
  </IconWrapper>
);

export const RatSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body */}
    <P x={4} y={8} w={8} h={4} c="#78716c" />
    <P x={5} y={7} w={6} h={1} c="#78716c" />
    {/* Head */}
    <P x={9} y={6} w={4} h={3} c="#78716c" />
    {/* Eye */}
    <P x={11} y={7} w={1} h={1} c="#1f2937" />
    {/* Ears */}
    <P x={10} y={5} w={2} h={1} c="#a8a29e" />
    {/* Nose */}
    <P x={13} y={7} w={1} h={1} c="#f472b6" />
    {/* Tail */}
    <P x={2} y={9} w={2} h={1} c="#a8a29e" />
    <P x={1} y={10} w={2} h={1} c="#a8a29e" />
    {/* Legs */}
    <P x={5} y={12} w={2} h={2} c="#78716c" />
    <P x={9} y={12} w={2} h={2} c="#78716c" />
  </IconWrapper>
);

export const SkeletonSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Skull */}
    <P x={5} y={2} w={6} h={5} c="#e5e7eb" />
    <P x={6} y={3} w={1} h={2} c="#1f2937" />
    <P x={9} y={3} w={1} h={2} c="#1f2937" />
    <P x={7} y={5} w={2} h={1} c="#1f2937" />
    {/* Spine */}
    <P x={7} y={7} w={2} h={4} c="#d1d5db" />
    {/* Ribs */}
    <P x={5} y={8} w={6} h={1} c="#e5e7eb" />
    <P x={5} y={10} w={6} h={1} c="#e5e7eb" />
    {/* Arms */}
    <P x={3} y={8} w={2} h={1} c="#d1d5db" />
    <P x={11} y={8} w={2} h={1} c="#d1d5db" />
    <P x={2} y={9} w={1} h={2} c="#d1d5db" />
    <P x={13} y={9} w={1} h={2} c="#d1d5db" />
    {/* Legs */}
    <P x={6} y={11} w={1} h={3} c="#d1d5db" />
    <P x={9} y={11} w={1} h={3} c="#d1d5db" />
  </IconWrapper>
);

export const SlimeSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body */}
    <P x={3} y={8} w={10} h={5} c="#22c55e" />
    <P x={4} y={6} w={8} h={2} c="#22c55e" />
    <P x={5} y={5} w={6} h={1} c="#22c55e" />
    {/* Highlight */}
    <P x={5} y={7} w={3} h={2} c="#4ade80" />
    {/* Eyes */}
    <P x={5} y={9} w={2} h={2} c="#1f2937" />
    <P x={9} y={9} w={2} h={2} c="#1f2937" />
    <P x={6} y={9} w={1} h={1} c="#ffffff" />
    <P x={10} y={9} w={1} h={1} c="#ffffff" />
  </IconWrapper>
);

export const BatSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Wings */}
    <P x={1} y={6} w={4} h={4} c="#1f2937" />
    <P x={11} y={6} w={4} h={4} c="#1f2937" />
    <P x={2} y={5} w={2} h={1} c="#1f2937" />
    <P x={12} y={5} w={2} h={1} c="#1f2937" />
    {/* Body */}
    <P x={5} y={6} w={6} h={5} c="#374151" />
    {/* Head */}
    <P x={6} y={4} w={4} h={3} c="#374151" />
    {/* Ears */}
    <P x={6} y={2} w={1} h={2} c="#374151" />
    <P x={9} y={2} w={1} h={2} c="#374151" />
    {/* Eyes */}
    <P x={6} y={5} w={1} h={1} c="#ef4444" />
    <P x={9} y={5} w={1} h={1} c="#ef4444" />
  </IconWrapper>
);

// === TIER 2 MONSTERS ===

export const OrcSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body */}
    <P x={4} y={6} w={8} h={6} c="#166534" />
    {/* Head */}
    <P x={5} y={2} w={6} h={5} c="#15803d" />
    {/* Eyes */}
    <P x={6} y={4} w={2} h={2} c="#fef3c7" />
    <P x={9} y={4} w={2} h={2} c="#fef3c7" />
    <P x={7} y={5} w={1} h={1} c="#1f2937" />
    <P x={10} y={5} w={1} h={1} c="#1f2937" />
    {/* Tusks */}
    <P x={5} y={6} w={1} h={2} c="#fef3c7" />
    <P x={10} y={6} w={1} h={2} c="#fef3c7" />
    {/* Arms */}
    <P x={2} y={7} w={2} h={4} c="#15803d" />
    <P x={12} y={7} w={2} h={4} c="#15803d" />
    {/* Legs */}
    <P x={5} y={12} w={2} h={2} c="#166534" />
    <P x={9} y={12} w={2} h={2} c="#166534" />
  </IconWrapper>
);

export const WolfSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body */}
    <P x={3} y={8} w={10} h={4} c="#4b5563" />
    {/* Head */}
    <P x={10} y={5} w={4} h={4} c="#6b7280" />
    {/* Snout */}
    <P x={13} y={7} w={2} h={2} c="#4b5563" />
    {/* Ears */}
    <P x={11} y={3} w={2} h={2} c="#4b5563" />
    {/* Eye */}
    <P x={11} y={6} w={1} h={1} c="#fbbf24" />
    {/* Tail */}
    <P x={1} y={7} w={2} h={2} c="#6b7280" />
    {/* Legs */}
    <P x={4} y={12} w={2} h={2} c="#4b5563" />
    <P x={10} y={12} w={2} h={2} c="#4b5563" />
  </IconWrapper>
);

export const ZombieSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body */}
    <P x={5} y={6} w={6} h={6} c="#65a30d" />
    {/* Head */}
    <P x={5} y={2} w={6} h={5} c="#84cc16" />
    {/* Eyes */}
    <P x={6} y={4} w={2} h={1} c="#1f2937" />
    <P x={9} y={4} w={2} h={1} c="#1f2937" />
    {/* Wounds */}
    <P x={8} y={3} w={2} h={1} c="#7f1d1d" />
    <P x={6} y={8} w={1} h={2} c="#7f1d1d" />
    {/* Arms - outstretched */}
    <P x={2} y={7} w={3} h={2} c="#84cc16" />
    <P x={11} y={7} w={3} h={2} c="#84cc16" />
    {/* Legs */}
    <P x={5} y={12} w={2} h={2} c="#65a30d" />
    <P x={9} y={12} w={2} h={2} c="#65a30d" />
  </IconWrapper>
);

export const SpiderSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body */}
    <P x={5} y={7} w={6} h={5} c="#1f2937" />
    {/* Head */}
    <P x={6} y={5} w={4} h={3} c="#374151" />
    {/* Eyes */}
    <P x={6} y={6} w={1} h={1} c="#ef4444" />
    <P x={7} y={5} w={1} h={1} c="#ef4444" />
    <P x={8} y={5} w={1} h={1} c="#ef4444" />
    <P x={9} y={6} w={1} h={1} c="#ef4444" />
    {/* Legs */}
    <P x={2} y={7} w={3} h={1} c="#1f2937" />
    <P x={1} y={8} w={4} h={1} c="#1f2937" />
    <P x={2} y={9} w={3} h={1} c="#1f2937" />
    <P x={3} y={10} w={2} h={1} c="#1f2937" />
    <P x={11} y={7} w={3} h={1} c="#1f2937" />
    <P x={11} y={8} w={4} h={1} c="#1f2937" />
    <P x={11} y={9} w={3} h={1} c="#1f2937" />
    <P x={11} y={10} w={2} h={1} c="#1f2937" />
  </IconWrapper>
);

export const HarpySprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Wings */}
    <P x={1} y={4} w={4} h={6} c="#78716c" />
    <P x={11} y={4} w={4} h={6} c="#78716c" />
    {/* Body */}
    <P x={5} y={5} w={6} h={7} c="#fde68a" />
    {/* Head */}
    <P x={6} y={2} w={4} h={4} c="#fde68a" />
    {/* Hair */}
    <P x={5} y={1} w={6} h={2} c="#78350f" />
    {/* Eyes */}
    <P x={7} y={4} w={1} h={1} c="#1f2937" />
    <P x={9} y={4} w={1} h={1} c="#1f2937" />
    {/* Talons */}
    <P x={5} y={12} w={2} h={2} c="#78716c" />
    <P x={9} y={12} w={2} h={2} c="#78716c" />
  </IconWrapper>
);

// === TIER 3 MONSTERS ===

export const TrollSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body */}
    <P x={3} y={5} w={10} h={8} c="#166534" />
    {/* Head */}
    <P x={5} y={1} w={6} h={5} c="#15803d" />
    {/* Eyes */}
    <P x={6} y={3} w={2} h={2} c="#fbbf24" />
    <P x={9} y={3} w={2} h={2} c="#fbbf24" />
    <P x={7} y={4} w={1} h={1} c="#1f2937" />
    <P x={10} y={4} w={1} h={1} c="#1f2937" />
    {/* Nose */}
    <P x={7} y={4} w={2} h={2} c="#14532d" />
    {/* Arms */}
    <P x={1} y={6} w={2} h={6} c="#15803d" />
    <P x={13} y={6} w={2} h={6} c="#15803d" />
    {/* Legs */}
    <P x={4} y={13} w={3} h={2} c="#166534" />
    <P x={9} y={13} w={3} h={2} c="#166534" />
  </IconWrapper>
);

export const GhostSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body - faded */}
    <P x={4} y={3} w={8} h={10} c="#a5b4fc" />
    <P x={5} y={2} w={6} h={1} c="#a5b4fc" />
    {/* Wavy bottom */}
    <P x={4} y={13} w={2} h={1} c="#a5b4fc" />
    <P x={7} y={14} w={2} h={1} c="#a5b4fc" />
    <P x={10} y={13} w={2} h={1} c="#a5b4fc" />
    {/* Eyes */}
    <P x={5} y={6} w={2} h={3} c="#1f2937" />
    <P x={9} y={6} w={2} h={3} c="#1f2937" />
    {/* Mouth */}
    <P x={7} y={10} w={2} h={2} c="#1f2937" />
  </IconWrapper>
);

export const DarkKnightSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Helmet */}
    <P x={5} y={1} w={6} h={5} c="#1f2937" />
    <P x={6} y={2} w={4} h={1} c="#374151" />
    {/* Visor */}
    <P x={6} y={4} w={4} h={1} c="#ef4444" />
    {/* Armor body */}
    <P x={4} y={6} w={8} h={6} c="#1f2937" />
    <P x={5} y={7} w={6} h={4} c="#374151" />
    {/* Arms */}
    <P x={2} y={6} w={2} h={5} c="#1f2937" />
    <P x={12} y={6} w={2} h={5} c="#1f2937" />
    {/* Sword */}
    <P x={13} y={4} w={1} h={6} c="#9ca3af" />
    <P x={12} y={3} w={3} h={1} c="#9ca3af" />
    {/* Legs */}
    <P x={5} y={12} w={2} h={3} c="#1f2937" />
    <P x={9} y={12} w={2} h={3} c="#1f2937" />
  </IconWrapper>
);

export const MinotaurSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body */}
    <P x={4} y={6} w={8} h={7} c="#78350f" />
    {/* Head */}
    <P x={5} y={2} w={6} h={5} c="#92400e" />
    {/* Horns */}
    <P x={3} y={1} w={2} h={3} c="#fef3c7" />
    <P x={11} y={1} w={2} h={3} c="#fef3c7" />
    {/* Snout */}
    <P x={6} y={5} w={4} h={2} c="#d97706" />
    {/* Nose ring */}
    <P x={7} y={6} w={2} h={1} c="#fbbf24" />
    {/* Eyes */}
    <P x={6} y={3} w={1} h={1} c="#ef4444" />
    <P x={9} y={3} w={1} h={1} c="#ef4444" />
    {/* Arms */}
    <P x={2} y={7} w={2} h={4} c="#92400e" />
    <P x={12} y={7} w={2} h={4} c="#92400e" />
    {/* Legs */}
    <P x={5} y={13} w={2} h={2} c="#78350f" />
    <P x={9} y={13} w={2} h={2} c="#78350f" />
  </IconWrapper>
);

export const VampireSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Cape */}
    <P x={2} y={4} w={12} h={10} c="#7f1d1d" />
    {/* Body */}
    <P x={5} y={5} w={6} h={8} c="#1f2937" />
    {/* Head */}
    <P x={5} y={1} w={6} h={5} c="#e5e7eb" />
    {/* Hair */}
    <P x={4} y={1} w={8} h={2} c="#1f2937" />
    {/* Eyes */}
    <P x={6} y={3} w={1} h={1} c="#ef4444" />
    <P x={9} y={3} w={1} h={1} c="#ef4444" />
    {/* Fangs */}
    <P x={6} y={5} w={1} h={1} c="#ffffff" />
    <P x={9} y={5} w={1} h={1} c="#ffffff" />
  </IconWrapper>
);

// === TIER 4 MONSTERS ===

export const DemonSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Wings */}
    <P x={1} y={4} w={3} h={6} c="#7f1d1d" />
    <P x={12} y={4} w={3} h={6} c="#7f1d1d" />
    {/* Body */}
    <P x={4} y={5} w={8} h={8} c="#dc2626" />
    {/* Head */}
    <P x={5} y={2} w={6} h={4} c="#ef4444" />
    {/* Horns */}
    <P x={4} y={0} w={2} h={3} c="#1f2937" />
    <P x={10} y={0} w={2} h={3} c="#1f2937" />
    {/* Eyes */}
    <P x={6} y={3} w={2} h={1} c="#fbbf24" />
    <P x={9} y={3} w={2} h={1} c="#fbbf24" />
    {/* Mouth */}
    <P x={7} y={5} w={2} h={1} c="#1f2937" />
    {/* Legs */}
    <P x={5} y={13} w={2} h={2} c="#dc2626" />
    <P x={9} y={13} w={2} h={2} c="#dc2626" />
  </IconWrapper>
);

export const GolemSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body */}
    <P x={3} y={5} w={10} h={8} c="#78716c" />
    {/* Head */}
    <P x={4} y={1} w={8} h={5} c="#a8a29e" />
    {/* Eyes */}
    <P x={5} y={3} w={2} h={2} c="#3b82f6" />
    <P x={9} y={3} w={2} h={2} c="#3b82f6" />
    {/* Cracks */}
    <P x={7} y={2} w={1} h={3} c="#57534e" />
    <P x={6} y={7} w={4} h={1} c="#57534e" />
    {/* Arms */}
    <P x={1} y={6} w={2} h={5} c="#a8a29e" />
    <P x={13} y={6} w={2} h={5} c="#a8a29e" />
    {/* Legs */}
    <P x={4} y={13} w={3} h={2} c="#78716c" />
    <P x={9} y={13} w={3} h={2} c="#78716c" />
  </IconWrapper>
);

export const WraithSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body - dark and ethereal */}
    <P x={4} y={3} w={8} h={11} c="#1f2937" />
    <P x={5} y={2} w={6} h={1} c="#1f2937" />
    {/* Hood */}
    <P x={4} y={2} w={8} h={4} c="#111827" />
    {/* Eyes */}
    <P x={6} y={4} w={1} h={2} c="#a855f7" />
    <P x={9} y={4} w={1} h={2} c="#a855f7" />
    {/* Wispy bottom */}
    <P x={3} y={12} w={2} h={2} c="#374151" />
    <P x={6} y={14} w={2} h={1} c="#374151" />
    <P x={11} y={12} w={2} h={2} c="#374151" />
    {/* Claws */}
    <P x={2} y={8} w={2} h={3} c="#374151" />
    <P x={12} y={8} w={2} h={3} c="#374151" />
  </IconWrapper>
);

export const LichSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Robe */}
    <P x={4} y={6} w={8} h={8} c="#581c87" />
    <P x={5} y={5} w={6} h={1} c="#581c87" />
    {/* Skull head */}
    <P x={5} y={1} w={6} h={5} c="#e5e7eb" />
    {/* Eye sockets with glow */}
    <P x={6} y={2} w={2} h={2} c="#1f2937" />
    <P x={9} y={2} w={2} h={2} c="#1f2937" />
    <P x={6} y={3} w={1} h={1} c="#a855f7" />
    <P x={10} y={3} w={1} h={1} c="#a855f7" />
    {/* Crown */}
    <P x={5} y={0} w={6} h={1} c="#fbbf24" />
    <P x={6} y={-1} w={1} h={1} c="#fbbf24" />
    <P x={8} y={-1} w={1} h={1} c="#fbbf24" />
    <P x={10} y={-1} w={1} h={1} c="#fbbf24" />
    {/* Staff */}
    <P x={12} y={3} w={1} h={10} c="#78350f" />
    <P x={11} y={2} w={3} h={2} c="#a855f7" />
  </IconWrapper>
);

export const TitanSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body - massive */}
    <P x={2} y={4} w={12} h={10} c="#6b7280" />
    {/* Head */}
    <P x={4} y={0} w={8} h={5} c="#9ca3af" />
    {/* Eyes */}
    <P x={5} y={2} w={2} h={2} c="#fbbf24" />
    <P x={9} y={2} w={2} h={2} c="#fbbf24" />
    {/* Markings */}
    <P x={7} y={1} w={2} h={1} c="#3b82f6" />
    <P x={6} y={7} w={4} h={1} c="#3b82f6" />
    {/* Arms */}
    <P x={0} y={5} w={2} h={7} c="#9ca3af" />
    <P x={14} y={5} w={2} h={7} c="#9ca3af" />
    {/* Legs */}
    <P x={3} y={14} w={4} h={2} c="#6b7280" />
    <P x={9} y={14} w={4} h={2} c="#6b7280" />
  </IconWrapper>
);

// === BOSSES ===

export const GoblinKingSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Royal cape */}
    <P x={2} y={5} w={12} h={9} c="#7f1d1d" />
    <P x={3} y={4} w={10} h={1} c="#7f1d1d" />
    {/* Cape trim (gold) */}
    <P x={2} y={13} w={12} h={1} c="#fbbf24" />
    {/* Body */}
    <P x={4} y={5} w={8} h={8} c="#15803d" />
    {/* Head */}
    <P x={5} y={1} w={6} h={5} c="#22c55e" />
    {/* Eyes (menacing) */}
    <P x={6} y={3} w={2} h={2} c="#fef3c7" />
    <P x={9} y={3} w={2} h={2} c="#fef3c7" />
    <P x={7} y={4} w={1} h={1} c="#7f1d1d" />
    <P x={10} y={4} w={1} h={1} c="#7f1d1d" />
    {/* Ears (larger, more regal) */}
    <P x={3} y={3} w={2} h={3} c="#22c55e" />
    <P x={11} y={3} w={2} h={3} c="#22c55e" />
    <P x={3} y={4} w={1} h={1} c="#15803d" />
    <P x={12} y={4} w={1} h={1} c="#15803d" />
    {/* Royal Scepter */}
    <P x={14} y={3} w={1} h={9} c="#fbbf24" />
    <P x={13} y={1} w={3} h={3} c="#ef4444" />
    <P x={14} y={2} w={1} h={1} c="#fbbf24" />
    {/* Legs */}
    <P x={5} y={13} w={2} h={2} c="#15803d" />
    <P x={9} y={13} w={2} h={2} c="#15803d" />
  </IconWrapper>
);

export const DragonSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Massive wings with membrane detail */}
    <P x={0} y={3} w={4} h={8} c="#dc2626" />
    <P x={12} y={3} w={4} h={8} c="#dc2626" />
    <P x={1} y={4} w={1} h={5} c="#b91c1c" />
    <P x={14} y={4} w={1} h={5} c="#b91c1c" />
    <P x={0} y={2} w={2} h={1} c="#991b1b" />
    <P x={14} y={2} w={2} h={1} c="#991b1b" />
    {/* Body with scales */}
    <P x={4} y={4} w={8} h={9} c="#b91c1c" />
    <P x={5} y={6} w={6} h={1} c="#991b1b" />
    <P x={5} y={9} w={6} h={1} c="#991b1b" />
    {/* Chest plate */}
    <P x={6} y={7} w={4} h={4} c="#fbbf24" />
    {/* Head */}
    <P x={5} y={0} w={6} h={5} c="#ef4444" />
    {/* Horns */}
    <P x={3} y={0} w={2} h={2} c="#fbbf24" />
    <P x={11} y={0} w={2} h={2} c="#fbbf24" />
    {/* Eyes (fierce, glowing) */}
    <P x={6} y={2} w={2} h={2} c="#fbbf24" />
    <P x={9} y={2} w={2} h={2} c="#fbbf24" />
    <P x={7} y={3} w={1} h={1} c="#1f2937" />
    <P x={10} y={3} w={1} h={1} c="#1f2937" />
    {/* Snout */}
    <P x={6} y={4} w={4} h={2} c="#dc2626" />
    {/* Fire breath from nostrils */}
    <P x={6} y={5} w={1} h={2} c="#f97316" />
    <P x={9} y={5} w={1} h={2} c="#f97316" />
    <P x={7} y={6} w={2} h={1} c="#fbbf24" />
    {/* Tail with spikes */}
    <P x={3} y={11} w={2} h={3} c="#b91c1c" />
    <P x={1} y={13} w={2} h={2} c="#b91c1c" />
    <P x={2} y={12} w={1} h={1} c="#fbbf24" />
    {/* Legs with claws */}
    <P x={5} y={13} w={2} h={2} c="#b91c1c" />
    <P x={9} y={13} w={2} h={2} c="#b91c1c" />
  </IconWrapper>
);

export const DemonLordSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Massive tattered wings */}
    <P x={0} y={2} w={4} h={11} c="#7f1d1d" />
    <P x={12} y={2} w={4} h={11} c="#7f1d1d" />
    <P x={1} y={3} w={1} h={7} c="#991b1b" />
    <P x={14} y={3} w={1} h={7} c="#991b1b" />
    {/* Wing claws */}
    <P x={0} y={1} w={1} h={2} c="#1f2937" />
    <P x={15} y={1} w={1} h={2} c="#1f2937" />
    {/* Body with armor */}
    <P x={4} y={3} w={8} h={11} c="#991b1b" />
    <P x={5} y={5} w={6} h={6} c="#7f1d1d" />
    {/* Chest sigil */}
    <P x={7} y={7} w={2} h={2} c="#f97316" />
    {/* Head */}
    <P x={5} y={0} w={6} h={4} c="#dc2626" />
    {/* Horns */}
    <P x={3} y={0} w={2} h={3} c="#1f2937" />
    <P x={11} y={0} w={2} h={3} c="#1f2937" />
    <P x={2} y={1} w={1} h={1} c="#1f2937" />
    <P x={13} y={1} w={1} h={1} c="#1f2937" />
    {/* Eyes (hellfire) */}
    <P x={6} y={1} w={2} h={2} c="#fbbf24" />
    <P x={9} y={1} w={2} h={2} c="#fbbf24" />
    <P x={7} y={2} w={1} h={1} c="#ef4444" />
    <P x={10} y={2} w={1} h={1} c="#ef4444" />
    {/* Fanged mouth */}
    <P x={7} y={3} w={2} h={1} c="#1f2937" />
    <P x={6} y={3} w={1} h={1} c="#e5e7eb" />
    <P x={9} y={3} w={1} h={1} c="#e5e7eb" />
    {/* Clawed hands */}
    <P x={3} y={7} w={2} h={3} c="#dc2626" />
    <P x={11} y={7} w={2} h={3} c="#dc2626" />
    <P x={2} y={9} w={1} h={1} c="#1f2937" />
    <P x={13} y={9} w={1} h={1} c="#1f2937" />
    {/* Legs with hooves */}
    <P x={5} y={14} w={2} h={2} c="#991b1b" />
    <P x={9} y={14} w={2} h={2} c="#991b1b" />
  </IconWrapper>
);

// Orc Warlord - war paint, larger tusks, shoulder armor, battle axe
export const OrcWarlordSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body (larger/bulkier) */}
    <P x={3} y={5} w={10} h={8} c="#166534" />
    {/* Head */}
    <P x={4} y={1} w={8} h={5} c="#15803d" />
    {/* War paint stripes (red) */}
    <P x={5} y={2} w={1} h={3} c="#dc2626" />
    <P x={10} y={2} w={1} h={3} c="#dc2626" />
    {/* Eyes */}
    <P x={5} y={3} w={2} h={2} c="#fef3c7" />
    <P x={9} y={3} w={2} h={2} c="#fef3c7" />
    <P x={6} y={4} w={1} h={1} c="#7f1d1d" />
    <P x={10} y={4} w={1} h={1} c="#7f1d1d" />
    {/* Larger tusks */}
    <P x={4} y={5} w={2} h={3} c="#fef3c7" />
    <P x={10} y={5} w={2} h={3} c="#fef3c7" />
    {/* Shoulder armor */}
    <P x={1} y={5} w={3} h={3} c="#4b5563" />
    <P x={12} y={5} w={3} h={3} c="#4b5563" />
    <P x={2} y={6} w={1} h={1} c="#9ca3af" />
    <P x={13} y={6} w={1} h={1} c="#9ca3af" />
    {/* Arms */}
    <P x={1} y={8} w={2} h={4} c="#15803d" />
    <P x={13} y={8} w={2} h={4} c="#15803d" />
    {/* Battle axe */}
    <P x={14} y={2} w={1} h={8} c="#78350f" />
    <P x={13} y={1} w={3} h={3} c="#6b7280" />
    <P x={13} y={3} w={3} h={2} c="#9ca3af" />
    {/* Legs */}
    <P x={4} y={13} w={3} h={2} c="#166534" />
    <P x={9} y={13} w={3} h={2} c="#166534" />
  </IconWrapper>
);

// Spider Queen - larger body, elaborate legs, purple accents
export const SpiderQueenSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Large abdomen */}
    <P x={4} y={7} w={8} h={6} c="#1f2937" />
    <P x={5} y={6} w={6} h={1} c="#1f2937" />
    {/* Abdomen pattern (purple) */}
    <P x={6} y={8} w={4} h={3} c="#7c3aed" />
    <P x={7} y={11} w={2} h={1} c="#7c3aed" />
    {/* Thorax/head */}
    <P x={5} y={2} w={6} h={5} c="#374151" />
    {/* Eyes (8 eyes) */}
    <P x={5} y={4} w={2} h={1} c="#a855f7" />
    <P x={6} y={3} w={1} h={1} c="#a855f7" />
    <P x={7} y={3} w={2} h={2} c="#ef4444" />
    <P x={9} y={3} w={1} h={1} c="#a855f7" />
    <P x={9} y={4} w={2} h={1} c="#a855f7" />
    {/* Fangs */}
    <P x={6} y={6} w={1} h={1} c="#fef3c7" />
    <P x={9} y={6} w={1} h={1} c="#fef3c7" />
    {/* Legs */}
    <P x={1} y={4} w={4} h={1} c="#1f2937" />
    <P x={0} y={5} w={5} h={1} c="#374151" />
    <P x={1} y={6} w={4} h={1} c="#1f2937" />
    <P x={2} y={7} w={3} h={1} c="#374151" />
    <P x={11} y={4} w={4} h={1} c="#1f2937" />
    <P x={11} y={5} w={5} h={1} c="#374151" />
    <P x={11} y={6} w={4} h={1} c="#1f2937" />
    <P x={11} y={7} w={3} h={1} c="#374151" />
    {/* Leg tips (purple) */}
    <P x={0} y={5} w={1} h={1} c="#7c3aed" />
    <P x={0} y={6} w={1} h={1} c="#7c3aed" />
    <P x={15} y={5} w={1} h={1} c="#7c3aed" />
    <P x={15} y={6} w={1} h={1} c="#7c3aed" />
  </IconWrapper>
);

// Lich King - glowing eyes, flowing dark robes, staff
export const LichKingSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Flowing robes (wider, more majestic) */}
    <P x={2} y={5} w={12} h={10} c="#1e1b4b" />
    <P x={3} y={4} w={10} h={1} c="#1e1b4b" />
    {/* Robe trim (gold) */}
    <P x={2} y={14} w={12} h={1} c="#fbbf24" />
    <P x={3} y={13} w={1} h={1} c="#fbbf24" />
    <P x={12} y={13} w={1} h={1} c="#fbbf24" />
    {/* Skeletal head */}
    <P x={5} y={0} w={6} h={5} c="#e5e7eb" />
    {/* Eye sockets with intense glow */}
    <P x={6} y={1} w={2} h={2} c="#1f2937" />
    <P x={9} y={1} w={2} h={2} c="#1f2937" />
    <P x={6} y={2} w={2} h={1} c="#3b82f6" />
    <P x={9} y={2} w={2} h={1} c="#3b82f6" />
    {/* Nose hole */}
    <P x={7} y={3} w={2} h={1} c="#1f2937" />
    {/* Staff */}
    <P x={13} y={0} w={1} h={13} c="#581c87" />
    <P x={12} y={0} w={3} h={2} c="#3b82f6" />
    <P x={13} y={0} w={1} h={1} c="#7dd3fc" />
    {/* Skeletal hands */}
    <P x={4} y={6} w={2} h={2} c="#d1d5db" />
    <P x={11} y={6} w={2} h={2} c="#d1d5db" />
  </IconWrapper>
);

// === TIER 5 MONSTERS - VOLCANIC ===

export const MagmaElementalSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body - molten rock */}
    <P x={4} y={4} w={8} h={9} c="#dc2626" />
    <P x={5} y={3} w={6} h={1} c="#ef4444" />
    {/* Lava cracks */}
    <P x={6} y={5} w={1} h={3} c="#fbbf24" />
    <P x={9} y={6} w={1} h={4} c="#fbbf24" />
    <P x={5} y={9} w={3} h={1} c="#f97316" />
    {/* Eyes */}
    <P x={5} y={5} w={2} h={2} c="#fbbf24" />
    <P x={9} y={5} w={2} h={2} c="#fbbf24" />
    {/* Rock chunks */}
    <P x={3} y={6} w={1} h={3} c="#78716c" />
    <P x={12} y={6} w={1} h={3} c="#78716c" />
    {/* Arms */}
    <P x={2} y={7} w={2} h={4} c="#b91c1c" />
    <P x={12} y={7} w={2} h={4} c="#b91c1c" />
    {/* Legs */}
    <P x={5} y={13} w={2} h={2} c="#991b1b" />
    <P x={9} y={13} w={2} h={2} c="#991b1b" />
  </IconWrapper>
);

export const FireImpSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body */}
    <P x={5} y={6} w={6} h={6} c="#dc2626" />
    {/* Head */}
    <P x={5} y={2} w={6} h={5} c="#ef4444" />
    {/* Horns */}
    <P x={4} y={1} w={2} h={2} c="#fbbf24" />
    <P x={10} y={1} w={2} h={2} c="#fbbf24" />
    {/* Eyes - mischievous */}
    <P x={6} y={4} w={2} h={2} c="#fbbf24" />
    <P x={9} y={4} w={2} h={2} c="#fbbf24" />
    <P x={7} y={5} w={1} h={1} c="#1f2937" />
    <P x={10} y={5} w={1} h={1} c="#1f2937" />
    {/* Grin */}
    <P x={7} y={6} w={3} h={1} c="#1f2937" />
    {/* Wings - small */}
    <P x={2} y={6} w={3} h={3} c="#f97316" />
    <P x={11} y={6} w={3} h={3} c="#f97316" />
    {/* Tail with flame */}
    <P x={3} y={10} w={2} h={1} c="#dc2626" />
    <P x={2} y={9} w={2} h={1} c="#fbbf24" />
    {/* Legs */}
    <P x={6} y={12} w={2} h={2} c="#b91c1c" />
    <P x={9} y={12} w={2} h={2} c="#b91c1c" />
  </IconWrapper>
);

export const LavaSerpentSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body coils */}
    <P x={3} y={8} w={10} h={4} c="#dc2626" />
    <P x={5} y={6} w={6} h={2} c="#ef4444" />
    <P x={2} y={10} w={3} h={3} c="#b91c1c" />
    {/* Lava pattern */}
    <P x={5} y={9} w={2} h={1} c="#fbbf24" />
    <P x={9} y={10} w={2} h={1} c="#fbbf24" />
    {/* Head */}
    <P x={9} y={3} w={5} h={4} c="#ef4444" />
    {/* Eyes */}
    <P x={11} y={4} w={2} h={2} c="#fbbf24" />
    <P x={12} y={5} w={1} h={1} c="#1f2937" />
    {/* Fangs */}
    <P x={13} y={6} w={1} h={2} c="#fef3c7" />
    {/* Forked tongue */}
    <P x={14} y={5} w={1} h={1} c="#f97316" />
    {/* Tail flame */}
    <P x={1} y={12} w={2} h={2} c="#fbbf24" />
  </IconWrapper>
);

export const ObsidianGolemSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body - dark rock */}
    <P x={3} y={4} w={10} h={9} c="#1f2937" />
    {/* Head */}
    <P x={4} y={1} w={8} h={4} c="#374151" />
    {/* Lava veins */}
    <P x={6} y={2} w={1} h={2} c="#f97316" />
    <P x={9} y={2} w={1} h={2} c="#f97316" />
    <P x={5} y={7} w={1} h={4} c="#dc2626" />
    <P x={10} y={6} w={1} h={5} c="#dc2626" />
    {/* Eyes - glowing */}
    <P x={5} y={2} w={2} h={2} c="#fbbf24" />
    <P x={9} y={2} w={2} h={2} c="#fbbf24" />
    {/* Arms - massive */}
    <P x={1} y={5} w={2} h={6} c="#374151" />
    <P x={13} y={5} w={2} h={6} c="#374151" />
    {/* Legs */}
    <P x={4} y={13} w={3} h={2} c="#1f2937" />
    <P x={9} y={13} w={3} h={2} c="#1f2937" />
  </IconWrapper>
);

export const EmberWraithSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body - fiery ethereal */}
    <P x={4} y={3} w={8} h={10} c="#f97316" />
    <P x={5} y={2} w={6} h={1} c="#fbbf24" />
    {/* Fade effect */}
    <P x={4} y={12} w={2} h={2} c="#dc2626" />
    <P x={7} y={13} w={2} h={2} c="#f97316" />
    <P x={10} y={12} w={2} h={2} c="#dc2626" />
    {/* Hood */}
    <P x={4} y={2} w={8} h={4} c="#b91c1c" />
    {/* Eyes */}
    <P x={6} y={4} w={1} h={2} c="#fef3c7" />
    <P x={9} y={4} w={1} h={2} c="#fef3c7" />
    {/* Claws */}
    <P x={2} y={7} w={2} h={3} c="#fbbf24" />
    <P x={12} y={7} w={2} h={3} c="#fbbf24" />
  </IconWrapper>
);

export const InfernoTitanSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Massive body */}
    <P x={2} y={4} w={12} h={10} c="#b91c1c" />
    {/* Head */}
    <P x={4} y={0} w={8} h={5} c="#dc2626" />
    {/* Horns - large */}
    <P x={2} y={0} w={2} h={3} c="#78716c" />
    <P x={12} y={0} w={2} h={3} c="#78716c" />
    {/* Eyes */}
    <P x={5} y={2} w={2} h={2} c="#fbbf24" />
    <P x={9} y={2} w={2} h={2} c="#fbbf24" />
    {/* Molten core */}
    <P x={6} y={6} w={4} h={4} c="#fbbf24" />
    <P x={7} y={7} w={2} h={2} c="#fef3c7" />
    {/* Lava veins */}
    <P x={4} y={8} w={2} h={1} c="#f97316" />
    <P x={10} y={8} w={2} h={1} c="#f97316" />
    {/* Arms */}
    <P x={0} y={5} w={2} h={7} c="#dc2626" />
    <P x={14} y={5} w={2} h={7} c="#dc2626" />
    {/* Legs */}
    <P x={3} y={14} w={4} h={2} c="#991b1b" />
    <P x={9} y={14} w={4} h={2} c="#991b1b" />
  </IconWrapper>
);

// === TIER 6 MONSTERS - VOID ===

export const VoidStalkerSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body - shadowy */}
    <P x={5} y={5} w={6} h={7} c="#1f2937" />
    {/* Head */}
    <P x={5} y={2} w={6} h={4} c="#374151" />
    {/* Void eyes */}
    <P x={6} y={3} w={2} h={2} c="#a855f7" />
    <P x={9} y={3} w={2} h={2} c="#a855f7" />
    <P x={7} y={4} w={1} h={1} c="#e9d5ff" />
    <P x={10} y={4} w={1} h={1} c="#e9d5ff" />
    {/* Void tendrils */}
    <P x={3} y={6} w={2} h={1} c="#7c3aed" />
    <P x={2} y={7} w={2} h={1} c="#6d28d9" />
    <P x={11} y={6} w={2} h={1} c="#7c3aed" />
    <P x={12} y={7} w={2} h={1} c="#6d28d9" />
    {/* Claws */}
    <P x={3} y={8} w={2} h={3} c="#374151" />
    <P x={11} y={8} w={2} h={3} c="#374151" />
    {/* Legs */}
    <P x={5} y={12} w={2} h={3} c="#1f2937" />
    <P x={9} y={12} w={2} h={3} c="#1f2937" />
  </IconWrapper>
);

export const EldritchHorrorSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Main body - bulbous */}
    <P x={3} y={4} w={10} h={8} c="#581c87" />
    <P x={4} y={3} w={8} h={1} c="#6b21a8" />
    {/* Eyes - many */}
    <P x={4} y={5} w={2} h={2} c="#fbbf24" />
    <P x={7} y={4} w={2} h={2} c="#22c55e" />
    <P x={10} y={5} w={2} h={2} c="#ef4444" />
    <P x={6} y={7} w={1} h={1} c="#a855f7" />
    <P x={9} y={7} w={1} h={1} c="#3b82f6" />
    {/* Tentacles */}
    <P x={1} y={8} w={2} h={4} c="#7c3aed" />
    <P x={0} y={10} w={2} h={3} c="#6d28d9" />
    <P x={13} y={8} w={2} h={4} c="#7c3aed" />
    <P x={14} y={10} w={2} h={3} c="#6d28d9" />
    {/* Lower tentacles */}
    <P x={4} y={12} w={2} h={3} c="#581c87" />
    <P x={7} y={13} w={2} h={2} c="#6b21a8" />
    <P x={10} y={12} w={2} h={3} c="#581c87" />
  </IconWrapper>
);

export const NullShadeSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body - pure void */}
    <P x={4} y={3} w={8} h={11} c="#0f0f0f" />
    <P x={5} y={2} w={6} h={1} c="#1f1f1f" />
    {/* Hood outline */}
    <P x={3} y={2} w={1} h={4} c="#374151" />
    <P x={12} y={2} w={1} h={4} c="#374151" />
    <P x={4} y={1} w={8} h={1} c="#374151" />
    {/* Eyes - hollow voids */}
    <P x={6} y={4} w={2} h={2} c="#7c3aed" />
    <P x={9} y={4} w={2} h={2} c="#7c3aed" />
    {/* Void wisps */}
    <P x={3} y={10} w={2} h={3} c="#1f1f1f" />
    <P x={6} y={13} w={2} h={2} c="#0f0f0f" />
    <P x={11} y={10} w={2} h={3} c="#1f1f1f" />
    {/* Hands */}
    <P x={2} y={7} w={2} h={3} c="#1f1f1f" />
    <P x={12} y={7} w={2} h={3} c="#1f1f1f" />
  </IconWrapper>
);

export const RealityRipperSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body - distorted */}
    <P x={4} y={4} w={8} h={8} c="#4c1d95" />
    {/* Rift pattern */}
    <P x={6} y={5} w={4} h={6} c="#7c3aed" />
    <P x={7} y={6} w={2} h={4} c="#a855f7" />
    {/* Head */}
    <P x={5} y={1} w={6} h={4} c="#581c87" />
    {/* Eyes - reality-warping */}
    <P x={6} y={2} w={2} h={2} c="#f472b6" />
    <P x={9} y={2} w={2} h={2} c="#22d3d1" />
    {/* Distortion claws */}
    <P x={2} y={5} w={2} h={5} c="#7c3aed" />
    <P x={1} y={6} w={1} h={3} c="#a855f7" />
    <P x={12} y={5} w={2} h={5} c="#7c3aed" />
    <P x={14} y={6} w={1} h={3} c="#a855f7" />
    {/* Legs */}
    <P x={5} y={12} w={2} h={3} c="#4c1d95" />
    <P x={9} y={12} w={2} h={3} c="#4c1d95" />
  </IconWrapper>
);

export const VoidSpawnSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body - small void creature */}
    <P x={5} y={6} w={6} h={6} c="#1f1f1f" />
    <P x={6} y={5} w={4} h={1} c="#0f0f0f" />
    {/* Head */}
    <P x={5} y={3} w={6} h={3} c="#374151" />
    {/* Single large eye */}
    <P x={6} y={4} w={4} h={2} c="#7c3aed" />
    <P x={7} y={4} w={2} h={2} c="#a855f7" />
    <P x={8} y={5} w={1} h={1} c="#e9d5ff" />
    {/* Tendrils */}
    <P x={3} y={7} w={2} h={2} c="#374151" />
    <P x={11} y={7} w={2} h={2} c="#374151" />
    {/* Legs */}
    <P x={5} y={12} w={2} h={2} c="#1f1f1f" />
    <P x={9} y={12} w={2} h={2} c="#1f1f1f" />
  </IconWrapper>
);

export const TheNamelessOneSprite = ({ size }) => (
  <IconWrapper size={size}>
    {/* Massive void form */}
    <P x={2} y={3} w={12} h={11} c="#0f0f0f" />
    <P x={3} y={2} w={10} h={1} c="#1f1f1f" />
    {/* Central eye */}
    <P x={5} y={5} w={6} h={4} c="#4c1d95" />
    <P x={6} y={6} w={4} h={2} c="#7c3aed" />
    <P x={7} y={6} w={2} h={2} c="#a855f7" />
    <P x={8} y={7} w={1} h={1} c="#fef3c7" />
    {/* Smaller eyes */}
    <P x={3} y={6} w={2} h={2} c="#ef4444" />
    <P x={11} y={6} w={2} h={2} c="#22d3d1" />
    {/* Void tendrils */}
    <P x={0} y={6} w={2} h={6} c="#1f1f1f" />
    <P x={14} y={6} w={2} h={6} c="#1f1f1f" />
    {/* Crown of void */}
    <P x={4} y={0} w={2} h={2} c="#7c3aed" />
    <P x={7} y={0} w={2} h={2} c="#a855f7" />
    <P x={10} y={0} w={2} h={2} c="#7c3aed" />
    {/* Lower mass */}
    <P x={3} y={13} w={3} h={2} c="#1f1f1f" />
    <P x={7} y={14} w={2} h={1} c="#0f0f0f" />
    <P x={10} y={13} w={3} h={2} c="#1f1f1f" />
  </IconWrapper>
);

// Monster sprite mapping - IDs must match monsters.js
export const MONSTER_SPRITES = {
  // Tier 1
  goblin: GoblinSprite,
  rat: RatSprite,           // monsters.js uses 'rat', not 'giant_rat'
  skeleton: SkeletonSprite,
  slime: SlimeSprite,
  giant_bat: BatSprite,
  // Tier 2
  orc: OrcSprite,
  wolf: WolfSprite,         // monsters.js uses 'wolf', not 'dire_wolf'
  zombie: ZombieSprite,
  giant_spider: SpiderSprite,
  harpy: HarpySprite,
  // Tier 3
  troll: TrollSprite,
  ghost: GhostSprite,
  dark_knight: DarkKnightSprite,
  minotaur: MinotaurSprite,
  vampire: VampireSprite,
  // Tier 4
  demon: DemonSprite,
  golem: GolemSprite,       // monsters.js uses 'golem', not 'stone_golem'
  wraith: WraithSprite,
  lich: LichSprite,
  titan: TitanSprite,
  // Tier 5 - Volcanic
  magma_elemental: MagmaElementalSprite,
  fire_imp: FireImpSprite,
  lava_serpent: LavaSerpentSprite,
  obsidian_golem: ObsidianGolemSprite,
  ember_wraith: EmberWraithSprite,
  // Tier 6 - Void
  void_stalker: VoidStalkerSprite,
  eldritch_horror: EldritchHorrorSprite,
  null_shade: NullShadeSprite,
  reality_ripper: RealityRipperSprite,
  void_spawn: VoidSpawnSprite,
  // Bosses - unique sprites for each
  goblin_king: GoblinKingSprite,
  orc_warlord: OrcWarlordSprite,
  spider_queen: SpiderQueenSprite,
  dragon: DragonSprite,
  demon_lord: DemonLordSprite,
  lich_king: LichKingSprite,
  inferno_titan: InfernoTitanSprite,
  the_nameless_one: TheNamelessOneSprite,
};

// Helper component to render monster by ID
export const MonsterIcon = ({ monsterId, size = 32, className = '' }) => {
  const SpriteComponent = MONSTER_SPRITES[monsterId];
  if (!SpriteComponent) {
    // Fallback to a generic monster
    return <DemonSprite size={size} />;
  }
  return <SpriteComponent size={size} className={className} />;
};

export default MonsterIcon;
