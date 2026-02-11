// Raid dungeon definitions
// Raids must be manually triggered by the player
// Unique items ONLY drop from raid bosses

export const RAIDS = {
  dragon_sanctum: {
    id: 'dragon_sanctum',
    name: 'Dragon Sanctum',
    emoji: '🐉',
    description: 'Face the Dragon Council in their ancient lair',
    requiredLevel: 15,
    unlockMilestone: 'milestone_15',
    statMultiplier: 2.0,
    weeklyLockout: true,
    wings: [
      {
        id: 'outer_sanctum',
        name: 'Outer Sanctum',
        description: 'Battle through the dragon\'s guard',
        rooms: 8,
        boss: {
          id: 'fire_drake',
          name: 'Fire Drake',
          emoji: '🔥',
          baseStats: { maxHp: 800, attack: 45, defense: 20, speed: 9 },
          abilities: ['fire_breath', 'tail_swipe', 'enrage'],
          aiType: 'boss',
          phases: [
            { hpPercent: 100, abilities: ['fire_breath', 'tail_swipe'] },
            { hpPercent: 50, abilities: ['fire_breath', 'enrage'] },
          ],
        },
        rewards: {
          gold: 5000,
          guaranteedRarity: 'epic',
        },
        uniqueDrops: ['staff_of_frost'],
      },
      {
        id: 'inner_chamber',
        name: 'Inner Chamber',
        description: 'The frozen heart of the sanctum',
        rooms: 6,
        boss: {
          id: 'frost_wyrm',
          name: 'Frost Wyrm',
          emoji: '❄️',
          baseStats: { maxHp: 1200, attack: 55, defense: 25, speed: 7 },
          abilities: ['frost_bolt', 'wing_buffet', 'terrifying_roar', 'shield_wall'],
          aiType: 'boss',
          phases: [
            { hpPercent: 100, abilities: ['frost_bolt', 'wing_buffet'] },
            { hpPercent: 60, abilities: ['terrifying_roar', 'frost_bolt'] },
            { hpPercent: 30, abilities: ['frost_bolt', 'shield_wall'], enraged: true },
          ],
        },
        rewards: {
          gold: 8000,
          guaranteedRarity: 'epic',
        },
        uniqueDrops: ['flamebreaker', 'windrunner'],
      },
      {
        id: 'dragon_throne',
        name: 'Dragon Throne',
        description: 'Face the Dragon King himself',
        rooms: 4,
        boss: {
          id: 'dragon_king',
          name: 'Dragon King',
          emoji: '🐲',
          baseStats: { maxHp: 2500, attack: 75, defense: 35, speed: 10 },
          abilities: ['fire_breath', 'tail_swipe', 'wing_buffet', 'inferno_breath', 'terrifying_roar', 'summon_minions'],
          aiType: 'boss',
          phases: [
            { hpPercent: 100, abilities: ['fire_breath', 'tail_swipe'] },
            { hpPercent: 75, abilities: ['wing_buffet', 'terrifying_roar'] },
            { hpPercent: 50, abilities: ['inferno_breath', 'summon_minions'] },
            { hpPercent: 25, abilities: ['inferno_breath', 'fire_breath'], enraged: true },
          ],
          summonType: 'fire_drake_spawn',
        },
        rewards: {
          gold: 15000,
          guaranteedRarity: 'legendary',
        },
        uniqueDrops: ['dragonscale_mantle'],
        isFinalWing: true,
      },
    ],
  },

  lich_throne: {
    id: 'lich_throne',
    name: 'Lich King\'s Throne',
    emoji: '💀',
    description: 'Assault the undead citadel',
    requiredLevel: 20,
    unlockMilestone: 'milestone_20',
    statMultiplier: 2.2,
    weeklyLockout: true,
    wings: [
      {
        id: 'catacombs',
        name: 'The Catacombs',
        description: 'Navigate the endless tombs',
        rooms: 10,
        boss: {
          id: 'bone_colossus',
          name: 'Bone Colossus',
          emoji: '☠️',
          baseStats: { maxHp: 1000, attack: 50, defense: 30, speed: 4 },
          abilities: ['power_attack', 'stunning_blow', 'raise_dead'],
          aiType: 'boss',
          phases: [
            { hpPercent: 100, abilities: ['power_attack', 'stunning_blow'] },
            { hpPercent: 50, abilities: ['raise_dead', 'power_attack'] },
          ],
        },
        rewards: {
          gold: 6000,
          guaranteedRarity: 'epic',
        },
        uniqueDrops: ['armor_of_undying'],
      },
      {
        id: 'throne_room',
        name: 'Throne Room',
        description: 'Face the Lich King',
        rooms: 6,
        boss: {
          id: 'lich_king_raid',
          name: 'Lich King',
          emoji: '👑',
          baseStats: { maxHp: 2000, attack: 70, defense: 30, speed: 11 },
          abilities: ['death_coil', 'soul_drain', 'raise_dead', 'frost_bolt', 'phase_shift', 'curse'],
          aiType: 'boss',
          phases: [
            { hpPercent: 100, abilities: ['death_coil', 'frost_bolt'] },
            { hpPercent: 70, abilities: ['raise_dead', 'curse'] },
            { hpPercent: 40, abilities: ['soul_drain', 'phase_shift'] },
            { hpPercent: 20, abilities: ['soul_drain', 'death_coil'], enraged: true },
          ],
        },
        rewards: {
          gold: 12000,
          guaranteedRarity: 'legendary',
        },
        uniqueDrops: ['soul_harvester', 'ring_of_archmage'],
        isFinalWing: true,
      },
    ],
  },

  shadow_realm: {
    id: 'shadow_realm',
    name: 'Shadow Realm',
    emoji: '🌑',
    description: 'Enter the realm of eternal darkness',
    requiredLevel: 25,
    unlockMilestone: 'milestone_25',
    statMultiplier: 2.5,
    weeklyLockout: true,
    wings: [
      {
        id: 'void_entrance',
        name: 'Void Entrance',
        description: 'Cross into shadow',
        rooms: 8,
        boss: {
          id: 'shadow_beast',
          name: 'Shadow Beast',
          emoji: '👁️',
          baseStats: { maxHp: 1400, attack: 60, defense: 20, speed: 14 },
          abilities: ['quick_strike', 'blinding_dust', 'phase_shift'],
          aiType: 'assassin',
          phases: [
            { hpPercent: 100, abilities: ['quick_strike', 'blinding_dust'] },
            { hpPercent: 50, abilities: ['phase_shift', 'quick_strike'] },
          ],
        },
        rewards: {
          gold: 8000,
          guaranteedRarity: 'epic',
        },
        uniqueDrops: ['shadowfang'],
      },
      {
        id: 'heart_of_darkness',
        name: 'Heart of Darkness',
        description: 'Face the Shadow Lord',
        rooms: 5,
        boss: {
          id: 'shadow_lord',
          name: 'Shadow Lord',
          emoji: '🌑',
          baseStats: { maxHp: 2200, attack: 80, defense: 25, speed: 12 },
          abilities: ['death_coil', 'charm', 'phase_shift', 'soul_drain', 'blinding_dust'],
          aiType: 'boss',
          phases: [
            { hpPercent: 100, abilities: ['death_coil', 'charm'] },
            { hpPercent: 60, abilities: ['phase_shift', 'soul_drain'] },
            { hpPercent: 30, abilities: ['soul_drain', 'blinding_dust'], enraged: true },
          ],
        },
        rewards: {
          gold: 15000,
          guaranteedRarity: 'legendary',
        },
        uniqueDrops: ['shadow_cloak', 'boots_of_blinding_speed'],
        isFinalWing: true,
      },
    ],
  },
};

// Get raid by ID
export const getRaid = (raidId) => RAIDS[raidId];

// Get all raids
export const getAllRaids = () => Object.values(RAIDS);

// Check if a raid is unlocked
export const isRaidUnlocked = (raidId, claimedMilestones = [], highestDungeon = 0) => {
  const raid = RAIDS[raidId];
  if (!raid) return false;

  // Check level requirement
  if (highestDungeon < raid.requiredLevel) return false;

  // Check milestone requirement
  if (raid.unlockMilestone && !claimedMilestones.includes(raid.unlockMilestone)) {
    return false;
  }

  return true;
};

// Check if a raid is on weekly lockout
export const isRaidOnLockout = (raidId, completedRaids = [], lastReset) => {
  if (!completedRaids.includes(raidId)) return false;

  // Check if weekly reset has passed
  const now = new Date();
  const resetDay = new Date(lastReset);

  // Weekly reset is Monday at midnight
  const getNextMonday = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + ((1 + 7 - d.getDay()) % 7 || 7));
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const nextReset = getNextMonday(resetDay);
  return now < nextReset;
};

// Get unique items that can drop from a raid wing
export const getWingUniqueDrops = (raidId, wingId) => {
  const raid = RAIDS[raidId];
  if (!raid) return [];

  const wing = raid.wings.find(w => w.id === wingId);
  return wing?.uniqueDrops || [];
};

// Roll for unique item drop from raid boss
export const rollRaidUniqueDrop = (raidId, wingId, isFinalBoss = false) => {
  const drops = getWingUniqueDrops(raidId, wingId);
  if (drops.length === 0) return null;

  // 100% drop rate from final boss, 25% from other wing bosses
  const dropChance = isFinalBoss ? 1.0 : 0.25;
  if (Math.random() > dropChance) return null;

  // Pick random unique from available drops
  return drops[Math.floor(Math.random() * drops.length)];
};

// Get raid progress for display
export const getRaidProgress = (raidId, completedWings = []) => {
  const raid = RAIDS[raidId];
  if (!raid) return null;

  return {
    total: raid.wings.length,
    completed: completedWings.filter(w => raid.wings.some(rw => rw.id === w)).length,
    wings: raid.wings.map(w => ({
      ...w,
      completed: completedWings.includes(w.id),
    })),
  };
};
