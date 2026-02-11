// Composite hero icon with equipped weapon and armor color based on rarity
import { CLASS_BASE_ICONS } from './classBase';
import { WEAPON_COMPONENTS, RARITY_COLORS } from './weapons';

// Default weapons by class (when no weapon equipped)
const DEFAULT_WEAPONS = {
  warrior: 'sword',
  paladin: 'sword',
  knight: 'sword',
  mage: 'staff',
  cleric: 'staff',
  druid: 'staff',
  shaman: 'totem',
  rogue: 'daggers',
  ranger: 'bow',
  necromancer: 'scythe',
};

// Determine weapon type from equipment item
const getWeaponType = (weapon, classId) => {
  if (!weapon) {
    // Return default weapon for class
    return DEFAULT_WEAPONS[classId] || 'sword';
  }

  // Check the item's baseType or name for weapon type hints
  const name = (weapon.name || '').toLowerCase();
  const baseType = (weapon.baseType || '').toLowerCase();

  // Check for specific weapon types
  if (baseType.includes('staff') || name.includes('staff')) return 'staff';
  if (baseType.includes('wand') || name.includes('wand')) return 'wand';
  if (baseType.includes('orb') || name.includes('orb')) return 'orb';
  if (baseType.includes('bow') || name.includes('bow')) return 'bow';
  if (baseType.includes('crossbow') || name.includes('crossbow')) return 'crossbow';
  if (baseType.includes('dagger') || name.includes('dagger')) return 'daggers';
  if (baseType.includes('axe') || name.includes('axe')) return 'axe';
  if (baseType.includes('mace') || name.includes('mace')) return 'mace';
  if (baseType.includes('hammer') || name.includes('hammer')) return 'hammer';
  if (baseType.includes('scythe') || name.includes('scythe')) return 'scythe';
  if (baseType.includes('totem') || name.includes('totem')) return 'totem';
  if (baseType.includes('sword') || name.includes('sword') || name.includes('blade')) return 'sword';

  // Fallback to default for class
  return DEFAULT_WEAPONS[classId] || 'sword';
};

// Get armor color based on armor rarity
const getArmorColor = (equipment) => {
  const armorRarity = equipment?.armor?.rarity || 'common';
  return RARITY_COLORS[armorRarity];
};

// Main HeroIcon component
const HeroIcon = ({
  classId,
  equipment = {},
  size = 24,
  className = '',
  showWeapon = true,
}) => {
  const ClassIcon = CLASS_BASE_ICONS[classId];

  if (!ClassIcon) {
    return <span className={className} style={{ fontSize: size * 0.8 }}>?</span>;
  }

  // Get weapon component
  const weaponType = showWeapon ? getWeaponType(equipment.weapon, classId) : null;
  const WeaponIcon = weaponType ? WEAPON_COMPONENTS[weaponType] : null;

  // Get rarity colors for weapon and armor
  const weaponRarity = equipment.weapon?.rarity || 'common';
  const weaponColor = RARITY_COLORS[weaponRarity];
  const armorColor = getArmorColor(equipment);

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Base class icon with armor color */}
      <ClassIcon size={size} armorColor={armorColor} />

      {/* Weapon overlay */}
      {WeaponIcon && (
        <WeaponIcon size={size} color={weaponColor} />
      )}
    </div>
  );
};

export default HeroIcon;
