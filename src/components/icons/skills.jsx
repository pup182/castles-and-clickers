// Skill SVG sprites - pixel art style
// All skills are 16x16 grid

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

// === COMBAT SKILLS ===

export const PowerStrikeIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Sword */}
    <P x={3} y={2} w={2} h={2} c="#fbbf24" />
    <P x={5} y={4} w={2} h={2} c="#9ca3af" />
    <P x={7} y={6} w={2} h={2} c="#9ca3af" />
    <P x={9} y={8} w={2} h={2} c="#9ca3af" />
    <P x={11} y={10} w={2} h={4} c="#78350f" />
    {/* Impact lines */}
    <P x={1} y={4} w={2} h={1} c="#fbbf24" />
    <P x={2} y={6} w={1} h={1} c="#fbbf24" />
    <P x={6} y={2} w={1} h={2} c="#fbbf24" />
  </IconWrapper>
);

export const CleaveIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Axe blade */}
    <P x={2} y={3} w={6} h={1} c="#9ca3af" />
    <P x={3} y={4} w={5} h={1} c="#9ca3af" />
    <P x={4} y={5} w={4} h={1} c="#9ca3af" />
    <P x={5} y={6} w={3} h={1} c="#9ca3af" />
    <P x={6} y={7} w={2} h={1} c="#6b7280" />
    {/* Handle */}
    <P x={7} y={8} w={2} h={6} c="#78350f" />
    {/* Arc effect */}
    <P x={1} y={5} w={1} h={3} c="#ef4444" />
    <P x={9} y={2} w={1} h={3} c="#ef4444" />
    <P x={10} y={4} w={1} h={2} c="#ef4444" />
  </IconWrapper>
);

export const ShieldBashIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Shield */}
    <P x={3} y={2} w={8} h={10} c="#3b82f6" />
    <P x={4} y={3} w={6} h={8} c="#60a5fa" />
    <P x={6} y={5} w={2} h={4} c="#fbbf24" />
    {/* Impact */}
    <P x={11} y={4} w={2} h={1} c="#fbbf24" />
    <P x={12} y={6} w={2} h={1} c="#fbbf24" />
    <P x={11} y={8} w={2} h={1} c="#fbbf24" />
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
    {/* Mouth */}
    <P x={6} y={9} w={4} h={2} c="#1f2937" />
  </IconWrapper>
);

// === MAGIC SKILLS ===

export const FireballIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Flame core */}
    <P x={6} y={4} w={4} h={6} c="#ef4444" />
    <P x={5} y={6} w={6} h={4} c="#ef4444" />
    {/* Inner flame */}
    <P x={7} y={6} w={2} h={4} c="#fbbf24" />
    <P x={6} y={7} w={4} h={2} c="#f97316" />
    {/* Outer flames */}
    <P x={5} y={3} w={2} h={2} c="#f97316" />
    <P x={9} y={3} w={2} h={2} c="#f97316" />
    <P x={4} y={5} w={1} h={3} c="#f97316" />
    <P x={11} y={5} w={1} h={3} c="#f97316" />
    {/* Trail */}
    <P x={6} y={11} w={4} h={2} c="#fbbf24" />
    <P x={7} y={13} w={2} h={1} c="#f97316" />
  </IconWrapper>
);

export const FrostNovaIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Center crystal */}
    <P x={6} y={5} w={4} h={6} c="#06b6d4" />
    <P x={7} y={4} w={2} h={1} c="#22d3ee" />
    <P x={7} y={11} w={2} h={1} c="#22d3ee" />
    {/* Ice spikes */}
    <P x={3} y={7} w={3} h={2} c="#67e8f9" />
    <P x={10} y={7} w={3} h={2} c="#67e8f9" />
    <P x={7} y={2} w={2} h={3} c="#67e8f9" />
    <P x={4} y={4} w={2} h={2} c="#a5f3fc" />
    <P x={10} y={4} w={2} h={2} c="#a5f3fc" />
    <P x={4} y={10} w={2} h={2} c="#a5f3fc" />
    <P x={10} y={10} w={2} h={2} c="#a5f3fc" />
  </IconWrapper>
);

export const MeteorIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Meteor body */}
    <P x={8} y={2} w={5} h={5} c="#78350f" />
    <P x={9} y={3} w={3} h={3} c="#92400e" />
    {/* Fire trail */}
    <P x={5} y={5} w={3} h={2} c="#ef4444" />
    <P x={3} y={6} w={3} h={2} c="#f97316" />
    <P x={1} y={7} w={3} h={2} c="#fbbf24" />
    <P x={6} y={7} w={2} h={2} c="#ef4444" />
    {/* Impact zone */}
    <P x={9} y={10} w={4} h={3} c="#dc2626" />
    <P x={10} y={11} w={2} h={2} c="#fbbf24" />
  </IconWrapper>
);

export const LightningBoltIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Lightning bolt */}
    <P x={8} y={1} w={3} h={2} c="#fbbf24" />
    <P x={6} y={3} w={4} h={2} c="#fbbf24" />
    <P x={5} y={5} w={5} h={2} c="#fef08a" />
    <P x={7} y={7} w={3} h={2} c="#fbbf24" />
    <P x={6} y={9} w={4} h={2} c="#fef08a" />
    <P x={4} y={11} w={4} h={2} c="#fbbf24" />
    <P x={3} y={13} w={3} h={2} c="#fbbf24" />
  </IconWrapper>
);

export const ChainLightningIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Multiple bolts */}
    <P x={2} y={2} w={2} h={3} c="#fbbf24" />
    <P x={4} y={4} w={2} h={2} c="#fef08a" />
    <P x={6} y={5} w={2} h={2} c="#fbbf24" />
    <P x={8} y={6} w={2} h={2} c="#fef08a" />
    <P x={10} y={7} w={2} h={2} c="#fbbf24" />
    <P x={12} y={8} w={2} h={3} c="#fbbf24" />
    {/* Branch */}
    <P x={6} y={8} w={2} h={2} c="#fbbf24" />
    <P x={4} y={10} w={2} h={2} c="#fef08a" />
    <P x={2} y={12} w={2} h={2} c="#fbbf24" />
  </IconWrapper>
);

export const InfernoIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Central inferno */}
    <P x={5} y={3} w={6} h={10} c="#dc2626" />
    <P x={6} y={4} w={4} h={8} c="#ef4444" />
    <P x={7} y={5} w={2} h={6} c="#fbbf24" />
    {/* Side flames */}
    <P x={2} y={5} w={3} h={6} c="#f97316" />
    <P x={11} y={5} w={3} h={6} c="#f97316" />
    <P x={3} y={3} w={2} h={3} c="#ef4444" />
    <P x={11} y={3} w={2} h={3} c="#ef4444" />
    {/* Top flames */}
    <P x={6} y={1} w={1} h={2} c="#fbbf24" />
    <P x={8} y={1} w={2} h={2} c="#f97316" />
  </IconWrapper>
);

// === ROGUE SKILLS ===

export const BackstabIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Dagger */}
    <P x={7} y={1} w={2} h={4} c="#9ca3af" />
    <P x={6} y={5} w={4} h={2} c="#78350f" />
    <P x={7} y={7} w={2} h={2} c="#78350f" />
    {/* Shadow figure */}
    <P x={2} y={6} w={4} h={6} c="#1f2937" />
    <P x={3} y={4} w={2} h={2} c="#1f2937" />
    {/* Blood */}
    <P x={10} y={8} w={2} h={2} c="#dc2626" />
    <P x={11} y={10} w={2} h={2} c="#dc2626" />
  </IconWrapper>
);

export const SmokeBombIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Smoke cloud */}
    <P x={3} y={4} w={10} h={8} c="#6b7280" />
    <P x={4} y={3} w={8} h={1} c="#9ca3af" />
    <P x={5} y={2} w={6} h={1} c="#9ca3af" />
    <P x={2} y={6} w={2} h={4} c="#9ca3af" />
    <P x={12} y={6} w={2} h={4} c="#9ca3af" />
    {/* Bomb */}
    <P x={6} y={10} w={4} h={3} c="#1f2937" />
    <P x={7} y={9} w={2} h={1} c="#78350f" />
  </IconWrapper>
);

export const FanOfKnivesIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Multiple knives */}
    <P x={7} y={2} w={2} h={5} c="#9ca3af" />
    <P x={3} y={4} w={4} h={1} c="#9ca3af" />
    <P x={2} y={5} w={3} h={1} c="#9ca3af" />
    <P x={9} y={4} w={4} h={1} c="#9ca3af" />
    <P x={11} y={5} w={3} h={1} c="#9ca3af" />
    <P x={4} y={7} w={3} h={1} c="#9ca3af" />
    <P x={9} y={7} w={3} h={1} c="#9ca3af" />
    {/* Center */}
    <P x={6} y={8} w={4} h={4} c="#1f2937" />
  </IconWrapper>
);

export const AssassinateIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Skull */}
    <P x={4} y={2} w={8} h={7} c="#e5e7eb" />
    <P x={5} y={3} w={2} h={3} c="#1f2937" />
    <P x={9} y={3} w={2} h={3} c="#1f2937" />
    <P x={6} y={7} w={4} h={1} c="#1f2937" />
    {/* Crossed daggers */}
    <P x={2} y={9} w={5} h={1} c="#9ca3af" />
    <P x={9} y={9} w={5} h={1} c="#9ca3af" />
    <P x={1} y={10} w={3} h={1} c="#9ca3af" />
    <P x={12} y={10} w={3} h={1} c="#9ca3af" />
    <P x={6} y={11} w={4} h={1} c="#dc2626" />
  </IconWrapper>
);

export const DeadlyPoisonIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Poison bottle */}
    <P x={5} y={2} w={6} h={2} c="#78350f" />
    <P x={6} y={1} w={4} h={1} c="#78350f" />
    <P x={4} y={4} w={8} h={8} c="#22c55e" />
    <P x={5} y={5} w={6} h={6} c="#4ade80" />
    {/* Skull symbol */}
    <P x={6} y={6} w={4} h={3} c="#1f2937" />
    <P x={7} y={7} w={1} h={1} c="#22c55e" />
    <P x={9} y={7} w={1} h={1} c="#22c55e" />
    {/* Drips */}
    <P x={4} y={12} w={2} h={2} c="#22c55e" />
    <P x={10} y={12} w={2} h={2} c="#22c55e" />
  </IconWrapper>
);

export const DeathBlossomIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Flower petals */}
    <P x={6} y={1} w={4} h={4} c="#f472b6" />
    <P x={1} y={6} w={4} h={4} c="#f472b6" />
    <P x={11} y={6} w={4} h={4} c="#f472b6" />
    <P x={6} y={11} w={4} h={4} c="#f472b6" />
    {/* Center */}
    <P x={5} y={5} w={6} h={6} c="#1f2937" />
    <P x={6} y={6} w={4} h={4} c="#dc2626" />
    {/* Blades */}
    <P x={3} y={3} w={2} h={2} c="#9ca3af" />
    <P x={11} y={3} w={2} h={2} c="#9ca3af" />
    <P x={3} y={11} w={2} h={2} c="#9ca3af" />
    <P x={11} y={11} w={2} h={2} c="#9ca3af" />
  </IconWrapper>
);

// === HEALER SKILLS ===

export const HealIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Heart */}
    <P x={3} y={4} w={4} h={4} c="#22c55e" />
    <P x={9} y={4} w={4} h={4} c="#22c55e" />
    <P x={4} y={3} w={2} h={1} c="#22c55e" />
    <P x={10} y={3} w={2} h={1} c="#22c55e" />
    <P x={3} y={8} w={10} h={2} c="#22c55e" />
    <P x={4} y={10} w={8} h={2} c="#22c55e" />
    <P x={5} y={12} w={6} h={1} c="#22c55e" />
    <P x={6} y={13} w={4} h={1} c="#22c55e" />
    <P x={7} y={14} w={2} h={1} c="#22c55e" />
    {/* Glow */}
    <P x={7} y={6} w={2} h={4} c="#4ade80" />
    <P x={6} y={7} w={4} h={2} c="#4ade80" />
  </IconWrapper>
);

export const RevitalizeIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Multiple hearts */}
    <P x={2} y={3} w={3} h={3} c="#f472b6" />
    <P x={3} y={2} w={1} h={1} c="#f472b6" />
    <P x={2} y={6} w={3} h={2} c="#f472b6" />
    <P x={3} y={8} w={1} h={1} c="#f472b6" />
    {/* Main heart */}
    <P x={6} y={5} w={4} h={4} c="#22c55e" />
    <P x={7} y={4} w={2} h={1} c="#22c55e" />
    <P x={6} y={9} w={4} h={2} c="#22c55e" />
    <P x={7} y={11} w={2} h={1} c="#22c55e" />
    {/* Sparkles */}
    <P x={11} y={3} w={2} h={2} c="#fbbf24" />
    <P x={12} y={7} w={2} h={2} c="#fbbf24" />
    <P x={10} y={11} w={2} h={2} c="#fbbf24" />
  </IconWrapper>
);

export const DivineShieldIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Shield */}
    <P x={3} y={2} w={10} h={11} c="#3b82f6" />
    <P x={4} y={3} w={8} h={9} c="#60a5fa" />
    {/* Cross */}
    <P x={7} y={4} w={2} h={7} c="#fbbf24" />
    <P x={5} y={6} w={6} h={2} c="#fbbf24" />
    {/* Glow */}
    <P x={4} y={13} w={2} h={1} c="#93c5fd" />
    <P x={10} y={13} w={2} h={1} c="#93c5fd" />
  </IconWrapper>
);

export const SmiteIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Holy light beam */}
    <P x={6} y={1} w={4} h={3} c="#fef08a" />
    <P x={5} y={4} w={6} h={4} c="#fbbf24" />
    <P x={4} y={8} w={8} h={3} c="#f59e0b" />
    {/* Impact */}
    <P x={3} y={11} w={10} h={2} c="#fbbf24" />
    <P x={5} y={13} w={6} h={1} c="#fef08a" />
    {/* Side rays */}
    <P x={2} y={6} w={2} h={1} c="#fef08a" />
    <P x={12} y={6} w={2} h={1} c="#fef08a" />
  </IconWrapper>
);

export const HolyNovaIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Central burst */}
    <P x={6} y={6} w={4} h={4} c="#fef08a" />
    {/* Rays */}
    <P x={7} y={2} w={2} h={4} c="#fbbf24" />
    <P x={7} y={10} w={2} h={4} c="#fbbf24" />
    <P x={2} y={7} w={4} h={2} c="#fbbf24" />
    <P x={10} y={7} w={4} h={2} c="#fbbf24" />
    {/* Diagonal rays */}
    <P x={3} y={3} w={3} h={3} c="#f59e0b" />
    <P x={10} y={3} w={3} h={3} c="#f59e0b" />
    <P x={3} y={10} w={3} h={3} c="#f59e0b" />
    <P x={10} y={10} w={3} h={3} c="#f59e0b" />
  </IconWrapper>
);

export const ResurrectionIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Angel wings */}
    <P x={1} y={4} w={3} h={6} c="#e5e7eb" />
    <P x={12} y={4} w={3} h={6} c="#e5e7eb" />
    <P x={2} y={3} w={2} h={2} c="#d1d5db" />
    <P x={12} y={3} w={2} h={2} c="#d1d5db" />
    {/* Figure */}
    <P x={6} y={2} w={4} h={4} c="#fef08a" />
    <P x={5} y={6} w={6} h={6} c="#fbbf24" />
    {/* Halo */}
    <P x={6} y={0} w={4} h={1} c="#fbbf24" />
    <P x={5} y={1} w={1} h={1} c="#fef08a" />
    <P x={10} y={1} w={1} h={1} c="#fef08a" />
    {/* Rising effect */}
    <P x={4} y={12} w={2} h={2} c="#a5f3fc" />
    <P x={10} y={12} w={2} h={2} c="#a5f3fc" />
  </IconWrapper>
);

// === RANGER SKILLS ===

export const AimedShotIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Target reticle */}
    <P x={5} y={5} w={6} h={6} c="#ef4444" />
    <P x={6} y={6} w={4} h={4} c="#1f2937" />
    <P x={7} y={7} w={2} h={2} c="#ef4444" />
    {/* Crosshairs */}
    <P x={7} y={2} w={2} h={3} c="#ef4444" />
    <P x={7} y={11} w={2} h={3} c="#ef4444" />
    <P x={2} y={7} w={3} h={2} c="#ef4444" />
    <P x={11} y={7} w={3} h={2} c="#ef4444" />
    {/* Arrow */}
    <P x={12} y={3} w={2} h={1} c="#78350f" />
    <P x={13} y={2} w={1} h={3} c="#78350f" />
  </IconWrapper>
);

export const MultishotIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Multiple arrows */}
    <P x={2} y={4} w={8} h={1} c="#78350f" />
    <P x={1} y={3} w={2} h={3} c="#9ca3af" />
    <P x={2} y={7} w={8} h={1} c="#78350f" />
    <P x={1} y={6} w={2} h={3} c="#9ca3af" />
    <P x={2} y={10} w={8} h={1} c="#78350f" />
    <P x={1} y={9} w={2} h={3} c="#9ca3af" />
    {/* Fletching */}
    <P x={9} y={3} w={3} h={1} c="#dc2626" />
    <P x={9} y={5} w={3} h={1} c="#dc2626" />
    <P x={9} y={6} w={3} h={1} c="#dc2626" />
    <P x={9} y={8} w={3} h={1} c="#dc2626" />
    <P x={9} y={9} w={3} h={1} c="#dc2626" />
    <P x={9} y={11} w={3} h={1} c="#dc2626" />
  </IconWrapper>
);

export const TrapIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Bear trap */}
    <P x={2} y={8} w={12} h={2} c="#78716c" />
    <P x={3} y={6} w={2} h={2} c="#9ca3af" />
    <P x={5} y={5} w={2} h={3} c="#9ca3af" />
    <P x={7} y={4} w={2} h={4} c="#9ca3af" />
    <P x={9} y={5} w={2} h={3} c="#9ca3af" />
    <P x={11} y={6} w={2} h={2} c="#9ca3af" />
    {/* Teeth */}
    <P x={4} y={7} w={1} h={2} c="#ef4444" />
    <P x={6} y={7} w={1} h={2} c="#ef4444" />
    <P x={8} y={7} w={1} h={2} c="#ef4444" />
    <P x={10} y={7} w={1} h={2} c="#ef4444" />
    {/* Chain */}
    <P x={6} y={10} w={4} h={1} c="#78716c" />
    <P x={7} y={11} w={2} h={2} c="#57534e" />
  </IconWrapper>
);

export const RapidFireIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Speed lines */}
    <P x={1} y={4} w={4} h={1} c="#fbbf24" />
    <P x={1} y={7} w={3} h={1} c="#fbbf24" />
    <P x={1} y={10} w={4} h={1} c="#fbbf24" />
    {/* Arrows */}
    <P x={5} y={3} w={6} h={1} c="#78350f" />
    <P x={4} y={2} w={2} h={3} c="#9ca3af" />
    <P x={5} y={6} w={7} h={1} c="#78350f" />
    <P x={4} y={5} w={2} h={3} c="#9ca3af" />
    <P x={5} y={9} w={6} h={1} c="#78350f" />
    <P x={4} y={8} w={2} h={3} c="#9ca3af" />
    {/* Bow */}
    <P x={12} y={4} w={2} h={6} c="#78350f" />
  </IconWrapper>
);

export const VolleyIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Rain of arrows */}
    <P x={2} y={1} w={1} h={4} c="#78350f" />
    <P x={5} y={2} w={1} h={4} c="#78350f" />
    <P x={8} y={1} w={1} h={4} c="#78350f" />
    <P x={11} y={2} w={1} h={4} c="#78350f" />
    <P x={3} y={5} w={1} h={4} c="#78350f" />
    <P x={6} y={6} w={1} h={4} c="#78350f" />
    <P x={9} y={5} w={1} h={4} c="#78350f" />
    <P x={12} y={6} w={1} h={4} c="#78350f" />
    {/* Arrowheads */}
    <P x={1} y={5} w={3} h={1} c="#9ca3af" />
    <P x={4} y={6} w={3} h={1} c="#9ca3af" />
    <P x={7} y={5} w={3} h={1} c="#9ca3af" />
    <P x={10} y={6} w={3} h={1} c="#9ca3af" />
    {/* Ground impact */}
    <P x={2} y={12} w={12} h={2} c="#78716c" />
  </IconWrapper>
);

// === NECROMANCER SKILLS ===

export const DrainLifeIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Dark energy stream */}
    <P x={2} y={6} w={3} h={3} c="#7f1d1d" />
    <P x={5} y={7} w={3} h={2} c="#dc2626" />
    <P x={8} y={6} w={3} h={3} c="#dc2626" />
    <P x={11} y={6} w={3} h={3} c="#ef4444" />
    {/* Source (victim) */}
    <P x={12} y={3} w={3} h={3} c="#e5e7eb" />
    {/* Destination (caster) */}
    <P x={1} y={3} w={3} h={3} c="#581c87" />
    {/* Blood drops */}
    <P x={6} y={10} w={2} h={2} c="#dc2626" />
    <P x={9} y={11} w={2} h={2} c="#dc2626" />
  </IconWrapper>
);

export const CorpseExplosionIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Explosion */}
    <P x={5} y={4} w={6} h={6} c="#dc2626" />
    <P x={6} y={5} w={4} h={4} c="#f97316" />
    <P x={7} y={6} w={2} h={2} c="#fbbf24" />
    {/* Debris */}
    <P x={2} y={3} w={2} h={2} c="#e5e7eb" />
    <P x={12} y={3} w={2} h={2} c="#e5e7eb" />
    <P x={2} y={11} w={2} h={2} c="#e5e7eb" />
    <P x={12} y={11} w={2} h={2} c="#e5e7eb" />
    <P x={4} y={1} w={2} h={2} c="#d1d5db" />
    <P x={10} y={1} w={2} h={2} c="#d1d5db" />
  </IconWrapper>
);

export const PlagueIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Plague cloud */}
    <P x={3} y={4} w={10} h={8} c="#22c55e" />
    <P x={4} y={3} w={8} h={1} c="#4ade80" />
    <P x={5} y={2} w={6} h={1} c="#4ade80" />
    {/* Skulls */}
    <P x={4} y={6} w={3} h={3} c="#e5e7eb" />
    <P x={5} y={7} w={1} h={1} c="#1f2937" />
    <P x={9} y={6} w={3} h={3} c="#e5e7eb" />
    <P x={10} y={7} w={1} h={1} c="#1f2937" />
    {/* Drips */}
    <P x={3} y={12} w={2} h={2} c="#22c55e" />
    <P x={7} y={12} w={2} h={3} c="#22c55e" />
    <P x={11} y={12} w={2} h={2} c="#22c55e" />
  </IconWrapper>
);

export const LichFormIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Skull */}
    <P x={4} y={2} w={8} h={6} c="#e5e7eb" />
    <P x={5} y={3} w={2} h={2} c="#a855f7" />
    <P x={9} y={3} w={2} h={2} c="#a855f7" />
    <P x={6} y={6} w={4} h={1} c="#1f2937" />
    {/* Crown */}
    <P x={4} y={0} w={8} h={2} c="#fbbf24" />
    <P x={5} y={-1} w={2} h={1} c="#fbbf24" />
    <P x={9} y={-1} w={2} h={1} c="#fbbf24" />
    {/* Robe */}
    <P x={3} y={8} w={10} h={6} c="#581c87" />
    <P x={4} y={9} w={8} h={4} c="#7c3aed" />
  </IconWrapper>
);

// === DRUID / SHAMAN SKILLS ===

export const RejuvenationIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Leaf */}
    <P x={4} y={3} w={8} h={8} c="#22c55e" />
    <P x={5} y={4} w={6} h={6} c="#4ade80" />
    {/* Vein */}
    <P x={7} y={4} w={2} h={6} c="#16a34a" />
    <P x={5} y={6} w={6} h={2} c="#16a34a" />
    {/* Sparkles */}
    <P x={2} y={2} w={2} h={2} c="#fef08a" />
    <P x={12} y={2} w={2} h={2} c="#fef08a" />
    <P x={2} y={11} w={2} h={2} c="#fef08a" />
    <P x={12} y={11} w={2} h={2} c="#fef08a" />
  </IconWrapper>
);

export const WildGrowthIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Tree */}
    <P x={5} y={2} w={6} h={8} c="#22c55e" />
    <P x={4} y={4} w={8} h={4} c="#4ade80" />
    <P x={3} y={6} w={10} h={2} c="#22c55e" />
    {/* Trunk */}
    <P x={7} y={10} w={2} h={4} c="#78350f" />
    {/* Roots */}
    <P x={5} y={13} w={2} h={1} c="#78350f" />
    <P x={9} y={13} w={2} h={1} c="#78350f" />
    {/* Growth sparkles */}
    <P x={2} y={3} w={2} h={2} c="#fbbf24" />
    <P x={12} y={3} w={2} h={2} c="#fbbf24" />
  </IconWrapper>
);

export const TreeOfLifeIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Large tree */}
    <P x={4} y={1} w={8} h={9} c="#22c55e" />
    <P x={3} y={3} w={10} h={5} c="#4ade80" />
    <P x={5} y={2} w={6} h={2} c="#86efac" />
    {/* Trunk */}
    <P x={6} y={10} w={4} h={5} c="#78350f" />
    {/* Healing aura */}
    <P x={2} y={5} w={2} h={3} c="#fef08a" />
    <P x={12} y={5} w={2} h={3} c="#fef08a" />
    {/* Roots */}
    <P x={4} y={14} w={2} h={1} c="#78350f" />
    <P x={10} y={14} w={2} h={1} c="#78350f" />
  </IconWrapper>
);

export const SpiritLinkIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Spirits */}
    <P x={2} y={4} w={4} h={5} c="#a5b4fc" />
    <P x={3} y={3} w={2} h={1} c="#c7d2fe" />
    <P x={10} y={4} w={4} h={5} c="#a5b4fc" />
    <P x={11} y={3} w={2} h={1} c="#c7d2fe" />
    {/* Link chain */}
    <P x={6} y={5} w={4} h={2} c="#fbbf24" />
    <P x={7} y={7} w={2} h={2} c="#fbbf24" />
    {/* Eyes */}
    <P x={3} y={5} w={1} h={1} c="#1f2937" />
    <P x={11} y={5} w={1} h={1} c="#1f2937" />
  </IconWrapper>
);

export const BloodlustIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Blood drops */}
    <P x={3} y={3} w={3} h={4} c="#dc2626" />
    <P x={4} y={2} w={1} h={1} c="#dc2626" />
    <P x={7} y={4} w={3} h={5} c="#dc2626" />
    <P x={8} y={3} w={1} h={1} c="#dc2626" />
    <P x={11} y={5} w={3} h={4} c="#dc2626" />
    <P x={12} y={4} w={1} h={1} c="#dc2626" />
    {/* Energy effect */}
    <P x={2} y={10} w={12} h={2} c="#f97316" />
    <P x={4} y={12} w={8} h={1} c="#fbbf24" />
    <P x={6} y={13} w={4} h={1} c="#fef08a" />
  </IconWrapper>
);

// === PASSIVE SKILL ICONS ===

export const FortitudeIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Heart with armor */}
    <P x={3} y={4} w={4} h={4} c="#ef4444" />
    <P x={9} y={4} w={4} h={4} c="#ef4444" />
    <P x={4} y={3} w={2} h={1} c="#ef4444" />
    <P x={10} y={3} w={2} h={1} c="#ef4444" />
    <P x={3} y={8} w={10} h={2} c="#ef4444" />
    <P x={4} y={10} w={8} h={2} c="#ef4444" />
    <P x={6} y={12} w={4} h={1} c="#ef4444" />
    <P x={7} y={13} w={2} h={1} c="#ef4444" />
    {/* Armor plate */}
    <P x={6} y={5} w={4} h={4} c="#9ca3af" />
    <P x={7} y={6} w={2} h={2} c="#d1d5db" />
  </IconWrapper>
);

export const PrecisionIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Target */}
    <P x={3} y={3} w={10} h={10} c="#ef4444" />
    <P x={4} y={4} w={8} h={8} c="#1f2937" />
    <P x={5} y={5} w={6} h={6} c="#ef4444" />
    <P x={6} y={6} w={4} h={4} c="#1f2937" />
    <P x={7} y={7} w={2} h={2} c="#fbbf24" />
  </IconWrapper>
);

export const SpellMasteryIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Open book */}
    <P x={2} y={4} w={6} h={8} c="#fef3c7" />
    <P x={8} y={4} w={6} h={8} c="#fef3c7" />
    <P x={7} y={3} w={2} h={10} c="#78350f" />
    {/* Text lines */}
    <P x={3} y={5} w={4} h={1} c="#374151" />
    <P x={3} y={7} w={4} h={1} c="#374151" />
    <P x={3} y={9} w={4} h={1} c="#374151" />
    <P x={9} y={5} w={4} h={1} c="#374151" />
    <P x={9} y={7} w={4} h={1} c="#374151" />
    <P x={9} y={9} w={4} h={1} c="#374151" />
    {/* Magic glow */}
    <P x={6} y={1} w={4} h={2} c="#a855f7" />
  </IconWrapper>
);

export const ShadowCloneIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={4} y={3} w={3} h={3} c="#475569" />
    <P x={4} y={6} w={3} h={5} c="#334155" />
    <P x={3} y={8} w={2} h={3} c="#334155" />
    <P x={9} y={4} w={3} h={3} c="#6366f1" />
    <P x={9} y={7} w={3} h={5} c="#4f46e5" />
    <P x={12} y={9} w={2} h={3} c="#4f46e5" />
    <P x={7} y={6} w={2} h={1} c="#4338ca" />
    <P x={7} y={8} w={2} h={1} c="#3730a3" />
  </IconWrapper>
);

export const JuggernautIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={4} y={3} w={8} h={3} c="#78716c" />
    <P x={3} y={6} w={10} h={4} c="#a8a29e" />
    <P x={4} y={6} w={2} h={4} c="#d6d3d1" />
    <P x={8} y={6} w={2} h={4} c="#d6d3d1" />
    <P x={3} y={10} w={10} h={3} c="#78716c" />
    <P x={5} y={1} w={2} h={2} c="#fbbf24" />
    <P x={9} y={1} w={2} h={2} c="#fbbf24" />
  </IconWrapper>
);

export const ColossusIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={5} y={1} w={6} h={4} c="#9ca3af" />
    <P x={6} y={2} w={1} h={2} c="#60a5fa" />
    <P x={9} y={2} w={1} h={2} c="#60a5fa" />
    <P x={3} y={5} w={10} h={6} c="#6b7280" />
    <P x={4} y={5} w={8} h={1} c="#9ca3af" />
    <P x={1} y={6} w={2} h={4} c="#6b7280" />
    <P x={13} y={6} w={2} h={4} c="#6b7280" />
    <P x={4} y={11} w={3} h={3} c="#4b5563" />
    <P x={9} y={11} w={3} h={3} c="#4b5563" />
  </IconWrapper>
);

export const BeastMasterIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={2} y={4} w={6} h={5} c="#854d0e" />
    <P x={1} y={5} w={2} h={3} c="#a16207" />
    <P x={3} y={5} w={1} h={1} c="#fbbf24" />
    <P x={6} y={5} w={1} h={1} c="#fbbf24" />
    <P x={3} y={7} w={4} h={2} c="#713f12" />
    <P x={4} y={8} w={2} h={1} c="#f8fafc" />
    <P x={10} y={2} w={3} h={4} c="#d6d3d1" />
    <P x={10} y={6} w={4} h={2} c="#a8a29e" />
    <P x={8} y={5} w={2} h={1} c="#fbbf24" />
    <P x={9} y={4} w={1} h={1} c="#fde68a" />
  </IconWrapper>
);

export const NaturesWrathIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={3} y={2} w={10} h={4} c="#4b5563" />
    <P x={5} y={1} w={6} h={2} c="#6b7280" />
    <P x={7} y={6} w={2} h={2} c="#fbbf24" />
    <P x={6} y={8} w={2} h={2} c="#fde68a" />
    <P x={7} y={10} w={2} h={2} c="#fbbf24" />
    <P x={2} y={7} w={2} h={1} c="#22c55e" />
    <P x={3} y={8} w={1} h={3} c="#16a34a" />
    <P x={12} y={7} w={2} h={1} c="#22c55e" />
    <P x={12} y={8} w={1} h={3} c="#16a34a" />
  </IconWrapper>
);

// Warrior: Unbreakable - Diamond/shatterproof crystal
export const UnbreakableIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={7} y={1} w={2} h={2} c="#a5f3fc" />
    <P x={5} y={3} w={6} h={2} c="#67e8f9" />
    <P x={4} y={5} w={8} h={4} c="#22d3ee" />
    <P x={5} y={9} w={6} h={3} c="#06b6d4" />
    <P x={6} y={12} w={4} h={2} c="#0891b2" />
    <P x={7} y={14} w={2} h={1} c="#0e7490" />
    <P x={5} y={5} w={2} h={2} c="#cffafe" />
    <P x={9} y={7} w={2} h={1} c="#a5f3fc" />
  </IconWrapper>
);

// Warrior: Warlord - Crown with war banner
export const WarlordIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={3} y={4} w={10} h={3} c="#fbbf24" />
    <P x={3} y={2} w={2} h={2} c="#fbbf24" />
    <P x={7} y={1} w={2} h={3} c="#fbbf24" />
    <P x={11} y={2} w={2} h={2} c="#fbbf24" />
    <P x={4} y={5} w={2} h={1} c="#ef4444" />
    <P x={10} y={5} w={2} h={1} c="#ef4444" />
    <P x={7} y={5} w={2} h={1} c="#3b82f6" />
    <P x={10} y={7} w={2} h={7} c="#78350f" />
    <P x={12} y={8} w={3} h={4} c="#dc2626" />
    <P x={12} y={8} w={3} h={1} c="#fbbf24" />
  </IconWrapper>
);

// Paladin: Divine Intervention - Angel wings with golden shield
export const DivineInterventionIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={1} y={4} w={3} h={6} c="#fef08a" />
    <P x={12} y={4} w={3} h={6} c="#fef08a" />
    <P x={2} y={3} w={2} h={2} c="#fde68a" />
    <P x={12} y={3} w={2} h={2} c="#fde68a" />
    <P x={5} y={3} w={6} h={8} c="#fbbf24" />
    <P x={6} y={4} w={4} h={6} c="#fef08a" />
    <P x={7} y={5} w={2} h={4} c="#fbbf24" />
    <P x={6} y={7} w={4} h={1} c="#fbbf24" />
    <P x={7} y={1} w={2} h={2} c="#fef9c3" />
  </IconWrapper>
);

// Paladin: Avenger - Flaming sword of vengeance
export const AvengerIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={7} y={1} w={2} h={3} c="#9ca3af" />
    <P x={6} y={4} w={4} h={2} c="#d1d5db" />
    <P x={7} y={6} w={2} h={4} c="#9ca3af" />
    <P x={5} y={10} w={6} h={2} c="#fbbf24" />
    <P x={6} y={12} w={4} h={2} c="#78350f" />
    <P x={4} y={1} w={3} h={3} c="#ef4444" />
    <P x={9} y={1} w={3} h={3} c="#ef4444" />
    <P x={5} y={3} w={2} h={2} c="#f97316" />
    <P x={9} y={3} w={2} h={2} c="#f97316" />
  </IconWrapper>
);

// Paladin: Beacon of Light - Radiant sun/lighthouse
export const BeaconOfLightIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={6} y={5} w={4} h={4} c="#fef08a" />
    <P x={7} y={4} w={2} h={1} c="#fef9c3" />
    <P x={7} y={9} w={2} h={1} c="#fbbf24" />
    <P x={5} y={6} w={1} h={2} c="#fef9c3" />
    <P x={10} y={6} w={1} h={2} c="#fbbf24" />
    <P x={7} y={1} w={2} h={3} c="#fbbf24" />
    <P x={7} y={10} w={2} h={3} c="#fbbf24" />
    <P x={1} y={7} w={4} h={1} c="#fbbf24" />
    <P x={11} y={7} w={4} h={1} c="#fbbf24" />
    <P x={3} y={3} w={2} h={2} c="#f59e0b" />
    <P x={11} y={3} w={2} h={2} c="#f59e0b" />
    <P x={3} y={10} w={2} h={2} c="#f59e0b" />
    <P x={11} y={10} w={2} h={2} c="#f59e0b" />
  </IconWrapper>
);

// Knight: Unbreakable - Diamond shield
export const DiamondShieldIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={3} y={2} w={10} h={9} c="#22d3ee" />
    <P x={4} y={3} w={8} h={7} c="#67e8f9" />
    <P x={4} y={11} w={2} h={1} c="#06b6d4" />
    <P x={10} y={11} w={2} h={1} c="#06b6d4" />
    <P x={5} y={12} w={6} h={1} c="#0891b2" />
    <P x={7} y={13} w={2} h={1} c="#0e7490" />
    <P x={6} y={5} w={4} h={4} c="#a5f3fc" />
    <P x={7} y={6} w={2} h={2} c="#cffafe" />
  </IconWrapper>
);

// Knight: Fortress - Castle wall with redirect arrows
export const FortressIcon2 = ({ size }) => (
  <IconWrapper size={size}>
    <P x={3} y={4} w={10} h={10} c="#6b7280" />
    <P x={4} y={5} w={8} h={8} c="#9ca3af" />
    <P x={3} y={2} w={3} h={2} c="#9ca3af" />
    <P x={6} y={3} w={4} h={1} c="#6b7280" />
    <P x={10} y={2} w={3} h={2} c="#9ca3af" />
    <P x={6} y={7} w={4} h={5} c="#1f2937" />
    <P x={7} y={6} w={2} h={1} c="#1f2937" />
    <P x={1} y={6} w={2} h={1} c="#fbbf24" />
    <P x={1} y={9} w={2} h={1} c="#fbbf24" />
  </IconWrapper>
);

// Cleric: Crusader - Sword with healing cross
export const CrusaderIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={7} y={1} w={2} h={4} c="#d1d5db" />
    <P x={5} y={5} w={6} h={2} c="#fbbf24" />
    <P x={7} y={7} w={2} h={5} c="#78350f" />
    <P x={6} y={12} w={4} h={2} c="#fbbf24" />
    <P x={11} y={3} w={3} h={2} c="#22c55e" />
    <P x={12} y={2} w={1} h={4} c="#22c55e" />
    <P x={12} y={3} w={1} h={1} c="#4ade80" />
  </IconWrapper>
);

// Cleric: Radiance - Sun with shield aura
export const RadianceIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={5} y={4} w={6} h={6} c="#fbbf24" />
    <P x={6} y={5} w={4} h={4} c="#fef08a" />
    <P x={7} y={6} w={2} h={2} c="#fef9c3" />
    <P x={7} y={1} w={2} h={3} c="#f59e0b" />
    <P x={7} y={10} w={2} h={3} c="#f59e0b" />
    <P x={1} y={6} w={4} h={2} c="#f59e0b" />
    <P x={11} y={6} w={4} h={2} c="#f59e0b" />
    <P x={3} y={3} w={2} h={1} c="#3b82f6" />
    <P x={11} y={3} w={2} h={1} c="#3b82f6" />
    <P x={3} y={10} w={2} h={1} c="#3b82f6" />
    <P x={11} y={10} w={2} h={1} c="#3b82f6" />
  </IconWrapper>
);

// Druid: Rebirth - Phoenix/butterfly rising
export const RebirthIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={6} y={3} w={4} h={6} c="#f97316" />
    <P x={7} y={2} w={2} h={1} c="#fbbf24" />
    <P x={7} y={4} w={2} h={2} c="#fef08a" />
    <P x={3} y={4} w={3} h={4} c="#ef4444" />
    <P x={10} y={4} w={3} h={4} c="#ef4444" />
    <P x={2} y={5} w={2} h={2} c="#f97316" />
    <P x={12} y={5} w={2} h={2} c="#f97316" />
    <P x={5} y={9} w={6} h={3} c="#fbbf24" />
    <P x={6} y={12} w={4} h={2} c="#f59e0b" />
    <P x={7} y={14} w={2} h={1} c="#ca8a04" />
  </IconWrapper>
);

// Shaman: Ascendance - Rising spirit form
export const AscendanceIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={5} y={2} w={6} h={5} c="#818cf8" />
    <P x={6} y={1} w={4} h={1} c="#a5b4fc" />
    <P x={6} y={3} w={4} h={2} c="#c7d2fe" />
    <P x={4} y={7} w={8} h={5} c="#6366f1" />
    <P x={5} y={8} w={6} h={3} c="#818cf8" />
    <P x={3} y={5} w={2} h={4} c="#818cf8" />
    <P x={11} y={5} w={2} h={4} c="#818cf8" />
    <P x={5} y={12} w={2} h={2} c="#4f46e5" />
    <P x={9} y={12} w={2} h={2} c="#4f46e5" />
    <P x={7} y={4} w={2} h={1} c="#e0e7ff" />
  </IconWrapper>
);

// Shaman: Spirit Link Totem - Totem pole with spirit chains
export const SpiritLinkTotemIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={6} y={1} w={4} h={3} c="#22c55e" />
    <P x={7} y={2} w={2} h={1} c="#4ade80" />
    <P x={6} y={4} w={4} h={3} c="#3b82f6" />
    <P x={7} y={5} w={2} h={1} c="#60a5fa" />
    <P x={6} y={7} w={4} h={3} c="#ef4444" />
    <P x={7} y={8} w={2} h={1} c="#fca5a5" />
    <P x={6} y={10} w={4} h={4} c="#78350f" />
    <P x={4} y={3} w={2} h={1} c="#fbbf24" />
    <P x={10} y={3} w={2} h={1} c="#fbbf24" />
    <P x={3} y={6} w={3} h={1} c="#fbbf24" />
    <P x={10} y={6} w={3} h={1} c="#fbbf24" />
  </IconWrapper>
);

// Mage: Archmage - Wizard hat with arcane power
export const ArchmageIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={7} y={0} w={2} h={2} c="#a855f7" />
    <P x={6} y={2} w={4} h={2} c="#7c3aed" />
    <P x={5} y={4} w={6} h={3} c="#6d28d9" />
    <P x={3} y={7} w={10} h={2} c="#5b21b6" />
    <P x={4} y={8} w={8} h={1} c="#7c3aed" />
    <P x={7} y={1} w={1} h={1} c="#e9d5ff" />
    <P x={3} y={10} w={10} h={4} c="#4c1d95" />
    <P x={4} y={11} w={8} h={2} c="#6d28d9" />
    <P x={7} y={12} w={2} h={1} c="#a855f7" />
  </IconWrapper>
);

// Mage: Time Warp - Hourglass with arcane glow
export const TimeWarpIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={3} y={1} w={10} h={2} c="#fbbf24" />
    <P x={4} y={3} w={8} h={2} c="#a855f7" />
    <P x={5} y={5} w={6} h={1} c="#c084fc" />
    <P x={6} y={6} w={4} h={1} c="#a855f7" />
    <P x={7} y={7} w={2} h={2} c="#e9d5ff" />
    <P x={6} y={9} w={4} h={1} c="#a855f7" />
    <P x={5} y={10} w={6} h={1} c="#c084fc" />
    <P x={4} y={11} w={8} h={2} c="#a855f7" />
    <P x={3} y={13} w={10} h={2} c="#fbbf24" />
    <P x={7} y={7} w={1} h={1} c="#fef9c3" />
  </IconWrapper>
);

// Rogue: Kingslayer - Dagger through a crown
export const KingslayerIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={3} y={6} w={10} h={3} c="#fbbf24" />
    <P x={3} y={4} w={2} h={2} c="#fbbf24" />
    <P x={7} y={4} w={2} h={2} c="#fbbf24" />
    <P x={11} y={4} w={2} h={2} c="#fbbf24" />
    <P x={4} y={7} w={2} h={1} c="#ef4444" />
    <P x={10} y={7} w={2} h={1} c="#3b82f6" />
    <P x={7} y={1} w={2} h={4} c="#d1d5db" />
    <P x={7} y={9} w={2} h={3} c="#78350f" />
    <P x={6} y={12} w={4} h={2} c="#9ca3af" />
    <P x={6} y={5} w={1} h={1} c="#dc2626" />
    <P x={9} y={5} w={1} h={1} c="#dc2626" />
  </IconWrapper>
);

// Ranger: Kill Shot - Skull in crosshair
export const KillShotIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={5} y={4} w={6} h={6} c="#e5e7eb" />
    <P x={6} y={5} w={1} h={2} c="#1f2937" />
    <P x={9} y={5} w={1} h={2} c="#1f2937" />
    <P x={7} y={8} w={2} h={1} c="#1f2937" />
    <P x={7} y={1} w={2} h={3} c="#ef4444" />
    <P x={7} y={10} w={2} h={3} c="#ef4444" />
    <P x={1} y={6} w={4} h={2} c="#ef4444" />
    <P x={11} y={6} w={4} h={2} c="#ef4444" />
    <P x={7} y={6} w={2} h={2} c="#ef4444" />
  </IconWrapper>
);

// Ranger: Arrow Storm - Rain of arrows with wind
export const ArrowStormIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={3} y={2} w={10} h={3} c="#4b5563" />
    <P x={5} y={1} w={6} h={1} c="#6b7280" />
    <P x={3} y={6} w={1} h={4} c="#78350f" />
    <P x={2} y={10} w={3} h={1} c="#9ca3af" />
    <P x={6} y={7} w={1} h={4} c="#78350f" />
    <P x={5} y={11} w={3} h={1} c="#9ca3af" />
    <P x={9} y={6} w={1} h={4} c="#78350f" />
    <P x={8} y={10} w={3} h={1} c="#9ca3af" />
    <P x={12} y={7} w={1} h={4} c="#78350f" />
    <P x={11} y={11} w={3} h={1} c="#9ca3af" />
    <P x={2} y={13} w={12} h={1} c="#6b7280" />
  </IconWrapper>
);

// Necromancer: Soul Rend - Torn soul/lifesteal
export const SoulRendIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={5} y={2} w={6} h={5} c="#a855f7" />
    <P x={6} y={1} w={4} h={1} c="#c084fc" />
    <P x={6} y={3} w={4} h={2} c="#e9d5ff" />
    <P x={3} y={7} w={4} h={3} c="#a855f7" />
    <P x={9} y={7} w={4} h={3} c="#a855f7" />
    <P x={4} y={10} w={3} h={3} c="#7c3aed" />
    <P x={9} y={10} w={3} h={3} c="#7c3aed" />
    <P x={7} y={6} w={2} h={2} c="#dc2626" />
    <P x={6} y={8} w={4} h={1} c="#dc2626" />
    <P x={7} y={9} w={2} h={1} c="#ef4444" />
  </IconWrapper>
);

// Necromancer: Raise Dead - Skeletal hand from grave
export const RaiseDeadIcon = ({ size }) => (
  <IconWrapper size={size}>
    <P x={2} y={11} w={12} h={3} c="#78716c" />
    <P x={3} y={12} w={10} h={1} c="#57534e" />
    <P x={6} y={7} w={4} h={4} c="#e5e7eb" />
    <P x={5} y={5} w={2} h={3} c="#d1d5db" />
    <P x={9} y={5} w={2} h={3} c="#d1d5db" />
    <P x={5} y={3} w={2} h={2} c="#e5e7eb" />
    <P x={7} y={2} w={2} h={3} c="#e5e7eb" />
    <P x={9} y={3} w={2} h={2} c="#e5e7eb" />
    <P x={4} y={1} w={2} h={2} c="#d1d5db" />
    <P x={10} y={2} w={2} h={1} c="#d1d5db" />
    <P x={6} y={8} w={1} h={1} c="#a855f7" />
    <P x={9} y={8} w={1} h={1} c="#a855f7" />
  </IconWrapper>
);

// === NEW ICONS FOR SKILL TREE COVERAGE ===

// 1. ShieldWallIcon - Two overlapping shields side by side
export const ShieldWallIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Left shield */}
    <P x={1} y={3} w={7} h={9} c="#3b82f6" />
    <P x={2} y={4} w={5} h={7} c="#60a5fa" />
    <P x={3} y={5} w={3} h={3} c="#93c5fd" />
    {/* Right shield */}
    <P x={8} y={3} w={7} h={9} c="#3b82f6" />
    <P x={9} y={4} w={5} h={7} c="#60a5fa" />
    <P x={10} y={5} w={3} h={3} c="#93c5fd" />
    {/* Overlap shadow */}
    <P x={7} y={4} w={2} h={7} c="#2563eb" />
  </IconWrapper>
);

// 2. BoneArmorIcon - Bone/ribcage armor shape
export const BoneArmorIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Ribcage */}
    <P x={4} y={2} w={8} h={2} c="#e5e7eb" />
    <P x={3} y={4} w={2} h={8} c="#e5e7eb" />
    <P x={11} y={4} w={2} h={8} c="#e5e7eb" />
    {/* Ribs */}
    <P x={5} y={5} w={6} h={1} c="#d1d5db" />
    <P x={5} y={7} w={6} h={1} c="#d1d5db" />
    <P x={5} y={9} w={6} h={1} c="#d1d5db" />
    {/* Spine */}
    <P x={7} y={3} w={2} h={9} c="#9ca3af" />
    {/* Shoulder bones */}
    <P x={2} y={2} w={2} h={2} c="#d1d5db" />
    <P x={12} y={2} w={2} h={2} c="#d1d5db" />
  </IconWrapper>
);

// 3. BarkskinIcon - Tree bark shield with leaf on top
export const BarkskinIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Bark shield */}
    <P x={4} y={4} w={8} h={10} c="#78350f" />
    <P x={5} y={5} w={6} h={8} c="#92400e" />
    {/* Bark texture */}
    <P x={6} y={6} w={2} h={2} c="#78350f" />
    <P x={9} y={8} w={2} h={2} c="#78350f" />
    <P x={6} y={10} w={2} h={2} c="#78350f" />
    {/* Leaf on top */}
    <P x={6} y={1} w={4} h={3} c="#22c55e" />
    <P x={7} y={2} w={2} h={1} c="#4ade80" />
  </IconWrapper>
);

// 4. BlessedArmorIcon - Armor with golden cross/blessing glow
export const BlessedArmorIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Armor body */}
    <P x={4} y={3} w={8} h={10} c="#9ca3af" />
    <P x={5} y={4} w={6} h={8} c="#6b7280" />
    {/* Golden cross */}
    <P x={7} y={5} w={2} h={6} c="#fbbf24" />
    <P x={5} y={7} w={6} h={2} c="#fbbf24" />
    {/* Blessing glow */}
    <P x={3} y={2} w={2} h={2} c="#fef08a" />
    <P x={11} y={2} w={2} h={2} c="#fef08a" />
    <P x={7} y={1} w={2} h={1} c="#fef08a" />
  </IconWrapper>
);

// 5. HeavyArmorIcon - Thick plate chestpiece
export const HeavyArmorIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Plate body */}
    <P x={3} y={3} w={10} h={10} c="#6b7280" />
    <P x={4} y={4} w={8} h={8} c="#9ca3af" />
    {/* Shoulder plates */}
    <P x={1} y={3} w={3} h={3} c="#4b5563" />
    <P x={12} y={3} w={3} h={3} c="#4b5563" />
    {/* Center plate detail */}
    <P x={6} y={5} w={4} h={4} c="#6b7280" />
    <P x={7} y={6} w={2} h={2} c="#4b5563" />
    {/* Neck guard */}
    <P x={5} y={2} w={6} h={1} c="#9ca3af" />
  </IconWrapper>
);

// 6. IronWillIcon - Iron helmet with determination glow
export const IronWillIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Helmet */}
    <P x={4} y={3} w={8} h={8} c="#6b7280" />
    <P x={5} y={2} w={6} h={2} c="#9ca3af" />
    {/* Visor slit */}
    <P x={5} y={7} w={6} h={2} c="#1f2937" />
    {/* Nose guard */}
    <P x={7} y={5} w={2} h={5} c="#9ca3af" />
    {/* Will glow */}
    <P x={5} y={7} w={2} h={1} c="#60a5fa" />
    <P x={9} y={7} w={2} h={1} c="#60a5fa" />
    {/* Top crest */}
    <P x={7} y={1} w={2} h={1} c="#60a5fa" />
  </IconWrapper>
);

// 7. ManaShieldIcon - Purple/arcane bubble shield
export const ManaShieldIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Outer bubble */}
    <P x={3} y={2} w={10} h={12} c="#a855f7" />
    <P x={4} y={1} w={8} h={1} c="#c084fc" />
    <P x={4} y={14} w={8} h={1} c="#7c3aed" />
    {/* Inner glow */}
    <P x={5} y={4} w={6} h={8} c="#c084fc" />
    <P x={6} y={5} w={4} h={6} c="#e9d5ff" />
    {/* Arcane rune */}
    <P x={7} y={6} w={2} h={4} c="#7c3aed" />
    <P x={6} y={7} w={4} h={2} c="#7c3aed" />
  </IconWrapper>
);

// 8. SanctuaryIcon - Holy dome/church outline with light
export const SanctuaryIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Dome */}
    <P x={5} y={2} w={6} h={3} c="#fbbf24" />
    <P x={6} y={1} w={4} h={1} c="#fef08a" />
    {/* Building */}
    <P x={3} y={5} w={10} h={8} c="#3b82f6" />
    <P x={4} y={6} w={8} h={6} c="#60a5fa" />
    {/* Door */}
    <P x={6} y={9} w={4} h={4} c="#3b82f6" />
    {/* Light beam */}
    <P x={7} y={3} w={2} h={6} c="#fef08a" />
    {/* Cross on top */}
    <P x={7} y={0} w={2} h={1} c="#fbbf24" />
  </IconWrapper>
);

// 9. BulwarkIcon - Thick stone fortification wall
export const BulwarkIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Wall base */}
    <P x={2} y={5} w={12} h={9} c="#78716c" />
    <P x={3} y={6} w={10} h={7} c="#a8a29e" />
    {/* Battlements */}
    <P x={2} y={3} w={3} h={2} c="#78716c" />
    <P x={7} y={3} w={3} h={2} c="#78716c" />
    <P x={11} y={3} w={3} h={2} c="#78716c" />
    {/* Stone detail */}
    <P x={5} y={8} w={3} h={2} c="#57534e" />
    <P x={9} y={10} w={3} h={2} c="#57534e" />
  </IconWrapper>
);

// 10. WindIcon - Wind swirl/gust lines
export const WindIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Wind gusts */}
    <P x={2} y={3} w={8} h={1} c="#67e8f9" />
    <P x={4} y={4} w={6} h={1} c="#a5f3fc" />
    <P x={1} y={6} w={10} h={1} c="#06b6d4" />
    <P x={3} y={7} w={8} h={1} c="#67e8f9" />
    <P x={5} y={9} w={8} h={1} c="#a5f3fc" />
    <P x={3} y={10} w={6} h={1} c="#67e8f9" />
    <P x={6} y={12} w={7} h={1} c="#06b6d4" />
  </IconWrapper>
);

// 11. RallyIcon - War banner on pole with rally lines
export const RallyIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Pole */}
    <P x={4} y={1} w={2} h={14} c="#78350f" />
    {/* Banner */}
    <P x={6} y={2} w={8} h={6} c="#dc2626" />
    <P x={6} y={2} w={8} h={1} c="#fbbf24" />
    <P x={6} y={7} w={8} h={1} c="#fbbf24" />
    {/* Banner detail */}
    <P x={8} y={4} w={4} h={2} c="#ef4444" />
    {/* Rally lines */}
    <P x={1} y={4} w={2} h={1} c="#fbbf24" />
    <P x={1} y={7} w={2} h={1} c="#fbbf24" />
  </IconWrapper>
);

// 12. AuraIcon - Radiating ring/halo
export const AuraIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Outer ring */}
    <P x={3} y={3} w={10} h={10} c="#fbbf24" />
    <P x={4} y={4} w={8} h={8} c="#1f2937" />
    {/* Inner ring */}
    <P x={5} y={5} w={6} h={6} c="#f59e0b" />
    <P x={6} y={6} w={4} h={4} c="#1f2937" />
    {/* Center glow */}
    <P x={7} y={7} w={2} h={2} c="#fef08a" />
    {/* Radiate lines */}
    <P x={7} y={1} w={2} h={2} c="#fef08a" />
    <P x={7} y={13} w={2} h={2} c="#fef08a" />
    <P x={1} y={7} w={2} h={2} c="#fef08a" />
    <P x={13} y={7} w={2} h={2} c="#fef08a" />
  </IconWrapper>
);

// 13. BlessingIcon - Open palms with sparkles above
export const BlessingIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Left palm */}
    <P x={2} y={7} w={4} h={6} c="#e5e7eb" />
    <P x={2} y={6} w={1} h={2} c="#e5e7eb" />
    <P x={5} y={6} w={1} h={2} c="#e5e7eb" />
    {/* Right palm */}
    <P x={10} y={7} w={4} h={6} c="#e5e7eb" />
    <P x={10} y={6} w={1} h={2} c="#e5e7eb" />
    <P x={13} y={6} w={1} h={2} c="#e5e7eb" />
    {/* Sparkles */}
    <P x={4} y={2} w={2} h={2} c="#fbbf24" />
    <P x={7} y={1} w={2} h={2} c="#fef08a" />
    <P x={10} y={2} w={2} h={2} c="#fbbf24" />
    <P x={7} y={4} w={2} h={2} c="#fef08a" />
  </IconWrapper>
);

// 14. RetaliationIcon - Sword striking back (reflecting blade)
export const RetaliationIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Incoming blade */}
    <P x={1} y={2} w={2} h={6} c="#9ca3af" />
    <P x={3} y={5} w={2} h={2} c="#9ca3af" />
    {/* Impact */}
    <P x={5} y={5} w={2} h={2} c="#ef4444" />
    <P x={6} y={4} w={1} h={1} c="#fbbf24" />
    <P x={6} y={7} w={1} h={1} c="#fbbf24" />
    {/* Counter blade */}
    <P x={7} y={4} w={2} h={2} c="#9ca3af" />
    <P x={9} y={2} w={2} h={2} c="#9ca3af" />
    <P x={11} y={1} w={2} h={2} c="#d1d5db" />
    {/* Spark lines */}
    <P x={4} y={3} w={1} h={1} c="#fbbf24" />
    <P x={8} y={7} w={1} h={1} c="#fbbf24" />
  </IconWrapper>
);

// 15. CounterIcon - Circular arrow with sword in center
export const CounterIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Circular arrow */}
    <P x={3} y={2} w={8} h={1} c="#60a5fa" />
    <P x={11} y={3} w={2} h={5} c="#60a5fa" />
    <P x={5} y={13} w={8} h={1} c="#60a5fa" />
    <P x={3} y={8} w={2} h={5} c="#60a5fa" />
    {/* Arrow tips */}
    <P x={2} y={2} w={2} h={2} c="#60a5fa" />
    <P x={12} y={12} w={2} h={2} c="#60a5fa" />
    {/* Center sword */}
    <P x={7} y={4} w={2} h={8} c="#9ca3af" />
    <P x={6} y={7} w={4} h={2} c="#fbbf24" />
  </IconWrapper>
);

// 16. RedemptionIcon - Light beam from above onto a figure
export const RedemptionIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Light beam */}
    <P x={5} y={0} w={6} h={2} c="#fef08a" />
    <P x={6} y={2} w={4} h={3} c="#fbbf24" />
    <P x={7} y={5} w={2} h={3} c="#fef08a" />
    {/* Figure */}
    <P x={6} y={8} w={4} h={2} c="#e5e7eb" />
    <P x={5} y={10} w={6} h={4} c="#d1d5db" />
    {/* Heal glow */}
    <P x={4} y={9} w={1} h={3} c="#22c55e" />
    <P x={11} y={9} w={1} h={3} c="#22c55e" />
  </IconWrapper>
);

// 17. ZealotryIcon - Burning fist/gauntlet
export const ZealotryIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Gauntlet */}
    <P x={5} y={7} w={6} h={6} c="#9ca3af" />
    <P x={4} y={8} w={2} h={4} c="#9ca3af" />
    <P x={6} y={6} w={4} h={2} c="#6b7280" />
    {/* Fire */}
    <P x={5} y={2} w={6} h={5} c="#ef4444" />
    <P x={6} y={1} w={4} h={2} c="#f97316" />
    <P x={7} y={0} w={2} h={2} c="#fbbf24" />
    {/* Bright core */}
    <P x={7} y={3} w={2} h={3} c="#fbbf24" />
  </IconWrapper>
);

// 18. DarkRitualIcon - Dark candles in circle with purple glow
export const DarkRitualIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Circle */}
    <P x={3} y={5} w={10} h={8} c="#581c87" />
    <P x={4} y={6} w={8} h={6} c="#3b0764" />
    {/* Candles */}
    <P x={4} y={4} w={1} h={4} c="#e5e7eb" />
    <P x={11} y={4} w={1} h={4} c="#e5e7eb" />
    <P x={7} y={3} w={2} h={4} c="#e5e7eb" />
    {/* Flames */}
    <P x={4} y={3} w={1} h={1} c="#f97316" />
    <P x={11} y={3} w={1} h={1} c="#f97316" />
    <P x={7} y={2} w={2} h={1} c="#f97316" />
    {/* Purple glow */}
    <P x={6} y={8} w={4} h={2} c="#a855f7" />
  </IconWrapper>
);

// 19. NecrosisIcon - Decaying/green-tinted skull
export const NecrosisIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Skull shape */}
    <P x={4} y={2} w={8} h={7} c="#22c55e" />
    <P x={5} y={1} w={6} h={1} c="#4ade80" />
    {/* Eyes */}
    <P x={5} y={4} w={2} h={2} c="#1f2937" />
    <P x={9} y={4} w={2} h={2} c="#1f2937" />
    {/* Nose */}
    <P x={7} y={6} w={2} h={1} c="#1f2937" />
    {/* Teeth */}
    <P x={5} y={8} w={6} h={2} c="#4ade80" />
    <P x={6} y={9} w={1} h={1} c="#1f2937" />
    <P x={8} y={9} w={1} h={1} c="#1f2937" />
    <P x={10} y={9} w={1} h={1} c="#1f2937" />
    {/* Decay drip */}
    <P x={3} y={7} w={1} h={3} c="#22c55e" />
    <P x={12} y={6} w={1} h={3} c="#22c55e" />
  </IconWrapper>
);

// 20. ArmyOfDeadIcon - Row of 3 small skeleton silhouettes
export const ArmyOfDeadIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Skeleton 1 */}
    <P x={1} y={4} w={3} h={3} c="#e5e7eb" />
    <P x={1} y={7} w={3} h={5} c="#d1d5db" />
    <P x={2} y={5} w={1} h={1} c="#1f2937" />
    {/* Skeleton 2 */}
    <P x={6} y={3} w={4} h={3} c="#e5e7eb" />
    <P x={6} y={6} w={4} h={6} c="#d1d5db" />
    <P x={7} y={4} w={1} h={1} c="#1f2937" />
    <P x={9} y={4} w={1} h={1} c="#1f2937" />
    {/* Skeleton 3 */}
    <P x={12} y={4} w={3} h={3} c="#e5e7eb" />
    <P x={12} y={7} w={3} h={5} c="#d1d5db" />
    <P x={13} y={5} w={1} h={1} c="#1f2937" />
    {/* Purple glow base */}
    <P x={1} y={12} w={14} h={2} c="#a855f7" />
  </IconWrapper>
);

// 21. SeedIcon - Seed with small sprout growing up
export const SeedIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Seed body */}
    <P x={5} y={8} w={6} h={5} c="#78350f" />
    <P x={6} y={7} w={4} h={1} c="#92400e" />
    <P x={6} y={13} w={4} h={1} c="#92400e" />
    {/* Seed highlight */}
    <P x={7} y={9} w={2} h={2} c="#a16207" />
    {/* Sprout stem */}
    <P x={7} y={3} w={2} h={5} c="#22c55e" />
    {/* Leaves */}
    <P x={5} y={3} w={2} h={2} c="#4ade80" />
    <P x={9} y={4} w={2} h={2} c="#4ade80" />
    <P x={7} y={2} w={2} h={1} c="#4ade80" />
  </IconWrapper>
);

// 22. MoonfireIcon - Crescent moon with fire around it
export const MoonfireIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Crescent moon */}
    <P x={5} y={3} w={6} h={8} c="#fef08a" />
    <P x={8} y={4} w={4} h={6} c="#1f2937" />
    {/* Fire around */}
    <P x={3} y={5} w={2} h={4} c="#ef4444" />
    <P x={2} y={4} w={2} h={2} c="#f97316" />
    <P x={4} y={2} w={2} h={3} c="#f97316" />
    <P x={5} y={11} w={3} h={2} c="#ef4444" />
    {/* Fire tips */}
    <P x={3} y={2} w={1} h={2} c="#fbbf24" />
    <P x={7} y={12} w={2} h={1} c="#f97316" />
  </IconWrapper>
);

// 23. TranquilityIcon - Calm water waves with sparkles
export const TranquilityIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Water waves */}
    <P x={1} y={7} w={14} h={2} c="#06b6d4" />
    <P x={2} y={9} w={12} h={2} c="#67e8f9" />
    <P x={1} y={11} w={14} h={2} c="#06b6d4" />
    <P x={3} y={13} w={10} h={1} c="#67e8f9" />
    {/* Sparkles */}
    <P x={3} y={2} w={2} h={2} c="#fef08a" />
    <P x={7} y={1} w={2} h={2} c="#fef08a" />
    <P x={11} y={3} w={2} h={2} c="#fef08a" />
    <P x={5} y={4} w={1} h={1} c="#fef08a" />
    <P x={10} y={5} w={1} h={1} c="#fef08a" />
  </IconWrapper>
);

// 24. OvergrowthIcon - Thick tangling vines
export const OvergrowthIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Main vines */}
    <P x={2} y={2} w={2} h={10} c="#22c55e" />
    <P x={4} y={4} w={2} h={8} c="#16a34a" />
    <P x={6} y={1} w={2} h={12} c="#22c55e" />
    <P x={8} y={3} w={2} h={10} c="#4ade80" />
    <P x={10} y={2} w={2} h={8} c="#16a34a" />
    <P x={12} y={4} w={2} h={9} c="#22c55e" />
    {/* Leaves */}
    <P x={1} y={1} w={2} h={2} c="#4ade80" />
    <P x={5} y={0} w={2} h={2} c="#4ade80" />
    <P x={9} y={1} w={2} h={2} c="#4ade80" />
    <P x={13} y={3} w={2} h={2} c="#4ade80" />
  </IconWrapper>
);

// 25. CombustionIcon - Explosive fire burst
export const CombustionIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Central burst */}
    <P x={5} y={5} w={6} h={6} c="#f97316" />
    <P x={6} y={6} w={4} h={4} c="#fbbf24" />
    {/* Explosion rays */}
    <P x={7} y={1} w={2} h={4} c="#ef4444" />
    <P x={7} y={11} w={2} h={4} c="#ef4444" />
    <P x={1} y={7} w={4} h={2} c="#ef4444" />
    <P x={11} y={7} w={4} h={2} c="#ef4444" />
    {/* Diagonal bursts */}
    <P x={2} y={2} w={3} h={3} c="#f97316" />
    <P x={11} y={2} w={3} h={3} c="#f97316" />
    <P x={2} y={11} w={3} h={3} c="#f97316" />
    <P x={11} y={11} w={3} h={3} c="#f97316" />
  </IconWrapper>
);

// 26. IgniteIcon - Small flame burning on a surface
export const IgniteIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Surface */}
    <P x={2} y={12} w={12} h={2} c="#78716c" />
    {/* Flame */}
    <P x={6} y={4} w={4} h={8} c="#ef4444" />
    <P x={7} y={2} w={2} h={3} c="#f97316" />
    <P x={7} y={6} w={2} h={4} c="#f97316" />
    <P x={8} y={4} w={1} h={4} c="#fbbf24" />
    {/* Small embers */}
    <P x={4} y={8} w={2} h={2} c="#ef4444" />
    <P x={10} y={7} w={2} h={3} c="#ef4444" />
  </IconWrapper>
);

// 27. PyroblastIcon - Massive swirling fireball
export const PyroblastIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Outer fire */}
    <P x={3} y={3} w={10} h={10} c="#dc2626" />
    {/* Mid layer */}
    <P x={4} y={4} w={8} h={8} c="#ef4444" />
    {/* Inner layer */}
    <P x={5} y={5} w={6} h={6} c="#f97316" />
    {/* Core */}
    <P x={6} y={6} w={4} h={4} c="#fbbf24" />
    <P x={7} y={7} w={2} h={2} c="#fef08a" />
    {/* Swirl details */}
    <P x={2} y={5} w={2} h={2} c="#f97316" />
    <P x={12} y={9} w={2} h={2} c="#f97316" />
    <P x={5} y={1} w={3} h={2} c="#ef4444" />
    <P x={8} y={13} w={3} h={2} c="#ef4444" />
  </IconWrapper>
);

// 28. BlinkIcon - Teleport flash/afterimage
export const BlinkIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Afterimage (faded) */}
    <P x={2} y={4} w={3} h={3} c="#6366f1" />
    <P x={2} y={7} w={3} h={5} c="#6366f1" />
    {/* Flash lines */}
    <P x={5} y={5} w={2} h={1} c="#a5b4fc" />
    <P x={6} y={7} w={2} h={1} c="#a5b4fc" />
    <P x={7} y={9} w={2} h={1} c="#a5b4fc" />
    {/* Teleported figure */}
    <P x={10} y={3} w={4} h={3} c="#818cf8" />
    <P x={10} y={6} w={4} h={6} c="#a5b4fc" />
    {/* Sparkle */}
    <P x={9} y={2} w={1} h={1} c="#c7d2fe" />
    <P x={14} y={5} w={1} h={1} c="#c7d2fe" />
  </IconWrapper>
);

// 29. VendettaIcon - Red-marked eye/target
export const VendettaIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Eye outline */}
    <P x={2} y={5} w={12} h={6} c="#ef4444" />
    <P x={4} y={4} w={8} h={1} c="#ef4444" />
    <P x={4} y={11} w={8} h={1} c="#ef4444" />
    {/* Eye white */}
    <P x={4} y={6} w={8} h={4} c="#dc2626" />
    {/* Iris */}
    <P x={6} y={6} w={4} h={4} c="#1f2937" />
    {/* Pupil */}
    <P x={7} y={7} w={2} h={2} c="#fbbf24" />
    {/* Marks */}
    <P x={1} y={7} w={1} h={2} c="#dc2626" />
    <P x={14} y={7} w={1} h={2} c="#dc2626" />
  </IconWrapper>
);

// 30. MeditationIcon - Sitting cross-legged figure with glow
export const MeditationIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Head */}
    <P x={6} y={3} w={4} h={3} c="#a5b4fc" />
    {/* Body */}
    <P x={5} y={6} w={6} h={4} c="#a5b4fc" />
    {/* Crossed legs */}
    <P x={3} y={10} w={10} h={2} c="#a5b4fc" />
    <P x={4} y={12} w={3} h={2} c="#a5b4fc" />
    <P x={9} y={12} w={3} h={2} c="#a5b4fc" />
    {/* Aura glow */}
    <P x={7} y={1} w={2} h={2} c="#fef08a" />
    <P x={2} y={6} w={2} h={3} c="#c7d2fe" />
    <P x={12} y={6} w={2} h={3} c="#c7d2fe" />
  </IconWrapper>
);

// 31. PurifyIcon - Sparkling cleanse rays
export const PurifyIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Central light */}
    <P x={6} y={5} w={4} h={4} c="#fef08a" />
    {/* Rays */}
    <P x={7} y={1} w={2} h={4} c="#fbbf24" />
    <P x={7} y={9} w={2} h={4} c="#fbbf24" />
    <P x={1} y={6} w={5} h={2} c="#fbbf24" />
    <P x={10} y={6} w={5} h={2} c="#fbbf24" />
    {/* Sparkles */}
    <P x={3} y={3} w={2} h={2} c="#e5e7eb" />
    <P x={11} y={3} w={2} h={2} c="#e5e7eb" />
    <P x={3} y={10} w={2} h={2} c="#e5e7eb" />
    <P x={11} y={10} w={2} h={2} c="#e5e7eb" />
  </IconWrapper>
);

// 32. EarthShieldIcon - Rock/stone shield
export const EarthShieldIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Shield shape */}
    <P x={3} y={2} w={10} h={10} c="#78716c" />
    <P x={4} y={3} w={8} h={8} c="#a8a29e" />
    <P x={4} y={12} w={8} h={1} c="#78716c" />
    <P x={6} y={13} w={4} h={1} c="#57534e" />
    {/* Stone cracks */}
    <P x={6} y={4} w={2} h={3} c="#57534e" />
    <P x={8} y={6} w={3} h={2} c="#57534e" />
    <P x={5} y={8} w={2} h={2} c="#57534e" />
    {/* Earth glow */}
    <P x={2} y={6} w={1} h={3} c="#22c55e" />
    <P x={13} y={6} w={1} h={3} c="#22c55e" />
  </IconWrapper>
);

// 33. SpiritWalkIcon - Ghostly translucent figure walking
export const SpiritWalkIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Ghost head */}
    <P x={6} y={2} w={4} h={3} c="#818cf8" />
    <P x={7} y={1} w={2} h={1} c="#a5b4fc" />
    {/* Ghost body */}
    <P x={5} y={5} w={6} h={6} c="#a5b4fc" />
    {/* Walking legs */}
    <P x={4} y={11} w={3} h={3} c="#c7d2fe" />
    <P x={9} y={11} w={3} h={3} c="#c7d2fe" />
    {/* Trail/glow */}
    <P x={2} y={6} w={3} h={2} c="#c7d2fe" />
    <P x={1} y={8} w={2} h={2} c="#818cf8" />
    {/* Eyes */}
    <P x={7} y={3} w={1} h={1} c="#e0e7ff" />
    <P x={9} y={3} w={1} h={1} c="#e0e7ff" />
  </IconWrapper>
);

// === NEW UNIQUE ICONS (44 icons to eliminate duplicate usage) ===

// 1. ThreateningPresenceIcon - angry red aura around a figure
export const ThreateningPresenceIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Aura */}
    <P x={2} y={2} w={12} h={12} c="#ef4444" />
    <P x={3} y={3} w={10} h={10} c="#fca5a5" />
    {/* Figure */}
    <P x={6} y={4} w={4} h={3} c="#1f2937" />
    <P x={5} y={7} w={6} h={4} c="#1f2937" />
    {/* Angry eyes */}
    <P x={7} y={5} w={1} h={1} c="#ef4444" />
    <P x={9} y={5} w={1} h={1} c="#ef4444" />
    {/* Aura spikes */}
    <P x={1} y={5} w={1} h={2} c="#ef4444" />
    <P x={14} y={5} w={1} h={2} c="#ef4444" />
    <P x={7} y={1} w={2} h={1} c="#ef4444" />
  </IconWrapper>
);

// 2. UnstoppableIcon - figure charging through a barrier
export const UnstoppableIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Barrier fragments */}
    <P x={8} y={2} w={2} h={3} c="#78716c" />
    <P x={10} y={6} w={2} h={3} c="#78716c" />
    <P x={9} y={11} w={2} h={2} c="#78716c" />
    {/* Charging figure */}
    <P x={4} y={4} w={4} h={3} c="#fbbf24" />
    <P x={3} y={7} w={5} h={5} c="#fbbf24" />
    {/* Impact burst */}
    <P x={8} y={5} w={1} h={1} c="#ef4444" />
    <P x={9} y={7} w={1} h={1} c="#ef4444" />
    <P x={8} y={9} w={1} h={1} c="#ef4444" />
    {/* Motion lines */}
    <P x={1} y={6} w={2} h={1} c="#fbbf24" />
    <P x={1} y={9} w={2} h={1} c="#fbbf24" />
  </IconWrapper>
);

// 3. ProtectionAuraIcon - shield inside a glowing circle
export const ProtectionAuraIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Outer glow circle */}
    <P x={3} y={1} w={10} h={1} c="#60a5fa" />
    <P x={1} y={3} w={1} h={10} c="#60a5fa" />
    <P x={14} y={3} w={1} h={10} c="#60a5fa" />
    <P x={3} y={14} w={10} h={1} c="#60a5fa" />
    {/* Shield body */}
    <P x={5} y={4} w={6} h={7} c="#3b82f6" />
    <P x={6} y={11} w={4} h={1} c="#3b82f6" />
    <P x={7} y={12} w={2} h={1} c="#3b82f6" />
    {/* Shield emblem */}
    <P x={7} y={6} w={2} h={3} c="#fbbf24" />
    <P x={6} y={7} w={4} h={1} c="#fbbf24" />
  </IconWrapper>
);

// 4. HolyFervorIcon - fist with holy flames rising
export const HolyFervorIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Fist */}
    <P x={5} y={8} w={6} h={4} c="#f97316" />
    <P x={4} y={9} w={2} h={3} c="#f97316" />
    <P x={6} y={7} w={4} h={1} c="#f97316" />
    {/* Holy flames */}
    <P x={6} y={2} w={2} h={2} c="#fbbf24" />
    <P x={8} y={3} w={2} h={2} c="#fbbf24" />
    <P x={5} y={4} w={2} h={3} c="#fef08a" />
    <P x={9} y={4} w={2} h={3} c="#fef08a" />
    <P x={7} y={1} w={2} h={2} c="#fef08a" />
  </IconWrapper>
);

// 5. ArmorMasterIcon - armor plate with a wrench/hammer tool
export const ArmorMasterIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Armor plate */}
    <P x={2} y={3} w={8} h={10} c="#9ca3af" />
    <P x={3} y={4} w={6} h={8} c="#6b7280" />
    <P x={5} y={5} w={2} h={4} c="#9ca3af" />
    {/* Hammer tool */}
    <P x={10} y={2} w={4} h={2} c="#fbbf24" />
    <P x={11} y={4} w={2} h={6} c="#78350f" />
    <P x={10} y={10} w={4} h={2} c="#fbbf24" />
  </IconWrapper>
);

// 6. FortifiedIcon - castle tower with plus symbol
export const FortifiedIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Tower */}
    <P x={4} y={2} w={8} h={12} c="#78716c" />
    <P x={3} y={2} w={2} h={2} c="#a8a29e" />
    <P x={7} y={2} w={2} h={2} c="#a8a29e" />
    <P x={11} y={2} w={2} h={2} c="#a8a29e" />
    {/* Window */}
    <P x={7} y={9} w={2} h={3} c="#1f2937" />
    {/* Plus symbol */}
    <P x={7} y={5} w={2} h={1} c="#22c55e" />
    <P x={6} y={5} w={4} h={1} c="#22c55e" />
    <P x={7} y={4} w={2} h={3} c="#22c55e" />
  </IconWrapper>
);

// 7. StandFirmIcon - boots planted firmly with roots below
export const StandFirmIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Left boot */}
    <P x={3} y={4} w={3} h={5} c="#78350f" />
    <P x={2} y={8} w={4} h={2} c="#92400e" />
    {/* Right boot */}
    <P x={9} y={4} w={3} h={5} c="#78350f" />
    <P x={9} y={8} w={4} h={2} c="#92400e" />
    {/* Roots */}
    <P x={3} y={10} w={2} h={2} c="#22c55e" />
    <P x={6} y={11} w={3} h={2} c="#22c55e" />
    <P x={11} y={10} w={2} h={2} c="#22c55e" />
    <P x={1} y={12} w={2} h={2} c="#22c55e" />
    <P x={12} y={12} w={2} h={2} c="#22c55e" />
  </IconWrapper>
);

// 8. WallOfSteelIcon - horizontal steel wall with rivets
export const WallOfSteelIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Steel wall */}
    <P x={1} y={4} w={14} h={8} c="#9ca3af" />
    <P x={1} y={5} w={14} h={6} c="#6b7280" />
    {/* Top/bottom border */}
    <P x={1} y={4} w={14} h={1} c="#d1d5db" />
    <P x={1} y={11} w={14} h={1} c="#d1d5db" />
    {/* Rivets */}
    <P x={3} y={7} w={1} h={1} c="#d1d5db" />
    <P x={7} y={7} w={1} h={1} c="#d1d5db" />
    <P x={11} y={7} w={1} h={1} c="#d1d5db" />
    <P x={5} y={9} w={1} h={1} c="#d1d5db" />
    <P x={9} y={9} w={1} h={1} c="#d1d5db" />
  </IconWrapper>
);

// 9. BlessedIcon - hands in prayer with sparkles
export const BlessedIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Left hand */}
    <P x={5} y={5} w={2} h={6} c="#e5e7eb" />
    <P x={4} y={6} w={1} h={4} c="#e5e7eb" />
    {/* Right hand */}
    <P x={9} y={5} w={2} h={6} c="#e5e7eb" />
    <P x={11} y={6} w={1} h={4} c="#e5e7eb" />
    {/* Joined at center */}
    <P x={7} y={6} w={2} h={5} c="#e5e7eb" />
    {/* Sparkles */}
    <P x={3} y={2} w={1} h={1} c="#fbbf24" />
    <P x={7} y={1} w={2} h={1} c="#fef08a" />
    <P x={12} y={2} w={1} h={1} c="#fbbf24" />
    <P x={2} y={4} w={1} h={1} c="#fef08a" />
    <P x={13} y={4} w={1} h={1} c="#fef08a" />
  </IconWrapper>
);

// 10. MartyrIcon - heart with a small cross/wound
export const MartyrIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Heart shape */}
    <P x={3} y={4} w={4} h={3} c="#ef4444" />
    <P x={9} y={4} w={4} h={3} c="#ef4444" />
    <P x={4} y={7} w={8} h={3} c="#ef4444" />
    <P x={5} y={10} w={6} h={2} c="#dc2626" />
    <P x={7} y={12} w={2} h={1} c="#dc2626" />
    {/* Cross/wound */}
    <P x={7} y={5} w={2} h={4} c="#fbbf24" />
    <P x={6} y={6} w={4} h={2} c="#fbbf24" />
  </IconWrapper>
);

// 11. HolyAuraIcon - glowing ring/halo emanating outward
export const HolyAuraIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Outer ring */}
    <P x={3} y={2} w={10} h={1} c="#f59e0b" />
    <P x={2} y={3} w={1} h={2} c="#f59e0b" />
    <P x={13} y={3} w={1} h={2} c="#f59e0b" />
    <P x={3} y={5} w={10} h={1} c="#f59e0b" />
    {/* Inner bright ring */}
    <P x={4} y={7} w={8} h={1} c="#fbbf24" />
    <P x={3} y={8} w={1} h={2} c="#fbbf24" />
    <P x={12} y={8} w={1} h={2} c="#fbbf24" />
    <P x={4} y={10} w={8} h={1} c="#fbbf24" />
    {/* Core glow */}
    <P x={6} y={8} w={4} h={2} c="#fef08a" />
    {/* Emanation rays */}
    <P x={7} y={12} w={2} h={2} c="#fef08a" />
    <P x={1} y={8} w={2} h={1} c="#fef08a" />
    <P x={13} y={9} w={2} h={1} c="#fef08a" />
  </IconWrapper>
);

// 12. GuardianAngelIcon - angel wing wrapping protectively
export const GuardianAngelIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Left wing */}
    <P x={1} y={3} w={2} h={8} c="#e5e7eb" />
    <P x={3} y={2} w={2} h={9} c="#d1d5db" />
    <P x={5} y={4} w={1} h={6} c="#e5e7eb" />
    {/* Right wing */}
    <P x={13} y={3} w={2} h={8} c="#e5e7eb" />
    <P x={11} y={2} w={2} h={9} c="#d1d5db" />
    <P x={10} y={4} w={1} h={6} c="#e5e7eb" />
    {/* Halo */}
    <P x={6} y={1} w={4} h={1} c="#fef08a" />
    {/* Protected figure */}
    <P x={7} y={3} w={2} h={2} c="#fef08a" />
    <P x={6} y={5} w={4} h={6} c="#fef08a" />
  </IconWrapper>
);

// 13. NaturalHealingIcon - leaf with a heart shape inside
export const NaturalHealingIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Leaf shape */}
    <P x={3} y={2} w={10} h={3} c="#22c55e" />
    <P x={2} y={5} w={10} h={3} c="#4ade80" />
    <P x={3} y={8} w={8} h={2} c="#22c55e" />
    <P x={5} y={10} w={4} h={2} c="#22c55e" />
    {/* Stem */}
    <P x={7} y={12} w={2} h={2} c="#22c55e" />
    {/* Heart inside */}
    <P x={5} y={4} w={2} h={2} c="#ef4444" />
    <P x={8} y={4} w={2} h={2} c="#ef4444" />
    <P x={6} y={6} w={3} h={2} c="#ef4444" />
    <P x={7} y={8} w={1} h={1} c="#ef4444" />
  </IconWrapper>
);

// 14. NaturesGiftIcon - berry/acorn with sparkle
export const NaturesGiftIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Acorn cap */}
    <P x={5} y={3} w={6} h={2} c="#78350f" />
    <P x={4} y={5} w={8} h={1} c="#78350f" />
    {/* Acorn body */}
    <P x={5} y={6} w={6} h={5} c="#22c55e" />
    <P x={6} y={11} w={4} h={2} c="#4ade80" />
    <P x={7} y={13} w={2} h={1} c="#22c55e" />
    {/* Stem */}
    <P x={7} y={1} w={2} h={2} c="#78350f" />
    {/* Sparkle */}
    <P x={12} y={2} w={1} h={1} c="#fbbf24" />
    <P x={11} y={3} w={1} h={1} c="#fbbf24" />
    <P x={13} y={3} w={1} h={1} c="#fbbf24" />
    <P x={12} y={4} w={1} h={1} c="#fbbf24" />
  </IconWrapper>
);

// 15. RegrowthIcon - small plant regrowing from cut stump
export const RegrowthIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Stump */}
    <P x={3} y={9} w={6} h={3} c="#78350f" />
    <P x={2} y={12} w={8} h={2} c="#78350f" />
    {/* New growth shoot */}
    <P x={7} y={3} w={2} h={6} c="#22c55e" />
    {/* Leaves */}
    <P x={5} y={4} w={2} h={2} c="#4ade80" />
    <P x={9} y={5} w={2} h={2} c="#4ade80" />
    <P x={4} y={6} w={2} h={1} c="#22c55e" />
    <P x={10} y={7} w={1} h={1} c="#22c55e" />
    {/* Tiny bud at top */}
    <P x={7} y={1} w={2} h={2} c="#4ade80" />
  </IconWrapper>
);

// 16. LifebloomIcon - blooming pink/purple flower
export const LifebloomIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Petals */}
    <P x={6} y={2} w={3} h={2} c="#f472b6" />
    <P x={3} y={4} w={3} h={3} c="#f472b6" />
    <P x={10} y={4} w={3} h={3} c="#f472b6" />
    <P x={4} y={7} w={3} h={3} c="#ec4899" />
    <P x={9} y={7} w={3} h={3} c="#ec4899" />
    {/* Center */}
    <P x={6} y={5} w={4} h={4} c="#fbbf24" />
    {/* Stem */}
    <P x={7} y={10} w={2} h={4} c="#22c55e" />
    {/* Small leaf */}
    <P x={5} y={12} w={2} h={1} c="#22c55e" />
  </IconWrapper>
);

// 17. AncestralPowerIcon - ghostly fist/arm with power
export const AncestralPowerIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Ghostly arm */}
    <P x={3} y={7} w={4} h={5} c="#a5b4fc" />
    <P x={2} y={8} w={2} h={3} c="#c7d2fe" />
    {/* Fist */}
    <P x={5} y={3} w={5} h={5} c="#818cf8" />
    <P x={4} y={4} w={2} h={4} c="#a5b4fc" />
    {/* Power aura */}
    <P x={10} y={2} w={2} h={1} c="#c7d2fe" />
    <P x={11} y={4} w={2} h={1} c="#c7d2fe" />
    <P x={10} y={6} w={2} h={1} c="#c7d2fe" />
    <P x={3} y={2} w={1} h={1} c="#c7d2fe" />
    <P x={8} y={1} w={1} h={1} c="#c7d2fe" />
  </IconWrapper>
);

// 18. AncestralGuidanceIcon - spirit compass/guiding hand
export const AncestralGuidanceIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Compass circle */}
    <P x={4} y={4} w={8} h={8} c="#818cf8" />
    <P x={5} y={5} w={6} h={6} c="#c7d2fe" />
    {/* Compass needle */}
    <P x={7} y={3} w={2} h={4} c="#fbbf24" />
    <P x={7} y={9} w={2} h={4} c="#818cf8" />
    {/* Cardinal points */}
    <P x={3} y={7} w={2} h={2} c="#fbbf24" />
    <P x={11} y={7} w={2} h={2} c="#fbbf24" />
    {/* Spirit glow */}
    <P x={6} y={1} w={4} h={2} c="#c7d2fe" />
    <P x={1} y={6} w={2} h={2} c="#c7d2fe" />
  </IconWrapper>
);

// 19. ElementalFocusIcon - swirling elements (fire+water+earth)
export const ElementalFocusIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Fire element - top */}
    <P x={6} y={1} w={3} h={3} c="#ef4444" />
    <P x={7} y={0} w={1} h={1} c="#ef4444" />
    {/* Water element - bottom left */}
    <P x={1} y={9} w={4} h={4} c="#06b6d4" />
    <P x={2} y={8} w={2} h={1} c="#06b6d4" />
    {/* Earth element - bottom right */}
    <P x={10} y={9} w={4} h={4} c="#78716c" />
    <P x={11} y={8} w={2} h={1} c="#78716c" />
    {/* Swirl center */}
    <P x={6} y={6} w={4} h={4} c="#fbbf24" />
    <P x={7} y={5} w={2} h={1} c="#fbbf24" />
    {/* Swirl lines */}
    <P x={4} y={5} w={2} h={1} c="#06b6d4" />
    <P x={10} y={6} w={2} h={1} c="#78716c" />
  </IconWrapper>
);

// 20. TotemicMightIcon - single totem with power aura
export const TotemicMightIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Totem pole */}
    <P x={6} y={2} w={4} h={10} c="#78350f" />
    <P x={5} y={12} w={6} h={2} c="#78350f" />
    {/* Totem face */}
    <P x={7} y={3} w={1} h={1} c="#fbbf24" />
    <P x={9} y={3} w={1} h={1} c="#fbbf24" />
    <P x={7} y={5} w={2} h={1} c="#22c55e" />
    {/* Power aura */}
    <P x={3} y={4} w={2} h={1} c="#fbbf24" />
    <P x={11} y={4} w={2} h={1} c="#fbbf24" />
    <P x={4} y={6} w={1} h={2} c="#22c55e" />
    <P x={11} y={6} w={1} h={2} c="#22c55e" />
    <P x={3} y={8} w={2} h={1} c="#fbbf24" />
    <P x={11} y={8} w={2} h={1} c="#fbbf24" />
  </IconWrapper>
);

// 21. GlassCannonIcon - cracked crystal exploding with fire
export const GlassCannonIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Crystal body */}
    <P x={5} y={3} w={4} h={8} c="#a5f3fc" />
    <P x={6} y={2} w={2} h={1} c="#a5f3fc" />
    <P x={6} y={11} w={2} h={2} c="#a5f3fc" />
    {/* Cracks */}
    <P x={7} y={4} w={1} h={3} c="#1f2937" />
    <P x={6} y={6} w={1} h={2} c="#1f2937" />
    {/* Fire explosion */}
    <P x={10} y={2} w={3} h={3} c="#ef4444" />
    <P x={11} y={5} w={2} h={2} c="#f97316" />
    <P x={1} y={4} w={3} h={2} c="#ef4444" />
    <P x={2} y={6} w={2} h={2} c="#f97316" />
  </IconWrapper>
);

// 22. ManaEfficiencyIcon - blue gem/diamond with sparkle
export const ManaEfficiencyIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Diamond shape */}
    <P x={7} y={2} w={2} h={2} c="#60a5fa" />
    <P x={5} y={4} w={6} h={2} c="#3b82f6" />
    <P x={4} y={6} w={8} h={3} c="#3b82f6" />
    <P x={5} y={9} w={6} h={2} c="#60a5fa" />
    <P x={7} y={11} w={2} h={2} c="#60a5fa" />
    {/* Facet highlight */}
    <P x={6} y={5} w={2} h={2} c="#93c5fd" />
    {/* Sparkles */}
    <P x={2} y={3} w={1} h={1} c="#fef08a" />
    <P x={13} y={4} w={1} h={1} c="#fef08a" />
    <P x={3} y={8} w={1} h={1} c="#fef08a" />
    <P x={12} y={7} w={1} h={1} c="#fef08a" />
  </IconWrapper>
);

// 23. ElementalMasteryMageIcon - 3 elemental orbs (fire/ice/lightning)
export const ElementalMasteryMageIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Fire orb - top */}
    <P x={6} y={1} w={4} h={4} c="#ef4444" />
    <P x={7} y={2} w={2} h={2} c="#fbbf24" />
    {/* Ice orb - bottom left */}
    <P x={1} y={9} w={4} h={4} c="#06b6d4" />
    <P x={2} y={10} w={2} h={2} c="#a5f3fc" />
    {/* Lightning orb - bottom right */}
    <P x={11} y={9} w={4} h={4} c="#fbbf24" />
    <P x={12} y={10} w={2} h={2} c="#fef08a" />
    {/* Connection lines */}
    <P x={5} y={6} w={1} h={3} c="#9ca3af" />
    <P x={10} y={6} w={1} h={3} c="#9ca3af" />
    <P x={6} y={13} w={4} h={1} c="#9ca3af" />
  </IconWrapper>
);

// 24. ArcaneSurgeIcon - purple energy burst outward
export const ArcaneSurgeIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Center core */}
    <P x={6} y={6} w={4} h={4} c="#a855f7" />
    <P x={7} y={7} w={2} h={2} c="#e9d5ff" />
    {/* Burst rays */}
    <P x={7} y={2} w={2} h={4} c="#c084fc" />
    <P x={7} y={10} w={2} h={4} c="#c084fc" />
    <P x={2} y={7} w={4} h={2} c="#c084fc" />
    <P x={10} y={7} w={4} h={2} c="#c084fc" />
    {/* Diagonal bursts */}
    <P x={3} y={3} w={2} h={2} c="#e9d5ff" />
    <P x={11} y={3} w={2} h={2} c="#e9d5ff" />
    <P x={3} y={11} w={2} h={2} c="#e9d5ff" />
    <P x={11} y={11} w={2} h={2} c="#e9d5ff" />
  </IconWrapper>
);

// 25. LethalityIcon - dagger dripping blood
export const LethalityIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Dagger blade */}
    <P x={7} y={1} w={2} h={2} c="#d1d5db" />
    <P x={7} y={3} w={2} h={4} c="#9ca3af" />
    {/* Guard */}
    <P x={5} y={7} w={6} h={1} c="#6b7280" />
    {/* Handle */}
    <P x={7} y={8} w={2} h={3} c="#78350f" />
    {/* Blood drips */}
    <P x={6} y={4} w={1} h={2} c="#dc2626" />
    <P x={10} y={3} w={1} h={3} c="#ef4444" />
    <P x={5} y={6} w={1} h={2} c="#ef4444" />
    <P x={10} y={7} w={1} h={2} c="#dc2626" />
    <P x={9} y={12} w={1} h={2} c="#ef4444" />
  </IconWrapper>
);

// 26. DeadlyMomentumIcon - skull with speed/motion lines
export const DeadlyMomentumIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Skull */}
    <P x={6} y={3} w={6} h={5} c="#e5e7eb" />
    <P x={7} y={8} w={4} h={2} c="#e5e7eb" />
    {/* Eyes */}
    <P x={7} y={5} w={2} h={2} c="#1f2937" />
    <P x={10} y={5} w={2} h={2} c="#1f2937" />
    {/* Teeth */}
    <P x={8} y={8} w={1} h={1} c="#1f2937" />
    <P x={10} y={8} w={1} h={1} c="#1f2937" />
    {/* Motion lines */}
    <P x={1} y={4} w={4} h={1} c="#fbbf24" />
    <P x={2} y={6} w={3} h={1} c="#fbbf24" />
    <P x={1} y={8} w={4} h={1} c="#fbbf24" />
    <P x={3} y={10} w={3} h={1} c="#fbbf24" />
  </IconWrapper>
);

// 27. BladeFlurryIcon - circular spinning blade/whirlwind
export const BladeFlurryIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Circular blade */}
    <P x={5} y={2} w={6} h={1} c="#9ca3af" />
    <P x={3} y={3} w={2} h={2} c="#9ca3af" />
    <P x={11} y={3} w={2} h={2} c="#9ca3af" />
    <P x={2} y={5} w={1} h={6} c="#d1d5db" />
    <P x={13} y={5} w={1} h={6} c="#d1d5db" />
    <P x={3} y={11} w={2} h={2} c="#9ca3af" />
    <P x={11} y={11} w={2} h={2} c="#9ca3af" />
    <P x={5} y={13} w={6} h={1} c="#9ca3af" />
    {/* Center */}
    <P x={7} y={7} w={2} h={2} c="#ef4444" />
    {/* Spin lines */}
    <P x={5} y={6} w={2} h={1} c="#d1d5db" />
    <P x={9} y={9} w={2} h={1} c="#d1d5db" />
  </IconWrapper>
);

// 28. ShadowDanceIcon - dark figure in motion with afterimages
export const ShadowDanceIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Afterimage 1 (faintest) */}
    <P x={1} y={4} w={3} h={2} c="#4b5563" />
    <P x={1} y={6} w={2} h={4} c="#4b5563" />
    {/* Afterimage 2 */}
    <P x={5} y={3} w={3} h={2} c="#374151" />
    <P x={5} y={5} w={2} h={5} c="#374151" />
    {/* Main figure */}
    <P x={9} y={2} w={3} h={3} c="#1f2937" />
    <P x={9} y={5} w={3} h={6} c="#1f2937" />
    <P x={8} y={11} w={2} h={2} c="#1f2937" />
    <P x={12} y={11} w={2} h={2} c="#1f2937" />
    {/* Eyes */}
    <P x={10} y={3} w={1} h={1} c="#4b5563" />
  </IconWrapper>
);

// 29. ElusivenessIcon - fading/transparent figure dodging
export const ElusivenessIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Fading figure outline */}
    <P x={5} y={2} w={4} h={3} c="#d1d5db" />
    <P x={4} y={5} w={6} h={5} c="#9ca3af" />
    <P x={3} y={10} w={3} h={3} c="#6b7280" />
    <P x={8} y={10} w={3} h={3} c="#6b7280" />
    {/* Dodge direction arrows */}
    <P x={11} y={3} w={3} h={1} c="#d1d5db" />
    <P x={12} y={4} w={2} h={1} c="#d1d5db" />
    <P x={13} y={5} w={1} h={1} c="#9ca3af" />
    {/* Transparency effect */}
    <P x={6} y={4} w={1} h={1} c="#d1d5db" />
    <P x={7} y={7} w={1} h={1} c="#d1d5db" />
    <P x={5} y={8} w={1} h={1} c="#d1d5db" />
  </IconWrapper>
);

// 30. PiercingArrowIcon - arrow going through a target/shield
export const PiercingArrowIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Shield/target */}
    <P x={7} y={3} w={4} h={10} c="#9ca3af" />
    <P x={8} y={4} w={2} h={8} c="#6b7280" />
    {/* Arrow shaft going through */}
    <P x={1} y={7} w={14} h={2} c="#78350f" />
    {/* Arrow head */}
    <P x={13} y={6} w={2} h={1} c="#9ca3af" />
    <P x={14} y={7} w={1} h={2} c="#9ca3af" />
    <P x={13} y={9} w={2} h={1} c="#9ca3af" />
    {/* Impact cracks */}
    <P x={6} y={5} w={1} h={1} c="#ef4444" />
    <P x={11} y={5} w={1} h={1} c="#ef4444" />
    <P x={6} y={10} w={1} h={1} c="#ef4444" />
    <P x={11} y={10} w={1} h={1} c="#ef4444" />
  </IconWrapper>
);

// 31. SniperIcon - scope/lens with crosshair
export const SniperIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Scope circle */}
    <P x={4} y={2} w={8} h={1} c="#1f2937" />
    <P x={3} y={3} w={1} h={2} c="#1f2937" />
    <P x={12} y={3} w={1} h={2} c="#1f2937" />
    <P x={4} y={13} w={8} h={1} c="#1f2937" />
    <P x={3} y={11} w={1} h={2} c="#1f2937" />
    <P x={12} y={11} w={1} h={2} c="#1f2937" />
    {/* Crosshair */}
    <P x={7} y={3} w={2} h={4} c="#ef4444" />
    <P x={7} y={9} w={2} h={4} c="#ef4444" />
    <P x={3} y={7} w={4} h={2} c="#ef4444" />
    <P x={9} y={7} w={4} h={2} c="#ef4444" />
    {/* Lens center */}
    <P x={7} y={7} w={2} h={2} c="#9ca3af" />
  </IconWrapper>
);

// 32. EagleEyeIcon - eagle eye with sharp pupil
export const EagleEyeIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Eye outer shape */}
    <P x={2} y={6} w={12} h={4} c="#fbbf24" />
    <P x={4} y={5} w={8} h={1} c="#fbbf24" />
    <P x={4} y={10} w={8} h={1} c="#fbbf24" />
    {/* Eye white */}
    <P x={4} y={6} w={8} h={4} c="#fef9c3" />
    {/* Iris */}
    <P x={6} y={6} w={4} h={4} c="#78350f" />
    {/* Pupil */}
    <P x={7} y={7} w={2} h={2} c="#1f2937" />
    {/* Shine */}
    <P x={8} y={7} w={1} h={1} c="#fef08a" />
    {/* Brow feathers */}
    <P x={1} y={5} w={3} h={1} c="#78350f" />
    <P x={12} y={5} w={3} h={1} c="#78350f" />
  </IconWrapper>
);

// 33. SteadyAimIcon - bow drawn with steady line
export const SteadyAimIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Bow arc */}
    <P x={4} y={2} w={1} h={12} c="#78350f" />
    <P x={3} y={4} w={1} h={8} c="#78350f" />
    {/* String */}
    <P x={5} y={2} w={1} h={1} c="#9ca3af" />
    <P x={6} y={3} w={1} h={1} c="#9ca3af" />
    <P x={7} y={4} w={1} h={8} c="#9ca3af" />
    <P x={6} y={12} w={1} h={1} c="#9ca3af" />
    <P x={5} y={13} w={1} h={1} c="#9ca3af" />
    {/* Arrow */}
    <P x={7} y={7} w={7} h={2} c="#78350f" />
    {/* Steady indicator */}
    <P x={1} y={7} w={2} h={2} c="#22c55e" />
    <P x={14} y={7} w={1} h={2} c="#22c55e" />
  </IconWrapper>
);

// 34. HuntersMarkIcon - red glowing brand/mark X
export const HuntersMarkIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Outer glow */}
    <P x={3} y={3} w={10} h={10} c="#fbbf24" />
    <P x={4} y={4} w={8} h={8} c="#1f2937" />
    {/* X mark */}
    <P x={5} y={5} w={2} h={2} c="#ef4444" />
    <P x={9} y={5} w={2} h={2} c="#ef4444" />
    <P x={7} y={7} w={2} h={2} c="#dc2626" />
    <P x={5} y={9} w={2} h={2} c="#ef4444" />
    <P x={9} y={9} w={2} h={2} c="#ef4444" />
    {/* Glow corners */}
    <P x={4} y={3} w={1} h={1} c="#fbbf24" />
    <P x={11} y={3} w={1} h={1} c="#fbbf24" />
    <P x={4} y={12} w={1} h={1} c="#fbbf24" />
    <P x={11} y={12} w={1} h={1} c="#fbbf24" />
  </IconWrapper>
);

// 35. SwiftQuiverIcon - quiver with speed lines
export const SwiftQuiverIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Quiver body */}
    <P x={8} y={2} w={4} h={10} c="#78350f" />
    <P x={7} y={3} w={1} h={8} c="#92400e" />
    {/* Arrows in quiver */}
    <P x={9} y={1} w={1} h={3} c="#9ca3af" />
    <P x={11} y={1} w={1} h={2} c="#9ca3af" />
    <P x={10} y={0} w={1} h={3} c="#9ca3af" />
    {/* Speed lines */}
    <P x={1} y={4} w={5} h={1} c="#fbbf24" />
    <P x={2} y={6} w={4} h={1} c="#dc2626" />
    <P x={1} y={8} w={5} h={1} c="#fbbf24" />
    <P x={3} y={10} w={3} h={1} c="#dc2626" />
    {/* Strap */}
    <P x={7} y={12} w={5} h={1} c="#78350f" />
  </IconWrapper>
);

// 36. BarrageIcon - multiple arrows in rapid burst pattern
export const BarrageIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Arrow 1 */}
    <P x={2} y={2} w={5} h={1} c="#78350f" />
    <P x={7} y={1} w={2} h={1} c="#9ca3af" />
    {/* Arrow 2 */}
    <P x={1} y={5} w={5} h={1} c="#78350f" />
    <P x={6} y={4} w={2} h={1} c="#9ca3af" />
    {/* Arrow 3 */}
    <P x={2} y={8} w={5} h={1} c="#78350f" />
    <P x={7} y={7} w={2} h={1} c="#9ca3af" />
    {/* Arrow 4 */}
    <P x={1} y={11} w={5} h={1} c="#78350f" />
    <P x={6} y={10} w={2} h={1} c="#9ca3af" />
    {/* Burst lines */}
    <P x={10} y={2} w={2} h={1} c="#fbbf24" />
    <P x={11} y={5} w={2} h={1} c="#fbbf24" />
    <P x={10} y={8} w={2} h={1} c="#fbbf24" />
    <P x={11} y={11} w={2} h={1} c="#fbbf24" />
  </IconWrapper>
);

// 37. SurvivalIcon - wolf fang/claw with blood
export const SurvivalIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Main fang/claw */}
    <P x={6} y={1} w={2} h={4} c="#e5e7eb" />
    <P x={5} y={5} w={3} h={3} c="#e5e7eb" />
    <P x={6} y={8} w={2} h={2} c="#d1d5db" />
    {/* Second claw */}
    <P x={10} y={2} w={2} h={3} c="#e5e7eb" />
    <P x={10} y={5} w={2} h={2} c="#d1d5db" />
    {/* Third claw */}
    <P x={2} y={3} w={2} h={3} c="#e5e7eb" />
    <P x={2} y={6} w={2} h={1} c="#d1d5db" />
    {/* Blood */}
    <P x={6} y={10} w={1} h={2} c="#dc2626" />
    <P x={8} y={9} w={1} h={3} c="#dc2626" />
    <P x={4} y={7} w={1} h={2} c="#dc2626" />
    {/* Base */}
    <P x={3} y={13} w={10} h={1} c="#78350f" />
  </IconWrapper>
);

// 38. DarkPactIcon - dark handshake/clasped hands
export const DarkPactIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Left hand */}
    <P x={1} y={5} w={5} h={3} c="#7c3aed" />
    <P x={2} y={4} w={3} h={1} c="#7c3aed" />
    {/* Right hand */}
    <P x={9} y={5} w={5} h={3} c="#7c3aed" />
    <P x={10} y={4} w={3} h={1} c="#7c3aed" />
    {/* Clasped center */}
    <P x={6} y={5} w={3} h={3} c="#581c87" />
    {/* Dark aura */}
    <P x={4} y={2} w={8} h={2} c="#1f2937" />
    <P x={4} y={9} w={8} h={2} c="#1f2937" />
    <P x={6} y={11} w={4} h={2} c="#581c87" />
    {/* Sinister glow */}
    <P x={7} y={6} w={1} h={1} c="#a855f7" />
  </IconWrapper>
);

// 39. SoulSiphonIcon - wispy soul being pulled into hand
export const SoulSiphonIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Soul wisps */}
    <P x={1} y={2} w={2} h={2} c="#a5b4fc" />
    <P x={3} y={3} w={2} h={2} c="#c7d2fe" />
    <P x={5} y={4} w={2} h={2} c="#a5b4fc" />
    <P x={2} y={5} w={2} h={1} c="#818cf8" />
    {/* Pull lines */}
    <P x={7} y={5} w={2} h={1} c="#818cf8" />
    <P x={8} y={6} w={2} h={1} c="#a5b4fc" />
    {/* Receiving hand */}
    <P x={10} y={6} w={4} h={4} c="#1f2937" />
    <P x={9} y={7} w={2} h={3} c="#1f2937" />
    <P x={11} y={5} w={2} h={1} c="#1f2937" />
    {/* Collected energy */}
    <P x={11} y={7} w={2} h={2} c="#818cf8" />
  </IconWrapper>
);

// 40. DeathCoilIcon - dark spiral projectile
export const DeathCoilIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Spiral outer */}
    <P x={3} y={3} w={3} h={2} c="#581c87" />
    <P x={6} y={2} w={3} h={2} c="#a855f7" />
    <P x={9} y={4} w={2} h={3} c="#581c87" />
    <P x={8} y={7} w={3} h={2} c="#a855f7" />
    <P x={5} y={8} w={3} h={2} c="#581c87" />
    <P x={3} y={6} w={2} h={3} c="#a855f7" />
    {/* Core */}
    <P x={6} y={5} w={3} h={3} c="#22c55e" />
    <P x={7} y={6} w={1} h={1} c="#4ade80" />
    {/* Trail */}
    <P x={1} y={10} w={2} h={2} c="#581c87" />
    <P x={11} y={1} w={2} h={2} c="#a855f7" />
  </IconWrapper>
);

// 41. LifeTapIcon - heart being drained/blood drops
export const LifeTapIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Heart */}
    <P x={3} y={3} w={4} h={3} c="#ef4444" />
    <P x={9} y={3} w={4} h={3} c="#ef4444" />
    <P x={4} y={6} w={8} h={3} c="#dc2626" />
    <P x={6} y={9} w={4} h={2} c="#dc2626" />
    <P x={7} y={11} w={2} h={1} c="#dc2626" />
    {/* Drain effect */}
    <P x={7} y={12} w={1} h={1} c="#581c87" />
    <P x={8} y={13} w={1} h={1} c="#581c87" />
    <P x={6} y={13} w={1} h={1} c="#581c87" />
    {/* Blood drops */}
    <P x={5} y={12} w={1} h={2} c="#ef4444" />
    <P x={10} y={12} w={1} h={2} c="#ef4444" />
  </IconWrapper>
);

// 42. SoulHarvestIcon - multiple small souls being collected
export const SoulHarvestIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Souls */}
    <P x={1} y={2} w={2} h={2} c="#a5b4fc" />
    <P x={5} y={1} w={2} h={2} c="#c7d2fe" />
    <P x={10} y={2} w={2} h={2} c="#a5b4fc" />
    <P x={2} y={6} w={2} h={2} c="#c7d2fe" />
    <P x={12} y={5} w={2} h={2} c="#a5b4fc" />
    {/* Collection vortex center */}
    <P x={6} y={6} w={4} h={4} c="#581c87" />
    <P x={7} y={7} w={2} h={2} c="#a855f7" />
    {/* Pull lines */}
    <P x={3} y={4} w={3} h={1} c="#818cf8" />
    <P x={10} y={4} w={2} h={1} c="#818cf8" />
    <P x={4} y={8} w={2} h={1} c="#818cf8" />
    <P x={10} y={7} w={2} h={1} c="#818cf8" />
    {/* Ground */}
    <P x={5} y={11} w={6} h={2} c="#581c87" />
  </IconWrapper>
);

// 43. CurseOfWeaknessIcon - broken sword with dark aura
export const CurseOfWeaknessIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Sword hilt */}
    <P x={5} y={10} w={6} h={1} c="#6b7280" />
    <P x={7} y={11} w={2} h={3} c="#78350f" />
    {/* Broken blade - top piece */}
    <P x={7} y={2} w={2} h={4} c="#9ca3af" />
    {/* Broken blade - bottom piece */}
    <P x={7} y={7} w={2} h={3} c="#9ca3af" />
    {/* Break gap */}
    <P x={7} y={6} w={2} h={1} c="#581c87" />
    {/* Dark aura */}
    <P x={4} y={3} w={2} h={2} c="#a855f7" />
    <P x={10} y={3} w={2} h={2} c="#a855f7" />
    <P x={3} y={6} w={2} h={2} c="#581c87" />
    <P x={11} y={6} w={2} h={2} c="#581c87" />
    <P x={4} y={9} w={2} h={1} c="#a855f7" />
  </IconWrapper>
);

// 44. UndyingIcon - skull with green shield/glow
export const UndyingIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Green glow */}
    <P x={3} y={2} w={10} h={10} c="#22c55e" />
    <P x={4} y={3} w={8} h={8} c="#1f2937" />
    {/* Skull */}
    <P x={5} y={4} w={6} h={4} c="#e5e7eb" />
    <P x={6} y={8} w={4} h={2} c="#e5e7eb" />
    {/* Eyes */}
    <P x={6} y={5} w={2} h={2} c="#22c55e" />
    <P x={9} y={5} w={2} h={2} c="#22c55e" />
    {/* Nose */}
    <P x={7} y={7} w={2} h={1} c="#1f2937" />
    {/* Teeth */}
    <P x={7} y={9} w={1} h={1} c="#1f2937" />
    <P x={9} y={9} w={1} h={1} c="#1f2937" />
  </IconWrapper>
);

// Skill icon mapping
export const SKILL_ICONS = {
  // Warrior
  warrior_power_strike: PowerStrikeIcon,
  warrior_fortitude: FortitudeIcon,
  warrior_thick_skin: HeavyArmorIcon,
  warrior_threatening_presence: ThreateningPresenceIcon,
  warrior_taunt: TauntIcon,
  warrior_shield_bash: ShieldBashIcon,
  warrior_cleave: CleaveIcon,
  warrior_iron_will: IronWillIcon,
  warrior_second_wind: WindIcon,
  warrior_shield_wall: ShieldWallIcon,
  warrior_revenge: RetaliationIcon,
  warrior_rallying_cry: RallyIcon,
  warrior_unstoppable: UnstoppableIcon,
  warrior_bloodthirst: BloodlustIcon,
  warrior_unbreakable: UnbreakableIcon,
  warrior_warlord: WarlordIcon,
  warrior_juggernaut: JuggernautIcon,

  // Paladin
  paladin_divine_shield: DivineShieldIcon,
  paladin_holy_strength: FortitudeIcon,
  paladin_blessed_armor: BlessedArmorIcon,
  paladin_aura_of_light: AuraIcon,
  paladin_consecration: HolyNovaIcon,
  paladin_lay_on_hands: HealIcon,
  paladin_judgment: SmiteIcon,
  paladin_righteous_defense: ShieldWallIcon,
  paladin_holy_fervor: HolyFervorIcon,
  paladin_aura_of_protection: ProtectionAuraIcon,
  paladin_hammer_of_justice: ShieldBashIcon,
  paladin_redemption: RedemptionIcon,
  paladin_blessed_ground: BlessingIcon,
  paladin_zealotry: ZealotryIcon,
  paladin_divine_intervention: DivineInterventionIcon,
  paladin_avenger: AvengerIcon,
  paladin_beacon_of_light: BeaconOfLightIcon,

  // Knight
  knight_shield_bash: ShieldBashIcon,
  knight_heavy_armor: HeavyArmorIcon,
  knight_constitution: FortitudeIcon,
  knight_stalwart: IronWillIcon,
  knight_wall_of_steel: WallOfSteelIcon,
  knight_aggro: TauntIcon,
  knight_counter: CounterIcon,
  knight_fortified: FortifiedIcon,
  knight_stand_firm: StandFirmIcon,
  knight_shield_wall: ShieldWallIcon,
  knight_punish: PowerStrikeIcon,
  knight_armor_master: ArmorMasterIcon,
  knight_bulwark: BulwarkIcon,
  knight_retaliation: RetaliationIcon,
  knight_unbreakable: DiamondShieldIcon,
  knight_colossus: ColossusIcon,
  knight_fortress: FortressIcon2,

  // Cleric
  cleric_heal: HealIcon,
  cleric_blessed: BlessedIcon,
  cleric_holy_aura: HolyAuraIcon,
  cleric_inner_light: BeaconOfLightIcon,
  cleric_smite: SmiteIcon,
  cleric_revitalize: RevitalizeIcon,
  cleric_divine_shield: DivineShieldIcon,
  cleric_purify: PurifyIcon,
  cleric_meditation: MeditationIcon,
  cleric_holy_nova: HolyNovaIcon,
  cleric_sanctuary: SanctuaryIcon,
  cleric_guardian_angel: GuardianAngelIcon,
  cleric_martyr: MartyrIcon,
  cleric_retribution: RetaliationIcon,
  cleric_resurrection: ResurrectionIcon,
  cleric_crusader: CrusaderIcon,
  cleric_radiance: RadianceIcon,

  // Druid
  druid_rejuvenation: RejuvenationIcon,
  druid_natural_healing: NaturalHealingIcon,
  druid_thorns: DeadlyPoisonIcon,
  druid_natures_gift: NaturesGiftIcon,
  druid_wild_growth: WildGrowthIcon,
  druid_regrowth: RegrowthIcon,
  druid_wrath: LightningBoltIcon,
  druid_barkskin: BarkskinIcon,
  druid_living_seed: SeedIcon,
  druid_tranquility: TranquilityIcon,
  druid_moonfire: MoonfireIcon,
  druid_natures_swiftness: RapidFireIcon,
  druid_lifebloom: LifebloomIcon,
  druid_overgrowth: OvergrowthIcon,
  druid_tree_of_life: TreeOfLifeIcon,
  druid_natures_wrath: NaturesWrathIcon,
  druid_rebirth: RebirthIcon,

  // Shaman
  shaman_spirit_link: SpiritLinkIcon,
  shaman_ancestral_power: AncestralPowerIcon,
  shaman_elemental_focus: ElementalFocusIcon,
  shaman_totemic_might: TotemicMightIcon,
  shaman_lightning_bolt: LightningBoltIcon,
  shaman_healing_stream: RejuvenationIcon,
  shaman_purge: PurifyIcon,
  shaman_wind_fury: RapidFireIcon,
  shaman_ancestral_guidance: AncestralGuidanceIcon,
  shaman_chain_lightning: ChainLightningIcon,
  shaman_mana_tide: FrostNovaIcon,
  shaman_earth_shield: EarthShieldIcon,
  shaman_elemental_mastery: SpellMasteryIcon,
  shaman_spirit_walk: SpiritWalkIcon,
  shaman_bloodlust: BloodlustIcon,
  shaman_ascendance: AscendanceIcon,
  shaman_spirit_link_totem: SpiritLinkTotemIcon,

  // Mage
  mage_fireball: FireballIcon,
  mage_arcane_mind: SpellMasteryIcon,
  mage_mana_efficiency: ManaEfficiencyIcon,
  mage_glass_cannon: GlassCannonIcon,
  mage_frost_nova: FrostNovaIcon,
  mage_meteor: MeteorIcon,
  mage_mana_shield: ManaShieldIcon,
  mage_combustion: CombustionIcon,
  mage_arcane_surge: ArcaneSurgeIcon,
  mage_chain_lightning: ChainLightningIcon,
  mage_pyroblast: PyroblastIcon,
  mage_blink: BlinkIcon,
  mage_elemental_mastery: ElementalMasteryMageIcon,
  mage_ignite: IgniteIcon,
  mage_inferno: InfernoIcon,
  mage_archmage: ArchmageIcon,
  mage_time_warp: TimeWarpIcon,

  // Rogue
  rogue_backstab: BackstabIcon,
  rogue_quick_feet: RapidFireIcon,
  rogue_precision: PrecisionIcon,
  rogue_deadly_momentum: DeadlyMomentumIcon,
  rogue_fan_of_knives: FanOfKnivesIcon,
  rogue_smoke_bomb: SmokeBombIcon,
  rogue_cheap_shot: ShieldBashIcon,
  rogue_lethality: LethalityIcon,
  rogue_blade_flurry: BladeFlurryIcon,
  rogue_assassinate: AssassinateIcon,
  rogue_shadow_dance: ShadowDanceIcon,
  rogue_deadly_poison: DeadlyPoisonIcon,
  rogue_vendetta: VendettaIcon,
  rogue_elusiveness: ElusivenessIcon,
  rogue_death_blossom: DeathBlossomIcon,
  rogue_kingslayer: KingslayerIcon,
  rogue_shadow_clone: ShadowCloneIcon,

  // Ranger
  ranger_aimed_shot: AimedShotIcon,
  ranger_eagle_eye: EagleEyeIcon,
  ranger_swift_quiver: SwiftQuiverIcon,
  ranger_steady_aim: SteadyAimIcon,
  ranger_multishot: MultishotIcon,
  ranger_trap: TrapIcon,
  ranger_disengage: WindIcon,
  ranger_hunters_mark: HuntersMarkIcon,
  ranger_barrage: BarrageIcon,
  ranger_piercing_arrow: PiercingArrowIcon,
  ranger_rapid_fire: RapidFireIcon,
  ranger_volley: VolleyIcon,
  ranger_sniper: SniperIcon,
  ranger_survival_instincts: SurvivalIcon,
  ranger_kill_shot: KillShotIcon,
  ranger_arrow_storm: ArrowStormIcon,
  ranger_beast_master: BeastMasterIcon,

  // Necromancer
  necromancer_drain_life: DrainLifeIcon,
  necromancer_dark_pact: DarkPactIcon,
  necromancer_bone_armor: BoneArmorIcon,
  necromancer_soul_siphon: SoulSiphonIcon,
  necromancer_death_coil: DeathCoilIcon,
  necromancer_curse_of_weakness: CurseOfWeaknessIcon,
  necromancer_corpse_explosion: CorpseExplosionIcon,
  necromancer_life_tap: LifeTapIcon,
  necromancer_soul_harvest: SoulHarvestIcon,
  necromancer_plague: PlagueIcon,
  necromancer_dark_ritual: DarkRitualIcon,
  necromancer_undying: UndyingIcon,
  necromancer_necrosis: NecrosisIcon,
  necromancer_army_of_dead: ArmyOfDeadIcon,
  necromancer_lich_form: LichFormIcon,
  necromancer_soul_rend: SoulRendIcon,
  necromancer_raise_dead: RaiseDeadIcon,
};

// Helper component to render skill icon by ID
export const SkillIcon = ({ skillId, size = 32, className = '' }) => {
  const IconComponent = SKILL_ICONS[skillId];
  if (!IconComponent) {
    // Fallback to a generic icon
    return <PowerStrikeIcon size={size} className={className} />;
  }
  return <IconComponent size={size} className={className} />;
};

export default SkillIcon;
