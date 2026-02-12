// Raid Monster Sprites - Unique monsters for each raid theme
// These are 16x16 pixel art sprites

// Helper component for consistent icon rendering
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

// Pixel helper
const P = ({ x, y, c, w = 1, h = 1 }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} />
);

// ========================================
// SUNKEN TEMPLE MONSTERS
// Theme: Water, flooded ruins, corrupted
// ========================================

export const DrownedZombieIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Waterlogged zombie body */}
    <P x={6} y={2} w={4} h={4} c="#4a7c59" />
    <P x={5} y={6} w={6} h={5} c="#5a8c69" />
    <P x={4} y={11} w={3} h={3} c="#4a7c59" />
    <P x={9} y={11} w={3} h={3} c="#4a7c59" />
    {/* Arms */}
    <P x={3} y={6} w={2} h={4} c="#4a7c59" />
    <P x={11} y={6} w={2} h={4} c="#4a7c59" />
    {/* Eyes - glowing */}
    <P x={6} y={3} w={1} h={1} c="#64ffda" />
    <P x={9} y={3} w={1} h={1} c="#64ffda" />
    {/* Water dripping */}
    <P x={5} y={5} w={1} h={2} c="#06b6d4" />
    <P x={10} y={7} w={1} h={2} c="#06b6d4" />
    {/* Seaweed */}
    <P x={7} y={1} w={1} h={2} c="#166534" />
    <P x={9} y={2} w={1} h={1} c="#166534" />
  </IconWrapper>
);

export const WaterElementalIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Water body - swirling */}
    <P x={5} y={3} w={6} h={8} c="#0ea5e9" />
    <P x={4} y={5} w={8} h={5} c="#38bdf8" />
    <P x={6} y={2} w={4} h={2} c="#7dd3fc" />
    {/* Core glow */}
    <P x={7} y={6} w={2} h={3} c="#e0f2fe" />
    {/* Waves/tendrils */}
    <P x={3} y={6} w={2} h={2} c="#0284c7" />
    <P x={11} y={7} w={2} h={2} c="#0284c7" />
    <P x={5} y={11} w={2} h={2} c="#0284c7" />
    <P x={9} y={12} w={2} h={2} c="#0284c7" />
    {/* Eyes */}
    <P x={6} y={5} w={1} h={1} c="#ffffff" />
    <P x={9} y={5} w={1} h={1} c="#ffffff" />
    {/* Bubbles */}
    <P x={4} y={3} w={1} h={1} c="#bae6fd" />
    <P x={11} y={4} w={1} h={1} c="#bae6fd" />
  </IconWrapper>
);

export const CorruptedFishIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Fish body - mutated */}
    <P x={3} y={6} w={10} h={4} c="#475569" />
    <P x={5} y={5} w={6} h={6} c="#64748b" />
    {/* Fins - spiky */}
    <P x={6} y={3} w={4} h={2} c="#334155" />
    <P x={7} y={2} w={2} h={1} c="#334155" />
    <P x={6} y={11} w={4} h={2} c="#334155" />
    {/* Tail */}
    <P x={1} y={5} w={3} h={1} c="#475569" />
    <P x={1} y={7} w={2} h={1} c="#475569" />
    <P x={1} y={9} w={3} h={1} c="#475569" />
    {/* Eye - corrupted */}
    <P x={10} y={7} w={2} h={2} c="#7c3aed" />
    <P x={11} y={7} w={1} h={1} c="#a78bfa" />
    {/* Corruption marks */}
    <P x={6} y={7} w={1} h={1} c="#7c3aed" />
    <P x={8} y={8} w={1} h={1} c="#7c3aed" />
    {/* Teeth */}
    <P x={12} y={8} w={2} h={1} c="#f8fafc" />
  </IconWrapper>
);

export const NagaWarriorIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Serpent body */}
    <P x={3} y={9} w={10} h={3} c="#166534" />
    <P x={1} y={11} w={3} h={2} c="#166534" />
    <P x={11} y={12} w={3} h={2} c="#166534" />
    {/* Humanoid torso */}
    <P x={5} y={5} w={6} h={4} c="#22c55e" />
    <P x={6} y={3} w={4} h={3} c="#4ade80" />
    {/* Arms with weapons */}
    <P x={3} y={5} w={2} h={3} c="#22c55e" />
    <P x={11} y={5} w={2} h={3} c="#22c55e" />
    <P x={2} y={4} w={1} h={4} c="#94a3b8" /> {/* Spear */}
    <P x={13} y={5} w={1} h={3} c="#94a3b8" /> {/* Shield edge */}
    {/* Eyes */}
    <P x={6} y={4} w={1} h={1} c="#fef08a" />
    <P x={9} y={4} w={1} h={1} c="#fef08a" />
    {/* Scale pattern */}
    <P x={4} y={10} w={1} h={1} c="#15803d" />
    <P x={7} y={10} w={1} h={1} c="#15803d" />
    <P x={10} y={10} w={1} h={1} c="#15803d" />
  </IconWrapper>
);

// ========================================
// CURSED MANOR MONSTERS
// Theme: Undead, ghosts, gothic
// ========================================

export const GhostMonsterIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Ghostly body - semi-transparent look */}
    <P x={5} y={2} w={6} h={5} c="#c4b5fd" />
    <P x={4} y={5} w={8} h={4} c="#a78bfa" />
    <P x={3} y={8} w={10} h={3} c="#8b5cf6" />
    {/* Wispy bottom */}
    <P x={4} y={11} w={2} h={2} c="#7c3aed" />
    <P x={7} y={12} w={2} h={2} c="#7c3aed" />
    <P x={10} y={11} w={2} h={2} c="#7c3aed" />
    {/* Eyes - hollow */}
    <P x={5} y={4} w={2} h={2} c="#1e1b4b" />
    <P x={9} y={4} w={2} h={2} c="#1e1b4b" />
    {/* Mouth */}
    <P x={7} y={7} w={2} h={1} c="#1e1b4b" />
    {/* Glow */}
    <P x={6} y={3} w={1} h={1} c="#e9d5ff" />
    <P x={10} y={3} w={1} h={1} c="#e9d5ff" />
  </IconWrapper>
);

export const PhantomIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Hooded figure */}
    <P x={4} y={1} w={8} h={3} c="#3f3f46" />
    <P x={3} y={3} w={10} h={6} c="#27272a" />
    <P x={5} y={9} w={6} h={4} c="#18181b" />
    {/* Void under hood */}
    <P x={5} y={3} w={6} h={3} c="#09090b" />
    {/* Glowing eyes */}
    <P x={6} y={4} w={1} h={1} c="#f43f5e" />
    <P x={9} y={4} w={1} h={1} c="#f43f5e" />
    {/* Spectral glow around edges */}
    <P x={2} y={4} w={1} h={4} c="#4c1d95" />
    <P x={13} y={4} w={1} h={4} c="#4c1d95" />
    {/* Wispy trails */}
    <P x={4} y={12} w={2} h={2} c="#4c1d95" />
    <P x={10} y={13} w={2} h={1} c="#4c1d95" />
  </IconWrapper>
);

export const WraithIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Dark ethereal form */}
    <P x={5} y={2} w={6} h={4} c="#1f2937" />
    <P x={4} y={5} w={8} h={5} c="#111827" />
    <P x={3} y={9} w={10} h={3} c="#030712" />
    {/* Skeletal face hint */}
    <P x={6} y={3} w={4} h={2} c="#374151" />
    {/* Burning eyes */}
    <P x={6} y={4} w={1} h={1} c="#22d3ee" />
    <P x={9} y={4} w={1} h={1} c="#22d3ee" />
    {/* Dark energy claws */}
    <P x={2} y={6} w={2} h={3} c="#030712" />
    <P x={1} y={7} w={1} h={3} c="#111827" />
    <P x={12} y={6} w={2} h={3} c="#030712" />
    <P x={14} y={7} w={1} h={3} c="#111827" />
    {/* Soul drain effect */}
    <P x={7} y={6} w={2} h={2} c="#06b6d4" />
    {/* Wispy bottom */}
    <P x={5} y={12} w={2} h={2} c="#1f2937" />
    <P x={9} y={13} w={2} h={1} c="#1f2937" />
  </IconWrapper>
);

export const VampireSpawnIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Pale face */}
    <P x={5} y={2} w={6} h={5} c="#e7e5e4" />
    <P x={6} y={3} w={4} h={3} c="#fafaf9" />
    {/* Dark hair */}
    <P x={4} y={1} w={8} h={2} c="#1c1917" />
    <P x={3} y={2} w={2} h={2} c="#1c1917" />
    <P x={11} y={2} w={2} h={2} c="#1c1917" />
    {/* Body - dark clothes */}
    <P x={4} y={7} w={8} h={5} c="#292524" />
    <P x={3} y={8} w={2} h={4} c="#1c1917" />
    <P x={11} y={8} w={2} h={4} c="#1c1917" />
    {/* Red eyes */}
    <P x={6} y={4} w={1} h={1} c="#dc2626" />
    <P x={9} y={4} w={1} h={1} c="#dc2626" />
    {/* Fangs */}
    <P x={6} y={6} w={1} h={1} c="#f8fafc" />
    <P x={9} y={6} w={1} h={1} c="#f8fafc" />
    {/* Blood on mouth */}
    <P x={7} y={6} w={2} h={1} c="#991b1b" />
    {/* Collar */}
    <P x={5} y={7} w={6} h={1} c="#7f1d1d" />
  </IconWrapper>
);

export const SkeletonMonsterIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Skull */}
    <P x={5} y={2} w={6} h={5} c="#e7e5e4" />
    <P x={6} y={3} w={4} h={3} c="#fafaf9" />
    {/* Eye sockets */}
    <P x={6} y={3} w={1} h={2} c="#1c1917" />
    <P x={9} y={3} w={1} h={2} c="#1c1917" />
    {/* Nose hole */}
    <P x={7} y={5} w={2} h={1} c="#57534e" />
    {/* Teeth */}
    <P x={6} y={6} w={4} h={1} c="#d6d3d1" />
    {/* Ribcage */}
    <P x={5} y={7} w={6} h={4} c="#d6d3d1" />
    <P x={6} y={8} w={1} h={2} c="#1c1917" />
    <P x={9} y={8} w={1} h={2} c="#1c1917" />
    {/* Arms */}
    <P x={3} y={7} w={2} h={1} c="#e7e5e4" />
    <P x={2} y={8} w={1} h={3} c="#e7e5e4" />
    <P x={11} y={7} w={2} h={1} c="#e7e5e4" />
    <P x={13} y={8} w={1} h={3} c="#e7e5e4" />
    {/* Legs */}
    <P x={5} y={11} w={2} h={3} c="#d6d3d1" />
    <P x={9} y={11} w={2} h={3} c="#d6d3d1" />
  </IconWrapper>
);

// ========================================
// SKY FORTRESS MONSTERS
// Theme: Wind, storms, lightning, aerial
// ========================================

export const WindElementalIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Swirling wind form */}
    <P x={5} y={3} w={6} h={6} c="#d1d5db" />
    <P x={4} y={5} w={8} h={4} c="#e5e7eb" />
    {/* Core */}
    <P x={7} y={5} w={2} h={3} c="#f3f4f6" />
    {/* Wind swirls */}
    <P x={2} y={4} w={3} h={1} c="#9ca3af" />
    <P x={11} y={5} w={3} h={1} c="#9ca3af" />
    <P x={3} y={8} w={2} h={1} c="#9ca3af" />
    <P x={11} y={7} w={2} h={1} c="#9ca3af" />
    {/* Trailing wisps */}
    <P x={4} y={10} w={2} h={2} c="#d1d5db" />
    <P x={6} y={11} w={2} h={2} c="#e5e7eb" />
    <P x={9} y={10} w={2} h={2} c="#d1d5db" />
    {/* Eyes */}
    <P x={6} y={5} w={1} h={1} c="#0891b2" />
    <P x={9} y={5} w={1} h={1} c="#0891b2" />
    {/* Lightning crackle */}
    <P x={7} y={2} w={2} h={1} c="#fbbf24" />
  </IconWrapper>
);

export const StormHawkIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Body */}
    <P x={6} y={4} w={4} h={5} c="#3f3f46" />
    <P x={7} y={3} w={2} h={2} c="#52525b" />
    {/* Wings spread */}
    <P x={1} y={5} w={5} h={3} c="#52525b" />
    <P x={10} y={5} w={5} h={3} c="#52525b" />
    <P x={2} y={4} w={3} h={1} c="#71717a" />
    <P x={11} y={4} w={3} h={1} c="#71717a" />
    {/* Tail feathers */}
    <P x={6} y={9} w={4} h={3} c="#3f3f46" />
    <P x={7} y={11} w={2} h={2} c="#27272a" />
    {/* Beak */}
    <P x={7} y={2} w={2} h={1} c="#fbbf24" />
    {/* Eyes - electric */}
    <P x={6} y={4} w={1} h={1} c="#38bdf8" />
    <P x={9} y={4} w={1} h={1} c="#38bdf8" />
    {/* Lightning on wings */}
    <P x={2} y={6} w={1} h={1} c="#fde047" />
    <P x={13} y={6} w={1} h={1} c="#fde047" />
    {/* Storm aura */}
    <P x={5} y={2} w={1} h={1} c="#93c5fd" />
    <P x={10} y={3} w={1} h={1} c="#93c5fd" />
  </IconWrapper>
);

export const LightningSpriteIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Electric body core */}
    <P x={6} y={4} w={4} h={5} c="#fde047" />
    <P x={7} y={3} w={2} h={2} c="#fef08a" />
    {/* Lightning extensions */}
    <P x={4} y={5} w={2} h={1} c="#facc15" />
    <P x={3} y={6} w={1} h={2} c="#eab308" />
    <P x={10} y={5} w={2} h={1} c="#facc15" />
    <P x={12} y={6} w={1} h={2} c="#eab308" />
    {/* Bottom sparks */}
    <P x={5} y={9} w={2} h={2} c="#fde047" />
    <P x={4} y={11} w={1} h={2} c="#facc15" />
    <P x={9} y={9} w={2} h={2} c="#fde047" />
    <P x={11} y={11} w={1} h={2} c="#facc15" />
    {/* Eyes */}
    <P x={6} y={5} w={1} h={1} c="#ffffff" />
    <P x={9} y={5} w={1} h={1} c="#ffffff" />
    {/* Bright core */}
    <P x={7} y={6} w={2} h={2} c="#ffffff" />
    {/* Electric crackling */}
    <P x={5} y={2} w={1} h={2} c="#38bdf8" />
    <P x={10} y={3} w={1} h={1} c="#38bdf8" />
  </IconWrapper>
);

export const CloudSerpentIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Serpent body - cloudy */}
    <P x={2} y={6} w={4} h={3} c="#d1d5db" />
    <P x={5} y={5} w={4} h={4} c="#e5e7eb" />
    <P x={8} y={4} w={4} h={4} c="#f3f4f6" />
    <P x={11} y={5} w={3} h={3} c="#d1d5db" />
    {/* Head */}
    <P x={11} y={3} w={3} h={3} c="#e5e7eb" />
    {/* Tail curve */}
    <P x={1} y={8} w={2} h={2} c="#9ca3af" />
    <P x={1} y={10} w={1} h={2} c="#6b7280" />
    {/* Eyes */}
    <P x={12} y={4} w={1} h={1} c="#0ea5e9" />
    {/* Horns */}
    <P x={12} y={2} w={1} h={1} c="#9ca3af" />
    <P x={14} y={3} w={1} h={1} c="#9ca3af" />
    {/* Cloud whiskers */}
    <P x={14} y={5} w={1} h={2} c="#f3f4f6" />
    {/* Storm markings */}
    <P x={3} y={7} w={1} h={1} c="#6366f1" />
    <P x={6} y={6} w={1} h={1} c="#6366f1" />
    <P x={9} y={5} w={1} h={1} c="#6366f1" />
  </IconWrapper>
);

// ========================================
// THE ABYSS MONSTERS
// Theme: Deep sea, horror, darkness
// ========================================

export const DeepOneIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Humanoid fish body */}
    <P x={5} y={2} w={6} h={5} c="#134e4a" />
    <P x={4} y={6} w={8} h={5} c="#0f766e" />
    {/* Fins on head */}
    <P x={4} y={1} w={2} h={3} c="#115e59" />
    <P x={10} y={1} w={2} h={3} c="#115e59" />
    {/* Arms with webbed claws */}
    <P x={2} y={6} w={2} h={4} c="#134e4a" />
    <P x={12} y={6} w={2} h={4} c="#134e4a" />
    <P x={1} y={9} w={2} h={2} c="#0d9488" />
    <P x={13} y={9} w={2} h={2} c="#0d9488" />
    {/* Legs */}
    <P x={5} y={11} w={2} h={3} c="#115e59" />
    <P x={9} y={11} w={2} h={3} c="#115e59" />
    {/* Eyes - large, bulging */}
    <P x={5} y={4} w={2} h={2} c="#fef08a" />
    <P x={9} y={4} w={2} h={2} c="#fef08a" />
    {/* Pupils */}
    <P x={6} y={4} w={1} h={1} c="#1e1b4b" />
    <P x={9} y={4} w={1} h={1} c="#1e1b4b" />
    {/* Gills */}
    <P x={3} y={7} w={1} h={2} c="#0f766e" />
    <P x={12} y={7} w={1} h={2} c="#0f766e" />
  </IconWrapper>
);

export const AnglerfishHorrorIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Bulbous body */}
    <P x={3} y={5} w={10} h={7} c="#1e293b" />
    <P x={5} y={4} w={6} h={2} c="#334155" />
    {/* Lure on head */}
    <P x={7} y={1} w={2} h={1} c="#475569" />
    <P x={8} y={2} w={1} h={2} c="#475569" />
    <P x={7} y={1} w={2} h={1} c="#38bdf8" /> {/* Glowing tip */}
    {/* Massive jaw */}
    <P x={2} y={9} w={12} h={3} c="#0f172a" />
    {/* Teeth */}
    <P x={3} y={9} w={1} h={2} c="#f8fafc" />
    <P x={5} y={10} w={1} h={2} c="#f8fafc" />
    <P x={7} y={9} w={1} h={2} c="#f8fafc" />
    <P x={9} y={10} w={1} h={2} c="#f8fafc" />
    <P x={11} y={9} w={1} h={2} c="#f8fafc" />
    {/* Small evil eyes */}
    <P x={5} y={6} w={1} h={1} c="#f87171" />
    <P x={10} y={6} w={1} h={1} c="#f87171" />
    {/* Fins */}
    <P x={1} y={6} w={2} h={3} c="#334155" />
    <P x={13} y={6} w={2} h={3} c="#334155" />
  </IconWrapper>
);

export const TentacleIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Main tentacle body */}
    <P x={6} y={1} w={4} h={4} c="#581c87" />
    <P x={5} y={4} w={6} h={4} c="#7c3aed" />
    <P x={4} y={7} w={8} h={3} c="#8b5cf6" />
    <P x={3} y={10} w={10} h={4} c="#a78bfa" />
    {/* Suckers */}
    <P x={5} y={5} w={1} h={1} c="#c4b5fd" />
    <P x={10} y={6} w={1} h={1} c="#c4b5fd" />
    <P x={6} y={8} w={1} h={1} c="#c4b5fd" />
    <P x={9} y={9} w={1} h={1} c="#c4b5fd" />
    <P x={5} y={11} w={1} h={1} c="#c4b5fd" />
    <P x={10} y={12} w={1} h={1} c="#c4b5fd" />
    {/* Tip splitting */}
    <P x={3} y={13} w={2} h={1} c="#a78bfa" />
    <P x={11} y={13} w={2} h={1} c="#a78bfa" />
    {/* Eye in center */}
    <P x={7} y={2} w={2} h={2} c="#fef08a" />
    <P x={7} y={3} w={1} h={1} c="#1e1b4b" />
  </IconWrapper>
);

export const AbyssalSpawnIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Amorphous dark body */}
    <P x={4} y={3} w={8} h={8} c="#0c0a09" />
    <P x={3} y={5} w={10} h={5} c="#1c1917" />
    <P x={2} y={7} w={12} h={3} c="#292524" />
    {/* Multiple eyes */}
    <P x={4} y={5} w={1} h={1} c="#f87171" />
    <P x={7} y={4} w={2} h={2} c="#ef4444" />
    <P x={11} y={6} w={1} h={1} c="#f87171" />
    <P x={5} y={8} w={1} h={1} c="#dc2626" />
    <P x={10} y={7} w={1} h={1} c="#dc2626" />
    {/* Reaching tendrils */}
    <P x={1} y={9} w={2} h={3} c="#0c0a09" />
    <P x={13} y={8} w={2} h={3} c="#0c0a09" />
    <P x={5} y={11} w={2} h={3} c="#1c1917" />
    <P x={9} y={11} w={2} h={3} c="#1c1917" />
    {/* Dark aura */}
    <P x={6} y={2} w={4} h={1} c="#292524" />
    <P x={2} y={5} w={1} h={3} c="#44403c" />
    <P x={13} y={5} w={1} h={3} c="#44403c" />
  </IconWrapper>
);

// ========================================
// VOID THRONE MONSTERS
// Theme: Void, cosmic, reality-breaking
// ========================================

export const VoidStalkerIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Void body - shifting */}
    <P x={5} y={3} w={6} h={6} c="#1e1b4b" />
    <P x={4} y={5} w={8} h={4} c="#312e81" />
    {/* Long limbs */}
    <P x={2} y={4} w={3} h={1} c="#3730a3" />
    <P x={1} y={5} w={2} h={3} c="#4338ca" />
    <P x={11} y={4} w={3} h={1} c="#3730a3" />
    <P x={13} y={5} w={2} h={3} c="#4338ca" />
    {/* Legs */}
    <P x={4} y={9} w={2} h={4} c="#312e81" />
    <P x={3} y={12} w={2} h={2} c="#3730a3" />
    <P x={10} y={9} w={2} h={4} c="#312e81" />
    <P x={11} y={12} w={2} h={2} c="#3730a3" />
    {/* Void eyes */}
    <P x={6} y={5} w={1} h={1} c="#c084fc" />
    <P x={9} y={5} w={1} h={1} c="#c084fc" />
    {/* Reality distortion marks */}
    <P x={7} y={2} w={2} h={1} c="#a855f7" />
    <P x={5} y={7} w={1} h={1} c="#a855f7" />
    <P x={10} y={6} w={1} h={1} c="#a855f7" />
    {/* Void core */}
    <P x={7} y={6} w={2} h={2} c="#0c0a09" />
  </IconWrapper>
);

export const NullShadeIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Completely dark form */}
    <P x={4} y={2} w={8} h={10} c="#09090b" />
    <P x={3} y={4} w={10} h={6} c="#0c0a09" />
    {/* Absence of features - just outline glow */}
    <P x={3} y={2} w={1} h={10} c="#4c1d95" />
    <P x={12} y={2} w={1} h={10} c="#4c1d95" />
    <P x={4} y={1} w={8} h={1} c="#4c1d95" />
    <P x={4} y={12} w={8} h={1} c="#4c1d95" />
    {/* Eyes - voids in void */}
    <P x={5} y={5} w={2} h={2} c="#18181b" />
    <P x={9} y={5} w={2} h={2} c="#18181b" />
    {/* Anti-light core */}
    <P x={7} y={7} w={2} h={2} c="#18181b" />
    {/* Wispy edges */}
    <P x={2} y={6} w={1} h={3} c="#3b0764" />
    <P x={13} y={5} w={1} h={4} c="#3b0764" />
    <P x={5} y={13} w={2} h={1} c="#3b0764" />
    <P x={9} y={13} w={2} h={1} c="#3b0764" />
  </IconWrapper>
);

export const RealityRipperIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Fractured form */}
    <P x={5} y={2} w={3} h={4} c="#7c3aed" />
    <P x={8} y={3} w={3} h={3} c="#8b5cf6" />
    <P x={4} y={5} w={4} h={4} c="#6d28d9" />
    <P x={8} y={6} w={4} h={3} c="#5b21b6" />
    <P x={3} y={9} w={5} h={3} c="#7c3aed" />
    <P x={8} y={9} w={5} h={3} c="#8b5cf6" />
    {/* Reality tears - glowing lines */}
    <P x={7} y={1} w={1} h={3} c="#f0abfc" />
    <P x={3} y={4} w={2} h={1} c="#e879f9" />
    <P x={11} y={5} w={2} h={1} c="#e879f9" />
    <P x={6} y={7} w={1} h={2} c="#f0abfc" />
    <P x={9} y={8} w={1} h={2} c="#f0abfc" />
    {/* Claws reaching through tears */}
    <P x={1} y={6} w={2} h={3} c="#4c1d95" />
    <P x={13} y={7} w={2} h={2} c="#4c1d95" />
    {/* Eyes */}
    <P x={5} y={4} w={1} h={1} c="#fef08a" />
    <P x={9} y={5} w={1} h={1} c="#fef08a" />
    {/* Void leak */}
    <P x={6} y={11} w={4} h={3} c="#0c0a09" />
  </IconWrapper>
);

export const VoidSpawnIcon = ({ size }) => (
  <IconWrapper size={size}>
    {/* Small void creature */}
    <P x={5} y={4} w={6} h={5} c="#1e1b4b" />
    <P x={4} y={6} w={8} h={3} c={" #312e81"} />
    {/* Tendrils */}
    <P x={3} y={5} w={2} h={1} c="#3730a3" />
    <P x={2} y={6} w={1} h={2} c="#4338ca" />
    <P x={11} y={5} w={2} h={1} c="#3730a3" />
    <P x={13} y={6} w={1} h={2} c="#4338ca" />
    {/* Bottom tendrils */}
    <P x={4} y={9} w={2} h={3} c="#312e81" />
    <P x={7} y={9} w={2} h={4} c="#3730a3" />
    <P x={10} y={9} w={2} h={3} c="#312e81" />
    {/* Single large eye */}
    <P x={6} y={5} w={4} h={3} c="#c084fc" />
    <P x={7} y={6} w={2} h={1} c="#0c0a09" />
    {/* Void particles */}
    <P x={3} y={3} w={1} h={1} c="#4338ca" />
    <P x={12} y={4} w={1} h={1} c="#4338ca" />
    <P x={5} y={2} w={1} h={1} c="#6366f1" />
    <P x={10} y={3} w={1} h={1} c="#6366f1" />
  </IconWrapper>
);

// Monster icon lookup map
export const RAID_MONSTER_ICONS = {
  // Sunken Temple
  drowned_zombie: DrownedZombieIcon,
  water_elemental: WaterElementalIcon,
  corrupted_fish: CorruptedFishIcon,
  naga_warrior: NagaWarriorIcon,
  // Cursed Manor
  ghost: GhostMonsterIcon,
  phantom: PhantomIcon,
  wraith: WraithIcon,
  vampire_spawn: VampireSpawnIcon,
  skeleton: SkeletonMonsterIcon,
  // Sky Fortress
  wind_elemental: WindElementalIcon,
  storm_hawk: StormHawkIcon,
  lightning_sprite: LightningSpriteIcon,
  cloud_serpent: CloudSerpentIcon,
  // The Abyss
  deep_one: DeepOneIcon,
  anglerfish_horror: AnglerfishHorrorIcon,
  tentacle: TentacleIcon,
  abyssal_spawn: AbyssalSpawnIcon,
  // Void Throne
  void_stalker: VoidStalkerIcon,
  null_shade: NullShadeIcon,
  reality_ripper: RealityRipperIcon,
  void_spawn: VoidSpawnIcon,
};

// Get raid monster icon by sprite ID
export const RaidMonsterIcon = ({ spriteId, size = 32, className = '' }) => {
  const IconComponent = RAID_MONSTER_ICONS[spriteId];
  if (!IconComponent) {
    // Fallback to a generic monster icon
    return <VoidSpawnIcon size={size} className={className} />;
  }
  return <IconComponent size={size} className={className} />;
};
