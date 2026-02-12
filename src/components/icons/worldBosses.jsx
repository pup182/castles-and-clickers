// World Boss SVG sprites - pixel art style
// Large detailed sprites for world bosses (32x32 grid, rendered at larger sizes)

const IconWrapper = ({ children, size = 64, className = '' }) => (
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

const P = ({ x, y, c, w = 1, h = 1 }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} />
);

// === WORLD BOSS SPRITES ===

// Crystal Guardian - Level 5 - Geometric crystal construct
export const CrystalGuardianSprite = ({ size = 64 }) => (
  <IconWrapper size={size}>
    {/* Crystal body core */}
    <P x={10} y={8} w={12} h={16} c="#06b6d4" />
    <P x={12} y={6} w={8} h={2} c="#22d3ee" />
    <P x={14} y={4} w={4} h={2} c="#67e8f9" />

    {/* Crystal facets - left */}
    <P x={6} y={10} w={4} h={12} c="#0891b2" />
    <P x={4} y={12} w={2} h={8} c="#0e7490" />
    <P x={8} y={8} w={2} h={2} c="#22d3ee" />

    {/* Crystal facets - right */}
    <P x={22} y={10} w={4} h={12} c="#0891b2" />
    <P x={26} y={12} w={2} h={8} c="#0e7490" />
    <P x={22} y={8} w={2} h={2} c="#22d3ee" />

    {/* Head/top crystal */}
    <P x={12} y={2} w={8} h={6} c="#67e8f9" />
    <P x={14} y={0} w={4} h={2} c="#a5f3fc" />

    {/* Eyes - glowing */}
    <P x={12} y={10} w={3} h={3} c="#fef3c7" />
    <P x={17} y={10} w={3} h={3} c="#fef3c7" />
    <P x={13} y={11} w={1} h={1} c="#06b6d4" />
    <P x={18} y={11} w={1} h={1} c="#06b6d4" />

    {/* Inner glow */}
    <P x={14} y={14} w={4} h={6} c="#a5f3fc" />
    <P x={15} y={15} w={2} h={4} c="#ecfeff" />

    {/* Crystal arms */}
    <P x={2} y={14} w={4} h={6} c="#0891b2" />
    <P x={0} y={16} w={2} h={4} c="#06b6d4" />
    <P x={26} y={14} w={4} h={6} c="#0891b2" />
    <P x={30} y={16} w={2} h={4} c="#06b6d4" />

    {/* Base/legs */}
    <P x={10} y={24} w={4} h={6} c="#0e7490" />
    <P x={18} y={24} w={4} h={6} c="#0e7490" />
    <P x={8} y={28} w={4} h={2} c="#155e75" />
    <P x={20} y={28} w={4} h={2} c="#155e75" />

    {/* Crystal shards floating */}
    <P x={4} y={4} w={2} h={3} c="#67e8f9" />
    <P x={26} y={4} w={2} h={3} c="#67e8f9" />
    <P x={6} y={26} w={2} h={2} c="#22d3ee" />
    <P x={24} y={26} w={2} h={2} c="#22d3ee" />
  </IconWrapper>
);

// Crypt Lord - Level 10 - Skeletal king with crown
export const CryptLordSprite = ({ size = 64 }) => (
  <IconWrapper size={size}>
    {/* Robes */}
    <P x={8} y={12} w={16} h={18} c="#1e1b4b" />
    <P x={6} y={14} w={20} h={14} c="#312e81" />
    <P x={10} y={16} w={12} h={12} c="#1e1b4b" />

    {/* Robe trim */}
    <P x={6} y={28} w={20} h={2} c="#fbbf24" />

    {/* Skeletal torso showing */}
    <P x={12} y={14} w={8} h={6} c="#e5e7eb" />
    <P x={14} y={16} w={4} h={2} c="#d1d5db" />

    {/* Skull head */}
    <P x={10} y={4} w={12} h={10} c="#e5e7eb" />
    <P x={12} y={2} w={8} h={2} c="#f3f4f6" />

    {/* Eye sockets with glow */}
    <P x={12} y={6} w={3} h={4} c="#1f2937" />
    <P x={17} y={6} w={3} h={4} c="#1f2937" />
    <P x={13} y={7} w={1} h={2} c="#84cc16" />
    <P x={18} y={7} w={1} h={2} c="#84cc16" />

    {/* Nose hole */}
    <P x={15} y={10} w={2} h={2} c="#1f2937" />

    {/* Jaw */}
    <P x={12} y={12} w={8} h={2} c="#d1d5db" />

    {/* Crown */}
    <P x={10} y={0} w={12} h={4} c="#fbbf24" />
    <P x={12} y={-2} w={2} h={2} c="#f59e0b" />
    <P x={15} y={-2} w={2} h={2} c="#f59e0b" />
    <P x={18} y={-2} w={2} h={2} c="#f59e0b" />
    {/* Crown jewels */}
    <P x={13} y={1} w={1} h={1} c="#ef4444" />
    <P x={16} y={0} w={1} h={2} c="#22c55e" />
    <P x={18} y={1} w={1} h={1} c="#3b82f6" />

    {/* Skeletal arms */}
    <P x={4} y={14} w={4} h={8} c="#d1d5db" />
    <P x={2} y={18} w={2} h={4} c="#e5e7eb" />
    <P x={24} y={14} w={4} h={8} c="#d1d5db" />
    <P x={28} y={18} w={2} h={4} c="#e5e7eb" />

    {/* Staff */}
    <P x={28} y={4} w={2} h={24} c="#78350f" />
    <P x={26} y={2} w={6} h={4} c="#84cc16" />
    <P x={28} y={3} w={2} h={2} c="#bef264" />

    {/* Dark aura wisps */}
    <P x={6} y={8} w={2} h={2} c="#4c1d95" />
    <P x={24} y={8} w={2} h={2} c="#4c1d95" />
  </IconWrapper>
);

// Forest Ancient - Level 15 - Massive tree creature
export const ForestAncientSprite = ({ size = 64 }) => (
  <IconWrapper size={size}>
    {/* Main trunk body */}
    <P x={10} y={10} w={12} h={20} c="#78350f" />
    <P x={12} y={8} w={8} h={2} c="#92400e" />

    {/* Bark texture */}
    <P x={12} y={12} w={2} h={4} c="#57351c" />
    <P x={18} y={14} w={2} h={6} c="#57351c" />
    <P x={14} y={20} w={3} h={4} c="#57351c" />

    {/* Leafy crown */}
    <P x={6} y={0} w={20} h={10} c="#15803d" />
    <P x={4} y={2} w={24} h={6} c="#166534" />
    <P x={8} y={0} w={16} h={2} c="#22c55e" />
    <P x={10} y={-2} w={4} h={2} c="#22c55e" />
    <P x={18} y={-2} w={4} h={2} c="#22c55e" />

    {/* Leaf highlights */}
    <P x={8} y={2} w={3} h={2} c="#4ade80" />
    <P x={14} y={1} w={4} h={2} c="#4ade80" />
    <P x={22} y={3} w={2} h={2} c="#4ade80" />

    {/* Face - glowing eyes */}
    <P x={12} y={10} w={3} h={3} c="#fbbf24" />
    <P x={17} y={10} w={3} h={3} c="#fbbf24" />
    <P x={13} y={11} w={1} h={1} c="#15803d" />
    <P x={18} y={11} w={1} h={1} c="#15803d" />

    {/* Nose/bark feature */}
    <P x={15} y={12} w={2} h={3} c="#57351c" />

    {/* Mouth - grimace */}
    <P x={13} y={16} w={6} h={2} c="#451a03" />
    <P x={14} y={15} w={1} h={1} c="#451a03" />
    <P x={17} y={15} w={1} h={1} c="#451a03" />

    {/* Branch arms */}
    <P x={4} y={12} w={6} h={4} c="#78350f" />
    <P x={2} y={10} w={4} h={4} c="#92400e" />
    <P x={0} y={8} w={3} h={3} c="#15803d" />
    <P x={22} y={12} w={6} h={4} c="#78350f" />
    <P x={26} y={10} w={4} h={4} c="#92400e" />
    <P x={29} y={8} w={3} h={3} c="#15803d" />

    {/* Root legs */}
    <P x={8} y={28} w={6} h={4} c="#78350f" />
    <P x={6} y={30} w={4} h={2} c="#57351c" />
    <P x={18} y={28} w={6} h={4} c="#78350f" />
    <P x={22} y={30} w={4} h={2} c="#57351c" />

    {/* Moss/vines */}
    <P x={10} y={22} w={2} h={4} c="#166534" />
    <P x={20} y={20} w={2} h={4} c="#166534" />
  </IconWrapper>
);

// Fallen King - Level 20 - Armored undead king
export const FallenKingSprite = ({ size = 64 }) => (
  <IconWrapper size={size}>
    {/* Tattered cape */}
    <P x={4} y={10} w={24} h={20} c="#7f1d1d" />
    <P x={6} y={28} w={4} h={2} c="#991b1b" />
    <P x={14} y={29} w={4} h={2} c="#7f1d1d" />
    <P x={22} y={28} w={4} h={2} c="#991b1b" />

    {/* Armor body */}
    <P x={10} y={12} w={12} h={14} c="#374151" />
    <P x={8} y={14} w={16} h={10} c="#4b5563" />

    {/* Chest plate detail */}
    <P x={12} y={14} w={8} h={8} c="#6b7280" />
    <P x={14} y={16} w={4} h={4} c="#1f2937" />

    {/* Helmet */}
    <P x={10} y={4} w={12} h={10} c="#374151" />
    <P x={8} y={6} w={16} h={6} c="#4b5563" />

    {/* Visor - glowing red */}
    <P x={12} y={8} w={8} h={2} c="#ef4444" />
    <P x={13} y={8} w={2} h={2} c="#fca5a5" />
    <P x={17} y={8} w={2} h={2} c="#fca5a5" />

    {/* Crown on helmet */}
    <P x={10} y={2} w={12} h={4} c="#fbbf24" />
    <P x={12} y={0} w={2} h={2} c="#f59e0b" />
    <P x={15} y={-1} w={2} h={3} c="#f59e0b" />
    <P x={18} y={0} w={2} h={2} c="#f59e0b" />

    {/* Shoulder armor */}
    <P x={4} y={12} w={6} h={6} c="#6b7280" />
    <P x={2} y={14} w={4} h={4} c="#4b5563" />
    <P x={22} y={12} w={6} h={6} c="#6b7280" />
    <P x={26} y={14} w={4} h={4} c="#4b5563" />

    {/* Arms */}
    <P x={4} y={18} w={4} h={8} c="#4b5563" />
    <P x={24} y={18} w={4} h={8} c="#4b5563" />

    {/* Sword */}
    <P x={28} y={6} w={2} h={20} c="#9ca3af" />
    <P x={27} y={4} w={4} h={4} c="#d1d5db" />
    <P x={27} y={22} w={4} h={4} c="#fbbf24" />
    <P x={28} y={24} w={2} h={2} c="#ef4444" />

    {/* Legs/greaves */}
    <P x={10} y={26} w={4} h={6} c="#4b5563" />
    <P x={18} y={26} w={4} h={6} c="#4b5563" />
    <P x={8} y={30} w={4} h={2} c="#374151" />
    <P x={20} y={30} w={4} h={2} c="#374151" />
  </IconWrapper>
);

// Inferno Lord - Level 25 - Massive lava demon
export const InfernoLordSprite = ({ size = 64 }) => (
  <IconWrapper size={size}>
    {/* Fiery wings */}
    <P x={0} y={6} w={8} h={16} c="#dc2626" />
    <P x={2} y={4} w={4} h={4} c="#f97316" />
    <P x={0} y={8} w={4} h={10} c="#f97316" />
    <P x={24} y={6} w={8} h={16} c="#dc2626" />
    <P x={26} y={4} w={4} h={4} c="#f97316" />
    <P x={28} y={8} w={4} h={10} c="#f97316" />

    {/* Molten body */}
    <P x={8} y={8} w={16} h={18} c="#991b1b" />
    <P x={10} y={6} w={12} h={4} c="#b91c1c" />

    {/* Lava cracks */}
    <P x={12} y={12} w={2} h={8} c="#fbbf24" />
    <P x={18} y={14} w={2} h={6} c="#f97316" />
    <P x={14} y={18} w={4} h={2} c="#fbbf24" />

    {/* Core - bright */}
    <P x={14} y={14} w={4} h={4} c="#fef3c7" />
    <P x={15} y={15} w={2} h={2} c="#ffffff" />

    {/* Head */}
    <P x={10} y={2} w={12} h={8} c="#dc2626" />

    {/* Horns - massive */}
    <P x={6} y={0} w={4} h={6} c="#78716c" />
    <P x={4} y={2} w={2} h={4} c="#a8a29e" />
    <P x={22} y={0} w={4} h={6} c="#78716c" />
    <P x={26} y={2} w={2} h={4} c="#a8a29e" />

    {/* Eyes - burning */}
    <P x={12} y={4} w={3} h={3} c="#fbbf24" />
    <P x={17} y={4} w={3} h={3} c="#fbbf24" />
    <P x={13} y={5} w={1} h={1} c="#ef4444" />
    <P x={18} y={5} w={1} h={1} c="#ef4444" />

    {/* Mouth - fire */}
    <P x={13} y={8} w={6} h={2} c="#fbbf24" />
    <P x={14} y={7} w={4} h={1} c="#f97316" />

    {/* Arms - molten */}
    <P x={4} y={12} w={4} h={10} c="#b91c1c" />
    <P x={2} y={14} w={4} h={6} c="#dc2626" />
    <P x={24} y={12} w={4} h={10} c="#b91c1c" />
    <P x={26} y={14} w={4} h={6} c="#dc2626" />

    {/* Claws */}
    <P x={2} y={20} w={2} h={4} c="#fbbf24" />
    <P x={28} y={20} w={2} h={4} c="#fbbf24" />

    {/* Legs */}
    <P x={10} y={24} w={4} h={6} c="#991b1b" />
    <P x={18} y={24} w={4} h={6} c="#991b1b" />
    <P x={8} y={28} w={4} h={4} c="#7f1d1d" />
    <P x={20} y={28} w={4} h={4} c="#7f1d1d" />

    {/* Fire effects */}
    <P x={6} y={22} w={2} h={3} c="#fbbf24" />
    <P x={24} y={22} w={2} h={3} c="#fbbf24" />
  </IconWrapper>
);

// Void Emperor - Level 30 - Cosmic horror entity
export const VoidEmperorSprite = ({ size = 64 }) => (
  <IconWrapper size={size}>
    {/* Void body - dark mass */}
    <P x={8} y={8} w={16} h={20} c="#0f0f0f" />
    <P x={6} y={10} w={20} h={16} c="#1f1f1f" />
    <P x={10} y={6} w={12} h={4} c="#1f1f1f" />

    {/* Void tendrils */}
    <P x={2} y={12} w={4} h={12} c="#1f1f1f" />
    <P x={0} y={14} w={3} h={8} c="#374151" />
    <P x={26} y={12} w={4} h={12} c="#1f1f1f" />
    <P x={29} y={14} w={3} h={8} c="#374151" />

    {/* Lower tendrils */}
    <P x={4} y={24} w={6} h={6} c="#0f0f0f" />
    <P x={2} y={28} w={4} h={4} c="#1f1f1f" />
    <P x={22} y={24} w={6} h={6} c="#0f0f0f" />
    <P x={26} y={28} w={4} h={4} c="#1f1f1f" />

    {/* Central eye - large */}
    <P x={10} y={10} w={12} h={10} c="#4c1d95" />
    <P x={12} y={12} w={8} h={6} c="#7c3aed" />
    <P x={14} y={13} w={4} h={4} c="#a855f7" />
    <P x={15} y={14} w={2} h={2} c="#e9d5ff" />

    {/* Crown of void */}
    <P x={8} y={2} w={16} h={6} c="#4c1d95" />
    <P x={10} y={0} w={4} h={4} c="#7c3aed" />
    <P x={14} y={-2} w={4} h={4} c="#a855f7" />
    <P x={18} y={0} w={4} h={4} c="#7c3aed" />

    {/* Smaller eyes */}
    <P x={6} y={14} w={3} h={3} c="#ef4444" />
    <P x={23} y={14} w={3} h={3} c="#22d3d1" />
    <P x={12} y={22} w={3} h={3} c="#fbbf24" />
    <P x={17} y={22} w={3} h={3} c="#22c55e" />

    {/* Void particles */}
    <P x={4} y={6} w={2} h={2} c="#7c3aed" />
    <P x={26} y={6} w={2} h={2} c="#7c3aed" />
    <P x={6} y={26} w={2} h={2} c="#a855f7" />
    <P x={24} y={26} w={2} h={2} c="#a855f7" />

    {/* Reality distortion effect */}
    <P x={14} y={26} w={4} h={4} c="#4c1d95" />
    <P x={15} y={27} w={2} h={2} c="#7c3aed" />
  </IconWrapper>
);

// World Boss sprite mapping
export const WORLD_BOSS_SPRITES = {
  world_boss_crystal: CrystalGuardianSprite,
  world_boss_crypt: CryptLordSprite,
  world_boss_forest: ForestAncientSprite,
  world_boss_fallen: FallenKingSprite,
  world_boss_inferno: InfernoLordSprite,
  world_boss_void: VoidEmperorSprite,
  // Also map by boss id for convenience
  crystal_guardian: CrystalGuardianSprite,
  crypt_lord: CryptLordSprite,
  forest_ancient: ForestAncientSprite,
  fallen_king: FallenKingSprite,
  inferno_lord: InfernoLordSprite,
  void_emperor: VoidEmperorSprite,
};

// Helper component to render world boss by ID
export const WorldBossIcon = ({ bossId, size = 64, className = '' }) => {
  const SpriteComponent = WORLD_BOSS_SPRITES[bossId];
  if (!SpriteComponent) {
    // Fallback to void emperor for unknown bosses
    return <VoidEmperorSprite size={size} className={className} />;
  }
  return <SpriteComponent size={size} className={className} />;
};

export default WorldBossIcon;
