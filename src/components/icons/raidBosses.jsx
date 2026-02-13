// Raid Boss Sprites - Detailed 32x32 sprites for raid bosses
// Each raid has wing bosses and a final boss

// Helper component for 32x32 boss icons
const BossIconWrapper = ({ children, size = 64, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
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
// SUNKEN TEMPLE BOSSES
// ========================================

export const CorruptedPriestIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Robes - dark and waterlogged */}
    <P x={10} y={8} w={12} h={18} c="#1e3a5f" />
    <P x={8} y={12} w={16} h={14} c="#1e3a5f" />
    <P x={12} y={26} w={4} h={4} c="#134b6b" />
    <P x={16} y={26} w={4} h={4} c="#134b6b" />
    {/* Hood */}
    <P x={10} y={3} w={12} h={8} c="#0c2538" />
    <P x={8} y={5} w={16} h={5} c="#1e3a5f" />
    {/* Face - corrupted */}
    <P x={12} y={6} w={8} h={6} c="#4a7c59" />
    {/* Glowing eyes */}
    <P x={13} y={8} w={2} h={2} c="#22d3ee" />
    <P x={17} y={8} w={2} h={2} c="#22d3ee" />
    {/* Corrupted mouth */}
    <P x={14} y={11} w={4} h={1} c="#064e3b" />
    {/* Staff */}
    <P x={4} y={6} w={2} h={22} c="#78350f" />
    <P x={3} y={4} w={4} h={4} c="#7c3aed" />
    <P x={4} y={3} w={2} h={1} c="#a855f7" />
    {/* Water dripping effect */}
    <P x={7} y={14} w={1} h={3} c="#06b6d4" />
    <P x={24} y={16} w={1} h={2} c="#06b6d4" />
    <P x={11} y={20} w={1} h={2} c="#06b6d4" />
    {/* Dark energy aura */}
    <P x={6} y={10} w={2} h={3} c="#7c3aed" />
    <P x={24} y={11} w={2} h={2} c="#7c3aed" />
    {/* Seaweed on robes */}
    <P x={9} y={22} w={2} h={3} c="#166534" />
    <P x={21} y={21} w={2} h={4} c="#166534" />
  </BossIconWrapper>
);

export const NagaQueenIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Serpent tail */}
    <P x={4} y={20} w={24} h={6} c="#15803d" />
    <P x={2} y={22} w={6} h={6} c="#166534" />
    <P x={24} y={24} w={6} h={4} c="#166534" />
    <P x={28} y={26} w={3} h={2} c="#14532d" />
    {/* Scale pattern on tail */}
    <P x={6} y={21} w={2} h={2} c="#22c55e" />
    <P x={11} y={22} w={2} h={2} c="#22c55e" />
    <P x={16} y={21} w={2} h={2} c="#22c55e" />
    <P x={21} y={22} w={2} h={2} c="#22c55e" />
    {/* Humanoid torso */}
    <P x={10} y={10} w={12} h={10} c="#4ade80" />
    <P x={8} y={12} w={16} h={6} c="#22c55e" />
    {/* Head */}
    <P x={11} y={3} w={10} h={8} c="#86efac" />
    {/* Crown */}
    <P x={10} y={1} w={12} h={3} c="#fbbf24" />
    <P x={12} y={0} w={2} h={2} c="#f59e0b" />
    <P x={18} y={0} w={2} h={2} c="#f59e0b" />
    <P x={15} y={0} w={2} h={1} c="#fcd34d" />
    {/* Eyes */}
    <P x={13} y={5} w={2} h={2} c="#fef08a" />
    <P x={17} y={5} w={2} h={2} c="#fef08a" />
    <P x={13} y={6} w={1} h={1} c="#1e1b4b" />
    <P x={18} y={6} w={1} h={1} c="#1e1b4b" />
    {/* Arms */}
    <P x={4} y={12} w={4} h={6} c="#4ade80" />
    <P x={24} y={12} w={4} h={6} c="#4ade80" />
    {/* Trident */}
    <P x={26} y={4} w={2} h={16} c="#fbbf24" />
    <P x={24} y={2} w={2} h={4} c="#f59e0b" />
    <P x={28} y={2} w={2} h={4} c="#f59e0b" />
    <P x={26} y={1} w={2} h={3} c="#fcd34d" />
    {/* Jewelry */}
    <P x={14} y={10} w={4} h={2} c="#fbbf24" />
  </BossIconWrapper>
);

export const SeaSerpentIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Massive serpent body - coiled */}
    <P x={4} y={14} w={8} h={10} c="#0891b2" />
    <P x={10} y={18} w={12} h={8} c="#06b6d4" />
    <P x={20} y={14} w={8} h={10} c="#0891b2" />
    <P x={24} y={10} w={6} h={8} c="#22d3ee" />
    {/* Head rising from water */}
    <P x={10} y={2} w={12} h={14} c="#0e7490" />
    <P x={8} y={6} w={16} h={8} c="#0891b2" />
    {/* Crest/fins on head */}
    <P x={8} y={0} w={4} h={6} c="#164e63" />
    <P x={20} y={0} w={4} h={6} c="#164e63" />
    <P x={14} y={0} w={4} h={4} c="#155e75" />
    {/* Eyes - glowing */}
    <P x={10} y={7} w={3} h={3} c="#fef08a" />
    <P x={19} y={7} w={3} h={3} c="#fef08a" />
    <P x={11} y={8} w={1} h={1} c="#dc2626" />
    <P x={20} y={8} w={1} h={1} c="#dc2626" />
    {/* Fangs */}
    <P x={11} y={13} w={2} h={3} c="#f8fafc" />
    <P x={19} y={13} w={2} h={3} c="#f8fafc" />
    {/* Water splashing */}
    <P x={2} y={20} w={2} h={3} c="#67e8f9" />
    <P x={28} y={18} w={2} h={3} c="#67e8f9" />
    <P x={14} y={26} w={4} h={2} c="#67e8f9" />
    {/* Scales detail */}
    <P x={6} y={16} w={2} h={2} c="#22d3ee" />
    <P x={14} y={20} w={2} h={2} c="#67e8f9" />
    <P x={22} y={16} w={2} h={2} c="#22d3ee" />
    {/* Tail tip */}
    <P x={0} y={22} w={4} h={3} c="#0891b2" />
    <P x={0} y={24} w={2} h={2} c="#06b6d4" />
  </BossIconWrapper>
);

// ========================================
// CURSED MANOR BOSSES
// ========================================

export const FleshGolemIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Massive stitched body */}
    <P x={6} y={8} w={20} h={18} c="#6b7280" />
    <P x={4} y={12} w={24} h={12} c="#4b5563" />
    {/* Head - misshapen */}
    <P x={10} y={2} w={12} h={8} c="#78716c" />
    <P x={8} y={4} w={16} h={4} c="#6b7280" />
    {/* Stitches across face */}
    <P x={14} y={4} w={4} h={4} c="#374151" />
    <P x={10} y={7} w={12} h={1} c="#374151" />
    {/* Mismatched eyes */}
    <P x={10} y={4} w={3} h={3} c="#dc2626" />
    <P x={11} y={5} w={1} h={1} c="#450a0a" />
    <P x={19} y={5} w={2} h={2} c="#dc2626" />
    <P x={19} y={5} w={1} h={1} c="#450a0a" />
    {/* Crude mouth */}
    <P x={12} y={8} w={8} h={2} c="#1c1917" />
    <P x={13} y={8} w={2} h={1} c="#f8fafc" />
    <P x={17} y={8} w={2} h={1} c="#f8fafc" />
    {/* Body stitches - vertical and horizontal */}
    <P x={15} y={10} w={2} h={16} c="#374151" />
    <P x={6} y={16} w={20} h={1} c="#374151" />
    {/* Bolts/pins */}
    <P x={8} y={6} w={2} h={2} c="#9ca3af" />
    <P x={22} y={6} w={2} h={2} c="#9ca3af" />
    {/* Thick arms */}
    <P x={0} y={10} w={6} h={12} c="#6b7280" />
    <P x={26} y={10} w={6} h={12} c="#6b7280" />
    {/* Fists */}
    <P x={0} y={22} w={6} h={4} c="#57534e" />
    <P x={26} y={22} w={6} h={4} c="#57534e" />
    {/* Legs - stumpy */}
    <P x={8} y={26} w={6} h={4} c="#4b5563" />
    <P x={18} y={26} w={6} h={4} c="#4b5563" />
    {/* Exposed muscle/flesh patches */}
    <P x={8} y={14} w={4} h={3} c="#991b1b" />
    <P x={20} y={18} w={4} h={3} c="#991b1b" />
  </BossIconWrapper>
);

export const PhantomButlerIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Ghostly butler body */}
    <P x={10} y={8} w={12} h={16} c="#a78bfa" />
    <P x={8} y={12} w={16} h={10} c="#8b5cf6" />
    {/* Wispy bottom */}
    <P x={8} y={22} w={4} h={4} c="#7c3aed" />
    <P x={14} y={24} w={4} h={4} c="#7c3aed" />
    <P x={20} y={22} w={4} h={4} c="#7c3aed" />
    {/* Head with top hat */}
    <P x={11} y={2} w={10} h={8} c="#c4b5fd" />
    <P x={10} y={0} w={12} h={4} c="#1c1917" />
    <P x={8} y={3} w={16} h={2} c="#292524" />
    {/* Hollow eyes */}
    <P x={12} y={5} w={3} h={3} c="#1e1b4b" />
    <P x={17} y={5} w={3} h={3} c="#1e1b4b" />
    {/* Ghostly glow in eyes */}
    <P x={13} y={6} w={1} h={1} c="#a855f7" />
    <P x={18} y={6} w={1} h={1} c="#a855f7" />
    {/* Bow tie */}
    <P x={14} y={10} w={4} h={2} c="#1c1917" />
    <P x={15} y={9} w={2} h={1} c="#292524" />
    {/* Arms holding tray */}
    <P x={4} y={12} w={6} h={3} c="#a78bfa" />
    <P x={22} y={12} w={6} h={3} c="#a78bfa" />
    {/* Silver tray */}
    <P x={2} y={14} w={10} h={2} c="#9ca3af" />
    <P x={3} y={13} w={8} h={1} c="#d1d5db" />
    {/* Candelabra on tray */}
    <P x={5} y={10} w={2} h={3} c="#fbbf24" />
    <P x={4} y={9} w={1} h={2} c="#f59e0b" />
    <P x={8} y={9} w={1} h={2} c="#f59e0b" />
    {/* Flames */}
    <P x={4} y={7} w={1} h={2} c="#fde047" />
    <P x={8} y={7} w={1} h={2} c="#fde047" />
    <P x={6} y={8} w={1} h={2} c="#fde047" />
  </BossIconWrapper>
);

export const BansheeIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Flowing ghostly dress */}
    <P x={8} y={10} w={16} h={14} c="#c4b5fd" />
    <P x={6} y={14} w={20} h={10} c="#a78bfa" />
    <P x={4} y={20} w={6} h={8} c="#8b5cf6" />
    <P x={22} y={20} w={6} h={8} c="#8b5cf6" />
    <P x={10} y={24} w={12} h={6} c="#7c3aed" />
    {/* Floating hair */}
    <P x={6} y={2} w={20} h={10} c="#e9d5ff" />
    <P x={4} y={4} w={6} h={8} c="#d8b4fe" />
    <P x={22} y={4} w={6} h={8} c="#d8b4fe" />
    <P x={2} y={8} w={4} h={6} c="#c4b5fd" />
    <P x={26} y={8} w={4} h={6} c="#c4b5fd" />
    {/* Face */}
    <P x={11} y={6} w={10} h={8} c="#f5f5f4" />
    {/* Dark hollow eyes */}
    <P x={12} y={8} w={3} h={3} c="#0c0a09" />
    <P x={17} y={8} w={3} h={3} c="#0c0a09" />
    {/* Screaming mouth */}
    <P x={14} y={12} w={4} h={3} c="#0c0a09" />
    <P x={15} y={11} w={2} h={1} c="#1c1917" />
    {/* Arms reaching out */}
    <P x={2} y={14} w={6} h={4} c="#c4b5fd" />
    <P x={0} y={15} w={3} h={3} c="#a78bfa" />
    <P x={24} y={14} w={6} h={4} c="#c4b5fd" />
    <P x={29} y={15} w={3} h={3} c="#a78bfa" />
    {/* Sound waves */}
    <P x={0} y={10} w={2} h={1} c="#e9d5ff" />
    <P x={30} y={10} w={2} h={1} c="#e9d5ff" />
    <P x={0} y={12} w={3} h={1} c="#d8b4fe" />
    <P x={29} y={12} w={3} h={1} c="#d8b4fe" />
  </BossIconWrapper>
);

export const VampireLordIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Cape spread wide */}
    <P x={2} y={8} w={28} h={20} c="#7f1d1d" />
    <P x={4} y={10} w={24} h={16} c="#991b1b" />
    <P x={0} y={12} w={4} h={14} c="#450a0a" />
    <P x={28} y={12} w={4} h={14} c="#450a0a" />
    {/* Inner cape - red lining */}
    <P x={8} y={12} w={16} h={14} c="#dc2626" />
    {/* Body - aristocratic suit */}
    <P x={10} y={10} w={12} h={16} c="#1c1917" />
    <P x={14} y={12} w={4} h={3} c="#f8fafc" /> {/* Shirt front */}
    {/* Head */}
    <P x={11} y={2} w={10} h={10} c="#fafaf9" />
    {/* Slicked back hair */}
    <P x={10} y={0} w={12} h={4} c="#0c0a09" />
    <P x={8} y={2} w={4} h={3} c="#1c1917" />
    <P x={20} y={2} w={4} h={3} c="#1c1917" />
    {/* Widow's peak */}
    <P x={14} y={2} w={4} h={2} c="#1c1917" />
    {/* Red eyes */}
    <P x={12} y={5} w={2} h={2} c="#ef4444" />
    <P x={18} y={5} w={2} h={2} c="#ef4444" />
    <P x={13} y={5} w={1} h={1} c="#fca5a5" />
    <P x={18} y={5} w={1} h={1} c="#fca5a5" />
    {/* Fangs */}
    <P x={13} y={9} w={2} h={2} c="#f8fafc" />
    <P x={17} y={9} w={2} h={2} c="#f8fafc" />
    {/* Blood drop */}
    <P x={15} y={10} w={2} h={2} c="#dc2626" />
    {/* Hands with claws */}
    <P x={4} y={18} w={4} h={4} c="#e7e5e4" />
    <P x={24} y={18} w={4} h={4} c="#e7e5e4" />
    <P x={3} y={21} w={1} h={2} c="#dc2626" />
    <P x={28} y={21} w={1} h={2} c="#dc2626" />
  </BossIconWrapper>
);

// ========================================
// SKY FORTRESS BOSSES
// ========================================

export const WindElementalIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Swirling wind form - translucent */}
    <P x={8} y={6} w={16} h={16} c="#d1d5db" />
    <P x={6} y={10} w={20} h={8} c="#e5e7eb" />
    <P x={10} y={4} w={12} h={4} c="#f3f4f6" />
    {/* Bright core */}
    <P x={12} y={10} w={8} h={8} c="#ffffff" />
    <P x={14} y={12} w={4} h={4} c="#f0f9ff" />
    {/* Eyes - teal wind energy */}
    <P x={10} y={10} w={3} h={3} c="#0891b2" />
    <P x={19} y={10} w={3} h={3} c="#0891b2" />
    <P x={11} y={11} w={1} h={1} c="#67e8f9" />
    <P x={20} y={11} w={1} h={1} c="#67e8f9" />
    {/* Swirling wind trails - left */}
    <P x={0} y={8} w={6} h={2} c="#9ca3af" />
    <P x={2} y={12} w={5} h={1} c="#d1d5db" />
    <P x={0} y={16} w={8} h={1} c="#9ca3af" />
    <P x={4} y={20} w={4} h={1} c="#d1d5db" />
    {/* Swirling wind trails - right */}
    <P x={26} y={10} w={6} h={2} c="#9ca3af" />
    <P x={25} y={14} w={5} h={1} c="#d1d5db" />
    <P x={24} y={18} w={8} h={1} c="#9ca3af" />
    <P x={24} y={6} w={4} h={1} c="#d1d5db" />
    {/* Wispy bottom - fading */}
    <P x={6} y={22} w={6} h={4} c="#d1d5db" />
    <P x={14} y={24} w={4} h={4} c="#e5e7eb" />
    <P x={20} y={22} w={6} h={4} c="#d1d5db" />
    <P x={8} y={26} w={4} h={3} c="#e5e7eb" />
    <P x={20} y={26} w={4} h={3} c="#e5e7eb" />
    {/* Dust/debris particles */}
    <P x={4} y={6} w={2} h={2} c="#a8a29e" />
    <P x={26} y={16} w={2} h={2} c="#a8a29e" />
    <P x={2} y={20} w={1} h={1} c="#78716c" />
    <P x={29} y={8} w={1} h={1} c="#78716c" />
  </BossIconWrapper>
);

export const LightningGolemIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Massive stone body crackling with energy */}
    <P x={8} y={8} w={16} h={16} c="#fde047" />
    <P x={6} y={12} w={20} h={8} c="#facc15" />
    {/* Core glow */}
    <P x={12} y={12} w={8} h={8} c="#ffffff" />
    <P x={14} y={14} w={4} h={4} c="#fef9c3" />
    {/* Head - angular/constructed */}
    <P x={10} y={2} w={12} h={8} c="#fbbf24" />
    <P x={8} y={4} w={16} h={4} c="#f59e0b" />
    {/* Eyes - electric blue */}
    <P x={12} y={4} w={3} h={3} c="#0ea5e9" />
    <P x={17} y={4} w={3} h={3} c="#0ea5e9" />
    <P x={13} y={5} w={1} h={1} c="#bae6fd" />
    <P x={18} y={5} w={1} h={1} c="#bae6fd" />
    {/* Mouth - crackling line */}
    <P x={13} y={8} w={6} h={1} c="#38bdf8" />
    {/* Lightning bolts emanating */}
    <P x={4} y={10} w={2} h={1} c="#38bdf8" />
    <P x={2} y={11} w={2} h={1} c="#67e8f9" />
    <P x={4} y={12} w={2} h={1} c="#38bdf8" />
    <P x={26} y={10} w={2} h={1} c="#38bdf8" />
    <P x={28} y={11} w={2} h={1} c="#67e8f9" />
    <P x={26} y={12} w={2} h={1} c="#38bdf8" />
    {/* Arms - blocky golem */}
    <P x={2} y={10} w={6} h={10} c="#f59e0b" />
    <P x={24} y={10} w={6} h={10} c="#f59e0b" />
    {/* Fists crackling */}
    <P x={0} y={18} w={4} h={4} c="#eab308" />
    <P x={28} y={18} w={4} h={4} c="#eab308" />
    <P x={0} y={20} w={1} h={1} c="#38bdf8" />
    <P x={31} y={20} w={1} h={1} c="#38bdf8" />
    {/* Legs - heavy */}
    <P x={10} y={24} w={4} h={6} c="#eab308" />
    <P x={18} y={24} w={4} h={6} c="#eab308" />
    {/* Electric arc across chest */}
    <P x={12} y={10} w={1} h={2} c="#67e8f9" />
    <P x={19} y={10} w={1} h={2} c="#67e8f9" />
  </BossIconWrapper>
);

export const StormHawkIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Body - sleek raptor */}
    <P x={12} y={8} w={8} h={10} c="#3f3f46" />
    <P x={14} y={6} w={4} h={4} c="#52525b" />
    {/* Wings spread wide */}
    <P x={0} y={10} w={12} h={6} c="#52525b" />
    <P x={20} y={10} w={12} h={6} c="#52525b" />
    <P x={2} y={8} w={8} h={4} c="#71717a" />
    <P x={22} y={8} w={8} h={4} c="#71717a" />
    <P x={4} y={6} w={4} h={4} c="#a1a1aa" />
    <P x={24} y={6} w={4} h={4} c="#a1a1aa" />
    {/* Head - fierce hawk */}
    <P x={12} y={2} w={8} h={6} c="#71717a" />
    <P x={10} y={3} w={12} h={3} c="#a1a1aa" />
    {/* Sharp beak */}
    <P x={14} y={6} w={4} h={3} c="#f59e0b" />
    <P x={15} y={8} w={2} h={2} c="#fbbf24" />
    {/* Electric eyes */}
    <P x={12} y={3} w={2} h={2} c="#38bdf8" />
    <P x={18} y={3} w={2} h={2} c="#38bdf8" />
    <P x={12} y={4} w={1} h={1} c="#bae6fd" />
    <P x={19} y={4} w={1} h={1} c="#bae6fd" />
    {/* Tail feathers - sharp */}
    <P x={12} y={18} w={8} h={6} c="#3f3f46" />
    <P x={14} y={22} w={4} h={6} c="#27272a" />
    <P x={10} y={20} w={4} h={4} c="#52525b" />
    <P x={18} y={20} w={4} h={4} c="#52525b" />
    {/* Lightning crackling on wings */}
    <P x={3} y={11} w={1} h={2} c="#fde047" />
    <P x={6} y={10} w={1} h={1} c="#fbbf24" />
    <P x={28} y={11} w={1} h={2} c="#fde047" />
    <P x={25} y={10} w={1} h={1} c="#fbbf24" />
    {/* Electric trail */}
    <P x={0} y={14} w={2} h={1} c="#fde047" />
    <P x={30} y={14} w={2} h={1} c="#fde047" />
    {/* Talons */}
    <P x={10} y={16} w={3} h={3} c="#f59e0b" />
    <P x={19} y={16} w={3} h={3} c="#f59e0b" />
  </BossIconWrapper>
);

export const StormLordIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Humanoid storm form - torso */}
    <P x={8} y={10} w={16} h={16} c="#d1d5db" />
    <P x={6} y={14} w={20} h={10} c="#e5e7eb" />
    {/* Head with storm crown */}
    <P x={10} y={2} w={12} h={10} c="#f3f4f6" />
    <P x={8} y={4} w={16} h={6} c="#e5e7eb" />
    {/* Lightning crown */}
    <P x={8} y={0} w={4} h={4} c="#fde047" />
    <P x={14} y={0} w={4} h={3} c="#fbbf24" />
    <P x={20} y={0} w={4} h={4} c="#fde047" />
    <P x={12} y={0} w={2} h={2} c="#fef08a" />
    <P x={18} y={0} w={2} h={2} c="#fef08a" />
    {/* Eyes - blazing lightning */}
    <P x={11} y={5} w={3} h={3} c="#0ea5e9" />
    <P x={18} y={5} w={3} h={3} c="#0ea5e9" />
    <P x={12} y={6} w={1} h={1} c="#fef08a" />
    <P x={19} y={6} w={1} h={1} c="#fef08a" />
    {/* Stern mouth */}
    <P x={13} y={9} w={6} h={2} c="#6b7280" />
    {/* Muscular cloud arms */}
    <P x={0} y={12} w={8} h={8} c="#d1d5db" />
    <P x={24} y={12} w={8} h={8} c="#d1d5db" />
    <P x={0} y={18} w={6} h={4} c="#9ca3af" />
    <P x={26} y={18} w={6} h={4} c="#9ca3af" />
    {/* Lightning scepter in hand */}
    <P x={28} y={6} w={2} h={16} c="#fbbf24" />
    <P x={27} y={4} w={4} h={4} c="#fde047" />
    <P x={28} y={2} w={2} h={3} c="#fef08a" />
    {/* Storm base - swirling */}
    <P x={6} y={24} w={20} h={6} c="#9ca3af" />
    <P x={4} y={26} w={24} h={4} c="#6b7280" />
    {/* Rain/lightning below */}
    <P x={8} y={28} w={1} h={2} c="#38bdf8" />
    <P x={14} y={29} w={1} h={2} c="#38bdf8" />
    <P x={20} y={28} w={1} h={2} c="#38bdf8" />
    {/* Lightning in body */}
    <P x={10} y={14} w={1} h={3} c="#fde047" />
    <P x={21} y={16} w={1} h={3} c="#fbbf24" />
  </BossIconWrapper>
);

export const StormWizardIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Robes billowing in wind */}
    <P x={8} y={10} w={16} h={18} c="#3b82f6" />
    <P x={6} y={14} w={20} h={12} c="#2563eb" />
    <P x={4} y={20} w={6} h={8} c="#1d4ed8" />
    <P x={22} y={20} w={6} h={8} c="#1d4ed8" />
    {/* Wizard hat */}
    <P x={10} y={0} w={12} h={4} c="#1e40af" />
    <P x={12} y={2} w={8} h={4} c="#1d4ed8" />
    <P x={14} y={4} w={4} h={4} c="#2563eb" />
    <P x={8} y={6} w={16} h={2} c="#1e40af" />
    {/* Face */}
    <P x={11} y={7} w={10} h={6} c="#fde68a" />
    {/* Lightning eyes */}
    <P x={12} y={9} w={2} h={2} c="#fef08a" />
    <P x={18} y={9} w={2} h={2} c="#fef08a" />
    {/* Beard - flowing */}
    <P x={12} y={12} w={8} h={6} c="#e5e7eb" />
    <P x={14} y={16} w={4} h={4} c="#d1d5db" />
    {/* Staff with lightning */}
    <P x={26} y={4} w={2} h={24} c="#78350f" />
    <P x={24} y={0} w={6} h={6} c="#fbbf24" />
    {/* Lightning bolts from staff */}
    <P x={22} y={2} w={2} h={1} c="#fef08a" />
    <P x={20} y={3} w={2} h={1} c="#fde047" />
    <P x={30} y={3} w={2} h={1} c="#fef08a" />
    {/* Wind swirls */}
    <P x={2} y={12} w={4} h={1} c="#93c5fd" />
    <P x={0} y={14} w={6} h={1} c="#bfdbfe" />
    <P x={2} y={16} w={4} h={1} c="#93c5fd" />
    {/* Lightning crackling */}
    <P x={4} y={8} w={2} h={1} c="#fde047" />
    <P x={6} y={9} w={1} h={2} c="#fbbf24" />
  </BossIconWrapper>
);

export const ThunderbirdIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Massive wings spread */}
    <P x={0} y={10} w={14} h={8} c="#3f3f46" />
    <P x={18} y={10} w={14} h={8} c="#3f3f46" />
    <P x={2} y={8} w={10} h={4} c="#52525b" />
    <P x={20} y={8} w={10} h={4} c="#52525b" />
    <P x={4} y={6} w={6} h={4} c="#71717a" />
    <P x={22} y={6} w={6} h={4} c="#71717a" />
    {/* Body */}
    <P x={12} y={8} w={8} h={12} c="#52525b" />
    <P x={10} y={10} w={12} h={8} c="#3f3f46" />
    {/* Head */}
    <P x={12} y={2} w={8} h={8} c="#71717a" />
    {/* Crest */}
    <P x={14} y={0} w={4} h={4} c="#fbbf24" />
    <P x={15} y={0} w={2} h={2} c="#fde047" />
    {/* Beak */}
    <P x={14} y={6} w={4} h={3} c="#f59e0b" />
    <P x={15} y={8} w={2} h={2} c="#fbbf24" />
    {/* Lightning eyes */}
    <P x={12} y={4} w={2} h={2} c="#38bdf8" />
    <P x={18} y={4} w={2} h={2} c="#38bdf8" />
    {/* Tail feathers */}
    <P x={12} y={20} w={8} h={8} c="#3f3f46" />
    <P x={14} y={24} w={4} h={6} c="#27272a" />
    {/* Lightning on wings */}
    <P x={4} y={12} w={1} h={3} c="#fde047" />
    <P x={27} y={12} w={1} h={3} c="#fde047" />
    <P x={2} y={14} w={2} h={1} c="#fbbf24" />
    <P x={28} y={14} w={2} h={1} c="#fbbf24" />
    {/* Storm clouds */}
    <P x={0} y={4} w={6} h={3} c="#6b7280" />
    <P x={26} y={4} w={6} h={3} c="#6b7280" />
  </BossIconWrapper>
);

export const SkyTitanIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Massive cloud body */}
    <P x={4} y={10} w={24} h={18} c="#d1d5db" />
    <P x={2} y={14} w={28} h={12} c="#e5e7eb" />
    <P x={6} y={8} w={20} h={6} c="#f3f4f6" />
    {/* Head forming from clouds */}
    <P x={10} y={2} w={12} h={10} c="#f3f4f6" />
    <P x={8} y={4} w={16} h={6} c="#e5e7eb" />
    {/* Eyes - crackling with lightning */}
    <P x={11} y={5} w={3} h={3} c="#0ea5e9" />
    <P x={18} y={5} w={3} h={3} c="#0ea5e9" />
    <P x={12} y={6} w={1} h={1} c="#fef08a" />
    <P x={19} y={6} w={1} h={1} c="#fef08a" />
    {/* Mouth - stormy */}
    <P x={13} y={9} w={6} h={2} c="#6b7280" />
    {/* Arms forming from clouds */}
    <P x={0} y={14} w={6} h={8} c="#d1d5db" />
    <P x={26} y={14} w={6} h={8} c="#d1d5db" />
    <P x={0} y={18} w={4} h={6} c="#9ca3af" />
    <P x={28} y={18} w={4} h={6} c="#9ca3af" />
    {/* Lightning throughout body */}
    <P x={8} y={14} w={1} h={4} c="#fde047" />
    <P x={23} y={16} w={1} h={3} c="#fde047" />
    <P x={14} y={20} w={1} h={4} c="#fbbf24" />
    <P x={18} y={18} w={1} h={3} c="#fbbf24" />
    {/* Storm at base */}
    <P x={4} y={26} w={8} h={4} c="#6b7280" />
    <P x={20} y={26} w={8} h={4} c="#6b7280" />
    {/* Rain effect */}
    <P x={8} y={28} w={1} h={2} c="#38bdf8" />
    <P x={12} y={29} w={1} h={2} c="#38bdf8" />
    <P x={19} y={28} w={1} h={2} c="#38bdf8" />
    <P x={24} y={29} w={1} h={2} c="#38bdf8" />
  </BossIconWrapper>
);

// ========================================
// THE ABYSS BOSSES
// ========================================

export const AbyssalHorrorIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Amorphous dark body - writhing mass */}
    <P x={4} y={6} w={24} h={20} c="#0f172a" />
    <P x={2} y={10} w={28} h={14} c="#1e293b" />
    <P x={6} y={4} w={20} h={6} c="#0f172a" />
    {/* Cluster of many red eyes */}
    <P x={6} y={8} w={3} h={3} c="#ef4444" />
    <P x={12} y={6} w={4} h={4} c="#dc2626" />
    <P x={20} y={7} w={3} h={3} c="#ef4444" />
    <P x={8} y={12} w={2} h={2} c="#f87171" />
    <P x={22} y={11} w={2} h={2} c="#f87171" />
    <P x={16} y={9} w={2} h={2} c="#fca5a5" />
    {/* Central maw - gaping void */}
    <P x={10} y={14} w={12} h={10} c="#0c0a09" />
    {/* Rows of teeth */}
    <P x={10} y={14} w={2} h={3} c="#f8fafc" />
    <P x={14} y={14} w={2} h={2} c="#e5e7eb" />
    <P x={18} y={14} w={2} h={3} c="#f8fafc" />
    <P x={12} y={22} w={2} h={2} c="#e5e7eb" />
    <P x={16} y={22} w={2} h={2} c="#f8fafc" />
    {/* Writhing tentacle-arms */}
    <P x={0} y={12} w={4} h={12} c="#1e293b" />
    <P x={28} y={12} w={4} h={12} c="#1e293b" />
    <P x={0} y={20} w={2} h={8} c="#334155" />
    <P x={30} y={20} w={2} h={8} c="#334155" />
    {/* Dripping ooze */}
    <P x={6} y={24} w={2} h={4} c="#064e3b" />
    <P x={24} y={22} w={2} h={4} c="#064e3b" />
    {/* Bioluminescent patches */}
    <P x={4} y={16} w={2} h={2} c="#22d3ee" />
    <P x={26} y={14} w={2} h={2} c="#22d3ee" />
    <P x={8} y={22} w={1} h={1} c="#06b6d4" />
    <P x={23} y={24} w={1} h={1} c="#06b6d4" />
  </BossIconWrapper>
);

export const DeepOneProphetIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Tattered deep sea robes */}
    <P x={8} y={10} w={16} h={18} c="#134e4a" />
    <P x={6} y={14} w={20} h={12} c="#0f766e" />
    <P x={4} y={20} w={6} h={8} c="#115e59" />
    <P x={22} y={20} w={6} h={8} c="#115e59" />
    {/* Fish-like head */}
    <P x={10} y={2} w={12} h={10} c="#0d9488" />
    <P x={8} y={4} w={16} h={6} c="#14b8a6" />
    {/* Head fins */}
    <P x={6} y={2} w={4} h={6} c="#115e59" />
    <P x={22} y={2} w={4} h={6} c="#115e59" />
    <P x={4} y={4} w={3} h={4} c="#134e4a" />
    <P x={25} y={4} w={3} h={4} c="#134e4a" />
    {/* Large bulging fish eyes */}
    <P x={10} y={4} w={4} h={4} c="#fef08a" />
    <P x={18} y={4} w={4} h={4} c="#fef08a" />
    <P x={12} y={5} w={2} h={2} c="#1e1b4b" />
    <P x={19} y={5} w={2} h={2} c="#1e1b4b" />
    {/* Wide fish mouth */}
    <P x={12} y={9} w={8} h={2} c="#0f766e" />
    <P x={13} y={9} w={2} h={1} c="#115e59" />
    <P x={17} y={9} w={2} h={1} c="#115e59" />
    {/* Ritual staff */}
    <P x={26} y={6} w={2} h={22} c="#78350f" />
    <P x={24} y={2} w={6} h={6} c="#7c3aed" />
    <P x={26} y={4} w={2} h={2} c="#c084fc" />
    {/* Void rune glow on staff */}
    <P x={25} y={0} w={4} h={3} c="#a855f7" />
    {/* Barnacles/coral on robes */}
    <P x={7} y={16} w={2} h={2} c="#a8a29e" />
    <P x={23} y={18} w={2} h={2} c="#a8a29e" />
    {/* Webbed hands */}
    <P x={4} y={14} w={4} h={4} c="#14b8a6" />
    <P x={2} y={16} w={2} h={3} c="#0d9488" />
    {/* Dripping seawater */}
    <P x={10} y={26} w={1} h={3} c="#06b6d4" />
    <P x={20} y={24} w={1} h={3} c="#06b6d4" />
    {/* Void amulet */}
    <P x={14} y={12} w={4} h={3} c="#7c3aed" />
    <P x={15} y={13} w={2} h={1} c="#a855f7" />
  </BossIconWrapper>
);

export const AbyssalBehemothIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Massive dark body */}
    <P x={4} y={8} w={24} h={20} c="#0f172a" />
    <P x={2} y={12} w={28} h={14} c="#1e293b" />
    <P x={6} y={6} w={20} h={8} c="#0f172a" />
    {/* Multiple eyes */}
    <P x={6} y={10} w={3} h={3} c="#ef4444" />
    <P x={12} y={8} w={4} h={4} c="#dc2626" />
    <P x={20} y={9} w={3} h={3} c="#ef4444" />
    <P x={9} y={14} w={2} h={2} c="#f87171" />
    <P x={21} y={13} w={2} h={2} c="#f87171" />
    {/* Main eye */}
    <P x={13} y={12} w={6} h={6} c="#fef08a" />
    <P x={15} y={14} w={2} h={2} c="#0c0a09" />
    {/* Massive jaws */}
    <P x={8} y={20} w={16} h={8} c="#0c0a09" />
    {/* Teeth */}
    <P x={9} y={20} w={2} h={3} c="#f8fafc" />
    <P x={13} y={21} w={2} h={3} c="#f8fafc" />
    <P x={17} y={20} w={2} h={3} c="#f8fafc" />
    <P x={21} y={21} w={2} h={3} c="#f8fafc" />
    {/* Tentacles */}
    <P x={0} y={14} w={4} h={10} c="#1e293b" />
    <P x={28} y={14} w={4} h={10} c="#1e293b" />
    <P x={0} y={22} w={2} h={6} c="#334155" />
    <P x={30} y={22} w={2} h={6} c="#334155" />
    {/* Bioluminescent spots */}
    <P x={4} y={18} w={1} h={1} c="#22d3ee" />
    <P x={27} y={16} w={1} h={1} c="#22d3ee" />
    <P x={8} y={24} w={1} h={1} c="#06b6d4" />
    <P x={23} y={25} w={1} h={1} c="#06b6d4" />
  </BossIconWrapper>
);

export const KrakenIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Central body/head */}
    <P x={10} y={4} w={12} h={14} c="#581c87" />
    <P x={8} y={8} w={16} h={8} c="#7c3aed" />
    {/* Eyes */}
    <P x={11} y={8} w={3} h={4} c="#fef08a" />
    <P x={18} y={8} w={3} h={4} c="#fef08a" />
    <P x={12} y={9} w={1} h={2} c="#0c0a09" />
    <P x={19} y={9} w={1} h={2} c="#0c0a09" />
    {/* Beak */}
    <P x={14} y={14} w={4} h={4} c="#1c1917" />
    {/* Tentacles spreading out */}
    <P x={0} y={18} w={8} h={4} c="#8b5cf6" />
    <P x={24} y={18} w={8} h={4} c="#8b5cf6" />
    <P x={2} y={22} w={6} h={6} c="#7c3aed" />
    <P x={24} y={22} w={6} h={6} c="#7c3aed" />
    <P x={0} y={26} w={4} h={4} c="#6d28d9" />
    <P x={28} y={26} w={4} h={4} c="#6d28d9" />
    {/* More tentacles */}
    <P x={6} y={16} w={4} h={10} c="#a78bfa" />
    <P x={22} y={16} w={4} h={10} c="#a78bfa" />
    <P x={10} y={18} w={4} h={12} c="#8b5cf6" />
    <P x={18} y={18} w={4} h={12} c="#8b5cf6" />
    {/* Suckers */}
    <P x={7} y={20} w={2} h={2} c="#c4b5fd" />
    <P x={23} y={20} w={2} h={2} c="#c4b5fd" />
    <P x={11} y={24} w={2} h={2} c="#c4b5fd" />
    <P x={19} y={24} w={2} h={2} c="#c4b5fd" />
    <P x={3} y={24} w={2} h={2} c="#c4b5fd" />
    <P x={27} y={24} w={2} h={2} c="#c4b5fd" />
  </BossIconWrapper>
);

export const LeviathanIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Massive serpentine body */}
    <P x={0} y={14} w={32} h={8} c="#0c4a6e" />
    <P x={4} y={12} w={24} h={4} c="#0369a1" />
    <P x={8} y={10} w={16} h={4} c="#0284c7" />
    {/* Head rising */}
    <P x={2} y={2} w={14} h={14} c="#0369a1" />
    <P x={4} y={4} w={10} h={10} c="#0284c7" />
    {/* Crest fins */}
    <P x={4} y={0} w={4} h={4} c="#075985" />
    <P x={10} y={0} w={4} h={4} c="#075985" />
    <P x={6} y={0} w={6} h={2} c="#0c4a6e" />
    {/* Eyes */}
    <P x={5} y={6} w={3} h={3} c="#fef08a" />
    <P x={11} y={6} w={3} h={3} c="#fef08a" />
    <P x={6} y={7} w={1} h={1} c="#dc2626" />
    <P x={12} y={7} w={1} h={1} c="#dc2626" />
    {/* Jaws */}
    <P x={4} y={12} w={10} h={4} c="#0c4a6e" />
    <P x={5} y={13} w={2} h={2} c="#f8fafc" />
    <P x={8} y={14} w={2} h={2} c="#f8fafc" />
    <P x={11} y={13} w={2} h={2} c="#f8fafc" />
    {/* Body coils */}
    <P x={18} y={4} w={10} h={10} c="#0369a1" />
    <P x={24} y={2} w={6} h={6} c="#0284c7" />
    {/* Tail */}
    <P x={26} y={20} w={6} h={4} c="#0c4a6e" />
    <P x={30} y={18} w={2} h={8} c="#075985" />
    {/* Scale highlights */}
    <P x={6} y={14} w={2} h={2} c="#38bdf8" />
    <P x={14} y={16} w={2} h={2} c="#38bdf8" />
    <P x={22} y={14} w={2} h={2} c="#38bdf8" />
    {/* Water spray */}
    <P x={0} y={8} w={2} h={3} c="#67e8f9" />
    <P x={2} y={6} w={1} h={2} c="#a5f3fc" />
  </BossIconWrapper>
);

// ========================================
// VOID THRONE BOSSES
// ========================================

export const VoidStalkerPrimeIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Sleek predator body - crouched */}
    <P x={6} y={8} w={20} h={14} c="#1e1b4b" />
    <P x={4} y={12} w={24} h={8} c="#312e81" />
    {/* Angular head - predatory */}
    <P x={8} y={2} w={16} h={8} c="#3730a3" />
    <P x={6} y={4} w={20} h={4} c="#1e1b4b" />
    {/* Visor - narrow, menacing */}
    <P x={8} y={5} w={16} h={2} c="#c084fc" />
    <P x={10} y={5} w={4} h={1} c="#e9d5ff" />
    <P x={18} y={5} w={4} h={1} c="#e9d5ff" />
    {/* Bladed shoulders */}
    <P x={0} y={10} w={6} h={6} c="#4338ca" />
    <P x={26} y={10} w={6} h={6} c="#4338ca" />
    <P x={0} y={8} w={4} h={4} c="#3730a3" />
    <P x={28} y={8} w={4} h={4} c="#3730a3" />
    {/* Arm blades - void energy */}
    <P x={0} y={16} w={6} h={2} c="#6366f1" />
    <P x={26} y={16} w={6} h={2} c="#6366f1" />
    <P x={0} y={14} w={2} h={4} c="#818cf8" />
    <P x={30} y={14} w={2} h={4} c="#818cf8" />
    {/* Void energy core */}
    <P x={14} y={12} w={4} h={4} c="#7c3aed" />
    <P x={15} y={13} w={2} h={2} c="#a855f7" />
    {/* Legs - digitigrade stalker */}
    <P x={8} y={22} w={4} h={6} c="#312e81" />
    <P x={20} y={22} w={4} h={6} c="#312e81" />
    <P x={6} y={26} w={4} h={4} c="#1e1b4b" />
    <P x={22} y={26} w={4} h={4} c="#1e1b4b" />
    {/* Void trail */}
    <P x={12} y={24} w={8} h={2} c="#3730a3" />
    <P x={14} y={26} w={4} h={2} c="#4c1d95" />
    {/* Energy particles */}
    <P x={2} y={6} w={1} h={1} c="#8b5cf6" />
    <P x={29} y={6} w={1} h={1} c="#8b5cf6" />
    <P x={16} y={2} w={1} h={1} c="#a78bfa" />
  </BossIconWrapper>
);

export const NullShadeIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Pure void form - almost invisible */}
    <P x={8} y={4} w={16} h={20} c="#09090b" />
    <P x={6} y={8} w={20} h={12} c="#0c0a09" />
    {/* Faint purple outline - only way to see it */}
    <P x={6} y={4} w={2} h={20} c="#4c1d95" />
    <P x={24} y={4} w={2} h={20} c="#4c1d95" />
    <P x={8} y={2} w={16} h={2} c="#4c1d95" />
    <P x={8} y={24} w={16} h={2} c="#4c1d95" />
    {/* Empty void eyes - darker than dark */}
    <P x={10} y={10} w={4} h={4} c="#18181b" />
    <P x={18} y={10} w={4} h={4} c="#18181b" />
    {/* Faint eye glow outline */}
    <P x={10} y={10} w={4} h={1} c="#581c87" />
    <P x={18} y={10} w={4} h={1} c="#581c87" />
    <P x={10} y={13} w={4} h={1} c="#581c87" />
    <P x={18} y={13} w={4} h={1} c="#581c87" />
    {/* Anti-light core - consumes light */}
    <P x={13} y={14} w={6} h={4} c="#18181b" />
    <P x={14} y={15} w={4} h={2} c="#000000" />
    {/* Wispy void edges - left */}
    <P x={4} y={10} w={2} h={6} c="#3b0764" />
    <P x={2} y={14} w={2} h={4} c="#4c1d95" />
    {/* Wispy void edges - right */}
    <P x={26} y={8} w={2} h={8} c="#3b0764" />
    <P x={28} y={12} w={2} h={4} c="#4c1d95" />
    {/* Fading bottom tendrils */}
    <P x={8} y={26} w={4} h={4} c="#3b0764" />
    <P x={14} y={26} w={4} h={2} c="#09090b" />
    <P x={20} y={26} w={4} h={4} c="#3b0764" />
    {/* Void particles being absorbed */}
    <P x={4} y={6} w={1} h={1} c="#6d28d9" />
    <P x={27} y={4} w={1} h={1} c="#6d28d9" />
    <P x={2} y={20} w={1} h={1} c="#7c3aed" />
    <P x={29} y={18} w={1} h={1} c="#7c3aed" />
  </BossIconWrapper>
);

export const EntropyAvatarIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Decaying/crumbling body */}
    <P x={8} y={6} w={16} h={20} c="#581c87" />
    <P x={6} y={10} w={20} h={12} c="#6d28d9" />
    {/* Head - crumbling away */}
    <P x={10} y={0} w={12} h={8} c="#7c3aed" />
    <P x={8} y={2} w={16} h={4} c="#8b5cf6" />
    {/* Missing chunk from head */}
    <P x={18} y={0} w={6} h={3} c="#0c0a09" />
    {/* Time-warped eyes - one larger */}
    <P x={10} y={3} w={3} h={3} c="#c084fc" />
    <P x={11} y={4} w={1} h={1} c="#e9d5ff" />
    <P x={18} y={4} w={2} h={2} c="#c084fc" />
    {/* Mouth - dissolving */}
    <P x={13} y={7} w={6} h={2} c="#4c1d95" />
    {/* Arms - one intact, one crumbling */}
    <P x={2} y={10} w={6} h={8} c="#7c3aed" />
    <P x={0} y={14} w={4} h={4} c="#8b5cf6" />
    <P x={24} y={10} w={6} h={6} c="#6d28d9" />
    {/* Missing arm chunk */}
    <P x={28} y={14} w={4} h={4} c="#0c0a09" />
    {/* Decay particles floating away */}
    <P x={4} y={4} w={2} h={2} c="#a855f7" />
    <P x={26} y={6} w={2} h={2} c="#a855f7" />
    <P x={2} y={8} w={1} h={1} c="#8b5cf6" />
    <P x={29} y={2} w={1} h={1} c="#8b5cf6" />
    <P x={0} y={22} w={2} h={2} c="#7c3aed" />
    <P x={30} y={20} w={2} h={2} c="#7c3aed" />
    {/* Body holes - entropy consuming */}
    <P x={10} y={14} w={3} h={3} c="#0c0a09" />
    <P x={20} y={18} w={3} h={3} c="#0c0a09" />
    {/* Crumbling base */}
    <P x={6} y={22} w={4} h={4} c="#4c1d95" />
    <P x={22} y={22} w={4} h={4} c="#4c1d95" />
    <P x={12} y={24} w={8} h={4} c="#581c87" />
    {/* Entropy aura */}
    <P x={6} y={26} w={2} h={2} c="#3b0764" />
    <P x={24} y={26} w={2} h={2} c="#3b0764" />
    {/* Time distortion particles */}
    <P x={6} y={2} w={1} h={1} c="#d8b4fe" />
    <P x={25} y={0} w={1} h={1} c="#d8b4fe" />
  </BossIconWrapper>
);

export const VoidGodIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Massive void entity - fills the frame */}
    <P x={2} y={4} w={28} h={24} c="#0c0a09" />
    <P x={0} y={8} w={32} h={18} c="#18181b" />
    {/* Crown of void energy - more elaborate than emperor */}
    <P x={6} y={0} w={20} h={6} c="#4c1d95" />
    <P x={8} y={0} w={4} h={4} c="#7c3aed" />
    <P x={14} y={0} w={4} h={3} c="#a855f7" />
    <P x={20} y={0} w={4} h={4} c="#7c3aed" />
    <P x={4} y={2} w={4} h={4} c="#6d28d9" />
    <P x={24} y={2} w={4} h={4} c="#6d28d9" />
    {/* Central all-seeing eye */}
    <P x={12} y={10} w={8} h={6} c="#a855f7" />
    <P x={14} y={12} w={4} h={2} c="#c084fc" />
    <P x={15} y={12} w={2} h={2} c="#0c0a09" />
    {/* Surrounding smaller eyes */}
    <P x={6} y={8} w={4} h={4} c="#c084fc" />
    <P x={22} y={8} w={4} h={4} c="#c084fc" />
    <P x={7} y={9} w={2} h={2} c="#0c0a09" />
    <P x={23} y={9} w={2} h={2} c="#0c0a09" />
    <P x={4} y={14} w={3} h={3} c="#8b5cf6" />
    <P x={25} y={14} w={3} h={3} c="#8b5cf6" />
    <P x={5} y={15} w={1} h={1} c="#0c0a09" />
    <P x={26} y={15} w={1} h={1} c="#0c0a09" />
    {/* Void tendrils - reaching outward */}
    <P x={0} y={12} w={4} h={12} c="#1e1b4b" />
    <P x={28} y={12} w={4} h={12} c="#1e1b4b" />
    <P x={0} y={20} w={2} h={8} c="#312e81" />
    <P x={30} y={20} w={2} h={8} c="#312e81" />
    {/* Reality dissolving at edges */}
    <P x={2} y={6} w={2} h={1} c="#6366f1" />
    <P x={28} y={8} w={2} h={1} c="#6366f1" />
    <P x={4} y={26} w={3} h={1} c="#818cf8" />
    <P x={25} y={27} w={3} h={1} c="#818cf8" />
    {/* Void aura - pulsing */}
    <P x={6} y={4} w={1} h={2} c="#3730a3" />
    <P x={25} y={5} w={1} h={2} c="#3730a3" />
    {/* Stars being consumed */}
    <P x={4} y={18} w={1} h={1} c="#fef08a" />
    <P x={27} y={20} w={1} h={1} c="#fef08a" />
    <P x={14} y={24} w={1} h={1} c="#fde047" />
    {/* Void maw at bottom */}
    <P x={10} y={20} w={12} h={6} c="#000000" />
    <P x={12} y={20} w={2} h={2} c="#f8fafc" />
    <P x={18} y={20} w={2} h={2} c="#f8fafc" />
  </BossIconWrapper>
);

export const VoidSentinelIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Armored void being */}
    <P x={8} y={6} w={16} h={20} c="#1e1b4b" />
    <P x={6} y={10} w={20} h={14} c="#312e81" />
    {/* Helmet */}
    <P x={10} y={2} w={12} h={8} c="#3730a3" />
    <P x={8} y={4} w={16} h={4} c="#4338ca" />
    {/* Visor - glowing */}
    <P x={11} y={5} w={10} h={2} c="#c084fc" />
    {/* Armor plates */}
    <P x={6} y={14} w={20} h={4} c="#4338ca" />
    <P x={8} y={18} w={16} h={4} c="#3730a3" />
    {/* Shoulders */}
    <P x={2} y={10} w={6} h={6} c="#4338ca" />
    <P x={24} y={10} w={6} h={6} c="#4338ca" />
    <P x={0} y={12} w={4} h={4} c="#3730a3" />
    <P x={28} y={12} w={4} h={4} c="#3730a3" />
    {/* Void sword */}
    <P x={28} y={4} w={3} h={20} c="#6366f1" />
    <P x={29} y={2} w={2} h={4} c="#818cf8" />
    <P x={30} y={0} w={1} h={4} c="#a5b4fc" />
    {/* Void energy core */}
    <P x={14} y={14} w={4} h={4} c="#7c3aed" />
    <P x={15} y={15} w={2} h={2} c="#a855f7" />
    {/* Void particles */}
    <P x={4} y={8} w={1} h={1} c="#8b5cf6" />
    <P x={27} y={6} w={1} h={1} c="#8b5cf6" />
    <P x={12} y={24} w={1} h={1} c="#a78bfa" />
    <P x={19} y={25} w={1} h={1} c="#a78bfa" />
    {/* Legs */}
    <P x={10} y={24} w={4} h={6} c="#312e81" />
    <P x={18} y={24} w={4} h={6} c="#312e81" />
  </BossIconWrapper>
);

export const RealityShaperIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Fragmented body - reality-warped */}
    <P x={8} y={6} w={8} h={10} c="#7c3aed" />
    <P x={16} y={8} w={8} h={8} c="#8b5cf6" />
    <P x={6} y={14} w={10} h={8} c="#6d28d9" />
    <P x={16} y={16} w={10} h={8} c="#5b21b6" />
    {/* Floating head */}
    <P x={10} y={0} w={12} h={8} c="#a78bfa" />
    <P x={12} y={2} w={8} h={4} c="#c4b5fd" />
    {/* Eyes - different sizes (distorted) */}
    <P x={12} y={3} w={2} h={2} c="#fef08a" />
    <P x={17} y={2} w={3} h={3} c="#fef08a" />
    {/* Reality tears */}
    <P x={4} y={8} w={2} h={6} c="#f0abfc" />
    <P x={26} y={10} w={2} h={8} c="#e879f9" />
    <P x={14} y={4} w={1} h={4} c="#f5d0fe" />
    <P x={6} y={20} w={1} h={6} c="#e879f9" />
    <P x={24} y={22} w={2} h={4} c="#f0abfc" />
    {/* Floating fragments */}
    <P x={0} y={12} w={4} h={4} c="#7c3aed" />
    <P x={2} y={18} w={3} h={3} c="#8b5cf6" />
    <P x={28} y={14} w={3} h={3} c="#7c3aed" />
    <P x={26} y={20} w={4} h={3} c="#8b5cf6" />
    {/* Hands manipulating reality */}
    <P x={2} y={10} w={4} h={4} c="#a78bfa" />
    <P x={0} y={8} w={2} h={6} c="#c4b5fd" />
    <P x={26} y={8} w={4} h={4} c="#a78bfa" />
    <P x={30} y={6} w={2} h={8} c="#c4b5fd" />
    {/* Void particles */}
    <P x={8} y={2} w={1} h={1} c="#0c0a09" />
    <P x={22} y={4} w={1} h={1} c="#0c0a09" />
    <P x={12} y={26} w={2} h={2} c="#0c0a09" />
  </BossIconWrapper>
);

export const VoidEmperorIcon = ({ size }) => (
  <BossIconWrapper size={size}>
    {/* Massive void entity */}
    <P x={4} y={6} w={24} h={22} c="#0c0a09" />
    <P x={2} y={10} w={28} h={16} c="#18181b" />
    {/* Crown of void energy */}
    <P x={8} y={0} w={16} h={6} c="#4c1d95" />
    <P x={10} y={0} w={4} h={4} c="#7c3aed" />
    <P x={18} y={0} w={4} h={4} c="#7c3aed" />
    <P x={14} y={0} w={4} h={2} c="#a855f7" />
    <P x={6} y={2} w={4} h={4} c="#6d28d9" />
    <P x={22} y={2} w={4} h={4} c="#6d28d9" />
    {/* Face - void with eyes */}
    <P x={8} y={8} w={16} h={10} c="#1e1b4b" />
    {/* Multiple void eyes */}
    <P x={9} y={10} w={4} h={4} c="#c084fc" />
    <P x={19} y={10} w={4} h={4} c="#c084fc" />
    <P x={14} y={12} w={4} h={4} c="#a855f7" />
    {/* Void pupils */}
    <P x={10} y={11} w={2} h={2} c="#0c0a09" />
    <P x={20} y={11} w={2} h={2} c="#0c0a09" />
    <P x={15} y={13} w={2} h={2} c="#0c0a09" />
    {/* Void tendrils */}
    <P x={0} y={14} w={4} h={10} c="#1e1b4b" />
    <P x={28} y={14} w={4} h={10} c="#1e1b4b" />
    <P x={0} y={20} w={2} h={8} c="#312e81" />
    <P x={30} y={20} w={2} h={8} c="#312e81" />
    {/* Reality dissolving at edges */}
    <P x={2} y={8} w={2} h={1} c="#6366f1" />
    <P x={28} y={10} w={2} h={1} c="#6366f1" />
    <P x={4} y={26} w={3} h={1} c="#818cf8" />
    <P x={25} y={27} w={3} h={1} c="#818cf8" />
    {/* Void aura */}
    <P x={6} y={4} w={1} h={2} c="#3730a3" />
    <P x={25} y={5} w={1} h={2} c="#3730a3" />
    <P x={14} y={26} w={4} h={2} c="#4338ca" />
  </BossIconWrapper>
);

// Boss icon lookup map
export const RAID_BOSS_ICONS = {
  // Sunken Temple
  boss_corrupted_priest: CorruptedPriestIcon,
  boss_naga_queen: NagaQueenIcon,
  boss_sea_serpent: SeaSerpentIcon,
  // Cursed Manor
  boss_phantom_butler: PhantomButlerIcon,
  boss_banshee: BansheeIcon,
  boss_banshee_queen: BansheeIcon,
  boss_flesh_golem: FleshGolemIcon,
  boss_vampire_lord: VampireLordIcon,
  // Sky Fortress
  boss_storm_wizard: StormWizardIcon,
  boss_wind_elemental: WindElementalIcon,
  boss_thunderbird: ThunderbirdIcon,
  boss_lightning_golem: LightningGolemIcon,
  boss_sky_titan: SkyTitanIcon,
  boss_storm_hawk: StormHawkIcon,
  boss_storm_lord: StormLordIcon,
  // The Abyss
  boss_abyssal_behemoth: AbyssalBehemothIcon,
  boss_abyssal_horror: AbyssalHorrorIcon,
  boss_kraken: KrakenIcon,
  boss_deep_one_prophet: DeepOneProphetIcon,
  boss_leviathan: LeviathanIcon,
  // Void Throne
  boss_void_sentinel: VoidSentinelIcon,
  boss_void_stalker_prime: VoidStalkerPrimeIcon,
  boss_reality_shaper: RealityShaperIcon,
  boss_reality_ripper: RealityShaperIcon,
  boss_null_shade: NullShadeIcon,
  boss_null_shade_omega: NullShadeIcon,
  boss_entropy_avatar: EntropyAvatarIcon,
  boss_void_emperor: VoidEmperorIcon,
  boss_void_god: VoidGodIcon,
};

// Get raid boss icon by sprite ID
export const RaidBossIcon = ({ spriteId, size = 64, className = '' }) => {
  const IconComponent = RAID_BOSS_ICONS[spriteId];
  if (!IconComponent) {
    // Fallback
    return <VoidEmperorIcon size={size} className={className} />;
  }
  return <IconComponent size={size} className={className} />;
};
