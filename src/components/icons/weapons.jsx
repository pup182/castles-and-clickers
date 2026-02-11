// Weapon SVG layers for hero icons
// These overlay on the right side of hero icons

const WeaponWrapper = ({ children, size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute inset-0"
    style={{ imageRendering: 'pixelated' }}
  >
    {children}
  </svg>
);

const P = ({ x, y, c, w = 1, h = 1 }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} />
);

// === MELEE WEAPONS ===

export const SwordWeapon = ({ size, color = '#d1d5db' }) => (
  <WeaponWrapper size={size}>
    {/* Blade */}
    <P x={12} y={2} w={1} h={1} c="#f3f4f6" />
    <P x={12} y={3} w={1} h={5} c={color} />
    {/* Guard */}
    <P x={11} y={8} w={3} h={1} c="#fbbf24" />
    {/* Handle */}
    <P x={12} y={9} w={1} h={2} c="#78350f" />
  </WeaponWrapper>
);

export const AxeWeapon = ({ size, color = '#d1d5db' }) => (
  <WeaponWrapper size={size}>
    {/* Blade */}
    <P x={11} y={2} w={3} h={1} c={color} />
    <P x={12} y={3} w={3} h={2} c={color} />
    <P x={13} y={5} w={2} h={1} c={color} />
    {/* Handle */}
    <P x={12} y={6} w={1} h={5} c="#78350f" />
  </WeaponWrapper>
);

export const MaceWeapon = ({ size, color = '#d1d5db' }) => (
  <WeaponWrapper size={size}>
    {/* Head */}
    <P x={11} y={2} w={3} h={3} c={color} />
    <P x={10} y={3} w={1} h={1} c={color} />
    <P x={14} y={3} w={1} h={1} c={color} />
    {/* Handle */}
    <P x={12} y={5} w={1} h={6} c="#78350f" />
  </WeaponWrapper>
);

export const HammerWeapon = ({ size, color = '#9ca3af' }) => (
  <WeaponWrapper size={size}>
    {/* Head */}
    <P x={10} y={2} w={4} h={3} c={color} />
    {/* Handle */}
    <P x={12} y={5} w={1} h={6} c="#78350f" />
  </WeaponWrapper>
);

// === MAGIC WEAPONS ===

export const StaffWeapon = ({ size, color = '#60a5fa', woodColor = '#78350f' }) => (
  <WeaponWrapper size={size}>
    {/* Crystal/Orb */}
    <P x={12} y={1} w={2} h={2} c={color} />
    <P x={13} y={0} w={1} h={1} c={color} />
    <P x={13} y={3} w={1} h={1} c={color} />
    {/* Staff */}
    <P x={13} y={4} w={1} h={8} c={woodColor} />
  </WeaponWrapper>
);

export const WandWeapon = ({ size, color = '#a855f7' }) => (
  <WeaponWrapper size={size}>
    {/* Tip glow */}
    <P x={13} y={2} w={1} h={1} c={color} />
    <P x={12} y={3} w={1} h={1} c={color} />
    {/* Wand */}
    <P x={12} y={4} w={1} h={5} c="#78350f" />
    <P x={11} y={8} w={3} h={1} c="#fbbf24" />
  </WeaponWrapper>
);

export const OrbWeapon = ({ size, color = '#8b5cf6' }) => (
  <WeaponWrapper size={size}>
    {/* Floating orb */}
    <P x={11} y={3} w={3} h={3} c={color} />
    <P x={12} y={2} w={1} h={1} c={color} />
    <P x={12} y={6} w={1} h={1} c={color} />
    {/* Glow */}
    <P x={12} y={4} w={1} h={1} c="#e9d5ff" />
  </WeaponWrapper>
);

// === RANGED WEAPONS ===

export const BowWeapon = ({ size, color = '#78350f' }) => (
  <WeaponWrapper size={size}>
    {/* Bow curve */}
    <P x={13} y={2} w={1} h={1} c={color} />
    <P x={14} y={3} w={1} h={5} c={color} />
    <P x={13} y={8} w={1} h={1} c={color} />
    {/* String */}
    <P x={12} y={3} w={1} h={5} c="#fbbf24" />
    {/* Arrow */}
    <P x={10} y={5} w={3} h={1} c="#9ca3af" />
  </WeaponWrapper>
);

export const DaggersWeapon = ({ size, color = '#d1d5db' }) => (
  <WeaponWrapper size={size}>
    {/* Right dagger */}
    <P x={13} y={3} w={1} h={4} c={color} />
    <P x={13} y={2} w={1} h={1} c="#f3f4f6" />
    <P x={12} y={6} w={3} h={1} c="#78350f" />
    {/* Left dagger (behind) */}
    <P x={11} y={4} w={1} h={3} c={color} />
    <P x={10} y={6} w={2} h={1} c="#78350f" />
  </WeaponWrapper>
);

export const CrossbowWeapon = ({ size, color = '#78350f' }) => (
  <WeaponWrapper size={size}>
    {/* Stock */}
    <P x={11} y={5} w={4} h={2} c={color} />
    {/* Arms */}
    <P x={10} y={3} w={1} h={3} c={color} />
    <P x={14} y={3} w={1} h={3} c={color} />
    {/* String */}
    <P x={11} y={4} w={3} h={1} c="#fbbf24" />
    {/* Bolt */}
    <P x={12} y={2} w={1} h={3} c="#9ca3af" />
  </WeaponWrapper>
);

// === SHIELDS (for tanks) ===

export const ShieldWeapon = ({ size, color = '#3b82f6' }) => (
  <WeaponWrapper size={size}>
    {/* Shield shape */}
    <P x={0} y={4} w={4} h={1} c={color} />
    <P x={0} y={5} w={4} h={4} c={color} />
    <P x={1} y={9} w={2} h={1} c={color} />
    {/* Inner detail */}
    <P x={1} y={6} w={2} h={2} c="#60a5fa" />
  </WeaponWrapper>
);

export const TowerShieldWeapon = ({ size, color = '#6b7280' }) => (
  <WeaponWrapper size={size}>
    {/* Large shield */}
    <P x={0} y={3} w={4} h={7} c={color} />
    <P x={1} y={10} w={2} h={1} c={color} />
    {/* Cross emblem */}
    <P x={1} y={5} w={2} h={1} c="#fbbf24" />
    <P x={1} y={6} w={1} h={2} c="#fbbf24" />
  </WeaponWrapper>
);

// === SPECIAL WEAPONS ===

export const ScytheWeapon = ({ size, color = '#4b5563' }) => (
  <WeaponWrapper size={size}>
    {/* Blade */}
    <P x={10} y={2} w={4} h={1} c={color} />
    <P x={9} y={3} w={3} h={1} c={color} />
    {/* Handle */}
    <P x={12} y={3} w={1} h={8} c="#78350f" />
  </WeaponWrapper>
);

export const TotemWeapon = ({ size, color = '#78350f' }) => (
  <WeaponWrapper size={size}>
    {/* Totem head */}
    <P x={12} y={1} w={2} h={2} c="#ef4444" />
    <P x={12} y={3} w={2} h={1} c="#22c55e" />
    <P x={12} y={4} w={2} h={1} c="#3b82f6" />
    {/* Staff */}
    <P x={13} y={5} w={1} h={7} c={color} />
  </WeaponWrapper>
);

// Map weapon types to components
export const WEAPON_COMPONENTS = {
  // Swords
  sword: SwordWeapon,
  longsword: SwordWeapon,
  greatsword: SwordWeapon,
  blade: SwordWeapon,

  // Axes
  axe: AxeWeapon,
  battleaxe: AxeWeapon,
  hatchet: AxeWeapon,

  // Blunt
  mace: MaceWeapon,
  hammer: HammerWeapon,
  club: MaceWeapon,

  // Magic
  staff: StaffWeapon,
  wand: WandWeapon,
  orb: OrbWeapon,
  scepter: WandWeapon,

  // Ranged
  bow: BowWeapon,
  longbow: BowWeapon,
  crossbow: CrossbowWeapon,

  // Rogue
  dagger: DaggersWeapon,
  daggers: DaggersWeapon,
  knife: DaggersWeapon,

  // Shields
  shield: ShieldWeapon,
  buckler: ShieldWeapon,
  towershield: TowerShieldWeapon,

  // Special
  scythe: ScytheWeapon,
  totem: TotemWeapon,
};

// Get rarity color for weapon tinting
export const RARITY_COLORS = {
  common: '#9ca3af',
  uncommon: '#22c55e',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export const RARITY_GLOW = {
  common: 'none',
  uncommon: 'drop-shadow(0 0 2px #22c55e)',
  rare: 'drop-shadow(0 0 3px #3b82f6)',
  epic: 'drop-shadow(0 0 4px #a855f7)',
  legendary: 'drop-shadow(0 0 5px #f59e0b) drop-shadow(0 0 10px #f59e0b50)',
};
