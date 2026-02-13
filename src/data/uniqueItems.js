// Unique legendary items with special powers
// These items drop from World Bosses and Raids
// Uniques are one-of-a-kind - only one copy per player
// Stats scale with highest party member level (+5% per level)

// Trigger types for unique powers
export const UNIQUE_TRIGGER = {
  PASSIVE: 'passive',           // Always active
  ON_HIT: 'on_hit',             // When attacking
  ON_CRIT: 'on_crit',           // When landing critical hit
  ON_KILL: 'on_kill',           // When killing enemy
  ON_DAMAGE_TAKEN: 'on_damage_taken', // When receiving damage
  ON_COMBAT_START: 'on_combat_start', // At start of each combat
  ON_ROOM_START: 'on_room_start',     // At start of each room
  ON_LOW_HP: 'on_low_hp',       // When HP drops below threshold
  ON_DEATH: 'on_death',         // When would die (for cheat death)
  ON_HEAL: 'on_heal',           // When healing
  ON_SKILL: 'on_skill',         // When using a skill
  ON_PARTY_DAMAGE: 'on_party_damage', // When any party member deals damage
  ON_LETHAL: 'on_lethal',       // When taking lethal damage
  ACTIVE: 'active',             // Manual activation with cooldown
};

export const UNIQUE_ITEMS = {
  // =====================================================
  // WORLD BOSS UNIQUES (4 items from level 15, 20, 25, 30)
  // =====================================================

  // Level 15 World Boss - Forest Ancient
  ancient_bark: {
    id: 'ancient_bark',
    name: 'Ancient Bark',
    iconId: '🌲',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { defense: 15, maxHp: 40 },
    classes: null, // All classes
    flavor: 'The forest remembers.',
    uniquePower: {
      id: 'forest_shield',
      name: 'Living Armor',
      description: 'At the start of each room, gain a shield equal to 20% of your max HP. While shielded, your attacks deal 15% bonus damage.',
      trigger: UNIQUE_TRIGGER.ON_ROOM_START,
      effect: {
        shieldPercent: 0.20,
        bonusDamageWhileShielded: 0.15,
      },
    },
    dropSource: { worldBoss: 'forest_ancient' },
  },

  // Level 20 World Boss - The Fallen King
  crown_of_the_fallen: {
    id: 'crown_of_the_fallen',
    name: 'Crown of the Fallen',
    iconId: '👑',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { attack: 12, defense: 10, maxHp: 30 },
    classes: ['warrior', 'knight', 'paladin'],
    flavor: 'Heavy lies the head.',
    uniquePower: {
      id: 'vengeance',
      name: 'Vengeance',
      description: 'When you fall below 30% HP, gain +50% damage and +25% lifesteal for 3 turns. Once per room.',
      trigger: UNIQUE_TRIGGER.ON_LOW_HP,
      effect: {
        hpThreshold: 0.30,
        damageBonus: 0.50,
        lifesteal: 0.25,
        duration: 3,
        oncePerRoom: true,
      },
    },
    dropSource: { worldBoss: 'fallen_king' },
  },

  // Level 25 World Boss - Inferno Lord
  magma_core: {
    id: 'magma_core',
    name: 'Magma Core',
    iconId: '🔥',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 35 },
    classes: null, // All classes
    flavor: 'Forged in the heart of the volcano.',
    uniquePower: {
      id: 'volcanic_fury',
      name: 'Volcanic Fury',
      description: 'Your attacks apply Burn. When an enemy dies while Burning, they explode for 25% of their max HP to nearby enemies.',
      trigger: UNIQUE_TRIGGER.ON_HIT,
      effect: {
        appliesStatus: { id: 'burn', duration: 3 },
        onBurnDeathExplosion: 0.25,
        explosionRange: 2,
      },
    },
    dropSource: { worldBoss: 'inferno_lord' },
  },

  // Level 30 World Boss - Void Emperor
  void_heart: {
    id: 'void_heart',
    name: 'Void Heart',
    iconId: '💜',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { attack: 15, maxHp: 50 },
    classes: null, // All classes
    flavor: 'Peer into the abyss.',
    uniquePower: {
      id: 'void_absorption',
      name: 'Void Absorption',
      description: '20% of damage you deal is stored. When you would die, consume all stored damage to heal instead. Resets each room.',
      trigger: UNIQUE_TRIGGER.ON_DEATH,
      effect: {
        damageStoragePercent: 0.20,
        healOnDeathFromStored: true,
        resetsPerRoom: true,
      },
    },
    dropSource: { worldBoss: 'void_emperor' },
  },

  // =====================================================
  // SUNKEN TEMPLE UNIQUES (Level 12 raid)
  // =====================================================

  tidal_pendant: {
    id: 'tidal_pendant',
    name: 'Tidal Pendant',
    iconId: '🌊',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { attack: 10, maxHp: 25 },
    classes: null, // All classes
    flavor: 'The tide comes for all.',
    uniquePower: {
      id: 'tidal_rhythm',
      name: 'Tidal Rhythm',
      description: 'Every 3rd attack deals double damage and heals you for 10% of damage dealt.',
      trigger: UNIQUE_TRIGGER.ON_HIT,
      effect: {
        everyNthAttack: 3,
        damageMultiplier: 2.0,
        lifestealOnProc: 0.10,
      },
    },
    dropSource: { raid: 'sunken_temple', wing: 'temple_entrance' },
  },

  serpents_fang: {
    id: 'serpents_fang',
    name: 'Serpent\'s Fang',
    iconId: '🐍',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 20, speed: 6 },
    classes: ['rogue', 'ranger'],
    flavor: 'Strike like the sea serpent.',
    uniquePower: {
      id: 'chain_strike',
      name: 'Chain Strike',
      description: 'Critical hits have a 50% chance to strike again for 50% damage. Can chain infinitely.',
      trigger: UNIQUE_TRIGGER.ON_CRIT,
      effect: {
        chainAttackChance: 0.50,
        chainDamage: 0.50,
        canChainInfinite: true,
      },
    },
    dropSource: { raid: 'sunken_temple', wing: 'drowned_sanctum' },
  },

  // =====================================================
  // CURSED MANOR UNIQUES (Level 18 raid)
  // =====================================================

  phantom_cloak: {
    id: 'phantom_cloak',
    name: 'Phantom Cloak',
    iconId: '👻',
    slot: 'armor',
    rarity: 'legendary',
    baseStats: { defense: 12, speed: 4 },
    classes: null, // All classes
    flavor: 'Neither here nor there.',
    uniquePower: {
      id: 'phase_out',
      name: 'Phase Out',
      description: '25% chance to phase through attacks (complete immunity). After phasing, your next attack deals +100% damage.',
      trigger: UNIQUE_TRIGGER.ON_DAMAGE_TAKEN,
      effect: {
        phaseChance: 0.25,
        bonusDamageAfterPhase: 1.0,
      },
    },
    dropSource: { raid: 'cursed_manor', wing: 'the_foyer' },
  },

  banshees_wail: {
    id: 'banshees_wail',
    name: 'Banshee\'s Wail',
    iconId: '💀',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 28 },
    classes: ['mage', 'necromancer'],
    flavor: 'Your screams empower me.',
    uniquePower: {
      id: 'soul_stacks',
      name: 'Soul Harvest',
      description: 'Killing an enemy grants a Soul Stack (max 5). Each stack increases spell damage by 10%. Stacks reset when you take damage.',
      trigger: UNIQUE_TRIGGER.ON_KILL,
      effect: {
        stackingBuff: {
          id: 'soul_stack',
          maxStacks: 5,
          damagePerStack: 0.10,
          resetsOnDamage: true,
        },
      },
    },
    dropSource: { raid: 'cursed_manor', wing: 'the_ballroom' },
  },

  vampires_embrace: {
    id: 'vampires_embrace',
    name: 'Vampire\'s Embrace',
    iconId: '🧛',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { attack: 15, maxHp: 35 },
    classes: null, // All classes
    flavor: 'Immortality has its price.',
    uniquePower: {
      id: 'vampiric_bond',
      name: 'Vampiric Bond',
      description: 'Lifesteal 25% of all damage dealt. However, healing from other sources is reduced by 50%.',
      trigger: UNIQUE_TRIGGER.PASSIVE,
      effect: {
        lifesteal: 0.25,
        healingReduction: 0.50,
      },
    },
    dropSource: { raid: 'cursed_manor', wing: 'the_tower' },
  },

  // =====================================================
  // SKY FORTRESS UNIQUES (Level 24 raid)
  // =====================================================

  stormcallers_rod: {
    id: 'stormcallers_rod',
    name: 'Stormcaller\'s Rod',
    iconId: '⚡',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 30, speed: 3 },
    classes: ['mage', 'shaman'],
    flavor: 'Command the storm.',
    uniquePower: {
      id: 'chain_lightning',
      name: 'Chain Lightning',
      description: 'Your attacks chain to 2 additional enemies for 40% damage. Chain targets are Shocked (25% reduced speed).',
      trigger: UNIQUE_TRIGGER.ON_HIT,
      effect: {
        chainTargets: 2,
        chainDamage: 0.40,
        appliesStatus: { id: 'shock', duration: 2 },
      },
    },
    dropSource: { raid: 'sky_fortress', wing: 'outer_ramparts' },
  },

  thunder_guard: {
    id: 'thunder_guard',
    name: 'Thunder Guard',
    iconId: '🛡️',
    slot: 'armor',
    rarity: 'legendary',
    baseStats: { defense: 25, maxHp: 40 },
    classes: ['warrior', 'knight'],
    flavor: 'The storm shields its champion.',
    uniquePower: {
      id: 'storm_retaliation',
      name: 'Storm Retaliation',
      description: 'When you block or are hit, 30% chance to zap the attacker for 50% of your defense as damage.',
      trigger: UNIQUE_TRIGGER.ON_DAMAGE_TAKEN,
      effect: {
        procChance: 0.30,
        retaliationDamageFromDefense: 0.50,
      },
    },
    dropSource: { raid: 'sky_fortress', wing: 'thunder_halls' },
  },

  eye_of_the_storm: {
    id: 'eye_of_the_storm',
    name: 'Eye of the Storm',
    iconId: '🌀',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { speed: 15, attack: 8 },
    classes: null, // All classes
    flavor: 'Calm amidst chaos.',
    uniquePower: {
      id: 'storm_eye',
      name: 'Storm\'s Eye',
      description: 'Your speed is doubled. Enemies targeting you have 30% reduced accuracy.',
      trigger: UNIQUE_TRIGGER.PASSIVE,
      effect: {
        speedMultiplier: 2.0,
        enemyAccuracyReduction: 0.30,
      },
    },
    dropSource: { raid: 'sky_fortress', wing: 'storm_throne' },
  },

  // =====================================================
  // THE ABYSS UNIQUES (Level 30 raid)
  // =====================================================

  abyssal_maw: {
    id: 'abyssal_maw',
    name: 'Abyssal Maw',
    iconId: '🦷',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 35, maxHp: 20 },
    classes: ['warrior', 'rogue'],
    flavor: 'Hunger without end.',
    uniquePower: {
      id: 'endless_hunger',
      name: 'Endless Hunger',
      description: 'Each kill increases your attack by 5% for the rest of the dungeon. Stacks infinitely.',
      trigger: UNIQUE_TRIGGER.ON_KILL,
      effect: {
        permanentStackingBuff: {
          attackPercent: 0.05,
          maxStacks: Infinity,
          persistsInDungeon: true,
        },
      },
    },
    dropSource: { raid: 'the_abyss', wing: 'the_depths' },
  },

  krakens_grasp: {
    id: 'krakens_grasp',
    name: 'Kraken\'s Grasp',
    iconId: '🐙',
    slot: 'armor',
    rarity: 'legendary',
    baseStats: { defense: 22, maxHp: 50 },
    classes: null, // All classes
    flavor: 'The depths embrace you.',
    uniquePower: {
      id: 'tentacle_hold',
      name: 'Crushing Grip',
      description: 'At the start of combat, root all enemies for 1 turn. Your first attack against rooted enemies deals triple damage.',
      trigger: UNIQUE_TRIGGER.ON_COMBAT_START,
      effect: {
        rootAllEnemies: { duration: 1 },
        bonusDamageVsRooted: 3.0,
        firstAttackOnly: true,
      },
    },
    dropSource: { raid: 'the_abyss', wing: 'the_trench' },
  },

  leviathans_heart: {
    id: 'leviathans_heart',
    name: 'Leviathan\'s Heart',
    iconId: '💙',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { maxHp: 100, defense: 15 },
    classes: null, // All classes
    flavor: 'The weight of the ocean.',
    uniquePower: {
      id: 'ocean_weight',
      name: 'Weight of the Ocean',
      description: 'Your max HP is doubled. Your damage is reduced by 25%.',
      trigger: UNIQUE_TRIGGER.PASSIVE,
      effect: {
        maxHpMultiplier: 2.0,
        damageReduction: 0.25,
      },
    },
    dropSource: { raid: 'the_abyss', wing: 'the_void_below' },
  },

  // =====================================================
  // THE VOID THRONE UNIQUES (Level 35 raid)
  // =====================================================

  reality_shard: {
    id: 'reality_shard',
    name: 'Reality Shard',
    iconId: '💎',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 40, speed: 5 },
    classes: ['mage', 'necromancer'],
    flavor: 'What is real?',
    uniquePower: {
      id: 'reality_flux',
      name: 'Reality Flux',
      description: '15% chance for attacks to hit twice. 15% chance for enemy attacks to miss entirely.',
      trigger: UNIQUE_TRIGGER.PASSIVE,
      effect: {
        doubleHitChance: 0.15,
        enemyMissChance: 0.15,
      },
    },
    dropSource: { raid: 'void_throne', wing: 'realitys_edge' },
  },

  nullblade: {
    id: 'nullblade',
    name: 'Nullblade',
    iconId: '🗡️',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 38, speed: 4 },
    classes: ['warrior', 'rogue'],
    flavor: 'Cut through existence.',
    uniquePower: {
      id: 'existence_cut',
      name: 'Severing Strike',
      description: 'Your attacks ignore 50% of enemy defense. Enemies you kill cannot be resurrected.',
      trigger: UNIQUE_TRIGGER.PASSIVE,
      effect: {
        armorPenetration: 0.50,
        preventsResurrection: true,
      },
    },
    dropSource: { raid: 'void_throne', wing: 'the_shattered' },
  },

  cloak_of_nothing: {
    id: 'cloak_of_nothing',
    name: 'Cloak of Nothing',
    iconId: '🌑',
    slot: 'armor',
    rarity: 'legendary',
    baseStats: { defense: 15, speed: 8 },
    classes: ['rogue', 'ranger'],
    flavor: 'Unseen, untouched.',
    uniquePower: {
      id: 'void_stealth',
      name: 'Void Stealth',
      description: 'Start combat invisible (enemies ignore you for 2 turns). First attack from stealth deals +200% damage.',
      trigger: UNIQUE_TRIGGER.ON_COMBAT_START,
      effect: {
        invisibleDuration: 2,
        stealthBonusDamage: 2.0,
      },
    },
    dropSource: { raid: 'void_throne', wing: 'the_nothing' },
  },

  void_gods_crown: {
    id: 'void_gods_crown',
    name: 'Void God\'s Crown',
    iconId: '👁️',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { attack: 20, defense: 15, maxHp: 50 },
    classes: null, // All classes
    flavor: 'Become the void.',
    uniquePower: {
      id: 'void_ascension',
      name: 'Void Ascension',
      description: 'Once per dungeon, when you would die, instead become invulnerable for 2 turns and heal to full HP.',
      trigger: UNIQUE_TRIGGER.ON_DEATH,
      effect: {
        preventDeath: true,
        invulnerableDuration: 2,
        healToFull: true,
        oncePerDungeon: true,
      },
    },
    dropSource: { raid: 'void_throne', wing: 'the_throne' },
  },

  entropy_accessory: {
    id: 'entropy_accessory',
    name: 'Entropy',
    iconId: '⚫',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { attack: 25, speed: 5 },
    classes: null, // All classes
    flavor: 'All things end.',
    uniquePower: {
      id: 'entropic_strike',
      name: 'Entropic Strike',
      description: 'Your attacks reduce enemy max HP by 5% (permanent for the fight). Bosses take 2% reduction instead.',
      trigger: UNIQUE_TRIGGER.ON_HIT,
      effect: {
        maxHpReduction: 0.05,
        bossMaxHpReduction: 0.02,
      },
    },
    dropSource: { raid: 'void_throne', wing: 'the_throne' },
  },

  // =====================================================
  // LEGACY ITEMS (keep existing items for backwards compat)
  // =====================================================

  // Warrior Weapons
  flamebreaker: {
    id: 'flamebreaker',
    name: 'Flamebreaker',
    iconId: '🔥',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 25 },
    classes: ['warrior'],
    flavor: 'Forged in dragonfire, never cooled.',
    uniquePower: {
      id: 'infernal_strike',
      name: 'Infernal Strike',
      description: '+20% fire damage, attacks apply burn',
      trigger: UNIQUE_TRIGGER.ON_HIT,
      effect: {
        bonusDamagePercent: 0.20,
        damageType: 'fire',
        appliesStatus: { id: 'burn', duration: 2 },
      },
    },
    dropSource: { raid: 'dragon_sanctum', wing: 2 },
  },

  // Rogue Weapons
  shadowfang: {
    id: 'shadowfang',
    name: 'Shadowfang',
    iconId: '🗡️',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 18, speed: 8 },
    classes: ['rogue'],
    flavor: 'Drinks the shadows, thirsts for blood.',
    uniquePower: {
      id: 'shadow_strike',
      name: 'Shadow Strike',
      description: 'Crits deal +100% damage and grant invisibility',
      trigger: UNIQUE_TRIGGER.ON_CRIT,
      effect: {
        critBonusDamage: 1.0,
        grantsBuff: { id: 'invisible', duration: 1 },
      },
    },
    dropSource: { raid: 'shadow_realm', wing: 1 },
  },

  // Mage Weapons
  staff_of_frost: {
    id: 'staff_of_frost',
    name: 'Staff of Eternal Frost',
    iconId: '❄️',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 30 },
    classes: ['mage'],
    flavor: 'The cold that stops time itself.',
    uniquePower: {
      id: 'absolute_zero',
      name: 'Absolute Zero',
      description: 'Every 10th attack freezes all enemies for 2 turns.',
      trigger: UNIQUE_TRIGGER.ON_HIT,
      effect: {
        freezeAllEnemiesEveryN: 10,
        freezeDuration: 2,
      },
    },
    dropSource: { raid: 'dragon_sanctum', wing: 1 },
  },

  // Ranger Weapons
  windrunner: {
    id: 'windrunner',
    name: 'Windrunner',
    iconId: '🏹',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 20, speed: 10 },
    classes: ['ranger'],
    flavor: 'Faster than thought, deadlier than fate.',
    uniquePower: {
      id: 'swift_death',
      name: 'Swift Death',
      description: 'After killing an enemy, immediately take another turn',
      trigger: UNIQUE_TRIGGER.ON_KILL,
      effect: {
        extraTurn: true,
        oncePerRound: true,
      },
    },
    dropSource: { raid: 'dragon_sanctum', wing: 2 },
  },

  // Necromancer Weapons
  soul_harvester: {
    id: 'soul_harvester',
    name: 'Soul Harvester',
    iconId: '💀',
    slot: 'weapon',
    rarity: 'legendary',
    baseStats: { attack: 28, maxHp: -20 },
    classes: ['necromancer'],
    flavor: 'Every death feeds its hunger.',
    uniquePower: {
      id: 'soul_reap',
      name: 'Soul Reap',
      description: 'Kills grant +5% max HP and +3 attack (stacks up to 10 times)',
      trigger: UNIQUE_TRIGGER.ON_KILL,
      effect: {
        stackingBuff: {
          maxHpPercent: 0.05,
          attack: 3,
          maxStacks: 10,
        },
      },
    },
    dropSource: { raid: 'lich_throne', wing: 2 },
  },

  // Armor
  armor_of_undying: {
    id: 'armor_of_undying',
    name: 'Armor of the Undying',
    iconId: '🛡️',
    slot: 'armor',
    rarity: 'legendary',
    baseStats: { defense: 15, maxHp: 50 },
    classes: ['warrior', 'cleric'],
    flavor: 'Death is merely an inconvenience.',
    uniquePower: {
      id: 'defy_death',
      name: 'Defy Death',
      description: 'Once per dungeon, survive lethal damage with 1 HP',
      trigger: UNIQUE_TRIGGER.ON_LETHAL,
      effect: {
        preventDeath: true,
        oncePerDungeon: true,
        grantsImmunity: 1,
      },
    },
    dropSource: { raid: 'lich_throne', wing: 1 },
  },

  dragonscale_mantle: {
    id: 'dragonscale_mantle',
    name: 'Dragonscale Mantle',
    iconId: '🐉',
    slot: 'armor',
    rarity: 'legendary',
    baseStats: { defense: 20, maxHp: 30 },
    classes: null, // All classes
    flavor: 'Hewn from the hide of the Dragon King.',
    uniquePower: {
      id: 'dragon_resilience',
      name: 'Dragon\'s Resilience',
      description: 'Immune to burn and freeze. +15% fire and ice resistance',
      trigger: UNIQUE_TRIGGER.PASSIVE,
      effect: {
        immuneToStatus: ['burn', 'freeze'],
        elementalResistance: 0.15,
      },
    },
    dropSource: { raid: 'dragon_sanctum', wing: 2 },
  },

  shadow_cloak: {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    iconId: '🌑',
    slot: 'armor',
    rarity: 'legendary',
    baseStats: { defense: 8, speed: 5 },
    classes: ['rogue', 'ranger'],
    flavor: 'Woven from pure darkness.',
    uniquePower: {
      id: 'one_with_shadows',
      name: 'One with Shadows',
      description: '25% chance to completely avoid attacks',
      trigger: UNIQUE_TRIGGER.ON_DAMAGE_TAKEN,
      effect: {
        dodgeChance: 0.25,
      },
    },
    dropSource: { raid: 'shadow_realm', wing: 2 },
  },

  // Accessories
  ring_of_archmage: {
    id: 'ring_of_archmage',
    name: 'Ring of the Archmage',
    iconId: '💍',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { attack: 10 },
    classes: ['mage', 'necromancer', 'cleric'],
    flavor: 'Contains the wisdom of a thousand mages.',
    uniquePower: {
      id: 'arcane_surge',
      name: 'Arcane Surge',
      description: 'Kills reset all skill cooldowns',
      trigger: UNIQUE_TRIGGER.ON_KILL,
      effect: {
        resetCooldowns: true,
      },
    },
    dropSource: { raid: 'arcane_tower', wing: 2 },
  },

  blood_pendant: {
    id: 'blood_pendant',
    name: 'Blood Pendant',
    iconId: '❤️',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { attack: 8, maxHp: 25 },
    classes: null, // All classes
    flavor: 'Pulses with stolen life.',
    uniquePower: {
      id: 'blood_bond',
      name: 'Blood Bond',
      description: 'Heal 5% of all damage dealt by the party',
      trigger: UNIQUE_TRIGGER.ON_PARTY_DAMAGE,
      effect: {
        partyLifesteal: 0.05,
      },
    },
    dropSource: { raid: 'vampire_castle', wing: 2 },
  },

  boots_of_blinding_speed: {
    id: 'boots_of_blinding_speed',
    name: 'Boots of Blinding Speed',
    iconId: '👟',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { speed: 12 },
    classes: null, // All classes
    flavor: 'The world blurs when you run.',
    uniquePower: {
      id: 'lightspeed',
      name: 'Lightspeed',
      description: 'Always act first in combat. +2 movement range',
      trigger: UNIQUE_TRIGGER.PASSIVE,
      effect: {
        alwaysFirst: true,
        movementBonus: 2,
      },
    },
    dropSource: { raid: 'wind_temple', wing: 2 },
  },

  amulet_of_reflection: {
    id: 'amulet_of_reflection',
    name: 'Amulet of Reflection',
    iconId: '🔮',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { defense: 6, maxHp: 20 },
    classes: null, // All classes
    flavor: 'Returns what is given.',
    uniquePower: {
      id: 'mirror_shield',
      name: 'Mirror Shield',
      description: 'Reflect 30% of damage taken back to attacker',
      trigger: UNIQUE_TRIGGER.ON_DAMAGE_TAKEN,
      effect: {
        reflectDamage: 0.30,
      },
    },
    dropSource: { raid: 'crystal_caverns', wing: 2 },
  },

  crown_of_command: {
    id: 'crown_of_command',
    name: 'Crown of Command',
    iconId: '👑',
    slot: 'accessory',
    rarity: 'legendary',
    baseStats: { attack: 5, defense: 5, maxHp: 15 },
    classes: null, // All classes
    flavor: 'Worn by those who lead.',
    uniquePower: {
      id: 'rally',
      name: 'Rally',
      description: 'Party gains +10% all stats',
      trigger: UNIQUE_TRIGGER.PASSIVE,
      effect: {
        partyStatBonus: 0.10,
      },
    },
    dropSource: { raid: 'fallen_kingdom', wing: 2 },
  },
};

// Get unique item by ID
export const getUniqueItem = (id) => UNIQUE_ITEMS[id];

// Get all unique items
export const getAllUniqueItems = () => Object.values(UNIQUE_ITEMS);

// Get all unique items for a raid
export const getUniqueItemsForRaid = (raidId) =>
  Object.values(UNIQUE_ITEMS).filter(item =>
    item.dropSource?.raid === raidId
  );

// Get all unique items from world bosses
export const getWorldBossUniqueItems = () =>
  Object.values(UNIQUE_ITEMS).filter(item =>
    item.dropSource?.worldBoss
  );

// Get unique items a class can use
export const getUniqueItemsForClass = (classId) =>
  Object.values(UNIQUE_ITEMS).filter(item =>
    item.classes === null || item.classes.includes(classId)
  );

// Check if item is unique
export const isUniqueItem = (itemId) => !!UNIQUE_ITEMS[itemId];

// Scale unique item stats based on highest party level (+5% per level)
export const scaleUniqueStats = (baseStats, partyLevel) => {
  const scaledStats = {};
  for (const [stat, value] of Object.entries(baseStats)) {
    // +5% per party level
    scaledStats[stat] = Math.floor(value * (1 + partyLevel * 0.05));
  }
  return scaledStats;
};

// Create a unique item instance
export const createUniqueItemInstance = (uniqueId, heroLevel = 1) => {
  const template = UNIQUE_ITEMS[uniqueId];
  if (!template) return null;

  return {
    id: `${uniqueId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    templateId: uniqueId,
    name: template.name,
    iconId: template.iconId,
    slot: template.slot,
    rarity: 'unique',
    rarityColor: '#06b6d4', // Cyan - distinct unique color
    stats: scaleUniqueStats(template.baseStats, heroLevel),
    baseStats: { ...template.baseStats }, // Store original for rescaling
    classes: template.classes,
    isUnique: true,
    uniquePower: template.uniquePower,
    flavor: template.flavor,
    heroLevelWhenAcquired: heroLevel,
  };
};

// Calculate duplicate unique value (gold + materials)
export const calculateDuplicateValue = (uniqueId) => {
  const unique = UNIQUE_ITEMS[uniqueId];
  if (!unique) return { gold: 500 };

  // Base value on total stats
  const statTotal = Object.values(unique.baseStats).reduce((a, b) => a + Math.abs(b), 0);
  const gold = Math.floor(500 + statTotal * 25);

  return { gold };
};
