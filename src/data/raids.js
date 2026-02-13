// Raid dungeon definitions - Large dungeons with multiple boss encounters
// Raids are continuous dungeons where players fight through wing bosses
// before facing the final boss at the end

const AI = {
  BOSS: 'boss',
  AGGRESSIVE: 'aggressive',
  TANK: 'tank',
};

export const RAIDS = {
  // ========================================
  // SUNKEN TEMPLE - Level 12
  // Theme: Flooded ancient ruins, water, cursed
  // Hub: Temple Entrance -> 2 Wing Bosses -> Final Boss
  // ========================================
  sunken_temple: {
    id: 'sunken_temple',
    name: 'Sunken Temple',
    spriteId: 'raid_sunken_temple',
    description: 'Ancient ruins flooded by cursed waters. The Sea Serpent awaits in the depths.',
    requiredLevel: 12,
    theme: 'water',
    difficulty: 2,          // 1-5 scale
    estimatedRooms: 10,     // Approximate room count
    recommendedLevel: 14,   // Suggested hero level

    hub: {
      name: 'Temple Entrance',
      description: 'Ancient flooded halls converge here. Choose your path.',
      spriteId: 'hub_sunken_temple',
    },

    wingBosses: [
      {
        id: 'corrupted_priest',
        name: 'Corrupted Priest',
        spriteId: 'boss_corrupted_priest',
        doorPosition: 'north',
        doorLabel: 'Flooded Chapel',
        rooms: 4,
        baseStats: { maxHp: 600, attack: 35, defense: 18, speed: 8 },
        abilities: ['curse', 'drain_life', 'dark_heal', 'water_bolt'],
        aiType: AI.BOSS,
        attackRange: 3,
        phases: [
          { hpPercent: 100, abilities: ['curse', 'water_bolt'] },
          { hpPercent: 50, abilities: ['drain_life', 'dark_heal'], passive: { lifesteal: 0.15 }, phaseTransitionMessage: 'The Corrupted Priest calls upon forbidden magic!' },
        ],
        rewards: { gold: 3000, guaranteedRarity: 'rare' },
        dropTable: [
          { rarity: 'epic', chance: 0.50, type: 'random' },
          { rarity: 'rare', chance: 0.50, type: 'random' },
        ],
        lore: 'Once a holy man, now twisted by the temple\'s curse.',
      },
      {
        id: 'naga_queen',
        name: 'Naga Queen',
        spriteId: 'boss_naga_queen',
        doorPosition: 'east',
        doorLabel: 'Serpent Grotto',
        rooms: 5,
        baseStats: { maxHp: 700, attack: 40, defense: 15, speed: 12 },
        abilities: ['venomous_bite', 'tail_swipe', 'summon_minions', 'water_surge'],
        aiType: AI.BOSS,
        attackRange: 2,
        passive: { lifesteal: 0.08 },
        phases: [
          { hpPercent: 100, abilities: ['venomous_bite', 'tail_swipe'] },
          { hpPercent: 60, abilities: ['water_surge', 'venomous_bite'], passive: { damageBonus: 0.20 }, phaseTransitionMessage: 'The Naga Queen commands the tides to surge!', onPhaseStart: { summonAdds: { type: 'naga_warrior', count: 2 } } },
        ],
        summonType: 'naga_warrior',
        rewards: { gold: 3500, guaranteedRarity: 'epic' },
        dropTable: [
          { rarity: 'epic', chance: 0.60, type: 'random' },
          { rarity: 'rare', chance: 0.40, type: 'random' },
        ],
        lore: 'Ruler of the serpent folk who claimed the flooded depths.',
      },
    ],

    finalBoss: {
      id: 'sea_serpent',
      name: 'Sea Serpent',
      spriteId: 'boss_sea_serpent',
      doorPosition: 'south',
      doorLabel: 'The Drowned Sanctum',
      rooms: 3,
      baseStats: { maxHp: 1200, attack: 50, defense: 25, speed: 10 },
      abilities: ['venomous_bite', 'tail_swipe', 'water_surge', 'constrict', 'tidal_wave'],
      aiType: AI.BOSS,
      attackRange: 2,
      passive: { lifesteal: 0.12 },
      phases: [
        { hpPercent: 100, abilities: ['venomous_bite', 'tail_swipe'] },
        { hpPercent: 70, abilities: ['water_surge', 'constrict'], passive: { damageBonus: 0.15 }, phaseTransitionMessage: 'The Sea Serpent coils tighter!' },
        { hpPercent: 40, abilities: ['tidal_wave', 'constrict'], passive: { damageReduction: 0.15 }, phaseTransitionMessage: 'The Sea Serpent calls the waters to rise!', onPhaseStart: { summonAdds: { type: 'water_elemental', count: 2 } } },
        { hpPercent: 20, abilities: ['tidal_wave', 'venomous_bite'], passive: { damageBonus: 0.30 }, enraged: true, phaseTransitionMessage: 'The Sea Serpent thrashes in fury!' },
      ],
      summonType: 'water_elemental',
      rewards: { gold: 8000, guaranteedRarity: 'legendary' },
      dropTable: [
        { itemId: 'tidal_pendant', chance: 0.25, type: 'unique' },
        { itemId: 'serpents_fang', chance: 0.25, type: 'unique' },
        { rarity: 'legendary', chance: 0.20, type: 'random' },
        { rarity: 'epic', chance: 0.30, type: 'random' },
      ],
      lore: 'Ancient guardian of the temple, corrupted by dark waters.',
    },

    uniqueDrops: ['tidal_pendant', 'serpents_fang'],
    monsterPool: ['drowned_zombie', 'water_elemental', 'corrupted_fish', 'naga_warrior'],
  },

  // ========================================
  // CURSED MANOR - Level 18
  // Theme: Gothic haunted mansion, undead, ghosts
  // Hub: Grand Foyer -> 3 Wing Bosses -> Final Boss
  // ========================================
  cursed_manor: {
    id: 'cursed_manor',
    name: 'Cursed Manor',
    spriteId: 'raid_cursed_manor',
    description: 'A gothic mansion haunted by restless spirits. The Vampire Lord rules from the tower.',
    requiredLevel: 18,
    theme: 'undead',
    difficulty: 3,
    estimatedRooms: 14,
    recommendedLevel: 20,

    hub: {
      name: 'Grand Foyer',
      description: 'The entrance hall echoes with ghostly whispers. Three paths await.',
      spriteId: 'hub_cursed_manor',
    },

    wingBosses: [
      {
        id: 'phantom_butler',
        name: 'Phantom Butler',
        spriteId: 'boss_phantom_butler',
        doorPosition: 'west',
        doorLabel: 'Servant Quarters',
        rooms: 4,
        baseStats: { maxHp: 700, attack: 40, defense: 15, speed: 14 },
        abilities: ['quick_strike', 'phase_shift', 'curse', 'terrifying_presence'],
        aiType: AI.BOSS,
        attackRange: 2,
        phases: [
          { hpPercent: 100, abilities: ['quick_strike', 'phase_shift'] },
          { hpPercent: 50, abilities: ['curse', 'terrifying_presence'], passive: { damageReduction: 0.20 }, phaseTransitionMessage: 'The Phantom Butler reveals his true horror!' },
        ],
        rewards: { gold: 4000, guaranteedRarity: 'rare' },
        dropTable: [
          { rarity: 'epic', chance: 0.50, type: 'random' },
          { rarity: 'rare', chance: 0.50, type: 'random' },
        ],
        lore: 'Still serving his masters, even in death.',
      },
      {
        id: 'banshee_queen',
        name: 'Banshee Queen',
        spriteId: 'boss_banshee_queen',
        doorPosition: 'north',
        doorLabel: 'The Ballroom',
        rooms: 5,
        baseStats: { maxHp: 750, attack: 45, defense: 12, speed: 14 },
        abilities: ['wail_of_agony', 'drain_life', 'phase_shift', 'curse'],
        aiType: AI.BOSS,
        attackRange: 3,
        passive: { lifesteal: 0.10 },
        phases: [
          { hpPercent: 100, abilities: ['wail_of_agony', 'curse'] },
          { hpPercent: 60, abilities: ['drain_life', 'phase_shift'], passive: { lifesteal: 0.15 }, phaseTransitionMessage: 'The Banshee Queen\'s form flickers between worlds!' },
          { hpPercent: 30, abilities: ['wail_of_agony', 'drain_life'], passive: { damageBonus: 0.25, lifesteal: 0.20 }, enraged: true, phaseTransitionMessage: 'The Banshee Queen unleashes a deafening shriek!' },
        ],
        rewards: { gold: 5500, guaranteedRarity: 'epic' },
        dropTable: [
          { rarity: 'epic', chance: 0.60, type: 'random' },
          { rarity: 'rare', chance: 0.40, type: 'random' },
        ],
        lore: 'Her sorrowful wail heralds doom for all who hear it.',
      },
      {
        id: 'flesh_golem',
        name: 'Flesh Golem',
        spriteId: 'boss_flesh_golem',
        doorPosition: 'east',
        doorLabel: 'The Laboratory',
        rooms: 4,
        baseStats: { maxHp: 900, attack: 42, defense: 22, speed: 6 },
        abilities: ['power_attack', 'cleave', 'regenerate', 'enrage'],
        aiType: AI.TANK,
        attackRange: 1,
        passive: { regenPercent: 0.02 },
        phases: [
          { hpPercent: 100, abilities: ['power_attack', 'cleave'] },
          { hpPercent: 50, abilities: ['regenerate', 'power_attack'], passive: { regenPercent: 0.05, damageBonus: 0.20 }, phaseTransitionMessage: 'The Flesh Golem\'s wounds begin to close!' },
        ],
        rewards: { gold: 4500, guaranteedRarity: 'epic' },
        dropTable: [
          { rarity: 'epic', chance: 0.55, type: 'random' },
          { rarity: 'rare', chance: 0.45, type: 'random' },
        ],
        lore: 'An abomination stitched together from the manor\'s victims.',
      },
    ],

    finalBoss: {
      id: 'vampire_lord',
      name: 'Vampire Lord',
      spriteId: 'boss_vampire_lord',
      doorPosition: 'south',
      doorLabel: 'The Tower',
      rooms: 4,
      baseStats: { maxHp: 1400, attack: 58, defense: 25, speed: 14 },
      abilities: ['drain_life', 'charm', 'blood_frenzy', 'summon_minions', 'phase_shift', 'bat_swarm'],
      aiType: AI.BOSS,
      attackRange: 2,
      passive: { lifesteal: 0.15 },
      phases: [
        { hpPercent: 100, abilities: ['drain_life', 'charm'] },
        { hpPercent: 70, abilities: ['blood_frenzy', 'drain_life'], passive: { lifesteal: 0.20 }, phaseTransitionMessage: 'The Vampire Lord calls his children to feast!', onPhaseStart: { summonAdds: { type: 'vampire_spawn', count: 2 } } },
        { hpPercent: 40, abilities: ['bat_swarm', 'phase_shift'], passive: { damageReduction: 0.20 }, phaseTransitionMessage: 'The Vampire Lord dissolves into a swarm of bats!' },
        { hpPercent: 20, abilities: ['blood_frenzy', 'drain_life'], passive: { lifesteal: 0.30, damageBonus: 0.30 }, enraged: true, phaseTransitionMessage: 'The Vampire Lord\'s eyes glow with bloodlust!' },
      ],
      summonType: 'vampire_spawn',
      rewards: { gold: 12000, guaranteedRarity: 'legendary' },
      dropTable: [
        { itemId: 'phantom_cloak', chance: 0.20, type: 'unique' },
        { itemId: 'banshees_wail', chance: 0.20, type: 'unique' },
        { itemId: 'vampires_embrace', chance: 0.20, type: 'unique' },
        { rarity: 'legendary', chance: 0.20, type: 'random' },
        { rarity: 'epic', chance: 0.20, type: 'random' },
      ],
      lore: 'Master of the manor, he has ruled here for centuries.',
    },

    uniqueDrops: ['phantom_cloak', 'banshees_wail', 'vampires_embrace'],
    monsterPool: ['ghost', 'phantom', 'wraith', 'vampire_spawn', 'skeleton'],
  },

  // ========================================
  // SKY FORTRESS - Level 24
  // Theme: Floating castle in clouds, wind, lightning
  // Hub: Landing Platform -> 3 Wing Bosses -> Final Boss
  // ========================================
  sky_fortress: {
    id: 'sky_fortress',
    name: 'Sky Fortress',
    spriteId: 'raid_sky_fortress',
    description: 'A floating castle in the clouds, crackling with lightning. The Storm Lord awaits.',
    requiredLevel: 24,
    theme: 'storm',
    difficulty: 3,
    estimatedRooms: 14,
    recommendedLevel: 26,

    hub: {
      name: 'Landing Platform',
      description: 'The winds howl around this precarious perch. Choose your ascent.',
      spriteId: 'hub_sky_fortress',
    },

    wingBosses: [
      {
        id: 'wind_elemental_lord',
        name: 'Wind Elemental',
        spriteId: 'boss_wind_elemental',
        doorPosition: 'west',
        doorLabel: 'Outer Ramparts',
        rooms: 5,
        baseStats: { maxHp: 900, attack: 45, defense: 15, speed: 20 },
        abilities: ['wing_buffet', 'quick_strike', 'cyclone', 'evasion_boost'],
        aiType: AI.BOSS,
        attackRange: 2,
        phases: [
          { hpPercent: 100, abilities: ['wing_buffet', 'quick_strike'] },
          { hpPercent: 50, abilities: ['cyclone', 'evasion_boost'], passive: { damageReduction: 0.25 }, phaseTransitionMessage: 'The Wind Elemental spins into a raging cyclone!' },
        ],
        rewards: { gold: 5500, guaranteedRarity: 'rare' },
        dropTable: [
          { rarity: 'epic', chance: 0.55, type: 'random' },
          { rarity: 'rare', chance: 0.45, type: 'random' },
        ],
        lore: 'Pure wind given form and fury.',
      },
      {
        id: 'lightning_golem',
        name: 'Lightning Golem',
        spriteId: 'boss_lightning_golem',
        doorPosition: 'north',
        doorLabel: 'Thunder Halls',
        rooms: 5,
        baseStats: { maxHp: 1200, attack: 55, defense: 30, speed: 10 },
        abilities: ['lightning_strike', 'chain_lightning', 'shield_wall', 'overcharge'],
        aiType: AI.BOSS,
        attackRange: 3,
        passive: { reflectDamage: 0.15 },
        phases: [
          { hpPercent: 100, abilities: ['lightning_strike', 'shield_wall'] },
          { hpPercent: 60, abilities: ['chain_lightning', 'overcharge'], passive: { reflectDamage: 0.20 }, phaseTransitionMessage: 'The Lightning Golem crackles with building energy!' },
          { hpPercent: 30, abilities: ['chain_lightning', 'lightning_strike'], passive: { damageBonus: 0.30, reflectDamage: 0.25 }, enraged: true, phaseTransitionMessage: 'The Lightning Golem overloads with power!' },
        ],
        rewards: { gold: 7000, guaranteedRarity: 'epic' },
        dropTable: [
          { rarity: 'epic', chance: 0.65, type: 'random' },
          { rarity: 'rare', chance: 0.35, type: 'random' },
        ],
        lore: 'Constructed from captured lightning, it guards the halls.',
      },
      {
        id: 'storm_hawk',
        name: 'Storm Hawk',
        spriteId: 'boss_storm_hawk',
        doorPosition: 'east',
        doorLabel: 'The Aerie',
        rooms: 4,
        baseStats: { maxHp: 800, attack: 60, defense: 12, speed: 22 },
        abilities: ['dive_bomb', 'lightning_talons', 'wind_fury', 'screech'],
        aiType: AI.AGGRESSIVE,
        attackRange: 3,
        phases: [
          { hpPercent: 100, abilities: ['dive_bomb', 'lightning_talons'] },
          { hpPercent: 50, abilities: ['wind_fury', 'screech'], passive: { damageBonus: 0.25 }, phaseTransitionMessage: 'The Storm Hawk screeches with furious winds!' },
        ],
        rewards: { gold: 6000, guaranteedRarity: 'epic' },
        dropTable: [
          { rarity: 'epic', chance: 0.60, type: 'random' },
          { rarity: 'rare', chance: 0.40, type: 'random' },
        ],
        lore: 'The Storm Lord\'s prized hunting companion.',
      },
    ],

    finalBoss: {
      id: 'storm_lord',
      name: 'Storm Lord',
      spriteId: 'boss_storm_lord',
      doorPosition: 'south',
      doorLabel: 'Storm Throne',
      rooms: 4,
      baseStats: { maxHp: 2000, attack: 75, defense: 30, speed: 16 },
      abilities: ['lightning_strike', 'chain_lightning', 'tempest', 'summon_minions', 'storm_shield', 'thunderclap'],
      aiType: AI.BOSS,
      attackRange: 4,
      phases: [
        { hpPercent: 100, abilities: ['lightning_strike', 'storm_shield'] },
        { hpPercent: 70, abilities: ['chain_lightning', 'tempest'], passive: { damageBonus: 0.20 }, phaseTransitionMessage: 'The Storm Lord summons a raging tempest!' },
        { hpPercent: 40, abilities: ['tempest', 'thunderclap'], passive: { damageReduction: 0.15 }, phaseTransitionMessage: 'The Storm Lord calls lightning from the heavens!', onPhaseStart: { summonAdds: { type: 'lightning_sprite', count: 3 } } },
        { hpPercent: 20, abilities: ['chain_lightning', 'tempest'], passive: { damageBonus: 0.40 }, enraged: true, phaseTransitionMessage: 'The Storm Lord becomes the storm itself!' },
      ],
      summonType: 'lightning_sprite',
      rewards: { gold: 15000, guaranteedRarity: 'legendary' },
      dropTable: [
        { itemId: 'stormcallers_rod', chance: 0.18, type: 'unique' },
        { itemId: 'thunder_guard', chance: 0.18, type: 'unique' },
        { itemId: 'eye_of_the_storm', chance: 0.18, type: 'unique' },
        { rarity: 'legendary', chance: 0.20, type: 'random' },
        { rarity: 'epic', chance: 0.26, type: 'random' },
      ],
      lore: 'Commander of the tempest, he rules the skies unchallenged.',
    },

    uniqueDrops: ['stormcallers_rod', 'thunder_guard', 'eye_of_the_storm'],
    monsterPool: ['wind_elemental', 'storm_hawk', 'lightning_sprite', 'cloud_serpent'],
  },

  // ========================================
  // THE ABYSS - Level 30
  // Theme: Deep ocean trench, eldritch, crushing pressure
  // Hub: The Descent -> 3 Wing Bosses -> Final Boss
  // ========================================
  the_abyss: {
    id: 'the_abyss',
    name: 'The Abyss',
    spriteId: 'raid_the_abyss',
    description: 'The deepest trenches of the ocean where ancient horrors dwell.',
    requiredLevel: 30,
    theme: 'abyss',
    difficulty: 4,
    estimatedRooms: 16,
    recommendedLevel: 32,

    hub: {
      name: 'The Descent',
      description: 'Light fades as you sink into the crushing depths. Darkness awaits.',
      spriteId: 'hub_the_abyss',
    },

    wingBosses: [
      {
        id: 'abyssal_horror',
        name: 'Abyssal Horror',
        spriteId: 'boss_abyssal_horror',
        doorPosition: 'west',
        doorLabel: 'The Depths',
        rooms: 5,
        baseStats: { maxHp: 1400, attack: 60, defense: 25, speed: 8 },
        abilities: ['cleave', 'consume', 'intimidate', 'crushing_grip'],
        aiType: AI.BOSS,
        attackRange: 2,
        passive: { regenPercent: 0.02 },
        phases: [
          { hpPercent: 100, abilities: ['cleave', 'crushing_grip'] },
          { hpPercent: 50, abilities: ['consume', 'intimidate'], passive: { lifesteal: 0.15, damageBonus: 0.15 }, phaseTransitionMessage: 'The Abyssal Horror opens its maw wide!' },
        ],
        rewards: { gold: 8000, guaranteedRarity: 'epic' },
        dropTable: [
          { rarity: 'epic', chance: 0.60, type: 'random' },
          { rarity: 'rare', chance: 0.40, type: 'random' },
        ],
        lore: 'A nightmare from the deep, all teeth and hunger.',
      },
      {
        id: 'kraken',
        name: 'Kraken',
        spriteId: 'boss_kraken',
        doorPosition: 'north',
        doorLabel: 'The Trench',
        rooms: 5,
        baseStats: { maxHp: 1800, attack: 70, defense: 30, speed: 7 },
        abilities: ['tentacle_slam', 'ink_cloud', 'constrict', 'whirlpool'],
        aiType: AI.BOSS,
        attackRange: 3,
        phases: [
          { hpPercent: 100, abilities: ['tentacle_slam', 'ink_cloud'] },
          { hpPercent: 60, abilities: ['constrict', 'whirlpool'], passive: { damageReduction: 0.15 }, phaseTransitionMessage: 'The Kraken spreads its tentacles wide!' },
          { hpPercent: 30, abilities: ['tentacle_slam', 'constrict'], passive: { damageBonus: 0.35 }, enraged: true, phaseTransitionMessage: 'The Kraken thrashes in a frenzy of destruction!' },
        ],
        rewards: { gold: 10000, guaranteedRarity: 'epic' },
        dropTable: [
          { rarity: 'epic', chance: 0.65, type: 'random' },
          { rarity: 'rare', chance: 0.35, type: 'random' },
        ],
        lore: 'Legend of sailors, terror of the deep.',
      },
      {
        id: 'deep_one_prophet',
        name: 'Deep One Prophet',
        spriteId: 'boss_deep_one_prophet',
        doorPosition: 'east',
        doorLabel: 'Sunken Temple',
        rooms: 4,
        baseStats: { maxHp: 1200, attack: 65, defense: 20, speed: 10 },
        abilities: ['void_bolt', 'curse', 'summon_minions', 'madness_aura'],
        aiType: AI.BOSS,
        attackRange: 4,
        phases: [
          { hpPercent: 100, abilities: ['void_bolt', 'curse'] },
          { hpPercent: 50, abilities: ['madness_aura', 'void_bolt'], passive: { damageBonus: 0.20 }, phaseTransitionMessage: 'The Deep One Prophet chants in an alien tongue!', onPhaseStart: { summonAdds: { type: 'deep_one', count: 2 } } },
        ],
        summonType: 'deep_one',
        rewards: { gold: 9000, guaranteedRarity: 'epic' },
        dropTable: [
          { rarity: 'epic', chance: 0.60, type: 'random' },
          { rarity: 'rare', chance: 0.40, type: 'random' },
        ],
        lore: 'Speaker for forces beyond mortal comprehension.',
      },
    ],

    finalBoss: {
      id: 'leviathan',
      name: 'Leviathan',
      spriteId: 'boss_leviathan',
      doorPosition: 'south',
      doorLabel: 'The Void Below',
      rooms: 4,
      baseStats: { maxHp: 2800, attack: 90, defense: 45, speed: 6 },
      abilities: ['cataclysm', 'consume', 'tidal_wave', 'summon_minions', 'pressure_crush', 'ancient_roar'],
      aiType: AI.BOSS,
      attackRange: 4,
      passive: { regenPercent: 0.03 },
      phases: [
        { hpPercent: 100, abilities: ['tidal_wave', 'pressure_crush'] },
        { hpPercent: 70, abilities: ['cataclysm', 'consume'], passive: { damageBonus: 0.20 }, phaseTransitionMessage: 'The Leviathan rises from the depths!' },
        { hpPercent: 40, abilities: ['ancient_roar', 'pressure_crush'], passive: { damageReduction: 0.20 }, phaseTransitionMessage: 'The Leviathan lets loose a primal roar!', onPhaseStart: { summonAdds: { type: 'abyssal_spawn', count: 3 } } },
        { hpPercent: 20, abilities: ['cataclysm', 'consume'], passive: { damageBonus: 0.40, lifesteal: 0.20 }, enraged: true, phaseTransitionMessage: 'THE LEVIATHAN WILL NOT BE DENIED!' },
      ],
      summonType: 'abyssal_spawn',
      rewards: { gold: 20000, guaranteedRarity: 'legendary' },
      dropTable: [
        { itemId: 'abyssal_maw', chance: 0.18, type: 'unique' },
        { itemId: 'krakens_grasp', chance: 0.18, type: 'unique' },
        { itemId: 'leviathans_heart', chance: 0.18, type: 'unique' },
        { rarity: 'legendary', chance: 0.22, type: 'random' },
        { rarity: 'epic', chance: 0.24, type: 'random' },
      ],
      lore: 'Older than the world itself, it sleeps no more.',
    },

    uniqueDrops: ['abyssal_maw', 'krakens_grasp', 'leviathans_heart'],
    monsterPool: ['deep_one', 'anglerfish_horror', 'tentacle', 'abyssal_spawn'],
  },

  // ========================================
  // THE VOID THRONE - Level 35
  // Theme: Beyond reality, cosmic horror, ultimate challenge
  // Hub: Reality's Edge -> 4 Wing Bosses -> Final Boss
  // ========================================
  void_throne: {
    id: 'void_throne',
    name: 'The Void Throne',
    spriteId: 'raid_void_throne',
    description: 'Beyond the edge of reality. The Void God awaits challengers.',
    requiredLevel: 35,
    theme: 'void',
    difficulty: 5,
    estimatedRooms: 20,
    recommendedLevel: 38,

    hub: {
      name: 'Reality\'s Edge',
      description: 'The fabric of existence frays here. Four paths lead into nothing.',
      spriteId: 'hub_void_throne',
    },

    wingBosses: [
      {
        id: 'void_stalker_prime',
        name: 'Void Stalker Prime',
        spriteId: 'boss_void_stalker_prime',
        doorPosition: 'northwest',
        doorLabel: 'The Shattered',
        rooms: 5,
        baseStats: { maxHp: 1600, attack: 70, defense: 25, speed: 18 },
        abilities: ['void_bolt', 'phase_shift', 'consume', 'blink_strike'],
        aiType: AI.BOSS,
        attackRange: 3,
        passive: { lifesteal: 0.15 },
        phases: [
          { hpPercent: 100, abilities: ['void_bolt', 'blink_strike'] },
          { hpPercent: 50, abilities: ['phase_shift', 'consume'], passive: { lifesteal: 0.25, damageReduction: 0.15 }, phaseTransitionMessage: 'The Void Stalker Prime phases between dimensions!' },
        ],
        rewards: { gold: 10000, guaranteedRarity: 'epic' },
        dropTable: [
          { rarity: 'epic', chance: 0.65, type: 'random' },
          { rarity: 'rare', chance: 0.35, type: 'random' },
        ],
        lore: 'Alpha of its kind, it hunts between dimensions.',
      },
      {
        id: 'reality_ripper_alpha',
        name: 'Reality Ripper Alpha',
        spriteId: 'boss_reality_ripper',
        doorPosition: 'northeast',
        doorLabel: 'Fractured Space',
        rooms: 5,
        baseStats: { maxHp: 2000, attack: 80, defense: 28, speed: 12 },
        abilities: ['reality_tear', 'dimensional_rift', 'power_attack', 'unmake'],
        aiType: AI.BOSS,
        attackRange: 3,
        phases: [
          { hpPercent: 100, abilities: ['reality_tear', 'power_attack'] },
          { hpPercent: 60, abilities: ['dimensional_rift', 'unmake'], passive: { damageBonus: 0.25 }, phaseTransitionMessage: 'Reality Ripper Alpha tears open a rift in space!' },
          { hpPercent: 30, abilities: ['unmake', 'reality_tear'], passive: { damageBonus: 0.40 }, enraged: true, phaseTransitionMessage: 'Reality itself begins to collapse!' },
        ],
        rewards: { gold: 12000, guaranteedRarity: 'epic' },
        dropTable: [
          { rarity: 'epic', chance: 0.65, type: 'random' },
          { rarity: 'rare', chance: 0.35, type: 'random' },
        ],
        lore: 'It tears holes in the world with every strike.',
      },
      {
        id: 'null_shade_omega',
        name: 'Null Shade Omega',
        spriteId: 'boss_null_shade',
        doorPosition: 'southwest',
        doorLabel: 'The Nothing',
        rooms: 5,
        baseStats: { maxHp: 1800, attack: 75, defense: 20, speed: 18 },
        abilities: ['void_bolt', 'entropy', 'drain_life', 'invisibility'],
        aiType: AI.BOSS,
        attackRange: 4,
        phases: [
          { hpPercent: 100, abilities: ['void_bolt', 'invisibility'] },
          { hpPercent: 60, abilities: ['entropy', 'drain_life'], passive: { lifesteal: 0.20 }, phaseTransitionMessage: 'Null Shade Omega dissolves into the shadows!' },
          { hpPercent: 30, abilities: ['void_bolt', 'entropy'], passive: { damageBonus: 0.30, lifesteal: 0.25 }, enraged: true, phaseTransitionMessage: 'The Nothing hungers!' },
        ],
        rewards: { gold: 12000, guaranteedRarity: 'epic' },
        dropTable: [
          { rarity: 'epic', chance: 0.65, type: 'random' },
          { rarity: 'rare', chance: 0.35, type: 'random' },
        ],
        lore: 'The absence of everything given form.',
      },
      {
        id: 'entropy_avatar',
        name: 'Entropy Avatar',
        spriteId: 'boss_entropy_avatar',
        doorPosition: 'southeast',
        doorLabel: 'End of Time',
        rooms: 4,
        baseStats: { maxHp: 1500, attack: 85, defense: 22, speed: 14 },
        abilities: ['entropy', 'time_stop', 'decay', 'oblivion'],
        aiType: AI.BOSS,
        attackRange: 4,
        phases: [
          { hpPercent: 100, abilities: ['entropy', 'decay'] },
          { hpPercent: 50, abilities: ['time_stop', 'oblivion'], passive: { damageBonus: 0.25, damageReduction: 0.20 }, phaseTransitionMessage: 'Entropy Avatar warps the flow of time!' },
        ],
        rewards: { gold: 11000, guaranteedRarity: 'epic' },
        dropTable: [
          { rarity: 'epic', chance: 0.60, type: 'random' },
          { rarity: 'legendary', chance: 0.15, type: 'random' },
          { rarity: 'rare', chance: 0.25, type: 'random' },
        ],
        lore: 'Embodiment of the end of all things.',
      },
    ],

    finalBoss: {
      id: 'void_god',
      name: 'Void God',
      spriteId: 'boss_void_god',
      doorPosition: 'south',
      doorLabel: 'The Throne',
      rooms: 4,
      baseStats: { maxHp: 4500, attack: 110, defense: 50, speed: 14 },
      abilities: ['annihilate', 'dimensional_rift', 'entropy', 'void_aura', 'consume', 'phase_shift', 'summon_minions', 'reality_collapse'],
      aiType: AI.BOSS,
      attackRange: 5,
      passive: { lifesteal: 0.10 },
      phases: [
        { hpPercent: 100, abilities: ['void_bolt', 'dimensional_rift'] },
        { hpPercent: 80, abilities: ['entropy', 'void_aura'], passive: { lifesteal: 0.15 }, phaseTransitionMessage: 'The Void God stirs from its eternal slumber...', onPhaseStart: { summonAdds: { type: 'null_shade', count: 2 } } },
        { hpPercent: 60, abilities: ['void_aura', 'consume'], passive: { damageReduction: 0.20 }, phaseTransitionMessage: 'The Void God opens its countless eyes!' },
        { hpPercent: 40, abilities: ['annihilate', 'phase_shift'], passive: { damageBonus: 0.30 }, phaseTransitionMessage: 'YOU DARE CHALLENGE ETERNITY?' },
        { hpPercent: 20, abilities: ['reality_collapse', 'annihilate'], passive: { damageBonus: 0.50, lifesteal: 0.25 }, enraged: true, phaseTransitionMessage: 'ALL SHALL RETURN TO THE VOID!' },
      ],
      summonType: 'null_shade',
      rewards: { gold: 35000, guaranteedRarity: 'legendary' },
      dropTable: [
        { itemId: 'void_gods_crown', chance: 0.16, type: 'unique' },
        { itemId: 'entropy_accessory', chance: 0.16, type: 'unique' },
        { itemId: 'reality_shard', chance: 0.16, type: 'unique' },
        { itemId: 'nullblade', chance: 0.16, type: 'unique' },
        { itemId: 'cloak_of_nothing', chance: 0.16, type: 'unique' },
        { rarity: 'legendary', chance: 0.12, type: 'random' },
        { rarity: 'epic', chance: 0.08, type: 'random' },
      ],
      lore: 'The end of all existence given consciousness. It waits.',
    },

    uniqueDrops: ['reality_shard', 'nullblade', 'cloak_of_nothing', 'void_gods_crown', 'entropy_accessory'],
    monsterPool: ['void_stalker', 'null_shade', 'reality_ripper', 'void_spawn'],
  },
};

// Get raid by ID
export const getRaid = (raidId) => RAIDS[raidId];

// Get all raids
export const getAllRaids = () => Object.values(RAIDS);

// Check if a raid is unlocked based on highest dungeon cleared
export const isRaidUnlocked = (raidId, highestDungeon = 0) => {
  const raid = RAIDS[raidId];
  if (!raid) return false;
  return highestDungeon >= raid.requiredLevel;
};

// Get unique items that can drop from a raid
export const getRaidUniqueIds = (raidId) => {
  const raid = RAIDS[raidId];
  return raid?.uniqueDrops || [];
};

// Get wing boss by ID
export const getWingBoss = (raidId, bossId) => {
  const raid = RAIDS[raidId];
  if (!raid) return null;

  const wingBoss = raid.wingBosses?.find(w => w.id === bossId);
  if (wingBoss) return { ...wingBoss, isWingBoss: true, isFinalBoss: false };

  if (raid.finalBoss?.id === bossId) {
    return { ...raid.finalBoss, isWingBoss: false, isFinalBoss: true };
  }

  return null;
};

// Roll for loot from boss drop table
// ownedUniques: array of unique item IDs the player already owns (optional)
export const rollRaidDrop = (dropTable, ownedUniques = []) => {
  if (!dropTable) return null;

  // Filter out already-owned uniques and recalculate probabilities
  const availableDrops = dropTable.filter(drop => {
    if (drop.type === 'unique' && ownedUniques.includes(drop.itemId)) {
      return false; // Skip owned uniques
    }
    return true;
  });

  // If no drops available, return rare random
  if (availableDrops.length === 0) {
    return { type: 'random', rarity: 'rare' };
  }

  // Normalize probabilities for remaining drops
  const totalChance = availableDrops.reduce((sum, drop) => sum + drop.chance, 0);
  const roll = Math.random() * totalChance;
  let cumulative = 0;

  for (const drop of availableDrops) {
    cumulative += drop.chance;
    if (roll < cumulative) {
      if (drop.type === 'unique') {
        return { type: 'unique', itemId: drop.itemId };
      } else {
        return { type: 'random', rarity: drop.rarity };
      }
    }
  }

  return { type: 'random', rarity: 'rare' };
};
