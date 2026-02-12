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
  boss_banshee_queen: BansheeIcon,  // Alias for raids.js
  boss_flesh_golem: PhantomButlerIcon,  // Fallback - needs unique sprite
  boss_vampire_lord: VampireLordIcon,
  // Sky Fortress
  boss_storm_wizard: StormWizardIcon,
  boss_wind_elemental: StormWizardIcon,  // Alias for raids.js
  boss_thunderbird: ThunderbirdIcon,
  boss_lightning_golem: ThunderbirdIcon,  // Alias for raids.js
  boss_sky_titan: SkyTitanIcon,
  boss_storm_hawk: SkyTitanIcon,  // Alias for raids.js
  boss_storm_lord: SkyTitanIcon,  // Alias for raids.js final boss
  // The Abyss
  boss_abyssal_behemoth: AbyssalBehemothIcon,
  boss_abyssal_horror: AbyssalBehemothIcon,  // Alias for raids.js
  boss_kraken: KrakenIcon,
  boss_deep_one_prophet: KrakenIcon,  // Fallback - needs unique sprite
  boss_leviathan: LeviathanIcon,
  // Void Throne
  boss_void_sentinel: VoidSentinelIcon,
  boss_void_stalker_prime: VoidSentinelIcon,  // Alias for raids.js
  boss_reality_shaper: RealityShaperIcon,
  boss_reality_ripper: RealityShaperIcon,  // Alias for raids.js
  boss_null_shade: RealityShaperIcon,  // Fallback - needs unique sprite
  boss_null_shade_omega: RealityShaperIcon,  // Alias for raids.js
  boss_entropy_avatar: RealityShaperIcon,  // Fallback - needs unique sprite
  boss_void_emperor: VoidEmperorIcon,
  boss_void_god: VoidEmperorIcon,  // Alias for raids.js
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
