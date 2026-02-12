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

// =====================================================
// UNIQUE ITEM ICONS - Legendary items with special designs
// =====================================================

// Ancient Bark - Tree bark shield with green glow (World Boss Lv15)
const AncientBarkIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="4" y="2" width="8" height="2" fill="#166534" />
    <rect x="3" y="4" width="10" height="8" fill="#15803d" />
    <rect x="4" y="12" width="8" height="2" fill="#166534" />
    <rect x="5" y="5" width="2" height="6" fill="#14532d" />
    <rect x="9" y="5" width="2" height="6" fill="#14532d" />
    <rect x="6" y="3" width="4" height="2" fill="#22c55e" />
    <rect x="7" y="1" width="2" height="2" fill={color} />
  </svg>
);

// Crown of the Fallen - Dark crown with red gems (World Boss Lv20)
const CrownOfFallenIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="2" y="10" width="12" height="3" fill="#374151" />
    <rect x="2" y="6" width="2" height="4" fill="#374151" />
    <rect x="7" y="4" width="2" height="6" fill="#374151" />
    <rect x="12" y="6" width="2" height="4" fill="#374151" />
    <rect x="3" y="5" width="2" height="2" fill="#dc2626" />
    <rect x="11" y="5" width="2" height="2" fill="#dc2626" />
    <rect x="7" y="3" width="2" height="2" fill={color} />
    <rect x="5" y="11" width="6" height="1" fill="#1f2937" />
  </svg>
);

// Magma Core - Flaming orb weapon (World Boss Lv25)
const MagmaCoreIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="5" y="4" width="6" height="2" fill="#fbbf24" />
    <rect x="4" y="6" width="8" height="4" fill="#f97316" />
    <rect x="5" y="10" width="6" height="2" fill="#ea580c" />
    <rect x="6" y="6" width="2" height="2" fill="#fef3c7" />
    <rect x="7" y="2" width="2" height="2" fill="#fbbf24" />
    <rect x="3" y="7" width="2" height="2" fill="#ef4444" />
    <rect x="11" y="7" width="2" height="2" fill="#ef4444" />
    <rect x="7" y="12" width="2" height="2" fill="#78350f" />
  </svg>
);

// Void Heart - Purple void crystal (World Boss Lv30)
const VoidHeartIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="6" y="2" width="4" height="2" fill="#7c3aed" />
    <rect x="5" y="4" width="6" height="2" fill="#8b5cf6" />
    <rect x="4" y="6" width="8" height="4" fill="#6d28d9" />
    <rect x="5" y="10" width="6" height="2" fill="#5b21b6" />
    <rect x="6" y="12" width="4" height="2" fill="#4c1d95" />
    <rect x="6" y="6" width="2" height="2" fill="#c4b5fd" />
    <rect x="7" y="4" width="2" height="1" fill={color} />
  </svg>
);

// Tidal Pendant - Blue wave amulet (Sunken Temple)
const TidalPendantIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="6" y="1" width="4" height="1" fill={color} />
    <rect x="5" y="2" width="2" height="3" fill={color} />
    <rect x="9" y="2" width="2" height="3" fill={color} />
    <rect x="4" y="5" width="8" height="6" fill="#0ea5e9" />
    <rect x="5" y="11" width="6" height="2" fill="#0284c7" />
    <rect x="5" y="6" width="6" height="2" fill="#38bdf8" />
    <rect x="6" y="8" width="4" height="2" fill="#7dd3fc" />
  </svg>
);

// Serpent's Fang - Snake fang dagger (Sunken Temple)
const SerpentsFangIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="7" y="1" width="2" height="2" fill="#d9f99d" />
    <rect x="7" y="3" width="2" height="3" fill="#bef264" />
    <rect x="6" y="6" width="4" height="2" fill="#84cc16" />
    <rect x="7" y="8" width="2" height="2" fill="#65a30d" />
    <rect x="5" y="10" width="6" height="2" fill="#78350f" />
    <rect x="6" y="12" width="4" height="2" fill="#92400e" />
    <rect x="8" y="2" width="1" height="4" fill={color} />
  </svg>
);

// Phantom Cloak - Ghostly white/gray cloak (Cursed Manor)
const PhantomCloakIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="5" y="2" width="6" height="2" fill="#e5e7eb" />
    <rect x="4" y="4" width="8" height="6" fill="#d1d5db" />
    <rect x="3" y="5" width="2" height="5" fill="#9ca3af" />
    <rect x="11" y="5" width="2" height="5" fill="#9ca3af" />
    <rect x="4" y="10" width="3" height="3" fill="#6b7280" />
    <rect x="9" y="10" width="3" height="3" fill="#6b7280" />
    <rect x="7" y="10" width="2" height="4" fill="#4b5563" />
    <rect x="7" y="3" width="2" height="1" fill={color} />
  </svg>
);

// Banshee's Wail - Skull-topped staff (Cursed Manor)
const BansheesWailIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="5" y="1" width="6" height="4" fill="#e5e7eb" />
    <rect x="6" y="2" width="2" height="2" fill="#1f2937" />
    <rect x="8" y="3" width="1" height="1" fill="#1f2937" />
    <rect x="7" y="5" width="2" height="9" fill="#6b7280" />
    <rect x="6" y="6" width="4" height="1" fill={color} />
    <rect x="5" y="13" width="6" height="1" fill="#4b5563" />
  </svg>
);

// Vampire's Embrace - Red bat-wing amulet (Cursed Manor)
const VampiresEmbraceIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="6" y="1" width="4" height="1" fill={color} />
    <rect x="5" y="2" width="2" height="2" fill={color} />
    <rect x="9" y="2" width="2" height="2" fill={color} />
    <rect x="2" y="5" width="5" height="3" fill="#dc2626" />
    <rect x="9" y="5" width="5" height="3" fill="#dc2626" />
    <rect x="5" y="4" width="6" height="5" fill="#b91c1c" />
    <rect x="6" y="9" width="4" height="3" fill="#991b1b" />
    <rect x="7" y="12" width="2" height="2" fill="#7f1d1d" />
    <rect x="7" y="6" width="2" height="2" fill={color} />
  </svg>
);

// Stormcaller's Rod - Lightning bolt staff (Sky Fortress)
const StormcallersRodIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="7" y="5" width="2" height="9" fill="#78350f" />
    <rect x="5" y="1" width="6" height="4" fill="#fbbf24" />
    <rect x="6" y="2" width="4" height="2" fill="#fef3c7" />
    <rect x="4" y="2" width="2" height="2" fill="#eab308" />
    <rect x="10" y="2" width="2" height="2" fill="#eab308" />
    <rect x="7" y="0" width="2" height="2" fill={color} />
  </svg>
);

// Thunder Guard - Electric blue shield armor (Sky Fortress)
const ThunderGuardIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="3" y="3" width="10" height="2" fill="#3b82f6" />
    <rect x="2" y="5" width="4" height="6" fill="#2563eb" />
    <rect x="10" y="5" width="4" height="6" fill="#2563eb" />
    <rect x="5" y="5" width="6" height="8" fill="#1d4ed8" />
    <rect x="6" y="6" width="4" height="1" fill="#93c5fd" />
    <rect x="7" y="8" width="2" height="3" fill="#fbbf24" />
    <rect x="6" y="10" width="1" height="2" fill="#fbbf24" />
    <rect x="9" y="10" width="1" height="2" fill="#fbbf24" />
  </svg>
);

// Eye of the Storm - Swirling blue eye orb (Sky Fortress)
const EyeOfStormIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="5" y="3" width="6" height="2" fill="#60a5fa" />
    <rect x="4" y="5" width="8" height="6" fill="#3b82f6" />
    <rect x="5" y="11" width="6" height="2" fill="#2563eb" />
    <rect x="6" y="6" width="4" height="4" fill="#1e3a8a" />
    <rect x="7" y="7" width="2" height="2" fill="#bfdbfe" />
    <rect x="3" y="7" width="2" height="2" fill="#93c5fd" />
    <rect x="11" y="7" width="2" height="2" fill="#93c5fd" />
    <rect x="7" y="2" width="2" height="1" fill={color} />
  </svg>
);

// Abyssal Maw - Dark teeth/jaw weapon (The Abyss)
const AbyssalMawIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="3" y="4" width="10" height="8" fill="#1e293b" />
    <rect x="4" y="3" width="2" height="2" fill="#e5e7eb" />
    <rect x="7" y="2" width="2" height="3" fill="#e5e7eb" />
    <rect x="10" y="3" width="2" height="2" fill="#e5e7eb" />
    <rect x="4" y="10" width="2" height="2" fill="#e5e7eb" />
    <rect x="7" y="11" width="2" height="2" fill="#e5e7eb" />
    <rect x="10" y="10" width="2" height="2" fill="#e5e7eb" />
    <rect x="5" y="6" width="6" height="3" fill="#7f1d1d" />
    <rect x="7" y="1" width="2" height="1" fill={color} />
  </svg>
);

// Kraken's Grasp - Tentacle ring (The Abyss)
const KrakensGraspIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="5" y="4" width="6" height="2" fill="#0f766e" />
    <rect x="4" y="6" width="2" height="4" fill="#0d9488" />
    <rect x="10" y="6" width="2" height="4" fill="#0d9488" />
    <rect x="5" y="10" width="6" height="2" fill="#14b8a6" />
    <rect x="2" y="5" width="2" height="3" fill="#115e59" />
    <rect x="12" y="5" width="2" height="3" fill="#115e59" />
    <rect x="1" y="7" width="2" height="4" fill="#134e4a" />
    <rect x="13" y="7" width="2" height="4" fill="#134e4a" />
    <rect x="6" y="5" width="4" height="1" fill={color} />
  </svg>
);

// Leviathan's Heart - Deep blue pulsing heart (The Abyss)
const LeviathansHeartIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="3" y="4" width="4" height="3" fill="#1e40af" />
    <rect x="9" y="4" width="4" height="3" fill="#1e40af" />
    <rect x="4" y="3" width="3" height="2" fill="#2563eb" />
    <rect x="9" y="3" width="3" height="2" fill="#2563eb" />
    <rect x="3" y="7" width="10" height="4" fill="#1e3a8a" />
    <rect x="5" y="11" width="6" height="2" fill="#1e3a8a" />
    <rect x="7" y="13" width="2" height="2" fill="#172554" />
    <rect x="6" y="5" width="4" height="4" fill="#3b82f6" />
    <rect x="7" y="6" width="2" height="2" fill={color} />
  </svg>
);

// Reality Shard - Fractured purple crystal (Void Throne)
const RealityShardIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="7" y="1" width="2" height="3" fill="#c4b5fd" />
    <rect x="6" y="4" width="4" height="2" fill="#a78bfa" />
    <rect x="5" y="6" width="6" height="4" fill="#8b5cf6" />
    <rect x="6" y="10" width="4" height="2" fill="#7c3aed" />
    <rect x="7" y="12" width="2" height="2" fill="#6d28d9" />
    <rect x="3" y="5" width="2" height="3" fill="#a78bfa" />
    <rect x="11" y="5" width="2" height="3" fill="#a78bfa" />
    <rect x="7" y="5" width="2" height="2" fill={color} />
  </svg>
);

// Nullblade - Black void sword (Void Throne)
const NullbladeIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="7" y="1" width="2" height="2" fill="#1f2937" />
    <rect x="7" y="3" width="2" height="2" fill="#111827" />
    <rect x="7" y="5" width="2" height="3" fill="#030712" />
    <rect x="6" y="8" width="4" height="2" fill="#1f2937" />
    <rect x="4" y="10" width="2" height="2" fill={color} />
    <rect x="10" y="10" width="2" height="2" fill={color} />
    <rect x="6" y="10" width="4" height="4" fill="#78350f" />
    <rect x="8" y="2" width="1" height="5" fill="#4b5563" />
  </svg>
);

// Cloak of Nothing - Black hole cloak (Void Throne)
const CloakOfNothingIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="5" y="2" width="6" height="2" fill="#1f2937" />
    <rect x="4" y="4" width="8" height="6" fill="#111827" />
    <rect x="3" y="5" width="2" height="5" fill="#030712" />
    <rect x="11" y="5" width="2" height="5" fill="#030712" />
    <rect x="4" y="10" width="3" height="3" fill="#030712" />
    <rect x="9" y="10" width="3" height="3" fill="#030712" />
    <rect x="7" y="10" width="2" height="4" fill="#000" />
    <rect x="6" y="5" width="4" height="3" fill="#6d28d9" />
    <rect x="7" y="3" width="2" height="1" fill={color} />
  </svg>
);

// Void God's Crown - Eye-centered dark crown (Void Throne)
const VoidGodsCrownIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="2" y="10" width="12" height="3" fill="#1f2937" />
    <rect x="2" y="6" width="2" height="4" fill="#111827" />
    <rect x="7" y="4" width="2" height="6" fill="#111827" />
    <rect x="12" y="6" width="2" height="4" fill="#111827" />
    <rect x="3" y="5" width="2" height="2" fill="#7c3aed" />
    <rect x="11" y="5" width="2" height="2" fill="#7c3aed" />
    <rect x="6" y="6" width="4" height="3" fill="#c4b5fd" />
    <rect x="7" y="7" width="2" height="1" fill="#1f2937" />
    <rect x="7" y="3" width="2" height="2" fill={color} />
  </svg>
);

// Entropy Accessory - Swirling black orb (Void Throne)
const EntropyAccessoryIcon = ({ size = 16, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={pixelStyle}>
    <rect x="5" y="3" width="6" height="2" fill="#374151" />
    <rect x="4" y="5" width="8" height="6" fill="#1f2937" />
    <rect x="5" y="11" width="6" height="2" fill="#111827" />
    <rect x="6" y="5" width="2" height="2" fill="#6b7280" />
    <rect x="8" y="7" width="2" height="2" fill="#4b5563" />
    <rect x="5" y="8" width="2" height="2" fill="#374151" />
    <rect x="9" y="5" width="1" height="1" fill="#9ca3af" />
    <rect x="7" y="2" width="2" height="1" fill={color} />
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

  // Unique Items - World Bosses
  ancient_bark: AncientBarkIcon,
  crown_of_the_fallen: CrownOfFallenIcon,
  magma_core: MagmaCoreIcon,
  void_heart: VoidHeartIcon,

  // Unique Items - Sunken Temple
  tidal_pendant: TidalPendantIcon,
  serpents_fang: SerpentsFangIcon,

  // Unique Items - Cursed Manor
  phantom_cloak: PhantomCloakIcon,
  banshees_wail: BansheesWailIcon,
  vampires_embrace: VampiresEmbraceIcon,

  // Unique Items - Sky Fortress
  stormcallers_rod: StormcallersRodIcon,
  thunder_guard: ThunderGuardIcon,
  eye_of_the_storm: EyeOfStormIcon,

  // Unique Items - The Abyss
  abyssal_maw: AbyssalMawIcon,
  krakens_grasp: KrakensGraspIcon,
  leviathans_heart: LeviathansHeartIcon,

  // Unique Items - Void Throne
  reality_shard: RealityShardIcon,
  nullblade: NullbladeIcon,
  cloak_of_nothing: CloakOfNothingIcon,
  void_gods_crown: VoidGodsCrownIcon,
  entropy_accessory: EntropyAccessoryIcon,
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
