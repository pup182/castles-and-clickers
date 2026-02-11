// Base class icons WITHOUT weapons - for use with weapon overlay system
// Accepts armorColor prop to tint armor based on equipment rarity

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

const P = ({ x, y, c, w = 1, h = 1 }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} />
);

// === TANK CLASSES ===

export const WarriorBase = ({ size, className, armorColor }) => (
  <IconWrapper size={size} className={className}>
    {/* Helmet */}
    <P x={5} y={1} w={6} h={1} c="#6b7280" />
    <P x={4} y={2} w={8} h={2} c="#9ca3af" />
    <P x={5} y={2} w={6} h={1} c="#d1d5db" />
    {/* Face */}
    <P x={5} y={4} w={6} h={3} c="#fbbf24" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    {/* Armor - main piece uses armorColor */}
    <P x={4} y={7} w={8} h={4} c={armorColor || "#6b7280"} />
    <P x={5} y={8} w={6} h={2} c="#9ca3af" />
    <P x={7} y={7} w={2} h={1} c="#fbbf24" />
    {/* Legs */}
    <P x={5} y={11} w={2} h={3} c="#4b5563" />
    <P x={9} y={11} w={2} h={3} c="#4b5563" />
    {/* Feet */}
    <P x={4} y={14} w={3} h={2} c="#78350f" />
    <P x={9} y={14} w={3} h={2} c="#78350f" />
  </IconWrapper>
);

export const PaladinBase = ({ size, className, armorColor }) => (
  <IconWrapper size={size} className={className}>
    {/* Crown/Helmet */}
    <P x={6} y={0} w={4} h={1} c="#fbbf24" />
    <P x={5} y={1} w={6} h={2} c="#fbbf24" />
    <P x={4} y={2} w={8} h={2} c="#9ca3af" />
    {/* Face */}
    <P x={5} y={4} w={6} h={3} c="#fbbf24" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    {/* Armor - main piece uses armorColor */}
    <P x={4} y={7} w={8} h={4} c={armorColor || "#fbbf24"} />
    <P x={5} y={8} w={6} h={2} c="#fcd34d" />
    {/* Cross on chest */}
    <P x={7} y={7} w={2} h={3} c="#f3f4f6" />
    <P x={6} y={8} w={4} h={1} c="#f3f4f6" />
    {/* Legs */}
    <P x={5} y={11} w={2} h={3} c="#d97706" />
    <P x={9} y={11} w={2} h={3} c="#d97706" />
    {/* Feet */}
    <P x={4} y={14} w={3} h={2} c="#92400e" />
    <P x={9} y={14} w={3} h={2} c="#92400e" />
  </IconWrapper>
);

export const KnightBase = ({ size, className, armorColor }) => (
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
    {/* Armor - main piece uses armorColor */}
    <P x={4} y={7} w={8} h={4} c={armorColor || "#6b7280"} />
    <P x={5} y={8} w={6} h={2} c="#9ca3af" />
    {/* Legs */}
    <P x={5} y={11} w={2} h={3} c="#4b5563" />
    <P x={9} y={11} w={2} h={3} c="#4b5563" />
    {/* Feet */}
    <P x={4} y={14} w={3} h={2} c="#374151" />
    <P x={9} y={14} w={3} h={2} c="#374151" />
  </IconWrapper>
);

// === HEALER CLASSES ===

export const ClericBase = ({ size, className, armorColor }) => (
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
    {/* Robe - main piece uses armorColor */}
    <P x={4} y={7} w={8} h={5} c={armorColor || "#f3f4f6"} />
    <P x={5} y={8} w={6} h={3} c="#e5e7eb" />
    {/* Cross emblem */}
    <P x={7} y={8} w={2} h={3} c="#fbbf24" />
    <P x={6} y={9} w={4} h={1} c="#fbbf24" />
    {/* Feet */}
    <P x={5} y={12} w={2} h={2} c="#d1d5db" />
    <P x={9} y={12} w={2} h={2} c="#d1d5db" />
  </IconWrapper>
);

export const DruidBase = ({ size, className, armorColor }) => (
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
    {/* Robe - main piece uses armorColor */}
    <P x={4} y={7} w={8} h={5} c={armorColor || "#166534"} />
    <P x={5} y={8} w={6} h={3} c="#15803d" />
    {/* Leaf emblem */}
    <P x={7} y={8} w={2} h={2} c="#22c55e" />
    {/* Feet */}
    <P x={5} y={12} w={2} h={2} c="#14532d" />
    <P x={9} y={12} w={2} h={2} c="#14532d" />
  </IconWrapper>
);

export const ShamanBase = ({ size, className, armorColor }) => (
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
    {/* Robe - main piece uses armorColor */}
    <P x={4} y={7} w={8} h={5} c={armorColor || "#1e40af"} />
    <P x={5} y={8} w={6} h={3} c="#2563eb" />
    {/* Lightning emblem */}
    <P x={7} y={8} w={1} h={1} c="#fbbf24" />
    <P x={8} y={9} w={1} h={1} c="#fbbf24" />
    <P x={7} y={10} w={1} h={1} c="#fbbf24" />
    {/* Feet */}
    <P x={5} y={12} w={2} h={2} c="#1e3a8a" />
    <P x={9} y={12} w={2} h={2} c="#1e3a8a" />
  </IconWrapper>
);

// === DPS CLASSES ===

export const MageBase = ({ size, className, armorColor }) => (
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
    {/* Robe - main piece uses armorColor */}
    <P x={4} y={7} w={8} h={5} c={armorColor || "#7c3aed"} />
    <P x={5} y={8} w={6} h={3} c="#8b5cf6" />
    {/* Feet */}
    <P x={5} y={12} w={2} h={2} c="#5b21b6" />
    <P x={9} y={12} w={2} h={2} c="#5b21b6" />
  </IconWrapper>
);

export const RogueBase = ({ size, className, armorColor }) => (
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
    {/* Cloak - main piece uses armorColor */}
    <P x={3} y={7} w={10} h={4} c={armorColor || "#374151"} />
    <P x={5} y={8} w={6} h={2} c="#4b5563" />
    {/* Legs */}
    <P x={5} y={11} w={2} h={3} c="#1f2937" />
    <P x={9} y={11} w={2} h={3} c="#1f2937" />
    {/* Feet */}
    <P x={4} y={14} w={3} h={2} c="#374151" />
    <P x={9} y={14} w={3} h={2} c="#374151" />
  </IconWrapper>
);

export const RangerBase = ({ size, className, armorColor }) => (
  <IconWrapper size={size} className={className}>
    {/* Hood */}
    <P x={5} y={1} w={6} h={2} c="#166534" />
    <P x={4} y={3} w={8} h={1} c="#15803d" />
    {/* Face */}
    <P x={5} y={4} w={6} h={3} c="#fbbf24" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    {/* Cloak - main piece uses armorColor */}
    <P x={3} y={7} w={10} h={4} c={armorColor || "#166534"} />
    <P x={5} y={8} w={6} h={2} c="#15803d" />
    {/* Legs */}
    <P x={5} y={11} w={2} h={3} c="#14532d" />
    <P x={9} y={11} w={2} h={3} c="#14532d" />
    {/* Feet */}
    <P x={4} y={14} w={3} h={2} c="#78350f" />
    <P x={9} y={14} w={3} h={2} c="#78350f" />
  </IconWrapper>
);

export const NecromancerBase = ({ size, className, armorColor }) => (
  <IconWrapper size={size} className={className}>
    {/* Hood */}
    <P x={5} y={1} w={6} h={2} c="#1f2937" />
    <P x={4} y={3} w={8} h={1} c="#374151" />
    {/* Skull face */}
    <P x={5} y={4} w={6} h={3} c="#e5e7eb" />
    <P x={6} y={5} w={1} h={1} c="#1f2937" />
    <P x={9} y={5} w={1} h={1} c="#1f2937" />
    <P x={7} y={6} w={2} h={1} c="#1f2937" />
    {/* Robe - main piece uses armorColor */}
    <P x={4} y={7} w={8} h={5} c={armorColor || "#1f2937"} />
    <P x={5} y={8} w={6} h={3} c="#374151" />
    {/* Skull emblem */}
    <P x={7} y={8} w={2} h={2} c="#a855f7" />
    {/* Feet */}
    <P x={5} y={12} w={2} h={2} c="#111827" />
    <P x={9} y={12} w={2} h={2} c="#111827" />
  </IconWrapper>
);

// Export all base icons
export const CLASS_BASE_ICONS = {
  warrior: WarriorBase,
  mage: MageBase,
  rogue: RogueBase,
  cleric: ClericBase,
  paladin: PaladinBase,
  knight: KnightBase,
  druid: DruidBase,
  shaman: ShamanBase,
  ranger: RangerBase,
  necromancer: NecromancerBase,
};
