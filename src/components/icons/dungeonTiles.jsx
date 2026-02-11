// Dungeon tile and prop SVG components
// All tiles are 16x16 pixel art style

const TileWrapper = ({ children, size = 48 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ imageRendering: 'pixelated' }}
  >
    {children}
  </svg>
);

const P = ({ x, y, c, w = 1, h = 1 }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} />
);

// === FLOOR TILES ===

export const FloorTile = ({ size, colors }) => (
  <TileWrapper size={size}>
    {/* Base floor */}
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Random texture spots */}
    <P x={2} y={3} w={2} h={1} c={colors.floorAlt} />
    <P x={8} y={7} w={1} h={2} c={colors.floorAlt} />
    <P x={12} y={2} w={2} h={1} c={colors.floorAlt} />
    <P x={5} y={11} w={1} h={1} c={colors.floorAlt} />
    <P x={14} y={13} w={1} h={1} c={colors.floorAlt} />
  </TileWrapper>
);

export const FloorTileAlt = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    <P x={1} y={8} w={1} h={2} c={colors.floorAlt} />
    <P x={6} y={2} w={2} h={1} c={colors.floorAlt} />
    <P x={11} y={12} w={1} h={1} c={colors.floorAlt} />
    <P x={4} y={6} w={1} h={1} c={colors.floorAlt} />
    <P x={13} y={4} w={2} h={1} c={colors.floorAlt} />
  </TileWrapper>
);

// Cracked floor variant
export const FloorTileCracked = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Crack lines */}
    <P x={4} y={3} w={1} h={4} c={colors.floorAlt} />
    <P x={5} y={6} w={3} h={1} c={colors.floorAlt} />
    <P x={7} y={6} w={1} h={5} c={colors.floorAlt} />
    <P x={8} y={10} w={4} h={1} c={colors.floorAlt} />
    {/* Small debris */}
    <P x={10} y={4} w={2} h={1} c={colors.floorAlt} />
    <P x={2} y={11} w={1} h={1} c={colors.floorAlt} />
  </TileWrapper>
);

// Floor with debris
export const FloorTileDebris = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Small rocks/debris */}
    <P x={3} y={10} w={2} h={2} c={colors.floorAlt} />
    <P x={10} y={5} w={3} h={2} c={colors.floorAlt} />
    <P x={6} y={12} w={1} h={1} c={colors.floorAlt} />
    <P x={12} y={11} w={2} h={1} c={colors.floorAlt} />
    <P x={2} y={4} w={1} h={1} c={colors.floorAlt} />
  </TileWrapper>
);

// Floor with moss/stain
export const FloorTileMoss = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Moss patches */}
    <P x={2} y={7} w={4} h={3} c={colors.floorAlt} />
    <P x={3} y={8} w={2} h={1} c={colors.accent || colors.floorAlt} />
    <P x={10} y={11} w={3} h={2} c={colors.floorAlt} />
  </TileWrapper>
);

// === WALL TILES ===

export const WallTile = ({ size, colors }) => (
  <TileWrapper size={size}>
    {/* Base wall */}
    <P x={0} y={0} w={16} h={16} c={colors.wall} />
    {/* Brick pattern */}
    <P x={0} y={0} w={8} h={4} c={colors.wallHighlight} />
    <P x={8} y={0} w={8} h={4} c={colors.wall} />
    <P x={4} y={4} w={8} h={4} c={colors.wallHighlight} />
    <P x={0} y={8} w={8} h={4} c={colors.wall} />
    <P x={8} y={8} w={8} h={4} c={colors.wallHighlight} />
    <P x={4} y={12} w={8} h={4} c={colors.wall} />
    {/* Mortar lines */}
    <P x={0} y={4} w={16} h={1} c={colors.floorAlt} />
    <P x={0} y={8} w={16} h={1} c={colors.floorAlt} />
    <P x={0} y={12} w={16} h={1} c={colors.floorAlt} />
    <P x={8} y={0} w={1} h={4} c={colors.floorAlt} />
    <P x={4} y={4} w={1} h={4} c={colors.floorAlt} />
    <P x={12} y={4} w={1} h={4} c={colors.floorAlt} />
    <P x={8} y={8} w={1} h={4} c={colors.floorAlt} />
    <P x={4} y={12} w={1} h={4} c={colors.floorAlt} />
  </TileWrapper>
);

// Forest wall - dense trees/foliage instead of bricks
export const ForestWallTile = ({ size, colors }) => (
  <TileWrapper size={size}>
    {/* Dense forest background */}
    <P x={0} y={0} w={16} h={16} c={colors.wall} />
    {/* Tree trunks */}
    <P x={2} y={8} w={3} h={8} c="#3d2817" />
    <P x={11} y={6} w={3} h={10} c="#2d1f12" />
    <P x={7} y={10} w={2} h={6} c="#3d2817" />
    {/* Dense foliage layers */}
    <P x={0} y={0} w={7} h={10} c={colors.wall} />
    <P x={9} y={0} w={7} h={8} c={colors.wallHighlight} />
    <P x={5} y={2} w={6} h={8} c={colors.wall} />
    {/* Leaf clusters */}
    <P x={1} y={1} w={4} h={5} c={colors.wallHighlight} />
    <P x={4} y={0} w={5} h={4} c="#15803d" />
    <P x={10} y={1} w={4} h={4} c={colors.wallHighlight} />
    <P x={6} y={4} w={4} h={4} c="#16a34a" />
    <P x={0} y={5} w={3} h={4} c="#15803d" />
    <P x={12} y={3} w={4} h={5} c="#16a34a" />
    {/* Highlights */}
    <P x={2} y={2} w={2} h={2} c="#22c55e" />
    <P x={11} y={2} w={2} h={2} c="#22c55e" />
    <P x={7} y={5} w={2} h={2} c="#22c55e" />
  </TileWrapper>
);

// Forest floor - grass and dirt path
export const ForestFloorTile = ({ size, colors }) => (
  <TileWrapper size={size}>
    {/* Grass base */}
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Dirt patches */}
    <P x={3} y={5} w={4} h={3} c={colors.floorAlt} />
    <P x={9} y={10} w={5} h={4} c={colors.floorAlt} />
    {/* Grass tufts */}
    <P x={1} y={2} w={1} h={2} c="#22c55e" />
    <P x={6} y={1} w={1} h={2} c="#16a34a" />
    <P x={12} y={3} w={1} h={2} c="#22c55e" />
    <P x={2} y={12} w={1} h={2} c="#16a34a" />
    <P x={14} y={8} w={1} h={2} c="#22c55e" />
  </TileWrapper>
);

// Forest floor with fallen leaves
export const ForestFloorLeaves = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Fallen leaves */}
    <P x={2} y={4} w={2} h={1} c="#854d0e" />
    <P x={7} y={7} w={2} h={1} c="#a16207" />
    <P x={11} y={3} w={2} h={1} c="#854d0e" />
    <P x={4} y={11} w={2} h={1} c="#ca8a04" />
    <P x={13} y={12} w={2} h={1} c="#a16207" />
    {/* Small twigs */}
    <P x={5} y={2} w={3} h={1} c="#78350f" />
    <P x={9} y={9} w={2} h={1} c="#78350f" />
  </TileWrapper>
);

// Forest floor with roots
export const ForestFloorRoots = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Exposed roots */}
    <P x={0} y={6} w={5} h={2} c="#78350f" />
    <P x={4} y={7} w={2} h={4} c="#78350f" />
    <P x={10} y={3} w={6} h={2} c="#78350f" />
    <P x={11} y={4} w={2} h={5} c="#78350f" />
    {/* Root highlights */}
    <P x={1} y={6} w={3} h={1} c="#92400e" />
    <P x={11} y={3} w={4} h={1} c="#92400e" />
  </TileWrapper>
);

// === PILLAR ===

export const PillarTile = ({ size, colors }) => (
  <TileWrapper size={size}>
    {/* Floor base */}
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Pillar shadow */}
    <P x={5} y={3} w={8} h={12} c={colors.floorAlt} />
    {/* Pillar body */}
    <P x={4} y={2} w={8} h={12} c={colors.wall} />
    <P x={5} y={2} w={6} h={12} c={colors.wallHighlight} />
    {/* Pillar top */}
    <P x={3} y={1} w={10} h={2} c={colors.wallHighlight} />
    {/* Pillar base */}
    <P x={3} y={13} w={10} h={2} c={colors.wall} />
  </TileWrapper>
);

// === DOORS ===

export const DoorLeft = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Door frame */}
    <P x={0} y={2} w={3} h={12} c={colors.wallHighlight} />
    <P x={3} y={4} w={10} h={8} c={colors.wall} />
    {/* Door opening - dark */}
    <P x={4} y={5} w={8} h={6} c="#000000" />
    {/* Arrow indicator */}
    <P x={6} y={7} w={1} h={2} c={colors.accent} />
    <P x={5} y={8} w={1} h={1} c={colors.accent} />
    <P x={4} y={8} w={1} h={1} c={colors.accent} />
  </TileWrapper>
);

export const DoorRight = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Door frame */}
    <P x={13} y={2} w={3} h={12} c={colors.wallHighlight} />
    <P x={3} y={4} w={10} h={8} c={colors.wall} />
    {/* Door opening - dark */}
    <P x={4} y={5} w={8} h={6} c="#000000" />
    {/* Arrow indicator */}
    <P x={9} y={7} w={1} h={2} c={colors.accent} />
    <P x={10} y={8} w={1} h={1} c={colors.accent} />
    <P x={11} y={8} w={1} h={1} c={colors.accent} />
  </TileWrapper>
);

// === THEME-SPECIFIC PROPS ===

// Cave props
export const Crystal = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Crystal cluster */}
    <P x={6} y={8} w={4} h={6} c={colors.accent} />
    <P x={7} y={5} w={2} h={9} c={colors.accent} />
    <P x={4} y={10} w={2} h={4} c={colors.accent} />
    <P x={10} y={9} w={2} h={5} c={colors.accent} />
    {/* Highlights */}
    <P x={7} y={6} w={1} h={3} c="#ffffff" />
    <P x={5} y={11} w={1} h={2} c="#ffffff" />
  </TileWrapper>
);

export const Stalactite = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Dripping stalactite shadow on floor */}
    <P x={6} y={10} w={4} h={4} c={colors.floorAlt} />
    {/* Water puddle */}
    <P x={5} y={12} w={6} h={2} c="#1e3a5f" />
    <P x={6} y={11} w={4} h={1} c="#2563eb" />
  </TileWrapper>
);

export const Puddle = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Water puddle */}
    <P x={3} y={6} w={10} h={6} c="#1e3a5f" />
    <P x={4} y={7} w={8} h={4} c="#2563eb" />
    <P x={5} y={8} w={4} h={2} c="#3b82f6" />
  </TileWrapper>
);

export const Rocks = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Rock pile */}
    <P x={4} y={9} w={5} h={4} c={colors.wall} />
    <P x={8} y={10} w={4} h={3} c={colors.wallHighlight} />
    <P x={3} y={11} w={3} h={2} c={colors.wallHighlight} />
    <P x={6} y={8} w={3} h={2} c={colors.wall} />
  </TileWrapper>
);

// Crypt props
export const Bones = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Skull */}
    <P x={5} y={8} w={4} h={4} c="#d1d5db" />
    <P x={6} y={9} w={1} h={1} c="#1f2937" />
    <P x={8} y={9} w={1} h={1} c="#1f2937" />
    {/* Bones */}
    <P x={2} y={12} w={5} h={1} c="#e5e7eb" />
    <P x={10} y={11} w={4} h={1} c="#e5e7eb" />
    <P x={3} y={10} w={1} h={3} c="#d1d5db" />
  </TileWrapper>
);

export const Coffin = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Coffin */}
    <P x={4} y={3} w={8} h={11} c="#78350f" />
    <P x={5} y={4} w={6} h={9} c="#92400e" />
    {/* Cross */}
    <P x={7} y={5} w={2} h={5} c="#fbbf24" />
    <P x={6} y={6} w={4} h={1} c="#fbbf24" />
  </TileWrapper>
);

export const Candle = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Candle holder */}
    <P x={6} y={12} w={4} h={2} c="#78350f" />
    {/* Candle */}
    <P x={7} y={7} w={2} h={5} c="#fef3c7" />
    {/* Flame */}
    <P x={7} y={4} w={2} h={3} c="#f59e0b" />
    <P x={7} y={3} w={2} h={2} c="#fbbf24" />
    {/* Glow */}
    <P x={6} y={5} w={1} h={2} c={colors.accent} />
    <P x={9} y={5} w={1} h={2} c={colors.accent} />
  </TileWrapper>
);

export const Cobweb = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Web strands */}
    <P x={0} y={0} w={1} h={8} c="#9ca3af" />
    <P x={1} y={1} w={1} h={6} c="#d1d5db" />
    <P x={2} y={2} w={1} h={5} c="#9ca3af" />
    <P x={3} y={3} w={1} h={4} c="#d1d5db" />
    <P x={4} y={4} w={1} h={3} c="#9ca3af" />
    <P x={0} y={0} w={8} h={1} c="#9ca3af" />
    <P x={1} y={1} w={6} h={1} c="#d1d5db" />
    <P x={2} y={2} w={5} h={1} c="#9ca3af" />
  </TileWrapper>
);

// Forest props
export const Tree = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Trunk */}
    <P x={6} y={10} w={4} h={5} c="#78350f" />
    <P x={7} y={10} w={2} h={5} c="#92400e" />
    {/* Foliage */}
    <P x={3} y={2} w={10} h={9} c="#166534" />
    <P x={4} y={1} w={8} h={2} c="#15803d" />
    <P x={5} y={3} w={6} h={6} c="#22c55e" />
  </TileWrapper>
);

export const Mushroom = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Stem */}
    <P x={6} y={10} w={4} h={4} c="#fef3c7" />
    {/* Cap */}
    <P x={4} y={7} w={8} h={4} c="#dc2626" />
    <P x={5} y={6} w={6} h={2} c="#ef4444" />
    {/* Spots */}
    <P x={5} y={8} w={2} h={2} c="#fef3c7" />
    <P x={9} y={7} w={2} h={2} c="#fef3c7" />
  </TileWrapper>
);

export const Vine = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Vines */}
    <P x={2} y={0} w={1} h={10} c="#166534" />
    <P x={3} y={2} w={1} h={8} c="#15803d" />
    <P x={1} y={4} w={1} h={6} c="#166534" />
    {/* Leaves */}
    <P x={3} y={3} w={2} h={1} c="#22c55e" />
    <P x={0} y={6} w={2} h={1} c="#22c55e" />
    <P x={2} y={8} w={2} h={1} c="#22c55e" />
  </TileWrapper>
);

export const Flowers = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Stems */}
    <P x={4} y={10} w={1} h={4} c="#166534" />
    <P x={8} y={9} w={1} h={5} c="#166534" />
    <P x={12} y={11} w={1} h={3} c="#166534" />
    {/* Flowers */}
    <P x={3} y={8} w={3} h={3} c="#f472b6" />
    <P x={7} y={7} w={3} h={3} c="#c084fc" />
    <P x={11} y={9} w={3} h={3} c="#facc15" />
  </TileWrapper>
);

// Castle props
export const Torch = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Torch holder */}
    <P x={6} y={8} w={4} h={6} c="#78350f" />
    <P x={7} y={9} w={2} h={5} c="#92400e" />
    {/* Flame */}
    <P x={6} y={3} w={4} h={6} c="#f59e0b" />
    <P x={7} y={2} w={2} h={5} c="#fbbf24" />
    <P x={7} y={1} w={2} h={2} c="#fef3c7" />
    {/* Glow effect */}
    <P x={5} y={4} w={1} h={3} c={colors.accent} />
    <P x={10} y={4} w={1} h={3} c={colors.accent} />
  </TileWrapper>
);

export const Banner = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Pole */}
    <P x={7} y={0} w={2} h={4} c="#78350f" />
    {/* Banner */}
    <P x={3} y={3} w={10} h={10} c="#dc2626" />
    <P x={4} y={4} w={8} h={8} c="#b91c1c" />
    {/* Emblem */}
    <P x={6} y={6} w={4} h={4} c="#fbbf24" />
    {/* Tattered edge */}
    <P x={3} y={12} w={2} h={2} c={colors.floor} />
    <P x={11} y={11} w={2} h={3} c={colors.floor} />
  </TileWrapper>
);

export const Armor = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Armor stand */}
    <P x={6} y={12} w={4} h={3} c="#78350f" />
    {/* Armor body */}
    <P x={4} y={5} w={8} h={7} c="#6b7280" />
    <P x={5} y={6} w={6} h={5} c="#9ca3af" />
    {/* Helmet */}
    <P x={5} y={2} w={6} h={4} c="#6b7280" />
    <P x={6} y={3} w={4} h={2} c="#4b5563" />
  </TileWrapper>
);

export const Chains = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Chain links */}
    <P x={4} y={0} w={2} h={3} c="#6b7280" />
    <P x={5} y={2} w={2} h={3} c="#9ca3af" />
    <P x={4} y={4} w={2} h={3} c="#6b7280" />
    <P x={5} y={6} w={2} h={3} c="#9ca3af" />
    <P x={4} y={8} w={2} h={3} c="#6b7280" />
    {/* Second chain */}
    <P x={10} y={1} w={2} h={3} c="#6b7280" />
    <P x={11} y={3} w={2} h={3} c="#9ca3af" />
    <P x={10} y={5} w={2} h={3} c="#6b7280" />
  </TileWrapper>
);

// Volcano props
export const Lava = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Lava pool */}
    <P x={2} y={5} w={12} h={8} c="#dc2626" />
    <P x={3} y={6} w={10} h={6} c="#ef4444" />
    <P x={4} y={7} w={8} h={4} c="#f97316" />
    <P x={5} y={8} w={4} h={2} c="#fbbf24" />
    {/* Bubbles */}
    <P x={6} y={7} w={2} h={2} c="#fef3c7" />
    <P x={10} y={9} w={1} h={1} c="#fef3c7" />
  </TileWrapper>
);

export const Obsidian = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Obsidian formation */}
    <P x={4} y={6} w={8} h={8} c="#1f2937" />
    <P x={5} y={4} w={6} h={10} c="#111827" />
    <P x={6} y={3} w={4} h={11} c="#030712" />
    {/* Shine */}
    <P x={6} y={5} w={1} h={4} c="#4b5563" />
    <P x={8} y={7} w={1} h={2} c="#374151" />
  </TileWrapper>
);

export const Ember = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Embers scattered */}
    <P x={3} y={4} w={2} h={2} c="#f97316" />
    <P x={8} y={7} w={1} h={1} c="#ef4444" />
    <P x={11} y={3} w={2} h={2} c="#fbbf24" />
    <P x={5} y={11} w={1} h={1} c="#f97316" />
    <P x={13} y={10} w={2} h={2} c="#ef4444" />
    <P x={2} y={8} w={1} h={1} c="#fbbf24" />
  </TileWrapper>
);

export const Crack = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Crack with lava glow */}
    <P x={7} y={2} w={2} h={3} c="#1f2937" />
    <P x={6} y={4} w={2} h={4} c="#1f2937" />
    <P x={7} y={7} w={3} h={3} c="#1f2937" />
    <P x={8} y={9} w={2} h={4} c="#1f2937" />
    {/* Lava glow inside */}
    <P x={7} y={3} w={1} h={2} c="#ef4444" />
    <P x={6} y={5} w={1} h={3} c="#f97316" />
    <P x={8} y={8} w={1} h={2} c="#ef4444" />
    <P x={8} y={10} w={1} h={2} c="#f97316" />
  </TileWrapper>
);

// Void props
export const Portal = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Portal ring */}
    <P x={3} y={3} w={10} h={10} c="#7c3aed" />
    <P x={4} y={4} w={8} h={8} c="#8b5cf6" />
    <P x={5} y={5} w={6} h={6} c="#a855f7" />
    {/* Void center */}
    <P x={6} y={6} w={4} h={4} c="#1e1b4b" />
    <P x={7} y={7} w={2} h={2} c="#000000" />
  </TileWrapper>
);

export const FloatingRock = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Shadow */}
    <P x={5} y={12} w={6} h={2} c={colors.floorAlt} />
    {/* Floating rock */}
    <P x={4} y={5} w={8} h={5} c="#4b5563" />
    <P x={5} y={4} w={6} h={6} c="#6b7280" />
    <P x={6} y={5} w={4} h={3} c="#9ca3af" />
    {/* Glow beneath */}
    <P x={6} y={10} w={4} h={1} c={colors.accent} />
  </TileWrapper>
);

export const Rune = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Rune circle */}
    <P x={4} y={4} w={8} h={8} c={colors.floorAlt} />
    {/* Rune symbol */}
    <P x={7} y={5} w={2} h={6} c={colors.accent} />
    <P x={5} y={6} w={6} h={1} c={colors.accent} />
    <P x={5} y={9} w={6} h={1} c={colors.accent} />
    {/* Corner glows */}
    <P x={4} y={4} w={1} h={1} c={colors.accent} />
    <P x={11} y={4} w={1} h={1} c={colors.accent} />
    <P x={4} y={11} w={1} h={1} c={colors.accent} />
    <P x={11} y={11} w={1} h={1} c={colors.accent} />
  </TileWrapper>
);

export const VoidCrack = ({ size, colors }) => (
  <TileWrapper size={size}>
    <P x={0} y={0} w={16} h={16} c={colors.floor} />
    {/* Reality crack */}
    <P x={6} y={0} w={3} h={16} c="#1e1b4b" />
    <P x={7} y={0} w={2} h={16} c="#312e81" />
    {/* Stars/void visible through */}
    <P x={7} y={3} w={1} h={1} c="#ffffff" />
    <P x={8} y={7} w={1} h={1} c="#c4b5fd" />
    <P x={7} y={11} w={1} h={1} c="#ffffff" />
    <P x={8} y={14} w={1} h={1} c="#c4b5fd" />
  </TileWrapper>
);

// Prop component mapping
export const PROP_COMPONENTS = {
  // Cave
  crystal: Crystal,
  stalactite: Stalactite,
  puddle: Puddle,
  rocks: Rocks,
  // Crypt
  bones: Bones,
  coffin: Coffin,
  candle: Candle,
  cobweb: Cobweb,
  // Forest
  tree: Tree,
  mushroom: Mushroom,
  vine: Vine,
  flowers: Flowers,
  // Castle
  torch: Torch,
  banner: Banner,
  armor: Armor,
  chains: Chains,
  // Volcano
  lava: Lava,
  obsidian: Obsidian,
  ember: Ember,
  crack: Crack,
  // Void
  portal: Portal,
  floatingRock: FloatingRock,
  rune: Rune,
  voidCrack: VoidCrack,
};
