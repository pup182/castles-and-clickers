// Pixel art equipment icons
// 16x16 grid, pixelated rendering

const pixelStyle = {
  imageRendering: 'pixelated',
  shapeRendering: 'crispEdges',
};

// Sword icon - classic pixel sword
const SwordIcon = ({ size = 16, color = '#94a3b8' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="3" y="2" width="2" height="2" fill="#f59e0b" />
    <rect x="5" y="4" width="2" height="2" fill={color} />
    <rect x="7" y="6" width="2" height="2" fill={color} />
    <rect x="9" y="8" width="2" height="2" fill={color} />
    <rect x="11" y="10" width="2" height="2" fill={color} />
    <rect x="13" y="12" width="2" height="2" fill={color} />
    <rect x="4" y="10" width="2" height="2" fill="#78350f" />
    <rect x="2" y="12" width="2" height="2" fill="#78350f" />
  </svg>
);

// Axe icon
const AxeIcon = ({ size = 16, color = '#94a3b8' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="7" y="2" width="2" height="10" fill="#78350f" />
    <rect x="3" y="3" width="4" height="2" fill={color} />
    <rect x="2" y="5" width="5" height="3" fill={color} />
    <rect x="3" y="8" width="4" height="1" fill={color} />
  </svg>
);

// Staff icon - magical staff
const StaffIcon = ({ size = 16, color = '#a855f7' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="7" y="4" width="2" height="10" fill="#78350f" />
    <rect x="5" y="1" width="6" height="4" fill={color} />
    <rect x="7" y="0" width="2" height="2" fill="#f59e0b" />
  </svg>
);

// Dagger icon
const DaggerIcon = ({ size = 16, color = '#94a3b8' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="7" y="2" width="2" height="2" fill={color} />
    <rect x="7" y="4" width="2" height="4" fill={color} />
    <rect x="6" y="8" width="4" height="2" fill="#78350f" />
    <rect x="7" y="10" width="2" height="4" fill="#78350f" />
  </svg>
);

// Bow icon
const BowIcon = ({ size = 16, color = '#78350f' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="4" y="3" width="2" height="2" fill={color} />
    <rect x="3" y="5" width="2" height="6" fill={color} />
    <rect x="4" y="11" width="2" height="2" fill={color} />
    <rect x="5" y="5" width="1" height="6" fill="#f59e0b" />
    <rect x="6" y="7" width="6" height="2" fill="#94a3b8" />
  </svg>
);

// Mace/Holy Symbol
const MaceIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="7" y="6" width="2" height="8" fill="#78350f" />
    <rect x="5" y="2" width="6" height="4" fill={color} />
    <rect x="4" y="3" width="2" height="2" fill={color} />
    <rect x="10" y="3" width="2" height="2" fill={color} />
  </svg>
);

// Armor icon - chestplate
const ArmorIcon = ({ size = 16, color = '#94a3b8' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="3" y="3" width="10" height="2" fill={color} />
    <rect x="2" y="5" width="4" height="6" fill={color} />
    <rect x="10" y="5" width="4" height="6" fill={color} />
    <rect x="5" y="5" width="6" height="8" fill={color} />
    <rect x="6" y="11" width="4" height="2" fill={color} />
  </svg>
);

// Robes icon
const RobesIcon = ({ size = 16, color = '#3b82f6' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="5" y="2" width="6" height="2" fill={color} />
    <rect x="4" y="4" width="8" height="8" fill={color} />
    <rect x="3" y="5" width="2" height="5" fill={color} />
    <rect x="11" y="5" width="2" height="5" fill={color} />
    <rect x="5" y="12" width="2" height="2" fill={color} />
    <rect x="9" y="12" width="2" height="2" fill={color} />
  </svg>
);

// Leather armor
const LeatherIcon = ({ size = 16, color = '#92400e' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="4" y="3" width="8" height="2" fill={color} />
    <rect x="3" y="5" width="10" height="6" fill={color} />
    <rect x="5" y="11" width="6" height="2" fill={color} />
    <rect x="6" y="5" width="4" height="2" fill="#78350f" />
  </svg>
);

// Ring icon
const RingIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="5" y="4" width="6" height="2" fill={color} />
    <rect x="4" y="6" width="2" height="4" fill={color} />
    <rect x="10" y="6" width="2" height="4" fill={color} />
    <rect x="5" y="10" width="6" height="2" fill={color} />
    <rect x="6" y="3" width="4" height="2" fill="#3b82f6" />
  </svg>
);

// Amulet icon
const AmuletIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="5" y="2" width="6" height="1" fill={color} />
    <rect x="4" y="3" width="2" height="3" fill={color} />
    <rect x="10" y="3" width="2" height="3" fill={color} />
    <rect x="5" y="6" width="6" height="6" fill={color} />
    <rect x="6" y="8" width="4" height="2" fill="#ef4444" />
  </svg>
);

// Boots icon
const BootsIcon = ({ size = 16, color = '#78350f' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="3" y="4" width="3" height="6" fill={color} />
    <rect x="2" y="10" width="5" height="3" fill={color} />
    <rect x="10" y="4" width="3" height="6" fill={color} />
    <rect x="9" y="10" width="5" height="3" fill={color} />
  </svg>
);

// Crown icon
const CrownIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="2" y="10" width="12" height="3" fill={color} />
    <rect x="2" y="6" width="2" height="4" fill={color} />
    <rect x="7" y="4" width="2" height="6" fill={color} />
    <rect x="12" y="6" width="2" height="4" fill={color} />
    <rect x="3" y="5" width="2" height="2" fill="#ef4444" />
    <rect x="11" y="5" width="2" height="2" fill="#ef4444" />
    <rect x="7" y="3" width="2" height="2" fill="#3b82f6" />
  </svg>
);

// Gloves icon
const GlovesIcon = ({ size = 16, color = '#78350f' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="2" y="6" width="5" height="6" fill={color} />
    <rect x="2" y="4" width="2" height="2" fill={color} />
    <rect x="4" y="3" width="2" height="3" fill={color} />
    <rect x="9" y="6" width="5" height="6" fill={color} />
    <rect x="12" y="4" width="2" height="2" fill={color} />
    <rect x="10" y="3" width="2" height="3" fill={color} />
  </svg>
);

// Spellbook icon
const SpellbookIcon = ({ size = 16, color = '#7c3aed' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="3" y="2" width="10" height="12" fill={color} />
    <rect x="4" y="3" width="8" height="10" fill="#1e1b4b" />
    <rect x="5" y="5" width="6" height="1" fill="#f59e0b" />
    <rect x="5" y="7" width="6" height="1" fill="#f59e0b" />
    <rect x="5" y="9" width="4" height="1" fill="#f59e0b" />
  </svg>
);

// Orb icon
const OrbIcon = ({ size = 16, color = '#3b82f6' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="5" y="3" width="6" height="2" fill={color} />
    <rect x="4" y="5" width="8" height="6" fill={color} />
    <rect x="5" y="11" width="6" height="2" fill={color} />
    <rect x="6" y="5" width="2" height="2" fill="#fff" opacity="0.6" />
  </svg>
);

// Skull accessory
const SkullAccessoryIcon = ({ size = 16, color = '#e5e5e5' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="4" y="3" width="8" height="6" fill={color} />
    <rect x="5" y="9" width="6" height="2" fill={color} />
    <rect x="6" y="11" width="4" height="2" fill={color} />
    <rect x="5" y="5" width="2" height="2" fill="#1f2937" />
    <rect x="9" y="5" width="2" height="2" fill="#1f2937" />
    <rect x="7" y="9" width="2" height="1" fill="#1f2937" />
  </svg>
);

// Generic weapon fallback
const GenericWeaponIcon = ({ size = 16, color = '#94a3b8' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="7" y="2" width="2" height="10" fill={color} />
    <rect x="4" y="12" width="8" height="2" fill="#78350f" />
  </svg>
);

// Generic armor fallback
const GenericArmorIcon = ({ size = 16, color = '#6b7280' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="4" y="4" width="8" height="8" fill={color} />
    <rect x="3" y="5" width="2" height="4" fill={color} />
    <rect x="11" y="5" width="2" height="4" fill={color} />
  </svg>
);

// Generic accessory fallback
const GenericAccessoryIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="5" y="4" width="6" height="2" fill={color} />
    <rect x="4" y="6" width="2" height="4" fill={color} />
    <rect x="10" y="6" width="2" height="4" fill={color} />
    <rect x="5" y="10" width="6" height="2" fill={color} />
  </svg>
);

// Map equipment template IDs to icon components
const EQUIPMENT_ICONS = {
  // Weapons
  sword: SwordIcon,
  greatsword: SwordIcon,
  axe: AxeIcon,
  titanBlade: SwordIcon,
  staff: StaffIcon,
  wand: StaffIcon,
  archmageStaff: StaffIcon,
  soulStaff: StaffIcon,
  lichStaff: StaffIcon,
  orb: OrbIcon,
  celestialOrb: OrbIcon,
  dagger: DaggerIcon,
  assassinBlade: DaggerIcon,
  shadowDagger: DaggerIcon,
  shortbow: BowIcon,
  longbow: BowIcon,
  huntersBow: BowIcon,
  mace: MaceIcon,
  holySymbol: MaceIcon,

  // Armor
  chainmail: ArmorIcon,
  plate: ArmorIcon,
  dragonscaleArmor: ArmorIcon,
  leather: LeatherIcon,
  shadowCloak: LeatherIcon,
  huntersCloak: LeatherIcon,
  forestguardVest: LeatherIcon,
  robes: RobesIcon,
  arcaneVestments: RobesIcon,
  holyRobes: RobesIcon,
  deathRobes: RobesIcon,
  shroudOfShadows: RobesIcon,
  divineVestments: RobesIcon,

  // Accessories
  ring: RingIcon,
  amulet: AmuletIcon,
  hawkeyeAmulet: AmuletIcon,
  skullAmulet: SkullAccessoryIcon,
  soulGem: OrbIcon,
  boots: BootsIcon,
  crown: CrownIcon,
  warriorBelt: LeatherIcon,
  thiefGloves: GlovesIcon,
  spellbook: SpellbookIcon,
  holyRelic: MaceIcon,
  enchantedQuiver: BowIcon,
  phoenixFeather: AmuletIcon,
};

// Get rarity color
const getRarityColor = (rarity) => {
  const colors = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b',
  };
  return colors[rarity] || colors.common;
};

// Main ItemIcon component
const ItemIcon = ({ item, size = 24, showRarity = true }) => {
  if (!item) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center opacity-30"
      >
        <GenericAccessoryIcon size={size} color="#4b5563" />
      </div>
    );
  }

  // Get the template ID from the item
  const templateId = item.templateId || item.id;
  const IconComponent = EQUIPMENT_ICONS[templateId];

  // Fallback based on slot
  const FallbackIcon = item.slot === 'weapon'
    ? GenericWeaponIcon
    : item.slot === 'armor'
      ? GenericArmorIcon
      : GenericAccessoryIcon;

  const color = showRarity && item.rarity
    ? getRarityColor(item.rarity)
    : '#94a3b8';

  if (IconComponent) {
    return <IconComponent size={size} color={color} />;
  }

  return <FallbackIcon size={size} color={color} />;
};

// Export slot-based placeholder icons
export const WeaponSlotIcon = ({ size = 24 }) => <GenericWeaponIcon size={size} color="#4b5563" />;
export const ArmorSlotIcon = ({ size = 24 }) => <GenericArmorIcon size={size} color="#4b5563" />;
export const AccessorySlotIcon = ({ size = 24 }) => <GenericAccessoryIcon size={size} color="#4b5563" />;

export default ItemIcon;
