import { CLASSES, getClassesByRole } from '../../data/classes';
import { generateEquipment, getEquipmentForClass } from '../../data/equipment';
import { getStarterSkill } from '../../data/skillTrees';
import { getRaidUniqueIds } from '../../data/raids';

// Random name generators for tavern heroes
const FIRST_NAMES = [
  'Aldric', 'Brynn', 'Cedric', 'Daria', 'Elric', 'Freya', 'Gareth', 'Helena',
  'Ivar', 'Jade', 'Kira', 'Lyra', 'Magnus', 'Nadia', 'Orin', 'Petra',
  'Quinn', 'Rhea', 'Sven', 'Thalia', 'Ulric', 'Vera', 'Wyatt', 'Xena',
  'Yuri', 'Zara', 'Ash', 'Brock', 'Cleo', 'Drake', 'Echo', 'Finn',
  'Gwen', 'Hugo', 'Iris', 'Jax', 'Kane', 'Luna', 'Milo', 'Nova',
];

const EPITHETS = [
  'the Bold', 'the Brave', 'the Swift', 'the Wise', 'the Strong',
  'the Fierce', 'the Cunning', 'the Valiant', 'the Stalwart', 'the Silent',
  'Ironhand', 'Shadowstep', 'Lightbringer', 'Stormborn', 'Frostbane',
  'Flameheart', 'Duskwalker', 'Dawnbreaker', 'Nightshade', 'Thornguard',
];

// Generate a random tavern hero
export const generateTavernHero = (role, dungeonLevel = 1) => {
  // Get available classes for this role
  const availableClasses = getClassesByRole(role);
  const classData = availableClasses[Math.floor(Math.random() * availableClasses.length)];

  // Generate random name
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const hasEpithet = Math.random() > 0.6;
  const epithet = hasEpithet ? EPITHETS[Math.floor(Math.random() * EPITHETS.length)] : '';
  const name = hasEpithet ? `${firstName} ${epithet}` : firstName;

  // Level scales with highest dungeon cleared
  // Base level is roughly half of dungeon level, with ±1-2 variance
  const baseLevel = Math.max(1, Math.floor(dungeonLevel / 2));
  const variance = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
  const level = Math.max(1, baseLevel + variance);

  // Get starter skill
  const starterSkill = getStarterSkill(classData.id);

  // Generate equipment (chance based on dungeon progress)
  const equipment = { weapon: null, armor: null, accessory: null };
  const equipChance = Math.min(0.8, 0.3 + dungeonLevel * 0.05);

  ['weapon', 'armor', 'accessory'].forEach(slot => {
    if (Math.random() < equipChance) {
      // Get equipment usable by this class for this slot
      const availableEquip = getEquipmentForClass(classData.id, Math.ceil(dungeonLevel / 5))
        .filter(e => e.slot === slot);

      if (availableEquip.length > 0) {
        // Generate a random item of this type
        const template = availableEquip[Math.floor(Math.random() * availableEquip.length)];
        // Lower rarity for tavern heroes (mostly common/uncommon)
        const item = generateEquipment(Math.max(1, dungeonLevel - 2), {
          forceTemplate: template.id,
        });
        // Override to lower rarity for balance
        if (item && Math.random() < 0.7) {
          item.rarity = Math.random() < 0.6 ? 'common' : 'uncommon';
        }
        equipment[slot] = item;
      }
    }
  });

  // Calculate recruitment cost based on level and equipment
  let baseCost = 50 + level * 30;
  // Add cost for equipment
  Object.values(equipment).forEach(item => {
    if (item) {
      const rarityBonus = { common: 10, uncommon: 25, rare: 50, epic: 100, legendary: 200 };
      baseCost += rarityBonus[item.rarity] || 10;
    }
  });

  // Add a trait (special bonus)
  const traits = [
    { id: 'veteran', name: 'Veteran', description: '+10% XP gain', xpBonus: 0.1 },
    { id: 'lucky', name: 'Lucky', description: '+5% gold find', goldBonus: 0.05 },
    { id: 'hardy', name: 'Hardy', description: '+10 max HP', hpBonus: 10 },
    { id: 'quick', name: 'Quick Learner', description: 'Starts with +1 level', levelBonus: 1 },
    { id: 'equipped', name: 'Well-Equipped', description: 'Comes with better gear', gearBonus: true },
    { id: 'none', name: null, description: null },
  ];
  const trait = traits[Math.floor(Math.random() * traits.length)];

  // Apply trait effects
  let finalLevel = level;
  if (trait.id === 'quick') {
    finalLevel += 1;
    baseCost += 40;
  }
  if (trait.id === 'hardy') baseCost += 20;
  if (trait.id === 'veteran') baseCost += 30;

  return {
    id: `tavern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    classId: classData.id,
    level: finalLevel,
    xp: 0,
    equipment,
    skills: starterSkill ? [starterSkill.id] : [],
    trait: trait.id !== 'none' ? trait : null,
    recruitCost: Math.floor(baseCost),
    role,
  };
};

// Create a new hero
export const createHero = (classId, name, startingLevel = 1) => {
  const classData = CLASSES[classId];
  const starterSkill = getStarterSkill(classId);

  return {
    id: `hero_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: name || classData.name,
    classId,
    level: startingLevel,
    xp: 0,
    equipment: {
      weapon: null,
      armor: null,
      accessory: null,
    },
    skills: starterSkill ? [starterSkill.id] : [], // Start with class starter skill
  };
};

// Helper to map unique templateId to its collection group
export const WORLD_BOSS_UNIQUES = ['ancient_bark', 'crown_of_the_fallen', 'magma_core', 'void_heart'];
export const RAID_COLLECTIONS = [
  { id: 'sunken_temple', name: 'Sunken Temple' },
  { id: 'cursed_manor', name: 'Cursed Manor' },
  { id: 'sky_fortress', name: 'Sky Fortress' },
  { id: 'the_abyss', name: 'The Abyss' },
  { id: 'void_throne', name: 'Void Throne' },
];

export const getCollectionForUnique = (templateId) => {
  if (WORLD_BOSS_UNIQUES.includes(templateId)) {
    return { id: 'world_bosses', name: 'World Bosses', uniques: WORLD_BOSS_UNIQUES };
  }
  for (const raid of RAID_COLLECTIONS) {
    const raidUniques = getRaidUniqueIds(raid.id);
    if (raidUniques.includes(templateId)) {
      return { id: raid.id, name: raid.name, uniques: raidUniques };
    }
  }
  return null;
};
