// Status Effect SVG sprites - pixel art style
// All effects are 16x16 grid

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

// === DAMAGE OVER TIME ===

export const PoisonIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Poison drop */}
    <P x={6} y={2} w={4} h={2} c="#22c55e" />
    <P x={5} y={4} w={6} h={4} c="#22c55e" />
    <P x={4} y={8} w={8} h={4} c="#22c55e" />
    <P x={5} y={12} w={6} h={2} c="#22c55e" />
    {/* Highlight */}
    <P x={6} y={5} w={2} h={2} c="#4ade80" />
    {/* Skull */}
    <P x={6} y={8} w={4} h={3} c="#1f2937" />
    <P x={7} y={9} w={1} h={1} c="#22c55e" />
    <P x={9} y={9} w={1} h={1} c="#22c55e" />
  </IconWrapper>
);

export const BurnIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Flame */}
    <P x={6} y={3} w={4} h={8} c="#ef4444" />
    <P x={5} y={5} w={6} h={5} c="#ef4444" />
    <P x={7} y={2} w={2} h={2} c="#f97316" />
    <P x={4} y={7} w={2} h={4} c="#f97316" />
    <P x={10} y={7} w={2} h={4} c="#f97316" />
    {/* Inner flame */}
    <P x={7} y={6} w={2} h={4} c="#fbbf24" />
    <P x={6} y={8} w={4} h={2} c="#fef08a" />
    {/* Base */}
    <P x={4} y={12} w={8} h={2} c="#78350f" />
  </IconWrapper>
);

export const BleedIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Blood drops */}
    <P x={3} y={2} w={3} h={4} c="#dc2626" />
    <P x={4} y={1} w={1} h={1} c="#dc2626" />
    <P x={7} y={4} w={3} h={5} c="#dc2626" />
    <P x={8} y={3} w={1} h={1} c="#dc2626" />
    <P x={11} y={3} w={3} h={4} c="#dc2626" />
    <P x={12} y={2} w={1} h={1} c="#dc2626" />
    {/* Drips */}
    <P x={4} y={8} w={2} h={3} c="#b91c1c" />
    <P x={8} y={10} w={2} h={3} c="#b91c1c" />
    <P x={12} y={9} w={2} h={3} c="#b91c1c" />
  </IconWrapper>
);

// === CONTROL EFFECTS ===

export const StunIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Stars */}
    <P x={2} y={3} w={3} h={3} c="#fbbf24" />
    <P x={3} y={2} w={1} h={1} c="#fbbf24" />
    <P x={3} y={6} w={1} h={1} c="#fbbf24" />
    <P x={1} y={4} w={1} h={1} c="#fbbf24" />
    <P x={5} y={4} w={1} h={1} c="#fbbf24" />

    <P x={8} y={1} w={3} h={3} c="#fef08a" />
    <P x={9} y={0} w={1} h={1} c="#fef08a" />
    <P x={9} y={4} w={1} h={1} c="#fef08a" />
    <P x={7} y={2} w={1} h={1} c="#fef08a" />
    <P x={11} y={2} w={1} h={1} c="#fef08a" />

    <P x={11} y={6} w={3} h={3} c="#fbbf24" />
    <P x={12} y={5} w={1} h={1} c="#fbbf24" />
    <P x={12} y={9} w={1} h={1} c="#fbbf24" />
    <P x={10} y={7} w={1} h={1} c="#fbbf24" />
    <P x={14} y={7} w={1} h={1} c="#fbbf24" />

    {/* Swirl effect */}
    <P x={5} y={8} w={6} h={5} c="#9ca3af" />
    <P x={6} y={9} w={4} h={3} c="#d1d5db" />
  </IconWrapper>
);

export const SlowIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Snail shell */}
    <P x={4} y={4} w={8} h={8} c="#78350f" />
    <P x={5} y={5} w={6} h={6} c="#92400e" />
    <P x={6} y={6} w={4} h={4} c="#78350f" />
    <P x={7} y={7} w={2} h={2} c="#92400e" />
    {/* Body */}
    <P x={2} y={10} w={4} h={3} c="#fde68a" />
    <P x={1} y={11} w={2} h={2} c="#fde68a" />
    {/* Eye stalks */}
    <P x={2} y={8} w={1} h={2} c="#fde68a" />
    <P x={4} y={8} w={1} h={2} c="#fde68a" />
    <P x={2} y={7} w={1} h={1} c="#1f2937" />
    <P x={4} y={7} w={1} h={1} c="#1f2937" />
    {/* Trail */}
    <P x={10} y={13} w={4} h={1} c="#a3a3a3" />
  </IconWrapper>
);

export const FreezeIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Ice crystal */}
    <P x={7} y={1} w={2} h={14} c="#06b6d4" />
    <P x={1} y={7} w={14} h={2} c="#06b6d4" />
    {/* Diagonal arms */}
    <P x={3} y={3} w={2} h={2} c="#22d3ee" />
    <P x={5} y={5} w={2} h={2} c="#22d3ee" />
    <P x={11} y={3} w={2} h={2} c="#22d3ee" />
    <P x={9} y={5} w={2} h={2} c="#22d3ee" />
    <P x={3} y={11} w={2} h={2} c="#22d3ee" />
    <P x={5} y={9} w={2} h={2} c="#22d3ee" />
    <P x={11} y={11} w={2} h={2} c="#22d3ee" />
    <P x={9} y={9} w={2} h={2} c="#22d3ee" />
    {/* Center */}
    <P x={6} y={6} w={4} h={4} c="#a5f3fc" />
  </IconWrapper>
);

export const RootIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Vines */}
    <P x={3} y={8} w={2} h={6} c="#22c55e" />
    <P x={6} y={9} w={2} h={5} c="#16a34a" />
    <P x={9} y={8} w={2} h={6} c="#22c55e" />
    <P x={11} y={10} w={2} h={4} c="#16a34a" />
    <P x={1} y={10} w={2} h={4} c="#16a34a" />
    {/* Wrapped figure */}
    <P x={5} y={3} w={6} h={6} c="#9ca3af" />
    <P x={6} y={4} w={4} h={4} c="#d1d5db" />
    {/* Vine wraps */}
    <P x={4} y={5} w={8} h={1} c="#22c55e" />
    <P x={4} y={7} w={8} h={1} c="#22c55e" />
    {/* Leaves */}
    <P x={2} y={6} w={2} h={2} c="#4ade80" />
    <P x={12} y={4} w={2} h={2} c="#4ade80" />
  </IconWrapper>
);

// === DEBUFFS ===

export const WeaknessIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Broken sword */}
    <P x={3} y={2} w={2} h={4} c="#9ca3af" />
    <P x={5} y={4} w={2} h={2} c="#9ca3af" />
    {/* Break point */}
    <P x={6} y={5} w={2} h={2} c="#ef4444" />
    {/* Separated piece */}
    <P x={9} y={8} w={2} h={4} c="#6b7280" />
    <P x={10} y={12} w={2} h={2} c="#78350f" />
    {/* Downward arrow */}
    <P x={11} y={2} w={2} h={4} c="#ef4444" />
    <P x={10} y={6} w={4} h={2} c="#ef4444" />
    <P x={11} y={8} w={2} h={2} c="#ef4444" />
  </IconWrapper>
);

export const VulnerableIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Target */}
    <P x={3} y={3} w={10} h={10} c="#f97316" />
    <P x={4} y={4} w={8} h={8} c="#1f2937" />
    <P x={5} y={5} w={6} h={6} c="#f97316" />
    <P x={6} y={6} w={4} h={4} c="#1f2937" />
    <P x={7} y={7} w={2} h={2} c="#ef4444" />
    {/* Crack lines */}
    <P x={2} y={7} w={2} h={2} c="#ef4444" />
    <P x={12} y={7} w={2} h={2} c="#ef4444" />
    <P x={7} y={2} w={2} h={2} c="#ef4444" />
    <P x={7} y={12} w={2} h={2} c="#ef4444" />
  </IconWrapper>
);

export const BlindIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Eye with slash */}
    <P x={2} y={5} w={12} h={6} c="#e5e7eb" />
    <P x={3} y={6} w={10} h={4} c="#1f2937" />
    <P x={5} y={7} w={6} h={2} c="#60a5fa" />
    <P x={7} y={7} w={2} h={2} c="#1f2937" />
    {/* Slash */}
    <P x={2} y={2} w={2} h={2} c="#ef4444" />
    <P x={4} y={4} w={2} h={2} c="#ef4444" />
    <P x={6} y={6} w={2} h={2} c="#ef4444" />
    <P x={8} y={8} w={2} h={2} c="#ef4444" />
    <P x={10} y={10} w={2} h={2} c="#ef4444" />
    <P x={12} y={12} w={2} h={2} c="#ef4444" />
  </IconWrapper>
);

export const CursedIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Dark aura */}
    <P x={3} y={3} w={10} h={10} c="#581c87" />
    <P x={4} y={4} w={8} h={8} c="#7c3aed" />
    {/* Skull */}
    <P x={5} y={5} w={6} h={5} c="#e5e7eb" />
    <P x={6} y={6} w={1} h={2} c="#1f2937" />
    <P x={9} y={6} w={1} h={2} c="#1f2937" />
    <P x={6} y={9} w={4} h={1} c="#1f2937" />
    {/* Evil eyes */}
    <P x={6} y={6} w={1} h={1} c="#a855f7" />
    <P x={9} y={6} w={1} h={1} c="#a855f7" />
    {/* Dark wisps */}
    <P x={1} y={5} w={2} h={3} c="#4c1d95" />
    <P x={13} y={5} w={2} h={3} c="#4c1d95" />
  </IconWrapper>
);

// === BUFFS ===

export const RegenerationIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Heart */}
    <P x={3} y={4} w={4} h={4} c="#22c55e" />
    <P x={9} y={4} w={4} h={4} c="#22c55e" />
    <P x={4} y={3} w={2} h={1} c="#22c55e" />
    <P x={10} y={3} w={2} h={1} c="#22c55e" />
    <P x={3} y={8} w={10} h={2} c="#22c55e" />
    <P x={4} y={10} w={8} h={2} c="#22c55e" />
    <P x={6} y={12} w={4} h={1} c="#22c55e" />
    <P x={7} y={13} w={2} h={1} c="#22c55e" />
    {/* Plus sign */}
    <P x={7} y={5} w={2} h={5} c="#4ade80" />
    <P x={5} y={7} w={6} h={2} c="#4ade80" />
    {/* Sparkles */}
    <P x={1} y={2} w={2} h={2} c="#fef08a" />
    <P x={13} y={2} w={2} h={2} c="#fef08a" />
  </IconWrapper>
);

export const FortifyIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Shield */}
    <P x={3} y={2} w={10} h={11} c="#6366f1" />
    <P x={4} y={3} w={8} h={9} c="#818cf8" />
    {/* Reinforced pattern */}
    <P x={5} y={4} w={6} h={2} c="#a5b4fc" />
    <P x={6} y={6} w={4} h={4} c="#a5b4fc" />
    <P x={7} y={7} w={2} h={2} c="#c7d2fe" />
    {/* Bottom point */}
    <P x={4} y={13} w={2} h={1} c="#6366f1" />
    <P x={10} y={13} w={2} h={1} c="#6366f1" />
  </IconWrapper>
);

export const HasteIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Lightning bolt */}
    <P x={8} y={1} w={3} h={2} c="#fbbf24" />
    <P x={6} y={3} w={4} h={2} c="#fbbf24" />
    <P x={5} y={5} w={5} h={2} c="#fef08a" />
    <P x={7} y={7} w={3} h={2} c="#fbbf24" />
    <P x={6} y={9} w={4} h={2} c="#fef08a" />
    <P x={4} y={11} w={4} h={2} c="#fbbf24" />
    <P x={3} y={13} w={3} h={2} c="#fbbf24" />
    {/* Speed lines */}
    <P x={1} y={4} w={3} h={1} c="#9ca3af" />
    <P x={1} y={7} w={2} h={1} c="#9ca3af" />
    <P x={1} y={10} w={3} h={1} c="#9ca3af" />
  </IconWrapper>
);

export const MightIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Flexing arm */}
    <P x={4} y={5} w={3} h={6} c="#fde68a" />
    <P x={7} y={3} w={5} h={3} c="#fde68a" />
    <P x={10} y={6} w={3} h={3} c="#fde68a" />
    <P x={7} y={6} w={3} h={2} c="#fde68a" />
    {/* Muscle bulge */}
    <P x={8} y={4} w={3} h={2} c="#fbbf24" />
    {/* Power effect */}
    <P x={2} y={2} w={2} h={2} c="#ef4444" />
    <P x={12} y={1} w={2} h={2} c="#ef4444" />
    <P x={12} y={10} w={2} h={2} c="#ef4444" />
    {/* Hand */}
    <P x={10} y={8} w={3} h={4} c="#fde68a" />
  </IconWrapper>
);

export const InvisibleIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Ghost outline */}
    <P x={4} y={3} w={8} h={10} c="#a1a1aa" />
    <P x={5} y={2} w={6} h={1} c="#a1a1aa" />
    {/* Transparent interior */}
    <P x={5} y={4} w={6} h={8} c="#d4d4d8" />
    {/* Dotted outline effect */}
    <P x={3} y={5} w={1} h={2} c="#e5e5e5" />
    <P x={12} y={5} w={1} h={2} c="#e5e5e5" />
    <P x={3} y={9} w={1} h={2} c="#e5e5e5" />
    <P x={12} y={9} w={1} h={2} c="#e5e5e5" />
    {/* Wavy bottom */}
    <P x={4} y={13} w={2} h={1} c="#a1a1aa" />
    <P x={7} y={14} w={2} h={1} c="#a1a1aa" />
    <P x={10} y={13} w={2} h={1} c="#a1a1aa" />
    {/* Eyes */}
    <P x={6} y={6} w={1} h={2} c="#6b7280" />
    <P x={9} y={6} w={1} h={2} c="#6b7280" />
  </IconWrapper>
);

// Status effect mapping
export const STATUS_ICONS = {
  poison: PoisonIcon,
  burn: BurnIcon,
  bleed: BleedIcon,
  stun: StunIcon,
  slow: SlowIcon,
  freeze: FreezeIcon,
  root: RootIcon,
  weakness: WeaknessIcon,
  vulnerable: VulnerableIcon,
  blind: BlindIcon,
  cursed: CursedIcon,
  regeneration: RegenerationIcon,
  fortify: FortifyIcon,
  haste: HasteIcon,
  might: MightIcon,
  invisible: InvisibleIcon,
};

// Helper component to render status effect icon by ID
export const StatusEffectIcon = ({ effectId, size = 32, className = '' }) => {
  const IconComponent = STATUS_ICONS[effectId];
  if (!IconComponent) {
    // Fallback
    return <PoisonIcon size={size} className={className} />;
  }
  return <IconComponent size={size} className={className} />;
};

export default StatusEffectIcon;
