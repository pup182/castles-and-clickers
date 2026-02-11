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

// Skill icon mapping
export const SKILL_ICONS = {
  // Warrior
  warrior_fortitude: FortitudeIcon,
  warrior_power_strike: PowerStrikeIcon,
  warrior_thick_skin: DivineShieldIcon,
  warrior_shield_bash: ShieldBashIcon,
  warrior_cleave: CleaveIcon,
  warrior_iron_will: FortitudeIcon,
  warrior_taunt: TauntIcon,
  warrior_bloodlust: BloodlustIcon,
  warrior_veteran: FortitudeIcon,
  warrior_last_stand: FortitudeIcon,

  // Mage
  mage_arcane_mind: SpellMasteryIcon,
  mage_fireball: FireballIcon,
  mage_glass_cannon: FireballIcon,
  mage_frost_nova: FrostNovaIcon,
  mage_meteor: MeteorIcon,
  mage_mana_shield: DivineShieldIcon,
  mage_chain_lightning: ChainLightningIcon,
  mage_spell_mastery: SpellMasteryIcon,
  mage_arcane_barrier: DivineShieldIcon,
  mage_inferno: InfernoIcon,

  // Rogue
  rogue_quick_feet: RapidFireIcon,
  rogue_backstab: BackstabIcon,
  rogue_precision: PrecisionIcon,
  rogue_smoke_bomb: SmokeBombIcon,
  rogue_fan_of_knives: FanOfKnivesIcon,
  rogue_opportunist: PrecisionIcon,
  rogue_assassinate: AssassinateIcon,
  rogue_shadow_dance: SmokeBombIcon,
  rogue_deadly_poison: DeadlyPoisonIcon,
  rogue_death_blossom: DeathBlossomIcon,

  // Cleric
  cleric_blessed: HealIcon,
  cleric_heal: HealIcon,
  cleric_holy_aura: HolyNovaIcon,
  cleric_smite: SmiteIcon,
  cleric_revitalize: RevitalizeIcon,
  cleric_divine_shield: DivineShieldIcon,
  cleric_holy_nova: HolyNovaIcon,
  cleric_sanctuary: DivineShieldIcon,
  cleric_martyr: HealIcon,
  cleric_resurrection: ResurrectionIcon,

  // Ranger
  ranger_eagle_eye: PrecisionIcon,
  ranger_aimed_shot: AimedShotIcon,
  ranger_swift_quiver: RapidFireIcon,
  ranger_multishot: MultishotIcon,
  ranger_trap: TrapIcon,
  ranger_evasive_maneuvers: SmokeBombIcon,
  ranger_piercing_arrow: AimedShotIcon,
  ranger_rapid_fire: RapidFireIcon,
  ranger_hunters_mark: PrecisionIcon,
  ranger_volley: VolleyIcon,

  // Necromancer
  necromancer_dark_pact: DrainLifeIcon,
  necromancer_drain_life: DrainLifeIcon,
  necromancer_bone_armor: DivineShieldIcon,
  necromancer_corpse_explosion: CorpseExplosionIcon,
  necromancer_curse_of_weakness: PlagueIcon,
  necromancer_soul_harvest: DrainLifeIcon,
  necromancer_life_tap: DrainLifeIcon,
  necromancer_plague: PlagueIcon,
  necromancer_death_coil: DrainLifeIcon,
  necromancer_lich_form: LichFormIcon,

  // Paladin
  paladin_holy_strength: FortitudeIcon,
  paladin_divine_shield: DivineShieldIcon,
  paladin_blessed_armor: DivineShieldIcon,
  paladin_consecration: HolyNovaIcon,
  paladin_lay_on_hands: HealIcon,
  paladin_aura_of_protection: DivineShieldIcon,
  paladin_judgment: SmiteIcon,
  paladin_righteous_fury: FireballIcon,
  paladin_bulwark: DivineShieldIcon,
  paladin_divine_intervention: ResurrectionIcon,

  // Knight
  knight_heavy_armor: DivineShieldIcon,
  knight_shield_bash: ShieldBashIcon,
  knight_constitution: FortitudeIcon,
  knight_wall_of_steel: DivineShieldIcon,
  knight_aggro: TauntIcon,
  knight_vitality: FortitudeIcon,
  knight_shield_wall: DivineShieldIcon,
  knight_punish: PowerStrikeIcon,
  knight_stalwart: FortitudeIcon,
  knight_unbreakable: DivineShieldIcon,

  // Druid
  druid_natural_healing: RejuvenationIcon,
  druid_rejuvenation: RejuvenationIcon,
  druid_thorns: DeadlyPoisonIcon,
  druid_regrowth: RejuvenationIcon,
  druid_wild_growth: WildGrowthIcon,
  druid_wrath: LightningBoltIcon,
  druid_natures_swiftness: RapidFireIcon,
  druid_lifebloom: RejuvenationIcon,
  druid_barkskin: DivineShieldIcon,
  druid_tree_of_life: TreeOfLifeIcon,

  // Shaman
  shaman_ancestral_power: SpiritLinkIcon,
  shaman_spirit_link: SpiritLinkIcon,
  shaman_elemental_focus: LightningBoltIcon,
  shaman_lightning_bolt: LightningBoltIcon,
  shaman_healing_stream: RejuvenationIcon,
  shaman_wind_fury: RapidFireIcon,
  shaman_chain_lightning: ChainLightningIcon,
  shaman_mana_tide: FrostNovaIcon,
  shaman_totemic_power: SpiritLinkIcon,
  shaman_bloodlust: BloodlustIcon,
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
